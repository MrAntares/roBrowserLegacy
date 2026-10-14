/**
 * O PARCIAL DA TEMPORADA (a banda das janelas, 06/10/2026).
 *
 * O modulo `parcialDaTemporada.js` e puro e e testado de verdade; as LIGACOES
 * em `TemporadaIdle.js` (janela com Shadow DOM, Network e UIManager) sao
 * cobradas pelo fonte sem comentario, como em `codexAoVivo.test.js`.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
	VERSAO_DO_PARCIAL_DA_TEMPORADA,
	aplicarParcialDaTemporada,
	comBase,
	ehParcialDaTemporada
} from 'UI/Components/TemporadaIdle/parcialDaTemporada.js';

function semComentarios(texto) {
	return texto.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
const TEMPORADA = semComentarios(readFileSync('src/UI/Components/TemporadaIdle/TemporadaIdle.js', 'utf8').replace(/\r\n/g, '\n'));

function estado() {
	return {
		v: 3,
		rev: 5,
		moeda: { nome: 'RO Cash', saldoMinor: 20000 },
		caixas: [{ pool: 'TOP', fechadas: 0, recompensas: [{ itemId: 1, chance: 100 }] }],
		passe: { premios: [{ nivel: 1, situacao: 'LOCKED' }, { nivel: 2, situacao: 'LOCKED' }] },
		resultado: { ok: true, acao: 'velho' }
	};
}

describe('o parcial da Temporada', () => {
	it('o parcial e `v: 4`, que a guarda do inteiro (v 2/3) ignoraria', () => {
		expect(VERSAO_DO_PARCIAL_DA_TEMPORADA).toBe(4);
		expect(ehParcialDaTemporada({ v: 4 })).toBe(true);
		expect(ehParcialDaTemporada({ v: 3 })).toBe(false);
		expect(ehParcialDaTemporada(null)).toBe(false);
	});

	it('o pedido leva a revisao que a janela tem, e sem estado vai sem base', () => {
		expect(comBase({ acao: 'pedir' }, estado())).toEqual({ acao: 'pedir', base: 5 });
		expect(comBase({ acao: 'pedir' }, null)).toStrictEqual({ acao: 'pedir' });
		expect(comBase({ acao: 'pedir' }, { v: 3 })).toStrictEqual({ acao: 'pedir' });
		expect(comBase({ acao: 'pedir' }, { v: 3, rev: '5' })).toStrictEqual({ acao: 'pedir' });
		const semEstado = { acao: 'pedir' };
		expect(comBase(semEstado, null)).not.toBe(semEstado);
		const corpo = { acao: 'abrir-caixa', pool: 'TOP' };
		comBase(corpo, estado());
		expect(corpo).toEqual({ acao: 'abrir-caixa', pool: 'TOP' });
	});

	it('as trocas mudam so o caminho delas; a rev e o resultado sao os do parcial', () => {
		const antes = estado();
		const depois = aplicarParcialDaTemporada(antes, {
			v: 4,
			de: 5,
			rev: 6,
			trocas: [
				[['moeda', 'saldoMinor'], 19500],
				[['caixas', 0, 'fechadas'], 1],
				[['passe', 'premios', 1, 'situacao'], 'CLAIMABLE']
			],
			resultado: { ok: true, acao: 'comprar-caixa' }
		});
		expect(depois).toEqual({
			v: 3,
			rev: 6,
			moeda: { nome: 'RO Cash', saldoMinor: 19500 },
			caixas: [{ pool: 'TOP', fechadas: 1, recompensas: [{ itemId: 1, chance: 100 }] }],
			passe: { premios: [{ nivel: 1, situacao: 'LOCKED' }, { nivel: 2, situacao: 'CLAIMABLE' }] },
			resultado: { ok: true, acao: 'comprar-caixa' }
		});
		// O estado de antes fica intacto.
		expect(antes).toEqual(estado());
	});

	it('sem trocas (o pedido do menu): o mesmo estado, com o resultado do parcial (null)', () => {
		const depois = aplicarParcialDaTemporada(estado(), { v: 4, de: 5, rev: 6, trocas: [], resultado: null });
		expect(depois).toEqual({ ...estado(), rev: 6, resultado: null });
	});

	it('uma troca de subarvore inteira e de raiz', () => {
		const sub = aplicarParcialDaTemporada(estado(), { v: 4, de: 5, rev: 6, trocas: [[['caixas'], []]], resultado: null });
		expect(sub.caixas).toEqual([]);
	});

	it('nao cai: sem estado, revisao de partida errada, trocas que nao sao lista, caminho que atravessa folha ou o prototipo', () => {
		const p = { v: 4, de: 5, rev: 6, trocas: [], resultado: null };
		expect(aplicarParcialDaTemporada(null, p)).toBeNull();
		expect(aplicarParcialDaTemporada(estado(), { ...p, de: 4 })).toBeNull();
		expect(aplicarParcialDaTemporada(estado(), { ...p, trocas: null })).toBeNull();
		expect(aplicarParcialDaTemporada(estado(), { ...p, v: 3 })).toBeNull();
		expect(aplicarParcialDaTemporada(estado(), { ...p, trocas: [[['moeda', 'saldoMinor', 'x'], 1]] })).toBeNull();
		expect(aplicarParcialDaTemporada(estado(), { ...p, trocas: [[['__proto__', 'x'], 1]] })).toBeNull();
		expect(aplicarParcialDaTemporada(estado(), { ...p, trocas: [[['moeda', '__proto__'], 1]] })).toBeNull();
		expect(aplicarParcialDaTemporada(estado(), { ...p, trocas: ['lixo'] })).toBeNull();
	});
});

describe('a ligacao em TemporadaIdle.js', () => {
	it('os dois pedidos levam a base; o pedido de socorro vai sem ela', () => {
		expect(TEMPORADA).toContain('pkt.json = JSON.stringify(comBase(corpo, TemporadaIdle.estado));');
		expect(TEMPORADA).toContain("pkt.json = JSON.stringify(comBase({ acao: 'pedir' }, TemporadaIdle.estado));");
		expect(TEMPORADA).toMatch(/function pedirEstadoInteiro\(\) \{\n\tconst pkt = new PACKET\.CZ\.RAGIDLE_TEMPORADA_ACAO\(\);\n\tpkt\.json = JSON\.stringify\(\{ acao: 'pedir' \}\);/);
	});

	it('o parcial vira o estado ANTES da guarda de versao, e o que nao cai pede o inteiro', () => {
		const recebida = TEMPORADA.slice(TEMPORADA.indexOf('function onTemporadaRecebida'));
		const parcial = recebida.indexOf('if (ehParcialDaTemporada(dados)) {');
		const guarda = recebida.indexOf('if (!dados || (dados.v !== 2 && dados.v !== 3)) {');
		expect(parcial).toBeGreaterThan(0);
		expect(guarda).toBeGreaterThan(parcial);
		const bloco = recebida.slice(parcial, guarda);
		expect(bloco).toContain('aplicarParcialDaTemporada(TemporadaIdle.estado, dados)');
		expect(bloco).toMatch(/if \(!montado\) \{\s*pedirEstadoInteiro\(\);\s*return;\s*\}\s*dados = montado;/);
	});
});
