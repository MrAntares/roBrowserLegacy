/**
 * UI/Components/CodexIdle/CodexIdle.js
 *
 * A JANELA DO CODEX (D-851; reforma em % de 25/09/2026): o bestiario que vira
 * ponto. Os pontos nascem das missoes, do nivel de base e dos desafios diario e
 * semanal, e se gastam em NOVE eixos percentuais, com custo crescente por nivel
 * (o desenho mora em `eixosDoCodex.js`).
 *
 * Quatro escolhas de desenho, nenhuma estetica:
 *
 * 1. **A JANELA NUNCA CALCULA SALDO.** Pontos ganhos, pontos gastos, teto por
 *    eixo e bonus resultante chegam PRONTOS no retrato (ZC_RAGIDLE_CODEX,
 *    0x0fe3). Refazer a conta aqui daria a segunda copia da regra, e ela
 *    diria o numero velho no dia em que o dono mexesse no teto ou na tabela
 *    de missoes. E a mesma escolha de PasseIdle.js:9-13 e MissoesIdle.js:10-15.
 *
 * 2. **DOIS pacotes, e os dois verbos respondem com o retrato INTEIRO** —
 *    inclusive um `gastar` RECUSADO, que devolve o estado inalterado. Nao ha
 *    pacote de erro: a janela so redesenha o que chegou, e o jogador ve o
 *    saldo que nao mudou. Um ZC de recusa seria um segundo caminho a manter
 *    dizendo o que o primeiro ja diz.
 *
 * 3. **O botao "+" apaga em vez de sumir** quando falta ponto ou o eixo esta
 *    no teto — mesma escolha do botao de compra do PasseIdle. Sumir faria o
 *    jogador procurar o que fazer; apagado ele diz "existe, e falta alguma
 *    coisa". O SERVIDOR recusa de qualquer jeito (`gastarPonto` devolve null):
 *    o estado do botao e so para a janela nao mentir sobre o que o clique
 *    faria.
 *
 * 4. **A ORDEM dos eixos sai do RETRATO, e nao de uma lista escrita aqui.**
 *    A janela percorre as chaves de `gastos` — que e o objeto que o servidor
 *    montou a partir de `EIXOS_DO_CODEX`. Uma segunda lista aqui teria de ser
 *    editada junto com a de la, e o defeito mais comum deste projeto e
 *    exatamente esse: duas rotas para o mesmo dado, a segunda escrita a mao,
 *    acertando por coincidencia enquanto nada muda. Aqui so os ROTULOS sao
 *    locais, e um eixo desconhecido aparece com a sigla crua em vez de sumir
 *    da tela em silencio.
 *
 * 5. **A JORNADA DE MIDGARD E UMA ABA, E NAO UMA QUINTA SECAO** (08/09/2026).
 *    A escolha foi medida contra a alternativa, e sao quatro razoes:
 *    - a Jornada tem TRES telas proprias (o mapa-mundi com os capitulos, a
 *      lista de um capitulo e a jornada inteira). Empilhar isso abaixo dos
 *      sete eixos poria o botao "+" a uma rolagem de distancia do topo, e o
 *      "+" e a acao mais frequente desta janela;
 *    - as missoes de um capitulo pedem um PACOTE
 *      (`{acao:'capitulo'}`): como secao, toda abertura da janela cobraria
 *      essa viagem de rede de quem so queria gastar um ponto;
 *    - o retrato ja separa os dois assuntos (`missoes` do Codex contra
 *      `jornada`), e uma aba e o espelho disso na tela;
 *    - o projeto ja tem o padrao de aba LEMBRADA (`memoriaDeAba.js`, D-797),
 *      entao quem vive na Jornada reabre na Jornada, inclusive depois do F5 e
 *      da troca de personagem.
 *    O que a aba NAO faz e mexer no que ja existia: os sete eixos, o saldo, o
 *    botao "+", as frases de recusa e a ordem vinda do retrato continuam
 *    exatamente como estavam, na aba "Codex".
 *
 * Entrada na HUD: o botao "Codex" do leque (TopMenuIdle), que chama
 * CodexIdle.toggle().
 *
 * @author RagIdle
 */

import Renderer from 'Renderer/Renderer.js';
import Preferences from 'Core/Preferences.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import Session from 'Engine/SessionStorage.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import HuntMap from 'UI/Components/HuntMap/HuntMap.js';
import MissoesIdle from 'UI/Components/MissoesIdle/MissoesIdle.js';
// Quem responde "isto e um celular em pe?" no projeto inteiro (D-929).
import { ehCelularEmPe } from 'UI/hudVertical.js';
import { jornadaHtml } from './jornadaHtml.js';
// D-1986: o parcial ao vivo e a validade do cache de capitulos.
import { aplicarParcialDoCodex, ehParcialDoCodex, juntarPaginaDoCapitulo, pedidoDeAbertura, pedidoDeFechamento, precisaPedirCapitulo } from './codexAoVivo.js';
import { placarHtml, eixosHtml, desafiosHtml, retratoDoCodexAceito } from './eixosDoCodex.js';
import { missoesGeraisHtml, cliqueDeMissoesGerais, SUBABA_PADRAO } from './missoesGeraisHtml.js';
import { entradaOcultavel, entradasVisiveis, estrelaDoCodexHtml, faixaDeMarcacaoHtml, marcadasDoRetrato, pedidoDaEstrela } from './marcacaoDoCodex.js'; // D-1839, D-1853
import htmlText from './CodexIdle.html?raw';
import cssText from './CodexIdle.css?raw';
// O "IR AO MAPA" da aba Missoes Gerais (26/09/2026) — o fluxo e o desenho sao
// os mesmos da janela de Missoes.
import { fecharEscolha, pedirOndeCai } from '../MissoesIdle/escolhaDeMapa.js';
import escolhaCss from '../MissoesIdle/escolhaDeMapa.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';

/** Manter em sincronia com o ":host"/".cx-window" do CSS (mesmo papel do
 * WINDOW_WIDTH/HEIGHT de PasseIdle.js:51-52). */
/*
 * +10% (16/09/2026, pedido do dono: "achando a janela pequena, da para
 * aumentar +10%"). 520x600 e o tamanho de familia que Intro/Mochila/Passe/
 * ShortCutOption tambem usam - esta janela sai dele de proposito, porque foi
 * ESTA que ele apontou. 572x660, arredondado ao pixel.
 */
const WINDOW_WIDTH = 572;
const WINDOW_HEIGHT = 660;

/**
 * As tres abas da janela.
 *
 * `codex` ("Codex & Missões" no HTML) e a aba de sempre: as missoes do
 * bestiario (onde os pontos nascem) e os sete eixos (onde eles se gastam),
 * empilhados na mesma rolagem. O merge com origin/master (16/09/2026) tinha
 * trazido a divisao independente da outra frente em `bestiario`+`status`
 * (duas abas separadas) — o dono pediu para DESFAZER esse split e voltar a
 * uma aba so, renomeada para deixar claro que ela cobre os dois assuntos.
 * `missoes` e a integracao da janela MissoesIdle (16/09/2026, "Missões
 * Gerais" no HTML) — uma janela DIFERENTE do bestiario, com o proprio nome
 * desde o pedido do dono ("ele sera uma aba 'Missões Gerais'"). `jornada` e a
 * Jornada de Midgard, sem equivalente no `codex`.
 */
const ABAS = ['codex', 'missoes', 'jornada'];
const ABA_PADRAO = 'codex';

/**
 * As telas da aba Jornada.
 *
 * `mapa` e a porta: o mapa-mundi com os capitulos como lugares, no papel do
 * "World Map" da referencia. `jornada` e a lista inteira, com o proximo passo
 * marcado. `capitulo` e o desenho do painel de missoes da referencia (avatar,
 * contador escrito, recompensa, uma acao). `especie` e a ponte que responde
 * "onde mais este bicho aparece".
 */
const VISTA_PADRAO = 'mapa';

const CodexIdle = new GUIComponent('CodexIdle', cssText + '\n' + escolhaCss);

CodexIdle.render = () => htmlText;

/** Janela fechada nao pode engolir clique de cena — par do
 * ":host{pointer-events:none}" do CSS. */
CodexIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/** O ultimo retrato que o servidor mandou (contrato v1 de ZC_RAGIDLE_CODEX). */
CodexIdle.estado = null;

/** A aba em que o jogador esta. Preferencia da PESSOA, nao do personagem. */
CodexIdle.aba = ABA_PADRAO;

/** A tela da aba Jornada: 'mapa' | 'jornada' | 'capitulo' | 'especie'. */
CodexIdle.vista = VISTA_PADRAO;

/** O capitulo aberto na tela `capitulo`, e a especie aberta na tela `especie`. */
CodexIdle.capituloAberto = null;
CodexIdle.especieAberta = null;

/**
 * O ESTADO DA ABA "MISSOES GERAIS" (16/09/2026) — todo local, nada
 * persistido. A subaba Principais/Opcionais nasce sempre em Principais a
 * cada sessao; `MissoesIdle` persiste a PROPRIA preferencia dela
 * (`_preferences.aba`, privada do modulo), e ler aquele campo daqui exigiria
 * exportar um detalhe interno so para isto — simplificacao deliberada, sem
 * perda: e um clique para trocar.
 */
CodexIdle.vistaDeMissoes = 'lista';
CodexIdle.missaoAberta = null;
CodexIdle.subabaDeMissoes = SUBABA_PADRAO;

/**
 * AS MISSOES QUE JA CHEGARAM, por capitulo.
 *
 * Elas NAO descem todas de uma vez: sao centenas, e o campo de tamanho do
 * protocolo e u16. O servidor manda as de UM capitulo por vez, a pedido
 * (`{acao:'capitulo'}`), e a janela acumula aqui. Acumular e o que faz a
 * ponte por especie existir sem um verbo novo: ela le deste indice.
 */
CodexIdle.missoesPorCapitulo = {};

/** O capitulo cujo pedido esta EM VOO - a resposta vazia nao diz de quem e. */
let _capituloEmVoo = null;

/** A fila da varredura por especie (os capitulos que faltam carregar). */
let _filaDaVarredura = [];

/** D-1986: o dedo esta apertado no corpo, e um parcial chegou no meio. */
let _apertadoNoCorpo = false;
let _desenhoAdiado = false;

/**
 * A ASSINATURA de `MissoesIdle.missoes`/`.execucao` NO ULTIMO REDESENHO desta
 * aba — mesmo idioma de `MissoesTrackerIdle.js:renderSeMudou`. `null` de
 * proposito (nao `''`) para o primeiro poll SEMPRE redesenhar, mesmo se o
 * dado mandado for igual ao residuo de uma sessao anterior.
 */
let _assinaturaDeMissoes = null;

/** O relogio do poll — vive so enquanto a JANELA esta anexada (onAppend
 * liga, onRemove desliga), igual `MissoesTrackerIdle.js`. */
let _pollDeMissoes = null;

const _preferences = Preferences.get(
	'CodexIdle',
	{
		x: null,
		y: null,
		// A aba lembrada (08/09/2026), pelo contrato de memoriaDeAba.js: chave nova nos
		// padroes nao exige subir a versao.
		aba: null,
		// Ocultar as missoes concluidas (08/09/2026).
		ocultarConcluidas: false
	},
	1.0
);

function _root() {
	return CodexIdle._shadow || CodexIdle._host;
}

/** Mesmo helper privado de PasseIdle.js / MissoesIdle.js / IdleConfig.js. */
function escapeHtml(value) {
	return String(value == null ? '' : value).replace(/[&<>"']/g, ch => {
		switch (ch) {
			case '&':
				return '&amp;';
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '"':
				return '&quot;';
			default:
				return '&#39;';
		}
	});
}

/**
 * ESQUECE O PERSONAGEM ANTERIOR — ver a nota gemea em PasseIdle.js.
 * `cleanGameUI()` nao limpa componentes RAGIDLE por varredura, e a troca de
 * personagem nao recarrega a pagina: sem isto, o Codex de um personagem
 * apareceria na janela do outro ate o primeiro pedido voltar. O nome deste
 * componente TEM de estar na lista escrita a mao do `cleanGameUI` em
 * Engine/MapEngine.js — declarar a funcao sem entrar na lista deixa um metodo
 * que ninguem chama, que ja aconteceu.
 */
/*
 * ZERAR O DADO NAO BASTA — a janela tem de FECHAR e ESQUECER o desenho.
 *
 * `GUIComponent.remove()` apenas DESANEXA o host: o shadow DOM inteiro
 * sobrevive a troca de personagem, e `prepare()` e guardado por `__loaded`.
 * Zerando so `CodexIdle.estado`, o `.cx-body` continua com o HTML do
 * personagem ANTERIOR e o `.cx-window` continua com `is-open` — na volta ao
 * mapa a janela reaparece aberta, mostrando o Codex de outro personagem ate a
 * primeira resposta chegar.
 *
 * O Codex e POR PERSONAGEM (D-851): mostrar o retrato de um no outro e
 * exatamente a confusao que aquela decisao existe para evitar.
 *
 * (Achado da auditoria de 29/08/2026, FECHADO em 30/08. A nota que estava
 * aqui dizia que as outras janelas tinham a mesma forma e que consertar era
 * "de outra rodada" — e ela ficou um dia inteiro sendo pendencia vestida de
 * nota historica. As nove foram consertadas, o miolo virou `fecharEEsquecer`,
 * e ha portao cobrando a chamada.)
 */
CodexIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	CodexIdle.estado = null;
	/*
	 * As missoes da Jornada e o `abates` de cada uma sao DO PERSONAGEM: deixar
	 * o indice de pe mostraria o progresso de um na tela do outro, que e a
	 * confusao inteira que esta funcao existe para evitar. A ABA nao entra
	 * aqui, pelo mesmo motivo escrito em MissoesIdle: aba e escolha da pessoa.
	 */
	CodexIdle.missoesPorCapitulo = {};
	CodexIdle.vista = VISTA_PADRAO;
	CodexIdle.capituloAberto = null;
	CodexIdle.especieAberta = null;
	CodexIdle.vistaDeMissoes = 'lista';
	CodexIdle.missaoAberta = null;
	CodexIdle.subabaDeMissoes = SUBABA_PADRAO;
	_capituloEmVoo = null;
	_filaDaVarredura = [];
	_assinaturaDeMissoes = null;
	CodexIdle.aba = abaLembrada(_preferences, ABA_PADRAO, ABAS);
	// A peca compartilhada (auditoria de 30/08/2026). O miolo que estava aqui
	// virou `fecharEEsquecer`, e as outras nove janelas — que a nota abaixo
	// registrava como conhecidas e nao consertadas — passaram a chama-la.
	fecharEEsquecer(_root(), '.cx-window', { corpo: '.cx-body', texto: 'Carregando…' });
};

CodexIdle.init = function init() {
	const root = _root();
	// A aba em que o jogador estava, ANTES do render() la embaixo.
	CodexIdle.aba = abaLembrada(_preferences, ABA_PADRAO, ABAS);
	// Guardas nos querySelector, pelo motivo registrado em
	// ClassChangeNotice.js:68-88 e repetido em PasseIdle.js:133-136: este init
	// roda dentro de MapEngine.init, e uma excecao aqui derruba o motor de
	// mapa inteiro. A janela e cosmetica; o que ela nao pode e custar o mundo.
	const fechar = root && root.querySelector('.cx-close');
	if (fechar) {
		fechar.addEventListener('click', onClickClose);
	}
	if (root) {
		const titulo = root.querySelector('.cx-titlebar');
		if (titulo) {
			this.draggable(titulo);
		}
		// Os botoes "+" sao redesenhados a cada retrato, entao o listener mora
		// no CORPO e olha o alvo — um listener por render vazaria sete a cada
		// resposta do servidor.
		const corpo = root.querySelector('.cx-body');
		if (corpo) {
			corpo.addEventListener('click', onClickCorpo);
			/*
			 * D-1986: O PARCIAL NAO REDESENHA DEBAIXO DO DEDO. Com a janela
			 * aberta o corpo renasce a cada ~1,5 s enquanto o jogador caca; um
			 * redesenho entre o apertar e o soltar trocaria o botao por outro
			 * no e o clique se perderia. Com o dedo (ou o mouse) apertado no
			 * corpo, o parcial so guarda o dado, e o desenho sai no soltar.
			 */
			corpo.addEventListener('pointerdown', () => {
				_apertadoNoCorpo = true;
			});
			const soltar = () => {
				if (!_apertadoNoCorpo) {
					return;
				}
				_apertadoNoCorpo = false;
				if (_desenhoAdiado) {
					_desenhoAdiado = false;
					// Depois do `click` que vem logo atras do soltar.
					setTimeout(render, 0);
				}
			};
			window.addEventListener('pointerup', soltar, true);
			window.addEventListener('pointercancel', soltar, true);
		}
		// As duas abas sao FIXAS no HTML (nao renascem a cada retrato), entao
		// aqui o listener pode ser por botao.
		root.querySelectorAll('.cx-tab').forEach(btn => {
			btn.addEventListener('click', onClickAba);
		});
	}

	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';

	render();
};

CodexIdle.onAppend = function onAppend() {
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - WINDOW_HEIGHT) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - WINDOW_WIDTH) + 'px';
	}
	/*
	 * O POLL DA ABA "MISSOES GERAIS" (16/09/2026) — mesmo idioma de
	 * `MissoesTrackerIdle.js`: `Network.hookPacket` sobrescreve o handler do
	 * pacote, entao fisgar `ZC_RAGIDLE_MISSOES` aqui roubaria `MissoesIdle`.
	 * Em vez disso, esta aba LE `MissoesIdle.missoes`/`.execucao` a cada
	 * 250ms e so redesenha quando a assinatura muda — e SO quando esta aba
	 * esta na tela, para nao gastar ciclo nenhum enquanto o jogador olha o
	 * Codex ou a Jornada.
	 */
	if (_pollDeMissoes) {
		clearInterval(_pollDeMissoes);
	}
	_pollDeMissoes = setInterval(renderMissoesSeMudou, 250);
};

CodexIdle.onRemove = function onRemove() {
	savePosition();
	if (_pollDeMissoes) {
		clearInterval(_pollDeMissoes);
		_pollDeMissoes = null;
	}
};

function savePosition() {
	_preferences.x = parseInt(CodexIdle._host.style.left, 10) || 0;
	_preferences.y = parseInt(CodexIdle._host.style.top, 10) || 0;
	_preferences.save();
}

/** Manda um verbo ao servidor. Os dois respondem com o retrato inteiro. */
function enviarAcao(corpo) {
	const pkt = new PACKET.CZ.RAGIDLE_CODEX_ACAO();
	pkt.json = JSON.stringify(corpo);
	Network.sendPacket(pkt);
}

/** Abre/fecha; ao abrir, pede o retrato ao servidor. */
CodexIdle.toggle = function toggle() {
	const root = _root();
	const win = root && root.querySelector('.cx-window');
	if (!win) {
		return;
	}
	if (win.classList.contains('is-open')) {
		closeWindow();
	} else {
		win.classList.add('is-open');
		CodexIdle.focus();
		/*
		 * D-1986: ABRIR E VER O NUMERO DE AGORA. As missoes de capitulo
		 * guardadas na abertura anterior sao do passado - o relato era "so
		 * atualiza quando desloga e loga". O indice recomeca vazio, e o
		 * `pedir` leva `aberta: true`: com a janela aberta o servidor empurra
		 * o que muda (o parcial `v: 3`) ate o `fechar` de `closeWindow`.
		 */
		CodexIdle.missoesPorCapitulo = {};
		_capituloEmVoo = null;
		_filaDaVarredura = [];
		enviarAcao(pedidoDeAbertura());
		aoEntrarNaAba();
	}
};

/**
 * O que cada aba precisa PEDIR ao entrar.
 *
 * O `pedir` acima ja traz o retrato inteiro, e com ele os capitulos - o mapa e
 * a jornada inteira desenham so com isso. O que a Jornada pede a mais e o
 * CATALOGO de mapas, e nao por causa do desenho: e para o botao de viagem
 * saber dizer "este mapa abre no Nv. X" em vez de nao fazer nada. Ver
 * `motivoDeNaoViajar`.
 */
function aoEntrarNaAba() {
	/*
	 * "MISSOES GERAIS" PEDE O MESMO PACOTE QUE `MissoesIdle.toggle()` MANDA
	 * (`CZ_RAGIDLE_PEDIR_MISSOES`). O servidor tambem EMPURRA sem pedido (no
	 * level up e na troca de classe — cabecalho de `MissoesIdle.js`), mas
	 * quem nunca abriu a janela MissoesIdle nesta sessao pode chegar aqui com
	 * `MissoesIdle.missoes` ainda vazio; pedir de novo e barato e idempotente
	 * — o MESMO gatilho que a janela separada ja usava.
	 */
	if (CodexIdle.aba === 'missoes') {
		Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_MISSOES());
		return;
	}
	if (CodexIdle.aba !== 'jornada') {
		return;
	}
	if (typeof HuntMap.pedirCatalogoSeFaltar === 'function') {
		HuntMap.pedirCatalogoSeFaltar();
	}
	if (CodexIdle.vista === 'capitulo' && CodexIdle.capituloAberto) {
		pedirCapitulo(CodexIdle.capituloAberto, true);
	}
	// A ponte por especie le TODOS os capitulos: a varredura recomeca pelo que
	// falta (depois da abertura, todos).
	if (CodexIdle.vista === 'especie' && Number.isFinite(CodexIdle.especieAberta)) {
		abrirEspecie(CodexIdle.especieAberta);
	}
}

function onClickAba(e) {
	e.stopImmediatePropagation();
	const aba = e.currentTarget.dataset.aba;
	if (!aba || aba === CodexIdle.aba) {
		return;
	}
	CodexIdle.aba = aba;
	lembrarAba(_preferences, aba);
	aoEntrarNaAba();
	render();
}

function closeWindow() {
	const root = _root();
	const win = root && root.querySelector('.cx-window');
	if (win) {
		// D-1986: so quem estava aberta avisa (o servidor para o ao vivo).
		if (win.classList.contains('is-open')) {
			enviarAcao(pedidoDeFechamento());
		}
		win.classList.remove('is-open');
	}
	// A escolha de mapa mora ao lado da janela: fecha junto (26/09/2026).
	fecharEscolha(JANELA_DO_CODEX);
	// D-1839: o realce vindo do rastreador vale so para esta abertura.
	_entradaRealcada = null;
	_entradaARealcar = null;
	savePosition();
}

function onClickClose(e) {
	e.stopImmediatePropagation();
	closeWindow();
}

/**
 * Delegacao no CORPO. O corpo inteiro renasce a cada retrato, entao um
 * listener por botao vazaria dezenas por resposta do servidor - o mesmo
 * motivo pelo qual o "+" ja era delegado.
 *
 * A ordem importa: o alvo mais especifico primeiro. Um `.cx-jor-alvo` mora
 * DENTRO de uma linha de missao que tambem e clicavel, e `closest` acharia a
 * linha se ela viesse antes. O RESGATE (D-1232) tambem vem cedo pelo mesmo
 * motivo: e um botao dentro do corpo, e um `closest('.cx-mais')` num clique
 * nele devolveria `null` - o `return` de baixo engoliria o clique em
 * silencio.
 */
function onClickCorpo(e) {
	const alvo = e.target && e.target.closest ? e.target : null;
	/*
	 * A ESTRELA (D-1839) vem PRIMEIRO: ela mora dentro da linha da entrada, e
	 * os outros ganchos de clique procuram pela linha. O servidor decide o teto
	 * e responde com o retrato (a estrela acende) ou com o motivo da recusa.
	 */
	const estrela = alvo && alvo.closest('.cx-marcar');
	if (estrela) {
		e.stopImmediatePropagation();
		const id = estrela.dataset.marcar;
		if (id) {
			// D-1853: o estado que a estrela vai assumir (idempotente no servidor).
			enviarAcao(pedidoDaEstrela(id, estrela.getAttribute('aria-pressed') === 'true'));
		}
		return;
	}
	if (alvo && cliqueDeMissoesGerais(e, alvo, GANCHOS_DE_MISSOES)) {
		return;
	}
	if (alvo && cliqueDaJornada(e, alvo)) {
		return;
	}
	const resgatar = e.target && e.target.closest && e.target.closest('.cx-resgatar');
	if (resgatar) {
		e.stopImmediatePropagation();
		const id = resgatar.dataset.resgatar;
		if (!id) {
			return;
		}
		/*
		 * AQUI O BOTAO TRAVA, ao contrario do "+" logo abaixo — e a diferenca
		 * e a mesma que o comentario dele explica: dois cliques no "+" QUEREM
		 * dizer dois pontos, e dois cliques em "Resgatar" querem dizer um
		 * resgate so. O servidor ja recusa o segundo (`ja-paga`), entao isto e
		 * conforto e nao seguranca: o botao para de responder ate o retrato
		 * novo chegar e redesenhar a lista sem ele.
		 */
		resgatar.disabled = true;
		enviarAcao({ acao: 'resgatar', id: id });
		return;
	}
	const ocultar = e.target && e.target.closest && e.target.closest('[data-action="cx-ocultar"]');
	if (ocultar) {
		e.stopImmediatePropagation();
		_preferences.ocultarConcluidas = !!ocultar.checked;
		_preferences.save();
		render();
		return;
	}
	const botao = e.target && e.target.closest && e.target.closest('.cx-mais');
	if (!botao || botao.disabled) {
		return;
	}
	e.stopImmediatePropagation();
	const eixo = botao.dataset.eixo;
	if (!eixo) {
		return;
	}
	/*
	 * O BOTAO NAO TRAVA ATE A RESPOSTA, ao contrario do de compra do
	 * PasseIdle — e a diferenca e deliberada.
	 *
	 * La o clique gastava CASH, e dois cliques rapidos cobrariam duas vezes
	 * uma coisa que o jogador quis uma vez so. Aqui cada clique gasta
	 * exatamente 1 ponto: dois cliques QUEREM dizer dois pontos, e travar
	 * obrigaria a esperar a viagem de rede a cada ponto para distribuir cinco.
	 *
	 * O caso da borda tambem esta coberto: com 1 ponto e dois cliques, o
	 * segundo chega ao servidor sem saldo e cai na recusa — que devolve o
	 * retrato real. Nada e gasto a mais, e a tela se corrige sozinha.
	 */
	enviarAcao({ acao: 'gastar', eixo: eixo });
}

/* ------------------------------------------------------------------ */
/* O desenho                                                           */
/* ------------------------------------------------------------------ */


/**
 * A lista de missoes: monstro, progresso POR ESPECIE, e o que falta.
 *
 * ---------------------------------------------------------------------------
 * POR QUE A LINHA POR ESPECIE ENTROU (D-1231, 08/09/2026)
 * ---------------------------------------------------------------------------
 * Relato do alfa: *"a contagem de monstros nas missoes parece incorreta"*,
 * comparando o Hunt Analyzer com a entrada "Bichos Barulhentos" e concluindo
 * que seriam *"75 de cada especie para completar os 150"*.
 *
 * A regra cadastrada nao e nenhuma das duas: sao alvos DIFERENTES por especie —
 * na FONTE, 50 Muka e 100 PecoPeco, somando 150. Esta janela desenhava so a
 * soma, entao quem matasse 150 PecoPeco e nenhum Muka via `100 / 150` — o
 * contador de PecoPeco parou no alvo dele — enquanto o Hunt Analyzer, que conta
 * TODA morte, mostrava 150. Dois numeros verdadeiros sobre coisas diferentes, e
 * nada na tela dizendo qual era qual.
 *
 * **Os numeros da tela hoje sao outros** (colisao 21, 09/09/2026): D-1207/D-1210
 * escalaram o TOTAL da missao e o repartem na proporcao da fonte, entao esta
 * entrada pede 333 Muka e 667 PecoPeco. O conserto e o mesmo, e a assimetria
 * que ele mostra ficou maior.
 *
 * A barra somada FICA (ela e o progresso da entrada, e e o que o jogador
 * reconhece), e embaixo dela vai uma linha por especie com `n / alvo` e o que
 * falta. `falta` vem do servidor pronto — a janela nao subtrai nada.
 */

/**
 * RAGIDLE (08/09/2026, ordem do dono): a lista sai da MENOR quantidade para a
 * maior (o total da missao; empate pelo titulo), e as concluidas podem ser
 * ocultadas — o interruptor fica gravado nas preferencias.
 */
function ordenarMissoes(missoes) {
	return missoes.slice().sort((a, b) => (Number(a.alvo) || 0) - (Number(b.alvo) || 0) || String(a.titulo || '').localeCompare(String(b.titulo || ''), 'pt-BR'));
}

function missoesHtml(estado) {
	const todas = Array.isArray(estado.missoes) ? estado.missoes : [];
	if (todas.length === 0) {
		return '<div class="cx-vazio">Nenhuma missao no catalogo.</div>';
	}
	const ocultar = !!_preferences.ocultarConcluidas;
	// D-1853: o numero ao lado do interruptor e o que ele esconde - a cumprida
	// com premio a resgatar fica na lista (o "Resgatar!" do rastreador leva a ela).
	const concluidas = todas.filter(m => entradaOcultavel(m, _entradaRealcada)).length;
	// D-1839: as entradas que o jogador acompanha no rastreador da HUD.
	const marcadas = new Set(marcadasDoRetrato(estado));
	const missoes = ordenarMissoes(entradasVisiveis(todas, ocultar, _entradaRealcada));
	const barra =
		'<label class="cx-ocultar"><input type="checkbox" data-action="cx-ocultar"' +
		(ocultar ? ' checked' : '') +
		' /> Ocultar concluidas' +
		(concluidas ? ' <span class="cx-ocultar-n">(' + escapeHtml(concluidas) + ')</span>' : '') +
		'</label>';
	if (missoes.length === 0) {
		return barra + '<div class="cx-vazio">Todas as missoes estao concluidas.</div>';
	}
	return (
		faixaDeMarcacaoHtml(estado) +
		barra +
		'<div class="cx-missoes">' +
		missoes
			.map(m => {
				const alvo = Number(m.alvo) || 0;
				const abates = Number(m.abates) || 0;
				// O servidor ja limita `abates` ao alvo; o teto aqui e da
				// LARGURA, nao do dado — uma barra de 130% desenhada por cima
				// da moldura seria defeito visual de um retrato legitimo.
				const pct = alvo > 0 ? Math.min(100, Math.round((abates / alvo) * 100)) : 0;
				const marca = m.cumprida ? '<span class="ri-badge ri-badge--verde">Cumprida</span>' : '';
				// O SELO DE NOVIDADE (D-1232): a mesma informacao que a bolinha
				// do menu, dentro da janela — sem ele o jogador abriria o Codex
				// por causa do ponto vermelho e teria de caçar qual entrada
				// mudou numa lista de 62.
				const selo = m.novidade ? '<span class="ri-badge ri-badge--ouro cx-selo-novo">Novo</span>' : '';
				// O NOME é o `titulo` da entrada (D-1110). Ele deixou de ser o
				// nome de um monstro: uma entrada pode pedir três espécies
				// ("Família Orc"), e mostrar só a primeira mentiria sobre o que
				// falta. As espécies vão nas linhas de baixo, com o progresso de
				// cada uma (D-1231) E como BOTAO — a ponte entrada -> missoes
				// daquela especie (08/09/2026): leva a lista de todos os mapas e
				// objetivos da Jornada daquele `mobId`. Uma especie que vive em
				// varios mapas tem UMA entrada aqui e varias missoes la, e este e
				// o unico caminho que liga as duas sem o jogador ter de adivinhar
				// em que capitulo procurar. As duas classes convivem no mesmo
				// elemento (`cx-especie` para o desenho, `cx-ponte-especie` para
				// o clique em `cliqueDaJornada`) em vez de duplicar a linha.
				const linhasDeEspecie =
					Array.isArray(m.alvos) && m.alvos.length > 0
						? m.alvos
								.map(a => {
									const feitos = Number(a.abates) || 0;
									const meta = Number(a.alvo) || 0;
									const falta = Number(a.falta) || 0;
									return (
										'<button type="button" class="cx-especie cx-ponte-especie' +
										(a.cumprida ? ' is-ok' : '') +
										'" data-mobid="' +
										escapeHtml(a.mobId == null ? '' : a.mobId) +
										'" title="Ver as missões da Jornada desta espécie">' +
										'<span class="cx-especie-nome">' +
										escapeHtml(a.monstro) +
										'</span>' +
										'<span class="cx-especie-conta">' +
										escapeHtml(feitos) +
										' / ' +
										escapeHtml(meta) +
										'</span>' +
										'<span class="cx-especie-falta">' +
										(a.cumprida ? 'completo' : 'faltam ' + escapeHtml(falta)) +
										'</span></button>'
									);
								})
								.join('')
						: '';
				// O que a entrada paga ALÉM do ponto — vazio nas oito de D-851.
				const premio = Array.isArray(m.recompensas)
					? m.recompensas
							.map(r =>
								r.tipo === 'zeny'
									? r.quantidade + ' zeny'
									: r.tipo === 'expBase'
										? r.quantidade + ' EXP de base'
										: r.tipo === 'expClasse'
											? r.quantidade + ' EXP de classe'
											: ''
							)
							.filter(Boolean)
							.join(' · ')
					: '';
				/*
				 * O BOTAO DE RESGATE (D-1232) só existe quando o servidor diz
				 * `aResgatar`. Ele NÃO é derivado de `cumprida && premio`: o
				 * servidor é quem sabe o que já foi pago (`pagas`), e uma janela
				 * que decidisse sozinha mostraria o botão de novo depois de um
				 * resgate que ela ainda não viu.
				 */
				const resgate = m.aResgatar
					? '<button type="button" class="cx-resgatar ri-btn ri-btn--primario" ' +
						'data-resgatar="' +
						escapeHtml(m.id) +
						'">Resgatar</button>'
					: '';
				return (
					'<div class="cx-missao' +
					(m.cumprida ? ' is-cumprida' : '') +
					(m.novidade ? ' is-novidade' : '') +
					'" data-entrada="' +
					escapeHtml(m.id || '') +
					'" data-mobids="' +
					escapeHtml((Array.isArray(m.alvos) ? m.alvos : []).map(a => a.mobId).join(',')) +
					'">' +
					'<span class="cx-missao-nome">' +
					// A estrela nao aparece na entrada ja encerrada (cumprida e
					// sem premio pendente): nao ha o que acompanhar, e o servidor
					// recusaria a marcacao.
					(m.cumprida && !m.aResgatar ? '' : estrelaDoCodexHtml(m.id, marcadas.has(m.id))) +
					escapeHtml(m.titulo || m.monstro || '') +
					' ' +
					marca +
					selo +
					'</span>' +
					(linhasDeEspecie
						? '<div class="cx-especies">' + linhasDeEspecie + '</div>'
						: '') +
					(premio ? '<span class="cx-missao-premio">+1 ponto · ' + escapeHtml(premio) + '</span>' : '') +
					'<span class="cx-missao-progresso">' +
					escapeHtml(abates) +
					' / ' +
					escapeHtml(alvo) +
					'</span>' +
					'<div class="ri-bar ri-bar--exp cx-missao-barra">' +
					'<div class="fill" style="width:' +
					pct +
					'%"></div></div>' +
					resgate +
					'</div>'
				);
			})
			.join('') +
		'</div>'
	);
}


function render() {
	const root = _root();
	if (!root) {
		return;
	}

	const estado = CodexIdle.estado;

	const saldo = root.querySelector('.cx-saldo-valor');
	if (saldo) {
		saldo.textContent = String((estado && estado.pontos && estado.pontos.disponiveis) || 0);
	}

	root.querySelectorAll('.cx-tab').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.aba === CodexIdle.aba);
	});

	const corpo = root.querySelector('.cx-body');
	if (!corpo) {
		return;
	}

	/*
	 * "MISSOES GERAIS" NAO DEPENDE DO RETRATO DO CODEX — sai ANTES da guarda
	 * `if (!estado)` logo abaixo, de proposito. Os dados desta aba vem de
	 * `ZC_RAGIDLE_MISSOES` (via `MissoesIdle`), um pacote TOTALMENTE
	 * diferente de `ZC_RAGIDLE_CODEX`; gatilhar esta aba na chegada do
	 * retrato ERRADO faria quem abrisse a janela direto nela ficar presa em
	 * "Carregando…" ate o Codex responder, mesmo com as missoes ja na mao.
	 */
	if (CodexIdle.aba === 'missoes') {
		corpo.innerHTML = missoesGeraisHtml(contextoDeMissoesGerais());
		return;
	}

	if (!estado) {
		corpo.innerHTML = '<div class="cx-carregando">Carregando…</div>';
		return;
	}

	if (CodexIdle.aba === 'jornada') {
		corpo.innerHTML = jornadaHtml(estado, contextoDaJornada());
		return;
	}

	// A aba "Codex & Missões" (16/09/2026, DESFEITO o split de origin/master a
	// pedido do dono): chegando aqui so resta 'codex' — 'missoes' (Missões
	// Gerais) e 'jornada' ja saíram por cima (linhas 865 e 875). As missoes do
	// bestiario e os sete eixos voltam a empilhar na mesma rolagem, como era
	// antes do split.
	corpo.innerHTML =
		placarHtml(estado) +
		'<div class="cx-secao"><div class="cx-secao-titulo">Onde os pontos nascem</div>' +
		missoesHtml(estado) +
		'</div>' +
		'<div class="ri-divisor"></div>' +
		'<div class="cx-secao"><div class="cx-secao-titulo">Desafios (pontos todo dia e toda semana)</div>' +
		desafiosHtml(estado) +
		'</div>' +
		'<div class="ri-divisor"></div>' +
		'<div class="cx-secao"><div class="cx-secao-titulo">Onde gastar</div>' +
		eixosHtml(estado) +
		'</div>';
	realcarEntradaPedida(corpo);
}

/* ------------------------------------------------------------------ */
/* A JORNADA DE MIDGARD - o que so a janela sabe                       */
/* ------------------------------------------------------------------ */
/*
 * O DESENHO mora em `jornadaHtml.js`, e a razao esta escrita la: assim ele e
 * FOTOGRAFAVEL sem o cliente inteiro de pe, e a prova de tela mede o codigo
 * que roda no jogo em vez de uma copia feita para o arnes.
 *
 * O que fica aqui e o que so existe com o jogo rodando: a sessao (nivel,
 * morte, mapa atual), o catalogo do Mapa de Caca e o que ja chegou do
 * servidor. Eles entram la como ARGUMENTO.
 */

/** O que o cliente sabe hoje sobre o proprio personagem, para a viagem. */
function situacaoDoJogador() {
	const entidade = Session && Session.Entity;
	const vida = entidade && entidade.life;
	const mapa = MapRenderer && MapRenderer.currentMap ? String(MapRenderer.currentMap) : '';
	return {
		nivelDoJogador: (entidade && Number(entidade.clevel)) || 0,
		// A regra do `DeathWindow`: `hp_max > 0` e o que separa "cadaver" de
		// "os pacotes de vida ainda nao chegaram" (a entidade nasce com -1).
		morto: !!(vida && Number(vida.hp_max) > 0 && Number(vida.hp) <= 0),
		mapaAtual: mapa.replace(/\.gat$/i, '')
	};
}

/** O nivel em que um mapa abre, lido do catalogo do Mapa de Caca. */
function nivelQueAbre(mapa) {
	if (typeof HuntMap.mapaDoCatalogo !== 'function') {
		return null;
	}
	const doCatalogo = HuntMap.mapaDoCatalogo(mapa);
	return doCatalogo && Number.isFinite(Number(doCatalogo.nivelQueAbre)) ? Number(doCatalogo.nivelQueAbre) : null;
}

/** O contexto que `jornadaHtml.js` precisa, montado do estado vivo da janela. */
function contextoDaJornada() {
	return {
		estado: CodexIdle.estado,
		vista: CodexIdle.vista,
		capituloAberto: CodexIdle.capituloAberto,
		especieAberta: CodexIdle.especieAberta,
		missoesPorCapitulo: CodexIdle.missoesPorCapitulo,
		situacao: situacaoDoJogador(),
		nivelQueAbre: nivelQueAbre,
		faltamNaVarredura: _filaDaVarredura.length,
		/*
		 * NO CELULAR EM PE NAO HA MAPA (decisao do dono, 16/09/2026):
		 * *"em vez da gente perder tempo fazendo um mapa e nao ficar legal,
		 * fazer so uma lista mesmo, simples"*.
		 *
		 * O mapa-mundi tem 1456 px de largura e vive de distancia entre
		 * lugares; espremido em 393 px ele vira uma miniatura ilegivel com
		 * dezessete alvos de agulha em cima. A lista diz a MESMA coisa (ordem,
		 * estado, quantas missoes faltam, para onde ir) num formato que ja
		 * nasceu para tela estreita.
		 *
		 * Quem decide e `ehCelularEmPe()`, e nao um `matchMedia` escrito aqui:
		 * repetir o criterio num arquivo novo e como a cicatriz do
		 * `--hud-acima-da-doca` (D-929) comecou. Ele entra no CONTEXTO porque
		 * `jornadaHtml.js` e fotografavel de proposito - ele nao consulta
		 * janela nem media query, recebe tudo pronto.
		 */
		semMapa: ehCelularEmPe()
	};
}

/* ------------------------------------------------------------------ */
/* "MISSOES GERAIS" - a janela MissoesIdle integrada (16/09/2026)      */
/* ------------------------------------------------------------------ */
/*
 * O DESENHO mora em `missoesGeraisHtml.js`, pelo MESMO motivo da Jornada — ver
 * o cabecalho de la. O que fica aqui e o LACO com o jogo: o poll do estado
 * compartilhado, o pedido de rede na entrada da aba e os cliques.
 */

/** O contexto que `missoesGeraisHtml.js` precisa. */
function contextoDeMissoesGerais() {
	return {
		// `MissoesIdle.missoes` nasce `[]` (nao `null`), e um array vazio
		// legitimo ("nenhuma missao opcional") e indistinguivel de "o pacote
		// ainda nao respondeu" ali. `recebeuAlgumaVez` e o sinal explicito
		// (ver a nota gemea em `MissoesIdle.js`) — so ele vira `null` aqui.
		missoes: MissoesIdle.recebeuAlgumaVez ? MissoesIdle.missoes || [] : null,
		execucao: MissoesIdle.execucao || null,
		vista: CodexIdle.vistaDeMissoes,
		subaba: CodexIdle.subabaDeMissoes,
		missaoAberta: CodexIdle.missaoAberta
	};
}

/**
 * OS CLIQUES DA ABA — mesmas acoes de `MissoesIdle.js:render`, so que
 * despachadas por `cliqueDeMissoesGerais` (`missoesGeraisHtml.js`) em vez de
 * um listener por botao redesenhado a cada resposta (mesmo motivo do
 * `onClickCorpo` de sempre: o corpo inteiro renasce a cada retrato).
 */
const GANCHOS_DE_MISSOES = {
	abrirMissao(id) {
		CodexIdle.vistaDeMissoes = 'missao';
		CodexIdle.missaoAberta = id;
		render();
	},
	voltarParaLista() {
		CodexIdle.vistaDeMissoes = 'lista';
		CodexIdle.missaoAberta = null;
		render();
	},
	trocarSubaba(subaba) {
		CodexIdle.subabaDeMissoes = subaba;
		render();
	},
	// MESMO pacote e MESMA logica que `MissoesIdle.js` e
	// `MissoesTrackerIdle.js` ja mandam — nenhum caminho novo.
	//
	// 01/10/2026: TODA acao leva o id. Ate aqui so o `iniciar` levava, e o
	// `abandonar`/`teleporte` desta aba sairiam sem dizer QUAL missao — com
	// ate tres aceitas, o servidor nao tem "a ativa" para adivinhar.
	executar(acao, id) {
		const pkt = new PACKET.CZ.RAGIDLE_MISSAO_ACAO();
		pkt.json = JSON.stringify(id ? { acao, id } : { acao });
		Network.sendPacket(pkt);
		// O "Ir caçar" troca de mapa: a janela fecha, como no "Ir até o NPC"
		// (`viajar`, logo abaixo) — o mapa que chega e o motivo de ter clicado.
		if (acao === 'teleporte') {
			closeWindow();
		}
	},
	// MESMA viagem que a Jornada ja manda (`viajarPara`, `CZ_RAGIDLE_VIAJAR`)
	// — a janela fecha, porque o mapa que chega por baixo dela e o motivo de
	// ter clicado.
	viajar(mapa) {
		viajarPara(mapa);
	},
	// O "IR AO MAPA" do objetivo de coleta (26/09/2026): o MESMO fluxo da
	// janela de Missoes — ver `MissoesIdle/escolhaDeMapa.js`.
	ondeCai(itemId, missaoId) {
		pedirOndeCai(itemId, missaoId, JANELA_DO_CODEX);
	}
};

/** Esta janela para o fluxo do "Ir ao mapa" — a escolha nasce DENTRO da
 * `.cx-window` (e nao do `#CodexIdle`, que mede 0x0 no computador — ver o
 * cabecalho de `escolhaDeMapa.js`). */
const JANELA_DO_CODEX = {
	container() {
		const root = _root();
		return root ? root.querySelector('.cx-window') : null;
	},
	fecharJanela() {
		closeWindow();
	}
};

/** O poll de 250ms (ver o cabecalho de `onAppend`): so redesenha quando a
 * aba esta NA TELA e o dado mudou desde o ultimo desenho. */
function renderMissoesSeMudou() {
	const root = _root();
	const win = root && root.querySelector('.cx-window');
	if (!win || !win.classList.contains('is-open') || CodexIdle.aba !== 'missoes') {
		return;
	}
	// O PROGRESSO dos objetivos entra na assinatura (26/09/2026): sem ele a tela
	// da missao ficava no "3 de 8" enquanto o servidor ja contava mais, e o
	// "Ir ao mapa" continuava oferecido depois de o objetivo fechar.
	// 01/10/2026: `aceita` e `pronta` no lugar da `naFila` (a fila saiu). O
	// parcial de progresso (`v: 3`) muda so o progresso e o `pronta`, e os dois
	// estao aqui — sem eles o "Finalizar" nao acenderia com a aba aberta.
	const assinatura = JSON.stringify([
		MissoesIdle.execucao,
		(MissoesIdle.missoes || []).map(m => [
			m.id,
			m.estado,
			m.cooldownS,
			m.aceita,
			m.pronta,
			(m.objetivos || []).map(o => o.progresso)
		])
	]);
	if (assinatura === _assinaturaDeMissoes) {
		return;
	}
	_assinaturaDeMissoes = assinatura;
	render();
}

/* ------------------------------------------------------------------ */
/* Os cliques da Jornada                                               */
/* ------------------------------------------------------------------ */

/**
 * @returns {boolean} true quando o clique era da Jornada e ja foi tratado.
 */
function cliqueDaJornada(e, alvo) {
	const pino = alvo.closest('[data-capitulo]');
	if (pino && !pino.disabled) {
		e.stopImmediatePropagation();
		abrirCapitulo(pino.dataset.capitulo);
		return true;
	}

	const viagem = alvo.closest('[data-viajar]');
	if (viagem && !viagem.disabled) {
		e.stopImmediatePropagation();
		viajarPara(viagem.dataset.viajar);
		return true;
	}

	const paraOCodex = alvo.closest('[data-codex-mobid]');
	if (paraOCodex) {
		e.stopImmediatePropagation();
		abrirEntradaDoCodex(Number(paraOCodex.dataset.codexMobid));
		return true;
	}

	const paraAEspecie = alvo.closest('.cx-ponte-especie');
	if (paraAEspecie) {
		e.stopImmediatePropagation();
		abrirEspecie(Number(paraAEspecie.dataset.mobid));
		return true;
	}

	const troca = alvo.closest('[data-vista]');
	if (troca) {
		e.stopImmediatePropagation();
		CodexIdle.vista = troca.dataset.vista;
		CodexIdle.capituloAberto = null;
		CodexIdle.especieAberta = null;
		render();
		return true;
	}

	const missoes = alvo.closest('.cx-jor-abrir-missoes');
	if (missoes) {
		e.stopImmediatePropagation();
		/*
		 * TROCA DE ABA, e nao mais `MissoesIdle.toggle()` (16/09/2026). Antes
		 * este botao abria uma SEGUNDA janela por cima da primeira — com a
		 * integracao, a missao de Troca de Classe ja vive na propria aba
		 * "Missões Gerais" desta janela, entao "abrir as missoes" virou
		 * "trocar de aba aqui dentro".
		 */
		CodexIdle.aba = 'missoes';
		lembrarAba(_preferences, 'missoes');
		aoEntrarNaAba();
		render();
		return true;
	}

	return false;
}

/**
 * Pede as missoes de um capitulo. `forcar` (D-1986) repede o que ja esta
 * guardado - quem ABRE o capitulo ve o numero de agora; a varredura por
 * especie (sem `forcar`) so pede o que falta.
 */
function pedirCapitulo(id, forcar) {
	if (!precisaPedirCapitulo(id, CodexIdle.missoesPorCapitulo, forcar)) {
		return;
	}
	_capituloEmVoo = id;
	enviarAcao({ acao: 'capitulo', capitulo: id });
}

function abrirCapitulo(id) {
	if (!id) {
		return;
	}
	CodexIdle.vista = 'capitulo';
	CodexIdle.capituloAberto = id;
	CodexIdle.especieAberta = null;
	pedirCapitulo(id, true);
	render();
}

/**
 * A PONTE ENTRADA -> MISSOES DAQUELA ESPECIE.
 *
 * As missoes chegam por capitulo, entao a lista completa de uma especie so
 * existe depois que os capitulos chegaram. Em vez de esperar, a tela abre com
 * o que ja tem e VARRE o resto um a um, redesenhando a cada resposta - uma
 * rajada de N pacotes de uma vez seria pior para o servidor e para o jogador,
 * que veria a tela parada do mesmo jeito.
 */
function abrirEspecie(mobId) {
	if (!Number.isFinite(mobId)) {
		return;
	}
	CodexIdle.aba = 'jornada';
	lembrarAba(_preferences, 'jornada');
	CodexIdle.vista = 'especie';
	CodexIdle.especieAberta = mobId;
	CodexIdle.capituloAberto = null;

	const jor = (CodexIdle.estado && CodexIdle.estado.jornada) || {};
	_filaDaVarredura = (jor.capitulos || [])
		.map(c => c && c.id)
		.filter(id => id && !Object.prototype.hasOwnProperty.call(CodexIdle.missoesPorCapitulo, id));
	render();
	seguirVarredura();
}

function seguirVarredura() {
	if (_capituloEmVoo || _filaDaVarredura.length === 0) {
		return;
	}
	pedirCapitulo(_filaDaVarredura[0]);
}

/**
 * A PONTE MISSAO -> ENTRADA DE ESPECIE DO CODEX.
 *
 * Troca de aba, desenha e ACENDE a entrada que cita aquele `mobId`. Sem o
 * realce, cair numa lista de 38 entradas seria o mesmo que nao ter ponte.
 */
function abrirEntradaDoCodex(mobId) {
	if (!Number.isFinite(mobId)) {
		return;
	}
	CodexIdle.aba = 'codex';
	lembrarAba(_preferences, 'codex');
	render();

	const root = _root();
	const corpo = root && root.querySelector('.cx-body');
	if (!corpo) {
		return;
	}
	const linha = Array.prototype.find.call(corpo.querySelectorAll('.cx-missao[data-mobids]'), el =>
		String(el.dataset.mobids || '')
			.split(',')
			.includes(String(mobId))
	);
	if (!linha) {
		return;
	}
	linha.classList.add('is-realce');
	if (typeof linha.scrollIntoView === 'function') {
		linha.scrollIntoView({ block: 'center' });
	}
}

/**
 * A PONTE RASTREADOR -> ENTRADA (D-1839): o clique numa linha do rastreador
 * da HUD abre esta janela na aba do Codex e acende a entrada.
 *
 * O retrato pode ainda nao ter chegado (a janela pede ao abrir), entao o id
 * fica guardado e `realcarEntradaPedida` roda no fim de todo `render` da aba -
 * acende quando a linha existir, e esquece depois.
 */
let _entradaARealcar = null;
/*
 * A entrada ACESA fica acesa ate a janela fechar: o retrato que chega logo
 * depois do clique (a janela pede ao abrir) redesenha o corpo inteiro, e um
 * realce so no no antigo sumia - medido na primeira foto do desktop, onde a
 * janela ja tinha retrato e o clique acendia a linha um instante antes de o
 * retrato novo apaga-la. `_entradaARealcar` e so o "rolar ate ela", que vale ate
 * o retrato novo chegar.
 */
let _entradaRealcada = null;

CodexIdle.abrirNaEntrada = function abrirNaEntrada(id) {
	const root = _root();
	const win = root && root.querySelector('.cx-window');
	if (!win) {
		return;
	}
	CodexIdle.aba = 'codex';
	lembrarAba(_preferences, 'codex');
	// Sem id (o rodape "Abrir o Codex" do cartao) so abre na aba.
	_entradaARealcar = typeof id === 'string' && id ? id : null;
	_entradaRealcada = _entradaARealcar;
	if (!win.classList.contains('is-open')) {
		CodexIdle.toggle();
	}
	render();
};

function realcarEntradaPedida(corpo) {
	if (!_entradaRealcada || !corpo) {
		return;
	}
	const linha = Array.prototype.find.call(
		corpo.querySelectorAll('.cx-missao[data-entrada]'),
		el => el.dataset.entrada === _entradaRealcada
	);
	if (!linha) {
		return;
	}
	linha.classList.add('is-realce');
	if (_entradaARealcar && typeof linha.scrollIntoView === 'function') {
		linha.scrollIntoView({ block: 'center' });
	}
}

/**
 * A viagem. MESMO pacote que o Mapa de Caca e a janela de Missoes mandam
 * (`CZ_RAGIDLE_VIAJAR`, 0x0ff2) - nenhum caminho novo, so um segundo gatilho.
 * A janela FECHA porque o servidor responde com o mapmove e o cliente recarrega
 * o mapa por baixo dela, como o botao do atlas ja faz.
 */
function viajarPara(mapa) {
	if (!mapa) {
		return;
	}
	const pkt = new PACKET.CZ.RAGIDLE_VIAJAR();
	pkt.mapName = mapa;
	Network.sendPacket(pkt);
	closeWindow();
}

/* ------------------------------------------------------------------ */
/* O pacote                                                            */
/* ------------------------------------------------------------------ */

function onCodexRecebido(pkt) {
	let dados;
	try {
		dados = JSON.parse(pkt.json);
	} catch (err) {
		console.error('[CodexIdle] payload nao e JSON valido', err);
		return;
	}
	/*
	 * O PARCIAL AO VIVO (D-1986): so as pecas que mudaram, empurradas pelo
	 * servidor enquanto a janela esta aberta. Ele vem ANTES da guarda de
	 * versao porque e `v: 3` de proposito - a guarda do retrato inteiro o
	 * recusaria, e e isso que protege o cliente antigo.
	 */
	if (ehParcialDoCodex(dados)) {
		const r = aplicarParcialDoCodex(CodexIdle.estado, dados, CodexIdle.missoesPorCapitulo);
		CodexIdle.estado = r.estado;
		CodexIdle.missoesPorCapitulo = r.missoesPorCapitulo;
		if (_apertadoNoCorpo) {
			_desenhoAdiado = true;
		} else {
			render();
		}
		return;
	}
	// Guarda de versao, como em PasseIdle/MissoesIdle: um retrato de contrato
	// futuro e IGNORADO em vez de desenhado meio errado. A versao aceita mora
	// em `eixosDoCodex.js` (era `!== 1` cravado aqui, e o Codex em percentual,
	// que o servidor manda como v2, ficava em "Carregando..." para sempre).
	if (!retratoDoCodexAceito(dados)) {
		return;
	}
	CodexIdle.estado = dados;
	acumularMissoesDaJornada(dados);
	render();
	// D-1839: o retrato novo ja foi desenhado com a entrada pedida no centro.
	_entradaARealcar = null;
	seguirVarredura();
}

/**
 * AS MISSOES DE UM CAPITULO CHEGARAM - guarde-as.
 *
 * O retrato vem inteiro em toda resposta, e `jornada.missoes` so aparece na
 * resposta do verbo `capitulo`. Duas armadilhas tratadas aqui:
 *
 * 1. **capitulo VAZIO nao diz de quem e.** Uma lista sem elementos nao carrega
 *    o `capitulo` de ninguem, e sem marcar o capitulo como carregado a janela
 *    ficaria pedindo o mesmo para sempre. Por isso o `_capituloEmVoo`.
 * 2. **a resposta pode trazer missoes de mais de um capitulo** se um dia o
 *    servidor agrupar - agrupar por `m.capitulo` cobre os dois casos sem
 *    supor nada.
 */
function acumularMissoesDaJornada(dados) {
	const jornada = dados.jornada;
	const pedido = _capituloEmVoo;
	if (!jornada || !Array.isArray(jornada.missoes)) {
		return;
	}
	_capituloEmVoo = null;

	const porCapitulo = {};
	for (const m of jornada.missoes) {
		const id = (m && m.capitulo) || pedido;
		if (!id) {
			continue;
		}
		(porCapitulo[id] = porCapitulo[id] || []).push(m);
	}
	if (pedido && !porCapitulo[pedido]) {
		porCapitulo[pedido] = [];
	}
	for (const id of Object.keys(porCapitulo)) {
		// D-1986: as paginas de um capitulo pesado se SOMAM (a segunda nao
		// apaga a primeira) - ver `juntarPaginaDoCapitulo`.
		const juntas = juntarPaginaDoCapitulo(CodexIdle.missoesPorCapitulo[id], porCapitulo[id], dados.parte);
		juntas.sort((a, b) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));
		CodexIdle.missoesPorCapitulo[id] = juntas;
	}
	_filaDaVarredura = _filaDaVarredura.filter(
		id => !Object.prototype.hasOwnProperty.call(CodexIdle.missoesPorCapitulo, id)
	);
}

Network.hookPacket(PACKET.ZC.RAGIDLE_CODEX, onCodexRecebido);

/*
 * O CATALOGO NAO E DESTA JANELA - ele e do Mapa de Caca, e `hookPacket` e
 * atribuicao simples: enganchar `ZC_RAGIDLE_CATALOGO` aqui SUBSTITUIRIA o
 * gancho de la em silencio, e o atlas pararia de funcionar sem nada acusar.
 * Entao a Jornada pede por emprestimo e so avisa quando o dado chegar, para o
 * botao de viagem trocar "Ir para X" pelo motivo de a viagem nao sair.
 */
if (typeof HuntMap.aoChegarCatalogo === 'function') {
	HuntMap.aoChegarCatalogo(() => {
		if (CodexIdle.aba === 'jornada' && CodexIdle.estado) {
			render();
		}
	});
}

export default UIManager.addComponent(CodexIdle);
