import { describe, it, expect } from 'vitest';
import { buildWorld, flagCore, RB_UNIT_SCALE, RB_PLACEMENT_OFS } from 'Renderer/GR2/gr2World.js';

// Row-major flat mat4 (v.M): 3x3 linear at [0,1,2 / 4,5,6 / 8,9,10], translation at [12,13,14].
const rowMag = (m, r) => Math.hypot(m[r * 4], m[r * 4 + 1], m[r * 4 + 2]);
function det3(m) {
	const a = m[0],
		b = m[1],
		c = m[2],
		d = m[4],
		e = m[5],
		f = m[6],
		g = m[8],
		h = m[9],
		i = m[10];
	return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

describe('gr2World.buildWorld — /5 referential (build-7 reconciliation)', () => {
	// DIR 90 exercises a real rotation; POS 0 isolates the straddle.
	const rb = buildWorld(90, [0, 0, 0]);

	it('scales the geometry 3x3 rows to 0.2 (the /5 master scale)', () => {
		expect(RB_UNIT_SCALE).toBe(0.2);
		for (let r = 0; r < 3; r++) {
			expect(Math.abs(rowMag(rb, r) - 0.2)).toBeLessThan(1e-6);
		}
	});

	it('preserves chirality (det(3x3) < 0 — the flipX reflection is intact)', () => {
		expect(det3(rb)).toBeLessThan(0);
	});

	it('straddles the cell by -0.4 on X,Z with position fed unchanged', () => {
		expect(RB_PLACEMENT_OFS).toBe(-0.4);
		expect(Math.abs(rb[12] - -0.4)).toBeLessThan(1e-6);
		expect(Math.abs(rb[13] - 0)).toBeLessThan(1e-6);
		expect(Math.abs(rb[14] - -0.4)).toBeLessThan(1e-6);

		// Position is left in the caller referential (only geometry + straddle scale) — a mob at
		// cell (10, 20) translates to (10 - 0.4, 0, 20 - 0.4), NOT (2 - 0.4, ...).
		const placed = buildWorld(90, [10, 0, 20]);
		expect(Math.abs(placed[12] - 9.6)).toBeLessThan(1e-6);
		expect(Math.abs(placed[14] - 19.6)).toBeLessThan(1e-6);
	});

	it('applies ipRow innermost (identity ipRow is a no-op)', () => {
		const withIdentityIp = buildWorld(90, [0, 0, 0], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
		for (let k = 0; k < 16; k++) {
			expect(Math.abs(withIdentityIp[k] - rb[k])).toBeLessThan(1e-6);
		}
	});

	it('flagCore leaves position unscaled (scale hits geometry, not translation)', () => {
		const core = flagCore(90, [4, 0, 8]);
		expect(Math.abs(core[12] - (4 + RB_PLACEMENT_OFS))).toBeLessThan(1e-6);
		expect(Math.abs(core[14] - (8 + RB_PLACEMENT_OFS))).toBeLessThan(1e-6);
	});
});
