import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	CAUSA_CARRINHO,
	CAUSA_ESFERAS,
	CAUSA_NIVEL,
	TEXTO_GERAL,
	textoDaCausaSemMensagem
} from '../../src/Engine/MapEngine/textoDaFalhaDeSkill.js';

/*
 * C3B (auditoria de tela, 29/09/2026): ZC_ACK_TOUSESKILL com causa 0, 57 ou 74
 * deixava o chat vazio. Nenhuma recusa sai muda.
 */
describe('texto da recusa de skill (C3B)', () => {
	it('causa 0 sem NUM: o texto geral; com NUM, o ramo antigo do NUM responde', () => {
		expect(textoDaCausaSemMensagem(CAUSA_NIVEL, 0)).toBe(TEXTO_GERAL);
		expect(textoDaCausaSemMensagem(CAUSA_NIVEL, 3)).toBeNull();
	});

	it('carrinho (57) e esferas (74, com a quantidade do NUM)', () => {
		expect(textoDaCausaSemMensagem(CAUSA_CARRINHO, 0)).toMatch(/carrinho/);
		expect(textoDaCausaSemMensagem(CAUSA_ESFERAS, 5)).toBe('São necessárias 5 esferas espirituais para usar esta habilidade.');
		expect(textoDaCausaSemMensagem(CAUSA_ESFERAS, 0)).toMatch(/esferas espirituais/);
	});

	it('as causas do msgstringtable (1-10, 13, 83) ficam com o switch antigo', () => {
		for (const c of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 83]) {
			expect(textoDaCausaSemMensagem(c, 0), `causa ${c}`).toBeNull();
		}
	});

	it('onSkillResult: o texto proprio antes do switch, e nenhuma causa sem texto fica muda', () => {
		const src = fs.readFileSync('src/Engine/MapEngine/Skill.js', 'utf8').replace(/\r\n/g, '\n');
		expect(src).toMatch(/const textoProprio = pkt\.SKID == SkillId\.CG_TAROTCARD \? null : textoDaCausaSemMensagem\(pkt\.cause, pkt\.NUM\);/);
		expect(src).toMatch(/DB\.getMessage\(error, TEXTO_GERAL\)/);
		expect(src).toMatch(/\} else \{\n\t\t\/\/ C3B: causa sem texto nenhum nao sai muda\.\n\t\tChatBox\.addText\(TEXTO_GERAL,/);
	});
});
