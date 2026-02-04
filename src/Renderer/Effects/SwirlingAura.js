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
define(['Utils/WebGL', 'Utils/Texture', 'Utils/gl-matrix', 'Core/Client', 'Renderer/Map/Altitude', 'Renderer/SpriteRenderer'],
function(WebGL, Texture, glMatrix, Client, Altitude, SpriteRenderer) {

	'use strict';

	var mat4 = glMatrix.mat4;

	/**
	 * @var {WebGLProgram}
	 */
	var _program;

	/**
	 * @var {mat4}
	 */
	var _modelMatrix = mat4.create();

	/**
	 * Constants from original inspiration game
	 */
	var E_DIVISION = 21;           // Number of divisions (0-20)
	var FULL_DISPLAY_ANGLE = 315;  // 315° arc
	var DEG_TO_RAD = Math.PI / 180;

	/**
	 * Vertex Shader
	 */
	var _vertexShader = `
		#version 300 es
		precision highp float;

		in vec3 aPosition;
		in vec2 aTextureCoord;

		out vec2 vTextureCoord;

		uniform mat4 uModelViewMat;
		uniform mat4 uProjectionMat;
		uniform mat4 uModelMat;
		uniform float uZIndex;

		void main(void) {
			vec4 worldPos = uModelMat * vec4(aPosition, 1.0);
			gl_Position = uProjectionMat * uModelViewMat * worldPos;
			gl_Position.z -= uZIndex;
			vTextureCoord = aTextureCoord;
		}
	`;

	/**
	 * Fragment Shader
	 */
	var _fragmentShader = `
		#version 300 es
		precision highp float;

		in vec2 vTextureCoord;
		out vec4 fragColor;

		uniform sampler2D uDiffuse;
		uniform vec4 uColor;

		uniform bool  uFogUse;
		uniform float uFogNear;
		uniform float uFogFar;
		uniform vec3  uFogColor;

		void main(void) {
			vec4 texColor = texture(uDiffuse, vTextureCoord);

			if (texColor.a < 0.01) {
				discard;
			}

			// Discard near-black pixels
			if (texColor.r < 0.01 && texColor.g < 0.01 && texColor.b < 0.01) {
				discard;
			}

			fragColor = texColor * uColor;

			if (uFogUse) {
				float depth = gl_FragCoord.z / gl_FragCoord.w;
				float fogFactor = smoothstep(uFogNear, uFogFar, depth);
				fragColor = mix(fragColor, vec4(uFogColor, fragColor.w), fogFactor);
			}
		}
	`;

	/**
	 * SwirlingAura constructor
	 *
	 * Creates THREE bands as per original inspiration game:
	 * - GI[0]: RotStart=0°, max_height=15, distance=3.9, rise_angle=55°
	 * - GI[1]: RotStart=90°, max_height=13, distance=4.1, rise_angle=50°
	 * - GI[2]: RotStart=180°, max_height=11, distance=4.3, rise_angle=45°
	 */
	function SwirlingAura(position, textureName, tick, sizeType) {
		this.position = position;
		this.textureName = textureName;
		this.tick = tick;
		this.sizeType = sizeType || 4;  // 4 = blue, 7 = green

		// Scale factor: original inspiration game units to world units
		var GAME_TO_WORLD = 0.1 * 2.2;  // Adjusted for visual match

		// Color based on m_size (4 = blue, 7 = green)
		if (this.sizeType === 7) {
			this.color = { r: 100/255, g: 255/255, b: 100/255 };
		} else {
			this.color = { r: 100/255, g: 100/255, b: 255/255 };
		}

		// Alpha from original inspiration game: alphaB = 120
		this.alphaB = 120 / 255;

		// Create THREE bands with different parameters
		var INNER_CIRCLE_SCALE = 0.6;
		this.bands = [];
		for (var ec = 0; ec < 3; ec++) {
			this.bands.push({
				life: 1,
				process: 0,
				rotStart: ec * 90,                           // 0, 90, 180 degrees
				maxHeight: (15 - 2 * ec) * GAME_TO_WORLD,  // 15, 13, 11 (unchanged)
				distance: (3.9 + 0.2 * ec) * GAME_TO_WORLD * INNER_CIRCLE_SCALE, // 20% smaller
				riseAngle: (55 - 5 * ec) * DEG_TO_RAD,       // 55°, 50°, 45°
				spinSpeed: ec + 3,                            // 3, 4, 5 degrees per frame
				height: new Float32Array(E_DIVISION),         // Height profile
				flag1: new Uint8Array(E_DIVISION)             // Reached max flag
			});
		}

		// Angle step between divisions
		this.basicAngle = FULL_DISPLAY_ANGLE / (E_DIVISION - 1);  // 315/20 = 15.75°

		// Vertex buffers for each band
		this.buffers = null;
		this.indexBuffer = null;
		this.indexCount = 0;
	}

	/**
	 * Update height profile for a band
	 */
	SwirlingAura.prototype.updateHeightProfile = function(band) {
		var middle = 10;
		var step = 9;  // 90 / 10 = 9 degrees

		for (var i = 0; i < E_DIVISION; i++) {
			if (band.flag1[i] === 0) {
				// SinLimit = 90° + (i - middle) * step
				var sinLimit = (90 + (i - middle) * step) * DEG_TO_RAD;
				var sinLimitValue = Math.sin(sinLimit);
				var maxPossible = band.maxHeight * sinLimitValue;

				if (band.process <= 90) {
					// Build up phase: height = max_height * sin(SinLimit) * sin(process°)
					var sinProcess = Math.sin(band.process * DEG_TO_RAD);
					band.height[i] = band.maxHeight * sinLimitValue * sinProcess;
				}

				// Clamp to [0, maxPossible]
				band.height[i] = Math.max(0, Math.min(band.height[i], maxPossible));

				// Mark as reached max
				if (band.height[i] >= maxPossible * 0.99) {
					band.flag1[i] = 1;
				}
			}
		}
	};

	/**
	 * Generate mesh for a single band
	 */
	SwirlingAura.prototype.generateBandMesh = function(band) {
		var mesh = [];
		var cosRise = Math.cos(band.riseAngle);
		var sinRise = Math.sin(band.riseAngle);

		for (var k = 0; k < E_DIVISION; k++) {
			// Angle for this division
			var angle = (band.rotStart + k * this.basicAngle) * DEG_TO_RAD;
			var cosAngle = Math.cos(angle);
			var sinAngle = Math.sin(angle);

			// Base ring point at distance
			var baseX = band.distance * cosAngle;
			var baseY = 0;  // Ground level
			var baseZ = band.distance * sinAngle;

			// Height for this division
			var h = band.height[k];

			// Top point: offset by rotated height
			// Rx = cos(rise_angle) * h
			// Ry = sin(rise_angle) * h
			// top = base + (Rx*cos(angle), -Ry, Rx*sin(angle))
			var Rx = cosRise * h;
			var Ry = sinRise * h;

			var topX = baseX + Rx * cosAngle;
			var topY = -Ry;  // Negative Y is up
			var topZ = baseZ + Rx * sinAngle;

			// UV coordinates
			var u = k / (E_DIVISION - 1);

			// Add base vertex (inner)
			mesh.push(baseX, baseY, baseZ, u, 1.0);
			// Add top vertex (outer)
			mesh.push(topX, topY, topZ, u, 0.0);
		}

		return new Float32Array(mesh);
	};

	/**
	 * Generate index buffer
	 */
	SwirlingAura.prototype.generateIndices = function() {
		var indices = [];
		for (var k = 0; k < E_DIVISION - 1; k++) {
			var i0 = k * 2;      // Base of current
			var i1 = k * 2 + 1;  // Top of current
			var i2 = k * 2 + 2;  // Base of next
			var i3 = k * 2 + 3;  // Top of next

			// Two triangles per quad
			indices.push(i0, i1, i2);
			indices.push(i1, i3, i2);
		}
		return new Uint16Array(indices);
	};

	/**
	 * Initialize instance
	 */
	SwirlingAura.prototype.init = function init(gl) {
		var self = this;

		// Create vertex buffers for each band
		this.buffers = [];
		for (var i = 0; i < this.bands.length; i++) {
			this.buffers.push(gl.createBuffer());
		}

		// Create shared index buffer
		var indices = this.generateIndices();
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		this.indexCount = indices.length;

		// Load texture
		Client.loadFile('data/texture/effect/' + this.textureName, function(buffer) {
			WebGL.texture(gl, buffer, function(texture) {
				self.texture = texture;
				self.ready = true;
			});
		});
	};

	/**
	 * Free instance resources
	 */
	SwirlingAura.prototype.free = function free(gl) {
		if (this.buffers) {
			for (var i = 0; i < this.buffers.length; i++) {
				gl.deleteBuffer(this.buffers[i]);
			}
			this.buffers = null;
		}
		if (this.indexBuffer) {
			gl.deleteBuffer(this.indexBuffer);
			this.indexBuffer = null;
		}
		this.ready = false;
	};

	/**
	 * Render all three bands
	 */
	SwirlingAura.prototype.render = function render(gl, tick) {
		var uniform = _program.uniform;
		var attribute = _program.attribute;

		// Get ground height
		var groundZ = Altitude.getCellHeight(this.position[0], this.position[1]);

		// Build model matrix
		mat4.identity(_modelMatrix);
		mat4.translate(_modelMatrix, _modelMatrix, [
			this.position[0] + 0.5,
			-groundZ,
			this.position[1] + 0.5
		]);

		gl.uniformMatrix4fv(uniform.uModelMat, false, _modelMatrix);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aTextureCoord);
		var self = this;
		SpriteRenderer.setDepth(true, false, false, function(){
			// Render each band
			for (var ec = 0; ec < self.bands.length; ec++) {
				var band = self.bands[ec];
				if (!band.life) continue;

				// Update animation (Prim3DCasting)
				band.process++;
				band.rotStart = (band.rotStart + band.spinSpeed) % 360;

				// Update height profile
				self.updateHeightProfile(band);

				// Generate mesh for this band
				var vertices = self.generateBandMesh(band);

				// Upload vertex data
				gl.bindBuffer(gl.ARRAY_BUFFER, self.buffers[ec]);
				gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

				gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 5 * 4, 0);
				gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

				// Set color and alpha
				gl.uniform4f(uniform.uColor, self.color.r, self.color.g, self.color.b, self.alphaB);
				gl.uniform1f(uniform.uZIndex, 0.01 + ec * 0.001);

				// Draw
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
				gl.drawElements(gl.TRIANGLES, self.indexCount, gl.UNSIGNED_SHORT, 0);
			}
		});
	};

	/**
	 * Initialize static resources
	 */
	SwirlingAura.init = function init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);

		this.ready = true;
		this.renderBeforeEntities = true;
	};

	/**
	 * Free static resources
	 */
	SwirlingAura.free = function free(gl) {
		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}
		this.ready = false;
	};

	/**
	 * Before render setup
	 */
	SwirlingAura.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {
		var uniform = _program.uniform;
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);  // Additive blend

		gl.useProgram(_program);

		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);

		// Fog
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(uniform.uDiffuse, 0);
	};

	/**
	 * After render cleanup
	 */
	SwirlingAura.afterRender = function afterRender(gl) {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
	};

	return SwirlingAura;
});
