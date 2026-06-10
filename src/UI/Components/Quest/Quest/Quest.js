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
import QuestHelper from './QuestHelper.js';
import QuestWindow from './QuestWindow.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import htmlText from './Quest.html?raw';
import cssText from './Quest.css?raw';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import Session from 'Engine/SessionStorage.js';

/**
 * Create Component
 */
const Quest = new GUIComponent('Quest', cssText);

Quest.render = () => htmlText;

function _getRoot() {
	return Quest._shadow || Quest._host;
}

/**
 * @var {Array} quest list
 */
let _questList = [];

/**
 * @var {Array} quest list
 */
const _questNotShowList = [];

/**
 * @var {string} _active_menu active click menu
 */
let _active_menu = 'active';

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'Quest',
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
Quest.init = function init() {
	const root = _getRoot();

	QuestHelper.prepare();
	QuestWindow.prepare();

	this.draggable('.titlebar');

	const closeBtn = root.querySelector('.close-quest-container-btn');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', (e) => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => onClose());
	}

	root.querySelectorAll('.quest-menu-item').forEach((item) => {
		item.addEventListener('click', (e) => onClickMenu(e));
	});

	const activeList = root.querySelector('#active-quest-list');
	if (activeList) {
		activeList.style.display = '';
	}

	const toggleBtn = root.querySelector('.toggle-quest-list');
	if (toggleBtn) {
		toggleBtn.addEventListener('click', () => onClickQuestCheckbox());
	}

	this.ui.hide();
};

/**
 * Once append to the DOM, start to position the UI
 */
Quest.onAppend = function onAppend() {
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - 381)}px`;
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - 466)}px`;

	const root = _getRoot();

	const checkbox_background = _preferences.showwindow ? 'checkbox_on' : 'checkbox_off';
	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/${checkbox_background}.bmp`, (data) => {
		const el = root.querySelector('.toggle-quest-image');
		if (el) {
			el.style.backgroundImage = `url(${data})`;
		}
	});

	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/bg_quest1.bmp`, (data) => {
		const el = root.querySelector('.titlebar');
		if (el) {
			el.style.backgroundImage = `url(${data})`;
		}
	});

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
	const root = _getRoot();
	const activeList = root.querySelector('#active-quest-list');
	if (activeList) {
		activeList.style.display = '';
	}
	const inactiveList = root.querySelector('#inactive-quest-list');
	if (inactiveList) {
		inactiveList.style.display = 'none';
	}
	const featureList = root.querySelector('#feature-quest-list');
	if (featureList) {
		featureList.style.display = 'none';
	}
	const cooldownList = root.querySelector('#cooldown-quest-list');
	if (cooldownList) {
		cooldownList.style.display = 'none';
	}
	Quest.ClearQuestList();
	QuestHelper.clearQuestDesc();
	QuestWindow.ClearQuestList();
	onClose();
};

/**
 * Removing the UI from window, save preferences
 */
Quest.onRemove = function onRemove() {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	_preferences.show = hostDisplay !== 'none';
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.save();
};

/**
 * Window Shortcuts
 */
Quest.onShortCut = function onShurtCut(key) {
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
Quest.toggle = function toggle() {
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
Quest.setQuestList = function setQuestList(quests) {
	_questList = quests;
	Quest.ClearQuestList();
	for (const questID in quests) {
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
Quest.questExists = function questExists(questID) {
	return typeof _questList[questID] !== 'undefined' ? true : false;
};

Quest.addQuestToUI = function addQuest(quest) {
	const root = _getRoot();
	let ul_id = '';
	const toggle_id = `qid${quest.questID}`;
	const show_id = `sid${quest.questID}`;
	const title = quest.title.length > 30 ? `${quest.title.substr(0, 30)}...` : quest.title;
	const summary = quest.summary.length > 30 ? `${quest.summary.substr(0, 30)}...` : quest.summary;
	const bt_check = _questNotShowList.includes(parseInt(Number(quest.questID))) ? 'bt_check_off' : 'bt_check_on';

	const epoch_seconds = new Date() / 1000;
	let li_text;
	if (quest.end_time > 0 && quest.end_time > epoch_seconds) {
		ul_id = '#cooldown-quest-list';
		li_text =
			'<li> <div class="quest-item-icon"> <div class="quest-item-icon-image">' +
			' <span class="quest-item-icon-image-text">Quest</span> </div> </div>  <div class="quest-item-title"> <span class="quest-item-title-text">' +
			title +
			'</span>  </div> <div class="quest-item-display"> <div class="quest-item-display-image"> <span class="quest-item-display-image-text"></span> </div></div><div class="quest-item-summary"><span class="quest-item-summary-text">' +
			summary +
			'</span></div>				<div class="quest-item-toggle"><div class="quest-item-toggle-image"><span class="quest-item-toggle-image-text">Toggle</span></div></div></li>';
	} else if (quest.active == 1) {
		ul_id = '#active-quest-list';
		li_text =
			'<li> <div class="quest-item-icon"> <div class="quest-item-icon-image">' +
			' <span class="quest-item-icon-image-text">Quest</span> </div> </div>  <div class="quest-item-title"> <span class="quest-item-title-text">' +
			title +
			'</span>  </div> <div class="quest-item-display"> <button id="' +
			show_id +
			'" class="quest-item-display-image"> <span class="quest-item-display-image-text"></span> </button></div><div class="quest-item-summary"><span class="quest-item-summary-text">' +
			summary +
			'</span></div>				<div class="quest-item-toggle"><button id="' +
			toggle_id +
			'" class="quest-item-toggle-image"><span class="quest-item-toggle-image-text">Toggle</span></button></div></li>';
	} else {
		ul_id = '#inactive-quest-list';
		li_text =
			'<li> <div class="quest-item-icon"> <div class="quest-item-icon-image">' +
			' <span class="quest-item-icon-image-text">Quest</span> </div> </div>  <div class="quest-item-title"> <span class="quest-item-title-text">' +
			title +
			'</span>  </div> <div class="quest-item-display"> <div class="quest-item-display-image"> <span class="quest-item-display-image-text"></span> </div></div><div class="quest-item-summary"><span class="quest-item-summary-text">' +
			summary +
			'</span></div>				<div class="quest-item-toggle"><button id="' +
			toggle_id +
			'" class="quest-item-toggle-image"><span class="quest-item-toggle-image-text">Toggle</span></button></div></li>';
	}

	const ul = root.querySelector(ul_id);
	if (!ul) {
		return;
	}

	const li = document.createElement('li');
	li.className = 'quest-item';
	li.innerHTML = li_text;

	// Load background images for the quest item
	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/bg_questlist.bmp`, (data) => {
		li.style.backgroundImage = `url(${data})`;
	});

	// Load quest icon
	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/${quest.icon}`, (data) => {
		const iconEl = li.querySelector('.quest-item-icon-image');
		if (iconEl) {
			iconEl.style.backgroundImage = `url(${data})`;
		}
	});

	li.addEventListener('click', (e) => {
		if (e.target.tagName.toLowerCase() === 'button') {
			return;
		}
		QuestHelper.clearQuestDesc();
		QuestHelper.setQuestInfo(quest);
		QuestHelper.prepare();
		QuestHelper.append();
		QuestHelper.ui.show();
	});

	// Hover effect
	li.addEventListener('mouseenter', () => {
		Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/bg_questlist_check.bmp`, (data) => {
			li.style.backgroundImage = `url(${data})`;
		});
	});
	li.addEventListener('mouseleave', () => {
		Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/bg_questlist.bmp`, (data) => {
			li.style.backgroundImage = `url(${data})`;
		});
	});

	ul.appendChild(li);

	// Bind toggle button
	const toggleBtn = root.querySelector(`#${toggle_id}`);
	if (toggleBtn) {
		toggleBtn.addEventListener('click', (e) => onClickQuestToggle(e));

		// Load toggle icon
		if (quest.active == 1) {
			Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/bt_lock_open.bmp`, (data) => {
				toggleBtn.style.backgroundImage = `url(${data})`;
			});
		} else {
			Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/bt_lock.bmp`, (data) => {
				toggleBtn.style.backgroundImage = `url(${data})`;
			});
		}
	}

	// Bind show button
	const showBtn = root.querySelector(`#${show_id}`);
	if (showBtn) {
		showBtn.addEventListener('click', (e) => onClickQuestDisplay(e));
		Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/${bt_check}.bmp`, (data) => {
			showBtn.style.backgroundImage = `url(${data})`;
		});
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
	root.querySelector('#feature-quest-list').style.display = 'none';
	root.querySelector('#cooldown-quest-list').style.display = 'none';

	switch (_active_menu) {
		case 'feature':
			background_image = 'bg_quest2';
			root.querySelector('#feature-quest-list').style.display = '';
			break;
		case 'inactive':
			background_image = 'bg_quest3';
			root.querySelector('#inactive-quest-list').style.display = '';
			break;
		case 'cooldown':
			background_image = 'bg_quest4';
			root.querySelector('#cooldown-quest-list').style.display = '';
			break;
		default:
			background_image = 'bg_quest1';
			root.querySelector('#active-quest-list').style.display = '';
	}

	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/${background_image}.bmp`, (data) => {
		const titlebar = root.querySelector('.titlebar');
		if (titlebar) {
			titlebar.style.backgroundImage = `url(${data})`;
		}
	});

	QuestHelper.clearQuestDesc();
}

function onClickQuestCheckbox() {
	const root = _getRoot();
	let checkbox_background;
	if (_preferences.showwindow) {
		checkbox_background = 'checkbox_off';
		QuestWindow.ui.hide();
	} else {
		checkbox_background = 'checkbox_on';
		QuestWindow.ui.show();
	}
	_preferences.showwindow = !_preferences.showwindow;
	_preferences.save();

	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/${checkbox_background}.bmp`, (data) => {
		const el = root.querySelector('.toggle-quest-image');
		if (el) {
			el.style.backgroundImage = `url(${data})`;
		}
	});
}

function onClickQuestToggle(e) {
	const root = _getRoot();
	const toggleEl = e.currentTarget;
	const tid = toggleEl.id;
	const id = tid.replace('qid', '');
	const _pkt = new PACKET.CZ.ACTIVE_QUEST();
	_pkt.questID = _questList[id].questID;
	_pkt.active = _questList[id].active == 1 ? 0 : 1;
	Network.sendPacket(_pkt);
}

function onClickQuestDisplay(e) {
	const root = _getRoot();
	const displayEl = e.currentTarget;
	const cid = displayEl.id;
	const id = cid.replace('sid', '');
	const iid = parseInt(Number(id));

	let checkbox_background = '';
	if (_questNotShowList.includes(iid)) {
		const index = _questNotShowList.indexOf(iid);
		_questNotShowList.splice(index, 1);
		checkbox_background = 'bt_check_on';
	} else {
		_questNotShowList.push(iid);
		checkbox_background = 'bt_check_off';
	}

	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/${checkbox_background}.bmp`, (data) => {
		const el = root.querySelector(`#${cid}`);
		if (el) {
			el.style.backgroundImage = `url(${data})`;
		}
	});

	QuestWindow.ClearQuestList();
	QuestWindow.setQuestList(_questList, _questNotShowList);
}

function onClickClose() {
	Quest.ui.hide();
}

function refreshQuestUI() {
	Quest.ClearQuestList();
	Quest.setQuestList(_questList);
	QuestWindow.ClearQuestList();
	QuestWindow.setQuestList(_questList, _questNotShowList);
}

Quest.ClearQuestList = function ClearQuestList() {
	const root = _getRoot();
	root.querySelectorAll('.quest-list').forEach((el) => {
		el.innerHTML = '';
	});
};

/**
 * Close the window
 */
function onClose() {
	Quest.ui.hide();
}

/**
 * Export
 */
export default UIManager.addComponent(Quest);
