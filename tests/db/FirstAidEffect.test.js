import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

// First Aid (NV_FIRSTAID, effect 309) as the official client draws it.
// Numbers from the official client (kRO 2025-07-16).

const { twoDAlpha, twoDPulse } = await import('Renderer/Effects/TwoDEffect.js');

const TICK = 1000 / 60;
const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

// The effect table imports most of the renderer, so read entry 309 from its source.
function effectEntry(id) {
	const source = read('DB/Effects/EffectTable.js');
	const start = source.indexOf(`\n\t${id}: [`);
	const end = source.indexOf('\n\t],', start);
	const body = source.slice(start, end + 3).trim().replace(/^\d+:/, '').replace(/,$/, '');
	return vm.runInNewContext(`(${body})`);
}

describe('First Aid (effect 309)', () => {
	const [sprite] = effectEntry(309);

	it('is the skill effect of NV_FIRSTAID, on the source of a successful use packet', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(/SkillEffect\[SK\.NV_FIRSTAID\] = \{ successEffectIdOnCaster: 309 \};/);
	});

	it('is one additive pikapika2 billboard, 4 cells across, 2.4 cells up, tinted (150, 150, 250)', () => {
		expect(effectEntry(309)).toHaveLength(1);
		expect(sprite).toMatchObject({
			type: '2D',
			file: 'effect/pikapika2.bmp',
			blendMode: 2,
			size: 140,
			posz: 2.4,
			angleRand: [0, 359],
			wav: '_heal_effect'
		});
		expect(sprite.red).toBeCloseTo(150 / 255, 6);
		expect(sprite.green).toBeCloseTo(150 / 255, 6);
		expect(sprite.blue).toBeCloseTo(250 / 255, 6);
		expect(sprite.alphaMax).toBeCloseTo(80 / 255, 6);
	});

	it('fades in over 20 ticks, holds to tick 100 and is gone at tick 180', () => {
		expect(sprite.duration).toBeCloseTo(180 * TICK, 6);
		const fx = { alphaMax: sprite.alphaMax, fadeInMs: sprite.fadeInMs, fadeOutStartMs: sprite.fadeOutStartMs };
		const at = ticks => twoDAlpha(fx, ticks * TICK, sprite.duration) * 255;
		expect(at(0)).toBeCloseTo(0, 6);
		expect(at(10)).toBeCloseTo(40, 6); // +4 a tick
		expect(at(20)).toBeCloseTo(80, 6);
		expect(at(60)).toBeCloseTo(80, 6);
		expect(at(100)).toBeCloseTo(80, 6);
		expect(at(140)).toBeCloseTo(40, 6); // -1 a tick
		expect(at(180)).toBeCloseTo(0, 6);
	});
	it('pulses its size by +-5 %, 3 deg a tick from a random phase (one pulse every 2 s)', () => {
		expect(sprite.sizePulse).toEqual({ amount: 0.05, degPerTick: 3 });
		const fx = { sizePulse: sprite.sizePulse, pulsePhase: 0 };
		expect(twoDPulse(fx, 0)).toBeCloseTo(1, 6);
		expect(twoDPulse(fx, 30 * TICK)).toBeCloseTo(1.05, 6); // 90 deg
		expect(twoDPulse(fx, 90 * TICK)).toBeCloseTo(0.95, 6); // 270 deg
		expect(twoDPulse(fx, 120 * TICK)).toBeCloseTo(1, 6); // full cycle
		expect(twoDPulse({ sizePulse: sprite.sizePulse, pulsePhase: 90 }, 0)).toBeCloseTo(1.05, 6);
		expect(twoDPulse({}, 500)).toBe(1);
	});

	it('stays where the caster stood at launch', () => {
		expect(sprite.attachedEntity).toBeFalsy();
	});
});

describe('2D effect fades without fadeInMs / fadeOutStartMs', () => {
	it('keeps the old quarter fades', () => {
		const fx = { alphaMax: 1, fadeIn: true, fadeOut: true, fadeInMs: 0, fadeOutStartMs: -1 };
		expect(twoDAlpha(fx, 125, 1000)).toBeCloseTo(0.5, 6);
		expect(twoDAlpha(fx, 500, 1000)).toBe(1);
		expect(twoDAlpha(fx, 875, 1000)).toBeCloseTo(0.5, 6);
	});
});
