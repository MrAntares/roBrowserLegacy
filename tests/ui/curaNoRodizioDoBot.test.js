/**
 * A CURA NO RODIZIO DO BOT (D-2325, 13/10/2026: "Em toda a linha do acolito: adicionar as habilidades de cura no menu
 * de skills de ataque para mortos-vivos"). O servidor ja aceitava a Cura na lista ofensiva (12/10), mas o rodizio da
 * secao Ataque so oferecia `aceita && !suporte`: a Cura vem com `suporte: 'cura'` (ela segue no Suporte) e sumia do
 * menu. Aqui, no DOM do jsdom: a Cura e o Santuario aparecem nas "outras" com o aviso de contra quem saem, o "+ Usar"
 * os poe no rodizio, a linha do rodizio repete o aviso, e o buff e a cura que nao fere continuam fora.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { desenharRodizio } from 'UI/Components/BotMenu/editorDoRodizio.js';

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

const SKILLS = [
	{ skillId: 28, chave: 'AL_HEAL', nome: 'Curar', aprendido: 10, aceita: true, suporte: 'cura', alcancaGrupo: true, soContra: 'morto-vivo' },
	{ skillId: 70, chave: 'PR_SANCTUARY', nome: 'Santuário', aprendido: 7, aceita: true, suporte: null, alcancaGrupo: false, soContra: 'impuro' },
	{ skillId: 156, chave: 'PR_HOLYLIGHT', nome: 'Luz Divina', aprendido: 1, aceita: true, suporte: null, alcancaGrupo: false, soContra: null },
	{ skillId: 34, chave: 'AL_BLESSING', nome: 'Bênção', aprendido: 10, aceita: false, suporte: 'buff', alcancaGrupo: true, soContra: null },
	{ skillId: 142, chave: 'NV_FIRSTAID', nome: 'Primeiros Socorros', aprendido: 1, aceita: false, suporte: 'cura', alcancaGrupo: false, soContra: null },
	{ skillId: 8, chave: 'AL_RUWACH', nome: 'Revelação', aprendido: 1, aceita: false, suporte: null, alcancaGrupo: false, soContra: null }
];

let raiz;
let config;

function desenhar() {
	desenharRodizio(raiz, { config, skills: SKILLS, teto: 3 }, fn => {
		config = fn(config);
		desenhar();
	});
}

function fora() {
	return [...raiz.querySelectorAll('.bm-rodizio-fora-item')].map(li => ({
		id: Number(li.getAttribute('data-skill')),
		aviso: li.querySelector('.bm-rodizio-so-contra')?.textContent ?? null
	}));
}

beforeEach(() => {
	document.body.innerHTML = html;
	raiz = document.querySelector('[data-secao="ataque"] .bm-rodizio-caixa');
	config = { v: 1, cacar: true, modoDeAtaque: 'skills-e-basico', skills: { geral: [], porSkill: {}, porMonstro: {} } };
});

describe('a cura no rodizio do Bot', () => {
	it('o Santuario aparece nas outras, com o aviso; a Cura NAO (ela tem o cartao proprio, bug #12 do Jhow)', () => {
		desenhar();
		expect(fora()).toEqual([
			{ id: 70, aviso: 'Só contra morto-vivo e Demônio' },
			{ id: 156, aviso: null }
		]);
	});

	it('o buff e a cura que o ataque nao aceita ficam fora; so a que nao e suporte entra no "ainda nao usa"', () => {
		desenhar();
		const ids = fora().map(x => x.id);
		expect(ids).not.toContain(34);
		expect(ids).not.toContain(142);
		const aviso = raiz.querySelector('.bm-rodizio-nao-aceitas').textContent;
		expect(aviso).toContain('Revelação');
		expect(aviso).not.toContain('Bênção');
		expect(aviso).not.toContain('Primeiros Socorros');
	});

	it('o "+ Usar" poe o Santuario no rodizio, e a linha dele repete o aviso', () => {
		desenhar();
		raiz.querySelector('.bm-rodizio-fora-item[data-skill="70"] .bm-rodizio-usar').click();
		expect(config.skills.geral).toEqual([{ skillId: 70, nivel: 'aprendido' }]);
		const linha = raiz.querySelector('.bm-rodizio-item[data-skill="70"]');
		expect(linha).not.toBeNull();
		expect(linha.querySelector('.bm-rodizio-so-contra').textContent).toBe('Só contra morto-vivo e Demônio');
		expect(fora().map(x => x.id)).toEqual([156]);
	});

	it('a linha de um golpe comum no rodizio nao leva aviso', () => {
		config.skills.geral = [{ skillId: 156, nivel: 'aprendido' }];
		desenhar();
		expect(raiz.querySelector('.bm-rodizio-item[data-skill="156"] .bm-rodizio-so-contra')).toBeNull();
	});
});
