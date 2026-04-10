/**
 * UI/Components/WhisperBox/WhisperBox.js
 *
 * Whisper windows for 1:1 chat
 */

import DB from 'DB/DBManager.js';
import jQuery from 'Utils/jquery.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Preferences from 'Core/Preferences.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import History from '../ChatBox/History.js';
import Sound from 'Audio/SoundManager.js';
import htmlText from './WhisperBox.html?raw';
import cssText from './WhisperBox.css?raw';

/**
 * @var {UIComponent} WhisperBox
 */
const WhisperBox = new UIComponent('WhisperBox', htmlText, cssText);

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

/**
 * Initialize component
 */
WhisperBox.init = function () {
	this.clearAll();

	// Handle item link clicks (iteminfo)
	jQuery(document).on('click.whisperbox', '.whisperbox .item-link, .whisper-container .item-link', function (event) {
		const match = jQuery(this).attr('data-item') || jQuery(this).data('item');
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

	// Handle nickname clicks (open chat)
	jQuery(document).on(
		'click.whisperbox',
		'.whisperbox .nickname-link, .whisper-container .nickname-link',
		function (event) {
			const nickname = jQuery(this).attr('data-nickname') || jQuery(this).data('nickname');
			if (nickname) {
				WhisperBox.show(nickname);
			}
			event.stopImmediatePropagation();
			return false;
		}
	);
};

/**
 * Clear all history and windows
 */
WhisperBox.clearAll = function () {
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
WhisperBox.show = function (nickname, bHasMessage) {
	const self = this;
	if (this.instances[nickname]) {
		this.instances[nickname].ui.show();
		this.instances[nickname].focus();
		return this.instances[nickname];
	}

	// Sound alarm if requested and not muted
	if (_preferences.alarm1to1 && bHasMessage) {
		Sound.play('\xB9\xF6\xC6\xB0\xBC\xD2\xB8\xAE.wav');
	}

	const instance = this.clone(nickname);
	instance.nickname = nickname;

	// Register with UIManager for global focus handling (z-index)
	instance.name = 'WhisperBox:' + nickname;
	instance.needFocus = true;
	UIManager.addComponent(instance);

	// Mount component
	instance.prepare();
	instance.append();

	// Set cached elements and title
	const $ui = instance.ui;
	instance.$content = $ui.find('.content');
	instance.$input = $ui.find('.input-whisper');

	import('Engine/MapEngine/Friends.js').then(Friends => {
		const isFriend = Friends && Friends.default.isFriend ? Friends.default.isFriend(nickname) : false;
		$ui.find('.title').text('With ' + nickname + (isFriend ? ' (Friend)' : ''));
	});

	// Set dragging areas
	instance.draggable($ui.find('.whisper-header, .whisper-footer'));

	// Close button (triggers onRemove)
	$ui.find('.close').click(function () {
		instance.remove();
	});

	// Component cleanup
	instance.onRemove = function () {
		delete self.instances[nickname];
		delete UIManager.components[this.name];
	};

	// Initialize input history
	instance.history = new History();

	// Handle input keys
	instance.$input.on('keydown', function (event) {
		switch (event.which) {
			case KEYS.ENTER: {
				const text = extractChatMessage(jQuery(this));
				const msg = text.replace(/\u00A0/g, ' ').trim();

				if (msg.length) {
					instance.history.push(msg);
					self.onRequestTalk(nickname, msg);
					jQuery(this).html('');
				}
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}

			case KEYS.UP:
			case KEYS.DOWN: {
				const historyMsg = event.which === KEYS.UP ? instance.history.previous() : instance.history.next();
				jQuery(this).html(historyMsg);
				setCaretToEnd(this);
				break;
			}

			default: {
				const currentText = extractChatMessage(jQuery(this));
				if (event.which >= 32 && currentText.length >= 100 && !event.ctrlKey && !event.altKey) {
					event.preventDefault();
					return false;
				}
				return true;
			}
		}
	});

	// Force plain-text paste and length limit
	instance.$input.on('paste', function (event) {
		event.preventDefault();
		const clipboard = (event.originalEvent || event).clipboardData;
		let paste = clipboard ? clipboard.getData('text/plain') : '';
		if (!paste) {
			return false;
		}

		paste = paste.replace(/\u00A0/g, ' ');
		const currentText = extractChatMessage(jQuery(this));
		const remaining = 100 - currentText.length;
		if (remaining <= 0) {
			return false;
		}

		const toInsert = paste.substr(0, remaining);
		if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
			document.execCommand('insertText', false, toInsert);
		} else {
			const selection = window.getSelection();
			if (selection.rangeCount) {
				selection.deleteFromDocument();
				selection.getRangeAt(0).insertNode(document.createTextNode(toInsert));
			}
		}
	});

	// Focus on mousedown
	$ui.mousedown(function () {
		instance.focus();
	});

	// Resizable logic
	initResizable(instance);

	// Positioning with offspring offset
	const offset = (this._spawnCounter % 10) * 20;
	this._spawnCounter++;

	$ui.css({
		top: Math.min(Math.max(0, _preferences.y + offset), Renderer.height - 156),
		left: Math.min(Math.max(0, _preferences.x + offset), Renderer.width - 280)
	});

	// Store globally
	this.instances[nickname] = instance;
	return instance;
};

/**
 * Add text to whisper box
 * @param {string} nickname
 * @param {string} text
 * @param {string} color
 */
WhisperBox.addText = function (nickname, text, color) {
	const instance = this.instances[nickname] || this.show(nickname, true);
	let override = false;

	// Convert item links to clickable spans
	text = text.replace(/<ITEMLINK>.*?<\/ITEMLINK>|<ITEML>.*?<\/ITEML>|<ITEM>.*?<\/ITEM>/gi, function (match) {
		const item = DB.parseItemLink(match);
		if (!item) {
			return match;
		}
		override = true;
		return (
			'<span data-item="' +
			match +
			'" class="item-link" style="color:#FFFF63; cursor:pointer;">&lt;' +
			item.name +
			'&gt;</span>'
		);
	});

	const $content = instance.$content;
	const isAtBottom = $content[0].scrollHeight - $content.scrollTop() <= $content.outerHeight() + 10;
	const $div = jQuery('<div/>')
		.css('color', color || '#ffffff')
		[override ? 'html' : 'text'](text);

	$content.append($div);

	// Enforce history limit
	while ($content[0].childElementCount > 100) {
		$content[0].firstElementChild.remove();
	}

	if (isAtBottom) {
		$content.scrollTop($content[0].scrollHeight);
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
 * @param {jQuery} $input
 * @returns {string}
 */
function extractChatMessage($input) {
	const clone = $input.clone();
	clone.find('span.item-link').each(function () {
		const data = jQuery(this).attr('data-item') || jQuery(this).data('item') || '';
		jQuery(this).replaceWith(document.createTextNode(data));
	});

	return clone.text().replace(/\u00A0/g, ' ');
}

/**
 * Interface to be overriden by Engine
 */
WhisperBox.onRequestTalk = function (nickname, text) {};

/**
 * Initialize resizable logic for an instance
 * @param {UIComponent} instance
 */
function initResizable(instance) {
	const resizer = instance.ui.find('.resizer')[0];
	if (!resizer) {
		return;
	}

	const resize = function (e) {
		const width = Math.max(150, e.pageX - instance.ui.offset().left);
		const height = Math.max(100, e.pageY - instance.ui.offset().top);

		instance.ui.css({
			width: width + 'px',
			height: height + 'px'
		});

		instance.$content[0].scrollTop = instance.$content[0].scrollHeight;
	};

	const stopResize = function () {
		window.removeEventListener('mousemove', resize);
		window.removeEventListener('mouseup', stopResize);
	};

	resizer.addEventListener('mousedown', function (e) {
		e.preventDefault();
		e.stopPropagation();
		window.addEventListener('mousemove', resize);
		window.addEventListener('mouseup', stopResize);
	});
}

UIManager.addComponent(WhisperBox);
export default WhisperBox;
