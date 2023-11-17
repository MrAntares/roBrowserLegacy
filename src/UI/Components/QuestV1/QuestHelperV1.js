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
	var htmlText = require('text!./QuestHelperV1.html');
	var cssText = require('text!./QuestHelperV1.css');

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
		this.ui.on('click', '.quest-info-close-btn', onClickClose);
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
		QuestHelper.ui.find('.title').html(quest.title);
		QuestHelper.ui.find('.summary').html(quest.summary);
		QuestHelper.ui.find('.objective').html(quest.description);
		let list = '<select class="monster-select">'
		let first = true;
		for (let huntID in quest.hunt_list) {
			if(first) {
				QuestHelper.ui.find('.killed').html(quest.hunt_list[huntID].huntCount);
				QuestHelper.ui.find('.limited').html(quest.hunt_list[huntID].maxCount);
				first = false;
			}
			list += '<option current="' + quest.hunt_list[huntID].huntCount + '" max="' + quest.hunt_list[huntID].maxCount + '">' + quest.hunt_list[huntID].mobName + '</option>';
		}
		list += '</select>'
		QuestHelper.ui.find('.monster').html(list);
		this.ui.find('.monster-select').on('change', onSelectMonster);
	};

	QuestHelper.clearQuestDesc = function clearQuestDesc() {
		QuestHelper.ui.find('.title').html("");
		QuestHelper.ui.find('.summary').html("");
		QuestHelper.ui.find('.objective').html("");
		QuestHelper.ui.find('.monster').html("");
		QuestHelper.ui.find('.killed').html("");
		QuestHelper.ui.find('.limited').html("");
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

	function onSelectMonster(e) {
		var selected_monster = jQuery(e.currentTarget);
		QuestHelper.ui.find('.killed').html(selected_monster.attr('current'));
		QuestHelper.ui.find('.limited').html(selected_monster.attr('max'));
	}


	/**
	 * Export
	 */
	return UIManager.addComponent(QuestHelper);
});