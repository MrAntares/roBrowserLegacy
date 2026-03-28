/**
 * UI/Components/Emoticons/Emoticons.js
 *
 * Emoticons Interface
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import EmoticonsDB from 'DB/Emotions.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Entity from 'Renderer/Entity/Entity.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import htmlText from './Emoticons.html?raw';
import cssText from './Emoticons.css?raw';
import ShortCuts from 'UI/Components/ShortCuts/ShortCuts.js';

/**
 * Create Component
 */
const Emoticons = new UIComponent('Emoticons', htmlText, cssText);

/**
 * @var {number} page index
 */
let _page = 0;

/**
 * @var {number} emoticons per page
 */
const EMOTICONS_PER_PAGE = 30;

/**
 * @var {number} total pages
 */
let TOTAL_PAGES = 0;

/**
 * @var {number} emoticons count
 */
const EMOTICONS_COUNT = Object.keys(EmoticonsDB.order).length;

/**
 * @var {object} emoticons action file
 */
let _action;

/**
 * @var {object} emoticons sprite
 */
let _sprite;

/**
 * @var {Entity} Helper to render sprites
 */
const _entity = new Entity();

/**
 * @var {Preference} structure to save
 */
const _preferences = Preferences.get(
	'Emoticons',
	{
		x: 600,
		y: 200,
		show: false
	},
	1.0
);

/**
 * Initialize UI
 */
Emoticons.init = function init() {
	Client.loadFiles(
		['data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/emotion.act', 'data/sprite/\xc0\xcc\xc6\xd1\xc6\xae/emotion.spr'],
		function (act, spr) {
			_action = act;
			_sprite = spr;
			TOTAL_PAGES = Math.floor(EMOTICONS_COUNT / EMOTICONS_PER_PAGE);

			this.ui.find('.total').text(TOTAL_PAGES + 1);
			this.movePage(0);
		}.bind(this)
	);

	this.ui.find('.content').on('dblclick', 'canvas', onPlayEmoticon).on('mousedown', 'canvas', onSelectEmoticon);

	this.ui.find('.base').mousedown(function (event) {
		event.stopImmediatePropagation();
		return false;
	});

	this.ui.find('.prev').addClass('disabled');
	this.ui.find('.close').click(onClose);
	this.ui.find('.prev').click(movePage(-1));
	this.ui.find('.next').click(movePage(+1));

	this.draggable(this.ui.find('.titlebar'));
};

/**
 * Appending to html
 */
Emoticons.onAppend = function onAppend() {
	if (!_preferences.show) {
		this.ui.hide();
	}

	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});
};

/**
 * Once removed from DOM, save preferences
 */
Emoticons.onRemove = function OnRemove() {
	_preferences.show = this.ui.is(':visible');
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();
};

/**
 * Update page
 *
 * @param {number} direction
 */
Emoticons.movePage = function movePage(direction) {
	this.ui.find('.prev, .next').removeClass('disabled');

	_page += direction;

	if (_page <= 0) {
		this.ui.find('.prev').addClass('disabled');
		_page = 0;
	}

	if (_page >= TOTAL_PAGES) {
		this.ui.find('.next').addClass('disabled');
		_page = TOTAL_PAGES;
	}

	this.ui.find('.current').text(_page + 1);

	refreshList(this.ui.find('.content'));
};

/**
 * Process shortcut
 *
 * @param {object} key
 */
Emoticons.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.ui.toggle();
			if (this.ui.is(':visible')) {
				this.focus();
			}
			break;
	}
};

/**
 * Generic move page function
 *
 * @param {number} index
 * @return {function}
 */
function movePage(index) {
	return function movePageClosure() {
		if (!this.className.match(/disabled/)) {
			Emoticons.movePage(index);
		}
	};
}

/**
 * Exit window
 */
function onClose() {
	Emoticons.ui.hide();
}

/**
 * Select an emoticon
 * Display the command shortcut in the ShortCuts
 */
function onSelectEmoticon() {
	const idx = this.getAttribute('data-index');
	const cmd = EmoticonsDB.names[idx];
	if (cmd && ShortCuts.ui.is(':visible')) {
		if (ShortCuts.ui.find('.input_alt_focus').length) {
			ShortCuts.ui
				.find('.input_alt_focus')
				.val('/' + cmd)
				.select();
		}
	}
}

/**
 * Do an emoticon
 */
function onPlayEmoticon() {
	const idx = this.getAttribute('data-index');
	const cmd = EmoticonsDB.names[idx];

	ChatBox.ui.find('.input .message').val('/' + cmd);
	ChatBox.submit();
}

/**
 * Refresh emoticons list
 *
 * @param {jQuery object} content
 */
function refreshList(content) {
	let canvas, ctx;
	let animation, animations, layers;
	let i, count;

	let index = EMOTICONS_PER_PAGE * _page;
	const end = Math.min(EMOTICONS_COUNT, index + EMOTICONS_PER_PAGE);
	const pos = [0, 0];
	let emo;

	content.empty();

	while (index < end) {
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');
		canvas.width = 40;
		canvas.height = 40;
		emo = EmoticonsDB.order[index];

		canvas.setAttribute('data-index', emo);
		animations = _action.actions[emo].animations;

		// Do not ask why, but we don't know how Gravity find
		// the animation to render:
		animation = animations[Math.floor(animations.length / 5)];
		layers = animation.layers;
		count = layers.length;

		SpriteRenderer.bind2DContext(ctx, 20 - layers[0].pos[0], 40 - layers[0].pos[1]);

		for (i = 0; i < count; ++i) {
			_entity.renderLayer(layers[i], _sprite, _sprite, 1.0, pos, false);
		}

		content.append(canvas);
		index++;
	}
}

/**
 * Export
 */
export default UIManager.addComponent(Emoticons);
