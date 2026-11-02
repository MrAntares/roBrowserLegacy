/**
 * Renderer/Effects/MagicTarget.js
 *
 * Rendering casting on ground (rotating plane)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import WebGL from 'Utils/WebGL.js';
import glMatrix from 'Utils/gl-matrix.js';
import Client from 'Core/Client.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Camera from 'Renderer/Camera.js';
import { TARGET_TICK_MS, castSize, spinAngle, targetAlpha } from './MagicTargetSim.js';
import _vertexShader from './MagicTarget.vs?raw';
import _fragmentShader from './MagicTarget.fs?raw';

// Load dependencies
/**
 * @var {WebGLTexture}
 */
let _texture;

/**
 * @var {WebGLProgram}
 */
let _program;

/**
 * @var {mat4}
 */
const mat4 = glMatrix.mat4;

/**
 * MagicTarget constructor
 *
 * The square's size comes from the skill alone (MagicTargetSim.js), as in the
 * official client: no skill level, the same for every caster.
 *
 * @param {number} skill id
 * @param {number} position x
 * @param {number} position y
 * @param {number} tick to remove it
 * @param {Entity} caster (unused)
 * @param {number} tick it starts
 */
class MagicTarget {
	constructor(id, x, y, endTick, srcEntity, startTick) {
		this.x = x;
		this.y = y;
		this.size = castSize(id);
		this.startTick = startTick || 0;
		this.endTick = endTick;
		this.matrix = mat4.create();
	}

	/**
	 * Preparing for render
	 *
	 * @param {object} webgl context
	 */
	init(gl) {
		if (!this.size) {
			this.vertCount = 0;
			this.ready = true;
			return;
		}

		const data = Altitude.generatePlane(this.x, this.y, this.size);
		this.buffer = gl.createBuffer();
		this.vertCount = data.length / 5;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

		this.ready = true;
	}

	/**
	 * Destroying data
	 *
	 * @param {object} webgl context
	 */
	free(gl) {
		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
		}
		this.ready = false;
	}

	/**
	 * Rendering cast
	 *
	 * @param {object} wegl context
	 */
	render(gl, tick) {
		this.needCleanUp = this.endTick < tick;
		if (!this.vertCount) {
			return;
		}

		const attribute = _program.attribute;
		const t = Math.max(0, Math.floor((tick - this.startTick) / TARGET_TICK_MS));
		const angle = spinAngle(t, this.size);

		mat4.identity(this.matrix);
		mat4.rotateZ(this.matrix, this.matrix, angle);
		gl.uniformMatrix4fv(_program.uniform.uRotationMat, false, this.matrix);
		gl.uniform1f(_program.uniform.uAlpha, targetAlpha(angle) / 255);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		gl.uniform1f(_program.uniform.uCameraLatitude, Camera.getLatitude());

		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 5 * 4, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
		gl.drawArrays(gl.TRIANGLES, 0, this.vertCount);
	}

	/**
	 * Initialize effect
	 *
	 * @param {object} webgl context
	 */
	static init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);

		Client.loadFile('data/texture/effect/magic_target.tga', buffer => {
			WebGL.texture(gl, buffer, texture => {
				_texture = texture;
				this.ready = true;
			});
		});
	}

	/**
	 * Destroy objects
	 *
	 * @param {object} webgl context
	 */
	static free(gl) {
		if (_texture) {
			gl.deleteTexture(_texture);
			_texture = null;
		}

		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}

		this.ready = false;
	}

	/**
	 * Before render, set up program
	 *
	 * @param {object} webgl context
	 */
	static beforeRender(gl, modelView, projection, fog, tick) {
		const uniform = _program.uniform;
		const attribute = _program.attribute;

		gl.useProgram(_program);

		// Bind matrix
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);

		// Fog settings
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		// Texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, _texture);
		gl.uniform1i(uniform.uDiffuse, 0);

		// Enable all attributes
		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aTextureCoord);
	}

	/**
	 * After render, clean attributes
	 *
	 * @param {object} webgl context
	 */
	static afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	}
}
/**
 * @var {boolean} should we render it before entities ?
 */
MagicTarget.renderBeforeEntities = true;

/**
 * Export
 */
export default MagicTarget;
