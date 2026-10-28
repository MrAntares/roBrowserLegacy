/**
 * UI/Components/PrivateAirship/PrivateAirship.js
 *
 * Private Airship payment window. The Navigation window's Move button opens it
 * to fly straight to the navigation target's map, paid for with one of the
 * items in System/PrivateAirplane_True.lub (World Tour Ticket, Nyangvine Fruit).
 *
 * Works like the official client's: one "Use <item>" button per payment item,
 * a red notice line for checks that fail before the request and for the
 * server's answer, and a no-refund confirmation for Nyangvine Fruit.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import PrivateAirshipTable from 'DB/Map/PrivateAirship.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import Renderer from 'Renderer/Renderer.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import Session from 'Engine/SessionStorage.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import htmlText from './PrivateAirship.html?raw';
import cssText from './PrivateAirship.css?raw';

/**
 * Message ids, from the official msgstringtable.
 */
const MSG = {
	PAYMENT: 3330,
	USE_ITEM: 3329,
	NPC_RANDOM_CELL: 3387,
	NOT_STARTABLE: 3331,
	NOT_ENDABLE: 3332,
	NOT_ENOUGH_ITEM: 3333,
	CANNOT_USE_ITEM: 3352,
	SAME_MAP: 3353,
	DEAD: 3354,
	TRY_AGAIN: 2825,
	NYANGVINE_NO_REFUND: 4033
};

/**
 * Fallback text, for a msgstringtable that lacks the airship lines.
 */
const FALLBACK = {
	[MSG.PAYMENT]: 'Payment',
	[MSG.USE_ITEM]: 'Use %s',
	[MSG.NPC_RANDOM_CELL]: 'You will land at a random spot on the map.',
	[MSG.NOT_STARTABLE]: "This map isn't available for teleport.",
	[MSG.NOT_ENDABLE]: "You can't teleport in this map",
	[MSG.NOT_ENOUGH_ITEM]: 'Insufficient item.',
	[MSG.CANNOT_USE_ITEM]: 'You can not use items.',
	[MSG.SAME_MAP]: 'Can not move to the same map.',
	[MSG.DEAD]: "It is impossible to move when your character KO'ed",
	[MSG.TRY_AGAIN]: 'Please try again in a moment.',
	[MSG.NYANGVINE_NO_REFUND]: 'Used Nyangvine Fruits cannot be refunded.'
};

/**
 * Nyangvine Fruit asks before it is spent.
 */
const NYANGVINE_FRUIT = 6909;

/**
 * Server answers (ZC_PRIVATE_AIRSHIP_RESPONSE), and the message each shows.
 */
const RESULT_MESSAGE = {
	1: MSG.TRY_AGAIN, // retry
	2: MSG.NOT_ENOUGH_ITEM, // item not enough
	3: MSG.NOT_ENDABLE, // destination map invalid
	4: MSG.NOT_STARTABLE, // source map invalid
	5: MSG.CANNOT_USE_ITEM // item unavailable
};

/**
 * Item buttons: 26 px apart from y = 26.
 */
const ITEM_ROW_HEIGHT = 26;

/**
 * Window size with the official two payment items. Each further item adds a row.
 */
const WINDOW_WIDTH = 208;
const WINDOW_HEIGHT = 110;
const BASE_ITEM_ROWS = 2;

/**
 * A request with no answer stops blocking new ones after this long (ms), so a
 * lost answer cannot lock the window for the rest of the session.
 */
const PENDING_TIMEOUT = 10000;

/**
 * Create Component
 */
const PrivateAirship = new GUIComponent('PrivateAirship', cssText);

PrivateAirship.render = () => htmlText;

PrivateAirship.needFocus = true;

/**
 * @var {string} map the flight goes to, without extension
 */
let _targetMap = '';

/**
 * @var {number} when the request on its way was sent (0: none). Kept while the
 * window is closed and reopened, so a second paid request cannot go out before
 * the server answers the first.
 */
let _pendingSince = 0;

/**
 * @return {boolean} a request is on its way
 */
function isPending() {
	return _pendingSince !== 0 && Date.now() - _pendingSince < PENDING_TIMEOUT;
}

/**
 * Text for a message id, without RO colour codes.
 *
 * @param {number} id
 * @return {string}
 */
function message(id) {
	return String(DB.getMessage(id, FALLBACK[id] || '')).replace(/\^[0-9a-fA-F]{6}/g, '');
}

/**
 * Item name, or '' when the client does not know the item.
 *
 * @param {number} itemId
 * @return {string}
 */
function itemName(itemId) {
	const info = DB.getItemInfo(itemId);
	if (!info || info === DB.getItemInfo(-1)) {
		return '';
	}
	return info.identifiedDisplayName || '';
}

/**
 * Current map, without extension.
 *
 * @return {string}
 */
function currentMap() {
	return PrivateAirshipTable.normalize(MapRenderer.currentMap);
}

/**
 * The checks the official client makes before it sends the request, in its order.
 *
 * @param {string} targetMap
 * @return {number} message id of the first failed check, or 0
 */
PrivateAirship.precheck = function precheck(targetMap) {
	const from = currentMap();
	const to = PrivateAirshipTable.normalize(targetMap);

	if (!PrivateAirshipTable.isStartableMap(from)) {
		return MSG.NOT_STARTABLE;
	}
	if (!PrivateAirshipTable.isEndableMap(to)) {
		return MSG.NOT_ENDABLE;
	}
	if (!to || to === from) {
		return MSG.SAME_MAP;
	}
	const entity = Session.Entity;
	if (entity && entity.ACTION && entity.action === entity.ACTION.DIE) {
		return MSG.DEAD;
	}
	return 0;
};

/**
 * Initialize component
 */
PrivateAirship.init = function init() {
	const root = this._shadow || this._host;

	root.querySelector('.close').addEventListener('click', () => this.remove());
	this.draggable('.titlebar');
};

/**
 * Center on screen when it opens
 */
PrivateAirship.onAppend = function onAppend() {
	Object.assign(this._host.style, {
		top: `${Math.max(0, Math.floor((Renderer.height - WINDOW_HEIGHT) / 2))}px`,
		left: `${Math.max(0, Math.floor((Renderer.width - WINDOW_WIDTH) / 2))}px`
	});
};

/**
 * Close on Escape
 */
PrivateAirship.onKeyDown = function onKeyDown(event) {
	if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
		this.remove();
		event.preventDefault();
		event.stopImmediatePropagation();
	}
};

/**
 * Open the window to fly to a map.
 *
 * @param {object} options
 * @param {string} options.targetMap - map to fly to
 * @param {boolean} [options.toNpc] - the navigation target is an NPC, which the flight does not reach
 */
PrivateAirship.open = function open(options) {
	_targetMap = PrivateAirshipTable.normalize(options && options.targetMap);

	if (this.__active) {
		this.remove();
	}
	this.append();

	const failed = this.precheck(_targetMap);
	this.buildItems(!failed);

	if (failed) {
		this.setNotice(message(failed));
	} else if (options && options.toNpc) {
		this.setNotice(message(MSG.NPC_RANDOM_CELL));
	} else {
		this.setNotice('');
	}
};

/**
 * One button per payment item the client knows.
 *
 * @param {boolean} enabled
 */
PrivateAirship.buildItems = function buildItems(enabled) {
	const root = this._shadow || this._host;
	const list = root.querySelector('.items');
	list.textContent = '';

	const items = PrivateAirshipTable.getNeedItems();
	let row = 0;

	for (let i = 0; i < items.length; i++) {
		const itemId = items[i];
		const name = itemName(itemId);
		if (!name) {
			continue;
		}
		row++;

		const button = document.createElement('div');
		button.className = 'item' + (enabled ? '' : ' disabled');
		button.style.top = `${row * ITEM_ROW_HEIGHT}px`;
		button.textContent = message(MSG.USE_ITEM).replace('%s', name);
		button.dataset.itemId = String(itemId);
		button.addEventListener('click', () => this.pay(itemId));
		list.appendChild(button);
	}

	// Rows past the official two push the notice down and grow the window.
	const extra = Math.max(0, row - BASE_ITEM_ROWS) * ITEM_ROW_HEIGHT;
	this._host.style.height = `${WINDOW_HEIGHT + extra}px`;
	this._host.style.setProperty('--extra-rows-height', `${extra}px`);
};

/**
 * Show or clear the red notice line.
 *
 * @param {string} text
 */
PrivateAirship.setNotice = function setNotice(text) {
	const root = this._shadow || this._host;
	const notice = root.querySelector('.notice');
	root.querySelector('.notice-text').textContent = text || '';
	notice.classList.toggle('visible', !!text);
};

/**
 * Pay with an item and send the request.
 *
 * @param {number} itemId
 */
PrivateAirship.pay = function pay(itemId) {
	if (isPending() || !_targetMap) {
		return;
	}

	if (itemId === NYANGVINE_FRUIT) {
		UIManager.showPromptBox(message(MSG.NYANGVINE_NO_REFUND), 'ok', 'cancel', () =>
			PrivateAirship.sendRequest(itemId)
		);
		return;
	}

	this.sendRequest(itemId);
};

/**
 * Send CZ_PRIVATE_AIRSHIP_REQUEST.
 *
 * @param {number} itemId
 */
PrivateAirship.sendRequest = function sendRequest(itemId) {
	if (isPending() || !_targetMap) {
		return;
	}
	_pendingSince = Date.now();

	const pkt = new PACKET.CZ.PRIVATE_AIRSHIP_REQUEST();
	pkt.mapName = _targetMap + '.gat';
	pkt.ItemID = itemId;
	Network.sendPacket(pkt);
};

/**
 * ZC_PRIVATE_AIRSHIP_RESPONSE: close on success, otherwise say why.
 *
 * @param {object} pkt
 */
PrivateAirship.onResponse = function onResponse(pkt) {
	_pendingSince = 0;

	if (!PrivateAirship.__active) {
		return;
	}

	if (pkt.result === 0) {
		PrivateAirship.remove();
		return;
	}

	PrivateAirship.setNotice(message(RESULT_MESSAGE[pkt.result] || MSG.TRY_AGAIN));
};

/**
 * Packet Hooks to functions
 */
Network.hookPacket(PACKET.ZC.PRIVATE_AIRSHIP_RESPONSE, PrivateAirship.onResponse);

/**
 * Create component and export it
 */
export default UIManager.addComponent(PrivateAirship);
