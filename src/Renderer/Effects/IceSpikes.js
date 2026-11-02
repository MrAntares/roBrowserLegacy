/**
 * Renderer/Effects/IceSpikes.js
 *
 * Draws the official client's ice spikes (primitive 9) for Frost Diver: the
 * path of thin spikes from the caster to the target (effect 27) and the burst
 * of wide spikes at the target when it is hit (effect 28). The motion and
 * geometry are in IceSpikesSim.js; this file only draws them.
 *
 * Effect table entry:
 *   { type: 'FUNC', func(Params) {
 *       this.add(new IceSpikes(position, Params.Inst.startTick, planPath(dx, dy), PATH.life), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import { SPIKE_TICK_MS, SPIKE_VERTICES, spikeAt, buildSpike } from './IceSpikesSim.js';
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

const TEXTURE = 'ice.tga';

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * @var {WebGLTexture} ice.tga, shared by every spike effect
 */
let _texture = null;
let _loading = false;

/**
 * Bumped when the class is freed (map change, context reset): a load started
 * before that belongs to the old context and is dropped when it finishes.
 */
let _generation = 0;

class IceSpikes {
	/**
	 * @param {vec3} position effect position (kept by reference: a spike follows it)
	 * @param {number} startTick
	 * @param {Array} spikes from planPath or planShards
	 * @param {number} life effect lifetime in ticks
	 */
	constructor(position, startTick, spikes, life) {
		this.position = position;
		this.startTick = startTick || 0;
		this.spikes = spikes;
		this.endTick = this.startTick + life * SPIKE_TICK_MS;
		this.vertices = new Float32Array(SPIKE_VERTICES * 5);
		this.color = new Float32Array([1, 1, 1, 1]);
	}

	init(gl) {
		this.buffer = gl.createBuffer();
		if (!_texture && !_loading) {
			_loading = true;
			const generation = _generation;
			Client.loadFile(`data/texture/effect/${TEXTURE}`, buffer => {
				WebGL.texture(gl, buffer, texture => {
					if (generation !== _generation) {
						gl.deleteTexture(texture);
						return;
					}
					_texture = texture;
				});
			});
		}
		this.ready = true;
	}

	free(gl) {
		this.ready = false;
		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}
	}

	render(gl, tick) {
		if (tick < this.startTick) {
			return;
		}
		if (tick > this.endTick) {
			this.needCleanUp = true;
			return;
		}
		if (!_texture) {
			return;
		}

		const frame = Math.floor((tick - this.startTick) / SPIKE_TICK_MS);
		const attribute = _program.attribute;
		const self = this;

		SpriteRenderer.runWithDepth(true, false, false, function () {
			gl.bindBuffer(gl.ARRAY_BUFFER, self.buffer);
			gl.bindTexture(gl.TEXTURE_2D, _texture);

			self.spikes.forEach(spike => {
				const state = spikeAt(spike, frame - spike.spawn);
				if (!state || state.alpha <= 0) {
					return;
				}
				buildSpike(self.vertices, 0, spike, state.rise, self.position);
				gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.DYNAMIC_DRAW);
				gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
				gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
				self.color[3] = state.alpha / 255;
				gl.uniform4fv(_program.uniform.uColor, self.color);
				gl.drawArrays(gl.TRIANGLES, 0, SPIKE_VERTICES);
			});
		});
	}

	static init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		this.ready = true;
		this.renderBeforeEntities = false;
	}

	static free(gl) {
		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}
		if (_texture) {
			gl.deleteTexture(_texture);
			_texture = null;
		}
		_loading = false;
		_generation++;
		this.ready = false;
	}

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

		// Normal alpha blending, as the client draws primitive 9
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	static afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default IceSpikes;
