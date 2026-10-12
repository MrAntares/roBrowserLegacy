/**
 * A JANELA DE GRUPO (D-960, 07/09/2026) — a tela de quem esta em party.
 *
 * Irma do Localizador de Grupos (`UI/Components/LFGIdle/`): mesma moldura
 * (`.ri-window.ri-anima`), mesma receita de HTML estatico alternado por
 * `[hidden]`, mesma memoria de aba, mesma limpeza na troca de personagem.
 *
 * ---------------------------------------------------------------------------
 * A REGRA QUE GOVERNA ESTE ARQUIVO: A UI SO REFLETE
 * ---------------------------------------------------------------------------
 *
 * Nenhuma linha aqui decide se um posto esta disponivel, quanto vale o
 * premio de rateio, quem e lider ou se o convite pode sair. Quem decide e o
 * servidor: `ZC_RAGIDLE_GRUPO` (0x0fcc) desce com o estado inteiro — a lista
 * de postos JA vem com `nome`, `resumo`, `disponivel` e `motivo`; a tabela de
 * rateio JA vem calculada por `partilhaDeExp`, a MESMA funcao que paga o
 * abate. A janela desenha o que chegou.
 *
 * Isso e o oposto do que uma lista escrita no HTML faria: no dia em que um
 * posto mudasse de regra, a janela mostraria "disponivel" ao lado de uma
 * recusa. E a mesma regra do `LFGIdle.js`, pela mesma razao.
 *
 * ---------------------------------------------------------------------------
 * O QUE NAO E RECONSTRUIDO POR innerHTML, E POR QUE
 * ---------------------------------------------------------------------------
 *
 * O estado pode chegar A QUALQUER MOMENTO com a janela aberta (o servidor
 * empurra a cada mudanca do grupo — alguem entrou, alguem saiu, o lider
 * trocou as regras). Se o painel de convite fosse reconstruido a cada
 * desenho, um empurrao apagaria o nome que o jogador esta digitando.
 *
 * Por isso o painel de convite, os segmentos de ajuste e os botoes de saida
 * nascem TODOS no HTML e o desenho so liga/desliga `hidden`, troca
 * `textContent` e mexe em `disabled`. O que e reconstruido — lista de
 * membros, cartoes de posto, tabela de rateio — nao tem campo de digitacao.
 *
 * ---------------------------------------------------------------------------
 * CONTRATO DE FIO
 * ---------------------------------------------------------------------------
 *
 * Enviar `CZ_RAGIDLE_GRUPO_ACAO` (0x0fcb, JSON):
 *   {acao:'pedir'} · {acao:'fechar'} · {acao:'posto', posto} ·
 *   {acao:'preferencias', convites?, aproximacao?} ·
 *   {acao:'regras', exp?, itens?} · {acao:'convidar', nome}
 *
 * E `CZ_RAGIDLE_PEDIR_GRUPO` (0x0fcd) ao abrir.
 *
 * SAIR e DESFAZER **nao sao verbos desta janela**, e isso e reuso: sair ja e
 * o `CZ_REQ_LEAVE_GROUP` (0x0100) que este cliente fala desde sempre, e
 * desfazer ja e o `{acao:'dissolver'}` do `CZ_RAGIDLE_LFG_ACAO`, com quarenta
 * linhas de consequencia no servidor (avisar cada membro, fechar o anuncio,
 * arrastar todo mundo de volta a cidade pausando a missao de quem foi
 * arrastado). Escrever uma segunda rota para as mesmas duas perguntas seria o
 * defeito mais repetido deste projeto.
 *
 * TRANSFERIR LIDERANCA (10/09/2026) e o MESMO reuso, pelo MESMO motivo: o
 * pacote e `CZ_CHANGE_GROUP_MASTER` (0x07da, `{AID}`) — o nativo que
 * `PartyFriendsCommon.js`/`Engine/MapEngine/Group.js:onRequestChangeLeader`
 * ja falam, e que o servidor (`servidor-mapa.ts:23425`) ja trata por inteiro
 * (confere mesmo mapa, troca o lider, difunde para todo o grupo, sincroniza
 * o anuncio do Localizador). Esta janela so precisava do BOTAO; nao ha
 * verbo novo em `CZ_RAGIDLE_GRUPO_ACAO` para isto, e nao deveria haver.
 *
 * Receber `ZC_RAGIDLE_GRUPO` (0x0fcc): `{ v, aplicado?, problemas, recado,
 * eu, grupo, postos, rateio, tabela }`.
 */

import Renderer from 'Renderer/Renderer.js';
import EntityManager from 'Renderer/EntityManager.js';
import Preferences from 'Core/Preferences.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './GrupoIdle.html?raw';
import cssText from './GrupoIdle.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';
import { vidaDoMembro } from './vidaDoMembro.js';

/* Manter em sincronia com o ":host" do CSS — o mesmo papel do
   WINDOW_WIDTH/HEIGHT de LFGIdle.js. O JS supoe a caixa GRANDE de proposito:
   nas variantes menores (tela baixa, celular) a caixa real fica MENOR do que
   o JS supoe, entao o "top" calculado sobra folga embaixo em vez de estourar
   por cima. */
const WINDOW_WIDTH = 760;
const WINDOW_HEIGHT = 640;

const GrupoIdle = new GUIComponent('GrupoIdle', cssText);

const _preferences = Preferences.get(
	'GrupoIdle',
	{
		x: null,
		y: null,
		aba: null
	},
	1.0
);

GrupoIdle.render = () => htmlText;

/** Janela fechada nao engole clique de cena. */
GrupoIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/** O ultimo estado que o servidor mandou. `null` = ainda nao chegou nenhum. */
GrupoIdle.estado = null;

/** true enquanto o JOGADOR deixou a janela aberta por vontade propria. Estado
 * de MODULO, e nao do DOM — sobrevive a qualquer coisa que aconteca com
 * `.gi-window`/`is-open` numa troca de mapa (a corrida medida no LFGIdle em
 * 03/09/2026, com sintoma diferente entre duas rodadas da mesma sonda). */
GrupoIdle.estavaAberta = false;

/** true durante o segundo passo de "Desfazer o grupo" — o mesmo padrao de
 * dois passos sem `window.confirm` que o LFGIdle ja usa. */
GrupoIdle.confirmarDesfazer = false;
GrupoIdle.acaoPendente = null;

const ABAS = ['grupo', 'postos', 'rateio', 'ajustes'];
const ABA_PADRAO = 'grupo';
GrupoIdle.abaAtiva = ABA_PADRAO;

/** O nome que a janela imprime para cada modo. Ele e o NOSSO vocabulario, e
 * ele e curto porque cabe numa linha de resumo de celular. Os codigos (0/1)
 * sao os do `party.cpp`; os nomes sao nossos. */
const NOME_DO_RATEIO = { 0: 'Quem abate, leva', 1: 'Rateio igual' };
const NOME_DA_COLETA = { 0: 'Quem pega, fica', 1: 'Bolsa comum' };

function raiz() {
	return GrupoIdle._shadow || GrupoIdle._host;
}

/** O mesmo `escapeHtml` das outras janelas RagIdle: nome de personagem entra
 * por `innerHTML`, e nome de personagem e texto que OUTRO jogador escolheu. */
function escapeHtml(valor) {
	return String(valor === null || valor === undefined ? '' : valor)
		.split('&')
		.join('&amp;')
		.split('<')
		.join('&lt;')
		.split('>')
		.join('&gt;')
		.split('"')
		.join('&quot;');
}

function mandar(corpo) {
	const pkt = new PACKET.CZ.RAGIDLE_GRUPO_ACAO();
	pkt.json = JSON.stringify(corpo);
	Network.sendPacket(pkt);
}

/**
 * Icone de classe e coroa do lider: a MESMA tecnica de
 * `PartyFriends/PartyFriendsCommon.js` e do `LFGIdle.js` — bmp do GRF,
 * carregado por `Client.loadFile` e aplicado como `background-image`, porque
 * nao e asset com caminho publico, e recurso do cliente (regra 4 do projeto:
 * o que INFORMA continua sendo arte do cliente).
 */
function carregarArteDeClasse(escopo) {
	escopo.querySelectorAll('[data-classe-icone]').forEach(function (el) {
		const jobId = el.dataset.classeIcone;
		if (!jobId) {
			return;
		}
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/icon_jobs_' + jobId + '.bmp', function (url) {
			el.style.backgroundImage = 'url(' + url + ')';
		});
	});
	escopo.querySelectorAll('[data-coroa]').forEach(function (el) {
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/ico_partycrown.bmp', function (url) {
			el.style.backgroundImage = 'url(' + url + ')';
			el.dataset.ok = '1';
		});
	});
}

function sincronizarAbas() {
	const r = raiz();
	r.querySelectorAll('.gi-tab').forEach(function (aba) {
		aba.classList.toggle('is-active', aba.dataset.tab === GrupoIdle.abaAtiva);
	});
	ABAS.forEach(function (nome) {
		r.querySelector('.gi-view-' + nome).hidden = GrupoIdle.abaAtiva !== nome;
	});
}

function trocarAba(nome) {
	if (ABAS.indexOf(nome) === -1) {
		return;
	}
	GrupoIdle.abaAtiva = nome;
	lembrarAba(_preferences, nome);
	sincronizarAbas();
	// D-964: cada aba tem uma altura de conteudo, entao a marca de rolagem e
	// por aba — a de Ajustes rola onde a de Grupo nao rola.
	marcarRolagem();
}

/*
 * D-964 — A MARCA DE "TEM MAIS COISA EMBAIXO".
 *
 * Ela acende `is-rolando` no corpo da janela quando ainda ha conteudo abaixo
 * da borda, e o CSS desvanece os 20px do pe. O corte de meia linha no fim da
 * lista passa a LER como continuacao, em vez de ler como defeito de
 * renderizacao — foi assim que o dono leu o print do celular.
 *
 * Por que a condicao e "ha conteudo abaixo", e nao "o elemento rola": no fim
 * da rolagem nao ha nada embaixo, e desvanecer ali apagaria a ultima linha
 * prometendo uma continuacao que nao existe.
 *
 * Ela e barata de proposito (duas leituras de layout) porque roda a cada
 * empurrao do servidor, a cada troca de aba e a cada rolagem.
 */
function marcarRolagem() {
	const corpo = raiz().querySelector('.gi-body');
	if (!corpo) {
		return;
	}
	const sobra = corpo.scrollHeight - corpo.clientHeight - corpo.scrollTop;
	corpo.classList.toggle('is-rolando', sobra > 1);
}

/* ------------------------------------------------------------------ */
/* O DESENHO                                                           */
/* ------------------------------------------------------------------ */

function desenharEstandarte(e) {
	const r = raiz();
	const grupo = e && e.grupo;
	r.querySelector('.gi-nome').textContent = grupo ? grupo.nome : 'Sem grupo';

	if (!grupo) {
		r.querySelector('.gi-resumo').textContent =
			'Voce nao esta em nenhum grupo. Abra o Localizador para entrar num, ou peca um convite.';
	} else {
		const n = grupo.membros.length;
		r.querySelector('.gi-resumo').textContent =
			n +
			(n === 1 ? ' membro' : ' membros') +
			' · ' +
			(NOME_DO_RATEIO[grupo.exp] || NOME_DO_RATEIO[0]) +
			' · ' +
			(NOME_DA_COLETA[grupo.itens] || NOME_DA_COLETA[0]);
	}

	// Convidar so faz sentido para quem TEM grupo e manda nele — o servidor
	// recusa de qualquer forma (a UI so reflete), mas oferecer um botao que
	// so sabe recusar e pior que nao oferecer.
	const souLider = !!(e && e.eu && e.eu.souLider);
	r.querySelector('.gi-convidar-abrir').disabled = !souLider;
}

function desenharFaixa(e) {
	const r = raiz();
	const rateio = (e && e.rateio) || null;
	const modo = r.querySelector('.gi-faixa-modo');
	const nota = r.querySelector('.gi-faixa-nota');
	if (!rateio) {
		modo.textContent = 'Rateio';
		nota.textContent = '';
		return;
	}
	modo.textContent = rateio.ligado ? 'Rateio igual' : 'Quem abate, leva';
	if (rateio.impedimento) {
		nota.textContent = rateio.impedimento;
	} else if (rateio.ligado && rateio.premio > 0) {
		nota.textContent =
			'Premio de grupo de +' +
			rateio.premio +
			'% em vigor, com ' +
			rateio.elegiveis +
			(rateio.elegiveis === 1 ? ' elegivel.' : ' elegiveis.');
	} else if (rateio.ligado) {
		nota.textContent = 'Sem premio: o premio comeca no segundo elegivel.';
	} else {
		nota.textContent = 'A experiencia inteira fica com quem deu o golpe final.';
	}
}

/**
 * O BOTAO "TRANSFERIR LIDERANCA" DESTA LINHA (10/09/2026).
 *
 * So EXISTE quando `ctx.souLider && !m.souEu` — o mesmo criterio de
 * `desenharTeleporte`: quem nao e lider nunca ve um botao que so sabe
 * recusar, e o proprio lider nao ve o botao na PROPRIA linha (transferir
 * para si mesmo nao e uma acao).
 *
 * Quando existe, ele NUNCA some por estar indisponivel — fica DESABILITADO
 * com o motivo no `title` (o mesmo padrao do `.gi-teleportar` e dos cartoes
 * de posto bloqueado): "isto nao e para voce" some, "isto e para voce, mas
 * nao agora" fica cinza com a razao.
 *
 * As DUAS razoes de recusa vem do payload que a propria janela ja tem —
 * nenhuma regra nova e inventada aqui, so lida:
 *   - `!m.online`: a guarda D3 do servidor (nao se passa a coroa a um
 *     ausente).
 *   - `m.mapa !== ctx.meuMapa`: a tranca de mesmo mapa (party.conf:64,
 *     `change_party_leader_samemap`) que o handler ja aplica — o servidor
 *     recusa de qualquer forma, e isto so evita o clique que so sabe ouvir
 *     "nao".
 */
function botaoTransferir(m, ctx) {
	if (!ctx.souLider || m.souEu) {
		return '';
	}
	const offline = !m.online;
	const foraDoMapa = !offline && ctx.meuMapa !== null && m.mapa !== ctx.meuMapa;
	const desabilitado = offline || foraDoMapa;
	const motivo = offline
		? escapeHtml(m.nome) + ' esta offline agora.'
		: foraDoMapa
			? 'Precisa estar no mesmo mapa que ' + escapeHtml(m.nome) + '.'
			: 'Transferir a lideranca para ' + escapeHtml(m.nome) + '.';
	return (
		'<button type="button" class="gi-transferir" data-conta-transferir="' +
		escapeHtml(m.contaId) +
		'"' +
		(desabilitado ? ' disabled aria-disabled="true"' : '') +
		' title="' +
		motivo +
		'"></button>'
	);
}

/**
 * O botao "Retirar do grupo": so o LIDER ve, em qualquer linha menos a propria
 * (o lider sai pelo `.gi-sair`). Nao depende de online nem de mapa — o lider
 * pode retirar qualquer um. O servidor recusa de novo quem nao for lider.
 */
function botaoExpulsar(m, ctx) {
	if (!ctx.souLider || m.souEu) {
		return '';
	}
	return (
		'<button type="button" class="gi-expulsar" data-conta-expulsar="' +
		escapeHtml(m.contaId) +
		'" title="Retirar ' +
		escapeHtml(m.nome) +
		' do grupo." aria-label="Retirar ' +
		escapeHtml(m.nome) +
		' do grupo"></button>'
	);
}

/** Coroa e X lado a lado num grupo so: no celular a coluna da direita
 * empilha, e sem o embrulho cada botao ganhava uma linha propria. */
function acoesDoLider(m, ctx) {
	const botoes = botaoTransferir(m, ctx) + botaoExpulsar(m, ctx);
	return botoes ? '<span class="gi-membro-acoes">' + botoes + '</span>' : '';
}

function linhaDeMembro(m, ctx) {
	const fracao = m.hpMaximo > 0 ? Math.max(0, Math.min(1, m.hp / m.hpMaximo)) : 0;
	const classeEstado = !m.online ? '' : m.vivo ? ' is-vivo' : ' is-morto';
	const rotuloEstado = !m.online ? 'Offline' : m.vivo ? 'No mundo' : 'Caido';
	const marcaLider = m.ehLider
		? '<span class="gi-tag is-lider"><span class="gi-coroa" aria-hidden="true" data-coroa></span>Lider</span>'
		: '';
	const marcaEu = m.souEu ? '<span class="gi-tag is-eu">Voce</span>' : '';

	return (
		'<div class="gi-membro' +
		(m.souEu ? ' is-eu' : '') +
		(m.online ? '' : ' is-offline') +
		/*
		 * A CONTA na linha (07/09/2026) — ela é a chave do `EntityManager`.
		 *
		 * O empurrão desta janela chega quando o GRUPO muda (entrar, sair,
		 * trocar posto), e não a cada golpe: sem isto a barra do companheiro
		 * ficava parada no valor do último empurrão. `vidaAoVivo` lê o HP que o
		 * `ZC_NOTIFY_HP_TO_GROUPM_R2` (0x080e) já deposita por conta, e para
		 * achá-lo precisa do `AID` — que é o `contaId`.
		 */
		'" data-conta="' +
		escapeHtml(m.contaId) +
		'">' +
		'<span class="gi-membro-classe" data-classe-icone="' +
		escapeHtml(m.classe) +
		'"></span>' +
		'<div class="gi-membro-topo">' +
		'<span class="gi-membro-nome">' +
		escapeHtml(m.nome) +
		'</span>' +
		'<span class="gi-membro-nivel">Nv. ' +
		escapeHtml(m.nivel) +
		'</span>' +
		marcaEu +
		marcaLider +
		'</div>' +
		'<div class="gi-membro-onde">' +
		'<span class="gi-estado' +
		classeEstado +
		'" title="' +
		escapeHtml(rotuloEstado) +
		'"></span>' +
		'<span class="gi-membro-mapa">' +
		escapeHtml(m.mapaRotulo || m.mapa || '—') +
		'</span>' +
		'</div>' +
		'<div class="gi-membro-direita">' +
		/*
		 * D-962 — O NUMERO VIVE FORA DA BARRA.
		 *
		 * Ele morava DENTRO dela, no `.rotulo` do design system, e a rodada
		 * anterior tentou salvar a leitura invertendo a cor abaixo da metade
		 * (`is-baixo`: branco em cima do preenchimento, azul escuro sobre a
		 * calha). Os dois ramos falham pelo mesmo motivo, e o print mediu: em
		 * 9 das 10 linhas a BORDA do preenchimento cai DENTRO do numero, e os
		 * digitos trocam de cor no meio da palavra — "600 / 1200" com metade
		 * em cada cor.
		 *
		 * E a cicatriz D-944 na forma geral: *ouro e MOLDURA, nunca a
		 * palavra*. Texto nao vive em cima de preenchimento que se move —
		 * inverter a cor do texto so troca em qual metade ele some, porque a
		 * fronteira continua atravessando o glifo. O numero saiu para o lado,
		 * sobre a chapa do cartao, que nao se move: um fundo so, um contraste
		 * so, em qualquer fracao de vida.
		 *
		 * A barra fica — ela e a leitura de RELANCE (quanto falta), e o numero
		 * e a leitura EXATA. Sao duas perguntas, e agora cada uma tem a sua
		 * peca.
		 */
		'<span class="gi-membro-vida">' +
		'<span class="ri-bar ri-bar--hp gi-membro-hp">' +
		'<span class="fill" style="width:' +
		(fracao * 100).toFixed(1) +
		'%"></span>' +
		'</span>' +
		'<span class="gi-membro-hp-num">' +
		escapeHtml(m.hp) +
		' / ' +
		escapeHtml(m.hpMaximo) +
		'</span>' +
		'</span>' +
		'<span class="gi-membro-posto">' +
		escapeHtml(m.postoNome) +
		'</span>' +
		acoesDoLider(m, ctx) +
		'</div>' +
		'</div>'
	);
}

function desenharMembros(e) {
	const r = raiz();
	const grupo = e && e.grupo;
	const lista = r.querySelector('.gi-membros');
	const contador = r.querySelector('.gi-secao-contador');

	if (!grupo || !grupo.membros.length) {
		contador.textContent = '0/0';
		/*
		 * A SAIDA MORA NO ESTADO VAZIO (D-982, 07/09/2026).
		 *
		 * Ate aqui o unico botao "Encontrar grupo" vivia DENTRO do painel
		 * de Convidar — e "Convidar" nasce `disabled` para quem nao esta em
		 * grupo. Ou seja: exatamente quem precisa achar um grupo era quem nao
		 * conseguia chegar ao Localizador. O texto do rodape ate mandava
		 * "abra o Localizador", sem dar por onde.
		 *
		 * Isso so virou buraco quando D-980 tirou o segundo item do menu; ate
		 * entao o menu tinha a porta de tras. Fechar a porta de tras sem abrir
		 * a da frente e o que teria deixado o jogador preso.
		 */
		lista.innerHTML =
			'<div class="gi-vazio">Voce nao esta em nenhum grupo.' +
			'<button type="button" class="ri-btn ri-btn--sec gi-vazio-lfg">Encontrar grupo</button>' +
			'</div>';
		const atalho = lista.querySelector('.gi-vazio-lfg');
		if (atalho) {
			atalho.addEventListener('click', function () {
				// A MESMA ponte do botao do painel de convite — um caminho so.
				if (GrupoIdle.aoPedirLocalizador) {
					GrupoIdle.aoPedirLocalizador();
				}
			});
		}
		return;
	}
	contador.textContent = grupo.membros.length + '/' + grupo.limite;
	/*
	 * O CONTEXTO do botao de transferir (10/09/2026): `souLider` vem do `eu`
	 * do payload, e `meuMapa` vem da MINHA PROPRIA linha em `grupo.membros`
	 * (`souEu: true`) — o `eu` do topo do pacote nao carrega mapa nenhum, e
	 * inventar uma segunda fonte para "onde eu estou" seria divergir da
	 * mesma lista que ja desenha a coluna "Onde" de todo mundo.
	 */
	const meuMembro = grupo.membros.filter(function (x) {
		return x.souEu;
	})[0];
	const ctx = {
		souLider: !!(e && e.eu && e.eu.souLider),
		meuMapa: meuMembro ? meuMembro.mapa : null
	};
	lista.innerHTML = grupo.membros
		.map(function (m) {
			return linhaDeMembro(m, ctx);
		})
		.join('');
	carregarArteDeClasse(lista);
	ligarBotoesDeTransferir(lista);
	ligarBotoesDeExpulsar(lista);
}

/**
 * RELIGA os cliques dos botoes de transferir — o mesmo padrao de
 * `desenharPostos`/`.gi-assumir`: a linha inteira e HTML reconstruido, entao
 * o listener morre com o `innerHTML` anterior e precisa renascer aqui.
 *
 * `NAO CONFIE SO NO disabled` (a mesma guarda de D-984 nos postos): o botao e
 * desenhado com o ULTIMO estado que chegou, e entre o desenho e o clique cabe
 * um empurrao que mudou quem esta online ou em qual mapa. A guarda RELE
 * `GrupoIdle.estado` na hora do clique — quem decide continua sendo o
 * servidor, que recusa de novo do outro lado; isto so evita mandar um pedido
 * que ja nasce sabendo a resposta.
 */
function ligarBotoesDeTransferir(lista) {
	lista.querySelectorAll('.gi-transferir').forEach(function (botao) {
		botao.addEventListener('click', function () {
			if (botao.disabled) {
				return;
			}
			const atual = GrupoIdle.estado;
			const grupo = atual && atual.grupo;
			const eu = atual && atual.eu;
			if (!eu || !eu.souLider || !grupo) {
				return;
			}
			const contaId = Number(botao.dataset.contaTransferir);
			const alvo = grupo.membros.filter(function (x) {
				return x.contaId === contaId;
			})[0];
			const meu = grupo.membros.filter(function (x) {
				return x.souEu;
			})[0];
			if (!alvo || alvo.souEu) {
				return;
			}
			if (!alvo.online) {
				mostrarRecado(alvo.nome + ' esta offline agora.', true);
				return;
			}
			if (meu && alvo.mapa !== meu.mapa) {
				mostrarRecado('Precisa estar no mesmo mapa que ' + alvo.nome + '.', true);
				return;
			}
			/*
			 * O PACOTE NATIVO, direto — a MESMA tecnica do `.gi-sair` (linha
			 * ~964): sem importar `Engine/MapEngine/Group.js` (que prenderia a
			 * ordem de carga desta janela a dele, pela mesma razao que
			 * `aoPedirLocalizador`/`aoPedirTeleporte` sao ganchos e nao
			 * imports), e sem escrever um segundo verbo em
			 * `CZ_RAGIDLE_GRUPO_ACAO` para a mesma pergunta que o nativo ja
			 * responde.
			 */
			pedirConfirmacao({
				tipo: 'transferir',
				titulo: 'Transferir a lideranca?',
				texto:
					alvo.nome +
					' passa a ser o lider do grupo e voce perde o comando: so o novo lider podera convidar, retirar membros e desfazer o grupo.',
				rotuloSim: 'Sim, transferir',
				aoConfirmar: function () {
					const agora = membroAtual(contaId);
					const euAgora = GrupoIdle.estado.grupo.membros.filter(function (x) {
						return x.souEu;
					})[0];
					if (!agora || !agora.online || (euAgora && agora.mapa !== euAgora.mapa)) {
						mostrarRecado('O grupo mudou: a lideranca nao foi transferida.', true);
						return;
					}
					const pkt = new PACKET.CZ.CHANGE_GROUP_MASTER();
					pkt.AID = contaId;
					Network.sendPacket(pkt);
				}
			});
		});
	});
}

/**
 * RELIGA os cliques de "Retirar do grupo" (o `innerHTML` mata o listener
 * anterior). Relê `GrupoIdle.estado` na hora do clique e confirma antes de
 * mandar o pacote nativo `CZ_REQ_EXPEL_GROUP_MEMBER` (0x0103).
 */
function ligarBotoesDeExpulsar(lista) {
	lista.querySelectorAll('.gi-expulsar').forEach(function (botao) {
		botao.addEventListener('click', function () {
			const atual = GrupoIdle.estado;
			const grupo = atual && atual.grupo;
			const eu = atual && atual.eu;
			if (!eu || !eu.souLider || !grupo) {
				return;
			}
			const contaId = Number(botao.dataset.contaExpulsar);
			const alvo = grupo.membros.filter(function (x) {
				return x.contaId === contaId;
			})[0];
			if (!alvo || alvo.souEu) {
				return;
			}
			pedirConfirmacao({
				tipo: 'expulsar',
				titulo: 'Retirar do grupo?',
				texto:
					alvo.nome +
					' sera expulso do grupo e deixa de dividir cacada, rateio e postos com voce. Para voltar, precisara de um novo convite.',
				rotuloSim: 'Sim, retirar',
				aoConfirmar: function () {
					if (!membroAtual(contaId)) {
						mostrarRecado('O grupo mudou: ninguem foi retirado.', true);
						return;
					}
					const pkt = new PACKET.CZ.REQ_EXPEL_GROUP_MEMBER();
					pkt.AID = contaId;
					pkt.characterName = alvo.nome;
					Network.sendPacket(pkt);
				}
			});
		});
	});
}

function desenharMeuPosto(e) {
	const r = raiz();
	const eu = e && e.eu;
	const postos = (e && e.postos) || [];
	const meu = postos.filter(function (p) {
		return eu && p.id === eu.posto;
	})[0];

	r.querySelector('.gi-meu-posto-nome').textContent = meu ? meu.nome : '—';
	r.querySelector('.gi-meu-posto-resumo').textContent = meu ? meu.resumo : '';

	// O ESTADO e a diferenca entre o posto ESCOLHIDO e o EM VIGOR: a escolha
	// fica guardada mesmo quando a condicao cai (o companheiro desconectou, a
	// rotacao coletiva foi desfeita), e o servidor manda os dois.
	const estado = r.querySelector('.gi-meu-posto-estado');
	if (!eu) {
		estado.textContent = '';
	} else if (eu.postoEmVigor === eu.posto) {
		estado.textContent = 'Em vigor agora.';
	} else {
		const vigente = postos.filter(function (p) {
			return p.id === eu.postoEmVigor;
		})[0];
		estado.textContent =
			'Guardado, mas fora de vigor: valendo ' +
			(vigente ? vigente.nome : eu.postoEmVigor) +
			' ate a condicao voltar.';
	}
}

function desenharCacada(e) {
	const r = raiz();
	const grupo = e && e.grupo;
	const alvo = r.querySelector('.gi-cacada-linhas');
	if (!grupo) {
		alvo.innerHTML = '<div class="gi-cacada-linha">Nada acontecendo.</div>';
		// Sem grupo nao ha lider para quem ir. Esta linha nao e redundante com
		// o `hidden` do HTML: quem SAIU do grupo com a janela aberta chega aqui
		// com o botao ja aceso do estado anterior, e sem apaga-lo ele
		// sobreviveria ao grupo que o justificava.
		desenharTeleporte(e, null);
		return;
	}
	const online = grupo.membros.filter(function (m) {
		return m.online;
	});
	const emPe = online.filter(function (m) {
		return m.vivo;
	});
	const lider = grupo.membros.filter(function (m) {
		return m.ehLider;
	})[0];
	// O MAPA MAIS POPULOSO do grupo — o "onde o grupo esta", sem inventar um
	// conceito de canal que este jogo nao tem.
	const porMapa = {};
	emPe.forEach(function (m) {
		const chave = m.mapaRotulo || m.mapa || '—';
		porMapa[chave] = (porMapa[chave] || 0) + 1;
	});
	let mapaPrincipal = '—';
	let maior = 0;
	Object.keys(porMapa).forEach(function (chave) {
		if (porMapa[chave] > maior) {
			maior = porMapa[chave];
			mapaPrincipal = chave;
		}
	});

	const linhas = [
		['Em pe', emPe.length + ' de ' + grupo.membros.length],
		['Onde', mapaPrincipal],
		['Lider', lider ? lider.nome + ' · ' + (lider.mapaRotulo || lider.mapa || '—') : '—'],
		['Juntos no mesmo mapa', maior + ' de ' + grupo.membros.length]
	];
	alvo.innerHTML = linhas
		.map(function (par) {
			return (
				'<div class="gi-cacada-linha"><span>' +
				escapeHtml(par[0]) +
				'</span><b>' +
				escapeHtml(par[1]) +
				'</b></div>'
			);
		})
		.join('');

	desenharTeleporte(e, lider);
}

/*
 * O BOTAO "IR ATE O LIDER" (D-984).
 *
 * O pedido do dono: o botao que o Localizador ja tem no rodape de quem e
 * MEMBRO precisa existir tambem aqui. As duas condicoes sao dele: *"so faz
 * sentido quando ha lider e voce nao e o lider"*.
 *
 * "Ha lider" e uma pergunta ao ESTADO QUE CHEGOU, e nao ao `liderPersonagemId`
 * do grupo: um grupo sempre TEM um id de lider gravado, mas a lista de membros
 * pode chegar sem a linha dele (ele saiu do mundo entre um empurrao e outro).
 * Oferecer o teleporte para um lider que a janela nem consegue nomear seria
 * prometer um destino que ninguem sabe qual e.
 *
 * O botao fica HIDDEN quando nao cabe, e nao `disabled`: um botao apagado no
 * canto de um cartao pequeno le como defeito de carregamento. Quem e o lider
 * nunca precisa dele, e para essa pessoa ele simplesmente nao existe.
 *
 * O lider OFFLINE e outro caso: ali o botao aparece desabilitado, com o motivo
 * no `title` — a diferenca entre "isto nao e para voce" (some) e "isto e para
 * voce, mas nao agora" (fica, cinza, com a razao). O servidor recusa de
 * qualquer forma; isto so evita o clique que so sabe receber "nao".
 */
function desenharTeleporte(e, lider) {
	const botao = raiz().querySelector('.gi-teleportar');
	if (!botao) {
		return;
	}
	const souLider = !!(e && e.eu && e.eu.souLider);
	const cabe = !!lider && !souLider;
	botao.hidden = !cabe;
	if (!cabe) {
		return;
	}
	botao.disabled = !lider.online;
	botao.title = lider.online ? '' : lider.nome + ' esta offline agora.';
}

function desenharPostos(e) {
	const r = raiz();
	const postos = (e && e.postos) || [];
	const escolhido = e && e.eu ? e.eu.posto : null;
	const alvo = r.querySelector('.gi-postos');
	if (!postos.length) {
		alvo.innerHTML = '<div class="gi-vazio">Carregando...</div>';
		return;
	}
	alvo.innerHTML = postos
		.map(function (p) {
			const ehEscolhido = p.id === escolhido;
			/*
			 * D-984 — POSTO BLOQUEADO SEM MOTIVO NAO EXISTE.
			 *
			 * O `motivo` so era impresso quando o servidor mandava um, e ate
			 * aqui todo bloqueio dele vinha com frase. A regra de LIDER (secoes
			 * 9 e 10 do pedido do dono) triplica os cartoes cinzas na tela de
			 * quem manda no grupo: enquanto a coroa for sua, so o Andarilho
			 * fica de pe. Tres cartoes apagados lado a lado, sem uma palavra
			 * dizendo por que, leem como janela quebrada — e a lupa cai no
			 * cliente, que nao decidiu nada disso.
			 *
			 * A frase de reserva NAO e a regra reescrita aqui (isso seria uma
			 * segunda leitura da decisao do servidor, e ela vai mentir no dia
			 * em que a regra mudar): ela so diz que o veredito veio e que a
			 * explicacao nao veio junto. Se esta frase aparecer no jogo, o
			 * defeito e do pacote, e ela e o rastro que aponta para la.
			 */
			const frase = p.disponivel ? p.motivo : p.motivo || 'Indisponivel agora.';
			const motivo = frase ? '<div class="gi-posto-motivo">' + escapeHtml(frase) + '</div>' : '';
			/* `aria-disabled` ANDA JUNTO com `disabled`: o cartao cinza e o
			   filete ambar sao a leitura do olho, e o leitor de tela nao tem
			   nenhum dos dois. Mesmo estado, dois sentidos — a mesma regra que
			   o `aria-expanded` do TopMenuIdle segue. */
			const botao = ehEscolhido
				? '<button type="button" class="ri-btn ri-btn--sec" disabled aria-disabled="true">Este e o seu posto</button>'
				: '<button type="button" class="ri-btn gi-assumir" data-posto="' +
					escapeHtml(p.id) +
					'"' +
					(p.disponivel ? '' : ' disabled aria-disabled="true"') +
					'>' +
					(p.disponivel ? 'Assumir' : 'Indisponivel') +
					'</button>';
			return (
				'<div class="gi-posto' +
				(ehEscolhido ? ' is-escolhido' : '') +
				(p.disponivel ? '' : ' is-bloqueado') +
				'">' +
				'<div class="gi-posto-nome">' +
				escapeHtml(p.nome) +
				'</div>' +
				'<div class="gi-posto-resumo">' +
				escapeHtml(p.resumo) +
				'</div>' +
				motivo +
				botao +
				'</div>'
			);
		})
		.join('');

	alvo.querySelectorAll('.gi-assumir').forEach(function (botao) {
		botao.addEventListener('click', function () {
			/*
			 * D-984 — NAO CONFIE SO NO `disabled` (ordem do dono, secao 10).
			 *
			 * O atributo e desenho: ele some com um clique no inspetor, e o
			 * botao aqui e RECONSTRUIDO a cada empurrao — entre o desenho e o
			 * clique cabe uma troca de lider que bloqueou este posto. A guarda
			 * nao recalcula regra nenhuma: ela RELE o veredito que o servidor
			 * mandou, no ultimo estado que chegou. Quem decide continua sendo
			 * ele, e ele recusa de novo do outro lado — isto so evita o pedido
			 * que ja nasce sabendo a resposta.
			 */
			const atual = GrupoIdle.estado && GrupoIdle.estado.postos;
			const veredito = (atual || []).filter(function (p) {
				return p.id === botao.dataset.posto;
			})[0];
			if (veredito && !veredito.disponivel) {
				mostrarRecado(veredito.motivo || 'Esse posto nao esta disponivel agora.', true);
				return;
			}
			mandar({ acao: 'posto', posto: botao.dataset.posto });
		});
	});
}

function desenharRateio(e) {
	const r = raiz();
	const rateio = (e && e.rateio) || null;
	const tabela = (e && e.tabela) || [];

	const numeros = [
		['Membros', rateio ? rateio.membros : 0],
		['Elegiveis', rateio ? rateio.elegiveis : 0],
		['Total de exemplo', rateio ? rateio.totalDeReferencia : 0],
		['Por membro', rateio && rateio.porMembro !== null ? rateio.porMembro : '—']
	];
	r.querySelector('.gi-rateio-agora').innerHTML = numeros
		.map(function (par) {
			return (
				'<div class="gi-numero"><span class="gi-numero-valor">' +
				escapeHtml(par[1]) +
				'</span><span class="gi-numero-rotulo">' +
				escapeHtml(par[0]) +
				'</span></div>'
			);
		})
		.join('');

	r.querySelector('.gi-rateio-explica').textContent =
		'Com o rateio igual, as parcelas de cada um viram um bolo so: o bolo e dividido pelo numero ' +
		'de elegiveis e SO ENTAO o premio de grupo entra, sobre a parcela ja dividida. E por isso ' +
		'que um grupo maior leva mais no total do que a mesma gente cacando separada.';

	const agora = rateio ? rateio.elegiveis : -1;
	const cabecalho =
		'<div class="gi-rateio-linha is-cabecalho">' +
		'<span>Elegiveis</span><span>Premio</span><span>Por membro</span><span>O grupo leva</span>' +
		'</div>';
	r.querySelector('.gi-rateio-tabela').innerHTML =
		cabecalho +
		tabela
			.map(function (linha) {
				return (
					'<div class="gi-rateio-linha' +
					(linha.elegiveis === agora ? ' is-agora' : '') +
					'">' +
					'<span>' +
					escapeHtml(linha.elegiveis) +
					'</span><span>+' +
					escapeHtml(linha.premio) +
					'%</span><span>' +
					escapeHtml(linha.porMembro) +
					'</span><span>' +
					escapeHtml(linha.somaDoGrupo) +
					'</span>' +
					'</div>'
				);
			})
			.join('');
}

/**
 * Os AJUSTES. Ele NAO reconstroi nada — so acende o segmento certo e
 * liga/desliga `disabled`. E o que deixa o painel sobreviver a um empurrao
 * chegando no meio de um clique.
 */
function desenharAjustes(e) {
	const r = raiz();
	const eu = (e && e.eu) || null;
	const grupo = (e && e.grupo) || null;
	const souLider = !!(eu && eu.souLider);
	const emGrupo = !!grupo;

	const acender = function (seletor, ligado) {
		r.querySelectorAll(seletor).forEach(function (b) {
			b.classList.toggle('is-on', ligado(b));
		});
	};

	acender('[data-convites]', function (b) {
		return eu ? (b.dataset.convites === '1') === !!eu.aceitaConvites : false;
	});
	acender('[data-exp]', function (b) {
		return grupo ? Number(b.dataset.exp) === grupo.exp : false;
	});
	acender('[data-itens]', function (b) {
		return grupo ? Number(b.dataset.itens) === grupo.itens : false;
	});
	acender('[data-aprox]', function (b) {
		return eu ? b.dataset.aprox === eu.aproximacao : false;
	});

	// So o LIDER muda as regras do grupo; a aproximacao so vale em grupo; e
	// "receber convites" vale sempre, inclusive fora de grupo — e o ajuste de
	// quem NAO quer ser chamado.
	r.querySelectorAll('[data-exp], [data-itens]').forEach(function (b) {
		b.disabled = !souLider;
	});
	r.querySelector('.gi-aplicar-exp').disabled = !souLider;
	r.querySelector('.gi-aplicar-itens').disabled = !souLider;
	r.querySelectorAll('[data-aprox]').forEach(function (b) {
		b.disabled = !emGrupo;
	});

	r.querySelector('.gi-sair').hidden = !emGrupo;
	r.querySelector('.gi-desfazer').hidden = !souLider;
	r.querySelector('.gi-desfazer-confirma').hidden = !(souLider && GrupoIdle.confirmarDesfazer);
}


/* ------------------------------------------------------------------ */
/* A VIDA AO VIVO (07/09/2026 — relato do alfa)                        */
/* ------------------------------------------------------------------ */

/**
 * Quanto tempo entre duas leituras da vida dos companheiros.
 *
 * O servidor manda o `ZC_NOTIFY_HP_TO_GROUPM_R2` **uma vez por LOTE** de
 * combate, e nao por golpe (`difundirHpNoGrupo`, servidor-mapa.ts). 400 ms fica
 * abaixo desse ritmo sem ser um laco quente: a leitura e um `Map.get` por
 * linha, sobre no maximo tres linhas (`LIMITE_DE_MEMBROS_DO_GRUPO`).
 */
const VIDA_AO_VIVO_MS = 400;

/** @var {number|null} handle do ticker. Existe so com a janela ABERTA. */
let _tickerDeVida = null;

/**
 * MOVE A BARRA de cada companheiro com o HP que o combate ja mandou.
 *
 * ---------------------------------------------------------------------------
 * POR QUE LER O `EntityManager`, E NAO FISGAR O PACOTE
 * ---------------------------------------------------------------------------
 * `Network.hookPacket` SOBRESCREVE (NetworkManager.js guarda UM callback por
 * pacote): fisgar o 0x080e trocaria em silencio o `onMemberLifeUpdate` de
 * `Engine/MapEngine/Group.js`, que e quem desenha a barrinha em cima da cabeca
 * e alimenta a janela nativa. E a mesma razao pela qual toda janela RAGIDLE le
 * estado em vez de fisgar (ver o cabecalho do `CorreioIdle`).
 *
 * O handler nativo ja deposita o par em `EntityManager.storeLife(AID, ...)`,
 * inclusive quando a entidade nao esta na tela. Ler dali e ler o MESMO dado que
 * o servidor mandou, sem competir com ninguem por ele.
 *
 * ---------------------------------------------------------------------------
 * POR QUE ELE NAO REDESENHA A LISTA
 * ---------------------------------------------------------------------------
 * `desenharMembros` reescreve o `innerHTML` inteiro e recarrega a arte de
 * classe. A quatro vezes por segundo isso piscaria os icones e mataria
 * qualquer foco. Aqui so a LARGURA do preenchimento e o texto do numero mudam.
 */
function vidaAoVivo() {
	const lista = raiz().querySelector('.gi-membros');
	if (!lista) {
		return;
	}
	lista.querySelectorAll('.gi-membro[data-conta]').forEach(function (linha) {
		const conta = parseInt(linha.dataset.conta, 10);
		if (!conta) {
			return;
		}
		// `null` = "o combate ainda nao falou", e nao "zero de vida": a linha
		// fica com o que o empurrao trouxe. Ver `vidaDoMembro`.
		const barra = vidaDoMembro(EntityManager.getLife(conta));
		if (!barra) {
			return;
		}
		const fill = linha.querySelector('.gi-membro-hp .fill');
		if (fill) {
			fill.style.width = (barra.fracao * 100).toFixed(1) + '%';
		}
		const numero = linha.querySelector('.gi-membro-hp-num');
		if (numero) {
			numero.textContent = barra.texto;
		}
		const estado = linha.querySelector('.gi-estado');
		if (estado && !linha.classList.contains('is-offline')) {
			estado.classList.toggle('is-vivo', barra.vivo);
			estado.classList.toggle('is-morto', !barra.vivo);
			estado.title = barra.vivo ? 'No mundo' : 'Caido';
		}
	});
}

/** Liga o ticker. Idempotente: abrir duas vezes nao cria dois. */
function ligarVidaAoVivo() {
	if (_tickerDeVida !== null) {
		return;
	}
	_tickerDeVida = setInterval(vidaAoVivo, VIDA_AO_VIVO_MS);
}

/** Desliga. Janela fechada nao le nada — e o mesmo contrato do empurrao. */
function desligarVidaAoVivo() {
	if (_tickerDeVida === null) {
		return;
	}
	clearInterval(_tickerDeVida);
	_tickerDeVida = null;
}

function desenharTudo() {
	const e = GrupoIdle.estado;
	desenharEstandarte(e);
	desenharFaixa(e);
	desenharMembros(e);
	desenharMeuPosto(e);
	desenharCacada(e);
	desenharPostos(e);
	desenharRateio(e);
	desenharAjustes(e);
	// D-964: o conteudo acabou de mudar, entao a marca de rolagem tambem pode
	// ter mudado — um grupo de 10 rola, um de 1 nao.
	marcarRolagem();
}

/**
 * A JANELA DE CONFIRMACAO (transferir lideranca / retirar membro): cobre a
 * janela do grupo, descreve a acao e so manda o pacote no "Sim". Cancelar,
 * Esc e clique fora fecham sem mandar nada. Cada `aoConfirmar` RELE o estado
 * (`membroAtual`): se o grupo mudou com a caixa aberta (perdi a coroa, o alvo
 * saiu, ficou offline ou mudou de mapa), o pacote nao sai e o recado explica.
 */
function membroAtual(contaId) {
	const atual = GrupoIdle.estado;
	const grupo = atual && atual.grupo;
	const eu = atual && atual.eu;
	if (!eu || !eu.souLider || !grupo) {
		return null;
	}
	return (
		grupo.membros.filter(function (x) {
			return x.contaId === contaId && !x.souEu;
		})[0] || null
	);
}

function fecharConfirmacao() {
	const m = raiz().querySelector('.gi-modal');
	m.hidden = true;
	GrupoIdle.acaoPendente = null;
}

function pedirConfirmacao(opcoes) {
	const m = raiz().querySelector('.gi-modal');
	m.querySelector('.gi-modal-titulo').textContent = opcoes.titulo;
	m.querySelector('.gi-modal-texto').textContent = opcoes.texto;
	m.querySelector('.gi-modal-sim').textContent = opcoes.rotuloSim;
	m.dataset.tipo = opcoes.tipo || '';
	GrupoIdle.acaoPendente = opcoes.aoConfirmar;
	m.hidden = false;
	m.querySelector('.gi-modal-nao').focus();
}

function mostrarRecado(texto, ehProblema) {
	const el = raiz().querySelector('.gi-recado');
	el.textContent = texto || '';
	el.classList.toggle('is-problema', !!ehProblema);
}

/* ------------------------------------------------------------------ */
/* OS EVENTOS                                                          */
/* ------------------------------------------------------------------ */

/** Um listener por peca ESTATICA, ligado uma vez no `init()` — os botoes
 * reconstruidos (assumir posto) reatam o proprio a cada desenho. */
function ligarEventos(r) {
	r.querySelector('.gi-close').addEventListener('click', function () {
		GrupoIdle.fechar();
	});

	/* D-964: chegar ao fim da rolagem APAGA o desvanecer — e a metade que
	   torna o sinal honesto (sem ela, o pe da lista prometeria uma
	   continuacao que nao existe). `passive` porque este listener nunca
	   cancela a rolagem. */
	r.querySelector('.gi-body').addEventListener('scroll', marcarRolagem, { passive: true });

	r.querySelectorAll('.gi-tab').forEach(function (aba) {
		aba.addEventListener('click', function () {
			trocarAba(aba.dataset.tab);
		});
	});

	r.querySelector('.gi-ir-ajustes').addEventListener('click', function () {
		trocarAba('ajustes');
	});
	r.querySelector('.gi-ver-rateio').addEventListener('click', function () {
		trocarAba('rateio');
	});
	r.querySelector('.gi-trocar-posto').addEventListener('click', function () {
		trocarAba('postos');
	});

	r.querySelector('.gi-teleportar').addEventListener('click', function () {
		// A ponte IRMA de `aoPedirLocalizador`, e pela mesma razao: quem sabe
		// mandar `{acao:'teleportar'}` e o Localizador, e importa-lo daqui
		// prenderia a ordem de carga de uma janela a da outra. Nao ha um
		// segundo `PACKET.CZ.RAGIDLE_LFG_ACAO` montado neste arquivo — o dono
		// pediu reuso, e reuso e nao ter a segunda copia.
		if (GrupoIdle.aoPedirTeleporte) {
			GrupoIdle.aoPedirTeleporte();
		}
	});

	// ─── Convite ───────────────────────────────────────────────────────────
	const painelConvite = r.querySelector('.gi-convite');
	const campoNome = r.querySelector('.gi-convite-nome');
	r.querySelector('.gi-convidar-abrir').addEventListener('click', function () {
		painelConvite.hidden = false;
		campoNome.focus();
	});
	r.querySelector('.gi-convite-fechar').addEventListener('click', function () {
		painelConvite.hidden = true;
		// O rascunho SO e apagado quando o proprio jogador fecha o painel —
		// nunca por causa de um desenho.
		campoNome.value = '';
	});
	const enviarConvite = function () {
		const nome = campoNome.value.trim();
		if (!nome) {
			mostrarRecado('Digite o nome exato de quem voce quer convidar.', true);
			return;
		}
		mandar({ acao: 'convidar', nome: nome });
	};
	r.querySelector('.gi-convite-enviar').addEventListener('click', enviarConvite);
	campoNome.addEventListener('keydown', function (evento) {
		if (evento.key === 'Enter') {
			enviarConvite();
		}
	});
	r.querySelector('.gi-convite-lfg').addEventListener('click', function () {
		// OS DOIS CAMINHOS DE ENTRADA CONVIVEM (pedido do dono): o convite por
		// nome e o Localizador. Este botao e a ponte entre as duas janelas.
		if (GrupoIdle.aoPedirLocalizador) {
			GrupoIdle.aoPedirLocalizador();
		}
	});

	// ─── Ajustes ───────────────────────────────────────────────────────────
	r.querySelectorAll('[data-convites]').forEach(function (b) {
		b.addEventListener('click', function () {
			mandar({ acao: 'preferencias', convites: b.dataset.convites === '1' });
		});
	});
	r.querySelectorAll('[data-aprox]').forEach(function (b) {
		b.addEventListener('click', function () {
			mandar({ acao: 'preferencias', aproximacao: b.dataset.aprox });
		});
	});

	/* Os dois segmentos de REGRA sao escolha ADIADA: o clique so acende o
	   botao, e o "Aplicar" e que manda. E o pedido do dono (cada regra tem o
	   seu botao de aplicar), e ele evita que um toque perdido troque a regra
	   de EXP do grupo inteiro no meio de uma cacada. */
	const escolhaLocal = { exp: null, itens: null };
	r.querySelectorAll('[data-exp]').forEach(function (b) {
		b.addEventListener('click', function () {
			escolhaLocal.exp = Number(b.dataset.exp);
			r.querySelectorAll('[data-exp]').forEach(function (o) {
				o.classList.toggle('is-on', o === b);
			});
		});
	});
	r.querySelectorAll('[data-itens]').forEach(function (b) {
		b.addEventListener('click', function () {
			escolhaLocal.itens = Number(b.dataset.itens);
			r.querySelectorAll('[data-itens]').forEach(function (o) {
				o.classList.toggle('is-on', o === b);
			});
		});
	});
	r.querySelector('.gi-aplicar-exp').addEventListener('click', function () {
		const e = GrupoIdle.estado;
		const valor = escolhaLocal.exp !== null ? escolhaLocal.exp : e && e.grupo ? e.grupo.exp : 0;
		mandar({ acao: 'regras', exp: valor });
	});
	r.querySelector('.gi-aplicar-itens').addEventListener('click', function () {
		const e = GrupoIdle.estado;
		const valor =
			escolhaLocal.itens !== null ? escolhaLocal.itens : e && e.grupo ? e.grupo.itens : 0;
		mandar({ acao: 'regras', itens: valor });
	});

	// ─── Confirmacao de transferir / retirar ──────────────────────────────
	const modal = r.querySelector('.gi-modal');
	r.querySelector('.gi-modal-nao').addEventListener('click', fecharConfirmacao);
	r.querySelector('.gi-modal-sim').addEventListener('click', function () {
		const acao = GrupoIdle.acaoPendente;
		fecharConfirmacao();
		if (acao) {
			acao();
		}
	});
	modal.addEventListener('click', function (ev) {
		if (ev.target === modal) {
			fecharConfirmacao();
		}
	});
	modal.addEventListener('keydown', function (ev) {
		if (ev.key === 'Escape') {
			ev.stopPropagation();
			fecharConfirmacao();
		}
	});

	// ─── Sair / desfazer: os pacotes que JA existiam ──────────────────────
	r.querySelector('.gi-sair').addEventListener('click', function () {
		// `CZ_REQ_LEAVE_GROUP` (0x0100) — a MESMA rota do botao nativo. O
		// servidor empurra o estado novo, e a janela vira "sem grupo" sozinha.
		Network.sendPacket(new PACKET.CZ.REQ_LEAVE_GROUP());
	});
	r.querySelector('.gi-desfazer').addEventListener('click', function () {
		GrupoIdle.confirmarDesfazer = true;
		desenharAjustes(GrupoIdle.estado);
	});
	r.querySelector('.gi-desfazer-nao').addEventListener('click', function () {
		GrupoIdle.confirmarDesfazer = false;
		desenharAjustes(GrupoIdle.estado);
	});
	r.querySelector('.gi-desfazer-sim').addEventListener('click', function () {
		GrupoIdle.confirmarDesfazer = false;
		desenharAjustes(GrupoIdle.estado);
		/* O `{acao:'dissolver'}` do LFG — quarenta linhas de consequencia que
		   nenhuma outra rota tem (avisar cada membro, fechar o anuncio,
		   arrastar todo mundo de volta a cidade pausando a missao de quem foi
		   arrastado). Reescrever isso num verbo proprio seria a segunda rota
		   escrita a mao para a mesma pergunta. */
		const pkt = new PACKET.CZ.RAGIDLE_LFG_ACAO();
		pkt.json = JSON.stringify({ acao: 'dissolver' });
		Network.sendPacket(pkt);
	});
}

GrupoIdle.init = function init() {
	const r = raiz();

	// A barra de titulo e a alca do arrasto — e habilitar o arrasto e o que
	// liga o `_fixPositionOverflow` do GUIComponent, que grampeia a janela
	// dentro da viewport.
	this.draggable(r.querySelector('.gi-titlebar'));

	ligarEventos(r);
	GrupoIdle.abaAtiva = abaLembrada(_preferences, ABA_PADRAO, ABAS);
	sincronizarAbas();

	// Centralizar pela tela REAL, e nao pelo top/left do CSS.
	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';

	desenharTudo();
};

/**
 * `Engine/MapEngine.js` chama `append()` (e portanto este gancho) ao TERMINAR
 * o carregamento de todo mapa novo. Os dois consertos abaixo sao os do
 * `LFGIdle.onAppend`, e eles nasceram de uma sonda no jogo real (03/09/2026):
 *
 *  1. o piso do clamp nunca fica menor que o proprio tamanho da janela — com
 *     `Renderer.height` ainda nao assentado no meio da troca de cena, a conta
 *     ficava negativa e empurrava a janela para fora da area visivel;
 *  2. o pedido de estado e ADIADO (`setTimeout(..., 0)`): mandar pacote
 *     dentro do `append()` sincrono roda ANTES do `NOTIFY_ACTORINIT`, que e a
 *     familia de bug ja catalogada neste projeto ("o pacote do proprio
 *     jogador espera o ACTORINIT", D-376).
 */
GrupoIdle.onAppend = function onAppend() {
	const alturaMinima = Math.max(WINDOW_HEIGHT, Renderer.height);
	const larguraMinima = Math.max(WINDOW_WIDTH, Renderer.width);
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), alturaMinima - WINDOW_HEIGHT) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), larguraMinima - WINDOW_WIDTH) + 'px';
	}

	if (!GrupoIdle.estavaAberta) {
		return;
	}
	raiz().querySelector('.gi-window').classList.add('is-open');
	// O mapa novo ESVAZIOU o cache de vida (`MapRenderer.clearLifeCache`), e o
	// primeiro lote de combate o enche de novo. Religar aqui e o que faz a
	// barra voltar a andar depois da viagem — sem isto, a janela reaberta
	// mostrava o HP do empurrao e mais nada.
	ligarVidaAoVivo();
	setTimeout(function () {
		if (GrupoIdle.estavaAberta) {
			Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_GRUPO());
		}
	}, 0);
};

GrupoIdle.onRemove = function onRemove() {
	// O `onRemove` roda na troca de mapa e na saida: um ticker sobrevivente
	// leria um DOM que ja nao esta na arvore, quatro vezes por segundo, para
	// sempre.
	desligarVidaAoVivo();
	_preferences.x = parseInt(GrupoIdle._host.style.left, 10) || 0;
	_preferences.y = parseInt(GrupoIdle._host.style.top, 10) || 0;
	_preferences.save();
};

GrupoIdle.abrir = function abrir() {
	raiz().querySelector('.gi-window').classList.add('is-open');
	GrupoIdle.estavaAberta = true;
	ligarVidaAoVivo();
	// PEDE o estado ao abrir, e o pedido tambem INSCREVE a conexao no
	// empurrao — quem decide o que a janela mostra e o servidor.
	Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_GRUPO());
};

/** Fechar DESINSCREVE do empurrao — so manda o pacote quando a janela
 * REALMENTE estava aberta, para nao gerar uma acao por clique perdido. */
GrupoIdle.fechar = function fechar() {
	const win = raiz().querySelector('.gi-window');
	GrupoIdle.estavaAberta = false;
	desligarVidaAoVivo();
	if (win.classList.contains('is-open')) {
		win.classList.remove('is-open');
		fecharConfirmacao();
		mandar({ acao: 'fechar' });
	}
};

GrupoIdle.toggle = function toggle() {
	if (raiz().querySelector('.gi-window').classList.contains('is-open')) {
		GrupoIdle.fechar();
	} else {
		GrupoIdle.abrir();
	}
};

/**
 * A ponte para o Localizador de Grupos. Ela e um GANCHO, e nao um import: a
 * janela de Grupo nao pode importar `LFGIdle.js` (as duas sao componentes de
 * UI e o import cruzado prenderia uma a outra na ordem de carga). Quem liga o
 * gancho e o `MapEngine.js`, que ja conhece as duas.
 */
GrupoIdle.aoPedirLocalizador = null;

/**
 * A IRMA da ponte acima (D-984): "me leve ate o lider".
 *
 * Ela existe pelos mesmos dois motivos — nao importar `LFGIdle.js` daqui, e
 * nao ter uma SEGUNDA implementacao do teleporte. O corpo dela e uma linha
 * so, no Localizador (`LFGIdle.teleportarParaOLider`), que e onde o
 * `{acao:'teleportar'}` sempre morou e onde o RESULTADO desse pacote sabe ser
 * lido. Quem liga as duas pontas e o `MapEngine.js`, que ja conhece as duas
 * janelas.
 */
GrupoIdle.aoPedirTeleporte = null;

/**
 * O GANCHO DA HUD DE PARTY (09/09/2026).
 *
 * `Network.hookPacket` SOBRESCREVE — um callback por opcode. Se a HUD fisgasse
 * o `ZC_RAGIDLE_GRUPO` para saber a composicao, ela mataria em silencio o
 * handler desta janela. Entao quem recebe e UM so (este arquivo), e quem mais
 * precisa do estado se pendura aqui.
 *
 * `null` quando ninguem se pendurou — a janela funciona sozinha, como sempre.
 */
GrupoIdle.aoAtualizar = null;

/*
 * ATENCAO ao `hookPacket`: ele SOBRESCREVE o handler anterior daquele opcode.
 * Este e nosso e de mais ninguem.
 */
Network.hookPacket(PACKET.ZC.RAGIDLE_GRUPO, function (pkt) {
	let dados = null;
	try {
		dados = JSON.parse(pkt.json);
	} catch (_erro) {
		return;
	}
	if (!dados) {
		return;
	}
	GrupoIdle.estado = dados;

	if (Array.isArray(dados.problemas) && dados.problemas.length) {
		// A recusa e a frase do SERVIDOR, mostrada como veio — a janela nao
		// reescreve o motivo, e nao valida nada por conta propria.
		mostrarRecado(dados.problemas.join(' · '), true);
	} else if (dados.recado) {
		mostrarRecado(dados.recado, false);
	} else if (!dados.grupo) {
		mostrarRecado('Abra o Localizador de Grupos para entrar num grupo.', false);
	}

	desenharTudo();
	/*
	 * E QUEM MAIS DEPENDE DO ESTADO e avisado — hoje, a HUD de party. O gancho
	 * dispara mesmo com a janela FECHADA: o estado chega por empurrao do
	 * servidor, e a HUD nao pode depender de alguem ter aberto isto.
	 */
	if (GrupoIdle.aoAtualizar) {
		GrupoIdle.aoAtualizar();
	}
});

/**
 * A TROCA DE PERSONAGEM ESQUECE TUDO — `cleanGameUI()`/`onRestart()` nao
 * recarregam a pagina, entao todo estado de MODULO atravessa a troca.
 */
GrupoIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	const r = raiz();
	if (r.querySelector('.gi-window').classList.contains('is-open')) {
		mandar({ acao: 'fechar' });
	}
	GrupoIdle.estado = null;
	GrupoIdle.estavaAberta = false;
	GrupoIdle.confirmarDesfazer = false;
	// O nome digitado e rascunho do personagem ANTERIOR — nao faz sentido
	// oferece-lo pronto para o proximo.
	r.querySelector('.gi-convite-nome').value = '';
	r.querySelector('.gi-convite').hidden = true;
	mostrarRecado('Abra o Localizador de Grupos para entrar num grupo.', false);
	desenharTudo();

	/*
	 * ZERAR O DADO NAO BASTA: `GUIComponent.remove()` so DESANEXA o host,
	 * entao o shadow DOM (com `is-open` e o HTML do personagem anterior)
	 * atravessa a troca. Ver `UI/Components/limpezaDeJanelaIdle.js`.
	 */
	fecharEEsquecer(r, '.gi-window');
};

export default UIManager.addComponent(GrupoIdle);
