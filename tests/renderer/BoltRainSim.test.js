import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	BOLT,
	BOLT_KINDS,
	BOLT_RING,
	BOLT_VERTICES,
	planBolts,
	boltAt,
	boltFrame,
	buildBolt,
	ringStart,
	planSparks,
	SPARK,
	randomInt
} from 'Renderer/Effects/BoltRainSim.js';
import { createPrimState, advancePrim } from 'Renderer/Effects/EffectPrimSim.js';

// Cold Bolt (26) and Fire Bolt (31) as the official client draws them.

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');
const fixed = value => () => value;

describe('BoltRainSim', () => {
	it('drops one bolt per hit, from tick 12, 10 ticks apart', () => {
		expect(planBolts(5).map(b => b.spawn)).toEqual([12, 22, 32, 42, 52]);
		expect(planBolts(0)).toHaveLength(1);
		expect(planBolts(80)).toHaveLength(50);
	});

	it('starts every bolt 60 up on the same side of the target', () => {
		const low = planBolts(1, fixed(0))[0];
		const high = planBolts(1, fixed(0.999))[0];
		expect(low.start).toEqual({ x: 25, y: 15, up: 60 });
		expect(high.start).toEqual({ x: 34, y: 24, up: 60 });
		expect(randomInt(4, fixed(0.999))).toBe(3);
	});

	it('flies 2.75 units a tick toward the feet, dropping at atan(60 / ground distance)', () => {
		const bolt = planBolts(1, fixed(0))[0];
		const { x, y, up } = bolt.step;
		expect(Math.hypot(x, y, up)).toBeCloseTo(2.75, 6);
		expect(Math.atan2(-up, Math.hypot(x, y))).toBeCloseTo(Math.atan2(60, Math.hypot(25, 15)), 6);
		// heading from (25, 15) to the aim point (-2, -2)
		expect(Math.atan2(y, x)).toBeCloseTo(Math.atan2(-17, -27), 6);
		expect(bolt.flight).toBe(Math.ceil(60 / -up));
	});

	it('stops in the ground, shows 5 more ticks at full alpha, then fades over 20', () => {
		const bolt = planBolts(1, fixed(0))[0];
		const landed = boltAt(bolt, bolt.flight);
		expect(landed.up).toBeLessThanOrEqual(0);
		expect(landed.alpha).toBe(254);
		expect(boltAt(bolt, bolt.flight + 3)).toMatchObject({ x: landed.x, y: landed.y, alpha: 254 });
		expect(boltAt(bolt, bolt.flight + 15).alpha).toBeCloseTo(127, 6);
		expect(boltAt(bolt, bolt.flight + 25)).toBeNull();
		expect(boltAt(bolt, -1)).toBeNull();
	});

	it('opens a ring at the target as each bolt lands', () => {
		const bolt = planBolts(1, fixed(0))[0];
		expect(ringStart(bolt)).toBe(12 + bolt.flight);
		expect(BOLT_RING).toMatchObject({ prim: 'ring', frames: 30, radiusSpeed: 1.2, width: 10, fadeOutFrame: 20 });
		expect(BOLT_RING.radiusAccel).toBeCloseTo(-2.4 / 70, 9);
		const state = createPrimState(BOLT_RING);
		advancePrim(state, 10);
		expect(state.alpha).toBeCloseTo(254, 6);
		advancePrim(state, 30);
		expect(state.alpha).toBeCloseTo(0, 6);
	});

	it('draws the two bolts with their own sizes and textures', () => {
		expect(BOLT_KINDS.cold).toMatchObject({ length: 11.5, width: 3.8, frames: ['icearrow.tga'], ring: 'ring_blue.tga' });
		expect(BOLT_KINDS.fire).toMatchObject({ length: 14, width: 3.5, ring: 'ring_yellow.tga' });
		expect(BOLT_KINDS.fire.frames).toHaveLength(6);
		expect([0, 1, 5, 6].map(age => boltFrame(BOLT_KINDS.fire, age))).toEqual([0, 1, 5, 0]);
		expect(BOLT.effectLife).toBe(160);
	});

	it('builds two crossed quads along the line, U 1 at the head', () => {
		const bolt = planBolts(1, fixed(0))[0];
		const point = boltAt(bolt, 0);
		const out = new Float32Array(BOLT_VERTICES * 5);
		expect(buildBolt(out, 0, bolt, point, BOLT_KINDS.cold, [10, 20, 0])).toBe(BOLT_VERTICES * 5);
		// second vertex: the head, on the -W side; it sits ahead of the centre along the flight
		const head = [out[5] - 10.5, -out[6], out[7] - 20.5].map(c => c * 5);
		const len = Math.hypot(bolt.step.x, bolt.step.y, bolt.step.up);
		const along =
			((head[0] - point.x) * bolt.step.x + (head[2] - point.y) * bolt.step.y + (head[1] - point.up) * bolt.step.up) /
			len;
		expect(along).toBeCloseTo(11.5, 4);
		expect([out[8], out[9]]).toEqual([1, 1]);
	});
});

describe('Cold Bolt wiring', () => {
	it('plays 26 on the target per damage packet and 51 on every hit', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(
			/SkillEffect\[SK\.MG_COLDBOLT\] = \{ damageEffectIdOnTarget: 26, hitEffectId: 51 \};/
		);
	});

	it('draws 26 with BoltRain and the hit count, one sound on tick 12', () => {
		const table = read('DB/Effects/EffectTable.js');
		const start = table.indexOf('\n\t26: [');
		const entry = table.slice(start, table.indexOf('\n\t],', start));
		expect(entry).toMatch(/new BoltRain\(Params\.Init\.ownerEntity\.position, Params\.Inst\.startTick, Params\.Init\.hitCount, 'cold'\)/);
		expect(entry).toMatch(/wav: 'effect\/ef_icearrow%d',\n\t\t\trand: \[1, 3\],\n\t\t\tdelayWav: 200/);
	});

	it('hands the damage packet hit count to the damage-packet effects', () => {
		expect(read('Engine/MapEngine/Entity.js')).toMatch(
			/EffectManager\.spamSkillDamage\(\s*pkt\.SKID,\s*pkt\.targetID,\s*Renderer\.tick,\s*pkt\.AID,\s*undefined,\s*pkt\.count[,)]/
		);
		expect(read('Renderer/EffectManager.js')).toMatch(/otherAID: otherAID,\n[^\n]*\n\t\t\t\t\thitCount: hitCount/);
	});
});

describe('Fire Bolt sparks', () => {
	it('sheds one every 4 ticks from the newest bolt, once the first is out', () => {
		const bolts = planBolts(3, fixed(0));
		const sparks = planSparks(bolts, fixed(0));
		expect(sparks[0].tick).toBe(12);
		expect(sparks.map(s => s.tick).slice(0, 4)).toEqual([12, 16, 20, 24]);
		expect(sparks[sparks.length - 1].tick).toBe(156);
		// tick 24 belongs to the second bolt (out on tick 22), two ticks into its flight
		const second = bolts[1];
		expect(sparks[3].start.x).toBeCloseTo(second.start.x + second.step.x * 2, 6);
		expect(sparks[3].start.up).toBeCloseTo(60 + second.step.up * 2, 6);
	});

	it('flies back up the bolt line, slowing to a third, for 6 to 29 ticks', () => {
		const bolts = planBolts(1, fixed(0));
		const [low] = planSparks(bolts, fixed(0));
		expect(low.life).toBe(6);
		expect(low.scale).toBeCloseTo(0.2, 6);
		expect(low.end.up).toBeGreaterThan(low.start.up);
		const [high] = planSparks(bolts, fixed(0.999));
		expect(high.life).toBe(29);
		expect(high.scale).toBeCloseTo(0.49, 6);
		expect(SPARK).toMatchObject({ every: 4, speed: 60, speedSpread: 90, slow: 1.5, turn: 20, tilt: 10 });
	});
});

describe('Fire Bolt wiring', () => {
	it('plays 31 on the target per damage packet and 49 on every hit', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(
			/SkillEffect\[SK\.MG_FIREBOLT\] = \{ damageEffectIdOnTarget: 31, hitEffectId: 49 \};/
		);
	});

	it('draws 31 with BoltRain, its sparks as particle4 sprites, one sound on tick 12', () => {
		const table = read('DB/Effects/EffectTable.js');
		const start = table.indexOf('\n\t31: [');
		const entry = table.slice(start, table.indexOf('\n\t],', start));
		expect(entry).toMatch(/Params\.Init\.hitCount,\s*'fire',\s*Math\.random,\s*spark\s*\)/);
		expect(entry).toMatch(/spriteName: 'particle4'/);
		expect(entry).toMatch(/wav: 'effect\/ef_firearrow%d',\n\t\t\trand: \[1, 3\],\n\t\t\tdelayWav: 200/);
	});
});
