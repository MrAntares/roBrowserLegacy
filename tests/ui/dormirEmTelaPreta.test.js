/**
 * O "DORMIR" VIRA TELA PRETA, E ACORDAR NAO PEDE LOGIN (D-1485, 15/09/2026).
 *
 * ---------------------------------------------------------------------------
 * OS TRES RELATOS DO DONO, NUMA FRASE SO
 * ---------------------------------------------------------------------------
 * *"corrija a 'experiencia de uso' do modo 'dormir'... gostaria que fosse igual
 * a tela preta do 'economia de energia' e que quando o player clicasse em
 * 'acordar agora', que nao precisasse refazer o login/senha... Ao clicar para
 * dormir tambem esta ruim, a tela nao fica preta, o personagem so fica parado...
 * poderia entrar na tela preta direto"*.
 *
 * Os tres eram DEFEITO, e nao gosto:
 *
 * 1. a tela nao ficava preta porque `showDormindo` usava `_createOverlay()`, e
 *    `.win_popup_overlay` nao tem `background` nenhum — ele barra o clique e
 *    deixa a cena inteira visivel. Com o personagem ja fora do mundo, o que
 *    sobrava era exatamente "o boneco parado" que ele descreveu;
 * 2. o login voltava porque o cliente chamava `GameEngine.reload()`, que derruba
 *    a sessao ate a lista de servidores. O `conexao.encerrar()` do SERVIDOR
 *    estava certo: o `CZ_ENTER2` da reentrada so precisa do `AuthCode`, que
 *    mora em `Session`, e o passe vale por 15 min deslizantes;
 * 3. a contagem de 5s era espera pura — o proprio texto dela dizia "o sono
 *    comeca mesmo assim", e nao havia cancelar.
 *
 * ---------------------------------------------------------------------------
 * POR QUE METADE DELE MEDE O FONTE
 * ---------------------------------------------------------------------------
 * A tela preta e DOM cru e pode ser exercitada de verdade aqui — e e o que os
 * primeiros casos fazem. Ja `MapEngine.js` nao carrega em jsdom (ele arrasta o
 * renderizador, o socket e o mundo), entao o fio do "acordar" e cobrado lendo o
 * fonte, que e o idioma que este repositorio ja usa para esse arquivo.
 *
 * Ler fonte tem um modo de falha proprio: casar uma frase que mora num
 * COMENTARIO. Por isso todo caso abaixo mede o fonte SEM comentario — sem isso,
 * este arquivo passaria so por causa da prosa que explica a mudanca.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const MOTOR = readFileSync('src/Engine/MapEngine.js', 'utf8');
const ANALISADOR = readFileSync('src/UI/Components/HuntAnalyzer/HuntAnalyzer.js', 'utf8');

/** O codigo, sem os comentarios que NARRAM o conserto. */
function semComentario(texto) {
	return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const MOTOR_CRU = semComentario(MOTOR);
const ANALISADOR_CRU = semComentario(ANALISADOR);

describe('a tela do "Dormindo..." e preta e cobre o jogo', () => {
	afterEach(() => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	});

	it('pinta PRETO e cobre o viewport inteiro', async () => {
		const { default: UIManager } = await import('UI/UIManager.js');
		const tela = UIManager.showDormindo(3 * 3600 * 1000, { expBasePorMs: 0.001, expClassePorMs: 0.0005 }, () => {});

		const capa = document.body.lastElementChild;
		expect(capa, 'nenhuma tela foi criada').toBeTruthy();
		/*
		 * O defeito era um veu TRANSPARENTE: `.win_popup_overlay` nao declara
		 * `background`, e a cena aparecia inteira por tras dele.
		 *
		 * As duas formas de escrever preto sao aceitas porque quem normaliza e o
		 * navegador, e nao nos: o jsdom devolve `rgb(0, 0, 0)` para o `#000` que
		 * o codigo escreve. Cravar uma so faria este caso reprovar no dia em que
		 * alguem trocasse a notacao sem mudar a cor.
		 */
		expect(capa.style.background, 'a tela do sono nao esta preta — e o relato do dono').toMatch(
			/^(#000(000)?|rgb\(0,\s*0,\s*0\))$/
		);
		expect(capa.style.position).toBe('fixed');
		// `0` ou `0px`: o jsdom normaliza a unidade, como o navegador.
		expect(capa.style.inset, 'a tela nao cobre o viewport inteiro').toMatch(/^0(px)?$/);

		tela.remove();
		expect(document.body.lastElementChild, 'a tela nao saiu no remove()').toBeNull();
	});

	it('mostra o tempo que falta e a EXP projetada', async () => {
		const { default: UIManager } = await import('UI/UIManager.js');
		const tela = UIManager.showDormindo(2 * 3600 * 1000, { expBasePorMs: 0.001, expClassePorMs: 0.0005 }, () => {});

		const texto = document.body.lastElementChild.textContent;
		expect(texto, 'o relogio nao aparece').toContain('02:00:00');
		expect(texto, 'a EXP projetada sumiu').toMatch(/EXP base/);
		expect(texto, 'o aviso de que da pra fechar a aba sumiu').toMatch(/fechar o jogo/i);

		tela.remove();
	});

	it('o botao pede UMA vez, mesmo com dois toques', async () => {
		const { default: UIManager } = await import('UI/UIManager.js');
		let pedidos = 0;
		const tela = UIManager.showDormindo(1000, {}, () => {
			pedidos++;
		});

		const botao = document.body.lastElementChild.querySelector('button');
		expect(botao, 'nao ha botao de acordar').toBeTruthy();
		expect(botao.textContent).toBe('Acordar agora');

		botao.dispatchEvent(new Event('click'));
		botao.dispatchEvent(new Event('click'));

		// Acordar fecha a conta do sono no servidor: mandar duas vezes e pedir
		// para acertar contas duas vezes.
		expect(pedidos, 'o segundo clique tambem pediu').toBe(1);
		expect(botao.textContent, 'o botao nao avisou que o pedido saiu').toBe('Acordando...');

		tela.remove();
	});

	it('o clique de um toque que comecou ANTES da tela nao acorda (o "Sim" do Dormir, 02/10/2026)', async () => {
		const { default: UIManager } = await import('UI/UIManager.js');
		let agora = 1_000_000;
		vi.spyOn(Date, 'now').mockImplementation(() => agora);
		// O toque no "Sim" da caixa, antes de a tela de sono existir.
		document.body.dispatchEvent(new Event('touchstart', { bubbles: true }));
		agora += 50;
		let pedidos = 0;
		const tela = UIManager.showDormindo(1000, {}, () => {
			pedidos++;
		});
		const botao = document.body.lastElementChild.querySelector('button');
		// O `click` que o navegador sintetiza daquele toque cai aqui.
		agora += 100;
		botao.dispatchEvent(new Event('click', { cancelable: true }));
		expect(pedidos, 'o clique fantasma acordou o personagem').toBe(0);
		// Um clique de verdade, passada a guarda, acorda.
		agora += 1000;
		botao.dispatchEvent(new Event('click', { cancelable: true }));
		expect(pedidos).toBe(1);
		tela.remove();
	});

	it('o toque no botao acorda e cancela o clique que o navegador sintetizaria', async () => {
		const { default: UIManager } = await import('UI/UIManager.js');
		let pedidos = 0;
		const tela = UIManager.showDormindo(1000, {}, () => {
			pedidos++;
		});
		const botao = document.body.lastElementChild.querySelector('button');
		const toque = new Event('touchstart', { bubbles: true, cancelable: true });
		botao.dispatchEvent(toque);
		expect(pedidos).toBe(1);
		expect(toque.defaultPrevented, 'o toque nao cancelou o clique sintetizado').toBe(true);
		tela.remove();
	});

	it('o botao alcanca o piso tatil — ele e a UNICA saida da tela cheia', async () => {
		const { default: UIManager } = await import('UI/UIManager.js');
		const tela = UIManager.showDormindo(1000, {}, () => {});
		const botao = document.body.lastElementChild.querySelector('button');
		expect(botao.style.minHeight).toBe('44px');
		expect(botao.style.minWidth).toBe('44px');
		tela.remove();
	});
});

describe('"Acordar agora" volta ao mundo, e nao ao login', () => {
	it('a volta do sono passa por MapEngine.init com o servidor guardado', () => {
		expect(MOTOR_CRU, 'sumiu a funcao que reentra sem senha').toContain('function voltarAoMundoDepoisDoSono()');
		const i = MOTOR_CRU.indexOf('function voltarAoMundoDepoisDoSono()');
		const corpo = MOTOR_CRU.slice(i, i + 600);
		expect(corpo, 'a reentrada nao usa o endereco guardado').toContain('MapEngine.servidorAtual');
		expect(corpo, 'a reentrada nao chama MapEngine.init').toMatch(/MapEngine\.init\(\s*servidor\.ip/);
	});

	it('o resumo do sono NAO cai no boot: ele volta ao mundo', () => {
		const i = MOTOR_CRU.indexOf('showResumoDoSono(');
		expect(i, 'sumiu a chamada do resumo').toBeGreaterThan(-1);
		const trecho = MOTOR_CRU.slice(i, i + 200);
		expect(trecho, 'o "Continuar" do resumo continua derrubando a sessao ate o login').not.toContain(
			'GameEngine.js'
		);
		expect(trecho).toContain('voltarAoMundoDepoisDoSono');
	});

	it('o reload sobrevive SO como ultimo recurso, dentro da reentrada', () => {
		/*
		 * O contrapeso: apagar o `reload()` de vez seria pior que o defeito —
		 * com o passe vencido ou o servidor fora do ar, a tela de login e a
		 * resposta honesta. O que ele nao pode mais ser e o caminho PADRAO.
		 */
		const i = MOTOR_CRU.indexOf('function voltarAoMundoDepoisDoSono()');
		const corpo = MOTOR_CRU.slice(i, i + 600);
		expect(corpo, 'o ultimo recurso sumiu: uma reentrada que falha ficaria sem saida').toContain('GameEngine.js');
	});

	it('desarma a reconexao pela porta dela, e nao escrevendo no campo', () => {
		expect(MOTOR_CRU, 'voltou a atribuicao crua em Network.onDisconnect no caminho do acordar').not.toMatch(
			/Network\.onDisconnect\s*=\s*\(\)\s*=>\s*\{\}/
		);
		expect(MOTOR_CRU).toContain('Reconexao.cancelarParaFechamentoDeliberado()');
	});

	it('o "Acordar agora" NAO usa o `cancelar()` do logout — ele deixa o gancho null e a caixa "Disconnected" abre (F09)', () => {
		/*
		 * `cancelar()` poe `Network.onDisconnect = null`, e com null o
		 * `NetworkManager.onClose` mostra "Disconnected from Server." — o OK dela
		 * manda ao login. O servidor fecha o socket logo depois do resumo do
		 * sono, entao o jogador via a caixa inglesa por cima do resumo. Este caso
		 * dizia o CONTRARIO ate 22/09/2026 (cobrava `Reconexao.cancelar()` aqui)
		 * e cimentava a regressao de a92d1df6.
		 */
		const i = MOTOR_CRU.indexOf('UIManager.showDormindo(');
		const acordar = MOTOR_CRU.slice(i, i + 1500);
		expect(acordar).toContain('Reconexao.cancelarParaFechamentoDeliberado()');
		expect(acordar).not.toMatch(/Reconexao\.cancelar\(\)/);
	});
});

describe('o botao "Dormir" saiu da Analise de caca (Novo Bot V5, 07/10/2026)', () => {
	it('a Analise nao pede mais o sono: o servidor recusa o `iniciar`, e so a tela de quem ja dormia fica', () => {
		expect(ANALISADOR_CRU).not.toContain("acao: 'iniciar'");
		expect(ANALISADOR_CRU).not.toContain('RAGIDLE_SONO_ACAO');
		expect(ANALISADOR_CRU).not.toContain('showContagemRegressiva');
	});

	it('o dono do ZC_RAGIDLE_SONO continua de pe no motor (um sono antigo ainda acorda)', () => {
		expect(MOTOR_CRU).toMatch(/Network\.hookPacket\(PACKET\.ZC\.RAGIDLE_SONO, onSonoRecebido\);/);
		expect(MOTOR_CRU.match(/hookPacket\(PACKET\.ZC\.RAGIDLE_SONO,/g)).toHaveLength(1);
	});
});

describe('reconectar dormindo nao entra em laco nem empilha telas (F10, auditoria de 22/09)', () => {
	/*
	 * Quem reconecta dormindo recebe `SONO{dormindo:true}` e NUNCA o
	 * `ACCEPT_ENTER` — o personagem nao esta no mundo. Sem avisar a reconexao,
	 * o watchdog de 8 s fechava o socket, ela tentava de novo (ate 12x), e cada
	 * tentativa somava uma tela preta por cima da anterior; "Acordar" tirava so a
	 * de cima.
	 */
	const i = MOTOR_CRU.indexOf('if (corpo.dormindo === true) {');
	const ramo = MOTOR_CRU.slice(i, MOTOR_CRU.indexOf('UIManager.showDormindo(', i) + 40);

	it('o ramo dormindo avisa a reconexao que a entrada deu certo', () => {
		expect(i).toBeGreaterThan(-1);
		expect(ramo).toContain('Reconexao.aoEntrarComSucesso()');
	});

	it('e remove a tela anterior ANTES de abrir outra', () => {
		const remove = ramo.indexOf('_janelaDoSonoAtiva.remove()');
		const abre = ramo.indexOf('UIManager.showDormindo(');
		expect(remove, 'a tela anterior nao e removida').toBeGreaterThan(-1);
		expect(abre).toBeGreaterThan(remove);
	});
});
