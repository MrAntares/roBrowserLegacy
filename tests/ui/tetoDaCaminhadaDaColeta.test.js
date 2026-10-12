import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TEXTO_LONGE_DEMAIS_PARA_PEGAR } from '../../src/Engine/MapEngine/tetoDaCaminhadaDaSkill.js';

/*
 * Lote 5, segunda rodada (30/09/2026): a COLETA do item longe ficava armada em
 * Session.moveAction para um andar que o servidor recusa calado
 * (unit.cpp:855-869, max_walk_path 17; 14 sem a reta livre). O cliente mede o
 * caminho ate a celula do CZ_REQUEST_MOVE e confere o mesmo teto do ataque.
 */
describe('teto da caminhada da COLETA (lote 5)', () => {
	it('o aviso e em portugues, com acento, e fala do item', () => {
		expect(TEXTO_LONGE_DEMAIS_PARA_PEGAR).toMatch(/longe demais/);
		expect(TEXTO_LONGE_DEMAIS_PARA_PEGAR).toMatch(/está/);
		expect(TEXTO_LONGE_DEMAIS_PARA_PEGAR).toMatch(/pegá-lo/);
	});

	it('EntityControl.onMouseDown confere o teto ANTES de armar a coleta, na celula do CZ_REQUEST_MOVE', () => {
		const src = fs.readFileSync('src/Controls/EntityControl.js', 'utf8').replace(/\r\n/g, '\n').replace(/\n\t+/g, '\n');
		const guarda = [
			'const passos = PathFinding.search(',
			'Session.Entity.position[0] | 0,',
			'Session.Entity.position[1] | 0,',
			'Mouse.world.x | 0,',
			'Mouse.world.y | 0,',
			'0,',
			'caminho',
			');',
			'if (passos && !caminhoDoPathFindingCabe(Session.Entity.position, caminho, passos, naoAndavelNoMapa)) {',
			'ChatBox.addText(TEXTO_LONGE_DEMAIS_PARA_PEGAR, ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);',
			'return true;',
			'}',
			'',
			'Session.moveAction = pkt;',
			''
		].join('\n');
		const i = src.indexOf(guarda);
		expect(i).toBeGreaterThan(-1);
		// A celula medida e a mesma do CZ_REQUEST_MOVE da coleta, logo depois.
		const depois = src.slice(i + guarda.length);
		const destino = depois.indexOf('pkt.dest[0] = Mouse.world.x;');
		expect(destino).toBeGreaterThan(-1);
		expect(destino).toBeLessThan(depois.indexOf('return true;'));
	});
});
