/**
 * UI/Components/GraphicsOption/GraphicsOption.js
 *
 * Manage Graphics details
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault, AoShinHo
 */

import FPS from 'UI/Components/FPS/FPS.js';
import Configs from 'Core/Configs.js';
import Context from 'Core/Context.js';
import Preferences from 'Core/Preferences.js';
import GraphicsSettings from 'Preferences/Graphics.js';
import NomesDosJogadores from 'Engine/MapEngine/NomesDosJogadores.js'; // RAGIDLE
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './GraphicsOption.html?raw';
import cssText from './GraphicsOption.css?raw';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js'; // RAGIDLE

import MemoryManager from 'Core/MemoryManager.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';

/**
 * Create Component
 */
const GraphicsOption = new GUIComponent('GraphicsOption', cssText);

/**
 * @var {string[]} RAGIDLE: as duas abas, na ordem do HTML — a lista que valida
 *      o que veio do `localStorage`.
 */
const ABAS = ['basic', 'advanced'];

/**
 * @var {string} RAGIDLE: a aba de fabrica.
 */
const ABA_PADRAO = 'basic';

/**
 * @var {Preferences} Graphics — posicao e, desde 31/08/2026, a ABA em que o
 *      jogador estava (`aba`, ver UI/Components/memoriaDeAba.js). A versao
 *      continua 1.1: somar chave nova aos padroes nao exige subir versao, e
 *      subir apagaria a posicao ja salva.
 */
const _preferences = Preferences.get(
	'GraphicsOption',
	{
		x: 300,
		y: 300,
		aba: null
	},
	1.1
);

/**
 * RAGIDLE: acende uma aba e mostra o painel dela. Saiu de dentro do
 * `onTabSwitch` porque agora tem dois chamadores — o clique e o `onAppend`,
 * que precisa reabrir na aba lembrada.
 */
function aplicarAba(root, nome) {
	const alvo = root.querySelector('#' + nome);
	if (!alvo) {
		return;
	}
	root.querySelectorAll('.tab-button').forEach(b => {
		b.classList.toggle('selected', b.dataset.tab === nome);
	});
	root.querySelectorAll('.tab-content').forEach(tc => {
		tc.classList.remove('selected');
	});
	alvo.classList.add('selected');
}

/**
 * Render HTML
 */
GraphicsOption.render = () => htmlText;

/**
 * Initialize UI
 */
GraphicsOption.init = function init() {
	const root = this.getRoot();

	const baseBtn = root.querySelector('.base');
	if (baseBtn) {
		baseBtn.addEventListener('mousedown', event => {
			event.stopImmediatePropagation();
			event.preventDefault();
		});
	}

	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => {
			e.stopImmediatePropagation();
		});
		closeBtn.addEventListener('click', () => {
			GraphicsOption.remove();
		});
	}

	root.querySelectorAll('.tab-button').forEach(btn => {
		btn.addEventListener('click', onTabSwitch);
	});

	const resetBtn = root.querySelector('.reset-button');
	if (resetBtn) {
		resetBtn.addEventListener('click', onResetToDefaults.bind(this));
	}

	const bindChange = (selector, handler) => {
		const el = root.querySelector(selector);
		if (el) el.addEventListener('change', handler);
	};

	bindChange('.details', onUpdateQualityDetails);
	bindChange('.player-names', onTogglePlayerNames);
	bindChange('.cursor-option', onToggleGameCursor);
	bindChange('.screensize', onUpdateScreenSize);
	bindChange('.fpslimit', onUpdateFPSLimit);
	bindChange('.fps', onToggleFPSDisplay);
	bindChange('.pixel-perfect', onTogglePixelPerfect);

	// Post-Processing
	bindChange('.bloom', onToggleBloom);
	bindChange('.bloom-intensity', onUpdateBloomIntensity);
	bindChange('.blur', onToggleBlur);
	bindChange('.blur-intensity', onUpdateBlurIntensity);
	bindChange('.blur-area', onUpdateBlurArea);
	bindChange('.casEnabled', oncasEnabled);
	bindChange('.casContrast', oncasContrast);
	bindChange('.casSharpening', oncasSharpening);
	bindChange('.fxaaEnabled', onfxaaEnabled);
	bindChange('.fxaaSubpix', onfxaaSubpix);
	bindChange('.fxaaEdgeThreshold', onfxaaEdgeThreshold);
	bindChange('.vibranceEnabled', onvibranceEnabled);
	bindChange('.vibrance', onvibrance);
	bindChange('.cartoonEnabled', oncartoonEnabled);
	bindChange('.cartoonPower', oncartoonPower);
	bindChange('.cartoonEdgeSlope', oncartoonEdgeSlope);

	// Performance Mode
	bindChange('.performanceMode', onTogglePerformanceMode);
	bindChange('.view-area', onUpdateAreaView);

	this.draggable('.titlebar');
};

/**
 * When append the element to html
 */
GraphicsOption.onAppend = function onAppend() {
	this._host.style.top = `${_preferences.y}px`;
	this._host.style.left = `${_preferences.x}px`;

	const root = this.getRoot();

	// RAGIDLE: a aba em que o jogador estava. O HTML nasce com "basic" aceso,
	// entao sem isto quem fechou em "Advanced" reabria em "Basic".
	aplicarAba(root, abaLembrada(_preferences, ABA_PADRAO, ABAS));

	root.querySelector('.details').value = GraphicsSettings.quality;
	root.querySelector('.screensize').value = GraphicsSettings.screensize;
	// `!== false` e o mesmo criterio de `NomesDosJogadores.ligado()`: preferencia
	// gravada ANTES desta opcao existir nao tem o campo, e o padrao e LIGADO.
	root.querySelector('.player-names').checked = GraphicsSettings.showPlayerNames !== false;
	root.querySelector('.cursor-option').checked = GraphicsSettings.cursor;
	root.querySelector('.fpslimit').value = GraphicsSettings.fpslimit;
	root.querySelector('.fps').checked = FPS._host ? FPS._host.style.display !== 'none' : false;
	root.querySelector('.pixel-perfect').checked = GraphicsSettings.pixelPerfectSprites;

	// Post-Processing
	root.querySelector('.bloom').checked = GraphicsSettings.bloom;
	root.querySelector('.bloom-intensity').value = GraphicsSettings.bloomIntensity;
	root.querySelector('.blur').checked = GraphicsSettings.blur;
	root.querySelector('.blur-area').value = GraphicsSettings.blurArea;
	root.querySelector('.blur-intensity').value = GraphicsSettings.blurIntensity;
	root.querySelector('.fxaaEnabled').checked = GraphicsSettings.fxaaEnabled;
	root.querySelector('.fxaaSubpix').value = GraphicsSettings.fxaaSubpix;
	root.querySelector('.fxaaEdgeThreshold').value = GraphicsSettings.fxaaEdgeThreshold;
	root.querySelector('.vibranceEnabled').checked = GraphicsSettings.vibranceEnabled;
	root.querySelector('.vibrance').value = GraphicsSettings.vibrance;
	root.querySelector('.casEnabled').checked = GraphicsSettings.casEnabled;
	root.querySelector('.casContrast').value = GraphicsSettings.casContrast;
	root.querySelector('.casSharpening').value = GraphicsSettings.casSharpening;
	root.querySelector('.cartoonEnabled').checked = GraphicsSettings.cartoonEnabled;
	root.querySelector('.cartoonEdgeSlope').value = GraphicsSettings.cartoonEdgeSlope;
	root.querySelector('.cartoonPower').value = GraphicsSettings.cartoonPower;

	// Performance Mode
	root.querySelector('.performanceMode').checked = GraphicsSettings.performanceMode;
	root.querySelector('.view-area').value = GraphicsSettings.viewArea;
};

/**
 * Once remove, save preferences
 */
GraphicsOption.onRemove = function onRemove() {
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.save();
};

/**
 * Modify game details to perform faster
 */
function onUpdateQualityDetails() {
	GraphicsSettings.quality = parseInt(this.value, 10);
	GraphicsSettings.save();

	Configs.set('quality', GraphicsSettings.quality);
	Renderer.resize();
}

/**
 * Toggle game cursor
 */
/**
 * RAGIDLE: liga/desliga o nome e a guilda dos jogadores sempre visiveis
 * (28/08/2026, pedido do dono).
 *
 * A reaplicacao em todo mundo NAO e enfeite: sem ela a opcao so valeria para
 * quem entrasse na vista DEPOIS, e o jogador que acabou de clicar veria a tela
 * nao mudar — o que se le como opcao quebrada.
 */
function onTogglePlayerNames() {
	GraphicsSettings.showPlayerNames = !!this.checked;
	GraphicsSettings.save();
	NomesDosJogadores.reaplicarEmTodos();
}

function onToggleGameCursor() {
	GraphicsSettings.cursor = !!this.checked;
	GraphicsSettings.save();

	if (!GraphicsSettings.cursor) {
		document.body.classList.remove('custom-cursor');
	} else {
		document.body.classList.add('custom-cursor');
	}
}

/**
 * Update the fps limit
 */
function onUpdateFPSLimit() {
	GraphicsSettings.fpslimit = parseInt(this.value, 10);
	// A escolha do jogador vence o teto do celular (`Renderer/tetoDeQuadrosNoCelular.js`).
	GraphicsSettings.fpslimitEscolhido = true;
	GraphicsSettings.save();

	if (Renderer.frameLimit > 0) {
		clearInterval(Renderer.updateId);
	}

	Renderer.frameLimit = GraphicsSettings.fpslimit;
	Renderer.rendering = false;
	Renderer.render(null);
}

/**
 * Toggle the fps display
 */
function onToggleFPSDisplay() {
	FPS.toggle(!!this.checked);
}

function onTogglePixelPerfect() {
	GraphicsSettings.pixelPerfectSprites = !!this.checked;
	GraphicsSettings.save();

	if (GraphicsSettings.pixelPerfectSprites) {
		function reloadSprites() {
			const gl = Renderer.getContext();
			const sprFiles = MemoryManager.search(/\.spr$/i);
			for (let i = 0; i < sprFiles.length; i++) {
				MemoryManager.remove(gl, sprFiles[i]);
			}
		}
		reloadSprites();
	} else {
		ChatBox.addText(
			'[System] Pixel Perfect is disabled. Reload the page (F5) to apply the changes.',
			ChatBox.TYPE.INFO,
			ChatBox.FILTER.PUBLIC_LOG
		);
	}
}

/**
 * Post-Processing
 */
function onToggleBloom() {
	GraphicsSettings.bloom = !!this.checked;
	GraphicsSettings.save();
}

function onUpdateBloomIntensity() {
	GraphicsSettings.bloomIntensity = parseFloat(this.value);
	GraphicsSettings.save();
}

function onToggleBlur() {
	GraphicsSettings.blur = !!this.checked;
	GraphicsSettings.save();
}

function onUpdateBlurIntensity() {
	GraphicsSettings.blurIntensity = parseFloat(this.value);
	GraphicsSettings.save();
}

function onUpdateBlurArea() {
	GraphicsSettings.blurArea = parseFloat(this.value);
	GraphicsSettings.save();
}

function oncasEnabled() {
	GraphicsSettings.casEnabled = !!this.checked;
	GraphicsSettings.save();
}

function oncasContrast() {
	GraphicsSettings.casContrast = parseFloat(this.value);
	GraphicsSettings.save();
}

function oncasSharpening() {
	GraphicsSettings.casSharpening = parseFloat(this.value);
	GraphicsSettings.save();
}

function onvibranceEnabled() {
	GraphicsSettings.vibranceEnabled = !!this.checked;
	GraphicsSettings.save();
}

function onvibrance() {
	GraphicsSettings.vibrance = parseFloat(this.value);
	GraphicsSettings.save();
}

function onfxaaEnabled() {
	GraphicsSettings.fxaaEnabled = !!this.checked;
	GraphicsSettings.save();
}

function onfxaaSubpix() {
	GraphicsSettings.fxaaSubpix = parseFloat(this.value);
	GraphicsSettings.save();
}

function onfxaaEdgeThreshold() {
	GraphicsSettings.fxaaEdgeThreshold = parseFloat(this.value);
	GraphicsSettings.save();
}

function oncartoonEnabled() {
	GraphicsSettings.cartoonEnabled = !!this.checked;
	GraphicsSettings.save();
}

function oncartoonPower() {
	GraphicsSettings.cartoonPower = parseFloat(this.value);
	GraphicsSettings.save();
}

function oncartoonEdgeSlope() {
	GraphicsSettings.cartoonEdgeSlope = parseFloat(this.value);
	GraphicsSettings.save();
}

/**
 * Performance Mode
 */
function onTogglePerformanceMode() {
	GraphicsSettings.performanceMode = !!this.checked;
	GraphicsSettings.save();
}

function onUpdateAreaView() {
	GraphicsSettings.viewArea = parseInt(this.value);
	GraphicsSettings.save();
}

/**
 * Resizing window size
 */
function onUpdateScreenSize() {
	const isFullScreen = Context.isFullScreen();

	GraphicsSettings.screensize = this.value;
	GraphicsSettings.save();

	if (GraphicsSettings.screensize === 'full') {
		if (!isFullScreen) {
			Context.requestFullScreen();
		}
		return;
	}

	if (isFullScreen) {
		Context.cancelFullScreen();
	}

	if (Context.Is.POPUP) {
		const size = GraphicsSettings.screensize.split('x');

		if (size[0] != window.innerWidth && size[1] != window.innerHeight) {
			window.resizeTo(size[0], size[1]);
			window.moveTo((screen.availWidth - size[0]) / 2, (screen.availHeight - size[1]) / 2);
		}
	}
}

function onTabSwitch(event) {
	const tabName = event.currentTarget.dataset.tab;

	aplicarAba(GraphicsOption.getRoot(), tabName);
	lembrarAba(_preferences, tabName); // RAGIDLE
}

function onResetToDefaults() {
	const defaultSettings = GraphicsSettings.defaults;

	Object.keys(defaultSettings).forEach(key => {
		if (defaultSettings.hasOwnProperty(key)) {
			GraphicsSettings[key] = defaultSettings[key];
		}
	});
	GraphicsSettings.save();

	GraphicsOption.onAppend();
}

GraphicsOption.needFocus = true;
GraphicsOption.mouseMode = GUIComponent.MouseMode.STOP;

/**
 * Create component and export it
 */
export default UIManager.addComponent(GraphicsOption);
