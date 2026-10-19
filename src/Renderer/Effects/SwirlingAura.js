/**
 * Renderer/Effects/SwirlingAura.js
 *
 * Swirling aura band effect
 * Based on original inspiration game Level99()
 *
 * From original inspiration game:
 * - Three bands with different parameters:
 *   GI[0]: RotStart=0°, max_height=15, distance=3.9, rise_angle=55°
 *   GI[1]: RotStart=90°, max_height=13, distance=4.1, rise_angle=50°
 *   GI[2]: RotStart=180°, max_height=11, distance=4.3, rise_angle=45°
 * - Spin speed: RotStart += (ec + 3) per frame (3°, 4°, 5° per band)
 * - 21 divisions, 315° arc
 * - Height profile: height[i] = max_height * sin(SinLimit) * sin(process°)
 *   where SinLimit = 90° + (i - 10) * 9°
 * - Render: base ring at distance, top offset by rotated height
 */

import _vertexShader from './SwirlingAura.vs?raw';
import _fragmentShader from './SwirlingAura.fs?raw';
import WebGL from 'Utils/WebGL.js';
import glMatrix from 'Utils/gl-matrix.js';
import Client from 'Core/Client.js';
import Altitude from 'Renderer/Map/Altitude.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';

const mat4 = glMatrix.mat4;

/**
 * Constants from original inspiration game
 */
const E_DIVISION = 21; // Number of divisions (0-20)
const FULL_DISPLAY_ANGLE = 315; // 315° arc
const DEG_TO_RAD = Math.PI / 180;
const STRIDE = 4; // u, side, texU, texV
const VERTICES_PER_BAND = E_DIVISION * 2;

/**
 * SwirlingAura constructor
 *
 * Creates THREE bands as per original inspiration game:
 * - GI[0]: RotStart=0°, max_height=15, distance=3.9, rise_angle=55°
 * - GI[1]: RotStart=90°, max_height=13, distance=4.1, rise_angle=50°
 * - GI[2]: RotStart=180°, max_height=11, distance=4.3, rise_angle=45°
 */
class SwirlingAura {
	static program = null;
	static modelMatrix = mat4.create();

	constructor(position, textureName, tick, sizeType) {
		this.position = position;
		this.textureName = textureName;
		this.tick = tick;
		this.sizeType = sizeType || 4; // 4 = blue, 7 = green

		// Scale factor: original inspiration game units to world units
		const GAME_TO_WORLD = 0.1 * 2.2; // Adjusted for visual match

		// Color based on m_size (4 = blue, 7 = green)
		if (this.sizeType === 7) {
			this.color = { r: 100 / 255, g: 255 / 255, b: 100 / 255 };
		} else {
			this.color = { r: 100 / 255, g: 100 / 255, b: 255 / 255 };
		}

		// Alpha from original inspiration game: alphaB = 120
		this.alphaB = 120 / 255;

		// Create THREE bands with different parameters
		const INNER_CIRCLE_SCALE = 0.6;
		this.bands = [];
		for (let ec = 0; ec < 3; ec++) {
			this.bands.push({
				life: 1,
				initialRotStart: ec * 90, // 0, 90, 180 degrees
				rotStart: ec * 90,
				maxHeight: (15 - 2 * ec) * GAME_TO_WORLD, // 15, 13, 11 (unchanged)
				distance: (3.9 + 0.2 * ec) * GAME_TO_WORLD * INNER_CIRCLE_SCALE, // 20% smaller
				riseAngle: (55 - 5 * ec) * DEG_TO_RAD, // 55°, 50°, 45°
				spinSpeed: ec + 3 // 3, 4, 5 degrees per 25ms tick
			});
		}

		// Angle step between divisions
		this.basicAngle = FULL_DISPLAY_ANGLE / (E_DIVISION - 1); // 315/20 = 15.75°

		// Static parametric vertex buffer & index buffer
		this.vertexBuffer = null;
		this.indexBuffer = null;
		this.indexCount = 0;
		this.ready = false;
	}

	/**
	 * Build static parametric series for ribbon mesh
	 * Attributes per vertex: [u, side, texU, texV]
	 */
	buildParametricVertices() {
		const verts = new Float32Array(VERTICES_PER_BAND * STRIDE);
		let offset = 0;

		for (let k = 0; k < E_DIVISION; k++) {
			const u = k / (E_DIVISION - 1);

			// Base vertex (Inner: side = 0.0, texV = 1.0)
			verts[offset++] = u;
			verts[offset++] = 0.0;
			verts[offset++] = u;
			verts[offset++] = 1.0;

			// Top vertex (Outer: side = 1.0, texV = 0.0)
			verts[offset++] = u;
			verts[offset++] = 1.0;
			verts[offset++] = u;
			verts[offset++] = 0.0;
		}

		return verts;
	}

	/**
	 * Generate index buffer
	 */
	generateIndices() {
		const indices = [];
		for (let k = 0; k < E_DIVISION - 1; k++) {
			const i0 = k * 2; // Base of current
			const i1 = k * 2 + 1; // Top of current
			const i2 = k * 2 + 2; // Base of next
			const i3 = k * 2 + 3; // Top of next
			// Two triangles: (i0, i1, i2) and (i1, i3, i2)
			indices.push(i0, i1, i2, i1, i3, i2);
		}
		return new Uint16Array(indices);
	}

	/**
	 * Initialize instance
	 */
	init(gl) {
		// Create static parametric vertex buffer
		const vertices = this.buildParametricVertices();
		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		// Create shared index buffer
		const indices = this.generateIndices();
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		this.indexCount = indices.length;

		// Load texture
		Client.loadFile(`data/texture/effect/${this.textureName}`, buffer => {
			WebGL.texture(gl, buffer, texture => {
				this.texture = texture;
				this.ready = true;
			});
		});
	}

	/**
	 * Free instance resources
	 */
	free(gl) {
		if (this.vertexBuffer) {
			gl.deleteBuffer(this.vertexBuffer);
			this.vertexBuffer = null;
		}
		if (this.indexBuffer) {
			gl.deleteBuffer(this.indexBuffer);
			this.indexBuffer = null;
		}
		this.ready = false;
	}

	/**
	 * Render all three bands
	 */
	render(gl, tick) {
		const program = SwirlingAura.program;
		const uniform = program.uniform;
		const attribute = program.attribute;
		const modelMatrix = SwirlingAura.modelMatrix;

		// Get ground height
		const groundZ = Altitude.getCellHeight(this.position[0], this.position[1]);

		// Build model matrix
		mat4.identity(modelMatrix);
		mat4.translate(modelMatrix, modelMatrix, [this.position[0] + 0.5, -groundZ, this.position[1] + 0.5]);

		gl.uniformMatrix4fv(uniform.uModelMat, false, modelMatrix);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.enableVertexAttribArray(attribute.aParam);
		gl.vertexAttribPointer(attribute.aParam, 2, gl.FLOAT, false, STRIDE * 4, 0);

		gl.enableVertexAttribArray(attribute.aTextureCoord);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, STRIDE * 4, 2 * 4);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		const RAG_TICK_MS = 25;
		const elapsed = tick - this.tick;
		const process = elapsed / RAG_TICK_MS;

		gl.uniform1f(uniform.uProcess, process);
		gl.uniform1f(uniform.uBasicAngle, this.basicAngle);
		gl.uniform4f(uniform.uColor, this.color.r, this.color.g, this.color.b, this.alphaB);

		SpriteRenderer.runWithDepth(true, false, false, () => {
			// Render each band
			for (let ec = 0; ec < this.bands.length; ec++) {
				const band = this.bands[ec];
				if (!band.life) {
					continue;
				}

				// Update animation purely from elapsed time (Prim3DCasting)
				band.rotStart = (band.initialRotStart + process * band.spinSpeed) % 360;

				gl.uniform1f(uniform.uRotStart, band.rotStart);
				gl.uniform1f(uniform.uDistance, band.distance);
				gl.uniform1f(uniform.uMaxHeight, band.maxHeight);
				gl.uniform1f(uniform.uRiseAngle, band.riseAngle);
				gl.uniform1f(uniform.uZIndex, 0.01 + ec * 0.001);

				// Draw
				gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
			}
		});
	}

	/**
	 * Initialize static resources
	 */
	static init(gl) {
		SwirlingAura.program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);

		this.ready = true;
		this.renderBeforeEntities = true;
	}

	/**
	 * Free static resources
	 */
	static free(gl) {
		if (SwirlingAura.program) {
			gl.deleteProgram(SwirlingAura.program);
			SwirlingAura.program = null;
		}
		this.ready = false;
	}

	/**
	 * Before render setup
	 */
	static beforeRender(gl, modelView, projection, fog, tick) {
		const uniform = SwirlingAura.program.uniform;
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blend

		gl.useProgram(SwirlingAura.program);

		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);

		// Fog
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(uniform.uDiffuse, 0);
	}

	/**
	 * After render cleanup
	 */
	static afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.disableVertexAttribArray(SwirlingAura.program.attribute.aParam);
		gl.disableVertexAttribArray(SwirlingAura.program.attribute.aTextureCoord);
	}
}
export default SwirlingAura;
