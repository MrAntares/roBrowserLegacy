import { describe, expect, it, vi } from 'vitest';
import { TextCommandService } from 'Engine/TextMode/TextCommandService.js';

function createService() {
	const movement = {
		moveDirection: vi.fn(),
		moveTo: vi.fn(),
		moveToLandmark: vi.fn(() => ({ name: '卡普拉职员', x: 10, y: 20 })),
		attackEntity: vi.fn(),
		cancelMovement: vi.fn()
	};
	const monsterIndex = {
		getByLabel: vi.fn(() => ({ label: 1, gid: 42, name: '波利' })),
		getSpeciesCatalog: vi.fn(() => [{ id: 1002, name: '波利' }])
	};
	const autoCombat = { state: 'stopped', start: vi.fn(), pause: vi.fn(), resume: vi.fn(), stop: vi.fn() };
	const selectionStore = { toggle: vi.fn() };
	return {
		movement,
		monsterIndex,
		autoCombat,
		selectionStore,
		service: new TextCommandService({ movement, monsterIndex, autoCombat, selectionStore, getMapName: () => 'prt_fild08' })
	};
}

describe('TextCommandService', () => {
	it('parses direction and coordinate movement', () => {
		const { service, movement } = createService();
		service.execute('北 5');
		service.execute('前往 160 182');

		expect(movement.moveDirection).toHaveBeenCalledWith('北', '5');
		expect(movement.moveTo).toHaveBeenCalledWith('160', '182');
	});

	it('attacks exactly the selected nearby gid and stops automation', () => {
		const { service, movement, autoCombat } = createService();
		service.execute('攻击 @1');

		expect(autoCombat.stop).toHaveBeenCalledOnce();
		expect(movement.attackEntity).toHaveBeenCalledWith(42);
	});

	it('checking a species does not start combat', () => {
		const { service, selectionStore, autoCombat } = createService();
		service.execute('勾选 波利');

		expect(selectionStore.toggle).toHaveBeenCalledWith('prt_fild08', 1002, true);
		expect(autoCombat.start).not.toHaveBeenCalled();
	});

	it('requires an explicit start command', () => {
		const { service, autoCombat } = createService();
		service.execute('开始挂机');
		expect(autoCombat.start).toHaveBeenCalledOnce();
	});

	it('stop also cancels a single-target attack or queued movement', () => {
		const { service, autoCombat, movement } = createService();
		service.execute('停止');
		expect(autoCombat.stop).toHaveBeenCalledOnce();
		expect(movement.cancelMovement).toHaveBeenCalledOnce();
	});
});
