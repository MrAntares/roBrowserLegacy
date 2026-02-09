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
	var Navigation = require('UI/Components/Navigation/Navigation');
	var jQuery = require('Utils/jquery');
	var htmlText = require('text!./QuestHelperV1.html');
	var cssText = require('text!./QuestHelperV1.css');

	/**
	 * Create Component
	 */
	var QuestHelperV1 = new UIComponent('QuestHelperV1', htmlText, cssText);

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
		'QuestHelperV1',
		{
			x: 200,
			y: 200,
			show: false
		},
		1.0
	);

	/**
	 * Process text with color codes (^RRGGBB)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with color spans
	 */
	function processColorCodes(text) {
		if (!text) return '';
		// Convert to string to handle non-string inputs
		text = String(text);
		return text
			.replace(/\^([0-9A-Fa-f]{6})/g, function (match, color) {
				return '<span style="color:#' + color + '">';
			})
			.replace(/\^000000/g, '</span>');
	}

	/**
	 * Process item tags in text (<ITEM>Name<INFO>ID</INFO></ITEM>)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with processed item tags
	 */
	function processItemTags(text) {
		if (!text) return '';
		text = String(text);
		return text.replace(/<ITEM>([^<]+)<INFO>(\d+)<\/INFO><\/ITEM>/g, function (match, itemName, itemId) {
			return '<span class="item-link" data-item-id="' + itemId + '">' + itemName + '</span>';
		});
	}

	/**
	 * Process NAVI tags in text (<NAVI>Display Name<INFO>mapname,x,y,0,000,flag</INFO></NAVI>)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with processed NAVI tags
	 */
	function processNAVITags(text) {
		if (!text) return '';
		text = String(text);
		return text.replace(/<NAVI>([^<]+)<INFO>([^<]+)<\/INFO><\/NAVI>/g, function (match, displayName, naviInfo) {
			return (
				'<span class="navi-link" data-navi-info="' +
				naviInfo +
				'" data-navi-name="' +
				displayName +
				'">' +
				displayName +
				'</span>'
			);
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
		text = processNAVITags(text);
		text = processColorCodes(text);
		return text;
	}

	/**
	 * Initialize the component (event listener, etc.)
	 */
	QuestHelperV1.init = function init() {
		// Avoid drag drop problems
		this.ui.on('click', '.quest-info-close-btn', onClickClose);
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

		// Add click handler for item links
		this.ui.on('click', '.item-link', function (event) {
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

		// Add click handler for navi links
		this.ui.on('click', '.navi-link', function (event) {
			var naviInfo = jQuery(this).data('navi-info');
			var displayName = jQuery(this).data('navi-name');

			if (!naviInfo) {
				return;
			}

			// If the Navigation window is already showing this location, toggle it off
			if (Navigation.uid === naviInfo && Navigation.ui.is(':visible')) {
				Navigation.hide();
				return;
			}

			// Show the Navigation window and set the info
			Navigation.show();
			Navigation.uid = naviInfo;
			Navigation.setNaviInfo(naviInfo, displayName);
		});

		this.draggable(this.ui.find('.titlebar'));
	};

	/**
	 * Once append to the DOM, start to position the UI
	 */
	QuestHelperV1.onAppend = function onAppend() {
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x + 382), Renderer.width - this.ui.width())
		});
	};

	QuestHelperV1.setQuestInfo = function setQuestInfo(quest) {
		QuestHelperV1.ui.find('.title').html(processText(quest.title));
		QuestHelperV1.ui.find('.summary').html(processText(quest.summary));
		QuestHelperV1.ui.find('.objective').html(processText(quest.description));
		let list = '<select class="monster-select">';
		let first = true;
		for (let huntID in quest.hunt_list) {
			if (first) {
				QuestHelperV1.ui.find('.killed').html(quest.hunt_list[huntID].huntCount);
				QuestHelperV1.ui.find('.limited').html(quest.hunt_list[huntID].maxCount);
				first = false;
			}
			list +=
				'<option current="' +
				quest.hunt_list[huntID].huntCount +
				'" max="' +
				quest.hunt_list[huntID].maxCount +
				'">' +
				processText(quest.hunt_list[huntID].mobName) +
				'</option>';
		}
		list += '</select>';
		QuestHelperV1.ui.find('.monster').html(list);
		this.ui.find('.monster-select').on('change', onSelectMonster);
	};

	QuestHelperV1.clearQuestDesc = function clearQuestDesc() {
		QuestHelperV1.ui.find('.title').html('');
		QuestHelperV1.ui.find('.summary').html('');
		QuestHelperV1.ui.find('.objective').html('');
		QuestHelperV1.ui.find('.monster').html('');
		QuestHelperV1.ui.find('.killed').html('');
		QuestHelperV1.ui.find('.limited').html('');
	};

	/**
	 * Clean up UI
	 */
	QuestHelperV1.clean = function clean() {
		QuestHelperV1.ui.hide();
		onClose();
	};

	/**
	 * Removing the UI from window, save preferences
	 *
	 */
	QuestHelperV1.onRemove = function onRemove() {};

	/**
	 * Show/Hide UI
	 */
	QuestHelperV1.toggle = function toggle() {
		if (this.ui.is(':visible')) {
			this.ui.hide();
		} else {
			this.ui.show();
		}
	};

	function onClickClose(e) {
		QuestHelperV1.ui.hide();
	}

	/**
	 * Close the window
	 */
	function onClose() {
		QuestHelperV1.ui.hide();
	}

	function onSelectMonster(e) {
		var selected_monster = jQuery(e.currentTarget);
		QuestHelperV1.ui.find('.killed').html(selected_monster.attr('current'));
		QuestHelperV1.ui.find('.limited').html(selected_monster.attr('max'));
	}

	/**
	 * Export
	 */
	return UIManager.addComponent(QuestHelperV1);
});
