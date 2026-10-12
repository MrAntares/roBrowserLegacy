import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MARGEM_MS, criarPedidosPorAtor } from '../../src/Engine/MapEngine/pedidoAdiadoPeloGolpe.js';
import {
	descartarPedidoGuardado,
	jogadorPediuParaAndar,
	pedidoNoGolpe
} from '../../src/Engine/MapEngine/pedidoGuardado.js';

/*
 * Lote 8, C-4 (cliente): o `_pedidoNoGolpe` era UM slot para o jogador, o
 * homunculo e o mercenario. O clique do homunculo dentro da janela do jogador
 * (ou o contrario) substituia o pedido que esperava, calado: sem pacote e sem
 * mensagem, o sintoma que o C32 dizia consertar. Cada unidade tem o proprio
 * delay: no rAthena o `canact_tick` mora no `unit_data` de cada uma
 * (clif.cpp:12937 jogador, :12776 e :12801 homunculo, :12833 e :12852
 * mercenario; unit.cpp:1972 e :1986), entao uma janela nao anula a outra.
 * Agora ha um slot POR ATOR (`entity.GID`). No mesmo ator o clique novo continua
 * substituindo o velho (o comando mais novo do jogador vale, como o andar novo
 * substitui a aproximacao pendente no cliente oficial).
 */
const JOGADOR = 2000001;
const HOMUNCULO = 2000002;
const MERCENARIO = 2000003;

describe('um pedido guardado POR ATOR (lote 8, C-4)', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const relogio = () => ({ agendar: (fn, ms) => setTimeout(fn, ms), cancelar: id => clearTimeout(id) });

	it('jogador (janela ate 1000, clique em 500) e homunculo (janela ate 900, clique em 600): saem os DOIS', () => {
		const p = criarPedidosPorAtor(relogio());
		const doJogador = vi.fn();
		const doHomunculo = vi.fn();
		expect(p.adiarSeNaJanela(JOGADOR, 1000, 500, doJogador)).toBe(true);
		expect(p.adiarSeNaJanela(HOMUNCULO, 900, 600, doHomunculo)).toBe(true);
		vi.advanceTimersByTime(300 + MARGEM_MS);
		expect(doHomunculo).toHaveBeenCalledTimes(1);
		expect(doJogador).not.toHaveBeenCalled();
		vi.advanceTimersByTime(200);
		expect(doJogador).toHaveBeenCalledTimes(1);
		expect(doHomunculo).toHaveBeenCalledTimes(1);
	});

	it('na ordem contraria (homunculo primeiro, depois jogador) tambem saem os dois', () => {
		const p = criarPedidosPorAtor(relogio());
		const doJogador = vi.fn();
		const doHomunculo = vi.fn();
		p.adiarSeNaJanela(HOMUNCULO, 1500, 1000, doHomunculo);
		p.adiarSeNaJanela(JOGADOR, 1600, 1100, doJogador);
		vi.advanceTimersByTime(2000);
		expect(doHomunculo).toHaveBeenCalledTimes(1);
		expect(doJogador).toHaveBeenCalledTimes(1);
	});

	it('tres atores com janela viva: sai um pedido de cada', () => {
		const p = criarPedidosPorAtor(relogio());
		const saidas = [vi.fn(), vi.fn(), vi.fn()];
		[JOGADOR, HOMUNCULO, MERCENARIO].forEach((ator, i) => p.adiarSeNaJanela(ator, 2000, 1000 + i, saidas[i]));
		vi.advanceTimersByTime(5000);
		saidas.forEach(saida => expect(saida).toHaveBeenCalledTimes(1));
	});

	it('o MESMO ator: o clique novo substitui o que esperava (deliberado, como o C32 fixou)', () => {
		const p = criarPedidosPorAtor(relogio());
		const primeiro = vi.fn();
		const segundo = vi.fn();
		p.adiarSeNaJanela(JOGADOR, 1500, 1000, primeiro);
		p.adiarSeNaJanela(JOGADOR, 1500, 1200, segundo);
		vi.advanceTimersByTime(2000);
		expect(primeiro).not.toHaveBeenCalled();
		expect(segundo).toHaveBeenCalledTimes(1);
	});

	it('o clique de um ator fora da janela dele nao toca no pedido que o outro guardou', () => {
		const p = criarPedidosPorAtor(relogio());
		const doJogador = vi.fn();
		const doHomunculo = vi.fn();
		p.adiarSeNaJanela(JOGADOR, 1500, 1000, doJogador);
		// janela do homunculo ja venceu (900 <= 1000): nao adia e nao guarda nada
		expect(p.adiarSeNaJanela(HOMUNCULO, 900, 1000, doHomunculo)).toBe(false);
		expect(p.temPendente(HOMUNCULO)).toBe(false);
		expect(p.temPendente(JOGADOR)).toBe(true);
		vi.advanceTimersByTime(2000);
		expect(doJogador).toHaveBeenCalledTimes(1);
		expect(doHomunculo).not.toHaveBeenCalled();
	});

	it('cancelar(ator) solta so o pedido daquele ator', () => {
		const p = criarPedidosPorAtor(relogio());
		const doJogador = vi.fn();
		const doHomunculo = vi.fn();
		p.adiarSeNaJanela(JOGADOR, 1500, 1000, doJogador);
		p.adiarSeNaJanela(HOMUNCULO, 1500, 1000, doHomunculo);
		p.cancelar(JOGADOR);
		expect(p.temPendente(JOGADOR)).toBe(false);
		expect(p.temPendente(HOMUNCULO)).toBe(true);
		vi.advanceTimersByTime(2000);
		expect(doJogador).not.toHaveBeenCalled();
		expect(doHomunculo).toHaveBeenCalledTimes(1);
	});

	it('cancelar() sem ator solta TODOS (troca de mapa, morte)', () => {
		const p = criarPedidosPorAtor(relogio());
		const saidas = [vi.fn(), vi.fn(), vi.fn()];
		[JOGADOR, HOMUNCULO, MERCENARIO].forEach((ator, i) => p.adiarSeNaJanela(ator, 1500, 1000, saidas[i]));
		expect(p.temPendente()).toBe(true);
		p.cancelar();
		expect(p.temPendente()).toBe(false);
		vi.advanceTimersByTime(5000);
		saidas.forEach(saida => expect(saida).not.toHaveBeenCalled());
	});

	it('cancelar o ator 0 vale como ator (nao como "todos")', () => {
		const p = criarPedidosPorAtor(relogio());
		const doZero = vi.fn();
		const doJogador = vi.fn();
		p.adiarSeNaJanela(0, 1500, 1000, doZero);
		p.adiarSeNaJanela(JOGADOR, 1500, 1000, doJogador);
		p.cancelar(0);
		vi.advanceTimersByTime(2000);
		expect(doZero).not.toHaveBeenCalled();
		expect(doJogador).toHaveBeenCalledTimes(1);
	});

	it('cancelar sem nada esperando nao faz nada, e o pedido novo depois dele sai', () => {
		const p = criarPedidosPorAtor(relogio());
		p.cancelar();
		p.cancelar(JOGADOR);
		const repetir = vi.fn();
		p.adiarSeNaJanela(JOGADOR, 1500, 1000, repetir);
		vi.advanceTimersByTime(600);
		expect(repetir).toHaveBeenCalledTimes(1);
	});

	it('o pedido que saiu libera o ator: nada fica guardado e um clique novo dele sai de novo', () => {
		const p = criarPedidosPorAtor(relogio());
		const repetir = vi.fn();
		p.adiarSeNaJanela(JOGADOR, 1500, 1000, repetir);
		expect(p.quantos()).toBe(1);
		vi.advanceTimersByTime(600);
		expect(repetir).toHaveBeenCalledTimes(1);
		expect(p.temPendente()).toBe(false);
		expect(p.quantos()).toBe(0);
		p.adiarSeNaJanela(JOGADOR, 3000, 2000, repetir);
		vi.advanceTimersByTime(1100);
		expect(repetir).toHaveBeenCalledTimes(2);
		expect(p.quantos()).toBe(0);
	});

	it('o pedido que, ao sair, cai de novo na janela (golpe armado no meio) espera de novo e sai', () => {
		const p = criarPedidosPorAtor(relogio());
		const saida = vi.fn();
		let vezes = 0;
		const repetir = () => {
			vezes++;
			if (vezes === 1) {
				p.adiarSeNaJanela(JOGADOR, 2500, 1600, repetir);
				return;
			}
			saida();
		};
		p.adiarSeNaJanela(JOGADOR, 1500, 1000, repetir);
		vi.advanceTimersByTime(500 + MARGEM_MS);
		expect(vezes).toBe(1);
		expect(p.temPendente(JOGADOR)).toBe(true);
		vi.advanceTimersByTime(900 + MARGEM_MS);
		expect(vezes).toBe(2);
		expect(saida).toHaveBeenCalledTimes(1);
		expect(p.quantos()).toBe(0);
	});
});

describe('o descarte de quem desiste (lote 8, C-4)', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => {
		pedidoNoGolpe.cancelar();
		vi.useRealTimers();
	});

	const sessao = () => ({
		Entity: { GID: JOGADOR },
		moveAction: { SKID: 83 },
		moveActionAlcance: { alcance: 9 },
		moveActionEspera: { confirmada: false }
	});

	it('o pedido do jogo (singleton) tambem e por ator: jogador e homunculo saem os dois', () => {
		const doJogador = vi.fn();
		const doHomunculo = vi.fn();
		pedidoNoGolpe.adiarSeNaJanela(JOGADOR, 1000, 500, doJogador);
		pedidoNoGolpe.adiarSeNaJanela(HOMUNCULO, 900, 600, doHomunculo);
		vi.advanceTimersByTime(1000);
		expect(doJogador).toHaveBeenCalledTimes(1);
		expect(doHomunculo).toHaveBeenCalledTimes(1);
	});

	it('o jogador anda (clique no chao, joystick): so a skill do JOGADOR cai, a do homunculo sai', () => {
		const doJogador = vi.fn();
		const doHomunculo = vi.fn();
		pedidoNoGolpe.adiarSeNaJanela(JOGADOR, 1500, 1000, doJogador);
		pedidoNoGolpe.adiarSeNaJanela(HOMUNCULO, 1500, 1000, doHomunculo);
		const s = sessao();
		expect(jogadorPediuParaAndar(s)).toBe(true);
		expect(s.moveAction).toBe(null);
		vi.advanceTimersByTime(2000);
		expect(doJogador).not.toHaveBeenCalled();
		expect(doHomunculo).toHaveBeenCalledTimes(1);
	});

	it('troca de mapa e morte (descartarPedidoGuardado sem ator): nenhum pedido sai', () => {
		const doJogador = vi.fn();
		const doHomunculo = vi.fn();
		pedidoNoGolpe.adiarSeNaJanela(JOGADOR, 1500, 1000, doJogador);
		pedidoNoGolpe.adiarSeNaJanela(HOMUNCULO, 1500, 1000, doHomunculo);
		descartarPedidoGuardado(sessao());
		vi.advanceTimersByTime(2000);
		expect(doJogador).not.toHaveBeenCalled();
		expect(doHomunculo).not.toHaveBeenCalled();
	});

	it('sem personagem na sessao o clique de andar descarta tudo (nao ha ator para poupar)', () => {
		const doHomunculo = vi.fn();
		pedidoNoGolpe.adiarSeNaJanela(HOMUNCULO, 1500, 1000, doHomunculo);
		jogadorPediuParaAndar({ moveAction: null, moveActionAlcance: null, moveActionEspera: null });
		vi.advanceTimersByTime(2000);
		expect(doHomunculo).not.toHaveBeenCalled();
	});
});

describe('a costura de Skill.js (lote 8, C-4)', () => {
	const lido = arquivo => fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n');

	it('os dois caminhos (alvo e chao) pedem o slot do ator que vai usar a skill: entity.GID', () => {
		const src = lido('src/Engine/MapEngine/Skill.js');
		expect(src.match(/_pedidoNoGolpe\.adiarSeNaJanela\(/g)).toHaveLength(2);
		expect(src).toMatch(
			/_pedidoNoGolpe\.adiarSeNaJanela\(entity\.GID, entity\.amotionTick, Renderer\.tick, \(\) =>\s*onUseSkill\(id, level, targetID\)\s*\)/
		);
		expect(src).toMatch(
			/_pedidoNoGolpe\.adiarSeNaJanela\(entity\.GID, entity\.amotionTick, Renderer\.tick, \(\) =>\s*SkillTargetSelection\.onUseSkillToPos\(id, level, x, y\)/
		);
		expect(src).not.toMatch(/adiarSeNaJanela\(entity\.amotionTick/);
	});

	it('o clique de andar poupa o homunculo: jogadorPediuParaAndar passa o GID do personagem', () => {
		const src = lido('src/Engine/MapEngine/pedidoGuardado.js');
		expect(src).toMatch(/descartarPedidoGuardado\(sessao, adiado, sessao\.Entity \? sessao\.Entity\.GID : undefined\);/);
	});
});
