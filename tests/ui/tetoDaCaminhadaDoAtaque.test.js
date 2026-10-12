import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import PathFinding from '../../src/Utils/PathFinding.js';
import {
	MAX_WALK_PATH,
	TEXTO_LONGE_DEMAIS_PARA_ATACAR,
	caminhoDoPathFindingCabe
} from '../../src/Engine/MapEngine/tetoDaCaminhadaDaSkill.js';

/*
 * Lote 5 (30/09/2026): o ATAQUE no monstro longe ficava armado em
 * Session.moveAction para um andar que o servidor recusa calado
 * (unit.cpp:855-869, max_walk_path 17; 14 sem a reta livre). Os tres
 * caminhos do clique (mouse, botao do celular, joystick) conferem o teto.
 */
const WALKABLE = 1 << 1;

function mapaAberto(largura, altura, paredes = []) {
	const cells = new Uint32Array(largura * altura).fill(WALKABLE);
	for (const [x, y] of paredes) {
		cells[x + y * largura] = 0;
	}
	PathFinding.setGat({ width: largura, height: altura, cells, types: { NONE: 0, WALKABLE, SNIPABLE: 1 << 3 } });
	return (x, y) => !(cells[x + y * largura] & WALKABLE);
}

describe('teto da caminhada do ATAQUE (lote 5)', () => {
	it('o caminho do PathFinding alem de 17 passos nao cabe; perto cabe', () => {
		const naoAndavel = mapaAberto(80, 80);
		const longe = [];
		// Alvo a 25 celulas em reta, attack_range 1 (+1 do cliente).
		const c1 = PathFinding.search(10, 10, 35, 10, 2, longe);
		expect(c1 - 1).toBeGreaterThan(MAX_WALK_PATH);
		expect(caminhoDoPathFindingCabe([10, 10], longe, c1, naoAndavel)).toBe(false);
		const perto = [];
		const c2 = PathFinding.search(10, 10, 20, 10, 2, perto);
		expect(caminhoDoPathFindingCabe([10, 10], perto, c2, naoAndavel)).toBe(true);
	});

	it('o destino e a ULTIMA celula de out, e a origem vem truncada da posicao', () => {
		// 16 passos em reta, com uma parede no meio da reta ate o destino: nao cabe.
		const out = [];
		for (let i = 0; i <= 16; i++) {
			out.push(i, 0);
		}
		const paredeEm5 = (x, y) => x === 5 && y === 0;
		expect(caminhoDoPathFindingCabe([0.7, 0.2], out, 17, paredeEm5)).toBe(false);
		expect(caminhoDoPathFindingCabe([0.7, 0.2], out, 17, () => false)).toBe(true);
		// Com a mesma parede, 14 passos passam (o teto sem reta).
		expect(caminhoDoPathFindingCabe([0, 0], out, 15, paredeEm5)).toBe(true);
		// A origem conta: saindo de 4,0 a reta ate 16,0 ainda cruza a parede em 5,0.
		expect(caminhoDoPathFindingCabe([4.9, 0], out, 17, paredeEm5)).toBe(false);
		// E saindo de 6,0 ja nao cruza.
		expect(caminhoDoPathFindingCabe([6, 0], out, 17, paredeEm5)).toBe(true);
	});

	it('o aviso e em portugues, com acento, e fala de atacar', () => {
		expect(TEXTO_LONGE_DEMAIS_PARA_ATACAR).toMatch(/longe demais/);
		expect(TEXTO_LONGE_DEMAIS_PARA_ATACAR).toMatch(/está/);
		expect(TEXTO_LONGE_DEMAIS_PARA_ATACAR).toMatch(/até/);
		expect(TEXTO_LONGE_DEMAIS_PARA_ATACAR).toMatch(/atacar/);
	});

	const confere = (arquivo, quemAnda) => {
		const src = fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n');
		const guarda =
			'if (!caminhoDoPathFindingCabe(' +
			quemAnda +
			'.position, out, count, naoAndavelNoMapa)) {\n' +
			'ChatBox.addText(TEXTO_LONGE_DEMAIS_PARA_ATACAR, ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);\n' +
			'return true;\n' +
			'}\n';
		const semTabs = src.replace(/\n\t+/g, '\n');
		const i = semTabs.indexOf(guarda);
		expect(i, arquivo).toBeGreaterThan(-1);
		// A guarda vem logo ANTES do unico `Session.moveAction = pkt;` do ataque.
		const depois = semTabs.slice(i + guarda.length);
		expect(depois.replace(/^\n(\/\/ Move to entity\n)?/, '').startsWith('Session.moveAction = pkt;'), arquivo).toBe(true);
		expect(src).toContain(
			'const naoAndavelNoMapa = (x, y) => !(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE);'
		);
	};

	it('EntityControl.onFocus confere o teto ANTES de armar o ataque', () => {
		confere('src/Controls/EntityControl.js', 'main');
	});
	it('MobileUI.attackTargeted confere o teto ANTES de armar o ataque', () => {
		confere('src/UI/Components/MobileUI/MobileUI.js', 'main');
	});
	it('JoystickCharacterControl.attack confere o teto ANTES de armar o ataque', () => {
		confere('src/UI/Components/JoystickUI/JoystickCharacterControl.js', 'Player');
	});
});
