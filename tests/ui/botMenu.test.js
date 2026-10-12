/**
 * O MENU DO BOT NOVO (07/10/2026) - a COSTURA, lendo o fonte (o MapEngine
 * nao carrega no jsdom), e o PACOTE:
 *  1. o `build()` do 0x0fb0 com texto acentuado sai com o comprimento dos
 *     bytes UTF-8 (o defeito do PIX);
 *  2. o 0x0fb1 tem UM dono (`hookPacket` substitui: um segundo roubaria);
 *  3. a janela entra na pilha (ESC, celular), na limpeza da troca de
 *     personagem e no menu, nos DOIS switches (abrir e "esta aberta");
 *  4. o item "Bot" nasce escondido e depende da capacidade do SERVIDOR, e nao
 *     do modo classico.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import PACKET from 'Network/PacketStructure.js';

const raiz = join(__dirname, '..', '..');
const ler = (...p) => readFileSync(join(raiz, ...p), 'utf8');

function todosOsJs(pasta) {
	const saida = [];
	for (const nome of readdirSync(pasta)) {
		const c = join(pasta, nome);
		if (statSync(c).isDirectory()) {
			if (nome !== 'Vendors') saida.push(...todosOsJs(c));
		} else if (nome.endsWith('.js')) {
			saida.push(c);
		}
	}
	return saida;
}

describe('o pacote do Bot novo', () => {
	it('0x0fb0 leva o comprimento em BYTES do JSON (acento nao vira zero no fim)', () => {
		const pkt = new PACKET.CZ.RAGIDLE_BOT_ACAO();
		pkt.json = JSON.stringify({ v: 1, requestId: 1, verbo: 'pedir', nota: 'Caçada' });
		const buf = pkt.build();
		const bytes = new Uint8Array(buf.buffer);
		const view = new DataView(buf.buffer);
		expect(view.getUint16(0, true)).toBe(0x0fb0);
		expect(view.getUint16(2, true)).toBe(bytes.length);
		const corpo = new TextDecoder().decode(bytes.slice(4));
		expect(JSON.parse(corpo).nota).toBe('Caçada');
	});

	it('0x0fb1 e lido como JSON variavel e tem UM dono no cliente', () => {
		expect(PACKET.ZC.RAGIDLE_BOT.size).toBe(-1);
		const donos = todosOsJs(join(raiz, 'src')).filter(f => /hookPacket\(\s*PACKET\.ZC\.RAGIDLE_BOT\s*,/.test(readFileSync(f, 'utf8')));
		expect(donos.map(f => f.replace(/\\/g, '/').replace(/.*\/src\//, ''))).toEqual(['UI/Components/BotMenu/BotMenu.js']);
	});
});

describe('a costura do menu do Bot', () => {
	const mapEngine = ler('src', 'Engine', 'MapEngine.js');
	const topMenu = ler('src', 'UI', 'Components', 'TopMenuIdle', 'TopMenuIdle.js');
	const topMenuHtml = ler('src', 'UI', 'Components', 'TopMenuIdle', 'TopMenuIdle.html');

	it('a janela e preparada, anexada, registrada na pilha e limpa na troca de personagem', () => {
		expect(mapEngine).toMatch(/import BotMenu from 'UI\/Components\/BotMenu\/BotMenu\.js'/);
		expect(mapEngine).toMatch(/BotMenu\.prepare\(\)/);
		expect(mapEngine).toMatch(/BotMenu\.append\(\)/);
		expect(mapEngine).toMatch(/\['bot', BotMenu, '\.bm-window'\]/);
		const limpeza = mapEngine.slice(mapEngine.indexOf('function cleanGameUI()'));
		expect(limpeza.slice(0, 4000)).toMatch(/\bBotMenu,/);
	});

	it('o item "Bot" abre a janela nos DOIS switches e nasce escondido', () => {
		expect(topMenu).toMatch(/case 'bot':\s*\/\*[^*]*\*\/\s*BotMenu\.toggle\(\);/);
		expect(topMenu).toMatch(/case 'bot':\s*return isRagIdleWindowOpen\(BotMenu, '\.bm-window'\);/);
		expect(topMenuHtml).toMatch(/class="tm-item tm-item-bot" data-action="bot"[^>]*style="display: none"/);
	});

	it('a visibilidade do item vem da capacidade do servidor, e nao do modo classico', () => {
		const sinc = topMenu.slice(topMenu.indexOf('function sincronizarItemDoBot()'), topMenu.indexOf('function sincronizarItemDeAdmin()'));
		expect(sinc).toContain('BotMenu.temCapacidade()');
		expect(sinc).not.toContain('modoClassico');
	});
});
