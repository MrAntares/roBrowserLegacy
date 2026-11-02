/**
 * Renderer/Effects/RainWeather.js
 *
 * Weather rain effect (EF_RAIN).
 * Procedural multi‑layer rain designed for aesthetic depth:
 * - Looping emitter pinned to the owning entity (usually local player).
 * - Coherent, slowly‑varying wind so streaks slant consistently.
 * - Three depth layers (far/mid/near) with different speeds, sizes, and opacity.
 * - Alpha fades by fall progress (not raw time) to avoid popping.
 * - Added procedural audio system for Rain and Thunder (Web Audio API).
 * - Added procedural lightning visual effect + distance-based audio delay.
 */

import Renderer from 'Renderer/Renderer.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Camera from 'Renderer/Camera.js';
import Preferences from 'Preferences/Audio.js';
import Session from 'Engine/SessionStorage.js';
import EffectManager from 'Renderer/EffectManager.js';
import _puddleVs from './RainWeather.vs?raw';
import _puddleFs from './RainWeather.fs?raw';
import WebGL from 'Utils/WebGL.js';

const RAG_TICK_MS = 25;
const FADEOUT_TAIL_MS = 1000 * RAG_TICK_MS;

// Emission control.
const EMIT_PER_TICK = 30;
const EMIT_STOP_BEFORE_END_MS = 160 * RAG_TICK_MS;
const MAX_DROPS = 1024;

// Spawn volume around player (in map cells). Large enough to cover the view.
const SCATTER_RADIUS_CELLS = 42;
const SPAWN_HEIGHT_MIN_CELLS = 12;
const SPAWN_HEIGHT_MAX_CELLS = 32;

// Base wind, slowly varying over time (cells per rag tick).
const WIND_STRENGTH_BASE = 0.14;
const WIND_STRENGTH_VAR = 0.06;
let WIND_ANGLE_MAX_RAD = 0.55; // ~31deg sideways

// Thunderstorm
const THUNDER_MIN_INTERVAL = 6000;
const THUNDER_MAX_INTERVAL = 60000;
const FLASH_FADE_IN = 50;
const FLASH_FADE_OUT = 300;
const RAIN_VOLUME = 0.03;

// Depth layers: far/mid/near.
// Each layer defines relative look and speed.
const LAYERS = [
	{
		weight: 0.55,
		speedTick: [0.35, 0.55],
		widthPx: [1.0, 1.8],
		lengthPx: [22, 36],
		alphaScale: 0.12,
		brightness: [0.45, 0.65]
	},
	{
		weight: 0.3,
		speedTick: [0.55, 0.85],
		widthPx: [1.6, 2.6],
		lengthPx: [36, 55],
		alphaScale: 0.22,
		brightness: [0.65, 0.85]
	},
	{
		weight: 0.15,
		speedTick: [0.85, 1.25],
		widthPx: [2.3, 3.4],
		lengthPx: [55, 78],
		alphaScale: 0.35,
		brightness: [0.8, 1.0]
	}
];

// Precompute CDF for layer picking.
const _layerCDF = (function () {
	const out = [];
	let acc = 0;
	for (let i = 0; i < LAYERS.length; i++) {
		acc += LAYERS[i].weight;
		out.push(acc);
	}
	return out;
})();

// Puddle settings (Water accumulation system)
const MAX_PUDDLES = 30; // Increased limit to prevent popping
const PUDDLE_INITIAL_SIZE = 20.0;
const PUDDLE_MAX_SIZE = 666.0;
const PUDDLE_GROWTH_PER_DROP = 4.5;
const PUDDLE_ALPHA_MAX = 0.35;
const PUDDLE_FADE_SPEED = 0.00004; // Alpha per ms (faster drying)
const PUDDLE_SEED_CHANCE = 0.002; // Lowered to favor accumulation over spam

// Procedural raindrop sprite (1x16 alpha‑gradient texture stretched into streaks).
let _dropFrame = null;
// Full-screen grey filter (1x1 texture).
let _filterFrame = null;
// Ground splash texture (16x16 soft disc).
let _splashFrame = null;
const SPLASH_LIFE_MS = 220;
const SPLASH_SIZE_PX = [20, 28];
const SPLASH_ALPHA = 0.75;

// Puddle texture (64x64 deformed disc).
let _puddleFrame = null;
let _lightningFrame = null; // Texture generated in code for the lightning

// Shader resources
let _puddleProgram = null;
let _puddleBuffer = null;

// SINGLETON STATE
let _instance = null;
let _mapName = '';
let _isStopping = false;

function ensureDropFrame(gl) {
	if (_dropFrame && _dropFrame.texture && gl.isTexture(_dropFrame.texture)) {
		return;
	}
	_dropFrame = null;
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	// Build a 1x16 vertical gradient (top transparent → bright core → soft tail).
	const h = 16;
	const data = new Uint8Array(h * 4);
	for (let i = 0; i < h; i++) {
		const t = i / (h - 1);
		// Ramp up to full alpha, then taper slightly.
		let a = Math.min(1, t / 0.7);
		if (t > 0.7) {
			a *= 1 - ((t - 0.7) / 0.3) * 0.35;
		}
		const alphaByte = Math.max(0, Math.min(255, Math.floor(a * 255)));
		const idx = i * 4;
		data[idx + 0] = 255;
		data[idx + 1] = 255;
		data[idx + 2] = 255;
		data[idx + 3] = alphaByte;
	}

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	_dropFrame = { texture: tex, width: 1, height: h, type: 1 };
}

function ensureFilterFrame(gl) {
	if (_filterFrame && _filterFrame.texture && gl.isTexture(_filterFrame.texture)) {
		return;
	}
	_filterFrame = null;
	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	_filterFrame = { texture: tex, width: 1, height: 1, type: 1 };
}

function ensureSplashFrame(gl) {
	if (_splashFrame && _splashFrame.texture && gl.isTexture(_splashFrame.texture)) {
		return;
	}
	_splashFrame = null;
	const w = 16,
		h = 16;
	const data = new Uint8Array(w * h * 4);
	const cx = (w - 1) / 2;
	const cy = (h - 1) / 2;
	const maxR = Math.min(cx, cy);

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const dx = x - cx;
			const dy = y - cy;
			const r = Math.sqrt(dx * dx + dy * dy) / maxR;
			let a = 0;
			if (r <= 1) {
				// Soft disc with slight ring emphasis.
				a = Math.exp(-r * r * 2.8);
				const ring = Math.exp(-Math.pow((r - 0.65) / 0.12, 2));
				a = Math.max(a, ring * 0.9);
			}
			const alphaByte = Math.max(0, Math.min(255, Math.floor(a * 255)));
			const idx = (y * w + x) * 4;
			data[idx + 0] = 255;
			data[idx + 1] = 255;
			data[idx + 2] = 255;
			data[idx + 3] = alphaByte;
		}
	}

	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	_splashFrame = { texture: tex, width: w, height: h, type: 1 };
}

function ensurePuddleFrame(gl) {
	if (_puddleFrame && _puddleFrame.texture && gl.isTexture(_puddleFrame.texture)) {
		return;
	}
	_puddleFrame = null;
	const w = 64,
		h = 64;
	const data = new Uint8Array(w * h * 4);
	const cx = (w - 1) / 2;
	const cy = (h - 1) / 2;
	const maxR = Math.min(cx, cy) * 0.85;

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const dx = x - cx;
			const dy = y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const angle = Math.atan2(dy, dx);
			// Procedural deformation for "organic" look
			const deform =
				1.0 + 0.15 * Math.sin(angle * 5) + 0.08 * Math.sin(angle * 3 + 1.5) + 0.05 * Math.cos(angle * 11);
			const r = dist / (maxR * deform);
			let a = 0;
			if (r <= 1.0) {
				// Soft concave falloff for pool look
				a = Math.pow(1.0 - r, 0.7);
			}
			const alphaByte = Math.max(0, Math.min(255, Math.floor(a * 255)));
			const idx = (y * w + x) * 4;
			// Deep wet-blue/dark tone
			data[idx + 0] = 18;
			data[idx + 1] = 32;
			data[idx + 2] = 55;
			data[idx + 3] = alphaByte;
		}
	}

	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	_puddleFrame = { texture: tex, width: w, height: h, type: 1 };
}

/**
 * Procedurally generates a realistic branched lightning bolt on an offscreen canvas
 */
function ensureLightningTexture(gl) {
	if (_lightningFrame && _lightningFrame.texture && gl.isTexture(_lightningFrame.texture)) {
		return _lightningFrame;
	}

	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 512;
	const ctx = canvas.getContext('2d');

	ctx.clearRect(0, 256, 256, 512);

	// Recursive function to draw fractal branches (Midpoint Displacement)
	function drawBolt(x1, y1, x2, y2, displacement) {
		if (displacement < 4) {
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 3.5;
			ctx.shadowColor = '#80bfff';
			ctx.shadowBlur = 18;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			return;
		}
		const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
		const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

		drawBolt(x1, y1, midX, midY, displacement / 2);
		drawBolt(midX, midY, x2, y2, displacement / 2);

		// Random side branch
		if (Math.random() < 0.25 && displacement > 15) {
			const branchX = midX + (Math.random() - 0.5) * 60;
			const branchY = midY + Math.random() * 80;
			drawBolt(midX, midY, branchX, branchY, displacement / 2.2);
		}
	}

	// Starts the lightning from top to bottom center
	drawBolt(128, 10, 128 + (Math.random() - 0.5) * 40, 500, 70);

	const tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	_lightningFrame = { texture: tex, width: 256, height: 512, type: 1 };
	return _lightningFrame;
}

function initPuddleShader(gl) {
	if (_puddleProgram) {
		return;
	}
	_puddleProgram = WebGL.createShaderProgram(gl, _puddleVs, _puddleFs);

	// Generate horizontal quad buffer (XZ plane)
	const vertices = new Float32Array([
		// Triangle 1 (pos: x, y, z, tex: u, v)
		-0.5, 0.0, -0.5, 0.0, 0.0, 0.5, 0.0, -0.5, 1.0, 0.0, -0.5, 0.0, 0.5, 0.0, 1.0, 0.5, 0.0, -0.5, 1.0, 0.0, 0.5,
		// Triangle 2
		0.0, 0.5, 1.0, 1.0, -0.5, 0.0, 0.5, 0.0, 1.0
	]);
	_puddleBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, _puddleBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

function randRange(min, max) {
	return min + Math.random() * (max - min);
}

function pickLayerIndex() {
	const r = Math.random() * _layerCDF[_layerCDF.length - 1];
	for (let i = 0; i < _layerCDF.length; i++) {
		if (r <= _layerCDF[i]) {
			return i;
		}
	}
	return _layerCDF.length - 1;
}

function computeGlobalWind(tick) {
	const t = tick * 0.0000001;
	const gustChaos = Math.sin(t * 1.4) * Math.cos(t * 0.7) + Math.sin(t * 2.8) * 0.3;
	const strengthTick = WIND_STRENGTH_BASE + WIND_STRENGTH_VAR * (Math.sin(t * 0.4) * 0.5 + gustChaos * 0.7);

	const angleCam = Math.random() > 5 ? -WIND_ANGLE_MAX_RAD : WIND_ANGLE_MAX_RAD; //(Math.sin(t * 0.25) * 0.6 + Math.sin(t * 0.9) * 0.4) * WIND_ANGLE_MAX_RAD;

	const camXTick = Math.cos(angleCam) * Math.max(0.01, strengthTick);
	const camYTick = Math.sin(angleCam) * Math.max(0.01, strengthTick) * 0.35;

	const yawRad = (((Camera.angle && Camera.angle[1]) || 0) * Math.PI) / 180;
	const cosYaw = Math.cos(yawRad);
	const sinYaw = Math.sin(yawRad);
	const xTick = camXTick * cosYaw + camYTick * sinYaw;
	const yTick = -camXTick * sinYaw + camYTick * cosYaw;

	return {
		camXTick: camXTick,
		camYTick: camYTick,
		xTick: xTick,
		yTick: yTick,
		xMs: xTick / RAG_TICK_MS,
		yMs: yTick / RAG_TICK_MS
	};
}
/**
 * Compute the on‑screen tilt for a raindrop so the streak aligns with its
 * projected movement direction under the current camera pitch/yaw.
 *
 * We transform the drop velocity into the same "map coords" used by the
 * SpriteRenderer Project() helper (x, -z, y), then into view space via
 * Camera.modelView. The streak axis is SpriteRenderer +Y, so the angle is
 * atan2(vx_view, vy_view).
 */
function computeDropTilt(vx, vy, speedMs) {
	// Velocity in world coords (cells/ms). Falling decreases world Z.
	const vz = -speedMs;
	// Convert to map-space vector (matches SpriteRenderer.Project)
	const mx = vx;
	const my = -vz; // = speedMs, positive when falling down.
	const mz = vy;

	const m = Camera.modelView;
	if (!m) {
		return 0;
	}

	// View‑space velocity (w=0 ignores translation).
	const vxView = m[0] * mx + m[4] * my + m[8] * mz;
	const vyView = m[1] * mx + m[5] * my + m[9] * mz;
	if (Math.abs(vxView) < 0.000001 && Math.abs(vyView) < 0.000001) {
		return 0;
	}
	return (Math.atan2(vxView, vyView) * 180) / Math.PI;
}

class RainWeatherEffect {
	constructor(Params) {
		this.effectID = Params.Inst.effectID;
		this.ownerAID = Params.Init.ownerAID;
		this.startTick = Params.Inst.startTick;
		this.endTick = Params.Inst.endTick;

		this.lastEmitTick = this.startTick;
		this.drops = [];
		this.splashes = [];
		this.puddles = [];

		this._wind = { xTick: 0, yTick: 0, xMs: 0, yMs: 0 };

		// --- Thunderstorm & Lightning ---
		this.nextLightningTime = Date.now() + randRange(THUNDER_MIN_INTERVAL, THUNDER_MAX_INTERVAL);
		this.isFlashing = false;
		this.flashStartTime = 0;
		this.flashMultiCount = Math.random() > 0.5 ? 2 : 1; // Double thunders
		this.lightningX = 0;
		this.lightningY = 0;
		this.lightningZ = 0;

		this.audioCtx = null;
		this.rainNode = null;
		this.rainFilterNode = null;
		this.rainGainNode = null;
		this.windLfoNode = null;

		// Try start audio feature
		try {
			const AudioContext = window.AudioContext || window.webkitAudioContext;
			if (AudioContext) {
				this.audioCtx = new AudioContext();
				this.initRainSound();
			}
		} catch (e) {
			console.warn('RainWeather: Web Audio API is not supported', e);
		}

		this.ready = true;
		this.needCleanUp = false;
	}

	static isActive() {
		return _instance;
	}

	static beforeRender(gl, modelView, projection, fog) {
		SpriteRenderer.shadow = 1;
		SpriteRenderer.angle = 0;
		SpriteRenderer.offset[0] = 0;
		SpriteRenderer.offset[1] = 0;
		SpriteRenderer.image.palette = null;
		SpriteRenderer.color.set([1, 1, 1, 1]);
		SpriteRenderer.depth = 0;
		SpriteRenderer.zIndex = 0;
	}

	static afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	static startOrRestart(Params) {
		const now = Params.Inst.startTick || Renderer.tick;
		const currentMap = MapRenderer.currentMap;

		if (_mapName !== currentMap) {
			_instance = null;
			_mapName = currentMap;
		}
		_isStopping = false;
		if (_instance && !_instance.needCleanUp) {
			if (_instance.endTick > 0) {
				_instance.endTick = -1;
				_instance.lastEmitTick = now;
			}
			return _instance;
		}

		_instance = new RainWeatherEffect(Params);
		_mapName = currentMap;
		return _instance;
	}

	static renderAll(gl, modelView, projection, fog, tick) {
		if (!_instance) {
			return;
		}
		// Clean up if map changed
		if (_mapName !== MapRenderer.currentMap) {
			_instance = null;
			return;
		}

		this.beforeRender(gl, modelView, projection, fog);

		SpriteRenderer.runWithDepth(false, false, true, () => {
			_instance.render(gl, tick, false);
		});

		if (_instance.needCleanUp) {
			_instance.free();
			_instance = null;
		}

		this.afterRender(gl);
	}

	static renderPuddles(gl, modelView, projection, fog, tick) {
		if (!_instance || !_instance.puddles.length) {
			return;
		}
		this.beforeRender(gl, modelView, projection, fog);
		_instance.render(gl, tick, true);
		this.afterRender(gl);
	}

	static stop(ownerAID, tick) {
		if (!_instance) {
			return;
		}
		const now = tick || Renderer.tick;
		if (_instance.endTick === -1) {
			_isStopping = true;
			_instance.endTick = now + FADEOUT_TAIL_MS;
		}
	}

	initRainSound() {
		if (!this.audioCtx || !Preferences.Sound.play) {
			return;
		}

		const ctx = this.audioCtx;
		if (ctx.state === 'suspended') {
			ctx.resume().catch(() => {});
		}

		const bufferSize = 4 * ctx.sampleRate;
		const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
		const output = buffer.getChannelData(0);

		// Generate white noise
		let b0 = 0,
			b1 = 0,
			b2 = 0,
			b3 = 0,
			b4 = 0,
			b5 = 0,
			b6 = 0;
		for (let i = 0; i < bufferSize; i++) {
			const white = Math.random() * 2 - 1;
			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.969 * b2 + white * 0.153852;
			b3 = 0.8665 * b3 + white * 0.3104856;
			b4 = 0.55 * b4 + white * 0.5329522;
			b5 = -0.7616 * b5 - white * 0.016898;
			output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			output[i] *= 0.11;
			b6 = white * 0.115926;
		}

		const fadeSamples = Math.floor(ctx.sampleRate * 0.1);
		for (let i = 0; i < fadeSamples; i++) {
			const ratio = i / fadeSamples;
			output[i] = output[i] * ratio + output[bufferSize - fadeSamples + i] * (1 - ratio);
		}

		const rainSource = ctx.createBufferSource();
		rainSource.buffer = buffer;
		rainSource.loop = true;

		const metalFilter = ctx.createBiquadFilter();
		metalFilter.type = 'peaking';
		metalFilter.frequency.value = 2800;
		metalFilter.Q.value = 1.2;
		metalFilter.gain.value = 6;

		// Low pass filter
		const rainFilter = ctx.createBiquadFilter();
		rainFilter.type = 'lowpass';
		rainFilter.frequency.value = 2200;
		rainFilter.Q.value = 1.0;

		const gainNode = ctx.createGain();
		const targetVolume = RAIN_VOLUME * Preferences.Sound.volume;

		const lfo = ctx.createOscillator();
		const lfoGain = ctx.createGain();
		lfo.frequency.value = 0.18;
		lfoGain.gain.value = 350;
		lfo.connect(lfoGain);
		lfoGain.connect(rainFilter.frequency);

		const now = ctx.currentTime;
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.5);

		rainSource.connect(metalFilter);
		metalFilter.connect(rainFilter);
		rainFilter.connect(gainNode);
		gainNode.connect(ctx.destination);

		rainSource.start(0);
		lfo.start(0);

		this.rainNode = rainSource;
		this.rainFilterNode = rainFilter;
		this.rainGainNode = gainNode;
		this.windLfoNode = lfo;
	}

	triggerRainDropSound() {
		if (!this.audioCtx || !Preferences.Sound.play) {
			return;
		}

		const ctx = this.audioCtx;
		if (ctx.state === 'suspended') {
			ctx.resume().catch(() => {});
		}

		const now = ctx.currentTime;
		const bufferSize = ctx.sampleRate * 0.02;
		const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}

		const noise = ctx.createBufferSource();
		noise.buffer = buffer;

		const filter = ctx.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.value = randRange(1200, 1800);
		filter.Q.value = 6.0;

		const gain = ctx.createGain();
		const peakVolume = Math.min(0.15, RAIN_VOLUME * 2.5) * (Preferences.Sound.volume || 1.0);

		gain.gain.setValueAtTime(peakVolume, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

		noise.connect(filter);
		filter.connect(gain);
		gain.connect(ctx.destination);

		noise.start(now);
		//clean afteruse
		setTimeout(() => {
			try {
				noise.disconnect();
				filter.disconnect();
				gain.disconnect();
			} catch (e) {
				/* ignore */
			}
		}, 50);
	}

	/**
	 * Thunder with delay proportional to the physical distance of the lightning
	 */
	triggerThunderSound(distanceCells) {
		if (!this.audioCtx || !Preferences.Sound.play) {
			return;
		}

		const ctx = this.audioCtx;
		if (ctx.state === 'suspended') {
			ctx.resume().catch(() => {});
		}

		// Correção do delay: 1 célula ≈ 1 metro. Velocidade do som proporcional à distância real.
		const soundDelayMs = Math.max(3000, distanceCells);

		setTimeout(() => {
			if (!this.audioCtx) return;

			// Aumentado para 4 segundos para comportar o eco e a cauda longa
			const bufferSize = ctx.sampleRate * 4 * (6 * this.flashMultiCount);
			const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
			const data = buffer.getChannelData(0);

			// Gerador de ondas com múltiplos picos (simula o estrondo + rolagem orgânica)
			for (let i = 0; i < bufferSize; i++) {
				const t = i / ctx.sampleRate;

				// Envelope principal + ondas secundárias de impacto rebatido
				let envelope = Math.exp(-t * 1.1);
				envelope += 0.45 * Math.exp(-Math.abs(t - 0.35) * 2.2); // Rebate inicial forte
				envelope += 0.25 * Math.sin(t * 5.5) * Math.exp(-t * 0.7); // Ondulação estilo "chapa de metal"

				data[i] = (Math.random() * 2 - 1) * Math.max(0, envelope);
			}

			const source = ctx.createBufferSource();
			source.buffer = buffer;

			// Filtro Lowpass Dinâmico (Varia o tom ao longo do tempo simulando a chapa vibrando)
			const filter = ctx.createBiquadFilter();
			filter.type = 'lowpass';
			const baseFreq = Math.max(70, 320 - distanceCells * 2.5);

			const now = ctx.currentTime;
			// Automática variação de tom (frequência sobe e desce dando o efeito dramático)
			filter.frequency.setValueAtTime(baseFreq * 1.3, now);
			filter.frequency.linearRampToValueAtTime(baseFreq * 0.6, now + 0.4);
			filter.frequency.linearRampToValueAtTime(baseFreq * 1.4, now + 1.2);
			filter.frequency.linearRampToValueAtTime(baseFreq * 0.45, now + 2.8);

			// Nó de Eco / Delay para dar persistência e efeito de cânion/estúdio
			const delayNode = ctx.createDelay();
			delayNode.delayTime.value = 0.28; // Tempo de eco entre as reflexões

			const feedbackNode = ctx.createGain();
			feedbackNode.gain.value = 0.4; // Intensidade do eco reverberante recirculando

			const thunderGain = ctx.createGain();
			const distanceFactor = Math.max(0.15, 1.0 - distanceCells / 70.0);
			const finalVol = 0.85 * distanceFactor * Preferences.Sound.volume;

			thunderGain.gain.setValueAtTime(finalVol, now);
			thunderGain.gain.exponentialRampToValueAtTime(0.001 * Preferences.Sound.volume, now + 3.8);

			// --- Roteamento de Áudio com Malha de Eco (Feedback Loop) ---
			source.connect(filter);

			// Caminho Direto
			filter.connect(thunderGain);

			// Caminho do Eco (Cria o rastro persistente)
			filter.connect(delayNode);
			delayNode.connect(feedbackNode);
			feedbackNode.connect(delayNode); // Mantém o loop do eco
			delayNode.connect(thunderGain); // Joga o eco processado para o ganho final

			thunderGain.connect(ctx.destination);

			source.start();
		}, soundDelayMs);
	}

	spawnDrop(spawnTick) {
		if (!Session.Entity) {
			return;
		}

		const layerIndex = pickLayerIndex();
		const layer = LAYERS[layerIndex];

		const px = Session.Entity.position[0];
		const py = Session.Entity.position[1];

		const theta = Math.random() * Math.PI * 2;
		const radius = Math.random() * SCATTER_RADIUS_CELLS;
		const ox = Math.cos(theta) * radius;
		const oy = Math.sin(theta) * radius;

		const speedTick = randRange(layer.speedTick[0], layer.speedTick[1]);
		const widthPx = randRange(layer.widthPx[0], layer.widthPx[1]);
		const lengthPx = randRange(layer.lengthPx[0], layer.lengthPx[1]);

		const spawnHeight = randRange(SPAWN_HEIGHT_MIN_CELLS, SPAWN_HEIGHT_MAX_CELLS);
		const driftTimeTicks = spawnHeight / speedTick;
		const upwindX = -this._wind.xTick * driftTimeTicks;
		const upwindY = -this._wind.yTick * driftTimeTicks;

		const x = px + ox + upwindX;
		const y = py + oy + upwindY;
		const groundZ = Altitude.getCellHeight(x, y);
		const z = groundZ + spawnHeight;

		this.drops.push({
			spawnTick: spawnTick,
			x: x,
			y: y,
			z: z,
			spawnZ: z,
			groundZ: groundZ,
			speedMs: speedTick / RAG_TICK_MS,
			tiltJitter: randRange(-2, 2),
			widthPx: widthPx,
			lengthPx: lengthPx,
			alphaScale: layer.alphaScale,
			brightness: randRange(layer.brightness[0], layer.brightness[1]),
			flicker: Math.random() * 1000
		});

		if (this.drops.length > MAX_DROPS) {
			this.drops.splice(0, this.drops.length - MAX_DROPS);
		}
	}

	updatePuddle(x, y, z, tick) {
		let bestPuddle = null;
		let bestDistSq = Infinity;

		for (let i = 0; i < this.puddles.length; i++) {
			const p = this.puddles[i];
			const dx = p.x - x;
			const dy = p.y - y;
			const distSq = dx * dx + dy * dy;
			const impactRadius = Math.max(1.5, (p.size / 35.0) * 0.8);

			if (distSq < impactRadius * impactRadius) {
				if (distSq < bestDistSq) {
					bestDistSq = distSq;
					bestPuddle = p;
				}
			}
		}

		if (bestPuddle) {
			bestPuddle.size = Math.min(PUDDLE_MAX_SIZE, bestPuddle.size + PUDDLE_GROWTH_PER_DROP);
			bestPuddle.alpha = Math.min(PUDDLE_ALPHA_MAX, bestPuddle.alpha + 0.02);
			const currentLife = Math.max(0, (bestPuddle.nextDryTick || tick) - tick);
			bestPuddle.nextDryTick = tick + Math.min(10000, currentLife + 1500);
			bestPuddle.lastUpdate = tick;
		} else if (Math.random() < PUDDLE_SEED_CHANCE) {
			let tooClose = false;
			for (let i = 0; i < this.puddles.length; i++) {
				const p = this.puddles[i];
				const dx = p.x - x;
				const dy = p.y - y;
				if (dx * dx + dy * dy < PUDDLE_MAX_SIZE / 4) {
					tooClose = true;
					p.size = Math.min(PUDDLE_MAX_SIZE, p.size + PUDDLE_GROWTH_PER_DROP * 0.5);
					break;
				}
			}

			if (!tooClose) {
				if (this.puddles.length >= MAX_PUDDLES) {
					let worstIdx = 0;
					let minScore = Infinity;
					for (let i = 0; i < this.puddles.length; i++) {
						const score = this.puddles[i].size * this.puddles[i].alpha;
						if (score < minScore) {
							minScore = score;
							worstIdx = i;
						}
					}
					this.puddles.splice(worstIdx, 1);
				}
				this.puddles.push({
					x: x,
					y: y,
					z: z,
					size: PUDDLE_INITIAL_SIZE,
					alpha: 0.12,
					angle: Math.random() * Math.PI * 2,
					lastUpdate: tick,
					nextDryTick: tick + 3500
				});
			}
		}
	}

	render(gl, tick, puddlesOnly = false) {
		if (!Session.Entity) {
			return;
		}

		ensureDropFrame(gl);
		ensureFilterFrame(gl);
		ensureSplashFrame(gl);
		ensurePuddleFrame(gl);
		ensureLightningTexture(gl);
		initPuddleShader(gl);

		if (puddlesOnly) {
			this.renderPuddles(gl, tick);
			return;
		}

		if (!_dropFrame) {
			return;
		}

		this._wind = computeGlobalWind(tick);
		const now = Date.now();

		// --- Thunderstorm / Lightning strike ---
		if (!this.isFlashing && now >= this.nextLightningTime) {
			const angle = Math.random() * Math.PI * 2;
			const dist = randRange(Session.Entity.position[0] + (Math.random() >= 0.5 ? randRange(1,18) : -randRange(1,18)), Session.Entity.position[1] + (Math.random() >= 0.5 ? randRange(1,18) : -randRange(1,18))); // Distance in cells
			const px = Session.Entity.position[0];
			const py = Session.Entity.position[1];

			this.lightningX = px + Math.cos(angle) * dist;
			this.lightningY = py + Math.sin(angle) * dist;
			this.lightningZ = Altitude.getCellHeight(this.lightningX, this.lightningY);

			// Triggers sound with delay proportional to calculated distance
			this.triggerThunderSound(dist);

			this.isFlashing = true;
			this.flashStartTime = now;
			this.flashMultiCount = Math.random() > 0.6 ? 2 : 1;
			this.nextLightningTime = now + randRange(THUNDER_MIN_INTERVAL, THUNDER_MAX_INTERVAL);
		}

		// Ambient flash with moderate alpha to allow seeing the lightning
		let overlayR = 0.65;
		let overlayG = 0.67;
		let overlayB = 0.7;
		let overlayA = 0.14;

		if (this.isFlashing) {
			const elapsed = now - this.flashStartTime;
			let flashAlpha = 0;

			if (this.flashMultiCount === 2) {
				if (elapsed < 80) {
					flashAlpha = 0.45 * (1 - elapsed / 80);
				} else if (elapsed < 160) {
					flashAlpha = 0;
				} else {
					const elapsed2 = elapsed - 160;
					if (elapsed2 < FLASH_FADE_IN) {
						flashAlpha = (elapsed2 / FLASH_FADE_IN) * 0.8;
					} else if (elapsed2 < FLASH_FADE_IN + FLASH_FADE_OUT) {
						const p = (elapsed2 - FLASH_FADE_IN) / FLASH_FADE_OUT;
						flashAlpha = 0.6 * (1 - p);
					} else {
						this.isFlashing = false;
					}
				}
			} else {
				if (elapsed < FLASH_FADE_IN) {
						// Trigger EF_THUNDERSTORM (effect 30) once when lightning strike occurs
						EffectManager.spam({
							effectId: 30,
							position: [
								this.lightningX + (Math.random() >= 0.5 ? -10 : +10),
								this.lightningY + (Math.random() >= 0.5 ? -10 : +10),
								this.lightningZ
							],
							startTick: tick,
							duration: now - this.flashStartTime
						});
					
					flashAlpha = (elapsed / FLASH_FADE_IN) * 0.6;
				} else if (elapsed < FLASH_FADE_IN + FLASH_FADE_OUT) {
					const p = (elapsed - FLASH_FADE_IN) / FLASH_FADE_OUT;
					flashAlpha = 0.8 * (1 - p);
				} else {
					this.isFlashing = false;
				}
			}

			if (this.isFlashing) {
				overlayR = 0.9;
				overlayG = 0.95;
				overlayB = 1.0;
				overlayA = flashAlpha; // Balanced alpha for the environment
			}
		}

		// Renders the gray/white flash overlay
		if (_filterFrame) {
			if (this.endTick > 0 && !this.isFlashing) {
				const tail = Math.max(0, Math.min(1, (this.endTick - tick) / FADEOUT_TAIL_MS));
				overlayA *= tail;
			}

			SpriteRenderer.image.palette = null;
			SpriteRenderer.sprite = _filterFrame;
			SpriteRenderer.image.texture = _filterFrame.texture;
			SpriteRenderer.position[0] = Session.Entity.position[0];
			SpriteRenderer.position[1] = Session.Entity.position[1];
			SpriteRenderer.position[2] = Session.Entity.position[2];
			SpriteRenderer.zIndex = -1000;

			SpriteRenderer.color[0] = overlayR;
			SpriteRenderer.color[1] = overlayG;
			SpriteRenderer.color[2] = overlayB;
			SpriteRenderer.color[3] = overlayA;

			SpriteRenderer.angle = 0;
			SpriteRenderer.size[0] = 6000;
			SpriteRenderer.size[1] = 6000;
			SpriteRenderer.offset[0] = 0;
			SpriteRenderer.offset[1] = 0;
			SpriteRenderer.render(false);
		}

		// --- Renders the Realistic Procedural Lightning in the World ---
		if (this.isFlashing && _lightningFrame) {
			const elapsed = now - this.flashStartTime;
			// The lightning appears quickly in the first 120ms of the flash
			if (elapsed < 140) {
				const boltAlpha = Math.min(1.0, (140 - elapsed) / 80);

				SpriteRenderer.image.palette = null;
				SpriteRenderer.sprite = _lightningFrame;
				SpriteRenderer.image.texture = _lightningFrame.texture;
				SpriteRenderer.position[0] = this.lightningX;
				SpriteRenderer.position[1] = this.lightningY;
				SpriteRenderer.position[2] = this.lightningZ + 8; // Height on the map
				SpriteRenderer.zIndex = 500; // Stays above sprites/entities

				SpriteRenderer.color[0] = 0.9;
				SpriteRenderer.color[1] = 0.95;
				SpriteRenderer.color[2] = 1.0;
				SpriteRenderer.color[3] = boltAlpha;

				SpriteRenderer.angle = 0;
				SpriteRenderer.size[0] = 18; // Beam width in the world
				SpriteRenderer.size[1] = 36; // Beam height
				SpriteRenderer.offset[0] = 0;
				SpriteRenderer.offset[1] = 0;
				SpriteRenderer.render(false);
			}
		}

		// Rain drop generation and update
		let remaining = Infinity;
		if (this.endTick > 0) {
			remaining = this.endTick - tick;
			if (remaining <= 0) {
				this.needCleanUp = true;
				return;
			}
		}

		const allowEmit = remaining > EMIT_STOP_BEFORE_END_MS;
		if (allowEmit) {
			const ticksToEmit = Math.floor((tick - this.lastEmitTick) / RAG_TICK_MS);
			if (ticksToEmit > 0) {
				for (let i = 0; i < ticksToEmit; i++) {
					const emitTick = this.lastEmitTick + i * RAG_TICK_MS;
					if (_isStopping) {
						break;
					}
					for (let e = 0; e < EMIT_PER_TICK; e++) {
						this.spawnDrop(emitTick);
					}
				}
				this.lastEmitTick += ticksToEmit * RAG_TICK_MS;
			}
		}

		for (let d = this.drops.length - 1; d >= 0; d--) {
			const drop = this.drops[d];

			if (drop.z <= drop.groundZ + 0.05) {
				if (_splashFrame && Math.random() < drop.alphaScale * 0.6) {
					this.splashes.push({
						x: drop.x,
						y: drop.y,
						z: drop.groundZ + 0.02,
						startTick: tick,
						lifeMs: SPLASH_LIFE_MS,
						maxSizePx: randRange(SPLASH_SIZE_PX[0], SPLASH_SIZE_PX[1]),
						angle: drop.angle * 0.2
					});
					if (this.splashes.length > 300) {
						this.splashes.splice(0, this.splashes.length - 300);
					}
					if (Math.random() < 0.25) {
						this.triggerRainDropSound();
					}
				}

				this.updatePuddle(drop.x, drop.y, drop.groundZ, tick);
				this.drops.splice(d, 1);
				continue;
			}

			const dt = tick - (drop._lastTick || drop.spawnTick);
			drop._lastTick = tick;

			const windXMs = this._wind.xMs;
			const windYMs = this._wind.yMs;

			drop.z -= drop.speedMs * dt;
			drop.x += windXMs * dt;
			drop.y += windYMs * dt;

			const denom = drop.spawnZ - drop.groundZ;
			let progress = denom > 0.0001 ? (drop.spawnZ - drop.z) / denom : 0;
			progress = Math.max(0, Math.min(1, progress));

			let alpha = drop.alphaScale;
			if (progress < 0.08) {
				alpha *= progress / 0.08;
			} else if (progress > 0.85) {
				alpha *= (1 - progress) / 0.15;
			}
			alpha *= 0.9 + 0.1 * Math.sin((tick + drop.flicker) * 0.015);

			SpriteRenderer.position[0] = drop.x;
			SpriteRenderer.position[1] = drop.y;
			SpriteRenderer.position[2] = drop.z;
			SpriteRenderer.zIndex = 0;

			SpriteRenderer.image.palette = null;
			SpriteRenderer.sprite = _dropFrame;
			SpriteRenderer.image.texture = _dropFrame.texture;
			SpriteRenderer.color[0] = 0.6 * drop.brightness;
			SpriteRenderer.color[1] = 0.72 * drop.brightness;
			SpriteRenderer.color[2] = 1.0 * drop.brightness;
			SpriteRenderer.color[3] = alpha;
			SpriteRenderer.angle = computeDropTilt(windXMs, windYMs, drop.speedMs) + (drop.tiltJitter || 0);
			SpriteRenderer.size[0] = drop.widthPx;
			SpriteRenderer.size[1] = drop.lengthPx;
			SpriteRenderer.offset[0] = 0;
			SpriteRenderer.offset[1] = 0;

			SpriteRenderer.render(false);
		}

		if (_splashFrame && this.splashes.length) {
			for (let s = this.splashes.length - 1; s >= 0; s--) {
				const splash = this.splashes[s];
				const splashAge = tick - splash.startTick;
				if (splashAge >= splash.lifeMs) {
					this.splashes.splice(s, 1);
					continue;
				}

				const sp = splashAge / splash.lifeMs;
				const splashAlpha = SPLASH_ALPHA * (1 - sp);
				const splashSize = splash.maxSizePx * (0.6 + sp * 0.8);

				SpriteRenderer.image.palette = null;
				SpriteRenderer.sprite = _splashFrame;
				SpriteRenderer.image.texture = _splashFrame.texture;
				SpriteRenderer.position[0] = splash.x;
				SpriteRenderer.position[1] = splash.y;
				SpriteRenderer.position[2] = splash.z;
				SpriteRenderer.zIndex = 0;
				SpriteRenderer.color[0] = 0.75;
				SpriteRenderer.color[1] = 0.8;
				SpriteRenderer.color[2] = 0.9;
				SpriteRenderer.color[3] = splashAlpha;
				SpriteRenderer.angle = splash.angle;
				SpriteRenderer.size[0] = splashSize;
				SpriteRenderer.size[1] = splashSize;
				SpriteRenderer.offset[0] = 0;
				SpriteRenderer.offset[1] = 0;
				SpriteRenderer.render(false);
			}
		}
	}

	renderPuddles(gl, tick) {
		if (_puddleFrame && this.puddles.length) {
			const self = this;
			SpriteRenderer.runWithDepth(true, false, false, () => {
				const uniform = _puddleProgram.uniform;
				const attribute = _puddleProgram.attribute;

				gl.useProgram(_puddleProgram);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

				gl.uniformMatrix4fv(uniform.uModelViewMat, false, Camera.modelView);
				gl.uniformMatrix4fv(uniform.uProjectionMat, false, Camera.projection);

				const fog = MapRenderer.fog;
				gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
				gl.uniform1f(uniform.uFogNear, fog.near);
				gl.uniform1f(uniform.uFogFar, fog.far);
				gl.uniform3fv(uniform.uFogColor, fog.color);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, _puddleFrame.texture);
				gl.uniform1i(uniform.uDiffuse, 0);

				gl.uniform1f(uniform.uTime, tick * 0.001);
				gl.uniform3fv(uniform.uCameraPos, Camera.position);

				gl.bindBuffer(gl.ARRAY_BUFFER, _puddleBuffer);
				gl.enableVertexAttribArray(attribute.aPosition);
				gl.enableVertexAttribArray(attribute.aTextureCoord);
				gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 5 * 4, 0);
				gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

				for (let p = self.puddles.length - 1; p >= 0; p--) {
					const puddle = self.puddles[p];
					if (tick > (puddle.nextDryTick || tick)) {
						const dt = tick - (puddle._lastTick || tick);
						const evaporationRate = PUDDLE_FADE_SPEED / (1.0 + puddle.size * 0.003);
						const fade = evaporationRate * dt;

						puddle.alpha -= fade;
						puddle.size -= fade * 8500.0;
					}
					puddle._lastTick = tick;

					if (puddle.size <= 0.1 || puddle.alpha <= 0.0001) {
						self.puddles.splice(p, 1);
						continue;
					}

					gl.uniform3f(uniform.uWorldPosition, puddle.x, puddle.y, puddle.z + 0.01);
					gl.uniform2f(uniform.uSize, puddle.size, puddle.size);
					gl.uniform1f(uniform.uAngle, puddle.angle);
					gl.uniform4f(uniform.uColor, 1.0, 1.0, 1.0, puddle.alpha);
					gl.uniform1f(uniform.uZIndex, 1);

					gl.drawArrays(gl.TRIANGLES, 0, 6);
				}

				gl.disableVertexAttribArray(attribute.aPosition);
				gl.disableVertexAttribArray(attribute.aTextureCoord);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			});
		}
	}

	free() {
		if (this.audioCtx) {
			try {
				if (this.windLfoNode) {
					this.windLfoNode.stop();
					this.windLfoNode.disconnect();
					this.windLfoNode = null;
				}
				if (this.rainNode) {
					this.rainNode.stop();
					this.rainNode.disconnect();
					this.rainNode = null;
				}
				this.audioCtx.close();
				this.audioCtx = null;
			} catch (e) {
				/* ignore */
			}
		}
		this.drops = [];
		this.splashes = [];
		this.puddles = [];
		this.ready = false;
	}
}

RainWeatherEffect.renderBeforeEntities = false;

export default RainWeatherEffect;
