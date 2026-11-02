/**
 * Renderer/Effects/BezierArcThrow.js
 *
 * A STR thrown from its owner to its position, as the official client flies
 * Thundering Orb's orb (CThunderingOrb, built on CBezierArcThrowEffect): it
 * starts above the owner, bows out to one side and comes down on the point,
 * then goes. The start follows the owner while it flies. Path numbers in
 * BezierArcThrowSim.js.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import StrEffect from './StrEffect.js';
import { pathLeft, throwPoint, toWorld, fromWorld } from './BezierArcThrowSim.js';

/** @var {mat4} the camera of the frame being drawn */
let _modelView = null;

export default class BezierArcThrowStrEffect extends StrEffect {
	/**
	 * @param {string} filename
	 * @param {Array} position landing point
	 * @param {number} startTick
	 * @param {string} texturePath
	 * @param {Array} fallbacks
	 * @param {object} thrower entity it flies from
	 */
	constructor(filename, position, startTick, texturePath, fallbacks, thrower) {
		super(filename, position, startTick, texturePath, fallbacks);
		this.target = position.slice();
		this.thrower = thrower;
	}

	render(gl, tick) {
		if (tick < this.startTick) {
			return;
		}

		// Landed, or nothing to fly from: the client drops it
		const left = pathLeft(tick - this.startTick);
		if (left <= 0 || !this.thrower?.position) {
			this.needCleanUp = true;
			return;
		}
		if (!_modelView) {
			return;
		}

		this.position = fromWorld(throwPoint(toWorld(this.thrower.position), toWorld(this.target), left, _modelView));
		super.render(gl, tick);
	}

	static beforeRender(gl, modelView, projection, fog, tick) {
		_modelView = modelView;
		super.beforeRender(gl, modelView, projection, fog, tick);
	}
}
