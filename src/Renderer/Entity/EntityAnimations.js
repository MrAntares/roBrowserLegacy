/**
 * Renderer/EntityAnimations.js
 *
 * Manage entity special animations
 *
/**
 * Renderer/EntityAnimations.js
 *
 * Manage entity special animations
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
'use strict';

import Client from 'Core/Client';
import Renderer from 'Renderer/Renderer';

/**
	 * @Constructor
	 * @param {object} Entity
	 */
	function Animations(entity) {
		this.entity = entity;
		this.list = [];
	}

	/**
	 * Add an animation to the list
	 *
	 * @param {function} callback
	 */
	Animations.prototype.add = function add(callback) {
		this.list.push({
			tick: Renderer.tick,
			callback: callback
		});
	};

	/**
	 * Process events
	 */
	Animations.prototype.process = function process() {
		let i, count;

		for (i = 0, count = this.list.length; i < count; ++i) {
			if (this.list[i].callback(Renderer.tick - this.list[i].tick)) {
				this.list.splice(i, 1);
				i--;
				count--;
			}
		}
	};

	/**
	 * Clean up events
	 */
	Animations.prototype.free = function free() {
		this.list.length = 0;
	};
export default function init() {
		this.animations = new Animations(this);
	};