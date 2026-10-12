/**
 * A PREMISSA DO C-3 (R1, 14/09/2026): `ZC_DELETE_ITEM_FROM_BODY` DE CADA
 * VENDA CHEGA E ATUALIZA `Inventory.list`.
 *
 * `onSellResult` (MapEngine/Store.js) NAO remove item nenhum por conta
 * propria: ele so REFAZ a janela de vender chamando `NpcStore.setList`, que
 * por sua vez re-filtra contra `Inventory.getUI().getItemByIndex(...)` — ou
 * seja, o item vendido so sai da lista de vender se ele JA tiver saido do
 * INVENTARIO antes de `onSellResult` rodar. Quem tira o item do inventario e
 * um pacote SEPARADO — `ZC_DELETE_ITEM_FROM_BODY` (0x7fa) — despachado em
 * `MapEngine/Item.js` para `Inventory.getUI().removeItem(pkt.Index, pkt.Count)`
 * (o MESMO handler que atende `ITEM_THROW_ACK`, ao jogar item no chao).
 *
 * O coordenador pediu para NAO mexer em `onSellResult` (ele ja funciona
 * pela premissa certa) e so PROVAR a premissa: o despacho do pacote de
 * exclusao chega com os campos certos e realmente reduz `Inventory.list`.
 * Se este teste passar, C-3 fecha como FALSO POSITIVO — nao ha bug aqui, so
 * uma suspeita a menos depois de auditada.
 *
 * O teste exercita o `Item.js` DE VERDADE (o despacho e' o que importa) e
 * usa uma reimplementacao MINIMA de `removeItem`/`list`, espelhando a
 * mecanica real de `InventoryCommon.js` (`this.list.splice(this.list.indexOf(item), 1)`
 * por INDEX de item) — sem importar a cadeia pesada de
 * UIVersionManager/GUIComponent dos quatro `InventoryV*`, que nao muda nesta
 * rodada e nao e' o que esta sob suspeita.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	// Espelha a mecanica real de InventoryCommon.js: uma lista por INDEX de
	// slot, removida por `indexOf` do proprio objeto do item — nao por
	// recriar o array do zero, que esconderia um bug de indice errado.
	inventoryUI: {
		list: [],
		addItem(pkt) {
			this.list.push({ index: pkt.index, ITID: pkt.ITID, count: pkt.count });
		},
		getItemByIndex(index) {
			return this.list.find(it => it.index === index) || null;
		},
		removeItem(index, count) {
			const item = this.getItemByIndex(index);
			if (!item) {
				return null;
			}
			item.count -= count || 0;
			if (item.count <= 0) {
				this.list.splice(this.list.indexOf(item), 1);
			}
			return item;
		}
	}
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

describe('a premissa do C-3: ZC_DELETE_ITEM_FROM_BODY atualiza Inventory.list', () => {
	beforeEach(() => {
		mocks.hooks.clear();
		mocks.inventoryUI.list = [];
		ItemEngine();
	});

	it('remove o item INTEIRO quando a venda esgota a pilha (o caso comum de "vender tudo")', () => {
		mocks.inventoryUI.addItem({ index: 9, ITID: 909, count: 5 });
		expect(mocks.inventoryUI.getItemByIndex(9)).not.toBeNull();

		const onDelete = mocks.hooks.get(PACKET.ZC.DELETE_ITEM_FROM_BODY);
		expect(onDelete, 'o pacote 0x7fa nao foi capturado — o hook mudou ou sumiu').toBeTypeOf('function');

		// Campos reais do struct (PacketStructure.js:9725): DeleteType/Index/Count.
		onDelete({ DeleteType: 1, Index: 9, Count: 5 });

		expect(mocks.inventoryUI.getItemByIndex(9), 'o item vendido continua no inventario').toBeNull();
		expect(mocks.inventoryUI.list).toHaveLength(0);
	});

	it('so abate a QUANTIDADE quando a venda e parcial (pilha nao esgotada)', () => {
		mocks.inventoryUI.addItem({ index: 4, ITID: 501, count: 10 });

		const onDelete = mocks.hooks.get(PACKET.ZC.DELETE_ITEM_FROM_BODY);
		onDelete({ DeleteType: 1, Index: 4, Count: 3 });

		const item = mocks.inventoryUI.getItemByIndex(4);
		expect(item, 'a pilha inteira sumiu numa venda parcial').not.toBeNull();
		expect(item.count).toBe(7);
	});

	it('nao mexe em OUTRO indice — a venda do slot 2 nao afeta o slot 3', () => {
		mocks.inventoryUI.addItem({ index: 2, ITID: 100, count: 1 });
		mocks.inventoryUI.addItem({ index: 3, ITID: 200, count: 1 });

		const onDelete = mocks.hooks.get(PACKET.ZC.DELETE_ITEM_FROM_BODY);
		onDelete({ DeleteType: 1, Index: 2, Count: 1 });

		expect(mocks.inventoryUI.getItemByIndex(2)).toBeNull();
		expect(mocks.inventoryUI.getItemByIndex(3), 'o slot vizinho foi apagado por engano').not.toBeNull();
	});
});
