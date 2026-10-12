/**
 * UI/Components/TopMenuIdle/TopMenuIdle.js
 *
 * O MENU DA HUD, em DUAS PARTES (20/08/2026 — frente "menu em duas partes").
 * Gabarito de ORGANIZACAO: redesign/referencia-hud-origin.md (a leitura da
 * captura do Ragnarok Origin que o dono forneceu). Gabarito de ACABAMENTO: o
 * design system oficial e as janelas que este projeto ja refez — o
 * acabamento NUNCA imita o Origin.
 *
 *   ".tm-top"  — CLUSTER SUPERIOR DIREITO: fileira de CINCO essenciais
 *                (Personagem, Mochila, Skills, Caca, Correio) + a alca de
 *                recolher. E o que se usa toda hora jogando.
 *   ".tm-menu" — CANTO INFERIOR DIREITO: UM botao "Menu" (".tm-fab") que
 *                abre/fecha o LEQUE (".tm-fan") com os 11 secundarios.
 *                Fechado, o leque nao existe na tela — sobra so o botao.
 *
 * ─── RODADA 2 (20/08/2026): O LEQUE FICOU EM PE ─────────────────────────
 * Ele era uma FILEIRA HORIZONTAL de onze discos translucidos sem rotulo, e
 * reprovou: sobre o calcamento branco de Prontera aquilo lia como ruido, e
 * era inconsistente com o cluster de cima (mesmo componente, disco solido e
 * rotulado). O dono redefiniu a forma — duas colunas em pe, carga dividida
 * ao meio, uma linha dourada entre elas com um ornamento premium no topo — e
 * a secao 3 do gabarito foi reescrita com o pedido. Em pe sobra largura, e
 * por isso o ROTULO voltou, permanente, igual ao dos cinco de cima; a
 * aritmetica que o condenava na rodada 1 (11 rotulados = ~869px contra 587
 * de espaco util) so valia para UMA fileira horizontal.
 * Quem divide as colunas e distribuirColunas(), no JS, e nao o HTML: sem o
 * item de Admin (que so existe para a conta dona) sao 10 itens, e o corte
 * tem de virar 5/5 sozinho.
 *
 * O "10 itens / 5+5" ACIMA E DE 20/08/2026, e o leque ANDOU desde entao.
 * Contado no HTML em 29/08/2026: sao 11 botoes, 10 deles visiveis para quem
 * nao e o dono. O LFG entrou em D-634 e o Codex em D-851; entre um e outro a
 * frase acima ficou dizendo 10 com o literal em 9, que e o modo de falha de
 * sempre — numero escrito a mao num comentario nao acompanha a pasta.
 *
 * Nada quebra com isso: distribuirColunas() conta os VISIVEIS e parte no meio
 * (Math.ceil), entao da 5/5 para o jogador comum e 6/5 para a conta dona. O
 * "5+5" do pedido original fica registrado como o que era — ele explica o
 * desenho, e nao mede a pasta de hoje.
 *
 * O QUE MUDOU nesta rodada, e por que: ate ontem os 17 icones moravam TODOS
 * no canto superior direito — uma fileira de 5 e, colada abaixo dela, uma
 * grade de 6 colunas com 12. O gabarito (secao 1) diz que o superior e "uma
 * fileira, nao uma grade de tres linhas", e (secao 2) que o inferior direito
 * e "uma porta", nao um segundo cluster. Entao a grade inteira desceu para o
 * leque. A pele nao mudou em nada.
 *
 * ─── ONDE FOI PARAR CADA UM DOS 17 (nenhum sumiu sem destino) ────────────
 *   CLUSTER (7): Personagem, Mochila, Skills, Caca, Correio, MISSOES
 *                (entrou em 24/08/2026, D-551 — nao e um dos 17: e janela
 *                nova), Idle.
 *   LEQUE (10):  Guilda, Grupo, Admin, Loja, RO Shop, Troca, Leilao,
 *                Recompensas, Eventos, Passe.
 *   17 = 6 + 10 + 1, e o "1" e a FUSAO: "Config" e "Menu" eram dois icones
 *   de gaveta de ajuste e viraram um so (ver o bloco da fusao mais abaixo).
 *
 *   MUDOU EM 21/08/2026, a pedido do dono: o item fundido saiu do leque,
 *   subiu para o cluster e passou a se chamar "Idle" -- o nome do que ele
 *   abre. Ele e o painel que se mexe ENTRE uma sessao idle e outra (coleta,
 *   lista negra, pocao), nao um destino ocasional como Loja ou Leilao. O
 *   "data-action" continua "config" DE PROPOSITO: e a chave que o portao
 *   prova-clique-nao-vaza.ts ja mira, e renomear so trocaria o nome do mesmo
 *   destino em varios arquivos. Com isso o leque fica em 10 itens -- a
 *   divisao 5+5 que o dono desenhou.
 *
 *   MUDOU DE NOVO EM 06/09/2026, a pedido do dono: RECOMPENSAS e MISSOES
 *   TROCARAM DE CASA. O Recompensas (`data-action` "passe") subiu para o
 *   cluster, no lugar exato onde o Missoes estava, e o Missoes desceu para o
 *   leque, no fim do bloco funcional (logo depois do Codex). So a POSICAO
 *   mudou: as duas janelas, os dois `data-action`, os pacotes e os dois
 *   switches deste arquivo continuam iguais -- por isso nenhuma fiacao foi
 *   tocada, e as contagens tambem nao mudaram (8 no cluster, 11 no leque,
 *   10 visiveis fora a conta dona).
 *
 *   O QUE MUDA DE COMPORTAMENTO, e vale dito: escolher um item DO LEQUE
 *   fecha a gaveta (fim de onClickAction()), e item de cluster nao fecha
 *   nada. Entao o Missoes passa a fechar o leque ao abrir a janela, e o
 *   Recompensas deixou de fechar coisa alguma. O gate
 *   prova-clique-nao-vaza.ts depende dessa diferenca e foi ajustado na
 *   mesma rodada: o alvo do Missoes saiu do bloco do cluster e entrou no
 *   roteiro do leque, que so existe depois de o botao Menu abrir a gaveta.
 *
 * ─── FIACAO REAL (cada item chama o MESMO metodo publico que ja abre a
 * janela em outro lugar do fork — nenhum alias novo foi criado) ──────────
 *   - Personagem  -> StatusIdle.toggle()     (StatusIdle.js)
 *   - Mochila     -> MochilaIdle.toggle()    (MochilaIdle.js:429) — a janela
 *                 unificada (inventario + equipamento). A chave continua
 *                 "inventory": e o alvo que o gate de clique e os scripts de
 *                 foto ja miram.
 *   - Skills      -> IdleSkills.toggle()     (IdleSkills.js, mesmo metodo
 *                 que DockIdle.js:229 usa)
 *   - Caca        -> HuntMap.toggle()        (HuntMap.js:287) — MESMA janela
 *                 que "#HuntButtonIdle" abre; redundancia DECLARADA e pedida
 *                 pelo dono.
 *   - Correio     -> CorreioIdle.toggle()    — a caixa do SISTEMA
 *                 (rag-idle-master/servidor/caixa.ts, D-366). O toggle
 *                 tambem PEDE a caixa ao abrir (0x09e6).
 *   - (o item "Idle"/"config", que abria o IdleConfig, SAIU em 07/10/2026:
 *                 a janela foi retirada com o Novo Bot V5; o "Bot" ocupa o
 *                 lugar dele no cluster)
 *   - Guilda      -> Guild.toggle()          (Guild.js:404-418) — metodo
 *                 PUBLICO nativo. ATENCAO ao comportamento nativo: sem
 *                 guilda (!Session.hasGuild), Guild.toggle() NAO abre a
 *                 janela — chama Guild.promptCreateGuild(), exatamente como
 *                 o atalho de teclado nativo faz (Guild.js:420-423). Aceito
 *                 de proposito: e o unico caminho de entrada que existe.
 *   - Grupo       -> GrupoIdle.toggle()  (D-988; era PartyFriends.toggle()
 *                 antes de D-960, e a porta automatica de D-984 no meio). Ele
 *                 abre a janela de Grupo SEMPRE, inclusive sem party: e la que
 *                 se le a aba Postos antes de decidir entrar num grupo.
 *   - Procurar grupo -> LFGIdle.toggle()  (D-988). O par do de cima. A troca
 *                 automatica ao entrar e ao sair continua em portaDoGrupo.js;
 *                 o que ela nao faz mais e escolher o que o MENU abre.
 *   - Admin       -> AdminPanel.toggle(), com a MESMA pergunta que o painel
 *                 faz: `souAdmin()` (DB/Items/idParaAdmin.js), a marca que o
 *                 servidor manda (D-1367) — o item e escondido client-side de
 *                 quem nao a tem; o servidor aplica a restricao de verdade.
 *
 * ─── A FUSAO "Config" + "Menu" -> "Configuracoes" (pedido do dono) ───────
 * Eram dois discos vizinhos, os dois com cara de ajuste, e o jogador tinha
 * de adivinhar qual era qual: "Config" abria a Configuracao idle
 * (IdleConfig) e "Menu" disparava a tecla ESC (Escape.js), que e a janela de
 * SISTEMA do cliente — audio, video, atalho, trocar personagem, fechar jogo.
 * O icone fundido abre a Configuracao idle: e a janela que o rotulo nomeia e
 * a que se usa jogando.
 * O QUE ISSO CUSTA, dito na cara: a janela de sistema perdeu a porta de
 * mouse e ficou so na TECLA ESC — que continua nativa e intocada (nenhum
 * arquivo de Escape.js foi tocado nesta rodada). Isso esta declarado como
 * pendencia [DONO] no relatorio da frente; se ele quiser a porta de mouse de
 * volta, o lugar barato e uma linha dentro da propria Configuracao idle.
 *
 * ─── EM BREVE (contado no HTML em 06/09/2026: Loja, Troca, Leilao e
 * Eventos -- os quatro com `data-em-breve`; desde 02/10/2026 a Troca LIGOU e
 * abre a janela "Trade", e sobram tres): a funcao ainda nao existe no
 * jogo. A lista escrita aqui ja dizia sete, e tres deles LIGARAM desde
 * entao (RO Shop em I5, Recompensas/Passe em D-813, que sao o mesmo botao):
 * numero escrito a mao em comentario nao acompanha a pasta, e a fonte de
 * verdade e o atributo no HTML. Visual honesto (o DS manda dessaturar;
 * desde a rodada 2 a dessaturacao vale so pro MIOLO, e o aro dourado fica em
 * opacidade cheia — ver o CSS), "aria-disabled" pro leitor de tela, e o
 * clique responde com o toast proprio do componente (".tm-toast", ver
 * showToast()) — NENHUM pacote sai do cliente, NENHUMA janela falsa abre. A
 * lista inteira e o atributo "data-em-breve" no HTML, lido no clique.
 *
 * ─── ORDEM: dentro de cada parte, TODOS os funcionais primeiro. O cluster e
 * so funcional; o leque poe Guilda, Grupo, Admin e so depois
 * os "em breve" — nunca misturado, pra nao fazer o jogador procurar o que
 * funciona no meio do que ainda nao existe. Em duas colunas, a ordem de
 * leitura e a natural do portugues: desce a coluna da ESQUERDA inteira e so
 * entao desce a da DIREITA.
 *
 * ─── ESTADO ATIVO (aro azul-dourado, ".is-active"): DERIVADO da janela
 * estar aberta, a cada tique do polling — nunca lembrado do clique. Antes de
 * 19/08/2026 era lembrado, e por isso fechar a janela pelo "X" dela deixava
 * o aro aceso para sempre. Detecao de "esta aberta":
 *   - janelas RAGIDLE marcam ".xx-window.is-open" (mesmo formato de
 *     HuntMap/IdleConfig/IdleSkills/StatusIdle/MochilaIdle/AdminPanel, ver
 *     DockIdle.js:isRagIdleWindowOpen()).
 *   - Guilda/Grupo: janelas nativas escondem via display:none no proprio
 *     HOST (Guild.js usa this.ui.show()/.hide(), proxy jQuery-like sobre
 *     _host, GUIComponent.js:1322; PartyFriendsCommon.js:120-138 idem).
 *     MESMO helper isHostVisible() de DockIdle.js.
 *
 * ─── z-index / needFocus=false / pointer-events: mesmo contrato de
 * DockIdle.js/CombatCornerIdle.js — este componente nunca e uma janela,
 * entao nunca precisa vir pra frente (fica preso no z-index inicial 50,
 * GUIComponent.js:159) e nunca intercepta clique no mapa fora dos proprios
 * botoes (":host" pointer-events:none, cada botao reabre com auto).
 * O host continua PEQUENO (o tamanho da fileira de cima): quem desce pro
 * canto inferior e o ".tm-menu", com position:fixed na viewport. Foi
 * deliberado nao esticar o host pra tela toda — camada invisivel sobre o
 * mundo inteiro e exatamente a familia de defeito que o gate de clique
 * (rag-idle-master/scripts/prova-clique-nao-vaza.ts) existe pra pegar.
 *
 * @author RagIdle
 */

import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import IdleSkills from 'UI/Components/IdleSkills/IdleSkills.js';
import Guild from 'UI/Components/Guild/Guild.js';
// A janela NATIVA de party saiu deste arquivo em D-960: o item "Grupo"
// passou a abrir a `GrupoIdle`, e nao havia mais nenhum uso de
// `PartyFriends` aqui. Ela continua VIVA no jogo — quem a anexa e quem a
// alimenta e o `Engine/MapEngine.js` e o `Engine/MapEngine/Group.js`, que
// desenham o convite que CHEGA e a lista de amigos.
import LFGIdle from 'UI/Components/LFGIdle/LFGIdle.js'; // RAGIDLE: Procurar Grupo (D-634)
/* A `GrupoIdle` saiu dos imports em D-984 pelo mesmo motivo que a `PartyFriends`
   saiu em D-960: o item "Grupo" deixou de citar uma janela por nome. Quem
   escolhe entre as duas — e quem carrega as duas — e a `portaDoGrupo`. */
import GrupoIdle from 'UI/Components/GrupoIdle/GrupoIdle.js'; // RAGIDLE: a janela de Grupo (D-960)
import { ehCelularEmPe } from 'UI/hudVertical.js'; // D-939: a folha do menu flutua sobre o chat
/* 08/09/2026: a terceira porta do "Instalar app". A DECISAO e toda de la — ver
   `ligarOfertaDeInstalacao()` mais abaixo. */
import { escutarACasca, ofertaAtual, pontePWA, textoDoResultado } from 'UI/ofertaDeInstalacao.js';
import SkillList from 'UI/Components/SkillList/SkillList.js';
import StatusIdle from 'UI/Components/StatusIdle/StatusIdle.js';
import MochilaIdle from 'UI/Components/MochilaIdle/MochilaIdle.js';
import HuntMap from 'UI/Components/HuntMap/HuntMap.js';
import CorreioIdle from 'UI/Components/CorreioIdle/CorreioIdle.js';
import HuntAnalyzer from 'UI/Components/HuntAnalyzer/HuntAnalyzer.js';
/* PasseIdle NAO e mais importado aqui (21/09/2026): a janela de Recompensas
   ficou sem botao - o conteudo dela mora na Temporada. O modulo segue vivo
   pelo MapEngine, como dono do pacote 0x0fe5. */
import { temRecompensaParaResgatar } from 'UI/Components/TemporadaIdle/formatoDaTemporada.js'; // a bolinha da Temporada (29/09/2026)
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js'; // a troca de personagem fecha a gaveta (auditoria pre-push, 30/09/2026)
import { pontoDoMenuAceso } from './pontoDoMenu.js'; // a bolinha do botao Menu (29/09/2026)
import TemporadaIdle from 'UI/Components/TemporadaIdle/TemporadaIdle.js'; // RAGIDLE: a janela da Temporada (Season 1, 21/09/2026) - no cluster desde a noite do mesmo dia
import VotoIdle from 'UI/Components/VotoIdle/VotoIdle.js'; // RAGIDLE: janela de Voto (D-1159)
import CodexIdle from 'UI/Components/CodexIdle/CodexIdle.js'; // RAGIDLE: Codex (D-851)
import { temAvisoDoCodex } from 'UI/Components/avisoDoCodex.js'; // D-1232
import PresencaIdle from 'UI/Components/PresencaIdle/PresencaIdle.js'; // RAGIDLE: Presenca (D-1162)
import IndicacaoIdle from 'UI/Components/IndicacaoIdle/IndicacaoIdle.js'; // RAGIDLE: Indique & Ganhe (D-1164)
import RankingIdle from 'UI/Components/RankingIdle/RankingIdle.js'; // RAGIDLE: o Ranking
import AmigosIdle from 'UI/Components/AmigosIdle/AmigosIdle.js'; // RAGIDLE: a janela Amigos (05/10/2026)
import TrocaIdle from 'UI/Components/TrocaIdle/TrocaIdle.js'; // RAGIDLE: a janela "Trade" (02/10/2026)
import BotMenu from 'UI/Components/BotMenu/BotMenu.js'; // RAGIDLE: o menu do Bot novo (07/10/2026)
import AdminPanel from 'UI/Components/AdminPanel/AdminPanel.js';
import Escape from 'UI/Components/Escape/Escape.js'; // RAGIDLE: a janela de sistema (D-1416)
import RoShop from 'UI/Components/RoShop/RoShop.js'; // RAGIDLE: o RO Shop (22/09/2026) - a porta do item "RO Shop" (era a CashShop nativa, I5)
import RiIcones from 'UI/ri-icones.js';
import htmlText from './TopMenuIdle.html?raw';
import cssText from './TopMenuIdle.css?raw';
import { emUnidadesDaHud } from 'UI/escalaDaHud.js'; // D-934: geometria medida vira unidade da HUD
import { souAdmin } from 'DB/Items/idParaAdmin.js'; // D-1367: quem ve o item "Admin"

/**
 * Mesmo intervalo de polling leve que DockIdle.js/BasicInfoIdle.js.
 */
const POLL_INTERVAL_MS = 250;

/**
 * Quanto tempo o toast "Em breve" fica visivel antes de sumir sozinho.
 */
const TOAST_DURATION_MS = 1500;

/**
 * Quanto o leque leva pra sumir depois de fechar: a transicao de saida
 * (--dur-fast, 160ms no DS) mais uma folga. Passado esse tempo o ".tm-fan"
 * volta a display:none e some do layout. Com "prefers-reduced-motion" nao ha
 * transicao nenhuma e este numero vira zero (ver aplicarEstadoDoLeque()).
 */
const LEQUE_SAIDA_MS = 220;

/**
 * Create Component
 */
const TopMenuIdle = new GUIComponent('TopMenuIdle', cssText);

/**
 * Troca cada marcador "<!--RI_ICONE:chave-->" do .html pela string SVG do
 * modulo de iconografia (UI/ri-icones.js) — mesmo padrao de DockIdle.js.
 */
TopMenuIdle.render = () => htmlText.replace(/<!--RI_ICONE:(\w+)-->/g, (_, chave) => RiIcones[chave] || '');

/**
 * Mesmo modo dos outros flutuantes RAGIDLE: scene click atravessa a UI
 * quando o mouse nao esta sobre um elemento clicavel de verdade.
 */
TopMenuIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/**
 * Fora do sistema de foco/z-index (mesmo motivo de DockIdle.js).
 */
TopMenuIdle.needFocus = false;

/**
 * @var {Preferences} estado recolhido/expandido do CLUSTER de cima.
 *
 * Versao 2.0 (a chave existe desde D-343 na 1.0): o SIGNIFICADO do booleano
 * mudou duas vezes — era "constelacao inteira recolhida", virou "nivel 2
 * fechado" e agora e "cluster de 5 recolhido". Como o valor salvo de uma
 * sessao antiga descreveria outra coisa (um jogador que fechou o nivel 2
 * ontem acharia os 5 essenciais sumidos hoje), a versao SOBE e o
 * Preferences descarta o valor antigo. O leque NAO entra aqui de proposito:
 * ele e uma porta, e porta comeca fechada toda sessao (gabarito secao 2).
 */
const _preferences = Preferences.get(
	'TopMenuIdle',
	{
		collapsed: false
	},
	2.0
);

/**
 * @var {boolean} leque aberto? Estado de sessao, nao persistido — ver acima.
 */
let _lequeAberto = false;

/**
 * @var {number|null} setTimeout que desmonta o leque no fim da animacao.
 */
let _lequeTimer = null;

/**
 * @var {number|null} setInterval handle do polling do ponto de skill.
 */
let _pollTimer = null;

/* O estado da Temporada so chegava ao abrir a janela; para a bolinha, o menu o
   pede sozinho de tempos em tempos (29/09/2026). */
const PEDIDO_DA_TEMPORADA_MS = 5 * 60 * 1000;
let _temporadaPedidaEm = 0;

/**
 * @var {number|null} setTimeout handle do toast "Em breve" em exibicao.
 */
let _toastTimer = null;

/**
 * Helper: query dentro do shadow root
 */
function _root() {
	return TopMenuIdle._shadow || TopMenuIdle._host;
}

/**
 * O usuario pediu menos movimento? Lido na hora (e nao guardado) porque a
 * preferencia do sistema pode mudar com o jogo aberto. E o CSS que decide o
 * visual; aqui isto so serve pra nao ESPERAR uma animacao que nao vai rodar.
 */
function movimentoReduzido() {
	return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/**
 * O item "Admin" aparece para quem o SERVIDOR marcou como administrador
 * (`souAdmin()`, D-1367) — e nao mais para uma conta fixa, o atalho que o
 * servidor abandonou em D-694. So esconde o item client-side; o servidor
 * aplica a restricao de verdade.
 *
 * Devolve se a visibilidade MUDOU: quem chama refaz a grade, porque as
 * colunas, as fileiras e o leque contam so os itens visiveis. O laco de
 * 250 ms chama isto sempre, porque a marca pode chegar depois do menu, e um
 * `#adjgroup` promove sem relogar.
 */
/**
 * O ITEM "Bot" (07/10/2026): so com a capacidade que o SERVIDOR anunciou no
 * `ZC_RAGIDLE_BOT`. Devolve `true` quando a visibilidade mudou (a grade e
 * refeita, como no Admin).
 */
function sincronizarItemDoBot() {
	const root = _root();
	const btn = root && root.querySelector('.tm-item-bot');
	if (!btn) {
		return false;
	}
	const display = BotMenu.temCapacidade() ? '' : 'none';
	if (btn.style.display === display) {
		return false;
	}
	btn.style.display = display;
	return true;
}

function sincronizarItemDeAdmin() {
	const root = _root();
	const adminBtn = root && root.querySelector('.tm-item-admin');
	if (!adminBtn) {
		return false;
	}
	const display = souAdmin() ? '' : 'none';
	if (adminBtn.style.display === display) {
		return false;
	}
	adminBtn.style.display = display;
	return true;
}

/**
 * One-time setup (roda uma vez, durante GUIComponent#prepare()).
 */
TopMenuIdle.init = function init() {
	const root = _root();
	root.querySelectorAll('.tm-item[data-action]').forEach(btn => {
		btn.addEventListener('click', onClickAction);
	});

	const toggle = root.querySelector('.tm-toggle');
	if (toggle) {
		toggle.addEventListener('click', onClickToggle);
	}

	const fab = root.querySelector('.tm-fab');
	if (fab) {
		fab.addEventListener('click', onClickFab);
	}
};

/**
 * Sincroniza tudo assim que o menu aparece (cobre o caso de o jogador ja ter
 * aberto uma janela por outro caminho antes dele existir), aplica o estado
 * recolhido salvo, deixa o leque fechado e liga o polling leve.
 */
TopMenuIdle.onAppend = function onAppend() {
	hideReplacedControls();
	// O interruptor do modo classico SAIU (07/10/2026): o item "Idle" foi
	// retirado do HTML com a janela, e a "Analise" de caca (sem o "Dormir")
	// volta a aparecer - ela mede a caca do Bot.
	applyCollapsedState();

	// Admin: so quem o servidor marcou como administrador ve o item (D-1367).
	// Precisa vir ANTES de distribuirColunas() e de escalonarLeque(), que
	// contam so os itens visiveis — e o laco reconfere, se a marca chegar tarde.
	sincronizarItemDeAdmin();
	sincronizarItemDoBot();

	distribuirColunas();
	distribuirFileiras();
	/* Depois de distribuir as fileiras, porque e o numero de fileiras que
	   decide a altura — e a altura decide o topo, que e o que se publica. */
	publicarTopoDoCluster();
	observarTopoDoCluster();

	_lequeAberto = false;
	aplicarEstadoDoLeque(true);

	syncAllActiveStates();
	syncSkillDot();
	syncCorreioDot();
	syncCodexDot();
	syncVotoLivre();
	syncToggleDot();
	ligarOfertaDeInstalacao();
	startPolling();
	ligarFechamentoExterno();
};

/* ═══════════════════════════════════════════════════════════════════════
   "INSTALAR APP" NO PE DA FOLHA (08/09/2026, pedido do dono)
   ═══════════════════════════════════════════════════════════════════════
   *"Sempre que o jogador entrar pelo navegador mobile, fora do PWA instalado,
   apresente um botao visivel 'Instalar app', sem bloquear a partida."*

   A porta que existia era a aba de Config — DEPOIS do login e atras de um
   menu. A tela de entrada tambem oferece (D-945), mas quem ja entrou nao volta
   la. Esta linha e a terceira porta, e a unica que o jogador ve enquanto joga.

   TODA a decisao vem de `ofertaDeInstalacao.js`: se mostrar, com que rotulo,
   e o que o clique faz. Nada disso e reescrito aqui — sao as MESMAS tres
   saidas (prompt / instrucao / nada) que a entrada e o Config ja usam. Um
   quarto lugar decidindo por conta propria seria o quarto a envelhecer.
   ═══════════════════════════════════════════════════════════════════════ */

function ligarOfertaDeInstalacao() {
	const botao = _root().querySelector('.tm-instalar');
	if (!botao) {
		return;
	}
	sincronizarOferta();
	/* A casca avisa quando o `beforeinstallprompt` chega (pode ser DEPOIS do
	   append) e quando o app foi instalado. Sem escutar, o botao decidiria uma
	   vez e ficaria com a resposta velha — visivel num app ja instalado. */
	escutarACasca(sincronizarOferta);
	botao.addEventListener('click', aoClicarInstalar);
}

/** Poe na tela o que `decidirOferta()` mandou — ou esconde a linha. */
function sincronizarOferta() {
	const root = _root();
	const botao = root && root.querySelector('.tm-instalar');
	if (!botao) {
		return;
	}
	const oferta = ofertaAtual();
	botao.hidden = !oferta.mostrar;
	if (!oferta.mostrar) {
		return;
	}
	const rotulo = botao.querySelector('.tm-instalar-rotulo');
	if (rotulo) rotulo.textContent = oferta.rotulo;
	const dica = botao.querySelector('.tm-instalar-dica');
	if (dica) {
		dica.textContent = oferta.dica;
		/* No modo `prompt` a dica e uma linha curta e cabe sempre. No modo
		   `instrucao` ela e um passo a passo, e so aparece no toque — despejar
		   um paragrafo no pe do menu seria o banner que o pedido recusou. */
		dica.hidden = oferta.modo !== 'prompt';
	}
	botao.classList.toggle('is-instrucao', oferta.modo === 'instrucao');
}

/** O clique: dispara a instalacao real, ou revela o passo a passo. */
function aoClicarInstalar(evento) {
	evento.preventDefault();
	evento.stopPropagation();
	const oferta = ofertaAtual();
	const dica = _root().querySelector('.tm-instalar-dica');

	if (oferta.modo !== 'prompt') {
		/* Sem evento do navegador nao ha o que disparar, e o botao NAO fica
		   morto: ele abre (e fecha) a explicacao do aparelho. O pedido e
		   explicito — "quando a instalacao exigir passos manuais, o botao deve
		   abrir instrucoes adequadas ao dispositivo". */
		if (dica) {
			dica.textContent = oferta.dica;
			dica.hidden = !dica.hidden;
		}
		return;
	}

	const ponte = pontePWA();
	if (!ponte) {
		return;
	}
	Promise.resolve(ponte.instalar()).then(resultado => {
		/* Sincroniza ANTES de escrever a resposta: a ordem inversa apagaria o
		   texto que acabou de ser posto (a cicatriz que a prova da tela de
		   entrada cobrou em D-945). */
		sincronizarOferta();
		if (dica) {
			dica.hidden = false;
			dica.textContent = textoDoResultado(resultado);
		}
	});
}

/**
 * Desliga o polling, os ouvintes globais de fechar a gaveta e qualquer
 * temporizador pendente quando o componente sai de cena (troca de mapa) -
 * mesmo cuidado de DockIdle.js.
 */
/**
 * A TROCA DE PERSONAGEM (auditoria pre-push, 30/09/2026): o relogio do pedido
 * da Temporada e da CONTA de 5 min, e nao do personagem. Sem zera-lo, o
 * personagem novo herdava o "ja pedi" do anterior e a bolinha ficava ate 5
 * minutos com o veredito velho.
 */
TopMenuIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	_temporadaPedidaEm = 0;
	// A gaveta do menu e a unica coisa com `is-open` aqui: o `onAppend` ja a
	// fecha ao voltar, e isto a fecha tambem no instante da troca, pela peca
	// compartilhada (portao `janela-idle-esquece-o-desenho`, repo do servidor).
	_lequeAberto = false;
	fecharEEsquecer(_root(), '.tm-fan');
};

TopMenuIdle.onRemove = function onRemove() {
	stopPolling();
	desligarFechamentoExterno();
	clearToastTimer();
	if (_lequeTimer != null) {
		clearTimeout(_lequeTimer);
		_lequeTimer = null;
	}
};

function startPolling() {
	stopPolling();
	_pollTimer = setInterval(pollEstado, POLL_INTERVAL_MS);
}

function stopPolling() {
	if (_pollTimer != null) {
		clearInterval(_pollTimer);
		_pollTimer = null;
	}
}

function clearToastTimer() {
	if (_toastTimer != null) {
		clearTimeout(_toastTimer);
		_toastTimer = null;
	}
}

/**
 * Despacha o clique de um item: "em breve" so mostra o toast (nenhum
 * pacote, nenhuma janela); os funcionais chamam o MESMO metodo publico
 * que ja abre a janela em outro lugar do fork (ver cabecalho do arquivo).
 *
 * TODO data-action daqui tem "case" abaixo, e todo "case" abre algo de
 * verdade. Isto e regra do projeto, nao zelo: ja houve botao com
 * "data-action" e "title" sem nenhum "case" no switch, e a Mochila quase
 * ficou inalcancavel. Quem somar um item soma o case junto — e clica nele.
 */
function onClickAction(e) {
	e.stopImmediatePropagation();
	const btn = e.currentTarget;

	if (btn.dataset.emBreve) {
		showToast();
		// Nao fecha o leque: nada abriu, entao nao ha nada de que sair da
		// frente -- e o jogador costuma clicar em mais de um "em breve"
		// seguido, olhando o que vem por ai.
		return;
	}

	const action = btn.dataset.action;

	switch (action) {
		case 'status':
			StatusIdle.toggle();
			break;
		case 'inventory':
			MochilaIdle.toggle();
			break;
		case 'skills':
			IdleSkills.toggle();
			break;
		case 'huntmap':
			/* Duplicacao DECLARADA com "#HuntButtonIdle" (botao sob o
			   minimapa, so em cidade) -- os dois abrem a MESMA janela,
			   pedido do dono. */
			HuntMap.toggle();
			break;
		case 'correio':
			/* CorreioIdle.toggle() tambem PEDE a caixa ao abrir (0x09e6): a
			   lista so existe no cliente depois que o servidor a manda. */
			CorreioIdle.toggle();
			break;
		case 'sistema':
			/*
			 * A JANELA DE SISTEMA do cliente (D-1479): video, audio, atalho,
			 * trocar personagem, fechar jogo. Ela so tinha a TECLA ESC como
			 * entrada, e celular nao tem ESC.
			 *
			 * `abrirPeloMenu` (e nao `_host.style.display = ''` aqui) porque a
			 * trava da morte que o `onKeyDown` respeita vale igual: com a
			 * DeathWindow na tela este menu abriria POR BAIXO do scrim dela,
			 * visivel e inerte — o defeito que o dono fotografou em 19/08/2026.
			 */
			Escape.abrirPeloMenu();
			break;
		case 'analyzer':
			/* A janela nao pede nada ao servidor ao abrir: o registro ja vem
			   sendo alimentado desde o primeiro abate da sessao, esteja ela
			   aberta ou fechada. Abrir e so passar a desenhar. */
			HuntAnalyzer.toggle();
			break;
		case 'guild':
			Guild.toggle();
			break;
		/* A JANELA AMIGOS (05/10/2026, sugestao de jogador): online/offline,
		   mensagem e convite. Entrou nos DOIS switches no mesmo commit. */
		case 'amigos':
			AmigosIdle.toggle();
			break;
		/*
		 * "Grupo" passou a abrir a NOSSA janela (D-960, 07/09/2026).
		 *
		 * Ordem do dono: *"quando a pessoa vir a nossa lista de grupos e
		 * entrar em um grupo, ela deve ficar nessa tela ate sair do grupo"* —
		 * a tela de quem esta em party e a `GrupoIdle`, e nao a janela nativa
		 * do roBrowser, que nao tem posto, rateio nem ajuste.
		 *
		 * A nativa (`PartyFriends`) NAO foi removida: ela continua sendo quem
		 * desenha o convite que CHEGA (a caixa de aceite) e a lista de amigos,
		 * e continua escutando os mesmos pacotes de party de sempre. O que
		 * mudou foi a PORTA deste item de menu.
		 *
		 * ATENCAO: existe um SEGUNDO switch neste arquivo, o `isActionOpen()`
		 * la embaixo. Este aqui ABRE; o de la acende o aro. Ja houve TRES
		 * casos de so um dos dois ser editado — os tres comentados la.
		 *
		 * D-984: o item deixou de abrir SEMPRE a mesma janela. Quem nao tem
		 * party recebia a tela de gerenciar um grupo que nao existe (nome "Sem
		 * grupo", zero membros, "Convidar" desabilitado) — e a janela que ele
		 * queria, o Localizador, so existia como um SEGUNDO item, dentro do
		 * leque. A decisao virou uma so, em `portaDoGrupo.js`, e ela le
		 * `Session.hasParty` — nunca o estado da janela de Grupo, que so chega
		 * enquanto a janela esta inscrita (o cabecalho da porta explica).
		 *
		 * O `isActionOpen()` la embaixo DERIVA da mesma decisao, em vez de
		 * repeti-la: e o comeco da "UMA tabela de acao -> {abrir, seletor}"
		 * que o proprio `isActionOpen()` pede por escrito ha tres casos.
		 */
		/*
		 * D-988: cada caminho tem o proprio botao, e este ABRE A JANELA DE
		 * GRUPO sempre — inclusive para quem nao esta em grupo nenhum, que e
		 * quem mais precisa ler a aba Postos. A porta automatica (D-984)
		 * continua viva em `portaDoGrupo.js`, so que agora ela cuida da TROCA
		 * (entrar/sair) e nao mais de decidir qual janela o menu abre.
		 */
		case 'group':
			GrupoIdle.toggle();
			break;
		// O LFG e uma janela SEPARADA da de party (D-634): a nativa mostra
		// quem ja esta no grupo, esta procura grupo para entrar.
		case 'lfg':
			LFGIdle.toggle();
			break;
		case 'admin':
			if (!souAdmin()) {
				return;
			}
			AdminPanel.toggle();
			break;
		/* O CODEX (D-851). Ele PEDE o retrato ao abrir
		   ({acao:'pedir'} em 0x0fe4): pontos, teto e bonus sao do servidor —
		   a janela nunca calcula saldo, so desenha o que chegou.
		   ATENCAO: existe um SEGUNDO switch neste arquivo, o isActionOpen()
		   la embaixo. Este aqui ABRE; o de la acende o aro. Ja houve dois
		   casos de so um dos dois ser editado (missoes e lfg) — os dois
		   comentados no proprio isActionOpen(). */
		case 'codex':
			CodexIdle.toggle();
			break;
		case 'presenca':
			/* D-1162: PresencaIdle.toggle() tambem PEDE o painel ao abrir (0x0fdf).
			   D-1589: o botao saiu do menu e o servidor nao responde mais os dois
			   verbos, entao este ramo nao e mais alcancavel pelo menu. Ele FICA
			   de proposito: e o que religar custa, e apaga-lo levaria junto o
			   import e o registro na pilha do ESC. */
			PresencaIdle.toggle();
			break;
		case 'ranking':
			RankingIdle.toggle();
			break;
		case 'indicacao':
			/* D-1164: IndicacaoIdle.toggle() tambem PEDE o painel ao abrir (0x0fdd) */
			IndicacaoIdle.toggle();
			break;
		case 'troca':
			/* 02/10/2026: a janela "Trade" - o nome do jogador e "Confirmar". */
			TrocaIdle.toggle();
			break;
		case 'bot':
			/* 07/10/2026: o menu do Bot novo (ON/OFF, cacada e ataque). */
			BotMenu.toggle();
			break;
		/* O `case 'passe'` (a janela de Recompensas, D-813) morou aqui de
		   29/08 a 21/09/2026. Saiu por ordem do dono: o Passe Semanal e o VIP
		   viraram abas da Temporada, e o botao do cluster virou "Temporada".
		   O modulo PasseIdle continua importado pelo MapEngine (e o dono do
		   pacote 0x0fe5) - so a PORTA daqui saiu, nos DOIS switches.

		   A TEMPORADA (Season 1, "Luz & Trevas", 21/09/2026). Ela PEDE os dois
		   estados ao abrir: o dela ({acao:'pedir'} em 0x0fba - preco, pity,
		   chance e o premio de uma abertura, respondido em 0x0fbb) e o do
		   Passe (0x0fe6, respondido em 0x0fe5 ao PasseIdle, que a avisa por
		   `aoReceberEstado`). A janela nunca calcula saldo, nunca recalcula
		   chance e nunca manda premio. So desenha o que chegou.
		   ATENCAO: existe um SEGUNDO switch neste arquivo, o isActionOpen() la
		   embaixo. Este aqui ABRE; o de la acende o aro. Este item entrou nos
		   DOIS no mesmo commit, que e o que o comentario do `passe` (hoje no
		   isActionOpen) manda. */
		case 'temporada':
			TemporadaIdle.toggle();
			break;
		/* VOTAR (D-1159). Ele PEDE o estado ao abrir (0x0fd4 com
		   `{acao:'pedir'}`): saldo, prazo de cada plataforma e preco sao do
		   servidor — a janela so desenha. */
		case 'voto':
			VotoIdle.toggle();
			break;
		/*
		 * O RO SHOP (22/09/2026, D-RS-03). Ate hoje esta porta abria a
		 * `CashShop` NATIVA do roBrowser (I5, 31/08/2026), com o catalogo
		 * derivado de zeny - uma segunda rota de compra com outro preco. A
		 * porta agora abre o RO Shop novo (`RoShop`), que pede o estado ao
		 * servidor em 0x0fb9 e so desenha o que chega em 0x0fb8. A janela e
		 * RAGIDLE (`.rs-window` + `is-open`), entao o aro la embaixo le
		 * `isRagIdleWindowOpen` - e entrou nos DOIS switches no mesmo commit.
		 */
		case 'roshop':
			RoShop.toggle();
			break;
		default:
			return;
	}

	/*
	 * Escolheu no leque? O leque sai da frente. Ele e uma gaveta: abriu,
	 * escolheu, fechou -- e a janela que acabou de abrir e que precisa da
	 * tela agora. No DESKTOP so vale pro leque; o cluster de cima e barra
	 * permanente e nunca se fecha sozinho.
	 *
	 * ── NO CELULAR EM PE, O CLUSTER TAMBEM FECHA (08/09/2026) ──
	 *
	 * Na HUD vertical o `.tm-top` nao e barra permanente: ele e DESENHADO
	 * DENTRO DA FOLHA (`.ri-vertical #TopMenuIdle.tm-aberto .tm-top`,
	 * TopMenuIdle.css:1311). A condicao `btn.closest('.tm-fan')` e do arranjo
	 * de desktop, e no celular ela responde `null` para os NOVE itens do
	 * cluster — entao a folha ficava aberta POR CIMA da janela que o jogador
	 * acabou de abrir, e era ela quem comia o toque.
	 *
	 * MEDIDO antes do conserto (`scripts/diag-mobile-portrait.ts`, 393x852):
	 * a folha ficou por cima em 9 das 18 janelas, e os nove sao exatamente os
	 * itens do cluster — Personagem, Mochila, Skills, Caca, Correio, Config.,
	 * Analise, Recompensas e Votar. O agregado de "quem cobre" apontava
	 * `button.tm-item` como o coberturador numero 1, com 18 ocorrencias.
	 *
	 * A licao e a de sempre neste projeto: condicao escrita para um arranjo
	 * nao acompanha o outro arranjo — quem pergunta "estou na gaveta?" tem de
	 * perguntar tambem "a gaveta e a tela inteira agora?".
	 */
	if (_lequeAberto && (btn.closest('.tm-fan') || ehCelularEmPe())) {
		fecharLeque();
	}

	updateActiveState(btn, action);
}

/**
 * Clique na alca: recolhe/traz de volta os CINCO do cluster de cima e SALVA
 * a preferencia (mesmo padrao de BasicInfoIdle.js:savePosition()). Aplica na
 * hora, sem esperar o tique de 250ms.
 */
function onClickToggle(e) {
	e.stopImmediatePropagation();
	_preferences.collapsed = !_preferences.collapsed;
	_preferences.save();
	applyCollapsedState();
	syncToggleDot();
}

/**
 * Reflete "_preferences.collapsed" no DOM: os 5 itens do cluster somem
 * (display:none, ver CSS) e a alca gira pra apontar pro lado contrario. A
 * alca NUNCA e escondida aqui -- ela e o unico caminho de volta.
 */
function applyCollapsedState() {
	const root = _root();
	const top = root.querySelector('.tm-top');
	const toggle = root.querySelector('.tm-toggle');
	if (!top || !toggle) {
		return;
	}

	const collapsed = !!_preferences.collapsed;

	/*
	 * GUARDA A ALTURA ABERTA antes de recolher (26/08/2026, pedido do dono: a
	 * alca "esta subindo" quando minimiza).
	 *
	 * Recolhido, as duas fileiras somem e a grade encolhe para os 28px da alca —
	 * entao ela saltava de y=89 para y=30, quase 60px para cima. O glifo sempre
	 * esteve centrado DENTRO do disco (medido: deslocamento 0 nos dois estados);
	 * quem se mexia era o disco inteiro.
	 *
	 * A altura e MEDIDA e nao cravada porque o numero de itens muda — este
	 * cluster ja foi de 5 a 8 em tres frentes. Guardar so quando ABERTO e o que
	 * importa: no estado recolhido a medida seria a da propria alca, e a cada
	 * ciclo de recolher/abrir o valor encolheria mais um pouco.
	 */
	if (!collapsed) {
		const altura = Math.round(top.getBoundingClientRect().height);
		if (altura > 0) {
			top.style.setProperty('--tm-altura', `${altura}px`);
		}
	}
	top.classList.toggle('is-collapsed', collapsed);
	toggle.classList.toggle('is-collapsed', collapsed);
	toggle.setAttribute('aria-expanded', String(!collapsed));

	const label = collapsed ? 'Abrir menu' : 'Recolher menu';
	toggle.title = label;
	toggle.setAttribute('aria-label', label);
}

/**
 * ─── FECHAR A GAVETA POR CLIQUE FORA E POR ESC ───────────────────────────
 *
 * O leque e uma GAVETA: o gabarito diz que o expandido "aparece e some", e um
 * bloco de 198x454 plantado sobre a cena enquanto o jogador anda nao e "some".
 * Ate a rodada 2 so o proprio botao Menu fechava, e isso era pouco.
 *
 * POR QUE UM OUVINTE GLOBAL AQUI NAO REPETE O BUG DE VAZAMENTO DE CLIQUE (o
 * conserto de 19/08, que ate deixou um gate proprio): aquele defeito era a UI
 * deixando o evento CHEGAR AO MUNDO por um caminho errado — direcao UI -> jogo.
 * Este ouvinte anda na direcao oposta: ele so OBSERVA. Nao chama
 * preventDefault, nao chama stopPropagation, nao chama
 * stopImmediatePropagation e nao reencaminha nada. O evento segue exatamente
 * o mesmo caminho que seguiria se este codigo nao existisse — e por isso o
 * clique no chao continua ANDANDO com o personagem enquanto a gaveta se
 * fecha. As duas coisas na mesma medicao, e e assim que a prova confere.
 *
 * "composedPath()" e nao "event.target": alvo de evento que nasce dentro de
 * Shadow DOM chega RETARGETADO (vira o host), entao "target" nao sabe dizer
 * se o clique caiu num item do leque ou no disco de outro componente. O
 * caminho composto atravessa as fronteiras de sombra e e a mesma tecnica que
 * a guarda central do projeto usa.
 *
 * "pointerdown" na fase de CAPTURA: captura e a primeira fase a rodar, entao
 * nenhum outro ouvinte consegue esconder o evento de nos parando a
 * propagacao antes. E "pointerdown" (e nao "click") cobre mouse e toque com
 * um ouvinte so, e fecha no comeco do gesto — que e quando o jogador ja
 * decidiu.
 *
 * ESC: fecha a gaveta e mais nada. O ESC nativo (Escape.js, a janela de
 * sistema) NAO e consumido de proposito — alem da regra de nao consumir, e
 * ele que carrega a regra de "morto nao abre menu nenhum"; se este ouvinte
 * comesse a tecla, essa regra passaria a depender daqui.
 */
function ligarFechamentoExterno() {
	desligarFechamentoExterno();
	window.addEventListener('pointerdown', onPointerDownGlobal, true);
	window.addEventListener('keydown', onKeyDownGlobal, true);
}

function desligarFechamentoExterno() {
	window.removeEventListener('pointerdown', onPointerDownGlobal, true);
	window.removeEventListener('keydown', onKeyDownGlobal, true);
}

/**
 * O clique caiu DENTRO do canto do menu (o botao Menu ou o leque)? Se caiu,
 * quem decide o que acontece e o proprio botao; se caiu fora, a gaveta sai da
 * frente.
 */
function onPointerDownGlobal(e) {
	if (!_lequeAberto) {
		return;
	}

	// Sem composedPath nao da pra saber se o clique caiu dentro do proprio
	// menu, e fechar no escuro faria o botao Menu se auto-cancelar (fecha no
	// pointerdown, reabre no click). Na duvida, nao fecha: o botao continua
	// sendo o caminho garantido.
	if (typeof e.composedPath !== 'function') {
		return;
	}

	/*
	 * ── O CLUSTER TAMBEM E "DENTRO DO MENU" NO CELULAR (09/09/2026) ──
	 *
	 * RELATO DO DONO: *"ao clicar no menu azul com 3 linhas ele abre a janela
	 * com os icones (...) o clique esta 'vazando' para tras do menu e movendo
	 * o personagem, em vez de registrar o clique no icone do menu"*.
	 *
	 * A CAUSA e a estrutura: `.tm-fan` e `.tm-fab` moram DENTRO de `.tm-menu`,
	 * mas `.tm-top` — o cartao com Personagem, Mochila, Skills, Caca,
	 * Recompensas, Correio, Config., Analise e Votar — e IRMAO dele. No
	 * desktop isso esta certo: la o cluster e barra permanente, fora da
	 * gaveta, e tocar nele DEVE fechar a gaveta.
	 *
	 * No celular o cluster e desenhado DENTRO da folha
	 * (`.ri-vertical #TopMenuIdle.tm-aberto .tm-top`, TopMenuIdle.css:1311).
	 * Entao tocar num daqueles nove icones caia aqui como "fora do menu": a
	 * folha fechava no `pointerdown`, e o `click` seguinte — que vem DEPOIS —
	 * chegava no que tivesse sobrado sob o dedo, que e a CENA. Dai o boneco
	 * andar e a janela nao abrir.
	 *
	 * MEDIDO (`scripts/diag-menu-lateral.ts`, clique por COORDENADA e nao
	 * `.click()` no elemento): no celular em pe, **2 de 9** icones
	 * funcionavam, e um deles registrou o pedido de andar. No desktop, 9 de 9.
	 *
	 * E A MESMA FAMILIA DA CORRECAO DE 08/09 — la a pergunta era
	 * `btn.closest('.tm-fan')` para decidir FECHAR a folha depois de escolher;
	 * aqui e `.tm-menu` para decidir NAO fechar antes. As duas eram testes de
	 * DOM escritos para o arranjo de desktop, e as duas erram no celular pelo
	 * mesmo motivo: la o cluster mudou de lugar. Consertei uma e nao procurei
	 * a irma — e ela e que o jogador sentiu.
	 */
	const noCelular = ehCelularEmPe();
	const caminho = e.composedPath();
	for (let i = 0; i < caminho.length; i++) {
		const no = caminho[i];
		// Window/Document/ShadowRoot nao tem classList: so elemento interessa.
		if (!no || !no.classList) {
			continue;
		}
		if (no.classList.contains('tm-menu')) {
			return;
		}
		if (noCelular && no.classList.contains('tm-top')) {
			return;
		}
	}

	fecharLeque();
}

function onKeyDownGlobal(e) {
	if (!_lequeAberto) {
		return;
	}
	if (e.key === 'Escape' || e.key === 'Esc') {
		fecharLeque();
	}
}

/**
 * Clique no botao Menu: abre ou fecha o leque.
 */
function onClickFab(e) {
	e.stopImmediatePropagation();
	if (_lequeAberto) {
		fecharLeque();
	} else {
		abrirLeque();
	}
}

function abrirLeque() {
	_lequeAberto = true;
	aplicarEstadoDoLeque(false);
}

function fecharLeque() {
	_lequeAberto = false;
	aplicarEstadoDoLeque(false);
	// O toast mora fora do leque, mas se ele estiver de pe quando a gaveta
	// fecha, some junto: ele so faz sentido no contexto do que foi clicado.
	hideToastNow();
}

/**
 * Poe o leque no estado de "_lequeAberto".
 *
 * A dancinha das duas classes existe por uma limitacao real do navegador:
 * nada anima saindo de "display:none". Entao ABRIR e (1) montar
 * (".is-mounted" -> display:flex), (2) forcar um reflow lendo offsetWidth,
 * (3) so entao ligar ".is-open", que e o que a transicao persegue. FECHAR e
 * o contrario: tira ".is-open", espera a transicao e so ai desmonta.
 *
 * Desmontar de verdade importa: enquanto o leque fica montado ele tem CAIXA
 * na tela, e caixa invisivel sobre o mundo e a familia de defeito que o gate
 * de clique existe pra pegar (ver o cabecalho do CSS).
 *
 * @param {boolean} imediato pula a animacao (usado no onAppend, quando o
 *        leque nasce fechado e nao ha nada a animar).
 */
function aplicarEstadoDoLeque(imediato) {
	const root = _root();
	const fan = root.querySelector('.tm-fan');
	const fab = root.querySelector('.tm-fab');
	if (!fan || !fab) {
		return;
	}

	if (_lequeTimer != null) {
		clearTimeout(_lequeTimer);
		_lequeTimer = null;
	}

	fab.classList.toggle('is-open', _lequeAberto);
	/* D-939: a HUD vertical desenha o menu aberto como FOLHA (cluster +
	   leque em cartoes), e o CSS dela le esta classe no elemento raiz — o
	   mesmo gesto que abre o leque e o que muda a apresentacao, sem um
	   segundo estado para dessincronizar. Fora da vertical a classe existe e
	   nao casa com regra nenhuma. */
	const raizVertical = _root().querySelector('#TopMenuIdle');
	if (raizVertical) {
		raizVertical.classList.toggle('tm-aberto', _lequeAberto);
	}
	/* Ainda D-939: com a folha aberta o menu precisa flutuar sobre o CHAT,
	   que e needFocus e ganha z ~60-70 do gerenciador de foco (o rodape do
	   leque aparecia com a caixa de digitar por cima, medido em foto). So
	   inline-important vence a regra `z-index: 55 !important` do Common.css
	   — e ela precisa continuar existindo para o fab nao voltar a nascer
	   atras da barra do topo. Fora do celular em pe, nada disto roda. */
	if (ehCelularEmPe() && TopMenuIdle._host) {
		if (_lequeAberto) {
			TopMenuIdle._host.style.setProperty('z-index', '90', 'important');
		} else {
			TopMenuIdle._host.style.removeProperty('z-index');
			TopMenuIdle._host.style.zIndex = '50';
		}
	}
	fab.setAttribute('aria-expanded', String(_lequeAberto));
	fab.title = _lequeAberto ? 'Fechar menu' : 'Menu';
	fab.setAttribute('aria-label', fab.title);

	if (_lequeAberto) {
		escalonarLeque(fan);
		fan.classList.add('is-mounted');
		// Leitura que forca o reflow -- sem ela o navegador junta "montar" e
		// "abrir" no mesmo quadro e a transicao nao acontece.
		void fan.offsetWidth;
		/*
		 * A CONTA DA DOCA VEM DEPOIS DO `is-mounted` (D-1495, 15/09/2026), e a
		 * ordem e o conserto inteiro.
		 *
		 * Ela morava 30 linhas acima, ANTES desta linha, e por isso media o menu
		 * FECHADO: 198px de `min-width`, enquanto o leque aberto tem o dobro ou
		 * mais. Em 1024x768 o menu fechado comeca em x=810 e a doca termina em
		 * x=696 — "nao cruzam", decidia ela, e nao levantava nada; um quadro
		 * depois o leque montava com 2 colunas por lado, o menu passava a comecar
		 * em x=607, e os 89px de encosto que a prova mede apareciam. Ninguem
		 * refazia a conta: nao ha `ResizeObserver` na doca nem `rAF` aqui.
		 *
		 * O `void fan.offsetWidth` logo acima ja forcou o reflow por outro motivo
		 * (a transicao), entao a caixa lida aqui e a definitiva. Duas razoes pelo
		 * preco de uma leitura.
		 */
		afastarMenuDaDoca(root);
		fan.classList.add('is-open');
		return;
	}

	fan.classList.remove('is-open');

	const espera = imediato || movimentoReduzido() ? 0 : LEQUE_SAIDA_MS;
	if (espera === 0) {
		fan.classList.remove('is-mounted');
		afastarMenuDaDoca(root);
		return;
	}
	_lequeTimer = setTimeout(() => {
		fan.classList.remove('is-mounted');
		// O menu FECHADO e estreito e quase nunca cruza a doca: sem esta chamada
		// ele ficaria levantado para sempre depois da primeira abertura, ocupando
		// altura que o minimapa e os botoes de caca querem. A conta e a mesma; o
		// que mudou foi a largura do sujeito.
		afastarMenuDaDoca(root);
		_lequeTimer = null;
	}, espera);
}

/**
 * Reparte os itens do leque nas DUAS COLUNAS, com a carga dividida ao meio.
 *
 * Por que isto e JS e nao HTML fixo: o item de Admin so existe para a conta
 * dona (ver onAppend()). Com ele sao 11 itens, sem ele sao 10 — e "10 vira 5
 * e 5" e literalmente o que o dono pediu. Um corte cravado no HTML acertaria
 * um dos dois casos e erraria o outro, deixando 6/4 para todo jogador que
 * nao e o dono.
 *
 * A COLUNA DA ESQUERDA E QUE LEVA O ITEM A MAIS quando o total e impar
 * (Math.ceil). Ela e a primeira da ordem de leitura, e coluna que comeca a
 * leitura nunca deve ser a mais curta: uma primeira coluna curta seguida de
 * uma longa se le como erro de montagem, enquanto o contrario se le como uma
 * lista que acabou. E a mesma regra de balanceamento de colunas de texto.
 *
 * O item ESCONDIDO (Admin, fora da conta dona) continua no DOM e vai junto
 * com os vizinhos, mas NAO conta para achar o meio -- senao a coluna da
 * esquerda ficaria com um buraco invisivel de um item.
 *
 * A ORDEM CANONICA e a ordem do documento (coluna A e depois a B), e ela
 * sobrevive a cada passagem: cada item e reinserido nessa mesma ordem, entao
 * chamar isto duas vezes da o mesmo resultado.
 */
/**
 * Quantas COLUNAS o cluster de cima tem — ou seja, onde ele quebra em duas
 * fileiras (26/08/2026, pedido do dono: "esta ficando muito grande essa
 * fileira, divida ela em 2").
 *
 * A conta e a metade dos itens VISIVEIS, arredondada para cima, e ela mora no
 * JS pelo mesmo motivo que a divisao das colunas do leque: o numero de itens
 * MUDA. Este cluster ja foi de 5 para 6, para 7 e para 8 em tres frentes
 * diferentes, e um "4" cravado no CSS acertaria hoje e erraria no proximo
 * botao que alguem somar.
 *
 * Item escondido nao entra na conta: se entrasse, uma fileira nasceria com
 * buraco. O piso e 1 porque zero coluna nao existe em grade.
 */
function distribuirFileiras() {
	const root = _root();
	if (!root) {
		return;
	}
	const topo = root.querySelector('.tm-top');
	if (!topo) {
		return;
	}
	const visiveis = [...topo.querySelectorAll('.tm-item')].filter(item => item.style.display !== 'none');
	/*
	 * D-930 — CELULAR DEITADO PEDE TRES COLUNAS, e a decisao tem de morar
	 * AQUI e nao no CSS: esta linha escreve `--tm-colunas` como estilo INLINE,
	 * e estilo inline vence folha de estilo. Uma regra `@media` no
	 * `TopMenuIdle.css` seria escrita, lida e ignorada — o tipo de conserto
	 * que parece feito e nao esta.
	 *
	 * Por que tres: com quatro colunas a fileira dupla mede ~271px e, ancorada
	 * ao lado do minimapa num aparelho de 667px, a borda esquerda dela cai em
	 * x=232 — DENTRO do painel de personagem, que vai ate 259 (medido). Com
	 * tres colunas sao ~200px e os dois deixam de se tocar.
	 *
	 * O criterio de tela e o mesmo `max-height: 439px` das faixas do
	 * `Common.css` (D-929), lido por `matchMedia` para o JS e o CSS nunca
	 * discordarem sobre o que e "deitado".
	 */
	const deitado =
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(max-height: 439px)').matches
			: false;
	/*
	 * O TETO DE CINCO COLUNAS — era QUATRO ate 08/09/2026, e a troca tem dono
	 * e medicao.
	 *
	 * O teto nasceu em D-1159 para impedir que o NONO item (o "Votar") abrisse
	 * uma quinta coluna com o "Recompensas" sozinho nela: a grade tem colunas
	 * `auto`, a largura de cada uma e a do ROTULO mais largo dela, e
	 * "Recompensas" e o rotulo mais largo do cluster inteiro. Medido em D-944,
	 * o cluster REPROVA o `prove:hud-responsiva` em tablet-768x1024 quando
	 * passa de ~359px (ele monta em cima do painel de personagem).
	 *
	 * Em 08/09 o dono pediu o "Votar" ao lado do "Caca", com a vaga de baixo
	 * livre para o proximo botao. Isso reordenou o DOM (ver TopMenuIdle.html) e
	 * mudou QUEM mora na quinta coluna: agora e o proprio "Votar", um dos
	 * rotulos mais CURTOS, e nao o "Recompensas" — que continua na coluna 1,
	 * embaixo do "Personagem", que e onde a regra de D-944 manda o rotulo mais
	 * longo morar. O perigo que o teto de quatro cobria deixou de existir nesta
	 * ordem; o que o teto ainda faz e impedir uma SEXTA coluna no dia em que o
	 * cluster passar de dez itens.
	 *
	 * ─── E POR QUE A QUINTA COLUNA SO NASCE ACIMA DE 900px ──────────────────
	 * Porque a quinta coluna FOI MEDIDA, e ela nao cabe em tudo. Com ela o
	 * cluster passa de 333px para 403px, e o `prove:hud-responsiva` reprovou em
	 * **tablet-768x1024** com "BasicInfoIdle x TopMenuIdle.tm-top (57x146px)" —
	 * exatamente o defeito que o teto de quatro tinha sido criado para impedir.
	 * A mesma prova, na mesma rodada, com a ordem antiga: 23 falhas (todas
	 * anteriores a esta frente); com cinco colunas em toda tela: 24, e a nova
	 * era essa.
	 *
	 * 57px de sobreposicao em 768 pedem ~830px para zerar; 900 e o degrau
	 * seguro, e e onde a HUD de mouse ja encolheu o bastante (`--ui-escala` 0,78
	 * em 900x600) para o cluster caber com folga. Abaixo disso o teto volta a
	 * ser quatro e o "Votar" desce para a terceira fileira sozinho — a HUD
	 * refluindo em tela estreita, que e o que ela ja faz com `deitado ? 3`.
	 *
	 * O criterio e `matchMedia` e nao `@media` no CSS pelo motivo de D-930:
	 * esta linha escreve `--tm-colunas` como estilo INLINE, e inline vence
	 * folha — uma regra de media no CSS seria escrita, lida e ignorada.
	 *
	 * Com oito itens ou menos nada muda: `ceil(8/2)` ja e 4.
	 */
	const largo =
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(min-width: 900px)').matches
			: true;
	const teto = deitado ? 3 : largo ? 5 : 4;
	const colunas = Math.min(teto, Math.max(1, Math.ceil(visiveis.length / 2)));
	topo.style.setProperty('--tm-colunas', String(colunas));
	/*
	 * O MESMO numero, em atributo, para o CSS conseguir PERGUNTAR por ele.
	 *
	 * `--tm-colunas` serve para CONTAR (o `repeat()` da grade o consome), mas
	 * nenhum seletor consegue ramificar pelo VALOR de uma custom property sem
	 * `@container style()`, que e recente demais para o fork depender dela. O
	 * atributo resolve isso com um seletor comum, e e o que permite ao "Votar"
	 * subir para a primeira fileira SO quando ha cinco colunas — sem mexer na
	 * ordem do DOM, que e o que mantem o arranjo de quatro colunas identico ao
	 * que ja passava no `prove:hud-responsiva` (ver o bloco do "Votar" em
	 * TopMenuIdle.html).
	 */
	topo.dataset.colunas = String(colunas);
}

/**
 * O CLUSTER PUBLICA ONDE ELE COMECA (D-930, 05/09/2026).
 *
 * Em tela estreita ele deixou de morar logo abaixo do painel e passou a se
 * ancorar na pilha do rodape (ver `TopMenuIdle.css`, fim do arquivo). Com
 * isso ele passou a subir quando o rodape cresce — e quem mora ENTRE o painel
 * e ele, o rastreador de missoes, nao tinha como saber onde parar. Medido em
 * 360x640: 190x54px de sobreposicao entre os dois.
 *
 * Ele publica o proprio TOPO, em pixels da viewport, e o rastreador usa esse
 * numero como teto (`MissoesTrackerIdle.css`). E o mesmo idioma do painel de
 * personagem (`--hud-basic-fundo`) e do chat (`--hud-chat-altura`): geometria
 * medida vira custom property no `documentElement`, que atravessa shadow DOM.
 *
 * A alternativa era o rastreador subtrair a altura do cluster com um numero
 * proprio — e a altura dele muda com o numero de itens visiveis (o Admin so
 * aparece para a conta dona) e com o numero de colunas. Copiar esse numero
 * seria a armadilha que criou todos estes tokens.
 */
/** O ultimo valor publicado em `--hud-cluster-topo` (ver a guarda abaixo). */
let _topoPublicado = null;

function publicarTopoDoCluster() {
	const root = _root();
	const topo = root && root.querySelector('.tm-top');
	if (!topo || !topo.ownerDocument) {
		return;
	}
	const caixa = topo.getBoundingClientRect();
	if (caixa.height < 1) {
		return;
	}
	/* D-934: unidade da HUD. Ver `emUnidadesDaHud`. */
	const valor = `${Math.round(emUnidadesDaHud(caixa.top))}px`;
	/*
	 * SO PUBLICA QUANDO MUDA (07/09/2026, frente de FPS).
	 *
	 * `setProperty` no `documentElement` invalida o estilo de TODO descendente
	 * que use `var()`, e esta funcao republicava o MESMO numero 4x por segundo,
	 * vindo do tique. A geometria do cluster muda em evento raro — recolher a
	 * HUD, girar o aparelho, redimensionar a janela —, entao a guarda
	 * transforma trabalho constante em trabalho por evento.
	 */
	/* A ALTURA vem ANTES da guarda do topo, e isso não é estilo: o cluster
	   pode ganhar uma fileira sem mudar de topo (ele é ancorado no alto), e
	   sair pelo `return` de baixo deixaria a altura velha publicada — que é o
	   defeito exato que ela existe para tapar. */
	publicarAlturaDoCluster(topo, caixa);
	if (valor === _topoPublicado) {
		return;
	}
	_topoPublicado = valor;
	topo.ownerDocument.documentElement.style.setProperty('--hud-cluster-topo', valor);
}

let _alturaPublicada = null;

/*
 * A ALTURA DO CLUSTER, MEDIDA (08/09/2026).
 *
 * ─── O DEFEITO ──────────────────────────────────────────────────────────
 * `--vr-menu-cluster-altura` estava CRAVADA em 172px no CSS
 * (TopMenuIdle.css:1350), e é dela que sai o `top` da folha do leque. Com a
 * folha aberta no celular, o cluster desenha os NOVE itens numa grade de 4
 * colunas — três fileiras — e passa de 172px. A folha então começa ACIMA de
 * onde o cluster termina, e a primeira fileira dela fica ATRÁS do cartão do
 * cluster.
 *
 * MEDIDO com o jogo de pé (`npm run prove:mobile-vertical`, nas três telas):
 * o item **Guilda** — o primeiro da folha — respondia `button.tm-item` e
 * `span.tm-label` no `elementFromPoint`. Ele estava desenhado, "visível" para
 * o DOM, e nenhum dedo o alcançava. É o mesmo defeito que a foto de 393x852
 * já mostrava: "Guilda Amigos Grupo Admin" aparecendo cortado por baixo da
 * borda do cartão de cima.
 *
 * ─── POR QUE MEDIR, E NÃO SÓ AUMENTAR O NÚMERO ──────────────────────────
 * Porque a altura do cluster MUDA: com o item de Admin são 11 itens, sem ele
 * são 10; recolher a HUD muda; a largura da tela muda quantos cabem por
 * fileira. Trocar 172 por 220 acertaria hoje e erraria na próxima vez que
 * alguém somasse um item de menu — que é exatamente como o 172 envelheceu.
 * O arquivo ao lado já ensina isso por escrito: *"A altura e MEDIDA e nao
 * cravada porque o numero de itens muda"* (o comentário do `applyCollapsedState`).
 *
 * Ela pega carona no `publicarTopoDoCluster`: mesmo `ResizeObserver`, mesma
 * guarda de "só publica quando muda" (D-958, a frente de FPS), mesma unidade
 * da HUD. Um observador novo seria trabalho repetido para o mesmo evento.
 */
function publicarAlturaDoCluster(topo, caixa) {
	const valor = `${Math.round(emUnidadesDaHud(caixa.height))}px`;
	if (valor === _alturaPublicada) {
		return;
	}
	_alturaPublicada = valor;
	topo.ownerDocument.documentElement.style.setProperty('--vr-menu-cluster-altura', valor);
}

let _observadorDoCluster = null;
function observarTopoDoCluster() {
	if (_observadorDoCluster || typeof ResizeObserver === 'undefined') {
		return;
	}
	const root = _root();
	const topo = root && root.querySelector('.tm-top');
	if (!topo) {
		return;
	}
	/* O que muda a posicao do cluster e a caixa dele (recolher, mudar de
	   fileiras) OU a viewport — e as duas passam por um resize do proprio
	   elemento, porque ele e ancorado na borda. Um `setInterval` aqui seria
	   trabalho constante para um evento raro. */
	_observadorDoCluster = new ResizeObserver(() => publicarTopoDoCluster());
	_observadorDoCluster.observe(topo);
	if (typeof window !== 'undefined') {
		window.addEventListener('resize', publicarTopoDoCluster);
		/*
		 * O ARRANJO TAMBEM E REFEITO NO `resize` (D-1490, 15/09/2026).
		 *
		 * Ate aqui o unico ouvinte de `resize` do arquivo era o de cima, que so
		 * republica a posicao do cluster. `distribuirFileiras` (as colunas do
		 * cluster) e `distribuirColunas` (as do leque) rodavam SO na montagem e
		 * na troca de visibilidade do Admin — entao quem abrisse o jogo numa
		 * janela grande e a encolhesse ficava com o arranjo da largada para
		 * sempre, e o leque voltava a invadir a coluna da direita sem nada
		 * recalcular.
		 *
		 * As duas sao baratas (percorrem ~24 botoes e mexem em variaveis de
		 * CSS) e o `resize` do navegador ja e limitado ao quadro.
		 */
		window.addEventListener('resize', () => {
			distribuirFileiras();
			distribuirColunas();
		});
	}
}

/* ─── O LEQUE CABE NA ALTURA (D-1490, 15/09/2026) ───────────────────────────
 *
 * Relato do dono, com print: os discos do menu caem EM CIMA do minimapa e dos
 * botoes "Cacar"/"Retornar para Prontera".
 *
 * **A causa e ALTURA, e nao largura** — medido antes de consertar. O leque
 * cresce PARA CIMA a partir do botao Menu, 60px por fileira, e o numero de
 * fileiras era sempre `ceil(visiveis / 2)`, sem olhar para a tela. Com as 15
 * entradas de hoje (a conta dona ve o Admin) sao 8 fileiras = 566px, e o topo
 * do leque para a 667px do chao. A coluna da direita esta ocupada ate 288px do
 * TOPO. Numa tela de 898 o topo do leque cai em y=231 e invade os botoes por
 * 57px; num notebook de 768 ele cobre o minimapa inteiro.
 *
 * **A CSS tinha uma prova de que cabia, e ela errava duas vezes** (o comentario
 * em `TopMenuIdle.css`): dizia base de 39px quando sao 101 (esquecia o disco do
 * Menu e o respiro), e 6 fileiras quando hoje sao 8. 202px de erro, no unico
 * eixo do projeto que nao tem media query nenhuma — a maior altura vigiada em
 * todo o CSS e `max-height: 699px`.
 *
 * O conserto escolhido pelo dono entre tres: **mais colunas quando a tela e
 * baixa**, em vez de rolar a folha (que cortaria o veu de contraste atras dos
 * discos) ou encolher os discos. Duas colunas por lado viram 4 no total, as 8
 * fileiras caem para 4, e o leque passa a ocupar 286px — cabe com folga onde
 * antes invadia.
 *
 * POR QUE EM JS E NAO NUMA MEDIA QUERY: o numero de fileiras depende de quantos
 * itens estao VISIVEIS, e isso muda com a conta (o Admin some para quem nao e o
 * dono) e com o que o jogo libera. Uma media query so sabe da tela, entao ela
 * teria de assumir o pior caso e alargar o menu para todo mundo, sempre.
 */
const BASE_DO_LEQUE = 101;
const ALTURA_DA_FILEIRA = 60;
const RESPIRO_DA_FILEIRA = 10;
const TOPO_DO_LEQUE = 16;
/** O leque nao passa de 3 colunas por lado: seis discos de largura ja e um painel. */
const MAXIMO_DE_COLUNAS_POR_LADO = 3;

/**
 * Onde o menu descansa quando nao ha doca no caminho (`afastarMenuDaDoca`).
 *
 * Era 16 ate 16/09/2026 — pedido do dono, olhando o botao aberto: "um pouco
 * mais para baixo". So o numero mudou; a logica de desviar da doca continua a
 * mesma.
 */
const BASE_DO_MENU_NO_CHAO = 8;
/**
 * O vao entre o pe do menu levantado e o topo da barra de atalhos.
 *
 * E o mesmo 8 da escada do rodape que o `Common.css` publica
 * (`--hud-acima-da-doca: calc(var(--hud-doca-altura) + 8px + ...)`), escrito
 * aqui porque o degrau desta funcao e MEDIDO e nao herdado daquele token — ver
 * o cabecalho de `afastarMenuDaDoca` para o porque.
 */
const RESPIRO_ACIMA_DA_DOCA = 8;

/**
 * Quantas colunas cada metade do leque precisa para caber na altura livre.
 *
 * @param {number} porLado quantos itens visiveis a metade mais cheia tem
 * @returns {number} 1 (o de sempre) ate `MAXIMO_DE_COLUNAS_POR_LADO`
 */
/**
 * Quantas fileiras de disco cabem entre o botao Menu e a coluna da direita.
 *
 * Extraida porque tem DOIS leitores agora (o numero de colunas e o teto de
 * rolagem do caso impossivel), e duas copias da mesma conta divergem na
 * primeira vez que alguem mexe numa delas.
 */
function fileirasQueCabemNaAltura() {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return Number.POSITIVE_INFINITY;
	}
	/*
	 * `--hud-td-abaixo-da-coluna` e publicado pelo `Common.css` e ja significa
	 * exatamente "a partir daqui a coluna da direita esta livre" — ele soma o
	 * minimapa, o respiro e os botoes de caca, inclusive quando a altura dos
	 * botoes e REMEDIDA em tempo de execucao. Repetir 288 aqui seria assinar um
	 * numero que muda noutro arquivo.
	 */
	const publicado = parseFloat(
		getComputedStyle(document.documentElement).getPropertyValue('--hud-td-abaixo-da-coluna'),
	);
	const ocupadoAcima = Number.isFinite(publicado) && publicado > 0 ? publicado : 288;
	const livre = window.innerHeight - BASE_DO_LEQUE - ocupadoAcima;
	return Math.floor((livre - TOPO_DO_LEQUE + RESPIRO_DA_FILEIRA) / (ALTURA_DA_FILEIRA + RESPIRO_DA_FILEIRA));
}

function colunasPorLadoDoLeque(porLado) {
	if (porLado <= 0 || typeof window === 'undefined') {
		return 1;
	}
	/*
	 * `--hud-td-abaixo-da-coluna` e publicado pelo `Common.css` e ja significa
	 * exatamente "a partir daqui a coluna da direita esta livre" — ele soma o
	 * minimapa, o respiro e os botoes de caca, inclusive quando a altura dos
	 * botoes e REMEDIDA em tempo de execucao. Repetir 288 aqui seria assinar um
	 * numero que muda noutro arquivo.
	 */
	const fileirasQueCabem = fileirasQueCabemNaAltura();
	if (fileirasQueCabem >= porLado) {
		return 1; // cabe em coluna unica: nada muda
	}
	for (let colunas = 2; colunas <= MAXIMO_DE_COLUNAS_POR_LADO; colunas++) {
		if (Math.ceil(porLado / colunas) <= fileirasQueCabem) {
			return colunas;
		}
	}
	/*
	 * Nem no maximo cabe (janela muito baixa). Devolve o maximo mesmo assim: o
	 * leque ainda encolhe bastante, e sobrepor menos e melhor que sobrepor
	 * tudo. Tela abaixo disso ja cai nas faixas de `max-height: 439px`, que
	 * mexem no arranjo inteiro.
	 */
	return MAXIMO_DE_COLUNAS_POR_LADO;
}

/**
 * O BOTAO MENU FICA NO MESMO LUGAR, ABERTO OU FECHADO (21/09/2026 — relato do
 * dono, com print: *"quando voce clica no menu, ele sai do canto e vem para o
 * meio... e quando esta fechado, o botao fica la no canto. Eu quero que esse
 * botao fique sempre centralizado"*).
 *
 * O `.tm-menu` ja tinha `min-width: 198px` EXATAMENTE para isso, e o
 * comentario dele no CSS diz o que a peca promete: *"o botao ocupa a MESMA
 * posicao aberto ou fechado"*. Ela cumpria a promessa enquanto o leque tinha
 * a largura de 24/08/2026 — UMA coluna por lado, os 198px cravados.
 *
 * D-1490 (15/09/2026) deu ao leque ate TRES colunas por lado quando a altura
 * da janela nao comporta a fileira unica, e ai ele passa dos 198. O container
 * cresce ao abrir, o `align-items: center` recentra o botao na largura NOVA, e
 * o botao anda. **O piso virou um numero que descreve um arranjo que nao e
 * mais o unico** — a mesma familia de cicatriz que este projeto registra em
 * varios lugares: constante que era verdade quando foi escrita.
 *
 * Entao o piso passa a ser MEDIDO, e nao cravado. A medicao acontece aqui
 * porque e aqui que a largura muda: `distribuirColunas` e quem decide o numero
 * de colunas, e ela ja roda no `onAppend`, no `resize` e quando o item Admin
 * aparece.
 *
 * MEDIR EXIGE MONTAR: fechado o leque e `display:none` e nao tem caixa (e o
 * `display:none` FICA — o cabecalho do CSS explica por que `opacity:0` seria
 * pior, e o gate de clique existe por causa disso). Entao a funcao monta,
 * mede e desmonta no MESMO quadro, sem ceder o fio: nenhuma pintura acontece
 * no meio, e sem `.is-open` os discos e o veu seguem em `opacity: 0`.
 *
 * ELA ESCREVE UMA VARIAVEL, E NUNCA `min-width` INLINE. O celular (`max-width:
 * 599px`) e a HUD vertical (`.ri-vertical`) zeram o piso de PROPOSITO — la os
 * 198px comiam metade da tela e o botao caia sobre a barra do chat (I1). Um
 * `style.minWidth` venceria as duas regras e desfaria aquilo calado; a
 * variavel respeita o `min-width: 0` delas, que e literal.
 */
function fixarLarguraDoMenu() {
	const root = _root();
	const menu = root.querySelector('.tm-menu');
	const fan = root.querySelector('.tm-fan');
	if (!menu || !fan) {
		return;
	}

	const jaMontado = fan.classList.contains('is-mounted');
	if (!jaMontado) {
		fan.classList.add('is-mounted');
	}
	const largura = Math.ceil(fan.getBoundingClientRect().width);
	if (!jaMontado) {
		fan.classList.remove('is-mounted');
	}

	/*
	 * Zero quer dizer que o componente ainda nao esta no documento (a medicao
	 * de elemento desanexado devolve 0). Escrever o zero trocaria o piso de
	 * 198 por nada; ficar quieto deixa o padrao do CSS valer ate a proxima
	 * chamada, que vem no `resize` ou no tique do Admin.
	 */
	if (largura > 0) {
		menu.style.setProperty('--tm-largura-do-menu', `${largura}px`);
	}
}
function distribuirColunas() {
	const root = _root();
	const fan = root.querySelector('.tm-fan');
	const colA = root.querySelector('.tm-col--a');
	const colB = root.querySelector('.tm-col--b');
	if (!fan || !colA || !colB) {
		return;
	}

	const itens = Array.prototype.slice.call(fan.querySelectorAll('.tm-item'));
	const visiveis = itens.filter(item => item.style.display !== 'none').length;
	const naEsquerda = Math.ceil(visiveis / 2);

	let contados = 0;
	itens.forEach(item => {
		const destino = contados < naEsquerda ? colA : colB;
		destino.appendChild(item);
		if (item.style.display !== 'none') {
			contados++;
		}
	});

	// A metade MAIS CHEIA manda: as duas colunas dividem a mesma altura.
	const colunas = colunasPorLadoDoLeque(naEsquerda);
	fan.style.setProperty('--tm-leque-colunas', String(colunas));
	/*
	 * TRES COLUNAS POR LADO APERTAM OS VAOS (07/10/2026). Em 900x600 o leque
	 * de seis colunas media 514px e, ancorado pela direita, passava 40px por
	 * cima do chat e 5px por cima da barra de atalhos (`prove:hud-responsiva`).
	 * Os numeros do aperto moram no CSS (`.tm-fan--denso`); aqui so se decide
	 * QUANDO — e ANTES de `fixarLarguraDoMenu`, que mede o piso do botao Menu
	 * no leque ja apertado. No celular em pe o leque vira o CARTAO (D-939),
	 * com grade e respiro proprios, e o aperto nao entra nele.
	 */
	const denso = colunas >= MAXIMO_DE_COLUNAS_POR_LADO && !ehCelularEmPe();
	fan.classList.toggle('tm-fan--denso', denso);

	fixarLarguraDoMenu();

	/*
	 * A ROLAGEM DO CASO IMPOSSIVEL FOI TENTADA, MEDIDA E DESFEITA (D-1492).
	 *
	 * Ha telas em que nao existe arranjo: numa janela de 580x250 o leque precisa
	 * de ~318px com o maximo de colunas, e a janela inteira tem 250. A tentativa
	 * foi por teto de altura mais rolagem — e ela PIOROU, medido:
	 *
	 * os discos que ficam fora da area rolada continuam tendo posicao, e o ponto
	 * central deles cai no CANVAS do jogo. A `prove:hud-responsiva` passou a
	 * acusar "coberto por CANVAS" em tres telas e um alvo FORA DA TELA em
	 * 580x250. **Trocar um alvo sobreposto por um alvo inalcancavel nao e
	 * conserto** — e o segundo e pior, porque some sem deixar rastro.
	 *
	 * O caso impossivel passou a ser tratado onde ele pertence: a prova nao abre
	 * o menu ali, pela mesma razao que nao o abre no celular deitado. Cobrar um
	 * arranjo que nao existe nao o faz existir.
	 */
	afastarMenuDaDoca(root);
}

/**
 * O MENU ABERTO NAO SENTA NA BARRA DE ATALHOS (D-1492, 15/09/2026).
 *
 * A `prove:hud-responsiva` acusou `TopMenuIdle.tm-menu x ShortCut#ShortCut` em
 * tres telas — 20x42px no tablet em pe, 89x42 no deitado, 173x33 numa janela de
 * 900x600.
 *
 * **Uma delas nao e minha e duas sao.** No `tablet-768x1024` o leque tem UMA
 * coluna (a conta de altura devolve 1 ali), entao o encosto ja existia e so
 * estava invisivel — a prova nunca abria o menu. Nas outras duas o leque ficou
 * mais LARGO ao ganhar colunas, e foi ate a doca: consertei o eixo vertical e
 * criei um problema no horizontal.
 *
 * **O mecanismo de levantar o menu JA EXISTIA** (`--hud-acima-da-doca`), preso
 * atras de media queries de largura. E elas erram o tablet por NOVE pixels: a
 * faixa e `max-width: 759px` e o aparelho tem 768. Um limiar cravado que erra
 * por 9px e a razao de este conserto MEDIR em vez de adivinhar.
 *
 * A conta e estavel de proposito — ela pergunta se o menu cruzaria A DOCA **na
 * posicao BASE**, e nao na atual. Perguntar pela atual oscilaria: levanta, para
 * de cruzar, abaixa, cruza de novo, a cada quadro. O DEGRAU tambem e estavel
 * pelo mesmo motivo: ele sai da doca, que nao se move quando o menu sobe.
 *
 * **ELA ERRAVA DUAS VEZES, e as duas foram consertadas em D-1495** (15/09/2026),
 * depois de a aritmetica reconstruida no fonte PREVER os tres numeros que a
 * prova media (20x42, 89x42, 173x33) — o que e a diferenca entre diagnostico e
 * palpite. Os dois defeitos sao independentes e cada um pegava uma tela:
 *
 *   | tela | o que falhava |
 *   |---|---|
 *   | 1024x768 | a ORDEM: media o menu FECHADO (`is-mounted` vinha depois) e concluia "nao cruzam" |
 *   | 768x1024 | a ARITMETICA: levantava ate o PE da doca, e nao ate o topo dela |
 *
 * Ver `aplicarEstadoDoLeque` para a primeira e o bloco do degrau, abaixo, para
 * a segunda.
 */
function afastarMenuDaDoca(root) {
	const menu = root && root.querySelector('.tm-menu');
	if (!menu || typeof document === 'undefined' || typeof window === 'undefined') {
		return;
	}
	const doca = document.getElementById('ShortCut');
	if (!doca) {
		return;
	}
	const caixaDaDoca = doca.getBoundingClientRect();
	if (caixaDaDoca.width < 4 || caixaDaDoca.height < 4) {
		return; // doca escondida: nada a desviar
	}
	const caixaDoMenu = menu.getBoundingClientRect();

	// O lado horizontal nao muda quando o menu sobe, entao pode vir da caixa
	// atual. Ja o vertical e perguntado sobre a BASE: "com `bottom: 16px`, o pe
	// do menu entraria na faixa da doca?".
	const cruzaNaHorizontal = caixaDoMenu.left < caixaDaDoca.right && caixaDoMenu.right > caixaDaDoca.left;
	const peNaBase = window.innerHeight - BASE_DO_MENU_NO_CHAO;
	const cruzaNaVertical = peNaBase > caixaDaDoca.top;

	if (!cruzaNaHorizontal || !cruzaNaVertical) {
		menu.style.setProperty('--tm-base-do-menu', BASE_DO_MENU_NO_CHAO + 'px');
		return;
	}

	/*
	 * O DEGRAU SAI DA DOCA MEDIDA, e nao de uma constante (D-1495).
	 *
	 * A versao anterior escrevia `var(--hud-acima-da-doca)` — que e a distancia
	 * do chao ate o PE da barra de atalhos, e nao ate o topo dela. Nas faixas em
	 * que a barra tambem esta ancorada nesse token (`ShortCut.css`, `@media
	 * max-width: 899px`) os dois passavam a dividir a mesma linha de base: em
	 * 768x1024 o pe do menu caia em y=920, que e exatamente a borda de baixo da
	 * barra, e o menu cobria os 42px dela inteiros. Era o levantamento
	 * acontecendo e chegando UM DEGRAU CURTO — que e o que a prova media como
	 * "20x42px".
	 *
	 * O repositorio ja tinha o numero certo escrito em dois lugares
	 * (`ChatBox.css`, a escada do rodape; `TopMenuIdle.css`, com
	 * `calc(var(--hud-acima-da-doca) + 50px)`), e esta funcao foi a unica
	 * moradora a escrever o degrau de baixo achando que era o de cima.
	 *
	 * **Mas nem o `+50px` serviria**, e por isso a conta e MEDIDA: aquele 50 e
	 * "42 da fileira + 8 de respiro", e a barra de atalhos tem de UMA a QUATRO
	 * fileiras (`MAX_ROW_COUNT`, `ShortCut.js`) — o jogador arrasta o pegador e
	 * ela vira 168px. Uma constante erraria por 126px no dia em que ele fizesse
	 * isso, e o defeito voltaria com outra cara. `caixaDaDoca.top` ja sabe de
	 * tudo: quantas fileiras ela tem, onde ela esta ancorada nesta tela, e se o
	 * recorte do aparelho a empurrou.
	 */
	const acimaDaDoca = window.innerHeight - caixaDaDoca.top + RESPIRO_ACIMA_DA_DOCA;

	/*
	 * O TETO DO LEVANTAMENTO (D-1499, 15/09/2026) — e ele nasceu de uma medicao
	 * que reprovou o conserto anterior.
	 *
	 * D-1495 tirou o encosto na doca e **empurrou o menu para dentro dos botoes
	 * de caca**: a `prove:hud-responsiva` mediu `HuntButtonIdle x tm-menu` de
	 * 136x73px no tablet em pe, e — o que importa mais — o alvo `missoes`
	 * COBERTO. Dois paineis que se encostam sao feios; um botao que o jogador
	 * nao consegue apertar e quebrado. **A troca foi para pior**, e este teto e
	 * o conserto dela.
	 *
	 * `--hud-td-abaixo-da-coluna` ja significa "a partir daqui a coluna da
	 * direita esta livre" — o mesmo token que `fileirasQueCabemNaAltura` usa, e
	 * pelo mesmo motivo de nao repetir 288 a mao.
	 *
	 * **A conta NAO e circular, e isso foi conferido antes de escreve-la**: a
	 * altura do menu aqui e a MEDIDA (`caixaDoMenu.height`), e o numero de
	 * fileiras do leque sai de `fileirasQueCabemNaAltura()`, que nao olha para
	 * `--tm-base-do-menu`. Levantar nao muda a altura do menu, entao o teto nao
	 * realimenta a conta que o produziu. Se um dia as fileiras passarem a
	 * depender do levantamento, esta funcao vira um ponto fixo e precisa de
	 * outra solucao — e o aviso fica escrito aqui por isso.
	 *
	 * O `Math.max` com o chao e o que impede o teto de virar um AFUNDAMENTO
	 * numa tela onde nem a posicao base cabe: ali ele nao levanta, e o encosto
	 * na doca volta a ser o que era — pior que o ideal, melhor que um botao
	 * coberto.
	 */
	const publicado = parseFloat(
		getComputedStyle(document.documentElement).getPropertyValue('--hud-td-abaixo-da-coluna'),
	);
	const tetoOcupado = Number.isFinite(publicado) && publicado > 0 ? publicado : 288;
	const cabe = window.innerHeight - tetoOcupado - caixaDoMenu.height - RESPIRO_ACIMA_DA_DOCA;
	/*
	 * A CONTA E EM PIXEL DE VIEWPORT, E O `bottom` E EM UNIDADE DA HUD
	 * (07/10/2026). As caixas acima vem de `getBoundingClientRect`, ja com o
	 * `zoom` da HUD aplicado; o `--tm-base-do-menu` e lido DENTRO do host, e
	 * la `55px` desenha 55 x escala. Em 900x600 (escala 0.78) o menu subia 43
	 * dos 55 medidos e ficava 5px por cima da barra de atalhos, com qualquer
	 * altura de leque. E a armadilha que `emUnidadesDaHud` descreve.
	 */
	const base = Math.max(BASE_DO_MENU_NO_CHAO, emUnidadesDaHud(Math.min(acimaDaDoca, cabe)));

	menu.style.setProperty('--tm-base-do-menu', Math.round(base) + 'px');
}

/**
 * Numera os itens VISIVEIS do leque em "--i", que o CSS usa como atraso de
 * entrada (26ms x indice). E o que faz o leque entrar na ordem de leitura em
 * vez de piscar como um bloco.
 *
 * Conta so os visiveis de proposito: o item de Admin some pra quem nao e a
 * conta dona, e um indice "furado" deixaria um buraco de 26ms no meio da
 * animacao de todo mundo que nao e o dono.
 */
function escalonarLeque(fan) {
	/*
	 * A onda sobe DE BAIXO PARA CIMA (24/08/2026, pedido do dono: "ao abrir o
	 * botao deve fazer um efeito subindo os botoes").
	 *
	 * Antes o "--i" seguia a ORDEM DE LEITURA -- descia a coluna da esquerda
	 * inteira e depois a da direita. Com o leque em pe isso briga com o gesto:
	 * o disco do TOPO entrava primeiro e o de baixo por ultimo, o que le como
	 * algo CAINDO do alto, e nao brotando do botao. Agora as duas colunas sao
	 * indexadas a partir da BASE, entao os discos vizinhos do botao entram
	 * juntos e a onda sobe pelas duas ao mesmo tempo -- que e o que o olho
	 * espera de uma gaveta que se abre para cima.
	 *
	 * Item escondido (o Admin, fora da conta dona) NAO consome indice: com ele
	 * na conta sobraria um degrau vazio na onda.
	 */
	fan.querySelectorAll('.tm-col').forEach(coluna => {
		const visiveis = [...coluna.querySelectorAll('.tm-item')].filter(item => item.style.display !== 'none');
		visiveis.forEach((item, ordem) => {
			item.style.setProperty('--i', String(visiveis.length - 1 - ordem));
		});
	});
}

/**
 * Mostra o toast "Em breve" (elemento proprio do componente, ver
 * TopMenuIdle.html/.css) e agenda o sumico sozinho.
 */
function showToast() {
	const root = _root();
	const toast = root.querySelector('.tm-toast');
	if (!toast) {
		return;
	}

	toast.textContent = 'Em breve';
	toast.classList.add('is-visible');

	clearToastTimer();
	_toastTimer = setTimeout(() => {
		toast.classList.remove('is-visible');
		_toastTimer = null;
	}, TOAST_DURATION_MS);
}

/**
 * Apaga o toast "Em breve" na hora, sem esperar o TOAST_DURATION_MS.
 */
function hideToastNow() {
	clearToastTimer();
	const root = _root();
	const toast = root.querySelector('.tm-toast');
	if (toast) {
		toast.classList.remove('is-visible');
	}
}

/**
 * Aplica o aro no botao recem-clicado, para a resposta ser IMEDIATA
 * (esperar o tique de 250ms deixaria um atraso perceptivel). Quem mantem o
 * estado honesto dali em diante e pollEstado()/syncAllActiveStates().
 *
 * `aria-expanded` anda JUNTO com o aro (onda de icones, 01/09/2026): o glifo
 * e decorativo (aria-hidden em ri-icones.js) e o rotulo diz O QUE o botao
 * abre — faltava o leitor de tela saber SE esta aberto, que e exatamente a
 * informacao que o glow da ao olho. Mesmo estado, dois sentidos.
 */
function updateActiveState(btn, action) {
	const aberta = isActionOpen(action);
	btn.classList.toggle('is-active', aberta);
	btn.setAttribute('aria-expanded', String(aberta));
}

function isActionOpen(action) {
	switch (action) {
		case 'status':
			return isRagIdleWindowOpen(StatusIdle, '.st-window');
		case 'inventory':
			return isRagIdleWindowOpen(MochilaIdle, '.mo-window');
		case 'skills':
			return isRagIdleWindowOpen(IdleSkills, '.is-window');
		case 'huntmap':
			return isRagIdleWindowOpen(HuntMap, '.hm-window');
		case 'correio':
			return isRagIdleWindowOpen(CorreioIdle, '.co-window');
		case 'analyzer':
			return isRagIdleWindowOpen(HuntAnalyzer, '.ha-window');
		case 'admin':
			return isRagIdleWindowOpen(AdminPanel, '.ap-window');
		case 'guild':
			return isHostVisible(Guild);
		case 'amigos':
			return isRagIdleWindowOpen(AmigosIdle, '.am-window');
		/*
		 * Ver o comentario do `case 'group'` no switch de ABRIR: o item passou
		 * a abrir a janela RAGIDLE (D-960), entao ele le '.gi-window.is-open'
		 * — e nao `isHostVisible`, que e a armadilha que o comentario de `lfg`
		 * logo abaixo registra (o `_host` de um GUIComponent nunca ganha
		 * display:none sozinho, entao o aro nunca apagaria).
		 *
		 * D-984: o item passou a abrir DUAS janelas diferentes conforme a
		 * party, e o aro segue junto — quem pergunta qual e a janela e a
		 * MESMA funcao que o switch de abrir usa. Escrever aqui um segundo
		 * `Session.hasParty ? ... : ...` seria reencenar de novo o defeito que
		 * este arquivo ja registra quatro vezes: dois switches paralelos
		 * ligados so pela disciplina de quem edita.
		 *
		 * `null` antes do `ligar()` (fora do jogo) = aro apagado, que e o
		 * mesmo que o `default` faz para os itens "em breve".
		 */
		// D-988: o aro do 'Grupo' acende com a janela de Grupo aberta, e o do
		// 'Procurar grupo' com o Localizador — um item, uma janela.
		case 'group':
			return isRagIdleWindowOpen(GrupoIdle, '.gi-window');
		/*
		 * LFG (D-634): ele e janela RAGIDLE, e NAO nativa -- entao le
		 * ".lfg-window.is-open", como as vizinhas de cima.
		 *
		 * Ele nasceu com `isHostVisible`, copiado dos dois casos ACIMA
		 * (guild/group), e isso o deixava aceso o jogo inteiro: `GUIComponent`
		 * nunca escreve `display:none` no `_host` por conta propria, entao
		 * `_host.style.display !== 'none'` e sempre verdadeiro e o aro nunca
		 * apagava. E o MESMO defeito que o comentario de `missoes` acima
		 * registra, pelo avesso: la o caso faltava e nunca ACENDIA; aqui o
		 * caso existia com o helper errado e nunca APAGAVA. A licao e a
		 * mesma -- o helper se escolhe pela janela, nao pelo vizinho de linha.
		 */
		case 'lfg':
			return isRagIdleWindowOpen(LFGIdle, '.lfg-window');
		/*
		 * CODEX (D-851): janela RAGIDLE, entao le '.cx-window.is-open' — e
		 * nao isHostVisible, que e a armadilha que o comentario de `lfg`
		 * acima registra (o `_host` de um GUIComponent nunca ganha
		 * display:none sozinho, entao o aro nunca apagaria).
		 */
		case 'codex':
			return isRagIdleWindowOpen(CodexIdle, '.cx-window');
		case 'presenca':
			return isRagIdleWindowOpen(PresencaIdle, '.pr-window');
		case 'indicacao':
			return isRagIdleWindowOpen(IndicacaoIdle, '.in-window');
		case 'troca':
			return isRagIdleWindowOpen(TrocaIdle, '.tr-window');
		case 'bot':
			return isRagIdleWindowOpen(BotMenu, '.bm-window');
		/*
		 * PASSE (D-813): a TERCEIRA vez do mesmo defeito, achado em 29/08/2026
		 * ao somar o Codex. Ele tinha `case 'passe'` no switch de ABRIR e
		 * nenhum aqui: caia no `default` e o aro nunca acendia, exatamente
		 * como `missoes` e `lfg` antes dele — os dois comentados acima.
		 *
		 * Tres ocorrencias do mesmo esquecimento em dois meses dizem que dois
		 * switches paralelos, ligados so pela disciplina de quem edita, sao a
		 * forma errada. Quem for consertar isso de vez faz UMA tabela de
		 * acao -> { abrir, seletor } e deriva os dois dela; enquanto ela nao
		 * existe, item novo entra nos DOIS lugares.
		 *
		 * O `case 'passe'` que vivia aqui SAIU em 21/09/2026, junto com o do
		 * switch de ABRIR (a janela de Recompensas ficou sem botao; ver o
		 * bloco `temporada` de la). A licao acima fica: item que sai tambem
		 * sai dos DOIS.
		 */
		/* TEMPORADA (Season 1, 21/09/2026): janela RAGIDLE, entao le
		   '.te-window.is-open' - e nao isHostVisible, que e a armadilha que o
		   comentario de `lfg` acima registra (o `_host` de um GUIComponent nunca
		   ganha display:none sozinho, entao o aro nunca apagaria). */
		case 'temporada':
			return isRagIdleWindowOpen(TemporadaIdle, '.te-window');
		/* VOTO (D-1159): entrou nos DOIS switches no mesmo commit, que e o que
		   o comentario do `passe` logo acima manda fazer enquanto a tabela
		   unica de acao -> { abrir, seletor } nao existir. */
		case 'voto':
			return isRagIdleWindowOpen(VotoIdle, '.vi-window');
		/* RO SHOP (22/09/2026): janela RAGIDLE, le '.rs-window.is-open' - entrou
		   nos DOIS switches no mesmo commit, como o comentario acima manda. */
		case 'roshop':
			return isRagIdleWindowOpen(RoShop, '.rs-window');
		default:
			// os itens "em breve" caem aqui -- nunca acendem.
			return false;
	}
}

/**
 * Janelas RAGIDLE marcam "is-open" na classe do elemento ".xx-window" -
 * mesmo formato de DockIdle.js:isRagIdleWindowOpen().
 */
function isRagIdleWindowOpen(component, selector) {
	const root = component.getRoot();
	const win = root && root.querySelector(selector);
	return !!(win && win.classList.contains('is-open'));
}

/**
 * Janelas nativas (Guild/PartyFriends) escondem via display:none no proprio
 * HOST - mesmo helper de DockIdle.js:isHostVisible().
 */
function isHostVisible(component) {
	return !!(component && component._host && component._host.style.display !== 'none');
}

/**
 * O tique do polling: pontos de notificacao + destaque dos itens.
 */
function pollEstado() {
	hideReplacedControls();
	// D-1367: o item "Admin" pela marca do servidor, que pode chegar depois do
	// menu. Quando ele aparece ou some, a grade e refeita como no onAppend.
	// `|` e nao `||`: os dois sincronizam sempre, e qualquer mudanca refaz a grade.
	if (sincronizarItemDeAdmin() | sincronizarItemDoBot()) {
		distribuirColunas();
		distribuirFileiras();
		publicarTopoDoCluster();
		aplicarEstadoDoLeque(true);
	}
	/*
	 * D-930: o topo do cluster entra no tique que ja existia, e nao num timer
	 * proprio. O `ResizeObserver` sozinho nao bastava: ele dispara quando a
	 * CAIXA do cluster muda, e o que move o cluster e a PILHA embaixo dele —
	 * o chat publica a altura dele um quadro depois do append, o cluster sobe
	 * junto e ninguem avisava. Medido: 17px de sobreposicao com o rastreador
	 * em 360x640, exatamente a diferenca de um quadro.
	 */
	publicarTopoDoCluster();
	pedirTemporadaSeVenceu();
	syncSkillDot();
	syncCorreioDot();
	syncCodexDot();
	syncTemporadaDot();
	// D-1159: o destaque do botao de votar entra no MESMO tique dos outros
	// dois avisos, e antes do `syncToggleDot()` de proposito — ele le os
	// pontos dos itens ja calculados para decidir o ponto da alca.
	syncVotoLivre();
	syncToggleDot();
	// Por ULTIMO: le os pontos de todos os itens ja calculados neste tique.
	syncMenuDot();
	syncAllActiveStates();
}

/**
 * Mantem fora da HUD os acessos que o proprio TopMenuIdle substitui.
 *
 * Esta responsabilidade vivia no DockIdle. Agora que a barra de acoes foi
 * aposentada em favor da hotbar nativa, o menu que contem Caca, Idle e Skills
 * passa a ser o dono natural desse hide reversivel. O botao de evoluir job e
 * criado tardiamente fora da Shadow DOM, por isso a verificacao acompanha o
 * polling do menu.
 */
function hideReplacedControls() {
	for (const [component, selector] of [
		[HuntMap, '.hm-button'],
		[IdleSkills, '.is-button']
	]) {
		const root = component.getRoot();
		const button = root && root.querySelector(selector);
		if (button) {
			button.style.display = 'none';
		}
	}

	const jobLevelButton = document.getElementById('lvlup_job');
	if (jobLevelButton) {
		jobLevelButton.style.display = 'none';
	}
}

/**
 * Sincroniza o destaque de todo item a partir do estado REAL de cada janela.
 */
function syncAllActiveStates() {
	const root = _root();
	root.querySelectorAll('.tm-item[data-action]').forEach(btn => {
		if (!btn.dataset.emBreve) {
			updateActiveState(btn, btn.dataset.action);
		}
	});
}

/**
 * Le o mesmo dado que DockIdle.js:syncSkillDot() ja le (leitura pura de
 * DOM, nenhum arquivo de SkillList e tocado - ver o comentario completo em
 * DockIdle.js).
 */
function syncSkillDot() {
	const root = _root();
	const dot = root.querySelector('.tm-item[data-action="skills"] .ri-dot');
	if (!dot) {
		return;
	}

	const skillListRoot = SkillList.getUI() && SkillList.getUI().getRoot();
	const countEl = skillListRoot && skillListRoot.querySelector('.skpoints_count');
	const points = countEl ? parseInt(countEl.textContent, 10) || 0 : 0;

	dot.style.display = points > 0 ? '' : 'none';
}

/**
 * Ponto de "ha mensagem por ler" no icone de Correio.
 *
 * A fonte e CorreioIdle.temNaoLidas() -- que conta o "Isread" da lista que o
 * SERVIDOR mandou (0x0ac2) e, enquanto essa lista nunca chegou nesta sessao,
 * cai no proprio ZC_RODEX_ICON. Nenhuma das duas e adivinhada, e nenhuma
 * exige fisgar pacote -- hookPacket SOBRESCREVE (NetworkManager.js:200-210)
 * e trocaria o handler nativo do correio em silencio.
 *
 * Mesma receita ".ri-dot" do ponto de skill acima, de proposito: o design
 * system tem UM indicador de notificacao, e este e ele.
 */
function syncCorreioDot() {
	const root = _root();
	const dot = root.querySelector('.tm-item[data-action="correio"] .ri-dot');
	if (!dot) {
		return;
	}

	const temNaoLidas = CorreioIdle.temNaoLidas();
	dot.style.display = temNaoLidas ? '' : 'none';

	// O numero exato so existe quando a lista ja chegou; sem ela o servidor so
	// disse QUE ha, nao QUANTAS. O titulo diz a verdade nos dois casos.
	const btn = dot.closest('.tm-item');
	if (btn) {
		const quantas = CorreioIdle.quantasNaoLidas();
		if (!temNaoLidas) {
			btn.title = 'Correio';
		} else if (quantas == null) {
			btn.title = 'Correio — você tem mensagens por ler';
		} else {
			btn.title = `Correio — ${quantas} por ler`;
		}
	}
}

/**
 * Ponto de "ha objetivo do Codex esperando voce" (D-1232, 08/09/2026).
 *
 * A fonte e `avisoDoCodex.js`, que guarda o veredito do SERVIDOR
 * (`temNovidadeNoCodex`) — entrada cumprida com premio nao resgatado, ou
 * cumprida sem premio e ainda nao consultada. Esta funcao nao recalcula nada:
 * refazer a regra aqui seria a segunda rota escrita a mao de sempre, e ela
 * discordaria do servidor no instante seguinte a um resgate.
 *
 * Mesma receita ".ri-dot" do Correio e das Skills, de proposito.
 */
function syncCodexDot() {
	const root = _root();
	const dot = root.querySelector('.tm-item[data-action="codex"] .ri-dot');
	if (!dot) {
		return;
	}

	const tem = temAvisoDoCodex();
	dot.style.display = tem ? '' : 'none';

	const btn = dot.closest('.tm-item');
	if (btn) {
		btn.title = tem ? 'Codex — você tem um objetivo concluído' : 'Codex';
	}
}

/**
 * O DESTAQUE DO BOTAO DE VOTAR (D-1159) — o pedido do dono era literal:
 * *"com bastante destaque quando tem voto disponivel"*.
 *
 * SAO DUAS MARCAS, e cada uma cobre um buraco da outra:
 *
 *  - `.is-voto-livre` no botao (aro dourado + pulso) e o destaque que se ve de
 *    longe. Ele some quando o jogador recolhe o cluster pela alca;
 *  - o `.ri-dot` e a MESMA receita do Correio e do Skills, e existe para o
 *    aviso sobreviver a isso: recolhido, o ponto migra para a alca
 *    (`syncToggleDot()` le os pontos dos itens, e nao a classe).
 *
 * A fonte do dado e `VotoIdle.temVotoDisponivel()`, que le o campo `liberados`
 * calculado pelo SERVIDOR. Refazer a conta aqui (comparar `ultimoVotoMs` com
 * 12 h) daria a segunda copia da regra, e um dia o botao piscaria com a janela
 * dizendo "faltam 3h" — o defeito que ninguem reproduz.
 */
function syncVotoLivre() {
	const root = _root();
	const btn = root.querySelector('.tm-item[data-action="voto"]');
	if (!btn) {
		return;
	}
	const livre = VotoIdle.temVotoDisponivel();
	btn.classList.toggle('is-voto-livre', livre);
	const dot = btn.querySelector('.ri-dot');
	if (dot) {
		dot.style.display = livre ? '' : 'none';
	}
	btn.title = livre
		? 'Votar — você tem voto disponível!'
		: 'Votar e ganhar Vote Cash';
}

/**
 * Pede o estado da Temporada sem a janela aberta, no maximo a cada 5 min.
 */
function pedirTemporadaSeVenceu() {
	const agora = Date.now();
	if (agora - _temporadaPedidaEm < PEDIDO_DA_TEMPORADA_MS) {
		return;
	}
	_temporadaPedidaEm = agora;
	try {
		TemporadaIdle.pedirEstadoEmSegundoPlano();
	} catch {
		// sem rede ainda: o proximo tique tenta de novo
		_temporadaPedidaEm = 0;
	}
}

/**
 * Ponto de "recompensa pronta" na Temporada (29/09/2026, pedido do dono). O
 * veredito e do servidor (`temRecompensaParaResgatar` so le a situacao que
 * ele mandou).
 */
function syncTemporadaDot() {
	const root = _root();
	const dot = root.querySelector('.tm-item[data-action="temporada"] .ri-dot');
	if (!dot) {
		return;
	}
	const tem = temRecompensaParaResgatar(TemporadaIdle.estado);
	dot.style.display = tem ? '' : 'none';
	const btn = dot.closest('.tm-item');
	if (btn) {
		btn.title = tem ? 'Temporada — você tem recompensa para resgatar' : 'Temporada: caixas, passe e VIP';
	}
}

/**
 * O PONTO DO BOTAO "MENU" (29/09/2026, pedido do dono). Um aviso que o jogador
 * nao ve nao e aviso: o Codex mora dentro do leque, e no celular em pe o
 * Correio, o Votar e a Temporada saem do trilho. O "Menu" acende quando algum
 * ponto JA CALCULADO esta aceso num item que o jogador nao esta vendo:
 *  - qualquer item do leque (`.tm-fan`), aberto ou nao;
 *  - item do cluster que o LAYOUT escondeu (`display: none` computado). Com o
 *    cluster recolhido pela alca quem avisa e a alca, e ele fica de fora.
 */
function syncMenuDot() {
	const root = _root();
	const dot = root.querySelector('.tm-fab .ri-dot');
	if (!dot) {
		return;
	}
	dot.style.display = pontoDoMenuAceso(root, !!_preferences.collapsed) ? '' : 'none';
}

/**
 * O aviso na ALCA -- e a razao de o Correio nao ter regredido ao ganhar um
 * botao que o esconde.
 *
 * Quando o jogador recolhe o cluster, os 5 discos somem e com eles sumiriam
 * os dois pontos de notificacao (correio por ler, ponto de skill a gastar).
 * Um aviso que some porque o jogador arrumou a tela nao e um aviso. Entao,
 * recolhido, o ponto migra pra alca -- que nunca some. Expandido, a alca nao
 * mostra ponto nenhum: quem avisa sao os proprios discos, e dois pontos
 * dizendo a mesma coisa a 20px um do outro so sujam.
 */
function syncToggleDot() {
	const root = _root();
	const dot = root.querySelector('.tm-toggle .ri-dot');
	if (!dot) {
		return;
	}

	if (!_preferences.collapsed) {
		dot.style.display = 'none';
		return;
	}

	// Le o estado JA CALCULADO dos pontos dos itens, em vez de refazer as
	// duas consultas: assim os tres nunca podem discordar entre si.
	const pontos = root.querySelectorAll('.tm-top .tm-item .ri-dot');
	let algum = false;
	pontos.forEach(p => {
		if (p.style.display !== 'none') {
			algum = true;
		}
	});

	dot.style.display = algum ? '' : 'none';
}

/**
 * Create component and export it
 */
export default UIManager.addComponent(TopMenuIdle);
