/**
 * Core/PerfProbe.js
 *
 * Opt-in performance probe: frame time, draw calls per frame, map load time
 * and startup-to-login time, with a small on-screen overlay.
 *
 * Off unless the configuration asks for it with `perfProbe: true` (ROConfig).
 * Off, every hook below is one boolean test and nothing else: the WebGL
 * context is not wrapped and no overlay is made.
 *
 * On, the `/perf` chat command (Controls/ProcessCommand.js) reads it:
 *   /perf              frame statistics since the last reset, plus the marks
 *                      (summary in the chat, the whole object in the console)
 *   /perf reset        start a new measurement window
 *   /perf slow         frames over 33 ms since the reset (console.table)
 *   /perf overlay on|off
 * The first 1000 slow frames of a window are also performance.measure entries
 * named 'roPerf slow frame', so a Chrome trace or
 * performance.getEntriesByName() finds them.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import Configs from 'Core/Configs.js';

/**
 * Frames kept per window, as a ring: the statistics cover the last this many
 * (ten minutes at 60 fps, about twenty seconds uncapped)
 */
const MAX_FRAMES = 36000;

/**
 * A frame slower than this (ms, frame to frame) counts as a hitch
 */
const HITCH_MS = 50;

/**
 * A frame slower than this (ms) goes in the slow frame log, and into a
 * performance.measure that Chrome traces show ('roPerf slow frame')
 */
const SLOW_MS = 33;
const MAX_SLOW = 1000;

const DRAW_CALLS = ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'drawRangeElements'];

const _interval = new Float32Array(MAX_FRAMES); // frame start to frame start
const _work = new Float32Array(MAX_FRAMES); // time spent inside the render loop
const _draws = new Uint32Array(MAX_FRAMES);
let _total = 0; // frames since the reset; the newest is at (_total - 1) % MAX_FRAMES
let _pending = 0; // this frame's interval, 0 for the first frame of a window
let _windowStart = 0;

let _frameStart = 0;
let _frameTime = 0;
let _lastFrameStart = 0;
let _frameDraws = 0;
let _frameVertices = 0;
let _totalVertices = 0;

let _gl = null;
let _overlay = null;
let _overlayTimer = 0;
let _overlayWanted = true; // shown by default, until /perf overlay off

let _mapStart = 0;
let _mapName = '';
let _mapReady = 0;

const _slow = [];
let _slowTotal = 0; // slow frames since the reset, including those past MAX_SLOW

const _marks = {
	login: null,
	maps: []
};

/**
 * Percentile of a sorted array
 *
 * @param {Float32Array|Array} sorted ascending
 * @param {number} p 0..100
 * @return {number}
 */
function percentile(sorted, p) {
	if (!sorted.length) {
		return 0;
	}
	const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
	return sorted[Math.max(0, index)];
}

/**
 * avg / p50 / p95 / p99 / max of the first `count` values
 *
 * @param {Float32Array|Uint32Array} values
 * @param {number} count
 * @return {object}
 */
function summarize(values, count) {
	const sorted = Float64Array.from(values.subarray(0, count)).sort();
	let sum = 0;
	for (let i = 0; i < count; ++i) {
		sum += sorted[i];
	}
	const round = v => Math.round(v * 100) / 100;
	return {
		avg: round(count ? sum / count : 0),
		p50: round(percentile(sorted, 50)),
		p95: round(percentile(sorted, 95)),
		p99: round(percentile(sorted, 99)),
		max: round(count ? sorted[count - 1] : 0)
	};
}

/**
 * Record a slow frame: the gap since the previous frame started, up to the
 * end of this frame's work
 *
 * @param {number} interval ms since the previous frame started
 * @param {number} work ms spent in this frame
 * @param {number} draws draw calls in this frame
 */
function logSlow(interval, work, draws) {
	_slowTotal++;
	// Past the cap, neither the log nor the browser's User Timing buffer grows
	if (_slow.length >= MAX_SLOW) {
		return;
	}
	const start = _frameTime - interval;
	_slow.push({
		at: Math.round(start),
		frameMs: Math.round(interval * 10) / 10,
		workMs: Math.round(work * 10) / 10,
		draws
	});
	try {
		performance.measure('roPerf slow frame', { start, end: performance.now() });
	} catch (_e) {
		// no User Timing Level 3
	}
}

/**
 * Wrap the context's draw calls to count them
 *
 * @param {WebGLRenderingContext} gl
 */
function wrapContext(gl) {
	for (const name of DRAW_CALLS) {
		const original = gl[name];
		if (typeof original !== 'function') {
			continue;
		}
		// drawArrays(mode, first, count); drawElements(mode, count, ...);
		// drawRangeElements(mode, start, end, count, ...);
		// drawArraysInstanced(mode, first, count, instances);
		// drawElementsInstanced(mode, count, type, offset, instances)
		const countArg =
			name === 'drawArrays' || name === 'drawArraysInstanced' ? 2 : name === 'drawRangeElements' ? 3 : 1;
		const instanceArg = name === 'drawArraysInstanced' ? 3 : name === 'drawElementsInstanced' ? 4 : -1;
		gl[name] = function () {
			_frameDraws++;
			const instances = instanceArg < 0 ? 1 : arguments[instanceArg] | 0;
			_frameVertices += (arguments[countArg] | 0) * instances;
			return original.apply(gl, arguments);
		};
	}
}

/**
 * Build the overlay element
 */
function makeOverlay() {
	_overlay = document.createElement('div');
	_overlay.id = 'roPerfOverlay';
	_overlay.style.cssText =
		'position:fixed;top:4px;right:4px;z-index:100000;pointer-events:none;' +
		'font:11px/1.3 monospace;color:#cfc;background:rgba(0,0,0,0.6);padding:3px 6px;white-space:pre;';
	document.body.appendChild(_overlay);
	_overlayTimer = setInterval(updateOverlay, 500);
}

/**
 * Refresh the overlay from the last second of frames
 */
function updateOverlay() {
	if (!_overlay) {
		return;
	}
	const now = performance.now();
	let frames = 0;
	let work = 0;
	let worst = 0;
	let draws = 0;
	let elapsed = 0;
	for (let k = _total - 1; k >= Math.max(0, _total - MAX_FRAMES) && elapsed < 1000; --k) {
		const i = k % MAX_FRAMES;
		frames++;
		elapsed += _interval[i];
		work += _work[i];
		draws += _draws[i];
		worst = Math.max(worst, _interval[i]);
	}
	const last = _marks.maps[_marks.maps.length - 1];
	_overlay.textContent =
		(frames ? Math.round((frames * 1000) / Math.max(elapsed, 1)) : 0) +
		' fps  ' +
		(frames ? (elapsed / frames).toFixed(1) : '-') +
		' ms (max ' +
		worst.toFixed(0) +
		')\n' +
		'work ' +
		(frames ? (work / frames).toFixed(1) : '-') +
		' ms  draws ' +
		(frames ? Math.round(draws / frames) : 0) +
		'\n' +
		(last ? last.map + ' load ' + Math.round(last.loadMs) + ' ms' : '') +
		(_marks.login !== null ? '  login ' + Math.round(_marks.login) + ' ms' : '') +
		(now - _lastFrameStart > 1000 ? '\n(no frames)' : '');
}

class PerfProbe {
	/**
	 * @type {boolean} set by the first attach() when the configuration has
	 * `perfProbe: true`
	 */
	static enabled = false;

	/**
	 * Called by Renderer.init: switch the probe on if the configuration asks
	 * for it, and count draw calls on this context (once per context)
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	static attach(gl) {
		if (!PerfProbe.enabled) {
			if (!Configs.get('perfProbe', false)) {
				return;
			}
			PerfProbe.enabled = true;
			PerfProbe.reset();
		}
		if (!gl || _gl === gl) {
			return;
		}
		_gl = gl;
		wrapContext(gl);
		if (!_overlay && _overlayWanted) {
			makeOverlay();
		}
	}

	/**
	 * Called by the render loop before a frame's work
	 *
	 * @param {number} now rAF timestamp
	 */
	static frameStart(now) {
		_frameStart = performance.now();
		_frameTime = now;
		_pending = _lastFrameStart ? now - _lastFrameStart : 0;
		_lastFrameStart = now;
		_frameDraws = 0;
		_frameVertices = 0;
	}

	/**
	 * Called by the render loop after a frame's work
	 */
	static frameEnd() {
		if (!_frameStart) {
			return;
		}
		// The first frame of a window has no interval: it is not stored
		if (_pending > 0) {
			const i = _total % MAX_FRAMES;
			_interval[i] = _pending;
			_work[i] = performance.now() - _frameStart;
			_draws[i] = _frameDraws;
			_totalVertices += _frameVertices;
			if (_pending > SLOW_MS) {
				logSlow(_pending, _work[i], _frameDraws);
			}
			_total++;
			_pending = 0;
		}
		if (_mapReady) {
			const map = _marks.maps[_marks.maps.length - 1];
			map.firstFrameMs = Math.round((performance.now() - _mapStart) * 10) / 10;
			_mapReady = 0;
		}
	}

	/**
	 * A map started loading
	 *
	 * @param {string} name
	 */
	static mapStart(name) {
		_mapStart = performance.now();
		_mapName = name;
		// The render loop stops while a map loads: that gap is not a frame
		_lastFrameStart = 0;
	}

	/**
	 * Called by Renderer.stop: the pause until the loop starts again is not a
	 * frame, so the first frame after it only sets the clock
	 */
	static stop() {
		_lastFrameStart = 0;
		_pending = 0;
	}

	/**
	 * A map finished loading and is about to be drawn
	 */
	static mapReady() {
		if (!_mapStart) {
			return;
		}
		_marks.maps.push({
			map: _mapName,
			loadMs: Math.round((performance.now() - _mapStart) * 10) / 10,
			firstFrameMs: null
		});
		_mapReady = 1;
	}

	/**
	 * The login window was shown; the first time is the startup time
	 */
	static loginShown() {
		if (_marks.login === null) {
			_marks.login = Math.round(performance.now());
		}
	}

	/**
	 * Start a new measurement window: frames, slow frames and map marks.
	 * The login mark is kept, since it is the startup time and happens once.
	 */
	static reset() {
		_total = 0;
		_pending = 0;
		_lastFrameStart = 0;
		_totalVertices = 0;
		_slow.length = 0;
		_slowTotal = 0;
		_marks.maps.length = 0;
		_mapReady = 0;
		_windowStart = performance.now();
		try {
			performance.clearMeasures('roPerf slow frame');
		} catch (_e) {
			// no User Timing
		}
	}

	/**
	 * Frame statistics since the last reset
	 *
	 * @return {object}
	 */
	static stats() {
		const seconds = (performance.now() - _windowStart) / 1000;
		const kept = Math.min(_total, MAX_FRAMES);
		const draws = summarize(_draws, kept);
		let hitches = 0;
		let drawing = 0; // ms between frames, without map loads and other pauses
		for (let i = 0; i < kept; ++i) {
			drawing += _interval[i];
			if (_interval[i] > HITCH_MS) {
				hitches++;
			}
		}
		const memory = performance.memory;
		return {
			frames: _total,
			kept,
			seconds: Math.round(seconds * 10) / 10,
			drawingSeconds: Math.round(drawing / 100) / 10,
			// From the kept frames' intervals, so map loads and pauses do not lower it
			fps: kept ? Math.round(((kept * 1000) / Math.max(drawing, 0.001)) * 10) / 10 : 0,
			frameMs: summarize(_interval, kept),
			workMs: summarize(_work, kept),
			drawCalls: draws,
			verticesPerFrame: _total ? Math.round(_totalVertices / _total) : 0,
			hitches,
			slowFrames: _slowTotal,
			heapMB: memory ? Math.round(memory.usedJSHeapSize / 1048576) : null,
			marks: JSON.parse(JSON.stringify(_marks))
		};
	}

	/**
	 * The first 1000 frames slower than 33 ms since the last reset: when the
	 * gap started (performance.now() time), its length, and the frame's work
	 * and draws. stats().slowFrames counts them all.
	 *
	 * @return {Array}
	 */
	static slowFrames() {
		return _slow.slice();
	}

	/**
	 * Show or hide the overlay
	 *
	 * @param {boolean} show
	 */
	static overlay(show) {
		_overlayWanted = !!show;
		if (show && !_overlay && _gl) {
			makeOverlay();
		} else if (!show && _overlay) {
			clearInterval(_overlayTimer);
			_overlay.remove();
			_overlay = null;
		}
	}
}

/**
 * Export
 */
export default PerfProbe;
