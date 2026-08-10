import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { forEach: vi.fn() } }));
vi.mock('Renderer/Entity/Entity.js', () => ({
	default: { TYPE_WARP: -1, TYPE_MOB: 5, TYPE_NPC: 6, TYPE_NPC2: 12, TYPE_NPC_ABR: 13, TYPE_NPC_BIONIC: 14 }
}));
vi.mock('Renderer/Map/Altitude.js', () => ({
	default: { width: 100, height: 100, TYPE: { WALKABLE: 2 }, getCellType: () => 2 }
}));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { currentMap: 'test.gat' } }));
vi.mock('UI/UIManager.js', () => ({ default: { components: {} } }));
vi.mock('Engine/TextMode/MovementService.js', () => ({
	MovementError: class MovementError extends Error {},
	default: {}
}));
vi.mock('Engine/TextMode/MonsterIndexService.js', () => ({ default: {} }));
vi.mock('Engine/TextMode/MonsterSelectionStore.js', async importOriginal => {
	const original = await importOriginal();
	return { ...original, default: {} };
});
vi.mock('Engine/TextMode/AutomationProfileStore.js', () => ({ default: {} }));
vi.mock('Engine/TextMode/AutomationActionService.js', () => ({ default: class AutomationActionService {} }));

import { AutoCombatService } from 'Engine/TextMode/AutoCombatService.js';

function fixture(monsters = []) {
	const session = {
		Playing: true,
		FreezeUI: false,
		Entity: {
			position: [50, 50],
			attack_range: 1,
			action: 0,
			ACTION: { DIE: 99 },
			life: { hp: 100, hp_max: 100, sp: 100, sp_max: 100 }
		},
		moveAction: null
	};
	const movement = {
		attackEntity: vi.fn(),
		cancelMovement: vi.fn(),
		getPath: vi.fn(() => ({ out: [50, 50, 51, 50], count: 2, length: 1 })),
		moveTo: vi.fn()
	};
	const index = {
		reset: vi.fn(),
		getNearby: vi.fn(() => monsters),
		getPathDistance: vi.fn(monster => monster.pathDistance)
	};
	const selectionStore = { get: vi.fn(() => new Set([1002])) };
	const profile = {
		rules: [],
		safety: { lowHpPercent: 20, maxRecoveryAttempts: 2, recoveryTimeoutMs: 3000 },
		loot: { enabled: false, radius: 2 }
	};
	const profileStore = { get: vi.fn(() => profile), set: vi.fn() };
	const actions = {
		attackEntity: movement.attackEntity,
		useSkill: vi.fn(() => false),
		useItem: vi.fn(() => false),
		pickUpNearest: vi.fn(() => false)
	};
	const service = new AutoCombatService({
		session,
		movement,
		index,
		selectionStore,
		profileStore,
		actions,
		entityManager: { forEach: vi.fn() },
		uiManager: { components: {} },
		setIntervalFn: vi.fn(() => 1),
		clearIntervalFn: vi.fn()
	});
	service.mapName = 'test';
	return { service, session, movement, index, selectionStore, profile, actions };
}

describe('AutoCombatService', () => {
	beforeEach(() => vi.spyOn(Date, 'now').mockReturnValue(10_000));

	it('attacks only a selected species even when another monster is closer', () => {
		const monsters = [
			{ gid: 1, speciesId: 9999, name: '未勾选', distance: 1, pathDistance: 1, entity: { pathDistance: 1 } },
			{ gid: 2, speciesId: 1002, name: '波利', distance: 5, pathDistance: 5, label: 2, entity: { pathDistance: 5 } }
		];
		const { service, movement } = fixture(monsters);
		service.state = 'running';
		service.tick();
		expect(movement.attackEntity).toHaveBeenCalledWith(2);
	});

	it('chooses the nearest reachable selected monster by path distance', () => {
		const monsters = [
			{ gid: 1, speciesId: 1002, name: '波利', distance: 1, pathDistance: Infinity, entity: { pathDistance: Infinity } },
			{ gid: 2, speciesId: 1002, name: '波利', distance: 8, pathDistance: 4, label: 2, entity: { pathDistance: 4 } }
		];
		const { service, movement } = fixture(monsters);
		service.state = 'running';
		service.tick();
		expect(movement.attackEntity).toHaveBeenCalledWith(2);
	});

	it('pauses and cancels movement when a modal game UI opens', () => {
		const { service, session, movement } = fixture();
		service.state = 'running';
		session.FreezeUI = true;
		service.tick();
		expect(service.state).toBe('paused');
		expect(movement.cancelMovement).toHaveBeenCalledOnce();
	});

	it('does not start without a checked species', () => {
		const { service, selectionStore, movement } = fixture();
		selectionStore.get.mockReturnValue(new Set());
		expect(() => service.start()).toThrow('请先勾选至少一种怪物');
		expect(movement.attackEntity).not.toHaveBeenCalled();
	});

	it('runs the first eligible configured rule before normal attack', () => {
		const monsters = [
			{
				gid: 2,
				speciesId: 1002,
				name: '波利',
				distance: 2,
				pathDistance: 2,
				label: 1,
				entity: { GID: 2, pathDistance: 2 }
			}
		];
		const { service, profile, actions, movement } = fixture(monsters);
		profile.rules = [
			{ id: 'support', enabled: true, kind: 'support', skillId: 10, target: 'self', hpBelow: null, spAbove: 0, nearbyCount: 0, radius: 8, intervalMs: 500 },
			{ id: 'offense', enabled: true, kind: 'offense', skillId: 20, target: 'current-target', hpBelow: null, spAbove: 0, nearbyCount: 0, radius: 8, intervalMs: 500 }
		];
		actions.useSkill.mockReturnValue(true);
		service.state = 'running';
		service.tick();
		expect(actions.useSkill).toHaveBeenCalledWith(profile.rules[0], monsters[0]);
		expect(movement.attackEntity).not.toHaveBeenCalled();
	});

	it('stops at low HP when no configured recovery item is usable', () => {
		const { service, session, actions, movement } = fixture();
		session.Entity.life.hp = 10;
		service.state = 'running';
		service.tick();
		expect(actions.useItem).not.toHaveBeenCalled();
		expect(service.state).toBe('stopped');
		expect(service.status).toContain('没有可用恢复物品');
		expect(movement.cancelMovement).toHaveBeenCalledOnce();
	});

	it('stops after two recovery attempts do not increase HP within the timeout', () => {
		const { service, session, profile, actions } = fixture();
		profile.rules = [{ id: 'potion', enabled: true, kind: 'recovery', itemId: 501 }];
		session.Entity.life.hp = 10;
		actions.useItem.mockReturnValue(true);
		service.state = 'running';
		service.tick();
		vi.spyOn(Date, 'now').mockReturnValue(13_001);
		service.tick();
		vi.spyOn(Date, 'now').mockReturnValue(16_002);
		service.tick();
		expect(actions.useItem).toHaveBeenCalledTimes(2);
		expect(service.state).toBe('stopped');
		expect(service.status).toContain('恢复连续失败');
	});

	it('picks up before patrol when no selected target is alive', () => {
		const { service, profile, actions, movement } = fixture();
		profile.loot.enabled = true;
		actions.pickUpNearest.mockReturnValue(true);
		service.state = 'running';
		service.tick();
		expect(actions.pickUpNearest).toHaveBeenCalledWith(2);
		expect(movement.moveTo).not.toHaveBeenCalled();
	});
});
