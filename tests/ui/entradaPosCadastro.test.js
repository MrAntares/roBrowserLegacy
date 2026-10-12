/**
 * A ENTRADA POS-CADASTRO (D-1379, 13/09/2026).
 *
 * O jogador cria a conta no site e cai no jogo ja logado, direto na criacao de
 * personagem, com o evento `Lead` do Meta Pixel (era `CompleteRegistration`) disparado UMA
 * vez. O que estes casos guardam:
 *
 * 1. **A leitura do fragmento**: so a forma exata vira login; lixo nao vira
 *    tentativa com senha torta.
 * 2. **A captura**: pega o que o `api.html` deixou (ou o fragmento cru, na
 *    reserva), apaga a origem e so devolve uma vez por pagina.
 * 3. **O estado**: so o login que leva o passe capturado arma a entrada; o
 *    servidor tem de ACEITAR; e so a conta sem personagem abre a criacao. O
 *    caso que o pedido do dono proibe por escrito (o jogador recorrente abrindo
 *    a criacao de novo) tem caso proprio.
 * 4. **A conversao**: sai pelo `fbq` e nunca derruba o jogo quando o Pixel
 *    foi bloqueado.
 * 5. **A guarda do `api.html`**: roda ANTES do Pixel e tira o passe da URL, que
 *    e o que impede a credencial de viajar para a Meta no PageView.
 * 6. **A fiacao**: os motores chamam o modulo nos pontos certos.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
	PREFIXO_DO_FRAGMENTO,
	_reiniciarParaTeste,
	abrirCriacaoDireto,
	capturarEntrada,
	lerEntrada,
	loginAceito,
	loginRecusado,
	pedidoDeLogin,
	registrarConversaoDoCadastro
} from 'Engine/entradaPosCadastro.js';

const PASSE = 'AbCdEfGhIjKlMnOpQrSt_-';
const ler = caminho => readFileSync(join(process.cwd(), caminho), 'utf8');

beforeEach(() => {
	_reiniciarParaTeste();
	delete window.RAGIDLE_ENTRADA;
	window.history.replaceState(null, '', '/');
});

afterEach(() => {
	delete window.fbq;
});

describe('1. a leitura do fragmento', () => {
	it('le usuario e passe na forma exata', () => {
		expect(lerEntrada(`Novato_1.${PASSE}`)).toEqual({ usuario: 'Novato_1', passe: PASSE });
	});

	it('aceita o texto ainda codificado para URL', () => {
		expect(lerEntrada(encodeURIComponent(`Novato_1.${PASSE}`))).toEqual({ usuario: 'Novato_1', passe: PASSE });
	});

	it('recusa tudo que foge da forma', () => {
		expect(lerEntrada('')).toBeNull();
		expect(lerEntrada(`abc.${PASSE}`)).toBeNull(); // usuario curto demais
		expect(lerEntrada(`novato.${PASSE}x`)).toBeNull(); // passe longo demais
		expect(lerEntrada(`novato.${PASSE.slice(1)}`)).toBeNull(); // passe curto demais
		expect(lerEntrada(`no vato.${PASSE}`)).toBeNull();
		expect(lerEntrada(`novato${PASSE}`)).toBeNull(); // sem o separador
		expect(lerEntrada('%E0%A4%A')).toBeNull(); // codificacao quebrada nao lanca
		expect(lerEntrada(undefined)).toBeNull();
	});
});

describe('2. a captura', () => {
	it('le o que o api.html deixou e apaga a variavel', () => {
		window.RAGIDLE_ENTRADA = `novato.${PASSE}`;
		expect(capturarEntrada()).toEqual({ usuario: 'novato', passe: PASSE });
		expect(window.RAGIDLE_ENTRADA).toBeUndefined();
		expect(capturarEntrada()).toBeNull();
	});

	it('na reserva, le o fragmento cru e o TIRA da barra de endereco', () => {
		window.history.replaceState(null, '', `/?app=ONLINE${PREFIXO_DO_FRAGMENTO}novato.${PASSE}`);
		expect(capturarEntrada()).toEqual({ usuario: 'novato', passe: PASSE });
		expect(window.location.hash).toBe('');
		expect(window.location.search).toBe('?app=ONLINE');
	});

	it('um fragmento que nao e de entrada fica onde esta', () => {
		window.history.replaceState(null, '', '/#prontera');
		expect(capturarEntrada()).toBeNull();
		expect(window.location.hash).toBe('#prontera');
	});
});

describe('3. o estado', () => {
	function entrarPeloPasse() {
		window.RAGIDLE_ENTRADA = `novato.${PASSE}`;
		const entrada = capturarEntrada();
		pedidoDeLogin(entrada.usuario, entrada.passe);
	}

	it('o caminho feliz: passe enviado, aceito, lista vazia abre a criacao', () => {
		entrarPeloPasse();
		expect(loginAceito()).toBe('novato');
		expect(abrirCriacaoDireto(0)).toBe(true);
	});

	it('decide UMA vez: a segunda lista (voltar da criacao) nao reabre', () => {
		entrarPeloPasse();
		loginAceito();
		expect(abrirCriacaoDireto(0)).toBe(true);
		expect(abrirCriacaoDireto(0)).toBe(false);
	});

	it('conta que ja tem personagem nao abre a criacao sozinha', () => {
		entrarPeloPasse();
		loginAceito();
		expect(abrirCriacaoDireto(1)).toBe(false);
	});

	it('O JOGADOR RECORRENTE: login digitado a mao nunca abre a criacao', () => {
		pedidoDeLogin('veterano', 'senhaDeSempre');
		expect(loginAceito()).toBeNull();
		expect(abrirCriacaoDireto(0)).toBe(false);
	});

	it('uma entrada que falhou na rede nao contamina o login manual seguinte', () => {
		entrarPeloPasse();
		// A conexao caiu antes de o servidor responder; o jogador digita.
		pedidoDeLogin('novato', 'aSenhaQueEscolheu');
		expect(loginAceito()).toBeNull();
		expect(abrirCriacaoDireto(0)).toBe(false);
	});

	it('depois do aceite, um login digitado com senha vazia nao se passa pelo do passe', () => {
		entrarPeloPasse();
		loginAceito();
		pedidoDeLogin('novato', '');
		expect(loginRecusado()).toBeNull();
	});

	it('passe recusado devolve o usuario para a tela vir preenchida, e desarma', () => {
		entrarPeloPasse();
		expect(loginRecusado()).toBe('novato');
		expect(loginAceito()).toBeNull();
		expect(abrirCriacaoDireto(0)).toBe(false);
	});

	it('recusa de um login manual NAO usa a mensagem da entrada', () => {
		pedidoDeLogin('veterano', 'errada');
		expect(loginRecusado()).toBeNull();
	});
});

describe('4. a conversao', () => {
	it('entrega Lead ao fbq', async () => {
		window.fbq = vi.fn();
		expect(registrarConversaoDoCadastro()).toBe(true);
		await new Promise(r => setTimeout(r, 0));
		expect(window.fbq).toHaveBeenCalledTimes(1);
		expect(window.fbq).toHaveBeenCalledWith('track', 'Lead');
	});

	it('com o passe aceito, o evento leva o MESMO eventID do servidor (API de Conversoes)', async () => {
		window.fbq = vi.fn();
		window.RAGIDLE_ENTRADA = 'Heroi_01.' + PASSE;
		capturarEntrada();
		pedidoDeLogin('Heroi_01', PASSE);
		expect(loginAceito()).toBe('Heroi_01');
		expect(registrarConversaoDoCadastro()).toBe(true);
		await vi.waitFor(() => expect(window.fbq).toHaveBeenCalledTimes(1));
		// sha256('heroi_01'), o mesmo do `conversoes-meta.test.ts` do servidor.
		const esperado = 'cadastro.' + createHash('sha256').update('heroi_01').digest('hex');
		expect(window.fbq).toHaveBeenCalledWith('track', 'Lead', {}, { eventID: esperado });
	});

	it('sem Pixel (bloqueador de anuncio) nao lanca', () => {
		expect(registrarConversaoDoCadastro()).toBe(false);
	});

	it('um fbq que LANCA nao derruba o laco de rede', () => {
		window.fbq = () => {
			throw new Error('bloqueado');
		};
		expect(() => registrarConversaoDoCadastro()).not.toThrow();
	});
});

describe('5. a guarda do api.html', () => {
	const builder = ler('applications/tools/builder-web.mjs');

	/** O corpo da funcao `createApiHTML`, do cabecalho ao fim do template. */
	const apiHtml = builder.slice(builder.indexOf('function createApiHTML('), builder.indexOf("'/api.html', apiHtml"));

	it('a guarda vem ANTES do Pixel, e o Pixel antes de qualquer outro script', () => {
		const guarda = apiHtml.indexOf('${GUARDA_DA_ENTRADA}');
		const pixel = apiHtml.indexOf('${META_PIXEL}');
		const outroScript = apiHtml.indexOf('<script', pixel);
		expect(guarda).toBeGreaterThan(-1);
		expect(pixel).toBeGreaterThan(guarda);
		expect(outroScript === -1 || outroScript > pixel).toBe(true);
		expect(apiHtml.indexOf('${registrador}')).toBeGreaterThan(pixel);
		expect(apiHtml.indexOf('<script src="api.js?v=')).toBeGreaterThan(pixel);
	});

	it('o Pixel e o do dono, com o id e os dois eventos de base', () => {
		expect(builder).toContain("fbq('init', '1538906837987135', chavesDaMeta);");
		expect(builder).toContain('rci_am');
		expect(builder).toContain("fbq('track', 'PageView');");
		expect(builder).toContain('https://www.facebook.com/tr?id=1538906837987135&ev=PageView&noscript=1');
		expect(builder).toContain("'https://connect.facebook.net/en_US/fbevents.js'");
	});

	it('executada, a guarda tira o passe da URL antes de o Pixel poder le-la', () => {
		// D-1648: a guarda virou arquivo gerado (`guarda-da-entrada.js`), e o codigo mora em GUARDA_DA_ENTRADA_JS.
		const inicio = builder.indexOf('const GUARDA_DA_ENTRADA_JS = `') + 'const GUARDA_DA_ENTRADA_JS = `'.length;
		const codigo = builder.slice(inicio, builder.indexOf('`;', inicio));
		window.history.replaceState(null, '', `/${PREFIXO_DO_FRAGMENTO}novato.${PASSE}`);

		new Function(codigo)();

		expect(window.location.href).not.toContain(PASSE);
		expect(window.location.hash).toBe('');
		expect(window.RAGIDLE_ENTRADA).toBe(`novato.${PASSE}`);
		expect(capturarEntrada()).toEqual({ usuario: 'novato', passe: PASSE });
	});
});

describe('6. a fiacao nos motores', () => {
	it('o LoginEngine anota TODO pedido de login, antes de conectar', () => {
		const fonte = ler('src/Engine/LoginEngine.js');
		const pedido = fonte.slice(fonte.indexOf('function onConnectionRequest('));
		expect(pedido.indexOf('pedidoDeLogin(username, password);')).toBeLessThan(pedido.indexOf('Network.connect('));
	});

	it('o LoginEngine usa a entrada antes do autoLogin do config', () => {
		const fonte = ler('src/Engine/LoginEngine.js');
		expect(fonte.indexOf('const entrada = capturarEntrada();')).toBeLessThan(
			fonte.indexOf("else if (autoLogin instanceof Array")
		);
	});

	it('o CharEngine so decide no pacote que traz a lista, e depois do setInfo', () => {
		const fonte = ler('src/Engine/CharEngine.js');
		const aceite = fonte.slice(fonte.indexOf('function onConnectionAccepted('));
		const decisao = aceite.indexOf('if (Array.isArray(pkt.charInfo) && abrirCriacaoDireto(pkt.charInfo.length)) {');
		expect(decisao).toBeGreaterThan(aceite.indexOf('ChSel.setInfo(pkt);'));
		const ramo = aceite.slice(decisao, aceite.indexOf('}', decisao));
		expect(ramo).toContain('onCreateRequest(0);');
		expect(ramo).toContain('registrarConversaoDoCadastro();');
	});

	it('a SEGUNDA lista de personagens nao poe a selecao por cima da criacao aberta', () => {
		// O char-server manda `HC_ACCEPT_ENTER_NEO_UNION` na entrada e de novo a
		// cada `CH_CHARLIST_REQ`; a prova de tela fotografou a selecao onde devia
		// estar a criacao antes desta guarda.
		const fonte = ler('src/Engine/CharEngine.js');
		const aceite = fonte.slice(fonte.indexOf('function onConnectionAccepted('));
		expect(aceite).toMatch(/if \(!CharCreate\.getUI\(\)\.__active\) \{\s*ChSel\.append\(\);\s*\}\s*ChSel\.setInfo\(pkt\);/);
	});
});
