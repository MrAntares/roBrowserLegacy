/**
 * "VERIFICAR EQUIPAMENTOS DE <nome>" (25/09/2026, pedido do dono: o
 * administrador precisa ver o que um jogador esta usando).
 *
 * O cliente ja tinha as duas pontas — o item do menu de contexto
 * (`Controls/EntityControl.js`) e a janela `PlayerViewEquip` — e o clique "nao
 * fazia nada" porque o servidor jogava o pedido fora. Este teste prende as tres
 * costuras do lado de ca, para o dia em que o servidor responde:
 *
 *   1. o menu chama `Equipment.onCheckPlayerEquipment` com o GID do jogador;
 *   2. o pedido sai como `CZ_EQUIPWIN_MICROSCOPE` (0x02d6, 6 bytes, AID);
 *   3. a resposta do PACKETVER 20211103 (`0x0b37`, cabecalho 47 + pecas de 68)
 *      e lida campo a campo — com a MESMA disposicao que o servidor escreve
 *      (`servidor/protocolo/pacotes-mapa.ts`, `ZC_EQUIPWIN_MICROSCOPE_V7` e
 *      `BLOCO_ITEM_EQUIP`) — e entregue a janela.
 *
 * Levantar a `PlayerViewEquip` de verdade puxa WebGL e sessao; a janela e
 * medida pelo que o handler lhe entrega.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	enviados: [],
	janela: null
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (pkt, cb) => mocks.hooks.set(pkt, cb),
		sendPacket: (pkt) => mocks.enviados.push(pkt)
	}
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
vi.mock('UI/Components/Inventory/Inventory.js', () => ({ default: { getUI: () => ({}) } }));
vi.mock('UI/Components/CartItems/CartItems.js', () => ({ default: {} }));
vi.mock('UI/Components/Equipment/Equipment.js', () => ({ default: {} }));
vi.mock('UI/Components/PlayerViewEquip/PlayerViewEquip.js', () => ({
	default: { getUI: () => mocks.janela }
}));
vi.mock('UI/Components/SwitchEquip/SwitchEquip.js', () => ({ default: {} }));
vi.mock('UI/Components/Storage/Storage.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/MakeItemSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/MakeItemSelection/ItemListWindowSelection.js', () => ({ default: {} }));

const { default: PACKET } = await import('Network/PacketStructure.js');
const { default: BinaryReader } = await import('Utils/BinaryReader.js');
const { default: Equipment } = await import('UI/Components/Equipment/Equipment.js');
const { default: ItemEngine } = await import('Engine/MapEngine/Item.js');

/** O cabecalho do 0x0b37: 2 + 2 + 24 + 9 x 2 + 1 (`packets_struct.hpp:1308-1323`). */
const CABECALHO = 47;
const PECA = 68;

/**
 * Monta o 0x0b37 com a disposicao do SERVIDOR: `ZC_EQUIPWIN_MICROSCOPE_V7`
 * (nome, classe, cabelo, baixo, meio, topo, manto, paletas, corpo2, sexo) e
 * `BLOCO_ITEM_EQUIP` por peca.
 */
function janelaDoServidor(nome, pecas) {
	const buf = new ArrayBuffer(CABECALHO + PECA * pecas.length);
	const v = new DataView(buf);
	v.setUint16(0, 0x0b37, true);
	v.setUint16(2, buf.byteLength, true);
	for (let i = 0; i < nome.length; i++) v.setUint8(4 + i, nome.charCodeAt(i));
	const shorts = [4012, 3, 0, 0, 5, 0, 2, 1, 0]; // classe, cabelo, baixo, meio, topo, manto, paletas, corpo2
	shorts.forEach((s, i) => v.setInt16(28 + i * 2, s, true));
	v.setUint8(46, 1); // sexo
	pecas.forEach((p, n) => {
		let o = CABECALHO + n * PECA;
		v.setUint16(o, p.index, true); o += 2;
		v.setUint32(o, p.ITID, true); o += 4;
		v.setUint8(o, 5); o += 1; // tipo: arma
		v.setUint32(o, p.location, true); o += 4;
		v.setUint32(o, p.wearState, true); o += 4;
		v.setUint32(o, p.card1, true); o += 16; // 4 cartas
		o += 4 + 2 + 2 + 1 + 25; // hire, bind, sprite, nOpcoes, opcoes
		v.setUint8(o, p.refino); o += 1;
		o += 1; // grade
		v.setUint8(o, 1); // flags: identificado
	});
	return buf;
}

describe('"Verificar equipamentos de" — o lado do cliente', () => {
	beforeEach(() => {
		mocks.hooks.clear();
		mocks.enviados.length = 0;
		mocks.janela = {
			append: vi.fn(),
			setTitleBar: vi.fn(),
			setEquipmentData: vi.fn(),
			setChar2Render: vi.fn()
		};
		ItemEngine();
	});

	it('o menu do jogador chama o pedido com o GID dele', () => {
		const fonte = readFileSync(join(process.cwd(), 'src/Controls/EntityControl.js'), 'utf8');
		const trecho = fonte.slice(fonte.indexOf('DB.getMessage(1360)'), fonte.indexOf('DB.getMessage(1360)') + 200);
		expect(trecho, 'o item "Verificar equipamentos de %s" sumiu do menu').not.toBe('');
		expect(trecho).toContain('Equipment.onCheckPlayerEquipment(entity.GID)');
	});

	it('o pedido sai como 0x02d6 com o AID em 4 bytes', () => {
		Equipment.onCheckPlayerEquipment(2000123);
		expect(mocks.enviados).toHaveLength(1);
		const bytes = new DataView(mocks.enviados[0].build().buffer);
		expect(bytes.byteLength).toBe(6);
		expect(bytes.getUint16(0, true)).toBe(0x02d6);
		expect(bytes.getUint32(2, true)).toBe(2000123);
	});

	it('a resposta 0x0b37 e lida com a disposicao do servidor e abre a janela', () => {
		const buf = janelaDoServidor('Beto', [
			{ index: 3, ITID: 1101, location: 2, wearState: 2, card1: 4001, refino: 7 }
		]);
		const fp = new BinaryReader(buf);
		fp.seek(4);
		const pkt = new PACKET.ZC.EQUIPWIN_MICROSCOPE_V7(fp, buf.byteLength);
		expect(fp.tell(), 'sobrou ou faltou byte: a disposicao divergiu').toBe(buf.byteLength);
		expect(pkt.characterName).toBe('Beto');
		expect(pkt.head).toBe(3);
		expect(pkt.sex).toBe(1);
		expect(pkt.ItemInfo).toHaveLength(1);
		const peca = pkt.ItemInfo[0];
		expect(peca.ITID).toBe(1101);
		expect(peca.WearState).toBe(2);
		expect(peca.slot.card1).toBe(4001);
		expect(peca.RefiningLevel).toBe(7);
		expect(peca.IsIdentified).toBe(1);

		const aoReceber = mocks.hooks.get(PACKET.ZC.EQUIPWIN_MICROSCOPE_V7);
		expect(aoReceber, 'o 0x0b37 nao tem handler').toBeTypeOf('function');
		aoReceber(pkt);
		expect(mocks.janela.append).toHaveBeenCalledTimes(1);
		expect(mocks.janela.setTitleBar).toHaveBeenCalledWith('Beto');
		expect(mocks.janela.setEquipmentData).toHaveBeenCalledWith(pkt.ItemInfo);
		expect(mocks.janela.setChar2Render).toHaveBeenCalledWith(pkt);
	});

	it('sem peca vestida a janela abre vazia (o servidor manda so o cabecalho)', () => {
		const buf = janelaDoServidor('Ze', []);
		const fp = new BinaryReader(buf);
		fp.seek(4);
		const pkt = new PACKET.ZC.EQUIPWIN_MICROSCOPE_V7(fp, buf.byteLength);
		expect(pkt.characterName).toBe('Ze');
		expect(pkt.ItemInfo).toEqual([]);
	});
});
