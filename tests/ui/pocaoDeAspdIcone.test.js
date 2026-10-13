/**
 * O ICONE DA POCAO DE ASPD (D-1989, 05/10/2026).
 *
 * Relato de jogador: "As pocoes de atkspeed ainda nao consegui ver se ta
 * funcionando, nao tem nenhum indicativo que mostra ela ativa". O servidor
 * passou a mandar o EFST de cada pocao (37, 38 e 39, `EFST_ATTHASTE_POTION1..3`
 * do `db/pre-re/status.yml:683-704`); aqui o cliente tem de ter a entrada com
 * arte, relogio e a dica em portugues.
 */
import { describe, expect, it } from 'vitest';
import StatusConst from 'DB/Status/StatusConst.js';
import StatusInfo from 'DB/Status/StatusInfo.js';
import { emPortugues } from 'DB/Status/StatusInfoPtBr.js';

describe('as pocoes de ASPD na barra de status', () => {
	it.each([
		[37, 'ATTHASTE_POTION1', 'Poção da Concentração'],
		[38, 'ATTHASTE_POTION2', 'Poção do Despertar'],
		[39, 'ATTHASTE_POTION3', 'Poção da Fúria Selvagem']
	])('EFST %i (%s): icone, relogio e dica em portugues', (efst, nome, titulo) => {
		expect(StatusConst[nome]).toBe(efst);
		const info = StatusInfo[efst];
		expect(info, String(efst)).toBeTruthy();
		expect(typeof info.icon).toBe('string');
		expect(info.icon.length).toBeGreaterThan(0);
		expect(info.haveTimeLimit).toBe(1);
		/* A linha do relogio e a que tem o `%s` (`StatusIcons.js` a troca pelo
		   tempo); o `posTimeLimitStr` do upstream nao e lido, e o da Furia aponta
		   a linha errada. */
		expect(info.descript.some(l => l[0] === '%s')).toBe(true);
		expect(emPortugues(info.descript[0][0])).toBe(titulo);
		info.descript.slice(1).forEach(l => {
			if (l[0] !== '%s') {
				expect(emPortugues(l[0])).toBe('Aumenta a velocidade de ataque');
			}
		});
	});
});
