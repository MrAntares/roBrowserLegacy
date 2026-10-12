/**
 * N4 da auditoria de tela: a Piada Congelante (BA_FROSTJOKER, id 318) nao ia
 * para a barra porque o mapa nome -> id usava o nome do CLIENTE (BA_FROSTJOKE).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import SK from 'DB/Skills/SkillConst.js';
import {
	APELIDOS_SERVIDOR_PARA_CLIENTE,
	montarMapaNomeParaId,
	nomeNoServidor
} from 'DB/Skills/apelidosDoServidor.js';

const SKILL_DB = 'C:/Users/Administrator/Downloads/Rag-idle/rag-idle-master/Emulador-Serverside Ravena/db/pre-re/skill_db.yml';

describe('apelidos servidor -> cliente (N4)', () => {
	const mapa = montarMapaNomeParaId(SkillInfo);

	it('o nome do servidor e o do cliente dao o mesmo id', () => {
		expect(mapa.get('BA_FROSTJOKER')).toBe(318);
		expect(mapa.get('BA_FROSTJOKE')).toBe(318);
	});

	it('todo apelido aponta para um nome que existe no cliente', () => {
		for (const [srv, cli] of Object.entries(APELIDOS_SERVIDOR_PARA_CLIENTE)) {
			expect(mapa.has(cli), `${srv} -> ${cli}`).toBe(true);
			expect(mapa.get(srv)).toBe(SK[cli]);
		}
	});

	it('caminho de volta: o nome do SkillConst vira o do servidor', () => {
		expect(nomeNoServidor('BA_FROSTJOKE')).toBe('BA_FROSTJOKER');
		expect(nomeNoServidor('MG_COLDBOLT')).toBe('MG_COLDBOLT');
	});

	it.skipIf(!fs.existsSync(SKILL_DB))('todo nome do skill_db pre-re que o cliente conhece acha o id', () => {
		const yml = fs.readFileSync(SKILL_DB, 'utf8');
		const faltam = [];
		for (const m of yml.matchAll(/^ {2}- Id: (\d+)\r?\n {4}Name: (\w+)/gm)) {
			const id = Number(m[1]);
			if (SkillInfo[id] && mapa.get(m[2]) !== id) {
				faltam.push(`${id} ${m[2]}`);
			}
		}
		expect(faltam).toEqual([]);
	});
});

describe('quem monta nome -> id usa o mapa com apelidos (N4)', () => {
	const ler = rel => fs.readFileSync(path.resolve(__dirname, '../../src/UI/Components', rel), 'utf8');

	it('IdleSkills nao monta o mapa so pelo SkillInfo.Name', () => {
		const src = ler('IdleSkills/IdleSkills.js');
		expect(src).toContain('montarMapaNomeParaId(SkillInfo)');
		expect(src).not.toMatch(/\[info\.Name, Number\(numericId\)\]/);
	});
});
