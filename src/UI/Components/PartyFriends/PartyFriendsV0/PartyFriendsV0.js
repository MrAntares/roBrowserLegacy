/**
 * UI/Components/PartyFriends/PartyFriendsV0/PartyFriendsV0.js
 *
 * Manage interface for parties and friends
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Preferences from 'Core/Preferences.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import Session from 'Engine/SessionStorage.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import 'UI/Elements/Elements.js';
import GUIComponent from 'UI/GUIComponent.js';
import PACKETVER from 'Network/PacketVerManager.js';
import PartyHelper from '../PartyHelper/PartyHelper.js';
import ContextMenu from 'UI/Components/ContextMenu/ContextMenu.js';
import Mail from 'UI/Components/Mail/Mail.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import WhisperBox from 'UI/Components/WhisperBox/WhisperBox.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import htmlText from './PartyFriendsV0.html?raw';
import cssText from './PartyFriendsV0.css?raw';

/**
 * Create Component
 */
const PartyFriendsV0 = new GUIComponent('PartyFriendsV0', cssText);

/**
 * @var {number} index of selection
 */
let _index = -1;

/**
 * @var {Array} friends list
 */
const _friends = [];

/**
 * @var {Array} party list
 */
const _party = [];

/**
 * @var {Object} party setup
 */
const _options = {
	exp_share: 0,
	item_share: 0,
	item_sharing_type: 0
};

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'PartyFriendsV0',
	{
		x: 200,
		y: 200,
		width: 12,
		height: 6,
		show: false,
		friend: true,
		lock: false
	},
	1.0
);

/**
 * Helper: query inside shadow root
 */
function _root() {
	return PartyFriendsV0._shadow || PartyFriendsV0._host;
}

/**
 * Helper: escape HTML (replace jQuery.escape)
 */
function _escapeHTML(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Render HTML
 */
PartyFriendsV0.render = () => htmlText;

/**
 * Initialize the component (event listener, etc.)
 */
PartyFriendsV0.init = function init() {
	const root = _root();

	// Start loading the helper
	PartyHelper.prepare();

	// Avoid drag drop problems
	const baseBtn = root.querySelector('.base');
	if (baseBtn) {
		baseBtn.addEventListener('mousedown', (e) => {
			e.stopImmediatePropagation();
			e.preventDefault();
		});
	}

	// Bind buttons
	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('click', onClose);
	}

	const lockOn = root.querySelector('.lock.on');
	const lockOff = root.querySelector('.lock.off');
	if (lockOn) lockOn.addEventListener('mousedown', onToggleLock);
	if (lockOff) lockOff.addEventListener('mousedown', onToggleLock);

	root.querySelectorAll('.switchtab.off').forEach((el) => {
		el.addEventListener('mousedown', onChangeTab);
	});

	const removeBtn = root.querySelector('.remove');
	if (removeBtn) removeBtn.addEventListener('mousedown', onRequestRemoveSelection);

	const pmBtn = root.querySelector('.privatemessage');
	if (pmBtn) pmBtn.addEventListener('mousedown', onRequestPrivateMessage);

	const leaveBtn = root.querySelector('.party.leave');
	if (leaveBtn) leaveBtn.addEventListener('mousedown', onRequestLeaveParty);

	const resizeBtn = root.querySelector('.resize');
	if (resizeBtn) resizeBtn.addEventListener('mousedown', onResize);

	const mailBtn = root.querySelector('.mail');
	if (mailBtn) mailBtn.addEventListener('mousedown', onOpenMailCreationWindow);

	const createBtn = root.querySelector('.party.create');
	if (createBtn) createBtn.addEventListener('mousedown', onOpenPartyCreationWindow);

	const addBtn = root.querySelector('.party.add');
	if (addBtn) addBtn.addEventListener('mousedown', onOpenPartyInviteWindow);

	const infoBtn = root.querySelector('.info');
	if (infoBtn) infoBtn.addEventListener('mousedown', onOpenPartyOptionWindow);

	// Context menu and selection on nodes
	const contentEl = root.querySelector('.content');
	if (contentEl) {
		contentEl.addEventListener('contextmenu', (e) => {
			const node = e.target.closest('.node');
			if (node) {
				e.preventDefault();
				e.stopImmediatePropagation();
				onRightClickInfo();
			}
		});
		contentEl.addEventListener('mousedown', (e) => {
			const node = e.target.closest('.node');
			if (node) {
				onSelectionChange(node);
			}
		});
	}

	this.draggable('.titlebar');
};

/**
 * Once append to the DOM, start to position the UI
 */
PartyFriendsV0.onAppend = function onAppend() {
	// Initialize the tab
	_preferences.friend = !_preferences.friend;
	onChangeTab();

	// Lock features
	const root = _root();
	const lockOn = root.querySelector('.lock.on');
	const lockOff = root.querySelector('.lock.off');

	if (_preferences.lock) {
		if (lockOn) lockOn.style.display = 'inline-block';
		if (lockOff) lockOff.style.display = 'none';
	} else {
		if (lockOn) lockOn.style.display = 'none';
		if (lockOff) lockOff.style.display = 'inline-block';
	}

	this.resize(_preferences.width, _preferences.height);

	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - (this._host.offsetHeight || 0))}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - (this._host.offsetWidth || 0))}px`;

	if (!_preferences.show) {
		this.ui.hide();
	}
};

/**
 * Clean up UI
 */
PartyFriendsV0.clean = function clean() {
	_party.length = 0;
	_friends.length = 0;
	_index = -1;

	_options.exp_share = 0;
	_options.item_share = 0;
	_options.item_sharing_type = 0;

	const root = _root();
	const partyName = root.querySelector('.partyname');
	if (partyName) partyName.textContent = '';

	const friendCount = root.querySelector('.friendcount');
	if (friendCount) friendCount.textContent = '0';

	const partyContent = root.querySelector('.content .party');
	if (partyContent) partyContent.innerHTML = '';

	const friendContent = root.querySelector('.content .friend');
	if (friendContent) friendContent.innerHTML = '';

	// Reset buttons
	_preferences.friend = !_preferences.friend;
	onChangeTab();
};

/**
 * Removing the UI from window, save preferences
 */
PartyFriendsV0.onRemove = function onRemove() {
	_preferences.show = this.ui.is(':visible');
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.save();
};

/**
 * Window Shortcuts
 */
PartyFriendsV0.onShortCut = function onShortCut(key) {
	switch (key.cmd) {
		case 'FRIEND':
			if (_preferences.friend) {
				this.ui.toggle();
			} else {
				_preferences.friend = false;
				onChangeTab();
				this.ui.show();
			}

			if (this.ui.is(':visible')) {
				this.focus();
			}
			break;

		case 'PARTY':
			if (!_preferences.friend) {
				this.ui.toggle();
			} else {
				_preferences.friend = true;
				onChangeTab();
				this.ui.show();
			}

			if (this.ui.is(':visible')) {
				this.focus();
			}
			break;
	}
};

/**
 * Show/Hide UI
 */
PartyFriendsV0.toggle = function toggle() {
	this.ui.toggle();
	PartyHelper.remove();
	if (this.ui.is(':visible')) {
		this.focus();
	}
};

PartyFriendsV0.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.toggle();
	}
};

/**
 * Set friends to UI
 *
 * @param {Array} friends list
 */
PartyFriendsV0.setFriends = function setFriends(friends) {
	const count = friends.length;
	const root = _root();
	const friendContainer = root.querySelector('.content .friend');

	_friends.length = friends.length;
	if (friendContainer) friendContainer.innerHTML = '';

	for (let i = 0; i < count; i++) {
		_friends[i] = friends[i];
		const div = document.createElement('div');
		div.className = `node${friends[i].State === 0 ? ' online' : ''}`;
		div.innerHTML = `<span class="name">${_escapeHTML(friends[i].Name)}</span>`;
		if (friendContainer) friendContainer.appendChild(div);
	}

	const friendCount = root.querySelector('.friendcount');
	if (friendCount) friendCount.textContent = String(count);
	_index = -1;
};

/**
 * Update friend (online/offline) state
 *
 * @param {number} index
 * @param {boolean} state
 */
PartyFriendsV0.updateFriendState = function updateFriendState(index, state) {
	const root = _root();
	const nodes = root.querySelectorAll('.content .friend .node');
	const node = nodes[index];

	_friends[index].State = state;

	if (state) {
		if (node) node.style.backgroundImage = '';
		ChatBox.addText(
			DB.getMessage(1042).replace('%s', _friends[index].Name),
			ChatBox.TYPE.BLUE,
			ChatBox.FILTER.PUBLIC_LOG
		);
		return;
	}

	ChatBox.addText(
		DB.getMessage(1041).replace('%s', _friends[index].Name),
		ChatBox.TYPE.BLUE,
		ChatBox.FILTER.PUBLIC_LOG
	);
	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_online.bmp', function (url) {
		if (node) node.style.backgroundImage = `url(${url})`;
	});
};

/**
 * Update/Add a friend to the list
 *
 * @param {number} index
 * @param {object} friend data
 */
PartyFriendsV0.updateFriend = function updateFriend(idx, friend) {
	const root = _root();

	// Add it
	if (!_friends[idx]) {
		_friends[idx] = {};

		const friendContainer = root.querySelector('.content .friend');
		if (friendContainer) {
			const div = document.createElement('div');
			div.className = 'node';
			div.innerHTML = '<span class="name"></span>';
			friendContainer.appendChild(div);
		}

		const friendCount = root.querySelector('.friendcount');
		if (friendCount) friendCount.textContent = String(_friends.length);
	}

	_friends[idx].Name = friend.Name;
	_friends[idx].GID = friend.GID;
	_friends[idx].AID = friend.AID;
	_friends[idx].State = friend.State || 0;

	const nodes = root.querySelectorAll('.content .friend .node');
	const node = nodes[idx];
	if (node) {
		const nameEl = node.querySelector('.name');
		if (nameEl) nameEl.textContent = friend.Name;
	}

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_online.bmp', function (url) {
		if (node) node.style.backgroundImage = `url(${url})`;
	});
};

/**
 * Remove friend from list
 *
 * @param {number} index
 */
PartyFriendsV0.removeFriend = function removeFriend(index) {
	_friends.splice(index, 1);

	const root = _root();
	const nodes = root.querySelectorAll('.content .friend .node');
	if (nodes[index]) nodes[index].remove();

	const friendCount = root.querySelector('.friendcount');
	if (friendCount) friendCount.textContent = String(_friends.length);

	if (_index === index) {
		_index = -1;
	}
};

/**
 * Add members to party
 *
 * @param {string} party name
 * @param {Array} member list
 */
PartyFriendsV0.setParty = function setParty(name, members) {
	const root = _root();

	const partyName = root.querySelector('.partyname');
	if (partyName) partyName.textContent = `(${name})`;

	const partyContent = root.querySelector('.content .party');
	if (partyContent) partyContent.innerHTML = '';

	Session.isPartyLeader = false;

	const createBtn = root.querySelector('.party.create');
	const leaveBtn = root.querySelector('.party.leave');
	if (createBtn) createBtn.style.display = 'none';
	if (leaveBtn) leaveBtn.style.display = 'inline-block';

	const count = members.length;

	_party.length = 0;
	for (let i = 0; i < count; i++) {
		PartyFriendsV0.addPartyMember(members[i]);
	}

	_index = -1;
};

/**
 * Add a new party member to the list
 *
 * @param {object} player information
 */
PartyFriendsV0.addPartyMember = function addPartyMember(player) {
	const role = player.role || player.Role || 0;
	const count = _party.length;
	const root = _root();
	let node;

	// Check if we are the leader
	if (player.AID === Session.AID) {
		Session.isPartyLeader = role === 0;
		const addBtn = root.querySelector('.party.add');
		if (addBtn) {
			addBtn.style.display = Session.isPartyLeader ? 'inline-block' : 'none';
		}
	}

	// Search for duplicates entries
	const nodes = root.querySelectorAll('.content .party .node');
	for (let i = 0; i < count; ++i) {
		if (_party[i].AID === player.AID && _party[i].characterName === player.characterName) {
			node = nodes[i];
			break;
		}
	}

	// Update
	if (node) {
		node.classList.remove('leader', 'online');

		if (role === 0) {
			node.classList.add('leader');
		}
		if (player.state === 0) {
			node.classList.add('online');
		}

		node.style.backgroundImage = '';
		const nameEl = node.querySelector('.name');
		if (nameEl) nameEl.textContent = player.characterName;
		const mapEl = node.querySelector('.map');
		if (mapEl) mapEl.textContent = `(${DB.getMapName(player.mapName)})`;
	}

	// Create
	else {
		player = Object.assign({}, player);

		_party.push(player);
		const partyContent = root.querySelector('.content .party');
		if (partyContent) {
			const div = document.createElement('div');
			div.className = `node${role === 0 ? ' leader' : ''}${player.state === 0 ? ' online' : ''}`;
			div.innerHTML =
				`<span class="name">${_escapeHTML(player.characterName)}</span>` +
				`<span class="map">(${_escapeHTML(DB.getMapName(player.mapName))})</span>` +
				'<canvas class="life" width="60" height="5"></canvas> <span class="hp"></span>';
			partyContent.appendChild(div);
			node = div;
		}
	}

	if (!node) return;

	const hpEl = node.querySelector('.hp');
	if (hpEl) hpEl.textContent = '';

	const canvas = node.querySelector('canvas');
	if (canvas) {
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		// Update life
		if (player.life && player.life.display) {
			ctx.drawImage(player.life.canvas, 0, 0, 60, 5, 0, 0, 60, 5);
			if (hpEl) hpEl.textContent = `${player.life.hp}/${player.life.hp_max}`;
		}
	}

	// Add texture
	const texture = role === 0 && player.state === 0 ? 'grp_leader.bmp' : player.state === 0 ? 'grp_online.bmp' : '';
	if (texture) {
		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/' + texture, function (url) {
			if (node) node.style.backgroundImage = `url(${url})`;
		});
	}
};

/**
 * Remove a character from list
 *
 * @param {number} account id
 * @param {string} character name
 */
PartyFriendsV0.removePartyMember = function removePartyMember(AID, characterName) {
	const root = _root();

	if (AID === Session.AID) {
		_party.length = 0;

		const partyContent = root.querySelector('.content .party');
		if (partyContent) partyContent.innerHTML = '';

		const partyName = root.querySelector('.partyname');
		if (partyName) partyName.textContent = '';

		const createBtn = root.querySelector('.party.create');
		if (createBtn) createBtn.style.display = 'inline-block';

		const leaveBtn = root.querySelector('.party.leave');
		const addBtn = root.querySelector('.party.add');
		if (leaveBtn) leaveBtn.style.display = 'none';
		if (addBtn) addBtn.style.display = 'none';

		ChatBox.addText(DB.getMessage(84), ChatBox.TYPE.BLUE, ChatBox.FILTER.PARTY_SETUP);
		return;
	}

	const count = _party.length;
	const nodes = root.querySelectorAll('.content .party .node');

	for (let i = 0; i < count; ++i) {
		if (_party[i].AID === AID && _party[i].characterName === characterName) {
			_party.splice(i, 1);
			if (nodes[i]) nodes[i].remove();
			break;
		}
	}
};

/**
 * Extend inventory window size
 *
 * @param {number} width
 * @param {number} height
 */
PartyFriendsV0.resize = function resize(width, height) {
	width = Math.min(Math.max(width, 12), 13);
	height = Math.min(Math.max(height, 6), 12);

	_preferences.width = width;
	_preferences.height = height;
	_preferences.save();

	const root = _root();
	const content = root.querySelector('.content');
	if (content) {
		content.style.width = `${width * 20}px`;
		content.style.height = `${height * 20}px`;
	}
};

/**
 * Update player life in interface
 *
 * @param {number} account id
 * @param {canvas} canvas life element
 * @param {number} hp
 * @param {number} maxhp
 */
PartyFriendsV0.updateMemberLife = function updateMemberLife(AID, canvas, hp, maxhp) {
	const count = _party.length;
	const root = _root();
	const nodes = root.querySelectorAll('.content .party .node');

	for (let i = 0; i < count; ++i) {
		if (_party[i].AID === AID && _party[i].state === 0) {
			const node = nodes[i];
			if (!node) break;
			const cvs = node.querySelector('canvas');
			if (cvs) {
				const ctx = cvs.getContext('2d');
				ctx.drawImage(canvas, 0, 0, 60, 5, 0, 0, 60, 5);
			}
			const hpEl = node.querySelector('.hp');
			if (hpEl) hpEl.textContent = `${hp}/${maxhp}`;
			break;
		}
	}
};

/**
 * Update party options
 *
 * @param {boolean} exp share option
 * @param {boolean} item share option
 * @param {boolean} item sharing option
 */
PartyFriendsV0.setOptions = function setOptions(exp_share, item_share, item_sharing_type) {
	if (exp_share !== undefined) {
		_options.exp_share = exp_share;
	}
	if (item_share !== undefined) {
		_options.item_share = item_share;
	}
	if (item_sharing_type !== undefined) {
		_options.item_sharing_type = item_sharing_type;
	}
};

/**
 * Check if character is a group member
 *
 * @param {string} character name
 */
PartyFriendsV0.isGroupMember = function isGroupMember(characterName) {
	const count = _party.length;
	for (let i = 0; i < count; ++i) {
		if (_party[i].characterName === characterName) {
			return true;
		}
	}

	return false;
};

/**
 * Resizing UI
 */
function onResize() {
	const host = PartyFriendsV0._host;
	const top = host.offsetTop;
	const left = host.offsetLeft;
	let lastWidth = 0;
	let lastHeight = 0;

	function resizing() {
		const extraX = -20;
		const extraY = 25 + 21;

		let w = Math.floor((Mouse.screen.x - left - extraX) / 20);
		let h = Math.floor((Mouse.screen.y - top - extraY) / 20);

		// Maximum and minimum window size
		w = Math.min(Math.max(w, 12), 13);
		h = Math.min(Math.max(h, 6), 12);

		if (w === lastWidth && h === lastHeight) {
			return;
		}

		PartyFriendsV0.resize(w, h);
		lastWidth = w;
		lastHeight = h;
	}

	// Start resizing
	const _Interval = setInterval(resizing, 30);

	// Stop resizing on left click
	const onMouseUp = (event) => {
		if (event.which === 1) {
			clearInterval(_Interval);
			window.removeEventListener('mouseup', onMouseUp);
		}
	};
	window.addEventListener('mouseup', onMouseUp);
}

/**
 * Close the window
 */
function onClose() {
	PartyFriendsV0.ui.hide();
	PartyHelper.remove();
}

/**
 * Enable or disable the lock features
 */
function onToggleLock() {
	_preferences.lock = !_preferences.lock;
	_preferences.save();

	const root = _root();
	const lockOn = root.querySelector('.lock.on');
	const lockOff = root.querySelector('.lock.off');

	if (_preferences.lock) {
		if (lockOn) lockOn.style.display = 'inline-block';
		if (lockOff) lockOff.style.display = 'none';
	} else {
		if (lockOn) lockOn.style.display = 'none';
		if (lockOff) lockOff.style.display = 'inline-block';
	}
}

/**
 * Move to the other tab (Friend -> Party or Party -> Friend)
 */
function onChangeTab() {
	const root = _root();

	_preferences.friend = !_preferences.friend;
	_preferences.save();

	// Show/hide elements based on tab
	const friendEls = root.querySelectorAll('.friend');
	const partyEls = root.querySelectorAll('.party');

	if (_preferences.friend) {
		friendEls.forEach((el) => {
			el.style.display = '';
		});
		partyEls.forEach((el) => {
			el.style.display = 'none';
		});
	} else {
		friendEls.forEach((el) => {
			el.style.display = 'none';
		});
		partyEls.forEach((el) => {
			el.style.display = '';
		});

		if (Session.hasParty) {
			const createBtn = root.querySelector('.party.create');
			if (createBtn) createBtn.style.display = 'none';

			if (!Session.isPartyLeader) {
				const addBtn = root.querySelector('.party.add');
				if (addBtn) addBtn.style.display = 'none';
			}
		} else {
			const addBtn = root.querySelector('.party.add');
			const leaveBtn = root.querySelector('.party.leave');
			if (addBtn) addBtn.style.display = 'none';
			if (leaveBtn) leaveBtn.style.display = 'none';
		}
	}

	root.querySelectorAll('.node').forEach((n) => n.classList.remove('selection'));
	_index = -1;
}

/**
 * Ask confirmation to remove a character from the list
 */
function onRequestRemoveSelection() {
	if (
		_index < 0 ||
		_preferences.lock ||
		(_preferences.friend && !_friends[_index]) ||
		(!_preferences.friend && !_party[_index])
	) {
		return;
	}

	const text = _preferences.friend ? DB.getMessage(356) : DB.getMessage(363);

	// Are you sure that you want to delete/expel ?
	UIManager.showPromptBox(text, 'ok', 'cancel', () => {
		if (_preferences.friend) {
			PartyFriendsV0.onRemoveFriend(_index);
		} else {
			PartyFriendsV0.onExpelMember(_party[_index].AID, _party[_index].characterName);
		}
	});
}

/**
 * Add nick name to chatbox
 * Or open a new conversation window (todo)
 */
function onRequestPrivateMessage() {
	if (_index < 0 || _preferences.lock) {
		return;
	}

	const name = _preferences.friend ? _friends[_index].Name : _party[_index].characterName;

	if (PACKETVER.value >= 20090617) {
		WhisperBox.show(name);
		return;
	}

	const chatRoot = ChatBox._shadow || ChatBox._host;
	if (chatRoot) {
		const usernameInput = chatRoot.querySelector('.username');
		if (usernameInput) usernameInput.value = name;
		const messageInput = chatRoot.querySelector('.message');
		if (messageInput) messageInput.focus();
	}
}

/**
 * Add nick name to chatbox while clicking on player character sprite
 */
PartyFriendsV0.onOpenChat1to1 = function onOpenChat1to1(name) {
	if (PACKETVER.value >= 20090617) {
		WhisperBox.show(name);
		return;
	}

	const chatRoot = ChatBox._shadow || ChatBox._host;
	if (chatRoot) {
		const usernameInput = chatRoot.querySelector('.username');
		if (usernameInput) usernameInput.value = name;
		const messageInput = chatRoot.querySelector('.message');
		if (messageInput) messageInput.focus();
	}
};

/**
 * Right click on a character
 */
function onRightClickInfo() {
	if (_preferences.lock) {
		return;
	}

	ContextMenu.remove();
	ContextMenu.append();

	if (_preferences.friend) {
		ContextMenu.addElement(DB.getMessage(360), onRequestPrivateMessage);

		if (_friends[_index].GID !== Session.GID) {
			ContextMenu.addElement(DB.getMessage(351), onRequestRemoveSelection);
		}
	} else {
		ContextMenu.addElement(DB.getMessage(129), onRequestInformation);

		if (_party[_index].GID === Session.GID) {
			ContextMenu.addElement(DB.getMessage(2055), onRequestLeaveParty);
		} else {
			ContextMenu.addElement(DB.getMessage(360), onRequestPrivateMessage);

			if (Session.isPartyLeader) {
				ContextMenu.addElement(DB.getMessage(97), onRequestRemoveSelection);
				ContextMenu.addElement(DB.getMessage(1532), onRequestPartyDelegation);
			}
		}
	}
}

/**
 * Request player information
 */
function onRequestInformation() {
	if (_preferences.lock) {
		return;
	}

	UIManager.showMessageBox(DB.getMessage(191), 'ok');
}

/**
 * Request to leave a party
 */
function onRequestLeaveParty() {
	if (_preferences.lock) {
		return;
	}

	UIManager.showPromptBox(DB.getMessage(357), 'ok', 'cancel', () => {
		PartyFriendsV0.onRequestLeave();
	});
}

/**
 * Request to change party leader
 */
function onRequestPartyDelegation() {
	if (_preferences.lock) {
		return;
	}

	UIManager.showPromptBox(DB.getMessage(1532), 'ok', 'cancel', () => {
		PartyFriendsV0.onRequestChangeLeader(_party[_index].AID);
	});
}

/**
 * Change selection (click on a friend/party)
 */
function onSelectionChange(nodeEl) {
	const root = _root();
	root.querySelectorAll('.content .name').forEach((el) => el.classList.remove('selection'));

	const nameEl = nodeEl.querySelector('.name');
	if (nameEl) nameEl.classList.add('selection');

	const parent = nodeEl.parentNode;
	const siblings = parent.querySelectorAll('.node');
	_index = Array.prototype.indexOf.call(siblings, nodeEl);

	if (SkillTargetSelection.intersectEntityId) {
		const entityId = _preferences.friend ? _friends[_index].AID : _party[_index].AID;
		SkillTargetSelection.intersectEntityId(entityId);
	}
}

/**
 * Functions to be hooked
 */
PartyFriendsV0.onRequestPartyCreation = function onRequestPartyCreation() {};
PartyFriendsV0.onRequestAddingMember = function onRequestAddingMember() {};
PartyFriendsV0.onRequestLeave = function onRequestLeave() {};
PartyFriendsV0.onRequestChangeLeader = function onRequestChangeLeader() {};
PartyFriendsV0.onExpelMember = function onExpelMember() {};
PartyFriendsV0.onRemoveFriend = function onRemoveFriend() {};
PartyFriendsV0.onRequestSettingUpdate = function onRequestSettingUpdate() {};

/**
 * Open the party info window
 */
function onOpenPartyOptionWindow() {
	if (_preferences.lock) {
		return;
	}

	const type =
		_preferences.friend && PACKETVER.value >= 20090617 ? PartyHelper.Type.FRIEND_SETUP : PartyHelper.Type.SETUP;
	if (PartyHelper.__active && PartyHelper.getType() === type) {
		PartyHelper.remove();
		return;
	}
	PartyHelper.append();
	if (type === PartyHelper.Type.FRIEND_SETUP) {
		const whisperPrefs = WhisperBox.preferences;
		PartyHelper.setType(PartyHelper.Type.FRIEND_SETUP);
		PartyHelper.setFriendOptions(whisperPrefs);
	} else {
		PartyHelper.setType(PartyHelper.Type.SETUP);
		PartyHelper.setOptions(_options, Session.isPartyLeader);
	}
}

/**
 * Open the window to invite people
 */
function onOpenPartyInviteWindow() {
	if (_preferences.lock) {
		return;
	}
	if (PartyHelper.__active && PartyHelper.getType() === PartyHelper.Type.INVITE) {
		PartyHelper.remove();
		return;
	}

	PartyHelper.append();
	PartyHelper.setType(PartyHelper.Type.INVITE);
}

/**
 * Open the window to create a party
 */
function onOpenPartyCreationWindow() {
	if (_preferences.lock) {
		return;
	}
	if (PartyHelper.__active && PartyHelper.getType() === PartyHelper.Type.CREATE) {
		PartyHelper.remove();
		return;
	}

	PartyHelper.append();
	PartyHelper.setType(PartyHelper.Type.CREATE);
}

/**
 * Open the window to manage mails
 */
function onOpenMailCreationWindow() {
	if (_preferences.lock) {
		return;
	}

	let recipient = '';
	if (_preferences.friend && _friends[_index]) {
		recipient = _friends[_index].Name;
	} else if (!_preferences.friend && _party[_index]) {
		recipient = _party[_index].characterName;
	}

	if (recipient) {
		Mail.replyNewMailFriends(recipient);
	} else {
		Mail.append();
	}
}

PartyFriendsV0.mouseMode = GUIComponent.MouseMode.STOP;

/**
 * Storing Requirement
 */
export default UIManager.addComponent(PartyFriendsV0);
