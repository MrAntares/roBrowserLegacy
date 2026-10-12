import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { noAlcanceDoCliente, raioDaBuscaDoChao } from '../../src/Engine/MapEngine/alcanceDaSkillNoChao.js';

/*
 * C23 (auditoria de tela, 29/09/2026): a skill de chao que precisa andar. O
 * cliente parava pela regua euclidiana `alcance + 1` e o servidor conferia com
 * o quadrado. Os dois lados agora usam a regua da fonte:
 * `floor(sqrt(dx*dx + dy*dy) - 0.1) <= alcance` (rAthena path.cpp:485-521).
 */
describe('alcance da skill de chao (C23)', () => {
	it('a regua da fonte: 4 em linha reta cabe no alcance 3; a diagonal 3x3 nao', () => {
		expect(noAlcanceDoCliente(4, 0, 3)).toBe(true);
		expect(noAlcanceDoCliente(5, 0, 3)).toBe(false);
		expect(noAlcanceDoCliente(3, 3, 3)).toBe(false);
		expect(noAlcanceDoCliente(3, 2, 3)).toBe(true);
		expect(noAlcanceDoCliente(4, 1, 3)).toBe(false);
	});

	it('alcance negativo vale 0 (path.cpp:487): so a vizinha em linha reta', () => {
		expect(noAlcanceDoCliente(1, 0, -2)).toBe(true);
		expect(noAlcanceDoCliente(1, 1, -2)).toBe(false);
		expect(noAlcanceDoCliente(0, 0, -2)).toBe(true);
	});

	it('a busca com o raio casa CELULA A CELULA com a regua, alcance 0 a 14', () => {
		for (let a = 0; a <= 14; a++) {
			const raio = raioDaBuscaDoChao(a);
			for (let dx = -20; dx <= 20; dx++) {
				for (let dy = -20; dy <= 20; dy++) {
					expect([a, dx, dy, Math.sqrt(dx * dx + dy * dy) <= raio]).toEqual([a, dx, dy, noAlcanceDoCliente(dx, dy, a)]);
				}
			}
		}
	});

	it('o raio aceita mais que o antigo alcance+1 onde a fonte aceita: (10,1) no alcance 9', () => {
		expect(noAlcanceDoCliente(10, 1, 9)).toBe(true);
		expect(Math.sqrt(101) <= raioDaBuscaDoChao(9)).toBe(true);
		expect(Math.sqrt(101) <= 9 + 1).toBe(false);
	});

	it('onUseSkillToPos (C23) e onUseSkill (C37) medem com o raio da fonte', () => {
		const src = fs.readFileSync('src/Engine/MapEngine/Skill.js', 'utf8');
		const inicioDoChao = src.indexOf('SkillTargetSelection.onUseSkillToPos = function');
		const noAlvo = src.slice(src.indexOf('function onUseSkill(id, level, targetID)'), inicioDoChao);
		const doChao = src.slice(inicioDoChao);
		for (const trecho of [noAlvo, doChao]) {
			expect(trecho).toMatch(/range = raioDaBuscaDoChao\(skill\.attackRange\);/);
			expect(trecho).toMatch(/range = raioDaBuscaDoChao\(SkillInfo\[id\]\.AttackRange\[level - 1\]\);/);
		}
		expect(src.match(/raioDaBuscaDoChao\(/g)).toHaveLength(5); // + a caminhada extra do lote 5 (armarAlcanceNoFim)
	});
});
