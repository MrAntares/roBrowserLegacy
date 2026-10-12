import { describe, expect, it } from 'vitest';
import {
	adicionarSkill,
	definirEscopoDaSkill,
	definirNivel,
	definirSkillAtiva,
	herdarGeral,
	lerLista,
	listaEfetiva,
	moverSkill,
	removerSkill,
	usarListaPropria
} from 'UI/Components/BotMenu/edicaoDeSkills.js';

const base = () => ({ v: 1, cacar: true, especiesVetadas: [], modoDeAtaque: 'skills-e-basico', raioDePercepcao: 15, skills: { geral: [], porSkill: {}, porMonstro: {} } });

describe('edicao das listas de skills do Bot', () => {
	it('adiciona na Geral com nivel "aprendido", sem duplicar e respeitando o teto', () => {
		let c = adicionarSkill(base(), 'geral', 5, 2);
		c = adicionarSkill(c, 'geral', 5, 2);
		c = adicionarSkill(c, 'geral', 7, 2);
		c = adicionarSkill(c, 'geral', 9, 2);
		expect(c.skills.geral).toEqual([
			{ skillId: 5, nivel: 'aprendido' },
			{ skillId: 7, nivel: 'aprendido' }
		]);
	});

	it('ordena, fixa nivel e remove (a remocao nao volta)', () => {
		let c = adicionarSkill(adicionarSkill(base(), 'geral', 5), 'geral', 7);
		c = moverSkill(c, 'geral', 7, -1);
		expect(c.skills.geral.map(e => e.skillId)).toEqual([7, 5]);
		expect(moverSkill(c, 'geral', 7, -1)).toBe(c);
		c = definirNivel(c, 'geral', 5, 3);
		expect(c.skills.geral[1]).toEqual({ skillId: 5, nivel: 3 });
		c = removerSkill(c, 'geral', 7);
		expect(c.skills.geral.map(e => e.skillId)).toEqual([5]);
	});

	it('Por Monstro: lista propria nasce VAZIA (nao copia a Geral) e herdar volta a Geral', () => {
		let c = adicionarSkill(base(), 'geral', 5);
		c = usarListaPropria(c, 1002);
		expect(lerLista(c, 1002)).toEqual([]);
		c = adicionarSkill(c, 1002, 7);
		expect(c.skills.porMonstro['1002']).toEqual({ herdar: false, lista: [{ skillId: 7, nivel: 'aprendido' }] });
		c = herdarGeral(c, 1002);
		expect(c.skills.porMonstro).toEqual({});
		expect(lerLista(c, 1002)).toBeNull();
	});

	it('lista efetiva mostra o que o Por Skill filtra, com o motivo, nas duas listas', () => {
		let c = adicionarSkill(adicionarSkill(base(), 'geral', 5), 'geral', 7);
		c = definirSkillAtiva(c, 5, false);
		c = definirEscopoDaSkill(c, 7, [1031]);
		expect(listaEfetiva(c, 1002).map(e => e.filtrada)).toEqual(['desligada', 'fora do escopo']);
		expect(listaEfetiva(c, 1031).map(e => e.filtrada)).toEqual(['desligada', null]);
		c = usarListaPropria(c, 1031);
		c = adicionarSkill(c, 1031, 5);
		expect(listaEfetiva(c, 1031)).toEqual([{ skillId: 5, nivel: 'aprendido', filtrada: 'desligada' }]);
	});

	it('nao muta a config de entrada', () => {
		const c = base();
		adicionarSkill(c, 'geral', 5);
		usarListaPropria(c, 1002);
		expect(c).toEqual(base());
	});
});
