/**
 * Renderer/Effects/WaterfallEffect.js
 *
 * Rendering Waterfall effect
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Alison Serafim
 */

import WebGL from 'Utils/WebGL.js';
import glMatrix from 'Utils/gl-matrix.js';
import Client from 'Core/Client.js';
import _vertexShader from './WaterfallEffect.vs?raw';
import _fragmentShader from './WaterfallEffect.fs?raw';

const mat4 = glMatrix.mat4;
const _matrix = mat4.create();
const SEGMENT_COUNT = 5;
const TEXTURE_COUNT = 3;
const SEGMENT_HEIGHT = 8;
const EFFECT_TICK_MS = 24;
const OPACITY = 120 / 255;

let _program;
const _textureCache = new Map();

function loadTextures(gl, textureSet, effect) {
	let cache = _textureCache.get(textureSet);
	if (!cache) {
		cache = {
			textures: new Array(TEXTURE_COUNT),
			waiters: new Set(),
			ready: false,
			active: true
		};
		_textureCache.set(textureSet, cache);

		const texturePrefix = `waterfall${textureSet}`;
		for (let index = 1; index <= TEXTURE_COUNT; index++) {
			Client.loadFile(`data/texture/effect/${texturePrefix}${index}.tga`, buffer => {
				WebGL.texture(gl, buffer, texture => {
					if (!cache.active) {
						gl.deleteTexture(texture);
						return;
					}

					cache.textures[index - 1] = texture;
					if (cache.textures.every(Boolean)) {
						cache.ready = true;
						cache.waiters.forEach(waiter => {
							waiter.textures = cache.textures;
							waiter.ready = true;
						});
						cache.waiters.clear();
					}
				});
			});
		}
	}

	if (cache.ready) {
		effect.textures = cache.textures;
		effect.ready = true;
	} else {
		cache.waiters.add(effect);
	}

	return cache;
}

function getStyle(variant) {
	const small = variant.includes('small');
	const dark = variant.includes('dark');
	return {
		small,
		textureSet: dark ? 3 : 1
	};
}

/**
 * WaterfallEffect constructor
 *
 * @param {object} effect parameters
 * @param {object} EF_Inst_Par parameters
 * @param {object} EF_Init_Par parameters
 */
class WaterfallEffect {
	constructor(effect, instance, init) {
		const style = getStyle(effect.variant);
		this.position = instance.position;
		this.startTick = instance.startTick;
		this.small = style.small;
		this.height = effect.height;
		this.textureSet = style.textureSet;
		this.textures = [];
		this.textureCache = null;
		this.buffer = null;
		this.vertical = effect.vertical;
		this.ready = false;
		this.needInit = true;
	}

	/**
	 * Initialize WebGL resources
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	init(gl) {
		this.buffer = gl.createBuffer();
		this.textureCache = loadTextures(gl, this.textureSet, this);
	}

	render(gl, tick) {
		const uniform = _program.uniform;
		const attribute = _program.attribute;
		mat4.identity(_matrix);
		mat4.translate(_matrix, _matrix, [this.position[0] + 0.5, -this.position[2], this.position[1] + 2.5]);
		if (this.vertical) {
			mat4.rotateY(_matrix, _matrix, Math.PI / 2);
		}

		gl.uniformMatrix4fv(uniform.uModelMat, false, _matrix);
		const process = Math.floor((tick - this.startTick) / EFFECT_TICK_MS);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		for (let band = 0; band < 4; band++) {
			const cycleLength = this.height - band * (this.small ? 6 : 13);
			const scroll = ((process % cycleLength) * SEGMENT_HEIGHT) / cycleLength;
			const crop = scroll / SEGMENT_HEIGHT;
			const phase = Math.floor((process % (TEXTURE_COUNT * cycleLength)) / cycleLength);
			const halfWidth = (36 + band) / 10;
			const depth = (band * 0.25 - 1) / 5;
			for (let segment = 0; segment < SEGMENT_COUNT; segment++) {
				const top = scroll - segment * SEGMENT_HEIGHT;
				const bottom = top - SEGMENT_HEIGHT;
				let visibleTop = top;
				let visibleBottom = bottom;
				let vTop = 0;
				let vBottom = 1;

				if (segment === 0) {
					visibleTop = top + (bottom - top) * crop;
					vTop = crop;
				} else if (segment === SEGMENT_COUNT - 1) {
					visibleBottom = top + (bottom - top) * crop;
					vBottom = crop;
				}

				const vertices = new Float32Array([
					-halfWidth,
					-visibleBottom,
					depth,
					0,
					vBottom,
					halfWidth,
					-visibleBottom,
					depth,
					1,
					vBottom,
					-halfWidth,
					-visibleTop,
					depth,
					0,
					vTop,
					halfWidth,
					-visibleTop,
					depth,
					1,
					vTop
				]);
				gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
				gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 20, 0);
				gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 20, 12);
				gl.bindTexture(gl.TEXTURE_2D, this.textures[(segment + phase) % TEXTURE_COUNT]);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			}
		}
	}

	/**
	 * Free WebGL resources
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	free(gl) {
		if (this.textureCache) {
			this.textureCache.waiters.delete(this);
			this.textureCache = null;
		}
		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}
		this.textures = [];
		this.ready = false;
	}

	/**
	 * Called before rendering all effects of this type
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {object} fog
	 * @param {number} tick
	 * @param {object} entity
	 */
	static beforeRender(gl, modelView, projection, fog) {
		const uniform = _program.uniform;
		const attribute = _program.attribute;
		gl.useProgram(_program);
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);
		gl.uniform1f(uniform.uOpacity, OPACITY);
		gl.uniform1i(uniform.uTexture, 0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.depthMask(false);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aTextureCoord);
	}

	/**
	 * Called after rendering all effects of this type
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	static afterRender(gl) {
		gl.depthMask(true);
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}

	/**
	 * Initialize the effect type
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	static init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		this.ready = true;
	}

	/**
	 * Free resources for this effect type
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	static free(gl) {
		_textureCache.forEach(cache => {
			cache.active = false;
			cache.textures.forEach(texture => {
				if (texture) {
					gl.deleteTexture(texture);
				}
			});
			cache.waiters.clear();
		});
		_textureCache.clear();

		if (_program) gl.deleteProgram(_program);
		_program = null;
		this.ready = false;
		this.needInit = true;
	}
}
WaterfallEffect.renderBeforeEntities = false;
WaterfallEffect.needInit = true;

export default WaterfallEffect;
