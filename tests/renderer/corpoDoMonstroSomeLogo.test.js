/**
 * O CORPO DO MONSTRO MORTO SOME LOGO (bug #9 de 13/10/2026).
 *
 * Relato: "depois de morrer, o corpo permanece no chao por bastante tempo;
 * confunde quais alvos ainda estao vivos". O servidor manda o VANISH de morte
 * 250 ms depois do golpe fatal; o corpo ficava 5 s em fade porque o roBrowser
 * punha `remove_delay = 5000` no `VT.DEAD`. Ver `Renderer/Entity/tempoDoCorpo.js`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FADE_DO_CORPO_DO_MONSTRO_MS, FADE_DO_CORPO_DO_ROBROWSER_MS, fadeDoCorpo } from 'Renderer/Entity/tempoDoCorpo.js';

describe('o tempo do corpo de quem morreu', () => {
	it('o MONSTRO some em 1,5 s (antes 5 s)', () => {
		expect(fadeDoCorpo({ ehJogador: false, ehWug: false, ehMonstro: true })).toBe(1500);
		expect(FADE_DO_CORPO_DO_MONSTRO_MS).toBeLessThan(FADE_DO_CORPO_DO_ROBROWSER_MS);
	});

	it('jogador e wug nao somem; os outros tipos mantem os 5 s do roBrowser', () => {
		expect(fadeDoCorpo({ ehJogador: true, ehWug: false, ehMonstro: false })).toBeNull();
		expect(fadeDoCorpo({ ehJogador: false, ehWug: true, ehMonstro: false })).toBeNull();
		expect(fadeDoCorpo({ ehJogador: false, ehWug: false, ehMonstro: false })).toBe(5000);
	});

	it('o VT.DEAD da entidade usa a regra (e nao o 5000 cravado)', () => {
		const fonte = readFileSync('src/Renderer/Entity/Entity.js', 'utf8').replace(/\r\n/g, '\n');
		const ramo = fonte.slice(fonte.indexOf('case Entity.VT.DEAD: {'), fonte.indexOf('// Effects are added in onEntityVanish'));
		expect(ramo.length).toBeGreaterThan(0);
		expect(ramo).toContain('fadeDoCorpo({ ehJogador: is_pc, ehWug: is_wug, ehMonstro: this.objecttype === Entity.TYPE_MOB })');
		expect(ramo).toContain('this.remove_delay = fade;');
		expect(ramo).not.toContain('this.remove_delay = 5000;');
	});
});
