/**
 * Utils/WebGL.js
 *
 * WebGL Helper function
 *
 * Trying to define here some functions related to webgl.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define( ['Utils/Texture', 'Core/Configs'], function( Texture, Configs )
{
	'use strict';


	/**
	 * Get WebGL Context
	 *
	 * @param {object} canvas element
	 * @param {object} parameters
	 *
	 * @return {object} webgl context
	 */
	function getContext( canvas, parameters )
	{
		var gl = null;
		var names;
		var i, count;

		// Default options
		if (!parameters) {
			parameters = {
				alpha:              false,
				depth:              true,
				stencil:            false,
				antialias:          true,
				premultipliedAlpha: false,
				preserveDrawingBuffer: true,
			};
		}

		// Prefer a high-performance context when available
		if (parameters && parameters.powerPreference === undefined) {
			parameters.powerPreference = 'high-performance';
		}

		// WebGL2 only (fallback to experimental-webgl2 name if needed)
		names = ['webgl2', 'experimental-webgl2'];
		count = names.length;

		// Find the context
		if (canvas.getContext) {
			for (i = 0; i < count; ++i) {
				try {
					gl = canvas.getContext( names[i], parameters );
					if (gl) {
						break;
					}
				} catch(e) {}
			}
		}

		// :(
		if (!gl) {
			throw new Error('WebGL::getContext() - WebGL2 is required but not available.');
		}

		return gl;
	}

	/**
	 * Compile Webgl shader (fragment and vertex)
	 *
	 * @param {object} gl context
	 * @param {string} source
	 * @param {number} type (fragment or shader constant)
	 */
	function compileShader( gl, source, type)
	{
		var shader, error;

		// Ensure #version is first token by trimming leading whitespace/BOM
		if (source && source.charCodeAt(0) === 0xFEFF) {
			source = source.slice(1);
		}
		source = source.replace(/^\s+/, '');

		// Compile shader
		shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		// Is there an error ?
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			error = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);

			throw new Error('WebGL::CompileShader() - Fail to compile shader : ' + error);
		}

		return shader;
	}


	/**
	 * Create a Program from a webgl shader
	 *
	 * @param {object} gl context
	 * @param {string} vertexShader
	 * @param {string} fragmentShader
	 */
	function createShaderProgram( gl, vertexShader, fragmentShader )
	{
		var shaderProgram,
		    vs, fs,
			attrib, uniform,
			i, count,
			error;

		// Compile shader and attach them
		shaderProgram = gl.createProgram();
		vs = compileShader( gl, vertexShader  , gl.VERTEX_SHADER );
		fs = compileShader( gl, fragmentShader, gl.FRAGMENT_SHADER );

		gl.attachShader(shaderProgram, vs);
		gl.attachShader(shaderProgram, fs);
		gl.linkProgram(shaderProgram);

		// Is there an error
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			error = gl.getProgramInfoLog(shaderProgram);
			gl.deleteProgram(shaderProgram);
			gl.deleteShader(vs);
			gl.deleteShader(fs);

			throw new Error('WebGL::CreateShaderProgram() - Fail to link shaders : ' + error);
		}

		// Get back attributes
		count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
		shaderProgram.attribute = {};

		for (i = 0; i < count; i++) {
			attrib = gl.getActiveAttrib(shaderProgram, i);
			shaderProgram.attribute[attrib.name] = gl.getAttribLocation(shaderProgram, attrib.name);
		}

		// Get back uniforms
		count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
		shaderProgram.uniform = {};

		for (i = 0; i < count; i++) {
			uniform = gl.getActiveUniform(shaderProgram, i);
			shaderProgram.uniform[uniform.name] = gl.getUniformLocation(shaderProgram, uniform.name);
		}

		return shaderProgram;
	}

	/**
	 * Create main (FBO) for texture collors and depth renderbuffer.
	 */
	function createFramebuffer (gl, width, height) {
		if (gl.fbo) {
			// Cleaning old resources if exist
			gl.deleteTexture(gl.fbo.texture);
			gl.deleteRenderbuffer(gl.fbo.rbo);
			gl.deleteFramebuffer(gl.fbo.framebuffer);
		}

		var fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

		// Color Attachment
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

		// Prevents Artifacts filter and wrapper in FBO
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

		// Depth Attachment
		var rbo = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);

		// Status checking
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
			console.error("WebGL::createFramebuffer() - Incomplete Framebuffer!");
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);

		gl.fbo = {
			framebuffer: fbo,
			texture: texture,
			rbo: rbo,
			width: width,
			height: height
		};

		return gl.fbo;
	}

	/**
	 * Webgl Require textures to be power of two size
	 *
	 * @param {number} num
	 * @return {number}
	 */
	function toPowerOfTwo( num )
	{
		return Math.pow( 2, Math.ceil( Math.log(num)/Math.log(2) ) );
	}


	/**
	 * Load an image and push it to GPU
	 *
	 * @param {object} gl context
	 * @param {string} url
	 * @param {function} callback once the image is on gpu
	 */
	function texture( gl, url, callback )
	{
		var args = Array.prototype.slice.call(arguments, 3);

		Texture.load( url, function( success ) {
			if (!success) {
				return;
			}

			var canvas, ctx, texture;
			var enableMipmap = Configs.get('enableMipmap');

			canvas        = document.createElement('canvas');
			canvas.width  = toPowerOfTwo(this.width);
			canvas.height = toPowerOfTwo(this.height);
			ctx           = canvas.getContext('2d');
			ctx.drawImage( this, 0, 0, canvas.width, canvas.height );

			texture = gl.createTexture();
			gl.bindTexture( gl.TEXTURE_2D, texture );
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			if(enableMipmap) {
				gl.generateMipmap( gl.TEXTURE_2D );
			}

			args.unshift( texture );
			callback.apply( null, args );
		});
	}

	/**
	 * Check if the context is a WebGL2 context
	 *
	 * @param {object} gl context
	 * @return {boolean}
	 */
	function isWebGL2(gl)
	{
		return gl && window['WebGL2RenderingContext'] !== undefined && gl instanceof WebGL2RenderingContext;
	}

	/**
	 * Export
	 */
	return {
		getContext:          getContext,
		createShaderProgram: createShaderProgram,
		createFramebuffer:   createFramebuffer,
		toPowerOfTwo:        toPowerOfTwo,
		texture:             texture,
		isWebGL2:		 	 isWebGL2,
	};
});
