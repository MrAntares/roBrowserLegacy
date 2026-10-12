/**
 * UI/pilhaDeJanelas.js
 *
 * A PILHA DE JANELAS (D-931, 05/09/2026) — o dono do ESC, do botão VOLTAR do
 * Android e da ordem em que as janelas do jogo convivem.
 *
 * ─── O DEFEITO QUE ELE EXISTE PARA MATAR ────────────────────────────────
 *
 * Com a Mochila aberta, apertar ESC abria as **Configurações por cima** em vez
 * de fechar o que estava aberto. A cadeia, medida em 05/09/2026:
 *
 *   1. `Escape.append()` roda muito cedo no boot do mapa
 *      (`Engine/MapEngine.js:846`) e o `GUIComponent` registra o `onKeyDown`
 *      dele em `window`, fase de BUBBLE — primeiro da fila.
 *   2. **Nenhuma das nove janelas Idle tem `onKeyDown`.** Nem Mochila, nem
 *      Skills, Config, Caça, Códex, Correio, LFG, Missões ou Passe. Zero
 *      ocorrências, por grep. O ESC nunca chegava nelas.
 *   3. `Escape.onKeyDown` só pergunta uma coisa antes de agir: se a morte está
 *      na tela. Para todo o resto, ele alterna a si mesmo e chama `focus()`.
 *   4. `GUIComponent.focus()` reindexa o z-index de TODO componente ativo do
 *      jogo — e o Escape sobe acima da Mochila, que continua aberta embaixo.
 *
 * E o buraco é SISTÊMICO, não da Mochila: `Inventory.js:46-52` e
 * `Equipment.js:48-54` têm `onKeyDown` e **nenhum dos dois chama
 * `stopPropagation`** — mesmo com tratador, o Escape abriria por cima. Qualquer
 * conserto que só desse `onKeyDown` às janelas Idle deixaria o caso nativo
 * quebrado.
 *
 * ─── POR QUE UM REGISTRO PRÓPRIO, E NÃO O `UIManager.components` ────────
 *
 * `UIManager.components` é o registro de TUDO — HUD, ícones, painéis sempre
 * visíveis. `GUIComponent.focus()` itera ele inteiro. "Janela" é um conceito
 * mais estreito: o que o jogador ABRE e espera FECHAR. Reaproveitar aquela
 * lista faria o ESC "fechar" a doca.
 *
 * ─── COMO A PILHA SE MANTÉM SEM TOCAR EM NENHUMA JANELA ─────────────────
 *
 * As nove janelas Idle têm a MESMA forma: um `.<prefixo>-window` que ganha e
 * perde a classe `is-open`, e um `toggle()` público. O registro **embrulha** o
 * `toggle()` de cada uma: a função original continua fazendo o trabalho dela
 * (posição salva, pacote pedido ao servidor, foco), e o embrulho só olha o
 * antes/depois e atualiza a pilha.
 *
 * Isso é deliberado. A alternativa era editar nove arquivos para cada um
 * avisar a pilha — nove chances de alguém esquecer, e nove conflitos com quem
 * estiver mexendo nelas. O embrulho mantém a regra do dono ("nenhuma janela
 * abre ou fecha por conta própria fora dele") sem exigir que nenhuma delas
 * saiba que a pilha existe.
 *
 * ─── AS QUATRO REGRAS DO ESC, NA ORDEM EM QUE SÃO PERGUNTADAS ───────────
 *
 *   1. **Campo de texto focado** → tira o foco do campo, e mais nada. O
 *      segundo ESC é que fecha janela. (Quem está digitando no chat esperava
 *      sair do chat, não perder a janela inteira.)
 *   2. **Modal de decisão aberto** (troca, venda, refino, morte, pedido de
 *      NPC) → o ESC não faz NADA. Sai por Confirmar ou Cancelar, explícito.
 *   3. **Qualquer janela aberta** → fecha TODAS e devolve a cena limpa.
 *   4. **Nada aberto** → aí sim abre as Configurações.
 *
 * ─── O BOTÃO VOLTAR DO ANDROID SEGUE A MESMA REGRA ──────────────────────
 *
 * Em `standalone` (o app instalado) não existe barra do navegador: sair sem
 * querer é perder a sessão. O jogo mantém UMA entrada de histórico acima da
 * base (a sentinela, H10); o voltar a consome, cai na regra do ESC e a devolve.
 * Com nada aberto, o voltar PERGUNTA antes de deixar o jogo, e o "OK" sai.
 */

import KEYS from 'Controls/KeyEventHandler.js';
import { aoEscapar as desarmarAtalhoPendente } from 'UI/toqueParaAtalho.js';
/* D-1908: o seletor de nivel de um slot da barra e um balao, e nao uma janela
   desta pilha (ver `UI/Components/ShortCut/seletorDeNivelDaBarra.js`); o ESC
   e o voltar o fecham PRIMEIRO. `nivelDeUso.js` nao importa nada: sem ciclo. */
import { fecharSeletorDeNivel } from 'UI/nivelDeUso.js';
/* 01/10/2026: os outros baloes da HUD (o painel de informacoes da missao, o
   "(i)" do cartao de missoes) fecham no ESC pelo mesmo motivo do seletor, mas
   numa lista PROPRIA — ver o cabecalho de `balaoDaHud.js`, que nao importa
   nada: sem ciclo. */
import { fecharBalaoDaHud } from 'UI/balaoDaHud.js';
/* `hudVertical` importa só `escalaDaHud`, que não importa nada — não há ciclo
   por este caminho (conferido em 08/09/2026). */
import { ehCelularEmPe } from 'UI/hudVertical.js';

/** Os tipos de janela, e o que cada um responde ao ESC. */
export const TIPO = {
	/** Painel comum: o ESC fecha, junto com todos os outros. */
	JANELA: 'janela',
	/**
	 * Exige uma decisão do jogador (troca, venda, refino, morte, pedido de
	 * NPC). O ESC não fecha e não vaza para as janelas de baixo: sair daqui é
	 * por Confirmar ou Cancelar, com o dedo no botão.
	 */
	DECISAO: 'decisao',
};

const _registro = new Map();
/** Nomes das janelas abertas, na ORDEM DE ABERTURA (o último é o topo). */
const _pilha = [];

let _ligado = false;
let _pedindoConfirmacaoDeSaida = false;

/**
 * Registra uma janela.
 *
 * @param {object} d
 * @param {string} d.nome        identificador estável (usado nos testes)
 * @param {object} d.componente  o GUIComponent
 * @param {string} [d.seletor]   o elemento que ganha `is-open` (`.mo-window`)
 * @param {string} [d.tipo]      TIPO.JANELA (padrão) ou TIPO.DECISAO
 * @param {function} [d.estaAberta] leitura própria, quando não é `is-open`
 * @param {function} [d.fechar]  fechamento próprio, quando não é `toggle()`
 */
export function registrar({ nome, componente, seletor, tipo = TIPO.JANELA, estaAberta, fechar }) {
	if (!nome || !componente) {
		return;
	}

	const raiz = () => componente._shadow || componente._host || null;
	const elemento = () => {
		const r = raiz();
		return r && seletor ? r.querySelector(seletor) : null;
	};

	const lerAberta =
		estaAberta ||
		(() => {
			const el = elemento();
			return !!(el && el.classList.contains('is-open'));
		});

	const fecharDeVerdade =
		fechar ||
		(() => {
			/* `toggle()` e não `classList.remove`: a função da janela faz a
			   contabilidade dela (salvar posição, soltar foco, avisar o
			   servidor). Mexer na classe por fora deixaria metade disso para
			   trás — e é exatamente o tipo de atalho que este arquivo existe
			   para não precisar. */
			if (lerAberta() && typeof componente.toggle === 'function') {
				componente.toggle();
			}
		});

	_registro.set(nome, { nome, componente, tipo, estaAberta: lerAberta, fechar: fecharDeVerdade });

	/*
	 * D-932 — A MARCA `ri-janela` NO HOST.
	 *
	 * Em tela estreita uma janela arrastável não serve: a Mochila mede mais que
	 * a tela inteira de um celular. Medido em 393x852 com o jogo de pé, o "X"
	 * dela ficava em **x = 503 numa tela de 393** — desenhado e fora do mundo.
	 *
	 * O `Common.css` transforma toda janela em painel de tela cheia abaixo de
	 * 600px, e precisa de um jeito de saber QUAIS hosts são janelas. Ele não
	 * pode adivinhar: `[data-gui-component]` marca todo componente, e a doca e
	 * o painel de personagem também são componentes.
	 *
	 * Quem já sabe a resposta é este registro — é literalmente a definição dele.
	 * Então ele marca, e o CSS lê. Um componente que nunca se registrar aqui
	 * simplesmente não vira painel, e isso é visível na primeira vez que alguém
	 * o abrir num celular — falha alta, e não silenciosa.
	 */
	const host = componente._host;
	/* D-937: com a bandeira de rollout desligada, a janela NAO vira painel de
	   tela cheia — a marca e o que o CSS le, entao nao marcar e o desligamento
	   inteiro. A pilha e o ESC continuam funcionando: eles nao sao aparencia. */
	const classica =
		typeof document !== 'undefined' &&
		document.documentElement.classList.contains('ri-hud-classica');
	if (host && host.classList && !classica) {
		host.classList.add('ri-janela');
	}

	/*
	 * D-941 — A MARCA TAMBEM NO CORPO, para a HUD vertical (05/09/2026).
	 *
	 * Pedido do dono, depois de ver as janelas no celular: *"Todas as janelas
	 * devem ser encaixadas perfeitamente, nao devem ter barras de rolagem"*.
	 * Encaixar de verdade exige ALTURA EXATA (do topo ate a barra de
	 * atalhos), e a altura se escreve no CORPO da janela, que mora DENTRO do
	 * Shadow DOM — onde a classe do host nao alcanca e onde `.ri-window`
	 * sozinha pega tambem o que NAO e janela de pilha (a carta de morte, o
	 * menu de sistema). Quem sabe o que e janela e este registro, pelo mesmo
	 * argumento da marca do host logo acima — entao ele marca o corpo, e so
	 * o CSS da vertical le (`.ri-vertical .ri-janela-corpo`).
	 *
	 * So janelas de TIPO.JANELA com seletor proprio: decisao/modal fica de
	 * fora de proposito — esticar um "tem certeza?" em tela cheia nao e
	 * encaixar, e desfigurar.
	 */
	if (tipo === TIPO.JANELA && !classica) {
		const corpo = elemento();
		if (corpo && corpo.classList) {
			corpo.classList.add('ri-janela-corpo');
		}
	}

	/*
	 * O EMBRULHO DO `toggle()`. Ele não muda o que a janela faz — chama a
	 * função original e só compara o antes com o depois para saber se deve
	 * empilhar ou desempilhar. Se a janela não tiver `toggle`, quem a abre
	 * chama `aoAbrir(nome)` na mão.
	 */
	if (typeof componente.toggle === 'function' && !componente.__pilhaEmbrulhada) {
		const original = componente.toggle.bind(componente);
		componente.toggle = function toggleComPilha(...args) {
			const antes = lerAberta();
			const r = original(...args);
			const depois = lerAberta();
			if (!antes && depois) {
				aoAbrir(nome);
			} else if (antes && !depois) {
				aoFechar(nome);
			}
			return r;
		};
		componente.__pilhaEmbrulhada = true;
	}
}

/**
 * UMA JANELA POR VEZ NO CELULAR EM PE (08/09/2026).
 *
 * No desktop as janelas Idle CONVIVEM — é decisão declarada em
 * `MapEngine.js` ("o jogador abre Mochila e Skills lado a lado de propósito"),
 * e ela continua valendo lá, intacta.
 *
 * No celular em pé conviver é impossível: D-932 transforma toda janela de
 * pilha em painel de TELA CHEIA, então duas abertas não ficam lado a lado —
 * ficam uma EM CIMA da outra, e a de baixo vira uma camada que come o toque
 * sem que nada na tela diga que ela está ali.
 *
 * MEDIDO antes do conserto (`scripts/diag-mobile-portrait.ts`, 393x852): com
 * a Mochila e a Análise abertas por baixo, o Mapa de Caça teve **40 dos seus
 * controles cobertos** — o "X", a busca, os segmentos e as abas, todos
 * respondendo `div.mo-*` e `span.ha-*` no `elementFromPoint`. É o "ficam
 * escondidas umas atrás das outras" do relato, com nome e número.
 *
 * **Modal de DECISÃO nunca é fechado por aqui, e nunca fecha ninguém**: o
 * pedido diz que submenu e confirmação têm de aparecer SOBRE a janela que os
 * abriu, e é exatamente isso — a confirmação empilha, a janela de baixo fica.
 * Janela auxiliar não registrada (a ficha de item que nasce da Mochila)
 * também não é afetada: a pilha só conhece quem se registrou.
 */
function fecharAsOutrasNoCelular(nome) {
	if (!ehCelularEmPe()) {
		return;
	}
	const doAlvo = _registro.get(nome);
	if (!doAlvo || doAlvo.tipo === TIPO.DECISAO) {
		return;
	}
	for (const outro of abertas()) {
		if (outro === nome) {
			continue;
		}
		const d = _registro.get(outro);
		if (!d || d.tipo === TIPO.DECISAO) {
			continue;
		}
		try {
			d.fechar();
		} catch (erro) {
			/* Uma janela que recusa fechar não pode impedir a que o jogador
			   ACABOU de pedir de aparecer. O `catch` é por isso, e não por
			   preguiça: o pior desfecho aqui é a tela ficar como estava. */
		}
	}
}

/*
 * QUEM QUER SABER QUANDO A PILHA MUDA (decisao D13, 08/10/2026): o martelo do `MobileUI` (o botao que mostra
 * as teclas de toque) ficava por cima do canto do titulo das janelas de tela cheia no celular em pe (z-index
 * 1000, a sonda de tela do QA final, V-09). Quem esta FORA da pilha (o `MobileUI`) assina aqui e se esconde
 * enquanto uma janela cobre a HUD; a pilha nao conhece o `MobileUI`.
 */
const _ouvintesDaPilha = new Set();

/** Assina as mudancas da pilha (abriu, fechou). Devolve a funcao que cancela a assinatura. */
export function aoMudarAPilha(fn) {
	_ouvintesDaPilha.add(fn);
	return () => _ouvintesDaPilha.delete(fn);
}

function avisarQuemAssinou() {
	for (const fn of _ouvintesDaPilha) {
		try {
			fn();
		} catch (erro) {
			console.error('[pilhaDeJanelas] um assinante da pilha falhou', erro);
		}
	}
}

/**
 * Alguma janela de TELA CHEIA cobre a HUD agora? So no celular em pe (D-932: la a janela vira folha); no
 * desktop e no celular deitado as janelas flutuam e nao cobrem o canto.
 */
export function janelaCobreAHud() {
	return ehCelularEmPe() && temAberta();
}

/** Avisa a pilha que a janela abriu (o embrulho chama sozinho). */
export function aoAbrir(nome) {
	if (!_registro.has(nome)) {
		return;
	}
	fecharAsOutrasNoCelular(nome);
	const i = _pilha.indexOf(nome);
	if (i !== -1) {
		_pilha.splice(i, 1);
	}
	_pilha.push(nome);
	avisarQuemAssinou();
}

/** Avisa a pilha que a janela fechou (o embrulho chama sozinho). */
export function aoFechar(nome) {
	const i = _pilha.indexOf(nome);
	if (i !== -1) {
		_pilha.splice(i, 1);
	}
	avisarQuemAssinou();
}

/**
 * As janelas abertas AGORA, em ordem de abertura.
 *
 * A pilha é reconciliada com o DOM a cada leitura: uma janela que se fechou por
 * um caminho que a pilha não viu (troca de mapa, troca de personagem — os dois
 * casos que já derrubaram o `is-open` por baixo dos panos neste fork) sai
 * daqui sozinha, em vez de manter o ESC preso a um fantasma.
 */
export function abertas() {
	for (let i = _pilha.length - 1; i >= 0; i--) {
		const d = _registro.get(_pilha[i]);
		if (!d || !d.estaAberta()) {
			_pilha.splice(i, 1);
		}
	}
	/* Janela aberta por fora do embrulho (o `append()` de uma nativa) entra
	   aqui na primeira leitura, no fim da pilha — ela é a mais recente que a
	   pilha conhece. */
	for (const [nome, d] of _registro) {
		if (d.estaAberta() && !_pilha.includes(nome)) {
			_pilha.push(nome);
		}
	}
	return _pilha.slice();
}

/** Existe alguma janela aberta? (modais contam) */
export function temAberta() {
	return abertas().length > 0;
}

/** A janela do topo, ou `null`. */
export function topo() {
	const a = abertas();
	return a.length ? _registro.get(a[a.length - 1]) : null;
}

/** Existe um modal de decisão aberto? */
export function temDecisaoAberta() {
	return abertas().some(n => _registro.get(n).tipo === TIPO.DECISAO);
}

/**
 * Fecha todas as janelas comuns. Modais de decisão NUNCA são fechados por
 * aqui — quem os abriu espera uma resposta.
 *
 * Fecha do topo para a base: uma janela que abriu outra (a ficha de item que
 * nasce da Mochila) some antes da dona, e não depois.
 */
export function fecharTodas() {
	const nomes = abertas().reverse();
	let fechadas = 0;
	for (const nome of nomes) {
		const d = _registro.get(nome);
		if (!d || d.tipo === TIPO.DECISAO) {
			continue;
		}
		try {
			d.fechar();
			fechadas++;
		} catch (erro) {
			/* Uma janela que explode ao fechar não pode prender as outras
			   abertas: o jogador apertou ESC para limpar a tela. */
			console.error('[pilhaDeJanelas] falha ao fechar', nome, erro);
		}
	}
	abertas();
	return fechadas;
}

/**
 * O foco está num campo de texto?
 *
 * Atravessa Shadow DOM: `document.activeElement` para no HOST do componente, e
 * o campo de verdade está dentro do `shadowRoot` dele. Sem descer, o chat
 * (que é shadow) nunca seria reconhecido como "digitando".
 */
export function campoDeTextoFocado(doc) {
	let el = (doc || document).activeElement;
	while (el && el.shadowRoot && el.shadowRoot.activeElement) {
		el = el.shadowRoot.activeElement;
	}
	if (!el) {
		return null;
	}
	const tag = (el.tagName || '').toLowerCase();
	if (tag === 'input' || tag === 'textarea' || el.isContentEditable) {
		return el;
	}
	return null;
}

/**
 * O que o ESC (e o voltar do Android) fazem. Devolve o que aconteceu, para o
 * chamador decidir se deixa o evento seguir.
 *
 * @returns {'desfocou'|'desarmou'|'decisao'|'fechou'|'nada'}
 */
export function aoEscapar(doc) {
	const campo = campoDeTextoFocado(doc);
	if (campo) {
		campo.blur();
		return 'desfocou';
	}
	/*
	 * ALGO NA MAO DESARMA PRIMEIRO (D-938).
	 *
	 * Com uma habilidade pega esperando um slot, o voltar do Android e o ESC
	 * estao desistindo DAQUELE gesto — fechar a janela inteira aqui faria o
	 * jogador perder a arvore de habilidades por causa de uma acao que nem
	 * chegou a acontecer. Um passo, uma desfeita.
	 *
	 * Vem DEPOIS do campo de texto de proposito: desfocar o chat e o unico
	 * caso mais imediato que este, e a ordem antiga fica intocada para quem
	 * nao tem nada na mao.
	 */
	if (desarmarAtalhoPendente()) {
		return 'desarmou';
	}
	/*
	 * O SELETOR DE NIVEL DA BARRA FECHA ANTES DAS JANELAS (D-1908), pelo mesmo
	 * argumento do "algo na mao" acima: ele e um gesto em curso sobre um slot,
	 * e o ESC desiste DELE. Sem esta linha, o voltar do Android com o balao
	 * aberto e nenhuma janela perguntaria se o jogador quer sair do jogo.
	 */
	if (fecharSeletorDeNivel()) {
		return 'desarmou';
	}
	/*
	 * OS OUTROS BALOES DA HUD (01/10/2026) — o painel "(i)" de uma missao. Mesmo
	 * argumento do seletor logo acima: o balao e o gesto mais recente, e o ESC
	 * desiste DELE antes de fechar as janelas de baixo. Sem esta linha, o voltar
	 * do Android com o painel aberto e nenhuma janela perguntaria se o jogador
	 * quer sair do jogo.
	 */
	if (fecharBalaoDaHud()) {
		return 'desarmou';
	}
	if (temDecisaoAberta()) {
		return 'decisao';
	}
	if (temAberta()) {
		fecharTodas();
		return 'fechou';
	}
	return 'nada';
}

/* ═══════════════════════════════════════════════════════════════════════
   O TECLADO
   ═══════════════════════════════════════════════════════════════════════ */

function tratarTecla(evento) {
	if (evento.which !== KEYS.ESCAPE && evento.key !== 'Escape') {
		return;
	}
	const resultado = aoEscapar(evento.target && evento.target.ownerDocument);
	if (resultado === 'nada') {
		/* Sem janela aberta o ESC segue o caminho de sempre e abre as
		   Configurações — o handler do `Escape` continua vivo e intocado. */
		return;
	}
	/*
	 * `stopImmediatePropagation` e não `stopPropagation`: os tratadores de ESC
	 * deste fork moram todos em `window`, e `stopPropagation` não impede
	 * outros listeners do MESMO alvo de rodar. Era exatamente essa a diferença
	 * entre "o ESC fechou a Mochila" e "o ESC fechou a Mochila E abriu as
	 * Configurações por cima".
	 */
	evento.stopImmediatePropagation();
	evento.preventDefault();
}

/* ═══════════════════════════════════════════════════════════════════════
   O BOTÃO VOLTAR DO ANDROID

   Não havia NADA disto no cliente: zero `history.pushState`, zero `popstate`.
   Em `standalone` o voltar sai do app — e sair do app é perder a sessão de
   quem está jogando.

   UMA ENTRADA-SENTINELA, e não uma por janela (H10, auditoria 2 de
   22/09/2026). O `popstate` só chega quando o voltar atravessa uma entrada do
   MESMO documento; na entrada-base o voltar sai do jogo e nenhum `popstate`
   nasce. Com uma entrada por janela aberta, as duas pontas quebravam: sem
   janela aberta não havia entrada, e o voltar saía SEM perguntar; e fechar pelo
   X não consumia a entrada, então o "OK" de "Sair do jogo?" consumia uma órfã e
   o jogo continuava. Agora a pilha mantém uma sentinela acima da base, armada
   ao ligar: todo voltar a consome e cai na função do ESC; quem fica no jogo a
   devolve, e o "OK" desce da base e sai.
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * O tempo que o aviso de saída do navegador (`window.onbeforeunload`) fica
 * desligado depois do "OK". Se o jogo ainda estiver de pé depois dele, a saída
 * não aconteceu (o PWA na entrada-base não tem para onde voltar), e o aviso
 * volta para proteger o fechamento da aba.
 */
const MS_ATE_DEVOLVER_O_AVISO_DE_SAIDA = 1500;

/** A entrada do jogo no histórico, a que o voltar consome. */
function ehSentinela(estado) {
	return !!(estado && estado.ragidleSentinela === true);
}

function armarSentinela() {
	if (!_ligado || typeof history === 'undefined' || !history.pushState) {
		return;
	}
	try {
		history.pushState({ ragidleSentinela: true }, '');
	} catch (erro) {
		/* Alguns contextos (file://, sandbox restrito) recusam pushState. O
		   ESC continua funcionando; só o voltar do Android fica de fora. */
	}
}

/**
 * O "OK" de "Sair do jogo?": o voltar já consumiu a sentinela, então descer
 * mais uma entrada deixa o documento. O aviso de saída do navegador cala nesse
 * passo — o jogador acabou de confirmar na nossa pergunta, e a dele seria a
 * segunda.
 */
function sairDoJogo() {
	const aviso = window.onbeforeunload;
	window.onbeforeunload = null;
	history.back();
	setTimeout(() => {
		if (window.onbeforeunload === null) {
			window.onbeforeunload = aviso;
		}
	}, MS_ATE_DEVOLVER_O_AVISO_DE_SAIDA);
}

function tratarVoltar(evento) {
	/* Chegar NA sentinela (o avançar) não consumiu nada: não é um voltar. */
	if (ehSentinela(evento && evento.state)) {
		return;
	}
	const resultado = aoEscapar(document);
	if (resultado !== 'nada') {
		/* Fechou, desfocou, desarmou ou há um modal esperando resposta: o
		   jogador fica, e a sentinela que o navegador acabou de consumir volta —
		   sem ela o próximo voltar sairia do jogo sem perguntar. */
		armarSentinela();
		return;
	}
	if (_pedindoConfirmacaoDeSaida) {
		return;
	}
	_pedindoConfirmacaoDeSaida = true;
	try {
		const sair = window.confirm('Sair do jogo? O seu personagem continua caçando no servidor.');
		if (sair) {
			sairDoJogo();
		} else {
			armarSentinela();
		}
	} finally {
		_pedindoConfirmacaoDeSaida = false;
	}
}

/**
 * Liga a pilha. Idempotente — chamar duas vezes não duplica listener.
 *
 * O `true` do `addEventListener` é a fase de CAPTURA, e ela é o ponto do
 * conserto: os tratadores de ESC deste fork moram em `window` na fase de
 * bolha, e a captura roda ANTES de todos eles. Registrar mais um na bolha só
 * somaria mais um competidor à mesma fila desordenada.
 */
export function ligar() {
	if (_ligado || typeof window === 'undefined') {
		return;
	}
	_ligado = true;
	window.addEventListener('keydown', tratarTecla, true);
	window.addEventListener('popstate', tratarVoltar);
	/* A sentinela nasce com a pilha (H10). Um F5 volta a página EM CIMA dela,
	   e armar outra deixaria uma entrada que nenhum voltar pede. No `try`
	   porque `ligar` roda na montagem do mapa, antes do ACTORINIT (D-993): o
	   voltar do Android não vale a entrada no mundo. */
	try {
		if (typeof history !== 'undefined' && !ehSentinela(history.state)) {
			armarSentinela();
		}
	} catch (erro) {
		console.error('[pilhaDeJanelas] a entrada do jogo no historico falhou; o ESC segue', erro);
	}
}

export function desligar() {
	if (!_ligado || typeof window === 'undefined') {
		return;
	}
	_ligado = false;
	window.removeEventListener('keydown', tratarTecla, true);
	window.removeEventListener('popstate', tratarVoltar);
	_pilha.length = 0;
}

/** Só para os testes: esquece tudo. */
export function _zerar() {
	desligar();
	_registro.clear();
}

export default {
	TIPO,
	registrar,
	aoAbrir,
	aoFechar,
	aoMudarAPilha,
	janelaCobreAHud,
	abertas,
	temAberta,
	topo,
	temDecisaoAberta,
	fecharTodas,
	campoDeTextoFocado,
	aoEscapar,
	ligar,
	desligar,
	_zerar,
};
