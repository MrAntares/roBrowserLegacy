/**
 * Renderer/Effects/BoltRain.js
 *
 * Draws the official client's bolt effects: Cold Bolt (effect 26) and Fire Bolt
 * (effect 31). n bolts drop on the target, 10 ticks apart, each opening a ring
 * at the target's feet as it lands. The motion and geometry are in
 * BoltRainSim.js; this file only draws them.
 *
 * Fire Bolt's sparks are sprites; BoltRain hands each to a callback on its tick
 * (the effect table spawns them as 3D sprite effects).
 *
 * Effect table entry (the damage packet's hit count arrives as Params.Init.hitCount):
 *   { type: 'FUNC', attachedEntity: true, func(Params) {
 *       this.add(new BoltRain(Params.Init.ownerEntity.position, Params.Inst.startTick,
 *           Params.Init.hitCount, 'cold'), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import { createPrimState, advancePrim, buildPrimGeometry, primVertexCount } from './EffectPrimSim.js';
import {
	BOLT,
	BOLT_KINDS,
	BOLT_RING,
	BOLT_TICK_MS,
	BOLT_VERTICES,
	planBolts,
	planSparks,
	boltAt,
	boltFrame,
	buildBolt,
	ringStart
} from './BoltRainSim.js';
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * Textures by file name, shared by every bolt effect.
 */
const _textures = new Map();

/**
 * Bumped when the class is freed (map change, context reset): a load started
 * before that belongs to the old context and is dropped when it finishes.
 */
let _generation = 0;

function loadTexture(gl, name) {
	if (_textures.has(name)) {
		return;
	}
	_textures.set(name, null);
	const generation = _generation;
	Client.loadFile(`data/texture/effect/${name}`, buffer => {
		WebGL.texture(gl, buffer, texture => {
			if (generation !== _generation || !_textures.has(name)) {
				gl.deleteTexture(texture);
				return;
			}
			_textures.set(name, texture);
		});
	});
}

const RING_VERTICES = primVertexCount(BOLT_RING);

class BoltRain {
	/**
	 * @param {vec3} position target position (kept by reference, so it follows)
	 * @param {number} startTick
	 * @param {number} count the damage packet's hit count
	 * @param {string} kind 'cold' or 'fire'
	 * @param {function} [random] returns a number in [0, 1)
	 * @param {function} [onSpark] called with each Fire Bolt spark (BoltRainSim planSparks) on its tick
	 */
	constructor(position, startTick, count, kind, random = Math.random, onSpark = null) {
		this.position = position;
		this.startTick = startTick || 0;
		this.kind = BOLT_KINDS[kind] || BOLT_KINDS.cold;
		this.bolts = planBolts(count, random);
		this.sparks = onSpark ? planSparks(this.bolts, random) : [];
		this.nextSpark = 0;
		this.onSpark = onSpark;
		this.endTick = this.startTick + BOLT.effectLife * BOLT_TICK_MS;
		this.boltVertices = new Float32Array(BOLT_VERTICES * 5);
		this.ringVertices = new Float32Array(RING_VERTICES * 5);
		this.color = new Float32Array([1, 1, 1, 1]);
	}

	init(gl) {
		this.buffer = gl.createBuffer();
		this.kind.frames.forEach(name => loadTexture(gl, name));
		loadTexture(gl, this.kind.ring);
		this.ready = true;
	}

	free(gl) {
		this.ready = false;
		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}
	}

	draw(gl, vertices, count, texture, alpha) {
		const attribute = _program.attribute;
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		this.color[3] = alpha / 255;
		gl.uniform4fv(_program.uniform.uColor, this.color);
		gl.drawArrays(gl.TRIANGLES, 0, count);
	}

	render(gl, tick) {
		if (tick < this.startTick) {
			return;
		}
		if (tick > this.endTick) {
			this.needCleanUp = true;
			return;
		}

		const frame = Math.min(BOLT.effectLife, Math.floor((tick - this.startTick) / BOLT_TICK_MS));
		const self = this;

		while (this.nextSpark < this.sparks.length && this.sparks[this.nextSpark].tick <= frame) {
			const spark = this.sparks[this.nextSpark++];
			this.onSpark(spark, this.startTick + spark.tick * BOLT_TICK_MS);
		}

		SpriteRenderer.runWithDepth(true, false, false, function () {
			gl.bindBuffer(gl.ARRAY_BUFFER, self.buffer);

			self.bolts.forEach(bolt => {
				const age = frame - bolt.spawn;
				const point = boltAt(bolt, age);
				const texture = _textures.get(self.kind.frames[boltFrame(self.kind, age)]);
				if (point && point.alpha > 0 && texture) {
					buildBolt(self.boltVertices, 0, bolt, point, self.kind, self.position);
					self.draw(gl, self.boltVertices, BOLT_VERTICES, texture, point.alpha);
				}

				const ringAge = frame - ringStart(bolt);
				const ringTexture = _textures.get(self.kind.ring);
				if (ringAge >= 0 && ringAge < BOLT_RING.frames && ringTexture) {
					// One ring state per bolt, advanced as the frames go by
					const state = bolt.ringState || (bolt.ringState = createPrimState(BOLT_RING));
					advancePrim(state, ringAge);
					if (state.alpha > 0) {
						buildPrimGeometry(self.ringVertices, BOLT_RING, state, self.position);
						self.draw(gl, self.ringVertices, RING_VERTICES, ringTexture, state.alpha);
					}
				}
			});
		});
	}

	static init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		this.ready = true;
		this.renderBeforeEntities = false;
	}

	static free(gl) {
		_generation++;
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

		// Normal alpha blending, as the client draws primitives 12 and 16
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	}

	static afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default BoltRain;
