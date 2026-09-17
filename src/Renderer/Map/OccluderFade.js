/**
 * @module Renderer/Map/OccluderFade
 *
 * Fades map geometry standing between the third person camera and the player,
 * so tight interiors and dense forests stay readable. Shared by the static and
 * animated model renderers.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import _shaderSource from 'Renderer/Effects/Shaders/GLSL/OccluderFade.glsl?raw';
import Camera from 'Renderer/Camera.js';
import GraphicsSettings from 'Preferences/Graphics.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import glMatrix from 'Utils/gl-matrix.js';

const { mat4, vec3 } = glMatrix;

const SHADER_INCLUDE = '// #include OccluderFade.glsl';

/**
 * Shader-side modes (uOccluderFadeMode)
 */
const MODE = {
	OFF: 0,
	DITHER: 1,
	ALPHA_OPAQUE: 2,
	ALPHA_BLEND: 3
};

/**
 * Preference values
 */
const SETTING = {
	OFF: 'off',
	DITHER: 'dither',
	ALPHA: 'alpha'
};

const FADE_RADIUS = 2.5;

const _inverse = mat4.create();
const _eye = vec3.create();

class OccluderFade {
	static MODE = MODE;
	static SETTING = SETTING;

	/**
	 * Inline the shared GLSL into a fragment shader source
	 *
	 * @param {string} source fragment shader
	 * @return {string}
	 */
	static injectShader(source) {
		return source.replace(SHADER_INCLUDE, _shaderSource);
	}

	/**
	 * Whether the effect can run: third person camera allowed by config,
	 * currently active, and not disabled in the graphics options.
	 *
	 * @return {boolean}
	 */
	static isActive() {
		return (
			Camera.enable3RDPerson &&
			Camera.state === Camera.states.third_person &&
			GraphicsSettings.occluderFade !== SETTING.OFF
		);
	}

	/**
	 * Whether the alpha (two pass) variant is selected
	 *
	 * @return {boolean}
	 */
	static useAlpha() {
		return GraphicsSettings.occluderFade === SETTING.ALPHA;
	}

	/**
	 * Refresh the camera eye position from the current modelView
	 *
	 * @param {mat4} modelView
	 */
	static update(modelView) {
		mat4.invert(_inverse, modelView);
		_eye[0] = _inverse[12];
		_eye[1] = _inverse[13];
		_eye[2] = _inverse[14];
	}

	/**
	 * Upload the fade uniforms for a program
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {object} uniform program uniform locations
	 * @param {number} mode one of MODE
	 */
	static setUniforms(gl, uniform, mode) {
		gl.uniform1i(uniform.uOccluderFadeMode, mode);

		if (mode === MODE.OFF) {
			return;
		}

		gl.uniform3fv(uniform.uOccluderFadeEye, _eye);
		gl.uniform3fv(uniform.uOccluderFadeFocus, Camera.focus);
		gl.uniform1f(uniform.uOccluderFadeRadius, FADE_RADIUS);
		gl.uniform1f(uniform.uOccluderFadeOpacity, GraphicsSettings.occluderFadeOpacity);
	}

	/**
	 * Run a model draw with the fade applied: one opaque pass (dither or
	 * capsule-discard), plus a translucent depth-read-only pass in alpha mode.
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {object} uniform program uniform locations
	 * @param {function} draw issues the draw calls
	 */
	static renderPasses(gl, uniform, draw) {
		if (!OccluderFade.isActive()) {
			OccluderFade.setUniforms(gl, uniform, MODE.OFF);
			SpriteRenderer.runWithDepth(true, true, true, draw);
			return;
		}

		if (!OccluderFade.useAlpha()) {
			OccluderFade.setUniforms(gl, uniform, MODE.DITHER);
			SpriteRenderer.runWithDepth(true, true, true, draw);
			return;
		}

		OccluderFade.setUniforms(gl, uniform, MODE.ALPHA_OPAQUE);
		SpriteRenderer.runWithDepth(true, true, true, draw);

		gl.uniform1i(uniform.uOccluderFadeMode, MODE.ALPHA_BLEND);
		SpriteRenderer.runWithDepth(true, false, true, draw);
	}
}

export default OccluderFade;
