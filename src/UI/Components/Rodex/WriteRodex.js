/**
 * UI/Components/Rodex/WriteRodex.js
 *
 * Chararacter WriteRodex
 *
 * @author Alisonrag
 *
 */
define(function (require) {
	'use strict';


	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Session = require('Engine/SessionStorage');
	var MonsterTable = require('DB/Monsters/MonsterTable');
	var jQuery = require('Utils/jquery');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var Client = require('Core/Client');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./WriteRodex.html');
	var cssText = require('text!./WriteRodex.css');
	var InputBox = require('UI/Components/InputBox/InputBox');
	var getModule = require;

	/**
	 * Create Component
	 */
	var WriteRodex = new UIComponent('WriteRodex', htmlText, cssText);
	WriteRodex.list = [];
	WriteRodex.receiver = null;


	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('WriteRodex', {
		show: false,
	}, 1.0);

	/**
	 * Initialize Component
	 */
	WriteRodex.onAppend = function onAppend() {
		// Bind buttons
		WriteRodex.ui.find('.right .close').on('click', onClickClose);
		WriteRodex.ui.find('.send').on('click', onClickSend);

		WriteRodex.ui.css({
			top: Math.min(Math.max(0, parseInt(getModule('UI/Components/Rodex/Rodex').ui.css('top'), 10)) - 20, Renderer.height - WriteRodex.ui.height()),
			left: Math.min(Math.max(0, parseInt(getModule('UI/Components/Rodex/Rodex').ui.css('left'), 10)) + 330, Renderer.width - WriteRodex.ui.width())
		});

		WriteRodex.draggable(WriteRodex.ui.find('.titlebar'));

		WriteRodex.ui.find('.items .item-list')
			
	};


	WriteRodex.initData = function initData(pkt) {
		WriteRodex.receiver = null;
		WriteRodex.CharID = 0;
		WriteRodex.list = [];
		WriteRodex.ui.find('.name').prop("type", "text");
		WriteRodex.ui.find('.name').val(pkt.receiveName);
		WriteRodex.ui.find('.validate-name').show();
		WriteRodex.ui.find('.baloon').hide();
		WriteRodex.ui.find('.title-text').val(DB.getMessage(3575));
		WriteRodex.ui.find('.content-text').val('');
		WriteRodex.ui.find('.character-zeny').html(prettifyZeny(Session.zeny) + ' Zeny');
		WriteRodex.ui.find('.validate-name').on('click', onClickValidateName);
		WriteRodex.ui.find('.weigth-text').html('0  2000');
		WriteRodex.ui.find('.tax-text').html('0');
		WriteRodex.ui.find('.value').val('');
		WriteRodex.ui.find('.item-list').html('');
		WriteRodex.ui.find('.items').on('drop', onDrop)
			.on('dragover', stopPropagation)
		WriteRodex.ui.show();
		WriteRodex.ui.focus();

	}

	WriteRodex.characterInfo = function characterInfo(pkt) {
		let text = 'Lv' + pkt.level + '<br>' + MonsterTable[pkt.Job] + '<br>' + pkt.CharID;
		WriteRodex.ui.find('.validate-name').hide();
		WriteRodex.ui.find('.baloon').html(text).show();
		WriteRodex.ui.find('.name').prop("type", "none");
		WriteRodex.receiver = (pkt.name !== undefined) ? pkt.name : WriteRodex.ui.find('.name').val();
		WriteRodex.CharID = pkt.CharID;
	}

	function onClickClose(e) {
		e.stopImmediatePropagation();
		WriteRodex.receiver = null;
		WriteRodex.ui.find('.name').val('');
		WriteRodex.ui.find('.title-text').val('');
		WriteRodex.ui.find('.content-text').val('');
		WriteRodex.ui.find('.value').val('');
		WriteRodex.ui.find('.item-list').html('');
		WriteRodex.ui.find('.weigth-text').html('0  2000');
		WriteRodex.ui.find('.tax-text').html('0');
		WriteRodex.ui.find('.number').val('');
		WriteRodex.requestCancelWriteRodex();
		WriteRodex.list = [];
		WriteRodex.CharID = 0;
		WriteRodex.ui.hide();
	}

	function onClickSend(e) {
		e.stopImmediatePropagation();
		let receiver = WriteRodex.receiver;
		let sender = Session.Character.name;
		let zeny = parseInt(WriteRodex.ui.find('.value').val(),10);
		zeny = (isNaN(zeny)) ? 0 : zeny;
		let title = WriteRodex.ui.find('.title-text').val().replace(/^(\$|\%)/, '').replace(/\t/g, '').substring(0, 23);
		let body = WriteRodex.ui.find('.content-text').val().replace(/^(\$|\%)/, '').replace(/\t/g, '').substring(0, 499);
		let Titlelength = title.length + 1;
		let Bodylength = body.length + 1;
		let CharID = WriteRodex.CharID;
		WriteRodex.requestSendRodex(receiver, sender, zeny, Titlelength, Bodylength, CharID, title, body);
	}
	/**
	 * Search in a list for an item by its index
	 *
	 * @param {number} index
	 * @returns {Item}
	 */
	WriteRodex.getItemByIndex = function getItemByIndex(index) {
		var i, count;
		var list = WriteRodex.list;

		for (i = 0, count = list.length; i < count; ++i) {
			if (list[i].index === index) {
				return list[i];
			}
		}

		return null;
	};


	WriteRodex.addItem = function addItem(item) {

		var object = WriteRodex.getItemByIndex(item.index);

		if (object) {
			object.count += item.count;
			this.ui.find('.item[data-index="' + item.index + '"] .count').text(object.count);
			return;
		}

		object = jQuery.extend({}, item);
		WriteRodex.list.push(object);

		var it = DB.getItemInfo(item.ITID);
		var content = this.ui.find('.items .item-list');

		content.append(
			'<div class="item" data-index="' + item.index + '" draggable="true">' +
			'<div class="icon"></div>' +
			'<div class="amount"><span class="count">' + (item.count || 1) + '</span></div>' +
			'</div>'
		);

		Client.loadFile(DB.INTERFACE_PATH + 'item/' + (item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) + '.bmp', function (data) {
			content.find('.item[data-index="' + item.index + '"] .icon').css('backgroundImage', 'url(' + data + ')');
		});

		let item_div = content.find('.item[data-index="' + item.index + '"]');
		item_div
			.on('mouseover', onItemOver)
			.on('mouseout',  onItemOut)
			.on('dragstart', onItemDragStart)
			.on('dragend', onItemDragEnd)
			.on('contextmenu', onItemInfo)

		WriteRodex.updateWeight(item.weight);
		WriteRodex.updateTax();
	}

	/**
	 * Remove item from WriteRodex
	 *
	 * @param {number} index in WriteRodex
	 * @param {number} count
	 */
	WriteRodex.removeItem = function RemoveItem(index, count, weight) {
		var item = WriteRodex.getItemByIndex(index);

		// Emulator failed to complete the operation
		// do not remove item from inventory
		if (!item || count <= 0) {
			return null;
		}

		if (item.count) {
			item.count -= count;

			if (item.count > 0) {
				WriteRodex.ui.find('.item[data-index="' + item.index + '"] .count').text(item.count);
				return;
			}
		}

		WriteRodex.list.splice(WriteRodex.list.indexOf(item), 1);
		WriteRodex.ui.find('.item[data-index="' + item.index + '"]').remove();
		WriteRodex.updateWeight(weight);
		WriteRodex.updateTax();
	};

	WriteRodex.updateWeight = function updateWeight(weight) {
		WriteRodex.ui.find('.weigth-text').html(weight + '  2000');
	}

	WriteRodex.updateTax = function updateTax() {
		let total_items = WriteRodex.list.length;
		let tax = total_items * 2500;
		WriteRodex.ui.find('.tax-text').html(tax);
	}

	WriteRodex.close = function close() {
		WriteRodex.ui.hide();
	}

	function prettifyZeny(value) {
		var num = String(value);
		var i = 0, len = num.length;
		var out = '';

		while (i < len) {
			out = num[len - i - 1] + out;
			if ((i + 1) % 3 === 0 && i + 1 !== len) {
				out = ',' + out;
			}
			++i;
		}

		return out;
	}

	function onClickValidateName(e) {
		e.stopImmediatePropagation();
		let name = WriteRodex.ui.find('.name').val();
		WriteRodex.validateName(name.replace(/^(\$|\%)/, '').replace(/\t/g, ''));
	}

	/**
	 * Drop an item from inventory to writerodex
	 *
	 * @param {event}
	 */
	function onDrop(event) {
		var item, data;
		event.stopImmediatePropagation();

		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
			item = data.data;
		}
		catch (e) {
			return false;
		}

		// Just allow item from inventory
		if (data.type !== 'item' || data.from !== 'Inventory') {
			return false;
		}

		// Have to specify how much
		if (item.count > 1) {
			InputBox.append();
			InputBox.setType('number', false, item.count);

			InputBox.onSubmitRequest = function OnSubmitRequest(count) {
				InputBox.remove();
				switch (data.from) {
					case 'Inventory':
						getModule('UI/Components/Inventory/Inventory').reqMoveItemToWriteRodex(item.index, parseInt(count, 10));
						break;
					default:
					//cant do this action
				}
			};
			return false;
		}

		switch (data.from) {
			case 'Inventory':
				getModule('UI/Components/Inventory/Inventory').reqMoveItemToWriteRodex(item.index, 1);
				break;
			default:
			//cant do this action
		}
		return false;
	}

	/**
 * Stop event propagation
 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Show item name when mouse is over
	 */
	function onItemOver() {
		var idx = parseInt(this.getAttribute('data-index'), 10);
		var item = WriteRodex.getItemByIndex(idx);

		if (!item) {
			return;
		}

		// Get back data
		var pos = jQuery(this).position();
		var overlay = WriteRodex.ui.find('.overlay');

		// Display box
		overlay.show();
		overlay.css({ top: pos.top, left: pos.left + 35 });
		overlay.text(DB.getItemName(item) + ' ' + (item.count || 1) + ' ea');

		if (item.IsIdentified) {
			overlay.removeClass('grey');
		}
		else {
			overlay.addClass('grey');
		}
	}


	/**
	 * Hide the item name
	 */
	function onItemOut() {
		WriteRodex.ui.find('.overlay').hide();
	}


	/**
	 * Start dragging an item
	 */
	function onItemDragStart(event) {
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item = WriteRodex.getItemByIndex(index);

		if (!item) {
			return;
		}

		// Set image to the drag drop element
		var img = new Image();
		var url = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
		img.src = url.replace(/^\"/, '').replace(/\"$/, '');

		event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
		event.originalEvent.dataTransfer.setData('Text',
			JSON.stringify(window._OBJ_DRAG_ = {
				type: 'item',
				from: 'WriteRodex',
				data: item
			})
		);

		onItemOut();
	}


	/**
	 * Stop dragging an item
	 *
	 */
	function onItemDragEnd() {
		delete window._OBJ_DRAG_;
	}


	/**
	 * Get item info (open description window)
	 */
	function onItemInfo(event) {
		event.stopImmediatePropagation();

		var index = parseInt(this.getAttribute('data-index'), 10);
		var item = WriteRodex.getItemByIndex(index);

		if (!item) {
			return false;
		}

		// Don't add the same UI twice, remove it
		if (ItemInfo.uid === item.ITID) {
			ItemInfo.remove();
			return false;
		}

		// Add ui to window
		ItemInfo.append();
		ItemInfo.uid = item.ITID;
		ItemInfo.setItem(item);

		return false;
	}

	/**
	* Callbacks
	*/

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(WriteRodex);
});
