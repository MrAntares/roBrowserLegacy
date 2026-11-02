/**
 * Renderer/Effects/EffectPrim.js
 *
 * Draws one primitive of the official client's effect system (ring, sphere, quad),
 * stepped on the official 60 ticks a second clock. The motion and geometry are
 * in EffectPrimSim.js; this file only uploads and draws them.
 *
 * Effect table entry: { type: 'PRIM', prim: 'ring' | 'sphere' | 'quad', texture, frames, ... },
 * see EffectPrimSim.js for the keys.
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import { PRIM_TICK_MS, createPrimState, advancePrim, buildPrimGeometry, primVertexCount } from './EffectPrimSim.js';
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

/**
 * @var {WebGLProgram}
 */
let _program = null;

class EffectPrim {
	/**
	 * @param {object} effect description
	 * @param {object} EF_Inst_Par instance parameters
	 */
	constructor(effect, EF_Inst_Par) {
		this.effect = effect;
		this.position = EF_Inst_Par.position;
		this.startTick = EF_Inst_Par.startTick;
		this.state = createPrimState(effect);
		this.endTick = this.startTick + this.state.frames * PRIM_TICK_MS;
		this.vertexCount = primVertexCount(effect);
		this.vertices = new Float32Array(this.vertexCount * 5);
		const color = effect.color || [255, 255, 255];
		this.color = new Float32Array([color[0] / 255, color[1] / 255, color[2] / 255, 0]);
		this.dirty = true;
	}

	/**
	 * Create the buffer and load the texture
	 *
	 * @param {object} gl context
	 */
	init(gl) {
		this.buffer = gl.createBuffer();

		Client.loadFile(
			`data/texture/effect/${this.effect.texture}.tga`,
			buffer => {
				WebGL.texture(gl, buffer, texture => {
					if (this.freed) {
						gl.deleteTexture(texture);
						return;
					}
					this.texture = texture;
					this.ready = true;
				});
			},
			() => {
				// No texture: nothing to draw, and EffectManager frees the buffer
				this.needCleanUp = true;
			}
		);
	}

	/**
	 * @param {object} gl context
	 */
	free(gl) {
		this.freed = true;
		this.ready = false;

		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}

		if (this.texture) {
			gl.deleteTexture(this.texture);
			this.texture = null;
		}
	}

	/**
	 * @param {object} gl context
	 * @param {number} tick
	 */
	render(gl, tick) {
		if (tick < this.startTick) {
			return;
		}

		if (tick > this.endTick) {
			this.needCleanUp = true;
			return;
		}

		const frame = Math.floor((tick - this.startTick) / PRIM_TICK_MS);
		const attribute = _program.attribute;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		if (advancePrim(this.state, frame) || this.dirty) {
			buildPrimGeometry(this.vertices, this.effect, this.state, this.position);
			gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
			this.dirty = false;
		}

		this.color[3] = this.state.alpha / 255;

		if (this.color[3] <= 0) {
			return;
		}

		gl.uniform4fv(_program.uniform.uColor, this.color);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);

		// Normal alpha blending, depth tested, no depth writes (as the official client draws them).
		SpriteRenderer.runWithDepth(true, false, true, () => {
			gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
		});
	}

	/**
	 * @param {object} gl context
	 */
	static init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		this.ready = true;
		this.renderBeforeEntities = false;
	}

	/**
	 * @param {object} gl context
	 */
	static free(gl) {
		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}
		this.ready = false;
	}

	/**
	 * @param {object} gl context
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {object} fog
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

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(uniform.uDiffuse, 0);

		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aTextureCoord);

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	/**
	 * @param {object} gl context
	 */
	static afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default EffectPrim;
