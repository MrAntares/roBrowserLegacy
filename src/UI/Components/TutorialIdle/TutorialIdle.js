/**
 * UI/Components/TutorialIdle/TutorialIdle.js
 *
 * A CAMADA GUIADA DO TUTORIAL (frente D do CONTRATO-JORNADA.md, secao 7).
 *
 * Uma camada de tela cheia com quatro pecas: a mascara escura com UM furo
 * exatamente no controle-alvo, o anel de realce na boca do furo, a mao do
 * proprio Ragnarok encostada no controle, e o balao com quem fala, a frase
 * curta e o "Pular tutorial".
 *
 * A gramatica e a da gravacao do AFK Arena (`docs/referencia-tutorial/`):
 * uma acao por vez, uma frase curta no imperativo citando o ROTULO do
 * controle entre aspas, um personagem falando em primeira pessoa, o alvo
 * destacado e o resto escurecido, e NENHUM botao "Proximo" que substitua a
 * acao. A pele e a do Ragnarok.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * QUEM MANDA E O SERVIDOR
 * ═══════════════════════════════════════════════════════════════════════
 * A etapa vigente mora no personagem (`servidor/tutorial.ts`, secao 6 do
 * contrato) e desce em ZC_RAGIDLE_TUTORIAL (0x0fdf). Este componente nao
 * guarda progresso: ele PEDE (`{acao:'pedir'}`) ao entrar no mapa e redesenha
 * o que chegar. Por isso reconexao, morte, troca de mapa e fechar a janela
 * nao perdem nada - e o retrato do servidor, e nao um contador local, que
 * decide o que a tela mostra.
 *
 * Quando o cliente ve a condicao REAL de uma etapa cumprida (a janela abriu,
 * o pacote chegou, o mapa mudou), ele manda `{acao:'avancar', etapa: N}` com
 * **N = etapa vigente + 1**, isto e, a etapa para a qual ele quer ir. O
 * servidor so aceita se N for exatamente `atual + 1`, entao pacote repetido e
 * reconexao nao pulam etapa. Esta e a leitura literal da guarda escrita na
 * secao 6 do contrato, e ela e o contrato do lado de ca: se a frente C
 * implementar a guarda com outro sentido de `etapa`, os dois lados param de
 * se entender em silencio.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * POR QUE POLLING, E NAO `hookPacket` NOS PACOTES DOS OUTROS
 * ═══════════════════════════════════════════════════════════════════════
 * `Network.hookPacket()` SOBRESCREVE o handler em vez de encadear
 * (NetworkManager.js:200-210). Enganchar ZC_RAGIDLE_MISSOES aqui roubaria o
 * pacote da janela de Missoes e do rastreador, que e exatamente o defeito que
 * o cabecalho de MissoesTrackerIdle.js documenta. Entao este componente
 * engancha SO o pacote que e dele (0x0fdf) e LE por polling de 250ms o estado
 * que os donos ja mantem: `MissoesIdle.missoes`/`.execucao`,
 * `Session.Entity.weapon`, `MapRenderer.currentMap` e o registro da cacada. E
 * o mesmo idioma do DeathWindow (que sonda `Session.Entity.life`) e do
 * rastreador.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * AS CINCO ARMADILHAS DO CONTRATO, E ONDE CADA UMA E TRATADA
 * ═══════════════════════════════════════════════════════════════════════
 *   1. `zoom` -> `zoom: 1 !important` no `:host` (TutorialIdle.css, com a
 *      conta inteira no cabecalho de la). Ler e escrever passam a ser a mesma
 *      unidade, e nao ha conversao a esquecer.
 *   2. Shadow DOM -> `acharAlvo()` resolve `document.getElementById(host)
 *      .shadowRoot.querySelector(seletor)`, nunca `document.querySelector`.
 *   3. Leque fechado nao tem caixa -> `recorteDoAlvo()` devolve `null` para
 *      uma caixa 0x0, e a etapa cai no `quandoSumir`, que aponta a porta de
 *      volta em vez do vazio.
 *   4. Celular -> a etapa 1 ("abra o Menu") e obrigatoria para todo mundo, e
 *      e ela que faz "Missoes" e "Codex" existirem no celular
 *      (`.ri-vertical` esconde os `.tm-item` do cluster). O verbo da frase
 *      troca com o ponteiro.
 *   5. Redimensionar/rolar/janela arrastada -> `onResize` (chamado pelo
 *      `UIManager.fixResizeOverflow`) MAIS um `ResizeObserver` no elemento
 *      alvo, porque o alvo muda de caixa sem a viewport mudar.
 *
 * @author RagIdle
 */

import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import Session from 'Engine/SessionStorage.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import Cursor from 'UI/CursorManager.js';
import RiIcones from 'UI/ri-icones.js';
import MissoesIdle from 'UI/Components/MissoesIdle/MissoesIdle.js';
// 01/10/2026: sem "a ativa" (ate tres aceitas), as etapas 7 e 10 perguntam a
// PRIMEIRA aceita — a mesma que o cartao da HUD marca com `.mt-ativa`.
import { quantasAceitas, missaoAceita } from 'UI/Components/MissoesIdle/podeIniciarMissao.js';
import { progressoDaPrimeiraAceita } from 'UI/Components/MissoesIdle/missoesAceitas.js';
import BoasVindasIdle from 'UI/Components/BoasVindasIdle/BoasVindasIdle.js';
import IdiomaIdle from 'UI/Components/IdiomaIdle/IdiomaIdle.js';
import { decidir as decidirIdiomaDaConta, enviarIdiomaDaConta } from 'Core/idiomaDaConta.js';
import { definirIdioma, idiomaAtual, idiomaFoiEscolhido } from 'Core/Idioma.js';
import { recarregarMantendoASessao } from 'UI/recargaMantendoASessao.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import ItemType from 'DB/Items/ItemType.js';
import { ler as lerRegistroDaCaca } from 'UI/Components/HuntAnalyzer/registroDaCaca.js';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import htmlText from './TutorialIdle.html?raw';
import cssText from './TutorialIdle.css?raw';
import {
	ETAPAS,
	QUEM_GUIA,
	TOTAL_DE_ETAPAS,
	casaDoBalao,
	etapaDe,
	dentroDoFuro,
	fraseDaEtapa,
	maoDaEtapaDaArma,
	mapaDeReferenciaDaEtapa,
	passoDaEconomia,
	posicaoDaMao,
	recorteDoAlvo,
	retangulosDaMascara
} from './etapasDoTutorial.js';

/** O ritmo do polling. O mesmo do DeathWindow e do rastreador de missoes. */
const MS_DO_TIQUE = 250;

/**
 * A MAO: acao CLICK (`Cursor.ACTION.CLICK = 2`, CursorManager.js:84-95),
 * QUADRO 0.
 *
 * Os tres quadros da acao 2 foram renderizados do `data/sprite/cursors.spr`
 * deste cliente e OLHADOS (contato em `docs/provas-tutorial/`): o quadro 0 e a
 * luva com o indicador ESTICADO, apontando para cima e para a esquerda; os
 * quadros 1 e 2 sao a animacao de aperto, com o dedo ja recolhido. Uma mao de
 * dedo recolhido nao aponta nada, entao a camada usa o quadro 0 parado, e nao
 * a animacao.
 */
const ACAO_DA_MAO = 2;
const QUADRO_DA_MAO = 0;

/** O quadro compilado do cursor e 50x50; a camada o desenha a 2x (D-326:
 *  arte do cliente amplia por numero INTEIRO). */
const ESCALA_DA_MAO = 2;
const LADO_DA_MAO = 50 * ESCALA_DA_MAO;

/** Onde a ponta do dedo cai quando a varredura do alfa nao foi possivel.
 *  E o canto superior esquerdo com uma folga: a arte aponta para la. */
const PONTA_DE_RESERVA = { x: 8, y: 8 };

/** Tamanho estimado da faixa do balao, para escolher a casa dele. O numero
 *  e recalculado com a altura MEDIDA assim que o balao existe na tela. */
const BALAO_PADRAO = { altura: 120, margem: 96 };

const TutorialIdle = new GUIComponent('TutorialIdle', cssText);

TutorialIdle.render = () => htmlText.replace(/<!--RI_ICONE:(\w+)-->/g, (_, chave) => RiIcones[chave] || '');

/**
 * A camada nunca engole clique por si: fechada ela e transparente, e aberta
 * quem bloqueia sao os quatro retangulos da mascara. CROSS e o mesmo modo do
 * DeathWindow e das janelas Idle.
 */
TutorialIdle.mouseMode = GUIComponent.MouseMode.CROSS;
TutorialIdle.needFocus = false;

/** O ultimo retrato do servidor (contrato v1 de ZC_RAGIDLE_TUTORIAL). */
TutorialIdle.estado = null;

let _timer = null;
let _observador = null;
let _alvoObservado = null;
/** Assinatura da ultima geometria desenhada, para nao reescrever estilo a 4Hz. */
let _assinatura = '';
/** Etapa cuja `avancar` ja foi mandada (o servidor pode demorar a responder). */
let _avancoMandado = 0;
/** O que a etapa vigente viu quando comecou (mapa, arma, abates, contador). */
let _marco = null;
/* O marco da etapa que ACABOU, guardado por uma volta: o retrato da etapa nova
   zera `_marco` (onTutorialRecebido), e a 8 precisa do mapa da 7 (ver
   `mapaDeReferenciaDaEtapa`). */
let _marcoAnterior = null;
/** Ja pedi ao servidor para COMECAR? Sem esta guarda, um retrato repetido de
 *  'nao-iniciado' viraria um laco de `retomar`. */
let _comecoPedido = false;
/** A ponta do dedo dentro da imagem da mao, medida uma vez. */
let _pontaDaMao = null;
let _urlDaMao = null;

function _root() {
	return TutorialIdle._shadow || TutorialIdle._host;
}

/* ------------------------------------------------------------------ */
/* O fio com o servidor                                                */
/* ------------------------------------------------------------------ */

function mandar(acao, etapa) {
	if (!PACKET.CZ.RAGIDLE_TUTORIAL_ACAO) {
		return;
	}
	const pkt = new PACKET.CZ.RAGIDLE_TUTORIAL_ACAO();
	const corpo = { acao };
	if (typeof etapa === 'number') {
		corpo.etapa = etapa;
	}
	pkt.json = JSON.stringify(corpo);
	Network.sendPacket(pkt);
}

/** Pede o retrato. Chamado ao entrar no mapa e por quem quiser ressincronizar. */
TutorialIdle.pedirAoServidor = function pedirAoServidor() {
	mandar('pedir');
};

/**
 * "Retomar pela ajuda": reabre o tutorial de onde ele parou (ou do comeco,
 * para quem pulou). Quem chama e a linha "Rever o tutorial" da Configuracao
 * idle (IdleConfig).
 */
TutorialIdle.retomar = function retomar() {
	mandar('retomar');
};

/** O tutorial esta desenhando alguma etapa agora? Leitura para quem precisa
 *  saber (a linha da ajuda, e uma prova de tela). */
TutorialIdle.estaNaTela = function estaNaTela() {
	const root = _root();
	const camada = root && root.querySelector('.tu-camada');
	return !!(camada && camada.classList.contains('is-open'));
};

/** Limpeza da troca de personagem (a lista de `cleanGameUI`). O retrato e do
 *  personagem que saiu; herda-lo desenharia a etapa do outro. */
TutorialIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	TutorialIdle.estado = null;
	_assinatura = '';
	_avancoMandado = 0;
	_marco = null;
	_marcoAnterior = null;
	_comecoPedido = false;
	desobservar();
	// A peca compartilhada (limpezaDeJanelaIdle.js): tirar o `is-open` a mao
	// era a copia local que o portao do servidor
	// (`janela-idle-esquece-o-desenho.test.ts`) existe para barrar.
	fecharEEsquecer(_root(), '.tu-camada');
};

/* ------------------------------------------------------------------ */
/* Achar o alvo (armadilha 2: tudo mora em Shadow DOM)                 */
/* ------------------------------------------------------------------ */

/**
 * @param {{host:string, seletor:string}|null} descricao
 * @returns {Element|null}
 */
function acharAlvo(descricao) {
	if (!descricao) {
		return null;
	}
	const host = document.getElementById(descricao.host);
	if (!host || !host.shadowRoot) {
		return null;
	}
	return host.shadowRoot.querySelector(descricao.seletor);
}

/** A janela RAGIDLE de nome `<id>` esta aberta? Mesma leitura que o TopMenuIdle
 *  faz: as janelas Idle marcam `.xx-window.is-open`. */
function janelaAberta(hostId, seletor) {
	const el = acharAlvo({ host: hostId, seletor });
	return !!(el && el.classList.contains('is-open'));
}

/**
 * A aba `idDaAba` do Codex esta ATIVA agora? Mesma leitura que
 * `CodexIdle.js:render()` faz para acender o botao (`.cx-tab.is-active`).
 *
 * Usado pelas etapas 2 e 11 (16/09/2026): as duas abrem "Codex & Missões" e
 * so avancam quando a aba CERTA esta na frente, e nao so "a janela esta
 * aberta" - ela ja pode estar aberta ha varias etapas, na aba errada.
 */
function abaDoCodexAtiva(idDaAba) {
	const btn = acharAlvo({ host: 'CodexIdle', seletor: `.cx-tab[data-aba="${idDaAba}"]` });
	return !!(btn && btn.classList.contains('is-active'));
}

/**
 * A JANELA DE VOTO (OU O AVISO AUTOMATICO DELA) ESTA NA TELA? (16/09/2026,
 * relato do dono: "o tutorial buga" quando o voto esta liberado).
 *
 * `VotoIdle` abre de dois jeitos que o tutorial nao controla: o jogador clica
 * "Votar" no TopMenuIdle a qualquer momento (o botao fica aceso e clicavel
 * durante o tutorial inteiro), OU o servidor manda `avisar:true` no MESMO
 * pacote de entrada de mapa que dispara a etapa vigente do tutorial
 * (`servidor-mapa.ts`, handler de CZ_NOTIFY_ACTORINIT) e `VotoIdle.js` abre um
 * aviso sozinho. Nos dois casos a mascara do tutorial (`z-index: 1900000
 * !important`, TutorialIdle.css) cobre e bloqueia todo clique fora do furo da
 * etapa atual - a janela/aviso de voto fica visivel so em parte, ou nem isso,
 * e sem responder a clique nenhum. E o MESMO defeito que `BoasVindasIdle` ja
 * causava (ver o cabecalho de `desenhar()` abaixo); aqui o tutorial cede do
 * mesmo jeito.
 *
 * Leitura pura de DOM, sem `import` de `VotoIdle.js`: essa janela carrega
 * `Renderer/Renderer.js` na propria carga (o mesmo motivo por que
 * `fecharJanelaDaEtapa` evita importar `CorreioIdle`/`MochilaIdle` acima), e
 * prender o ciclo de carga do tutorial ao dela so pioraria isso.
 */
function votoNaTela() {
	if (janelaAberta('VotoIdle', '.vi-window')) {
		return true;
	}
	const aviso = acharAlvo({ host: 'VotoIdle', seletor: '.vi-aviso-modal' });
	return !!(aviso && !aviso.hidden);
}

/**
 * FECHA A JANELA QUE UMA ETAPA JA CUMPRIDA ABRIU (15/09/2026, achado ao
 * JOGAR o reordenamento das etapas).
 *
 * Entre "abrir Missoes" (etapa 2) e "iniciar a missao" (etapa 7) passaram a
 * entrar TRES janelas (Correio, Mochila, Configuracao) que NUNCA se fecham
 * sozinhas - o jogo EMPILHA janela Idle, nunca substitui. Sem este
 * fechamento, a janela de Missoes fica ENTERRADA embaixo das outras tres: o
 * furo da mascara mede a posicao REAL do botao "Iniciar" (o layout dele nao
 * muda so por estar coberto), entao `medirRecorte` devolve uma caixa VALIDA
 * e o `quandoSumir` nunca dispara - o jogador via o furo boiando sobre a
 * janela ERRADA (a ultima aberta), sem nenhum jeito de alcancar o botao de
 * verdade por baixo. Fechar a janela de cada etapa assim que ela cumpre o
 * que tinha para ensinar devolve Missoes ao topo da pilha a tempo da etapa 7.
 *
 * `UIManager.getComponent`, e nao `import`: `CorreioIdle` e `MochilaIdle` puxam
 * `Renderer/Renderer.js` (a segunda ainda `Renderer/SpriteRenderer.js`) na
 * carga, e um import estatico aqui prenderia o teste desta janela ao canvas
 * delas.
 */
function fecharJanelaDaEtapa(hostId, seletor) {
	if (!janelaAberta(hostId, seletor)) {
		return;
	}
	try {
		const comp = UIManager.getComponent(hostId);
		if (comp && typeof comp.toggle === 'function') {
			comp.toggle();
		}
	} catch (_erro) {
		/* componente nao carregado: nada a fechar. */
	}
}

/* ------------------------------------------------------------------ */
/* A condicao REAL de cada etapa                                       */
/* ------------------------------------------------------------------ */

/** O que a etapa precisa lembrar de "antes" para saber que algo andou. */
function marcoDaEtapa(numero) {
	const execucao = MissoesIdle.execucao || null;
	return {
		numero,
		mapa: MapRenderer.currentMap || '',
		arma: (Session.Entity && Session.Entity.weapon) || 0,
		abates: abatesAgora(),
		/* O contador da PRIMEIRA aceita (01/10/2026; era o passo da unica
		   ativa). Ver `progressoDaPrimeiraAceita`, que diz por que e a soma. */
		progresso: progressoDaPrimeiraAceita(MissoesIdle.missoes, execucao),
		/* `Session.zeny` (Engine/SessionStorage.js) e o MESMO getter que a HUD
		   le para desenhar o saldo (BasicInfoIdle.js:501) - o personagem novo
		   nasce com `zeny: 0` (servidor/char/servidor-char.ts) e so ganha o do
		   kit ao retirar a carta de boas-vindas do Correio (D-534). E metade
		   do par que o caso 5 confere - a outra metade e `Inventory.getUI().
		   list` (a ARMA em si), lida direto na hora, sem marco: presenca de
		   item nao precisa de "antes/depois", so precisa existir agora. */
		zeny: Session.zeny || 0,
		/* Etapa 12: o valor da caixa "Economia de energia" na primeira vez que
		   ela apareceu na tela, ou `null` enquanto nao apareceu. E o UNICO
		   campo do marco que muda depois de criado - ver `passoDaEconomia`
		   (etapasDoTutorial.js), que diz por que a etapa precisa lembrar. */
		economiaVista: null
	};
}

/**
 * A LEITURA DA JANELA DE VIDEO para a etapa 12, em DOM puro.
 *
 * `GraphicsOption` nao usa `is-open`: ela e inserida e REMOVIDA do DOM
 * (`Escape.js`, `onToggleGraphicUI`), entao "aberta" e "o host existe e a
 * janela tem caixa". A caixa da economia mora na aba "Basic": com a janela
 * lembrando a aba "Advanced", ela existe mas mede 0x0 - e isso e "fora da
 * tela", e nao "fechada".
 */
function leituraDaJanelaDeVideo() {
	const janela = acharAlvo({ host: 'GraphicsOption', seletor: '.ri-window' });
	const caixaDaJanela = janela ? janela.getBoundingClientRect() : null;
	const janelaAberta = !!(caixaDaJanela && caixaDaJanela.width > 0 && caixaDaJanela.height > 0);
	const caixa = janelaAberta ? acharAlvo({ host: 'GraphicsOption', seletor: '.economia-automatica' }) : null;
	const r = caixa ? caixa.getBoundingClientRect() : null;
	return {
		janelaAberta,
		caixaNaTela: !!(r && r.width > 0 && r.height > 0),
		marcada: caixa ? !!caixa.checked : null
	};
}

function abatesAgora() {
	const gid = Session.Entity && Session.Entity.GID;
	if (!gid) {
		return 0;
	}
	try {
		const r = lerRegistroDaCaca(gid);
		return (r && r.abatesTotal) || 0;
	} catch (_erro) {
		return 0;
	}
}

/** Ha arma na mochila (`ItemType.WEAPON`, o criterio de `getItemTab()` em `MochilaIdle.js`). */
function temArmaDoKitNaMochila() {
	return Inventory.getUI().list.some((item) => item.type === ItemType.WEAPON);
}

/**
 * O QUE A MOCHILA MOSTRA AGORA, para `maoDaEtapaDaArma` (etapa 5). Leitura de
 * DOM pura, como `abaDoCodexAtiva`: a aba acesa e a `.mo-aba.is-active` que
 * `syncAbasAtivas` (MochilaIdle.js) marca. As armas saem da MESMA lista que a
 * grade desenha (`Inventory.getUI().list`), e o `index` delas e o `data-index`
 * que `syncGrade` carimba em cada celula.
 */
function leituraDaMochila() {
	const ativa = acharAlvo({ host: 'MochilaIdle', seletor: '.mo-aba.is-active' });
	/* `getAttribute` e nao o `dataset` do atributo: o portao de
	   `tests/ui/memoriaDeAba.test.js` reconhece "janela com abas" por esse
	   texto no fonte, e o tutorial so LE a aba de outra janela, nao tem abas. */
	const aba = ativa ? parseInt(ativa.getAttribute('data-tab'), 10) : NaN;
	const ui = Inventory.getUI();
	return {
		abaAtiva: Number.isFinite(aba) ? aba : null,
		abaDasArmas: ui.TAB.EQUIP,
		indicesDasArmas: ui.list.filter((item) => item.type === ItemType.WEAPON).map((item) => item.index)
	};
}

/** Os candidatos da mao da etapa: a lista fixa `maoEm` ou, na etapa 5, a que
 *  depende da aba acesa da Mochila (ver `maoDaEtapaDaArma`). */
function candidatosDaMao(etapa) {
	if (etapa.avancaPor === 'arma-vestida-confirmada') {
		return maoDaEtapaDaArma(leituraDaMochila());
	}
	return etapa.maoEm;
}

/**
 * A etapa `numero` foi cumprida DE VERDADE?
 *
 * Nenhum ramo aqui olha para um clique: todos olham para o RESULTADO (a
 * janela abriu, o servidor confirmou, o mapa mudou, o contador andou). E o que
 * a regra 6 da gravacao exige, e o que impede um "Proximo" disfarcado.
 */
function etapaCumprida(numero) {
	const execucao = MissoesIdle.execucao || null;
	switch (numero) {
		case 1: {
			/* O leque abriu: o `.tm-fan` ganha `is-open` (TopMenuIdle.js:750). */
			return janelaAberta('TopMenuIdle', '.tm-fan');
		}
		case 2:
			/* A aba "Missões Gerais" do Codex esta ativa (16/09/2026: a
			   janela `MissoesIdle` independente saiu do leque). */
			return abaDoCodexAtiva('missoes');
		case 3:
			/* A janela do Correio abriu (`CorreioIdle.js`, `.co-window` ganha
			   `is-open` no toggle). So abrir - retirar o kit de dentro dela e a
			   etapa 4, com alvo na janela inteira (dois gestos, um furo so). */
			/* 25/09/2026 (decisao 1d): a etapa 3 mostra a MOCHILA, onde o kit
			   ja esta (o servidor o retira sozinho na entrada no mapa). */
			return janelaAberta('MochilaIdle', '.mo-window');
		case 4: {
			/*
			 * O KIT RETIRADO POR INTEIRO, e nao so a metade dele.
			 *
			 * `CorreioIdle.js` tem DOIS botoes para esta carta - "Coletar zeny"
			 * e "Coletar itens" - e cada clique manda o proprio pacote
			 * (`CZ_REQ_ITEM_FROM_RODEX`/native pickup ack). Exigir SO
			 * `Session.zeny` subir avancaria a etapa no primeiro clique: a
			 * mascara sairia da janela do Correio (o alvo desta etapa) para
			 * apontar a Mochila, e o segundo clique ("Coletar itens") ficaria
			 * do lado de fora do furo - achado ao JOGAR esta etapa pela
			 * primeira vez (15/09/2026), o mesmo defeito de fundo que a
			 * etapa 3-4 nasceu para consertar, um clique adiante.
			 *
			 * **NAO uso `Session.Entity.weight` subir** - errado por medicao
			 * NO PROPRIO JOGO (15/09/2026): um personagem que ja estava
			 * cacando (idle/offline) quando esta etapa comecou pode ganhar
			 * peso por DROP de monstro, sem ter clicado "Coletar itens" -
			 * `pesoSubiu` ficaria verdadeiro do mesmo jeito, avancando a
			 * etapa com a mochila ainda sem arma nenhuma. `Inventory.getUI().
			 * list` (o MESMO array publico que `MochilaIdle.js` le - ver o
			 * cabecalho dele) e especifico: existe uma ARMA na mochila, ou
			 * nao existe. `ItemType.WEAPON` e o mesmo criterio de
			 * `getItemTab()` em `MochilaIdle.js`, nao uma copia solta.
			 */
			/*
			 * 25/09/2026: o KIT E RETIRADO PELO SERVIDOR na entrada no mapa
			 * (`prepararAEntrada`, `servidor-mapa.ts`, ordem do dono), ANTES de
			 * esta etapa comecar. Exigir que o zeny SUBISSE depois do marco
			 * travava o tutorial para sempre: o zeny ja tinha subido. Os dois
			 * botoes que a regra acima protegia nao existem mais para o kit (o
			 * servidor retira zeny e itens juntos), entao a arma na mochila e
			 * o resultado inteiro.
			 */
			return temArmaDoKitNaMochila();
		}
		case 5: {
			/* A peca vestida CONFIRMADA: `Session.Entity.weapon` so muda quando
			   o servidor manda o ZC_SPRITE_CHANGE (Engine/MapEngine/Entity.js).
			   Comparar com o marco cobre tanto "estava sem arma" quanto "trocou
			   de arma". */
			const arma = (Session.Entity && Session.Entity.weapon) || 0;
			return arma !== 0 && (!_marco || arma !== _marco.arma);
		}
		case 6: {
			/*
			 * AS DUAS POCOES LIGADAS, CONFIRMADAS PELO SERVIDOR (15/09/2026).
			 *
			 * `IdleConfig.serverConfig` e o ESTADO ACEITO - o mesmo campo que
			 * `IdleConfig.js` so preenche na resposta de `pedir` ou de `aplicar`
			 * bem sucedido (nunca o rascunho `editConfig`, que o jogador pode
			 * estar editando sem ter confirmado nada). Exigir os DOIS campos
			 * (`pocaoDeHp.ligado` e `pocaoDeSp.ligado`) e nao o rascunho e o
			 * mesmo padrao de "sinal confirmado pelo servidor" que a etapa da
			 * arma usa com `Session.Entity.weapon`. O percentual de 50% que a
			 * frase ensina NAO e cobrado aqui: e o numero que o passo ENSINA a
			 * colocar, nao um piso que a etapa exige - ver o cabecalho de
			 * `retrato.pocoesConfiguradas` em `servidor/tutorial.ts`.
			 */
			/* A janela "Idle" (IdleConfig) SAIU em 07/10/2026 (Novo Bot V5):
			   nao ha mais onde ler a pocao confirmada, e o tutorial esta
			   desligado (ver `onTutorialRecebido`). A etapa fica na tabela
			   porque a numeracao e a do servidor. */
			return false;
		}
		case 7:
			/* O SERVIDOR aceitou a missao. `execucao` vem do ZC_RAGIDLE_MISSOES,
			   que a janela de Missoes recebe e guarda. Desde 01/10/2026 ele manda
			   `{aceitas, maximo}` (ate tres juntas) no lugar da unica `ativaId`:
			   a etapa cumpre com QUALQUER aceita — a lista ou o `aceita` da
			   propria missao, a mesma leitura das telas (`missaoAceita`). */
			return (
				quantasAceitas(execucao) > 0 || (MissoesIdle.missoes || []).some(m => missaoAceita(m, execucao))
			);
		case 8:
			/* Chegou: o mapa carregado nao e mais o de quando a etapa comecou. */
			return !!(_marco && MapRenderer.currentMap && MapRenderer.currentMap !== _marco.mapa);
		case 9:
			/* O primeiro abate depois que a etapa comecou. */
			return abatesAgora() > (_marco ? _marco.abates : 0);
		case 10: {
			/* O contador do objetivo andou — o da PRIMEIRA aceita, o bloco
			   `.mt-ativa` do cartao que esta etapa aponta (01/10/2026). */
			const agora = progressoDaPrimeiraAceita(MissoesIdle.missoes, execucao);
			return agora > (_marco ? _marco.progresso : 0);
		}
		case 11:
			/* A aba "Missões do Códex" (Jornada) esta ativa - nao so "a
			   janela esta aberta" (16/09/2026): ela ja esta aberta desde a
			   etapa 2, na aba "Missões Gerais". */
			return abaDoCodexAtiva('jornada');
		case 12: {
			/* A caixa "Economia de energia" foi VISTA, e depois o jogador
			   mexeu nela ou fechou a janela de Video (24/09/2026). A regra
			   mora em `passoDaEconomia`; aqui so se le a tela e se guarda o
			   que ela devolveu. */
			if (!_marco) {
				return false;
			}
			const passo = passoDaEconomia(_marco.economiaVista, leituraDaJanelaDeVideo());
			_marco.economiaVista = passo.visto;
			return passo.cumprida;
		}
		default:
			return false;
	}
}

/* ------------------------------------------------------------------ */
/* A mao                                                               */
/* ------------------------------------------------------------------ */

/**
 * Onde esta a ponta do dedo dentro do quadro compilado.
 *
 * O quadro e um PNG de 50x50 desenhado pelo CursorManager, e o offset do
 * desenho dentro dele depende do `ActionInformations` do cliente. Em vez de
 * copiar aquele numero para ca (e envelhecer junto com ele), a ponta e MEDIDA:
 * varre-se o alfa uma vez e toma-se o pixel opaco mais alto, e nele o mais a
 * esquerda. E o pixel para onde o dedo aponta.
 *
 * Falhar aqui nao pode derrubar a camada: sem medida, cai em PONTA_DE_RESERVA.
 */
function medirPontaDaMao(img) {
	try {
		const canvas = document.createElement('canvas');
		canvas.width = img.naturalWidth || 50;
		canvas.height = img.naturalHeight || 50;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		const dados = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
		for (let y = 0; y < canvas.height; y++) {
			for (let x = 0; x < canvas.width; x++) {
				if (dados[(y * canvas.width + x) * 4 + 3] > 40) {
					return { x: x * ESCALA_DA_MAO, y: y * ESCALA_DA_MAO };
				}
			}
		}
	} catch (_erro) {
		/* Canvas indisponivel ou contaminado: a reserva serve. */
	}
	return { x: PONTA_DE_RESERVA.x, y: PONTA_DE_RESERVA.y };
}

/** Liga (ou religa) a imagem da mao. Devolve `true` se a arte do jogo entrou. */
function ligarAMao() {
	const root = _root();
	const caixa = root && root.querySelector('.tu-mao');
	const img = root && root.querySelector('.tu-mao-img');
	if (!caixa || !img) {
		return false;
	}
	if (_urlDaMao) {
		return true;
	}
	const url = typeof Cursor.getCompiledFrameURL === 'function'
		? Cursor.getCompiledFrameURL(ACAO_DA_MAO, QUADRO_DA_MAO)
		: null;
	if (!url) {
		/* O cursor ainda nao foi rasterizado (ou o jogador desligou o cursor
		   customizado). A camada segue com o glifo de reserva e tenta de novo
		   no proximo tique - `Cursor.init` acontece uma vez, no boot. */
		caixa.classList.add('sem-cursor');
		return false;
	}
	_urlDaMao = url;
	caixa.classList.remove('sem-cursor');
	img.addEventListener(
		'load',
		() => {
			_pontaDaMao = medirPontaDaMao(img);
			_assinatura = '';
			desenhar();
		},
		{ once: true }
	);
	img.src = url;
	return true;
}

/* ------------------------------------------------------------------ */
/* Desenhar                                                            */
/* ------------------------------------------------------------------ */

/** O ponteiro deste aparelho e um dedo? Decide o verbo da frase. */
function temDedo() {
	try {
		return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
	} catch (_erro) {
		return false;
	}
}

function desobservar() {
	if (_observador) {
		_observador.disconnect();
		_observador = null;
	}
	_alvoObservado = null;
}

/**
 * ARMADILHA 5, a metade que a viewport nao cobre: o alvo muda de caixa sem a
 * tela mudar de tamanho (a janela foi arrastada, a lista rolou, o leque
 * distribuiu as colunas de novo). O `ResizeObserver` no PROPRIO alvo e o que
 * pega isso; o `onResize` la embaixo pega a outra metade.
 */
function observar(alvo) {
	if (alvo === _alvoObservado) {
		return;
	}
	desobservar();
	if (!alvo || typeof ResizeObserver === 'undefined') {
		return;
	}
	_alvoObservado = alvo;
	_observador = new ResizeObserver(() => {
		_assinatura = '';
		desenhar();
	});
	_observador.observe(alvo);
}

function posicionar(el, r) {
	el.style.left = `${r.x}px`;
	el.style.top = `${r.y}px`;
	el.style.width = `${r.w}px`;
	el.style.height = `${r.h}px`;
}

/**
 * O FURO, EM PIXEL INTEIRO.
 *
 * `getBoundingClientRect()` devolve fracao (um `.tm-item` mede 66,6875px de
 * altura), e a mascara e derivada do furo por SUBTRACAO. Arredondar cada peca
 * na hora de escrever o estilo, e nao o furo, faz o retangulo de baixo comecar
 * meio pixel ACIMA de onde o furo acaba - e ai a mascara encosta no alvo, que e
 * o unico defeito que esta camada nao pode ter. A prova de tela pegou isso como
 * "1 retangulo cruza o furo".
 *
 * Arredondando o FURO uma vez, para fora (piso na origem, teto no fim), toda a
 * aritmetica seguinte e inteira e fecha exatamente na borda da tela.
 */
function medirRecorte(alvo, tela) {
	if (!alvo) {
		return null;
	}
	const r = recorteDoAlvo(alvo.getBoundingClientRect(), tela);
	if (!r) {
		return null;
	}
	const x = Math.floor(r.x);
	const y = Math.floor(r.y);
	return {
		x,
		y,
		w: Math.min(Math.ceil(r.x + r.w), tela.largura) - x,
		h: Math.min(Math.ceil(r.y + r.h), tela.altura) - y
	};
}

function desenhar() {
	const root = _root();
	const camada = root && root.querySelector('.tu-camada');
	if (!camada) {
		return;
	}

	const estado = TutorialIdle.estado;
	const numero = estado ? estado.etapa : 0;
	/*
	 * O CARTAZ DE BOAS-VINDAS VEM PRIMEIRO (16/09/2026, relato do dono: "o
	 * aviso do discord atrapalha"). Os dois sao camadas de tela cheia que
	 * disparam no MESMO instante (a entrada no mapa), e nenhuma sabe da
	 * outra. Em vez de fazer o cartaz saber do tutorial (ele e usado por
	 * QUALQUER janela futura, e acoplar so pioraria isso), o tutorial e
	 * quem cede: com o cartaz aberto a etapa fica como se nao tivesse
	 * comecado, e o proximo tique (250 ms depois de fechado) a desenha
	 * normalmente. `BoasVindasIdle.estaAberta()` e leitura pura de DOM
	 * (`.bv-modal.is-open`), do mesmo jeito que `janelaAberta()` le as
	 * janelas RAGIDLE - sem pacote, sem estado novo aqui.
	 *
	 * O VOTO CEDE PELO MESMO MOTIVO (16/09/2026, relato do dono: "o
	 * tutorial buga" com o voto liberado). `votoNaTela()` cobre os dois
	 * jeitos de `VotoIdle` aparecer sem o tutorial pedir - o botao "Votar"
	 * sempre clicavel no TopMenuIdle, e o aviso automatico que o servidor
	 * dispara no MESMO pacote de entrada de mapa que a etapa vigente. Sem
	 * isto a mascara (`z-index: 1900000`) cobria a janela/aviso de voto e
	 * bloqueava todo clique nela, fora do furo da etapa atual.
	 */
	/*
	 * O PASSO ZERO (D-1929, o jogo em ingles): o jogador novo, na etapa 1, que
	 * nunca escolheu idioma ve a escolha ANTES da primeira etapa. A janela fica
	 * por cima de tudo (inclusive da caixa de boas-vindas), e o tutorial cede
	 * enquanto ela esta aberta; fechando sem recarregar, ele redesenha.
	 */
	if (estado && estado.estado === 'em-andamento' && Number(numero) === 1) {
		IdiomaIdle.passoZero(() => {
			_assinatura = '';
			desenhar();
		});
	}

	const etapa =
		estado &&
		estado.estado === 'em-andamento' &&
		!BoasVindasIdle.estaAberta() &&
		!IdiomaIdle.estaAberta() &&
		!votoNaTela()
			? etapaDe(numero)
			: null;

	if (!etapa) {
		camada.classList.remove('is-open');
		desobservar();
		_assinatura = '';
		return;
	}

	ligarAMao();

	const tela = { largura: window.innerWidth, altura: window.innerHeight };
	let descricao = null;
	let frasePersonalizada = null;
	let alvo = null;
	let recorte = null;

	if (Array.isArray(etapa.alvos)) {
		/*
		 * TRES ALCANCES OU MAIS, NA ORDEM DO GESTO (16/09/2026, achado ao
		 * JOGAR as etapas 2/7/11: apontar so para o icone do leque, ou so
		 * para o `.tm-fab`, cobria UM dos dois estados do leque e deixava
		 * o outro sem mao). `etapa.alvos` e uma LISTA - o primeiro
		 * candidato com caixa valida vence, e a frase dele (quando tem)
		 * substitui a da etapa. O `alvo`/`quandoSumir` de duas pontas
		 * continua servindo as etapas que so tem DOIS estados reais.
		 */
		for (const candidato of etapa.alvos) {
			const el = acharAlvo(candidato);
			const r = medirRecorte(el, tela);
			if (r) {
				descricao = candidato;
				frasePersonalizada = candidato.frase || null;
				alvo = el;
				recorte = r;
				break;
			}
		}
	} else {
		/* O alvo da etapa. Sem caixa (leque fechado, janela fechada), cai no
		   caminho de volta - e nunca aponta para o vazio. */
		descricao = etapa.alvo;
		alvo = acharAlvo(descricao);
		recorte = medirRecorte(alvo, tela);

		if (!recorte && etapa.quandoSumir) {
			descricao = etapa.quandoSumir;
			frasePersonalizada = etapa.quandoSumir.frase;
			alvo = acharAlvo(descricao);
			recorte = medirRecorte(alvo, tela);
		}
	}

	/* Etapa sem alvo por desenho (a 9) OU alvo que sumiu e nao tem volta:
	   a camada fica sem mascara e so o balao fala. Escurecer a tela sem um
	   furo seria trancar o jogador atras de um vidro preto. */
	const semMascara = !recorte;
	camada.classList.toggle('sem-mascara', semMascara);

	const balaoEl = camada.querySelector('.tu-balao');
	const alturaDoBalao = balaoEl && balaoEl.offsetHeight ? balaoEl.offsetHeight : BALAO_PADRAO.altura;
	const casa = casaDoBalao(recorte, tela, { altura: alturaDoBalao, margem: BALAO_PADRAO.margem });

	/*
	 * A MAO PODE MIRAR UM SUB-ALVO DIFERENTE DO FURO (16/09/2026, relato do
	 * dono nas etapas 4 e 6). Etapas com furo na JANELA INTEIRA (dois ou
	 * tres gestos, um furo so - ver o cabecalho de cada uma em
	 * `etapasDoTutorial.js`) declaram `maoEm`: uma LISTA de candidatos, na
	 * ordem do gesto. O primeiro com caixa valida vence; sem nenhum (o
	 * sub-alvo ainda nao existe - a aba certa nem foi aberta), a mao volta
	 * ao canto do furo inteiro, o comportamento de sempre.
	 */
	let recorteDaMao = recorte;
	const candidatos = recorte ? candidatosDaMao(etapa) : null;
	if (Array.isArray(candidatos)) {
		for (const candidato of candidatos) {
			const r = medirRecorte(acharAlvo(candidato), tela);
			/* So vale o sub-alvo que mora DENTRO do furo desta hora (ver
			   `dentroDoFuro`): a etapa 12 tem candidatos em duas janelas. */
			if (r && dentroDoFuro(r, recorte)) {
				recorteDaMao = r;
				break;
			}
		}
	}

	const mao = {
		largura: LADO_DA_MAO,
		altura: LADO_DA_MAO,
		pontaX: (_pontaDaMao || PONTA_DE_RESERVA).x,
		pontaY: (_pontaDaMao || PONTA_DE_RESERVA).y
	};
	const posMao = recorteDaMao ? posicaoDaMao(recorteDaMao, tela, mao) : null;

	const assinatura = JSON.stringify([
		numero,
		estado.total,
		recorte,
		posMao,
		casa,
		frasePersonalizada,
		tela,
		!!_urlDaMao
	]);
	if (assinatura === _assinatura) {
		camada.classList.add('is-open');
		observar(alvo);
		return;
	}
	_assinatura = assinatura;

	/*
	 * 1. A mascara: quatro retangulos em volta do furo.
	 *
	 * SEM FURO, NENHUM RETANGULO. A prova de tela pegou isto: o CSS ja tinha
	 * `.sem-mascara .tu-veu { display: none }`, mas o `style.display` que este
	 * laco escreve e INLINE e vence a folha, entao a etapa de OLHAR (sem alvo
	 * - a 9a, "entender a caca automatica", ver `etapasDoTutorial.js`) saia
	 * com a tela inteira escurecida e engolindo o clique da cena. Quem
	 * manda no `display` e este laco, e nao a folha: um estado escrito em dois
	 * lugares e um estado que discorda de si mesmo.
	 */
	const veus = camada.querySelectorAll('.tu-veu');
	const rects = semMascara ? [] : retangulosDaMascara(recorte, tela);
	for (let i = 0; i < veus.length; i++) {
		const r = rects[i];
		if (r && r.w > 0 && r.h > 0) {
			veus[i].style.display = 'block';
			posicionar(veus[i], r);
		} else {
			veus[i].style.display = 'none';
		}
	}

	/* 2. O anel, exatamente na boca do furo. */
	const anel = camada.querySelector('.tu-anel');
	if (anel && recorte) {
		posicionar(anel, recorte);
	}

	/* 3. A mao. */
	const caixaDaMao = camada.querySelector('.tu-mao');
	if (caixaDaMao && posMao) {
		caixaDaMao.style.left = `${Math.round(posMao.x)}px`;
		caixaDaMao.style.top = `${Math.round(posMao.y)}px`;
		caixaDaMao.classList.toggle('espelha-x', posMao.espelharX);
		caixaDaMao.classList.toggle('espelha-y', posMao.espelharY);
	}

	/* 4. O balao. */
	const quem = camada.querySelector('.tu-quem');
	const passo = camada.querySelector('.tu-passo');
	const frase = camada.querySelector('.tu-frase');
	if (quem) {
		quem.textContent = QUEM_GUIA;
	}
	if (passo) {
		passo.textContent = `Passo ${numero} de ${estado.total || TOTAL_DE_ETAPAS}`;
	}
	if (frase) {
		frase.textContent = fraseDaEtapa(etapa, temDedo(), frasePersonalizada);
	}
	if (balaoEl) {
		balaoEl.classList.toggle('is-baixo', casa === 'baixo');
		balaoEl.classList.toggle('is-cima', casa === 'cima');
	}

	camada.classList.add('is-open');
	observar(alvo);
}

/* ------------------------------------------------------------------ */
/* O tique                                                             */
/* ------------------------------------------------------------------ */

function tique() {
	const estado = TutorialIdle.estado;
	if (!estado) {
		return;
	}

	/*
	 * QUEM DECIDE SE O TUTORIAL COMECA E O SERVIDOR. O cliente nao adivinha:
	 * ele so age quando o retrato diz 'nao-iniciado', e uma vez so por sessao
	 * de mapa (a guarda evita um laco caso o servidor demore a responder).
	 */
	if (estado.estado === 'nao-iniciado') {
		if (!_comecoPedido) {
			_comecoPedido = true;
			TutorialIdle.retomar();
		}
		return;
	}

	if (estado.estado !== 'em-andamento') {
		desenhar();
		return;
	}

	const numero = estado.etapa;
	if (!_marco || _marco.numero !== numero) {
		const anterior = _marco || _marcoAnterior;
		_marco = marcoDaEtapa(numero);
		_marco.mapa = mapaDeReferenciaDaEtapa(numero, anterior, _marco.mapa);
		_marcoAnterior = null;
	}

	if (_avancoMandado !== numero && etapaCumprida(numero)) {
		_avancoMandado = numero;
		/* Fecha a janela desta etapa ANTES de pedir o avanco: ver o
		   cabecalho de `fecharJanelaDaEtapa`. As cinco cujo alvo fica no
		   caminho de uma etapa seguinte precisam disso. */
		if (numero === 4) {
			fecharJanelaDaEtapa('CorreioIdle', '.co-window');
		} else if (numero === 5) {
			fecharJanelaDaEtapa('MochilaIdle', '.mo-window');
		} else if (numero === 2 || numero === 7) {
			/*
			 * O CODEX FICA NO CAMINHO DA PROPRIA VOLTA (16/09/2026, relato
			 * do dono: a etapa 10 mostrava um furo VAZIO, porque "Codex &
			 * Missões" - aberta na etapa 2 e nunca fechada - cobria o
			 * rastreador de missao que a etapa 10 aponta). Diferente do
			 * Correio/Mochila/Config, o Codex e alvo de TRES etapas nao
			 * contiguas (2, 7 e 11): fechar aqui nao perde nada, porque
			 * `etapa.alvos` (etapasDoTutorial.js) ja sabe guiar o jogador
			 * de volta a ele pelo leque quando a proxima usa-lo precisar -
			 * o mesmo motivo por que esta cadeia de tres alcances existe.
			 */
			fecharJanelaDaEtapa('CodexIdle', '.cx-window');
		}
		mandar('avancar', numero + 1);
	}

	desenhar();
}

/* ------------------------------------------------------------------ */
/* Ciclo de vida                                                       */
/* ------------------------------------------------------------------ */

TutorialIdle.init = function init() {
	const root = _root();
	const pular = root.querySelector('.tu-pular');
	if (pular) {
		pular.addEventListener('click', evento => {
			evento.preventDefault();
			evento.stopPropagation();
			mandar('pular');
			/* A camada some na hora, sem esperar o retrato: o jogador pediu para
			   sair e nao pode ficar olhando um tutorial que "ainda esta ali". Se
			   o servidor recusar, o proximo retrato traz a etapa de volta. */
			const camada = root.querySelector('.tu-camada');
			if (camada) {
				camada.classList.remove('is-open');
			}
			_assinatura = '';
		});
	}
};

TutorialIdle.onAppend = function onAppend() {
	if (_timer) {
		clearInterval(_timer);
	}
	_timer = setInterval(tique, MS_DO_TIQUE);
	window.addEventListener('scroll', aoRolar, true);
	_comecoPedido = false;
};

/**
 * O GANCHO DE "INTERFACE PRONTA".
 *
 * Chamado no fim do `MapRenderer.onLoad`, depois de `HudVertical.ligar()`
 * (MapEngine.js) - o ponto em que todo componente ja esta anexado, a escala da
 * HUD ja foi aplicada e a marca do celular em pe ja esta carimbada. Antes
 * disso os alvos existem mas nao estao na caixa final, e a primeira etapa
 * apontaria para o lugar errado por um quadro.
 *
 * Ele roda em TODA troca de mapa, e isso e a RECUPERACAO, nao um defeito: a
 * etapa mora no servidor, entao perguntar de novo e barato e e o que devolve o
 * tutorial depois de morte, viagem ou reconexao. Quem decide se ha tutorial e
 * o retrato que vier de volta.
 */
TutorialIdle.interfacePronta = function interfacePronta() {
	_comecoPedido = false;
	/* O TUTORIAL ESTA DESLIGADO DE VEZ (07/10/2026, Novo Bot V5): as etapas
	   ensinam a caca automatica, a pocao automatica e a janela "Idle", e
	   nenhuma delas existe mais. Nao se pede o retrato ao servidor (antes
	   era o interruptor do modo classico que calava isto). */
};

TutorialIdle.onRemove = function onRemove() {
	if (_timer) {
		clearInterval(_timer);
		_timer = null;
	}
	window.removeEventListener('scroll', aoRolar, true);
	desobservar();
	_assinatura = '';
};

/**
 * ARMADILHA 5, a metade da viewport. `UIManager.fixResizeOverflow`
 * (UIManager.js:252) chama isto em todo `resize`, depois de reaplicar a escala
 * da HUD e a marca vertical - entao aqui os alvos ja estao na caixa nova.
 */
TutorialIdle.onResize = function onResize() {
	_assinatura = '';
	desenhar();
};

/** Rolagem move o alvo sem mudar o tamanho de nada. Captura no documento
 *  inteiro porque a lista que rola vive dentro de outro Shadow DOM. */
function aoRolar() {
	_assinatura = '';
	desenhar();
}

/* ------------------------------------------------------------------ */
/* O pacote                                                            */
/* ------------------------------------------------------------------ */

/**
 * O dono do `ZC_RAGIDLE_TUTORIAL` IGNORA o pacote (07/10/2026): o tutorial
 * esta desligado de vez (ver `interfacePronta`), inclusive para o retrato que o
 * servidor mandar sozinho. O gancho continua de pe para o opcode ter um dono
 * (hookPacket: um por opcode). Religar seria trocar este corpo por
 * `aplicarRetrato(pkt)`.
 */
function onTutorialRecebido() {
	/* desligado */
}

/** O desenho do retrato, intacto e sem chamador no jogo (so teste/prova). */
function aplicarRetrato(pkt) {
	let dados;
	try {
		dados = JSON.parse(pkt.json);
	} catch (err) {
		console.error('[TutorialIdle] payload nao e JSON valido', err);
		return;
	}
	/* Guarda de versao, como em CodexIdle/PasseIdle/MissoesIdle: um retrato de
	   contrato futuro e IGNORADO em vez de desenhado meio errado. */
	if (!dados || dados.v !== 1) {
		return;
	}
	/* A conta manda depois do login: idioma diferente do aparelho grava e recarrega
	   UMA vez (depois dela os dois concordam); conta sem idioma recebe o do aparelho. */
	const rumo = decidirIdiomaDaConta(dados.idioma, idiomaAtual(), idiomaFoiEscolhido());
	if (rumo === 'aplicar') {
		definirIdioma(dados.idioma);
		recarregarMantendoASessao();
		return;
	}
	if (rumo === 'subir') {
		enviarIdiomaDaConta(idiomaAtual());
	}
	const mudouDeEtapa = !TutorialIdle.estado || TutorialIdle.estado.etapa !== dados.etapa;
	TutorialIdle.estado = dados;
	if (mudouDeEtapa) {
		/* Etapa nova: o marco de "antes" e o avanco pendente valem para a
		   anterior, e carregar qualquer um deles adiantaria a proxima. O marco
		   que sai fica UMA volta em `_marcoAnterior`, so para o mapa da 8. */
		_marcoAnterior = _marco;
		_marco = null;
		_avancoMandado = 0;
	}
	_assinatura = '';
	desenhar();
}

Network.hookPacket(PACKET.ZC.RAGIDLE_TUTORIAL, onTutorialRecebido);
TutorialIdle.aplicarRetrato = aplicarRetrato;

/** Exportado para o teste e para a prova de tela conseguirem falar da tabela
 *  sem reabrir o modulo puro. */
TutorialIdle.ETAPAS = ETAPAS;

export default UIManager.addComponent(TutorialIdle);
