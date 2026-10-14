/**
 * O PARCIAL DA JANELA DE HABILIDADES (06/10/2026, a banda das janelas) - a
 * metade pura do cliente (`parcialDasSkills.js`). A janela de verdade com o
 * parcial esta em `janelaDeSkillsPorParcial.test.js`.
 */

import { describe, expect, it } from 'vitest';

import {
	aplicarParcialDasSkills,
	comBase,
	dadosDoEnvio,
	ehParcialDasSkills,
	estadoDoInteiro,
	precisaDeclarar,
	servidorNumera
} from 'UI/Components/IdleSkills/parcialDasSkills.js';

function estado() {
	return {
		v: 5,
		rev: 4,
		pontos: 3,
		classe: { id: 1, nome: 'Swordman', nomePt: 'Espadachim' },
		skills: [
			{ skillId: 'SM_BASH', aprendido: 0, descricao: ['Golpe Fulminante'] },
			{ skillId: 'SM_PROVOKE', aprendido: 2, descricao: ['Provocar'] }
		]
	};
}

describe('o parcial da janela de habilidades', () => {
	it('so o envio com `parcial: true` e parcial', () => {
		expect(ehParcialDasSkills({ v: 5, parcial: true })).toBe(true);
		expect(ehParcialDasSkills({ v: 5, parcial: 1 })).toBe(false);
		expect(ehParcialDasSkills({ v: 5 })).toBe(false);
		expect(ehParcialDasSkills(null)).toBe(false);
	});

	it('o pedido leva SEMPRE a chave `base`: a revisao, ou null sem ela', () => {
		expect(comBase({ acao: 'pedir' }, estado())).toEqual({ acao: 'pedir', base: 4 });
		expect(comBase({ acao: 'pedir' }, null)).toStrictEqual({ acao: 'pedir', base: null });
		expect(comBase({ acao: 'pedir' }, { v: 5 })).toStrictEqual({ acao: 'pedir', base: null });
		expect(comBase({ acao: 'pedir' }, { v: 5, rev: '4' })).toStrictEqual({ acao: 'pedir', base: null });
		const corpo = { lote: [] };
		comBase(corpo, estado());
		expect(corpo).toEqual({ lote: [] });
	});

	it('o servidor numera quando o estado tem `rev` numerica', () => {
		expect(servidorNumera(estado())).toBe(true);
		expect(servidorNumera({ v: 5 })).toBe(false);
		expect(servidorNumera({ v: 5, rev: '1' })).toBe(false);
		expect(servidorNumera(null)).toBe(false);
	});

	it('o estado guardado do inteiro e uma COPIA sem o que e do envio', () => {
		const inteiro = { ...estado(), aplicado: true, problemas: ['x'] };
		const guardado = estadoDoInteiro(inteiro);
		expect(guardado).toEqual(estado());
		guardado.skills[0].descricao[0] = 'traduzido';
		expect(inteiro.skills[0].descricao[0]).toBe('Golpe Fulminante');
		expect(inteiro.aplicado).toBe(true);
	});

	it('as trocas caem sobre o estado, a rev avanca, e o de antes fica intacto', () => {
		const antes = estado();
		const depois = aplicarParcialDasSkills(antes, {
			v: 5,
			parcial: true,
			de: 4,
			rev: 5,
			trocas: [
				[['pontos'], 2],
				[['skills', 0, 'aprendido'], 1]
			],
			problemas: []
		});
		expect(depois).toEqual({
			...estado(),
			rev: 5,
			pontos: 2,
			skills: [{ ...estado().skills[0], aprendido: 1 }, estado().skills[1]]
		});
		expect(antes).toEqual(estado());
	});

	it('nao cai: sem estado, revisao de partida errada, trocas que nao sao lista, inteiro, caminho podre', () => {
		const p = { v: 5, parcial: true, de: 4, rev: 5, trocas: [], problemas: [] };
		expect(aplicarParcialDasSkills(estado(), p)).toEqual({ ...estado(), rev: 5 });
		expect(aplicarParcialDasSkills(null, p)).toBeNull();
		expect(aplicarParcialDasSkills(estado(), { ...p, de: 3 })).toBeNull();
		expect(aplicarParcialDasSkills(estado(), { ...p, trocas: null })).toBeNull();
		expect(aplicarParcialDasSkills(estado(), { ...p, parcial: false })).toBeNull();
		expect(aplicarParcialDasSkills(estado(), { ...p, trocas: [[['pontos', 'x'], 1]] })).toBeNull();
		expect(aplicarParcialDasSkills(estado(), { ...p, trocas: [[['__proto__', 'x'], 1]] })).toBeNull();
	});

	it('o que a janela desenha: copia do estado com o `aplicado` (so se veio) e os `problemas` do envio', () => {
		const guardado = estado();
		const anuncio = dadosDoEnvio(guardado, { parcial: true, problemas: [] });
		expect(Object.prototype.hasOwnProperty.call(anuncio, 'aplicado')).toBe(false);
		expect(anuncio).toEqual({ ...estado(), problemas: [] });
		const recusa = dadosDoEnvio(guardado, { parcial: true, aplicado: false, problemas: ['sem pontos'] });
		expect(recusa.aplicado).toBe(false);
		expect(recusa.problemas).toEqual(['sem pontos']);
		expect(dadosDoEnvio(guardado, { parcial: true }).problemas).toEqual([]);
		anuncio.skills[0].descricao[0] = 'traduzido';
		expect(guardado).toEqual(estado());
	});

	it('declarar: o primeiro inteiro numerado e a conexao nova (a revisao recomeca)', () => {
		expect(precisaDeclarar({ v: 5, rev: 1 }, null)).toBe(true);
		expect(precisaDeclarar({ v: 5, rev: 3 }, 2)).toBe(false);
		expect(precisaDeclarar({ v: 5, rev: 2 }, 2)).toBe(true);
		expect(precisaDeclarar({ v: 5, rev: 1 }, 9)).toBe(true);
		// O servidor que nao numera nunca recebe a declaracao.
		expect(precisaDeclarar({ v: 5 }, null)).toBe(false);
		expect(precisaDeclarar(null, null)).toBe(false);
	});
});
