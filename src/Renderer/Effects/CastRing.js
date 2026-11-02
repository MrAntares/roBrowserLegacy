/**
 * Renderer/Effects/CastRing.js
 *
 * Draws the official client's cast-aura ring effect: two rings of four leaning
 * bands round the caster (sizes 45 and 25), each coloured by its argument.
 * Effects 2367 (ring_yellow.tga, 0), 1556 (ring_blue.tga, 20 and 21), 1565
 * (ring_yellow.tga, 23) and 1938 (new_battle_w/abr_battle_warior.tga, 0);
 * 911 (ring_white.tga, 15); 2369 (ring_white.tga, 0, colour cycling).
 * The motion and geometry are in CastRingSim.js; this file only draws them.
 *
 * Effect table entry:
 *   { type: 'FUNC', attachedEntity: true, castLoop: true, func(Params) {
 *       this.add(new CastRing(Params.Init.ownerEntity.position, Params.Inst.startTick,
 *           Params.Init.duration, 'ring_yellow.tga', [0, 0]), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import {
	RING_TICK_MS,
	RING_VERTICES,
	STRIPS,
	ringFrames,
	modeTint,
	createRing,
	stepRing,
	buildRing
} from './CastRingSim.js';
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * Textures by file name, shared by every ring.
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

/** The two sizes the client builds each effect's rings with, in order. */
const SIZES = [45, 25];

class CastRing {
	/**
	 * @param {vec3} position caster position (kept by reference, so it follows)
	 * @param {number} startTick
	 * @param {number} castTime cast time, ms
	 * @param {string} texture file under data/texture/effect/
	 * @param {number[]} args the size-45 ring's argument, then the size-25 ring's
	 * @param {boolean} [cycle] build the colour-cycling twin (client primitive 139)
	 */
	constructor(position, startTick, castTime, texture, args, cycle = false) {
		this.position = position;
		this.startTick = startTick || 0;
		this.frames = ringFrames(castTime);
		this.endTick = this.startTick + this.frames * RING_TICK_MS;
		this.texture = texture;
		this.ticks = 0;
		this.rings = SIZES.map((size, i) => ({
			sim: createRing(size, args[i], this.frames, cycle),
			vertices: new Float32Array(RING_VERTICES * 5),
			color: new Float32Array(4),
			buffer: null
		}));
	}

	init(gl) {
		for (const ring of this.rings) {
			ring.buffer = gl.createBuffer();
		}
		loadTexture(gl, this.texture);
		this.ready = true;
	}

	free(gl) {
		this.ready = false;
		for (const ring of this.rings) {
			if (ring.buffer) {
				gl.deleteBuffer(ring.buffer);
				ring.buffer = null;
			}
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

		// The client runs a tick before drawing, so the first frame shows tick 1.
		const t = Math.min(this.frames, Math.floor((tick - this.startTick) / RING_TICK_MS) + 1);
		while (this.ticks < t) {
			for (const ring of this.rings) {
				stepRing(ring.sim);
			}
			this.ticks++;
		}

		const texture = _textures.get(this.texture);
		if (!texture) {
			return;
		}

		const attribute = _program.attribute;
		const self = this;

		SpriteRenderer.runWithDepth(true, false, false, function () {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			for (const ring of self.rings) {
				buildRing(ring.vertices, ring.sim, self.position);
				gl.bindBuffer(gl.ARRAY_BUFFER, ring.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, ring.vertices, gl.DYNAMIC_DRAW);
				gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
				gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
				const tint = modeTint(ring.sim.mode);
				ring.color[0] = tint.color[0] / 255;
				ring.color[1] = tint.color[1] / 255;
				ring.color[2] = tint.color[2] / 255;
				gl.blendFunc(gl.SRC_ALPHA, tint.additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);

				ring.sim.bands.forEach((band, b) => {
					const alpha = Math.min(255, band.alpha);
					if (alpha <= 0) {
						return;
					}
					ring.color[3] = alpha / 255;
					gl.uniform4fv(_program.uniform.uColor, ring.color);
					gl.drawArrays(gl.TRIANGLES, b * STRIPS * 6, STRIPS * 6);
				});
			}
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	static afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default CastRing;
