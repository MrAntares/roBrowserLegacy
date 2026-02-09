define(['Utils/WebGL', 'Utils/gl-matrix', 'DB/Skills/SkillConst', 'Core/Client', 'Renderer/Map/Altitude'], function (
	WebGL,
	glMatrix,
	SkillID,
	Client,
	Altitude
) {
	'use strict';

	var _texture;
	var _program;
	var mat4 = glMatrix.mat4;
	var _matrix = mat4.create();

	var _vertexShader = `
        #version 300 es
		#pragma vscode_glsllint_stage : vert
		precision highp float;

		in vec3 aPosition;
		in vec2 aTextureCoord;
		out vec2 vTextureCoord;
		uniform mat4 uModelViewMat;
		uniform mat4 uProjectionMat;
		uniform mat4 uRotationMat;
		void main(void) {
			gl_Position    = uProjectionMat * uModelViewMat * vec4( aPosition.x, aPosition.y - 0.5, aPosition.z, 1.0);
			gl_Position.z -= 0.01;
			vTextureCoord  = (uRotationMat * vec4( aTextureCoord - 0.5, 1.0, 1.0)).xy + 0.5;
		}
	`;

	var _fragmentShader = `
        #version 300 es
        #pragma vscode_glsllint_stage : frag
        precision highp float;
        
		in vec2 vTextureCoord;
		uniform sampler2D uDiffuse;
		uniform vec4 uSpriteRendererColor;
		uniform bool  uFogUse;
		uniform float uFogNear;
		uniform float uFogFar;
		uniform vec3  uFogColor;
		out vec4 fragColor;
		
		void main(void) {
			if (uSpriteRendererColor.a == 0.0) { discard; }
			
			vec4 textureSample = texture( uDiffuse,  vTextureCoord.st );
			
			if (textureSample.a == 0.0 ) { discard; }
			
			fragColor = textureSample * uSpriteRendererColor;
			
			if (uFogUse) {
				float depth     = gl_FragCoord.z / gl_FragCoord.w;
				float fogFactor = smoothstep( uFogNear, uFogFar, depth );
				fragColor    = mix( fragColor, vec4( uFogColor, fragColor.w ), fogFactor );
			}
		}
	`;

	function GroundEffect(posX, posY) {
		this.x = posX;
		this.y = posY;
		this.position = new Int16Array([posX, posY, 1]);
		this.size = 5;
	}

	GroundEffect.prototype.init = function init(gl) {
		var plane = Altitude.generatePlane(this.x, this.y, this.size);
		this.buffer = gl.createBuffer();
		this.vertCount = plane.length / 5;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, plane, gl.STATIC_DRAW);
		this.ready = true;
	};

	GroundEffect.prototype.free = function free(gl) {
		gl.deleteBuffer(this.buffer);
		this.ready = false;
	};

	GroundEffect.prototype.render = function render(gl, tick) {
		var attribute = _program.attribute;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 5 * 4, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
		gl.drawArrays(gl.TRIANGLES, 0, this.vertCount);
	};

	GroundEffect.init = function init(gl) {
		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		Client.loadFile('data/texture/effect/pok2.tga', function (buffer) {
			WebGL.texture(gl, buffer, function (texture) {
				_texture = texture;
				GroundEffect.ready = true;
			});
		});
		this.color = new Float32Array(4);
		this.color[0] = 1.0;
		this.color[1] = 1.0;
		this.color[2] = 1.0;
		this.color[3] = 0.4;
	};

	GroundEffect.renderBeforeEntities = false;

	GroundEffect.free = function free(gl) {
		if (_texture) {
			gl.deleteTexture(_texture);
			_texture = null;
		}

		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}

		this.ready = false;
	};

	GroundEffect.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {
		var uniform = _program.uniform;
		var attribute = _program.attribute;

		gl.depthMask(false);
		mat4.identity(_matrix);
		gl.useProgram(_program);
		gl.uniformMatrix4fv(uniform.uModelViewMat, false, modelView);
		gl.uniformMatrix4fv(uniform.uProjectionMat, false, projection);
		gl.uniformMatrix4fv(uniform.uRotationMat, false, _matrix);
		gl.uniform1i(uniform.uFogUse, fog.use && fog.exist);
		gl.uniform1f(uniform.uFogNear, fog.near);
		gl.uniform1f(uniform.uFogFar, fog.far);
		gl.uniform3fv(uniform.uFogColor, fog.color);
		gl.uniform4fv(uniform.uSpriteRendererColor, this.color);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, _texture);
		gl.uniform1i(uniform.uDiffuse, 0);
		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aTextureCoord);
	};

	GroundEffect.afterRender = function afterRender(gl) {
		gl.depthMask(true);
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};

	return GroundEffect;
});
