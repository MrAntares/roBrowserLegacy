/**
 * UI/Components/ItemCompare/ItemCompare.js
 *
 * Item Comparison Information
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
'use strict';

import jQuery from 'Utils/jquery';
import DB from 'DB/DBManager';
import ItemType from 'DB/Items/ItemType';
import Client from 'Core/Client';
import CardIllustration from 'UI/Components/CardIllustration/CardIllustration';
import UIManager from 'UI/UIManager';
import Mouse from 'Controls/MouseEventHandler';
import UIComponent from 'UI/UIComponent';
import MakeReadBook from 'UI/Components/MakeReadBook/MakeReadBook';
import Renderer from 'Renderer/Renderer';
import SpriteRenderer from 'Renderer/SpriteRenderer';
import Sprite from 'Loaders/Sprite';
import Action from 'Loaders/Action';
import htmlText from './ItemCompare.html?raw';
import cssText from './ItemCompare.css?raw';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo';
import Entity from 'Renderer/Entity/Entity';

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
let _type = 0;

/**
 * @let {number} start tick
 */
let _start = 0;

/**
 * Create Component
 */
let ItemCompare = new UIComponent('ItemCompare', htmlText, cssText);

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
	let events = jQuery._data(window, 'events').keydown;
	events.unshift(events.pop());
	resize(ItemCompare.ui.find('.description-inner').height() + 45);

	// Position ItemCompare next to ItemInfo
	let itemInfoPosition = ItemInfo.ui.offset();
	let itemInfoWidth = ItemInfo.ui.outerWidth();
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
	let it = DB.getItemInfo(item.ITID);
	let ui = this.ui;
	let cardList = ui.find('.cardlist .border');
	let optionContainer = ui.find('.option-container');

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

	let itemName = DB.getItemName(item, { showItemOptions: false });

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
				let randomOptionName = DB.getOptionName(item.Options[i].index);
				let optionList =
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
		case ItemType.SHADOWGEAR:
			if (hideslots || (item.type == ItemType.ARMOR && item.location == 0)) {
				cardList.parent().hide();
				break;
			}
			let slotCount = it.slotCount || 0;
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
	let card = DB.getItemInfo(itemId);

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
		let element = cardList.find('.item[data-index="' + index + '"] .icon');
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
	let ui = ItemCompare.ui;
	let top = ui.position().top;
	let left = ui.position().left;
	let lastHeight = 0;
	let _Interval;

	function resizing() {
		let h = Math.floor(Mouse.screen.y - top);
		if (h === lastHeight) {
			return;
		}
		resize(h);
		lastHeight = h;
	}

	// Start resizing
	_Interval = setInterval(resizing, 30);

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
	let container = ItemCompare.ui.find('.container');
	let description = ItemCompare.ui.find('.description');
	let descriptionInner = ItemCompare.ui.find('.description-inner');
	let containerHeight = height;
	let minHeight = 120;
	let maxHeight = descriptionInner.height() + 45 > 120 ? Math.min(descriptionInner.height() + 45, 448) : 120;

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

function onUpdateOwnerName(pkt) {
	let str = ItemCompare.ui.find('.owner-' + pkt.GID).text();
	ItemCompare.ui.find('.owner-' + pkt.GID).text(pkt.CName);

	delete DB.UpdateOwnerName[pkt.GID];
}

function addEvent(item) {
	let event = ItemCompare.ui.find('.event_view');
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
		case ItemType.ETC:
			let filenameBook = `data/book/${item.ITID}.txt`;
			Client.loadFile(filenameBook, function (data) {
				MakeReadBook.startBook(data, item);
				eventsBooks();
			});
			break;
		default:
			event.find('.view').hide();
			event.find('canvas').remove();
			break;
	}
}

function eventsBooks() {
	let event = ItemCompare.ui.find('.event_view');

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
			let bookOpen = ItemCompare.ui.find('.book_open');
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

			let bookRead = ItemCompare.ui.find('.book_read');
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
let rendering = (function renderingClosure() {
	let position = new Uint16Array([0, 0]);

	return function rendering() {
		let i, count, max;
		let action, animation, anim;

		let _entity = new Entity();
		action = _action.actions[_type];
		max = action.animations.length;
		anim = Renderer.tick - _start;
		anim = Math.floor(anim / action.delay);

		// if (anim >= max) {
		// 	Renderer.stop(rendering);
		// }

		animation = action.animations[anim % action.animations.length];

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
		let validExitElement =
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
