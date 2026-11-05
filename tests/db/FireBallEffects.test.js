import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { effectTableSource } from '../helpers/effectTableSource.js';

// Fire Ball (MG_FIREBALL, skill 17), as the official client plays it: effect 24 on the
// caster as each damage packet arrives. It throws four fireball sprites at that target on
// ticks 20, 24, 28 and 32 (one sound each), flying 20 ticks, 15 units (3 cells) up; the first
// plain, the next three tinted (246, 199, 76) at alpha 180, 130 and 80. The hit plays 49 and 1
// once per damage packet.

const read = file => readFileSync(join(process.cwd(), 'src', file), 'utf8').replace(/\r\n/g, '\n');

function effect24() {
	const table = effectTableSource().replace(/\r\n/g, '\n');
	const start = table.indexOf('\n\t24: [');
	const text = table.slice(table.indexOf('[', start), table.indexOf('\n\t],', start) + 3);
	return vm.runInNewContext(`(${text})`);
}

const TICK = 1000 / 60;

describe('Fire Ball effects', () => {
	it('plays 24 on the caster per damage packet and 49 + 1 once on the hit', () => {
		expect(read('DB/Skills/SkillEffect.js')).toMatch(
			/SkillEffect\[SK\.MG_FIREBALL\] = \{ damageEffectIdOnCaster: 24, hitEffectId: \[49, 1\], hitEffectOnce: true \};/
		);
	});

	it('throws four balls on ticks 20, 24, 28 and 32, each flying 20 ticks to the target', () => {
		const balls = effect24().filter(part => part.type === '3D');
		expect(balls).toHaveLength(4);
		balls.forEach((ball, i) => {
			expect(ball.spriteName).toBe('fireball');
			expect(ball.fromSrc).toBe(true);
			expect(ball.attachedEntity).toBe(false);
			expect(ball.zOffset).toBe(3);
			expect(Math.abs(ball.delayStart - (20 + 4 * i) * TICK)).toBeLessThan(1);
			expect(Math.abs(ball.duration - 20 * TICK)).toBeLessThan(1);
		});
	});

	it('draws the first plain and the others tinted and fainter', () => {
		const balls = effect24().filter(part => part.type === '3D');
		expect(balls[0].alphaMax).toBe(1);
		expect(balls[0].red).toBeUndefined();
		expect(balls.slice(1).map(b => Math.round(b.alphaMax * 255))).toEqual([180, 130, 80]);
		balls.slice(1).forEach(b => {
			expect([b.red, b.green, b.blue].map(c => Math.round(c * 255))).toEqual([246, 199, 76]);
		});
	});

	it('plays one sound per ball, as it is thrown', () => {
		const sounds = effect24().filter(part => part.wav);
		expect(sounds.map(s => s.wav)).toEqual(Array(4).fill('effect/ef_fireball'));
		sounds.forEach((s, i) => expect(Math.abs(s.delayWav - (20 + 4 * i) * TICK)).toBeLessThan(1));
	});
});
