/**
 * UI/Components/NpcBox/NpcBox.js
 *
 * NPC Box windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import KEYS from 'Controls/KeyEventHandler.js';
import { trechoTraduzido } from './trechoDaFala.js';
import { textoDoNpcEmHtml } from './textoDoNpc.js'; // 12/10/2026: a fala inteira escapada, menos as tags do RO
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import Navigation from 'UI/Components/Navigation/Navigation.js';
import htmlText from './NpcBox.html?raw';
import cssText from './NpcBox.css?raw';
import NpcMenu from 'UI/Components/NpcMenu/NpcMenu.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import { ehDedo } from 'UI/escalaDaHud.js';
import { posicaoHorizontal } from 'UI/Components/NpcMenu/posicaoDoMenu.js';
import { registrarConversa, componenteNaTela } from 'UI/conversaNaTela.js';

/**
 * Create NpcBox component
 */
const NpcBox = new GUIComponent('NpcBox', cssText);

/* Dialogo entra/sai com a animacao unica (Fase 3, 01/09/2026). */
NpcBox.riAnimaJanela = true;

NpcBox.render = () => htmlText;

/**
 * Freeze mouse — NPC dialog blocks interaction
 */
NpcBox.mouseMode = GUIComponent.MouseMode.FREEZE;

/**
 * @var {boolean} does the box need to be clean up?
 */
let _needCleanUp = false;

/**
 * @var {integer} NPC GID
 */
NpcBox.ownerID = 0;

/**
 * Initialize Component
 */
NpcBox.init = function init() {
	this._host.style.top = `${Math.max(100, Renderer.height / 2 - 200)}px`;
	this._host.style.left = `${Math.max(Renderer.width / 3, 20)}px`;

	const root = NpcBox.getRoot();

	const nextBtn = root.querySelector('.next');
	if (nextBtn) {
		nextBtn.addEventListener('click', () => NpcBox.next());
	}

	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => NpcBox.close());
	}

	const content = root.querySelector('.content');
	if (content) {
		content.addEventListener('mousedown', e => e.stopImmediatePropagation());
	}

	// Event delegation for item links inside shadow DOM
	root.addEventListener('click', e => {
		const itemLink = e.target.closest('.item-link');
		if (itemLink) {
			const itemId = parseInt(itemLink.dataset.itemId, 10);
			if (!itemId) {
				return;
			}
			if (ItemInfo.uid === itemId) {
				ItemInfo.remove();
				return;
			}
			ItemInfo.append();
			ItemInfo.uid = itemId;
			ItemInfo.setItem({ ITID: itemId, IsIdentified: true });
			return;
		}

		const naviLink = e.target.closest('.navi-link');
		if (naviLink) {
			const naviInfo = naviLink.dataset.naviInfo;
			const displayName = naviLink.dataset.naviName;
			if (!naviInfo) {
				return;
			}
			if (Navigation.uid === naviInfo && Navigation._host && Navigation._host.style.display !== 'none') {
				Navigation.hide();
				return;
			}
			Navigation.show();
			Navigation.uid = naviInfo;
			Navigation.setNaviInfo(naviInfo, displayName);
		}
	});

	this.draggable();
};

/**
 * NO DEDO, A FALA FICA NO CENTRO (D-2049, 06/10/2026).
 *
 * A fala nasce em `left = max(W/3, 20)` (o lugar do desktop). Num celular em
 * pe de 393px isso e 131, a caixa de 320 passava da tela, e o encaixe do
 * `GUIComponent` a empurrava contra a borda direita: de 73 a 393, colada. O
 * menu da D-2047 ja ficava centralizado, com 8px das bordas — e a fala agora
 * usa a MESMA regra (`posicaoHorizontal`), para os dois ficarem na mesma
 * coluna. A cada abertura, porque o celular gira.
 *
 * No mouse nada muda: a fala fica onde nasceu ou onde o jogador a arrastou.
 * Em pixels da TELA, convertido pelo `zoom` do host (o mesmo cuidado do
 * `NpcMenu.js`).
 */
NpcBox.onAppend = function onAppend() {
	if (!ehDedo() || !this._host) {
		return;
	}
	const zoom = parseFloat(this._host.style.zoom) || 1;
	const caixa = this._host.getBoundingClientRect();
	if (!caixa.width) {
		return;
	}
	const left = posicaoHorizontal({
		telaLargura: window.innerWidth,
		largura: caixa.width,
		preferida: caixa.left,
		centralizar: true
	});
	this._host.style.left = `${Math.round(left) / zoom}px`;
};

/**
 * Once NPC Box is removed from HTML, clean up data
 */
NpcBox.onRemove = function onRemove() {
	const root = NpcBox.getRoot();

	const nextBtn = root.querySelector('.next');
	if (nextBtn) {
		nextBtn.style.display = 'none';
	}

	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.style.display = 'none';
	}

	const content = root.querySelector('.content');
	if (content) {
		content.textContent = '';
	}

	_needCleanUp = false;
	NpcBox.ownerID = 0;

	const cutin = document.getElementById('cutin');
	if (cutin) {
		document.body.removeChild(cutin);
	}
};

function _isVisible(el) {
	return !!el && getComputedStyle(el).display !== 'none';
}

/**
 * Add support for Enter key
 */
NpcBox.onKeyDown = function onKeyDown(event) {
	if (NpcMenu._host && NpcMenu._host.style.display !== 'none' && NpcMenu.__active) {
		return true;
	}

	if (InputBox._host && InputBox._host.style.display !== 'none' && InputBox.__active) {
		return true;
	}

	if (this._host.style.display === 'none') {
		return true;
	}

	const root = NpcBox.getRoot();

	switch (event.which) {
		case KEYS.SPACE:
		case KEYS.ENTER: {
			const nextBtn = root.querySelector('.next');
			if (_isVisible(nextBtn)) {
				this.next();
				break;
			}
			const closeBtn = root.querySelector('.close');
			if (_isVisible(closeBtn)) {
				this.close();
				break;
			}
			return true;
		}

		case KEYS.ESCAPE: {
			const closeBtn = root.querySelector('.close');
			if (_isVisible(closeBtn)) {
				this.close();
				break;
			}
			return true;
		}

		default:
			return true;
	}

	event.stopImmediatePropagation();
	return false;
};

/**
 * Add text to box
 *
 * @param {string} text to display
 * @param {number} gid - npc id
 */
/** As linhas cruas da pagina atual do dialogo (para traduzir a pagina inteira, D-1929). */
let _linhasDaPagina = [];

NpcBox.setText = function setText(text, gid) {
	const root = NpcBox.getRoot();
	const content = root.querySelector('.content');
	NpcBox.ownerID = gid;

	if (_needCleanUp) {
		_needCleanUp = false;
		content.textContent = '';
		_linhasDaPagina = [];
	}

	const div = document.createElement('div');
	div.innerHTML = textoDoNpcEmHtml(text);
	content.appendChild(div);

	/*
	 * O JOGO EM INGLES (D-1929): o servidor quebra a fala em linhas de 116
	 * caracteres, e a traducao e da PAGINA. A cada linha nova, o texto cru da
	 * pagina inteira e tentado no catalogo; casando, as linhas dao lugar a UM
	 * bloco com a traducao (a caixa quebra sozinha). O bloco traduzido leva
	 * `translate="no"` para o observador nao tentar traduzir o ingles de novo.
	 */
	_linhasDaPagina.push({ texto: text, div });
	/* O TRECHO MAIS RECENTE, e nao so a pagina inteira (achado da frente D2):
	   o titulo "[Guardia da Praca]" casa sozinho na primeira linha, e dai em
	   diante "titulo + fala" nunca casaria. Tenta do inicio da pagina ate a
	   linha nova, o mais longo primeiro; o que ja estava traduzido fica. */
	const achado = trechoTraduzido(_linhasDaPagina.map(l => l.texto));
	if (achado !== null) {
		for (const linha of _linhasDaPagina.slice(achado.inicio)) {
			linha.div.remove();
		}
		const bloco = document.createElement('div');
		bloco.setAttribute('translate', 'no');
		bloco.innerHTML = textoDoNpcEmHtml(achado.traducao);
		content.appendChild(bloco);
		_linhasDaPagina = [..._linhasDaPagina.slice(0, achado.inicio), { texto: achado.texto, div: bloco }];
	}
};

/**
 * Add next button
 *
 * @param {number} gid - npc id
 */
/**
 * O MENU COMECA UMA PAGINA NOVA para a traducao (D-1929). A caixa nao limpa
 * o texto depois da escolha — a resposta e escrita embaixo da introducao —,
 * mas a traducao e da PAGINA, e o catalogo tem a introducao e cada resposta
 * separadas. O que ja esta na tela fica; so o acumulador recomeca.
 */
NpcBox.novaPaginaDeTraducao = function novaPaginaDeTraducao() {
	_linhasDaPagina = [];
};

NpcBox.addNext = function addNext(gid) {
	NpcBox.ownerID = gid;
	const root = NpcBox.getRoot();
	const nextBtn = root.querySelector('.next');
	if (nextBtn) {
		nextBtn.style.display = 'block';
	}
};

/**
 * Add close button
 *
 * @param {number} gid - npc id
 */
NpcBox.addClose = function addClose(gid) {
	NpcBox.ownerID = gid;
	const root = NpcBox.getRoot();
	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.style.display = 'block';
	}
};

/**
 * Press "next" button
 */
NpcBox.next = function next() {
	_needCleanUp = true;
	const root = NpcBox.getRoot();
	const nextBtn = root.querySelector('.next');
	if (nextBtn) {
		nextBtn.style.display = 'none';
	}
	this.onNextPressed(NpcBox.ownerID);
};

/**
 * Press "close" button
 */
NpcBox.close = function close() {
	_needCleanUp = true;
	const root = NpcBox.getRoot();
	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.style.display = 'none';
	}
	this.onClosePressed(NpcBox.ownerID);
};

/**
 * Callback
 */
NpcBox.onClosePressed = function onClosePressed() {};
NpcBox.onNextPressed = function onNextPressed() {};

/* O ESC da fala e dela (D-2049): as Configuracoes nao abrem por cima. Com
   so o "Continuar" a vista, o ESC nao faz nada, como na fonte. */
registrarConversa('fala', () => componenteNaTela(NpcBox));

/**
 * Create component based on view file and export it
 */
export default UIManager.addComponent(NpcBox);
