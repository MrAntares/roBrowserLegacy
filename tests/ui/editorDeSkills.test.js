/**
 * O EDITOR DE SKILLS da aba Ataque (Fase 6, 07/10/2026), no DOM do jsdom:
 * a tela desenha o que a config diz, so oferece as skills que o servidor
 * aceita, mostra as outras com o motivo, e cada gesto vira uma edicao pura
 * do rascunho (o Aplicar continua sendo o unico caminho ate o servidor).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { desenharEditorDeSkills } from 'UI/Components/BotMenu/editorDeSkills.js';

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

const SKILLS = [
	{ skillId: 5, nome: 'Golpe Fulminante', aprendido: 10, aceita: true },
	{ skillId: 7, nome: 'Provocar', aprendido: 3, aceita: true },
	{ skillId: 8, nome: 'Vigor', aprendido: 5, aceita: false }
];
const MONSTROS = [
	{ especie: 1002, nome: 'Poring' },
	{ especie: 1113, nome: 'Drops' }
];

function configVazia() {
	return {
		v: 1,
		cacar: true,
		raioDePercepcao: 12,
		especiesVetadas: [],
		modoDeAtaque: 'skills-e-basico',
		skills: { geral: [], porSkill: {}, porMonstro: {} }
	};
}

let secao;
let config;
let escopo;

function desenhar(skills = SKILLS) {
	desenharEditorDeSkills(
		secao,
		{ config, skills, monstros: MONSTROS, escopo, teto: { geral: 12, porMonstro: 12 } },
		fn => {
			config = fn(config);
			desenhar(skills);
		},
		e => {
			escopo = e;
			desenhar(skills);
		}
	);
}

beforeEach(() => {
	document.body.innerHTML = html;
	secao = document.querySelector('[data-secao="ataque"]');
	config = configVazia();
	escopo = 'geral';
});

describe('o editor de skills do Bot', () => {
	it('servidor sem skills: o aviso fica e o editor some', () => {
		desenhar(null);
		expect(secao.querySelector('.bm-skills').hidden).toBe(true);
		expect(secao.querySelector('.bm-indisponivel').hidden).toBe(false);
	});

	it('so oferece as aceitas e diz quais o Bot ainda nao usa', () => {
		desenhar();
		expect(secao.querySelector('.bm-indisponivel').hidden).toBe(true);
		const ofertas = [...secao.querySelectorAll('.bm-nova-skill option')].map(o => o.textContent);
		expect(ofertas).toEqual(['Golpe Fulminante', 'Provocar']);
		expect(secao.querySelector('.bm-nao-aceitas').textContent).toContain('Vigor');
	});

	it('adicionar, ordenar, nivel e remover editam a lista geral', () => {
		desenhar();
		secao.querySelector('.bm-add').click();
		secao.querySelector('.bm-add').click();
		expect(config.skills.geral.map(e => e.skillId)).toEqual([5, 7]);
		// A oferta nao repete o que ja esta na lista.
		expect(secao.querySelectorAll('.bm-nova-skill option')).toHaveLength(0);
		secao.querySelector('[data-skill="7"] .bm-sobe').click();
		expect(config.skills.geral.map(e => e.skillId)).toEqual([7, 5]);
		const nivel = secao.querySelector('[data-skill="5"] .bm-skill-nivel');
		expect([...nivel.options].map(o => o.value)).toEqual(['aprendido', ...Array.from({ length: 10 }, (_, i) => String(i + 1))]);
		nivel.value = '4';
		nivel.dispatchEvent(new Event('change'));
		expect(config.skills.geral.find(e => e.skillId === 5).nivel).toBe(4);
		secao.querySelector('[data-skill="7"] .bm-remove').click();
		expect(config.skills.geral.map(e => e.skillId)).toEqual([5]);
	});

	it('desligar uma skill vale para todas as listas e aparece riscada no monstro que herda', () => {
		desenhar();
		secao.querySelector('.bm-add').click();
		const ativa = secao.querySelector('[data-skill="5"] .bm-skill-ativa');
		ativa.checked = false;
		ativa.dispatchEvent(new Event('change'));
		expect(config.skills.porSkill['5'].ativa).toBe(false);
		const sel = secao.querySelector('.bm-escopo');
		sel.value = '1002';
		sel.dispatchEvent(new Event('change'));
		expect(escopo).toBe(1002);
		const li = secao.querySelector('[data-skill="5"]');
		expect(li.classList.contains('is-filtrada')).toBe(true);
		expect(li.querySelector('.bm-skill-motivo').textContent).toBe('desligada');
		// Herdando, a lista do monstro e so leitura.
		expect(li.querySelector('.bm-remove')).toBeNull();
		expect(secao.querySelector('.bm-adicionar').hidden).toBe(true);
	});

	it('lista propria comeca VAZIA (nunca copia a geral) e volta a herdar sem sobra', () => {
		desenhar();
		secao.querySelector('.bm-add').click();
		escopo = 1113;
		desenhar();
		const propria = secao.querySelector('.bm-usar-propria');
		propria.checked = true;
		propria.dispatchEvent(new Event('change'));
		expect(config.skills.porMonstro['1113']).toEqual({ herdar: false, lista: [] });
		secao.querySelector('.bm-add').click();
		expect(config.skills.porMonstro['1113'].lista.map(e => e.skillId)).toEqual([5]);
		expect(config.skills.geral.map(e => e.skillId)).toEqual([5]);
		propria.checked = false;
		propria.dispatchEvent(new Event('change'));
		expect(config.skills.porMonstro['1113']).toBeUndefined();
	});

	it('o escopo por skill restringe a especies e marca "fora do escopo" no monstro de fora', () => {
		desenhar();
		secao.querySelector('.bm-add').click();
		const caixas = secao.querySelectorAll('[data-skill="5"] .bm-skill-escopo input');
		caixas[0].checked = false; // "Todos"
		caixas[0].dispatchEvent(new Event('change'));
		expect(config.skills.porSkill['5'].especies).toEqual([]);
		const poring = secao.querySelectorAll('[data-skill="5"] .bm-skill-escopo input')[1];
		poring.checked = true;
		poring.dispatchEvent(new Event('change'));
		expect(config.skills.porSkill['5'].especies).toEqual([1002]);
		escopo = 1113;
		desenhar();
		expect(secao.querySelector('[data-skill="5"] .bm-skill-motivo').textContent).toBe('fora do escopo deste monstro');
	});

	it('o teto da lista desliga o Adicionar', () => {
		desenharEditorDeSkills(
			secao,
			{ config, skills: SKILLS, monstros: MONSTROS, escopo: 'geral', teto: { geral: 1, porMonstro: 1 } },
			fn => {
				config = fn(config);
			},
			() => {}
		);
		secao.querySelector('.bm-add').click();
		desenharEditorDeSkills(
			secao,
			{ config, skills: SKILLS, monstros: MONSTROS, escopo: 'geral', teto: { geral: 1, porMonstro: 1 } },
			() => {},
			() => {}
		);
		expect(secao.querySelector('.bm-add').disabled).toBe(true);
	});
});
