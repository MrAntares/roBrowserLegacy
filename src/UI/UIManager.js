/**
 * UI/UIManager.js
 *
 * Manage Interface
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import GUIComponent from 'UI/GUIComponent.js';
import { localeDoIdioma } from 'Core/Idioma.js';
import CommonCSS from 'UI/Common.css?raw';
import UIVersionManager from 'UI/UIVersionManager.js';
import KEYS from 'Controls/KeyEventHandler.js';
import ClampToViewport from 'UI/ClampToViewport.js';
import EscalaDaHud from 'UI/escalaDaHud.js'; // D-934: a HUD diminui junto com a janela
import HudVertical from 'UI/hudVertical.js'; // D-939: a HUD vertical do celular em pe

/**
 * Centralize popup position
 * @returns {{top: string, left: string, zIndex: string}}
 */
function _popupPosition() {
	return {
		top: `${(window.innerHeight - 120) / 1.5 - 120}px`,
		left: `${(window.innerWidth - 280) / 2.0}px`,
		zIndex: '100'
	};
}

/**
 * Create a button with data-attributes for parseHTML to process
 * @param {string} name - button name (ex: 'ok', 'cancel')
 * @param {function} onClick - click callback (fires once)
 * @param {string} [label] - optional visible text. O bitmap do GRF (btn_ok.bmp
 *   etc.) ja tem o rotulo desenhado, entao os chamadores normais NAO passam
 *   isso -- passar teria um rotulo duplicado (bitmap + texto) quando o
 *   bitmap carrega. So usado pela caixa de erro de boot (showErrorBox), que
 *   tem de funcionar ANTES de qualquer asset do GRF existir: sem rotulo,
 *   vira um retangulo mudo sem dizer o que faz.
 * @returns {HTMLButtonElement}
 */
/**
 * O rotulo PT-BR do botao de caixa, a partir do NOME DE TEXTURA que os
 * chamadores ja passam ('ok'/'cancel' sao os unicos em uso — conferido com
 * grep em 27/08/2026). Nome fora do mapa volta como esta: rotulo estranho e
 * melhor que botao mudo.
 */
function _rotuloDeBotao(name) {
	return { ok: 'OK', cancel: 'Cancelar', yes: 'Sim', no: 'Nao' }[name] || name;
}

function _createButton(name, onClick, label) {
	const btn = document.createElement('button');
	/* Fase 3 (01/09/2026): o botao de caixa deixou de vestir bitmap do GRF
	   (btn_ok.bmp e familia). O rotulo agora e SEMPRE texto — traduzido por
	   _rotuloDeBotao — e a pele e a do design system: `.ri-btn` ja mora em
	   todo Shadow DOM via Common.css. `ok` continua primario; qualquer outro
	   nome (cancel/no) sai secundario, que e a hierarquia das nossas janelas.
	   O terceiro argumento sobrevive para quem quiser um rotulo especifico. */
	btn.className = name === 'ok' || name === 'yes' ? 'btn ri-btn' : 'btn ri-btn ri-btn--sec';
	btn.textContent = label || _rotuloDeBotao(name);

	/*
	 * DEDO E MOUSE (15/09/2026), e nao so o clique.
	 *
	 * Esta fabrica serve TODOS os botoes de caixa deste arquivo — inclusive o
	 * "Acordar agora" do "Dormindo..." e o "Continuar" do resumo do sono. O
	 * relato do dono foi sobre a tela de economia de energia, mas o defeito era
	 * desta forma inteira: `click` sozinho, numa interface que o projeto ja
	 * sabia precisar de `touchstart` (ver `ligarAoDedoEAoMouse`).
	 *
	 * Consertar AQUI e nao em cada chamador e o ponto: sao cinco sitios, e
	 * cinco copias da mesma correcao seriam cinco chances de uma envelhecer.
	 *
	 * O `clicked` continua: ele e outra guarda, de outro assunto — impede o
	 * SEGUNDO acionamento legitimo (dois toques rapidos em "OK"), enquanto a
	 * guarda de dentro do helper impede o `click` sintetizado do mesmo toque.
	 */
	let clicked = false;
	ligarAoDedoEAoMouse(btn, () => {
		if (clicked) return;
		clicked = true;
		onClick();
	});

	return btn;
}

/**
 * A GUARDA ENTRE O TOQUE E O CLIQUE — 750 ms, o mesmo de `MobileUI`.
 *
 * O `touchstart` dispara primeiro; o navegador SINTETIZA um `click` depois. Sem
 * a guarda, o handler rodaria duas vezes por toque.
 */
const MS_DE_GUARDA_DO_TOQUE = 750;

/**
 * O CLIQUE QUE NASCEU DE UM TOQUE ANTERIOR AO BOTAO (02/10/2026).
 *
 * Relato de jogador: com o evento de EXP ativo, confirmou o "Dormir" e nao
 * dormiu. So com bonus ativo o "Dormir" pergunta antes, e o "Sim" age no
 * `touchstart` e some; o `click` que o navegador sintetiza depois cai no que
 * estiver no ponto. MEDIDO (`scripts/diag-dormir-toque-fantasma.ts`): no
 * celular em pe o centro do "Sim" fica DENTRO do "Acordar agora" da tela de
 * sono que abre em seguida - se ela ja estiver na tela quando o clique chega,
 * o personagem acorda no ato. No Chromium o clique chegou antes da tela (nao
 * reproduziu); o tempo do Safari e outro. A guarda e barata e so engole o
 * clique cujo toque comecou ANTES de o botao existir: esse clique nao era
 * para ele.
 */
let _ultimoToqueMs = -Infinity;
if (typeof document !== 'undefined') {
	document.addEventListener(
		'touchstart',
		() => {
			_ultimoToqueMs = Date.now();
		},
		{ capture: true, passive: true }
	);
}

/**
 * LIGA UM BOTAO DE TELA CHEIA AO DEDO **E** AO MOUSE (15/09/2026).
 *
 * ---------------------------------------------------------------------------
 * POR QUE `click` SOZINHO NAO BASTA NESTE JOGO
 * ---------------------------------------------------------------------------
 * Relato do dono: *"o botao de 'voltar a jogar' no economia de energia nao
 * esta funcionando no iphone/mobile"*. O botao era um `<button>` de verdade,
 * com `addEventListener('click')` — e no desktop funciona.
 *
 * **O projeto ja sabia que isso nao basta**: `MobileUI.bindButton`
 * (`src/UI/Components/MobileUI/MobileUI.js`) existe exatamente para ligar
 * `click` E `touchstart` nos botoes do jogo, com uma guarda para o handler
 * nao rodar duas vezes. Ela nasceu para os controles da HUD e ficou presa la;
 * as telas CHEIAS deste arquivo (economia de energia, "Dormindo...", resumo do
 * sono) foram escritas depois e so escutaram `click`.
 *
 * Nao e regra nova: e a regra que ja existia, alcancando quem tinha ficado de
 * fora. Ela vive aqui, e nao importada da `MobileUI`, porque aquela casa a
 * um `root.querySelector(seletor)` e estes botoes sao elementos crus, criados
 * em DOM claro — o seletor nao existe.
 *
 * @param {HTMLElement} botao
 * @param {function(): void} aoAcionar
 */
function ligarAoDedoEAoMouse(botao, aoAcionar) {
	let peloToque = false;
	let soltar = null;
	const nascidoEm = Date.now();

	const limpar = () => {
		if (soltar !== null) {
			clearTimeout(soltar);
			soltar = null;
		}
	};
	const armarSoltura = () => {
		limpar();
		soltar = setTimeout(() => {
			soltar = null;
			peloToque = false;
		}, MS_DE_GUARDA_DO_TOQUE);
	};

	botao.addEventListener('click', evento => {
		// O `click` sintetizado depois do toque ja foi atendido: engole.
		if (peloToque) {
			peloToque = false;
			limpar();
			evento.preventDefault();
			evento.stopImmediatePropagation();
			return;
		}
		// O clique de um toque que comecou antes deste botao existir.
		if (_ultimoToqueMs <= nascidoEm && Date.now() - _ultimoToqueMs < MS_DE_GUARDA_DO_TOQUE) {
			evento.preventDefault();
			evento.stopImmediatePropagation();
			return;
		}
		aoAcionar();
	});
	botao.addEventListener('touchstart', evento => {
		peloToque = true;
		limpar();
		// Sem isto o toque tambem vira gesto da cena atras da tela cheia.
		evento.stopImmediatePropagation();
		// O toque ja acionou: o `click` que o navegador sintetizaria nao nasce.
		if (evento.cancelable) {
			evento.preventDefault();
		}
		aoAcionar();
	});
	botao.addEventListener('touchend', armarSoltura);
	botao.addEventListener('touchcancel', armarSoltura);
}

/**
 * Create overlay that blocks interaction with the game
 * @returns {HTMLDivElement}
 */
function _createOverlay() {
	const overlay = document.createElement('div');
	overlay.className = 'win_popup_overlay';
	document.body.appendChild(overlay);
	return overlay;
}

/** HH:MM:SS a partir de ms. Usado pelas duas telas pretas. */
function _relogioDeEspera(ms) {
	const total = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
	const h = String(Math.floor(total / 3600)).padStart(2, '0');
	const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
	const s = String(total % 60).padStart(2, '0');
	return `${h}:${m}:${s}`;
}

/**
 * A TELA PRETA DE ESPERA — o casco que o "Dormir" e a "economia de energia"
 * dividem (D-1485, 15/09/2026).
 *
 * ---------------------------------------------------------------------------
 * POR QUE ELE EXISTE
 * ---------------------------------------------------------------------------
 * Relato do dono sobre o "Dormir": *"a experiencia de uso esta muito simples...
 * gostaria que fosse igual a tela preta do 'economia de energia'... ao clicar
 * para dormir a tela nao fica preta, o personagem so fica parado"*.
 *
 * E ele estava descrevendo um DEFEITO, nao um gosto. O "Dormir" usava o clone
 * de `WinPopup` com `_createOverlay()`, e `.win_popup_overlay` **nao tem
 * `background` nenhum** (so `position: fixed` e `z-index`): ele barra o clique
 * e deixa a cena inteira visivel. Como o servidor ja tirou o personagem do
 * mundo em `iniciar`, o que sobra na tela e exatamente o que ele descreveu —
 * o boneco parado num cenario que nao anda mais.
 *
 * Escrever uma segunda tela preta ao lado da que ja funciona seria "duas rotas,
 * e a segunda escrita a mao" — o defeito que este projeto mais repete. Entao a
 * que existe virou casco e as duas passam por aqui.
 *
 * Quem chama recebe os PEDACOS (timer, aviso, resumo, botao, rodape) e escreve
 * neles; este modulo nao sabe o que cada tela mostra, so como ela e.
 *
 * @param {{titulo: string, rodape: string, textoDoBotao: string,
 *   onBotao: function(): void}} opcoes
 * @returns {{timer: HTMLElement, aviso: HTMLElement, resumo: HTMLElement,
 *   botao: HTMLElement, rodape: HTMLElement, remove: function(): void}}
 */
function _telaPretaDeEspera({ titulo, rodape, textoDoBotao, onBotao }) {
	const overlay = document.createElement('div');
	Object.assign(overlay.style, {
		position: 'fixed',
		inset: '0',
		background: '#000',
		color: '#e8e8e8',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		// 2000000, nunca o teto do cursor (2147483647, CursorManager.js) — o
		// mesmo numero que DeathWindow.css já usa como "camada solta mais
		// alta" (ver o censo no cabeçalho dele); `tests/ui/cursorAcimaDeTudo
		// .test.js` reprova qualquer z-index que alcance o do cursor.
		zIndex: '2000000',
		fontFamily: "'Figtree', Arial, 'Liberation Sans', Arimo, sans-serif",
		textAlign: 'center',
		gap: '12px',
		padding: '24px',
		boxSizing: 'border-box'
	});

	const elTitulo = document.createElement('div');
	Object.assign(elTitulo.style, { fontSize: '13px', opacity: '0.6', letterSpacing: '0.08em' });
	elTitulo.textContent = titulo;

	const elTimer = document.createElement('div');
	Object.assign(elTimer.style, {
		fontSize: 'clamp(32px, 8vw, 56px)',
		fontVariantNumeric: 'tabular-nums',
		fontWeight: '600'
	});

	const elResumo = document.createElement('div');
	Object.assign(elResumo.style, { fontSize: '14px', opacity: '0.85', lineHeight: '1.7' });

	/*
	 * A FAIXA DE AVISO, escondida por padrao. Na economia de energia ela diz
	 * que o personagem morreu (D-1398); no sono, que o pedido esta a caminho.
	 * Quem chama decide o texto e quando mostrar.
	 */
	const elAviso = document.createElement('div');
	elAviso.hidden = true;
	Object.assign(elAviso.style, {
		fontSize: '14px',
		fontWeight: '600',
		color: '#ffb454',
		background: 'rgba(255, 90, 60, 0.12)',
		border: '1px solid rgba(255, 180, 84, 0.4)',
		borderRadius: '6px',
		padding: '10px 16px',
		maxWidth: '420px'
	});

	const elBotao = document.createElement('button');
	elBotao.type = 'button';
	elBotao.textContent = textoDoBotao;
	Object.assign(elBotao.style, {
		marginTop: '16px',
		padding: '10px 28px',
		fontSize: '14px',
		fontWeight: '600',
		color: '#0a0a0a',
		background: '#e8c76a',
		border: 'none',
		borderRadius: '6px',
		cursor: 'pointer',
		// O piso tatil (D-935): esta tela cobre o viewport inteiro e o botao e a
		// UNICA saida dela — errar o alvo aqui e ficar preso.
		minHeight: '44px',
		minWidth: '44px'
	});
	/*
	 * DEDO E MOUSE (15/09/2026): era so `click`, e no iPhone o botao nao
	 * respondia — relato do dono. Ver `ligarAoDedoEAoMouse` para o porque.
	 */
	ligarAoDedoEAoMouse(elBotao, () => {
		if (onBotao) onBotao();
	});

	const elRodape = document.createElement('div');
	Object.assign(elRodape.style, { fontSize: '12px', opacity: '0.5', marginTop: '4px' });
	elRodape.textContent = rodape;

	overlay.append(elTitulo, elTimer, elAviso, elResumo, elBotao, elRodape);
	document.body.appendChild(overlay);

	return {
		timer: elTimer,
		aviso: elAviso,
		resumo: elResumo,
		botao: elBotao,
		rodape: elRodape,
		remove: () => overlay.remove()
	};
}

// Common CSS must live in a global <style> tag so document-level rules
// (body font-size/family, focus reset) apply to light DOM and are inherited
// by every component's Shadow DOM. UIComponent.js used to inject this at load;
// it now lives here since UIManager is always loaded.
(function injectCommonCSS() {
	let style = document.querySelector('style[data-common]');
	if (!style) {
		style = document.createElement('style');
		style.setAttribute('data-common', '');
		style.textContent = CommonCSS;
		document.head.appendChild(style);
	}
})();

/*
 * As faces do design system (Marcellus para titulo, Figtree para UI) entram
 * UMA vez por documento, aqui — e nao por @import dentro do Common.css, que
 * seria refeito dentro de cada Shadow DOM. O jogo roda num iframe, entao o
 * documento certo e este, o mesmo que recebe o CSS comum acima.
 *
 * Sem rede o <link> falha calado e a pilha de reserva (Arial/Liberation Sans)
 * assume: nenhuma tela quebra, so perde o acabamento tipografico. Por isso as
 * familias em Common.css declaram reserva, e nada aqui e bloqueante.
 */
(function injectDesignSystemFonts() {
	if (document.querySelector('link[data-ri-fontes]')) {
		return;
	}
	const preconnect = document.createElement('link');
	preconnect.rel = 'preconnect';
	preconnect.href = 'https://fonts.gstatic.com';
	preconnect.crossOrigin = 'anonymous';
	document.head.appendChild(preconnect);

	const link = document.createElement('link');
	link.setAttribute('data-ri-fontes', '');
	link.rel = 'stylesheet';
	link.href =
		'https://fonts.googleapis.com/css2?family=Marcellus&family=Figtree:wght@400;500;600;700;800&display=swap';
	document.head.appendChild(link);
})();

// Overlay CSS must live in the global <style> tag because overlay divs
// are appended to document.body (light DOM), not inside any Shadow DOM.
(function injectOverlayCSS() {
	let style = document.querySelector('style[data-overlay]');
	if (!style) {
		style = document.createElement('style');
		style.setAttribute('data-overlay', '');
		style.textContent = `  
			.win_popup_overlay {
				position: fixed;
				top: 0px;
				left: 0px;
				width: 100%;
				height: 100%;
				z-index: 99;
			}`;
		document.head.appendChild(style);
	}
})();

/**
 * Reorder keydown handlers so the popup captures first.
 * Moves the component's keydown handler to the capture phase so it fires before all other listeners.
 */
function _prioritizeKeyDown() {
	if (this._keyHandler) {
		window.removeEventListener('keydown', this._keyHandler);
		window.addEventListener('keydown', this._keyHandler, true);
	}
}

/**
 * User Interface Manager
 */
class UIManager {
	/**
	 * Components cache
	 * @var {array} Components List
	 */
	static components = {};

	/**
	 * Store a component in the manager
	 *
	 * @param {GUIComponent} component object
	 */
	static addComponent(component) {
		if (!(component instanceof GUIComponent)) {
			throw new Error('UIManager::addComponent() - Invalid type of component');
		}

		component.manager = this;
		this.components[component.name] = component;
		return component;
	}

	/**
	 * Get component stored in manager
	 *
	 * @param {string} component name
	 * @return {GUIComponent} object
	 */
	static getComponent(name) {
		const versionAlias = UIVersionManager.getUIAlias(name);
		if (versionAlias) {
			name = versionAlias;
		}

		if (!(name in this.components)) {
			throw new Error('UIManager.getComponent() - Component "' + name + '" not found');
		}

		return this.components[name];
	}

	/**
	 * Remove all components in screen
	 */
	static removeComponents(manter = []) {
		const keys = Object.keys(this.components);
		const count = keys.length;

		for (let i = 0; i < count; ++i) {
			/* `manter` (10/09/2026): a TROCA DE MAPA preserva o chat — ver
			   `MapRenderer.setMap`. Sem argumento, como em todo outro chamador
			   (login, selecao de personagem, sair do jogo), sai tudo. */
			if (manter.includes(keys[i])) continue;
			this.components[keys[i]].remove();
		}
	}

	/**
	 * When resizing window, some components can be outside the screen size and
	 * it sucks a lot. Try to correct the problem.
	 *
	 * @param {number} Game screen width
	 * @param {number} Game screen height
	 */
	static fixResizeOverflow(WIDTH, HEIGHT) {
		/*
		 * D-934: a HUD encolhe junto com a janela.
		 *
		 * Aqui, e nao so no `resize` do `escalaDaHud`, porque este e o ponto
		 * por onde TODA mudanca de tamanho passa — inclusive as que nao vem de
		 * um `resize` de janela (o `visualViewport` do teclado virtual, a
		 * troca de mapa que recria hosts). `reaplicar` ignora o cache do
		 * ultimo valor justamente porque um host NOVO precisa nascer com a
		 * escala que ja vigora.
		 */
		EscalaDaHud.reaplicar();
		/* D-939: mesmo motivo — um host recem-criado precisa nascer com a
		   marca `ri-vertical` que ja vigora, e este e o ponto por onde toda
		   mudanca de tamanho e todo host novo passam. */
		HudVertical.reaplicar();
		const keys = Object.keys(this.components);
		for (let i = 0; i < keys.length; ++i) {
			const component = this.components[keys[i]];
			const el = component.ui ? component.ui[0] : null;
			if (!el) continue;
			ClampToViewport(el, WIDTH, HEIGHT, component.magnet);
			if (component.onResize) {
				component.onResize();
			}
		}
	}

	/**
	 * Display an error box component
	 * Will reload the game once selected
	 *
	 * @param {string} error message
	 */
	static showErrorBox(text) {
		const WinError = this.getComponent('WinPopup').clone('WinError');
		WinError.riAnimaJanela = true; // entra/sai com a animacao unica (Fase 3)
		// eslint-disable-next-line
		let overlay;

		WinError.init = function Init() {
			const root = this._shadow;

			root.querySelector('.text').textContent = text;
			Object.assign(this._host.style, _popupPosition());

			root.querySelector('.btns').appendChild(
				_createButton(
					'ok',
					() => {
						overlay.remove();
						WinError.remove();
						import('Engine/GameEngine.js').then(m => m.default.reload());
					},
					'OK'
				)
			);
		};

		WinError.onKeyDown = function OnKeyDown(event) {
			event.stopImmediatePropagation();
			switch (event.which) {
				case KEYS.ENTER:
				case KEYS.ESCAPE:
					overlay.remove();
					this.remove();
					import('Engine/GameEngine.js').then(m => m.default.reload());
			}
		};

		overlay = _createOverlay();
		WinError.onAppend = _prioritizeKeyDown;
		WinError.append();

		return WinError;
	}

	/**
	 * Show a message box to the user
	 *
	 * @param {string} message to show
	 * @param {string} button name
	 * @param {function} callback once the button is pressed
	 */
	static showMessageBox(text, btn_name, callback, keydown) {
		const WinMSG = this.getComponent('WinPopup').clone('WinMSG');
		WinMSG.riAnimaJanela = true; // entra/sai com a animacao unica (Fase 3)

		WinMSG.init = function Init() {
			this.draggable();
			const root = this._shadow;

			root.querySelector('.text').textContent = text;
			Object.assign(this._host.style, _popupPosition());

			if (btn_name) {
				root.querySelector('.btns').appendChild(
					_createButton(btn_name, () => {
						WinMSG.remove();
						if (callback) callback();
					})
				);
			}
		};

		if (keydown) {
			WinMSG.onKeyDown = function (event) {
				switch (event.which) {
					case KEYS.ENTER:
					case KEYS.ESCAPE:
						this.remove();
						if (callback) callback();
				}
				event.stopImmediatePropagation();
			};

			WinMSG.onAppend = _prioritizeKeyDown;
		}

		WinMSG.append();
		return WinMSG;
	}

	/**
	 * A tela de "Dormindo..." (D-1381, 13/09/2026 — EXP projetada e aviso de
	 * aba em D-1386) — o servidor responde ao `CZ_ENTER2` com
	 * `ZC_RAGIDLE_SONO{dormindo:true}` em vez do `ZC_ACCEPT_ENTER2` normal,
	 * quando o personagem ainda esta no sono do "Dormir" ao logar (decisao
	 * "b" do dono: reconectar NAO acerta contas sozinho).
	 *
	 * Construida sobre o MESMO clone de `WinPopup` que `showErrorBox` usa, e
	 * pelo mesmo motivo: e a UNICA janela comprovada a renderizar NESTE ponto
	 * do boot — antes de `MapEngine` ter entrado em mundo nenhum, sem HUD e
	 * sem cena do Renderer.
	 *
	 * A EXP projetada (D-1386, achado do dono ao testar: a tela so dizia
	 * QUANTO TEMPO faltava, nunca o que aquele tempo valia) e recalculada a
	 * cada segundo, do mesmo jeito que o relogio — ela MOSTRA o preco de
	 * acordar cedo em vez de só dizer o prazo, e cai pra zero junto com o
	 * `restante`, nunca inventando um total fixo que a taxa medida não sustenta
	 * (regra 1). E a mesma razao do "pode fechar a aba": achamos essa lacuna
	 * numa auditoria de UX e nenhuma tela dizia isso ate aqui.
	 *
	 * @param {number} restanteMs tempo restante de sono, em ms
	 * @param {{expBasePorMs: number, expClassePorMs: number}} taxas taxa de EXP/ms
	 *   medida na amostra (a MESMA que o servidor congelou ao iniciar o sono)
	 * @param {function(): void} onAcordar chamado quando o jogador clica em "Acordar agora" —
	 *   so manda o pedido ao servidor (D-1387: quem fecha esta janela e reconecta e o
	 *   `dormindo:false` que chega depois, via `onSonoRecebido`, nunca o clique em si)
	 * @returns {{remove: function(): void}} quem chama fecha com `.remove()` se precisar —
	 *   fecha a janela E o overlay juntos (os dois sao peças separadas no DOM)
	 */
	static showDormindo(restanteMs, taxas, onAcordar) {
		let restante = Math.max(0, Number(restanteMs) || 0);
		const expBasePorMs = Number(taxas?.expBasePorMs) || 0;
		const expClassePorMs = Number(taxas?.expClassePorMs) || 0;
		let timer = null;
		let pedindo = false;

		const tela = _telaPretaDeEspera({
			titulo: 'DORMINDO',
			// RAGIDLE (24/09/2026, pedido do dono): as quatro duvidas que os jogadores fazem, respondidas na tela.
			rodape:
				'Pode fechar o jogo com segurança — o sono continua sem ele. Dormindo, o personagem não luta nem morre ' +
				'e ganha só EXP (base e classe), até 8 h. Loot e zeny só caçando online.',
			textoDoBotao: 'Acordar agora',
			onBotao: () => {
				/*
				 * UM CLIQUE SO PEDE (D-1387). A tela NAO fecha e NAO reconecta
				 * aqui: quem a fecha e o `dormindo:false` que chega depois, em
				 * `onSonoRecebido`. O botao vira "Acordando..." e sai de
				 * servico para nao aceitar um segundo clique — a guarda
				 * `pedindo` existe porque `disabled` barra o `click` mas nao
				 * necessariamente o `touchstart` que `ligarAoDedoEAoMouse` usa.
				 */
				if (pedindo) {
					return;
				}
				pedindo = true;
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
				tela.botao.disabled = true;
				tela.botao.textContent = 'Acordando...';
				tela.botao.style.opacity = '0.6';
				tela.botao.style.cursor = 'default';
				onAcordar();
			}
		});

		function desenhar() {
			tela.timer.textContent = _relogioDeEspera(restante);
			const expBase = Math.round(expBasePorMs * restante).toLocaleString(localeDoIdioma());
			const expClasse = Math.round(expClassePorMs * restante).toLocaleString(localeDoIdioma());
			tela.resumo.textContent = `~${expBase} EXP base · ~${expClasse} EXP classe pela frente`;
		}

		desenhar();
		// O contador na TELA, a cada segundo e sem depender de outro tique. O
		// relogio daqui e so mostrador: quem manda a verdade e o servidor.
		timer = setInterval(() => {
			restante = Math.max(0, restante - 1000);
			desenhar();
			if (restante <= 0 && timer) {
				clearInterval(timer);
				timer = null;
			}
		}, 1000);

		return {
			remove: () => {
				// O `clearInterval` AQUI e conserto, e nao arrumacao: a versao
				// anterior so limpava o intervalo dentro do clique do botao,
				// entao fechar a tela por qualquer outro caminho — o teto de
				// seguranca de 8 s, por exemplo — deixava um `setInterval`
				// rodando para sempre contra um DOM ja removido.
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
				tela.remove();
			}
		};
	}

	/**
	 * O RESUMO DO "DORMIR" (D-1387, 13/09/2026) — pedido do dono e do Jhow no
	 * grupo de teste ("abrir uma janela com o resumo do Farm off"), depois de
	 * relatar que voltar do sono parecia bugado. Mostrado depois que o servidor
	 * confirma o "acordar" (`onSonoRecebido`), ANTES de reconectar — o jogador
	 * ve o que ganhou antes da tela mudar para o boot/login.
	 *
	 * Mesmo clone de `WinPopup`, pelo mesmo motivo das outras telas do "Dormir":
	 * e a unica janela comprovada a renderizar antes de `MapEngine` ter entrado
	 * em mundo nenhum.
	 *
	 * @param {{expBase: number, expClasse: number, tempoDormidoMs: number}} resumo
	 * @param {function(): void} onContinuar chamado quando o jogador fecha o resumo — e aqui
	 *   que quem chama deve reconectar
	 * @returns {object} o componente aberto
	 */
	static showResumoDoSono(resumo, onContinuar) {
		const WinResumo = this.getComponent('WinPopup').clone('WinResumoSono');
		WinResumo.riAnimaJanela = true;
		let overlay;

		function textoDoResumo() {
			const totalMin = Math.max(0, Math.floor((Number(resumo?.tempoDormidoMs) || 0) / 60000));
			const h = Math.floor(totalMin / 60);
			const m = totalMin % 60;
			const tempo = h > 0 ? `Você dormiu ${h}h ${m}min e ganhou:` : `Você dormiu ${m}min e ganhou:`;
			const expBase = Math.round(Number(resumo?.expBase) || 0).toLocaleString(localeDoIdioma());
			const expClasse = Math.round(Number(resumo?.expClasse) || 0).toLocaleString(localeDoIdioma());
			return `${tempo}\n${expBase} EXP base · ${expClasse} EXP classe`;
		}

		function fechar() {
			overlay.remove();
			WinResumo.remove();
			onContinuar();
		}

		WinResumo.init = function Init() {
			const root = this._shadow;
			root.querySelector('.text').textContent = textoDoResumo();
			Object.assign(this._host.style, _popupPosition());
			root.querySelector('.btns').appendChild(_createButton('ok', fechar, 'Continuar'));
		};

		WinResumo.onKeyDown = function OnKeyDown(event) {
			switch (event.which) {
				case KEYS.ENTER:
				case KEYS.ESCAPE:
					fechar();
			}
			event.stopImmediatePropagation();
		};

		overlay = _createOverlay();
		WinResumo.onAppend = _prioritizeKeyDown;
		WinResumo.append();

		return WinResumo;
	}

	/*
	 * `showEconomiaDeEnergia` SAIU em 07/10/2026 (Novo Bot V5): a economia de
	 * energia saiu do cliente com o combate do Modo Classico (ver o cabecalho
	 * de `onEconomiaRecebida` em `Engine/MapEngine.js`). A tela preta de espera
	 * (`_telaPretaDeEspera`) segue viva para o "Dormindo..." de um sono antigo.
	 */

	/**
	 * Prompt a message to the user
	 *
	 * @param {string} message to show
	 * @param {string} button ok
	 * @param {string} button cancel
	 * @param {function} callback when ok is pressed
	 * @param {function} callback when cancel is pressed
	 */
	static showPromptBox(text, btn_yes, btn_no, onYes, onNo) {
		const WinPrompt = this.getComponent('WinPopup').clone('WinPrompt');
		WinPrompt.riAnimaJanela = true; // entra/sai com a animacao unica (Fase 3)

		WinPrompt.init = function Init() {
			this.draggable();
			const root = this._shadow;

			root.querySelector('.text').textContent = text;
			Object.assign(this._host.style, _popupPosition());

			const btnsContainer = root.querySelector('.btns');

			/*
			 * RAGIDLE (27/08/2026): o ROTULO em texto entra SEMPRE, e em
			 * portugues. `_createButton` ja aceitava o terceiro argumento (e o
			 * proprio comentario dele avisa: "sem rotulo, vira um retangulo
			 * mudo") — so que esta caixa nunca o passava, confiando no bitmap
			 * `btn_ok.bmp`/`btn_cancel.bmp`... que NAO existe no GRF LATAM
			 * deste projeto. Medido com a troca a dois em 27/08: o convite
			 * "(Analista) requests a deal" chegava com DOIS retangulos mudos —
			 * aceitar era adivinhar. O CSS do WinPopup ja esperava o texto
			 * DOM (WinPopup.css:90-93).
			 */
			btnsContainer.appendChild(
				_createButton(
					btn_yes,
					() => {
						WinPrompt.remove();
						if (onYes) onYes();
					},
					_rotuloDeBotao(btn_yes)
				)
			);

			btnsContainer.appendChild(
				_createButton(
					btn_no,
					() => {
						WinPrompt.remove();
						if (onNo) onNo();
					},
					_rotuloDeBotao(btn_no)
				)
			);
		};

		WinPrompt.append();
		return WinPrompt;
	}

	/*
	 * `showContagemRegressiva` SAIU em 15/09/2026 (D-1485).
	 *
	 * Ela era a contagem de 5 s do "Dormir" (D-1381), e o dono pediu a tela
	 * preta DIRETO — sem espera. Com aquele chamador removido ela ficou sem
	 * nenhum: um helper de UI sem chamador e o mesmo padrao que deixou 12
	 * arquivos do `viewer/` rodando mortos por 17 dias (D-1076), com duas
	 * baterias de mutacao apontando para o vazio e ninguem notando.
	 *
	 * O git lembra dela se um dia voltar a fazer falta.
	 */

	/**
	 * Reload CSS of a component
	 * @param {string} componentName
	 * @param {string} newCssText
	 */
	static reloadCSS(componentName, newCssText) {
		GUIComponent.reloadCSS(componentName, newCssText);
	}
}
/**
 * Export
 */
export default UIManager;
