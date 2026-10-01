import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Preferences read localStorage while the modules load
vi.hoisted(() => {
	const store = {};
	globalThis.localStorage ??= {
		getItem: key => store[key] ?? null,
		setItem: (key, value) => (store[key] = String(value)),
		removeItem: key => delete store[key]
	};
});

const mocks = vi.hoisted(() => ({
	entities: {},
	skillEffect: {
		100: { effectId: 'ef_target', effectIdOnCaster: 'ef_caster' }
	}
}));

vi.mock('DB/Effects/EffectTable.js', () => ({ default: {} }));
vi.mock('DB/Skills/SkillEffect.js', () => ({ default: mocks.skillEffect }));
vi.mock('DB/Skills/SkillUnit.js', () => ({ default: {} }));
vi.mock('DB/Skills/SkillUnitConst.js', () => ({ default: {} }));
vi.mock('DB/Items/ItemEffect.js', () => ({ default: {} }));
vi.mock('Controls/ProcessCommand.js', () => ({ default: { add: vi.fn() } }));
vi.mock('Core/Events.js', () => ({ default: { setTimeout: vi.fn() } }));
vi.mock('Core/Configs.js', () => ({ default: { get: vi.fn() } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { get: aid => mocks.entities[aid] } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { tick: 0 } }));
vi.mock('Audio/SoundManager.js', () => ({ default: {} }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('DB/DBManager.js', () => ({ default: {} }));
vi.mock('Renderer/Camera.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/Cylinder.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/StrEffect.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/RsmEffect.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/TwoDEffect.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/ThreeDEffect.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/QuadHorn.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/Trail.js', () => ({ default: function () {} }));
vi.mock('Renderer/Effects/WaterfallEffect.js', () => ({ default: function () {} }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: function () {} }));

const { default: EffectManager } = await import('Renderer/EffectManager.js');

describe('EffectManager.spamSkill: effectIdOnCaster', () => {
	let spam;

	beforeEach(() => {
		mocks.entities = {};
		spam = vi.spyOn(EffectManager, 'spam').mockImplementation(() => {});
	});

	afterEach(() => {
		spam.mockRestore();
	});

	it("draws a ground skill's caster effect at the caster, and its effect at the target cell", () => {
		mocks.entities[1] = { position: [10, 10, 0] };
		const cell = [18, 10, 0];

		EffectManager.spamSkill(100, 1, cell, 0, 1);

		const byId = Object.fromEntries(spam.mock.calls.map(([par]) => [par.effectId, par]));
		expect(byId.ef_target.position).toBe(cell);
		expect(byId.ef_caster.ownerAID).toBe(1);
		expect(byId.ef_caster.position).toBeUndefined();
	});

	it('keeps the given position when the caster is not in view', () => {
		const cell = [18, 10, 0];

		EffectManager.spamSkill(100, 2, cell, 0, 1);

		const caster = spam.mock.calls.map(([par]) => par).find(par => par.effectId === 'ef_caster');
		expect(caster.position).toBe(cell);
	});
});
