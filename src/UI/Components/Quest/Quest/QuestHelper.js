/**
 * UI/Components/Quest/QuestHelper.js
 *
 * Manage interface for Quest List
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';


	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var jQuery = require('Utils/jquery');
	var htmlText = require('text!./QuestHelper.html');
	var cssText = require('text!./QuestHelper.css');

	/**
	 * Create Component
	 */
	var QuestHelper = new UIComponent('QuestHelper', htmlText, cssText);


	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('Quest', {
		x: 200,
		y: 200,
		show: false,
	}, 1.0);


	/**
	 * Process text with color codes (^RRGGBB)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with color spans
	 */
	function processColorCodes(text) {
		if (!text) return '';
		// Convert to string to handle non-string inputs
		text = String(text);
		return text.replace(/\^([0-9A-Fa-f]{6})/g, function(match, color) {
			return '<span style="color:#' + color + '">';
		}).replace(/\^000000/g, '</span>');
	}

	/**
	 * Process item tags in text (<ITEM>Name<INFO>ID</INFO></ITEM>)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with processed item tags
	 */
	function processItemTags(text) {
		if (!text) return '';
		text = String(text);
		return text.replace(/<ITEM>([^<]+)<INFO>(\d+)<\/INFO><\/ITEM>/g, function(match, itemName, itemId) {
			return '<span class="item-link" data-item-id="' + itemId + '">' + itemName + '</span>';
		});
	}

	/**
	 * Process all text formatting (color codes and item tags)
	 * @param {string} text - The text to process
	 * @returns {string} Fully processed HTML
	 */
	function processText(text) {
		if (!text) return '';
		text = processItemTags(text);
		text = processColorCodes(text);
		return text;
	}

	/**
	 * Initialize the component (event listener, etc.)
	 */
	QuestHelper.init = function init() {
		// Avoid drag drop problems
		this.ui.on('click', '.quest-info-bottom-btn', onClickClose);
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

		// Add click handler for item links
		this.ui.on('click', '.item-link', function(event) {
			var itemId = parseInt(jQuery(this).data('item-id'), 10);
			if (!itemId) {
				return;
			}

			// Don't add the same UI twice, remove it
			if (ItemInfo.uid === itemId) {
				ItemInfo.remove();
				return;
			}

			// Add ui to window
			ItemInfo.append();
			ItemInfo.uid = itemId;
			ItemInfo.setItem({ ITID: itemId, IsIdentified: true });
		});

		this.draggable(this.ui.find('.titlebar'));
	};


	/**
	 * Once append to the DOM, start to position the UI
	 */
	QuestHelper.onAppend = function onAppend() {
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x + 382), Renderer.width - this.ui.width())
		});
	};

	QuestHelper.setQuestInfo = function setQuestInfo(quest) {
		QuestHelper.ui.find('.quest-info-title-panel-text').html(processText(quest.title));
		QuestHelper.ui.find('.quest-info-description-panel-text .quest-ui-text-span').html(processText(quest.description));
		let list = ""
		for (let huntID in quest.hunt_list) {
			list += '<li>' + processText(quest.hunt_list[huntID].mobName) + ' ( ' + quest.hunt_list[huntID].huntCount + ' / ' + quest.hunt_list[huntID].maxCount + ' )</li>';
		}
		QuestHelper.ui.find('.quest-info-monster-panel-text .quest-ui-text-span').html('<ul class="quest-ui-monster-list">' + list + '<ul>');
		if (quest.reward_exp_base > 0)
			QuestHelper.ui.find('.quest-info-reward-li-base').html(quest.reward_exp_base);
		if (quest.reward_exp_job > 0)
			QuestHelper.ui.find('.quest-info-reward-li-job').html(quest.reward_exp_job);

		for (let i = 0; i < quest.reward_item_list.length; i++) {
			let it = DB.getItemInfo(quest.reward_item_list[i].ItemID);
			let item_li = '<li class="quest-reward-item-li"><div class="quest-reward-item" data-index="' + quest.reward_item_list[i].ItemID + '">' + '<div class="quest-icon"></div></div><div class="quest-reward-item-info"><span class="quest-reward-item-name">' + processText(it.identifiedDisplayName) + '</span><br><span>' + quest.reward_item_list[i].ItemNum + '</span></div></li>';
			QuestHelper.ui.find('.quest-info-reward-li-item-list').append(item_li);
			Client.loadFile(DB.INTERFACE_PATH + 'renew_questui/img_questiocn.bmp', function (data) {
				QuestHelper.ui.find('.quest-reward-item[data-index="' + quest.reward_item_list[i].ItemID + '"]').css('backgroundImage', 'url(' + data + ')');
			});
			Client.loadFile(DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp', function (data) {
				QuestHelper.ui.find('.quest-reward-item[data-index="' + quest.reward_item_list[i].ItemID + '"] .quest-icon').css('backgroundImage', 'url(' + data + ')');
			});
		}

		// TODO: quest.npc_spr

		if (quest.end_time) {
			var d = new Date(0);
			d.setUTCSeconds(quest.end_time);
			QuestHelper.ui.find('.quest-info-bottom-deadline-info-text').html('Deadline [' + d.toLocaleString() + ']');
		}

	};

	QuestHelper.clearQuestDesc = function clearQuestDesc() {
		QuestHelper.ui.find('.quest-info-title-panel-text').html("");
		QuestHelper.ui.find('.quest-info-description-panel-text .quest-ui-text-span').html("");
		QuestHelper.ui.find('.quest-info-monster-panel-text .quest-ui-text-span').html('<ul class="quest-ui-monster-list"><ul>');
		QuestHelper.ui.find('.quest-info-reward-li-base').html("");
		QuestHelper.ui.find('.quest-info-reward-li-job').html("");
		QuestHelper.ui.find('.quest-info-bottom-deadline-info-text').html("");
		QuestHelper.ui.find('.quest-info-reward-li-item-list').html("");
	}

	/**
	 * Clean up UI
	 */
	QuestHelper.clean = function clean() {
		QuestHelper.ui.hide();
		onClose();
	};


	/**
	 * Removing the UI from window, save preferences
	 *
	 */
	QuestHelper.onRemove = function onRemove() {
	};


	/**
	 * Show/Hide UI
	 */
	QuestHelper.toggle = function toggle() {
		if (this.ui.is(':visible')) {
			this.ui.hide();
		} else {
			this.ui.show();
		}
	};


	function onClickClose(e) {
		QuestHelper.ui.hide();
	}

	/**
	 * Close the window
	 */
	function onClose() {
		QuestHelper.ui.hide();
	}


	/**
	 * Export
	 */
	return UIManager.addComponent(QuestHelper);
});
