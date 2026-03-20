/**
 * UI/Components/PartyFriends/PartyFriendsV1/PartyFriendsV1.js
 *
 * Manage interface for parties and friends
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var jQuery = require('Utils/jquery');
	var Preferences = require('Core/Preferences');
	var MonsterTable = require('DB/Monsters/MonsterTable');
	var Client = require('Core/Client');
	var Renderer = require('Renderer/Renderer');
	var Session = require('Engine/SessionStorage');
	var Mouse = require('Controls/MouseEventHandler');
	var KEYS = require('Controls/KeyEventHandler');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var PartyHelper = require('../PartyHelper/PartyHelper');
	var ContextMenu = require('UI/Components/ContextMenu/ContextMenu');
	var Rodex = require('UI/Components/Rodex/Rodex');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var htmlText = require('text!./PartyFriendsV1.html');
	var cssText = require('text!./PartyFriendsV1.css');
	var getModule = require;

	/**
	 * Create Component
	 */
	var PartyFriendsV1 = new UIComponent('PartyFriendsV1', htmlText, cssText);
	var PartyMemberExternal = require('../PartyMemberExternal/PartyMemberExternal');
	var _detachedMembers = {}; // Map of AID -> Component

	/**
	 * @var {number} index of selection
	 */
	var _index = -1;

	/**
	 * @var {Array} friends list
	 */
	var _friends = [];

	/**
	 * @var {Array} party list
	 */
	var _party = [];

	/**
	 * @var {Object} party setup
	 */
	var _options = {
		exp_share: 0,
		item_share: 0,
		item_sharing_type: 0
	};

	/**
	 * @var {Object} Local cache for restored positions to avoid redundant localStorage reads.
	 * Persists for the lifetime of the session.
	 */
	var _savedPositions = null;

	/**
	 * @var {boolean} Set to true by clean() (logout/restart) so onRemove skips saving
	 * detached positions — clean() already cleared _detachedMembers to {} so we
	 * must not overwrite localStorage with an empty object.
	 */
	var _skipSaveOnRemove = false;

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
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
	 * Initialize the component (event listener, etc.)
	 */
	PartyFriendsV1.init = function init() {
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
		this.ui.find('.party.sort').mousedown(sortDetachedMembers);

		this.ui
			.find('.content')
			.on('contextmenu', '.node', onRightClickInfo)
			.on('mousedown', '.node', onMemberMouseDown)
			.on('mouseover', '[data-tooltip]', onTooltipShow)
			.on('mousemove', '[data-tooltip]', onTooltipMove)
			.on('mouseout', '[data-tooltip]', onTooltipHide);

		this.draggable(this.ui.find('.titlebar'));

		// Save external window position when dragging ends
		// If another window already exists at the new position, they swap.
		PartyMemberExternal.onDragEnd = function (movedComponent) {
			var pos = movedComponent.ui.position();
			var oldPos = movedComponent._lastPos;

			if (oldPos) {
				for (var aid in _detachedMembers) {
					var other = _detachedMembers[aid];
					if (other && other !== movedComponent && other.ui) {
						var otherPos = other.ui.position();
						// Check if they are at the same grid anchor (using a small 5px tolerance)
						if (Math.abs(otherPos.left - pos.left) < 5 && Math.abs(otherPos.top - pos.top) < 5) {
							// Swap: Move the existing window to the newly moved window's old position
							other.ui.css({
								left: oldPos.left,
								top: oldPos.top
							});
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
		// Right clicks (which=3) are allowed to bubble for camera rotation (matches game client)
		if (event.which === 1) {
			event.stopPropagation();
		} else {
			return;
		}

		var node = jQuery(this);
		var AID = node.data('aid');

		// Suppress native drag and text selection
		event.preventDefault();

		// Selection change immediately on mousedown
		onSelectionChange.call(this, event);

		var player = null;
		for (var i = 0; i < _party.length; i++) {
			if (_party[i].AID == AID) {
				player = _party[i];
				break;
			}
		}

		if (!player) {
			return;
		}

		// Handle Skill Targeting (move this BEFORE detached check)
		var SkillTargetSelection = getModule('UI/Components/SkillTargetSelection/SkillTargetSelection');
		if (SkillTargetSelection && SkillTargetSelection.__active && !_preferences.friend) {
			if (player.state === 0) {
				SkillTargetSelection.intersectEntityId(player.AID);
			}
			SkillTargetSelection.remove();
			return false;
		}

		// Block ONLY dragging if already detached (keep selection and skill targeting working above)
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

		var startX = event.pageX;
		var startY = event.pageY;
		var isDragging = false;
		var threshold = 5;
		var ghostWrapper = null;
		var ghostInner = null;

		// Clean up any stale handlers
		jQuery(window).off('.peeloff');

		jQuery(window).on('mousemove.peeloff', function (moveEvent) {
			if (!isDragging) {
				if (Math.abs(moveEvent.pageX - startX) > threshold || Math.abs(moveEvent.pageY - startY) > threshold) {
					isDragging = true;

					var ContextMenu = getModule('UI/Components/ContextMenu/ContextMenu');
					if (ContextMenu) {
						ContextMenu.remove();
					}

					// Create screen-wide drag shield so events DO NOT hit the canvas/game world underneath
					ghostWrapper = jQuery(
						'<div class="drag-shield" style="position:fixed; top:0; left:0; right:0; bottom:0; z-index:10000; background:transparent; cursor:grabbing;">' +
							'<div id="PartyFriends" class="drag-ghost-wrapper" style="position:absolute; pointer-events:none; opacity:0.6; background:none !important; border:none !important; height:auto !important; width:auto !important;">' +
							'<div class="content" style="background:none !important; height:auto !important; width:auto !important;">' +
							'<div class="party info-v2"></div></div></div></div>'
					).appendTo('body');

					ghostInner = ghostWrapper.find('.drag-ghost-wrapper');

					var ghostContent = node.clone();
					ghostInner.find('.party').append(ghostContent);

					// Canvas content isn't cloned, redraw if possible
					var srcCanvas = node.find('canvas')[0];
					var dstCanvas = ghostContent.find('canvas')[0];
					if (srcCanvas && dstCanvas) {
						dstCanvas.width = srcCanvas.width;
						dstCanvas.height = srcCanvas.height;
						dstCanvas.getContext('2d').drawImage(srcCanvas, 0, 0);
					}

					ghostInner.css({
						width: node.outerWidth(),
						height: node.outerHeight()
					});
				}
			}

			if (isDragging && ghostInner) {
				ghostInner.css({
					left: moveEvent.clientX - (startX - node.offset().left),
					top: moveEvent.clientY - (startY - node.offset().top)
				});
				// Prevent selection or native drag while custom dragging
				moveEvent.preventDefault();
			}
		});

		jQuery(window).on('mouseup.peeloff', function (upEvent) {
			jQuery(window).off('mousemove.peeloff mouseup.peeloff');

			if (ghostWrapper) {
				ghostWrapper.remove();
				ghostWrapper = null;
				ghostInner = null;
			}

			if (isDragging) {
				upEvent.stopImmediatePropagation();

				var ui = PartyFriendsV1.ui;
				var offset = ui.offset();
				var x = upEvent.pageX;
				var y = upEvent.pageY;

				// Check if dropped outside (with a small 10px buffer)
				if (
					x < offset.left - 10 ||
					x > offset.left + ui.width() + 10 ||
					y < offset.top - 10 ||
					y > offset.top + ui.height() + 10
				) {
					detachMember(AID, player, x, y);
					PartyFriendsV1.saveDetachedMembers();
				}
			}
		});
	}

	/**
	 * Find the next available slot for a detached member window.
	 * Starts from left: 0, top: 100 and stacks vertically.
	 */
	function getNextAvailableSlot() {
		var startX = 0;
		var startY = 100;
		var stepY = 38 + 10; // external window height (38px) + gap (10px)
		var currentY = startY;

		// Simple search: check if any detached member is overlapping with the candidate Y coordinate at X=0
		var found = true;
		while (found) {
			found = false;
			for (var aid in _detachedMembers) {
				var ext = _detachedMembers[aid];
				if (ext && ext.ui) {
					var pos = ext.ui.position();
					// If there's an existing window at this exact X and Y, move to the next slot
					if (Math.abs(pos.left - startX) < 5 && Math.abs(pos.top - currentY) < 5) {
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
	 * Position all detached members into a neat vertical stack starting at (0, 100)
	 * ordered by the current party list.
	 */
	function sortDetachedMembers() {
		var startX = 0;
		var startY = 100;
		var stepY = 38 + 10;
		var currentY = startY;

		// Iterate through the party list to maintain their order
		for (var i = 0, count = _party.length; i < count; i++) {
			var player = _party[i];
			var external = _detachedMembers[player.AID];

			if (external && external.ui) {
				external.ui.css({
					left: startX,
					top: currentY
				});
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

		var external = PartyMemberExternal.clone('PartyMemberExternal_' + AID, true);
		external.name = 'PartyMemberExternal_' + AID; // Fix clone name overwrite
		UIManager.addComponent(external);

		// Cleanup external window and refresh party list
		external.onRemove = function () {
			delete _detachedMembers[AID];
			delete UIManager.components[external.name];
			jQuery('#ro-tooltip-party').removeClass('show');
			PartyFriendsV1.refreshPartyList();
		};

		external.setMember(AID, player);
		external.append();

		var initX = x - 75;
		var initY = y - 19;

		if (restorePos) {
			initX = restorePos.x;
			initY = restorePos.y;
		} else {
			// All initial detaches (dragging out or menu) snap to the next available slot in the stack
			var slot = getNextAvailableSlot();
			initX = slot.x;
			initY = slot.y;
		}

		external.ui.css({
			left: initX,
			top: initY
		});

		_detachedMembers[AID] = external;
		PartyFriendsV1.refreshPartyList();
	}

	/**
	 * Refresh the party list rendering
	 */
	PartyFriendsV1.refreshPartyList = function refreshPartyList() {
		var ui = this.ui.find('.content .party');
		ui.empty();

		for (var i = 0; i < _party.length; i++) {
			this.renderPartyMember(_party[i]);
		}

		this.ui.find('.count-box .inner-count').text(_party.length + '/12');
	};

	/**
	 * Once append to the DOM, start to position the UI
	 */
	PartyFriendsV1.onAppend = function onAppend() {
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

		// Load footer background
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/bg_partymember.bmp', function (url) {
			PartyFriendsV1.ui.find('.count-box').css({
				backgroundImage: 'url(' + url + ')'
			});
		});

		if (!_preferences.show) {
			this.ui.hide();
		}

		// Restore detached members for same-map teleports (no ZC_GROUP_LIST sent)
		for (var i = 0; i < _party.length; i++) {
			restoreDetachedMember(_party[i]);
		}
	};

	/**
	 * Clean up UI
	 */
	PartyFriendsV1.clean = function clean() {
		_party.length = 0;
		_friends.length = 0;

		// Remove detached windows; skip overwriting positions on logout
		_skipSaveOnRemove = true;
		for (var aid in _detachedMembers) {
			if (_detachedMembers[aid]) {
				_detachedMembers[aid].remove();
			}
		}
		_detachedMembers = {};
		_savedPositions = null;

		_options.exp_share = 0;
		_options.item_share = 0;
		_options.item_sharing_type = 0;

		this.ui.find('.partyname').text('');
		this.ui.find('.friendcount').text('0');
		this.ui.find('.content .party, .content .friend').empty();

		this.ui.find('.count-box .inner-count').text('0/12');

		// Reset buttons
		_preferences.friend = !_preferences.friend;
		onChangeTab();
	};

	/**
	 * Removing the UI from window, save preferences
	 *
	 */
	PartyFriendsV1.onRemove = function onRemove() {
		// Save preferences
		_preferences.show = this.ui.is(':visible');
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.save();

		// Save detached window positions on map transition (skip on logout)
		if (!_skipSaveOnRemove && Object.keys(_detachedMembers).length > 0) {
			this.saveDetachedMembers();
		}
		_skipSaveOnRemove = false;

		// Invalidate position cache
		_savedPositions = null;

		// Force hide any wandering tooltips
		jQuery('#ro-tooltip-party').removeClass('show');
	};

	/**
	 * Window Shortcuts
	 */
	PartyFriendsV1.onShortCut = function onShurtCut(key) {
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
	PartyFriendsV1.toggle = function toggle() {
		this.ui.toggle();

		if (this.ui.is(':visible')) {
			this.focus();
		}
	};

	PartyFriendsV1.onKeyDown = function onKeyDown(event) {
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
	PartyFriendsV1.setFriends = function setFriends(friends) {
		var i,
			count = friends.length;
		var ui = this.ui.find('.content .friend');

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
	PartyFriendsV1.updateFriendState = function updateFriendState(index, state) {
		var node = this.ui.find('.content .friend .node:eq(' + index + ')');

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
	PartyFriendsV1.updateFriend = function updateFriend(idx, friend) {
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

		var node = this.ui.find('.content .friend .node:eq(' + idx + ')');
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
	PartyFriendsV1.removeFriend = function removeFriend(index) {
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
	PartyFriendsV1.setParty = function setParty(name, members) {
		this.ui.find('.partyname').text('(' + name + ')');
		this.ui.find('.content .party').empty();
		Session.isPartyLeader = false;

		this.ui.find('.party.create').hide();
		this.ui.find('.party.leave').show();

		var i,
			count = members.length;
		_party.length = 0;

		for (i = 0; i < count; i++) {
			PartyFriendsV1.addPartyMember(members[i]);
		}

		// Garbage Collection: Remove windows for members who left the party
		var removedCount = 0;
		for (var aid in _detachedMembers) {
			var foundInPacket = false;
			for (i = 0; i < count; i++) {
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
			console.log('[PartyFriendsV1] Cleaned up ' + removedCount + ' orphaned detached windows');
		}
	};

	/**
	 * Helper to restore a detached member from saved layout.
	 * @param {object} player
	 */
	function restoreDetachedMember(player) {
		if (_detachedMembers[player.AID]) {
			return;
		}

		if (!Session.Character || !Session.Character.name) {
			return;
		}

		if (_savedPositions === null) {
			var key = 'PartyFriends_' + Session.Character.name + '_Detached';
			var savedStr = localStorage.getItem(key);
			_savedPositions = {};
			try {
				if (savedStr) {
					_savedPositions = JSON.parse(savedStr);
				}
			} catch (e) {
				console.error('[PartyFriendsV1] Failed to parse saved detached members:', e);
			}
		}

		var entry = _savedPositions[player.AID] || _savedPositions[String(player.AID)];
		if (entry) {
			detachMember(player.AID, player, null, null, entry);
		}
	}

	/**
	 * Helper to update the HP bar on a canvas
	 * @param {jQuery} node
	 * @param {number} hp
	 * @param {number} maxhp
	 */
	function updateCanvasLife(node, hp, maxhp) {
		var hasLife = hp !== undefined && maxhp !== undefined && maxhp > 0;
		var lifeRatio = hasLife ? hp / maxhp : 0;
		var barVisibility = hasLife ? 'visible' : 'hidden';

		node.find('.hp-bar-container, .hp').css('visibility', barVisibility);

		if (hasLife) {
			var canvas = node.find('canvas').get(0);
			if (canvas) {
				var ctx = canvas.getContext('2d');
				var width = Math.floor(lifeRatio * 75);
				canvas.width = 75;
				canvas.height = 5;
				ctx.clearRect(0, 0, 75, 5);
				ctx.fillStyle = lifeRatio <= 0.25 ? '#ef1010' : '#32cd32';
				ctx.fillRect(0, 0, width, 5);
			}
			node.find('.hp').text(hp + '/' + maxhp);
		} else {
			node.find('.hp').text('');
		}
	}

	/**
	 * Add a new party member to the list
	 *
	 * @param {object} player information
	 */
	PartyFriendsV1.addPartyMember = function addPartyMember(player) {
		var role = player.role || player.Role || 0;
		var i,
			count = _party.length;

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
			if (_party[i].AID === player.AID || _party[i].characterName === player.characterName) {
				break;
			}
		}

		if (i < count) {
			var prevLevel = _party[i].baseLevel || _party[i].level || _party[i].Level;
			var prevClass = _party[i].class_ || _party[i].job || _party[i].Job;
			_party[i] = jQuery.extend(_party[i], player);
			// Preserve previously known level/class if the new packet doesn't carry them
			// (e.g. GROUP_LIST 0xfb has no level or class fields — baseLevel would be 0/undefined)
			if (!(_party[i].baseLevel || _party[i].level || _party[i].Level) && prevLevel) {
				_party[i].baseLevel = prevLevel;
			}
			if (!(_party[i].class_ || _party[i].job || _party[i].Job) && prevClass) {
				_party[i].class_ = prevClass;
			}
			player = _party[i];
		} else {
			player = jQuery.extend({}, player);
			_party.push(player);
		}

		// Update member count
		this.ui.find('.count-box .inner-count').text(_party.length + '/12');

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
	 * @param {object} player
	 */
	PartyFriendsV1.renderPartyMember = function renderPartyMember(player) {
		var role = player.role || player.Role || 0;
		var job = player.class_ || player.job || player.Job || 0;
		var level = player.baseLevel || player.level || player.Level || 0;
		var isDead = !!player.isDead;
		var isOnline = player.state === 0;
		var isDetached = !!_detachedMembers[player.AID];

		var jobName = MonsterTable[job] || 'Unknown';
		var mapDisplay = DB.getMapName(player.mapName);

		// Get color from MiniMap
		var MiniMap = getModule('UI/Components/MiniMap/MiniMap');
		var color = MiniMap && MiniMap.getMemberColor ? MiniMap.getMemberColor(player.AID) : 'white';
		player.color = color;

		var nameTooltip = player.characterName + ' (' + mapDisplay + ')';

		var hasLife = !!(player.life && player.life.display);
		// Use visibility (not display) so bar always occupies space, keeping status icon in a fixed position
		var barVisibility = hasLife ? 'visible' : 'hidden';

		var memberColor = isOnline ? player.color || '#333' : '#848ca5';

		var html =
			'<div class="node' +
			(role === 0 ? ' leader' : '') +
			(isOnline ? ' online' : '') +
			(isDetached ? ' detached' : '') +
			'" style="background-color: ' +
			(isDetached ? '#deefff' : 'white') +
			';" data-aid="' +
			player.AID +
			'" data-tooltip="' +
			(isOnline ? jQuery.escape(nameTooltip) : '') +
			'">' +
			'<div class="job-icon-container" data-tooltip="' +
			jQuery.escape(jobName) +
			'">' +
			'<div class="job-icon"></div>' +
			'<div class="crown"></div>' +
			'</div>' +
			'<div class="info-container">' +
			'<div class="row1">' +
			'<span class="level">Lv. ' +
			level +
			'</span>' +
			'<span class="name" style="color: ' +
			memberColor +
			';">' +
			jQuery.escape(player.characterName) +
			'</span>' +
			'<span class="map" style="color: ' +
			memberColor +
			';">(' +
			jQuery.escape(mapDisplay) +
			')</span>' +
			'</div>' +
			'<div class="row2">' +
			'<div class="hp-bar-container" style="visibility:' +
			barVisibility +
			'">' +
			'<canvas class="life" width="75" height="5"></canvas>' +
			'</div>' +
			'<span class="hp" style="visibility:' +
			barVisibility +
			'"></span>' +
			'<div class="status-icon"></div>' +
			'</div>' +
			'</div>' +
			'</div>';

		var node = this.ui.find('.content .party .node[data-aid="' + player.AID + '"]');
		if (node.length) {
			node.replaceWith(html);
			node = this.ui.find('.content .party .node[data-aid="' + player.AID + '"]');
		} else {
			this.ui.find('.content .party').append(html);
			node = this.ui.find('.content .party .node:last');
		}

		// Load Job Icon
		Client.loadFile(
			DB.INTERFACE_PATH + 'renewalparty/icon_jobs_' + job + (isDead ? '_die' : '') + '.bmp',
			function (url) {
				node.find('.job-icon').css('backgroundImage', 'url(' + url + ')');
			}
		);

		// Load Crown
		if (role === 0) {
			Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/ico_partycrown.bmp', function (url) {
				node.find('.crown').css('backgroundImage', 'url(' + url + ')');
			});
		}

		// Load Status Icon
		var statusFile = 'icon_party_' + (player.AID == Session.AID ? 'me.bmp' : isOnline ? 'on.bmp' : 'off.bmp');
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/' + statusFile, function (url) {
			node.find('.status-icon').css('backgroundImage', 'url(' + url + ')');
		});

		// Draw HP bar if life data is available
		updateCanvasLife(node, hasLife ? player.life.hp : undefined, hasLife ? player.life.hp_max : undefined);
	};

	/**
	 * Remove a character from list
	 *
	 * @param {number} account id
	 * @param {string} character name
	 */
	PartyFriendsV1.removePartyMember = function removePartyMember(AID, characterName) {
		if (AID === Session.AID) {
			// Remove all detached external windows
			for (var aid in _detachedMembers) {
				if (_detachedMembers[aid]) {
					// Prevent onRemove from clearing preferences during global cleanup
					_detachedMembers[aid].onRemove = function () {
						delete UIManager.components[this.name];
					};
					_detachedMembers[aid].remove();
				}
			}
			_detachedMembers = {};

			_party.length = 0;

			this.ui.find('.content .party').empty();
			this.ui.find('.partyname').text('');
			this.ui.find('.party.create').show();
			this.ui.find('.party.leave, .party.add').hide();

			ChatBox.addText(DB.getMessage(84), ChatBox.TYPE.BLUE, ChatBox.FILTER.PARTY_SETUP);
			return;
		}

		var i,
			count = _party.length;

		for (i = 0; i < count; ++i) {
			// Why Gravity doesn't send the GID ? Meaning we can't have the same
			// character name twice (even in the same account).
			if (_party[i].AID === AID && _party[i].characterName === characterName) {
				_party.splice(i, 1);
				this.ui.find('.content .party .node:eq(' + i + ')').remove();
				this.ui.find('.count-box .inner-count').text(_party.length + '/12');

				// Clean up detached external window if present
				if (_detachedMembers[AID]) {
					_detachedMembers[AID].remove();
					// onRemove hook will handle delete + saveDetachedMembers
				}

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
	PartyFriendsV1.resize = function resize(width, height) {
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
	 * Update player dead/alive state (separate from online/offline)
	 *
	 * @param {number} AID - account id
	 * @param {boolean} isDead - true if the member has died
	 */
	PartyFriendsV1.updateMemberDead = function updateMemberDead(AID, isDead) {
		var i,
			count = _party.length;
		var player = null;

		for (i = 0; i < count; ++i) {
			if (_party[i].AID === AID) {
				_party[i].isDead = isDead;
				player = _party[i];
				this.renderPartyMember(player);
				break;
			}
		}

		// Sync to detached external window if present
		if (player && _detachedMembers[AID]) {
			_detachedMembers[AID].setMember(AID, player);
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
	PartyFriendsV1.updateMemberLife = function updateMemberLife(AID, canvas, hp, maxhp) {
		var i,
			count = _party.length;

		// Update internal list
		for (i = 0; i < count; ++i) {
			if (_party[i].AID === AID) {
				if (!_party[i].life) {
					_party[i].life = {};
				}
				_party[i].life.hp = hp;
				_party[i].life.hp_max = maxhp;
				_party[i].life.display = true;

				// Handle death state fallback (uses isDead, not state, to avoid overwriting online/offline)
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

		// Update external window
		if (_detachedMembers[AID]) {
			_detachedMembers[AID].updateMemberLife(hp, maxhp);
		}

		// Update main UI node if it exists
		var node = this.ui.find('.content .party .node[data-aid="' + AID + '"]');
		if (node.length) {
			updateCanvasLife(node, hp, maxhp);
		}
	};

	/**
	 * Update party options
	 *
	 * @param {boolean} exp share option
	 * @param {boolean} item share option
	 * @param {boolean} item sharing option
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
	 *
	 * @param {string} character name
	 */
	PartyFriendsV1.isGroupMember = function isGroupMember(characterName) {
		var count = _party.length;
		for (var i = 0; i < count; ++i) {
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
		var top = PartyFriendsV1.ui.position().top;
		var left = PartyFriendsV1.ui.position().left;
		var lastWidth = 0;
		var lastHeight = 0;
		var _Interval;

		function resizing() {
			var extraX = -20;
			var extraY = 25 + 21;

			var w = Math.floor((Mouse.screen.x - left - extraX) / 20);
			var h = Math.floor((Mouse.screen.y - top - extraY) / 20);

			// Maximum and minimum window size
			w = Math.min(Math.max(w, 12), 13);
			h = Math.min(Math.max(h, 6), 12);

			if (w === lastWidth && h === lastHeight) {
				return;
			}

			PartyFriendsV1.resize(w, h);
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
		PartyFriendsV1.ui.hide();
	}

	/**
	 * Enable or disable the lock features
	 */
	function onToggleLock() {
		_preferences.lock = !_preferences.lock;
		_preferences.save();

		if (_preferences.lock) {
			PartyFriendsV1.ui.find('.lock.on').show();
			PartyFriendsV1.ui.find('.lock.off').hide();
		} else {
			PartyFriendsV1.ui.find('.lock.on').hide();
			PartyFriendsV1.ui.find('.lock.off').show();
		}
	}

	/**
	 * Move to the other tab (Friend -> Party or Party -> Friend)
	 */
	function onChangeTab() {
		var ui = PartyFriendsV1.ui;

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

		var text = _preferences.friend ? DB.getMessage(356) : DB.getMessage(363);

		// Are you sure that you want to delete/expel ?
		UIManager.showPromptBox(text, 'ok', 'cancel', function () {
			if (_preferences.friend) {
				PartyFriendsV1.onRemoveFriend(_index);
			} else {
				PartyFriendsV1.onExpelMember(_party[_index].AID, _party[_index].characterName);
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

		if (_preferences.friend) {
			ChatBox.ui.find('.username').val(_friends[_index].Name);
		} else {
			ChatBox.ui.find('.username').val(_party[_index].characterName);
		}

		ChatBox.ui.find('.message').select();
	}

	/**
	 * Add nick name to chatbox while clicking on player character sprite
	 */
	PartyFriendsV1.onOpenChat1to1 = function onOpenChat1to1(name) {
		ChatBox.ui.find('.username').val(name);
		ChatBox.ui.find('.message').select();
	};

	/**
	 * Right click on a character
	 */
	function onRightClickInfo(event) {
		if (event) {
			event.stopImmediatePropagation();
			event.preventDefault();
		}

		// Ensure camera stops rotation when opening a menu (fix for stuck right drag)
		var Camera = getModule('Renderer/Camera');
		if (Camera && Camera.rotate) {
			Camera.rotate(false);
		}

		if (_preferences.lock) {
			return false;
		}

		// Update selection to the right-clicked node
		onSelectionChange.call(this, event);

		if (_index < 0) {
			return false;
		}

		ContextMenu.remove();
		ContextMenu.append();

		if (_preferences.friend) {
			var friend = _friends[_index];
			if (!friend) {
				return false;
			}

			ContextMenu.addElement(DB.getMessage(360), onRequestPrivateMessage);
			if (friend.GID !== Session.GID) {
				ContextMenu.addElement(DB.getMessage(351), onRequestRemoveSelection);
			}
		} else {
			var player = _party[_index];
			if (!player) {
				return false;
			}

			var isMe = player.AID === Session.AID;
			var isLeader = Session.isPartyLeader;
			var isOnline = player.state === 0;

			// All party members (including self) have "Send Message" (Mail)
			ContextMenu.addElement(DB.getMessage(98), onOpenMailCreationWindow);

			if (isMe) {
				// Self: Leave party
				ContextMenu.addElement(DB.getMessage(2055), onRequestLeaveParty);
			} else {
				// Others: 1:1 Chat
				ContextMenu.addElement(DB.getMessage(360), onRequestPrivateMessage);

				// Leader only: Expel and Assign Leader
				if (isLeader) {
					ContextMenu.addElement(DB.getMessage(97), onRequestRemoveSelection);
					ContextMenu.addElement(DB.getMessage(1532), onRequestPartyDelegation);
				}
			}

			// Online members (including self): Detach options
			if (isOnline) {
				ContextMenu.addElement(DB.getMessage(3101), function () {
					detachMember(player.AID, player, Mouse.screen.x, Mouse.screen.y);
					PartyFriendsV1.saveDetachedMembers();
				});
				ContextMenu.addElement(DB.getMessage(3102), function () {
					if (_detachedMembers[player.AID]) {
						_detachedMembers[player.AID].remove();
						PartyFriendsV1.saveDetachedMembers();
					}
				});
			}
		}

		return false;
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
			PartyFriendsV1.onRequestLeave();
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
			PartyFriendsV1.onRequestChangeLeader(_party[_index].AID);
		});
	}

	/**
	 * Change selection (click on a friend/party)
	 */
	function onSelectionChange(event) {
		PartyFriendsV1.ui.find('.node').removeClass('selection');
		var node = jQuery(this);
		node.addClass('selection');

		var AID = node.data('aid');
		_index = -1;

		if (_preferences.friend) {
			_index = PartyFriendsV1.ui.find(this.parentNode).find('.node').index(this);
		} else {
			for (var i = 0, count = _party.length; i < count; i++) {
				if (_party[i].AID == AID) {
					_index = i;
					break;
				}
			}
		}
	}

	/**
	 * Request to create a team (open the window)
	 */
	function onOpenMailCreationWindow() {
		if (_preferences.lock) {
			return;
		}

		var recipient = '';
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
	 * Custom RO-style tooltips
	 */
	function onTooltipShow(event) {
		if (event.__tooltipHandled) {
			return;
		}
		event.__tooltipHandled = true;

		var text = jQuery(this).attr('data-tooltip');
		if (text) {
			var tooltip = jQuery('#ro-tooltip-party');
			if (!tooltip.length) {
				tooltip = jQuery('<div id="ro-tooltip-party" class="ro-tooltip"></div>').appendTo('body');
			}
			tooltip.text(text).addClass('show');
		}
	}

	function onTooltipMove(event) {
		if (event.__tooltipMoved) {
			return;
		}
		event.__tooltipMoved = true;

		var tooltip = jQuery('#ro-tooltip-party');
		if (tooltip.hasClass('show')) {
			tooltip.css({
				top: event.clientY + 15,
				left: event.clientX + 10
			});
		}
	}

	function onTooltipHide(event) {
		if (event.__tooltipHidden) {
			return;
		}
		event.__tooltipHidden = true;

		jQuery('#ro-tooltip-party').removeClass('show');
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

		// Guard: If we have no party members in memory, don't overwrite with empty list
		// (unless we are explicitly leaving the party)
		if (!Session.hasParty && Object.keys(_detachedMembers).length === 0) {
			return;
		}

		var key = 'PartyFriends_' + Session.Character.name + '_Detached';
		var saved = {};
		var count = 0;

		for (var aid in _detachedMembers) {
			var ext = _detachedMembers[aid];
			if (ext && ext.ui) {
				var pos = ext.ui.position();
				saved[aid] = { x: pos.left, y: pos.top };
				count++;
			}
		}

		localStorage.setItem(key, JSON.stringify(saved));
		if (count > 0) {
			console.log('[PartyFriendsV1] Saved ' + count + ' detached windows for ' + Session.Character.name);
		}
	};

	/**
	 * Export
	 */
	return UIManager.addComponent(PartyFriendsV1);
});
