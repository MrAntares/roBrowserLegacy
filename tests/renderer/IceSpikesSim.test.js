import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	SPIKE,
	PATH,
	SHARDS,
	SPIKE_VERTICES,
	planPath,
	planShards,
	spikeAt,
	spikeAxes,
	buildSpike
} from 'Renderer/Effects/IceSpikesSim.js';

// Frost Diver's ice spikes (official primitive 9): the path (27) and the hit (28).

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');
const fixed = value => () => value;

describe('IceSpikesSim', () => {
	it('lays one spike a tick, 5 units out then every 2, until within 2.5 of the target', () => {
		const spikes = planPath(25, 0, fixed(0));
		expect(spikes.map(s => s.spawn)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
		// r(360) = 0, so each sits 0.5 units off the line along +x
		expect(spikes.map(s => s.x)).toEqual([5.5, 7.5, 9.5, 11.5, 13.5, 15.5, 17.5, 19.5, 21.5, 23.5]);
		expect(planPath(3, 4, fixed(0))).toHaveLength(1);
	});

	it('gives the path thin needles and the hit wide crystals', () => {
		const [low] = planPath(25, 0, fixed(0));
		expect(low).toMatchObject({ size: 0.6, height: 15, pitch: 75, alpha: 254 });
		const [high] = planPath(25, 0, fixed(0.999));
		expect(high).toMatchObject({ size: 0.99, height: 17.9, pitch: 104, yaw: 359 });
		const shards = planShards(fixed(0));
		expect(shards).toHaveLength(8);
		expect(shards[0]).toMatchObject({ spawn: 0, size: 1, height: 20, pitch: 80, alpha: 200 });
		expect(planShards(fixed(0.999))[0]).toMatchObject({ size: 3.49, height: 29.9, pitch: 99 });
		expect(PATH.life).toBe(150);
		expect(SHARDS.life).toBe(100);
	});

	it('pushes 28.5 units out of the ground over 20 ticks, then fades from tick 30 to 40', () => {
		const spike = planShards(fixed(0))[0];
		expect(spikeAt(spike, 1).rise).toBeCloseTo(2.85, 6);
		expect(spikeAt(spike, 20).rise).toBeCloseTo(28.5, 6);
		expect(spikeAt(spike, 25).rise).toBeCloseTo(28.5, 6);
		expect(spikeAt(spike, 30).alpha).toBe(200);
		expect(spikeAt(spike, 35).alpha).toBeCloseTo(100, 6);
		expect(spikeAt(spike, 40)).toBeNull();
		expect(SPIKE.depth).toBe(30);
	});

	it('points pitch 90 straight up', () => {
		const [axis] = spikeAxes({ yaw: 40, pitch: 90 });
		expect(axis[2]).toBeCloseTo(1, 9);
	});

	it('builds four faces with the tip H out along the axis', () => {
		const spike = { x: 0, y: 0, size: 1, height: 20, yaw: 0, pitch: 90 };
		const out = new Float32Array(SPIKE_VERTICES * 5);
		expect(buildSpike(out, 0, spike, 28.5, [0, 0, 0])).toBe(SPIKE_VERTICES * 5);
		// vertex 1 is the tip: 30 under, pushed out 28.5, 20 more up
		expect(-out[6] * 5).toBeCloseTo(-30 + 28.5 + 20, 4);
		expect([out[8], out[9]]).toEqual([0, 0]);
		// the faces take a quarter of the texture each
		expect(out[3 * 5 * 3 + 3]).toBeCloseTo(0.75, 6);
	});
});

describe('Frost Diver wiring', () => {
	it('plays 27 on the caster per damage packet, 51 and 28 on the hit', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(
			/SkillEffect\[SK\.MG_FROSTDIVER\] = \{ damageEffectIdOnCaster: 27, hitEffectId: \[51, 28\] \};/
		);
	});

	it('draws 27 and 28 with IceSpikes, 28 with its sound', () => {
		const table = read('DB/Effects/EffectTable.js');
		const entry = id => {
			const start = table.indexOf(`\n\t${id}: [`);
			return table.slice(start, table.indexOf('\n\t],', start));
		};
		expect(entry(27)).toMatch(/new IceSpikes\(at, Params\.Inst\.startTick, spikes, ICE_PATH\.life\)/);
		expect(entry(28)).toMatch(/planIceShards\(\)/);
		expect(entry(28)).toMatch(/wav: 'effect\/ef_frostdiver2'/);
		expect(entry(28)).not.toMatch(/freeze/);
	});
});
