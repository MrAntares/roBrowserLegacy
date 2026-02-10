/**
 * Core/Context.js
 *
 * Application Context
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function () {
	'use strict';

	var Context = {};

	/**
	 * Get Informations about current Context
	 */
	Context.Is = {
		POPUP: !!window.opener,
		FRAME: window.top !== window.self
	};

	/**
	 * Check if roBrowser is in FullScreen
	 * @returns {boolean} is in fullscreen
	 */
	Context.isFullScreen = function IsFullScreen() {
		return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement);
	};

	/**
	 * Try to launch roBrowser in Full Screen
	 */
	Context.requestFullScreen = function RequestFullScreen() {
		if (!Context.isFullScreen()) {
			var element = document.documentElement;

			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}
	};

	/**
	 * Try to cancel roBrowser full screen
	 */
	Context.cancelFullScreen = function CancelFullScreen() {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
	};

	/**
	 * Check list of API the web browser have to support to
	 * be able to execute roBrowser without problem.
	 *
	 * (2D graphics, 3D graphics, Threads, File API, ...)
	 */
	Context.checkSupport = function CheckSupport() {
		var div, canvas, element, gl, i;

		// Drag drop
		div = document.createElement('div');
		if (!('draggable' in div) && !('ondragstart' in div && 'ondrop' in div)) {
			throw "Your web browser need to be updated, it does not support Drag 'nd Drop features.";
		}

		// Canvas
		canvas = document.createElement('canvas');
		if (!canvas.getContext || !canvas.getContext('2d')) {
			throw 'Your web browser need to be updated, it does not support &lt;canvas&gt; element.';
		}

		// WebGL
		if (!window.WebGL2RenderingContext) {
			throw 'Your web browser need to be updated, it does not support WebGL2 3D graphics.';
		}

		element = document.createElement('canvas');
		var contextNames = ['webgl2', 'experimental-webgl2'];

		for (i = 0; i < contextNames.length; ++i) {
			try {
				gl = element.getContext(contextNames[i], { powerPreference: 'high-performance' });
			} catch (e) {
				console.error(e);
			}

			if (gl) {
				break;
			}
		}

		if (!gl) {
			throw 'Your web browser OR your Graphics Card OR Drivers need to be updated, it does not support WebGL2 3D graphics.\nFor more informations check <a href="http://get.webgl.org/" target="_blank">get.webgl.org</a>';
		}

		// Web Worker
		if (!window.Worker) {
			throw 'Your web browser need to be updated, it does not support Threads (Web Worker API).';
		}

		// FileReader API
		if (!window.File || !window.FileList || !window.FileReader) {
			throw 'Your web browser need to be updated, it does not support File API.';
		}

		// DataView
		if (!window.DataView || !DataView.prototype.getFloat64) {
			throw 'Your web browser need to be updated, it does not support File API (DataView).';
		}
	};

	/**
	 * Export
	 */
	return Context;
});
