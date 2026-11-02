/**
 * Renderer/Effects/CastCircle.js
 *
 * Draws the official client's cast circle: four bands of a ring texture
 * standing around the caster. The untinted circle draws the texture white with
 * normal alpha blending (Hell's Drive's effect 1709, new_earthdrive/ring_brown.tga;
 * effect 56, magic_green.tga). Given a mode, it draws the tinted circle instead
 * (effect 54: ring_blue.tga mode 2; 57: ring_yellow.tga mode 0). The motion and
 * geometry are in CastCircleSim.js; this file only draws them.
 *
 * Effect table entry:
 *   { type: 'FUNC', attachedEntity: true, func(Params) {
 *       this.add(new CastCircle(Params.Init.ownerEntity.position, Params.Inst.startTick,
 *           Params.Init.duration, 'new_earthdrive/ring_brown.tga'), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import {
	CIRCLE_TICK_MS,
	BANDS,
	CIRCLE_VERTICES,
	TINT_MODES,
	circleFrames,
	bandAlpha,
	buildCircle
} from './CastCircleSim.js';
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * Textures by file name, shared by every circle: a crowd casting loads them once.
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

class CastCircle {
	/**
	 * @param {vec3} position caster position (kept by reference, so it follows)
	 * @param {number} startTick
	 * @param {number} castTime cast time, ms
	 * @param {string} texture file under data/texture/effect/
	 * @param {number} [mode] the tinted circle's mode (TINT_MODES); leave out for the untinted circle
	 */
	constructor(position, startTick, castTime, texture, mode) {
		this.position = position;
		this.startTick = startTick || 0;
		this.frames = circleFrames(castTime);
		this.endTick = this.startTick + this.frames * CIRCLE_TICK_MS;
		this.texture = texture;
		this.vertices = new Float32Array(CIRCLE_VERTICES * 5);
		this.tinted = mode in TINT_MODES;
		const tint = this.tinted ? TINT_MODES[mode] : TINT_MODES[0];
		this.color = new Float32Array([tint.color[0] / 255, tint.color[1] / 255, tint.color[2] / 255, 1]);
		this.additive = tint.additive;
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
		const t = Math.min(this.frames, Math.floor((tick - this.startTick) / CIRCLE_TICK_MS) + 1);
		const starts = buildCircle(this.vertices, t, this.position, this.tinted);
		const attribute = _program.attribute;
		const self = this;

		SpriteRenderer.runWithDepth(true, false, false, function () {
			gl.bindBuffer(gl.ARRAY_BUFFER, self.buffer);
			gl.bufferData(gl.ARRAY_BUFFER, self.vertices, gl.DYNAMIC_DRAW);
			gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
			gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			if (self.additive) {
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
			}

			for (let b = 0; b < BANDS.length; b++) {
				const alpha = bandAlpha(b, t, self.frames, self.tinted);
				if (alpha <= 0) {
					continue;
				}
				self.color[3] = alpha / 255;
				gl.uniform4fv(_program.uniform.uColor, self.color);
				gl.drawArrays(gl.TRIANGLES, starts[b], starts[b + 1] - starts[b]);
			}

			if (self.additive) {
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			}
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

		// Normal alpha blending, as the client draws the untinted circle and tinted modes 0 and 2
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	static afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default CastCircle;
