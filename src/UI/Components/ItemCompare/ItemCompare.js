/**
 * UI/Components/ItemCompare/ItemCompare.js
 *
 * Item Comparison Information
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import DB from 'DB/DBManager.js';
import ItemType from 'DB/Items/ItemType.js';
import Client from 'Core/Client.js';
import CardIllustration from 'UI/Components/CardIllustration/CardIllustration.js';
import UIManager from 'UI/UIManager.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIComponent from 'UI/UIComponent.js';
import MakeReadBook from 'UI/Components/MakeReadBook/MakeReadBook.js';
import Renderer from 'Renderer/Renderer.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Sprite from 'Loaders/Sprite.js';
import Action from 'Loaders/Action.js';
import htmlText from './ItemCompare.html?raw';
import cssText from './ItemCompare.css?raw';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import Entity from 'Renderer/Entity/Entity.js';

/**
 * @let {Sprite,Action} objects
 */
let _sprite, _action;

/**
 * @let {CanvasRenderingContext2D}
 */
let _ctx;

/**
 * @let {number} type
 */
const _type = 0;

/**
 * @let {number} start tick
 */
const _start = 0;

/**
 * Create Component
 */
const ItemCompare = new UIComponent('ItemCompare', htmlText, cssText);

/**
 * @let {number} ItemCompare unique id
 */
ItemCompare.uid = -1;

/**
 * Once append to the DOM
 */
/*
	ItemCompare.onKeyDown = function onKeyDown( event )
	{
		if ((event.which === KEYS.ESCAPE || event.key === "Escape")) {
			ItemCompare.remove();
			event.stopImmediatePropagation();
			return false;
		}

		return true;
	};
	*/

/**
 * Once append
 */
ItemCompare.onAppend = function onAppend() {
	// Seems like "EscapeWindow" is execute first, push it before.
	const events = jQuery._data(window, 'events').keydown;
	events.unshift(events.pop());
	resize(ItemCompare.ui.find('.description-inner').height() + 45);

	// Position ItemCompare next to ItemInfo
	const itemInfoPosition = ItemInfo.ui.offset();
	const itemInfoWidth = ItemInfo.ui.outerWidth();
	ItemCompare.ui.css({
		position: 'absolute',
		top: itemInfoPosition.top ? itemInfoPosition.top : 200,
		left: itemInfoPosition.left ? itemInfoPosition.left - itemInfoWidth : 200 // Adjust spacing as needed
	});
};

/**
 * Once removed from html
 */
ItemCompare.onRemove = function onRemove() {
	this.uid = -1;
};

/**
 * Initialize UI
 */
ItemCompare.init = function init() {
	this.ui.css({ top: 200, left: 200 });
	this.ui.find('.extend').mousedown(onResize);

	// Ask to see card.
	this.ui.find('.view').click(
		function () {
			CardIllustration.append();
			CardIllustration.setCard(this.item);
		}.bind(this)
	);

	this.draggable(ItemInfo.ui.find('.title'));
};

/**
 * Bind component
 *
 * @param {object} item
 */
ItemCompare.setItem = function setItem(item) {
	const it = DB.getItemInfo(item.ITID);
	const ui = this.ui;
	const cardList = ui.find('.cardlist .border');
	const optionContainer = ui.find('.option-container');

	this.item = it;
	Client.loadFile(
		DB.INTERFACE_PATH +
			'collection/' +
			(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
			'.bmp',
		function (data) {
			ui.find('.collection').css('backgroundImage', 'url(' + data + ')');
		}
	);

	const itemName = DB.getItemName(item, { showItemOptions: false });

	// Damaged status
	if (item.IsDamaged) {
		ui.find('.title').addClass('damaged');
	} else {
		ui.find('.title').removeClass('damaged');
	}
	ui.find('.title').text(itemName);

	if (item.Options && item.IsIdentified) {
		//Clear all option list
		optionContainer.html('');

		//Loop to Show Options
		for (let i = 1; i <= 5; i++) {
			if (item.Options[i].index > 0) {
				const randomOptionName = DB.getOptionName(item.Options[i].index);
				const optionList =
					'<div class="optionlist">' +
					'<div class="border">' +
					randomOptionName.replace('\%d', item.Options[i].value).replace('\%\%', '%') +
					'</div>' +
					'</div>';
				optionContainer.append(optionList);
			}
		}
		optionContainer.show();
	} else {
		optionContainer.hide();
	}

	ui.find('.description-inner').text(
		item.IsIdentified ? it.identifiedDescriptionName : it.unidentifiedDescriptionName
	);

	// Add view button (for cards)
	addEvent(item);

	let hideslots = false;
	if (item.slot) {
		switch (item.slot['card1']) {
			case 0x00ff: // FORGE
			case 0x00fe: // CREATE
			case 0xff00: // PET
				hideslots = true;
				break;
		}
		switch (item.slot['card4']) {
			case 0x1: //BELOVED PET
				hideslots = true;
				break;
		}
	}

	switch (item.type) {
		// Not an equipement = no card
		default:
			cardList.parent().hide();
			break;

		case ItemType.WEAPON:
		case ItemType.ARMOR:
		case ItemType.SHADOWGEAR: {
			if (hideslots || (item.type == ItemType.ARMOR && item.location == 0)) {
				cardList.parent().hide();
				break;
			}
			const slotCount = it.slotCount || 0;
			let i;

			cardList.parent().show();
			cardList.empty();

			for (i = 0; i < 4; ++i) {
				addCard(cardList, (item.slot && item.slot['card' + (i + 1)]) || 0, i, slotCount);
			}
			if (!item.IsIdentified) {
				cardList.parent().hide();
			}
			break;
		}

		case ItemType.PETEGG:
			cardList.parent().hide();
			break;
	}
	resize(ItemCompare.ui.find('.description-inner').height() + 45);
};

/**
 * Add a card into a slot
 *
 * @param {object} jquery cart list DOM
 * @param {number} item id
 * @param {number} index
 * @param {number} slot count
 */
function addCard(cardList, itemId, index, slotCount) {
	let file,
		name = '';
	const card = DB.getItemInfo(itemId);

	if (itemId && card) {
		file = 'item/' + card.identifiedResourceName + '.bmp';
		name = '<div class="name">' + jQuery.escape(card.identifiedDisplayName) + '</div>';
	}
	// TODO: ADD VARIABLE WITH MAXIMUM OF LETTER
	else if (index < slotCount) {
		file = 'empty_card_slot.bmp';
	} else {
		file = 'basic_interface/coparison_disable_card_slot.bmp';
	}

	cardList.append('<div class="item" data-index="' + index + '">' + '<div class="icon"></div>' + name + '</div>');

	Client.loadFile(DB.INTERFACE_PATH + file, function (data) {
		const element = cardList.find('.item[data-index="' + index + '"] .icon');
		element.css('backgroundImage', 'url(' + data + ')');

		if (itemId && card) {
			element.on('contextmenu', function () {
				ItemCompare.setItem({
					ITID: itemId,
					IsIdentified: true,
					type: 6
				});
				return false;
			});
		}
	});
}
/**
 * Extend ItemCompare window size
 */
function onResize() {
	const ui = ItemCompare.ui;
	const top = ui.position().top;
	let lastHeight = 0;

	function resizing() {
		const h = Math.floor(Mouse.screen.y - top);
		if (h === lastHeight) {
			return;
		}
		resize(h);
		lastHeight = h;
	}

	// Start resizing
	const _Interval = setInterval(resizing, 30);

	// Stop resizing on left click
	jQuery(window).on('mouseup.resize', function (event) {
		if (event.which === 1) {
			clearInterval(_Interval);
			jQuery(window).off('mouseup.resize');
		}
	});
}

/**
 * Extend ItemCompare window size
 *
 * @param {number} height
 */
function resize(height) {
	const container = ItemCompare.ui.find('.container');
	const description = ItemCompare.ui.find('.description');
	const descriptionInner = ItemCompare.ui.find('.description-inner');
	let containerHeight = height;
	const minHeight = 120;
	const maxHeight = descriptionInner.height() + 45 > 120 ? Math.min(descriptionInner.height() + 45, 448) : 120;

	if (containerHeight <= minHeight) {
		containerHeight = minHeight;
	}

	if (containerHeight >= maxHeight) {
		containerHeight = maxHeight;
	}

	container.css({
		height: containerHeight
	});
	description.css({
		height: containerHeight - 45
	});
}

function addEvent(item) {
	const event = ItemCompare.ui.find('.event_view');
	if (!validateFieldsExist(event)) {
		addEvent(item);
	}

	event.find('.view').hide();
	event.find('canvas').remove();

	Renderer.stop(rendering);

	switch (item.type) {
		case ItemType.CARD:
			event.find('.view').show();
			break;
		case ItemType.ETC: {
			const filenameBook = `data/book/${item.ITID}.txt`;
			Client.loadFile(filenameBook, function (data) {
				MakeReadBook.startBook(data, item);
				eventsBooks();
			});
			break;
		}
		default:
			event.find('.view').hide();
			event.find('canvas').remove();
			break;
	}
}

function eventsBooks() {
	const event = ItemCompare.ui.find('.event_view');

	Client.getFiles(
		['data/sprite/book/\xc3\xa5\xc0\xd0\xb1\xe2.spr', 'data/sprite/book/\xc3\xa5\xc0\xd0\xb1\xe2.act'],
		function (spr, act) {
			try {
				_sprite = new Sprite(spr);
				_action = new Action(act);
			} catch (e) {
				console.error('Book::init() - ' + e.message);
				return;
			}
			let canvas;
			canvas = _sprite.getCanvasFromFrame(0);
			canvas.className = 'book_open event_add_cursor';
			event.append(canvas);
			const bookOpen = ItemCompare.ui.find('.book_open');
			bookOpen
				.mouseover(function (e) {
					e.stopImmediatePropagation();
					ItemCompare.ui.find('.overlay_open').show();
				})
				.mouseout(function (e) {
					e.stopImmediatePropagation();
					ItemCompare.ui.find('.overlay_open').hide();
				});
			bookOpen.click(
				function (e) {
					e.stopImmediatePropagation();
					MakeReadBook.openBook();
				}.bind(this)
			);
			// icon read book
			event.append('<canvas width="21" height="15" class="book_read event_add_cursor"/>');
			canvas = event.find('.book_read');
			canvas.width = 21;
			canvas.height = 15;
			_ctx = canvas[0].getContext('2d');

			const bookRead = ItemCompare.ui.find('.book_read');
			bookRead
				.mouseover(function (e) {
					e.stopImmediatePropagation();
					ItemCompare.ui.find('.overlay_read').show();
				})
				.mouseout(function (e) {
					e.stopImmediatePropagation();
					ItemCompare.ui.find('.overlay_read').hide();
				});
			bookRead.click(
				function (e) {
					e.stopImmediatePropagation();
					MakeReadBook.highlighter();
				}.bind(this)
			);
			Renderer.render(rendering);
		}.bind(this)
	);
}

/**
 * Rendering animation
 */
const rendering = (function renderingClosure() {
	const position = new Uint16Array([0, 0]);

	return function render() {
		const _entity = new Entity();
		const action = _action.actions[_type];
		const anim = Math.floor((Renderer.tick - _start) / action.delay);

		// if (anim >= max) {
		// 	Renderer.stop(rendering);
		// }

		const animation = action.animations[anim % action.animations.length];

		let i, count;
		count = animation.layers.length;

		// Initialize context
		SpriteRenderer.bind2DContext(_ctx, 10, 25);
		_ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
		// _ctx.clearRect(0, 0, 21, 15);

		// Render layers
		for (i = 0, count = animation.layers.length; i < count; ++i) {
			_entity.renderLayer(animation.layers[i], _sprite, _sprite, 1.0, position, false);
		}
		// _entity.renderLayer( animation.layers[0], _sprite, _sprite, 1.0, position, false);

		// Renderer.stop(rendering);
	};
})();

function validateFieldsExist(event) {
	if (event.length === 0) {
		const validExitElement =
			'<div class="event_view">' +
			'<button class="view" data-background="btn_view.bmp" data-down="btn_view_a.bmp" data-hover="btn_view_b.bmp"></button>' +
			'<span class="overlay_open" data-text="1294">' +
			DB.getMessage(1294) +
			'</span>' +
			'<span class="overlay_read" data-text="1295">' +
			DB.getMessage(1295) +
			'</span>' +
			'</div>';
		ItemCompare.ui.find('.collection').after(validExitElement);
		return false;
	}

	if (ItemCompare.ui.find('.overlay_open').length == 0 && ItemCompare.ui.find('.overlay_read').length == 0) {
		event.append(
			'<span class="overlay_open" data-text="1294">' +
				DB.getMessage(1294) +
				'</span>' +
				'<span class="overlay_read" data-text="1295">' +
				DB.getMessage(1295) +
				'</span>'
		);
	}

	if (ItemCompare.ui.find('button').length == 0) {
		event.append(
			'<button class="view" data-background="btn_view.bmp" data-down="btn_view_a.bmp" data-hover="btn_view_b.bmp"></button>'
		);
	}

	return true;
}

/**
 * Create component and export it
 */
export default UIManager.addComponent(ItemCompare);
