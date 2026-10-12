import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	REPETICOES_DA_CAMINHADA,
	decidirNoFimDaCaminhada
} from '../../src/Engine/MapEngine/alcanceNoFimDaCaminhada.js';

/*
 * Lote 5, resto do C23 (30/09/2026): a auditoria de tela mediu o WZ_METEOR
 * (Range 9) saindo a dx 8, dy 6 (circular 10) depois da caminhada, e o
 * servidor calando (battle_check_range, rAthena unit.cpp:2362 e :2695). O
 * cliente re-confere no onWalkEnd com a regua da fonte.
 */
describe('o alcance no fim da caminhada', () => {
	const alvo = { x: 58, y: 56 };

	it('o caso da auditoria: dx 8, dy 6 com alcance 9 CABE na regua da fonte (floor(10 - 0,1) = 9); dx 9, dy 6 nao', () => {
		// sqrt(64 + 36) = 10 -> floor(9,9) = 9 <= 9: a regua da fonte ACEITA 10 exato.
		expect(decidirNoFimDaCaminhada({ pos: [50, 50], alvo, alcance: 9, repeticoes: 0 })).toBe('soltar');
		// Uma celula a mais (dx 9, dy 6: sqrt(117) = 10,8 -> 10) ja fica fora.
		expect(decidirNoFimDaCaminhada({ pos: [49, 50], alvo, alcance: 9, repeticoes: 0 })).toBe('andar');
	});

	it('fora do alcance anda UMA vez; fora de novo, nao solta', () => {
		expect(REPETICOES_DA_CAMINHADA).toBe(1);
		expect(decidirNoFimDaCaminhada({ pos: [40, 50], alvo, alcance: 9, repeticoes: 0 })).toBe('andar');
		expect(decidirNoFimDaCaminhada({ pos: [40, 50], alvo, alcance: 9, repeticoes: 1 })).toBe('desistir');
	});

	it('dentro solta, em qualquer repeticao; a posicao fracionaria arredonda', () => {
		expect(decidirNoFimDaCaminhada({ pos: [55.4, 53.6], alvo, alcance: 3, repeticoes: 0 })).toBe('soltar');
		expect(decidirNoFimDaCaminhada({ pos: [56, 53], alvo, alcance: 3, repeticoes: 1 })).toBe('soltar');
		// 55,6 arredonda para 56 -> dx 2, dy 3 (3,6 -> 3) cabe; 55,4 -> 55 -> dx 3, dy 3 (4,2 -> 4) nao.
		expect(decidirNoFimDaCaminhada({ pos: [55.4, 53], alvo, alcance: 3, repeticoes: 1 })).toBe('desistir');
		expect(decidirNoFimDaCaminhada({ pos: [55.6, 53], alvo, alcance: 3, repeticoes: 1 })).toBe('soltar');
	});

	it('o alvo que sumiu da tela solta, e o servidor decide (como antes)', () => {
		expect(decidirNoFimDaCaminhada({ pos: [0, 0], alvo: null, alcance: 1, repeticoes: 5 })).toBe('soltar');
	});

	it('alcance negativo vale 0 (check_distance_client): so a celula vizinha em linha reta', () => {
		expect(decidirNoFimDaCaminhada({ pos: [57, 56], alvo, alcance: -1, repeticoes: 1 })).toBe('soltar');
		expect(decidirNoFimDaCaminhada({ pos: [57, 55], alvo, alcance: -1, repeticoes: 1 })).toBe('desistir');
	});
});

describe('a costura: o onWalkEnd re-confere e a skill arma o alcance', () => {
	const semTabs = (arquivo) => fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n').replace(/\n\t+/g, '\n');

	it('MapEngine.onWalkEnd decide antes de soltar, anda uma vez e desiste sem soltar', () => {
		const src = semTabs('src/Engine/MapEngine.js');
		const costura = [
			'const pendente = Session.moveActionAlcance;',
			'if (pendente && pendente.pacote === Session.moveAction && Session.Entity) {',
			'const decisao = decidirNoFimDaCaminhada({',
			'pos: Session.Entity.position,',
			'alvo: pendente.alvo(),',
			'alcance: pendente.alcance,',
			'repeticoes: pendente.repeticoes',
			'});',
			"if (decisao === 'andar') {",
			'pendente.repeticoes++;',
			'if (pendente.andar()) {',
			'return;',
			'}',
			'}',
			"if (decisao !== 'soltar') {",
			'Session.moveAction = null;',
			'Session.moveActionAlcance = null;',
			'Session.moveActionEspera = null;',
			'// C47 (C-2): desistir avisa, como a C19 (o `andar()` que nao',
			'// coube no teto ja avisou por conta propria).',
			"if (decisao === 'desistir') {",
			'ChatBox.addText(TEXTO_FORA_DO_ALCANCE, ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);',
			'}',
			'return;',
			'}',
			'}',
			'Network.sendPacket(Session.moveAction);'
		].join('\n');
		expect(src.indexOf(costura)).toBeGreaterThan(-1);
	});

	it('Skill.js arma o alcance da REGUA (e nao o raio da busca) nos dois caminhos', () => {
		const src = semTabs('src/Engine/MapEngine/Skill.js');
		expect(src.split('Session.moveActionAlcance = null;\nif (!isHomun && !isMerc) {\narmarAlcanceNoFim(pkt, alcanceDaRegua, () => {').length).toBe(2);
		expect(src.split('Session.moveActionAlcance = null;\nif (!isHomun) {\narmarAlcanceNoFim(pkt, alcanceDaRegua, () => ({ x: x | 0, y: y | 0 }));').length).toBe(2);
		expect(src.split('alcanceDaRegua = skill.attackRange;').length).toBe(3);
		expect(src.split('alcanceDaRegua = SkillInfo[id].AttackRange[level - 1];').length).toBe(3);
		// A caminhada extra anda ate o raio da busca DA REGUA e respeita o teto (C19).
		expect(src.indexOf('raioDaBuscaDoChao(alcance),\nout,\nAltitude.TYPE.WALKABLE\n);\nif (count < 2 || !caminhoDaSkillCabe(ent.position, out, count)) {\nreturn false;')).toBeGreaterThan(-1);
	});
});
