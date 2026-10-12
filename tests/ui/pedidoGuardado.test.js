import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarPedidoAdiado } from '../../src/Engine/MapEngine/pedidoAdiadoPeloGolpe.js';
import { descartarPedidoGuardado } from '../../src/Engine/MapEngine/pedidoGuardado.js';
import { TEXTO_FORA_DO_ALCANCE } from '../../src/Engine/MapEngine/confirmacaoDaCaminhada.js';

/*
 * C47 / C-1 / C-2 (auditoria de tela, 30/09/2026): o pedido de skill guardado
 * (a janela do golpe e o `moveAction`) some quando o jogador desiste - clique
 * de andar, troca de mapa, morte - e o cliente avisa quando ele proprio desiste
 * no fim da caminhada.
 */
describe('o pedido adiado pela janela do golpe pode ser cancelado (C-1)', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const relogio = () => ({ agendar: (fn, ms) => setTimeout(fn, ms), cancelar: id => clearTimeout(id) });

	it('cancelar() antes de a janela vencer: o pedido nunca sai', () => {
		const p = criarPedidoAdiado(relogio());
		const repetir = vi.fn();
		p.adiarSeNaJanela(1500, 1000, repetir);
		expect(p.temPendente()).toBe(true);
		p.cancelar();
		expect(p.temPendente()).toBe(false);
		vi.advanceTimersByTime(5000);
		expect(repetir).not.toHaveBeenCalled();
	});

	it('cancelar() sem pedido esperando nao faz nada, e um pedido novo depois dele sai', () => {
		const p = criarPedidoAdiado(relogio());
		p.cancelar();
		const repetir = vi.fn();
		p.adiarSeNaJanela(1500, 1000, repetir);
		vi.advanceTimersByTime(600);
		expect(repetir).toHaveBeenCalledTimes(1);
	});
});

describe('descartarPedidoGuardado solta tudo o que esperava para sair (C-1)', () => {
	it('zera o moveAction, o alcance e a espera, e cancela o pedido da janela do golpe', () => {
		const sessao = { moveAction: { SKID: 83 }, moveActionAlcance: { alcance: 9 }, moveActionEspera: { confirmada: false } };
		const adiado = { cancelar: vi.fn() };
		descartarPedidoGuardado(sessao, adiado);
		expect(adiado.cancelar).toHaveBeenCalledTimes(1);
		expect(sessao.moveAction).toBe(null);
		expect(sessao.moveActionAlcance).toBe(null);
		expect(sessao.moveActionEspera).toBe(null);
	});

	it('o pedido agendado de verdade nao sai depois do descarte (o clique de fuga, a troca de mapa)', () => {
		vi.useFakeTimers();
		try {
			const p = criarPedidoAdiado({ agendar: (fn, ms) => setTimeout(fn, ms), cancelar: id => clearTimeout(id) });
			const sai = vi.fn();
			p.adiarSeNaJanela(2000, 1000, sai);
			descartarPedidoGuardado({ moveAction: null, moveActionAlcance: null, moveActionEspera: null }, p);
			vi.advanceTimersByTime(10000);
			expect(sai).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('C-2: desistir no fim da caminhada avisa em portugues', () => {
	it('o texto existe e nao e o do teto da C19', () => {
		expect(TEXTO_FORA_DO_ALCANCE).toBe('O alvo continua fora do alcance. Chegue mais perto para usar a habilidade.');
	});
});

describe('a costura: quem desiste chama o descarte', () => {
	const semTabs = (arquivo) => fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n').replace(/\n\t+/g, '\n');

	it('o clique de andar no MapControl descarta (no lugar do `moveAction = null` solto)', () => {
		const src = semTabs('src/Controls/MapControl.js');
		// Lote 7: o clique passa pela funcao unica de todo gesto de andar (ver jogadorPediuParaAndar.test.js).
		expect(src.indexOf('jogadorPediuParaAndar(Session);\nSession.autoFollow = false;')).toBeGreaterThan(-1);
		expect(src.indexOf('Session.moveAction = null;')).toBe(-1);
	});

	it('onMapChange descarta antes de tudo', () => {
		const src = semTabs('src/Engine/MapEngine.js');
		expect(src.indexOf('function onMapChange(pkt, ehEntradaNoMundo) {\n// C47 (C-1): o pedido de skill guardado e do mapa de antes (x,y velhos).\ndescartarPedidoGuardado(Session);')).toBeGreaterThan(-1);
	});

	it('a morte do proprio personagem descarta', () => {
		const src = semTabs('src/Engine/MapEngine/Entity.js');
		expect(src.indexOf('descartarPedidoGuardado(Session);\n//death animation only for myself')).toBeGreaterThan(-1);
	});

	it('o onWalkEnd avisa quando desiste e limpa a espera', () => {
		const src = semTabs('src/Engine/MapEngine.js');
		expect(
			src.indexOf("if (decisao === 'desistir') {\nChatBox.addText(TEXTO_FORA_DO_ALCANCE, ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);\n}")
		).toBeGreaterThan(-1);
		expect(src.indexOf('Network.sendPacket(Session.moveAction);\nSession.moveAction = null;\nSession.moveActionAlcance = null;\nSession.moveActionEspera = null;')).toBeGreaterThan(-1);
	});

	it('Skill.js usa o pedido unico de pedidoGuardado.js (o que o descarte cancela)', () => {
		const src = semTabs('src/Engine/MapEngine/Skill.js');
		expect(src.indexOf("import { pedidoNoGolpe } from './pedidoGuardado.js';")).toBeGreaterThan(-1);
		expect(src.indexOf('const _pedidoNoGolpe = pedidoNoGolpe;')).toBeGreaterThan(-1);
		expect(src.indexOf('criarPedidoAdiado(')).toBe(-1);
	});
});
