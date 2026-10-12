import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import PathFinding from '../../src/Utils/PathFinding.js';
import {
	MAX_WALK_PATH,
	PASSOS_SEM_RETA_LIVRE,
	TEXTO_LONGE_DEMAIS,
	caminhoCabeNoTetoDoServidor,
	linhaDeVisaoLivre
} from '../../src/Engine/MapEngine/tetoDaCaminhadaDaSkill.js';

/*
 * C19 (auditoria de tela, 29/09/2026): a skill no alvo distante ficava armada
 * em Session.moveAction para um andar que o servidor recusa calado
 * (unit.cpp:855-869). O cliente confere o mesmo teto e avisa.
 */
const WALKABLE = 1 << 1;
const livre = () => false;

function mapaAberto(largura, altura, paredes = []) {
	const cells = new Uint32Array(largura * altura).fill(WALKABLE);
	for (const [x, y] of paredes) {
		cells[x + y * largura] = 0;
	}
	PathFinding.setGat({ width: largura, height: altura, cells, types: { NONE: 0, WALKABLE, SNIPABLE: 1 << 3 } });
	return (x, y) => !(cells[x + y * largura] & WALKABLE);
}

describe('teto da caminhada da skill (C19)', () => {
	it('os numeros da fonte: max_walk_path 17 e 14 sem a reta', () => {
		expect(MAX_WALK_PATH).toBe(17);
		expect(PASSOS_SEM_RETA_LIVRE).toBe(14);
	});

	it('17 passos cabem, 18 nao (count conta a origem)', () => {
		const o = { x: 0, y: 0 };
		expect(caminhoCabeNoTetoDoServidor(18, o, { x: 17, y: 0 }, livre)).toBe(true);
		expect(caminhoCabeNoTetoDoServidor(19, o, { x: 18, y: 0 }, livre)).toBe(false);
	});

	it('de 15 a 17 passos so com a reta livre; ate 14 com parede no meio passa', () => {
		const o = { x: 0, y: 0 };
		const paredeEm5 = (x, y) => x === 5 && y === 0;
		expect(caminhoCabeNoTetoDoServidor(16, o, { x: 15, y: 0 }, livre)).toBe(true);
		expect(caminhoCabeNoTetoDoServidor(16, o, { x: 15, y: 0 }, paredeEm5)).toBe(false);
		expect(caminhoCabeNoTetoDoServidor(15, o, { x: 14, y: 0 }, paredeEm5)).toBe(true);
	});

	it('a reta (path_search_long): origem e destino nao contam, a celula do meio sim', () => {
		expect(linhaDeVisaoLivre({ x: 0, y: 0 }, { x: 4, y: 2 }, livre)).toBe(true);
		expect(linhaDeVisaoLivre({ x: 0, y: 0 }, { x: 4, y: 0 }, (x, y) => x === 2 && y === 0)).toBe(false);
		expect(linhaDeVisaoLivre({ x: 0, y: 0 }, { x: 4, y: 0 }, (x, y) => (x === 0 || x === 4) && y === 0)).toBe(true);
		// A troca de ponta (dx < 0) mede a mesma reta.
		expect(linhaDeVisaoLivre({ x: 4, y: 0 }, { x: 0, y: 4 }, (x, y) => x === 3 && y === 1)).toBe(false);
		// Reta mais alta que larga: o peso e o dy.
		expect(linhaDeVisaoLivre({ x: 0, y: 0 }, { x: 1, y: 4 }, (x, y) => x === 0 && y === 2)).toBe(false);
		expect(linhaDeVisaoLivre({ x: 0, y: 0 }, { x: 1, y: 4 }, (x, y) => x === 1 && y === 1)).toBe(true);
		expect(linhaDeVisaoLivre({ x: 4, y: 3 }, { x: 0, y: 0 }, (x, y) => x === 2 && y === 1)).toBe(
			linhaDeVisaoLivre({ x: 0, y: 0 }, { x: 4, y: 3 }, (x, y) => x === 2 && y === 1)
		);
	});

	it('o PathFinding do cliente acha caminho alem do teto (a assimetria que pendurava)', () => {
		const naoAndavel = mapaAberto(80, 80);
		const out = [];
		// Alvo a 25 celulas em reta, alcance 1 (+1 do cliente).
		const count = PathFinding.search(10, 10, 35, 10, 2, out);
		expect(count - 1).toBeGreaterThan(MAX_WALK_PATH);
		const destino = { x: out[(count - 1) * 2], y: out[(count - 1) * 2 + 1] };
		expect(caminhoCabeNoTetoDoServidor(count, { x: 10, y: 10 }, destino, naoAndavel)).toBe(false);
		// E perto: cabe.
		const perto = [];
		const c2 = PathFinding.search(10, 10, 20, 10, 2, perto);
		expect(caminhoCabeNoTetoDoServidor(c2, { x: 10, y: 10 }, { x: perto[(c2 - 1) * 2], y: perto[(c2 - 1) * 2 + 1] }, naoAndavel)).toBe(true);
	});

	it('o aviso e em portugues, com acento', () => {
		expect(TEXTO_LONGE_DEMAIS).toMatch(/longe demais/);
		expect(TEXTO_LONGE_DEMAIS).toMatch(/está/);
	});

	it('Skill.js confere o teto ANTES de armar o moveAction, nos dois caminhos, e avisa', () => {
		const src = fs.readFileSync('src/Engine/MapEngine/Skill.js', 'utf8').replace(/\r\n/g, '\n');
		expect(src).toMatch(/if \(caminhoCabeNoTetoDoServidor\(count, origem, destino, naoAndavel\)\) \{\n\t\treturn true;\n\t\}\n\tChatBox\.addText\(TEXTO_LONGE_DEMAIS/);
		expect(src).toMatch(/if \(!isHomun && !isMerc && !caminhoDaSkillCabe\(entity\.position, out, count\)\) \{\n\t\treturn;\n\t\}\n\n\t\/\/ Save the packet\n\tSession\.moveAction = pkt;/);
		expect(src).toMatch(/if \(!isHomun && !caminhoDaSkillCabe\(pos, out, count\)\) \{\n\t\treturn;\n\t\}\n\n\t\/\/ Save the packet\n\tSession\.moveAction = pkt;/);
		expect(src.match(/Session\.moveAction = pkt;/g)).toHaveLength(2);
	});
});
