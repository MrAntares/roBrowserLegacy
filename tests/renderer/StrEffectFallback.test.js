import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const sourceRoot = process.env.EFFECT_SOURCE_ROOT || join(process.cwd(), 'src');
const source = name => readFileSync(join(sourceRoot, name), 'utf8').replace(/^import .*;\r?$/gm, '');
const load = (code, bindings) => {
	const context = vm.createContext({ console, Float32Array, Int32Array, Int16Array, Math, Number, ...bindings });
	vm.runInContext(code, context);
	return context;
};

// A client whose data has only the files in `present`; records every request.
function strEffect(present) {
	const requests = [];
	const context = load(
		source('Renderer/Effects/StrEffect.js').replace('export default StrEffect;', 'this.StrEffect = StrEffect;'),
		{
			Client: {
				loadFile: (filename, onload, onerror, args) => {
					if (onerror) {
						requests.push([filename, args.texturePath]);
						if (!present.includes(filename)) {
							onerror('404');
						}
					}
					return present.includes(filename) ? { fps: 60, maxKey: 60, layernum: 0 } : null;
				}
			},
			glMatrix: { mat4: { create: () => new Float32Array(16) } }
		}
	);
	return { StrEffect: context.StrEffect, requests };
}

// spamSTR with StrEffect replaced by a recorder of its arguments.
function spamSTR(mineffect) {
	const made = [];
	const context = load(source('Renderer/EffectManager.js').replace('export default EffectManager;', ''), {
		SU: {},
		SkillEffect: {},
		SkillUnit: {},
		EffectDB: {},
		Preferences: { mineffect },
		StrEffect: class {
			constructor(...args) {
				made.push(args);
			}
		},
		Session: { Entity: { position: [0, 0, 0] } },
		GraphicsSettings: { performanceMode: false },
		Renderer: { tick: 1000 },
		EntityManager: { get: () => null }
	});
	return (effect, inst = {}) => {
		context.spamSTR({ effect, Inst: { position: [0, 0, 0], startTick: 0, ...inst }, Init: {} });
		return made.pop();
	};
}

// Clients move the same art between folders from one release to the next
// (iRO 2026-02 under <class>/<skill>/, iRO 2026-09 under <skill>/).
describe('STR effect fallbacks', () => {
	it('draws the first file the client has', () => {
		const { StrEffect, requests } = strEffect(['data/texture/effect/b/b.str']);
		const effect = new StrEffect('data/texture/effect/a/a.str', [0, 0, 0], 0, 'a/', [
			{ filename: 'data/texture/effect/b/b.str', texturePath: 'b/' }
		]);
		assert.deepEqual(requests, [
			['data/texture/effect/a/a.str', 'a/'],
			['data/texture/effect/b/b.str', 'b/']
		]);
		assert.equal(effect.filename, 'data/texture/effect/b/b.str');
		assert.equal(effect.texturePath, 'b/');
		assert.equal(effect.needCleanUp, undefined);
	});

	it('keeps the first file when the client has it', () => {
		const { StrEffect, requests } = strEffect(['data/texture/effect/a/a.str', 'data/texture/effect/b/b.str']);
		const effect = new StrEffect('data/texture/effect/a/a.str', [0, 0, 0], 0, 'a/', [
			{ filename: 'data/texture/effect/b/b.str', texturePath: 'b/' }
		]);
		assert.equal(requests.length, 1);
		assert.equal(effect.filename, 'data/texture/effect/a/a.str');
	});

	it('removes the effect when no candidate exists', () => {
		const { StrEffect, requests } = strEffect([]);
		const effect = new StrEffect('data/texture/effect/a/a.str', [0, 0, 0], 0, 'a/', [
			{ filename: 'data/texture/effect/b/b.str', texturePath: 'b/' }
		]);
		assert.equal(requests.length, 2);
		assert.equal(effect.needCleanUp, true);
	});

	it('gives each fallback its own folder as texture path', () => {
		const spam = spamSTR(false);
		const [filename, , , texturePath, fallbacks] = spam({
			file: 'dragon_knight/dk_madness_crusher/madness_crusher/madness_crusher',
			texturePath: 'dragon_knight/dk_madness_crusher/madness_crusher/',
			fallback: ['madness_crusher/madness_crusher/madness_crusher']
		});
		assert.equal(filename, 'data/texture/effect/dragon_knight/dk_madness_crusher/madness_crusher/madness_crusher.str');
		assert.equal(texturePath, 'dragon_knight/dk_madness_crusher/madness_crusher/');
		assert.deepEqual(JSON.parse(JSON.stringify(fallbacks)), [
			{
				filename: 'data/texture/effect/madness_crusher/madness_crusher/madness_crusher.str',
				texturePath: 'madness_crusher/madness_crusher/'
			}
		]);
	});

	it('uses one random pick for the file and its fallbacks', () => {
		const spam = spamSTR(false);
		for (let i = 0; i < 20; i++) {
			const [filename, , , , fallbacks] = spam({
				file: 'dragon_knight/dk_stormslash/stormslash/stormslash_%d',
				texturePath: 'dragon_knight/dk_stormslash/stormslash/',
				rand: [1, 5],
				fallback: ['stormslash/stormslash/stormslash_%d']
			});
			const n = filename.match(/stormslash_(\d)\.str$/)[1];
			assert.equal(fallbacks[0].filename, `data/texture/effect/stormslash/stormslash/stormslash_${n}.str`);
		}
	});

	it('falls back from a missing minimal effect to the full one', () => {
		const spam = spamSTR(true);
		const [filename, , , , fallbacks] = spam({
			file: 'a/a',
			min: 'a/min_a',
			texturePath: 'a/',
			fallback: ['b/b']
		});
		assert.equal(filename, 'data/texture/effect/a/min_a.str');
		assert.deepEqual(
			fallbacks.map(f => f.filename),
			['data/texture/effect/a/a.str', 'data/texture/effect/b/b.str']
		);
	});
});
