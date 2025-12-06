/**
 * @module Renderer/Effects/RsmEffect
 *
 * Rendering Rsm,Rsm2 File object
 */
define(['Utils/WebGL', 'Utils/gl-matrix', 'Core/Client', 'Loaders/Model'], function (WebGL, glMatrix, Client, Model) {
	"use strict";

	var _program   = null;
	var _normalMat = new Float32Array(3 * 3);
	var mat4	   = glMatrix.mat4;
	var mat3	   = glMatrix.mat3;

	/**
	 * @var {string} vertex shader
	 */
var _vertexShader = `
		#version 300 es
		#pragma vscode_glsllint_stage : vert
		precision highp float;

		in vec3 aPosition;
		in vec3 aVertexNormal;
		in vec2 aTextureCoord;
		in float aAlpha;

		out vec2 vTextureCoord;
		out float vLightWeighting;
		out float vAlpha;

		uniform mat4 uModelViewMat;
		uniform mat4 uProjectionMat;

		uniform vec3 uLightDirection;
		uniform mat3 uNormalMat;

		uniform vec3 uPosition;
		uniform float uSize;

		void main(void) {

			vec4 position  = vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);
			position += vec4(aPosition.x * uSize, aPosition.y * -uSize, aPosition.z * uSize, 0.0);

			gl_Position	 = uProjectionMat * uModelViewMat * position;

			vTextureCoord   = aTextureCoord;
			vAlpha		  = aAlpha;

			vec4 lDirection  = uModelViewMat * vec4( uLightDirection, 0.0);
			vec3 dirVector   = normalize(lDirection.xyz);
			float dotProduct = dot( uNormalMat * aVertexNormal, dirVector );
			vLightWeighting  = max( dotProduct, 0.5 );
		}
	`;


	/**
	 * @var {string} fragment shader
	 */
var _fragmentShader = `
		#version 300 es
		#pragma vscode_glsllint_stage : frag
		precision highp float;

		in vec2 vTextureCoord;
		in float vLightWeighting;
		in float vAlpha;
		out vec4 fragColor;

		uniform sampler2D uDiffuse;

		uniform bool  uFogUse;
		uniform float uFogNear;
		uniform float uFogFar;
		uniform vec3  uFogColor;

		uniform vec3  uLightAmbient;
		uniform vec3  uLightDiffuse;
		uniform float uLightOpacity;

		void main(void) {
			vec4 textureSample  = texture( uDiffuse,  vTextureCoord.st );

			if (textureSample.a == 0.0) {
				discard;
			}

			vec3 Ambient	= uLightAmbient * uLightOpacity;
			vec3 Diffuse	= uLightDiffuse * vLightWeighting;
			vec4 LightColor = vec4( Ambient + Diffuse, 1.0);

			fragColor	= textureSample * clamp(LightColor, 0.0, 1.0);
			fragColor.a *= vAlpha;

			if (uFogUse) {
				float depth	 = gl_FragCoord.z / gl_FragCoord.w;
				float fogFactor = smoothstep( uFogNear, uFogFar, depth );
				fragColor	= mix( fragColor, vec4( uFogColor, fragColor.w ), fogFactor );
			}
		}
	`;

	var _light = {
		opacity:   1.0,
		ambient:   new Float32Array([1, 1, 1]),
		diffuse:   new Float32Array([0, 0, 0]),
		direction: new Float32Array([0, 1, 0]),
	};


	function RsmEffect(params) {
		this.position = params.Inst.position;
		this.size = 1;
		this.filename = 'data\\model\\' + params.effect.file + '.rsm';
		this.objects = [];
		this.buffer = null;
		this.globalParameters = {
			position: new Float32Array(3),
			rotation: new Float32Array(3),
			scale:	new Float32Array([-0.075, -0.075, 0.075]),
			filename: null
		};
	}

	function initModel(gl, data) {
		var self = this;
		var count	   = data.infos.length;
		this.objects.length = count;

		// Create a buffer if it doesn't exist
		if (!this.buffer) {
			this.buffer = gl.createBuffer();
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data.buffer, gl.STATIC_DRAW);

		function onTextureLoaded(texture, i) {
			self.objects[i].texture  = texture;
			self.objects[i].complete = true;
		}

		// Fetch all images, and draw them in a mega-texture
		for (var i = 0; i < count; ++i) {
			if (!this.objects[i]) {
				this.objects[i] = {};
			}

			this.objects[i].vertCount  = data.infos[i].vertCount;
			this.objects[i].vertOffset = data.infos[i].vertOffset;
			this.objects[i].complete   = false;

			WebGL.texture(gl, data.infos[i].texture, onTextureLoaded, i);
		}
	}

	RsmEffect.init = function init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);

		this.ready = true;
	};

	RsmEffect.prototype.init = function render(gl, tick) {
		var self	 = this;

		Client.getFile(this.filename, function (buf) {
			self.model = new Model(buf);

			var data;
			var i, count, j, size, total, offset, length, pos;
			var objects = [], infos = [], meshes, index, object;
			var buffer;

			// Create model in world
			self.globalParameters.filename = self.filename.replace('data/model/', '') + Math.floor(Math.random() * 15);
			self.model.createInstance(self.globalParameters, 0, 0);

			// Compile model
			data  = self.model.compile();
			count = data.meshes.length;
			total = 0;

			// Extract meshes
			for (i = 0, count = data.meshes.length; i < count; ++i) {
				meshes = data.meshes[i];
				index  = Object.keys(meshes);

				for (j = 0, size = index.length; j < size; ++j) {
					objects.push({
						texture: data.textures[index[j]],
						alpha:   self.model.alpha,
						mesh:	meshes[index[j]]
					});

					total += meshes[index[j]].length;
				}
			}

			buffer = new Float32Array(total);
			count  = objects.length;
			pos	= 0;
			offset = 0;

			// Merge meshes to buffer
			for (i = 0; i < count; ++i) {
				object = objects[i];
				length = object.mesh.length;

				infos[i] = {
					texture:	'data/texture/' + object.texture,
					vertOffset: offset / 9,
					vertCount:  length / 9
				};

				// Add to buffer
				buffer.set(object.mesh, offset);
				offset += length;
			}

			// Load textures
			i = -1;

			function loadNextTexture() {

				// Loading complete, rendering...
				if ((++i) === count) {
					// Initialize renderer
					initModel.call(self, gl, {
						buffer: buffer,
						infos:  infos
					});
					self.ready = true;
					return;
				}

				Client.loadFile(infos[i].texture, function (data) {
					infos[i].texture = data;
					loadNextTexture();
				}, loadNextTexture);
			}

			// Start loading textures
			loadNextTexture();
		});
	}

	RsmEffect.prototype.free = function free(gl) {
		for (var i = 0, count = this.objects.length; i < count; ++i) {
			gl.deleteTexture(this.objects[i].texture);
		}

		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
			this.buffer = null;
		}

		this.objects.length = 0;
		this.ready = false;
	};

	RsmEffect.free = function free(gl) {
		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}

		this.ready	  = false;
	};

	RsmEffect.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {

		// Calculate normal mat
		mat4.toInverseMat3(modelView, _normalMat);
		mat3.transpose(_normalMat, _normalMat);


		// -- render
		var uniform   = _program.uniform;
		var attribute = _program.attribute;

		gl.useProgram(_program);

		// Bind matrix
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
		gl.uniformMatrix3fv(uniform.uNormalMat, false, _normalMat);

		// Bind light
		gl.uniform3fv(uniform.uLightDirection, _light.direction);
		gl.uniform1f(uniform.uLightOpacity, _light.opacity);
		gl.uniform3fv(uniform.uLightAmbient, _light.ambient);
		gl.uniform3fv(uniform.uLightDiffuse, _light.diffuse);

		// Fog settings
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);

		// Enable all attributes
		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aVertexNormal);
		gl.enableVertexAttribArray(attribute.aTextureCoord);
		gl.enableVertexAttribArray(attribute.aAlpha);

		// Textures
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(uniform.uDiffuse, 0);
	};

	RsmEffect.prototype.render = function render(gl, tick) {
		var uniform = _program.uniform;

		gl.uniform3fv(uniform.uPosition, this.position);
		gl.uniform1f( uniform.uSize, this.size);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

		// Resetting attributes because buffer has changed
		var attribute = _program.attribute;
		// Link attribute
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 9 * 4, 0);
		gl.vertexAttribPointer(attribute.aVertexNormal, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 9 * 4, 6 * 4);
		gl.vertexAttribPointer(attribute.aAlpha, 1, gl.FLOAT, false, 9 * 4, 8 * 4);

		for (var i = 0, count = this.objects.length; i < count; ++i) {
			if (this.objects[i].complete) {
				gl.bindTexture(gl.TEXTURE_2D, this.objects[i].texture);
				gl.drawArrays(gl.TRIANGLES, this.objects[i].vertOffset, this.objects[i].vertCount);
			}
		}
	}

	RsmEffect.afterRender = function afterRender(gl) {
		var attribute = _program.attribute;
		gl.disableVertexAttribArray(attribute.aPosition);
		gl.disableVertexAttribArray(attribute.aVertexNormal);
		gl.disableVertexAttribArray(attribute.aTextureCoord);
		gl.disableVertexAttribArray(attribute.aAlpha);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};

	return RsmEffect;
});
