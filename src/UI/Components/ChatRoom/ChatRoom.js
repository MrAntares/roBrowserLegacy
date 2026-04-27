/**
 * UI/Components/ChatRoom/ChatRoom.js
 *
 * Chat room UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault, AoShinHo
 */

import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import Session from 'Engine/SessionStorage.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import ContextMenu from 'UI/Components/ContextMenu/ContextMenu.js';
import ChatRoomCreate from 'UI/Components/ChatRoomCreate/ChatRoomCreate.js';
import htmlText from './ChatRoom.html?raw';
import cssText from './ChatRoom.css?raw';
import ProcessCommand from 'Controls/ProcessCommand.js';
import DB from 'DB/DBManager.js';
import EntityManager from 'Renderer/EntityManager.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import Friends from 'Engine/MapEngine/Friends.js';

/**
 * Create Component
 */
const ChatRoom = new GUIComponent('ChatRoom', cssText);

/**
 * Render HTML
 */
ChatRoom.render = () => htmlText;

/**
 * @var {string} Chat Room title
 */
ChatRoom.title = '';

/**
 * @var {number} limit
 */
ChatRoom.limit = 20;

/**
 * @var {number} type
 */
ChatRoom.type = 0;

/**
 * @var {number} Number of players in the chat
 */
ChatRoom.count = 0;

/**
 * @var {Array} Members list
 */
ChatRoom.members = [];

/**
 * @var {string} Chat Owner
 */
ChatRoom.owner = '';

/**
 * @var {boolean} is ChatRoom open ? (Temporary fix)
 */
ChatRoom.isOpen = false;

/**
 * Track current grid dimensions for preferences
 */
let _gridWidth = 7;
let _gridHeight = 3;

/**
 * @var {Preference} structure to save
 */
const _preferences = Preferences.get(
	'ChatRoom',
	{
		x: 480,
		y: 200,
		width: 7,
		height: 3
	},
	1.0
);

/**
 * Initialize UI
 */
ChatRoom.init = function init() {
	const root = this._shadow || this._host;

	// Close button
	const closeBtn = root.querySelector('.close');
	closeBtn.addEventListener('mousedown', event => {
		event.stopImmediatePropagation();
		event.preventDefault();
	});
	closeBtn.addEventListener('click', this.remove.bind(this));

	// Prevent input from moving character
	root.querySelector('.sendmsg').addEventListener('mousedown', event => {
		event.stopImmediatePropagation();
	});

	// Resize handle
	root.querySelector('.extend').addEventListener('mousedown', onResize);

	this.draggable('.titlebar');
};

/**
 * Once appended to DOM
 */
ChatRoom.onAppend = function onAppend() {
	const root = this._shadow || this._host;

	this.isOpen = true;
	_gridWidth = _preferences.width;
	_gridHeight = _preferences.height;
	resize(_gridWidth, _gridHeight);

	this._host.style.top =
		Math.min(Math.max(0, _preferences.y), Renderer.height - this._host.getBoundingClientRect().height) + 'px';
	this._host.style.left =
		Math.min(Math.max(0, _preferences.x), Renderer.width - this._host.getBoundingClientRect().width) + 'px';

	root.querySelector('.sendmsg').focus();
	this.updateChat();
};

/**
 * Clean up variables once removed from DOM
 */
ChatRoom.onRemove = function onRemove() {
	this.title = '';
	this.limit = 20;
	this.type = 0;
	this.count = 0;
	this.members.length = 0;
	this.owner = '';
	this.isOpen = false;

	const root = this._shadow || this._host;
	const messages = root.querySelector('.messages');
	if (messages) messages.innerHTML = '';

	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.width = _gridWidth;
	_preferences.height = _gridHeight;
	_preferences.save();

	this.exitRoom();
};

function viewMemberEquip(name) {
	// Find entity by name
	let found = null;
	EntityManager.forEach(function (entity) {
		if (entity.display && entity.display.name === name) {
			found = entity;
			return false; // stop iteration
		}
	});

	if (found) {
		Equipment.onCheckPlayerEquipment(found.GID);
	}
}

function onMemberContextMenu(event) {
	event.preventDefault();
	event.stopImmediatePropagation();

	const memberName = this.dataset.name;
	if (!memberName) return;

	const isOwner = ChatRoom.owner === Session.Entity.display.name;
	const isSelf = memberName === Session.Entity.display.name;

	// Update mouse position for ContextMenu positioning
	Mouse.screen.x = event.pageX || event.clientX;
	Mouse.screen.y = event.pageY || event.clientY;

	ContextMenu.remove();
	ContextMenu.append();

	if (isOwner && isSelf) {
		// Owner clicking on self: "Change room" + "View info"
		// 126 = Change room settings
		ContextMenu.addElement(DB.getMessage(126, 'Change room settings'), () => {
			ChatRoom.openRoomSettings();
		});
		// 1360 = View Info (%s)
		ContextMenu.addElement(DB.getMessage(1360, 'View Info %s').replace('%s', memberName), () => {
			viewMemberEquip(memberName);
		});
	} else if (isOwner && !isSelf) {
		// Owner clicking on other member: all options
		// 127 = Kick member
		ContextMenu.addElement(DB.getMessage(127, 'Kick member'), () => {
			ChatRoom.requestExpelMember(memberName);
		});
		// 128 = Transfer leadership
		ContextMenu.addElement(DB.getMessage(128, 'Transfer leadership'), () => {
			ChatRoom.requestRoleChange(0, memberName);
		});
		// 1360 = View Info (%s)
		ContextMenu.addElement(DB.getMessage(1360, 'View Info %s').replace('%s', memberName), () => {
			viewMemberEquip(memberName);
		});
		// 358 = Add as friend
		if (!Friends.isFriend(memberName)) {
			ContextMenu.addElement(DB.getMessage(358, 'Add as friend'), () => {
				Friends.addFriend(memberName);
			});
		}
		// 126 = Change room settings
		ContextMenu.addElement(DB.getMessage(126, 'Change room settings'), () => {
			ChatRoom.openRoomSettings();
		});
	} else if (!isOwner && !isSelf) {
		// Non-owner clicking on other member
		// 1360 = View Info (%s)
		ContextMenu.addElement(DB.getMessage(1360, 'View Info %s').replace('%s', memberName), () => {
			viewMemberEquip(memberName);
		});
		// 358 = Add as friend
		if (!Friends.isFriend(memberName)) {
			ContextMenu.addElement(DB.getMessage(358, 'Add as friend'), () => {
				Friends.addFriend(memberName);
			});
		}
	} else {
		// Non-owner clicking on self
		// 1360 = View Info (%s)
		ContextMenu.addElement(DB.getMessage(1360, 'View Info %s').replace('%s', memberName), () => {
			viewMemberEquip(memberName);
		});
	}
}

/**
 * Update ChatRoom parameters (title, count, members list)
 */
ChatRoom.updateChat = function updateChat() {
	const root = this._shadow || this._host;
	const titleEl = root.querySelector('.titlebar .title');
	const countEl = root.querySelector('.titlebar .count');
	const membersEl = root.querySelector('.members');

	if (titleEl) titleEl.textContent = this.title;
	if (countEl) countEl.textContent = this.count + '/' + this.limit;
	if (!membersEl) return;

	membersEl.innerHTML = '';

	const count = this.members.length;

	// Owner first
	for (let i = 0; i < count; ++i) {
		if (this.members[i] === this.owner) {
			const ownerSpan = document.createElement('span');
			ownerSpan.className = 'owner member';
			ownerSpan.dataset.name = this.members[i];
			ownerSpan.textContent = this.members[i];
			ownerSpan.addEventListener('contextmenu', onMemberContextMenu);
			membersEl.appendChild(ownerSpan);
			membersEl.appendChild(document.createElement('br'));
		}
	}

	// Then other members
	for (let j = 0; j < count; ++j) {
		if (this.members[j] !== this.owner) {
			const memberSpan = document.createElement('span');
			memberSpan.className = 'member';
			memberSpan.dataset.name = this.members[j];
			memberSpan.textContent = this.members[j];
			memberSpan.addEventListener('contextmenu', onMemberContextMenu);
			membersEl.appendChild(memberSpan);
			membersEl.appendChild(document.createElement('br'));
		}
	}
};

/**
 * Parse and send chat room messages
 */
function sendChatMessage() {
	const root = ChatRoom._shadow || ChatRoom._host;
	const input = root.querySelector('.send input[name=message]');
	const message = input.value;

	if (message.length < 1) {
		return false;
	}

	if (message[0] === '/') {
		ProcessCommand.processCommand.call(ChatBox, message.substr(1));
		input.value = '';
		return true;
	}

	ChatBox.onRequestTalk('', message);
	input.value = '';
	return true;
}

/**
 * Display a message in the chat room
 * @param {string} message
 * @param {string} type
 */
ChatRoom.message = function displayMessage(message, type) {
	const root = this._shadow || this._host;
	const element = document.createElement('div');
	element.textContent = message;

	if (type) {
		element.className = type;
	} else if (message.indexOf(Session.Entity.display.name + ' : ') === 0) {
		element.className = 'self';
	}

	const content = root.querySelector('.messages');
	content.appendChild(element);
	content.scrollTop = content.scrollHeight;

	return true;
};

/**
 * Remove a member from the chat
 * @param {string} name
 */
ChatRoom.removeMember = function removeMember(name) {
	const pos = this.members.indexOf(name);
	if (pos > -1) {
		this.members.splice(pos, 1);
		return true;
	}
	return false;
};

/**
 * Key Event Handler
 */
ChatRoom.onKeyDown = function onKeyDown(event) {
	const root = this._shadow || this._host;
	const active = root.activeElement;

	if (active && active.tagName && active.tagName.match(/input|textarea|select/i)) {
		// Input focused — let the keystroke through but block other handlers
		if (event.which === KEYS.ENTER) {
			sendChatMessage();
			event.stopImmediatePropagation();
			return false;
		}
		if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
			active.blur();
			event.stopImmediatePropagation();
			return false;
		}
		event.stopImmediatePropagation();
		return true;
	}

	if (event.which === KEYS.ENTER) {
		sendChatMessage();
		event.stopImmediatePropagation();
		return false;
	}
	return true;
};

/**
 * Functions to define (overridden by Engine/MapEngine/ChatRoom.js)
 */
ChatRoom.exitRoom = function exitRoom() {};
ChatRoom.changeChatRoom = function changeChatRoom() {};
ChatRoom.requestRoleChange = function requestRoleChange() {};
ChatRoom.requestExpelMember = function requestExpelMember() {};
/**
 * Resize ChatRoom via drag
 */
function onResize() {
	const rect = ChatRoom._host.getBoundingClientRect();
	const top = rect.top;
	const left = rect.left;
	let lastWidth = 0;
	let lastHeight = 0;

	function resizeProcess() {
		const extraX = 23 + 16 + 16 - 30;
		const extraY = 31 + 19 - 30;

		let w = Math.floor((Mouse.screen.x - left - extraX) / 32);
		let h = Math.floor((Mouse.screen.y - top - extraY) / 32);

		// Maximum and minimum window size
		w = Math.min(Math.max(w, 7), 14);
		h = Math.min(Math.max(h, 3), 8);

		if (w === lastWidth && h === lastHeight) {
			return;
		}

		resize(w, h);
		lastWidth = w;
		lastHeight = h;
	}

	// Start resizing
	const _Interval = setInterval(resizeProcess, 30);

	// Stop resizing (native DOM instead of jQuery(window).one)
	function onMouseUp(event) {
		if (event.which === 1) {
			clearInterval(_Interval);
			window.removeEventListener('mouseup', onMouseUp);
		}
	}
	window.addEventListener('mouseup', onMouseUp);
}

/**
 * Extend chat room window size
 */
function resize(width, height) {
	width = Math.min(Math.max(width, 7), 14);
	height = Math.min(Math.max(height, 3), 8);

	_gridWidth = width;
	_gridHeight = height;

	const root = ChatRoom._shadow || ChatRoom._host;
	const inner = root.querySelector('#ChatRoom');
	if (inner) {
		inner.style.width = 23 + 16 + 16 + width * 32 + 'px';
	}
	root.querySelectorAll('.resize').forEach(function (el) {
		el.style.height = height * 32 + 'px';
	});

	// Update host dimensions to match
	if (ChatRoom._host) {
		ChatRoom._host.style.width = 23 + 16 + 16 + width * 32 + 'px';
		if (inner) {
			ChatRoom._host.style.height = inner.offsetHeight + 'px';
		}
	}
}

/**
 * Open ChatRoomCreate pre-filled
 */
ChatRoom.openRoomSettings = function openRoomSettings() {
	const originalRequestRoom = ChatRoomCreate.requestRoom;

	ChatRoomCreate.requestRoom = function () {
		ChatRoom.changeChatRoom(this.title, this.limit, this.type, this.password);
		// Restore original after use
		ChatRoomCreate.requestRoom = originalRequestRoom;
	};

	ChatRoomCreate.prefill(ChatRoom.title, ChatRoom.limit, ChatRoom.type, ChatRoom.password);
	ChatRoomCreate.show();
};

ChatRoom.mouseMode = GUIComponent.MouseMode.STOP;
ChatRoom.captureKeyEvents = true;
ChatRoom.needFocus = true;

/**
 * Create component and export it
 */
export default UIManager.addComponent(ChatRoom);
