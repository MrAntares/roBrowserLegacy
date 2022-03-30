/**
 * Renderer/Effects/Cylinder.js
 *
 * Generate cone/cylinder/circle
 *
 * @author Vincent Thibault
 */
define(['Utils/WebGL', 'Utils/Texture', 'Utils/gl-matrix', 'Core/Client', 'Renderer/Camera'],
function(      WebGL,         Texture,          glMatrix,        Client,            Camera) {

	'use strict';


	/**
	 * @var {WebGLProgram}
	 */
	var _program;

	var blendMode = {};
	
	/**
	 * @var {WebGLBuffer}
	 */
	Cylinder.buffer;


	/**
	 * @var {mat4}
	 */
	var mat4 = glMatrix.mat4;


	/**
	 * @var {mat4} rotation matrix
	 */
	var _matrix = mat4.create();


	/**
	 * @var {number}
	 */
	Cylinder.verticeCount = 0;


	/**
	 * @var {string} Vertex Shader
	 */
	var _vertexShader   = `
		attribute vec3 aPosition;
		attribute vec2 aTextureCoord;
		
		varying vec2 vTextureCoord;
		
		uniform mat4 uModelViewMat;
		uniform mat4 uProjectionMat;
		uniform mat4 uRotationMat;
		uniform bool uRotate;
		uniform vec3 uPosition;
		uniform float uTopSize;
		uniform float uBottomSize;
		uniform float uHeight;
		
		void main(void) {
			float size, height;
			
			if (aPosition.z == 1.0) {
				size   = uTopSize;
				height = uHeight;
			} else {
				size   = uBottomSize;
				height = 0.0;
			}
			
			vec4 position  = vec4(uPosition.x + 0.5, -uPosition.z, uPosition.y + 0.5, 1.0);
			if(uRotate) {
				position += vec4(aPosition.x * size, -height, aPosition.y * size, 0.0) * uRotationMat;
			} else {
				position  += vec4(aPosition.x * size, 0.0, aPosition.y * size, 0.0);
			}
			
			gl_Position    = uProjectionMat * uModelViewMat * position;
			vTextureCoord  = aTextureCoord;
		}
	`;


	/**
	 * @var {string} Fragment Shader
	 */
	var _fragmentShader = `
		varying vec2 vTextureCoord;
		
		uniform sampler2D uDiffuse;
		
		uniform vec4 uSpriteRendererColor;
		
		uniform bool  uFogUse;
		uniform float uFogNear;
		uniform float uFogFar;
		uniform vec3  uFogColor;
		
		void main(void) {
			
			if (uSpriteRendererColor.a ==  0.0) { 
				discard; 
			}
			
			vec4 texture = texture2D( uDiffuse,  vTextureCoord.st );
			
			if (texture.a == 0.0) {
				discard;
			}
			
			if (texture.r < 0.1 || texture.g < 0.1 || texture.b < 0.1) {
               discard;
            }
			
			gl_FragColor   = texture * uSpriteRendererColor;
			
			if (uFogUse) {
				float depth = gl_FragCoord.z / gl_FragCoord.w;
				float fogFactor = smoothstep( uFogNear, uFogFar, depth );
				gl_FragColor    = mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );
			}
		}
	`;
	
	/*
	 * Sets how many sides the base "circle" of the cylinder has.
	 * @var {number} Base circle side count
	 */

	/**
	 * Generate a generic cylinder
	 *
	 * @returns {Float32Array} buffer array
	 */
	function generateCylinder(totalCircleSides, circleSides) {
		var i, a, b;
		var bottom = [];
		var top    = [];
		var mesh   = [];
		

		for (i = 0; i <= circleSides; i++) {
			a = (i + 0.0) / totalCircleSides;
			b = (i + 0.0) / totalCircleSides;

			bottom[i] = [ Math.sin( a * Math.PI * 2 ), Math.cos( a * Math.PI * 2 ), 0, a, 1 ];
			top[i]    = [ Math.sin( b * Math.PI * 2 ), Math.cos( b * Math.PI * 2 ), 1, b, 0 ];
		}

		for (i = 0; i <= circleSides; i++) {
			mesh.push.apply(mesh, bottom[i+0]);
			mesh.push.apply(mesh, top[i+0]);
			mesh.push.apply(mesh, bottom[i+1]);

			mesh.push.apply(mesh, top[i+0]);
			mesh.push.apply(mesh, bottom[i+1]);
			mesh.push.apply(mesh, top[i+1]);
		}

		return new Float32Array(mesh);
	}


	/**
	 * Cylinder constructor
	 *
	 * @param {Array} position
	 * @param {Object} effect attributes
	 * @param {number} Start tick
	 * @param {number} End tick
	 */
	function Cylinder(position, effect, startLifeTime, endLifeTime) {
		
		this.semiCircle = effect.semiCircle ? false : true;
		
		this.totalCircleSides = (!isNaN(effect.totalCircleSides)) ? effect.totalCircleSides : 20;
		this.circleSides = (!isNaN(effect.circleSides)) ? effect.circleSides : this.totalCircleSides;
		
		this.color = new Float32Array([1.0, 1.0, 1.0, 1.0]);
		if(!isNaN(effect.red)) this.color[0] = effect.red;
		if(!isNaN(effect.green)) this.color[1] = effect.green;
		if(!isNaN(effect.blue)) this.color[2] = effect.blue;
		
		//copy position instead of reference
		this.position = [];
		this.position[0] = position[0];
		this.position[1] = position[1];
		this.position[2] = position[2];
		
		this.posX = (!isNaN(effect.posX)) ? effect.posX : 0;
		this.posY = (!isNaN(effect.posY)) ? effect.posY : 0;
		this.posZ = (!isNaN(effect.posZ)) ? effect.posZ : 0;
		
		this.topSize = effect.topSize;
		this.bottomSize = effect.bottomSize;
		this.textureName = effect.textureName;
		this.height = effect.height;
		
		this.animation = effect.animation;
		this.fade = effect.fade;
		this.rotate = effect.rotate;
		
		if (effect.alphaMax > 0) this.alphaMax = effect.alphaMax;
		else this.alphaMax = 1.0;
		
		this.angleX = (!isNaN(effect.angleX)) ? effect.angleX : 0;
		this.angleY = (!isNaN(effect.angleY)) ? effect.angleY : 0;
		this.angleZ = (!isNaN(effect.angleZ)) ? effect.angleZ : 0;
		
		this.rotateWithCamera = effect.rotateWithCamera ? true : false;
		
		this.blendMode = effect.blendMode;
		this.startLifeTime = startLifeTime;
		this.endLifeTime = endLifeTime;
	}


	/**
	 * Preparing for render
	 *
	 * @param {object} webgl context
	 */
	Cylinder.prototype.init = function init( gl )
	{
		
		this.vertices = generateCylinder(this.totalCircleSides, this.circleSides);
		this.verticeCount = this.vertices.length / 5;

		_program = WebGL.createShaderProgram(gl, _vertexShader, _fragmentShader);
		this.buffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
		
		var self  = this;
		Client.loadFile('data/texture/effect/' + this.textureName + '.tga', function(buffer) {
			WebGL.texture( gl, buffer, function(texture) {
				self.texture = texture;
				self.ready   = true;
			});
		});
	};


	/**
	 * Destroying data
	 *
	 * @param {object} webgl context
	 */
	Cylinder.prototype.free = function free( gl )
	{
		this.ready = false;
	};


	/**
	 * Rendering cast
	 *
	 * @param {object} wegl context
	 */
	Cylinder.prototype.render = function render(gl, tick) {
		var renderCount = tick - this.startLifeTime;
		var duration = this.endLifeTime - this.startLifeTime;
		var uniform = _program.uniform;
		var attribute = _program.attribute;
		
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		
		gl.enableVertexAttribArray(attribute.aPosition);
		gl.enableVertexAttribArray(attribute.aTextureCoord);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		
		gl.vertexAttribPointer(attribute.aPosition, 3, gl.FLOAT, false, 4 * 5, 0);
		gl.vertexAttribPointer(attribute.aTextureCoord, 2, gl.FLOAT, false, 4 * 5, 3 * 4);
		
		gl.uniform1f(uniform.uBottomSize, this.bottomSize);

		if (this.animation == 1) {
			if (duration > 1000) {
				if (renderCount <= 1000) gl.uniform1f(uniform.uHeight, renderCount / 1000 * this.height);
				else gl.uniform1f(uniform.uHeight, this.height);
			} else gl.uniform1f(uniform.uHeight, renderCount / duration * this.height);
			gl.uniform1f(uniform.uTopSize, this.topSize);
		} else if (this.animation == 2) {
			gl.uniform1f(uniform.uHeight, this.height);
			if (duration > 1000) {
				if (renderCount <= 1000) gl.uniform1f(uniform.uTopSize, renderCount / 1000 * this.topSize);
				else gl.uniform1f(uniform.uTopSize, this.topSize);
			} else gl.uniform1f(uniform.uTopSize, renderCount / duration * this.topSize);
		} else if (this.animation == 3) {
			gl.uniform1f(uniform.uHeight, this.height);
			gl.uniform1f(uniform.uBottomSize, (1 - renderCount / duration) * this.bottomSize);
			gl.uniform1f(uniform.uTopSize, (1 - renderCount / duration) * this.topSize);
			if (renderCount < duration / 2) gl.uniform1f(uniform.uHeight, renderCount * this.height / (duration / 2));
			else if (renderCount > duration / 2) gl.uniform1f(uniform.uHeight, (duration - renderCount) * this.height / (duration / 2));
		} else if (this.animation == 4) {
			gl.uniform1f(uniform.uHeight, this.height);
			var bottomSize = renderCount / duration * this.bottomSize;
			if (bottomSize < 0) bottomSize = 0;
			var topSize = renderCount / duration * this.topSize;
			if (topSize < 0) topSize = 0;
			gl.uniform1f(uniform.uBottomSize, bottomSize);
			gl.uniform1f(uniform.uTopSize, topSize);
		} else if (this.animation == 5) {
			if (renderCount < duration / 2) gl.uniform1f(uniform.uHeight, renderCount * 2 / duration * this.height);
			else gl.uniform1f(uniform.uHeight, (duration - renderCount) * this.height / (duration / 2));
			gl.uniform1f(uniform.uTopSize, this.topSize);
		} else {
			gl.uniform1f(uniform.uHeight, this.height);
			gl.uniform1f(uniform.uTopSize, this.topSize);
		}
		
		this.color[3] = this.alphaMax;
		
		if (this.fade) {
			if (renderCount < duration / 4) this.color[3] = renderCount * this.alphaMax / (duration / 4);
			else if (renderCount > duration / 2 + duration / 4) this.color[3] = (duration - renderCount) * this.alphaMax / (duration / 4);
		}
		
		gl.uniform4fv(uniform.uSpriteRendererColor, this.color);
		
		if (this.blendMode > 0 && this.blendMode < 16) {
			gl.blendFunc(gl.SRC_ALPHA, blendMode[this.blendMode]);
		} else {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		}
		
		var currentPosition = [this.position[0], this.position[1], this.position[2]];
		
		if(this.rotate || this.angleX || this.angleY || this.angleZ || this.rotateWithCamera){
			mat4.identity(_matrix);
			
			if(this.rotate){ mat4.rotateY(_matrix, _matrix, tick / 4 / 180 * Math.PI); }
			
			if(this.angleX){ mat4.rotateX(_matrix, _matrix, this.angleX / 180 * Math.PI); }
			if(this.angleY){ mat4.rotateY(_matrix, _matrix, this.angleY / 180 * Math.PI); }
			if(this.angleZ){ mat4.rotateZ(_matrix, _matrix, this.angleZ / 180 * Math.PI); }
			
			if(this.rotateWithCamera){
				var cRad = Camera.angle[1] * Math.PI / 180;
				if (this.posX || this.posY){
					currentPosition[0] += (this.posX * Math.cos(cRad) - this.posY * Math.sin(cRad));
					currentPosition[1] += (this.posY * Math.cos(cRad) + this.posX * Math.sin(cRad));
				}
				mat4.rotateY(_matrix, _matrix, cRad);
			}
			
			gl.uniform1i(uniform.uRotate, true);
			gl.uniformMatrix4fv(uniform.uRotationMat, false, _matrix);
		}
		
		currentPosition[2] += this.posZ; 
		
		gl.uniform3fv(uniform.uPosition, currentPosition);
		
		gl.drawArrays(gl.TRIANGLES, 0, this.verticeCount);
		
		this.needCleanUp = this.endLifeTime < tick;
	};


	/**
	 * Initialize effect
	 *
	 * @param {object} webgl context
	 */
	Cylinder.init = function init(gl) {
		
		blendMode[1] = gl.ZERO;
		blendMode[2] = gl.ONE;
		blendMode[3] = gl.SRC_COLOR;
		blendMode[4] = gl.ONE_MINUS_SRC_COLOR;
		blendMode[5] = gl.DST_COLOR;
		blendMode[6] = gl.ONE_MINUS_DST_COLOR;
		blendMode[7] = gl.SRC_ALPHA;
		blendMode[8] = gl.ONE_MINUS_SRC_ALPHA;
		blendMode[9] = gl.DST_ALPHA;
		blendMode[10] = gl.ONE_MINUS_DST_ALPHA;
		blendMode[11] = gl.CONSTANT_COLOR;
		blendMode[12] = gl.ONE_MINUS_CONSTANT_COLOR;
		blendMode[13] = gl.CONSTANT_ALPHA;
		blendMode[14] = gl.ONE_MINUS_CONSTANT_ALPHA;
		blendMode[15] = gl.SRC_ALPHA_SATURATE;
		
		this.ready = true;
		this.renderBeforeEntities = false;
	};


	/**
	 * Destroy objects
	 *
	 * @param {object} webgl context
	 */
	Cylinder.free = function free(gl)
	{
		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}

		if (this.buffer) {
			gl.deleteBuffer(this.buffer);
		}

		this.ready = false;
	};


	/**
	 * Before render, set up program
	 *
	 * @param {object} webgl context
	 */
	Cylinder.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {
		var uniform = _program.uniform;
		
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
		gl.uniform1i(uniform.uDiffuse, 0);
	};


	/**
	 * After render, clean attributes
	 *
	 * @param {object} webgl context
	 */
	Cylinder.afterRender = function afterRender(gl) {
		gl.disableVertexAttribArray(_program.attribute.aPosition);
		gl.disableVertexAttribArray(_program.attribute.aTextureCoord);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	};


	/**
	 * Export
	 */
	return Cylinder;
});
