import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { CAUSA_FALTA_DE_ITEM, ehFaltaDeItem, textoDeFaltaDeItem } from '../../src/Engine/MapEngine/faltaDeItemNaSkill.js';

/*
 * A skill que falha por falta de catalisador (causa 71, USESKILL_FAIL_NEED_ITEM)
 * precisa dizer ao jogador QUAL item falta. Antes o roBrowser nao tinha a causa,
 * e o Alquimista sem Garrafa de Acido so via a skill nao sair.
 */
describe('a falta de item na skill (USESKILL_FAIL_NEED_ITEM = 71)', () => {
	it('a causa e a do rAthena (clif.hpp:479)', () => {
		expect(CAUSA_FALTA_DE_ITEM).toBe(71);
		expect(ehFaltaDeItem(71)).toBe(true);
		expect(ehFaltaDeItem(72)).toBe(false);
		expect(ehFaltaDeItem(0)).toBe(false);
	});

	it('o texto diz o item e a quantidade', () => {
		expect(textoDeFaltaDeItem('Garrafa de Ácido', 1)).toBe('É necessário [Garrafa de Ácido] x1 para usar esta habilidade.');
		expect(textoDeFaltaDeItem('Gema Azul', 2)).toBe('É necessário [Gema Azul] x2 para usar esta habilidade.');
	});

	it('sem nome ou sem quantidade, o texto nao quebra', () => {
		expect(textoDeFaltaDeItem('', 0)).toBe('É necessário [item] x1 para usar esta habilidade.');
		expect(textoDeFaltaDeItem(undefined, -3)).toBe('É necessário [item] x1 para usar esta habilidade.');
	});

	it('o onSkillResult trata a causa ANTES do generico de skill (o NUM nao zero caia no 204)', () => {
		const aqui = dirname(fileURLToPath(import.meta.url));
		const fonte = readFileSync(join(aqui, '../../src/Engine/MapEngine/Skill.js'), 'utf8');
		const inicio = fonte.indexOf('function onSkillResult(pkt)');
		const trato = fonte.indexOf('ehFaltaDeItem(pkt.cause)', inicio);
		const generico = fonte.indexOf('if (pkt.NUM)', inicio);
		expect(inicio).toBeGreaterThan(0);
		expect(trato, 'a causa 71 nao e tratada no onSkillResult').toBeGreaterThan(inicio);
		expect(trato, 'a causa 71 tem de vir antes do generico do NUM').toBeLessThan(generico);
	});
});
