import { describe, expect, it } from 'vitest';
import { petComemoraONivel, petLamentaAMorte } from 'Engine/MapEngine/falaDoPetNaFicha.js';

/*
 * As duas perguntas puras de D-2374 (`Engine/MapEngine/falaDoPetNaFicha.js`),
 * caso a caso nas bordas. O caminho pelo handler de verdade, contando os
 * `CZ_PET_ACT`, esta em `fichaRepetidaNoMain.test.js`.
 */

describe('petComemoraONivel: so o nivel que SUBIU', () => {
	it('subiu um', () => {
		expect(petComemoraONivel(50, 51)).toBe(true);
	});

	it('o reenvio do mesmo nivel nao e subida', () => {
		expect(petComemoraONivel(50, 50)).toBe(false);
	});

	it('descer (o @blvl do administrador) nao e subida', () => {
		expect(petComemoraONivel(50, 49)).toBe(false);
	});

	it('sem nivel anterior conhecido nao ha subida — nem com null, que o JS leria como 0', () => {
		expect(petComemoraONivel(undefined, 51)).toBe(false);
		expect(petComemoraONivel(null, 51)).toBe(false);
	});
});

describe('petLamentaAMorte: so a PASSAGEM para morto', () => {
	it('vivo -> 0 lamenta', () => {
		expect(petLamentaAMorte(500, 0)).toBe(true);
	});

	it('vivo -> 1 tambem e morte (o limiar do roBrowser e HP <= 1)', () => {
		expect(petLamentaAMorte(500, 1)).toBe(true);
	});

	it('2 nao e morte', () => {
		expect(petLamentaAMorte(500, 2)).toBe(false);
	});

	it('ja morto (0 ou 1) e o reenvio da ficha, e nao morte nova', () => {
		expect(petLamentaAMorte(0, 0)).toBe(false);
		expect(petLamentaAMorte(1, 0)).toBe(false);
		expect(petLamentaAMorte(0, 1)).toBe(false);
	});

	it('o -1 de "sem informacao" conta como vivo: entrar ja morto ainda lamenta', () => {
		expect(petLamentaAMorte(-1, 0)).toBe(true);
	});

	it('vindo de 2 (vivo por um fio) para 1 lamenta', () => {
		expect(petLamentaAMorte(2, 1)).toBe(true);
	});
});
