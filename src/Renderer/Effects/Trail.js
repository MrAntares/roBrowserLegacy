/**
 * Renderer/Effects/Trail.js
 *
 * Generic path spawner: a cursor travels along the ground from the source
 * position toward (and optionally past) the target position and spawns the
 * configured effect definitions at regular time intervals along the way
 * (Frost Diver / Grimtooth ground spikes, ...).
 *
 * Effect parameters:
 *   spawn         {Array}   effect definitions (same format as EffectTable entries) spawned at each step
 *   duration      {number}  lifetime of the spawner (ms)
 *   speed         {number}  cursor speed in cells per second (default 24)
 *   interval      {number}  time between two spawns (ms, default 17)
 *   startOffset   {number}  distance from the source where the first spawn happens (cells)
 *   stopAtTarget  {boolean} stop once the cursor reaches the target
 *   overshoot     {number}  distance to keep traveling past the target when stopAtTarget is set (cells)
 *   spread        {number|Array} random radial offset applied to each spawn position (cells)
 *   sourceIsOwner {boolean} travel from the owner toward the other entity instead of the reverse
 *   angles        {Array}   fixed directions in degrees; cursors start at the owner and travel outward
 *                           along each of them for the whole duration (no target involved)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import EffectManager from 'Renderer/EffectManager.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Preferences from 'Preferences/Map.js';

const rand = (min, max) => min + Math.random() * (max - min);

class Trail {
	constructor(effect, EF_Inst_Par, EF_Init_Par) {
		const owner = EF_Inst_Par.position;
		const other = EF_Inst_Par.otherPosition || owner;
		const source = effect.angles || effect.sourceIsOwner ? owner : other;
		const target = effect.sourceIsOwner ? other : owner;

		this.source = [source[0], source[1]];
		// Distance culling uses Inst.position: anchor the spawner on the middle of its path
		// (or on the source for radial trails) instead of the far end
		EF_Inst_Par.position = effect.angles
			? [source[0], source[1], source[2]]
			: [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2, source[2]];
		this.position = EF_Inst_Par.position;

		if (effect.angles) {
			this.targetDistance = Infinity;
			this.directions = effect.angles.map(angle => {
				const rad = (angle * Math.PI) / 180;
				return [Math.cos(rad), Math.sin(rad)];
			});
		} else {
			const dx = target[0] - this.source[0];
			const dy = target[1] - this.source[1];
			this.targetDistance = Math.sqrt(dx * dx + dy * dy);
			this.directions = [
				this.targetDistance > 0 ? [dx / this.targetDistance, dy / this.targetDistance] : [0, -1]
			];
		}

		this.spawn = effect.spawn || [];
		this.speed = effect.speed || 24;
		this.interval = effect.interval || 17;
		this.startOffset = effect.startOffset || 0;
		this.stopAtTarget = !!effect.stopAtTarget;
		this.overshoot = effect.overshoot || 0;
		this.spread = effect.spread || 0;
		this.startTick = EF_Inst_Par.startTick;
		this.endTick = EF_Inst_Par.endTick > 0 ? EF_Inst_Par.endTick : this.startTick + 2500;
		this.nextSpawnTick = this.startTick;
		this.Init = EF_Init_Par;
		this.ready = true;
	}

	init() {}

	free() {}

	render(gl, tick) {
		if (Preferences.mineffect || tick >= this.endTick) {
			this.needCleanUp = true;
			return;
		}

		const maxDistance = this.stopAtTarget ? this.targetDistance + this.overshoot : Infinity;
		const cellsPerMs = this.speed / 1000;

		while (this.nextSpawnTick <= tick) {
			const distance = this.startOffset + (this.nextSpawnTick - this.startTick) * cellsPerMs;

			if (distance > maxDistance || this.nextSpawnTick >= this.endTick) {
				this.needCleanUp = true;
				return;
			}

			this.spawnAt(distance, this.nextSpawnTick);
			this.nextSpawnTick += this.interval;
		}
	}

	spawnAt(distance, startTick) {
		for (const direction of this.directions) {
			const angle = Math.random() * Math.PI * 2;
			const radius = Array.isArray(this.spread)
				? rand(this.spread[0], this.spread[1])
				: Math.random() * this.spread;
			const x = this.source[0] + direction[0] * distance + Math.cos(angle) * radius;
			const y = this.source[1] + direction[1] * distance + Math.sin(angle) * radius;

			this.spawnDefinitions([x, y, Altitude.getCellHeight(x, y)], startTick);
		}
	}

	spawnDefinitions(position, startTick) {
		for (const definition of this.spawn) {
			EffectManager.spamEffect({
				effect: definition,
				Inst: {
					effectID: this.Init.effectId,
					duplicateID: 0,
					startTick: startTick
				},
				Init: {
					effectId: this.Init.effectId,
					ownerAID: this.Init.ownerAID,
					ownerEntity: this.Init.ownerEntity,
					otherAID: this.Init.otherAID,
					otherEntity: this.Init.otherEntity,
					position: position,
					otherPosition: this.Init.otherPosition,
					startTick: startTick
				}
			});
		}
	}

	static init() {
		this.ready = true;
		this.renderBeforeEntities = true;
	}

	static free() {
		this.ready = false;
	}

	static beforeRender() {}

	static afterRender() {}
}

export default Trail;
