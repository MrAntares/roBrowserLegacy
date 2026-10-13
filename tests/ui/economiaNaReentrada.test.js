/**
 * A ECONOMIA DE ENERGIA NA REENTRADA (F29, auditoria de 22/09/2026).
 *
 * O servidor desarma a economia em toda entrada no mundo. Quem reconectava com
 * a aba ainda oculta ficava sem ela — a tela preta velha aberta, e nenhum
 * `entrar` novo —, e a proxima queda tirava o personagem do mundo na hora.
 *
 * Le o fonte sem comentarios: `MapEngine.js` nao carrega em jsdom.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const semComentario = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
const MOTOR = semComentario(readFileSync('src/Engine/MapEngine.js', 'utf8'));

describe('a reentrada rearma a economia com a aba oculta (F29)', () => {
	const inicio = MOTOR.indexOf('function onConnectionAccepted(pkt) {');
	const corpo = MOTOR.slice(inicio, inicio + 1500);

	it('fecha a tela velha e cancela o atraso pendente', () => {
		expect(inicio).toBeGreaterThan(-1);
		expect(corpo).toContain('fecharTelaDaEconomia();');
		expect(corpo).toContain('_gatilhoDaEconomia.cancelar();');
	});

	it('com a aba oculta, reagenda o entrar pelo MESMO caminho do evento de visibilidade', () => {
		expect(corpo).toContain("if (document.visibilityState === 'hidden') onVisibilidadeMudouParaEconomia();");
	});
});
