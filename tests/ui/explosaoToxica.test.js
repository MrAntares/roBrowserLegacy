import fs from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { absorverCatalogo, desligarTraducao, traduzir } from '../../src/Core/Traducao.js';
import {
	CAUSA_ALVO_COM_HP_ALTO,
	CAUSA_NIVEL,
	TEXTO_ALVO_COM_HP_ALTO,
	TEXTO_GERAL,
	textoDaCausaSemMensagem
} from '../../src/Engine/MapEngine/textoDaFalhaDeSkill.js';
import { explicacaoDoStatus, fraseDoStatus } from '../../src/UI/Components/BotMenu/estadoDoBot.js';

/*
 * D-2326 (pedido do dono, 13/10/2026): a Explosao Toxica (AS_SPLASHER).
 * (1) O clique no alvo acima de 3/4 do HP diz o motivo em vez do texto geral: o servidor manda a causa nossa 200.
 * (2) Em "Só habilidades", quando nenhuma habilidade da lista pega no alvo, o status do Bot diz isso: o servidor manda
 *     o codigo de sempre (`sem-acao-viavel`) com o detalhe `nenhuma-skill-pega-no-alvo`.
 */
describe('a Explosao Toxica no alvo acima de 3/4 (D-2326)', () => {
	it('ET1 a causa 200 tem o texto do motivo; a causa 0 segue com o texto geral', () => {
		expect(CAUSA_ALVO_COM_HP_ALTO).toBe(200);
		expect(textoDaCausaSemMensagem(CAUSA_ALVO_COM_HP_ALTO, 0)).toBe('Explosão Tóxica: o alvo precisa estar com 3/4 do HP ou menos.');
		expect(TEXTO_ALVO_COM_HP_ALTO).not.toBe(TEXTO_GERAL);
		expect(textoDaCausaSemMensagem(CAUSA_NIVEL, 0)).toBe(TEXTO_GERAL);
	});
});

describe('o status do Bot quando nenhuma habilidade pega no alvo (D-2326)', () => {
	const comDetalhe = { codigo: 'sem-acao-viavel', alvo: null, detalhe: 'nenhuma-skill-pega-no-alvo' };

	it('ET2 a frase e a explicacao dizem o motivo', () => {
		expect(fraseDoStatus(comDetalhe)).toBe('Nenhuma habilidade pega neste alvo');
		expect(explicacaoDoStatus(comDetalhe)).toMatch(/3\/4 do HP/);
		expect(explicacaoDoStatus(comDetalhe)).toMatch(/Só habilidades/);
	});

	it('ET3 sem o detalhe (ou com outro), a frase do codigo de sempre', () => {
		expect(fraseDoStatus({ codigo: 'sem-acao-viavel', alvo: null })).toBe('Sem ação possível');
		expect(fraseDoStatus({ ...comDetalhe, detalhe: 'outro' })).toBe('Sem ação possível');
		expect(explicacaoDoStatus({ codigo: 'sem-acao-viavel', alvo: null })).toMatch(/Há monstros/);
	});

	it('ET4 o mesmo detalhe noutro codigo nao vira a frase do motivo', () => {
		expect(fraseDoStatus({ codigo: 'atacando', alvo: { nome: 'Pupa', especie: 1008 }, detalhe: 'nenhuma-skill-pega-no-alvo' })).toBe('Atacando Pupa');
		expect(explicacaoDoStatus({ codigo: 'atacando', alvo: { nome: 'Pupa', especie: 1008 }, detalhe: 'nenhuma-skill-pega-no-alvo' })).toMatch(/lutando contra Pupa/);
	});
});

describe('os tres textos novos em ingles, pelo catalogo PUBLICADO (D-2326)', () => {
	afterEach(() => desligarTraducao());

	it('ET5 o catalogo publicado traduz o aviso e o status', () => {
		absorverCatalogo(JSON.parse(fs.readFileSync('public/ragidle/i18n/en/catalogo.json', 'utf8')));
		expect(traduzir(TEXTO_ALVO_COM_HP_ALTO)).toBe('Venom Splasher: the target must be at 3/4 HP or less.');
		const comDetalhe = { codigo: 'sem-acao-viavel', alvo: null, detalhe: 'nenhuma-skill-pega-no-alvo' };
		expect(traduzir(fraseDoStatus(comDetalhe))).toBe('No skill works on this target');
		expect(traduzir(explicacaoDoStatus(comDetalhe))).toMatch(/^No skill on the list works against this target/);
	});
});
