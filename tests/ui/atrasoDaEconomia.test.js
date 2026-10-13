/**
 * O ATRASO ANTES DE ENTRAR NA ECONOMIA DE ENERGIA / MODO DESCANSO (23/09/2026,
 * ordem do dono: "Aumente esse tempo para 14 segundos"; era 3 s desde D-1394).
 * De volta em 13/10/2026 (bug #10, decisao do dono: "sim, trazer de volta" para o
 * Bot novo).
 *
 * Comportamento com RELOGIO FALSO, nao casamento de texto: o gatilho mora em
 * `Engine/gatilhoDaEconomia.js` (puro) e o `MapEngine.js` so o liga.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA, criarGatilhoDaEconomia } from '../../src/Engine/gatilhoDaEconomia.js';

function montar({ oculta = true, ligada = true } = {}) {
	const estado = { oculta, ligada };
	const pedidos = [];
	const gatilho = criarGatilhoDaEconomia({
		oculta: () => estado.oculta,
		automaticaLigada: () => estado.ligada,
		pedirEntrar: () => pedidos.push('entrar')
	});
	return { estado, pedidos, gatilho };
}

describe('o atraso da economia de energia', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('o atraso e de 14 s', () => {
		expect(MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA).toBe(14000);
	});

	it('a aba escondida espera 14 s antes de pedir a economia, e pede UMA vez', () => {
		const { pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(13_999);
		expect(pedidos).toEqual([]);
		vi.advanceTimersByTime(1);
		expect(pedidos).toEqual(['entrar']);
		vi.advanceTimersByTime(60_000);
		expect(pedidos).toEqual(['entrar']);
	});

	it('um segundo evento de visibilidade com a aba ainda oculta nao empilha outro atraso', () => {
		const { pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(5_000);
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(9_000);
		expect(pedidos).toEqual(['entrar']);
		// Um atraso so: o segundo evento nao deixou um segundo aviso para 5 s depois.
		vi.advanceTimersByTime(60_000);
		expect(pedidos).toEqual(['entrar']);
	});

	it('voltar antes do atraso cancela: nunca chegou a avisar', () => {
		const { estado, pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(10_000);
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		expect(gatilho.agendado(), 'voltar a aba derruba o atraso na hora').toBe(false);
		vi.advanceTimersByTime(60_000);
		expect(pedidos).toEqual([]);
	});

	it('esconder, voltar e esconder de novo: o atraso conta a partir da SEGUNDA vez (o primeiro caiu)', () => {
		const { estado, pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade(); // t = 0
		vi.advanceTimersByTime(10_000);
		estado.oculta = false;
		gatilho.aoMudarVisibilidade(); // t = 10 s: cancela
		vi.advanceTimersByTime(2_000);
		estado.oculta = true;
		gatilho.aoMudarVisibilidade(); // t = 12 s: novo atraso, vence em t = 26 s
		vi.advanceTimersByTime(13_999); // t = 25,999 s: o atraso velho (t = 14 s) ja teria avisado
		expect(pedidos).toEqual([]);
		vi.advanceTimersByTime(1);
		expect(pedidos).toEqual(['entrar']);
	});

	it('voltar a aba DEPOIS de avisar nao manda `sair` (so o botao "Voltar a jogar" sai, D-1392)', () => {
		const { estado, pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(14_000);
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual(['entrar']);
	});

	it('a aba que volta no instante exato do disparo nao avisa (confere de novo)', () => {
		const { estado, pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(13_000);
		estado.oculta = false; // sem passar pelo evento: o disparo reconfere
		vi.advanceTimersByTime(1_000);
		expect(pedidos).toEqual([]);
	});

	it('a opcao desligada nas Configuracoes de Video: nada e pedido, nem pelo atraso ja agendado', () => {
		const { estado, pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(5_000);
		estado.ligada = false;
		gatilho.aoMudarVisibilidade();
		expect(gatilho.agendado()).toBe(false);
		vi.advanceTimersByTime(60_000);
		expect(pedidos).toEqual([]);
	});

	it('desligada no meio do atraso, sem novo evento, o disparo reconfere e nao avisa', () => {
		const { estado, pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(5_000);
		estado.ligada = false;
		vi.advanceTimersByTime(10_000);
		expect(pedidos).toEqual([]);
	});

	it('`cancelar` (a reentrada, o fim da sessao) derruba o atraso pendente', () => {
		const { pedidos, gatilho } = montar();
		gatilho.aoMudarVisibilidade();
		gatilho.cancelar();
		vi.advanceTimersByTime(60_000);
		expect(pedidos).toEqual([]);
	});

	it('o MapEngine liga o gatilho: o ouvinte de visibilidade, o pacote `entrar` e o desmonte', () => {
		const motor = readFileSync('src/Engine/MapEngine.js', 'utf8');
		expect(motor).toContain("document.addEventListener('visibilitychange', onVisibilidadeMudouParaEconomia);");
		expect(motor).toContain("document.removeEventListener('visibilitychange', onVisibilidadeMudouParaEconomia);");
		expect(motor).toContain("pkt.json = JSON.stringify({ acao: 'entrar' });");
		expect(motor).toContain('criarGatilhoDaEconomia({');
	});
});
