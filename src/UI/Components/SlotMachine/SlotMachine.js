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

import GUIComponent from 'UI/GUIComponent.js';
import UIManager from 'UI/UIManager.js';
import Client from 'Core/Client.js';
import Events from 'Core/Events.js';
import Renderer from 'Renderer/Renderer.js';
import Entity from 'Renderer/Entity/Entity.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import htmlText from './SlotMachine.html?raw';
import cssText from './SlotMachine.css?raw';

/**
 * Create SlotMachine UI
 */
const SlotMachine = new GUIComponent('SlotMachine', cssText);

SlotMachine.render = () => htmlText;

/**
 * @var {Sprite,Action} objects
 */
SlotMachine._sprite = null;
SlotMachine._action = null;

/**
 * @var {boolean} sprite and action ready to render
 */
SlotMachine._loaded = false;

/**
 * @var {number} type
 */
SlotMachine._type = 0;

/**
 * @var {boolean} result
 */
SlotMachine._result = false;

/**
 * @var {CanvasRenderingContext2D}
 */
SlotMachine._ctx = null;

/**
 * @var {Entity}
 */
const _entity = new Entity();

/**
 * @var {number} start tick
 */
SlotMachine._start = 0;

/**
 * Initialize UI
 */
SlotMachine.init = function init() {
	const root = this.getRoot();
	const canvas = root.querySelector('canvas');
	SlotMachine._ctx = canvas.getContext('2d');

	this._host.style.zIndex = '500';

	Client.loadFiles(['data/sprite/slotmachine.spr', 'data/sprite/slotmachine.act'], (spr, act) => {
		SlotMachine._sprite = spr;
		SlotMachine._action = act;
		SlotMachine._type = 0;
		SlotMachine._loaded = true;
		SlotMachine._start = Renderer.tick;

		if (this._host.parentNode) {
			Renderer.render(rendering);
		}
	});

	canvas.addEventListener('mousedown', event => {
		if (SlotMachine._loaded && SlotMachine._type === 0) {
			SlotMachine.onTry();
			event.stopImmediatePropagation();
			event.preventDefault();
		}
	});
};

/**
 * Once append to body
 */
SlotMachine.onAppend = function onAppend() {
	SlotMachine._type = 0;
	SlotMachine._start = Renderer.tick;

	this._host.style.top = `${Renderer.height / 2 - 130}px`;
	this._host.style.left = `${Renderer.width / 2 - 135}px`;

	if (SlotMachine._sprite && SlotMachine._action) {
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
	SlotMachine._type = 1;
	SlotMachine._result = result;
	SlotMachine._start = Renderer.tick;
};

/**
 * Rendering animation
 */
const rendering = (() => {
	const position = new Uint16Array([0, 0]);

	return () => {
		let action, anim;

		switch (SlotMachine._type) {
			case 0: // waiting
				action = SlotMachine._action.actions[0];
				anim = Math.floor(((Renderer.tick - SlotMachine._start) / action.delay) * 2);
				break;

			case 1: {
				// pending
				action = SlotMachine._action.actions[1];
				const max = action.animations.length + (SlotMachine._result ? 7 : 3);
				anim = Renderer.tick - SlotMachine._start;
				anim = Math.floor(anim / action.delay);
				anim = Math.min(anim, max);

				if (anim === max) {
					SlotMachine._type = SlotMachine._result ? 2 : 3;
					SlotMachine._start = Renderer.tick;
				}
				break;
			}

			case 2: // success
			case 3: {
				// fail
				action = SlotMachine._action.actions[SlotMachine._type];
				const max = action.animations.length;
				anim = Renderer.tick - SlotMachine._start;
				anim = Math.floor(anim / action.delay);

				if (anim >= max) {
					Renderer.stop(rendering);
					Events.setTimeout(() => {
						SlotMachine.remove();
					}, 500);
				}
				break;
			}
		}

		const animation = action.animations[anim % action.animations.length];

		SpriteRenderer.bind2DContext(SlotMachine._ctx, 140, 165);
		SlotMachine._ctx.clearRect(0, 0, SlotMachine._ctx.canvas.width, SlotMachine._ctx.canvas.height);

		for (let i = 0, count = animation.layers.length; i < count; ++i) {
			_entity.renderLayer(animation.layers[i], SlotMachine._sprite, SlotMachine._sprite, 1.0, position, false);
		}
	};
})();

/**
 * Functions defined in Engine/MapEngine/Pet.js
 */
SlotMachine.onTry = function onTry() {};

SlotMachine.mouseMode = GUIComponent.MouseMode.STOP;

/**
 * Export
 */
export default UIManager.addComponent(SlotMachine);
