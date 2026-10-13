/**
 * COM 90% DO PESO O CLIQUE ATACA (13/10/2026, R119, D-2324 — regra do dono).
 *
 * "Remover o personagem nao ataca com peso 90%, antes da att ele atacava porem
 * nao pegava looting." O cliente oficial recusa o clique de ataque e a
 * habilidade de chao com a mensagem 243 quando o `SC_WEIGHT90` esta aceso
 * (`isOverWeight`); aqui so a coleta automatica para, e quem decide e o
 * servidor (`pesoGraveBarraAAcao`). Le o fonte sem comentarios: a recusa
 * comentada nao conta.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const semComentario = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CONTROLE = semComentario(readFileSync('src/Controls/EntityControl.js', 'utf8'));
const SKILL = semComentario(readFileSync('src/Engine/MapEngine/Skill.js', 'utf8'));

function trecho(fonte, ancora, tamanho) {
	const i = fonte.indexOf(ancora);
	expect(i, `nao achei "${ancora}" - reancore`).toBeGreaterThan(-1);
	return fonte.slice(i, i + tamanho);
}

describe('peso grave (90%) no cliente: o clique ataca (R119)', () => {
	it('o clique de ataque no mob nao recusa pelo peso, e segue mandando o REQUEST_ACT', () => {
		const clique = trecho(CONTROLE, 'main.attack_range + 1,', 1200);
		expect(clique).toContain('pkt.action = 7;');
		expect(clique).not.toContain('isOverWeight');
		expect(clique).not.toContain('getMessage(243)');
	});

	it('a habilidade de chao nao recusa pelo peso', () => {
		const chao = trecho(SKILL, 'SkillTargetSelection.onUseSkillToPos = function onUseSkillToPos(', 600);
		expect(chao).not.toContain('isOverWeight');
	});

	it('o icone de 90% continua ligando o estado (so a recusa saiu)', () => {
		const ent = semComentario(readFileSync('src/Engine/MapEngine/Entity.js', 'utf8'));
		expect(ent).toContain('entity.isOverWeight = pkt.state;');
	});
});
