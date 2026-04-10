/**
 * UI/Components/Rodex/ReadRodex.js
 *
 * Chararacter ReadRodex
 *
 * @author Alisonrag
 *
 */

import DB from 'DB/DBManager.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Client from 'Core/Client.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './ReadRodex.html?raw';
import cssText from './ReadRodex.css?raw';
import Rodex from 'UI/Components/Rodex/Rodex.js';

/**
 * Create Component
 */
const ReadRodex = new UIComponent('ReadRodex', htmlText, cssText);

ReadRodex.MailID = 0;
ReadRodex.openType = 0;

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'ReadRodex',
	{
		show: false
	},
	1.0
);

/**
 * Initialize Component
 */
ReadRodex.onAppend = function onAppend() {
	// Bind buttons
	ReadRodex.ui.find('.right .close').on('click', onClickClose);

	ReadRodex.ui.css({
		top: Math.min(Math.max(0, parseInt(Rodex.ui.css('top'), 10)), Renderer.height - ReadRodex.ui.height()),
		left: Math.min(Math.max(0, parseInt(Rodex.ui.css('left'), 10)) + 310, Renderer.width - ReadRodex.ui.width())
	});

	ReadRodex.draggable(ReadRodex.ui.find('.titlebar'));
};

/**
 * Remove Mail from window (and so clean up items)
 */
ReadRodex.onRemove = function OnRemove() {
	_preferences.show = this.ui.is(':visible');
	_preferences.save();
};

ReadRodex.initData = function initData(data, mail) {
	ReadRodex.MailID = mail.MailID;
	ReadRodex.openType = mail.openType;
	ReadRodex.SenderName = mail.SenderName;
	ReadRodex.ui.find('.name').html(mail.SenderName);
	ReadRodex.ui.find('.title-text').html(mail.title);
	ReadRodex.ui.find('.content-text').html(data.Textcontent);
	ReadRodex.ui.find('.value').html(prettifyZeny(data.zeny));
	this.ui.find('.get-content').on('click', onClickGetItems);
	this.ui.find('.get-zeny').on('click', onClickGetZeny);
	this.ui.find('.delete').on('click', onClickDelete);
	this.ui.find('.reply').on('click', onClickReply);
	const content = ReadRodex.ui.find('.item-list');
	content.html('');
	for (let i = 0; i < data.ItemList.length; i++) {
		const item = data.ItemList[i];
		const it = DB.getItemInfo(item.ITID);
		content.append(
			'<div class="item" data-index="' +
				i +
				'">' +
				'<div class="icon"></div>' +
				'<div class="amount"><span class="count">' +
				(item.count || 1) +
				'</span></div>' +
				'</div>'
		);
		Client.loadFile(DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp', function (url) {
			content.find('.item[data-index="' + i + '"] .icon').css('backgroundImage', 'url(' + url + ')');
		});
	}
	if (data.ItemList.length > 0) {
		this.ui.find('.get-content').show();
	} else {
		this.ui.find('.get-content').hide();
	}
	if (data.zeny > 0) {
		this.ui.find('.get-zeny').show();
	} else {
		this.ui.find('.get-zeny').hide();
	}
	ReadRodex.ui.show();
	ReadRodex.ui.focus();
};

function onClickClose(e) {
	e.stopImmediatePropagation();
	ReadRodex.MailID = 0;
	ReadRodex.openType = 0;
	ReadRodex.SenderName = '';
	ReadRodex.ui.hide();
}

function onClickGetItems(e) {
	e.stopImmediatePropagation();
	Rodex.requestItemsFromRodex(ReadRodex.openType, ReadRodex.MailID);
}

function onClickGetZeny(e) {
	e.stopImmediatePropagation();
	Rodex.requestZenyFromRodex(ReadRodex.openType, ReadRodex.MailID);
}

function onClickDelete(e) {
	e.stopImmediatePropagation();
	UIManager.showPromptBox(DB.getMessage(356), 'ok', 'cancel', function () {
		Rodex.requestDeleteRodex(ReadRodex.openType, ReadRodex.MailID);
	});
}

function onClickReply(e) {
	e.stopImmediatePropagation();
	Rodex.requestOpenWriteRodex(ReadRodex.SenderName);
}

ReadRodex.clearItemList = function clearItemList() {
	ReadRodex.ui.find('.item-list').html('');
};

ReadRodex.clearZeny = function clearZeny() {
	ReadRodex.ui.find('.value').html('');
};

ReadRodex.close = function close() {
	ReadRodex.MailID = 0;
	ReadRodex.openType = 0;
	ReadRodex.SenderName = '';
	ReadRodex.ui.hide();
};

/**
 * Prettify number (15000 -> 15,000)
 *
 * @param {number}
 * @return {string}
 */
function prettifyZeny(value) {
	const num = String(value);
	let i = 0;
	const len = num.length;
	let out = '';

	while (i < len) {
		out = num[len - i - 1] + out;
		if ((i + 1) % 3 === 0 && i + 1 !== len) {
			out = ',' + out;
		}
		++i;
	}

	return out;
}

/**
 * Callbacks
 */

/**
 * Create component and export it
 */
export default UIManager.addComponent(ReadRodex);
