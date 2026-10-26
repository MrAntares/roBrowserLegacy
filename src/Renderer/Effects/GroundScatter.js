/**
 * Renderer/Effects/GroundScatter.js
 *
 * Random ground offset the official client gives some world-placed effect copies
 * (Sunset Blast's small blasts). Each horizontal axis gets
 * units - (random integer 0 .. 2 * units - 1) official units, so -(units - 1)..+units.
 * 5 official units are one roBrowser cell.
 */

/**
 * @param {number} units  scatter in official units (EffectTable `groundScatter`)
 * @param {function} [random] source of numbers in [0, 1), Math.random by default
 * @return {number[]} [x, y] offset in roBrowser cells
 */
export default function groundScatter(units, random = Math.random) {
	const axis = () => (units - Math.floor(random() * units * 2)) / 5;
	return [axis(), axis()];
}
