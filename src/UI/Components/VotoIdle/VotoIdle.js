/**
 * UI/Components/VotoIdle/VotoIdle.js
 *
 * "VOTE E GANHE" (D-1159) — a janela de votação, a loja da moeda de voto, e o
 * aviso que aparece ao entrar quando o último voto foi há mais de 24h (12h até 30/09/2026; D-1875).
 *
 * Pedido do dono, 07/09/2026: *"cada voto ele irá ganhar 1 vote cash. Esse vote
 * cash será uma loja... por enquanto nessa loja de votação, deve ter apenas 1
 * cartão de xp de 2h, que custa 1 moeda"*.
 *
 * Cinco escolhas de desenho, nenhuma estética:
 *
 * 1. **Quem decide TUDO é o servidor.** Saldo, prazo, preço, o veredito de cada
 *    botão e até a URL de voto chegam prontos em `ZC_RAGIDLE_VOTO` (0x0fd5).
 *    Recalcular aqui daria a segunda cópia da regra — e ela diria "pode votar"
 *    enquanto o servidor recusa. É a mesma escolha de PasseIdle.js e do Codex.
 *
 * 2. **A URL de voto vem do servidor, e a janela nunca a monta.** Ela carrega a
 *    identidade opaca da conta (`?player=`), que só existe do lado de lá, e a
 *    chave pública. Montar aqui exigiria mandar a chave no pacote de estado —
 *    uma viagem a mais para um dado que só serve no clique.
 *
 * 3. **O aviso da entrada é IRMÃO da janela, e não um componente à parte.** Os
 *    dois leem o mesmo pacote; separá-los criaria dois donos do mesmo estado, e
 *    o aviso diria "você tem voto" com a janela atrás mostrando o prazo velho.
 *
 * 4. **O relógio da tela é só COSMÉTICO.** O `setInterval` de 1s redesenha a
 *    contagem regressiva a partir do `proximoEm` que o servidor mandou; ele
 *    nunca decide que o voto liberou. Quando a contagem chega a zero a janela
 *    PEDE o estado de novo — quem responde "liberou" continua sendo o servidor.
 *
 * 5. **O botão trava até a resposta chegar.** Sem isso, dois cliques rápidos em
 *    "comprar" mandariam duas compras, e as duas seriam válidas (a segunda
 *    estende o impulso). O jogador teria pago o dobro sem querer — o mesmo
 *    cuidado registrado em PasseIdle.js.
 *
 * Entrada na HUD: o botão "Votar" do cluster de essenciais (TopMenuIdle), que
 * chama `VotoIdle.toggle()` e acende quando há voto disponível.
 *
 * @author RagIdle
 */

import Renderer from 'Renderer/Renderer.js';
import Preferences from 'Core/Preferences.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './VotoIdle.html?raw';
import cssText from './VotoIdle.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';
import { abrirEmAbaNova } from 'UI/abrirEmAbaNova.js';
import Session from 'Engine/SessionStorage.js';
import { comAsVistas, temAvisoNovo } from './avisoDoVoto.js';

/** Manter em sincronia com o ":host"/".vi-window" do CSS. */
const WINDOW_WIDTH = 480;
const WINDOW_HEIGHT = 560;

/** Quanto tempo a nota do rodapé fica na tela. */
const NOTA_MS = 3200;

/** Cadência do relógio da tela. Um segundo: a contagem é em minutos. */
const TIQUE_MS = 1000;

const VotoIdle = new GUIComponent('VotoIdle', cssText);

VotoIdle.render = () => htmlText;

/** Janela fechada não pode engolir clique de cena — par do ":host" do CSS. */
VotoIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/** O último estado que o servidor mandou. `null` = nada chegou ainda. */
VotoIdle.estado = null;

/**
 * O ÚLTIMO LINK DE VOTO que o servidor mandou, por plataforma (27/09/2026).
 *
 * A abertura de `aoReceberVoto` roda na CHEGADA do pacote, e não no toque do
 * jogador: o Safari do iPhone bloqueia janela aberta fora do gesto. Até esta
 * data ela era um `window.open` com `noopener`, que devolve `null` sempre, e o
 * jogo não sabia se tinha aberto. Sem este link o jogador lia "Confirme o voto na página que abriu" com
 * nada aberto, ia votar pelo site da plataforma - e voto feito lá, sem o
 * `player` do link, chega ao servidor sem dono e não credita (`sem-jogador`).
 * O link fica no cartão da plataforma: tocar nele É um gesto do jogador.
 */
VotoIdle.linkPorPlataforma = {};

/** As abas que existem, na ordem do HTML. */
const ABAS = ['votar', 'loja'];
const ABA_PADRAO = 'votar';

VotoIdle.activeTab = ABA_PADRAO;

let _notaTimer = null;
let _tique = null;

/**
 * Quando o tique pode pedir o estado de novo (epoch ms). Ver `aoTique`.
 *
 * Ele existe por um defeito MEDIDO no desenho, e não por precaução: o tique
 * compara `proximoEm` (do servidor) com `Date.now()` (da máquina do jogador).
 * Com o relógio do jogador ADIANTADO, a comparação vira verdadeira enquanto o
 * servidor ainda diz `liberado: false` — e sem freio isso é um pacote por
 * segundo, para sempre, de todo cliente com o relógio torto.
 */
let _proximoPedidoEm = 0;

/** O freio: no mínimo 15 s entre dois pedidos automáticos do tique. */
const RECARGA_DO_PEDIDO_MS = 15000;

const _preferences = Preferences.get(
	'VotoIdle',
	{
		x: null,
		y: null,
		aba: null,
		// As liberacoes cujo aviso este aparelho ja mostrou (`avisoDoVoto.js`).
		avisosVistos: []
	},
	1.0
);

function _root() {
	return VotoIdle._shadow || VotoIdle._host;
}

/** Mesmo helper privado de PasseIdle.js / MissoesIdle.js / HuntMap.js. */
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
 * Milissegundos restantes → "7h 12min", "12min", "agora".
 *
 * Arredonda os minutos para CIMA: faltando 30 segundos, "1min" é honesto e
 * "0min" seria uma promessa que a próxima meia volta do relógio desmente.
 */
function faltam(ms) {
	if (ms <= 0) {
		return 'agora';
	}
	const minutos = Math.ceil(ms / 60000);
	const horas = Math.floor(minutos / 60);
	const resto = minutos % 60;
	if (horas <= 0) {
		return String(resto) + 'min';
	}
	if (resto === 0) {
		return String(horas) + 'h';
	}
	return String(horas) + 'h ' + String(resto) + 'min';
}

/**
 * ESQUECE O PERSONAGEM ANTERIOR — ver a nota gêmea em PasseIdle.js.
 * `cleanGameUI()` não limpa componentes RAGIDLE, e a troca de personagem não
 * recarrega a página: sem isto, o saldo de uma conta apareceria na janela da
 * outra até o primeiro pedido voltar.
 */
VotoIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	VotoIdle.estado = null;
	VotoIdle.linkPorPlataforma = {};
	VotoIdle.activeTab = abaLembrada(_preferences, ABA_PADRAO, ABAS);
	pararTique();
	esconderAviso();
	fecharEEsquecer(_root(), '.vi-window');
};

VotoIdle.init = function init() {
	const root = _root();
	VotoIdle.activeTab = abaLembrada(_preferences, ABA_PADRAO, ABAS);

	/*
	 * Guardas em todo querySelector, pelo motivo registrado em
	 * ClassChangeNotice.js: este init roda dentro de MapEngine.init, e uma
	 * exceção aqui derruba o motor de mapa inteiro. A janela é cosmética; o que
	 * ela não pode é custar o mundo 3D.
	 */
	if (!root) {
		return;
	}

	const fechar = root.querySelector('.vi-close');
	if (fechar) {
		fechar.addEventListener('click', onClickClose);
	}

	root.querySelectorAll('.vi-tab').forEach(btn => btn.addEventListener('click', onClickTab));

	const titulo = root.querySelector('.vi-titlebar');
	if (titulo) {
		this.draggable(titulo);
	}

	/*
	 * O corpo é redesenhado a cada render, então o listener mora no CORPO e
	 * olha o alvo — um listener por render vazaria um a cada troca de aba.
	 */
	const corpo = root.querySelector('.vi-body');
	if (corpo) {
		corpo.addEventListener('click', onClickCorpo);
	}

	const irParaVoto = root.querySelector('.vi-aviso-ir');
	if (irParaVoto) {
		irParaVoto.addEventListener('click', onClickAvisoIr);
	}
	const depois = root.querySelector('.vi-aviso-depois');
	if (depois) {
		depois.addEventListener('click', onClickAvisoDepois);
	}
	const avisoX = root.querySelector('.vi-aviso-x');
	if (avisoX) {
		avisoX.addEventListener('click', onClickAvisoDepois);
	}

	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';

	render();
};

VotoIdle.onAppend = function onAppend() {
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - WINDOW_HEIGHT) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - WINDOW_WIDTH) + 'px';
	}
};

VotoIdle.onRemove = function onRemove() {
	savePosition();
	pararTique();
};

/**
 * O ESC fecha o que está aberto (D-931). Fecha o AVISO primeiro: ele é a peça
 * de cima, e fechar a janela por baixo dele deixaria o véu na tela sem dono.
 */
VotoIdle.onKeyDown = function onKeyDown(event) {
	if (event.which !== 27) {
		return;
	}
	const root = _root();
	const modal = root && root.querySelector('.vi-aviso-modal');
	if (modal && !modal.hidden) {
		esconderAviso();
		event.stopImmediatePropagation();
		return;
	}
	const win = root && root.querySelector('.vi-window');
	if (win && win.classList.contains('is-open')) {
		closeWindow();
		event.stopImmediatePropagation();
	}
};

function savePosition() {
	_preferences.x = parseInt(VotoIdle._host.style.left, 10) || 0;
	_preferences.y = parseInt(VotoIdle._host.style.top, 10) || 0;
	_preferences.save();
}

/** Abre/fecha; ao abrir, pede o estado ao servidor. */
VotoIdle.toggle = function toggle() {
	const root = _root();
	const win = root && root.querySelector('.vi-window');
	if (!win) {
		return;
	}
	if (win.classList.contains('is-open')) {
		closeWindow();
	} else {
		win.classList.add('is-open');
		VotoIdle.focus();
		pedirEstado();
		comecarTique();
	}
};

/**
 * HÁ VOTO DISPONÍVEL AGORA? — a pergunta que o botão da barra de cima faz.
 *
 * Ela lê o campo `liberados` que o SERVIDOR calculou, e não recalcula nada: o
 * destaque do botão e o conteúdo da janela têm de contar a mesma história, e
 * duas contas da mesma regra é como elas passam a discordar.
 *
 * Devolve `false` enquanto nenhum pacote chegou — um botão que pisca antes de
 * o servidor falar estaria adivinhando.
 */
VotoIdle.temVotoDisponivel = function temVotoDisponivel() {
	return !!(VotoIdle.estado && VotoIdle.estado.liberados > 0);
};

function pedirEstado() {
	// O pedido manual arma o mesmo freio: sem isto, abrir a janela com o
	// relógio torto mandaria dois pacotes no mesmo segundo.
	_proximoPedidoEm = Date.now() + RECARGA_DO_PEDIDO_MS;
	const pkt = new PACKET.CZ.RAGIDLE_VOTO_ACAO();
	pkt.json = JSON.stringify({ acao: 'pedir' });
	Network.sendPacket(pkt);
}

function closeWindow() {
	const root = _root();
	const win = root && root.querySelector('.vi-window');
	if (win) {
		win.classList.remove('is-open');
	}
	savePosition();
	pararTique();
}

function onClickClose(e) {
	e.stopImmediatePropagation();
	closeWindow();
}

function onClickTab(e) {
	e.stopImmediatePropagation();
	const tab = e.currentTarget.dataset.tab;
	if (!tab || tab === VotoIdle.activeTab) {
		return;
	}
	VotoIdle.activeTab = tab;
	lembrarAba(_preferences, VotoIdle.activeTab);
	render();
}

/** Delegação: o corpo trata dois cliques — votar numa plataforma, e comprar. */
function onClickCorpo(e) {
	/*
	 * O LINK DE RESERVA (27/09/2026): o toque do jogador abre pela casca, como o
	 * cartaz de boas-vindas. Se o navegador barrar, o `<a>` segue sozinho.
	 */
	const link = e.target && e.target.closest ? e.target.closest('a.vi-plat-link') : null;
	if (link) {
		if (abrirEmAbaNova(link.href)) {
			e.preventDefault();
		}
		e.stopImmediatePropagation();
		return;
	}
	const alvo = e.target && e.target.closest ? e.target.closest('button[data-acao]') : null;
	if (!alvo || alvo.disabled) {
		return;
	}
	e.stopImmediatePropagation();

	if (alvo.dataset.acao === 'votar') {
		const plataforma = alvo.dataset.plataforma;
		if (!plataforma) {
			return;
		}
		/*
		 * O botão NÃO abre nada aqui: ele pede a URL ao servidor, e o
		 * `window.open` acontece quando a resposta chega (ver `aoReceberVoto`).
		 * A alternativa — abrir uma aba em branco e navegá-la depois — foi
		 * descartada: uma aba branca que fica branca quando o servidor recusa é
		 * pior que nenhuma aba.
		 */
		alvo.disabled = true;
		const pkt = new PACKET.CZ.RAGIDLE_VOTO_ACAO();
		pkt.json = JSON.stringify({ acao: 'link', plataforma: plataforma });
		Network.sendPacket(pkt);
		return;
	}

	if (alvo.dataset.acao === 'comprar') {
		const produto = alvo.dataset.produto;
		if (!produto) {
			return;
		}
		alvo.disabled = true;
		const pkt = new PACKET.CZ.RAGIDLE_VOTO_ACAO();
		pkt.json = JSON.stringify({ acao: 'comprar', produto: produto });
		Network.sendPacket(pkt);
	}
}

function onClickAvisoIr(e) {
	e.stopImmediatePropagation();
	esconderAviso();
	const root = _root();
	const win = root && root.querySelector('.vi-window');
	// `toggle()` fecharia a janela se ela já estivesse aberta — e "ver as
	// plataformas" nunca deve FECHAR a lista de plataformas.
	if (win && !win.classList.contains('is-open')) {
		VotoIdle.toggle();
	} else {
		VotoIdle.activeTab = 'votar';
		render();
	}
}

function onClickAvisoDepois(e) {
	e.stopImmediatePropagation();
	esconderAviso();
}

function mostrarNota(texto, ehErro) {
	const root = _root();
	const nota = root && root.querySelector('.vi-nota');
	if (!nota) {
		return;
	}
	nota.textContent = texto;
	nota.classList.toggle('is-erro', !!ehErro);
	nota.classList.add('is-visivel');
	if (_notaTimer) {
		clearTimeout(_notaTimer);
	}
	_notaTimer = setTimeout(() => {
		nota.classList.remove('is-visivel');
		_notaTimer = null;
	}, NOTA_MS);
}

/* ------------------------------------------------------------------ */
/* O aviso da entrada                                                  */
/* ------------------------------------------------------------------ */

/**
 * O CARTAZ DE BOAS-VINDAS ESTÁ NA TELA?
 *
 * Lido pelo DOM, e **sem importar o componente**, de propósito. O
 * `BoasVindasIdle` nasceu na frente paralela no mesmo dia que este aviso, ainda
 * não está commitado, e pode mudar de nome ou sumir. Um `import` faria a janela
 * de voto parar de compilar junto com ele; uma consulta que não acha nada
 * simplesmente responde "não tem cartaz", que é o comportamento certo em toda
 * árvore onde ele não existe.
 */
function cartazDeBoasVindasNaTela() {
	try {
		const host = document.getElementById('BoasVindasIdle');
		const raiz = host && host.shadowRoot;
		return !!(raiz && raiz.querySelector('.bv-modal.is-open'));
	} catch {
		return false;
	}
}

/** Quantas vezes o aviso espera o cartaz sair, antes de desistir e aparecer. */
const ESPERAS_PELO_CARTAZ = 60;

function mostrarAviso(quantos, tentativa = 0, aoMostrar = null) {
	const root = _root();
	const modal = root && root.querySelector('.vi-aviso-modal');
	if (!modal) {
		return;
	}

	/*
	 * DOIS MODAIS NO MESMO INSTANTE — o aviso ESPERA, e não disputa.
	 *
	 * `BoasVindasIdle` abre uma vez por entrada, no mesmo momento em que este
	 * aviso abre, e é o cartaz que o dono pediu como *"a primeira imagem"*.
	 * Empilhados, os dois véus se cobrem: medido em 07/09/2026 pelo arnês que
	 * joga (`scripts/foto-voto-no-jogo.ts`), o Playwright acusou
	 * *"<div id=BoasVindasIdle> intercepts pointer events"* ao tentar clicar no
	 * botão deste aviso.
	 *
	 * Quem espera é este, e não o outro: a primeira imagem é dele por decisão do
	 * dono, e "você tem voto disponível" continua verdade um segundo depois.
	 *
	 * O teto de tentativas existe para o aviso não sumir para sempre se o cartaz
	 * ficar aberto (o jogador saiu para o Discord e não voltou): depois de ~30 s
	 * ele aparece assim mesmo, atrás — que é melhor que nunca aparecer.
	 */
	if (cartazDeBoasVindasNaTela() && tentativa < ESPERAS_PELO_CARTAZ) {
		setTimeout(() => mostrarAviso(quantos, tentativa + 1, aoMostrar), 500);
		return;
	}
	const linha = root.querySelector('.vi-aviso-quantos');
	if (linha) {
		/*
		 * A CONCORDÂNCIA inteira mora no span, e não só o número.
		 *
		 * A primeira versão deixava "pendente" fixo no HTML e trocava só
		 * "votação"/"votações" aqui — e com as duas plataformas ligadas o
		 * jogador lia **"2 votações pendente"**. Foi visto no print, e não
		 * deduzido: só apareceu quando o Top Idle entrou e o número passou de 1.
		 */
		linha.textContent =
			quantos === 1 ? '1 votação pendente' : String(quantos) + ' votações pendentes';
	}
	const premio = root.querySelector('.vi-aviso-premio');
	if (premio && VotoIdle.estado) {
		premio.textContent = '+1 ' + VotoIdle.estado.moeda;
	}
	/*
	 * `hidden`, e não `style.display`: a folha declara
	 * `[hidden]{display:none!important}` e o resto do projeto alterna
	 * visibilidade por essa propriedade. Misturar as duas rotas é como nasce
	 * "escondi e continuou aparecendo".
	 */
	// A liberacao so conta como VISTA quando o modal abre de fato: a espera pelo
	// cartaz pode durar ~30 s, e uma recarga nela perderia o aviso (auditoria de
	// 30/09/2026).
	if (aoMostrar) aoMostrar();
	modal.hidden = false;
	VotoIdle.focus();
}

function esconderAviso() {
	const root = _root();
	const modal = root && root.querySelector('.vi-aviso-modal');
	if (modal) {
		modal.hidden = true;
	}
}

/* ------------------------------------------------------------------ */
/* O relógio da tela                                                   */
/* ------------------------------------------------------------------ */

/**
 * O tique só existe enquanto há o que contar.
 *
 * Um `setInterval` permanente redesenharia a janela fechada para sempre — e o
 * custo não é o desenho, é o hábito: a próxima janela copia daqui.
 */
function comecarTique() {
	if (_tique) {
		return;
	}
	_tique = setInterval(aoTique, TIQUE_MS);
}

function pararTique() {
	if (_tique) {
		clearInterval(_tique);
		_tique = null;
	}
}

/**
 * Um segundo se passou: redesenha as contagens.
 *
 * **Quando uma contagem chega a zero, ele PEDE o estado ao servidor** em vez de
 * marcar "liberado" por conta própria. É a escolha 4 do cabeçalho: o relógio da
 * tela é cosmético, e quem diz que o voto abriu é quem guarda o carimbo.
 */
function aoTique() {
	const estado = VotoIdle.estado;
	if (!estado) {
		return;
	}
	const agora = Date.now();
	const venceu = estado.plataformas.some(p => p.ligada && !p.liberado && p.proximoEm > 0 && p.proximoEm <= agora);
	const drop = estado.impulsoDeDrop;
	const impulsoVenceu =
		(estado.impulso.ativo && estado.impulso.ateMs <= agora) || (!!drop && drop.ativo && drop.ateMs <= agora);
	if (venceu || impulsoVenceu) {
		/*
		 * COM FREIO. O relógio que decide aqui é o da MÁQUINA DO JOGADOR, e o
		 * `proximoEm` é do servidor: com o relógio adiantado, esta condição fica
		 * verdadeira enquanto o servidor ainda diz `liberado: false`, e sem o
		 * freio seria um pacote por segundo para sempre.
		 *
		 * O freio não conserta a deriva — ele a torna barata (um pedido a cada
		 * 15 s em vez de 60). Quem tem a resposta certa continua sendo o
		 * servidor: quando o pacote voltar com `liberado: true`, a condição
		 * deixa de valer sozinha.
		 */
		if (agora >= _proximoPedidoEm) {
			_proximoPedidoEm = agora + RECARGA_DO_PEDIDO_MS;
			pedirEstado();
		}
		atualizarRelogios(agora);
		return;
	}
	atualizarRelogios(agora);
}

/**
 * O TIQUE MEXE SÓ NOS RELÓGIOS — e a primeira versão chamava `render()`, que
 * reescreve o `.vi-body` inteiro por `innerHTML`.
 *
 * O defeito foi MEDIDO em 07/09/2026, pelo arnês que joga de verdade
 * (`scripts/foto-voto-no-jogo.ts`): o Playwright não conseguia clicar em
 * "Votar no IdleRank" — *"element was detached from the DOM, retrying"*, uma
 * vez por segundo, até estourar o tempo. E o que derruba um robô aqui derruba
 * uma pessoa também, de três jeitos:
 *
 *  - um clique que chega no instante do redesenho cai num botão que já não
 *    está na árvore, e não faz nada. Uma vez por segundo, o botão simplesmente
 *    não responde;
 *  - a trava de duplo-clique (`alvo.disabled = true`) durava menos de um
 *    segundo — o redesenho seguinte devolvia o botão habilitado, e a proteção
 *    que existe para não cobrar duas compras não existia de fato;
 *  - seleção de texto e posição de rolagem eram perdidas a cada segundo.
 *
 * O que muda por segundo é TEXTO de contagem, e é só isso que esta função
 * escreve. O `render()` completo continua acontecendo onde faz sentido: quando
 * um pacote chega, e quando o jogador troca de aba.
 */
function atualizarRelogios(agora) {
	const root = _root();
	if (!root) {
		return;
	}
	root.querySelectorAll('.vi-plat-estado[data-proximo]').forEach(el => {
		const proximo = Number(el.dataset.proximo) || 0;
		el.textContent = proximo <= 0 ? 'Disponível agora' : 'Volta em ' + faltam(proximo - agora);
	});
	// Dois cartoes podem estar ativos ao mesmo tempo (EXP e Drop, 27/09/2026).
	root.querySelectorAll('.vi-impulso-tempo[data-ate]').forEach(tempo => {
		tempo.textContent = faltam((Number(tempo.dataset.ate) || 0) - agora);
	});
}

/* ------------------------------------------------------------------ */
/* O pacote                                                            */
/* ------------------------------------------------------------------ */

/**
 * `ZC_RAGIDLE_VOTO` (0x0fd5) — a resposta dos três verbos, e o lote de entrada.
 *
 * Ele é registrado como handler do pacote em `PacketRegister.js`; este método é
 * o que `MapEngine` liga na preparação.
 */
VotoIdle.aoReceberVoto = function aoReceberVoto(pkt) {
	let dados = null;
	try {
		dados = JSON.parse(pkt.json);
	} catch {
		// Pacote ilegível não pode derrubar a UI: a janela simplesmente não
		// atualiza, e o próximo pedido a conserta.
		return;
	}
	if (!dados || dados.v !== 1) {
		return;
	}
	VotoIdle.estado = dados;

	/*
	 * A URL de voto: abre em ABA NOVA, e o jogo continua rodando atrás.
	 *
	 * `noopener` não é detalhe de segurança avulso — sem ele a página aberta
	 * recebe `window.opener` e pode navegar a aba do JOGO para onde quiser.
	 */
	if (dados.abrir && dados.abrir.url) {
		VotoIdle.linkPorPlataforma[dados.abrir.plataforma] = dados.abrir.url;
		/*
		 * Pela casca e SABENDO se abriu (`abrirEmAbaNova`): o `window.open` com
		 * `noopener` devolvia `null` sempre, e a nota dizia "na página que abriu"
		 * mesmo quando o navegador tinha barrado a janela.
		 */
		const abriu = abrirEmAbaNova(dados.abrir.url);
		mostrarNota(
			abriu
				? 'Confirme o voto na página que abriu. O prêmio chega sozinho.'
				: 'O navegador barrou a página de voto. Toque em "Abrir a página de voto".',
			!abriu
		);
	}

	if (dados.comprou) {
		/* O texto de quem comprou vem do servidor: cartao ativado ou ticket no correio. */
		mostrarNota(
			dados.comprou.ok ? dados.comprou.texto || 'Compra feita! Bom proveito.' : dados.comprou.motivo,
			!dados.comprou.ok
		);
	}

	render();

	/*
	 * O AVISO por último, e só com `avisar: true`.
	 *
	 * Quem decide se HÁ voto é o servidor — ele manda o campo uma vez por
	 * conexão, e só quando há voto liberado. A janela não tem como saber se é
	 * login ou viagem; `CZ_NOTIFY_ACTORINIT` chega nas duas.
	 *
	 * Desde 30/09/2026 o modal abre UMA VEZ POR LIBERAÇÃO neste aparelho
	 * (`avisoDoVoto.js`): conexão nova acontece a toda reconexão, recarga e
	 * volta ao app, e o aviso repetido virou o "spam" que os jogadores
	 * reclamaram. O botão "Votar" continua aceso enquanto houver voto.
	 */
	if (dados.avisar && dados.liberados > 0 && temAvisoNovo(Session.AID, dados.plataformas, _preferences.avisosVistos)) {
		mostrarAviso(dados.liberados, 0, () => {
			_preferences.avisosVistos = comAsVistas(Session.AID, dados.plataformas, _preferences.avisosVistos);
			try {
				_preferences.save();
			} catch (e) {
				// localStorage cheio ou bloqueado: o aviso aparece, so nao fica lembrado.
			}
		});
		comecarTique();
	}
};

/* ------------------------------------------------------------------ */
/* O desenho                                                           */
/* ------------------------------------------------------------------ */

function cartaoDePlataforma(plat, agora) {
	if (!plat.ligada) {
		return (
			'<div class="vi-plat">' +
			'<div class="vi-plat-topo">' +
			'<div><div class="vi-plat-nome">' +
			escapeHtml(plat.nome) +
			'</div><div class="vi-plat-ciclo">Em breve</div></div>' +
			'<span class="ri-badge ri-badge--cinza">Em breve</span>' +
			'</div>' +
			'<div class="vi-plat-rodape">Esta plataforma ainda não está ligada neste servidor.</div>' +
			'</div>'
		);
	}

	const livre = plat.liberado;
	const estado = livre ? 'Disponível agora' : 'Volta em ' + faltam(plat.proximoEm - agora);
	const selo = livre
		? '<span class="ri-badge ri-badge--ouro">1 voto</span>'
		: '<span class="ri-badge ri-badge--cinza">Aguardando</span>';

	return (
		'<div class="vi-plat' +
		(livre ? ' is-livre' : '') +
		'">' +
		'<div class="vi-plat-topo">' +
		'<div><div class="vi-plat-nome">' +
		escapeHtml(plat.nome) +
		'</div><div class="vi-plat-ciclo">Ciclo de ' +
		escapeHtml(String(horasDoCiclo(plat))) +
		' horas</div></div>' +
		selo +
		'</div>' +
		// `data-proximo` carrega o instante-alvo para o tique reescrever SÓ este
		// texto, sem refazer o corpo — ver `atualizarRelogios`.
		'<div class="vi-plat-estado" data-proximo="' +
		escapeHtml(livre ? 0 : plat.proximoEm) +
		'">' +
		escapeHtml(estado) +
		'</div>' +
		'<button type="button" class="vi-plat-votar ri-btn' +
		(livre ? ' ri-btn--ouro' : '') +
		'" data-acao="votar" data-plataforma="' +
		escapeHtml(plat.id) +
		'"' +
		(livre ? '' : ' disabled') +
		'>' +
		(livre ? 'Votar no ' + escapeHtml(plat.nome) : 'Já votado neste ciclo') +
		'</button>' +
		linkDeReserva(plat) +
		'<div class="vi-plat-rodape">' +
		escapeHtml(String(plat.votos)) +
		(plat.votos === 1 ? ' voto confirmado' : ' votos confirmados') +
		'</div>' +
		'</div>'
	);
}

/** As horas do ciclo da plataforma; servidor antigo sem `intervaloMs` cai nas 24 h. */
function horasDoCiclo(plat) {
	const ms = plat.intervaloMs;
	return typeof ms === 'number' && ms > 0 ? Math.round(ms / 3600000) : 24;
}

/** O link de verdade, para o toque do jogador abrir o que o `window.open` não abriu. */
function linkDeReserva(plat) {
	const url = VotoIdle.linkPorPlataforma[plat.id];
	if (!plat.liberado || typeof url !== 'string' || url.length === 0) {
		return '';
	}
	return (
		'<a class="vi-plat-link ri-btn ri-btn--sec" target="_blank" rel="noopener noreferrer" href="' +
		escapeHtml(url) +
		'">Abrir a página de voto</a>'
	);
}

function abaVotarHtml(estado, agora) {
	const cartoes = estado.plataformas.map(p => cartaoDePlataforma(p, agora)).join('');
	return (
		cartoes +
		'<div class="vi-secao">Como funciona</div>' +
		'<ol class="vi-passos">' +
		'<li>Clique em votar. A página da plataforma abre numa aba nova (se não abrir, toque em "Abrir a página de voto").</li>' +
		'<li><strong>Vote sempre por este botão.</strong> Voto feito direto no site da plataforma chega sem o seu nome e não tem como ser creditado.</li>' +
		'<li>Confirme o voto por lá (a plataforma pede um login próprio).</li>' +
		'<li>O prêmio chega sozinho, em segundos — não precisa recarregar o jogo.</li>' +
		'<li>Cada voto confirmado entrega <strong>+1 ' +
		escapeHtml(estado.moeda) +
		'</strong>, que você gasta na aba Loja.</li>' +
		'<li>Cada plataforma tem o próprio ciclo e volta sozinha.</li>' +
		'</ol>'
	);
}

function faixaDeImpulso(texto, ateMs, agora) {
	return (
		'<div class="vi-impulso">' +
		'<span class="vi-impulso-texto">' +
		escapeHtml(texto) +
		'</span>' +
		'<span class="vi-impulso-tempo" data-ate="' +
		escapeHtml(ateMs) +
		'">' +
		escapeHtml(faltam(ateMs - agora)) +
		'</span>' +
		'</div>'
	);
}

function abaLojaHtml(estado, agora) {
	const drop = estado.impulsoDeDrop;
	const impulso =
		(estado.impulso.ativo
			? faixaDeImpulso(
					'Cartão de EXP ativo · +' + String(estado.impulso.base) + '% base e classe',
					estado.impulso.ateMs,
					agora
				)
			: '') +
		(drop && drop.ativo
			? faixaDeImpulso('Cartão de Drop ativo · +' + String(drop.drop) + '% de drop', drop.ateMs, agora)
			: '');

	const ofertas = estado.loja
		.map(o => {
			const bloqueado = !!o.recusa;
			return (
				'<div class="vi-oferta">' +
				'<div class="vi-oferta-topo">' +
				'<div><div class="vi-oferta-nome">' +
				escapeHtml(o.nome) +
				'</div><div class="vi-oferta-resumo">' +
				escapeHtml(o.resumo) +
				'</div></div>' +
				'<div class="vi-preco"><span class="vi-preco-valor">' +
				escapeHtml(String(o.custo)) +
				'</span><span class="vi-preco-unidade">' +
				escapeHtml(estado.moeda) +
				'</span></div>' +
				'</div>' +
				/*
				 * O BOTÃO NÃO SOME quando falta saldo: ele apaga e explica.
				 * Sumir faria o jogador procurar o que fazer; apagado ele diz
				 * "existe, e falta moeda". Mesma regra do Passe.
				 */
				'<button type="button" class="ri-btn' +
				(bloqueado ? '' : ' ri-btn--ouro') +
				'" data-acao="comprar" data-produto="' +
				escapeHtml(o.id) +
				'"' +
				(bloqueado ? ' disabled' : '') +
				'>' +
				(bloqueado ? escapeHtml(o.recusa) : 'Comprar') +
				'</button>' +
				'</div>'
			);
		})
		.join('');

	return (
		impulso +
		'<div class="vi-secao">Loja de votação</div>' +
		ofertas +
		'<div class="vi-plat-rodape">Comprar de novo com o cartão ativo SOMA o tempo — nada do que você pagou é perdido. Os tickets de reset chegam pelo correio.</div>'
	);
}

function render() {
	const root = _root();
	if (!root) {
		return;
	}

	root.querySelectorAll('.vi-tab').forEach(btn => {
		btn.classList.toggle('is-active', btn.dataset.tab === VotoIdle.activeTab);
	});

	const corpo = root.querySelector('.vi-body');
	if (!corpo) {
		return;
	}

	const estado = VotoIdle.estado;
	if (!estado) {
		corpo.innerHTML = '<div class="vi-carregando">Carregando…</div>';
		return;
	}

	const carteira = root.querySelector('.vi-carteira-valor');
	if (carteira) {
		carteira.textContent = String(estado.saldo);
	}
	const unidade = root.querySelector('.vi-carteira-unidade');
	if (unidade) {
		unidade.textContent = estado.moeda;
	}

	/*
	 * O relógio da TELA, e não o do servidor.
	 *
	 * `estado.agoraMs` existe no pacote e NÃO é usado aqui de propósito: ele é o
	 * instante em que o servidor respondeu, e usá-lo congelaria a contagem no
	 * momento da resposta. O que os dois relógios podem ter é DERIVA — e ela
	 * custa segundos numa contagem de horas, contra uma contagem que não anda.
	 */
	const agora = Date.now();
	corpo.innerHTML =
		VotoIdle.activeTab === 'loja' ? abaLojaHtml(estado, agora) : abaVotarHtml(estado, agora);
}

/*
 * O HOOK do pacote fica FORA do componente, no topo do modulo, como em
 * CodexIdle.js e PasseIdle.js: ele precisa existir antes de qualquer
 * `prepare()`, porque o servidor manda `ZC_RAGIDLE_VOTO` no LOTE DE ENTRADA
 * no mapa -- e um hook registrado dentro de `init()` perderia justamente o
 * pacote que traz o aviso.
 */
Network.hookPacket(PACKET.ZC.RAGIDLE_VOTO, pkt => VotoIdle.aoReceberVoto(pkt));

export default UIManager.addComponent(VotoIdle);
