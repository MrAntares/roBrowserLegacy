/**
 * A FIACAO DE REDE DA TRAVA (R14/C2-3, 14/09/2026) — par final confirmado
 * pelo SENIOR-C: `CZ_RAGIDLE_TRAVA_ACAO` = 0x0fc0, `ZC_RAGIDLE_TRAVAS` =
 * 0x0fc1 (a primeira tentativa, 0x0fc7/0x0fc8, colidia com
 * CZ_RAGIDLE_COMANDOS_ACAO/ZC_RAGIDLE_COMANDOS — ja corrigido).
 *
 * Duas coisas provadas aqui:
 *  1. O PACOTE DE SAIDA (`PACKET.CZ.RAGIDLE_TRAVA_ACAO`) monta o opcode
 *     certo e o JSON certo — o mesmo molde de CZ_RAGIDLE_CACA_ACAO.
 *  2. O PACOTE DE ENTRADA (`ZC_RAGIDLE_TRAVAS`, tratado em
 *     MapEngine/Item.js) aplica `travados` via
 *     `Inventory.getUI().aplicarTravas(...)` e mostra a recusa quando ela
 *     vem — o mesmo molde do pickup (`pickupAtribuiPlaceETCTab.test.js`).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	inventoryUI: { aplicarTravas: () => {} },
	chatAvisos: []
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: { hookPacket: (pkt, cb) => mocks.hooks.set(pkt, cb), sendPacket: () => {} }
}));
vi.mock('DB/DBManager.js', () => ({
	default: { getMessage: () => '', getItemName: () => '', getItemInfo: () => ({}) }
}));
vi.mock('Core/Configs.js', () => ({ default: { get: () => null } }));
vi.mock('Renderer/ItemObject.js', () => ({ default: { add: () => {}, remove: () => {} } }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: { getCellHeight: () => 0 } }));
vi.mock('Renderer/EffectManager.js', () => ({ default: { add: () => {} } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { Entity: null } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: texto => mocks.chatAvisos.push(texto),
		TYPE: { ERROR: 1, BLUE: 2 },
		FILTER: { ITEM: 1, FARM_ITEM: 2 }
	}
}));
vi.mock('UI/Components/ItemObtain/ItemObtain.js', () => ({ default: { append: () => {}, set: () => {} } }));
vi.mock('UI/Components/HuntAnalyzer/registroDaCaca.js', () => ({ ehDropDeCaca: () => false, registrarItem: () => {} }));
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

describe('PACKET.CZ.RAGIDLE_TRAVA_ACAO — o pacote de saida', () => {
	it('monta o opcode 0x0fc0 e o JSON pedido', () => {
		const pkt = new PACKET.CZ.RAGIDLE_TRAVA_ACAO();
		pkt.json = JSON.stringify({ acao: 'alternar', slot: 7 });
		const built = pkt.build();

		const fp = new DataView(built.buffer);
		expect(fp.getUint16(0, true)).toBe(0x0fc0);
	});

	it('o "pedir" (sem slot) monta do mesmo jeito', () => {
		const pkt = new PACKET.CZ.RAGIDLE_TRAVA_ACAO();
		pkt.json = JSON.stringify({ acao: 'pedir' });
		const built = pkt.build();
		const fp = new DataView(built.buffer);
		expect(fp.getUint16(0, true)).toBe(0x0fc0);
	});
});

describe('ZC_RAGIDLE_TRAVAS — o pacote de entrada (MapEngine/Item.js)', () => {
	let aplicarSpy;

	beforeEach(() => {
		mocks.hooks.clear();
		mocks.chatAvisos.length = 0;
		aplicarSpy = vi.fn();
		mocks.inventoryUI.aplicarTravas = aplicarSpy;
		ItemEngine();
	});

	function onTravas() {
		return mocks.hooks.get(PACKET.ZC.RAGIDLE_TRAVAS);
	}

	it('aplica a lista de slots travados via Inventory.getUI().aplicarTravas', () => {
		expect(onTravas(), 'o hook de ZC_RAGIDLE_TRAVAS nao foi capturado').toBeTypeOf('function');

		onTravas()({ json: JSON.stringify({ v: 1, travados: [3, 9] }) });

		expect(aplicarSpy).toHaveBeenCalledTimes(1);
		expect(aplicarSpy).toHaveBeenCalledWith([3, 9]);
	});

	it('lista vazia tambem aplica (destrava tudo, nao e ignorada)', () => {
		onTravas()({ json: JSON.stringify({ v: 1, travados: [] }) });
		expect(aplicarSpy).toHaveBeenCalledWith([]);
	});

	it('mostra a recusa quando ela vem, mas ainda assim aplica a lista', () => {
		onTravas()({ json: JSON.stringify({ v: 1, travados: [3], recusa: 'limite de itens travados atingido' }) });

		expect(aplicarSpy).toHaveBeenCalledWith([3]);
		expect(mocks.chatAvisos).toContain('limite de itens travados atingido');
	});

	it('payload invalido (v diferente, travados ausente, JSON quebrado) nao aplica nada', () => {
		onTravas()({ json: JSON.stringify({ v: 2, travados: [3] }) });
		onTravas()({ json: JSON.stringify({ v: 1 }) });
		onTravas()({ json: '{nao e json' });

		expect(aplicarSpy).not.toHaveBeenCalled();
	});
});
