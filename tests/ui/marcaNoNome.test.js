import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	ICONE_DO_VIP,
	aplicarDeltaDasMarcas,
	bitsDaMarca,
	classeDaLinha,
	PREFIXO_DO_NOME,
	comMarcaNoNome,
	contaNaLista,
	htmlDoIconeDeVip,
	htmlDoNomeDaFala,
	htmlDoSeloDeGm,
	lerMarcasDoChat,
	linhaDeAdminSemNome,
	marcaDaFala,
	marcaDoTipo,
	nomeDaLinha,
	nomeNaLista
} from '../../src/UI/Components/ChatBox/marcaNoNome.js';
import { ASSET } from '../../src/UI/Components/RoShop/formatoDoRoShop.js';

/*
 * AS MARCAS NO NOME DE QUEM FALA (25/09/2026, dois pedidos do dono):
 * *"o icone do RO Cash + cor no nome do player para os players VIPs"* e
 * *"faca tambem uma marca de GM + cor 'vermelho escuro' para identificar os
 * Administradores"*.
 *
 * Quem e o que vem do servidor, no mesmo 0x0fd0 da lista de GM. O chat so
 * desenha.
 */
const VIP = 2000010;
const COMUM = 2000456;

// Os bits de `ChatBox.TYPE` (ChatBox nao sobe no jsdom; o ultimo caso deste
// arquivo confere que sao os mesmos do fonte).
const TYPE = {
	SELF: 1 << 0,
	PUBLIC: 1 << 1,
	PRIVATE: 1 << 2,
	PARTY: 1 << 3,
	GUILD: 1 << 4,
	ANNOUNCE: 1 << 5,
	ERROR: 1 << 6,
	INFO: 1 << 7,
	BLUE: 1 << 8,
	ADMIN: 1 << 9,
	MAIL: 1 << 10,
	CLAN: 1 << 11,
	VIP: 1 << 12
};

describe('lerMarcasDoChat', () => {
	it('le contas VIP e os nomes de VIP e de admin do corpo do 0x0fd0', () => {
		expect(
			lerMarcasDoChat({ v: 1, admins: [2000000], vips: [VIP], nomesVip: ['Guizao'], nomesAdmin: ['Urso'] })
		).toEqual({ vips: [VIP], nomesVip: ['Guizao'], nomesAdmin: ['Urso'] });
	});

	it('servidor de antes (sem os campos), corpo nulo ou lixo: ninguem ganha marca', () => {
		const vazio = { vips: [], nomesVip: [], nomesAdmin: [] };
		expect(lerMarcasDoChat({ v: 1, admins: [2000000] })).toEqual(vazio);
		expect(lerMarcasDoChat(null)).toEqual(vazio);
		expect(lerMarcasDoChat({ vips: 'x', nomesVip: 3, nomesAdmin: {} })).toEqual(vazio);
	});

	it('filtra entradas de tipo errado e nome vazio', () => {
		expect(
			lerMarcasDoChat({ vips: [VIP, '2000011', null], nomesVip: ['Guizao', '', 7], nomesAdmin: ['', 'Urso', null] })
		).toEqual({ vips: [VIP], nomesVip: ['Guizao'], nomesAdmin: ['Urso'] });
	});
});

describe('contaNaLista e nomeNaLista', () => {
	it('a conta da lista esta; a comum nao', () => {
		expect(contaNaLista(VIP, [VIP])).toBe(true);
		expect(contaNaLista(COMUM, [VIP])).toBe(false);
	});

	it('lista ausente (antes do primeiro 0x0fd0) nao marca ninguem', () => {
		expect(contaNaLista(VIP, undefined)).toBe(false);
		expect(nomeNaLista('Guizao', undefined)).toBe(false);
	});

	it('o nome da lista esta; o outro, e o vazio, nao', () => {
		expect(nomeNaLista('Guizao', ['Guizao'])).toBe(true);
		expect(nomeNaLista('Urso', ['Guizao'])).toBe(false);
		expect(nomeNaLista('', [''])).toBe(false);
	});
});

describe('nomeDaLinha (o recorte que a guilda usa)', () => {
	it('tira o nome do comeco de "Nome : fala"', () => {
		expect(nomeDaLinha('Guizao : bora caçar')).toBe('Guizao');
		expect(nomeDaLinha('  Guizao : oi')).toBe('Guizao');
	});

	it('linha sem prefixo de nome, ou que nao e texto, da vazio', () => {
		expect(nomeDaLinha('sem prefixo nenhum')).toBe('');
		expect(nomeDaLinha(undefined)).toBe('');
	});

	it('e o MESMO recorte que o ChatBox usa para pintar o nome', () => {
		const chatbox = readFileSync(resolve(import.meta.dirname, '../../src/UI/Components/ChatBox/ChatBox.js'), 'utf8');
		expect(chatbox).toContain('escaped.replace(PREFIXO_DO_NOME, (_m, nome) => htmlDoNomeDaFala(nome, marca)');
		expect(PREFIXO_DO_NOME.source).toBe('^(\\s*[^\\n:]{1,24}?)\\s:\\s');
	});
});

describe('qual marca', () => {
	it('GM vence VIP (pedido do dono); so VIP e VIP; nenhum e nada', () => {
		expect(marcaDaFala(true, true)).toBe('gm');
		expect(marcaDaFala(true, false)).toBe('gm');
		expect(marcaDaFala(false, true)).toBe('vip');
		expect(marcaDaFala(false, false)).toBe(null);
	});

	it('pelos bits da linha, com o GM vencendo', () => {
		expect(marcaDoTipo(TYPE.PUBLIC | TYPE.ADMIN | TYPE.VIP, TYPE)).toBe('gm');
		expect(marcaDoTipo(TYPE.PARTY | TYPE.VIP, TYPE)).toBe('vip');
		expect(marcaDoTipo(TYPE.PUBLIC, TYPE)).toBe(null);
	});

	it('a linha de admin que NAO e fala (o texto de quest) segue com o [GM] e o amarelo de antes', () => {
		expect(linhaDeAdminSemNome(TYPE.ADMIN | TYPE.SELF, TYPE)).toBe(true);
	});

	it('na FALA de admin, em todo canal, a marca e do nome e a linha volta a ser do canal', () => {
		for (const canal of [TYPE.PUBLIC, TYPE.PARTY, TYPE.GUILD, TYPE.PRIVATE, TYPE.CLAN]) {
			expect(linhaDeAdminSemNome(canal | TYPE.ADMIN, TYPE)).toBe(false);
		}
		expect(linhaDeAdminSemNome(TYPE.PUBLIC | TYPE.SELF | TYPE.ADMIN, TYPE)).toBe(false);
	});

	it('linha sem ADMIN nunca e linha de admin', () => {
		expect(linhaDeAdminSemNome(TYPE.INFO, TYPE)).toBe(false);
	});
});

describe('a cor da linha inteira (a fala na cor do nome)', () => {
	it('fala de GM: a linha inteira no vermelho do GM, em todo canal de fala', () => {
		for (const canal of [TYPE.PUBLIC, TYPE.PUBLIC | TYPE.SELF, TYPE.PARTY, TYPE.GUILD, TYPE.PRIVATE, TYPE.CLAN]) {
			expect(classeDaLinha(canal | TYPE.ADMIN, TYPE)).toBe('cb-linha-gm');
		}
	});

	it('fala de VIP: a linha inteira no ouro do VIP', () => {
		expect(classeDaLinha(TYPE.PUBLIC | TYPE.VIP, TYPE)).toBe('cb-linha-vip');
		expect(classeDaLinha(TYPE.PRIVATE | TYPE.VIP, TYPE)).toBe('cb-linha-vip');
	});

	it('GM e VIP juntos: o vermelho do GM (o GM vence tambem na cor)', () => {
		expect(classeDaLinha(TYPE.PUBLIC | TYPE.ADMIN | TYPE.VIP, TYPE)).toBe('cb-linha-gm');
	});

	it('fala comum e linha de admin que NAO e fala (quest) nao ganham classe', () => {
		expect(classeDaLinha(TYPE.PUBLIC, TYPE)).toBe('');
		expect(classeDaLinha(TYPE.ADMIN | TYPE.SELF, TYPE)).toBe('');
		expect(classeDaLinha(TYPE.INFO | TYPE.VIP, TYPE)).toBe('');
	});

	it('os bits de uma marca (o sussurro decide pelo nome e manda os bits)', () => {
		expect(bitsDaMarca('gm', TYPE)).toBe(TYPE.ADMIN);
		expect(bitsDaMarca('vip', TYPE)).toBe(TYPE.VIP);
		expect(bitsDaMarca(null, TYPE)).toBe(0);
		expect(classeDaLinha(TYPE.PRIVATE | bitsDaMarca('gm', TYPE), TYPE)).toBe('cb-linha-gm');
	});
});

describe('o desenho', () => {
	it('o icone do VIP e o PNG do RO Cash do RO Shop, com texto alternativo "VIP"', () => {
		expect(ICONE_DO_VIP).toBe(ASSET.roCash);
		const icone = htmlDoIconeDeVip();
		expect(icone).toContain(`src="${ASSET.roCash}"`);
		expect(icone).toContain('class="cb-vip-icone"');
		expect(icone).toContain('alt="VIP"');
	});

	it('o selo de GM e o TEXTO "GM" (le sem cor)', () => {
		expect(htmlDoSeloDeGm()).toBe('<span class="cb-gm-selo" title="Administrador">GM</span>');
	});

	it('sem marca o nome sai EXATAMENTE como antes (linhas comuns nao mudam)', () => {
		expect(htmlDoNomeDaFala('Urso', null)).toBe('<span class="cb-name">Urso</span>');
	});

	it('VIP: o icone ANTES do nome, e o nome com a classe da cor', () => {
		const html = htmlDoNomeDaFala('Guizao', 'vip');
		expect(html).toBe(htmlDoIconeDeVip() + '<span class="cb-name cb-name-vip">Guizao</span>');
	});

	it('GM: o selo ANTES do nome, e o nome com a classe do vermelho', () => {
		const html = htmlDoNomeDaFala('Urso', 'gm');
		expect(html).toBe(htmlDoSeloDeGm() + '<span class="cb-name cb-name-gm">Urso</span>');
		expect(html).not.toContain('cb-vip-icone');
	});

	it('o nome chega escapado e NAO e escapado de novo (nada de &amp;lt;)', () => {
		expect(htmlDoNomeDaFala('a&lt;b', 'vip')).toContain('>a&lt;b</span>');
		expect(htmlDoNomeDaFala('a&lt;b', 'gm')).toContain('>a&lt;b</span>');
	});

	it('o sussurro: o apelido clicavel ganha a marca em volta, ou fica intacto', () => {
		const apelido = '<span class="nickname-link" data-nickname="Guizao">Guizao</span>';
		expect(comMarcaNoNome(apelido, null)).toBe(apelido);
		expect(comMarcaNoNome(apelido, 'vip')).toBe(htmlDoIconeDeVip() + '<span class="cb-name-vip">' + apelido + '</span>');
		expect(comMarcaNoNome(apelido, 'gm')).toBe(htmlDoSeloDeGm() + '<span class="cb-name-gm">' + apelido + '</span>');
	});
});

describe('o fio: todo canal com fala de jogador pergunta pela marca', () => {
	const ler = caminho => readFileSync(resolve(import.meta.dirname, '../..', caminho), 'utf8').replace(/\r\n/g, '\n');

	it('o 0x0fd0 guarda as marcas na sessao', () => {
		const entity = ler('src/Engine/MapEngine/Entity.js');
		const a = entity.indexOf('function onAdminList(');
		const corpo = entity.slice(a, entity.indexOf('\n}\n', a));
		// D-2372 do servidor: a lista inteira OU a diferenca (o ultimo describe deste arquivo).
		expect(corpo).toContain(': lerMarcasDoChat(dados);');
		expect(corpo).toContain('Session.VipList = marcas.vips;');
		expect(corpo).toContain('Session.VipNomes = marcas.nomesVip;');
		expect(corpo).toContain('Session.AdminNomes = marcas.nomesAdmin;');
	});

	it('a fala global: GM pela regra de sempre (falaDeGm), VIP pela conta, so de jogador', () => {
		const entity = ler('src/Engine/MapEngine/Entity.js');
		const a = entity.indexOf('function onEntityTalk(');
		const trecho = entity.slice(a, entity.indexOf('ChatBox.addText(pkt.msg, type', a));
		expect(trecho).toContain('falaDeGm(pkt.GID, entity, Session.AdminList)');
		expect(trecho).toContain(
			'if ((!entity || entity.objecttype === Entity.TYPE_PC) && contaNaLista(pkt.GID, Session.VipList)) {'
		);
		expect(trecho).toContain('type |= ChatBox.TYPE.VIP;');
	});

	it('o eco da propria fala: VIP pela conta da sessao (o GM ja vinha de isAdmin)', () => {
		const main = ler('src/Engine/MapEngine/Main.js');
		const a = main.indexOf('function onPlayerMessage(');
		const trecho = main.slice(a, main.indexOf('ChatBox.addText(pkt.msg, tipoDaPropria', a));
		expect(trecho).toContain('tipoDaPropria |= ChatBox.TYPE.ADMIN;');
		expect(trecho).toContain('if (contaNaLista(Session.AID, Session.VipList)) {');
		expect(trecho).toContain('tipoDaPropria |= ChatBox.TYPE.VIP;');
	});

	it('o grupo pela conta (AID do 0x0109): GM pela MESMA falaDeGm', () => {
		const group = ler('src/Engine/MapEngine/Group.js');
		expect(group).toContain('if (falaDeGm(pkt.AID, entity, Session.AdminList)) {');
		expect(group).toContain('if (contaNaLista(pkt.AID, Session.VipList)) {');
		expect(group).toContain('ChatBox.addText(pkt.msg, tipo, ChatBox.FILTER.PARTY);');
	});

	it('a guilda pelo nome da linha', () => {
		const guild = ler('src/Engine/MapEngine/Guild.js');
		expect(guild).toContain('const nome = nomeDaLinha(pkt.msg);');
		expect(guild).toContain('if (nomeNaLista(nome, Session.AdminNomes)) {');
		expect(guild).toContain('if (nomeNaLista(nome, Session.VipNomes)) {');
		expect(guild).toContain('ChatBox.addText(pkt.msg, tipo, ChatBox.FILTER.GUILD);');
	});

	it('o sussurro recebido pelo nome de quem mandou, o GM vencendo', () => {
		const pm = ler('src/Engine/MapEngine/PrivateMessage.js');
		expect(pm).toContain(
			'const marca = marcaDaFala(nomeNaLista(pkt.sender, Session.AdminNomes), nomeNaLista(pkt.sender, Session.VipNomes));'
		);
		expect(pm).toContain('comMarcaNoNome(spanDeNickname(pkt.sender), marca)');
		expect(pm).toContain('ChatBox.TYPE.PRIVATE | bitsDaMarca(marca, ChatBox.TYPE),');
	});

	it('o ChatBox pinta a linha marcada por CLASSE (o token acompanha a HUD) e as outras como antes', () => {
		const chatbox = ler('src/UI/Components/ChatBox/ChatBox.js');
		expect(chatbox).toContain('const classeDaMarca = classeDaLinha(msg.colorType, ChatBox.TYPE);');
		expect(chatbox).toContain(
			'if (classeDaMarca) {\n\t\t\t\tdiv.classList.add(classeDaMarca);\n\t\t\t} else {\n\t\t\t\tdiv.style.color = color;'
		);
		const css = ler('src/UI/Components/ChatBox/ChatBox.css');
		expect(css).toContain('#chatbox .cb-linha-vip {\n\tcolor: var(--chat-text-name-vip);');
		expect(css).toContain('#chatbox .cb-linha-gm {\n\tcolor: var(--chat-text-name-gm);');
	});

	it('o ChatBox: o bit VIP e proprio, e o amarelo e a etiqueta [GM] so em linha de admin que NAO e fala', () => {
		const chatbox = ler('src/UI/Components/ChatBox/ChatBox.js');
		for (const [nome, bit] of Object.entries(TYPE)) {
			expect(chatbox).toMatch(new RegExp(`\\b${nome}: 1 << ${Math.log2(bit)}\\b`));
		}
		expect(chatbox).toContain('const marca = marcaDoTipo(colorType, ChatBox.TYPE);');
		expect(chatbox).toContain("if (linhaDeAdminSemNome(colorType, ChatBox.TYPE)) return { rotulo: 'GM', variante: 'ouro' };");
		expect(chatbox).toMatch(/if \(linhaDeAdminSemNome\(colorType, ChatBox\.TYPE\)\) \{\n\t\treturn '#FFFF00';/);
		// nenhum outro ramo pinta a fala de admin de amarelo
		expect(chatbox).not.toContain('colorType & ChatBox.TYPE.ADMIN');
	});

	it('as cores existem nas DUAS HUDs (moderna e classica), por token', () => {
		const common = ler('src/UI/Common.css');
		const css = ler('src/UI/Components/ChatBox/ChatBox.css');
		for (const token of ['--chat-text-name-vip', '--chat-cl-text-name-vip', '--chat-text-name-gm', '--chat-cl-text-name-gm', '--chat-gm-selo-bg']) {
			expect(common).toMatch(new RegExp(`${token}: #[0-9a-f]{6};`));
		}
		expect(css).toContain('--chat-text-name-vip: var(--chat-cl-text-name-vip);');
		expect(css).toContain('--chat-text-name-gm: var(--chat-cl-text-name-gm);');
		expect(css).toContain('color: var(--chat-text-name-vip);');
		expect(css).toContain('color: var(--chat-text-name-gm);');
		expect(css).toContain('background: var(--chat-gm-selo-bg);');
		// as marcas acompanham a fonte da linha (desktop e celular), em em
		expect(css).toMatch(/\.cb-vip-icone \{[^}]*width: 1\.15em;[^}]*height: 1\.15em;/);
		expect(css).toMatch(/\.cb-gm-selo \{[^}]*font-size: 0\.8em;/);
	});
});

describe('aplicarDeltaDasMarcas (D-2372 do servidor: a lista por diferenca)', () => {
	const sessao = () => ({ vips: [5, 20], nomesVip: ['Ana', 'Ana*', 'Bia'], nomesAdmin: ['Gm'] });

	it('tira os Menos, poe os Mais e reordena como o servidor (numeros e sort())', () => {
		const r = aplicarDeltaDasMarcas(sessao(), {
			v: 1,
			admins: [1],
			delta: 1,
			vipsMais: [7, 100],
			vipsMenos: [20],
			nomesVipMais: ['Caio', 'Abel'],
			nomesVipMenos: ['Bia'],
			nomesAdminMenos: ['Gm']
		});
		expect(r).toEqual({ vips: [5, 7, 100], nomesVip: ['Abel', 'Ana', 'Ana*', 'Caio'], nomesAdmin: [] });
	});

	it('campo ausente e vazio: so os admins mudaram, as marcas ficam', () => {
		expect(aplicarDeltaDasMarcas(sessao(), { v: 1, admins: [1, 7], delta: 1 })).toEqual(sessao());
	});

	it('nao mexe nas listas da sessao (devolve listas novas)', () => {
		const s = sessao();
		aplicarDeltaDasMarcas(s, { delta: 1, vipsMais: [1], nomesVipMenos: ['Ana'] });
		expect(s).toEqual(sessao());
	});

	it('sessao vazia (nada recebido ainda) e lixo no corpo nao quebram', () => {
		expect(aplicarDeltaDasMarcas({}, { delta: 1, vipsMais: [3, 'x'], nomesVipMais: ['', 'Eva'] })).toEqual({
			vips: [3],
			nomesVip: ['Eva'],
			nomesAdmin: []
		});
		expect(aplicarDeltaDasMarcas(undefined, null)).toEqual({ vips: [], nomesVip: [], nomesAdmin: [] });
	});

	it('o handler da lista usa a diferenca quando o corpo diz delta: 1, e a lista inteira no resto', () => {
		const entity = readFileSync(resolve(import.meta.dirname, '../../src/Engine/MapEngine/Entity.js'), 'utf8').replace(/\r\n/g, '\n');
		const i = entity.indexOf('function onAdminList(pkt) {');
		const corpo = entity.slice(i, entity.indexOf('\nfunction ', i + 10));
		expect(corpo).toContain('dados && dados.delta === 1');
		expect(corpo).toContain('aplicarDeltaDasMarcas({ vips: Session.VipList, nomesVip: Session.VipNomes, nomesAdmin: Session.AdminNomes }, dados)');
		expect(corpo).toContain(': lerMarcasDoChat(dados);');
	});
});
