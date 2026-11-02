import { beforeEach, describe, expect, it, vi } from 'vitest';

// onItemEquip is module-private and only reachable through the hooks
// ItemEngine() registers, so the Network mock keeps the map of packet
// structure -> handler.
const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	inventory: new Map(),
	equipped: []
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (struct, fn) => mocks.hooks.set(struct, fn),
		sendPacket: vi.fn()
	}
}));

vi.mock('DB/DBManager.js', () => ({ default: { getMessage: () => '', getItemName: () => '', INTERFACE_PATH: '' } }));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { Entity: {} } }));
vi.mock('Renderer/ItemObject.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: {} }));
vi.mock('Renderer/EffectManager.js', () => ({ default: {} }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {}, FILTER: {} } }));
vi.mock('UI/Components/ItemObtain/ItemObtain.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemSelection/ItemSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/Inventory/Inventory.js', () => ({
	default: {
		removeItem: index => {
			const item = mocks.inventory.get(index);
			mocks.inventory.delete(index);
			return item;
		}
	}
}));
vi.mock('UI/Components/CartItems/CartItems.js', () => ({ default: {} }));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({
	default: {
		equip: (item, location) => mocks.equipped.push({ item, location }),
		checkEquipLoc: () => 0
	}
}));
vi.mock('UI/Components/PlayerViewEquip/PlayerViewEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/SwitchEquip/SwitchEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/MakeItemSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/ItemListWindowSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/Storage/Storage.js', () => ({ default: {} }));

const ItemEngine = (await import('Engine/MapEngine/Item.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;
const EquipLocation = (await import('DB/Items/EquipmentLocation.js')).default;

ItemEngine();

function equip(pkt) {
	mocks.hooks.get(PACKET.ZC.ACK_WEAR_EQUIP_V5)({ result: true, ...pkt });
}

describe('Equipping an item', () => {
	beforeEach(() => {
		mocks.inventory.clear();
		mocks.equipped.length = 0;
	});

	// A headgear received after login (pickup, NPC, trade) arrives without
	// wItemSpriteNumber, and the equip window draws headgear from it.
	it('gives an item received this session the sprite number from the ack', () => {
		mocks.inventory.set(5, { index: 5, ITID: 400137 });
		equip({ index: 5, wearLocation: EquipLocation.HEAD_TOP, viewid: 1529 });

		expect(mocks.equipped[0].item.wItemSpriteNumber).toBe(1529);
	});

	it('keeps the ack as the source of truth for an item from the login list', () => {
		mocks.inventory.set(6, { index: 6, ITID: 2220, wItemSpriteNumber: 1 });
		equip({ index: 6, wearLocation: EquipLocation.HEAD_TOP, viewid: 1 });

		expect(mocks.equipped[0].item.wItemSpriteNumber).toBe(1);
	});

	it('leaves the item alone when the ack has no view id (old packet)', () => {
		mocks.inventory.set(7, { index: 7, ITID: 2220, wItemSpriteNumber: 1 });
		equip({ index: 7, wearLocation: EquipLocation.HEAD_TOP, viewid: undefined });

		expect(mocks.equipped[0].item.wItemSpriteNumber).toBe(1);
	});
});
