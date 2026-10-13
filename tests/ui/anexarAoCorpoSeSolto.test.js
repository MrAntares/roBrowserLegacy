import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { anexarAoCorpoSeSolto } from 'UI/anexarAoCorpoSeSolto.js';

/*
 * O BOTAO DE LEVEL UP SO ENTRA NO BODY QUANDO ESTA FORA DELE (D-2374).
 *
 * `Equipment.onLevelUp` (chamado no CLEVEL) e `SkillList.onLevelUp` (no
 * JOBLEVEL) faziam `document.body.appendChild(botao)` a cada `ZC_PAR_CHANGE` —
 * e o servidor reenvia o nivel a cada ficha suja do tique. Contagem:
 *
 *   ANTES (a3ebe0fe): 5 reenvios do nivel -> 5 `appendChild` no body.
 *   DEPOIS: 5 reenvios -> 1 (o primeiro, com o botao solto); 0 se ja estava la.
 */

const ler = nome => readFileSync(join(process.cwd(), 'src', nome), 'utf8');

afterEach(() => {
	vi.restoreAllMocks();
	document.body.innerHTML = '';
});

describe('anexarAoCorpoSeSolto', () => {
	it('cinco reenvios anexam UMA vez', () => {
		const botao = document.createElement('button');
		const anexar = vi.spyOn(document.body, 'appendChild');
		for (let i = 0; i < 5; ++i) {
			anexarAoCorpoSeSolto(botao);
		}
		expect(anexar).toHaveBeenCalledTimes(1);
		expect(botao.parentNode).toBe(document.body);
	});

	it('o botao que o jogador clicou (removido) volta no proximo nivel, como antes', () => {
		const botao = document.createElement('button');
		expect(anexarAoCorpoSeSolto(botao)).toBe(true);
		botao.remove();
		expect(anexarAoCorpoSeSolto(botao)).toBe(true);
		expect(botao.parentNode).toBe(document.body);
	});

	it('o botao que mora noutro pai (dentro da janela) vai para o body', () => {
		const janela = document.createElement('div');
		document.body.appendChild(janela);
		const botao = document.createElement('button');
		janela.appendChild(botao);
		expect(anexarAoCorpoSeSolto(botao)).toBe(true);
		expect(botao.parentNode).toBe(document.body);
	});

	it('sem botao nao faz nada', () => {
		const anexar = vi.spyOn(document.body, 'appendChild');
		expect(anexarAoCorpoSeSolto(null)).toBe(false);
		expect(anexarAoCorpoSeSolto(undefined)).toBe(false);
		expect(anexar).not.toHaveBeenCalled();
	});
});

describe('as duas janelas usam o ajudante, e nao o appendChild cru', () => {
	/*
	 * Contar pelo texto e o jeito barato: levantar a janela de Equipamento ou de
	 * Habilidades de verdade arrasta o cliente inteiro. Se alguem devolver o
	 * `document.body.appendChild(_btnLevelUp)`, o reenvio volta a mexer no DOM.
	 */
	for (const arquivo of ['UI/Components/Equipment/EquipmentCommon.js', 'UI/Components/SkillList/SkillListCommon.js']) {
		it(arquivo, () => {
			const fonte = ler(arquivo);
			const inicio = fonte.indexOf('Component.onLevelUp = function onLevelUp()');
			expect(inicio).toBeGreaterThan(-1);
			const corpo = fonte.slice(inicio, fonte.indexOf('\n\t};', inicio));
			expect(corpo).toContain('anexarAoCorpoSeSolto(_btnLevelUp)');
			expect(corpo).not.toContain('document.body.appendChild');
		});
	}
});
