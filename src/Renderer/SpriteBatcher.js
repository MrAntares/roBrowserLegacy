/**
 * Renderer/SpriteBatcher.js
 *
 * Instanced sprite rendering batcher (WebGL2).
 *
 * @Author AoShinHo
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Camera from './Camera.js';
import TextureArrayManager from './TextureArrayManager.js';
import _vertexShader from './SpriteBatcher.vs?raw';
import _fragmentShader from './SpriteBatcher.fs?raw';

// ---- Layout ---------------------------------------------------------------

export const FLOATS_PER_INSTANCE = 19;
export const BYTES_PER_INSTANCE = FLOATS_PER_INSTANCE * 4;

const OFF_POSITION = 0; // vec3
const OFF_COLOR = 3; // vec4
const OFF_SIZE = 7; // vec2
const OFF_OFFSET = 9; // vec2
const OFF_ZINDEX = 11; // float
const OFF_DEPTH = 12; // float
const OFF_SHADOW = 13; // float
const OFF_ANGLE = 14; // float
const OFF_FLAGS = 15; // float -> int
const OFF_TEXTSIZE = 16; // vec2
const OFF_PALETTE_LAYER = 18; // float

export const FLAG_USE_PAL = 1 << 1;
export const FLAG_DISABLE_DEPTH_CORRECTION = 1 << 2;
export const FLAG_IGNORE_ZINDEX_CAP = 1 << 3;

// Kept for back-compat: external code may still import these.
// New callers should pass the GLenum dst factor directly to addSprite.
export const BLEND_DEFAULT = 0;
export const BLEND_ONE = 1;

const DEFAULT_MAX_INSTANCES = 2048;

// Palette textures are 256x1 (256 RGBA entries).
const PALETTE_LAYER_WIDTH = 256;
const PALETTE_LAYER_HEIGHT = 1;
const PALETTE_INITIAL_CAP = 32;
const PALETTE_MAX_CAP = 128;

// ---- Class ----------------------------------------------------------------

class SpriteBatcher {
	constructor(maxInstances = DEFAULT_MAX_INSTANCES) {
		this._maxInstances = maxInstances;
		this._data = new Float32Array(maxInstances * FLOATS_PER_INSTANCE);
		this._count = 0;

		this._gl = null;
		this._program = null;
		this._quadBuffer = null;
		this._instanceBuffer = null;
		this._vao = null;
		this._attributes = null;
		this._uniforms = null;

		this._paletteManager = null;

		// Pending batch identity. Palettes no longer participate in the key
		// (they live in a texture array); only the diffuse texture does.
		this._texture = null;
		// _blendDst holds the WebGL destination blend factor GLenum for the
		// current in-flight batch. It is resolved at addSprite time and emitted
		// unconditionally in flush — no caching, because external code (Level99Bubble,
		// SpiritSphere, SwirlingAura, …) calls gl.blendFunc directly and would
		// desync any cache we tried to keep.
		this._blendDst = null; // null = not yet initialised; resolved to ONE_MINUS_SRC_ALPHA on first add

		this._depthTest = true;
		this._depthMask = true;

		// Cached GL state (blend intentionally not cached — see _blendDst comment)
		this._glDepthTest = null;
		this._glDepthMask = null;
	}

	get count() {
		return this._count;
	}
	get hasPending() {
		return this._count > 0;
	}

	init(gl) {
		const alive = !!this._program && gl.isProgram(this._program) && gl.isVertexArray(this._vao);
		if (this._gl === gl && alive) return;
		if (!alive) {
			// Context lost/restored: handles are dead, nothing to delete.
			this._program = this._paletteManager = null;
			this._quadBuffer = this._instanceBuffer = this._vao = null;
			this._glDepthTest = this._glDepthMask = null;
			this._count = 0;
		}
		this._gl = gl;

		if (!this._program) {
			this._program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
			this._attributes = this._program.attribute;
			this._uniforms = this._program.uniform;
		}

		if (!this._paletteManager) {
			this._paletteManager = new TextureArrayManager(gl, {
				layerWidth: PALETTE_LAYER_WIDTH,
				layerHeight: PALETTE_LAYER_HEIGHT,
				initialCapacity: PALETTE_INITIAL_CAP,
				maxCapacity: PALETTE_MAX_CAP
			});
			// Reserve layer 0 as an identity dummy for non-palette sprites.
			// The shader skips the palette lookup when FLAG_USE_PAL is clear,
			// but a valid layer 0 removes any chance of sampling uninitialized data.
			const identity = new Uint8Array(PALETTE_LAYER_WIDTH * PALETTE_LAYER_HEIGHT * 4);
			for (let i = 0; i < PALETTE_LAYER_WIDTH; i++) identity[i * 4 + 3] = 255;
			this._paletteManager.reserveLayer(identity, PALETTE_LAYER_WIDTH, PALETTE_LAYER_HEIGHT);
		}

		if (!this._quadBuffer) {
			this._quadBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([
					-0.5, +0.5, 0.0, 0.0, +0.5, +0.5, 1.0, 0.0, -0.5, -0.5, 0.0, 1.0, +0.5, -0.5, 1.0, 1.0
				]),
				gl.STATIC_DRAW
			);
		}

		if (!this._instanceBuffer) {
			this._instanceBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this._instanceBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this._data.byteLength, gl.DYNAMIC_DRAW);
		}

		if (!this._vao) {
			this._vao = gl.createVertexArray();
			gl.bindVertexArray(this._vao);

			const attr = this._attributes;

			gl.bindBuffer(gl.ARRAY_BUFFER, this._quadBuffer);
			gl.enableVertexAttribArray(attr.aPosition);
			gl.vertexAttribPointer(attr.aPosition, 2, gl.FLOAT, false, 4 * 4, 0);
			gl.vertexAttribDivisor(attr.aPosition, 0);

			gl.enableVertexAttribArray(attr.aTextureCoord);
			gl.vertexAttribPointer(attr.aTextureCoord, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
			gl.vertexAttribDivisor(attr.aTextureCoord, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, this._instanceBuffer);

			const setInst = (loc, size, offsetFloats) => {
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, size, gl.FLOAT, false, BYTES_PER_INSTANCE, offsetFloats * 4);
				gl.vertexAttribDivisor(loc, 1);
			};

			setInst(attr.iPosition, 3, OFF_POSITION);
			setInst(attr.iColor, 4, OFF_COLOR);
			setInst(attr.iSize, 2, OFF_SIZE);
			setInst(attr.iOffset, 2, OFF_OFFSET);
			setInst(attr.iZindex, 1, OFF_ZINDEX);
			setInst(attr.iDepth, 1, OFF_DEPTH);
			setInst(attr.iShadow, 1, OFF_SHADOW);
			setInst(attr.iAngle, 1, OFF_ANGLE);
			setInst(attr.iFlags, 1, OFF_FLAGS);
			setInst(attr.iTextSize, 2, OFF_TEXTSIZE);
			setInst(attr.iPaletteLayer, 1, OFF_PALETTE_LAYER);

			gl.bindVertexArray(null);
		}
	}

	bindGlobals(gl, modelView, projection, viewModel, fog) {
		const uniform = this._uniforms;
		gl.useProgram(this._program);

		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uViewModelMat, false, viewModel);

		gl.uniform1f(uniform.uCameraZoom, Camera.zoom);
		gl.uniform1f(uniform.uCameraLatitude, Camera.getLatitude());

		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		gl.uniform1i(uniform.uDiffuse, 0);
		gl.uniform1i(uniform.uPaletteArray, 1);

		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this._paletteManager.texture);
		gl.activeTexture(gl.TEXTURE0);
	}

	applyDepthState(gl, depthTest, depthMask) {
		if (this._glDepthTest !== depthTest) {
			this._glDepthTest = depthTest;
			if (depthTest) gl.enable(gl.DEPTH_TEST);
			else gl.disable(gl.DEPTH_TEST);
		}
		if (this._glDepthMask !== depthMask) {
			this._glDepthMask = depthMask;
			gl.depthMask(depthMask);
		}
	}

	addSprite(gl, state, blendDst, depthTest, depthMask) {
		if (depthTest === undefined) depthTest = false;
		if (depthMask === undefined) depthMask = false;

		// --- Blend dst factor ---------------------------------------------
		// blendDst is a WebGL destination GLenum (e.g. gl.ONE, gl.ONE_MINUS_SRC_ALPHA).
		// undefined / null / false → default (ONE_MINUS_SRC_ALPHA).
		// true is accepted for back-compat (callers that haven't been migrated yet) → gl.ONE.
		let blendMode;
		if (blendDst === true) {
			blendMode = gl.ONE; // legacy boolean path
		} else if (typeof blendDst === 'number') {
			blendMode = blendDst; // real GLenum
		} else {
			blendMode = gl.ONE_MINUS_SRC_ALPHA; // default
		}

		const nextTexture = state.image.texture;

		// --- Palette layer (non-array palette sprites only) ----------------
		let paletteLayer = 0;
		if (state.image.palette) {
			// Same invariant as the sprite-array path above: if the palette
			// array is at max capacity, the next allocation will evict a live
			// layer. That layer may still be referenced by instances already
			// queued in _data, so flush before evicting.
			if (this._count > 0 && this._paletteManager.atCapacity && !this._paletteManager.has(state.image.palette)) {
				this.flush(gl);
			}
			const palEntry = this._paletteManager.getLayer(
				state.image.palette,
				PALETTE_LAYER_WIDTH,
				PALETTE_LAYER_HEIGHT
			);
			if (palEntry) paletteLayer = palEntry.layer;
		}

		const blendChanged = blendMode !== this._blendDst;
		const depthChanged = depthTest !== this._depthTest || depthMask !== this._depthMask;
		const textureChanged = this._count > 0 && nextTexture !== this._texture;

		// --- Flush if needed -----------------------------------------------
		if (this._count > 0 && (blendChanged || depthChanged || textureChanged)) {
			this.flush(gl);
		}

		this._blendDst = blendMode;
		this._depthTest = depthTest;
		this._depthMask = depthMask;
		this._texture = nextTexture;

		if (this._count >= this._maxInstances) this.flush(gl);

		// --- Write instance ------------------------------------------------
		const off = this._count * FLOATS_PER_INSTANCE;
		const d = this._data;

		d[off + OFF_POSITION + 0] = state.position[0];
		d[off + OFF_POSITION + 1] = state.position[1];
		d[off + OFF_POSITION + 2] = state.position[2];

		d[off + OFF_COLOR + 0] = state.color[0];
		d[off + OFF_COLOR + 1] = state.color[1];
		d[off + OFF_COLOR + 2] = state.color[2];
		d[off + OFF_COLOR + 3] = state.color[3];

		const INV_175 = 1 / 175.0;
		const xs = state.xSize;
		const ys = state.ySize;

		d[off + OFF_SIZE + 0] = state.size[0] * INV_175 * xs;
		d[off + OFF_SIZE + 1] = state.size[1] * INV_175 * ys;
		d[off + OFF_OFFSET + 0] = state.offset[0] * INV_175 * xs;
		d[off + OFF_OFFSET + 1] = state.offset[1] * INV_175 * ys - 0.5;

		d[off + OFF_ZINDEX] = state.zIndex++;
		d[off + OFF_DEPTH] = state.depth;
		d[off + OFF_SHADOW] = state.shadow;
		d[off + OFF_ANGLE] = state.angle;

		let flags = 0;
		if (state.image.palette) flags |= FLAG_USE_PAL;
		if (state.disableDepthCorrection) flags |= FLAG_DISABLE_DEPTH_CORRECTION;
		if (state.ignoreDepthMinCap) flags |= FLAG_IGNORE_ZINDEX_CAP;
		d[off + OFF_FLAGS] = flags;

		d[off + OFF_TEXTSIZE + 0] = state.image.size[0];
		d[off + OFF_TEXTSIZE + 1] = state.image.size[1];

		d[off + OFF_PALETTE_LAYER] = paletteLayer;

		this._count++;
	}

	flush(gl /*, state */) {
		if (this._count === 0) return;
		gl.useProgram(this._program);

		// Depth state first: applyDepthState is a no-op if the cached GL state matches.
		this.applyDepthState(gl, this._depthTest, this._depthMask);

		// --- Blend --------------------------------------------------------
		// Always emitted — never cached. External effects call gl.blendFunc
		// directly (Level99Bubble, SpiritSphere, SwirlingAura, …) and would
		// desync any cache. The cost of one blendFunc per flush is negligible.
		gl.blendFunc(gl.SRC_ALPHA, this._blendDst ?? gl.ONE_MINUS_SRC_ALPHA);

		// --- Upload -------------------------------------------------------
		gl.bindBuffer(gl.ARRAY_BUFFER, this._instanceBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._data, 0, this._count * FLOATS_PER_INSTANCE);

		// --- Textures -----------------------------------------------------
		// Rebind every flush so a mid-batch grow (which replaces the manager
		// texture) is picked up immediately.
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this._paletteManager.texture);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._texture);

		// --- Draw ---------------------------------------------------------
		gl.bindVertexArray(this._vao);
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this._count);
		gl.bindVertexArray(null);

		// --- Reset --------------------------------------------------------
		this._count = 0;
		this._texture = null;
		this._blendDst = null;
	}

	reset() {
		this._count = 0;
		this._texture = null;
		this._blendDst = null;
	}

	dispose(gl) {
		if (this._paletteManager) this._paletteManager.dispose();
		if (this._vao) gl.deleteVertexArray(this._vao);
		if (this._quadBuffer) gl.deleteBuffer(this._quadBuffer);
		if (this._instanceBuffer) gl.deleteBuffer(this._instanceBuffer);
		if (this._program) gl.deleteProgram(this._program);

		this._paletteManager = null;
		this._vao = null;
		this._quadBuffer = null;
		this._instanceBuffer = null;
		this._program = null;
		this._gl = null;
		this._count = 0;
	}
}

export default SpriteBatcher;
