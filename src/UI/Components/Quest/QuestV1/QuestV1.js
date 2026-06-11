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
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import QuestHelper from './QuestHelperV1.js';
import htmlText from './QuestV1.html?raw';
import cssText from './QuestV1.css?raw';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import Session from 'Engine/SessionStorage.js';

/**
 * Create Component
 */
const QuestV1 = new GUIComponent('QuestV1', cssText);

QuestV1.render = () => htmlText;

function _getRoot() {
	return QuestV1._shadow || QuestV1._host;
}

/**
 * @var {number} index of selection
 */
let _index = -1;

/**
 * @var {Array} quest list
 */
let _questList = [];

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
	const root = _getRoot();

	QuestHelper.prepare();

	root.querySelector('.view').addEventListener('click', () => onClickView());
	root.querySelector('.close').addEventListener('click', () => onClose());
	root.querySelector('.btn-right').addEventListener('click', () => onClose());

	root.querySelectorAll('.quest-menu-item').forEach(item => {
		item.addEventListener('click', e => onClickMenu(e));
	});

	const activeList = root.querySelector('#active-quest-list');
	if (activeList) {
		activeList.style.display = '';
	}

	this.draggable('.titlebar');
};

/**
 * Once append to the DOM, start to position the UI
 */
QuestV1.onAppend = function onAppend() {
	_index = -1;

	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - 350)}px`;
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - 250)}px`;

	const root = _getRoot();

	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/tab_que_01.bmp`, data => {
		const el = root.querySelector('.quest-menu');
		if (el) {
			el.style.backgroundImage = `url(${data})`;
		}
	});

	root.querySelector('#active-quest-list').style.display = '';
	root.querySelector('#inactive-quest-list').style.display = 'none';
	root.querySelector('#all-quest-list').style.display = 'none';

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
	const root = _getRoot();
	if (root) {
		const activeList = root.querySelector('#active-quest-list');
		if (activeList) {
			activeList.style.display = 'none';
		}
		const inactiveList = root.querySelector('#inactive-quest-list');
		if (inactiveList) {
			inactiveList.style.display = 'none';
		}
		const allList = root.querySelector('#all-quest-list');
		if (allList) {
			allList.style.display = 'none';
		}
	}
	QuestV1.ClearQuestList();
	QuestHelper.clearQuestDesc();
	onClose();
};

/**
 * Removing the UI from window, save preferences
 */
QuestV1.onRemove = function onRemove() {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	_preferences.show = hostDisplay !== 'none';
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.save();
};

/**
 * Window Shortcuts
 */
QuestV1.onShortCut = function onShurtCut(key) {
	switch (key.cmd) {
		case 'TOGGLE': {
			const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
			if (hostDisplay !== 'none') {
				this.ui.hide();
			} else {
				this.ui.show();
				this.focus();
			}
			break;
		}
	}
};

/**
 * Show/Hide UI
 */
QuestV1.toggle = function toggle() {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	if (hostDisplay !== 'none') {
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
	const root = _getRoot();
	if (!root) {
		return;
	}
	const toggle_id = `qid${quest.questID}`;
	const title = quest.title.length > 30 ? `${quest.title.substr(0, 30)}...` : quest.title;
	const pattern = /^ico_/;
	const quest_icon = pattern.test(quest.icon) ? 'SG_FEEL.bmp' : quest.icon;
	const li_text = `<div class="quest-item-icon"> <div class="quest-item-icon-image"></div> </div> <div class="quest-item-title"> <span class="quest-item-title-text">${title}</span> </div>`;

	const ul_id = quest.active == 1 ? '#active-quest-list' : '#inactive-quest-list';

	// Create list item for main list
	const li = document.createElement('li');
	li.id = toggle_id;
	li.className = `quest-item ${toggle_id}`;
	li.innerHTML = li_text;

	// Load quest icon
	Client.loadFile(`${DB.INTERFACE_PATH}item/${quest_icon}`, data => {
		const iconEl = li.querySelector('.quest-item-icon-image');
		if (iconEl) {
			iconEl.style.backgroundImage = `url(${data})`;
		}
	});

	li.addEventListener('contextmenu', e => onClickQuestToggle(e));
	li.addEventListener('click', e => onClickQuest(e));

	const ul = root.querySelector(ul_id);
	if (ul) {
		ul.appendChild(li);
	}

	// Create duplicate for "all" list
	const liAll = document.createElement('li');
	liAll.className = `quest-item ${toggle_id}`;
	liAll.innerHTML = li_text;

	Client.loadFile(`${DB.INTERFACE_PATH}item/${quest_icon}`, data => {
		const iconEl = liAll.querySelector('.quest-item-icon-image');
		if (iconEl) {
			iconEl.style.backgroundImage = `url(${data})`;
		}
	});

	liAll.addEventListener('click', e => onClickQuest(e));

	const allList = root.querySelector('#all-quest-list');
	if (allList) {
		allList.appendChild(liAll);
	}
};

function onClickMenu(e) {
	const root = _getRoot();
	const menuItem = e.currentTarget;
	const menuId = menuItem.id;

	if (_active_menu === menuId) {
		return;
	}
	_active_menu = menuId;

	let background_image = '';
	root.querySelector('#active-quest-list').style.display = 'none';
	root.querySelector('#inactive-quest-list').style.display = 'none';
	root.querySelector('#all-quest-list').style.display = 'none';

	switch (_active_menu) {
		case 'inactive':
			background_image = 'tab_que_02';
			root.querySelector('#inactive-quest-list').style.display = '';
			break;
		case 'all':
			background_image = 'tab_que_03';
			root.querySelector('#all-quest-list').style.display = '';
			break;
		default:
			background_image = 'tab_que_01';
			root.querySelector('#active-quest-list').style.display = '';
	}

	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/${background_image}.bmp`, data => {
		const el = root.querySelector('.quest-menu');
		if (el) {
			el.style.backgroundImage = `url(${data})`;
		}
	});

	QuestHelper.clearQuestDesc();
}

function onClickQuest(e) {
	const root = _getRoot();
	const toggleEl = e.currentTarget;
	const tid = toggleEl.id || toggleEl.className.match(/qid(\d+)/)?.[0];
	const id = tid ? tid.replace('qid', '') : null;
	if (!id) {
		return;
	}

	if (_index > -1) {
		root.querySelectorAll(`.qid${_index}`).forEach(el => {
			el.style.backgroundColor = 'white';
		});
		const prevById = root.querySelector(`#qid${_index}`);
		if (prevById) {
			prevById.style.backgroundColor = 'white';
		}
	}
	_index = id;
	toggleEl.style.backgroundColor = 'lightgray';
}

function onClickQuestToggle(e) {
	const toggleEl = e.currentTarget;
	const tid = toggleEl.id;
	const id = tid.replace('qid', '');
	const _pkt = new PACKET.CZ.ACTIVE_QUEST();
	_pkt.questID = _questList[id].questID;
	_pkt.active = _questList[id].active == 1 ? 0 : 1;
	Network.sendPacket(_pkt);
}

function onClickView() {
	if (_index > -1) {
		QuestHelper.clearQuestDesc();
		QuestHelper.setQuestInfo(_questList[_index]);
		QuestHelper.prepare();
		QuestHelper.append();
		QuestHelper.ui.show();
	}
}

function refreshQuestUI() {
	QuestV1.ClearQuestList();
	QuestV1.setQuestList(_questList);
}

QuestV1.ClearQuestList = function ClearQuestList() {
	const root = _getRoot();
	if (!root) {
		return;
	}
	root.querySelectorAll('.quest-list').forEach(el => {
		el.innerHTML = '';
	});
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
