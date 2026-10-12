/**
 * O PICKUP NUNCA ATRIBUIA `PlaceETCTab` (R1/C-2, 14/09/2026).
 *
 * A metade "fonte" do conserto (a outra metade, na condicao da janela de
 * vender, tem prova propria em `itemDaSessaoContinuaVendavel.test.js`): o
 * handler de `ZC_ITEM_PICKUP_ACK*` (`MapEngine/Item.js`) monta o item que
 * vai para `Inventory.getUI().addItem(pkt)` sem nunca tocar em
 * `pkt.PlaceETCTab` — ele nascia `undefined` para todo item pego depois do
 * login, ao contrario da lista completa (`PacketStructure.js`, que le um
 * bit do pacote). Este teste prova que o pacote real (ACK7, que carrega
 * `favorite`) agora chega ao inventario com `PlaceETCTab` numerico.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	inventoryUI: { addItem: () => {} }
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: { hookPacket: (pkt, cb) => mocks.hooks.set(pkt, cb), sendPacket: () => {} }
}));
vi.mock('DB/DBManager.js', () => ({
	default: { getMessage: () => '', getItemName: () => 'Item de Teste', getItemInfo: () => ({}) }
}));
vi.mock('Core/Configs.js', () => ({ default: { get: () => null } }));
vi.mock('Renderer/ItemObject.js', () => ({ default: { add: () => {}, remove: () => {} } }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: { getCellHeight: () => 0 } }));
vi.mock('Renderer/EffectManager.js', () => ({ default: { add: () => {} } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { Entity: null } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: () => {}, TYPE: { ERROR: 1, BLUE: 2 }, FILTER: { ITEM: 1, FARM_ITEM: 2 } }
}));
vi.mock('UI/Components/ItemObtain/ItemObtain.js', () => ({ default: { append: () => {}, set: () => {} } }));
vi.mock('UI/Components/HuntAnalyzer/registroDaCaca.js', () => ({
	ehDropDeCaca: () => false,
	registrarItem: () => {}
}));
vi.mock('UI/Components/ItemSelection/ItemSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/Inventory/Inventory.js', () => ({ default: { getUI: () => mocks.inventoryUI } }));
vi.mock('UI/Components/CartItems/CartItems.js', () => ({ default: {} }));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({ default: {} }));
vi.mock('UI/Components/PlayerViewEquip/PlayerViewEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/SwitchEquip/SwitchEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/Storage/Storage.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/MakeItemSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/ItemListWindowSelection.js', () => ({ default: {} }));

const { default: PACKET } = await import('Network/PacketStructure.js');
const { default: ItemEngine } = await import('Engine/MapEngine/Item.js');

describe('o pickup atribui PlaceETCTab a partir de favorite', () => {
	let addItemSpy;

	beforeEach(() => {
		mocks.hooks.clear();
		addItemSpy = vi.fn();
		mocks.inventoryUI.addItem = addItemSpy;
		ItemEngine();
	});

	function pacoteDePickup(favorite) {
		return {
			result: 0,
			index: 3,
			ITID: 501,
			count: 1,
			favorite
		};
	}

	it('favorite ausente (pacotes velhos, sem o campo) vira PlaceETCTab 0', () => {
		const onPickup = mocks.hooks.get(PACKET.ZC.ITEM_PICKUP_ACK7);
		expect(onPickup, 'o handler de pickup nao foi capturado').toBeTypeOf('function');

		onPickup(pacoteDePickup(undefined));

		expect(addItemSpy).toHaveBeenCalledTimes(1);
		expect(addItemSpy.mock.calls[0][0].PlaceETCTab).toBe(0);
	});

	it('favorite 0 (o que este servidor sempre manda hoje) vira PlaceETCTab 0 — o item fica vendavel', () => {
		const onPickup = mocks.hooks.get(PACKET.ZC.ITEM_PICKUP_ACK7);

		onPickup(pacoteDePickup(0));

		expect(addItemSpy.mock.calls[0][0].PlaceETCTab).toBe(0);
	});

	it('favorite truthy chega como PlaceETCTab truthy (o dia em que o servidor passar a usar o campo)', () => {
		const onPickup = mocks.hooks.get(PACKET.ZC.ITEM_PICKUP_ACK7);

		onPickup(pacoteDePickup(1));

		expect(addItemSpy.mock.calls[0][0].PlaceETCTab).toBe(1);
	});
});
