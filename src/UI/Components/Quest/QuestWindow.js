/**
 * UI/Components/Quest/QuestWindow.js
 *
 * Manage interface for Quest Window
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
	var Preferences = require('Core/Preferences');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./QuestWindow.html');
	var cssText = require('text!./QuestWindow.css');

	var _preferences = Preferences.get('Quest', {
		x: 200,
		y: 200,
		show: false,
		showwindow: true
	}, 1.0);


	/**
	 * Create Component
	 */
	var QuestWindow = new UIComponent('QuestWindow', htmlText, cssText);


	/**
	 * Initialize the component (event listener, etc.)
	 */
	QuestWindow.init = function init() {
		// Avoid drag drop problems
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.focus();
	};


	/**
	 * Once append to the DOM, start to position the UI
	 */
	QuestWindow.onAppend = function onAppend() {
		if (!_preferences.showwindow) {
			this.ui.hide();
		}
	};


	/**
	 * Clean up UI
	 */
	QuestWindow.clean = function clean() {
		QuestWindow.ui.hide();
		this.ui.focus();
	};

	/**
	 * Set Quest list
	 *
	 * @param {Array} quests
	 */
	QuestWindow.setQuestList = function setQuestList(quests, questNotShowList) {
		let $already_show = 0;
		for (let questID in quests) {
			if (!questNotShowList.includes(quests[questID].questID)) {
				if (!isInCooldown(quests[questID])) {
					if (quests[questID].active == 1 && $already_show < 4) {
						QuestWindow.addQuestToUI(quests[questID]);
						$already_show++;
					}
				}
			}
		}
	};

	function isInCooldown(quest) {
		if(quest.end_time == 0) return false;
		let epoch_seconds = new Date() / 1000;
		if(quest.end_time > epoch_seconds) return true;
		return false;
	}

	QuestWindow.ClearQuestList = function ClearQuestList() {
		QuestWindow.ui.find('.quest-window-ul').html('');
	}

	QuestWindow.addQuestToUI = function addQuestToUI(quest) {
		let title, summary = "";
		title = (quest.title.length > 25) ? quest.title.substr(0, 25) + '...' : quest.title;
		summary = (quest.summary.length > 25) ? quest.summary.substr(0, 25) + '...' : quest.summary;
		let list = ""
		for (let huntID in quest.hunt_list) {
			list += '<li>' + quest.hunt_list[huntID].mobName + ' ( ' + quest.hunt_list[huntID].huntCount + ' / ' + quest.hunt_list[huntID].maxCount + ' )</li>';
		}
		QuestWindow.ui.find('.quest-window-ul').append('<li class="quest-window-li"> <div class="quest-window-li-title">' + title + '</div> <div class="quest-window-li-summary">' + summary + '</div> <div class="quest-window-li-monster"><ul>' + list + '</ul></div> </li>');
	}

	/**
	 * Export
	 */
	return UIManager.addComponent(QuestWindow);
});