import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * Lote 8, OBS-2 (cliente): o JSDoc do C19 (`caminhoDaSkillCabe`) ficou
 * orfao em cima do JSDoc do lote 5 (`armarAlcanceNoFim`): o commit do C47
 * enfiou `armarAlcanceNoFim` e `esperarConfirmacao` entre o comentario e a
 * funcao que ele descreve. So comentario (efeito em runtime zero), mas quem
 * le o editor ou gera a documentacao via a funcao errada.
 */
describe('os JSDoc de Skill.js ficam colados na funcao que descrevem (lote 8, OBS-2)', () => {
	const src = fs.readFileSync('src/Engine/MapEngine/Skill.js', 'utf8').replace(/\r\n/g, '\n');

	/** O bloco de comentario que termina logo acima de `function <nome>(`. */
	const jsdocAcimaDe = nome => {
		const i = src.indexOf(`\nfunction ${nome}(`);
		expect(i).toBeGreaterThan(-1);
		const acima = src.slice(0, i + 1);
		expect(acima.endsWith(' */\n')).toBe(true);
		return acima.slice(acima.lastIndexOf('/**'));
	};

	it('nenhum JSDoc fecha e ja abre outro em seguida', () => {
		expect(src).not.toMatch(/\*\/\n\/\*\*/);
	});

	it('o do C19 descreve caminhoDaSkillCabe e fica logo acima dela', () => {
		const bloco = jsdocAcimaDe('caminhoDaSkillCabe');
		expect(bloco).toContain('C19 (auditoria de tela, 29/09/2026)');
		expect(bloco).toContain('@param {Array} pos');
		expect(bloco).toContain('@param {number} count');
		expect(bloco).toContain('@returns {boolean}');
	});

	it('o do lote 5 fica logo acima de armarAlcanceNoFim', () => {
		const bloco = jsdocAcimaDe('armarAlcanceNoFim');
		expect(bloco).toContain('Lote 5 (resto do C23)');
		expect(bloco).toContain('@param {number} alcance');
		expect(bloco).not.toContain('C19 (auditoria');
	});

	it('o do C47 fica logo acima de esperarConfirmacao', () => {
		const bloco = jsdocAcimaDe('esperarConfirmacao');
		expect(bloco).toContain('C47 (auditoria de tela, 30/09/2026)');
		expect(bloco).toContain('@param {object} pacote');
	});

	it('cada comentario aparece uma vez so (o conserto move, nao duplica)', () => {
		expect(src.match(/C19 \(auditoria de tela, 29\/09\/2026\): o caminho ate o alcance cabe/g)).toHaveLength(1);
		expect(src.match(/Lote 5 \(resto do C23\): guarda, junto do/g)).toHaveLength(1);
	});
});
