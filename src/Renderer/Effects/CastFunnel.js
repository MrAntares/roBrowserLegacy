/**
 * Renderer/Effects/CastFunnel.js
 *
 * Draws the official client's funnel cast effect (primitive 31): four rings of
 * a ring texture opening out around the caster (effect 934, ring_white.tga;
 * effect 2373, ring_black.tga). The motion and geometry are in
 * CastFunnelSim.js; this file only draws them.
 *
 * Effect table entry:
 *   { type: 'FUNC', attachedEntity: true, func(Params) {
 *       this.add(new CastFunnel(Params.Init.ownerEntity.position, Params.Inst.startTick,
 *           300, 'ring_white.tga'), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import { FUNNEL_TICK_MS, FUNNEL_VERTICES, funnelAlpha, buildFunnel } from './CastFunnelSim.js';
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * Textures by file name, shared by every funnel.
 */
const _textures = new Map();

function loadTexture(gl, name) {
	if (_textures.has(name)) {
		return;
	}
	_textures.set(name, null);
	Client.loadFile(`data/texture/effect/${name}`, buffer => {
		WebGL.texture(gl, buffer, texture => {
			if (!_textures.has(name)) {
				gl.deleteTexture(texture);
				return;
			}
			_textures.set(name, texture);
		});
	});
}

class CastFunnel {
	/**
	 * @param {vec3} position caster position (kept by reference, so it follows)
	 * @param {number} startTick
	 * @param {number} frames lifetime in ticks (1/60 s)
	 * @param {string} texture file under data/texture/effect/
	 */
	constructor(position, startTick, frames, texture) {
		this.position = position;
		this.startTick = startTick || 0;
		this.frames = Math.max(1, Math.floor(frames));
		this.endTick = this.startTick + this.frames * FUNNEL_TICK_MS;
		this.texture = texture;
		this.vertices = new Float32Array(FUNNEL_VERTICES * 5);
		this.color = new Float32Array([1, 1, 1, 1]);
	}

	init(gl) {
		this.buffer = gl.createBuffer();
		loadTexture(gl, this.texture);
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
		const texture = _textures.get(this.texture);
		if (!texture) {
			return;
		}

		// The client counts a tick before drawing, so the first frame is tick 1.
		const t = Math.min(this.frames, Math.floor((tick - this.startTick) / FUNNEL_TICK_MS) + 1);
		const alpha = funnelAlpha(t);
		if (alpha <= 0) {
			return;
		}
		const count = buildFunnel(this.vertices, t, this.position);
		const attribute = _program.attribute;
		const self = this;

		SpriteRenderer.runWithDepth(true, false, false, function () {
			gl.bindBuffer(gl.ARRAY_BUFFER, self.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
			gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			self.color[3] = alpha / 255;
			gl.uniform4fv(_program.uniform.uColor, self.color);
			gl.drawArrays(gl.TRIANGLES, 0, count);
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
		for (const texture of _textures.values()) {
			if (texture) {
				gl.deleteTexture(texture);
			}
		}
		_textures.clear();
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

		// Normal alpha blending, as the client draws primitive 31
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	static afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default CastFunnel;
