/**
 * As contas do relogio de recarga da barra de atalhos (item 3.10 do pedido do
 * dono, 09/10/2026): a fracao que falta, o rotulo do centro e as bordas (fim,
 * duracao zero, passado). As contas sao as do relogio dos orbes do DockIdle
 * (D-916), que saiu com o idle antigo (df1636c9) e voltam aqui para a barra.
 */
import { describe, expect, it } from 'vitest';
import {
	PASSO_DO_RELOGIO_MS,
	estadoDaRecarga,
	rotuloDeRecarga
} from '../../src/UI/Components/ShortCut/relogioDeRecarga.js';

describe('a fracao que falta', () => {
	const recarga = { ate: 12000, duracao: 2000 }; // disparou em 10000

	it('e 1 no disparo, metade no meio, 0 no fim', () => {
		expect(estadoDaRecarga(recarga, 10000).fracao).toBe(1);
		expect(estadoDaRecarga(recarga, 11000).fracao).toBe(0.5);
		expect(estadoDaRecarga(recarga, 12000).fracao).toBe(0);
	});

	it('anda em sentido unico: quanto mais tarde, menor', () => {
		const a = estadoDaRecarga(recarga, 10400).fracao;
		const b = estadoDaRecarga(recarga, 11600).fracao;
		expect(a).toBeGreaterThan(b);
		expect(b).toBeGreaterThan(0);
	});

	it('depois do fim nao fica negativa, e o restante e zero', () => {
		const depois = estadoDaRecarga(recarga, 15000);
		expect(depois.restante).toBe(0);
		expect(depois.fracao).toBe(0);
		expect(depois.rotulo).toBe('');
	});

	it('um relogio que chega ANTES do disparo nao passa de 1', () => {
		expect(estadoDaRecarga({ ate: 20000, duracao: 2000 }, 10000).fracao).toBe(1);
	});

	it('duracao zero nao divide por zero: nada a desenhar', () => {
		expect(estadoDaRecarga({ ate: 12000, duracao: 0 }, 11000).fracao).toBe(0);
	});
});

describe('o rotulo do centro', () => {
	it('decimos abaixo de 10 s, segundos inteiros dali para cima', () => {
		expect(rotuloDeRecarga(2400)).toBe('2.4');
		expect(rotuloDeRecarga(9990)).toBe('10.0');
		expect(rotuloDeRecarga(10000)).toBe('10s');
		expect(rotuloDeRecarga(12001)).toBe('13s');
		expect(rotuloDeRecarga(300000)).toBe('300s');
	});

	it('vazio quando nao ha o que mostrar', () => {
		expect(rotuloDeRecarga(0)).toBe('');
		expect(rotuloDeRecarga(-5)).toBe('');
		expect(rotuloDeRecarga(NaN)).toBe('');
	});

	it('o estado carrega o mesmo rotulo', () => {
		expect(estadoDaRecarga({ ate: 12000, duracao: 2000 }, 10500).rotulo).toBe('1.5');
	});
});

describe('o passo do relogio', () => {
	it('e curto o bastante para a fatia andar lisa e nao e zero', () => {
		expect(PASSO_DO_RELOGIO_MS).toBeGreaterThan(0);
		expect(PASSO_DO_RELOGIO_MS).toBeLessThanOrEqual(100);
	});
});
