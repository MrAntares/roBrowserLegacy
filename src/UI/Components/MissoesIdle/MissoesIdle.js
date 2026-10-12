/**
 * UI/Components/MissoesIdle/MissoesIdle.js
 *
 * A JANELA DE MISSÕES (D-551): abas Principais/Opcionais, cards com estado,
 * requisito legível, objetivos com progresso e — na missão de Troca de
 * Classe — a grade de classes com o botão "Ir até o NPC".
 *
 * Três escolhas de desenho, nenhuma estética:
 *
 * 1. **Quem decide o estado é o SERVIDOR.** Este componente desenha o que
 *    `ZC_RAGIDLE_MISSOES` (0x0fed) manda — estado, requisito e progresso
 *    chegam prontos. Recalcular aqui daria a segunda cópia da regra, a que
 *    ninguém lembra de atualizar (a mesma escolha do aviso de classe,
 *    ClassChangeNotice.js:12-15).
 *
 * 2. **O botão "Ir até o NPC" manda `CZ_RAGIDLE_VIAJAR`** — o MESMO pacote
 *    da janela "Mapa de Caça" e do aviso de classe, nunca um caminho novo.
 *    O servidor já sabe recusar mapa que não carrega.
 *
 * 3. **O pacote chega também sem pedir** (empurrado no level up e na troca),
 *    então o render é idempotente e a janela fechada só guarda o dado — o
 *    custo de desenhar só existe quando ela está aberta.
 *
 * Entrada na HUD: o botão "Missões" do LEQUE do menu (TopMenuIdle.html/
 * TopMenuIdle.js), que chama MissoesIdle.toggle(). Ele morou no cluster de
 * essenciais de 24/08/2026 a 06/09/2026, quando o dono o trocou de casa com o
 * "Recompensas" (D-944) — o botão desceu, a janela não mudou em nada.
 *
 * @author RagIdle
 */

import Renderer from 'Renderer/Renderer.js';
import { podeIniciarMissao } from './podeIniciarMissao.js'; // RAGIDLE: I16
import Preferences from 'Core/Preferences.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './MissoesIdle.html?raw';
import cssText from './MissoesIdle.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';
import { anotarAvisoDoCodex, limparAvisoDoCodex } from '../avisoDoCodex.js'; // D-1232
import { anotarRastreadorDoCodex, ehCorpoParcialDoRastreador, limparRastreadorDoCodex } from '../rastreadorDoCodex.js'; // D-1839, D-1853
// O "IR AO MAPA" (26/09/2026): a linha do objetivo e o fluxo da escolha sao
// os MESMOS da aba "Missoes Gerais" do Codex — ver `escolhaDeMapa.js`.
import { linhaDoCaiDe } from './ondeCaiHtml.js';
import { fecharEscolha, pedirOndeCai, receberOndeCai } from './escolhaDeMapa.js';
import escolhaCss from './escolhaDeMapa.css?raw';
// ATE TRES MISSOES AO MESMO TEMPO e o "(i)" (01/10/2026): as regras puras das
// aceitas, o parcial de progresso (`v: 3`) e o painel de informacoes.
import { missaoAceita, textoDoLimiteDeMissoes } from './podeIniciarMissao.js';
import {
	acoesDaMissaoAceita,
	aplicarProgressoParcial,
	ehCorpoParcialDeProgresso,
	estadoParaOJogador
} from './missoesAceitas.js';
import {
	alternarInfoDaMissao,
	botaoDeInfoHtml,
	fecharInfoDaMissao,
	redesenharInfoDaMissao
} from './infoDaMissao.js';
import infoCss from './infoDaMissao.css?raw';

/** Manter em sincronia com o ":host"/".mi-window" do CSS (mesmo papel do
 * WINDOW_WIDTH/HEIGHT de IdleConfig.js:47-48). */
const WINDOW_WIDTH = 560;
const WINDOW_HEIGHT = 520;

const MissoesIdle = new GUIComponent('MissoesIdle', cssText + '\n' + escolhaCss + '\n' + infoCss);

MissoesIdle.render = () => htmlText;

/** Janela fechada não pode engolir clique de cena — par do
 * ":host{pointer-events:none}" do CSS (mesma escolha de IdleConfig.js). */
MissoesIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/** As missões que o servidor mandou por último ({v:1, missoes:[...]}). */
MissoesIdle.missoes = [];

/**
 * O PACOTE JA RESPONDEU AO MENOS UMA VEZ NESTA SESSAO?
 *
 * `missoes` nasce `[]`, e um array vazio LEGITIMO ("nenhuma missao opcional
 * ainda") e indistinguivel dele por forma. Quem le este estado de FORA (a
 * aba "Missões Gerais" do Codex, 16/09/2026) precisa saber a diferenca para
 * mostrar "carregando" em vez de "nenhuma missao" no primeiro instante.
 */
MissoesIdle.recebeuAlgumaVez = false;

/** O retrato do EXECUTOR: `{aceitas, maximo}` desde 01/10/2026 (ate tres
 * missoes ao mesmo tempo, na ordem de aceite; antes era `{ativaId, passo, fila,
 * pausada}`, D-601). O tracker (MissoesTrackerIdle) LÊ daqui — uma fonte só, um
 * hook só. */
MissoesIdle.execucao = null;

/**
 * JA PEDIMOS A LISTA INTEIRA por causa de um parcial que nao casou?
 *
 * O parcial de progresso (`v: 3`) indexa os objetivos pela POSICAO na ultima
 * lista inteira. Se ele nao casa (outro numero de objetivos, missao que a lista
 * nao tem), a lista daqui esta velha, e a resposta e pedir a inteira — UMA vez
 * ate ela chegar, e nao uma por abate.
 */
let _pediuAListaInteira = false;

/** As abas que existem, na ordem do HTML — a lista que valida o que veio do
 * `localStorage` (ver memoriaDeAba.js). */
const ABAS = ['principais', 'opcionais'];

/** A aba de fabrica, para quem nunca escolheu. */
const ABA_PADRAO = 'principais';

/** Aba ativa: 'principais' | 'opcionais'. Nasce no padrao e vira a LEMBRADA no
 * init(), que e onde `_preferences` ja existe. */
MissoesIdle.activeTab = ABA_PADRAO;

/**
 * A MISSÃO A DESTACAR quando a lista chegar (09/09/2026).
 *
 * `abrirEmMissao` é chamada de fora (a etiqueta `quest · missão` da árvore de
 * habilidades) e a lista de missões NÃO está garantida em memória: abrir a
 * janela dispara `RAGIDLE_PEDIR_MISSOES` e a resposta chega depois. Guardar o
 * id aqui e consumi-lo no `render()` é o que faz o destaque funcionar nos DOIS
 * casos — janela já aberta com a lista na mão, e janela fechada abrindo do
 * zero. Tentar destacar na hora só cobriria o primeiro.
 */
let _missaoADestacar = null;

/**
 * A rolagem já aconteceu para o destaque atual?
 *
 * Separada do id porque as duas coisas têm vidas diferentes, e a primeira
 * versão as juntou num campo só — o defeito que a prova pegou. `abrirEmMissao`
 * PEDE a lista ao servidor, a resposta chega e chama `render()` de novo: o
 * segundo render reescreve o `innerHTML` e leva a classe junto, e um id já
 * consumido não a repõe. O id fica até um gesto do jogador; a rolagem, não,
 * senão a lista se puxaria de volta a cada atualização.
 */
let _jaRolouAteODestaque = false;

/** Posicao da janela e a aba em que o jogador estava. Versao continua 1.0: ver
 * a conta no cabecalho de memoriaDeAba.js. */
const _preferences = Preferences.get(
	'MissoesIdle',
	{
		x: null,
		y: null,
		aba: null,
		/*
		 * MOSTRAR TAMBEM AS CONCLUIDAS (11/09/2026, pedido do dono: "oculte por
		 * padrao todas as missoes que ja foram concluidas").
		 *
		 * `false` de fabrica — ocultar E o pedido. E a VERSAO NAO SOBE: se a
		 * leitura nao mesclar campo novo sobre o padrao, ele chega `undefined`,
		 * que e falso, que e exatamente o que se quer. Falha segura por
		 * construcao, sem obrigar ninguem a perder a posicao da janela.
		 *
		 * Fica ao lado de `aba` porque e a mesma classe de preferencia: escolha
		 * da PESSOA, e nao dado do personagem — `limparEstadoDoPersonagem` nao
		 * a toca, pela razao que `abaSobreviveAoF5` ja registra sobre a aba.
		 */
		concluidas: false
	},
	1.0
);

function _root() {
	return MissoesIdle._shadow || MissoesIdle._host;
}

/** Mesmo helper privado de IdleConfig.js:126-148 / HuntMap.js:133-148. */
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

/** O rótulo e a cor de cada estado — o VALOR vem do servidor, aqui só a pele. */
const BADGES = {
	bloqueada: { classe: 'ri-badge--cinza', rotulo: 'Bloqueada' },
	disponivel: { classe: 'ri-badge--azul', rotulo: 'Disponível' },
	'em-andamento': { classe: 'ri-badge--ouro', rotulo: 'Em andamento' },
	// 01/10/2026: aceita e com tudo cumprido — o "Finalizar" esta aceso.
	pronta: { classe: 'ri-badge--verde', rotulo: 'Pronta' },
	concluida: { classe: 'ri-badge--verde', rotulo: 'Concluída' }
};

/**
 * ESQUECE O PERSONAGEM ANTERIOR — ver a nota gemea em IdleConfig.js
 * (27/08/2026, auditoria C). `cleanGameUI()` nao limpava nenhum componente
 * RAGIDLE, e a troca de personagem nao recarrega a pagina.
 */
MissoesIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	MissoesIdle.missoes = [];
	_missaoADestacar = null;
	_jaRolouAteODestaque = false;
	MissoesIdle.execucao = null;
	_pediuAListaInteira = false;
	// O painel "(i)" aberto por esta janela fala de uma missao do personagem
	// anterior (01/10/2026).
	fecharInfoDaMissao(conteinerDoInfo());
	// O Codex é DO PERSONAGEM: a bolinha do anterior falaria de um progresso
	// que este não tem. Ela volta no primeiro pacote da sessão nova (D-1232).
	limparAvisoDoCodex();
	// D-1839: o rastreador do Codex tambem e do personagem.
	limparRastreadorDoCodex();
	// O personagem novo ainda nao respondeu nada — sem isto a aba "Missões
	// Gerais" do Codex mostraria as missões do personagem ANTERIOR ate o
	// primeiro pacote chegar (o mesmo defeito que `fecharEEsquecer` existe
	// para evitar nas outras janelas).
	MissoesIdle.recebeuAlgumaVez = false;
	/*
	 * A ABA VOLTA PARA A LEMBRADA, e nao para 'principais' (31/08/2026). Aba
	 * nao e dado de personagem: e a escolha da PESSOA, e vale para todos os
	 * personagens dela. O que esta linha precisa garantir e so que a aba nao
	 * carregue nada do anterior — e um nome de aba nao carrega.
	 */
	MissoesIdle.activeTab = abaLembrada(_preferences, ABA_PADRAO, ABAS);
	/*
	 * ZERAR O DADO NAO BASTA: `GUIComponent.remove()` so DESANEXA o host,
	 * entao o shadow DOM (com `is-open` e o HTML do personagem anterior)
	 * atravessa a troca. Ver `UI/Components/limpezaDeJanelaIdle.js`.
	 */
	fecharEEsquecer(_root(), '.mi-window');
};

MissoesIdle.init = function init() {
	const root = _root();
	// A aba em que o jogador estava, antes do render() la embaixo.
	MissoesIdle.activeTab = abaLembrada(_preferences, ABA_PADRAO, ABAS);
	// Guardas nos querySelector, pelo motivo registrado em
	// ClassChangeNotice.js:68-88: este init roda dentro de MapEngine.init, e
	// uma exceção aqui derruba o motor de mapa inteiro. Janela de missões é
	// cosmética; o que ela não pode é custar o mundo 3D.
	const fechar = root && root.querySelector('.mi-close');
	if (fechar) {
		fechar.addEventListener('click', onClickClose);
	}
	if (root) {
		root.querySelectorAll('.mi-tab').forEach(btn => btn.addEventListener('click', onClickTab));
		// O interruptor das concluidas (11/09/2026). Guarda no `querySelector`
		// pelo mesmo motivo dos de cima: este init roda dentro de
		// `MapEngine.init`, e uma excecao aqui derruba o motor de mapa.
		const concluidas = root.querySelector('.mi-concluidas');
		if (concluidas) {
			concluidas.addEventListener('click', onClickConcluidas);
		}
		const titulo = root.querySelector('.mi-titlebar');
		if (titulo) {
			this.draggable(titulo);
		}
	}

	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';

	render();
};

MissoesIdle.onAppend = function onAppend() {
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - WINDOW_HEIGHT) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - WINDOW_WIDTH) + 'px';
	}
};

MissoesIdle.onRemove = function onRemove() {
	savePosition();
};

function savePosition() {
	_preferences.x = parseInt(MissoesIdle._host.style.left, 10) || 0;
	_preferences.y = parseInt(MissoesIdle._host.style.top, 10) || 0;
	_preferences.save();
}

/** Abre/fecha; ao abrir, pede o estado ao servidor (mesmo formato do
 * toggle() de IdleConfig.js). */
MissoesIdle.toggle = function toggle() {
	const root = _root();
	const win = root && root.querySelector('.mi-window');
	if (!win) {
		return;
	}
	if (win.classList.contains('is-open')) {
		closeWindow();
	} else {
		win.classList.add('is-open');
		MissoesIdle.focus();
		/* 01/10/2026: o parcial de progresso (`v: 3`) nao redesenha a janela
		   FECHADA (ele chega a cada abate). Abrir desenha o que esta em memoria
		   AGORA, e o pedido logo abaixo traz a lista inteira por cima. */
		render();
		Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_MISSOES());
	}
};

/**
 * ABRE A JANELA JÁ NA MISSÃO PEDIDA — o outro lado do pedido do dono de
 * 09/09/2026 sobre as habilidades de quest.
 *
 * Método público, no mesmo molde de `HuntMap.travelToCity()`: quem chama é a
 * árvore de habilidades (`IdleSkills.js`), e o acoplamento fica numa função
 * nomeada em vez de o outro componente mexer no DOM desta janela.
 *
 * Ele NÃO alterna: chamar com a janela já aberta reposiciona na missão em vez
 * de fechar. `toggle` seria o gesto errado aqui — o jogador pediu para ver uma
 * missão, e fechar a janela é o contrário disso.
 */
MissoesIdle.abrirEmMissao = function abrirEmMissao(id, tipo) {
	const root = _root();
	const win = root && root.querySelector('.mi-window');
	if (!win || !id) {
		return;
	}
	MissoesIdle.activeTab = tipo === 'principal' ? 'principais' : 'opcionais';
	lembrarAba(_preferences, MissoesIdle.activeTab);
	_missaoADestacar = id;
	_jaRolouAteODestaque = false;
	if (!win.classList.contains('is-open')) {
		win.classList.add('is-open');
		MissoesIdle.focus();
	}
	Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_MISSOES());
	// Com a lista já em memória isto destaca AGORA; sem ela, o `render()` que a
	// resposta dispara consome o mesmo `_missaoADestacar`.
	render();
};

function closeWindow() {
	_missaoADestacar = null;
	const root = _root();
	const win = root && root.querySelector('.mi-window');
	if (win) {
		win.classList.remove('is-open');
	}
	// A escolha de mapa mora ao lado da janela: fecha junto, senao ficava
	// sozinha na tela com a janela fechada atras (26/09/2026).
	fecharEscolha(JANELA_DE_MISSOES);
	// O painel "(i)" aberto POR ESTA janela tambem (01/10/2026). O do cartao da
	// HUD, nao: `fecharInfoDaMissao` so fecha o painel deste conteiner.
	fecharInfoDaMissao(conteinerDoInfo());
	savePosition();
}

/** A janela esta aberta agora? */
function janelaAberta() {
	const root = _root();
	const win = root && root.querySelector('.mi-window');
	return !!(win && win.classList.contains('is-open'));
}

/**
 * Onde o painel "(i)" desta janela mora: a RAIZ `#MissoesIdle`, e nao a
 * `.mi-window` — o vidro da janela (`backdrop-filter`) prenderia o
 * `position: fixed` do painel dentro dela (ver `infoDaMissao.css`).
 */
function conteinerDoInfo() {
	const root = _root();
	return root ? root.querySelector('#MissoesIdle') : null;
}

/**
 * Manda uma acao de missao. TODA acao leva o id desde 01/10/2026: com ate
 * tres aceitas nao ha "a ativa" para o servidor adivinhar — o "Ir caçar" leva
 * ao objetivo DESTA missao, e o "Finalizar" entrega ESTA.
 */
function mandarAcaoDeMissao(acao, id) {
	const pkt = new PACKET.CZ.RAGIDLE_MISSAO_ACAO();
	pkt.json = JSON.stringify(id ? { acao, id } : { acao });
	Network.sendPacket(pkt);
	// O "Ir caçar" troca de mapa: a janela fecha para nao cobrir a chegada,
	// como no "Ir até o NPC".
	if (acao === 'teleporte') {
		closeWindow();
	}
}

/** O gesto do "(i)" de um cartao: abre o painel da missao; de novo, fecha. */
function alternarInfo(id) {
	const conteiner = conteinerDoInfo();
	if (!conteiner || !id) {
		return;
	}
	alternarInfoDaMissao({
		id,
		conteiner,
		host: MissoesIdle._host,
		ancora: () => {
			const root = _root();
			const botoes = root ? root.querySelectorAll('.mi-body [data-info]') : [];
			return Array.from(botoes).find(b => b.getAttribute('data-info') === id) || null;
		},
		dados: () => ({ missoes: MissoesIdle.missoes || [], execucao: MissoesIdle.execucao || null }),
		agir: mandarAcaoDeMissao
		// Sem `verNaJanela`: o painel ja foi aberto DE DENTRO da janela.
	});
}

/** Esta janela para o fluxo do "Ir ao mapa" — a escolha nasce DENTRO da
 * `.mi-window`, a caixa que o jogador ve (ver `escolhaDeMapa.js`). */
const JANELA_DE_MISSOES = {
	container() {
		const root = _root();
		return root ? root.querySelector('.mi-window') : null;
	},
	fecharJanela() {
		closeWindow();
	}
};

function onClickClose(e) {
	e.stopImmediatePropagation();
	closeWindow();
}

function onClickTab(e) {
	e.stopImmediatePropagation();
	// Gesto do jogador: ele foi olhar outra coisa, o destaque cumpriu o papel.
	_missaoADestacar = null;
	MissoesIdle.activeTab = e.currentTarget.dataset.tab;
	lembrarAba(_preferences, MissoesIdle.activeTab);
	render();
}

/**
 * Alterna "mostrar tambem as concluidas" (11/09/2026).
 *
 * NAO e um `.mi-tab`, e a distincao e deliberada: `abaSobreviveAoF5` liga e
 * conta os `.mi-tab` por `data-tab`, e um terceiro botao com aquela classe
 * entraria na conta dele como se fosse uma aba.
 */
function onClickConcluidas(e) {
	e.stopImmediatePropagation();
	// Mesmo gesto do clique de aba: o jogador foi olhar outra coisa.
	_missaoADestacar = null;
	_preferences.concluidas = !_preferences.concluidas;
	_preferences.save();
	render();
}

function render() {
	const root = _root();
	if (!root) {
		return;
	}
	const body = root.querySelector('.mi-body');
	if (!body) {
		return;
	}

	root.querySelectorAll('.mi-tab').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.tab === MissoesIdle.activeTab);
	});

	/*
	 * AS CONCLUIDAS SAO OCULTAS POR PADRAO (11/09/2026, pedido do dono).
	 *
	 * O filtro fica NESTE ponto porque ele ja e o unico lugar que recorta a
	 * lista — somar um segundo recorte noutro sitio seria a segunda rota que
	 * este projeto passa o dia consertando.
	 *
	 * O BOTAO E PINTADO AQUI, e nao no clique: `render()` tambem roda quando a
	 * lista chega do servidor e na abertura da janela, e pintar so no clique
	 * deixaria o botao mentindo nesses dois caminhos — o mesmo motivo pelo qual
	 * as abas sao repintadas logo acima.
	 */
	const mostrarConcluidas = _preferences.concluidas === true;
	const alternador = root.querySelector('.mi-concluidas');
	if (alternador) {
		alternador.classList.toggle('is-active', mostrarConcluidas);
		alternador.setAttribute('aria-pressed', String(mostrarConcluidas));
	}

	const tipoDaAba = MissoesIdle.activeTab === 'opcionais' ? 'opcional' : 'principal';
	const daAba = (MissoesIdle.missoes || []).filter(
		m => m.tipo === tipoDaAba && (mostrarConcluidas || m.estado !== 'concluida')
	);

	if (!daAba.length) {
		// A aba Opcionais é ESTRUTURA por enquanto (decisão do dono, 24/08/2026):
		// o formato de dados já aceita `tipo: "opcional"`, e a primeira que o
		// servidor mandar aparece aqui sem mexer em nada.
		body.innerHTML =
			MissoesIdle.activeTab === 'opcionais'
				? '<div class="mi-empty">Nenhuma missão opcional por enquanto — em breve.</div>'
				: '<div class="mi-empty">Nenhuma missão principal disponível.</div>';
		return;
	}

	body.innerHTML = daAba.map(cardDeMissao).join('');

	/*
	 * O DESTAQUE PEDIDO POR `abrirEmMissao` (09/09/2026).
	 *
	 * Reaplicado a CADA render, e não consumido no primeiro: `abrirEmMissao`
	 * pede a lista ao servidor, e a resposta dispara um render que reescreve o
	 * `innerHTML` inteiro. A primeira versão marcava e zerava o id no mesmo
	 * render — o segundo apagava a classe e não tinha com que a repor, e a
	 * `prove:quest-e-carrinho` mediu exatamente isso: o cartão na lista, sem
	 * destaque.
	 *
	 * Quem solta o destaque é um GESTO do jogador (trocar de aba, fechar), e
	 * não a passagem do tempo: enquanto ele estiver olhando a missão que pediu,
	 * ela continua marcada.
	 *
	 * O cartão pode não estar aqui — outra aba, ou missão que o servidor não
	 * mandou. Nesse caso não acontece nada e a janela abre normal, que é o
	 * degrau certo: melhor abrir a lista do que abrir em nada.
	 */
	if (_missaoADestacar) {
		const alvo = body.querySelector('[data-missao="' + _missaoADestacar.replace(/"/g, '') + '"]');
		if (alvo) {
			alvo.classList.add('is-destacada');
			if (!_jaRolouAteODestaque) {
				_jaRolouAteODestaque = true;
				alvo.scrollIntoView({ block: 'center' });
			}
		}
	}

	body.querySelectorAll('[data-mapa]').forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopImmediatePropagation();
			const pkt = new PACKET.CZ.RAGIDLE_VIAJAR();
			pkt.mapName = btn.dataset.mapa;
			Network.sendPacket(pkt);
			// A viagem troca de mapa; a janela fecha para não cobrir a chegada.
			// O estado continua vivo no servidor — reabrir re-pede.
			closeWindow();
		});
	});

	// "IR AO MAPA" (26/09/2026): pede ao servidor onde o item cai. A resposta
	// volta no proprio pacote das missoes (`ondeCai`), e e ela que decide se vai
	// direto (um mapa so) ou abre a escolha — ver `escolhaDeMapa.js`.
	body.querySelectorAll('[data-onde-cai]').forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopImmediatePropagation();
			pedirOndeCai(btn.dataset.ondeCai, btn.dataset.missaoId || null, JANELA_DE_MISSOES);
		});
	});

	// O 1-CLIQUE do executor (D-601): Iniciar/Finalizar/Ir caçar/Abandonar
	// mandam a ação e o SERVIDOR decide — recusa educada chega pelo feed, nunca
	// um alert. Desde 01/10/2026 TODAS levam o id (ver `mandarAcaoDeMissao`).
	body.querySelectorAll('[data-executar]').forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopImmediatePropagation();
			// O "Finalizar" apagado (objetivos por cumprir) e o "3 de 3" nao
			// mandam nada: o navegador ja nao dispara clique em botao desabilitado,
			// e esta guarda cobre quem o dispare por fora.
			if (btn.disabled) {
				return;
			}
			mandarAcaoDeMissao(btn.dataset.executar, btn.dataset.id || null);
		});
	});

	// O "(i)" (01/10/2026): abre o painel com tudo da missao; de novo, fecha.
	body.querySelectorAll('[data-info]').forEach(btn => {
		btn.addEventListener('click', e => {
			e.stopImmediatePropagation();
			alternarInfo(btn.getAttribute('data-info'));
		});
	});
}

/**
 * O BOTAO QUE LEVA A PROVA, na oferta de classe BLOQUEADA (21/09/2026 —
 * ordem do dono, com o print: *"em vez de colocar nas opcionais, a gente vai
 * colocar um botao ali, que a pessoa clica para ir fazer a quest, e depois, na
 * hora que ela completa a quest, libera o botao para ela clicar para ir para o
 * NPC"*).
 *
 * A SEGUNDA METADE JA EXISTIA e nao muda: quando a prova fecha, o servidor
 * manda `bloqueadaPor: null` e o ramo de cima desenha o "Ir até o NPC". O que
 * faltava era a PRIMEIRA — a frase "Conclua antes a Prova de Vocação: X"
 * nomeia a missão e não leva a lugar nenhum, e até hoje a prova morava na aba
 * Opcionais, que o jogador não tem motivo para abrir.
 *
 * O BOTAO SO APARECE QUANDO A PROVA REALMENTE COMECA, e quem responde isso e
 * `podeIniciarMissao` — a MESMA regra do botao "Iniciar" do cartao (I16: uma
 * regra so, com teste que a executa). Um botao que sempre aparecesse e
 * respondesse "nao pode" seria pior que a frase que ele substitui.
 *
 * ELE ACHA A PROVA NA LISTA PELO `bloqueadaPorId`, e nao pelo titulo. Casar
 * texto e o defeito que este projeto passa o dia consertando — e a prova SO
 * esta nesta lista porque ela virou `tipo: 'principal'` no mesmo pedido
 * (game/missoes-do-jogo.ts). Se um dia ela sair de Principais, a busca falha
 * e o cartao volta a mostrar so a frase: degrau seguro, e nao tela quebrada.
 *
 * O `data-executar`/`data-id` e o contrato que o handler generico de
 * `render()` ja escuta — nenhum ouvinte novo, nenhuma segunda rota de envio.
 */
function botaoDaProva(c, execucao) {
	const id = c.bloqueadaPorId;
	if (!id) {
		return '';
	}
	const prova = (MissoesIdle.missoes || []).find(x => x.id === id);
	// ACEITA e "em andamento" (01/10/2026: ate tres juntas, sem "a ativa"); a
	// leitura e a mesma das outras telas (`missaoAceita`).
	if (missaoAceita(prova || { id }, execucao)) {
		return '<span class="mi-classe-bloqueio">Prova em andamento…</span>';
	}
	if (!prova || !prova.executavel || !podeIniciarMissao(prova, execucao || {})) {
		return '';
	}
	return (
		'<button type="button" class="mi-ir ri-btn ri-btn--ouro" data-executar="iniciar"' +
		' data-id="' + escapeHtml(id) + '">Fazer a prova</button>'
	);
}
/**
 * OS BOTOES DE UMA MISSAO ACEITA (01/10/2026): Finalizar (aceso so com
 * `pronta`), Ir caçar (so com destino), Abandonar e o "(i)". O QUE aparece e
 * quando acende e de `acoesDaMissaoAceita` — a mesma resposta do painel "(i)".
 */
function botoesDaAceita(m) {
	const id = escapeHtml(m.id);
	return (
		botaoDeInfoHtml(m, 'mi-info') +
		acoesDaMissaoAceita(m)
			.map(
				a =>
					`<button type="button" class="ri-btn ${a.destaque ? 'ri-btn--ouro' : 'ri-btn--sec'} mi-executar"` +
					` data-executar="${a.acao}" data-id="${id}"${a.habilitado ? '' : ' disabled'}` +
					` title="${escapeHtml(a.titulo)}">${escapeHtml(a.rotulo)}</button>`
			)
			.join('')
	);
}

function cardDeMissao(m) {
	const execucao = MissoesIdle.execucao || {};
	// O selo e o estado como o JOGADOR o le (01/10/2026): aceita = "Em
	// andamento" (ou "Pronta"); a abandonada com progresso guardado volta a ser
	// "Disponível", porque nada anda nela ate ele aceitar de novo.
	const badge = BADGES[estadoParaOJogador(m, execucao)] || BADGES.bloqueada;

	// O botão do executor (D-601): um clique, nenhuma pergunta.
	let botao = '';
	if (m.executavel) {
		if (missaoAceita(m, execucao)) {
			// 01/10/2026: era "Teleporte" + "Abandonar" na unica ativa, e "Na
			// fila…" nas outras. Com ate tres aceitas ao mesmo tempo, cada uma
			// tem os proprios botoes, e a fila deixou de existir.
			botao = botoesDaAceita(m);
		} else if (podeIniciarMissao(m, execucao)) {
			/* A REGRA MORA EM `podeIniciarMissao.js` (I16, 31/08/2026).
			   O teste que estava aqui — `estado === 'disponivel' || (concluida
			   && repetivel && !cooldownS)` — esquecia `em-andamento`, que e o
			   estado em que a MORTE deixa a missao (a ativa cai, o progresso
			   fica). O rastreador tinha o mesmo esquecimento, escrito separado.
			   Uma regra so, com teste que a executa. */
			botao = `<button type="button" class="ri-btn ri-btn--ouro mi-executar" data-executar="iniciar" data-id="${escapeHtml(m.id)}">Iniciar</button>`;
		} else if (podeIniciarMissao(m, execucao, { ignorarLimite: true })) {
			/* O TETO (01/10/2026): ela comecaria, se nao fossem as tres aceitas.
			   O botao fica no lugar, APAGADO, dizendo por que — sumir com ele
			   deixaria o jogador procurando o "Iniciar" que sempre esteve ali. */
			botao = `<button type="button" class="ri-btn ri-btn--sec mi-executar mi-limite" disabled title="Finalize ou abandone uma missão para aceitar outra">${escapeHtml(textoDoLimiteDeMissoes(execucao))}</button>`;
		} else if (m.cooldownS > 0) {
			botao = `<span class="mi-fila-aviso">Recarrega em ${Math.ceil(m.cooldownS / 60)} min</span>`;
		}
	}
	const rodape = botao ? `<div class="mi-card-rodape">${botao}</div>` : '';
	const dificuldade = m.dificuldade
		? `<span class="ri-badge ri-badge--cinza mi-dif" title="Dificuldade">${escapeHtml(m.dificuldade)}</span>`
		: '';

	const objetivos = (m.objetivos || [])
		.map(
			o => `
			<div class="mi-objetivo">
				<span>${escapeHtml(o.descricao)}</span>
				<span class="mi-objetivo-conta">${escapeHtml(o.progresso)}/${escapeHtml(o.alvo)}</span>
			</div>${linhaDoCaiDe(o, m)}`
		)
		.join('');

	const recompensas =
		m.recompensas && m.recompensas.length
			? `<p class="mi-recompensas">Recompensas: ${m.recompensas
					.map(r => escapeHtml(r.rotulo))
					.join(', ')}</p>`
			: '';

	// A grade de classes: informa sempre que a missão está viva (bloqueada
	// mostra em meia-luz o que vem pela frente), mas o botão de viajar só
	// existe quando o SERVIDOR disse "disponivel". Concluída não mostra grade
	// — não há mais nada a fazer nela.
	const classes =
		m.classes && m.classes.length && m.estado !== 'concluida'
			? `<div class="mi-classes">${m.classes
					.map(
						c => `
					<div class="mi-classe">
						<span class="mi-classe-nome">${escapeHtml(c.nomePt)}</span>
						<span class="mi-classe-cidade">${escapeHtml(c.mestre)} · ${escapeHtml(c.cidade)}</span>
						<span class="mi-classe-resumo">${escapeHtml(c.resumo)}</span>
						${
							// A oferta atrás de uma PROVA (D-1104) continua na lista, com o
							// nome da missão que falta — sumir é o defeito que o dono
							// reportou em 30/08. Quem RECUSA a troca é o servidor
							// (ofertaDoMestre); esconder o botão aqui é só não convidar
							// para uma viagem que termina em recusa.
							// "Conclua antes A <título>", sem dois-pontos: o título já traz
							// um ("Prova de Vocação: Espadachim"), e a frase saía com dois
							// na mesma linha. Olhado no print de fotografar-missoes-idle.
							c.bloqueadaPor
								? `<span class="mi-classe-bloqueio">Conclua antes a ${escapeHtml(c.bloqueadaPor)}</span>` +
									botaoDaProva(c, execucao)
								: m.estado === 'disponivel'
									? `<button type="button" class="mi-ir ri-btn" data-mapa="${escapeHtml(c.mapa)}">Ir até o NPC</button>`
									: ''
						}
					</div>`
					)
					.join('')}</div>`
			: '';

	return `
		<div class="mi-card" data-missao="${escapeHtml(m.id)}" data-estado="${escapeHtml(m.estado)}">
			<div class="mi-card-topo">
				<span class="mi-card-titulo">${escapeHtml(m.titulo)}</span>
				<span class="mi-card-badges">${dificuldade}<span class="ri-badge ${badge.classe}">${badge.rotulo}</span></span>
			</div>
			<p class="mi-desc">${escapeHtml(m.descricao)}</p>
			${m.estado === 'bloqueada' && m.requisito ? `<p class="mi-requisito">${escapeHtml(m.requisito)}</p>` : ''}
			${objetivos}
			${recompensas}
			${classes}
			${rodape}
		</div>`;
}

/**
 * O servidor mandou o estado — pedido ou empurrado, o caminho é um só.
 * Ele só escreve no fio quando o payload muda, então não há o que filtrar
 * aqui (mesmo contrato do aviso de classe).
 */
function onMissoesRecebidas(pkt) {
	let dados;
	try {
		dados = JSON.parse(pkt.json);
	} catch (err) {
		console.error('[MissoesIdle] payload nao e JSON valido', err);
		return;
	}
	/*
	 * O PARCIAL DO RASTREADOR (D-1853): quando so o contador do Codex andou, o
	 * servidor manda so ele. Ele atualiza o rastreador e para aqui: a lista de
	 * missoes nao mudou, entao nada de `render()` (a janela nem precisa estar
	 * aberta; o cartao da HUD le o rastreador no proprio polling).
	 */
	if (ehCorpoParcialDoRastreador(dados)) {
		anotarRastreadorDoCodex(dados.codexRastreado);
		return;
	}
	/*
	 * O PARCIAL DE PROGRESSO (`v: 3`, 01/10/2026): na maioria dos abates e das
	 * mudancas de mochila o servidor manda so o progresso das missoes que
	 * andaram e a lista das prontas, no lugar da lista inteira (~17 KB). Ele e
	 * FUNDIDO na lista que a ultima inteira trouxe, sem jogar fora o resto —
	 * e o cartao da HUD e o Codex, que leem este estado por polling, veem a
	 * mudanca pela assinatura.
	 */
	if (ehCorpoParcialDeProgresso(dados)) {
		fundirProgressoParcial(dados);
		return;
	}
	if (!dados || dados.v !== 1) {
		return;
	}
	MissoesIdle.missoes = Array.isArray(dados.missoes) ? dados.missoes : [];
	MissoesIdle.execucao = dados.execucao && typeof dados.execucao === 'object' ? dados.execucao : null;
	_pediuAListaInteira = false;
	/*
	 * A BOLINHA DO CODEX PEGA CARONA NESTE PACOTE (D-1232).
	 *
	 * Ela não é assunto desta janela — e é por isso que o valor vai para um
	 * módulo de um fato só (`avisoDoCodex.js`) em vez de virar um campo aqui.
	 * O carona existe porque este é o ÚNICO pacote empurrado a cada mudança e
	 * forçado na entrada: o `ZC_RAGIDLE_CODEX` só desce quando a janela do
	 * Codex abre, e a bolinha precisa aparecer antes disso.
	 */
	anotarAvisoDoCodex(dados.codexComNovidade === true);
	// O RASTREADOR DO CODEX pega a mesma carona (D-1839): as entradas marcadas,
	// com o contador, para o cartao da HUD (MissoesTrackerIdle) desenhar.
	anotarRastreadorDoCodex(dados.codexRastreado);
	MissoesIdle.recebeuAlgumaVez = true;
	render();
	// O painel "(i)" aberto acompanha a lista nova (ou fecha, se a missao saiu).
	redesenharInfoDaMissao();
	/*
	 * A RESPOSTA DO "IR AO MAPA" (26/09/2026). Quem decide se ela responde ao
	 * clique (o pacote e empurrado a toda hora, e uma lista velha nao pode
	 * reabrir a escolha sozinha) e o fluxo compartilhado com o Codex — este e o
	 * UNICO lugar que ouve o pacote, entao ele entrega a lista para os dois.
	 */
	if (dados.ondeCai) {
		receberOndeCai(dados.ondeCai);
	}
}

/**
 * Funde o parcial de progresso (`v: 3`) no estado. A regra da fusao e pura
 * (`aplicarProgressoParcial`, `missoesAceitas.js`); aqui fica o laco com o
 * resto: pedir a lista inteira quando o parcial nao casa, e redesenhar.
 *
 * - SEM LISTA AINDA (`recebeuAlgumaVez` falso), nao ha onde fundir: o parcial
 *   e descartado, e a lista inteira que a entrada no mapa forca traz tudo.
 * - A JANELA FECHADA NAO REDESENHA: o parcial chega a cada abate, e o
 *   `toggle` desenha ao abrir. O cartao da HUD e o Codex leem o estado por
 *   polling, e o painel "(i)" aberto e redesenhado aqui.
 */
function fundirProgressoParcial(dados) {
	if (!MissoesIdle.recebeuAlgumaVez) {
		return;
	}
	const r = aplicarProgressoParcial(MissoesIdle.missoes, dados);
	if (r.divergentes.length && !_pediuAListaInteira) {
		_pediuAListaInteira = true;
		console.warn('[MissoesIdle] o parcial de progresso nao casa com a lista; pedindo a lista inteira:', r.divergentes);
		Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_MISSOES());
	}
	if (!r.mudou) {
		return;
	}
	MissoesIdle.missoes = r.missoes;
	if (janelaAberta()) {
		render();
	}
	redesenharInfoDaMissao();
}

Network.hookPacket(PACKET.ZC.RAGIDLE_MISSOES, onMissoesRecebidas);

export default UIManager.addComponent(MissoesIdle);
