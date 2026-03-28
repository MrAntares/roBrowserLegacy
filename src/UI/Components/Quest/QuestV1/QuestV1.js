/**
 * UI/Components/Quest/Quest.js
 *
 * Manage interface for Quest List
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Preferences from 'Core/Preferences.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import QuestHelper from './QuestHelperV1.js';
import htmlText from './QuestV1.html?raw';
import cssText from './QuestV1.css?raw';
import jQuery from 'Utils/jquery.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import Session from 'Engine/SessionStorage.js';

/**
 * Create Component
 */
const QuestV1 = new UIComponent('QuestV1', htmlText, cssText);

/**
 * @var {number} index of selection
 */
let _index = -1;

/**
 * @var {Array} quest list
 */
let _questList = [];

/**
 * @var {Array} quest list
 */
/*var _questNotShowList = [];*/ // UNUSED

/**
 * @var {string} _active_menu active click menu
 */
let _active_menu = 'active';

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'QuestV1',
	{
		x: 200,
		y: 200,
		show: false,
		showwindow: true
	},
	1.0
);

/**
 * Initialize the component (event listener, etc.)
 */
QuestV1.init = function init() {
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
QuestV1.onAppend = function onAppend() {
	_index = -1;

	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});

	Client.loadFile(
		DB.INTERFACE_PATH + 'basic_interface/tab_que_01.bmp',
		function (data) {
			QuestV1.ui.find('.quest-menu').css('backgroundImage', 'url(' + data + ')');
		}.bind(this)
	);

	QuestV1.ui.find('#active-quest-list').show();
	QuestV1.ui.find('#inactive-quest-list').hide();
	QuestV1.ui.find('#all-quest-list').hide();

	if (!_preferences.show) {
		this.ui.hide();
	}
};

/**
 * Clean up UI
 */
QuestV1.clean = function clean() {
	_active_menu = '';
	_questList = {};
	QuestV1.ui.find('#active-quest-list').hide();
	QuestV1.ui.find('#inactive-quest-list').hide();
	QuestV1.ui.find('#all-quest-list').hide();
	QuestV1.ClearQuestList();
	QuestHelper.clearQuestDesc();
	onClose();
};

/**
 * Removing the UI from window, save preferences
 *
 */
QuestV1.onRemove = function onRemove() {
	// Save preferences
	_preferences.show = this.ui.is(':visible');
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();
};

/**
 * Window Shortcuts
 */
QuestV1.onShortCut = function onShurtCut(key) {
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
QuestV1.toggle = function toggle() {
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
QuestV1.setQuestList = function setQuestList(quests) {
	_questList = quests;
	QuestV1.ClearQuestList();
	for (const questID in quests) {
		QuestV1.addQuestToUI(quests[questID]);
	}
};

/**
 * Add new Quest
 *
 * @param {object} quest
 * @param {number} questID
 */
QuestV1.addQuest = function addQuest(quest, questID) {
	_questList[questID] = quest;
	QuestV1.addQuestToUI(quest);
};

/**
 * Update Quest from list
 *
 * @param {object} hunt_info
 * @param {number} questID
 * @param {number} huntID
 */
QuestV1.updateMissionHunt = function updateMissionHunt(hunt_info, questID, huntID) {
	if (hunt_info.huntIDCount) {
		_questList[questID].hunt_list[huntID].huntIDCount = hunt_info.huntIDCount;
	}
	if (hunt_info.maxCount) {
		_questList[questID].hunt_list[huntID].maxCount = hunt_info.maxCount;
	}
	if (hunt_info.huntCount) {
		_questList[questID].hunt_list[huntID].huntCount = hunt_info.huntCount;
	}
	if (hunt_info.mobGID) {
		_questList[questID].hunt_list[huntID].mobGID = hunt_info.mobGID;
	}

	const mob_name = _questList[questID].hunt_list[huntID].mobName;
	const quest_info = DB.getQuestInfo(questID);
	const chat_quest_text = `Mission [${quest_info.Title}], you killed [${mob_name}]. (${_questList[questID].hunt_list[huntID].huntCount}/${_questList[questID].hunt_list[huntID].maxCount})`;
	let self_msg;
	if (_questList[questID].hunt_list[huntID].maxCount == _questList[questID].hunt_list[huntID].huntCount) {
		self_msg = `${mob_name} [Completed]`;
	} else {
		self_msg = `${mob_name} [${_questList[questID].hunt_list[huntID].huntCount}/${_questList[questID].hunt_list[huntID].maxCount}]`;
	}

	ChatBox.addText(chat_quest_text, ChatBox.TYPE.ADMIN | ChatBox.TYPE.SELF, ChatBox.FILTER.QUEST);
	if (Session.Entity) {
		Session.Entity.dialog.set(self_msg, 'yellow');
	}
};

/**
 * Remove Quest from list
 *
 * @param {number} questID
 */
QuestV1.removeQuest = function removeQuest(questID) {
	delete _questList[questID];
	refreshQuestUI();
};

/**
 * Toggle Quest Active/Inactive
 *
 * @param {number} questID
 * @param {boolean} active
 */
QuestV1.toggleQuestActive = function toggleQuestActive(questID, active) {
	_questList[questID].active = active;
	refreshQuestUI();
};

/**
 * return questID based on huntID/mobGID
 *
 * @param {number} ID
 */
QuestV1.getQuestIDByServerID = function getQuestIDByServerID(ID) {
	for (const key in _questList) {
		if (typeof _questList[key].hunt_list[ID] !== 'undefined') {
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
QuestV1.questExists = function questExists(questID) {
	return typeof _questList[questID] !== 'undefined' ? true : false;
};

QuestV1.addQuestToUI = function addQuest(quest) {
	const toggle_id = 'qid' + quest.questID;
	const title = quest.title.length > 30 ? quest.title.substr(0, 30) + '...' : quest.title;
	const pattern = /^ico\_/; // new system ico_xx.bmp - not supported on this version
	const quest_icon = pattern.test(quest.icon) ? 'SG_FEEL.bmp' : quest.icon;
	const li_text =
		'<li id="' +
		toggle_id +
		'" class="quest-item ' +
		toggle_id +
		'"><div class="quest-item-icon"> <div class="quest-item-icon-image" data-background="item/' +
		quest_icon +
		'"></div> </div> <div class="quest-item-title"> <span class="quest-item-title-text">' +
		title +
		'</span> </div></li>';

	const ul_id = quest.active == 1 ? '#active-quest-list' : '#inactive-quest-list';

	this.ui.find(ul_id).append(li_text);
	this.ui.find('#' + toggle_id).on('contextmenu', onClickQuestToggle);
	this.ui.find('#' + toggle_id).on('click', onClickQuest);
	this.ui.find('#all-quest-list').append(li_text);
	this.ui.find('.' + toggle_id).on('click', onClickQuest);
	this.ui.each(this.parseHTML).find('*').each(this.parseHTML);
};

function onClickMenu(e) {
	const quest_element = jQuery(e.currentTarget);

	if (_active_menu == quest_element.attr('id')) {
		return;
	}
	_active_menu = quest_element.attr('id');

	let background_image = '';
	QuestV1.ui.find('#active-quest-list').hide();
	QuestV1.ui.find('#inactive-quest-list').hide();
	QuestV1.ui.find('#all-quest-list').hide();
	switch (_active_menu) {
		case 'inactive':
			background_image = 'tab_que_02';
			QuestV1.ui.find('#inactive-quest-list').show();
			break;
		case 'all':
			background_image = 'tab_que_03';
			QuestV1.ui.find('#all-quest-list').show();
			break;
		default:
			background_image = 'tab_que_01';
			QuestV1.ui.find('#active-quest-list').show();
	}

	Client.loadFile(
		DB.INTERFACE_PATH + 'basic_interface/' + background_image + '.bmp',
		function (data) {
			QuestV1.ui.find('.quest-menu').css('backgroundImage', 'url(' + data + ')');
		}.bind(this)
	);

	QuestHelper.clearQuestDesc();
}

function onClickQuest(e) {
	const toggle_element = jQuery(e.currentTarget);
	const tid = toggle_element.attr('id');
	const id = tid.replace('qid', '');
	if (_index > -1) {
		QuestV1.ui.find('.qid' + _index).css('background-color', 'white');
		QuestV1.ui.find('#qid' + _index).css('background-color', 'white');
	}
	_index = id;
	toggle_element.css('background-color', 'lightgray');
}

function onClickQuestToggle(e) {
	const toggle_element = jQuery(e.currentTarget);
	const tid = toggle_element.attr('id');
	const id = tid.replace('qid', '');
	const _pkt = new PACKET.CZ.ACTIVE_QUEST();
	_pkt.questID = _questList[id].questID;
	_pkt.active = _questList[id].active == 1 ? 0 : 1;
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
	QuestV1.ClearQuestList();
	QuestV1.setQuestList(_questList);
}

QuestV1.ClearQuestList = function ClearQuestList() {
	QuestV1.ui.find('.quest-list').html('');
};

/**
 * Close the window
 */
function onClose() {
	QuestV1.ui.hide();
}

/**
 * Export
 */
export default UIManager.addComponent(QuestV1);
