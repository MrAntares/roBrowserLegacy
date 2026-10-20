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
 * - every frame of a sprite file is packed into one atlas texture, so the
 *   layers of a wolf, and the next wolf, sample the same texture;
 * - shadows are recorded into a queue of their own, drawn before everything
 *   else. A shadow writes no depth and lies on the ground, so drawing them
 *   first only changes one thing: a body standing behind another entity is
 *   drawn over that entity's shadow, as it stands in front of that ground.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import glMatrix from 'Utils/gl-matrix.js';
import GraphicsSettings from 'Preferences/Graphics.js';
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
 */
const FLOATS = 20;
const STRIDE = FLOATS * 4;

/**
 * Widest atlas page; frames wider than this keep their own texture.
 */
const ATLAS_WIDTH = 2048;

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
let _generation = 0;

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
	_generation++;
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
	for (const name of ['aPositionZIndex', 'aOffsetSize', 'aColor', 'aUV', 'aAngleDepthShadowCap']) {
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
}

/**
 * Pack every frame of a sprite file into atlas pages, one set for palette
 * frames and one for RGBA frames. Each frame gets frame._atlas, the page and
 * its rectangle, or null when it does not fit (it then keeps its own
 * texture). A frame is surrounded by a copy of its edge pixels, so sampling
 * past its edge reads what CLAMP_TO_EDGE read on its own texture.
 *
 * @param {WebGL2RenderingContext} gl
 * @param {object} spr - a compiled sprite file (Client.loadFile)
 */
function buildAtlas(gl, spr) {
	const pages = [];
	spr._atlasPages = pages;
	spr._atlasGeneration = _generation;

	const maxSize = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096, 4096);
	const pageWidth = Math.min(ATLAS_WIDTH, maxSize);

	for (const type of [0, 1]) {
		const frames = [];
		for (let i = 0; i < spr.frames.length; i++) {
			const frame = spr.frames[i];
			if (!frame || !!frame.type !== !!type) {
				continue;
			}
			frame._atlas = null;
			if (frame.data && frame.width > 0 && frame.height > 0 && frame.width + 2 <= pageWidth) {
				frames.push(frame);
			}
		}
		if (!frames.length) {
			continue;
		}

		// Shelf packing, tallest first
		frames.sort((a, b) => b.height - a.height || b.width - a.width);

		let page = null;
		let x = 0,
			y = 0,
			shelf = 0;

		const closePage = () => {
			if (page) {
				page.height = y + shelf;
				pages.push(page);
			}
		};

		for (const frame of frames) {
			const w = frame.width + 2;
			const h = frame.height + 2;

			if (!page || x + w > pageWidth) {
				// next shelf
				y += shelf;
				x = 0;
				shelf = 0;
			}
			if (!page || y + h > maxSize) {
				closePage();
				page = { type, width: pageWidth, height: 0, frames: [] };
				x = 0;
				y = 0;
				shelf = 0;
			}

			page.frames.push({ frame, x: x + 1, y: y + 1 });
			x += w;
			shelf = Math.max(shelf, h);
		}
		closePage();
	}

	for (const page of pages) {
		uploadPage(gl, page);
	}
}

/**
 * Copy a page's frames, with their edge pixels repeated around them, and
 * send it to the GPU.
 */
function uploadPage(gl, page) {
	const width = page.width;
	const height = page.height;
	const rgba = page.type === 1;
	const pixels = rgba ? new Uint32Array(width * height) : new Uint8Array(width * height);

	for (const { frame, x, y } of page.frames) {
		const fw = frame.width;
		const fh = frame.height;
		const src = rgba ? new Uint32Array(frame.data.buffer, frame.data.byteOffset, fw * fh) : frame.data;

		for (let row = -1; row <= fh; row++) {
			const srcRow = Math.min(Math.max(row, 0), fh - 1) * fw;
			const dst = (y + row) * width + x;
			pixels[dst - 1] = src[srcRow];
			pixels.set(src.subarray(srcRow, srcRow + fw), dst);
			pixels[dst + fw] = src[srcRow + fw - 1];
		}

		frame._atlas = {
			page,
			u0: x / width,
			v0: y / height,
			u1: (x + fw) / width,
			v1: (y + fh) / height
		};
	}
	page.frames = null;

	const precision = GraphicsSettings.pixelPerfectSprites ? gl.NEAREST : rgba ? gl.LINEAR : gl.NEAREST;
	const format = rgba ? gl.RGBA : gl.LUMINANCE;

	page.texture = gl.createTexture();
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.bindTexture(gl.TEXTURE_2D, page.texture);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		format,
		width,
		height,
		0,
		format,
		gl.UNSIGNED_BYTE,
		rgba ? new Uint8Array(pixels.buffer) : pixels
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, precision);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, precision);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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
	 * The atlas rectangle of a frame, packing its sprite file on first use.
	 *
	 * @param {object} spr - compiled sprite file
	 * @param {object} frame - one of spr.frames
	 * @returns {object|null} { page: { texture, width, height }, u0, v0, u1, v1 }
	 */
	static atlasFor(spr, frame) {
		if (!spr._atlasPages || spr._atlasGeneration !== _generation) {
			buildAtlas(_gl, spr);
		}
		return frame._atlas || null;
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
	}

	/**
	 * Record one sprite. Returns the offset in the queue's data where the
	 * caller writes the sprite's FLOATS values.
	 *
	 * @param {number} queue - SpriteBatch.SHADOW or SpriteBatch.MAIN
	 * @param {WebGLTexture} texture
	 * @param {WebGLTexture|null} palette
	 * @param {number} textSizeX - uTextSize, for palette sprites
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
			(palette && (run.textSizeX !== textSizeX || run.textSizeY !== textSizeY)) ||
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

		let noCorrection = null,
			usePal = null,
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

				const pal = run.palette !== null;
				if (pal !== usePal) {
					gl.uniform1i(uniform.uUsePal, (usePal = pal));
				}
				if (pal) {
					if (run.palette !== palette) {
						gl.activeTexture(gl.TEXTURE1);
						gl.bindTexture(gl.TEXTURE_2D, (palette = run.palette));
						gl.activeTexture(gl.TEXTURE0);
					}
					if (run.textSizeX !== textSizeX || run.textSizeY !== textSizeY) {
						gl.uniform2f(uniform.uTextSize, (textSizeX = run.textSizeX), (textSizeY = run.textSizeY));
					}
				}

				gl.bindTexture(gl.TEXTURE_2D, run.texture);
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
