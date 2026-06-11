/**
 * UI/Components/PartyFriends/PartyFriendsV1/PartyFriendsV1.js
 *
 * Manage interface for parties and friends
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Camera from 'Renderer/Camera.js';
import MiniMap from 'UI/Components/MiniMap/MiniMap.js';
import Preferences from 'Core/Preferences.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import Session from 'Engine/SessionStorage.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import PartyHelper from '../PartyHelper/PartyHelper.js';
import ContextMenu from 'UI/Components/ContextMenu/ContextMenu.js';
import Rodex from 'UI/Components/Rodex/Rodex.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import WhisperBox from 'UI/Components/WhisperBox/WhisperBox.js';
import htmlText from './PartyFriendsV1.html?raw';
import cssText from './PartyFriendsV1.css?raw';
import PartyMemberExternal from '../PartyMemberExternal/PartyMemberExternal.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';

/**
 * Create Component
 */
const PartyFriendsV1 = new GUIComponent('PartyFriendsV1', cssText);
let _detachedMembers = {}; // Map of AID -> Component

/**
 * @let {number} index of selection
 */
let _index = -1;

/**
 * @let {Array} friends list
 */
const _friends = [];

/**
 * @let {Array} party list
 */
const _party = [];

/**
 * @let {Object} party setup
 */
const _options = {
	exp_share: 0,
	item_share: 0,
	item_sharing_type: 0
};

/**
 * @let {Object} Local cache for restored positions to avoid redundant localStorage reads.
 */
let _savedPositions = null;

/**
 * @let {boolean} Set to true by clean() so onRemove skips saving detached positions
 */
let _skipSaveOnRemove = false;

/**
 * @let {Preferences} structure
 */
const _preferences = Preferences.get(
	'PartyFriendsV1',
	{
		x: 200,
		y: 200,
		width: 12,
		height: 6,
		show: false,
		friend: true,
		lock: false,
		detachedMembers: {} // Map of AID -> { x, y }
	},
	1.0
);

/**
 * Helper: query inside shadow root
 */
function _root() {
	return PartyFriendsV1._shadow || PartyFriendsV1._host;
}

/**
 * Helper: escape HTML entities
 */
function _escapeHTML(str) {
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

/**
 * Render HTML
 */
PartyFriendsV1.render = () => htmlText;

/**
 * Initialize the component (event listener, etc.)
 */
PartyFriendsV1.init = function init() {
	const root = _root();

	// Start loading the helper
	PartyHelper.prepare();

	// Avoid drag drop problems
	const baseBtn = root.querySelector('.base');
	if (baseBtn) {
		baseBtn.addEventListener('mousedown', (event) => {
			event.stopImmediatePropagation();
			event.preventDefault();
		});
	}

	// Bind buttons
	const closeBtn = root.querySelector('.close');
	if (closeBtn) closeBtn.addEventListener('click', onClose);

	root.querySelectorAll('.lock').forEach((el) => {
		el.addEventListener('mousedown', onToggleLock);
	});

	root.querySelectorAll('.switchtab.off').forEach((el) => {
		el.addEventListener('mousedown', onChangeTab);
	});

	const removeBtn = root.querySelector('.remove');
	if (removeBtn) removeBtn.addEventListener('mousedown', onRequestRemoveSelection);

	const pmBtn = root.querySelector('.privatemessage');
	if (pmBtn) pmBtn.addEventListener('mousedown', onRequestPrivateMessage);

	const leaveBtn = root.querySelector('.leave');
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

	const sortBtn = root.querySelector('.party.sort');
	if (sortBtn) sortBtn.addEventListener('mousedown', sortDetachedMembers);

	// Delegated events on content
	const content = root.querySelector('.content');
	if (content) {
		content.addEventListener('contextmenu', (event) => {
			const node = event.target.closest('.node');
			if (node) {
				onRightClickInfo.call(node, event);
			}
		});

		content.addEventListener('mousedown', (event) => {
			const node = event.target.closest('.node');
			if (node) {
				onMemberMouseDown.call(node, event);
			}
		});

		content.addEventListener('mouseover', (event) => {
			const el = event.target.closest('[data-tooltip]');
			if (el) onTooltipShow.call(el, event);
		});

		content.addEventListener('mousemove', (event) => {
			const el = event.target.closest('[data-tooltip]');
			if (el) onTooltipMove.call(el, event);
		});

		content.addEventListener('mouseout', (event) => {
			const el = event.target.closest('[data-tooltip]');
			if (el) onTooltipHide.call(el, event);
		});
	}

	this.draggable('.titlebar');

	// Save external window position when dragging ends
	PartyMemberExternal.onDragEnd = function (movedComponent) {
		const pos = {
			left: movedComponent._host.offsetLeft,
			top: movedComponent._host.offsetTop
		};
		const oldPos = movedComponent._lastPos;

		if (oldPos) {
			for (const aid in _detachedMembers) {
				const other = _detachedMembers[aid];
				if (other && other !== movedComponent && other._host) {
					const otherPos = {
						left: other._host.offsetLeft,
						top: other._host.offsetTop
					};
					if (Math.abs(otherPos.left - pos.left) < 5 && Math.abs(otherPos.top - pos.top) < 5) {
						other._host.style.left = `${oldPos.left}px`;
						other._host.style.top = `${oldPos.top}px`;
						PartyFriendsV1.saveDetachedMembers();
						return;
					}
				}
			}
		}

		PartyFriendsV1.saveDetachedMembers();
	};
};

/**
 * Logic when clicking a member node to handle possible drag out
 */
function onMemberMouseDown(event) {
	// Only left click blocks event propagation to game world
	if (event.which === 1) {
		event.stopPropagation();
	} else {
		return;
	}

	const node = this;
	const AID = parseInt(node.dataset.aid, 10);

	event.preventDefault();

	// Selection change immediately on mousedown
	onSelectionChange.call(node, event);

	const player = _party.find((member) => member.AID == AID);

	if (!player) {
		return;
	}

	// Handle Skill Targeting
	if (SkillTargetSelection && SkillTargetSelection.__active && !_preferences.friend) {
		if (player.state === 0) {
			SkillTargetSelection.intersectEntityId(player.AID);
		}
		SkillTargetSelection.remove();
		event.preventDefault();
		event.stopImmediatePropagation();
		return;
	}

	// Block ONLY dragging if already detached
	if (_detachedMembers[AID]) {
		return;
	}

	// Offline members are not draggable
	if (player.state !== 0) {
		return;
	}

	// Block dragging out when locked
	if (_preferences.lock) {
		return;
	}

	const startX = event.pageX;
	const startY = event.pageY;
	let isDragging = false;
	const threshold = 5;
	let ghostWrapper = null;
	let ghostInner = null;

	const nodeRect = node.getBoundingClientRect();

	function onMouseMove(moveEvent) {
		if (!isDragging) {
			if (Math.abs(moveEvent.pageX - startX) > threshold || Math.abs(moveEvent.pageY - startY) > threshold) {
				isDragging = true;

				if (ContextMenu) {
					ContextMenu.remove();
				}

				// Create screen-wide drag shield
				ghostWrapper = document.createElement('div');
				ghostWrapper.className = 'drag-shield';
				ghostWrapper.style.cssText =
					'position:fixed; top:0; left:0; right:0; bottom:0; z-index:10000; background:transparent; cursor:grabbing;';

				ghostInner = document.createElement('div');
				ghostInner.id = 'PartyFriends';
				ghostInner.className = 'drag-ghost-wrapper';
				ghostInner.style.cssText =
					'position:absolute; pointer-events:none; opacity:0.6; background:none !important; border:none !important; height:auto !important; width:auto !important;';

				const ghostContent = document.createElement('div');
				ghostContent.className = 'content';
				ghostContent.style.cssText =
					'background:none !important; height:auto !important; width:auto !important;';

				const ghostParty = document.createElement('div');
				ghostParty.className = 'party info-v2';

				const clonedNode = node.cloneNode(true);
				ghostParty.appendChild(clonedNode);
				ghostContent.appendChild(ghostParty);
				ghostInner.appendChild(ghostContent);
				ghostWrapper.appendChild(ghostInner);
				document.body.appendChild(ghostWrapper);

				// Canvas content isn't cloned, redraw if possible
				const srcCanvas = node.querySelector('canvas');
				const dstCanvas = clonedNode.querySelector('canvas');
				if (srcCanvas && dstCanvas) {
					dstCanvas.width = srcCanvas.width;
					dstCanvas.height = srcCanvas.height;
					dstCanvas.getContext('2d').drawImage(srcCanvas, 0, 0);
				}

				ghostInner.style.width = `${node.offsetWidth}px`;
				ghostInner.style.height = `${node.offsetHeight}px`;
			}
		}

		if (isDragging && ghostInner) {
			ghostInner.style.left = `${moveEvent.clientX - (startX - nodeRect.left)}px`;
			ghostInner.style.top = `${moveEvent.clientY - (startY - nodeRect.top)}px`;
			moveEvent.preventDefault();
		}
	}

	function onMouseUp(upEvent) {
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('mouseup', onMouseUp);

		if (ghostWrapper) {
			ghostWrapper.remove();
			ghostWrapper = null;
			ghostInner = null;
		}

		if (isDragging) {
			upEvent.stopImmediatePropagation();

			const hostEl = PartyFriendsV1._host;
			const rect = hostEl.getBoundingClientRect();
			const x = upEvent.pageX;
			const y = upEvent.pageY;

			// Check if dropped outside (with a small 10px buffer)
			if (
				x < rect.left - 10 ||
				x > rect.left + rect.width + 10 ||
				y < rect.top - 10 ||
				y > rect.top + rect.height + 10
			) {
				detachMember(AID, player, x, y);
				PartyFriendsV1.saveDetachedMembers();
			}
		}
	}

	window.addEventListener('mousemove', onMouseMove);
	window.addEventListener('mouseup', onMouseUp);
}

/**
 * Find the next available slot for a detached member window.
 */
function getNextAvailableSlot() {
	const startX = 0;
	const startY = 100;
	const stepY = 38 + 10;
	let currentY = startY;

	let found = true;
	while (found) {
		found = false;
		for (const aid in _detachedMembers) {
			const ext = _detachedMembers[aid];
			if (ext && ext._host) {
				const posLeft = ext._host.offsetLeft;
				const posTop = ext._host.offsetTop;
				if (Math.abs(posLeft - startX) < 5 && Math.abs(posTop - currentY) < 5) {
					currentY += stepY;
					found = true;
					break;
				}
			}
		}
	}

	return { x: startX, y: currentY };
}

/**
 * Position all detached members into a neat vertical stack
 */
function sortDetachedMembers() {
	const startX = 0;
	const startY = 100;
	const stepY = 38 + 10;
	let currentY = startY;

	for (let i = 0, count = _party.length; i < count; i++) {
		const player = _party[i];
		const external = _detachedMembers[player.AID];

		if (external && external._host) {
			external._host.style.left = `${startX}px`;
			external._host.style.top = `${currentY}px`;
			currentY += stepY;
		}
	}

	PartyFriendsV1.saveDetachedMembers();
}

/**
 * Create an external mini-window for a member
 */
function detachMember(AID, player, x, y, restorePos) {
	if (_detachedMembers[AID]) {
		return;
	}

	const external = PartyMemberExternal.clone(`PartyMemberExternal_${AID}`, true);
	external.name = `PartyMemberExternal_${AID}`;
	UIManager.addComponent(external);

	// Cleanup external window and refresh party list
	external.onRemove = function () {
		delete _detachedMembers[AID];
		delete UIManager.components[external.name];
		const tooltip = document.getElementById('ro-tooltip-party');
		if (tooltip) tooltip.style.display = 'none';
		PartyFriendsV1.refreshPartyList();

		if (external._closedByUser) {
			PartyFriendsV1.saveDetachedMembers();
		}
	};

	external.setMember(AID, player);
	external.append();

	let initX = x - 75;
	let initY = y - 19;

	if (restorePos) {
		initX = restorePos.x;
		initY = restorePos.y;
	} else {
		const slot = getNextAvailableSlot();
		initX = slot.x;
		initY = slot.y;
	}

	external._host.style.left = `${initX}px`;
	external._host.style.top = `${initY}px`;

	_detachedMembers[AID] = external;
	PartyFriendsV1.refreshPartyList();
}

/**
 * Refresh the party list rendering
 */
PartyFriendsV1.refreshPartyList = function refreshPartyList() {
	const root = _root();
	const partyContent = root.querySelector('.content .party');
	if (partyContent) partyContent.innerHTML = '';

	for (let i = 0; i < _party.length; i++) {
		this.renderPartyMember(_party[i]);
	}

	const innerCount = root.querySelector('.count-box .inner-count');
	if (innerCount) innerCount.textContent = `${_party.length}/12`;
};

/**
 * Once append to the DOM, start to position the UI
 */
PartyFriendsV1.onAppend = function onAppend() {
	const root = _root();

	// Initialize the tab
	_preferences.friend = !_preferences.friend;
	onChangeTab();

	// Lock features
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

	const hostHeight = this._host.offsetHeight || 0;
	const hostWidth = this._host.offsetWidth || 0;
	this._host.style.top = `${Math.min(Math.max(0, _preferences.y), Renderer.height - hostHeight)}px`;
	this._host.style.left = `${Math.min(Math.max(0, _preferences.x), Renderer.width - hostWidth)}px`;

	// Load footer background
	Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/bg_partymember.bmp', function (url) {
		const countBox = root.querySelector('.count-box');
		if (countBox) countBox.style.backgroundImage = `url(${url})`;
	});

	if (!_preferences.show) {
		this._host.style.display = 'none';
	}

	// Restore detached members for same-map teleports
	for (let i = 0; i < _party.length; i++) {
		restoreDetachedMember(_party[i]);
	}
};

/**
 * Clean up UI
 */
PartyFriendsV1.clean = function clean() {
	const root = _root();

	_party.length = 0;
	_friends.length = 0;

	_skipSaveOnRemove = true;
	for (const aid in _detachedMembers) {
		if (_detachedMembers[aid]) {
			_detachedMembers[aid].remove();
		}
	}
	_detachedMembers = {};
	_savedPositions = null;

	_options.exp_share = 0;
	_options.item_share = 0;
	_options.item_sharing_type = 0;

	const partyName = root.querySelector('.partyname');
	if (partyName) partyName.textContent = '';

	const friendCount = root.querySelector('.friendcount');
	if (friendCount) friendCount.textContent = '0';

	const partyContent = root.querySelector('.content .party');
	if (partyContent) partyContent.innerHTML = '';

	const friendContent = root.querySelector('.content .friend');
	if (friendContent) friendContent.innerHTML = '';

	const innerCount = root.querySelector('.count-box .inner-count');
	if (innerCount) innerCount.textContent = '0/12';

	// Reset buttons
	_preferences.friend = !_preferences.friend;
	onChangeTab();
};

/**
 * Removing the UI from window, save preferences
 */
PartyFriendsV1.onRemove = function onRemove() {
	_preferences.show = this._host.style.display !== 'none';
	_preferences.y = parseInt(this._host.style.top, 10) || 0;
	_preferences.x = parseInt(this._host.style.left, 10) || 0;
	_preferences.save();

	if (!_skipSaveOnRemove && Object.keys(_detachedMembers).length > 0) {
		this.saveDetachedMembers();
	}
	_skipSaveOnRemove = false;

	_savedPositions = null;

	const tooltip = document.getElementById('ro-tooltip-party');
	if (tooltip) tooltip.style.display = 'none';
};

/**
 * Window Shortcuts
 */
PartyFriendsV1.onShortCut = function onShortCut(key) {
	const isVisible = this._host.style.display !== 'none';

	switch (key.cmd) {
		case 'FRIEND':
			if (_preferences.friend) {
				this._host.style.display = isVisible ? 'none' : 'block';
			} else {
				_preferences.friend = false;
				onChangeTab();
				this._host.style.display = 'block';
			}

			if (this._host.style.display !== 'none') {
				this.focus();
			}
			break;

		case 'PARTY':
			if (!_preferences.friend) {
				this._host.style.display = isVisible ? 'none' : 'block';
			} else {
				_preferences.friend = true;
				onChangeTab();
				this._host.style.display = 'block';
			}

			if (this._host.style.display !== 'none') {
				this.focus();
			}
			break;
	}
};

/**
 * Show/Hide UI
 */
PartyFriendsV1.toggle = function toggle() {
	const isVisible = this._host.style.display !== 'none';
	this._host.style.display = isVisible ? 'none' : 'block';
	PartyHelper.remove();

	if (this._host.style.display !== 'none') {
		this.focus();
	}
};

PartyFriendsV1.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this._host.style.display !== 'none') {
		this.toggle();
	}
};

/**
 * Set friends to UI
 *
 * @param {Array} friends list
 */
PartyFriendsV1.setFriends = function setFriends(friends) {
	const root = _root();
	const count = friends.length;
	const friendContent = root.querySelector('.content .friend');

	_friends.length = friends.length;
	if (friendContent) friendContent.innerHTML = '';

	for (let i = 0; i < count; i++) {
		_friends[i] = friends[i];
		if (friendContent) {
			friendContent.insertAdjacentHTML(
				'beforeend',
				`<div class="node${friends[i].State === 0 ? ' online' : ''}">` +
					`<span class="name">${_escapeHTML(friends[i].Name)}</span>` +
					`</div>`
			);
		}
	}

	const friendCountEl = root.querySelector('.friendcount');
	if (friendCountEl) friendCountEl.textContent = String(count);
	_index = -1;
};

/**
 * Update friend (online/offline) state
 */
PartyFriendsV1.updateFriendState = function updateFriendState(index, state) {
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
 */
PartyFriendsV1.updateFriend = function updateFriend(idx, friend) {
	const root = _root();
	const friendContent = root.querySelector('.content .friend');

	if (!_friends[idx]) {
		_friends[idx] = {};

		if (friendContent) {
			friendContent.insertAdjacentHTML(
				'beforeend',
				'<div class="node"><span class="name"></span></div>'
			);
		}

		const friendCountEl = root.querySelector('.friendcount');
		if (friendCountEl) friendCountEl.textContent = String(_friends.length);
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
 */
PartyFriendsV1.removeFriend = function removeFriend(index) {
	const root = _root();
	_friends.splice(index, 1);

	const nodes = root.querySelectorAll('.content .friend .node');
	if (nodes[index]) nodes[index].remove();

	const friendCountEl = root.querySelector('.friendcount');
	if (friendCountEl) friendCountEl.textContent = String(_friends.length);

	if (_index === index) {
		_index = -1;
	}
};

/**
 * Add members to party
 */
PartyFriendsV1.setParty = function setParty(name, members) {
	const root = _root();

	const partyName = root.querySelector('.partyname');
	if (partyName) partyName.textContent = `(${name})`;
	Session.isPartyLeader = false;

	const createBtn = root.querySelector('.party.create');
	if (createBtn) createBtn.style.display = 'none';

	const leaveBtn = root.querySelector('.party.leave');
	if (leaveBtn) leaveBtn.style.display = '';

	const sortBtn = root.querySelector('.party.sort');
	if (sortBtn) sortBtn.style.display = '';

	const count = members.length;
	const newAIDs = {};

	for (let i = 0; i < count; i++) {
		const member = members[i];
		newAIDs[member.AID] = true;
		PartyFriendsV1.addPartyMember(member);
	}

	// Remove members who are no longer in the party
	if (_party.length > 0 && count > 0) {
		for (let i = 0; i < _party.length; i++) {
			if (!newAIDs[_party[i].AID]) {
				const removed = _party.splice(i, 1)[0];
				const nodeEl = root.querySelector(`.content .party .node[data-aid="${removed.AID}"]`);
				if (nodeEl) nodeEl.remove();
				i--;
			}
		}
	}

	const innerCount = root.querySelector('.count-box .inner-count');
	if (innerCount) innerCount.textContent = `${_party.length}/12`;

	// Garbage Collection: Remove windows for members who left the party
	let removedCount = 0;
	for (const aid in _detachedMembers) {
		let foundInPacket = false;
		for (let i = 0; i < count; i++) {
			if (members[i].AID == aid || String(members[i].AID) === aid) {
				foundInPacket = true;
				break;
			}
		}
		if (!foundInPacket) {
			if (_detachedMembers[aid]) {
				console.log('[PartyFriendsV1] GC removing orphaned window for AID:', aid);
				_detachedMembers[aid].remove();
				removedCount++;
			}
		}
	}
	if (removedCount > 0) {
		console.log(`[PartyFriendsV1] Cleaned up ${removedCount} orphaned detached windows`);
	}
};

/**
 * Helper to restore a detached member from saved layout.
 */
function restoreDetachedMember(player) {
	if (_detachedMembers[player.AID]) {
		return;
	}

	if (!Session.Character || !Session.Character.name) {
		return;
	}

	if (_savedPositions === null) {
		const key = `PartyFriends_${Session.Character.name}_Detached`;
		const savedStr = localStorage.getItem(key);
		_savedPositions = {};
		try {
			if (savedStr) {
				_savedPositions = JSON.parse(savedStr);
			}
		} catch (e) {
			console.error('[PartyFriendsV1] Failed to parse saved detached members:', e);
		}
	}

	const entry = _savedPositions[player.AID] || _savedPositions[String(player.AID)];
	if (entry) {
		detachMember(player.AID, player, null, null, entry);
	}
}

/**
 * Helper to update the HP bar on a canvas
 * @param {Element} node
 * @param {number} hp
 * @param {number} maxhp
 */
function updateCanvasLife(node, hp, maxhp) {
	const hasLife = hp !== undefined && maxhp !== undefined && maxhp > 0;
	const lifeRatio = hasLife ? hp / maxhp : 0;
	const barVisibility = hasLife ? 'visible' : 'hidden';

	const hpBarContainer = node.querySelector('.hp-bar-container');
	if (hpBarContainer) hpBarContainer.style.visibility = barVisibility;

	const hpEl = node.querySelector('.hp');
	if (hpEl) hpEl.style.visibility = barVisibility;

	if (hasLife) {
		const canvas = node.querySelector('canvas');
		if (canvas) {
			const ctx = canvas.getContext('2d');
			const width = Math.floor(lifeRatio * 75);
			canvas.width = 75;
			canvas.height = 5;
			ctx.clearRect(0, 0, 75, 5);
			ctx.fillStyle = lifeRatio <= 0.25 ? '#ef1010' : '#32cd32';
			ctx.fillRect(0, 0, width, 5);
		}
		if (hpEl) hpEl.textContent = `${hp}/${maxhp}`;
	} else {
		if (hpEl) hpEl.textContent = '';
	}
}

/**
 * Add a new party member to the list
 */
PartyFriendsV1.addPartyMember = function addPartyMember(player) {
	const root = _root();
	const role = player.role || 0;
	const count = _party.length;
	let i;

	// Check if we are the leader
	if (player.AID === Session.AID) {
		Session.isPartyLeader = role === 0;
		const addBtn = root.querySelector('.party.add');
		if (addBtn) {
			addBtn.style.display = Session.isPartyLeader ? '' : 'none';
		}
	}

	// Search for duplicates entries
	for (i = 0; i < count; ++i) {
		if (_party[i].AID === player.AID || _party[i].characterName === player.characterName) {
			break;
		}
	}

	let hasChanged = false;

	if (i < count) {
		const old = _party[i];

		if (
			old.baseLevel !== (player.baseLevel !== undefined ? player.baseLevel : old.baseLevel) ||
			old.class_ !== (player.class_ !== undefined ? player.class_ : old.class_) ||
			old.mapName !== (player.mapName !== undefined ? player.mapName : old.mapName) ||
			old.role !== player.role ||
			old.state !== (player.state !== undefined ? player.state : old.state)
		) {
			hasChanged = true;
		}

		Object.assign(_party[i], player);
		player = _party[i];
	} else {
		player = Object.assign({}, player);
		_party.push(player);
		hasChanged = true;
	}

	if (!hasChanged) {
		return;
	}

	const innerCount = root.querySelector('.count-box .inner-count');
	if (innerCount) innerCount.textContent = `${_party.length}/12`;

	// Handle detached state
	if (_detachedMembers[player.AID]) {
		_detachedMembers[player.AID].setMember(player.AID, player);
	} else {
		restoreDetachedMember(player);
	}

	this.renderPartyMember(player);
};

/**
 * Render a party member into the UI
 */
PartyFriendsV1.renderPartyMember = function renderPartyMember(player) {
	const root = _root();
	const role = player.role || player.Role || 0;
	const job = player.class_ || player.job || player.Job || 0;
	const level = player.baseLevel || player.level || player.Level || 0;
	const isDead = !!player.isDead;
	const isOnline = player.state === 0;
	const isDetached = !!_detachedMembers[player.AID];

	const jobName = MonsterTable[job] || 'Unknown';
	const mapDisplay = DB.getMapName(player.mapName);

	const color = MiniMap && MiniMap.getMemberColor ? MiniMap.getMemberColor(player.AID) : 'white';
	player.color = color;

	const nameTooltip = `${player.characterName} (${mapDisplay})`;

	const hasLife = !!(player.life && player.life.display);
	const barVisibility = hasLife ? 'visible' : 'hidden';

	const memberColor = isOnline ? player.color || '#333' : '#848ca5';

	const html =
		`<div class="node${role === 0 ? ' leader' : ''}${isOnline ? ' online' : ''}${isDetached ? ' detached' : ''}"` +
		` style="background-color: ${isDetached ? '#deefff' : 'white'};"` +
		` data-aid="${player.AID}"` +
		` data-tooltip="${isOnline ? _escapeHTML(nameTooltip) : ''}"` +
		`>` +
		`<div class="job-icon-container" data-tooltip="${_escapeHTML(jobName)}">` +
		`<div class="job-icon"></div>` +
		`<div class="crown"></div>` +
		`</div>` +
		`<div class="info-container">` +
		`<div class="row1">` +
		`<span class="level">Lv. ${level}</span>` +
		`<span class="name" style="color: ${memberColor};">${_escapeHTML(player.characterName)}</span>` +
		`<span class="map" style="color: ${memberColor};">(${_escapeHTML(mapDisplay)})</span>` +
		`</div>` +
		`<div class="row2">` +
		`<div class="hp-bar-container" style="visibility:${barVisibility}">` +
		`<canvas class="life" width="75" height="5"></canvas>` +
		`</div>` +
		`<span class="hp" style="visibility:${barVisibility}"></span>` +
		`<div class="status-icon"></div>` +
		`</div>` +
		`</div>` +
		`</div>`;

	let node = root.querySelector(`.content .party .node[data-aid="${player.AID}"]`);
	if (node) {
		node.outerHTML = html;
		node = root.querySelector(`.content .party .node[data-aid="${player.AID}"]`);
	} else {
		const partyContent = root.querySelector('.content .party');
		if (partyContent) {
			partyContent.insertAdjacentHTML('beforeend', html);
			node = root.querySelector(`.content .party .node[data-aid="${player.AID}"]`);
		}
	}

	if (!node) return;

	// Load Job Icon
	Client.loadFile(
		`${DB.INTERFACE_PATH}renewalparty/icon_jobs_${job}${isDead ? '_die' : ''}.bmp`,
		function (url) {
			const jobIcon = node.querySelector('.job-icon');
			if (jobIcon) jobIcon.style.backgroundImage = `url(${url})`;
		}
	);

	// Load Crown
	if (role === 0) {
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/ico_partycrown.bmp', function (url) {
			const crown = node.querySelector('.crown');
			if (crown) crown.style.backgroundImage = `url(${url})`;
		});
	}

	// Load Status Icon
	const statusFile = `icon_party_${player.AID == Session.AID ? 'me.bmp' : isOnline ? 'on.bmp' : 'off.bmp'}`;
	Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/' + statusFile, function (url) {
		const statusIcon = node.querySelector('.status-icon');
		if (statusIcon) statusIcon.style.backgroundImage = `url(${url})`;
	});

	// Draw HP bar
	updateCanvasLife(node, hasLife ? player.life.hp : undefined, hasLife ? player.life.hp_max : undefined);
};

/**
 * Remove a character from list
 */
PartyFriendsV1.removePartyMember = function removePartyMember(AID, characterName) {
	const root = _root();

	if (AID === Session.AID) {
		for (const aid in _detachedMembers) {
			if (_detachedMembers[aid]) {
				_detachedMembers[aid].onRemove = function () {
					delete UIManager.components[this.name];
				};
				_detachedMembers[aid].remove();
			}
		}
		_detachedMembers = {};

		_party.length = 0;

		const partyContent = root.querySelector('.content .party');
		if (partyContent) partyContent.innerHTML = '';

		const partyNameEl = root.querySelector('.partyname');
		if (partyNameEl) partyNameEl.textContent = '';

		const createBtn = root.querySelector('.party.create');
		if (createBtn) createBtn.style.display = '';

		const leaveBtn = root.querySelector('.party.leave');
		if (leaveBtn) leaveBtn.style.display = 'none';

		const addBtn = root.querySelector('.party.add');
		if (addBtn) addBtn.style.display = 'none';

		ChatBox.addText(DB.getMessage(84), ChatBox.TYPE.BLUE, ChatBox.FILTER.PARTY_SETUP);
		return;
	}

	const count = _party.length;

	for (let i = 0; i < count; ++i) {
		if (_party[i].AID === AID && _party[i].characterName === characterName) {
			_party.splice(i, 1);
			const nodes = root.querySelectorAll('.content .party .node');
			if (nodes[i]) nodes[i].remove();

			const innerCount = root.querySelector('.count-box .inner-count');
			if (innerCount) innerCount.textContent = `${_party.length}/12`;

			if (_detachedMembers[AID]) {
				_detachedMembers[AID].remove();
			}

			break;
		}
	}
};

/**
 * Extend window size
 */
PartyFriendsV1.resize = function resize(width, height) {
	const root = _root();
	width = Math.min(Math.max(width, 12), 13);
	height = Math.min(Math.max(height, 6), 12);

	_preferences.width = width;
	_preferences.height = height;
	_preferences.save();

	const content = root.querySelector('.content');
	if (content) {
		content.style.width = `${width * 20}px`;
		content.style.height = `${height * 20}px`;
	}
};

/**
 * Update player dead/alive state
 */
PartyFriendsV1.updateMemberDead = function updateMemberDead(AID, isDead) {
	const count = _party.length;
	let player = null;

	for (let i = 0; i < count; ++i) {
		if (_party[i].AID === AID) {
			_party[i].isDead = isDead;
			player = _party[i];
			this.renderPartyMember(player);
			break;
		}
	}

	if (player && _detachedMembers[AID]) {
		_detachedMembers[AID].setMember(AID, player);
	}
};

/**
 * Update player life in interface
 */
PartyFriendsV1.updateMemberLife = function updateMemberLife(AID, canvas, hp, maxhp) {
	const root = _root();
	const count = _party.length;

	for (let i = 0; i < count; ++i) {
		if (_party[i].AID === AID) {
			if (!_party[i].life) {
				_party[i].life = {};
			}
			_party[i].life.hp = hp;
			_party[i].life.hp_max = maxhp;
			_party[i].life.display = true;

			if (hp === 0 && !_party[i].isDead) {
				_party[i].isDead = true;
				this.renderPartyMember(_party[i]);
			} else if (hp > 0 && _party[i].isDead) {
				_party[i].isDead = false;
				this.renderPartyMember(_party[i]);
			}
			break;
		}
	}

	if (_detachedMembers[AID]) {
		_detachedMembers[AID].updateMemberLife(hp, maxhp);
	}

	const node = root.querySelector(`.content .party .node[data-aid="${AID}"]`);
	if (node) {
		updateCanvasLife(node, hp, maxhp);
	}
};

/**
 * Update party options
 */
PartyFriendsV1.setOptions = function setOptions(exp_share, item_share, item_sharing_type) {
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
 */
PartyFriendsV1.isGroupMember = function isGroupMember(characterName) {
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
	const hostEl = PartyFriendsV1._host;
	const top = hostEl.offsetTop;
	const left = hostEl.offsetLeft;
	let lastWidth = 0;
	let lastHeight = 0;

	function resizing() {
		const extraX = -20;
		const extraY = 25 + 21;

		let w = Math.floor((Mouse.screen.x - left - extraX) / 20);
		let h = Math.floor((Mouse.screen.y - top - extraY) / 20);

		w = Math.min(Math.max(w, 12), 13);
		h = Math.min(Math.max(h, 6), 12);

		if (w === lastWidth && h === lastHeight) {
			return;
		}

		PartyFriendsV1.resize(w, h);
		lastWidth = w;
		lastHeight = h;
	}

	const _Interval = setInterval(resizing, 30);

	function onMouseUp(event) {
		if (event.which === 1) {
			clearInterval(_Interval);
			window.removeEventListener('mouseup', onMouseUp);
		}
	}

	window.addEventListener('mouseup', onMouseUp);
}

/**
 * Close the window
 */
function onClose() {
	PartyFriendsV1._host.style.display = 'none';
	PartyHelper.remove();
}

/**
 * Enable or disable the lock features
 */
function onToggleLock() {
	const root = _root();
	_preferences.lock = !_preferences.lock;
	_preferences.save();

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

	const showClass = (sel) => root.querySelectorAll(sel).forEach((el) => { el.style.display = ''; });
	const hideClass = (sel) => root.querySelectorAll(sel).forEach((el) => { el.style.display = 'none'; });

	if (_preferences.friend) {
		showClass('.friend');
		hideClass('.party');
	} else {
		hideClass('.friend');
		showClass('.party');

		if (Session.hasParty) {
			const createBtn = root.querySelector('.party.create');
			if (createBtn) createBtn.style.display = 'none';

			const sortBtn = root.querySelector('.party.sort');
			if (sortBtn) sortBtn.style.display = '';

			if (!Session.isPartyLeader) {
				const addBtn = root.querySelector('.party.add');
				if (addBtn) addBtn.style.display = 'none';
			}
		} else {
			hideClass('.party.add');
			hideClass('.party.leave');
			hideClass('.party.sort');
		}
	}

	root.querySelectorAll('.node').forEach((el) => el.classList.remove('selection'));
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

	UIManager.showPromptBox(text, 'ok', 'cancel', () => {
		if (_preferences.friend) {
			PartyFriendsV1.onRemoveFriend(_index);
		} else {
			PartyFriendsV1.onExpelMember(_party[_index].AID, _party[_index].characterName);
		}
	});
}

/**
 * Add nick name to chatbox
 */
function onRequestPrivateMessage() {
	if (_index < 0 || _preferences.lock) {
		return;
	}

	const name = _preferences.friend ? _friends[_index].Name : _party[_index].characterName;
	WhisperBox.show(name);
}

/**
 * Add nick name to chatbox while clicking on player character sprite
 */
PartyFriendsV1.onOpenChat1to1 = function onOpenChat1to1(name) {
	WhisperBox.show(name);
};

/**
 * Right click on a character
 */
function onRightClickInfo(event) {
	if (event) {
		event.stopImmediatePropagation();
		event.preventDefault();
	}

	if (Camera && Camera.rotate) {
		Camera.rotate(false);
	}

	if (_preferences.lock) {
		return;
	}

	onSelectionChange.call(this, event);

	if (_index < 0) {
		return;
	}

	ContextMenu.remove();
	ContextMenu.append();

	if (_preferences.friend) {
		const friend = _friends[_index];
		if (!friend) {
			return;
		}

		ContextMenu.addElement(DB.getMessage(360), onRequestPrivateMessage);
		if (friend.GID !== Session.GID) {
			ContextMenu.addElement(DB.getMessage(351), onRequestRemoveSelection);
		}
	} else {
		const player = _party[_index];
		if (!player) {
			return;
		}

		const isMe = player.AID === Session.AID;
		const isLeader = Session.isPartyLeader;
		const isOnline = player.state === 0;

		ContextMenu.addElement(DB.getMessage(98), onOpenMailCreationWindow);

		if (isMe) {
			ContextMenu.addElement(DB.getMessage(2055), onRequestLeaveParty);
		} else {
			ContextMenu.addElement(DB.getMessage(360), onRequestPrivateMessage);

			if (isLeader) {
				ContextMenu.addElement(DB.getMessage(97), onRequestRemoveSelection);
				ContextMenu.addElement(DB.getMessage(1532), onRequestPartyDelegation);
			}
		}

		if (isOnline) {
			ContextMenu.addElement(DB.getMessage(3101), () => {
				detachMember(player.AID, player, Mouse.screen.x, Mouse.screen.y);
				PartyFriendsV1.saveDetachedMembers();
			});
			ContextMenu.addElement(DB.getMessage(3102), () => {
				if (_detachedMembers[player.AID]) {
					_detachedMembers[player.AID].remove();
					PartyFriendsV1.saveDetachedMembers();
				}
			});
		}
	}
}

/**
 * Not implemented yet - preserved for future development.
 */
function _onRequestInformation() {
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
		PartyFriendsV1.onRequestLeave();
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
		PartyFriendsV1.onRequestChangeLeader(_party[_index].AID);
	});
}

/**
 * Change selection (click on a friend/party)
 */
function onSelectionChange(event) {
	const root = _root();
	root.querySelectorAll('.node').forEach((el) => el.classList.remove('selection'));

	const node = this;
	node.classList.add('selection');

	const AID = parseInt(node.dataset.aid, 10);
	_index = -1;

	if (_preferences.friend) {
		const nodes = Array.from(node.parentNode.querySelectorAll('.node'));
		_index = nodes.indexOf(node);
	} else {
		const player = _party.find((member) => member.AID == AID);
		_index = _party.indexOf(player);
	}
}

/**
 * Request to create a team (open the window)
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
		Rodex.requestOpenWriteRodex(recipient);
	}
}

/**
 * Request to create a team (open the window)
 */
function onOpenPartyCreationWindow() {
	if (PartyHelper.__active && PartyHelper.getType() === PartyHelper.Type.CREATE) {
		PartyHelper.remove();
		return;
	}

	PartyHelper.append();
	PartyHelper.setType(PartyHelper.Type.CREATE);
}

/**
 * Request to open invitation window
 */
function onOpenPartyInviteWindow() {
	if (PartyHelper.__active && PartyHelper.getType() === PartyHelper.Type.INVITE) {
		PartyHelper.remove();
		return;
	}

	PartyHelper.append();
	PartyHelper.setType(PartyHelper.Type.INVITE);
}

/**
 * Request to open invitation window
 */
function onOpenPartyOptionWindow() {
	if (_preferences.friend) {
		if (PartyHelper.__active && PartyHelper.getType() === PartyHelper.Type.FRIEND_SETUP) {
			PartyHelper.remove();
			return;
		}

		const whisperPrefs = WhisperBox.preferences;

		PartyHelper.append();
		PartyHelper.setType(PartyHelper.Type.FRIEND_SETUP);
		PartyHelper.setFriendOptions(whisperPrefs);
		return;
	}

	if (PartyHelper.__active && PartyHelper.getType() === PartyHelper.Type.SETUP) {
		PartyHelper.remove();
		return;
	}

	PartyHelper.append();
	PartyHelper.setType(PartyHelper.Type.SETUP);
	PartyHelper.setOptions(_options, Session.isPartyLeader);
}

/**
 * Callbacks to define
 */
PartyFriendsV1.onRemoveFriend = function () {};
PartyFriendsV1.onRequestLeave = function () {};
PartyFriendsV1.onExpelMember = function () {};
PartyFriendsV1.onRequestChangeLeader = function () {};
PartyFriendsV1.onRequestAddingMember = function () {};
PartyFriendsV1.onRequestPartyCreation = function () {};
PartyFriendsV1.onRequestSettingUpdate = function () {};

/**
 * Custom RO-style tooltips (global, outside shadow DOM)
 */
function onTooltipShow(event) {
	if (event.__tooltipHandled) {
		return;
	}
	event.__tooltipHandled = true;

	const text = this.getAttribute('data-tooltip');
	if (text) {
		let tooltip = document.getElementById('ro-tooltip-party');
		if (!tooltip) {
			tooltip = document.createElement('div');
			tooltip.id = 'ro-tooltip-party';
			tooltip.className = 'ro-tooltip';
			tooltip.style.cssText = 'display:none;position:fixed;background-color:rgba(0,0,0,0.8);text-shadow:1px 1px black;color:white;padding:2px 6px;white-space:nowrap;z-index:20000;border-radius:2px;pointer-events:none;line-height:1.2;font-size:11px;';
			document.body.appendChild(tooltip);
		}
		tooltip.textContent = text;
		tooltip.style.display = 'block';
	}
}

function onTooltipMove(event) {
	if (event.__tooltipMoved) {
		return;
	}
	event.__tooltipMoved = true;

	const tooltip = document.getElementById('ro-tooltip-party');
	if (tooltip && tooltip.style.display === 'block') {
		tooltip.style.top = `${event.clientY + 15}px`;
		tooltip.style.left = `${event.clientX + 10}px`;
	}
}

function onTooltipHide(event) {
	if (event.__tooltipHidden) {
		return;
	}
	event.__tooltipHidden = true;

	const tooltip = document.getElementById('ro-tooltip-party');
	if (tooltip) tooltip.style.display = 'none';
}

/**
 * Check if UI is locked
 */
PartyFriendsV1.isLocked = function isLocked() {
	return !!_preferences.lock;
};

/**
 * Save the current positions of all detached member windows to character-specific localStorage.
 */
PartyFriendsV1.saveDetachedMembers = function () {
	if (!Session.Character || !Session.Character.name) {
		return;
	}

	const key = `PartyFriends_${Session.Character.name}_Detached`;
	const saved = {};
	let count = 0;

	for (const aid in _detachedMembers) {
		const ext = _detachedMembers[aid];
		if (ext && ext._host) {
			saved[aid] = { x: ext._host.offsetLeft, y: ext._host.offsetTop };
			count++;
		}
	}

	localStorage.setItem(key, JSON.stringify(saved));
	if (count > 0) {
		console.log(`[PartyFriendsV1] Saved ${count} detached windows for ${Session.Character.name}`);
	}
};

/**
 * Export
 */
export default UIManager.addComponent(PartyFriendsV1);
