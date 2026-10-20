/**
 * Renderer/SpriteBatch.js
 *
 * Draws the entity pass's sprites in a few instanced draw calls instead of
 * one call (and a dozen uniform uploads) per sprite layer.
 *
 * While a batch is open, SpriteRenderer.render() records each sprite instead
 * of drawing it: its per-sprite values go into an instance buffer, and the
 * state it was drawn with (texture, palette, blend, depth) decides whether it
 * extends the previous run or starts a new one. flush() then draws each run
 * with one drawArraysInstanced, in the order the sprites were recorded, so
 * blending and depth come out as they did one sprite at a time.
 *
 * Two things make consecutive sprites share a run:
 * - every frame of every sprite file, and every palette, is packed into the
 *   textures of SpriteAtlas, which each sprite picks from with its own
 *   instance values, so the body, head, headgear and weapon of a player, each
 *   a file of its own with a palette of its own, and the next player, are
 *   drawn from the same textures;
 * - shadows are recorded into a queue of their own, drawn before everything
 *   else. A shadow writes no depth and lies on the ground, so drawing them
 *   first only changes one thing: a body standing behind another entity is
 *   drawn over that entity's shadow, as it stands in front of that ground.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import glMatrix from 'Utils/gl-matrix.js';
import SpriteAtlas from './SpriteAtlas.js';
import _vertexShader from './SpriteBatch.vs?raw';
import _fragmentShader from './SpriteBatch.fs?raw';

const mat4 = glMatrix.mat4;

/**
 * Floats per sprite in the instance buffer:
 *  0- 3 position xyz, zIndex
 *  4- 7 offset xy, size xy (world units)
 *  8-11 color
 * 12-15 texture rectangle (u0, v0, u1, v1)
 * 16-19 angle, depth, shadow, ignoreDepthMinCap (0 or 1)
 * 20-23 source (see below), atlas layer, palette row, padding
 *
 * The source is where the sprite's pixels are: SOURCE_OWN its own texture
 * (the run's), SOURCE_INDEX or SOURCE_RGBA the atlas. The palette row is the
 * palette's row in the atlas, PALETTE_NONE for RGBA, or PALETTE_OWN for the
 * run's own palette texture.
 */
const FLOATS = 24;
const STRIDE = FLOATS * 4;

/**
 * @const {number} sources and palettes, as the shaders read them
 */
const SOURCE_OWN = 0;
const SOURCE_INDEX = 1;
const SOURCE_RGBA = 2;
const PALETTE_NONE = -1;
const PALETTE_OWN = -2;

/**
 * @const {number} queue ids
 */
const QUEUE_SHADOW = 0;
const QUEUE_MAIN = 1;

/**
 * One queue of recorded sprites, and its runs.
 */
class Queue {
	constructor() {
		this.data = new Float32Array(FLOATS * 256);
		this.count = 0;
		this.runs = [];
		this.runCount = 0;
	}

	reserve() {
		if ((this.count + 1) * FLOATS > this.data.length) {
			const data = new Float32Array(this.data.length * 2);
			data.set(this.data);
			this.data = data;
		}
		return this.count++ * FLOATS;
	}

	clear() {
		this.count = 0;
		this.runCount = 0;
	}
}

/**
 * The state a sprite was drawn with. Sprites in one run share all of it.
 */
class Run {
	constructor() {
		this.start = 0;
		this.count = 0;
		this.texture = null;
		this.palette = null;
		this.textSizeX = 0;
		this.textSizeY = 0;
		this.blendOne = null; // null: whatever blend was set before the pass
		this.depthTest = true;
		this.depthMask = true;
		this.noCorrection = false;
	}
}

let _gl = null;
let _program = null;
let _vao = null;
let _quad = null;
let _instanceBuffer = null;
let _upload = new Float32Array(0);
let _active = false;

const _queues = [new Queue(), new Queue()];

// The frame's uniforms, captured by setFrame()
const _modelView = new Float32Array(16);
const _viewModel = new Float32Array(16);
const _projection = new Float32Array(16);
const _fogColor = new Float32Array(3);
const _frame = { fogUse: false, fogNear: 0, fogFar: 0, zoom: 1 };

// The GL state at open(), and as flush() leaves it
const _glState = { depthTest: true, depthMask: true, blendOne: null };

/**
 * Create the program, the quad and the vertex array. The batch keeps its own
 * quad (the same one SpriteRenderer draws), so a context restore rebuilds it
 * here whatever SpriteRenderer holds.
 *
 * @param {WebGL2RenderingContext} gl
 */
function init(gl) {
	_gl = gl;
	_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
	_quad = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, _quad);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([-0.5, +0.5, 0.0, 0.0, +0.5, +0.5, 1.0, 0.0, -0.5, -0.5, 0.0, 1.0, +0.5, -0.5, 1.0, 1.0]),
		gl.STATIC_DRAW
	);
	_instanceBuffer = gl.createBuffer();
	_vao = gl.createVertexArray();

	const attribute = _program.attribute;
	gl.bindVertexArray(_vao);

	gl.bindBuffer(gl.ARRAY_BUFFER, _quad);
	gl.enableVertexAttribArray(attribute.aPosition);
	gl.vertexAttribPointer(attribute.aPosition, 2, gl.FLOAT, false, 4 * 4, 0);
	gl.enableVertexAttribArray(attribute.aTextureCoord);
	gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

	gl.bindBuffer(gl.ARRAY_BUFFER, _instanceBuffer);
	for (const name of ['aPositionZIndex', 'aOffsetSize', 'aColor', 'aUV', 'aAngleDepthShadowCap', 'aSource']) {
		gl.enableVertexAttribArray(attribute[name]);
		gl.vertexAttribDivisor(attribute[name], 1);
	}
	pointInstances(0);

	gl.bindVertexArray(null);
}

/**
 * Point the instance attributes at a run's first sprite (WebGL 2 has no
 * base instance, so each run moves the pointers instead).
 *
 * @param {number} first - index of the run's first sprite in the buffer
 */
function pointInstances(first) {
	const gl = _gl;
	const attribute = _program.attribute;
	const base = first * STRIDE;

	gl.vertexAttribPointer(attribute.aPositionZIndex, 4, gl.FLOAT, false, STRIDE, base);
	gl.vertexAttribPointer(attribute.aOffsetSize, 4, gl.FLOAT, false, STRIDE, base + 4 * 4);
	gl.vertexAttribPointer(attribute.aColor, 4, gl.FLOAT, false, STRIDE, base + 8 * 4);
	gl.vertexAttribPointer(attribute.aUV, 4, gl.FLOAT, false, STRIDE, base + 12 * 4);
	gl.vertexAttribPointer(attribute.aAngleDepthShadowCap, 4, gl.FLOAT, false, STRIDE, base + 16 * 4);
	gl.vertexAttribPointer(attribute.aSource, 3, gl.FLOAT, false, STRIDE, base + 20 * 4);
}

/**
 * Sprite batch namespace
 */
class SpriteBatch {
	/**
	 * @type {boolean} set false to draw every sprite on its own (Config `spriteBatching`)
	 */
	static enabled = true;

	/**
	 * @type {number} queue ids, for record()
	 */
	static SHADOW = QUEUE_SHADOW;
	static MAIN = QUEUE_MAIN;

	/**
	 * @type {number} sources and palettes, for the sprite's instance values
	 */
	static SOURCE_OWN = SOURCE_OWN;
	static SOURCE_INDEX = SOURCE_INDEX;
	static SOURCE_RGBA = SOURCE_RGBA;
	static PALETTE_NONE = PALETTE_NONE;
	static PALETTE_OWN = PALETTE_OWN;

	/**
	 * @returns {boolean} a batch is open: SpriteRenderer records instead of drawing
	 */
	static get active() {
		return _active;
	}

	/**
	 * Capture the uniforms SpriteRenderer.bind3DContext set, for the runs
	 * recorded after it.
	 */
	static setFrame(modelView, projection, fog, zoom) {
		_modelView.set(modelView);
		_projection.set(projection);
		mat4.invert(_viewModel, _modelView);
		_frame.fogUse = !!(fog.use && fog.exist);
		_frame.fogNear = fog.near;
		_frame.fogFar = fog.far;
		_fogColor.set(fog.color);
		_frame.zoom = zoom;
	}

	/**
	 * Start recording.
	 *
	 * @param {WebGL2RenderingContext} gl
	 * @param {object} state - the GL state now: { depthTest, depthMask }
	 * @returns {boolean} whether recording started
	 */
	static open(gl, state) {
		if (!SpriteBatch.enabled || _active || typeof gl.drawArraysInstanced !== 'function') {
			return false;
		}
		if (!_program || _gl !== gl) {
			init(gl);
		}
		SpriteAtlas.init(gl);
		SpriteAtlas.recyclePalettes();
		_glState.depthTest = state.depthTest;
		_glState.depthMask = state.depthMask;
		_glState.blendOne = null;
		_active = true;
		return true;
	}

	/**
	 * Forget the GL state flush() left: something else drew since.
	 */
	static invalidate() {
		_glState.depthTest = null;
		_glState.depthMask = null;
		_glState.blendOne = null;
	}

	/**
	 * Draw what was recorded and stop recording.
	 *
	 * @param {object} state - the GL state recording left: { depthTest, depthMask, blendOne }
	 */
	static close(state) {
		if (!_active) {
			return;
		}
		SpriteBatch.flush(state);
		_active = false;
	}

	/**
	 * Where a frame is in the shared atlas, packing its sprite file on first use.
	 *
	 * @param {object} spr - compiled sprite file
	 * @param {object} frame - one of spr.frames
	 * @returns {object|null} { rgba, layer, u0, v0, u1, v1 }
	 */
	static atlasFor(spr, frame) {
		return SpriteAtlas.frame(spr, frame);
	}

	/**
	 * The atlas row of a palette, or -1 when it has to stay on its own texture.
	 *
	 * @param {WebGLTexture} texture - the palette's texture
	 * @param {Uint8Array} data - its colours
	 * @returns {number}
	 */
	static paletteRow(texture, data) {
		return SpriteAtlas.paletteRow(texture, data);
	}

	/**
	 * Forget every GPU object made on the lost context. The context object
	 * stays the same after a restore, so the next open() would otherwise
	 * keep using them. Call from Renderer.onContextRestored.
	 */
	static contextRestored() {
		_gl = null;
		_program = null;
		_vao = null;
		_quad = null;
		_instanceBuffer = null;
		_active = false;
		_queues[QUEUE_SHADOW].clear();
		_queues[QUEUE_MAIN].clear();
		SpriteAtlas.contextRestored();
	}

	/**
	 * Record one sprite. Returns the offset in the queue's data where the
	 * caller writes the sprite's FLOATS values.
	 *
	 * @param {number} queue - SpriteBatch.SHADOW or SpriteBatch.MAIN
	 * @param {WebGLTexture|null} texture - the sprite's own texture, null when it is in the atlas
	 * @param {WebGLTexture|null} palette - its own palette texture (PALETTE_OWN), or null
	 * @param {number} textSizeX - uTextSize, for its own texture and palette
	 * @param {number} textSizeY
	 * @param {boolean|null} blendOne - additive blend, or null for unchanged
	 * @param {boolean} depthTest
	 * @param {boolean} depthMask
	 * @param {boolean} noCorrection - disable the depth correction
	 * @returns {Float32Array} data; write the sprite at SpriteBatch.offset
	 */
	static record(queue, texture, palette, textSizeX, textSizeY, blendOne, depthTest, depthMask, noCorrection) {
		const q = _queues[queue];
		let run = q.runCount ? q.runs[q.runCount - 1] : null;

		if (
			!run ||
			run.texture !== texture ||
			run.palette !== palette ||
			(texture && palette && (run.textSizeX !== textSizeX || run.textSizeY !== textSizeY)) ||
			run.blendOne !== blendOne ||
			run.depthTest !== depthTest ||
			run.depthMask !== depthMask ||
			run.noCorrection !== noCorrection
		) {
			run = q.runs[q.runCount] || (q.runs[q.runCount] = new Run());
			q.runCount++;
			run.start = q.count;
			run.count = 0;
			run.texture = texture;
			run.palette = palette;
			run.textSizeX = textSizeX;
			run.textSizeY = textSizeY;
			run.blendOne = blendOne;
			run.depthTest = depthTest;
			run.depthMask = depthMask;
			run.noCorrection = noCorrection;
		}

		run.count++;
		SpriteBatch.offset = q.reserve();
		return q.data;
	}

	/**
	 * @type {number} where record() put the sprite in the returned data
	 */
	static offset = 0;

	/**
	 * Draw everything recorded so far: the shadows, then the rest.
	 *
	 * @param {object} state - the GL state to leave behind: { depthTest, depthMask, blendOne }
	 * @returns {number} draw calls made
	 */
	static flush(state) {
		const shadow = _queues[QUEUE_SHADOW];
		const main = _queues[QUEUE_MAIN];
		const total = shadow.count + main.count;

		if (!_active || !total) {
			return 0;
		}

		const gl = _gl;
		const uniform = _program.uniform;

		// One upload for both queues
		if (_upload.length < total * FLOATS) {
			_upload = new Float32Array(total * FLOATS * 2);
		}
		_upload.set(shadow.data.subarray(0, shadow.count * FLOATS), 0);
		_upload.set(main.data.subarray(0, main.count * FLOATS), shadow.count * FLOATS);

		// A fresh store each time (bufferData, not bufferSubData): writing into
		// the one the previous frame's draws still read makes the driver wait.
		gl.bindBuffer(gl.ARRAY_BUFFER, _instanceBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, _upload, gl.STREAM_DRAW, 0, total * FLOATS);

		gl.useProgram(_program);
		gl.bindVertexArray(_vao);

		gl.uniformMatrix4fv(uniform.uProjectionMat, false, _projection);
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, _modelView);
		gl.uniformMatrix4fv(uniform.uViewModelMat, false, _viewModel);
		gl.uniform1f(uniform.uCameraZoom, _frame.zoom);
		gl.uniform1i(uniform.uFogUse, _frame.fogUse);
		gl.uniform1f(uniform.uFogNear, _frame.fogNear);
		gl.uniform1f(uniform.uFogFar, _frame.fogFar);
		gl.uniform3fv(uniform.uFogColor, _fogColor);
		gl.uniform1i(uniform.uDiffuse, 0);
		gl.uniform1i(uniform.uPalette, 1);
		gl.uniform1i(uniform.uIndexAtlas, SpriteAtlas.UNIT_INDEX);
		gl.uniform1i(uniform.uRGBAAtlas, SpriteAtlas.UNIT_RGBA);
		gl.uniform1i(uniform.uPaletteAtlas, SpriteAtlas.UNIT_PALETTES);

		const atlas = SpriteAtlas.textures;
		gl.uniform2f(uniform.uIndexAtlasSize, atlas.indexSize, atlas.indexSize);
		gl.activeTexture(gl.TEXTURE0 + SpriteAtlas.UNIT_INDEX);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlas.index);
		gl.activeTexture(gl.TEXTURE0 + SpriteAtlas.UNIT_RGBA);
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlas.rgba);
		gl.activeTexture(gl.TEXTURE0 + SpriteAtlas.UNIT_PALETTES);
		gl.bindTexture(gl.TEXTURE_2D, atlas.palettes);
		gl.activeTexture(gl.TEXTURE0);

		let noCorrection = null,
			texture = null,
			textSizeX = -1,
			textSizeY = -1,
			palette = null,
			draws = 0;

		const play = (queue, base) => {
			for (let r = 0; r < queue.runCount; r++) {
				const run = queue.runs[r];

				if (run.depthTest !== _glState.depthTest) {
					_glState.depthTest = run.depthTest;
					if (run.depthTest) {
						gl.enable(gl.DEPTH_TEST);
					} else {
						gl.disable(gl.DEPTH_TEST);
					}
				}
				if (run.depthMask !== _glState.depthMask) {
					gl.depthMask((_glState.depthMask = run.depthMask));
				}
				if (run.blendOne !== null && run.blendOne !== _glState.blendOne) {
					_glState.blendOne = run.blendOne;
					gl.blendFunc(gl.SRC_ALPHA, run.blendOne ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
				}
				if (run.noCorrection !== noCorrection) {
					gl.uniform1i(uniform.uDisableDepthCorrection, (noCorrection = run.noCorrection));
				}

				// A run in the atlas binds nothing: the atlas is bound already
				if (run.palette !== null && run.palette !== palette) {
					gl.activeTexture(gl.TEXTURE1);
					gl.bindTexture(gl.TEXTURE_2D, (palette = run.palette));
					gl.activeTexture(gl.TEXTURE0);
				}
				if (run.texture !== null) {
					if (run.palette !== null && (run.textSizeX !== textSizeX || run.textSizeY !== textSizeY)) {
						gl.uniform2f(uniform.uTextSize, (textSizeX = run.textSizeX), (textSizeY = run.textSizeY));
					}
					if (run.texture !== texture) {
						gl.bindTexture(gl.TEXTURE_2D, (texture = run.texture));
					}
				}

				pointInstances(base + run.start);
				gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, run.count);
				draws++;
			}
		};

		play(shadow, 0);
		play(main, shadow.count);

		gl.bindVertexArray(null);
		shadow.clear();
		main.clear();

		// Leave the state recording ended in, for whatever draws next
		if (state.depthTest !== _glState.depthTest) {
			_glState.depthTest = state.depthTest;
			if (state.depthTest) {
				gl.enable(gl.DEPTH_TEST);
			} else {
				gl.disable(gl.DEPTH_TEST);
			}
		}
		if (state.depthMask !== _glState.depthMask) {
			gl.depthMask((_glState.depthMask = state.depthMask));
		}
		if (state.blendOne !== null && state.blendOne !== _glState.blendOne) {
			_glState.blendOne = state.blendOne;
			gl.blendFunc(gl.SRC_ALPHA, state.blendOne ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
		}

		return draws;
	}
}

/**
 * Export
 */
export default SpriteBatch;
