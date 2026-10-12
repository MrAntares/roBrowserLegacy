import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MARGEM_MS, criarPedidoAdiado } from '../../src/Engine/MapEngine/pedidoAdiadoPeloGolpe.js';

/*
 * C32 (auditoria de tela, 29/09/2026): o pedido de skill na janela do golpe
 * (`amotionTick`) sumia calado. Agora espera a janela e sai.
 */
describe('pedido de skill na janela do golpe (C32)', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const relogio = () => ({ agendar: (fn, ms) => setTimeout(fn, ms), cancelar: id => clearTimeout(id) });

	it('fora da janela nao adia: o chamador segue e envia', () => {
		const p = criarPedidoAdiado(relogio());
		const repetir = vi.fn();
		expect(p.adiarSeNaJanela(1000, 1000, repetir)).toBe(false);
		expect(p.adiarSeNaJanela(900, 1000, repetir)).toBe(false);
		vi.advanceTimersByTime(5000);
		expect(repetir).not.toHaveBeenCalled();
	});

	it('dentro da janela adia e repete UMA vez quando ela vence', () => {
		const p = criarPedidoAdiado(relogio());
		const repetir = vi.fn();
		expect(p.adiarSeNaJanela(1500, 1000, repetir)).toBe(true);
		expect(p.temPendente()).toBe(true);
		vi.advanceTimersByTime(500 + MARGEM_MS - 1);
		expect(repetir).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(repetir).toHaveBeenCalledTimes(1);
		expect(p.temPendente()).toBe(false);
	});

	it('o clique novo substitui o que esperava', () => {
		const p = criarPedidoAdiado(relogio());
		const primeiro = vi.fn();
		const segundo = vi.fn();
		p.adiarSeNaJanela(1500, 1000, primeiro);
		p.adiarSeNaJanela(1500, 1200, segundo);
		vi.advanceTimersByTime(2000);
		expect(primeiro).not.toHaveBeenCalled();
		expect(segundo).toHaveBeenCalledTimes(1);
	});

	it('Skill.js nao tem mais o return mudo da janela do golpe nos dois caminhos', () => {
		const src = fs.readFileSync('src/Engine/MapEngine/Skill.js', 'utf8');
		expect(src).not.toMatch(/amotionTick > Renderer\.tick\)\s*\{\s*\/\/ Can't spam skills faster than amotion\s*return;/);
		expect(src.match(/_pedidoNoGolpe\.adiarSeNaJanela\(/g)).toHaveLength(2);
		// lote 8 (C-4): o slot e POR ATOR, a chamada passa o `entity.GID` na frente
		expect(src).toMatch(/adiarSeNaJanela\(entity\.GID, entity\.amotionTick, Renderer\.tick, \(\) =>\s*onUseSkill\(id, level, targetID\)/);
		expect(src).toMatch(/SkillTargetSelection\.onUseSkillToPos\(id, level, x, y\)/);
	});
});
