/**
 * UI/Components/WhisperBox/WhisperBox.js
 *
 * Whisper windows for 1:1 chat
 */

import DB from 'DB/DBManager.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import Preferences from 'Core/Preferences.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import History from '../ChatBox/History.js';
import Sound from 'Audio/SoundManager.js';
import htmlText from './WhisperBox.html?raw';
import cssText from './WhisperBox.css?raw';

/**
 * @var {GUIComponent} WhisperBox
 */
const WhisperBox = new GUIComponent('WhisperBox', cssText);

WhisperBox.render = () => htmlText;

/**
 * @var {Object} active whisper windows indexed by nickname
 */
WhisperBox.instances = {};

/**
 * @var {number} Offset counter for spawning
 */
WhisperBox._spawnCounter = 0;

/** @var {Preferences} window structure */
WhisperBox.preferences = Preferences.get(
	'WhisperBox',
	{
		x: 100,
		y: 100,
		show: false,
		open1to1Stranger: true,
		open1to1Friend: true,
		alarm1to1: true
	},
	1.0
);

const _preferences = WhisperBox.preferences;

WhisperBox.mouseMode = GUIComponent.MouseMode.STOP;
WhisperBox.captureKeyEvents = true;

/**
 * Initialize component
 */
WhisperBox.init = function init() {
	this.clearAll();
};

/**
 * Clear all history and windows
 */
WhisperBox.clearAll = function clearAll() {
	const keys = Object.keys(this.instances);
	for (let i = 0; i < keys.length; i++) {
		this.instances[keys[i]].remove();
	}
	this.instances = {};
};

/**
 * Show or create a whisper window for a specific user
 * @param {string} nickname
 * @param {boolean} [bHasMessage]
 */
WhisperBox.show = function show(nickname, bHasMessage) {
	if (this.instances[nickname]) {
		this.instances[nickname]._host.style.display = '';
		this.instances[nickname].focus();
		return this.instances[nickname];
	}

	if (_preferences.alarm1to1 && bHasMessage) {
		Sound.play('\xB9\xF6\xC6\xB0\xBC\xD2\xB8\xAE.wav');
	}

	const instance = this.clone(nickname);
	instance.nickname = nickname;

	instance.name = `WhisperBox:${nickname}`;
	instance.needFocus = true;
	instance.captureKeyEvents = true;
	UIManager.addComponent(instance);

	instance.prepare();
	instance.append();

	const root = instance._shadow || instance._host;
	instance._contentEl = root.querySelector('.content');
	instance._inputEl = root.querySelector('.input-whisper');

	import('Engine/MapEngine/Friends.js').then(Friends => {
		const isFriend = Friends && Friends.default.isFriend ? Friends.default.isFriend(nickname) : false;
		const titleEl = root.querySelector('.title');
		if (titleEl) {
			titleEl.textContent = `With ${nickname}${isFriend ? ' (Friend)' : ''}`;
		}
	});

	instance.draggable('.whisper-header, .whisper-footer');

	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => {
			instance.remove();
		});
	}

	const self = this;
	instance.onRemove = function onRemove() {
		delete self.instances[nickname];
		delete UIManager.components[this.name];
	};

	instance.history = new History();

	instance._inputEl.addEventListener('keydown', event => {
		switch (event.which) {
			case KEYS.ENTER: {
				const text = extractChatMessage(instance._inputEl);
				const msg = text.replace(/\u00A0/g, ' ').trim();

				if (msg.length) {
					instance.history.push(msg);
					self.onRequestTalk(nickname, msg);
					instance._inputEl.innerHTML = '';
				}
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}

			case KEYS.UP:
			case KEYS.DOWN: {
				const historyMsg = event.which === KEYS.UP ? instance.history.previous() : instance.history.next();
				instance._inputEl.innerHTML = historyMsg;
				setCaretToEnd(instance._inputEl);
				break;
			}

			default: {
				const currentText = extractChatMessage(instance._inputEl);
				if (event.which >= 32 && currentText.length >= 100 && !event.ctrlKey && !event.altKey) {
					event.preventDefault();
					return false;
				}
				return true;
			}
		}
	});

	instance._inputEl.addEventListener('paste', event => {
		event.preventDefault();
		const clipboard = (event.originalEvent || event).clipboardData;
		let paste = clipboard ? clipboard.getData('text/plain') : '';
		if (!paste) {
			return false;
		}

		paste = paste.replace(/\u00A0/g, ' ');
		const currentText = extractChatMessage(instance._inputEl);
		const remaining = 100 - currentText.length;
		if (remaining <= 0) {
			return false;
		}

		const toInsert = paste.substr(0, remaining);
		const selection = window.getSelection();
		if (selection.rangeCount) {
			selection.deleteFromDocument();
			selection.getRangeAt(0).insertNode(document.createTextNode(toInsert));
			selection.collapseToEnd();
		}
	});

	instance._host.addEventListener('mousedown', () => {
		instance.focus();
	});

	setupItemLinkHandler(instance);
	setupNicknameLinkHandler(instance);
	initResizable(instance);

	instance.onKeyDown = function onKeyDown(event) {
		const shadow = this._shadow || this._host;
		const focused = shadow.activeElement;

		if (focused && focused.tagName) {
			const isInput = focused.tagName.match(/input|select|textarea/i);
			const isContentEditable = focused.getAttribute('contenteditable') === 'true';

			if (isInput || isContentEditable) {
				if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
					this.remove();
					event.stopImmediatePropagation();
					return false;
				}
				event.stopImmediatePropagation();
				return true;
			}
		}

		return true;
	};

	const offset = (this._spawnCounter % 10) * 20;
	this._spawnCounter++;

	instance._host.style.top = `${Math.min(Math.max(0, _preferences.y + offset), Renderer.height - 156)}px`;
	instance._host.style.left = `${Math.min(Math.max(0, _preferences.x + offset), Renderer.width - 280)}px`;

	this.instances[nickname] = instance;
	return instance;
};

/**
 * Add text to whisper box
 * @param {string} nickname
 * @param {string} text
 * @param {string} color
 */
WhisperBox.addText = function addText(nickname, text, color) {
	const instance = this.instances[nickname] || this.show(nickname, true);
	let override = false;

	text = text.replace(/<ITEMLINK>.*?<\/ITEMLINK>|<ITEML>.*?<\/ITEML>|<ITEM>.*?<\/ITEM>/gi, match => {
		const item = DB.parseItemLink(match);
		if (!item) {
			return match;
		}
		override = true;
		return `<span data-item="${match}" class="item-link" style="color:#FFFF63; cursor:pointer;">&lt;${item.name}&gt;</span>`;
	});

	const contentEl = instance._contentEl;
	const isAtBottom = contentEl.scrollHeight - contentEl.scrollTop <= contentEl.offsetHeight + 10;
	const div = document.createElement('div');
	div.style.color = color || '#ffffff';
	if (override) {
		div.innerHTML = text;
	} else {
		div.textContent = text;
	}

	contentEl.appendChild(div);

	while (contentEl.childElementCount > 100) {
		contentEl.firstElementChild.remove();
	}

	if (isAtBottom) {
		contentEl.scrollTop = contentEl.scrollHeight;
	}
};

/**
 * Move caret to the end of a contenteditable element
 * @param {HTMLElement} el
 */
function setCaretToEnd(el) {
	const range = document.createRange();
	const sel = window.getSelection();
	range.selectNodeContents(el);
	range.collapse(false);
	sel.removeAllRanges();
	sel.addRange(range);
}

/**
 * Extract plain chat text from input while preserving item links
 * @param {HTMLElement} inputEl
 * @returns {string}
 */
function extractChatMessage(inputEl) {
	const clone = inputEl.cloneNode(true);
	const links = clone.querySelectorAll('span.item-link');
	links.forEach(link => {
		const data = link.getAttribute('data-item') || '';
		link.replaceWith(document.createTextNode(data));
	});

	return clone.textContent.replace(/\u00A0/g, ' ');
}

/**
 * Set up item link click handler inside an instance's shadow DOM
 * @param {GUIComponent} instance
 */
function setupItemLinkHandler(instance) {
	const root = instance._shadow || instance._host;
	root.addEventListener('click', event => {
		const link = event.target.closest('.item-link');
		if (!link) {
			return;
		}
		const match = link.getAttribute('data-item');
		const item = DB.parseItemLink(match);
		if (item) {
			import('UI/Components/ItemInfo/ItemInfo.js').then(m => {
				const ItemInfo = m.default;
				ItemInfo.append();
				ItemInfo.uid = item.ITID;
				ItemInfo.setItem(item);
			});
		}
	});
}

/**
 * Set up nickname link click handler inside an instance's shadow DOM
 * @param {GUIComponent} instance
 */
function setupNicknameLinkHandler(instance) {
	const root = instance._shadow || instance._host;
	root.addEventListener('click', event => {
		const link = event.target.closest('.nickname-link');
		if (!link) {
			return;
		}
		const nickname = link.getAttribute('data-nickname');
		if (nickname) {
			WhisperBox.show(nickname);
		}
		event.stopImmediatePropagation();
	});
}

/**
 * Interface to be overriden by Engine
 */
WhisperBox.onRequestTalk = function onRequestTalk(_nickname, _text) {};

/**
 * Initialize resizable logic for an instance
 * @param {GUIComponent} instance
 */
function initResizable(instance) {
	const root = instance._shadow || instance._host;
	const resizer = root.querySelector('.resizer');
	if (!resizer) {
		return;
	}

	const resize = e => {
		const rect = instance._host.getBoundingClientRect();
		const width = Math.max(150, e.pageX - rect.left);
		const height = Math.max(100, e.pageY - rect.top);

		instance._host.style.width = `${width}px`;
		instance._host.style.height = `${height}px`;

		const container = root.querySelector('.whisper-container');
		if (container) {
			container.style.width = `${width}px`;
			container.style.height = `${height}px`;
		}

		instance._contentEl.scrollTop = instance._contentEl.scrollHeight;
	};

	const stopResize = () => {
		window.removeEventListener('mousemove', resize);
		window.removeEventListener('mouseup', stopResize);
	};

	resizer.addEventListener('mousedown', e => {
		e.preventDefault();
		e.stopPropagation();
		window.addEventListener('mousemove', resize);
		window.addEventListener('mouseup', stopResize);
	});
}

UIManager.addComponent(WhisperBox);
export default WhisperBox;
