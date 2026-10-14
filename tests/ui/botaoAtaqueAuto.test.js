/**
 * O BOTAO "ATAQUE AUTO" VOLTOU (12/10/2026, pedido do dono): o aro do canto inferior direito
 * (CombatCornerIdle) liga e desliga o Bot novo, e o interruptor ON/OFF do menu do Bot faz o mesmo.
 * Os dois sao o MESMO estado: o que o servidor confirmou (`estadoDoBot.js`).
 *
 * A prova monta as duas pecas reais (BotMenu + CombatCornerIdle) e responde no formato do
 * `ZC_RAGIDLE_BOT` de `servidor/bot/protocolo-do-bot.ts` (rag-idle-master).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: vi.fn(), TYPE: { ERROR: 1 << 6 }, FILTER: { PUBLIC_LOG: 1 } }
}));

const pasta = join(__dirname, '..', '..', 'src', 'UI', 'Components');
const htmlDoMenu = readFileSync(join(pasta, 'BotMenu', 'BotMenu.html'), 'utf8');
const htmlDoBotao = readFileSync(join(pasta, 'CombatCornerIdle', 'CombatCornerIdle.html'), 'utf8');

const CONFIG = { v: 1, cacar: true, especiesVetadas: [], modoDeAtaque: 'skills-e-basico', raioDePercepcao: 15, skills: { geral: [], porSkill: {}, porMonstro: {} } };

function pacote(extra = {}) {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: CONFIG,
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		agora: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { raioMinimo: 3, raioMaximo: 30 }, secoes: ['cacada', 'ataque'] },
		monstros: [],
		...extra
	};
}

async function montar() {
	vi.resetModules();
	localStorage.clear();
	const { default: Network } = await import('Network/NetworkManager.js');
	const { default: ChatBox } = await import('UI/Components/ChatBox/ChatBox.js');
	const { default: Session } = await import('Engine/SessionStorage.js');
	const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
	const { default: CombatCornerIdle } = await import('UI/Components/CombatCornerIdle/CombatCornerIdle.js');
	Network.sendPacket.mockClear();
	ChatBox.addText.mockClear();
	Session.GID = 7;
	BotMenu._host = document.createElement('div');
	BotMenu._host.innerHTML = htmlDoMenu;
	BotMenu._shadow = null;
	BotMenu.draggable = () => {};
	BotMenu.init();
	// D-2385: a janela FECHADA nao desenha (so guarda e suja); estes casos olham a janela aberta.
	BotMenu._host.querySelector('.bm-window').classList.add('is-open');
	// O mock do Network sobrevive ao `resetModules`: o gancho DESTE BotMenu e o ultimo registrado.
	const chamada = Network.hookPacket.mock.calls.filter(c => c[1] && c[1].name === 'onBotRecebido').at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	CombatCornerIdle._host = document.createElement('div');
	CombatCornerIdle._host.innerHTML = htmlDoBotao;
	CombatCornerIdle._shadow = null;
	CombatCornerIdle.init();
	CombatCornerIdle.onAppend();
	const botao = CombatCornerIdle._host.querySelector('.cc-btn--auto');
	const interruptor = BotMenu._host.querySelector('.bm-liga');
	/** O ultimo pedido que saiu para o servidor. */
	const ultimoPedido = () => JSON.parse(Network.sendPacket.mock.calls.at(-1)[0].json);
	/** O servidor responde o ultimo pedido. */
	const responder = extra => receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 1, ...extra }));
	return { BotMenu, CombatCornerIdle, ChatBox, botao, interruptor, receber, ultimoPedido, responder };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('o botao "Ataque auto" e o ON/OFF do Bot', () => {
	it('sem o Bot anunciado pelo servidor o botao some; com ele, aparece desligado', async () => {
		const { CombatCornerIdle, botao, receber } = await montar();
		const wrap = CombatCornerIdle._host.querySelector('#CombatCornerIdle');
		expect(wrap.classList.contains('is-sem-bot')).toBe(true);
		receber(pacote());
		expect(wrap.classList.contains('is-sem-bot')).toBe(false);
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(botao.getAttribute('aria-pressed')).toBe('false');
	});

	it('o clique no botao liga o Bot, e o menu do Bot mostra ON', async () => {
		const { botao, interruptor, receber, ultimoPedido, responder } = await montar();
		receber(pacote());
		botao.click();
		expect(ultimoPedido().verbo).toBe('ligar');
		// So o servidor confirma: em voo, o botao ainda nao afirma ligado.
		expect(botao.classList.contains('is-pendente')).toBe(true);
		expect(botao.classList.contains('is-on')).toBe(false);
		responder({ ligado: true, situacao: 'ativo' });
		expect(botao.classList.contains('is-pendente')).toBe(false);
		expect(botao.classList.contains('is-on')).toBe(true);
		expect(interruptor.getAttribute('aria-checked')).toBe('true');
	});

	it('um segundo clique com o pedido em voo nao manda outro', async () => {
		const { botao, receber } = await montar();
		receber(pacote());
		const { default: Network } = await import('Network/NetworkManager.js');
		botao.click();
		const pedidos = Network.sendPacket.mock.calls.length;
		botao.click();
		expect(Network.sendPacket.mock.calls.length).toBe(pedidos);
	});

	it('o interruptor do menu desliga o Bot, e o botao apaga', async () => {
		const { botao, interruptor, receber, ultimoPedido, responder } = await montar();
		receber(pacote({ ligado: true, situacao: 'ativo' }));
		expect(botao.classList.contains('is-on')).toBe(true);
		interruptor.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		responder({ ligado: false, situacao: 'desligado' });
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(interruptor.getAttribute('aria-checked')).toBe('false');
	});

	it('o botao desliga o que o menu ligou', async () => {
		const { botao, interruptor, receber, ultimoPedido, responder } = await montar();
		receber(pacote());
		interruptor.click();
		responder({ ligado: true, situacao: 'ativo' });
		expect(botao.classList.contains('is-on')).toBe(true);
		botao.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		responder({ ligado: false, situacao: 'desligado' });
		expect(botao.classList.contains('is-on')).toBe(false);
	});

	it('a recusa do servidor (cidade sem Bot) vai para o chat e o botao fica apagado', async () => {
		const { botao, ChatBox, receber, responder } = await montar();
		receber(pacote());
		botao.click();
		responder({ ok: false, erro: 'mapa-sem-bot', ligado: false });
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(ChatBox.addText).toHaveBeenCalledTimes(1);
		expect(ChatBox.addText.mock.calls[0][0]).toMatch(/mapa de caça/);
	});

	it('a recusa de um ON pedido pelo MENU nao vai para o chat (a janela ja mostra)', async () => {
		const { interruptor, ChatBox, receber, responder } = await montar();
		receber(pacote());
		interruptor.click();
		responder({ ok: false, erro: 'mapa-sem-bot', ligado: false });
		expect(ChatBox.addText).not.toHaveBeenCalled();
	});

	it('a troca de personagem apaga o botao', async () => {
		const { BotMenu, CombatCornerIdle, botao, receber } = await montar();
		receber(pacote({ ligado: true, situacao: 'ativo' }));
		expect(botao.classList.contains('is-on')).toBe(true);
		BotMenu.limparEstadoDoPersonagem();
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(CombatCornerIdle._host.querySelector('#CombatCornerIdle').classList.contains('is-sem-bot')).toBe(true);
	});
});
