/**
 * Renderer/Effects/CastCone.js
 *
 * Draws the official client's cone cast auras (EF_BEGINSPELL_N2 831,
 * EF_BEGINSPELL_N3..N8 840-845 and 2368): bands of bubbles leaning out around
 * the caster, in the cone's colour, and for 831 two blue squares on the ground.
 * With `pulse: true` it draws EF_BEGINSPELL_N1 830 instead: two crowns of the
 * same bands, pulsing out of step.
 * The motion and geometry are in CastConeSim.js; this file only draws them.
 *
 * Effect table entry:
 *   { type: 'FUNC', attachedEntity: true, func(Params) {
 *       this.add(new CastCone(Params.Init.ownerEntity.position, Params.Inst.startTick,
 *           Params.Init.duration, { variant: 0, ground: true }), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import {
	CONE_TICK_MS,
	VARIANTS,
	GROUND,
	STRIPS,
	MIN_FRAMES,
	PULSE_MIN_FRAMES,
	PULSE_CROWNS,
	CONE_VERTICES,
	GROUND_VERTICES,
	BUBBLE_FRAMES,
	coneFrames,
	bandAlpha,
	groundAlpha,
	bubbleFrame,
	buildCone,
	buildGround,
	pulseBands,
	buildPulse
} from './CastConeSim.js';

/** Vertices of one band. */
const BAND_VERTICES = STRIPS * 6;
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * Textures by file name, shared by every cone: a crowd casting loads them once.
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

function bubbleName(frame) {
	return `w_bubble${String(frame + 1).padStart(2, '0')}.tga`;
}

class CastCone {
	/**
	 * @param {vec3} position caster position (kept by reference, so it follows)
	 * @param {number} startTick
	 * @param {number} castTime cast time, ms
	 * @param {{variant: number, ground: boolean, pulse: boolean}} options
	 */
	constructor(position, startTick, castTime, options = {}) {
		this.position = position;
		this.startTick = startTick || 0;
		this.pulse = !!options.pulse;
		this.frames = coneFrames(castTime, this.pulse ? PULSE_MIN_FRAMES : MIN_FRAMES);
		this.endTick = this.startTick + this.frames * CONE_TICK_MS;
		this.variant = VARIANTS[options.variant] || VARIANTS[0];
		this.ground = !!options.ground;
		this.cone = new Float32Array(CONE_VERTICES * 5);
		this.squares = new Float32Array(GROUND_VERTICES * 5);
		this.color = new Float32Array(4);
	}

	init(gl) {
		this.buffer = gl.createBuffer();
		for (let i = 0; i < BUBBLE_FRAMES; i++) {
			loadTexture(gl, bubbleName(i));
		}
		if (this.ground && !this.pulse) {
			loadTexture(gl, GROUND.texture);
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

	upload(gl, data) {
		const attribute = _program.attribute;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
	}

	/**
	 * Draw `count` uploaded vertices from `first`, additive or with normal alpha blending.
	 */
	draw(gl, first, count, texture, rgb, alpha, additive) {
		if (!texture || alpha <= 0) {
			return;
		}
		this.color[0] = rgb[0] / 255;
		this.color[1] = rgb[1] / 255;
		this.color[2] = rgb[2] / 255;
		this.color[3] = Math.min(255, alpha) / 255;
		gl.uniform4fv(_program.uniform.uColor, this.color);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		if (!additive) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		}
		gl.drawArrays(gl.TRIANGLES, first, count);
		if (!additive) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		}
	}

	pass(gl, data, count, texture, rgb, alpha, additive) {
		if (!texture || alpha <= 0) {
			return;
		}
		this.upload(gl, data);
		this.draw(gl, 0, count, texture, rgb, alpha, additive);
	}

	render(gl, tick) {
		if (tick < this.startTick) {
			return;
		}
		if (tick > this.endTick) {
			this.needCleanUp = true;
			return;
		}

		// The client counts a tick before drawing, so the first frame is tick 1.
		const t = Math.min(this.frames, Math.floor((tick - this.startTick) / CONE_TICK_MS) + 1);
		const self = this;

		SpriteRenderer.runWithDepth(true, false, false, function () {
			const texture = _textures.get(bubbleName(bubbleFrame(t)));

			if (self.pulse) {
				// 830: each band has its own alpha, so each is drawn on its own.
				for (const crown of PULSE_CROWNS) {
					const states = pulseBands(t, self.frames, crown.alpha);
					buildPulse(self.cone, t, self.position, states);
					self.upload(gl, self.cone);
					for (let b = 0; b < states.length; b++) {
						self.draw(
							gl,
							b * BAND_VERTICES,
							BAND_VERTICES,
							texture,
							crown.rgb,
							states[b].alpha,
							crown.additive
						);
					}
				}
				return;
			}

			if (self.ground) {
				buildGround(self.squares, t, self.position);
				self.pass(
					gl,
					self.squares,
					GROUND_VERTICES,
					_textures.get(GROUND.texture),
					GROUND.rgb,
					groundAlpha(t, self.frames),
					true
				);
			}

			const alpha = bandAlpha(t, self.frames);
			buildCone(self.cone, t, self.position);
			// The white pass is blended normally; the colour pass adds light, except 2368's black.
			self.pass(gl, self.cone, CONE_VERTICES, texture, [255, 255, 255], alpha, false);
			self.pass(
				gl,
				self.cone,
				CONE_VERTICES,
				texture,
				self.variant.rgb,
				alpha * self.variant.gain,
				self.variant.additive
			);
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

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive unless a pass says otherwise
	}

	static afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default CastCone;
