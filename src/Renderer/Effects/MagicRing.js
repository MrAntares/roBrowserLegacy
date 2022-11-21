/**
 * Renderer/Effects/MagicRing.js
 *
 * Generate a Magic Ring under caster
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(['Utils/WebGL', 'Utils/Texture', 'Utils/gl-matrix', 'Core/Client'],
function(      WebGL,         Texture,          glMatrix,        Client) {

	'use strict';


	/**
	 * @var {WebGLProgram}
	 */
	var _program;


	/**
	 * @var {WebGLBuffer}
	 */
	var _buffer;


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
	var _verticeCount = 0;


	/**
	 * @var {string} Vertex Shader
	 */
	var _vertexShader   = [
		'attribute vec3 aPosition;',
		'attribute vec2 aTextureCoord;',

		'varying vec2 vTextureCoord;',

		'uniform mat4 uModelViewMat;',
		'uniform mat4 uProjectionMat;',
		'uniform mat4 uRotationMat;',

		'uniform vec3 uPosition;',
		'uniform float uTopSize;',
		'uniform float uBottomSize;',
		'uniform float uHeight;',

		'void main(void) {',
			'float size, height;',

			'if (aPosition.z == 1.0) {',
				'size   = uTopSize;',
				'height = uHeight;',
			'}',
			'else {',
				'size   = uBottomSize;',
				'height = 0.0;',
			'}',

			'vec4 position  = vec4(uPosition.x + 0.5, -uPosition.z - height, uPosition.y + 0.5, 1.0);',
			'position      += vec4(aPosition.x * size, 0.0, aPosition.y * size, 0.0) * uRotationMat;',

			'gl_Position    = uProjectionMat * uModelViewMat * position;',
			'vTextureCoord  = aTextureCoord;',
		'}'
	].join('\n');


	/**
	 * @var {string} Fragment Shader
	 */
	var _fragmentShader = [
		'varying vec2 vTextureCoord;',

		'uniform sampler2D uDiffuse;',

		'uniform bool  uFogUse;',
		'uniform float uFogNear;',
		'uniform float uFogFar;',
		'uniform vec3  uFogColor;',

		'void main(void) {',
			'vec4 texture = texture2D( uDiffuse,  vTextureCoord.st );',

			'if (texture.a == 0.0) {',
			'	discard;',
			'}',

            'if (texture.r < 0.5 || texture.g < 0.5 || texture.b < 0.5) {',
            '   discard;',
            '}',
			'texture.a = 0.7;',
			'gl_FragColor = texture;',

			'if (uFogUse) {',
				'float depth     = gl_FragCoord.z / gl_FragCoord.w;',
				'float fogFactor = smoothstep( uFogNear, uFogFar, depth );',
				'gl_FragColor    = mix( gl_FragColor, vec4( uFogColor, gl_FragColor.w ), fogFactor );',
			'}',
		'}'
	].join('\n');


	/**
	 * Generate a generic MagicRing
	 *
	 * @returns {Float32Array} buffer array
	 */
	function generateMagicRing()
	{
		var i, a, b;
		var total = 20;
		var bottom = [];
		var top    = [];
		var mesh   = [];

		for (i = 0; i <= total; i++) {
			a = (i + 0.0) / total;
			b = (i + 0.5) / total;

			bottom[i] = [ Math.sin( a * Math.PI * 2 ), Math.cos( a * Math.PI * 2 ), 0, a, 1 ];
			top[i]    = [ Math.sin( b * Math.PI * 2 ), Math.cos( b * Math.PI * 2 ), 1, b, 0 ];
		}

		for (i = 0; i <= total; i++) {
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
	 * MagicRing constructor
	 *
	 * @param {Array} position
	 * @param {number} top size of the MagicRing
	 * @param {number} bottom size of the MagicRing
	 * @param {number} height of the MagicRing
	 * @param {string} texture name
	 * @param {number} game tick
	 */
	function MagicRing( target, topSize, bottomSize, height, textureName, endTick )
	{
		this.target      = target;
		this.topSize     = topSize;
		this.bottomSize  = bottomSize;
		this.textureName = textureName;
		this.height      = height;
		this.endTick = endTick;
	}


	/**
	 * Preparing for render
	 *
	 * @param {object} webgl context
	 */
	MagicRing.prototype.init = function init( gl )
	{
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
	MagicRing.prototype.free = function free( gl )
	{
		this.ready = false;
	};


	/**
	 * Rendering cast
	 *
	 * @param {object} wegl context
	 */
	MagicRing.prototype.render = function render( gl, tick )
	{
		var uniform = _program.uniform;
		var attribute = _program.attribute;

		gl.bindTexture( gl.TEXTURE_2D, this.texture );

		// Enable all attributes
		gl.enableVertexAttribArray( attribute.aPosition );
		gl.enableVertexAttribArray( attribute.aTextureCoord );

		gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );

		gl.vertexAttribPointer( attribute.aPosition,     3, gl.FLOAT, false, 4*5,  0   );
		gl.vertexAttribPointer( attribute.aTextureCoord, 2, gl.FLOAT, false, 4*5,  3*4 );

		gl.uniform3fv( uniform.uPosition,   this.target.position);
		gl.uniform1f(  uniform.uBottomSize, this.bottomSize);
		gl.uniform1f(  uniform.uTopSize,    this.topSize);
		gl.uniform1f(  uniform.uHeight,     this.height);

		gl.drawArrays( gl.TRIANGLES, 0, _verticeCount );
        this.needCleanUp = this.endTick < tick;
        if(!this.target.cast.display){
            this.needCleanUp = true;
        }
	};


	/**
	 * Initialize effect
	 *
	 * @param {object} webgl context
	 */
	MagicRing.init = function init(gl)
	{
		var vertices  = generateMagicRing();
		_verticeCount = vertices.length / 5;

		_program   = WebGL.createShaderProgram( gl, _vertexShader, _fragmentShader );
		_buffer    = gl.createBuffer();
		this.ready = true;
		this.renderBeforeEntities = false;

		gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
		gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );
	};


	/**
	 * Destroy objects
	 *
	 * @param {object} webgl context
	 */
	MagicRing.free = function free(gl)
	{
		if (_program) {
			gl.deleteProgram(_program);
			_program = null;
		}

		if (_buffer) {
			gl.deleteBuffer(_buffer);
		}

		this.ready = false;
	};


	/**
	 * Before render, set up program
	 *
	 * @param {object} webgl context
	 */
	MagicRing.beforeRender = function beforeRender(gl, modelView, projection, fog, tick)
	{
		var uniform   = _program.uniform;

		mat4.identity(_matrix);
		mat4.rotateY( _matrix, _matrix, (tick/4) / 180 * Math.PI);

		gl.useProgram( _program );

		// Bind matrix
		gl.uniformMatrix4fv( uniform.uModelViewMat,  false, modelView );
		gl.uniformMatrix4fv( uniform.uProjectionMat, false, projection );
		gl.uniformMatrix4fv( uniform.uRotationMat,   false, _matrix);

		// Fog settings
		gl.uniform1i(  uniform.uFogUse,   fog.use && fog.exist );
		gl.uniform1f(  uniform.uFogNear,  fog.near );
		gl.uniform1f(  uniform.uFogFar,   fog.far  );
		gl.uniform3fv( uniform.uFogColor, fog.color );

		// Texture
		gl.activeTexture( gl.TEXTURE0 );
		gl.uniform1i( uniform.uDiffuse, 0 );
	};


	/**
	 * After render, clean attributes
	 *
	 * @param {object} webgl context
	 */
	MagicRing.afterRender = function afterRender(gl)
	{
		gl.disableVertexAttribArray( _program.attribute.aPosition );
		gl.disableVertexAttribArray( _program.attribute.aTextureCoord );
	};


	/**
	 * Export
	 */
	return MagicRing;
});
