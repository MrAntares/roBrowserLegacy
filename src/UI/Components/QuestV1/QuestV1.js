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
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var QuestHelper = require('UI/Components/QuestV1/QuestHelperV1');
	var htmlText = require('text!./QuestV1.html');
	var cssText = require('text!./QuestV1.css');
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

		// Avoid drag drop problems
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.find('.view').click(onClickView);
		this.ui.find('.close').click(onClose);
		this.ui.find('.btn-right').click(onClose);

		this.ui.on('click', '.quest-menu-item', onClickMenu);
		this.ui.find('#active-quest-list').show();
		this.draggable(this.ui.find('.titlebar'));
	};


	/**
	 * Once append to the DOM, start to position the UI
	 */
	Quest.onAppend = function onAppend() {
		_index = -1;

		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_que_01.bmp', function (data) {
			Quest.ui.find('.quest-menu').css('backgroundImage', 'url(' + data + ')');
		}.bind(this));

		Quest.ui.find('#active-quest-list').show();
		Quest.ui.find('#inactive-quest-list').hide();
		Quest.ui.find('#all-quest-list').hide();

		if (!_preferences.show) {
			this.ui.hide();
		}
	};


	/**
	 * Clean up UI
	 */
	Quest.clean = function clean() {
		_active_menu = '';
		_questList = {};
		Quest.ui.find('#active-quest-list').hide();
		Quest.ui.find('#inactive-quest-list').hide();
		Quest.ui.find('#all-quest-list').hide();
		Quest.ClearQuestList();
		QuestHelper.clearQuestDesc();
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
		let toggle_id = "qid" + quest.questID;
		let title = (quest.title.length > 30) ? quest.title.substr(0, 30) + '...' : quest.title;
		let pattern = /^ico\_/; // new system ico_xx.bmp - not supported on this version
		let quest_icon = (pattern.test(quest.icon)) ? 'SG_FEEL.bmp' : quest.icon;
		let li_text = '<li id="' + toggle_id + '" class="quest-item ' + toggle_id + '"><div class="quest-item-icon"> <div class="quest-item-icon-image" data-background="item/' + quest_icon + '"></div> </div> <div class="quest-item-title"> <span class="quest-item-title-text">' + title + '</span> </div></li>';

		let ul_id = (quest.active == 1) ? "#active-quest-list" : "#inactive-quest-list";

		this.ui.find(ul_id).append(li_text);
		this.ui.find('#' + toggle_id).on('contextmenu', onClickQuestToggle);
		this.ui.find('#' + toggle_id).on('click', onClickQuest);
		this.ui.find('#all-quest-list').append(li_text);
		this.ui.find('.' + toggle_id).on('click', onClickQuest);
		this.ui.each(this.parseHTML).find('*').each(this.parseHTML);
	};


	function onClickMenu(e) {
		var quest_element = jQuery(e.currentTarget);

		if (_active_menu == quest_element.attr('id')) return;
		_active_menu = quest_element.attr('id');

		var background_image = "";
		Quest.ui.find('#active-quest-list').hide();
		Quest.ui.find('#inactive-quest-list').hide();
		Quest.ui.find('#all-quest-list').hide();
		switch (_active_menu) {
			case 'inactive':
				background_image = "tab_que_02";
				Quest.ui.find('#inactive-quest-list').show();
				break;
			case 'all':
				background_image = "tab_que_03";
				Quest.ui.find('#all-quest-list').show();
				break;
			default:
				background_image = "tab_que_01";
				Quest.ui.find('#active-quest-list').show();
		}

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/' + background_image + '.bmp', function (data) {
			Quest.ui.find('.quest-menu').css('backgroundImage', 'url(' + data + ')');
		}.bind(this));

		QuestHelper.clearQuestDesc();
	}

	function onClickQuest(e) {
		var toggle_element = jQuery(e.currentTarget);
		let tid = toggle_element.attr('id');
		let id = tid.replace("qid", "");
		if (_index > -1) {
			Quest.ui.find('.qid' + _index).css('background-color', 'white');
			Quest.ui.find('#qid' + _index).css('background-color', 'white');
		}
		_index = id;
		toggle_element.css('background-color', 'lightgray');
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

	function onClickView(e) {
		if (_index > -1) {
			QuestHelper.clearQuestDesc();
			QuestHelper.setQuestInfo(_questList[_index]);
			QuestHelper.prepare();
			QuestHelper.append();
			QuestHelper.ui.show();
			QuestHelper.ui.focus();
		}
	}

	function refreshQuestUI() {
		Quest.ClearQuestList();
		Quest.setQuestList(_questList);
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