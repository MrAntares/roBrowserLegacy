/**
 * Renderer/Effects/BlindEffect.js
 * Radial Gradient black filter
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
 * Some maps as Z-Fighting with this effect, 
 * 6hours trying to fix, update the time if you tryed too
*/
define(function(require) {
	'use strict';

	var Renderer       = require('Renderer/Renderer');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Session        = require('Engine/SessionStorage');
	var Camera         = require('Renderer/Camera');  
	var Altitude       = require('Renderer/Map/Altitude');

	var _filterFrame = null;
	var _active = false;

	var _fadeDuration = 1000; 
	var _startTime = 0;
	var _isFadingOut = false; 
	var _currentAlpha = 0.0;

	function ensureFilterFrame(gl) {

		if (_filterFrame && _filterFrame.texture && gl.isTexture(_filterFrame.texture)) {
			return;
		}

		var size = 8000;
		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;
		var ctx = canvas.getContext('2d');

		var center = size / 2;

		var unit = 40;
		var radiusTransparent = 4 * unit; 
		var radiusBlackStart = 9 * unit;

		var gradient = ctx.createRadialGradient(center, center, 0, center, center, radiusBlackStart);

		var stopTransparent = radiusTransparent / radiusBlackStart;

		gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(stopTransparent, 'rgba(0, 0, 0, 0)');
		gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, size, size);

		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = gradient; 
		
		ctx.globalCompositeOperation = 'source-over';
		ctx.clearRect(0, 0, size, size);
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, size, size);

		var clearGradient = ctx.createRadialGradient(center, center, radiusTransparent, center, center, radiusBlackStart);
		clearGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
		clearGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
		
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = clearGradient;
		ctx.beginPath();
		ctx.arc(center, center, radiusBlackStart, 0, Math.PI * 2);
		ctx.fill();

		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		_filterFrame = { texture: tex, width: size, height: size, type: 1 };
	}

	function BlindEffect() {}

	
	BlindEffect.render = function render(gl, modelView, projection, fog) {
		if (!_active || !Session.Entity) return;

		ensureFilterFrame(gl);
		var now = Date.now();
		var elapsed = now - _startTime;
		var progress = Math.min(elapsed / _fadeDuration, 1.0);

		if (_isFadingOut) {
			_currentAlpha = 1.0 - progress;
			if (progress >= 1.0) _active = false;
		} else {
			_currentAlpha = progress;
		}
		gl.disable(gl.DEPTH_TEST);
		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);
		SpriteRenderer.setDepthMask(false);

		SpriteRenderer.sprite = _filterFrame;
		SpriteRenderer.image.texture = _filterFrame.texture;

		SpriteRenderer.position[0] = Session.Entity.position[0];
		SpriteRenderer.position[1] = Session.Entity.position[1] - 0.5;
		SpriteRenderer.position[2] = Session.Entity.position[2];

		SpriteRenderer.color[0] = 1.0;
		SpriteRenderer.color[1] = 1.0;
		SpriteRenderer.color[2] = 1.0;
		SpriteRenderer.color[3] = _currentAlpha;

		SpriteRenderer.size[0] = 8000;
		SpriteRenderer.size[1] = 8000;
		SpriteRenderer.render(false);

		gl.enable(gl.DEPTH_TEST);
		SpriteRenderer.setDepthMask(true);
	};

	BlindEffect.setActive = function setActive(bool) {
		_active = true;
		_isFadingOut = !bool;
		_startTime = Date.now();
	};

	BlindEffect.isActive = function isActive() {
		return _active;
	};

	return BlindEffect;
});