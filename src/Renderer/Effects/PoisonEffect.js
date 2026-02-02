/**
 * Renderer/Effects/PoisonEffect.js
 * Just a purple screen
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author AoShinHo
*/
define(function(require) {
	'use strict';

	var Renderer       = require('Renderer/Renderer');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var Session        = require('Engine/SessionStorage');

	var _filterFrame = null;
	var _active = false;

	function ensureFilterFrame(gl) {
		if (_filterFrame && _filterFrame.texture && gl.isTexture(_filterFrame.texture)) {
			return;
		}
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		_filterFrame = { texture: tex, width: 1, height: 1, type: 1 };
	}

	function PoisonEffect() {}

	PoisonEffect.render = function render(gl, modelView, projection, fog) {
		if (!_active || !Session.Entity) return;

		ensureFilterFrame(gl);

		SpriteRenderer.bind3DContext(gl, modelView, projection, fog);

		SpriteRenderer.sprite = _filterFrame;
		SpriteRenderer.image.texture = _filterFrame.texture;
		
		SpriteRenderer.position[0] = Session.Entity.position[0];
		SpriteRenderer.position[1] = Session.Entity.position[1];
		SpriteRenderer.position[2] = Session.Entity.position[2];
		
		SpriteRenderer.color[0] = 0.50;
		SpriteRenderer.color[1] = 0.00;
		SpriteRenderer.color[2] = 0.50;
		SpriteRenderer.color[3] = 0.15;

		SpriteRenderer.size[0] = 8000;
		SpriteRenderer.size[1] = 8000;
		SpriteRenderer.setDepth(false, false, true, function(){
			SpriteRenderer.render(false);
		});
	};

	PoisonEffect.setActive = function setActive(bool) {
		_active = bool;
	};

	PoisonEffect.isActive = function isActive() {
		return _active;
	};

	return PoisonEffect;
});