/**
 * Renderer/Effects/RotateLine.js
 *
 * Draws the official client's rotate-line effect (EF_ROTATE_LINE_GRAY 986,
 * EF_ROTATE_LINE_BLUE 1000): four ribbons of cloud11.tga spiralling around the
 * caster for the cast time. The motion and geometry are in RotateLineSim.js;
 * this file only draws them.
 *
 * Effect table entry:
 *   { type: 'FUNC', attachedEntity: true, castLoop: true, func(Params) {
 *       this.add(new RotateLine(Params.Init.ownerEntity.position, Params.Inst.startTick,
 *           Params.Init.duration, 986), Params);
 *   } }
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import WebGL from 'Utils/WebGL.js';
import Client from 'Core/Client.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import {
	ROTATE_LINE_TICK_MS,
	UNITS_PER_CELL,
	TEXTURE,
	LINES,
	POINTS,
	LOOKS,
	rotateLineFrames,
	createLines,
	stepLines,
	pointCorners,
	cameraFrame
} from './RotateLineSim.js';
import _vertexShader from './EffectPrim.vs?raw';
import _fragmentShader from './EffectPrim.fs?raw';

/**
 * @var {WebGLProgram}
 */
let _program = null;

/**
 * @var {WebGLTexture} cloud11.tga, shared by every caster
 */
let _texture = null;
let _textureLoading = false;

/**
 * Camera frame for the ring, refreshed once a frame (see RotateLineSim.js).
 */
const _right = new Float32Array(3);
const _away = new Float32Array(3);

const _corners = new Float32Array(6);
const _color = new Float32Array(4);

/** Quads per ribbon: point i joins point i - 1. */
const QUADS = POINTS - 1;

/** Floats per quad: two triangles, x y z u v. */
const QUAD_FLOATS = 6 * 5;

function loadTexture(gl) {
	if (_texture || _textureLoading) {
		return;
	}
	_textureLoading = true;
	Client.loadFile(`data/texture/effect/${TEXTURE}`, buffer => {
		WebGL.texture(gl, buffer, texture => {
			if (!_textureLoading) {
				gl.deleteTexture(texture);
				return;
			}
			_texture = texture;
		});
	});
}

class RotateLine {
	/**
	 * @param {vec3} position caster position (kept by reference, so it follows)
	 * @param {number} startTick
	 * @param {number} castTime cast time, ms
	 * @param {number} effectId 986 gray or 1000 blue
	 */
	constructor(position, startTick, castTime, effectId = 986) {
		this.position = position;
		this.startTick = startTick || 0;
		this.frames = rotateLineFrames(castTime);
		this.endTick = this.startTick + this.frames * ROTATE_LINE_TICK_MS;
		this.look = LOOKS[effectId] || LOOKS[986];
		this.lines = createLines(effectId);
		this.age = 0;
		this.vertices = new Float32Array(LINES * QUADS * QUAD_FLOATS);
	}

	init(gl) {
		this.buffer = gl.createBuffer();
		loadTexture(gl);
		this.ready = true;
	}

	free(gl) {
		this.ready = false;
		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}
	}

	/**
	 * Write one ribbon's quads to the vertex array, in GL world space.
	 */
	buildLine(line, offset) {
		const out = this.vertices;
		const base = this.position;
		const cx = base[0] + 0.5;
		const cz = base[1] + 0.5;
		const cy = -base[2];
		let prev = null;

		for (let i = 0; i < POINTS; i++) {
			pointCorners(line, i, _corners);
			// upper then lower corner, GL world: (x + 0.5, -height, y + 0.5)
			const ux = _corners[0] / UNITS_PER_CELL;
			const uz = _corners[2] / UNITS_PER_CELL;
			const lx = _corners[3] / UNITS_PER_CELL;
			const lz = _corners[5] / UNITS_PER_CELL;
			const cur = [
				cx + _right[0] * ux + _away[0] * uz,
				cy + _corners[1] / UNITS_PER_CELL,
				cz + _right[2] * ux + _away[2] * uz,
				cx + _right[0] * lx + _away[0] * lz,
				cy + _corners[4] / UNITS_PER_CELL,
				cz + _right[2] * lx + _away[2] * lz
			];

			if (prev) {
				const u0 = (i - 1) / POINTS;
				const u1 = i / POINTS;
				// V is 1 on the upper edge, 0 on the lower one
				const quad = [
					[prev[3], prev[4], prev[5], u0, 0],
					[cur[3], cur[4], cur[5], u1, 0],
					[prev[0], prev[1], prev[2], u0, 1],
					[cur[0], cur[1], cur[2], u1, 1]
				];
				let o = offset + (i - 1) * QUAD_FLOATS;
				for (const k of [0, 1, 2, 2, 1, 3]) {
					out.set(quad[k], o);
					o += 5;
				}
			}
			prev = cur;
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

		// The client counts a tick before drawing, so the first frame is tick 1.
		const t = Math.min(this.frames, Math.floor((tick - this.startTick) / ROTATE_LINE_TICK_MS) + 1);
		while (this.age < t) {
			stepLines(this.lines, this.age);
			this.age++;
		}

		if (!_texture) {
			return;
		}

		const lines = this.lines;
		for (let L = 0; L < LINES; L++) {
			this.buildLine(lines[L], L * QUADS * QUAD_FLOATS);
		}

		const attribute = _program.attribute;
		const look = this.look;
		_color[0] = look.rgb[0] / 255;
		_color[1] = look.rgb[1] / 255;
		_color[2] = look.rgb[2] / 255;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
		gl.bindTexture(gl.TEXTURE_2D, _texture);
		gl.blendFunc(gl.SRC_ALPHA, look.additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);

		SpriteRenderer.runWithDepth(true, false, false, function () {
			for (let L = 0; L < LINES; L++) {
				const points = lines[L].points;
				for (let i = 1; i < POINTS; i++) {
					// Each quad takes the colour and alpha of its own point
					const alpha = points[i].alpha;
					if (alpha <= 0) {
						continue;
					}
					_color[3] = Math.min(255, alpha) / 255;
					gl.uniform4fv(_program.uniform.uColor, _color);
					gl.drawArrays(gl.TRIANGLES, (L * QUADS + i - 1) * 6, 6);
				}
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
		if (_texture) {
			gl.deleteTexture(_texture);
			_texture = null;
		}
		_textureLoading = false;
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

		cameraFrame(modelView, _right, _away);
	}

	static afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}

export default RotateLine;
