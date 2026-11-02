/**
 * Renderer/Effects/ShuffledGrid.js
 *
 * Spots the official client spreads some world-placed effect copies over
 * (Hell's Drive's blasts): an n x n grid one cell apart, centred on the
 * target, with one spot in each row and each column. The columns and the
 * rows are shuffled separately and paired in order.
 */

/**
 * The numbers 0 .. n - 1 in random order (uniform shuffle).
 *
 * @param {number} n
 * @param {function} random source of numbers in [0, 1)
 * @return {number[]}
 */
export function shuffled(n, random) {
	const list = Array.from({ length: n }, (_, i) => i);
	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[list[i], list[j]] = [list[j], list[i]];
	}
	return list;
}

/**
 * @param {number} n grid size (spots per side, and number of spots)
 * @param {function} [random] source of numbers in [0, 1), Math.random by default
 * @return {number[][]} n [x, y] offsets in roBrowser cells, -floor(n / 2) .. +floor(n / 2)
 */
export default function shuffledGrid(n, random = Math.random) {
	const half = Math.floor(n / 2);
	const columns = shuffled(n, random);
	const rows = shuffled(n, random);
	return columns.map((column, k) => [column - half, rows[k] - half]);
}
