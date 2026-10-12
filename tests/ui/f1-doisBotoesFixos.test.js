/**
 * "CACAR" E "RETORNAR PARA PRONTERA": DOIS BOTOES FIXOS E SEPARADOS (F1/T3,
 * 21/09/2026 - D-1673/D-1674).
 *
 * Pedido do dono: *"Mantenha dois botoes separados e fixos na interface:
 * 'Cacar' e, abaixo dele, 'Retornar para Prontera'. O botao 'Cacar' nao deve
 * mais ser substituido pelo de retorno conforme o estado do jogador. Ambos
 * devem permanecer visiveis; habilite cada acao conforme sua aplicabilidade,
 * explicando estados indisponiveis."*
 *
 * Tres coisas medidas aqui:
 *
 *  1. O par da HUD (`HuntButtonIdle`), EXECUTADO em jsdom com o HTML real: os
 *     dois existem sempre; "Retornar" fica DESABILITADO quando o jogador ja
 *     esta na cidade do ponto salvo e o motivo aparece como TEXTO (nao so
 *     `title`, que no celular nao existe); volta a habilitar fora dela.
 *  2. O rodape do Mapa de Caca (`rodapeDoDossie.js`, modulo puro): ele
 *     TROCAVA "Viajar para X" por uma nota "Voce ja esta neste mapa" - o
 *     ultimo lugar em que um botao era substituido pelo outro. Agora os dois
 *     estao sempre la, cada um habilitado conforme se aplica e com o motivo.
 *  3. No celular em pe os dois eram DISCOS SEM ROTULO (`.hb-rotulo` escondido
 *     por clip-path), o que le como "um botao so". O rotulo passa a ser
 *     visivel tambem la - o CSS e lido porque nao ha layout em jsdom; a foto
 *     e quem prova (`scripts/sonda-f1-tela.ts`, no repositorio do servidor).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const mocks = vi.hoisted(() => ({
	huntMap: { catalog: null, toggle: vi.fn(), travelToCity: vi.fn() },
	avisos: []
}));

vi.mock('UI/UIManager.js', () => ({ default: { addComponent: (c) => c } }));
vi.mock('UI/Components/HuntMap/HuntMap.js', () => ({ default: mocks.huntMap }));
vi.mock('UI/Components/AdminPanel/AdminPanel.js', () => ({ default: { getRoot: () => null } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: (t) => mocks.avisos.push(t), TYPE: { ERROR: 1 }, FILTER: { PUBLIC_LOG: 1 } }
}));
// O botao de sentar do celular (04/10/2026) le a postura e manda o /sit: fora do teste.
vi.mock('Controls/ProcessCommand.js', () => ({ default: { processCommand: () => {} } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('UI/escalaDaHud.js', () => ({ emUnidadesDaHud: (x) => x, ehDedo: () => false, default: {} }));

const { default: htmlDoBotao } = await import('UI/Components/HuntButtonIdle/HuntButtonIdle.html?raw');
const { default: HuntButtonIdle } = await import('UI/Components/HuntButtonIdle/HuntButtonIdle.js');
const { estadoDoRodape } = await import('UI/Components/HuntMap/rodapeDoDossie.js');
// O contexto do mapa mora em UI/contextoDoMapa.js desde 07/10/2026 (era o IdleConfig).
const { receberDoServidor, esquecer: esquecerContexto } = await import('UI/contextoDoMapa.js');

const ler = (rel) => readFileSync(join(process.cwd(), 'src', rel), 'utf8');

function montar() {
	HuntButtonIdle._host = document.createElement('div');
	HuntButtonIdle._host.innerHTML = htmlDoBotao;
	HuntButtonIdle._shadow = null;
	document.body.appendChild(HuntButtonIdle._host);
	HuntButtonIdle.init();
}

describe('HuntButtonIdle: os dois botoes existem sempre e cada um diz por que esta indisponivel', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		mocks.avisos.length = 0;
		mocks.huntMap.toggle.mockClear();
		mocks.huntMap.travelToCity.mockClear();
		mocks.huntMap.catalog = { cidade: { mapa: 'prontera', rotulo: 'Prontera' } };
		esquecerContexto();
		receberDoServidor({ mapa: 'prontera', ehCidade: true }, false);
		HuntButtonIdle.limparEstadoDoPersonagem();
		montar();
	});

	afterEach(() => {
		HuntButtonIdle.onRemove();
	});

	it('na cidade do ponto salvo: "Cacar" ativo, "Retornar" DESABILITADO e o motivo e TEXTO visivel', () => {
		HuntButtonIdle.onAppend();
		const root = HuntButtonIdle._host;
		const cacar = root.querySelector('.hb-cacar');
		const voltar = root.querySelector('.hb-voltar');
		expect(cacar).not.toBeNull();
		expect(voltar).not.toBeNull();
		expect(cacar.disabled).toBe(false);
		expect(voltar.disabled).toBe(true);
		const motivo = root.querySelector('.hb-motivo');
		expect(motivo).not.toBeNull();
		expect(motivo.hidden).toBe(false);
		expect(motivo.textContent).toContain('Prontera');
		// O rotulo do botao continua sendo a ACAO - ele nao vira o motivo.
		expect(voltar.querySelector('.hb-rotulo').textContent.trim()).toBe('Retornar para Prontera');
		expect(cacar.querySelector('.hb-rotulo').textContent.trim()).toBe('Caçar');
	});

	it('num mapa de caca: os dois ativos e o motivo some', () => {
		receberDoServidor({ mapa: 'prt_fild08', ehCidade: false }, false);
		HuntButtonIdle.onAppend();
		const root = HuntButtonIdle._host;
		expect(root.querySelector('.hb-voltar').disabled).toBe(false);
		expect(root.querySelector('.hb-cacar').disabled).toBe(false);
		expect(root.querySelector('.hb-motivo').hidden).toBe(true);
	});

	it('a viagem (Prontera -> mapa) reabilita, e o clique continua chegando ao mesmo handler', () => {
		HuntButtonIdle.onAppend();
		const root = HuntButtonIdle._host;
		expect(root.querySelector('.hb-voltar').disabled).toBe(true);
		receberDoServidor({ mapa: 'gef_fild07', ehCidade: false }, false);
		HuntButtonIdle.onAppend();
		expect(root.querySelector('.hb-voltar').disabled).toBe(false);
		root.querySelector('.hb-voltar').click();
		expect(mocks.huntMap.travelToCity).toHaveBeenCalledTimes(1);
		root.querySelector('.hb-cacar').click();
		expect(mocks.huntMap.toggle).toHaveBeenCalledTimes(1);
	});
});

describe('o rodape do Mapa de Caca: Viajar e Retornar sempre presentes, cada um com o proprio estado', () => {
	const cidade = { mapa: 'prontera', rotulo: 'Prontera' };
	const campo = { mapa: 'prt_fild08', rotulo: 'Campo de Prontera 08', nivelQueAbre: 1 };

	it('sem mapa selecionado: Viajar existe, desabilitado, e diz para escolher um mapa', () => {
		const r = estadoDoRodape({ mapa: null, encaixe: null, mapaAtual: 'prontera', cidade });
		expect(r.viajar.habilitado).toBe(false);
		expect(r.viajar.motivo).toMatch(/escolha um mapa/i);
		expect(r.retornar).toBeDefined();
	});

	it('mapa selecionado e viajavel: Viajar ativo com o nome do mapa, sem motivo', () => {
		const r = estadoDoRodape({ mapa: campo, encaixe: { cls: 'ideal' }, mapaAtual: 'prontera', cidade });
		expect(r.viajar.habilitado).toBe(true);
		expect(r.viajar.rotulo).toBe('Viajar para Campo de Prontera 08');
		expect(r.viajar.motivo).toBeNull();
		expect(r.viajar.mapa).toBe('prt_fild08');
	});

	it('o mapa selecionado e o ATUAL: Viajar continua la, desabilitado, com o motivo - nao vira uma nota no lugar', () => {
		const r = estadoDoRodape({ mapa: campo, encaixe: { cls: 'ideal' }, mapaAtual: 'prt_fild08', cidade });
		expect(r.viajar.habilitado).toBe(false);
		expect(r.viajar.rotulo).toBe('Viajar para Campo de Prontera 08');
		expect(r.viajar.motivo).toMatch(/já está neste mapa/i);
	});

	it('mapa trancado: desabilitado e o rotulo diz em que nivel abre (o que a foto do atlas ja cobra)', () => {
		const trancado = { ...campo, nivelQueAbre: 40 };
		const r = estadoDoRodape({ mapa: trancado, encaixe: { cls: 'locked' }, mapaAtual: 'prontera', cidade });
		expect(r.viajar.habilitado).toBe(false);
		expect(r.viajar.rotulo).toMatch(/Abre no Nv\. 40/);
		expect(r.viajar.motivo).toMatch(/40/);
	});

	it('Retornar: desabilitado com motivo quando ja esta na cidade; ativo fora dela', () => {
		const emCasa = estadoDoRodape({ mapa: campo, encaixe: { cls: 'ideal' }, mapaAtual: 'prontera', cidade });
		expect(emCasa.retornar.habilitado).toBe(false);
		expect(emCasa.retornar.motivo).toMatch(/já está em Prontera/i);
		expect(emCasa.retornar.mapa).toBe('prontera');
		const fora = estadoDoRodape({ mapa: campo, encaixe: { cls: 'ideal' }, mapaAtual: 'prt_fild08', cidade });
		expect(fora.retornar.habilitado).toBe(true);
		expect(fora.retornar.motivo).toBeNull();
		expect(fora.retornar.rotulo).toBe('Retornar ao ponto salvo');
	});
});

describe('no celular em pe o rotulo dos dois botoes e LEGIVEL (nao mais escondido por clip-path)', () => {
	it('a regra `.ri-vertical .hb-rotulo` nao esconde mais o texto', () => {
		const css = ler('UI/Components/HuntButtonIdle/HuntButtonIdle.css');
		const inicio = css.indexOf('.ri-vertical .hb-rotulo');
		expect(inicio).toBeGreaterThan(-1);
		const bloco = css.slice(inicio, css.indexOf('}', inicio));
		expect(bloco).not.toContain('clip-path');
		expect(bloco).not.toMatch(/width:\s*1px/);
	});

	it('o HTML tem o lugar do motivo (texto), e ele nasce escondido', () => {
		const html = ler('UI/Components/HuntButtonIdle/HuntButtonIdle.html');
		expect(html).toMatch(/class="hb-motivo"[^>]*hidden/);
	});
});
