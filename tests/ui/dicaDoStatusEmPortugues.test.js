import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import StatusTable from 'DB/Status/StatusInfo.js';
import SC from 'DB/Status/StatusConst.js';
import SkillInfo from 'DB/Skills/SkillInfo.js';
import { getStatusLabel } from 'UI/Components/StatusIcons/statusTiming.js';
import PT_BR from 'DB/Status/StatusInfoPtBr.js';
import { nomeDaHabilidadeParaOJogador } from 'DB/Skills/SkillNamePtBr.js';

/*
 * C1 e C1b (auditoria de tela, 29/09/2026): a dica da barra de atalhos e a dica
 * do icone de status saiam em ingles.
 *
 * EFST_ENVIADOS e a lista de EFST de `EFST_POR_STATUS` em
 * `servidor/mapa/status-no-fio.ts` (repo do servidor) em 29/09/2026. Status novo
 * no servidor: acrescente o numero aqui e a traducao em `StatusInfoPtBr.js`.
 */
const EFST_ENVIADOS = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,29,30,31,43,44,45,50,51,52,53,54,55,56,57,58,59,62,63,65,68,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,86,87,88,90,91,92,93,95,98,99,103,104,105,112,113,114,115,116,120,124,132,188,189,197,198,199,200,201,286,302,473,1089];

function linhasDaDica(id) {
	const d = StatusTable[id] && StatusTable[id].descript;
	return d && d.length ? d.map(l => l[0]) : [getStatusLabel(SC, id)];
}

describe('dica do icone de status em portugues (C1b)', () => {
	it('toda linha de todo status que o servidor manda tem traducao', () => {
		const faltando = [];
		for (const id of EFST_ENVIADOS) {
			for (const linha of linhasDaDica(id)) {
				// linha so com o marcador do relogio nao tem texto a traduzir
				if (/^[%s ()\d.:-]*$/.test(linha)) continue;
				if (!Object.prototype.hasOwnProperty.call(PT_BR, linha)) faltando.push(`${id}: ${linha}`);
			}
		}
		expect(faltando).toEqual([]);
	});

	it('o Contra-Ataque (sem descricao no StatusInfo) sai pelo nome da habilidade', () => {
		expect(linhasDaDica(SC.AUTOCOUNTER)).toEqual(['Autocounter']);
		expect(PT_BR.Autocounter).toBe('Contra-Ataque');
	});
});

describe('dica da barra de atalhos em portugues (C1)', () => {
	const shortcut = fs.readFileSync('src/UI/Components/ShortCut/ShortCut.js', 'utf8');

	it('as duas dicas de habilidade leem o nome do jogador, nunca o SkillName ingles', () => {
		expect(shortcut).not.toMatch(/SkillInfo\[[^\]]+\]\.SkillName/);
		expect(shortcut.match(/name = nomeDaHabilidadeParaOJogador\(/g)).toHaveLength(2);
		expect(shortcut).toMatch(/import \{ nomeDaHabilidadeParaOJogador \} from 'DB\/Skills\/SkillNamePtBr\.js'/);
	});

	it('o nome do jogador e o portugues da tabela (Bash vira Golpe Fulminante)', () => {
		const bash = Object.keys(SkillInfo).find(id => SkillInfo[id].Name === 'SM_BASH');
		expect(nomeDaHabilidadeParaOJogador(Number(bash))).toBe('Golpe Fulminante');
	});
});
