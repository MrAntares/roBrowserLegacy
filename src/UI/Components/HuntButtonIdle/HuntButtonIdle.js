/**
 * UI/Components/HuntButtonIdle/HuntButtonIdle.js
 *
 * "Botao de caca contextual" — pedido do dono, 19/08/2026: dois botoes fixos
 * logo ABAIXO do minimapa (ver HuntButtonIdle.css pro numero exato de respiro,
 * medido com getBoundingClientRect contra #MiniMapV2):
 *   - "Caçar"                  -> abre a janela Mapa de Caça
 *   - "Retornar para Prontera" -> viaja de volta pro ponto salvo
 *
 * OS DOIS FICAM SEMPRE VISIVEIS E SEMPRE ATIVOS. Nasceram como UM botao que
 * trocava de rotulo com o mapa (19/08); viraram dois fixos em 31/08 (I3), com
 * o de voltar DESABILITADO em cidade; e o `disabled` caiu em 01/09 — o sinal
 * que o apagava (`contexto.ehCidade`) diz "estou em alguma cidade", nunca
 * "estou NESTA", entao ele matava o botao em Payon, Geffen, Morocc e Izlude,
 * onde a viagem de volta funciona. Ver a nota em `jaEstaNaCidadeDeDestino()`.
 *
 * O mapa de agora vem de IdleConfig.contexto.mapa, pedido ao servidor a CADA
 * troca de mapa por IdleConfig.sondarMapa() (Engine/MapEngine.js, dentro de
 * onMapChange, logo apos IdleConfig.append()) — este arquivo NAO pede de novo,
 * so LE o resultado. Lido por polling de 250ms (mesma cadencia e mesma tecnica
 * de DockIdle.js/TopMenuIdle.js) porque IdleConfig nao expoe nenhum evento de
 * "contexto mudou", so a propriedade publica.
 *
 * Acao de cada rotulo:
 *   - "Caçar" abre a janela Mapa de Caça (HuntMap.toggle(), MESMO metodo
 *     publico que o item "Caça" do DockIdle ja usa — DockIdle.js:266-268).
 *     Nao existe um "mapa de caça obvio" pra abrir direto: a propria janela
 *     ja lista os mapas por regiao/nivel/nome/busca, e abrir ela em vez de
 *     sortear um destino e o comportamento honesto pedido no briefing.
 *   - "Retornar para Prontera" viaja de volta SEM abrir janela nenhuma, via
 *     HuntMap.travelToCity() (metodo publico novo em HuntMap.js que manda o
 *     MESMO pacote CZ_RAGIDLE_VIAJAR que o botao "Retornar ao ponto salvo"
 *     do painel ja manda — nenhum pacote novo, so um segundo gatilho pro
 *     mesmo handler; ver o comentario de HuntMap.travelToCity em HuntMap.js).
 *
 * Remove (de forma REVERSIVEL) o botao preto redondo do AdminPanel
 * (".ap-button", position:fixed dentro do proprio shadow root dele — ver
 * AdminPanel.css:50-56) que ficava sozinho logo abaixo do minimapa: MESMA
 * tecnica hideButton() que DockIdle.js:241-247 usa pros 3 botoes flutuantes
 * redundantes dele (display:none via JS, nunca .remove() — AdminPanel.js
 * continua dono do elemento e do seu listener, nenhum arquivo dele e
 * tocado). O esconderijo mora AQUI (nao mais em DockIdle.js, que nunca
 * escondia ".ap-button" de proposito) porque o dono esta aposentando o
 * DockIdle nesta mesma rodada — este componente novo e o lugar que
 * sobrevive a isso. O painel de admin continua alcancavel pela grade do
 * painel do personagem (data-action="admin" em BasicInfoIdle.html).
 *
 * @author RagIdle
 */

import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import HuntMap from 'UI/Components/HuntMap/HuntMap.js';
import { contextoDoMapa } from 'UI/contextoDoMapa.js';
import AdminPanel from 'UI/Components/AdminPanel/AdminPanel.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import ProcessCommand from 'Controls/ProcessCommand.js';
import Session from 'Engine/SessionStorage.js';
import { emIngles } from 'Core/Idioma.js';
import htmlText from './HuntButtonIdle.html?raw';
import cssText from './HuntButtonIdle.css?raw';
import { emUnidadesDaHud } from 'UI/escalaDaHud.js'; // D-934: geometria medida vira unidade da HUD

/**
 * Mesmo intervalo de polling leve que DockIdle.js/TopMenuIdle.js.
 */
const POLL_INTERVAL_MS = 250;

const LABEL_CACAR = 'Caçar';
const LABEL_RETORNAR = 'Retornar para Prontera';

/**
 * Create Component
 */
const HuntButtonIdle = new GUIComponent('HuntButtonIdle', cssText);

HuntButtonIdle.render = () => htmlText;

/**
 * Mesmo modo dos outros flutuantes RAGIDLE: nao intercepta clique/hover fora
 * do proprio botao (":host" fica pointer-events:none, ver HuntButtonIdle.css).
 */
HuntButtonIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/**
 * Fora do sistema de foco/z-index — este componente nunca e uma janela,
 * entao nunca precisa vir pra frente (mesmo motivo de DockIdle.js/
 * TopMenuIdle.js, ver os cabecalhos deles).
 */
HuntButtonIdle.needFocus = false;

/**
 * @var {number|null} setInterval handle do polling leve de contexto.
 */
let _pollTimer = null;

/**
 * @var {boolean|null} ultimo valor de "ja estou na cidade de destino" aplicado
 * ao `title` — evita reescrever o DOM a cada tique quando nada mudou.
 */
let _ultimoEmCasa = null;

/**
 * Helper: query dentro do shadow root
 */
function _root() {
	return HuntButtonIdle._shadow || HuntButtonIdle._host;
}

/**
 * One-time setup (roda uma vez, durante GUIComponent#prepare()).
 */
HuntButtonIdle.init = function init() {
	const root = _root();
	/*
	 * DOIS BOTOES, DOIS OUVINTES (I3, 31/08/2026 — pedido do dono).
	 *
	 * Antes era UM botao que trocava de rotulo conforme o mapa. Agora cada
	 * acao tem o proprio elemento e o proprio ouvinte: sem `if` no clique,
	 * e sem um rotulo que muda debaixo do dedo de quem ja estava mirando.
	 */
	root.querySelector('.hb-cacar').addEventListener('click', onClickCacar);
	root.querySelector('.hb-voltar').addEventListener('click', onClickVoltar);
	root.querySelector('.hb-sentar').addEventListener('click', onClickSentar);
};

/**
 * PUBLICA A PROPRIA ALTURA, para quem vem abaixo se pendurar (I3/I4,
 * 31/08/2026).
 *
 * ---------------------------------------------------------------------------
 * POR QUE MEDIDO, E NAO UM NUMERO NO CSS
 * ---------------------------------------------------------------------------
 * Os icones de status ficam abaixo desta coluna, e a conta deles precisava da
 * altura daqui. Eu a estimei DUAS vezes e errei as duas: primeiro 157px para o
 * minimapa (esquecendo o rodape de coordenadas — o certo e 184), depois 34px
 * por botao (e "Retornar para Prontera" quebra em DUAS linhas neste largura).
 *
 * Numero estimado erra e erra CALADO — a sobreposicao que o dono relatou nasceu
 * exatamente assim, de somas a mao entre componentes que nao se conhecem.
 *
 * Medir aqui resolve de vez: a altura sai do `getBoundingClientRect` do host,
 * entao ela acompanha mudanca de rotulo, de fonte, de tema e de idioma sem
 * ninguem lembrar de nada.
 *
 * Roda em `onAppend` e a cada troca de mapa (o rotulo/estado muda e a caixa
 * pode mudar de altura junto).
 */
function publicarAltura() {
	const host = HuntButtonIdle._host;
	if (!host) {
		return;
	}
	const altura = Math.round(host.getBoundingClientRect().height);
	// Zero = ainda nao desenhou (o layout nao rodou). Publicar zero faria os
	// icones subirem para cima dos botoes por um quadro.
	if (altura <= 0) {
		return;
	}
	/* D-934: unidade da HUD. Ver `emUnidadesDaHud`. */
	document.documentElement.style.setProperty(
		'--hud-td-altura-dos-botoes',
		`${Math.round(emUnidadesDaHud(altura))}px`,
	);
}

/**
 * Esconde o botao preto do AdminPanel, sincroniza o rotulo com o mapa atual
 * e liga o polling que mantem as duas coisas atualizadas a cada troca de
 * mapa (este componente e recriado do zero em todo onMapChange, ver
 * Engine/MapEngine.js).
 */
HuntButtonIdle.onAppend = function onAppend() {
	const raiz = _root().querySelector('#HuntButtonIdle');
	if (raiz) {
		raiz.classList.toggle('hb-en', emIngles());
	}
	hideAdminButton();
	publicarAltura();
	_ultimoEmCasa = null;
	syncLabel();
	startPolling();
};

/**
 * Desliga o polling quando o componente sai de cena (troca de mapa) — mesmo
 * cuidado de DockIdle.js/TopMenuIdle.js.
 */
HuntButtonIdle.onRemove = function onRemove() {
	stopPolling();
};

/**
 * Esquece o ultimo estado desenhado (D-1673).
 *
 * `syncLabel` so toca o DOM quando o valor MUDA (`_ultimoEmCasa`), que e o que
 * evita reescrever a caixa a cada volta do polling. Quem troca de personagem —
 * ou monta o componente de novo do zero — precisa que o proximo `syncLabel`
 * desenhe mesmo que o valor calculado seja igual ao da sessao anterior, senao
 * a caixa fica com o estado de outro personagem ate o mapa mudar.
 */
HuntButtonIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	_ultimoEmCasa = null;
};

function startPolling() {
	stopPolling();
	_pollTimer = setInterval(poll, POLL_INTERVAL_MS);
}

function stopPolling() {
	if (_pollTimer != null) {
		clearInterval(_pollTimer);
		_pollTimer = null;
	}
}

function poll() {
	hideAdminButton();
	syncLabel();
	syncSentar();
}

/**
 * Esconde ".ap-button" do AdminPanel — reversivel, MESMA tecnica de
 * DockIdle.js:hideButton() (display:none via JS, nunca .remove()). Repetido
 * no polling pela mesma razao de DockIdle.js:hideNativeLevelUpButton(): se o
 * botao de algum jeito reaparecesse, o proximo tique esconde de novo.
 */
function hideAdminButton() {
	const root = AdminPanel.getRoot();
	const btn = root && root.querySelector('.ap-button');
	if (btn && btn.style.display !== 'none') {
		btn.style.display = 'none';
	}
}

/**
 * "O jogador JA ESTA na cidade de destino?"
 *
 * ---------------------------------------------------------------------------
 * POR QUE NAO E `contexto.ehCidade`
 * ---------------------------------------------------------------------------
 * `ehCidade` responde "este mapa tem populacao de mobs?" (servidor-mapa.ts:
 * `ehCidade: ms.populacao === null`). Ele diz que voce esta EM ALGUMA cidade —
 * nunca que voce esta NESTA, a do ponto salvo. Parado em Payon ou Geffen o
 * sinal e `true` e a viagem de volta continua legitima: e por isso que o painel
 * do Mapa de Caça sempre usou a comparacao de MAPA e nao este sinal
 * (HuntMap.js, `const atCity = catalog.mapaAtual === catalog.cidade.mapa`).
 *
 * O destino sai de `HuntMap.catalog.cidade.mapa`; o mapa de agora sai de
 * `IdleConfig.contexto.mapa`, que e re-sondado a CADA troca de mapa. Enquanto
 * um dos dois for desconhecido (catalogo nunca pedido, contexto obsoleto) a
 * resposta e `false`: na duvida a viagem sai, que e o lado seguro — o servidor
 * recusa sozinho quem ja chegou (D-388).
 */
function jaEstaNaCidadeDeDestino() {
	const cidade = HuntMap.catalog && HuntMap.catalog.cidade;
	const ctx = contextoDoMapa();
	if (!cidade || !ctx) {
		return false;
	}
	return ctx.mapa === cidade.mapa;
}

/**
 * Rotulo da cidade de destino para a mensagem ("Prontera"), com o nome do mapa
 * como ultimo recurso.
 */
function rotuloDaCidade() {
	const cidade = HuntMap.catalog && HuntMap.catalog.cidade;
	return (cidade && (cidade.rotulo || cidade.mapa)) || 'Prontera';
}

/**
 * Atualiza o ESTADO do par de botoes a partir do sinal REAL (o mapa de agora,
 * em IdleConfig.contexto.mapa), so tocando o DOM quando o valor muda (ver
 * _ultimoEmCasa acima). Nenhum dos dois e desabilitado aqui: o que muda e o
 * `title`.
 */
function syncLabel() {
	if (!contextoDoMapa()) {
		/*
		 * Ainda sem resposta do servidor pra esta troca de mapa (sondada em
		 * IdleConfig.sondarMapa(), chamada em Engine/MapEngine.js a cada
		 * onMapChange) — mantem o rotulo atual (o HTML ja nasce com "Caçar",
		 * ver HuntButtonIdle.html) em vez de piscar algo no meio termo.
		 *
		 * A METADE `contextoObsoleto` E DE 27/08/2026 (auditoria C). A guarda
		 * testava so a AUSENCIA de contexto, e `IdleConfig.contexto` so e
		 * `null` no boot do modulo: depois da primeira resposta da sessao ela
		 * nunca mais era verdadeira. O problema real e contexto OBSOLETO.
		 *
		 * O sintoma: depois de TODA viagem o botao mostrava o rotulo do mapa
		 * anterior — "Retornar para Prontera" ja em Prontera, "Caçar" ja no
		 * mapa de caca — ate a resposta chegar. E como `syncLabel` so toca o
		 * DOM quando o valor MUDA (`_ultimoEmCasa`), o texto errado ficava
		 * gravado como se fosse o certo.
		 *
		 * Uma guarda que descreve a intencao certa e testa a condicao errada e
		 * pior que nenhuma: ela faz o caso parecer coberto.
		 */
		return;
	}

	const emCasa = jaEstaNaCidadeDeDestino();
	if (emCasa === _ultimoEmCasa) {
		return;
	}
	_ultimoEmCasa = emCasa;

	const root = _root();
	const cacar = root.querySelector('.hb-cacar');
	const voltar = root.querySelector('.hb-voltar');
	if (!cacar || !voltar) {
		return;
	}
	/*
	 * "RETORNAR PARA PRONTERA" FICA SEMPRE ATIVO (01/09/2026 — pedido do dono).
	 *
	 * Ele nascia desabilitado em TODA cidade, porque o sinal usado era
	 * `contexto.ehCidade`. Quem estivesse em Payon, Geffen, Morocc ou Izlude —
	 * cidades tanto quanto Prontera — encontrava o botao de voltar apagado
	 * justamente onde ele servia: a viagem de volta dali e valida, e o painel
	 * do Mapa de Caça a oferecia normalmente na mesma hora. Um botao apagado
	 * numa situacao em que a acao funciona nao protege ninguem, so esconde.
	 *
	 * Agora ele nunca e desabilitado. O unico caso em que a viagem nao tem o
	 * que fazer — voce JA esta na cidade do ponto salvo — deixou de ser um
	 * botao morto e virou uma frase no chat (ver onClickVoltar), porque o
	 * servidor recusa esse pedido EM SILENCIO (D-388) e clique sem resposta
	 * nenhuma e o defeito que `avisarSeAJanelaEstaFechada` ja tinha consertado
	 * do outro lado, em HuntMap.js.
	 *
	 * O `title` continua avisando ANTES do clique quando voce ja esta em casa —
	 * dizer e diferente de impedir.
	 */
	/*
	 * D-1673 (21/09/2026) — E ELA REVERTE A DECISAO DE 01/09/2026 ACIMA.
	 *
	 * O texto logo acima continua registrado de proposito, porque o argumento
	 * dele segue bom: botao apagado numa situacao em que a acao FUNCIONA nao
	 * protege ninguem. O que mudou nao foi esse argumento — foi o caso. A
	 * ordem nova do dono e *"habilite cada acao conforme sua aplicabilidade,
	 * explicando estados indisponiveis"*, e "ja estou na cidade do ponto
	 * salvo" e o unico caso em que a acao NAO funciona: o servidor a recusa em
	 * silencio (D-388).
	 *
	 * A metade que faltava em 01/09 e o "explicando": o motivo sai do `title`
	 * (que no celular ninguem le, porque nao ha hover) e vira TEXTO na tela.
	 * Desabilitar SEM dizer por que era o que estava errado; desabilitar
	 * DIZENDO e o que o dono pediu.
	 */
	voltar.disabled = emCasa;
	voltar.title = emCasa ? `Você já está em ${rotuloDaCidade()}` : LABEL_RETORNAR;
	cacar.title = LABEL_CACAR;
	const motivo = root.querySelector('.hb-motivo');
	if (motivo) {
		motivo.textContent = emCasa ? `Você já está em ${rotuloDaCidade()}.` : '';
		motivo.hidden = !emCasa;
	}
	// A caixa pode ter mudado de altura (rotulo, quebra de linha): quem vem
	// abaixo se pendura na medida, e nao num numero escrito no CSS.
	publicarAltura();
}

function onClickCacar(e) {
	e.stopImmediatePropagation();
	// Nao ha um "mapa obvio" pra abrir direto — a propria janela Mapa de Caça
	// ja lista tudo por regiao/nivel/nome. Mesmo metodo publico que o item
	// "Caça" do DockIdle ja usa (DockIdle.js:266-268).
	HuntMap.toggle();
}

/*
 * SENTAR/LEVANTAR (04/10/2026). O MESMO caminho da tecla Insert do desktop
 * (ShortCuts.Sit -> o comando `/sit` de ProcessCommand.js), e nao um pacote
 * montado aqui: quem decide entre sentar (acao 2) e levantar (acao 3) e o
 * comando, olhando a postura da propria entidade. O servidor atende os dois
 * (CZ_REQUEST_ACT2, com freio), inclusive na cidade.
 */
function onClickSentar(e) {
	e.stopImmediatePropagation();
	ProcessCommand.processCommand.call(ChatBox, 'sit');
}

/** O rotulo e a cor seguem a postura que o servidor confirmou (ZC_NOTIFY_ACT). */
function syncSentar() {
	const root = _root();
	const btn = root && root.querySelector('.hb-sentar');
	const ent = Session.Entity;
	if (!btn || !ent) {
		return;
	}
	const sentado = ent.action === ent.ACTION.SIT;
	if (btn.classList.contains('is-sentado') === sentado) {
		return;
	}
	btn.classList.toggle('is-sentado', sentado);
	const rotulo = sentado ? 'Levantar' : 'Sentar';
	btn.title = rotulo;
	const span = btn.querySelector('.hb-rotulo');
	if (span) {
		span.textContent = rotulo;
	}
}

function onClickVoltar(e) {
	e.stopImmediatePropagation();
	/*
	 * O botao esta SEMPRE ativo, entao o clique de quem ja chegou tambem chega
	 * aqui. Viajar para a cidade estando NELA e o unico pedido que o servidor
	 * recusa em silencio (D-388, "ja esta la"): sem esta frase o jogador
	 * clicaria, nao viajaria, e nada apareceria na tela.
	 *
	 * A janela do Mapa de Caça esta fechada neste caminho (e o botao da HUD),
	 * por isso a mensagem vai pro chat — mesmo raciocinio de
	 * `avisarSeAJanelaEstaFechada` em HuntMap.js.
	 */
	if (jaEstaNaCidadeDeDestino()) {
		ChatBox.addText(
			`Você já está em ${rotuloDaCidade()}.`,
			ChatBox.TYPE.ERROR,
			ChatBox.FILTER.PUBLIC_LOG
		);
		return;
	}
	// Viaja de volta SEM abrir a janela — mesmo pacote CZ_RAGIDLE_VIAJAR que o
	// botao "Retornar ao ponto salvo" do painel ja manda, so um segundo
	// gatilho pro mesmo handler (ver HuntMap.js:travelToCity).
	HuntMap.travelToCity();
}

/**
 * A TROCA DE PERSONAGEM ESQUECE O BOTAO DE CACA (28/08/2026).
 *
 * Voltar ao menu de personagem NAO recarrega a pagina: `onRestartAnswer` chama
 * `cleanGameUI()` e `onRestart()`, sem `GameEngine.reload()` (o reload so
 * acontece no SAIR). Todo estado de MODULO atravessa a troca — e este arquivo
 * guarda o ultimo contexto de mapa que ele leu.
 *
 * O aviso do botao muda conforme o personagem ja esteja ou nao na cidade do
 * ponto salvo. Dois personagens podem estar em lugares diferentes, e
 * `_ultimoEmCasa` segura o redesenho enquanto nao mudar.
 *
 * Chamada por `cleanGameUI()` em Engine/MapEngine.js, junto com os outros
 * componentes RAGIDLE. Quem somar estado de personagem aqui soma a linha
 * correspondente ABAIXO, e o portao `limpeza-da-troca-de-personagem.test.ts`
 * (no repo do servidor) reprova se esquecer.
 */
HuntButtonIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	_ultimoEmCasa = null;
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(HuntButtonIdle);
