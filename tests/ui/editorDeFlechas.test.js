/**
 * A ABA FLECHAS do menu do Bot (Fase 7, 07/10/2026):
 *  - edicao pura do bloco `flechas` (liga, modo, fixa, permitidas com teto,
 *    regra por monstro com herdar), sem mutar a config recebida;
 *  - o desenho no jsdom: o aviso de VIP so sem VIP, as municoes da mochila com
 *    preco e "So fixa" acima do teto, a flecha da mao com "Retomar automatico";
 *  - a COSTURA na janela real: a aba so com a capacidade `flechas`, editar suja
 *    o rascunho sem mandar nada, e "Retomar automatico" e verbo imediato.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	alternarPermitida,
	definirModoDeFlecha,
	definirRegraDoMonstro,
	lerFlechas,
	ligarFlechas
} from 'UI/Components/BotMenu/edicaoDeFlechas.js';
import { desenharFlechas } from 'UI/Components/BotMenu/editorDeFlechas.js';
import { fraseDoStatus } from 'UI/Components/BotMenu/estadoDoBot.js';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

const MUNICOES = [
	{ itemId: 1750, nome: 'Flecha', quantidade: 500, preco: 1, vestida: true },
	{ itemId: 1752, nome: 'Flecha de Fogo', quantidade: 100, preco: 3, vestida: false },
	{ itemId: 1765, nome: 'Flecha de Oridecon', quantidade: 20, preco: 30, vestida: false }
];
const MONSTROS = [
	{ especie: 1002, nome: 'Poring' },
	{ especie: 1007, nome: 'Fabre' }
];

function congelar(o) {
	if (o && typeof o === 'object') {
		Object.values(o).forEach(congelar);
		Object.freeze(o);
	}
	return o;
}

const base = () => congelar({ v: 1, cacar: true, flechas: { ligada: false, modo: 'automatico', fixa: null, permitidas: [], porMonstro: {} } });

describe('edicao das flechas (pura)', () => {
	it('config sem o bloco (servidor velho) le o padrao novo: troca ligada, automatica, todas permitidas', () => {
		expect(lerFlechas({ v: 1 })).toEqual({ ligada: true, modo: 'automatico', fixa: null, permitidas: [], porMonstro: {} });
	});

	it('liga, fixa e volta ao automatico (fixa nula), sem mutar a recebida', () => {
		const c = base();
		const fixa = definirModoDeFlecha(ligarFlechas(c, true), 'fixa', 1752);
		expect(fixa.flechas).toMatchObject({ ligada: true, modo: 'fixa', fixa: 1752 });
		expect(definirModoDeFlecha(fixa, 'automatico').flechas).toMatchObject({ modo: 'automatico', fixa: null });
		expect(definirModoDeFlecha(c, 'fixa', 'x')).toBe(c);
		expect(c.flechas.ligada).toBe(false);
	});

	it('permitidas: alterna, sem repetir e sem passar do teto', () => {
		let c = alternarPermitida(base(), 1750, 2);
		c = alternarPermitida(c, 1752, 2);
		expect(c.flechas.permitidas).toEqual([1750, 1752]);
		expect(alternarPermitida(c, 1765, 2)).toBe(c);
		expect(alternarPermitida(c, 1750, 2).flechas.permitidas).toEqual([1752]);
	});

	it('regra por monstro: automatico, fixa, herdar (remove) e teto de monstros', () => {
		let c = definirRegraDoMonstro(base(), 1002, { modo: 'fixa', fixa: 1752 }, 1);
		expect(c.flechas.porMonstro).toEqual({ 1002: { modo: 'fixa', fixa: 1752 } });
		expect(definirRegraDoMonstro(c, 1007, { modo: 'automatico' }, 1)).toBe(c);
		c = definirRegraDoMonstro(c, 1002, { modo: 'automatico' }, 1);
		expect(c.flechas.porMonstro).toEqual({ 1002: { modo: 'automatico' } });
		expect(definirRegraDoMonstro(c, 1002, null, 1).flechas.porMonstro).toEqual({});
	});

	it('as frases dos status novos', () => {
		expect(fraseDoStatus({ codigo: 'sem-municao-compativel', alvo: null })).toBe('Sem flecha que fira o alvo');
		expect(fraseDoStatus({ codigo: 'preparando-municao', alvo: null })).toBe('Trocando de flecha');
		expect(fraseDoStatus({ codigo: 'flecha-fixa-indisponivel', alvo: null })).toBe('Flecha escolhida acabou');
		expect(fraseDoStatus({ codigo: 'alvo-imune', alvo: null })).toBe('Alvo imune ao seu ataque');
	});
});

describe('desenho da aba Flechas', () => {
	let secao;
	let config;
	let retomadas;
	const editar = fn => {
		config = fn(JSON.parse(JSON.stringify(config)));
		desenhar();
	};
	function desenhar(municao = { vip: true, manual: null, tetoAutomatico: 4 }) {
		desenharFlechas(secao, { config, municoes: MUNICOES, municao, monstros: MONSTROS, tetoPermitidas: 30, tetoMonstros: 120 }, editar, () => retomadas++);
	}
	beforeEach(() => {
		document.body.innerHTML = html;
		secao = document.querySelector('[data-secao="flechas"]');
		config = JSON.parse(JSON.stringify(base()));
		retomadas = 0;
	});

	it('com VIP nao ha aviso; sem VIP o aviso explica (e nada fica desabilitado no cliente)', () => {
		desenhar();
		expect(secao.querySelector('.bm-flechas-vip').hidden).toBe(true);
		desenhar({ vip: false, manual: null, tetoAutomatico: 4 });
		expect(secao.querySelector('.bm-flechas-vip').hidden).toBe(false);
		expect(secao.querySelector('.bm-flechas-ligada').disabled).toBe(false);
	});

	it('as municoes da mochila com quantidade e preco; acima do teto aparece "So fixa"', () => {
		desenhar();
		const linhas = [...secao.querySelectorAll('.bm-flecha')];
		expect(linhas.map(l => l.querySelector('.bm-item-nome').textContent)).toEqual(['Flecha', 'Flecha de Fogo', 'Flecha de Oridecon']);
		expect(linhas[2].querySelector('.bm-tipo--especial')).not.toBeNull();
		expect(linhas[0].querySelector('.bm-tipo--vestida')).not.toBeNull();
		expect(linhas[1].querySelector('.bm-tipo--especial')).toBeNull();
	});

	it('ligar, fixar e permitir viram edicoes do rascunho', () => {
		desenhar();
		const liga = secao.querySelector('.bm-flechas-ligada');
		liga.checked = true;
		liga.dispatchEvent(new Event('change'));
		// Escolher a flecha na lista ja e o modo fixo (o radio acompanha).
		const fixa = secao.querySelector('.bm-flechas-fixa');
		fixa.value = '1765';
		fixa.dispatchEvent(new Event('change'));
		secao.querySelector('[data-item="1752"] .bm-flecha-permitida').click();
		const regra = secao.querySelector('[data-especie="1002"] .bm-flecha-regra');
		regra.value = 'fixa:1752';
		regra.dispatchEvent(new Event('change'));
		expect(config.flechas).toEqual({ ligada: true, modo: 'fixa', fixa: 1765, permitidas: [1752], porMonstro: { 1002: { modo: 'fixa', fixa: 1752 } } });
		expect(secao.querySelector('.bm-flechas-fixa').value).toBe('1765');
		expect(secao.querySelector('.bm-flechas-fixa-radio').checked).toBe(true);
		expect(secao.querySelector('.bm-flechas-auto').checked).toBe(false);
		// "Melhor disponivel" volta ao automatico.
		const auto = secao.querySelector('.bm-flechas-auto');
		auto.checked = true;
		auto.dispatchEvent(new Event('change'));
		expect(config.flechas.modo).toBe('automatico');
		expect(secao.querySelector('.bm-flechas-fixa-radio').checked).toBe(false);
	});

	it('sem fixa salva, a lista da flecha fixa mostra a vestida; o icone vem pela funcao da janela', () => {
		const icones = [];
		desenharFlechas(
			secao,
			{ config, municoes: MUNICOES, municao: { vip: true, manual: null, tetoAutomatico: 4 }, monstros: MONSTROS, tetoPermitidas: 30, tetoMonstros: 120, iconeDoItem: (img, id) => icones.push(id) },
			editar,
			() => {}
		);
		expect(secao.querySelector('.bm-flechas-auto').checked).toBe(true);
		expect(secao.querySelector('.bm-flechas-fixa').value).toBe('1750');
		expect(icones).toContain(1750);
		expect(icones).toEqual(expect.arrayContaining([1750, 1752]));
	});

	it('a flecha da mao aparece com "Retomar automatico", que chama o verbo', () => {
		desenhar();
		expect(secao.querySelector('.bm-flechas-manual').hidden).toBe(true);
		desenhar({ vip: true, manual: 1752, tetoAutomatico: 4 });
		expect(secao.querySelector('.bm-flechas-manual').hidden).toBe(false);
		expect(secao.querySelector('.bm-flechas-manual-nome').textContent).toBe('Flecha de Fogo');
		secao.querySelector('.bm-retomar-municao').click();
		expect(retomadas).toBe(1);
	});
});

describe('a costura da aba Flechas na janela real', () => {
	async function montar() {
		vi.resetModules();
		localStorage.clear();
		const { default: Network } = await import('Network/NetworkManager.js');
		const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
		BotMenu._host = document.createElement('div');
		BotMenu._host.innerHTML = html;
		BotMenu._shadow = null;
		BotMenu.draggable = () => {};
		BotMenu.init();
		const chamada = Network.hookPacket.mock.calls.at(-1);
		const receber = d => chamada[1]({ json: JSON.stringify(d) });
		return { BotMenu, Network, receber };
	}
	const status = (secoes, extra = {}) => ({
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: { ...base(), raioDePercepcao: 12, especiesVetadas: [], modoDeAtaque: 'apenas-basico', skills: { geral: [], porSkill: {}, porMonstro: {} } },
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { municoesPermitidas: 30, monstrosComRegraDeFlecha: 120 }, secoes },
		monstros: MONSTROS,
		skills: [],
		pocoes: [],
		municoes: MUNICOES,
		municao: { vip: true, manual: 1752, tetoAutomatico: 4 },
		...extra
	});
	const abas = host => [...host.querySelectorAll('.bm-abas .ri-tab')].map(b => b.textContent);

	it('sem a capacidade o cartao nao aparece; com ela, aparece DENTRO de Ataque e editar so suja o rascunho', async () => {
		const { BotMenu, Network, receber } = await montar();
		receber(status(['cacada', 'ataque']));
		const cartao = BotMenu._host.querySelector('[data-secao="flechas"]');
		expect(cartao.hidden).toBe(true);
		receber(status(['cacada', 'ataque', 'flechas'], { statusRevision: 1 }));
		const host = BotMenu._host;
		expect(abas(host)).toEqual(['Caçada', 'Ataque']);
		expect(cartao.hidden).toBe(false);
		expect(cartao.closest('[data-secao="ataque"]')).not.toBeNull();
		// A flecha vestida aparece na faixa de status.
		expect(host.querySelector('.bm-flecha-atual').textContent).toBe('Flecha');
		expect(host.querySelector('.bm-flecha-atual-passo').hidden).toBe(false);
		expect(BotMenu._estado.estado().municoes).toEqual(MUNICOES);
		const antes = Network.sendPacket.mock.calls.length;
		const liga = host.querySelector('.bm-flechas-ligada');
		liga.checked = true;
		liga.dispatchEvent(new Event('change'));
		expect(BotMenu._estado.estado().dirty).toBe(true);
		expect(Network.sendPacket.mock.calls.length).toBe(antes);
	});

	it('"Retomar automatico" manda o verbo imediato, sem Aplicar e sem tocar o rascunho', async () => {
		const { BotMenu, Network, receber } = await montar();
		receber(status(['cacada', 'flechas']));
		BotMenu._host.querySelector('.bm-retomar-municao').click();
		const corpo = JSON.parse(Network.sendPacket.mock.calls.at(-1)[0].json);
		expect(corpo.verbo).toBe('retomar-municao');
		expect(corpo.config).toBeUndefined();
		expect(BotMenu._estado.estado().dirty).toBe(false);
	});
});
