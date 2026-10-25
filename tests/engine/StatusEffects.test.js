import { beforeEach, describe, expect, it, vi } from 'vitest';

const running = new Set();
vi.mock('Renderer/EffectManager.js', () => ({
	default: {
		spam: vi.fn(par => {
			if (par.persistent) {
				running.add(par.ownerAID + ':' + par.effectId);
			}
		}),
		has: vi.fn((AID, effectId) => running.has(AID + ':' + effectId)),
		remove: vi.fn((effect, AID, effectId) => running.delete(AID + ':' + effectId))
	}
}));

const { default: EffectManager } = await import('Renderer/EffectManager.js');
const { default: StatusConst } = await import('DB/Status/StatusConst.js');
const { updateStatusEffects } = await import('Engine/MapEngine/StatusEffects.js');

describe('status effects', () => {
	beforeEach(() => {
		running.clear();
		vi.clearAllMocks();
	});

	it('plays the start rows and starts the loops when the status starts', () => {
		updateStatusEffects(7, StatusConst.DANCING_KNIFE, 1);
		expect(EffectManager.spam.mock.calls.map(c => c[0])).toEqual([
			{ effectId: 'dancing_knife_skill_bottom_begin', ownerAID: 7 },
			{ effectId: 'dancing_knife_skill_begin', ownerAID: 7 },
			{ effectId: 'dancing_knife_skill_bottom_loop', ownerAID: 7, persistent: true },
			{ effectId: 'dancing_knife_skill_loop', ownerAID: 7, persistent: true }
		]);
	});

	it('keeps one loop per actor when the status is sent again', () => {
		updateStatusEffects(7, StatusConst.VIGOR, 1);
		updateStatusEffects(7, StatusConst.VIGOR, 1);
		updateStatusEffects(8, StatusConst.VIGOR, 1);
		expect(EffectManager.spam.mock.calls.map(c => [c[0].ownerAID, c[0].effectId])).toEqual([
			[7, 'vigor_buff'],
			[8, 'vigor_buff']
		]);
	});

	it('stops only the loops when the status ends', () => {
		updateStatusEffects(7, StatusConst.DANCING_KNIFE, 1);
		updateStatusEffects(7, StatusConst.DANCING_KNIFE, 0);
		expect(EffectManager.remove.mock.calls).toEqual([
			[null, 7, 'dancing_knife_skill_bottom_loop'],
			[null, 7, 'dancing_knife_skill_loop']
		]);
	});

	it('ignores statuses with no effects', () => {
		updateStatusEffects(7, 999999, 1);
		updateStatusEffects(7, 999999, 0);
		expect(EffectManager.spam).not.toHaveBeenCalled();
		expect(EffectManager.remove).not.toHaveBeenCalled();
	});

	it('treats a status packet without a state as the status being on', async () => {
		// 0x8ff and 0x984 list the statuses an actor already has when it comes into view
		const { readFileSync } = await import('node:fs');
		const { join } = await import('node:path');
		const entity = readFileSync(join(process.cwd(), 'src/Engine/MapEngine/Entity.js'), 'utf8');
		expect(entity).toContain(
			"updateStatusEffects(pkt.AID, pkt.index, Object.prototype.hasOwnProperty.call(pkt, 'state') ? pkt.state : 1);"
		);
	});
});
