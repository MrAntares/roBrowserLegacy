/**
 * UI/Components/Quest/QuestHelper.js
 *
 * Manage interface for Quest List
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Preferences from 'Core/Preferences.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import Navigation from 'UI/Components/Navigation/Navigation.js';
import htmlText from './QuestHelperV1.html?raw';
import cssText from './QuestHelperV1.css?raw';

/**
 * Create Component
 */
const QuestHelperV1 = new GUIComponent('QuestHelperV1', cssText);

QuestHelperV1.render = () => htmlText;

function _getRoot() {
	return QuestHelperV1._shadow || QuestHelperV1._host;
}

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
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
	if (!text) {
		return '';
	}
	text = String(text);
	return text
		.replace(/\^([0-9A-Fa-f]{6})/g, (match, color) => `<span style="color:#${color}">`)
		.replace(/\^000000/g, '</span>');
}

/**
 * Process item tags in text (<ITEM>Name<INFO>ID</INFO></ITEM>)
 * @param {string} text - The text to process
 * @returns {string} HTML with processed item tags
 */
function processItemTags(text) {
	if (!text) {
		return '';
	}
	text = String(text);
	return text.replace(/<ITEM>([^<]+)<INFO>(\d+)<\/INFO><\/ITEM>/g, (match, itemName, itemId) => {
		return `<span class="item-link" data-item-id="${itemId}">${itemName}</span>`;
	});
}

/**
 * Process NAVI tags in text (<NAVI>Display Name<INFO>mapname,x,y,0,000,flag</INFO></NAVI>)
 * @param {string} text - The text to process
 * @returns {string} HTML with processed NAVI tags
 */
function processNAVITags(text) {
	if (!text) {
		return '';
	}
	text = String(text);
	return text.replace(/<NAVI>([^<]+)<INFO>([^<]+)<\/INFO><\/NAVI>/g, (match, displayName, naviInfo) => {
		return `<span class="navi-link" data-navi-info="${naviInfo}" data-navi-name="${displayName}">${displayName}</span>`;
	});
}

/**
 * Process all text formatting (color codes and item tags)
 * @param {string} text - The text to process
 * @returns {string} Fully processed HTML
 */
function processText(text) {
	if (!text) {
		return '';
	}
	text = processItemTags(text);
	text = processNAVITags(text);
	text = processColorCodes(text);
	return text;
}

/**
 * Initialize the component (event listener, etc.)
 */
QuestHelperV1.init = function init() {
	const root = _getRoot();

	const closeBtn = root.querySelector('.quest-info-close-btn');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => onClickClose());
	}

	// Add click handler for item links (delegated)
	root.addEventListener('click', event => {
		const itemLink = event.target.closest('.item-link');
		if (itemLink) {
			const itemId = parseInt(itemLink.dataset.itemId, 10);
			if (!itemId) {
				return;
			}
			if (ItemInfo.uid === itemId) {
				ItemInfo.remove();
				return;
			}
			ItemInfo.append();
			ItemInfo.uid = itemId;
			ItemInfo.setItem({ ITID: itemId, IsIdentified: true });
			return;
		}

		const naviLink = event.target.closest('.navi-link');
		if (naviLink) {
			const naviInfo = naviLink.dataset.naviInfo;
			const displayName = naviLink.dataset.naviName;
			if (!naviInfo) {
				return;
			}
			const navHostDisplay = Navigation._host ? getComputedStyle(Navigation._host).display : 'none';
			if (Navigation.uid === naviInfo && navHostDisplay !== 'none') {
				Navigation.hide();
				return;
			}
			Navigation.show();
			Navigation.uid = naviInfo;
			Navigation.setNaviInfo(naviInfo, displayName);
		}
	});

	this.draggable('.titlebar');

	// Load titlebar background
	Client.loadFile(`${DB.INTERFACE_PATH}basic_interface/quest_window.bmp`, data => {
		const titlebar = root.querySelector('.titlebar');
		if (titlebar) {
			titlebar.style.backgroundImage = `url(${data})`;
		}
	});
};

/**
 * Once append to the DOM, start to position the UI
 */
QuestHelperV1.onAppend = function onAppend() {
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x + 382), Renderer.width - 350)}px`;
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - 375)}px`;
};

QuestHelperV1.setQuestInfo = function setQuestInfo(quest) {
	const root = _getRoot();
	if (!root) {
		return;
	}
	const titleEl = root.querySelector('.title');
	if (titleEl) {
		titleEl.innerHTML = processText(quest.title);
	}
	const summaryEl = root.querySelector('.summary');
	if (summaryEl) {
		summaryEl.innerHTML = processText(quest.summary);
	}
	const objectiveEl = root.querySelector('.objective');
	if (objectiveEl) {
		objectiveEl.innerHTML = processText(quest.description);
	}

	let list = '<select class="monster-select">';
	let first = true;
	for (const huntID in quest.hunt_list) {
		if (first) {
			const killedEl = root.querySelector('.killed');
			if (killedEl) {
				killedEl.textContent = quest.hunt_list[huntID].huntCount;
			}
			const limitedEl = root.querySelector('.limited');
			if (limitedEl) {
				limitedEl.textContent = quest.hunt_list[huntID].maxCount;
			}
			first = false;
		}
		list += `<option current="${quest.hunt_list[huntID].huntCount}" max="${quest.hunt_list[huntID].maxCount}">${processText(quest.hunt_list[huntID].mobName)}</option>`;
	}
	list += '</select>';
	const monsterEl = root.querySelector('.monster');
	if (monsterEl) {
		monsterEl.innerHTML = list;
	}

	const selectEl = root.querySelector('.monster-select');
	if (selectEl) {
		selectEl.addEventListener('change', e => onSelectMonster(e));
	}
};

QuestHelperV1.clearQuestDesc = function clearQuestDesc() {
	const root = _getRoot();
	if (!root) {
		return;
	}
	const titleEl = root.querySelector('.title');
	if (titleEl) {
		titleEl.innerHTML = '';
	}
	const summaryEl = root.querySelector('.summary');
	if (summaryEl) {
		summaryEl.innerHTML = '';
	}
	const objectiveEl = root.querySelector('.objective');
	if (objectiveEl) {
		objectiveEl.innerHTML = '';
	}
	const monsterEl = root.querySelector('.monster');
	if (monsterEl) {
		monsterEl.innerHTML = '';
	}
	const killedEl = root.querySelector('.killed');
	if (killedEl) {
		killedEl.textContent = '';
	}
	const limitedEl = root.querySelector('.limited');
	if (limitedEl) {
		limitedEl.textContent = '';
	}
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
 */
QuestHelperV1.onRemove = function onRemove() {};

/**
 * Show/Hide UI
 */
QuestHelperV1.toggle = function toggle() {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	if (hostDisplay !== 'none') {
		this.ui.hide();
	} else {
		this.ui.show();
	}
};

function onClickClose() {
	QuestHelperV1.ui.hide();
}

/**
 * Close the window
 */
function onClose() {
	QuestHelperV1.ui.hide();
}

function onSelectMonster(e) {
	const root = _getRoot();
	const selectedOption = e.currentTarget.options[e.currentTarget.selectedIndex];
	const killedEl = root.querySelector('.killed');
	if (killedEl) {
		killedEl.textContent = selectedOption.getAttribute('current');
	}
	const limitedEl = root.querySelector('.limited');
	if (limitedEl) {
		limitedEl.textContent = selectedOption.getAttribute('max');
	}
}

/**
 * Export
 */
export default UIManager.addComponent(QuestHelperV1);
