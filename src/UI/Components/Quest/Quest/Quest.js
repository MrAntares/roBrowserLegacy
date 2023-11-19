/**
 * UI/Components/Quest/Quest.js
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
	var Client = require('Core/Client');
	var Renderer = require('Renderer/Renderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var QuestHelper = require('./QuestHelper');
	var QuestWindow = require('./QuestWindow');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var htmlText = require('text!./Quest.html');
	var cssText = require('text!./Quest.css');
	var jQuery = require('Utils/jquery');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var Session = require('Engine/SessionStorage');

	/**
	 * Create Component
	 */
	var Quest = new UIComponent('Quest', htmlText, cssText);


	/**
	 * @var {number} index of selection
	 */
	var _index = -1;

	/**
	 * @var {Array} quest list
	 */
	var _questList = [];

	/**
	 * @var {Array} quest list
	 */
	var _questNotShowList = [];

	/**
	 * @var {string} _active_menu active click menu
	 */
	var _active_menu = 'active';

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('Quest', {
		x: 200,
		y: 200,
		show: false,
		showwindow: true
	}, 1.0);


	/**
	 * Initialize the component (event listener, etc.)
	 */
	Quest.init = function init() {
		QuestHelper.prepare();
		QuestWindow.prepare();

		// Avoid drag drop problems
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.find('.close').click(onClose);
		this.ui.on('click', '.quest-menu-item', onClickMenu);
		this.ui.on('click', '.close-quest-container-btn', onClickClose);
		this.draggable(this.ui.find('.titlebar'));
		this.ui.find('#active-quest-list').show();
		this.ui.on('click', '.toggle-quest-list', onClickQuestCheckbox);
	};


	/**
	 * Once append to the DOM, start to position the UI
	 */
	Quest.onAppend = function onAppend() {
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		var checkbox_background = (_preferences.showwindow) ? "checkbox_on" : "checkbox_off";

		Client.loadFile(DB.INTERFACE_PATH + 'renew_questui/' + checkbox_background + '.bmp', function (data) {
			Quest.ui.find('.toggle-quest-image').css('backgroundImage', 'url(' + data + ')');
		}.bind(this));

		Client.loadFile(DB.INTERFACE_PATH + 'renew_questui/bg_quest1.bmp', function (data) {
			Quest.ui.find('.titlebar').css('backgroundImage', 'url(' + data + ')');
		}.bind(this));

		if (!_preferences.show) {
			this.ui.hide();
		}
		
		QuestWindow.append();
	};


	/**
	 * Clean up UI
	 */
	Quest.clean = function clean() {
		_active_menu = '';
		_questList = {};
		Quest.ui.find('#active-quest-list').show();
		Quest.ui.find('#inactive-quest-list').hide();
		Quest.ui.find('#feature-quest-list').hide();
		Quest.ui.find('#cooldown-quest-list').hide();
		Quest.ClearQuestList();
		QuestHelper.clearQuestDesc();
		QuestWindow.ClearQuestList();
		onClose();
	};


	/**
	 * Removing the UI from window, save preferences
	 *
	 */
	Quest.onRemove = function onRemove() {
		// Save preferences
		_preferences.show = this.ui.is(':visible');
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.save();
	};


	/**
	 * Window Shortcuts
	 */
	Quest.onShortCut = function onShurtCut(key) {
		switch (key.cmd) {
			case 'TOGGLE':
				this.ui.toggle();
				if (this.ui.is(':visible')) {
					this.focus();
				}
				break;
		}
	};


	/**
	 * Show/Hide UI
	 */
	Quest.toggle = function toggle() {
		if (this.ui.is(':visible')) {
			this.ui.hide();
		} else {
			this.ui.show();
		}
	};


	/**
	 * Set Quest list
	 *
	 * @param {Array} quests
	 */
	Quest.setQuestList = function setQuestList(quests) {
		_questList = quests;
		Quest.ClearQuestList();
		for (let questID in quests) {
			Quest.addQuestToUI(quests[questID]);
		}
		QuestWindow.ClearQuestList();
		QuestWindow.setQuestList(_questList, _questNotShowList);
	};


	/**
	 * Add new Quest
	 *
	 * @param {object} quest
	 * @param {number} questID
	 */
	Quest.addQuest = function addQuest(quest, questID) {
		_questList[questID] = quest;
		Quest.addQuestToUI(quest);
		QuestWindow.ClearQuestList();
		QuestWindow.setQuestList(_questList, _questNotShowList);
	};


	/**
	 * Update Quest from list
	 *
	 * @param {object} hunt_info
	 * @param {number} questID
	 * @param {number} huntID
	*/
	Quest.updateMissionHunt = function updateMissionHunt(hunt_info, questID, huntID) {
		if (hunt_info.huntIDCount) _questList[questID].hunt_list[huntID].huntIDCount = hunt_info.huntIDCount;
		if (hunt_info.maxCount) _questList[questID].hunt_list[huntID].maxCount = hunt_info.maxCount;
		if (hunt_info.huntCount) _questList[questID].hunt_list[huntID].huntCount = hunt_info.huntCount;
		if (hunt_info.mobGID) _questList[questID].hunt_list[huntID].mobGID = hunt_info.mobGID;

		let mob_name = _questList[questID].hunt_list[huntID].mobName;
		let quest_info = DB.getQuestInfo(questID);
		let chat_quest_text = `Mission [${quest_info.Title}], you killed [${mob_name}]. (${_questList[questID].hunt_list[huntID].huntCount}/${_questList[questID].hunt_list[huntID].maxCount})`;
		let self_msg;
		if (_questList[questID].hunt_list[huntID].maxCount == _questList[questID].hunt_list[huntID].huntCount) {
			self_msg = `${mob_name} [Completed]`;
		} else {
			self_msg = `${mob_name} [${_questList[questID].hunt_list[huntID].huntCount}/${_questList[questID].hunt_list[huntID].maxCount}]`;
		}

		ChatBox.addText(chat_quest_text, ChatBox.TYPE.ADMIN | ChatBox.TYPE.SELF, ChatBox.FILTER.QUEST);
		if (Session.Entity) {
			Session.Entity.dialog.set(self_msg, "yellow");
		}
		QuestWindow.ClearQuestList();
		QuestWindow.setQuestList(_questList, _questNotShowList);
	};


	/**
	 * Remove Quest from list
	 *
	 * @param {number} questID
	*/
	Quest.removeQuest = function removeQuest(questID) {
		delete _questList[questID];
		refreshQuestUI();
	};


	/**
	 * Toggle Quest Active/Inactive
	 *
	 * @param {number} questID
	 * @param {boolean} active
	 */
	Quest.toggleQuestActive = function toggleQuestActive(questID, active) {
		_questList[questID].active = active;
		refreshQuestUI();
	};


	/**
	 * return questID based on huntID/mobGID
	 *
	 * @param {number} ID
	*/
	Quest.getQuestIDByServerID = function getQuestIDByServerID(ID) {
		for (var key in _questList) {
			if (typeof _questList[key].hunt_list[ID] !== "undefined") {
				return key;
			}
		}
		return -1;
	};


	/**
	 * Check if quest exists
	 *
	 * @param {number} questID
	*/
	Quest.questExists = function questExists(questID) {
		return (typeof _questList[questID] !== "undefined") ? true : false;
	};


	Quest.addQuestToUI = function addQuest(quest) {
		let ul_id = "";
		let li_text = "";
		let toggle_id = "qid" + quest.questID;
		let show_id = "sid" + quest.questID;
		let title = (quest.title.length > 30) ? quest.title.substr(0, 30) + '...' : quest.title;
		let summary = (quest.summary.length > 30) ? quest.summary.substr(0, 30) + '...' : quest.summary;
		let bt_check = _questNotShowList.includes(parseInt(Number(quest.questID))) ? "bt_check_off" : "bt_check_on";

		let epoch_seconds = new Date() / 1000;
		if (quest.end_time > 0 && quest.end_time > epoch_seconds) {
			ul_id = "#cooldown-quest-list"
			li_text = '<li> <div class="quest-item-icon"> <div class="quest-item-icon-image" data-background="renew_questui/' + quest.icon + '"> <span class="quest-item-icon-image-text">Quest</span> </div> </div>  <div class="quest-item-title"> <span class="quest-item-title-text">' + title + '</span>  </div> <div class="quest-item-display"> <div class="quest-item-display-image"> <span class="quest-item-display-image-text"></span> </div></div><div class="quest-item-summary"><span class="quest-item-summary-text">' + summary + '</span></div>				<div class="quest-item-toggle"><div class="quest-item-toggle-image"><span class="quest-item-toggle-image-text">Toggle</span></div></div></li>';
		} else if (quest.active == 1) {
			ul_id = "#active-quest-list";
			li_text = '<li> <div class="quest-item-icon"> <div class="quest-item-icon-image" data-background="renew_questui/' + quest.icon + '"> <span class="quest-item-icon-image-text">Quest</span> </div> </div>  <div class="quest-item-title"> <span class="quest-item-title-text">' + title + '</span>  </div> <div class="quest-item-display"> <button id="' + show_id + '" class="quest-item-display-image"> <span class="quest-item-display-image-text"></span> </button></div><div class="quest-item-summary"><span class="quest-item-summary-text">' + summary + '</span></div>				<div class="quest-item-toggle"><button id="' + toggle_id + '" class="quest-item-toggle-image" data-background="renew_questui/bt_lock_open.bmp"><span class="quest-item-toggle-image-text">Toggle</span></button></div></li>';
		} else {
			ul_id = "#inactive-quest-list";
			li_text = '<li> <div class="quest-item-icon"> <div class="quest-item-icon-image" data-background="renew_questui/' + quest.icon + '"> <span class="quest-item-icon-image-text">Quest</span> </div> </div>  <div class="quest-item-title"> <span class="quest-item-title-text">' + title + '</span>  </div> <div class="quest-item-display"> <div class="quest-item-display-image"> <span class="quest-item-display-image-text"></span> </div></div><div class="quest-item-summary"><span class="quest-item-summary-text">' + summary + '</span></div>				<div class="quest-item-toggle"><button id="' + toggle_id + '" class="quest-item-toggle-image" data-background="renew_questui/bt_lock.bmp"><span class="quest-item-toggle-image-text">Toggle</span></button></div></li>';
		}

		this.ui.find(ul_id).append(
			jQuery(li_text).
				addClass('quest-item').
				data('background', 'renew_questui/bg_questlist.bmp').
				data('hover', 'renew_questui/bg_questlist_check.bmp').
				data('down', 'renew_questui/bg_questlist_press.bmp').
				on('click', function (e) {
					if (e.target.tagName.toLowerCase() == "button") return;
					let element = jQuery(e.currentTarget);
					if (element.attr('class') == "quest-item") {
						QuestHelper.clearQuestDesc();
						QuestHelper.setQuestInfo(quest);
						QuestHelper.prepare();
						QuestHelper.append();
						QuestHelper.ui.show();
						QuestHelper.ui.focus();
					}
				}).
				each(this.parseHTML)
		);

		this.ui.find('#' + toggle_id).on('click', onClickQuestToggle);
		this.ui.find('#' + show_id).on('click', onClickQuestDisplay);
		Client.loadFile(DB.INTERFACE_PATH + 'renew_questui/' + bt_check + '.bmp', function (data) {
			Quest.ui.find('#' + show_id).css('backgroundImage', 'url(' + data + ')');
		}.bind(this));
		this.ui.each(this.parseHTML).find('*').each(this.parseHTML);
	};


	function onClickMenu(e) {
		var quest_element = jQuery(e.currentTarget);

		if (_active_menu == quest_element.attr('id')) return;
		_active_menu = quest_element.attr('id');

		var background_image = "";
		Quest.ui.find('#active-quest-list').hide();
		Quest.ui.find('#inactive-quest-list').hide();
		Quest.ui.find('#feature-quest-list').hide();
		Quest.ui.find('#cooldown-quest-list').hide();
		switch (_active_menu) {
			case 'feature':
				background_image = "bg_quest2";
				Quest.ui.find('#feature-quest-list').show();
				break;
			case 'inactive':
				background_image = "bg_quest3";
				Quest.ui.find('#inactive-quest-list').show();
				break;
			case 'cooldown':
				background_image = "bg_quest4";
				Quest.ui.find('#cooldown-quest-list').show();
				break;
			default:
				background_image = "bg_quest1";
				Quest.ui.find('#active-quest-list').show();
		}

		Client.loadFile(DB.INTERFACE_PATH + 'renew_questui/' + background_image + '.bmp', function (data) {
			Quest.ui.find('.titlebar').css('backgroundImage', 'url(' + data + ')');
		}.bind(this));

		QuestHelper.clearQuestDesc();
	}

	function onClickQuestCheckbox() {
		var checkbox_background;
		if (_preferences.showwindow) {
			checkbox_background = "checkbox_off";
			QuestWindow.ui.hide();
		}
		else {
			checkbox_background = "checkbox_on";
			QuestWindow.ui.show();
		}
		_preferences.showwindow = !_preferences.showwindow;
		_preferences.save();

		Client.loadFile(DB.INTERFACE_PATH + 'renew_questui/' + checkbox_background + '.bmp', function (data) {
			Quest.ui.find('.toggle-quest-image').css('backgroundImage', 'url(' + data + ')');
		}.bind(this));
	}


	function onClickQuestToggle(e) {
		var toggle_element = jQuery(e.currentTarget);
		let tid = toggle_element.attr('id');
		let id = tid.replace("qid", "");
		var _pkt = new PACKET.CZ.ACTIVE_QUEST();
		_pkt.questID = _questList[id].questID;
		_pkt.active = (_questList[id].active == 1) ? 0 : 1;
		Network.sendPacket(_pkt);
	}

	function onClickQuestDisplay(e) {
		var display_element = jQuery(e.currentTarget);
		let cid = display_element.attr('id');
		let id = cid.replace("sid", "");
		let iid = parseInt(Number(id));

		let checkbox_background = "";
		if (_questNotShowList.includes(iid)) {
			let index = _questNotShowList.indexOf(iid);
			_questNotShowList.splice(index, 1);
			checkbox_background = "bt_check_on";
		} else {
			_questNotShowList.push(iid);
			checkbox_background = "bt_check_off";
		}

		Client.loadFile(DB.INTERFACE_PATH + 'renew_questui/' + checkbox_background + '.bmp', function (data) {
			Quest.ui.find('#' + cid).css('backgroundImage', 'url(' + data + ')');
		}.bind(this));

		QuestWindow.ClearQuestList();
		QuestWindow.setQuestList(_questList, _questNotShowList);
	}

	function onClickClose(e) {
		Quest.ui.hide();
	}


	function refreshQuestUI() {
		Quest.ClearQuestList();
		Quest.setQuestList(_questList);
		QuestWindow.ClearQuestList();
		QuestWindow.setQuestList(_questList, _questNotShowList);
	}


	Quest.ClearQuestList = function ClearQuestList() {
		Quest.ui.find('.quest-list').html('');
	}


	/**
	 * Close the window
	 */
	function onClose() {
		Quest.ui.hide();
	}

	/**
	 * Export
	 */
	return UIManager.addComponent(Quest);
});
