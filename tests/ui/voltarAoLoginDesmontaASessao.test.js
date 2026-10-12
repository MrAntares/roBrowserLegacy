/**
 * TODA VOLTA AO LOGIN DESMONTA A SESSAO DE MAPA (H07, auditoria 2 de 22/09/2026).
 *
 * So o logout (`onExitSuccess`) desmontava a sessao: o modo leitura, a limpeza
 * por personagem (`cleanGameUI`), o `BackgroundTicker`, o ouvinte de
 * visibilidade da economia e a tela preta da economia. As outras portas para o
 * login — a reconexao que desiste (`desistirEIrParaOLogin`, inclusive a
 * manutencao e o `@kick`), o OK do `showErrorBox`, o `expulso` da economia e o
 * `aoBoot` do sono — so chamavam `GameEngine.reload()`, que tira os
 * componentes e fecha a rede e mais nada. Na tela de login o wake lock seguia
 * seguro, a tela preta da economia (z-index 2000000) ficava por cima de tudo,
 * e a HUD de party voltava com o grupo do personagem anterior.
 *
 * As portas todas passam por `GameEngine.reload()`, e e la que a desmontagem
 * mora: uma porta nova para o login herda a limpeza sem ninguem lembrar dela.
 *
 * O `GameEngine` carrega aqui com os vizinhos falsos (comportamento). O
 * `MapEngine` nao carrega em jsdom (ver `dormirEmTelaPreta.test.js`), entao o
 * conteudo da desmontagem e cobrado lendo o fonte SEM comentarios.
 */
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	session: { Playing: false },
	mapEngine: { desmontarSessao: vi.fn() },
	ui: { removeComponents: vi.fn(), showErrorBox: vi.fn(), showMessageBox: vi.fn() },
	network: { close: vi.fn() },
	background: { init: vi.fn(), resize: vi.fn(), setImage: vi.fn() },
	bgm: { setAvailableExtensions: vi.fn(), play: vi.fn(), stop: vi.fn() }
}));

vi.mock('Utils/Queue.js', () => ({ default: class {} }));
vi.mock('Audio/SoundManager.js', () => ({ default: { play: vi.fn(), stop: vi.fn() } }));
vi.mock('Audio/BGM.js', () => ({ default: mocks.bgm }));
vi.mock('DB/DBManager.js', () => ({ default: {} }));
vi.mock('Core/Configs.js', () => ({ default: { get: vi.fn((_chave, padrao) => padrao) } }));
vi.mock('UI/relatoDeErro.js', () => ({ ligarRelatoDeErro: vi.fn() }));
vi.mock('Renderer/quadrosNoCampo.js', () => ({ ligarRelatoDeDesempenho: vi.fn() }));
vi.mock('Core/Client.js', () => ({ default: {} }));
vi.mock('Core/Thread.js', () => ({ default: {} }));
vi.mock('Core/Context.js', () => ({ default: {} }));
vi.mock('Engine/LoginEngine.js', () => ({ default: {} }));
vi.mock('Engine/MapEngine.js', () => ({ default: mocks.mapEngine }));
vi.mock('Engine/SessionStorage.js', () => ({ default: mocks.session }));
vi.mock('Network/NetworkManager.js', () => ({ default: mocks.network }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 800, height: 600, stop: vi.fn() } }));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { free: vi.fn() } }));
vi.mock('UI/UIManager.js', () => ({ default: mocks.ui }));
vi.mock('UI/CursorManager.js', () => ({ default: {} }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('UI/Background.js', () => ({ default: mocks.background }));
vi.mock('UI/Components/Intro/Intro.js', () => ({ default: {} }));
vi.mock('UI/Components/WinList/WinList.js', () => ({ default: {} }));
vi.mock('Utils/ConsoleManager.js', () => ({ default: {} }));
vi.mock('Utils/CodepageManager.js', () => ({ default: {} }));
vi.mock('App/PreLoader.js', () => ({ roInitSpinner: { remove: vi.fn() } }));

const { default: GameEngine } = await import('Engine/GameEngine.js');

const semComentario = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

/** O corpo de uma funcao do fonte: do cabecalho ate o proximo `\n}` de coluna zero. */
function corpoDe(fonte, cabecalho) {
	const inicio = fonte.indexOf(cabecalho);
	expect(inicio, `nao achei "${cabecalho}"`).toBeGreaterThan(-1);
	const fim = fonte.slice(inicio).search(/\r?\n\}\r?\n/);
	return fonte.slice(inicio, inicio + fim);
}

describe('GameEngine.reload desmonta a sessao de mapa (H07)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.mapEngine.desmontarSessao = vi.fn();
	});

	afterEach(() => {
		mocks.session.Playing = false;
		vi.restoreAllMocks();
	});

	it('vindo do mapa (a reconexao que desiste, o OK do erro, o expulso, o aoBoot do sono), desmonta', () => {
		mocks.session.Playing = true;
		GameEngine.reload();
		expect(mocks.mapEngine.desmontarSessao).toHaveBeenCalledOnce();
		expect(mocks.background.setImage, 'o login continua aparecendo').toHaveBeenCalledOnce();
	});

	it('a desmontagem vem DEPOIS de fechar a rede: nada da limpeza sai para o servidor', () => {
		mocks.session.Playing = true;
		const ordem = [];
		mocks.network.close.mockImplementation(() => ordem.push('rede fechada'));
		mocks.mapEngine.desmontarSessao = vi.fn(() => ordem.push('desmontou'));
		GameEngine.reload();
		expect(ordem).toEqual(['rede fechada', 'desmontou']);
	});

	it('sem sessao de mapa (o boot, o sair da tela de login), nao desmonta nada', () => {
		mocks.session.Playing = false;
		GameEngine.reload();
		expect(mocks.mapEngine.desmontarSessao).not.toHaveBeenCalled();
		expect(mocks.background.setImage).toHaveBeenCalledOnce();
	});

	it('uma desmontagem que LANCA nao impede a tela de login de aparecer', () => {
		mocks.session.Playing = true;
		const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
		mocks.mapEngine.desmontarSessao = vi.fn(() => {
			throw new TypeError('componente sem raiz');
		});
		expect(() => GameEngine.reload()).not.toThrow();
		expect(mocks.background.setImage).toHaveBeenCalledOnce();
		expect(erro).toHaveBeenCalled();
	});
});

describe('o que a desmontagem desfaz, e quem passa por ela (H07, fonte)', () => {
	const MOTOR = semComentario(readFileSync('src/Engine/MapEngine.js', 'utf8'));

	it('MapEngine.desmontarSessao existe e chama a desmontagem unica', () => {
		expect(MOTOR).toMatch(/static desmontarSessao\(\) \{\s*desmontarSessaoDeMapa\(\);\s*\}/);
	});

	it('a desmontagem solta o modo leitura, o ticker, o ouvinte, as telas pretas e o estado do personagem', () => {
		const corpo = corpoDe(MOTOR, 'function desmontarSessaoDeMapa() {');
		expect(corpo).toContain('Session.Playing = false;');
		expect(corpo).toContain('TelaAcesaNoFarm.desligar();');
		expect(corpo).toContain('BackgroundTicker.stop();');
		// A economia de energia saiu do cliente (07/10/2026): nada dela a desfazer.
		expect(corpo).not.toMatch(/Economia/);
		expect(corpo).toContain('_janelaDoSonoAtiva.remove();');
		expect(corpo).toContain('cleanGameUI();');
	});

	it('o logout passa pela MESMA desmontagem, sem uma segunda copia escrita a mao', () => {
		const corpo = corpoDe(MOTOR, 'function onExitSuccess() {');
		expect(corpo).toContain('desmontarSessaoDeMapa();');
		expect(corpo, 'a copia a mao voltou ao logout').not.toContain('TelaAcesaNoFarm.desligar();');
		expect(corpo).not.toContain('BackgroundTicker.stop();');
		expect(corpo).not.toContain('cleanGameUI();');
	});

	it('as quatro portas para o login continuam indo pelo GameEngine.reload', () => {
		const reconexao = semComentario(readFileSync('src/Network/reconexao.js', 'utf8'));
		expect(corpoDe(reconexao, 'function desistirEIrParaOLogin(texto) {')).toContain('GameEngine.reload()');
		const ui = semComentario(readFileSync('src/UI/UIManager.js', 'utf8'));
		const erro = ui.slice(ui.indexOf('static showErrorBox(text) {'), ui.indexOf('static showMessageBox('));
		expect(erro.match(/m\.default\.reload\(\)/g)).toHaveLength(2);
		expect(corpoDe(MOTOR, 'function voltarAoMundoDepoisDoSono() {')).toContain('m.default.reload()');
		expect(corpoDe(MOTOR, 'function onEconomiaRecebida(pkt) {')).toContain('m.default.reload()');
	});
});
