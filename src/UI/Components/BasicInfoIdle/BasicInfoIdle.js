/**
 * UI/Components/BasicInfoIdle/BasicInfoIdle.js
 *
 * "Informações básicas" — light-theme HUD replicating the Midgard Idle
 * print: avatar + name/class, HP/SP bars, Base/Classe level + exp, peso/zeny
 * and a 2-row icon-button grid that opens the sibling RAGIDLE windows.
 *
 * Where the data comes from (read-only — never written here):
 *   - Session.Entity (Engine/SessionStorage.js:30) is the player entity the
 *     native BasicInfo window itself reads from. Confirmed by
 *     Engine/MapEngine.js:623-627 ("BasicInfo.getUI().update('blvl',
 *     Session.Entity.clevel)" etc.) and Engine/MapEngine/Main.js:254/298/
 *     316/325/704/722 (hp/sp updates on ZC_PAR_CHANGE/ZC_LONGPAR_CHANGE,
 *     always read from Session.Entity.life.hp/hp_max/sp/sp_max).
 *   - Session.Entity.display.name / .clevel / .joblevel / .job / .weight /
 *     .life.{hp,hp_max,sp,sp_max} are plain mutable fields kept live by the
 *     engine — see Renderer/Entity/EntityLife.js:210 (this.life = new Life())
 *     and Renderer/Entity/EntityDisplay.js:425 (this.display = new Display()).
 *   - Session.zeny (Engine/SessionStorage.js:41-50) is a getter/setter that
 *     proxies to Session.Entity.money.
 *   - BasicInfo.getUI().base_exp / base_exp_next / job_exp / job_exp_next /
 *     weight_max are instance fields on the *native* BasicInfo singleton
 *     (UI/Components/BasicInfo/BasicInfoCommon.js:70-75), fed by
 *     Engine/MapEngine/Main.js:231/238/392/399/414. There is no separate
 *     Session store for these — the native window's own instance IS the
 *     store, so we read it directly instead of duplicating it.
 *
 * Why polling instead of hooking packets ourselves: Network.hookPacket()
 * (Network/NetworkManager.js:200-210) does `Packets.list[packet.id].callback
 * = callback` — a plain property assignment, so a second hookPacket() call
 * on the same opcode (e.g. ZC_PAR_CHANGE/ZC_LONGPAR_CHANGE, already hooked
 * by Engine/MapEngine/Main.js) would silently REPLACE the native handler
 * instead of adding a second listener. Since Session.Entity/BasicInfo.getUI()
 * are already updated by that native handler on every relevant packet, this
 * component just re-reads that same live state on a 250ms timer — no packet
 * hook of our own, nothing stolen from the native window.
 *
 * Hides the NATIVE BasicInfo window: BasicInfo.getUI() returns the
 * currently active version (V0/V1/V3/V4/V5, chosen by
 * UI/Components/BasicInfo/BasicInfo.js's UIVersionManager). We locate its
 * `_host` (the actual DOM element GUIComponent#append() puts on screen,
 * UI/GUIComponent.js:95/230) and set display:none on it — done both in our
 * onAppend() (right after Engine/MapEngine.js appends the native window,
 * see MapEngine.js:729) and again on every poll tick, defensively, in case
 * PACKETVER-driven version switching (MapEngine.js:618-621) ever re-shows a
 * freshly prepared instance later in the session. The native BasicInfo.js
 * file itself is never modified.
 *
 * Icon grid retired (19/08/2026, task ask from the owner): this panel used
 * to also open the sibling RAGIDLE windows (Status/Equipamento/Inventario/
 * Skills/Caca/Config/Menu/Admin) through a row of icon buttons at the
 * bottom. That grid — and the admin-owner gating that guarded its Admin
 * button — moved to UI/Components/TopMenuIdle/TopMenuIdle.js, which is now
 * the ONLY place with clickable icons. This file no longer imports any of
 * those sibling windows; it only reads native player state to display it.
 *
 * Carteira (20/08/2026, pedido do dono com print): o contador de moedas que
 * flutuava no topo AO CENTRO (UI/Components/TopBarIdle, apagado nesta
 * rodada) passou a morar nesta janela, como faixa de rodape. Nada da LOGICA
 * mudou: a fonte continua sendo Session.zeny (o mesmo getter que a capsula
 * lia, Engine/SessionStorage.js:41-50), a cadencia continua sendo o mesmo
 * polling de 250ms deste arquivo, e o seletor de destino continua sendo
 * ".bi-zeny" -- o que mudou foi so ONDE esse span vive no .html (antes na
 * linha "Peso / Zeny" do corpo, agora na faixa ".bi-moeda"). Como o
 * componente solto sumiu, sumiu tambem o segundo temporizador de 250ms que
 * lia exatamente o mesmo estado.
 *
 * @author RagIdle
 */

import { faixaDoPing, medidorDePing } from 'Network/medidorDePing.js';
import Renderer from 'Renderer/Renderer.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import { caminhoDoRetrato } from 'UI/retratoDeClasse.js';
import BasicInfo from 'UI/Components/BasicInfo/BasicInfo.js';
import RiIcones from 'UI/ri-icones.js';
import { formatarRoCash } from 'Utils/roCash.js';
import htmlText from './BasicInfoIdle.html?raw';
import cssText from './BasicInfoIdle.css?raw';
import { emUnidadesDaHud } from 'UI/escalaDaHud.js'; // D-934: geometria medida vira unidade da HUD

/**
 * Light polling interval for native state that has no packet hook slot free
 * (see file header). 250ms matches the task's own suggested cadence.
 */
const POLL_INTERVAL_MS = 250;

/**
 * PT-BR label for the handful of common jobs, keyed off MonsterTable's
 * (English) name — MonsterTable (DB/Monsters/MonsterTable.js) is the same
 * lookup the native BasicInfo uses for its "job" field (see
 * UI/Components/BasicInfo/BasicInfoCommon.js:477-480,
 * `MonsterTable[val1]`). Deliberately a small pragmatic subset (base +
 * common 2nd jobs, same spirit as HuntMap's RACE_PT/ELEMENT_PT dictionaries,
 * HuntMap.js:45-72) — anything not listed here just falls back to
 * MonsterTable's English name instead of failing.
 *
 * A VERDADE E DO SERVIDOR, e nao deste dicionario (01/09/2026). Ate hoje ele
 * divergia em cinco — Acolyte, Thief, Crusader, Rogue e Dancer —, e o jogador
 * lia "Ladino" neste painel e "Skills de Gatuno" no titulo da janela ao lado.
 * Os valores das classes JOGAVEIS espelham `nomePtDaClasse`
 * (`servidor/classes.ts`), que usa os nomes do RO brasileiro. Ha portao:
 * `servidor/classes-no-fork.test.ts` le este literal e reprova nomeando a
 * classe que divergir. As classes fora de CLASSES_JOGAVEIS (Super Novice,
 * Gunslinger, 3o grau) seguem livres — o servidor nao as joga.
 */
const JOB_PT = {
	Novice: 'Aprendiz',
	Swordman: 'Espadachim',
	Mage: 'Mago',
	Archer: 'Arqueiro',
	Acolyte: 'Noviço',
	Merchant: 'Mercador',
	Thief: 'Gatuno',
	Knight: 'Cavaleiro',
	Priest: 'Sacerdote',
	Wizard: 'Bruxo',
	Blacksmith: 'Ferreiro',
	Hunter: 'Caçador',
	Assassin: 'Assassino',
	Crusader: 'Templário',
	Monk: 'Monge',
	Sage: 'Sábio',
	Rogue: 'Arruaceiro',
	Alchemist: 'Alquimista',
	Bard: 'Bardo',
	Dancer: 'Odalisca',
	'Super Novice': 'Super Aprendiz',
	Gunslinger: 'Atirador',
	Ninja: 'Ninja'
};

/**
 * Create Component
 */
const BasicInfoIdle = new GUIComponent('BasicInfoIdle', cssText);

/**
 * Troca o marcador "<!--RI_ICONE:chave-->" do .html pela string SVG do
 * modulo de iconografia (UI/ri-icones.js) -- mesmo padrao de DockIdle.js. A
 * substituicao tinha sumido daqui em 19/08/2026 (quando a grade de icones
 * saiu) e VOLTOU em 20/08/2026 com a faixa de carteira, que traz o medalhao
 * "zeny" herdado da capsula do topo.
 */
BasicInfoIdle.render = () => htmlText.replace(/<!--RI_ICONE:(\w+)-->/g, (_, chave) => RiIcones[chave] || '');

/**
 * @var {Preferences} window position — defaults to the top-left corner
 * ("fixa por padrão no canto superior esquerdo").
 */
const _preferences = Preferences.get(
	'BasicInfoIdle',
	{
		x: 12,
		y: 12,
		// D-343: modo compacto (recolhido) do painel -- mesma chave/objeto
		// da posicao, so um campo novo. Nao precisa de bump de versao:
		// Preferences.get() so copia as chaves que EXISTEM no localStorage
		// salvo por cima do default, entao quem ja tinha "x"/"y" salvos de
		// antes desta mudanca simplesmente cai no default "compact: false"
		// (ver Core/Preferences.js:38-59).
		compact: false
	},
	1.0
);

/**
 * @var {number|null} setInterval handle for the native-state polling loop.
 */
let _pollTimer = null;

/**
 * Helper: query inside shadow root
 */
function _root() {
	return BasicInfoIdle._shadow || BasicInfoIdle._host;
}

/**
 * One-time setup (runs once, during GUIComponent#prepare()).
 */
BasicInfoIdle.init = function init() {
	const root = _root();

	this.draggable(root.querySelector('.bi-header'));

	const minimizeBtn = root.querySelector('.bi-minimize');
	if (minimizeBtn) {
		minimizeBtn.addEventListener('click', onClickMinimize);
	}

	/* D-939: o rodape da HUD vertical mostra wifi e bateria. Ligado no init
	   (uma vez por vida do componente), e nao no polling. */
	ligarBateriaEWifi();
	ligarPing();
};

/**
 * Restore saved position (measured with the real rendered size, same
 * technique as BasicInfoCommon.js:236-240, since — unlike HuntMap — this
 * window's height isn't a fixed constant), hide the native BasicInfo
 * window and start the polling loop.
 */
BasicInfoIdle.onAppend = function onAppend() {
	// Aplica o modo compacto salvo ANTES de medir o host -- a altura real
	// renderizada (usada logo abaixo pro clamp de posicao) precisa ja
	// refletir o tamanho compacto quando for o caso, senao a janela abre
	// clampada pro tamanho ERRADO (ver contrato ":host"/JS no cabecalho).
	applyCompactState();

	const hostRect = this._host.getBoundingClientRect();
	this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - hostRect.height) + 'px';
	this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - hostRect.width) + 'px';

	hideNativeBasicInfo();
	syncFromNativeState();
	// A caixa vai para a custom property assim que ela EXISTE — quem depende
	// dela (o cluster do menu, em tela estreita) monta no mesmo quadro.
	publicarCaixa();
	startPolling();
};

/**
 * Save position and stop polling when removed (map exit — see
 * UIManager.removeComponents(), Engine/MapEngine.js:902).
 */
BasicInfoIdle.onRemove = function onRemove() {
	stopPolling();
	savePosition();
};

function savePosition() {
	_preferences.x = parseInt(BasicInfoIdle._host.style.left, 10) || 0;
	_preferences.y = parseInt(BasicInfoIdle._host.style.top, 10) || 0;
	_preferences.save();
}

/**
 * Clique no botao de minimizar (19/08/2026 -- antes era a barra "Recolher"
 * embaixo da janela, D-343; agora mora no cabecalho, estilo Windows): alterna
 * e SALVA a preferencia (mesmo objeto/chave da posicao, ver _preferences
 * acima), aplica na hora e re-clampa a posicao -- expandir de volta pode
 * fazer o painel crescer pra baixo do que cabe na tela se ele estava perto
 * da borda enquanto compacto.
 */
function onClickMinimize(e) {
	e.stopImmediatePropagation();
	BasicInfoIdle.alternarCompacto();
}

/**
 * Alterna o modo compacto por fora do clique — a porta do ATALHO Alt+V
 * (27/08/2026): o `EXTEND` do BasicInfo nativo era exatamente este gesto
 * (expandir/recolher o painel), entao o atalho da UI nova cai aqui. Mesmo
 * caminho do botao: salva a preferencia, aplica e re-clampa.
 */
BasicInfoIdle.alternarCompacto = function alternarCompacto() {
	_preferences.compact = !_preferences.compact;
	_preferences.save();
	applyCompactState();
	clampPositionToViewport();
};

/**
 * Reflete "_preferences.compact" no DOM: ".bi-body.is-compact" esconde tudo
 * que nao e HP/SP/XP/niveis (ver BasicInfoIdle.css). O glifo do botao de
 * minimizar fica o MESMO nos dois estados (traco horizontal, igual ao botao
 * real de minimizar do Windows -- ele nao muda de desenho quando a janela ja
 * esta minimizada); so titulo/aria-label mudam, pra continuar dizendo o que
 * o clique faz agora ("restaurar" quando ja esta compacto). Chamado no
 * onAppend() (restaura o que foi salvo, antes de medir o host) e a cada
 * clique.
 */
function applyCompactState() {
	const root = _root();
	const body = root.querySelector('.bi-body');
	const minimizeBtn = root.querySelector('.bi-minimize');
	if (!body || !minimizeBtn) {
		return;
	}

	const compact = !!_preferences.compact;
	body.classList.toggle('is-compact', compact);
	minimizeBtn.classList.toggle('is-compact', compact);
	minimizeBtn.setAttribute('aria-expanded', String(!compact));

	const title = compact ? 'Restaurar painel' : 'Recolher painel';
	minimizeBtn.title = title;
	minimizeBtn.setAttribute('aria-label', compact ? 'Restaurar painel para o modo completo' : 'Recolher painel para modo compacto');
}

/**
 * Re-mede o host DEPOIS de uma mudanca de tamanho em tempo real (alternar
 * compacto) e clampa top/left pra caixa continuar inteira dentro da tela --
 * mesma conta de onAppend(), so que a partir da posicao ATUAL (ja em tela)
 * em vez de "_preferences.x/y" (que so vale pro primeiro append).
 */
function clampPositionToViewport() {
	const host = BasicInfoIdle._host;
	const rect = host.getBoundingClientRect();
	const maxTop = Math.max(0, Renderer.height - rect.height);
	const maxLeft = Math.max(0, Renderer.width - rect.width);
	const curTop = parseInt(host.style.top, 10) || 0;
	const curLeft = parseInt(host.style.left, 10) || 0;
	host.style.top = Math.min(Math.max(0, curTop), maxTop) + 'px';
	host.style.left = Math.min(Math.max(0, curLeft), maxLeft) + 'px';
	publicarCaixa();
}

/**
 * PUBLICA A CAIXA MEDIDA deste painel numa custom property (I1, 31/08/2026).
 *
 * Em tela estreita o cluster do menu desce para DEBAIXO deste painel (ver
 * `TopMenuIdle.css`), e para isso alguem precisa saber onde ele termina. A
 * altura aqui e `auto` de proposito — o corpo tem numero variavel de linhas,
 * e o "compacto" a muda em tempo real —, entao nao ha numero para cravar.
 *
 * ESTIMAR ERRA CALADO, e este projeto ja pagou por isso duas vezes na mesma
 * semana: a coluna do minimapa foi estimada em 157px (era 184) e a dos botoes
 * em 34 (era 84), e nos dois casos a sobreposicao que o dono relatou nasceu do
 * palpite. Medir e publicar e o padrao que o `HuntButtonIdle` ja usa.
 *
 * `documentElement` do documento DESTE painel, e nao o da pagina de cima: o
 * jogo roda num iframe, e escrever a propriedade no topo nao alcanca ninguem.
 */
/** A ultima dupla publicada (ver a guarda em `publicarCaixa`). */
let _caixaPublicada = null;

function publicarCaixa() {
	const host = BasicInfoIdle._host;
	if (!host) return;
	const r = host.getBoundingClientRect();
	if (r.height < 1) return;
	/* D-934: em unidade da HUD, e nao em pixel de viewport — quem le estes
	   dois esta dentro de um host com `zoom`, e la o pixel vale menos. */
	const altura = `${Math.round(emUnidadesDaHud(r.height))}px`;
	const fundo = `${Math.round(emUnidadesDaHud(r.bottom))}px`;
	/*
	 * SO PUBLICA QUANDO MUDA (07/09/2026, frente de FPS).
	 *
	 * As duas escritas caem no `documentElement` e invalidam o estilo de todo
	 * descendente que use `var()`. Como isto roda no tique de 250 ms, eram 8
	 * invalidacoes globais por segundo para publicar, quase sempre, o mesmo
	 * numero. A leitura fica — e ela quem detecta a mudanca; sai a escrita.
	 */
	const assinatura = `${altura}|${fundo}`;
	if (assinatura === _caixaPublicada) return;
	_caixaPublicada = assinatura;
	const raiz = host.ownerDocument.documentElement;
	raiz.style.setProperty('--hud-basic-altura', altura);
	raiz.style.setProperty('--hud-basic-fundo', fundo);
}

/**
 * Locate the native BasicInfo window's host element and hide it (see file
 * header for why: display:none, never touching BasicInfo's own files).
 */
function hideNativeBasicInfo() {
	const nativeUI = BasicInfo.getUI();
	if (nativeUI && nativeUI._host && nativeUI._host.style.display !== 'none') {
		nativeUI._host.style.display = 'none';
	}
}

function startPolling() {
	stopPolling();
	/*
	 * A CAIXA VAI JUNTO A CADA TIQUE. A altura deste painel muda em tempo real
	 * — linhas que aparecem e somem, o modo compacto —, e uma propriedade
	 * publicada uma vez so envelheceria calada: o cluster do menu montaria
	 * sobre a altura de antes, e o sintoma seria sobreposicao intermitente,
	 * que e pior que sobreposicao constante.
	 */
	_pollTimer = setInterval(() => {
		syncFromNativeState();
		publicarCaixa();
	}, POLL_INTERVAL_MS);
}

function stopPolling() {
	if (_pollTimer != null) {
		clearInterval(_pollTimer);
		_pollTimer = null;
	}
}

function setText(root, selector, text) {
	const el = root.querySelector(selector);
	if (!el) {
		return;
	}
	/*
	 * COMPARA ANTES DE ESCREVER (auditoria de desempenho, 11/09/2026).
	 *
	 * Este painel PESQUISA o estado a cada 250 ms e chama isto DEZ vezes por
	 * volta, com a janela visivel ou nao. Escrever `textContent` com o MESMO
	 * texto nao e de graca: o navegador invalida o layout daquele no, e o
	 * quadro seguinte paga o reflow.
	 *
	 * Onde isso doi esta medido: a `sonda:fps` mediu 17fps no celular com o
	 * processador em 1/4, com os tempos de quadro em multiplos exatos de
	 * vsync -- o gargalo e CPU da thread principal, e nao GPU. Trabalho de HUD
	 * desperdicado sai exatamente dai.
	 *
	 * Nome, classe, nivel, peso e zeny quase nunca mudam entre duas voltas,
	 * entao a comparacao corta quase toda a escrita. **O padrao ja estava neste
	 * arquivo, uma funcao abaixo**: o retrato de classe so troca o `src` quando
	 * o `dataset.jobId` muda, "pra nao reiniciar a carga da imagem a cada tick
	 * de 250ms do polling". A regra certa ja morava aqui ao lado.
	 */
	/*
	 * INTERRUPTOR DE MEDICAO (11/09/2026): `window.__ri_hud_compara = false`
	 * devolve o comportamento ANTIGO (escrever sempre).
	 *
	 * Ele existe pelo mesmo motivo do `__ri_culling` do EntityManager, e a
	 * razao esta escrita la: comparar duas CORRIDAS nao separa o efeito da
	 * variancia — o personagem esta noutro lugar, com outros bichos, e o numero
	 * anda sozinho. Com o interruptor a sonda mede A/B **na mesma cena, no
	 * mesmo minuto**.
	 *
	 * Em producao a propriedade nao existe e o teste e um `!== false` por
	 * chamada — dez por volta de 250 ms, contra as dezenas de milhares de
	 * operacoes que ele decide evitar.
	 */
	escreverNoTexto(el, text);
}

/**
 * O `setText` para o elemento JA ACHADO (D-2385, 14/10/2026), com o mesmo interruptor de medicao.
 *
 * A auditoria de 11/09 levou a comparacao ao `setText`, mas a barra de HP e de SP (`updateLifeBar`) e a
 * inicial do avatar seguiram escrevendo `textContent` cru a cada volta de 250 ms: quatro textos das barras
 * e a inicial, quatro vezes por segundo, a cacada inteira, com o HP parado. E o HP que o `ZC_PAR_CHANGE`
 * poe na entidade: o pacote nao toca o DOM, este polling sim.
 */
function escreverNoTexto(el, text) {
	const novo = String(text);
	if (typeof window !== 'undefined' && window.__ri_hud_compara === false) {
		el.textContent = novo;
		return;
	}
	if (el.textContent !== novo) {
		el.textContent = novo;
	}
}

/**
 * A largura de um preenchimento, so se a lida for outra (D-2385). O navegador pode ler de volta outra forma
 * do mesmo numero (casas decimais): ai a comparacao falha e a escrita acontece, como antes.
 */
function escreverLargura(el, largura) {
	if (typeof window !== 'undefined' && window.__ri_hud_compara === false) {
		el.style.width = largura;
		return;
	}
	if (el.style.width !== largura) {
		el.style.width = largura;
	}
}

/**
 * Retrato de classe (scripts/retratos-de-classe.ts converteu icon_job_<jobid>.bmp
 * do cliente para /ragidle/classes/<jobid>.png -- servido por public/, o
 * mesmo jobId que Session.Entity.job ja carrega). So troca o `src` quando o
 * job muda (dataset.jobId), pra nao reiniciar a carga da imagem a cada tick
 * de 250ms do polling. `.bi-avatar-initial` continua no DOM por baixo como
 * fallback -- se o PNG do job nao existir (onerror), a inicial continua
 * visivel porque `.bi-avatar-img` so ganha `.is-loaded` (opacity:1) no
 * `onload`.
 */
function syncAvatarPortrait(root, jobId) {
	const img = root.querySelector('.bi-avatar-img');
	if (!img) {
		return;
	}
	const key = String(jobId);
	if (img.dataset.jobId === key) {
		return;
	}
	img.dataset.jobId = key;
	img.classList.remove('is-loaded');
	img.onload = () => img.classList.add('is-loaded');
	img.onerror = () => img.classList.remove('is-loaded');
	img.src = caminhoDoRetrato(jobId); // montado (Peco) usa o retrato da base
}

/**
 * "89,0%" — one decimal place, PT-BR comma (task spec).
 */
function formatPercent(value, max) {
	const pct = max > 0 ? (value / max) * 100 : 0;
	return pct.toFixed(1).replace('.', ',') + '%';
}

/**
 * "1.234.567" — PT-BR thousands separator for zeny.
 */
function formatZeny(value) {
	const digits = String(Math.max(0, Math.floor(value || 0)));
	let out = '';
	for (let i = 0; i < digits.length; i++) {
		if (i > 0 && (digits.length - i) % 3 === 0) {
			out += '.';
		}
		out += digits[i];
	}
	return out;
}

function updateLifeBar(root, type, val, max) {
	const bar = root.querySelector(`.bi-bar-${type}`);
	if (!bar) {
		return;
	}
	const perc = max > 0 ? Math.max(0, Math.min(100, (val / max) * 100)) : 0;
	const fill = bar.querySelector('.bi-bar-fill');
	const text = bar.querySelector('.bi-bar-text');
	const pct = bar.querySelector('.bi-bar-pct');
	if (fill) {
		escreverLargura(fill, perc + '%');
	}
	if (text) {
		escreverNoTexto(text, `${val} / ${max}`);
	}
	if (pct) {
		escreverNoTexto(pct, formatPercent(val, max));
	}
}

/**
 * A barra de EXP, e opcionalmente a PORCENTAGEM dentro dela.
 *
 * `pctSelector` e OPCIONAL de proposito (11/09/2026, pedido do dono: *"adicionar
 * a porcentagem da EXP de Base/Classe na barra do personagem (pequeno, visivel,
 * dentro da barra com a cor verde)"*).
 *
 * SAO TRES CHAMADORES, e o terceiro nao quer o texto: o rodape do celular em pe
 * (`sincronizarRodapeVertical`) usa esta mesma funcao e ja escreve o seu proprio
 * texto, com valor e maximo por extenso — "31.233 / 45.000 (69,4%)", o formato
 * do mockup de D-939. Escrever sempre duplicaria a porcentagem la; exigir o
 * parametro quebraria a chamada. Opcional deixa o rodape intocado.
 *
 * O texto vai por `setText`, que COMPARA ANTES DE ESCREVER. Este painel
 * repesquisa o estado a cada 250 ms: `textContent` direto somaria duas
 * invalidacoes de layout por volta e desfaria, por fora, o achado 5 da auditoria
 * de desempenho — que tem portao proprio em `hudNaoRedesenhaAToa.test.js`.
 *
 * O numero e DERIVADO aqui do que a janela nativa ja tem
 * (`base_exp`/`base_exp_next`): nao ha campo novo no pacote nem nada a pedir ao
 * servidor.
 */
function updateExpBar(root, selector, val, max, pctSelector) {
	const el = root.querySelector(selector);
	if (!el) {
		return;
	}
	const perc = max > 0 ? Math.max(0, Math.min(100, (val / max) * 100)) : 0;
	escreverLargura(el, perc + '%');
	if (pctSelector) {
		setText(root, pctSelector, formatPercent(val, max));
	}
}

/**
 * Re-read Session.Entity / BasicInfo.getUI() (see file header) and refresh
 * the DOM. Called once on append and then every POLL_INTERVAL_MS.
 */
function syncFromNativeState() {
	hideNativeBasicInfo();

	const entity = Session.Entity;
	if (!entity) {
		return;
	}

	const root = _root();
	const nativeUI = BasicInfo.getUI();
	const name = (entity.display && entity.display.name) || '';

	setText(root, '.bi-name', name || '—');

	const jobName = MonsterTable[entity.job];
	setText(root, '.bi-class', (jobName && JOB_PT[jobName]) || jobName || '—');

	const initialEl = root.querySelector('.bi-avatar-initial');
	if (initialEl) {
		escreverNoTexto(initialEl, name ? name.trim().charAt(0).toUpperCase() : '?');
	}

	syncAvatarPortrait(root, entity.job);

	if (entity.life) {
		updateLifeBar(root, 'hp', entity.life.hp || 0, entity.life.hp_max || 0);
		updateLifeBar(root, 'sp', entity.life.sp || 0, entity.life.sp_max || 0);
	}

	setText(root, '.bi-blvl-value', entity.clevel || 0);
	setText(root, '.bi-jlvl-value', entity.joblevel || 0);
	updateExpBar(root, '.bi-bexp-fill', nativeUI.base_exp || 0, nativeUI.base_exp_next || 0, '.bi-bexp-pct');
	updateExpBar(root, '.bi-jexp-fill', nativeUI.job_exp || 0, nativeUI.job_exp_next || 0, '.bi-jexp-pct');

	// Native BasicInfoCommon.update('weight', ...) divides by 10 before
	// display (BasicInfoCommon.js:507-512) — mirrored here so the number
	// shown matches the native window's own convention exactly.
	const weight = Math.floor((entity.weight || 0) / 10);
	const weightMax = Math.floor((nativeUI.weight_max || 0) / 10);
	setText(root, '.bi-weight', `${weight} / ${weightMax}`);

	setText(root, '.bi-zeny', formatZeny(Session.zeny));
	// O cash e MINOR desde o RO Shop (22/09/2026) e usa o MESMO formatador do
	// RO Shop e da Temporada (`formatarRoCash`, "8.620,00"): o jogador ve o
	// mesmo numero nas tres telas, e um preco de 1,50 nao fica sem casa.
	setText(root, '.bi-cash', formatarRoCash(Session.cash));

	sincronizarRodapeVertical(root, entity, nativeUI);
}

/**
 * O RODAPE DA HUD VERTICAL (D-939) — nivel de base + EXP com numeros.
 *
 * Roda no MESMO polling de tudo aqui, e nao num relogio proprio: o dado e o
 * mesmo que `.bi-blvl-value`/`.bi-bexp-fill` ja leem, so muda a apresentacao
 * (o mockup do dono mostra "31.233 / 45.000 (69,4%)" no rodape). O elemento e
 * `display:none` fora do celular em pe, e atualizar um span invisivel custa
 * nada perto de ramificar o polling por modo.
 */
function sincronizarRodapeVertical(root, entity, nativeUI) {
	if (!root.querySelector('.bi-rodape')) {
		return;
	}
	setText(root, '.bi-rodape-blvl', entity.clevel || 0);
	const val = nativeUI.base_exp || 0;
	const max = nativeUI.base_exp_next || 0;
	updateExpBar(root, '.bi-rodape-exp-fill', val, max);
	const pct = max > 0 ? Math.max(0, Math.min(100, (val / max) * 100)) : 0;
	// Virgula decimal de proposito: todo texto do jogador e pt-BR.
	setText(
		root,
		'.bi-rodape-exp-texto',
		`${formatZeny(val)} / ${formatZeny(max)} (${pct.toFixed(1).replace('.', ',')}%)`,
	);
}

/**
 * WIFI E BATERIA NO RODAPE (D-939).
 *
 * No PWA instalado o jogo roda em `display: fullscreen` e a barra de status
 * do aparelho SOME — o jogador perde o relogio de bateria do proprio
 * celular. O mockup do dono devolve os dois no rodape do jogo.
 *
 * As duas fontes sao de MELHOR ESFORCO, e falham para ESCONDIDO:
 *   - `navigator.getBattery` so existe em Chromium; onde nao existe (iOS),
 *     a bateria fica oculta em vez de mostrar um numero inventado (regra 1
 *     da casa: nada de numero inventado — vale ate aqui).
 *   - o wifi e `navigator.onLine`: um booleano honesto (conectado ou nao),
 *     sem fingir medir intensidade de sinal.
 */
/**
 * O PING NA HUD (23/09/2026): le o medidor da sessao a cada 2 s. O keepalive sai
 * a cada 10 s, entao o numero anda na mesma cadencia; ler mais vezes so garante
 * que ele aparece logo depois da primeira resposta.
 */
let _relogioDoPing = null;
function ligarPing() {
	if (_relogioDoPing) clearInterval(_relogioDoPing);
	const pintar = () => {
		const root = BasicInfoIdle._shadow || BasicInfoIdle._host;
		if (!root) return;
		const ms = medidorDePing.valor();
		const faixa = faixaDoPing(ms);
		for (const el of root.querySelectorAll('.bi-ping')) {
			// D-2385: a cada 2 s, quase sempre o mesmo numero; o texto igual nao e reescrito.
			escreverNoTexto(el, ms === null ? '— ms' : `${ms} ms`);
			el.classList.toggle('is-bom', faixa === 'bom');
			el.classList.toggle('is-medio', faixa === 'medio');
			el.classList.toggle('is-ruim', faixa === 'ruim');
		}
	};
	pintar();
	_relogioDoPing = setInterval(pintar, 2000);
}

function ligarBateriaEWifi() {
	const root = _root();
	const wifi = root.querySelector('.bi-rodape-wifi');
	const bateria = root.querySelector('.bi-rodape-bateria');
	if (!wifi || !bateria) {
		return;
	}

	const pintarWifi = () => {
		wifi.classList.toggle('is-off', typeof navigator !== 'undefined' && navigator.onLine === false);
	};
	window.addEventListener('online', pintarWifi);
	window.addEventListener('offline', pintarWifi);
	pintarWifi();

	if (typeof navigator === 'undefined' || typeof navigator.getBattery !== 'function') {
		bateria.style.display = 'none';
		return;
	}
	navigator
		.getBattery()
		.then(function (b) {
			const pintar = () => {
				const pct = Math.round((b.level || 0) * 100);
				const nivel = root.querySelector('.bi-rodape-bateria-nivel');
				const texto = root.querySelector('.bi-rodape-bateria-texto');
				if (nivel) {
					nivel.style.width = pct + '%';
				}
				if (texto) {
					texto.textContent = pct + '%';
				}
				bateria.classList.toggle('is-baixa', pct <= 20 && !b.charging);
			};
			b.addEventListener('levelchange', pintar);
			b.addEventListener('chargingchange', pintar);
			pintar();
		})
		.catch(function () {
			bateria.style.display = 'none';
		});
}

/**
 * Create component and export it
 */
export default UIManager.addComponent(BasicInfoIdle);
