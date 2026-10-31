import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	arrowShowerEffects,
	NEIGHBOUR_CELLS,
	START_DELAY_MS,
	FLIGHT_MS
} from '../../src/DB/Effects/ArrowShowerEffects.js';
import ThreeDEffect from '../../src/Renderer/Effects/ThreeDEffect.js';

// Arrow Shower (AC_SHOWER, skill 47), kRO 2025-07-16: arrows from the caster to the damaged
// actor and the cells around it, 432 ms wait, 192 ms flight, 2 cells up at the start and 4 at
// the end; no ground-packet arrows.

const rows = arrowShowerEffects();
const source = readFileSync(join(process.cwd(), 'src/DB/Skills/SkillEffect.js'), 'utf8');

function endOf(row) {
	const effect = new ThreeDEffect(
		row,
		{ position: [10, 20, 0], otherPosition: [4, 20, 0], startTick: 0, endTick: FLIGHT_MS },
		{ ownerAID: 1 }
	);
	return [effect.posxStart, effect.posyStart, effect.posxEnd, effect.posyEnd];
}

describe('Arrow Shower arrows', () => {
	it('uses the client timing', () => {
		expect(START_DELAY_MS).toBe(432);
		expect(FLIGHT_MS).toBe(192);
		for (const row of rows.ef_arrow_shower_target) {
			expect(row.delayStart).toBe(432);
			expect(row.duration).toBe(192);
			expect(row.zOffset).toBe(2);
			expect(row.zOffsetEnd).toBe(2);
		}
	});

	it('has no ground-packet arrows', () => {
		expect(rows).not.toHaveProperty('ef_arrow_shower_ground');
		expect(source).not.toMatch(/ef_arrow_shower_ground/);
	});

	it('aims the damage arrows at the actor and the 8 cells around it', () => {
		expect(rows.ef_arrow_shower_target).toHaveLength(9);
		expect(rows.ef_arrow_shower_target.map(endOf)).toEqual(
			[[0, 0], ...NEIGHBOUR_CELLS].map(([x, y]) => [-6, 0, x, y])
		);
		expect(new Set(NEIGHBOUR_CELLS.map(c => c.join()))).toHaveProperty('size', 8);
	});

	it('plays them from each damage packet, the bow arrow from non-splash ones, 0 + 1 on each hit', () => {
		expect(source).toMatch(
			/SkillEffect\[SK\.AC_SHOWER\] = \{\r?\n\tdamageEffectIdOnTarget: 'ef_arrow_shower_target',\r?\n\treleaseEffectId: 'ef_arrow_projectile',\r?\n\thitEffectId: \[0, 1\]\r?\n\}; \/\/Arrow Shower/
		);
		expect(source).toMatch(/SkillEffect\[SK\.MA_SHOWER\] = SkillEffect\[SK\.AC_SHOWER\];/);
	});
});
