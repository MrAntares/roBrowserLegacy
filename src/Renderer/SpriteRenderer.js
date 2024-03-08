/**
 * Renderer/SpriteRenderer.js
 *
 * Rendering sprite in 2D or 3D context
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(["Utils/WebGL", "Utils/gl-matrix", "./Camera"],
function(      WebGL,         glMatrix,      Camera )
{
	"use strict";

	const Session = require("Engine/SessionStorage");

	/**
	 * Import
	 */
	const mat4 = glMatrix.mat4;


	/**
	 * Generic Vertex Shader
	 * @const {string}
	 */
	const _vertexShader = /*glsl*/ `#version 300 es
		#define M_PI 3.1415926535897932384626433832795

		precision highp float;

		in vec2 aPosition;
		in vec2 aTextureCoord;

		out vec2 vTextureCoord;

		uniform mat4 uModelViewMat;
		uniform mat4 uViewModelMat;
		uniform mat4 uProjectionMat;

		uniform float uCameraZoom;
		uniform float uCameraLatitude;
		uniform float uCameraAngle;

		uniform vec2 uSpriteRendererSize;
		uniform vec2 uSpriteRendererOffset;
		uniform mat4 uSpriteRendererAngle;
		uniform vec3 uSpriteRendererPosition;
		uniform float uSpriteRendererDepth;
		uniform float uSpriteRendererZindex;

		mat4 Project(mat4 mat, vec3 pos, float angle) {
			// xyz = x(-z)y + middle of cell (0.5)
			float x = pos.x + 0.5;
			float y = -pos.z;
			float z = pos.y + 0.5;

			float cameraLatitude = uCameraLatitude * floor(min(uCameraZoom, 1.0)) / 50.0;

			// Matrix translation
			mat[3].x += mat[0].x * x + mat[1].x * y + mat[2].x * z;
			mat[3].y += mat[0].y * x + mat[1].y * y + mat[2].y * z;
			mat[3].z += (mat[0].z * x + mat[1].z * y + mat[2].z * z) + min(cameraLatitude, 0.5);
			mat[3].w += mat[0].w * x + mat[1].w * y + mat[2].w * z;


			// Spherical billboard
			mat[0].xyz = vec3(1.0, 0.0, 0.0);
			mat[2].xyz = vec3(0.0, 0.0, 1.0);

			mat[1].xyz = -mat[1].xyz;
			mat[2].xyz = -mat[2].xyz;

			mat[1].y = cos(angle * (M_PI * 2.0) / 360.0);

			return mat;
		}

		void main(void) {
			// Calculate position base on angle and sprite offset/size
			vec4 position = uSpriteRendererAngle * vec4(aPosition.x * uSpriteRendererSize.x, aPosition.y * uSpriteRendererSize.y, 0.0, 1.0);
			position.x += uSpriteRendererOffset.x;
			position.y -= uSpriteRendererOffset.y + 0.5;

			// We use this to compensate the Y billboarding, applying it on the Z axis
			float yView = (position.y - 0.5) * (cos(uCameraAngle * (M_PI * 2.0) / 360.0));

			gl_Position = uProjectionMat * Project(uModelViewMat, uSpriteRendererPosition, uCameraAngle) * position;
			float uCameraZoomMod = uCameraZoom / 50.0;

			// Adjust depth calculation based on the adjusted Y position and camera latitude
			gl_Position.z -= ((uSpriteRendererZindex * 0.01 + uSpriteRendererDepth) / max(uCameraZoomMod, 1.0)) + (yView * 0.005);


			// Apply depth offset based on the sprite's Y position, this avoids z-fighting
			gl_Position.z += uSpriteRendererOffset.y * 0.0001;

			vTextureCoord = aTextureCoord;
		}
	`;


	/**
	 * Generic Fragment Shader
	 * @const {string}
	 */
	const _fragmentShader = /*glsl*/ `#version 300 es
		precision highp float;

		in vec2 vTextureCoord;

		uniform sampler2D uDiffuse;
		uniform sampler2D uPalette;

		uniform bool uUsePal;
		uniform vec4 uSpriteRendererColor;

		uniform bool  uFogUse;
		uniform float uFogNear;
		uniform float uFogFar;
		uniform vec3  uFogColor;

		uniform float uShadow;
		uniform vec2 uTextSize;
		uniform bool uIsRGBA;

		uniform int objectType;
		uniform bool uDebugMode;

		out vec4 fragColor;

		// With palette we don't have a good result because of the gl.NEAREST, so smooth it.
		vec4 bilinearSample(vec2 uv, sampler2D indexT, sampler2D LUT) {
			vec2 TextInterval = 1.0 / uTextSize;

			float tlLUT = texture(indexT, uv).x;
			float trLUT = texture(indexT, uv + vec2(TextInterval.x, 0.0)).x;
			float blLUT = texture(indexT, uv + vec2(0.0, TextInterval.y)).x;
			float brLUT = texture(indexT, uv + TextInterval).x;

			vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);

			vec4 tl = tlLUT == 0.0 ? transparent : vec4(texture(LUT, vec2(tlLUT, 1.0)).rgb, 1.0);
			vec4 tr = trLUT == 0.0 ? transparent : vec4(texture(LUT, vec2(trLUT, 1.0)).rgb, 1.0);
			vec4 bl = blLUT == 0.0 ? transparent : vec4(texture(LUT, vec2(blLUT, 1.0)).rgb, 1.0);
			vec4 br = brLUT == 0.0 ? transparent : vec4(texture(LUT, vec2(brLUT, 1.0)).rgb, 1.0);

			vec2 f = fract(uv * uTextSize);
			vec4 tA = mix(tl, tr, f.x);
			vec4 tB = mix(bl, br, f.x);

			return mix(tA, tB, f.y);
		}

		void main(void) {
			// Don't render if it's not shown.
			if (uSpriteRendererColor.a == 0.0) {
				discard;
			}

			// Calculate texture
			vec4 texColor;
			if (uUsePal) {
				texColor = bilinearSample(vTextureCoord, uDiffuse, uPalette);
			}
			else {
				texColor = texture(uDiffuse, vTextureCoord.st);
			}

			if (objectType == 1 || objectType >= 5 && objectType <= 10 || objectType == 12) {
				float edgeFactor = smoothstep(0.10, 1.0, texColor.a);
				texColor.rgb *= edgeFactor;
			}


			// Debug mode: Draw red rectangle around the sprite
			if (uDebugMode) {
				float thickness = 0.02; // Increased thickness for more visible lines
				vec2 coord = vTextureCoord;
				vec2 pixelSize = 1.0 / uTextSize;
				vec4 colorLine = vec4(1.0, 0.0, 0.0, 1.0);

				switch (objectType) {
					case -5: // Effect is pink
						colorLine = vec4(1.0, 0.75, 0.8, 1.0);
						break;
					case 0: // Character blue
						colorLine = vec4(0.0, 0.0, 1.0, 1.0);
						break;
					case 5:
					case 1: // Monster green
						colorLine = vec4(0.0, 1.0, 0.0, 1.0);
						break;
					case 12:
					case 6: // NPC yellow
						colorLine = vec4(1.0, 1.0, 0.0, 1.0);
						break;
					case 7: // Pet purple
						colorLine = vec4(1.0, 0.0, 1.0, 1.0);
						break;
					case 10:
					case 8: // Homunculus and Ele orange
						colorLine = vec4(1.0, 0.5, 0.0, 1.0);
						break;
					case 9: // Mercenary cyan
						colorLine = vec4(0.0, 1.0, 1.0, 1.0);
						break;
					default: // Others red
						colorLine = vec4(1.0, 0.0, 0.0, 1.0);
						break;
				}

				if (coord.x < thickness || coord.x > 1.0 - thickness ||
					coord.y < thickness || coord.y > 1.0 - thickness) {
					texColor = mix(texColor, colorLine, 0.9); // Increased mixing factor for more opaque lines
				}
			}

			// No alpha, skip.
			if (texColor.a == 0.0) {
					discard;
			}

			// Apply shadow, apply color
			texColor.rgb *= uShadow;
			fragColor = texColor * uSpriteRendererColor;

			// Fog feature
			if (uFogUse) {
					float depth = gl_FragCoord.z / gl_FragCoord.w;
					float fogFactor = smoothstep(uFogNear, uFogFar, depth);
					fragColor = mix(fragColor, vec4(uFogColor, fragColor.w), fogFactor);
			}
		}
	`;


	/**
	 * Sprite Renderer NameSpace
	 */
	const SpriteRenderer = {};


	/**
	 * @var {function} functions to use to render
	 */
	SpriteRenderer.render = null;


	/**
	 * @var {number} sprite shadow (mult * color)
	 */
	SpriteRenderer.shadow = 1.0;


	/**
	 * @var {number} sprite angle rotation
	 */
	SpriteRenderer.angle = 0;


	/**
	 * @var {number} depth
	 */
	SpriteRenderer.depth = 0.0;


	/**
	 * @var {Float32Array[3]} sprite position in 3D world
	 */
	SpriteRenderer.position = new Float32Array(3);


	/**
	 * @var {Float32Array[4]} sprite color (color * color)
	 */
	SpriteRenderer.color = new Float32Array(4);


	/**
	 * @var {Float32Array[2]} sprite size
	 */
	SpriteRenderer.size = new Float32Array(2);


	/**
	 * @var {Float32Array[2]} sprite offset position
	 */
	SpriteRenderer.offset = new Float32Array(2);


	/**
	 * @var {object} sprite image information
	 */
	SpriteRenderer.image = {
		texture: null,
		palette: null,
		size:    new Float32Array(2)
	};


	/**
	 * @var {object} sprite imageData (for 2D context)
	 */
	SpriteRenderer.sprite = null;


	/**
	 * @var {object} sprite palette (for 2D context)
	 */
	SpriteRenderer.palette = null;


	/**
	 * @var {number} groupid used (avoid draw call)
	 */
	SpriteRenderer.groupId = 0;


	/**
	 * @var {number} width unity
	 */
	SpriteRenderer.xSize = 5;


	/**
	 * @var {number} height unity
	 */
	SpriteRenderer.ySize = 5;

    /**
     * @var {number} object type
     */
    SpriteRenderer.objecttype = null;


	/**
	 * @let {WebGLProgram}
	 */
	let _program = null;


	/**
	 * @let {WebGLBuffer}
	 */
	let _buffer = null;


	/**
	 * @let {CanvasRenderingContext2D} canvas context
	 */
	let _ctx = null;


	/**
	 * @let {WebGLRenderingContext} 3d context
	 */
	let _gl = null;


	/**
	 * @var {number} group id
	 * Used to know if we have to bind texture again
	 */
	let _groupId = 0;


	/**
	 * @let {number} last group id
	 */
	let _lastGroupId = 0;


	/**
	 * @let {number} last shadow used
	 */
	let _shadow = null;


	/**
	 * @let {number} last rotation angle used
	 */
	let _angle = null;

	/**
	 * @let {number} last depth operation
	 */
	let _depth = null;


	/**
	 * @var {object} last texture used
	 */
	let _texture = null;


	/**
	 * @let {boolean} do we use palette ?
	 */
	let _usepal = null;


	/**
	 * @let {Uint16Array} position in 2D canvas
	 */
	let _pos = new Int16Array(2);


	/**
	 * @var {mat4} last generated matrix (used for rotation)
	 */
	let _matrix = new Float32Array(4*4);


	/**
	 * @let {Float32Array[2]} sprite size
	 */
	let _size = new Float32Array(2);


	/**
	 * @let {Float32Array[2]} sprite offset position
	 */
	let _offset = new Float32Array(2);


	/**
	 * Initialize SpriteRenderer Renderer
	 *
	 * @param {object} gl context
	 */
	SpriteRenderer.init = function init( gl )
	{
		if (!_buffer) {
			_buffer = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
			gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([
				-0.5, +0.5, 0.0, 0.0,
				+0.5, +0.5, 1.0, 0.0,
				-0.5, -0.5, 0.0, 1.0,
				+0.5, -0.5, 1.0, 1.0
			]), gl.STATIC_DRAW );
		}

		if (!_program) {
			_program = WebGL.createShaderProgram( gl, _vertexShader, _fragmentShader );
		}
	};


	/**
	 * Initialize 3D Context
	 *
	 * @param {object} gl context
	 * @param {mat4} modelView
	 * @param {mat4} projection
	 * @param {object} fog structure
	 */
	SpriteRenderer.bind3DContext = function Bind3dContext( gl, modelView, projection, fog )
	{
		const attribute = _program.attribute;
		const uniform   = _program.uniform;

		gl.useProgram( _program );
		gl.uniformMatrix4fv( uniform.uProjectionMat, false,  projection );
		gl.uniformMatrix4fv( uniform.uModelViewMat,  false,  modelView );
		gl.uniformMatrix4fv( uniform.uViewModelMat,  false,  mat4.invert(_matrix, modelView) );

		// Fog settings
		gl.uniform1i(  uniform.uFogUse,   fog.use && fog.exist );
		gl.uniform1f(  uniform.uFogNear,  fog.near );
		gl.uniform1f(  uniform.uFogFar,   fog.far );
		gl.uniform3fv( uniform.uFogColor, fog.color );

		// Textures
		gl.uniform1i( uniform.uDiffuse, 0 );
		gl.uniform1i( uniform.uPalette, 1 );

		// Camera position for billboarding
		gl.uniform1f( uniform.uCameraZoom, Camera.zoom );
		gl.uniform1f( uniform.uCameraLatitude, Camera.getLatitude() );
		gl.uniform1f( uniform.uCameraAngle, Camera.getAngle() * (Math.PI / 180.0));

		// Debug mode
		const uDebugModeLocation = gl.getUniformLocation(_program, 'uDebugMode');
		gl.uniform1i( uDebugModeLocation, Session.debug ?? false );


		// Enable all attributes
		gl.enableVertexAttribArray( attribute.aPosition );
		gl.enableVertexAttribArray( attribute.aTextureCoord );
		gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );

		// Link attribute
		gl.vertexAttribPointer( attribute.aPosition,     2, gl.FLOAT, false,  4*4, 0   );
		gl.vertexAttribPointer( attribute.aTextureCoord, 2, gl.FLOAT, false,  4*4, 2*4 );

		// Binding 3D context
		this.render = RenderCanvas3D;
		this.xSize  = 5;
		this.ySize  = 5;

		_gl = gl;
		_groupId++;
	};


	/**
	 * Unbind 3D Context
	 *
	 * @param {object} gl context
	 */
	SpriteRenderer.unbind = function unBind( gl )
	{
		const attribute = _program.attribute;

		gl.disableVertexAttribArray( attribute.aPosition );
		gl.disableVertexAttribArray( attribute.aTextureCoord );
	};


	/**
	 * Prepare to render on 2D context.
	 *
	 * @param {object} ctx canvas context
	 * @param {number} x position
	 * @param {number} y position
	 */
	SpriteRenderer.bind2DContext = function Bind2DContext( ctx, x, y )
	{
		_ctx        = ctx;
		_pos[0]     = x;
		_pos[1]     = y;

		this.render = RenderCanvas2D;
		this.xSize  = 5;
		this.ySize  = 5;
	};


	/**
	 * Render in 3D mode
	 */
	function RenderCanvas3D(isBlendModeOne)
	{
		// Nothing to render ?
		if (!this.image.texture || !this.color[3]) {
			return;
		}

		// gl.uniform* seems to be expensive
		// cache values to avoid flooding the GPU and reducing perf.

		const uniform = _program.uniform;
		const gl      = _gl;
		const use_pal = this.image.palette !== null;

		if (isBlendModeOne) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		} else if (isBlendModeOne === false) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		}

		if (this.shadow !== _shadow) {
			gl.uniform1f( uniform.uShadow, _shadow = this.shadow);
		}
		gl.uniform3fv( uniform.uSpriteRendererPosition, this.position );

		// Palette
		if (use_pal) {
			gl.activeTexture( gl.TEXTURE1 );
			gl.bindTexture( gl.TEXTURE_2D,    this.image.palette );
			gl.uniform2fv( uniform.uTextSize, this.image.size );
			gl.activeTexture( gl.TEXTURE0 );
		}

		if (_usepal !== use_pal) {
			gl.uniform1i(  uniform.uUsePal, _usepal = use_pal );
		}

		if (this.depth !== _depth) {
			gl.uniform1f( uniform.uSpriteRendererDepth, _depth = this.depth);
		}

		gl.uniform1f( uniform.uSpriteRendererZindex, this.zIndex++ );
		// Rotate
		if (this.angle !== _angle) {
			_angle = this.angle;

			mat4.identity(_matrix);
			if (_angle) {
				mat4.rotateZ( _matrix, _matrix, - _angle / 180 * Math.PI );
			}

			gl.uniformMatrix4fv( uniform.uSpriteRendererAngle, false, _matrix );
		}

		_offset[0] = this.offset[0] / 175.0 * this.xSize;
		_offset[1] = this.offset[1] / 175.0 * this.ySize - 0.5;
		_size[0]   = this.size[0]   / 175.0 * this.xSize;
		_size[1]   = this.size[1]   / 175.0 * this.ySize;

		gl.uniform4fv( uniform.uSpriteRendererColor,  this.color );
		gl.uniform2fv( uniform.uSpriteRendererSize,   _size );
		gl.uniform2fv( uniform.uSpriteRendererOffset, _offset );
		gl.uniform1i( uniform.uIsRGBA, this.sprite.type);


		// Used to know what kind of object we are rendering
		const objectType = gl.getUniformLocation(_program, 'objectType');
		gl.uniform1i( objectType, this.objecttype ?? -1);


		// Avoid binding the new texture 150 times if it's the same.
		if (_groupId !== _lastGroupId || _texture !== this.image.texture) {
			_lastGroupId = _groupId;
			gl.bindTexture( gl.TEXTURE_2D, _texture = this.image.texture );
		}
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	}


	/**
	 * Render in 2D
	 */
	const RenderCanvas2D = function RenderCanvas2DClosure()
	{
		let canvas, ctx, imageData;

		canvas         = document.createElement("canvas");
		ctx            = canvas.getContext("2d");
		canvas.width   = 20;
		canvas.height  = 20;
		imageData      = ctx.createImageData(canvas.width, canvas.height);

		return function RenderCanvas2D()
		{
			// Nothing to render
			if (this.sprite.width <= 0 || this.sprite.height <= 0) {
				return;
			}

			let scale_x, scale_y, idx1, idx2;
			let x, y, _x, _y, width, height, outputWidth;
			let pal, frame, color;
			let input, output;

			scale_x  = 1.0;
			scale_y  = 1.0;
			_x       = _pos[0] + this.offset[0];
			_y       = _pos[1] + this.offset[1] - 0.5 * 35; // middle of cell
			pal      = this.palette;
			frame    = this.sprite;
			width    = frame.width;
			height   = frame.height;

			_size.set(this.size);

			// Mirror feature
			if (_size[0] < 0) {
				scale_x  *= -1;
				_size[0] *= -1;
			}

			if (_size[1] < 0) {
				scale_y  *= -1;
				_size[1] *= -1;
			}

			// Resize canvas from memory
			if (width > canvas.width || height > canvas.height) {
				canvas.width  = width;
				canvas.height = height;
				imageData     = ctx.createImageData(width, height);
			}

			output      = imageData.data;
			input       = frame.data;
			color       = this.color;
			outputWidth = canvas.width;

			// RGBA images
			if (this.sprite.type === 1) {
				for (y = 0; y < height; ++y) {
					for (x = 0; x < width; ++x) {
						idx1 = (x + y * outputWidth) * 4;
						idx2 = (x + y * width) * 4;
						output[idx1 + 0] = input[idx2 + 0] * color[0];
						output[idx1 + 1] = input[idx2 + 1] * color[1];
						output[idx1 + 2] = input[idx2 + 2] * color[2];
						output[idx1 + 3] = input[idx2 + 3] * color[3];
					}
				}
			}

			// Palettes
			else {
				for (y = 0; y < height; ++y) {
					for (x = 0; x < width; ++x) {
						idx1 = (y * outputWidth + x) * 4;
						idx2 = input[y * width + x] * 4;
						output[idx1 + 0] = pal[idx2 + 0] * color[0];
						output[idx1 + 1] = pal[idx2 + 1] * color[1];
						output[idx1 + 2] = pal[idx2 + 2] * color[2];
						output[idx1 + 3] = input[y * width + x] ? 255 * color[3] : 0;
					}
				}
			}

			// Insert into the canvas
			ctx.putImageData( imageData, 0, 0, 0, 0, width, height);

			// Render sprite in context
			_ctx.save();
			_ctx.translate( _x | 0, _y | 0 );
			_ctx.rotate( this.angle / 180 * Math.PI );
			_ctx.scale( scale_x, scale_y );
			_ctx.drawImage(
				 canvas,
				 0,              0,
				 width,          height,
				-_size[0] >> 1, -_size[1] >> 1,
				 _size[0] |  0,  _size[1] |  0
			);
			_ctx.restore();
		};
	}();


	/**
	 * Export
	 */
	return SpriteRenderer;
});
