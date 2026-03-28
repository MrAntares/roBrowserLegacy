/**
 * Renderer/Effects/Bloom.js
 * Implementation of the Bloom post-processing effect.
 * Supports downsampling via a two-pass approach:
 * 1. Prefilter (Threshold + Downsample to internal FBO + Soft Blur)
 * 2. Composite (Mix Original Scene + Upsampled Bloom)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 */

import GraphicsSettings from 'Preferences/Graphics.js';
import WebGL from 'Utils/WebGL.js';
import PostProcess from 'Renderer/Effects/PostProcess.js';
import commonVS from './GLSL/Common.vs?raw';
import prefilterFS from './GLSL/Bloom.fs?raw';
import compositeFS from './GLSL/BloomUpsampling.fs?raw';

let _programs = {};
let _buffer;
let _internalFbo;
const _downsampleFactor = 0.25; // 25% resolution for performance and softer blur

/**
 * Vertex Shader: Common quad
 */
/**
 * Pass 1 Shader: Extract brightness (Threshold)
 * This runs on the small internal FBO.
 */
/**
 * Pass 2 Shader: Composite
 * Mixes the sharp original scene with the blurred bloom texture.
 */
/**
 * @constructor Bloom
 */
function Bloom() {}

/**
 * Renders the Bloom effect
 * @param {WebGLRenderingContext} gl - WebGL Context
 * @param {WebGLTexture} inputTexture - Full resolution scene texture
 * @param {WebGLFramebuffer} outputFbo - Destination (Screen or next effect)
 */
Bloom.render = function render(gl, inputTexture, outputFbo) {
	if (!_buffer || !_programs.prefilter || !Bloom.isActive()) {
		return;
	}

	// --- PASS 1: Downsample & Extract Brightness ---
	// We render to the internal small FBO
	PostProcess.beforeRenderPass(gl, _internalFbo);

	gl.useProgram(_programs.prefilter);

	// Update uniforms
	gl.uniform1f(_programs.prefilter.uniform.uBloomThreshold, 0.88);
	gl.uniform1f(_programs.prefilter.uniform.uBloomSoftKnee, 0.45);
	const boxsampleFactor = 4.0;
	gl.uniform2f(
		_programs.prefilter.uniform.uTexelSize,
		(1.0 / _internalFbo.width) * boxsampleFactor,
		(1.0 / _internalFbo.width) * boxsampleFactor
	);

	gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
	let posLoc = _programs.prefilter.attribute.aPosition;
	gl.enableVertexAttribArray(posLoc);
	gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

	// Bind Source (Full Res Scene)
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, inputTexture);
	gl.uniform1i(_programs.prefilter.uniform.uTexture, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);

	// --- PASS 2: Composite ---
	// We render to the destination (Full Res)
	PostProcess.beforeRenderPass(gl, outputFbo);

	gl.useProgram(_programs.composite);

	// Attributes (buffer already bound)
	posLoc = _programs.composite.attribute.aPosition;
	gl.enableVertexAttribArray(posLoc);
	gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

	gl.uniform1f(_programs.composite.uniform.uBloomIntensity, GraphicsSettings.bloomIntensity);

	// Unit 0: Original Scene (Sharp)
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, inputTexture);
	gl.uniform1i(_programs.composite.uniform.uSceneTexture, 0);

	// Unit 1: Bloom Result (Blurred/Downsampled)
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, _internalFbo.texture);
	gl.uniform1i(_programs.composite.uniform.uBloomTexture, 1);

	gl.drawArrays(gl.TRIANGLES, 0, 6);

	PostProcess.afterRenderPass(gl);
};

/**
 * Initializes shaders and buffers
 */
Bloom.init = function init(gl) {
	if (!gl) {
		return;
	}

	try {
		_programs.prefilter = WebGL.createShaderProgram(gl, commonVS, prefilterFS);
		_programs.composite = WebGL.createShaderProgram(gl, commonVS, compositeFS);
	} catch (e) {
		console.error('Error compiling BLOOM shader.', e);
		return;
	}

	const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

	_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
	gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

	// Create the downsampled internal buffer
	this.recreateFbo(gl, gl.canvas.width, gl.canvas.height);
};

/**
 * Recreates the Internal FBO when the window size changes
 */
Bloom.recreateFbo = function recreateFbo(gl, width, height) {
	if (_programs.prefilter) {
		_internalFbo = PostProcess.createFbo(gl, width, height, _internalFbo, _downsampleFactor);
	}
};

/** @returns {boolean} Whether the effect is active */
Bloom.isActive = function isActive() {
	return GraphicsSettings.bloom;
};

/** @returns {WebGLProgram} The loaded shader program (returning one for validation check) */
Bloom.program = function program() {
	return _programs.prefilter;
};

/** Clears memory references */
Bloom.clean = function clean(gl) {
	_programs = {};
	if (_buffer) {
		gl.deleteBuffer(_buffer);
	}
	_buffer = null;
	// Physically delete Internal Buffer from GPU memory
	if (_internalFbo) {
		if (gl.isTexture(_internalFbo.texture)) {
			gl.deleteTexture(_internalFbo.texture);
		}
		if (gl.isRenderbuffer(_internalFbo.rbo)) {
			gl.deleteRenderbuffer(_internalFbo.rbo);
		}
		if (gl.isFramebuffer(_internalFbo.framebuffer)) {
			gl.deleteFramebuffer(_internalFbo.framebuffer);
		}
	}
	_internalFbo = null;
};
export default Bloom;
