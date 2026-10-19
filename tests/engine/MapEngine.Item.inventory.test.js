/**
 * tests/engine/MapEngine.Item.inventory.test.js
 *
 * An equipment put back into the inventory by a refine or an unequip keeps
 * its count, so the NPC sell list still shows it.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	equipped: {}
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (struct, fn) => mocks.hooks.set(struct, fn),
		sendPacket: vi.fn()
	}
}));
vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: vi.fn(), setType: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH: '',
		UpdateOwnerName: {},
		getItemInfo: () => ({ identifiedDisplayName: 'Item' }),
		getItemName: () => 'Item',
		getMessage: () => ''
	}
}));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn(), loadFiles: vi.fn() } }));
// The inventory opens on its equipment tab
vi.mock('Core/Preferences.js', () => ({
	default: { get: (_name, defaults) => ({ ...defaults, tab: 1, save: vi.fn() }) }
}));
vi.mock('Core/Configs.js', () => ({ default: { get: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('Renderer/ItemObject.js', () => ({ default: {} }));
vi.mock('Renderer/EffectManager.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: {} }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({
	default: { addComponent: c => c, getComponent: () => ({ name: 'InventoryV0' }) }
}));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/Inventory/Inventory.js', async () => ({
	default: (await import('UI/Components/Inventory/InventoryV0/InventoryV0.js')).default
}));
vi.mock('UI/Components/CartItems/CartItems.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: { remove: vi.fn() } }));
vi.mock('UI/Components/ItemCompare/ItemCompare.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemInfo/ItemInfo.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemObtain/ItemObtain.js', () => ({ default: {} }));
vi.mock('UI/Components/ItemSelection/ItemSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: vi.fn(), TYPE: {}, FILTER: {} }
}));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({
	default: {
		getUI: () => ({ getNumber: () => 0 }),
		getNumber: () => 0,
		checkEquipLoc: () => 0,
		equip: (item, location) => {
			mocks.equipped[location] = item;
		},
		unEquip: (_index, location) => {
			const item = mocks.equipped[location];
			delete mocks.equipped[location];
			return item;
		}
	}
}));
vi.mock('UI/Components/PlayerViewEquip/PlayerViewEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/Storage/Storage.js', () => ({ default: {} }));
vi.mock('UI/Components/SwitchEquip/SwitchEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/MakeItemSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/ItemListWindowSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/BasicInfo/BasicInfo.js', () => ({ default: { getUI: () => ({}) } }));
vi.mock('UI/Components/Refine/Refine.js', () => ({ default: {} }));
vi.mock('UI/Components/EnchantGrade/EnchantGrade.js', () => ({ default: {} }));
vi.mock('UI/Components/Enchant/Enchant.js', () => ({ default: {} }));
vi.mock('UI/Components/Mail/Mail.js', () => ({ default: {} }));
vi.mock('UI/Components/Rodex/WriteRodex.js', () => ({ default: {} }));

const ItemEngine = (await import('Engine/MapEngine/Item.js')).default;
const Inventory = (await import('UI/Components/Inventory/InventoryV0/InventoryV0.js')).default;
const NpcStore = (await import('UI/Components/NpcStore/NpcStore.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;
const Session = (await import('Engine/SessionStorage.js')).default;

// prepare() schedules scrollbar checks up to 500 ms out; let the last ones
// land before jsdom is torn down.
afterAll(() => new Promise(resolve => setTimeout(resolve, 600)));

function deliver(struct, fields) {
	const pkt = Object.create(struct.prototype);
	Object.assign(pkt, fields);
	mocks.hooks.get(struct)(pkt);
}

// A weapon as the pickup packet sends it, with a count of 1
function pickUp() {
	Inventory.addItem({ index: 5, ITID: 1201, type: 5, IsIdentified: 1, count: 1, RefiningLevel: 5, slot: {} });
}

// The NPC sell list the server sends for that weapon
function sellList() {
	NpcStore.append();
	NpcStore.setType(NpcStore.Type.SELL);
	NpcStore.setList([{ index: 5, price: 100, overchargeprice: 100 }]);
	const shown = NpcStore.getRoot().querySelectorAll('.InputWindow .item[data-index="5"]');
	NpcStore.remove();
	return shown;
}

describe('An equipment put back into the inventory', () => {
	beforeAll(() => {
		Session.Entity = {};
		ItemEngine();
	});

	beforeEach(() => {
		Inventory.remove();
		Inventory.append();
		pickUp();
	});

	it('can still be sold after a refine', () => {
		deliver(PACKET.ZC.ACK_ITEMREFINING, { result: 0, itemIndex: 5, RefiningLevel: 6 });

		expect(Inventory.getItemByIndex(5).RefiningLevel).toBe(6);
		expect(sellList()).toHaveLength(1);
	});

	it('can still be sold once taken off', () => {
		deliver(PACKET.ZC.REQ_WEAR_EQUIP_ACK, { result: 1, index: 5, wearLocation: 2, viewid: 0 });
		deliver(PACKET.ZC.REQ_TAKEOFF_EQUIP_ACK, { result: 1, index: 5, wearLocation: 2 });

		expect(sellList()).toHaveLength(1);
	});
});
