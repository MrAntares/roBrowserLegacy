/**
 * UI/Components/SlotMachine/SlotMachine.js
 *
 * SlotMachine window
 * Used to catch pet
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Client from 'Core/Client.js';
import Events from 'Core/Events.js';
import Renderer from 'Renderer/Renderer.js';
import Entity from 'Renderer/Entity/Entity.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';

/**
 * Create SlotMachine UI
 */
const SlotMachine = new UIComponent('SlotMachine');

/**
 * @var {Sprite,Action} objects
 */
let _sprite, _action;

/**
 * @var {number} type
 */
let _type = 0;

/**
 * @var {boolean} result
 */
let _result = false;

/**
 * @var {CanvasRenderingContext2D}
 */
let _ctx;

/**
 * @var {Entity}
 */
const _entity = new Entity();

/**
 * @var {number} start tick
 */
let _start = 0;

/**
 * Initialize UI
 */
SlotMachine.init = function init() {
	// Initialize UI.
	this.ui = jQuery('<canvas/>')
		.attr({
			width: 270,
			height: 260,
			id: 'SlotMachine'
		})
		.css({
			zIndex: 500,
			position: 'absolute',
			top: Renderer.height / 2 - 130,
			left: Renderer.width / 2 - 135
		});

	_ctx = this.ui[0].getContext('2d');

	// Loading sprite, start animation
	Client.loadFiles(
		['data/sprite/slotmachine.spr', 'data/sprite/slotmachine.act'],
		function (spr, act) {
			_sprite = spr;
			_action = act;
			_type = 0;
			_start = Renderer.tick;

			if (this.ui[0].parentNode) {
				Renderer.render(rendering);
			}
		}.bind(this)
	);

	// Don't propagate to map scene
	this.ui.mousedown(function (event) {
		if (_type === 0) {
			SlotMachine.onTry();
			event.stopImmediatePropagation();
			return false;
		}
	});
};

/**
 * Once append to body
 */
SlotMachine.onAppend = function onAppend() {
	_type = 0;
	_start = Renderer.tick;

	if (_sprite && _action) {
		Renderer.render(rendering);
	}
};

/**
 * Once removed from body
 */
SlotMachine.onRemove = function onRemove() {
	Renderer.stop(rendering);
};

/**
 * Set the result
 *
 * @param {boolean} result
 */
SlotMachine.setResult = function setResult(result) {
	_type = 1;
	_result = result;
	_start = Renderer.tick;
};

/**
 * Rendering animation
 */
const rendering = (function renderingClosure() {
	const position = new Uint16Array([0, 0]);

	return function _renderFrame() {
		let i, count, max;
		let action, anim;

		switch (_type) {
			case 0: // waiting
				action = _action.actions[0];
				anim = Math.floor(((Renderer.tick - _start) / action.delay) * 2);
				break;

			case 1: // pending
				action = _action.actions[1];
				max = action.animations.length + (_result ? 7 : 3);
				anim = Renderer.tick - _start;
				anim = Math.floor(anim / action.delay);
				anim = Math.min(anim, max);

				if (anim === max) {
					_type = _result ? 2 : 3;
					_start = Renderer.tick;
				}
				break;

			case 2: // success
			case 3: // fail
				action = _action.actions[_type];
				max = action.animations.length;
				anim = Renderer.tick - _start;
				anim = Math.floor(anim / action.delay);

				if (anim >= max) {
					Renderer.stop(rendering);
					Events.setTimeout(function () {
						SlotMachine.remove();
					}, 500);
				}
				break;
		}

		const animation = action.animations[anim % action.animations.length];

		// Initialize context
		SpriteRenderer.bind2DContext(_ctx, 140, 165);
		_ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);

		// Render layers
		for (i = 0, count = animation.layers.length; i < count; ++i) {
			_entity.renderLayer(animation.layers[i], _sprite, _sprite, 1.0, position, false);
		}
	};
})();

/**
 * Functions defined in Engine/MapEngine/Pet.js
 */
SlotMachine.onTry = function onTry() {};

/**
 * Export
 */
export default UIManager.addComponent(SlotMachine);
