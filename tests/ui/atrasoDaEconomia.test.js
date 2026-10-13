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

function montar({ oculta = true, ligada = true, dedo = false } = {}) {
	const estado = { oculta, ligada, dedo };
	const pedidos = [];
	const telas = [];
	const gatilho = criarGatilhoDaEconomia({
		oculta: () => estado.oculta,
		automaticaLigada: () => estado.ligada,
		armarNaHora: () => estado.dedo,
		pedirEntrar: () => pedidos.push('entrar'),
		pedirSair: () => pedidos.push('sair'),
		abrirTela: restante => telas.push(restante)
	});
	return { estado, pedidos, telas, gatilho };
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
		expect(motor).toContain("pedirEntrar: () => pedirAcaoDaEconomia('entrar'),");
		expect(motor).toContain('criarGatilhoDaEconomia({');
		// O criterio de celular e o do projeto (`ehDedo`), nao um `matchMedia` novo; e o `pagehide` esta ligado.
		expect(motor).toContain('armarNaHora: () => ehDedo(),');
		expect(motor).toContain("window.addEventListener('pagehide', onPaginaEscondida);");
	});
});

describe('o celular arma na hora (decisao do dono, 13/10/2026)', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('no dedo o `entrar` sai NO INSTANTE em que a aba some, sem esperar os 14 s', () => {
		const { pedidos, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual(['entrar']);
		vi.advanceTimersByTime(60_000);
		expect(pedidos, 'um aviso so').toEqual(['entrar']);
	});

	it('no desktop o `entrar` continua so depois dos 14 s (D-1394)', () => {
		const { pedidos, gatilho } = montar({ dedo: false });
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual([]);
		vi.advanceTimersByTime(14_000);
		expect(pedidos).toEqual(['entrar']);
	});

	it('a TELA PRETA do celular so abre depois dos 14 s, mesmo com a resposta do servidor ja ter chegado', () => {
		const { telas, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		expect(gatilho.aoResponderAtiva(14_400_000), 'a resposta chega na hora: a tela espera').toBe(false);
		vi.advanceTimersByTime(13_999);
		expect(telas).toEqual([]);
		vi.advanceTimersByTime(1);
		expect(telas, 'passou o atraso: abre com o restante guardado').toEqual([14_400_000]);
		expect(gatilho.aoResponderAtiva(14_399_000), 'depois do atraso a tela abre direto').toBe(true);
	});

	it('se a resposta chega DEPOIS do atraso, a tela abre direto (nada guardado)', () => {
		const { telas, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(14_000);
		expect(telas).toEqual([]);
		expect(gatilho.aoResponderAtiva(1)).toBe(true);
	});

	it('voltar antes dos 14 s manda `sair` e a tela nunca abre', () => {
		const { estado, pedidos, telas, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		gatilho.aoResponderAtiva(14_400_000);
		vi.advanceTimersByTime(8_000);
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual(['entrar', 'sair']);
		// A resposta atrasada do `entrar` (ativa:true) e ignorada ate o ack do `sair`.
		expect(gatilho.aoResponderAtiva(14_400_000)).toBe(false);
		vi.advanceTimersByTime(60_000);
		expect(telas).toEqual([]);
		gatilho.aoResponderInativa();
		expect(gatilho.fase()).toBe('livre');
	});

	it('voltar DEPOIS que a tela abriu nao manda `sair` (D-1392)', () => {
		const { estado, pedidos, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(14_000);
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual(['entrar']);
	});

	it('o `pagehide` arma na hora no dedo, uma vez, e nao no desktop', () => {
		const dedo = montar({ dedo: true });
		dedo.gatilho.aoEsconderPagina();
		dedo.gatilho.aoEsconderPagina();
		expect(dedo.pedidos).toEqual(['entrar']);
		const mouse = montar({ dedo: false });
		mouse.gatilho.aoEsconderPagina();
		expect(mouse.pedidos).toEqual([]);
	});

	it('o `pagehide` seguido do visibilitychange nao manda dois `entrar`', () => {
		const { pedidos, gatilho } = montar({ dedo: true });
		gatilho.aoEsconderPagina();
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual(['entrar']);
	});

	it('com a opcao desligada o celular nao arma nem no `pagehide`', () => {
		const { pedidos, gatilho } = montar({ dedo: true, ligada: false });
		gatilho.aoMudarVisibilidade();
		gatilho.aoEsconderPagina();
		expect(pedidos).toEqual([]);
	});

	it('a opcao desligada com o aviso ja mandado (celular) desfaz com `sair`', () => {
		const { estado, pedidos, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		estado.ligada = false;
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual(['entrar', 'sair']);
	});

	it('o ack tardio do `sair` nao apaga um novo `entrar` cedo (esconder, voltar, esconder)', () => {
		const { estado, pedidos, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		estado.oculta = true;
		gatilho.aoMudarVisibilidade();
		expect(pedidos).toEqual(['entrar', 'sair', 'entrar']);
		gatilho.aoResponderInativa();
		expect(gatilho.fase(), 'o ack do sair velho nao desfaz o entrar novo').toBe('cedo');
	});
});

describe('rodada 3 do bug #10: achados do critico', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('A1: com a tela preta ja aberta, esconder de novo e voltar em menos de 14 s NAO manda `sair` (D-1392)', () => {
		const { estado, pedidos, telas, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		gatilho.aoResponderAtiva(14_400_000);
		vi.advanceTimersByTime(14_000);
		expect(telas).toEqual([14_400_000]);
		// Voltou sem clicar no botao, escondeu de novo e voltou depressa.
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		estado.oculta = true;
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(5_000);
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		expect(pedidos, 'so o botao fecha a tela: nada de `sair` nem de `entrar` repetido').toEqual(['entrar']);
		expect(gatilho.fase()).toBe('liberada');
	});

	it('A1 no desktop: a tela liberada tambem nao reagenda um segundo `entrar`', () => {
		const { estado, pedidos, gatilho } = montar({ dedo: false });
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(14_000);
		estado.oculta = false;
		gatilho.aoMudarVisibilidade();
		estado.oculta = true;
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(60_000);
		expect(pedidos).toEqual(['entrar']);
	});

	it('A1: o botao "Voltar a jogar" (`cancelar`) devolve o gatilho ao comeco', () => {
		const { pedidos, gatilho } = montar({ dedo: true });
		gatilho.aoMudarVisibilidade();
		vi.advanceTimersByTime(14_000);
		gatilho.cancelar();
		gatilho.aoMudarVisibilidade();
		expect(pedidos, 'depois do botao, esconder arma de novo').toEqual(['entrar', 'entrar']);
	});

	it('A2: o `pagehide` sozinho arma e AGENDA a tela como o esconder: abre depois dos 14 s se a aba estiver oculta', () => {
		const { estado, telas, gatilho } = montar({ dedo: true, oculta: false });
		gatilho.aoEsconderPagina();
		gatilho.aoResponderAtiva(14_400_000);
		expect(gatilho.agendado()).toBe(true);
		estado.oculta = true; // a aba ficou oculta sem passar pelo visibilitychange
		vi.advanceTimersByTime(14_000);
		expect(telas).toEqual([14_400_000]);
	});

	it('A2: o `pagehide` com a aba ainda visivel no disparo nao abre tela nenhuma', () => {
		const { telas, gatilho } = montar({ dedo: true, oculta: false });
		gatilho.aoEsconderPagina();
		gatilho.aoResponderAtiva(14_400_000);
		vi.advanceTimersByTime(60_000);
		expect(telas).toEqual([]);
	});
});
