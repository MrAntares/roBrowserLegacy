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
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
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
	 * Initialize the component (event listener, etc.)
	 */
	QuestHelper.init = function init() {
		// Avoid drag drop problems
		this.ui.on('click', '.quest-info-bottom-btn', onClickClose);
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
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
		QuestHelper.ui.find('.quest-info-title-panel-text').html(quest.title);
		QuestHelper.ui.find('.quest-info-description-panel-text .quest-ui-text-span').html(quest.description);
		let list = ""
		for (let huntID in quest.hunt_list) {
			list += '<li>' + quest.hunt_list[huntID].mobName + ' ( ' + quest.hunt_list[huntID].huntCount + ' / ' + quest.hunt_list[huntID].maxCount + ' )</li>';
		}
		QuestHelper.ui.find('.quest-info-monster-panel-text .quest-ui-text-span').html('<ul class="quest-ui-monster-list">' + list + '<ul>');
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
		QuestHelper.ui.find('.quest-info-bottom-deadline-info-text').html("");
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