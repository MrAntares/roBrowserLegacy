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
	var QuestHelperV1 = new UIComponent('QuestHelperV1', htmlText, cssText);


	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('QuestHelperV1', {
		x: 200,
		y: 200,
		show: false,
	}, 1.0);


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
		QuestHelperV1.ui.find('.title').html(quest.title);
		QuestHelperV1.ui.find('.summary').html(quest.summary);
		QuestHelperV1.ui.find('.objective').html(quest.description);
		let list = '<select class="monster-select">'
		let first = true;
		for (let huntID in quest.hunt_list) {
			if(first) {
				QuestHelperV1.ui.find('.killed').html(quest.hunt_list[huntID].huntCount);
				QuestHelperV1.ui.find('.limited').html(quest.hunt_list[huntID].maxCount);
				first = false;
			}
			list += '<option current="' + quest.hunt_list[huntID].huntCount + '" max="' + quest.hunt_list[huntID].maxCount + '">' + quest.hunt_list[huntID].mobName + '</option>';
		}
		list += '</select>'
		QuestHelperV1.ui.find('.monster').html(list);
		this.ui.find('.monster-select').on('change', onSelectMonster);
	};

	QuestHelperV1.clearQuestDesc = function clearQuestDesc() {
		QuestHelperV1.ui.find('.title').html("");
		QuestHelperV1.ui.find('.summary').html("");
		QuestHelperV1.ui.find('.objective').html("");
		QuestHelperV1.ui.find('.monster').html("");
		QuestHelperV1.ui.find('.killed').html("");
		QuestHelperV1.ui.find('.limited').html("");
	}

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
	QuestHelperV1.onRemove = function onRemove() {
	};


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