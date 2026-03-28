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
import jQuery from 'Utils/jquery.js';
import Preferences from 'Core/Preferences.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import Session from 'Engine/SessionStorage.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
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
const PartyFriendsV0 = new UIComponent('PartyFriendsV0', htmlText, cssText);

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
 * Initialize the component (event listener, etc.)
 */
PartyFriendsV0.init = function init() {
	// Start loading the helper
	PartyHelper.prepare();

	// Avoid drag drop problems
	this.ui.find('.base').mousedown(function (event) {
		event.stopImmediatePropagation();
		return false;
	});

	// Bind buttons
	this.ui.find('.close').click(onClose);
	this.ui.find('.lock').mousedown(onToggleLock);
	this.ui.find('.switchtab.off').mousedown(onChangeTab);
	this.ui.find('.remove').mousedown(onRequestRemoveSelection);
	this.ui.find('.privatemessage').mousedown(onRequestPrivateMessage);
	this.ui.find('.leave').mousedown(onRequestLeaveParty);
	this.ui.find('.resize').mousedown(onResize);

	this.ui.find('.mail').mousedown(onOpenMailCreationWindow);
	this.ui.find('.party.create').mousedown(onOpenPartyCreationWindow);
	this.ui.find('.party.add').mousedown(onOpenPartyInviteWindow);
	this.ui.find('.info').mousedown(onOpenPartyOptionWindow);

	this.ui.find('.content').on('contextmenu', '.node', onRightClickInfo).on('mousedown', '.node', onSelectionChange);

	this.draggable(this.ui.find('.titlebar'));
};

/**
 * Once append to the DOM, start to position the UI
 */
PartyFriendsV0.onAppend = function onAppend() {
	// Initialize the tab
	_preferences.friend = !_preferences.friend;
	onChangeTab();

	// Lock features
	if (_preferences.lock) {
		this.ui.find('.lock.on').show();
		this.ui.find('.lock.off').hide();
	} else {
		this.ui.find('.lock.on').hide();
		this.ui.find('.lock.off').show();
	}

	this.resize(_preferences.width, _preferences.height);

	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});

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

	this.ui.find('.partyname').text('');
	this.ui.find('.friendcount').text('0');
	this.ui.find('.content .party, .content .friend').empty();

	// Reset buttons
	_preferences.friend = !_preferences.friend;
	onChangeTab();
};

/**
 * Removing the UI from window, save preferences
 *
 */
PartyFriendsV0.onRemove = function onRemove() {
	// Save preferences
	_preferences.show = this.ui.is(':visible');
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();
};

/**
 * Window Shortcuts
 */
PartyFriendsV0.onShortCut = function onShurtCut(key) {
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
	// Event.which is deprecated
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
	let i,
		count = friends.length;
	const ui = this.ui.find('.content .friend');

	_friends.length = friends.length;
	ui.empty();

	for (i = 0; i < count; i++) {
		_friends[i] = friends[i];
		ui.append(
			'<div class="node' +
				(friends[i].State === 0 ? ' online' : '') +
				'">' +
				'<span class="name">' +
				jQuery.escape(friends[i].Name) +
				'</span>' +
				'</div>'
		);
	}

	this.ui.find('.friendcount').text(count);
	_index = -1;
};

/**
 * Update friend (online/offline) state
 *
 * @param {number} index
 * @param {boolean} state
 */
PartyFriendsV0.updateFriendState = function updateFriendState(index, state) {
	const node = this.ui.find('.content .friend .node:eq(' + index + ')');

	_friends[index].State = state;

	if (state) {
		node.css('backgroundImage', '');
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
		node.css('backgroundImage', 'url(' + url + ')');
	});
};

/**
 * Update/Add a friend to the list
 *
 * @param {number} index
 * @param {object} friend data
 */
PartyFriendsV0.updateFriend = function updateFriend(idx, friend) {
	// Add it
	if (!_friends[idx]) {
		_friends[idx] = {};

		this.ui.find('.content .friend').append('<div class="node">' + '<span class="name"></span>' + '</div>');

		this.ui.find('.friendcount').text(_friends.length);
	}

	_friends[idx].Name = friend.Name;
	_friends[idx].GID = friend.GID;
	_friends[idx].AID = friend.AID;
	_friends[idx].State = friend.State || 0;

	const node = this.ui.find('.content .friend .node:eq(' + idx + ')');
	node.find('.name').text(friend.Name);

	Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/grp_online.bmp', function (url) {
		node.css('backgroundImage', 'url(' + url + ')');
	});
};

/**
 * Remove friend from list
 *
 * @param {number} index
 */
PartyFriendsV0.removeFriend = function removeFriend(index) {
	_friends.splice(index, 1);
	this.ui.find('.content .friend .node:eq(' + index + ')').remove();
	this.ui.find('.friendcount').text(_friends.length);

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
	this.ui.find('.partyname').text('(' + name + ')');
	this.ui.find('.content .party').empty();
	Session.isPartyLeader = false;

	this.ui.find('.party.create').hide();
	this.ui.find('.party.leave').show();

	let i,
		count = members.length;

	_party.length = 0;
	for (i = 0; i < count; i++) {
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
	let i,
		count = _party.length;
	let node, texture, ctx;

	// Check if we are the leader
	if (player.AID === Session.AID) {
		Session.isPartyLeader = role === 0;
		if (Session.isPartyLeader) {
			this.ui.find('.party.add').show();
		} else {
			this.ui.find('.party.add').hide();
		}
	}

	// Search for duplicates entries
	for (i = 0; i < count; ++i) {
		// No GID, need to compare using charactername (wtf)
		if (_party[i].AID === player.AID && _party[i].characterName === player.characterName) {
			break;
		}
	}

	// Update
	if (i < count) {
		node = this.ui.find('.content .party .node:eq(' + i + ')');
		node.removeClass('leader online');

		if (role === 0) {
			node.addClass('leader');
		}
		if (player.state === 0) {
			node.addClass('online');
		}

		node.css('backgroundImage', '');
		node.find('.name').text(player.characterName);
		node.find('.map').text('(' + DB.getMapName(player.mapName) + ')');
	}

	// Create
	else {
		player = jQuery.extend({}, player);

		_party.push(player);
		this.ui
			.find('.content .party')
			.append(
				'<div class="node' +
					(role === 0 ? ' leader' : '') +
					(player.state === 0 ? ' online' : '') +
					'">' +
					'<span class="name">' +
					jQuery.escape(player.characterName) +
					'</span>' +
					'<span class="map">(' +
					jQuery.escape(DB.getMapName(player.mapName)) +
					')</span>' +
					'<canvas class="life" width="60" height="5"></canvas> <span class="hp"></span>' +
					'</div>'
			);

		node = this.ui.find('.content .party .node:eq(' + i + ')');
	}

	ctx = node.find('canvas').get(0).getContext('2d');
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	node.find('.hp').text('');

	// Update life
	if (player.life && player.life.display) {
		ctx.drawImage(player.life.canvas, 0, 0, 60, 5, 0, 0, 60, 5);
		node.find('.hp').text(player.life.hp + '/' + player.life.hp_max);
	}

	// Add texture
	texture = role === 0 && player.state === 0 ? 'grp_leader.bmp' : player.state === 0 ? 'grp_online.bmp' : '';
	if (texture) {
		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/' + texture, function (url) {
			node.css('backgroundImage', 'url(' + url + ')');
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
	if (AID === Session.AID) {
		_party.length = 0;

		this.ui.find('.content .party').empty();
		this.ui.find('.partyname').text('');
		this.ui.find('.party.create').show();
		this.ui.find('.party.leave, .party.add').hide();

		ChatBox.addText(DB.getMessage(84), ChatBox.TYPE.BLUE, ChatBox.FILTER.PARTY_SETUP);
		return;
	}

	let i,
		count = _party.length;

	for (i = 0; i < count; ++i) {
		// Why Gravity doesn't send the GID ? Meaning we can't have the same
		// character name twice (even in the same account).
		if (_party[i].AID === AID && _party[i].characterName === characterName) {
			_party.splice(i, 1);
			this.ui.find('.content .party .node:eq(' + i + ')').remove();
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

	this.ui.find('.content').css({
		width: width * 20,
		height: height * 20
	});
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
	let i,
		count = _party.length;
	let node, ctx;

	for (i = 0; i < count; ++i) {
		// No GID data, so have to check for the online character in
		// the account (since we can have multiple players in a team
		// using the same account).
		if (_party[i].AID === AID && _party[i].state === 0) {
			node = this.ui.find('.content .party .node:eq(' + i + ')');
			ctx = node.find('canvas').get(0).getContext('2d');

			ctx.drawImage(canvas, 0, 0, 60, 5, 0, 0, 60, 5);
			node.find('.hp').text(hp + '/' + maxhp);
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
		// No GID, need to compare using charactername (wtf)
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
	const ui = PartyFriendsV0.ui;
	const top = ui.position().top;
	const left = ui.position().left;
	let lastWidth = 0;
	let lastHeight = 0;
	let _Interval;

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
	_Interval = setInterval(resizing, 30);

	// Stop resizing on left click
	jQuery(window).on('mouseup.resize', function (event) {
		if (event.which === 1) {
			clearInterval(_Interval);
			jQuery(window).off('mouseup.resize');
		}
	});
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

	if (_preferences.lock) {
		PartyFriendsV0.ui.find('.lock.on').show();
		PartyFriendsV0.ui.find('.lock.off').hide();
	} else {
		PartyFriendsV0.ui.find('.lock.on').hide();
		PartyFriendsV0.ui.find('.lock.off').show();
	}
}

/**
 * Move to the other tab (Friend -> Party or Party -> Friend)
 */
function onChangeTab() {
	const ui = PartyFriendsV0.ui;

	_preferences.friend = !_preferences.friend;
	_preferences.save();

	// Initialize the tab
	if (_preferences.friend) {
		ui.find('.friend').show();
		ui.find('.party').hide();
	} else {
		ui.find('.friend').hide();
		ui.find('.party').show();

		if (Session.hasParty) {
			ui.find('.party.create').hide();

			if (!Session.isPartyLeader) {
				ui.find('.party.add').hide();
			}
		} else {
			ui.find('.party.add, .party.leave').hide();
		}
	}

	ui.find('.node').removeClass('selection');
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
	UIManager.showPromptBox(text, 'ok', 'cancel', function () {
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

	ChatBox.ui.find('.username').val(name);
	ChatBox.ui.find('.message').select();
}

/**
 * Add nick name to chatbox while clicking on player character sprite
 */
PartyFriendsV0.onOpenChat1to1 = function onOpenChat1to1(name) {
	if (PACKETVER.value >= 20090617) {
		WhisperBox.show(name);
		return;
	}

	ChatBox.ui.find('.username').val(name);
	ChatBox.ui.find('.message').select();
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
 * (Not implemented yet in official client)
 */
function onRequestInformation() {
	if (_preferences.lock) {
		return;
	}

	// Not implemented yet
	UIManager.showMessageBox(DB.getMessage(191), 'ok');
}

/**
 * Request to leave a party
 */
function onRequestLeaveParty() {
	if (_preferences.lock) {
		return;
	}

	// Are you sure that you want to leave ?
	UIManager.showPromptBox(DB.getMessage(357), 'ok', 'cancel', function () {
		PartyFriendsV0.onRequestLeave();
	});
}

/**
 * Request to change party leader
 * (need to be the leader)
 */
function onRequestPartyDelegation() {
	if (_preferences.lock) {
		return;
	}

	// Do you want to delegate the real party?
	UIManager.showPromptBox(DB.getMessage(1532), 'ok', 'cancel', function () {
		PartyFriendsV0.onRequestChangeLeader(_party[_index].AID);
	});
}

/**
 * Change selection (click on a friend/party)
 */
function onSelectionChange(event) {
	PartyFriendsV0.ui.find('.content .name').removeClass('selection');
	const node = jQuery(this);
	node.find('.name').addClass('selection');

	_index = PartyFriendsV0.ui.find(this.parentNode).find('.node').index(this);

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
 * Internal functions to manage the windows
 */

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
	Mail.append();
}

/**
 * Storing Requirement
 */
export default UIManager.addComponent(PartyFriendsV0);
