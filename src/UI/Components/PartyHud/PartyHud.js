/**
 * UI/Components/PartyHud/PartyHud.js
 *
 * RAGIDLE: A HUD DE PARTY (09/09/2026) — os companheiros SEMPRE a vista.
 *
 * ## O que existia antes disto
 *
 * Uma JANELA (`GrupoIdle`, D-960), que abre e fecha. Ela e completa — quatro
 * abas, rateio, postos — e e o lugar de CONFIGURAR o grupo. O que faltava era
 * o basico do RO original: saber, sem abrir nada, se o companheiro esta vivo.
 *
 * ## As tres decisoes que sustentam este arquivo
 *
 * **1. Ela NAO fisga pacote nenhum.** `Network.hookPacket` SOBRESCREVE (um
 * callback por opcode): registrar o `ZC_RAGIDLE_GRUPO` aqui mataria em silencio
 * o handler da janela, e registrar o `0x080e` mataria o `onMemberLifeUpdate`
 * nativo — que e quem desenha a barrinha em cima da cabeca. E a mesma razao por
 * que toda janela RAGIDLE le estado em vez de fisgar.
 *
 * **2. O HP vem do `EntityManager`, por ticker.** O handler nativo ja deposita
 * `storeLife(AID, ...)` a cada `ZC_NOTIFY_HP_TO_GROUPM_R2`, **sem inscricao
 * nenhuma** e mesmo com a entidade fora da tela. Ler dali e ler o MESMO dado
 * que o servidor mandou, sem competir por ele.
 *
 * **3. A composicao vem do `GrupoIdle.estado`, por gancho.** Nome, classe e
 * nivel so descem no `ZC_RAGIDLE_GRUPO`, que o servidor empurra apenas para
 * quem esta INSCRITO — e a inscricao morre quando a janela fecha
 * (`{acao:'fechar'}`). Por isso a HUD PEDE o painel nos dois momentos em que a
 * composicao muda de verdade (`portaDoGrupo`, entrar e sair), e o pedido
 * reinscreve de quebra. Entre um e outro ela nao precisa de nada: o que muda a
 * cada segundo — o HP — vem pelo outro caminho.
 *
 * ## Por que ela NAO aparece no celular em pe
 *
 * E decisao declarada, e nao esquecimento. A HUD vertical (D-939) ja ocupa a
 * coluna inteira — barra do topo, cartao de missoes, trilho, botao de caca,
 * atalhos e rodape —, e somar uma faixa fixa ali quebraria o enquadramento que
 * a `prove:hud-vertical` mede. No celular, quem quer ver o grupo abre a janela,
 * que la vira painel de tela cheia. No desktop e no celular DEITADO ela
 * aparece.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import Preferences from 'Core/Preferences.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import arrastarPorPonteiro, { prenderNaTela } from 'UI/arrastarPorPonteiro.js';
import EntityManager from 'Renderer/EntityManager.js';
import DB from 'DB/DBManager.js';
import GrupoIdle from '../GrupoIdle/GrupoIdle.js';
import { vidaDoMembro } from '../GrupoIdle/vidaDoMembro.js';
import { escreverEstilo, escreverTexto } from 'UI/escreverSeMudou.js';
import htmlText from './PartyHud.html?raw';
import cssText from './PartyHud.css?raw';

/** O mesmo ritmo da janela: rapido o bastante para ser util, lento para nao piscar. */
const VIDA_AO_VIVO_MS = 400;

const PartyHud = new GUIComponent('PartyHud', cssText);

PartyHud.render = () => htmlText;

/*
 * A HUD nao engole clique: ela e uma faixa informativa em cima da cena, e o
 * jogador clica ATRAVES dela para andar e atacar. Sem isto, o canto da tela
 * viraria uma zona morta permanente.
 */
PartyHud.mouseMode = GUIComponent.MouseMode.CROSS;

/** @var {number|null} o handle do ticker de HP. */
let _ticker = null;

/** A assinatura da ultima composicao desenhada — evita reescrever o HTML a toa. */
let _assinatura = '';

function _root() {
	return PartyHud._shadow || PartyHud._host;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

PartyHud.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	// A composicao e do PERSONAGEM: deixa-la atravessar mostraria o grupo de A
	// na tela de B — o mesmo defeito que a limpeza das janelas resolve.
	_assidoDesligado();
	_assinatura = '';
	const hud = _root() && _root().querySelector('.ph-hud');
	if (hud) {
		hud.hidden = true;
		const lista = hud.querySelector('.ph-membros');
		if (lista) {
			lista.innerHTML = '';
		}
	}
};

function _assidoDesligado() {
	if (_ticker !== null) {
		clearInterval(_ticker);
		_ticker = null;
	}
}

/**
 * A POSICAO ESCOLHIDA PELO JOGADOR (D-1565).
 *
 * Ate aqui a faixa era cravada no canto superior esquerdo pelo CSS. O dono
 * pediu que ela se mova; quem guarda a escolha e o `Preferences`, como nas
 * janelas — e ela e do APARELHO, e nao do personagem: o lugar bom na tela do
 * computador nao e o lugar bom no celular.
 */
const _preferences = Preferences.get(
	'PartyHud',
	{
		x: null,
		y: null
	},
	1.0
);

PartyHud.init = function init() {
	// A composicao chega pelo gancho da janela — ver a decisao 3 no cabecalho.
	GrupoIdle.aoAtualizar = desenhar;
	desenhar();
	const root = _root();
	if (root) {
		arrastarPorPonteiro({
			alca: root.querySelector('.ph-alca'),
			painel: PartyHud._host,
			aoSoltar: ({ left, top }) => {
				_preferences.x = left;
				_preferences.y = top;
				_preferences.save();
			}
		});
	}
};

PartyHud.onAppend = function onAppend() {
	if (_preferences.x == null || _preferences.y == null) {
		return;
	}
	const host = PartyHud._host;
	host.dataset.movido = '1';
	host.style.left = _preferences.x + 'px';
	host.style.top = _preferences.y + 'px';
	// A tela de hoje pode ser menor que a de ontem — a posicao guardada e
	// prendida antes de valer.
	prenderNaTela(host);
};

PartyHud.onRemove = function onRemove() {
	_assidoDesligado();
};

/** O nome da classe em portugues, do proprio cliente. */
function nomeDaClasse(job) {
	const nome = DB.getJobName ? DB.getJobName(job) : null;
	return nome || String(job);
}

/**
 * A composicao de agora, ou `null` fora de party.
 *
 * Ela sai do `GrupoIdle.estado` porque nome/classe/nivel so descem no
 * `ZC_RAGIDLE_GRUPO`. Quando a janela nunca foi aberta, a HUD PEDE uma vez —
 * e uma vez basta, porque o que muda a cada segundo (o HP) vem do
 * `EntityManager`.
 */
function membrosDeAgora() {
	const estado = GrupoIdle.estado;
	if (!estado || !estado.grupo || !Array.isArray(estado.grupo.membros)) {
		return null;
	}
	// Sozinho no "grupo" nao e grupo: a HUD existe para comparar com ALGUEM.
	return estado.grupo.membros.length > 1 ? estado.grupo.membros : null;
}

/**
 * PEDE O PAINEL ao servidor — e o pedido tambem REINSCREVE no empurrao.
 *
 * Ele existe porque a inscricao morre quando a janela fecha
 * (`{acao:'fechar'}`), e a partir dai a composicao congelaria: o HP continua
 * vivo pelo `EntityManager`, mas um membro que entra ou sai nao apareceria.
 *
 * Quem chama e o `portaDoGrupo`, nos dois momentos em que a composicao muda de
 * verdade. Pedir a toa seria barato, mas pedir NO MOMENTO CERTO e o que faz a
 * HUD nao precisar de um relogio proprio.
 */
PartyHud.pedirPainel = function pedirPainel() {
	Network.sendPacket(new PACKET.CZ.RAGIDLE_PEDIR_GRUPO());
};

function linhaHtml(m) {
	const classes = ['ph-membro'];
	if (m.souEu) {
		classes.push('is-eu');
	}
	if (!m.vivo) {
		classes.push('is-morto');
	}
	if (!m.online) {
		classes.push('is-offline');
	}
	if (m.ehLider) {
		classes.push('is-lider');
	}
	return (
		`<div class="${classes.join(' ')}" data-conta="${m.contaId}">` +
		`<span class="ph-nome">${escapeHtml(m.nome)}</span>` +
		`<span class="ph-classe">${escapeHtml(nomeDaClasse(m.classe))} ${m.nivel}</span>` +
		'<span class="ph-hp"><span class="fill"></span></span>' +
		'<span class="ph-hp-num"></span>' +
		'</div>'
	);
}

/**
 * Redesenha a COMPOSICAO — e so quando ela muda de verdade.
 *
 * A assinatura existe porque este redesenho recarrega o HTML inteiro: sem ela,
 * um empurrao do servidor a cada tique (o HP do grupo muda o tempo todo)
 * reescreveria a lista varias vezes por segundo, piscando.
 */
function desenhar() {
	const root = _root();
	if (!root) {
		return;
	}
	const hud = root.querySelector('.ph-hud');
	const lista = root.querySelector('.ph-membros');
	if (!hud || !lista) {
		return;
	}
	const membros = membrosDeAgora();
	if (membros === null) {
		hud.hidden = true;
		lista.innerHTML = '';
		_assinatura = '';
		_assidoDesligado();
		return;
	}
	const assinatura = membros
		.map((m) => `${m.contaId}:${m.nome}:${m.classe}:${m.nivel}:${m.vivo ? 1 : 0}:${m.online ? 1 : 0}`)
		.join('|');
	if (assinatura !== _assinatura) {
		_assinatura = assinatura;
		lista.innerHTML = membros.map(linhaHtml).join('');
	}
	hud.hidden = false;
	if (_ticker === null) {
		_ticker = setInterval(vidaAoVivo, VIDA_AO_VIVO_MS);
	}
	vidaAoVivo();
}

/**
 * MOVE A BARRA de cada companheiro com o HP que o combate ja mandou.
 *
 * Ele NAO redesenha a lista: so a largura do preenchimento e o texto do numero
 * mudam. Reescrever o `innerHTML` quatro vezes por segundo piscaria a HUD
 * inteira — e a razao e a mesma que a janela ja registra.
 */
function vidaAoVivo() {
	const lista = _root() && _root().querySelector('.ph-membros');
	if (!lista) {
		return;
	}
	lista.querySelectorAll('.ph-membro[data-conta]').forEach(function (linha) {
		const conta = parseInt(linha.dataset.conta, 10);
		if (!conta) {
			return;
		}
		// `null` = "o combate ainda nao falou", e nao "zero de vida": a linha
		// fica com o que veio no empurrao.
		const barra = vidaDoMembro(EntityManager.getLife(conta));
		if (!barra) {
			return;
		}
		// D-2385: a cada volta (400 ms) com o HP parado, a largura e o numero eram reescritos iguais; o
		// `textContent` igual troca o no de texto (mutacao de verdade). Escreve so o que mudou. A largura
		// '45.0%' o navegador le de volta como '45%': as duas formas valem como "igual".
		const fill = linha.querySelector('.ph-hp .fill');
		if (fill) {
			const largura = (barra.fracao * 100).toFixed(1);
			escreverEstilo(fill, 'width', largura + '%', Number(largura) + '%');
		}
		const numero = linha.querySelector('.ph-hp-num');
		if (numero) {
			escreverTexto(numero, barra.texto);
		}
	});
}

/** Para o `portaDoGrupo` e o `MapEngine` chamarem quando a party muda. */
PartyHud.atualizar = desenhar;

export default UIManager.addComponent(PartyHud);
