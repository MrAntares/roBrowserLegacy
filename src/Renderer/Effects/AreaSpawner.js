/**
 * Renderer/Effects/AreaSpawner.js
 *
 * An effect that draws nothing itself: while it lives, it spams another effect
 * at a random point of a square area, on a fixed interval. The official client
 * does this for ground units such as Cross Rain, which drops a spear of rain
 * somewhere in its area every few ticks.
 *
 * EffectTable fields (type 'AREA_SPAWN'):
 *	- spawnEffectId:	effect spammed at each point
 *	- interval:		ms between two spawns (the first one is at the start)
 *	- intervalByLevel:	ms between two spawns, by skill level (index 0 is level 1)
 *	- areaByLevel:		square width in cells, by skill level (index 0 is level 1)
 *	- area:			square width in cells when the level is unknown
 *	- count:		points per spawn, each picked on its own (default 1)
 *	- scaleRange:		[min, max] size of each spawned effect, picked in steps of 0.01
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/**
 * Width of the square, in cells.
 * Uses the skill level when the unit packet has one, else the unit range (2 * range + 1),
 * else the level 1 size: a packet with neither is from a client too old for these units.
 *
 * @param {object} effect - EffectTable entry
 * @param {number} [level] - skill level
 * @param {number} [range] - skill unit range
 * @returns {number}
 */
export function spawnAreaWidth(effect, level, range) {
	const table = effect.areaByLevel;

	if (table && table.length && level > 0) {
		return table[Math.min(level, table.length) - 1];
	}

	if (range > 0) {
		return range * 2 + 1;
	}

	return effect.area || (table && table.length ? table[0] : 1);
}

/**
 * Ms between two spawns. Uses the skill level when there is one.
 *
 * @param {object} effect - EffectTable entry
 * @param {number} [level] - skill level
 * @returns {number}
 */
export function spawnInterval(effect, level) {
	const table = effect.intervalByLevel;

	if (table && table.length && level > 0) {
		return table[Math.min(level, table.length) - 1];
	}

	return effect.interval > 0 ? effect.interval : 1000;
}

/**
 * Size of one spawned effect, like the official client: a whole number of
 * hundredths, uniform over [min, max].
 *
 * @param {Array<number>} [range] - [min, max]
 * @param {number} random - a number in [0, 1)
 * @returns {number|undefined} undefined when the effect has no range
 */
export function spawnScale(range, random) {
	if (!range) {
		return undefined;
	}

	const steps = Math.round((range[1] - range[0]) * 100);
	const pick = Math.min(Math.floor(random * (steps + 1)), steps);

	return Math.round(range[0] * 100 + pick) / 100;
}

/**
 * Offset of a point from the centre along one axis, in cells.
 * Like the official client: 50 steps per cell, uniform over [-width / 2, width / 2].
 *
 * @param {number} width - square width in cells
 * @param {number} random - a number in [0, 1)
 * @returns {number}
 */
export function spawnOffset(width, random) {
	const steps = Math.round(width * 50);
	const pick = Math.min(Math.floor(random * (steps + 1)), steps);

	return (pick - steps / 2) / 50;
}

/**
 * How many spawns are due by this tick, counting the one at the start.
 *
 * @param {number} startTick - when the effect started (ms)
 * @param {number} interval - ms between spawns
 * @param {number} tick - now (ms)
 * @returns {number}
 */
export function spawnsDue(startTick, interval, tick) {
	if (tick < startTick) {
		return 0;
	}

	return Math.floor((tick - startTick) / interval) + 1;
}

class AreaSpawner {
	/**
	 * @param {object} effect - EffectTable entry
	 * @param {object} EF_Inst_Par - instance params
	 * @param {object} EF_Init_Par - init params (skillLevel, unitRange)
	 * @param {function} spawn - called with (effectId, position, tick) for each point
	 * @param {function} [heightAt] - ground height of a cell
	 */
	constructor(effect, EF_Inst_Par, EF_Init_Par, spawn, heightAt) {
		this.position = EF_Inst_Par.position;
		this.startTick = EF_Inst_Par.startTick;
		this.interval = spawnInterval(effect, EF_Init_Par.skillLevel);
		this.width = spawnAreaWidth(effect, EF_Init_Par.skillLevel, EF_Init_Par.unitRange);
		this.count = effect.count > 0 ? effect.count : 1;
		this.scaleRange = effect.scaleRange;
		this.spawnEffectId = effect.spawnEffectId;
		this.spawn = spawn;
		this.heightAt = heightAt;
		this.spawned = 0;
		this.ready = true;
	}

	render(gl, tick) {
		const due = spawnsDue(this.startTick, this.interval, tick);

		// After a long pause (tab hidden, effect culled) only drop the latest one
		if (due - this.spawned > 1) {
			this.spawned = due - 1;
		}

		while (this.spawned < due) {
			for (let i = 0; i < this.count; i++) {
				const x = this.position[0] + spawnOffset(this.width, Math.random());
				const y = this.position[1] + spawnOffset(this.width, Math.random());
				const z = this.heightAt ? this.heightAt(x, y) : this.position[2];
				const scale = spawnScale(this.scaleRange, Math.random());

				this.spawn(this.spawnEffectId, [x, y, z], this.startTick + this.spawned * this.interval, scale);
			}
			this.spawned++;
		}
	}

	static init() {
		this.ready = true;
	}

	static beforeRender() {}

	static afterRender() {}
}

AreaSpawner.ready = true;

export default AreaSpawner;
