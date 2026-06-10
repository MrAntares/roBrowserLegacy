/**
 * UI/Components/Quest/QuestHelper.js
 *
 * Manage interface for Quest List
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import Navigation from 'UI/Components/Navigation/Navigation.js';
import htmlText from './QuestHelper.html?raw';
import cssText from './QuestHelper.css?raw';

/**
 * Create Component
 */
const QuestHelper = new GUIComponent('QuestHelper', cssText);

QuestHelper.render = () => htmlText;

function _getRoot() {
	return QuestHelper._shadow || QuestHelper._host;
}

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'Quest',
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
QuestHelper.init = function init() {
	const root = _getRoot();

	const closeBtn = root.querySelector('.quest-info-bottom-btn');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', (e) => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => onClickClose());
	}

	// Add click handler for item links (delegated)
	root.addEventListener('click', (event) => {
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

	// Load poring images
	root.querySelectorAll('.quest-ui-img-poring').forEach((el) => {
		Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/img_poring.bmp`, (data) => {
			el.style.backgroundImage = `url(${data})`;
		});
	});

	// Load titlebar background
	Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/bg_questsub.bmp`, (data) => {
		const titlebar = root.querySelector('.titlebar');
		if (titlebar) {
			titlebar.style.backgroundImage = `url(${data})`;
		}
	});
};

/**
 * Once append to the DOM, start to position the UI
 */
QuestHelper.onAppend = function onAppend() {
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x + 382), Renderer.width - 342)}px`;
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - 412)}px`;
};

QuestHelper.setQuestInfo = function setQuestInfo(quest) {
	const root = _getRoot();
	const titleEl = root.querySelector('.quest-info-title-panel-text');
	if (titleEl) {
		titleEl.innerHTML = processText(quest.title);
	}

	const descEl = root.querySelector('.quest-info-description-panel-text .quest-ui-text-span');
	if (descEl) {
		descEl.innerHTML = processText(quest.description);
	}

	let list = '';
	for (const huntID in quest.hunt_list) {
		list +=
			`<li>${processText(quest.hunt_list[huntID].mobName)} ( ${quest.hunt_list[huntID].huntCount} / ${quest.hunt_list[huntID].maxCount} )</li>`;
	}
	const monsterEl = root.querySelector('.quest-info-monster-panel-text .quest-ui-text-span');
	if (monsterEl) {
		monsterEl.innerHTML = `<ul class="quest-ui-monster-list">${list}<ul>`;
	}

	if (quest.reward_exp_base > 0) {
		const baseEl = root.querySelector('.quest-info-reward-li-base');
		if (baseEl) {
			baseEl.textContent = quest.reward_exp_base;
		}
	}
	if (quest.reward_exp_job > 0) {
		const jobEl = root.querySelector('.quest-info-reward-li-job');
		if (jobEl) {
			jobEl.textContent = quest.reward_exp_job;
		}
	}

	for (let i = 0; i < quest.reward_item_list.length; i++) {
		const it = DB.getItemInfo(quest.reward_item_list[i].ItemID);
		const item_li =
			`<li class="quest-reward-item-li"><div class="quest-reward-item" data-index="${quest.reward_item_list[i].ItemID}">` +
			`<div class="quest-icon"></div></div><div class="quest-reward-item-info"><span class="quest-reward-item-name">${processText(it.identifiedDisplayName)}</span><br><span>${quest.reward_item_list[i].ItemNum}</span></div></li>`;
		const itemListEl = root.querySelector('.quest-info-reward-li-item-list');
		if (itemListEl) {
			itemListEl.insertAdjacentHTML('beforeend', item_li);
		}
		Client.loadFile(`${DB.INTERFACE_PATH}renew_questui/img_questiocn.bmp`, (data) => {
			const el = root.querySelector(`.quest-reward-item[data-index="${quest.reward_item_list[i].ItemID}"]`);
			if (el) {
				el.style.backgroundImage = `url(${data})`;
			}
		});
		Client.loadFile(`${DB.INTERFACE_PATH}item/${it.identifiedResourceName}.bmp`, (data) => {
			const el = root.querySelector(`.quest-reward-item[data-index="${quest.reward_item_list[i].ItemID}"] .quest-icon`);
			if (el) {
				el.style.backgroundImage = `url(${data})`;
			}
		});
	}

	if (quest.end_time) {
		const d = new Date(0);
		d.setUTCSeconds(quest.end_time);
		const deadlineEl = root.querySelector('.quest-info-bottom-deadline-info-text');
		if (deadlineEl) {
			deadlineEl.textContent = `Deadline [${d.toLocaleString()}]`;
		}
	}
};

QuestHelper.clearQuestDesc = function clearQuestDesc() {
	const root = _getRoot();
	const titleEl = root.querySelector('.quest-info-title-panel-text');
	if (titleEl) {
		titleEl.innerHTML = '';
	}
	const descEl = root.querySelector('.quest-info-description-panel-text .quest-ui-text-span');
	if (descEl) {
		descEl.innerHTML = '';
	}
	const monsterEl = root.querySelector('.quest-info-monster-panel-text .quest-ui-text-span');
	if (monsterEl) {
		monsterEl.innerHTML = '<ul class="quest-ui-monster-list"><ul>';
	}
	const baseEl = root.querySelector('.quest-info-reward-li-base');
	if (baseEl) {
		baseEl.textContent = '';
	}
	const jobEl = root.querySelector('.quest-info-reward-li-job');
	if (jobEl) {
		jobEl.textContent = '';
	}
	const deadlineEl = root.querySelector('.quest-info-bottom-deadline-info-text');
	if (deadlineEl) {
		deadlineEl.textContent = '';
	}
	const itemListEl = root.querySelector('.quest-info-reward-li-item-list');
	if (itemListEl) {
		itemListEl.innerHTML = '';
	}
};

/**
 * Clean up UI
 */
QuestHelper.clean = function clean() {
	QuestHelper.ui.hide();
	onClose();
};

/**
 * Removing the UI from window, save preferences
 */
QuestHelper.onRemove = function onRemove() {};

/**
 * Show/Hide UI
 */
QuestHelper.toggle = function toggle() {
	const hostDisplay = this._host ? getComputedStyle(this._host).display : 'none';
	if (hostDisplay !== 'none') {
		this.ui.hide();
	} else {
		this.ui.show();
	}
};

function onClickClose() {
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
export default UIManager.addComponent(QuestHelper);
