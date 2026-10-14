/**
 * O "ATAQUE AUTO" QUE CONGELA (bug #17 de 13/10/2026). Relatos do Discord, 13/10/2026:
 * - NT_, 14:05: "ta rolando bug no auto battle quando o char morre e volta pra cidade com ele ativo, o estado dele
 *   congela e nao ativa nem desativa";
 * - BuGaDo, 14:22: "Se minimizar tambem buga o auto."
 *
 * O CAMINHO (medido no fio do servidor e na tela: relatorio `wt-bugs-13-10/relatorios/O-impl-r1.md`): o jogador
 * deixa o jogo caçando e sai (minimiza, ou o celular congela a aba). A conexao morre la fora; o personagem morre, volta
 * sozinho a Prontera (15 s) e a cidade desliga o Bot (`mapa-sem-bot`) - tudo mandado para a conexao MORTA. Quando ele
 * volta, a tela mostra o que viu por ultimo (o Bot ligado no campo) e o cliente so descobre a queda segundos depois
 * (a vigia de silencio). Duas falhas, a mesma familia (a conexao nova nao valia como conexao nova para o Bot):
 *
 * 1. o toque no "Ataque auto" antes de o cliente perceber a queda sai para o socket morto e NUNCA tera resposta (o
 *    servidor responde na conexao que recebeu o pedido). A reconexao nao soltava o ON/OFF em voo: o botao ficava
 *    "..." e `alternarLigado` recusava TODO toque (o menu do Bot e o "Ataque auto" sao o mesmo estado). Ate o F5;
 * 2. a reconexao nao zerava a linha de base do `statusRevision`: o aviso (`novaConexaoDoServidor`, 12/10/2026) morava
 *    no `MapRenderer.onLoad` de `onMapChange(.., true)`, e o MAPMOVE que o servidor manda logo atras do ACCEPT_ENTER2
 *    trocava esse `onLoad` antes de a carga terminar. O executor novo do servidor recomeca a revisao do zero, entao
 *    tudo o que a conexao nova dizia contava como velho: o botao seguia o estado da conexao morta (ligado na cidade,
 *    apagado com o Bot cacando) e o toque mandava o verbo certo para o servidor mas a tela nao mudava.
 *
 * A prova monta as pecas reais (`estadoDoBot.js`, `BotMenu` + `CombatCornerIdle`) e responde no formato do
 * `ZC_RAGIDLE_BOT` de `servidor/bot/protocolo-do-bot.ts` (rag-idle-master), com as revisoes que a sonda mediu. A
 * costura do aviso no motor (`onConnectionAccepted`) e cobrada em `estadoDoBotForaDeOrdem.test.js`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { criarEstadoDoBot } from 'UI/Components/BotMenu/estadoDoBot.js';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: vi.fn(), TYPE: { ERROR: 1 << 6 }, FILTER: { PUBLIC_LOG: 1 } }
}));

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

/** O que o servidor mandou ANTES de a conexao morrer: o Bot ligado e lutando (sonda S2, revisoes 1 a 3). */
const LIGADO_LUTANDO = { ligado: true, situacao: 'ativo', statusRevision: 3, status: { codigo: 'atacando', alvo: null } };

describe('estadoDoBot: a conexao nova solta o que estava em voo na conexao que caiu', () => {
	function sessaoComOBotLigado() {
		const enviados = [];
		const e = criarEstadoDoBot({ enviar: c => enviados.push(c) });
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado() }), 7);
		e.receber(pacote({ tipo: 'resposta', requestId: e.ligar(), ...LIGADO_LUTANDO }), 7);
		expect(e.estado().ligado).toBe(true);
		expect(e.estado().pendenteLigarDesligar).toBe(null);
		return { e, enviados };
	}

	it('o OFF que saiu para o socket morto deixa de prender o ON/OFF na conexao nova', () => {
		const { e } = sessaoComOBotLigado();
		e.desligar(); // o toque no "Ataque auto" com a conexao ja morta: nunca tera resposta
		expect(e.estado().pendenteLigarDesligar).toBe('desligar');
		e.novaConexao();
		expect(e.estado().pendenteLigarDesligar, 'o OFF da conexao morta continuou em voo').toBe(null);
		expect(e.pedidosEmVoo(), 'pedido da conexao morta segue esperando resposta').toBe(0);
	});

	it('o Salvar, o perfil e o "Salvar e Iniciar" da conexao morta tambem se soltam (mesma causa)', () => {
		const { e } = sessaoComOBotLigado();
		e.editar(c => ({ ...c, raioDePercepcao: 21 }));
		e.receber(pacote({ tipo: 'resposta', requestId: e.desligar(), ligado: false, statusRevision: 4 }), 7);
		e.aplicarELigar(); // com rascunho: aplica e so liga depois da confirmacao
		e.perfilSalvar('caca');
		expect(e.estado().pendenteAplicar).toBe(true);
		expect(e.estado().ligarAposAplicar).toBe(true);
		expect(e.estado().pendentePerfil).toBe(true);
		e.novaConexao();
		expect(e.estado().pendenteAplicar, 'o Salvar ficou "Salvando..." para sempre').toBe(false);
		expect(e.estado().ligarAposAplicar, 'o Salvar e Iniciar morto ainda ligaria depois').toBe(false);
		expect(e.estado().pendentePerfil, 'o seletor de perfil ficou travado').toBe(false);
		// O rascunho e do mesmo personagem: fica (o Salvar pode ser repetido).
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		expect(e.estado().dirty).toBe(true);
	});

	it('a resposta atrasada de um pedido da conexao morta, se chegar, nao conta', () => {
		const { e } = sessaoComOBotLigado();
		const velho = e.desligar();
		e.novaConexao();
		const novo = e.pedirEstado();
		expect(novo).not.toBe(velho);
		expect(e.receber(pacote({ tipo: 'resposta', requestId: velho, ligado: false, statusRevision: 9 }), 7)).toBe(false);
		expect(e.estado().ligado).toBe(true);
		e.receber(pacote({ tipo: 'resposta', requestId: novo, mapa: 'prontera', ligado: false, statusRevision: 6 }), 7);
		expect(e.estado().ligado).toBe(false);
		expect(e.estado().mapa).toBe('prontera');
	});

	it('CONTROLE: na MESMA conexao (troca de mapa, morte, volta a cidade) o ON/OFF em voo segue valendo e a resposta conta', () => {
		const { e } = sessaoComOBotLigado();
		const id = e.desligar();
		// Nada de conexao nova: o servidor responde na mesma (sonda S1: a resposta sai em ordem, na cidade inclusive).
		expect(e.estado().pendenteLigarDesligar).toBe('desligar');
		e.receber(pacote({ tipo: 'resposta', requestId: id, mapa: 'prontera', ligado: false, statusRevision: 7 }), 7);
		expect(e.estado().pendenteLigarDesligar).toBe(null);
		expect(e.estado().ligado).toBe(false);
	});
});

/*
 * O SALVAR CUJA RESPOSTA MORREU COM A CONEXAO (bug #17 de 13/10/2026, ressalva 3 do critico da rodada 1): o Salvar
 * saiu, o servidor APLICOU (revisao 0 -> 1) e a resposta foi para o socket morto. A conexao nova solta o Salvar
 * (`novaConexao`) e o `pedir` traz a revisao 1 com a config IGUAL ao rascunho. Sem adotar essa config como base, a
 * janela dizia "A configuracao mudou no servidor enquanto voce editava" e o Salvar seguinte ia com a `baseRevision`
 * 0: o servidor responde `conflito-de-revisao` (servidor-mapa.ts, `pedido.baseRevision !== atual`) - um conflito
 * FALSO, porque a "outra versao" e a do proprio jogador.
 */
describe('estadoDoBot: o Salvar que o servidor aplicou com a resposta perdida na queda', () => {
	/** Sessao com a config confirmada, o rascunho editado e o Salvar que sai para o socket que ja morreu. */
	function salvarPerdido(configDoServidor = CONFIG) {
		const enviados = [];
		const e = criarEstadoDoBot({ enviar: c => enviados.push(c) });
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), config: configDoServidor, statusRevision: 3 }), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 21 }));
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0 });
		e.novaConexao();
		return { e, enviados };
	}

	it('a config que volta IGUAL ao rascunho vira a base: sem aviso de mudanca e sem conflito falso no proximo Salvar', () => {
		const { e, enviados } = salvarPerdido();
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 1, config: { ...CONFIG, raioDePercepcao: 21 }, statusRevision: 1 }), 7);
		expect(e.estado().mudouNoServidor, 'a janela acusa "mudou no servidor" com a config do proprio jogador').toBe(false);
		expect(e.estado().baseRevision, 'o rascunho segue apoiado na revisao que o Salvar perdido ja superou').toBe(1);
		expect(e.estado().dirty).toBe(false);
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		// O jogador edita de novo e salva: vai com a revisao que o servidor tem (1), nao com a 0 (conflito falso).
		e.editar(c => ({ ...c, raioDePercepcao: 25 }));
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 1, config: { raioDePercepcao: 25 } });
	});

	it('o armazem gravado antes de 09/10 nao conta: o Salvar nao manda o bloco e o servidor grava o padrao no lugar', () => {
		// Medido contra a validacao do servidor (relatorio O-impl-r2): `validarArmazem(undefined)` = ARMAZEM_PADRAO.
		const ARMAZEM_ANTIGO = { ligado: false, cidade: 'prontera', pesoAcimaDe: 80, depositar: [909], reservas: [], repor: [], tetoDeGasto: 0, voltar: true };
		const ARMAZEM_PADRAO = { ligado: false, cidade: null, pesoAcimaDe: 0, depositar: [], reservas: [], repor: [], tetoDeGasto: 0, voltar: true };
		const { e, enviados } = salvarPerdido({ ...CONFIG, armazem: ARMAZEM_ANTIGO });
		expect(enviados.at(-1).config).not.toHaveProperty('armazem');
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 1, config: { ...CONFIG, raioDePercepcao: 21, armazem: ARMAZEM_PADRAO }, statusRevision: 1 }), 7);
		expect(e.estado().mudouNoServidor, 'o armazem que o jogador nao edita (e o Salvar nao manda) acusou mudanca').toBe(false);
		expect(e.estado().baseRevision).toBe(1);
		expect(e.estado().dirty).toBe(false);
		expect(e.estado().editConfig.armazem).toEqual(ARMAZEM_PADRAO);
	});

	it('CONTROLE: o Salvar perdido que NAO chegou ao servidor deixa o rascunho sujo, sem aviso, e o Salvar de novo vale', () => {
		const { e, enviados } = salvarPerdido();
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 0, config: CONFIG, statusRevision: 1 }), 7);
		expect(e.estado().dirty).toBe(true);
		expect(e.estado().mudouNoServidor).toBe(false);
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0, config: { raioDePercepcao: 21 } });
	});

	it('CONTROLE: a config nova DIFERENTE do rascunho continua avisando e nao apaga a edicao (o aviso de verdade)', () => {
		const { e, enviados } = salvarPerdido();
		// O Salvar nao chegou, e outra janela mudou OUTRA coisa no servidor (revisao 1).
		e.receber(pacote({ tipo: 'resposta', requestId: e.pedirEstado(), revisao: 1, config: { ...CONFIG, cacar: false }, statusRevision: 1 }), 7);
		expect(e.estado().mudouNoServidor).toBe(true);
		expect(e.estado().dirty).toBe(true);
		expect(e.estado().editConfig.raioDePercepcao).toBe(21);
		expect(e.estado().editConfig.cacar).toBe(true);
		expect(e.estado().baseRevision).toBe(0);
		// O Salvar segue com a base antiga: o servidor responde conflito e o jogador escolhe recarregar.
		e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0 });
	});
});

const pasta = join(__dirname, '..', '..', 'src', 'UI', 'Components');
const htmlDoMenu = readFileSync(join(pasta, 'BotMenu', 'BotMenu.html'), 'utf8');
const htmlDoBotao = readFileSync(join(pasta, 'CombatCornerIdle', 'CombatCornerIdle.html'), 'utf8');

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
	const chamada = Network.hookPacket.mock.calls.filter(c => c[1] && c[1].name === 'onBotRecebido').at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	CombatCornerIdle._host = document.createElement('div');
	CombatCornerIdle._host.innerHTML = htmlDoBotao;
	CombatCornerIdle._shadow = null;
	CombatCornerIdle.init();
	CombatCornerIdle.onAppend();
	const botao = CombatCornerIdle._host.querySelector('.cc-btn--auto');
	const enviados = () => Network.sendPacket.mock.calls.length;
	const ultimoPedido = () => JSON.parse(Network.sendPacket.mock.calls.at(-1)[0].json);
	/**
	 * A RECONEXAO como o MapEngine a faz: `onConnectionAccepted` avisa a conexao nova e chama `onMapChange(.., true)`;
	 * a troca de mapa tira a HUD (`MapRenderer.setMap` -> `UIManager.removeComponents`); o que o servidor manda durante
	 * a carga chega (`durante`); no fim da carga o `MapRenderer.onLoad` anexa o menu do Bot (que pede o estado) e o
	 * botao (que le o estado do menu).
	 */
	const reconectar = (durante = () => {}) => {
		BotMenu.novaConexaoDoServidor();
		CombatCornerIdle.onRemove();
		BotMenu.onRemove();
		durante();
		BotMenu.onAppend();
		CombatCornerIdle.onAppend();
	};
	return { BotMenu, ChatBox, botao, receber, enviados, ultimoPedido, reconectar };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('o botao "Ataque auto" depois da conexao que caiu (os dois relatos)', () => {
	it('MINIMIZAR: o toque que saiu com a conexao morta nao trava o botao; depois da reconexao ele liga e desliga', async () => {
		const { botao, receber, enviados, ultimoPedido, reconectar } = await montar();
		receber(pacote(LIGADO_LUTANDO));
		expect(botao.classList.contains('is-on')).toBe(true);
		// Volta da aba minimizada: a tela mostra o Bot ligado; o socket morreu la fora e o toque se perde.
		botao.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		expect(botao.classList.contains('is-pendente')).toBe(true);
		// A vigia de silencio derruba o socket e a reconexao entra; a economia segurou o Bot ligado no campo.
		reconectar();
		const pedir = ultimoPedido();
		expect(pedir.verbo).toBe('pedir');
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, statusRevision: 9, ...{ ligado: true, situacao: 'ativo', status: { codigo: 'atacando', alvo: null } } }));
		expect(botao.classList.contains('is-pendente'), 'o botao ficou "..." para sempre (o defeito)').toBe(false);
		expect(botao.getAttribute('aria-busy')).toBe('false');
		expect(botao.classList.contains('is-on')).toBe(true);
		// E responde: o toque agora sai, e a resposta da conexao nova apaga o botao.
		const antes = enviados();
		botao.click();
		expect(enviados(), 'o toque nao saiu: o botao nao desativa').toBe(antes + 1);
		expect(ultimoPedido().verbo).toBe('desligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 10, ligado: false }));
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(botao.classList.contains('is-pendente')).toBe(false);
	});

	it('MORTE E VOLTA A CIDADE com o Bot ligado: na reconexao o botao mostra o que o servidor confirma e responde', async () => {
		const { botao, ChatBox, receber, enviados, ultimoPedido, reconectar } = await montar();
		receber(pacote(LIGADO_LUTANDO));
		// Fora da tela, o personagem morreu, voltou sozinho a Prontera e a cidade desligou o Bot: tudo para a
		// conexao morta. O jogador volta, ve o Bot ligado e toca o botao (perdido).
		botao.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		reconectar();
		const pedir = ultimoPedido();
		// A conexao nova (sonda S2): Prontera, Bot desligado, revisao 6 do executor que seguiu vivo.
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, mapa: 'prontera', statusRevision: 6, ligado: false }));
		expect(botao.classList.contains('is-on'), 'na cidade sem Bot o servidor desligou').toBe(false);
		expect(botao.classList.contains('is-pendente'), 'o estado congelou na volta a cidade (o defeito)').toBe(false);
		// O toque sai, e a recusa da cidade vai para o chat: o botao nao trava.
		const antes = enviados();
		botao.click();
		expect(enviados(), 'o toque nao saiu: o botao nao ativa').toBe(antes + 1);
		expect(ultimoPedido().verbo).toBe('ligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, mapa: 'prontera', statusRevision: 6, ok: false, erro: 'mapa-sem-bot', ligado: false }));
		expect(botao.classList.contains('is-pendente')).toBe(false);
		expect(botao.classList.contains('is-on')).toBe(false);
		expect(ChatBox.addText).toHaveBeenCalledTimes(1);
		expect(ChatBox.addText.mock.calls[0][0]).toMatch(/mapa de caça/);
		// De volta ao campo (mesma conexao), o toque liga.
		botao.click();
		expect(ultimoPedido().verbo).toBe('ligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 8, ligado: true, situacao: 'ativo' }));
		expect(botao.classList.contains('is-on')).toBe(true);
	});

	it('SO A QUEDA (nenhum toque perdido): avisada no aceite, a conexao nova vale como nova e o status da entrada conta', async () => {
		const { botao, receber, ultimoPedido, reconectar } = await montar();
		// Uma sessao longa: o Bot cacou (revisao 22) e o jogador o desligou pelo botao (revisao 23), como a fase C da tela.
		receber(pacote({ ...LIGADO_LUTANDO, statusRevision: 22 }));
		botao.click();
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 23, ligado: false }));
		expect(botao.classList.contains('is-on')).toBe(false);
		// Queda e reconexao no campo: o executor NOVO liga o Bot na entrada (D-2320) e publica a revisao 1 durante a carga.
		reconectar(() => receber(pacote({ ligado: true, situacao: 'ativo', statusRevision: 1, status: { codigo: 'procurando-alvo', alvo: null } })));
		expect(botao.classList.contains('is-on'), 'o status da conexao nova contou como velho: o botao segue apagado com o Bot cacando').toBe(true);
		const pedir = ultimoPedido();
		expect(pedir.verbo).toBe('pedir');
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, statusRevision: 2, ligado: true, situacao: 'ativo' }));
		botao.click();
		expect(ultimoPedido().verbo).toBe('desligar');
		receber(pacote({ tipo: 'resposta', requestId: ultimoPedido().requestId, statusRevision: 3, ligado: false }));
		expect(botao.classList.contains('is-on'), 'o toque desligou no servidor e a tela nao mudou').toBe(false);
	});

	it('O SALVAR APLICADO COM A RESPOSTA PERDIDA: a janela do Bot nao acusa mudanca e o Salvar seguinte sai com a revisao nova', async () => {
		const { BotMenu, receber, ultimoPedido, reconectar } = await montar();
		const q = seletor => BotMenu._host.querySelector(seletor);
		receber(pacote());
		// O jogador muda o raio e salva; o socket ja morreu, o servidor aplica e a resposta se perde.
		const raio = q('.bm-raio');
		raio.value = '21';
		raio.dispatchEvent(new Event('input'));
		q('.bm-aplicar').click();
		expect(ultimoPedido()).toMatchObject({ verbo: 'aplicar', baseRevision: 0, config: { raioDePercepcao: 21 } });
		expect(q('.bm-aplicar-texto').textContent).toBe('Salvando...');
		reconectar();
		const pedir = ultimoPedido();
		expect(pedir.verbo).toBe('pedir');
		receber(pacote({ tipo: 'resposta', requestId: pedir.requestId, revisao: 1, config: { ...CONFIG, raioDePercepcao: 21 }, statusRevision: 1 }));
		expect(q('.bm-recado').textContent, 'a janela acusa "mudou no servidor" com a config que o proprio jogador salvou').toBe('');
		expect(q('.bm-recarregar').hidden).toBe(true);
		expect(q('.bm-aplicar').disabled, 'o Salvar ja esta no servidor: nao ha rascunho').toBe(true);
		expect(q('.bm-aplicar-texto').textContent).toBe('Salvar');
		// O jogador edita de novo e salva: o pedido vai com a revisao 1 (com a 0, o servidor responde conflito).
		raio.value = '25';
		raio.dispatchEvent(new Event('input'));
		q('.bm-aplicar').click();
		expect(ultimoPedido(), 'o Salvar seguinte levaria um conflito de revisao falso').toMatchObject({ verbo: 'aplicar', baseRevision: 1, config: { raioDePercepcao: 25 } });
	});

	it('CONTROLE: sem conexao nova (troca de mapa na mesma conexao) o botao espera a resposta do proprio pedido', async () => {
		const { botao, receber, enviados, ultimoPedido } = await montar();
		receber(pacote(LIGADO_LUTANDO));
		botao.click();
		const id = ultimoPedido().requestId;
		const antes = enviados();
		botao.click(); // segundo toque com o pedido em voo: nao manda outro
		expect(enviados()).toBe(antes);
		receber(pacote({ tipo: 'resposta', requestId: id, statusRevision: 4, ligado: false }));
		expect(botao.classList.contains('is-pendente')).toBe(false);
		expect(botao.classList.contains('is-on')).toBe(false);
	});
});
