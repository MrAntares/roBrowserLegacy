/**
 * UI/Components/PartyFriends/PartyMemberExternal/PartyMemberExternal.js
 *
 * Floating mini-window for a single party member.
 *
 */

import jQuery from 'Utils/jquery.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './PartyMemberExternal.html?raw';
import cssText from './PartyMemberExternal.css?raw';
import ContextMenu from 'UI/Components/ContextMenu/ContextMenu.js';
import SkillTargetSelection from 'UI/Components/SkillTargetSelection/SkillTargetSelection.js';
import PartyFriendsV1 from 'UI/Components/PartyFriends/PartyFriendsV1/PartyFriendsV1.js';
import Camera from 'Renderer/Camera.js';
import Rodex from 'UI/Components/Rodex/Rodex.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import Session from 'Engine/SessionStorage.js';
import WhisperBox from 'UI/Components/WhisperBox/WhisperBox.js';
import PartyFriends from 'UI/Components/PartyFriends/PartyFriends.js';

/**
 * Create Component
 */
const PartyMemberExternal = new UIComponent('PartyMemberExternal', htmlText, cssText);

// No module-level variables for state!

/**
 * Initialize the component
 */
PartyMemberExternal.init = function init() {
	const self = this;

	this.ui.on('mousedown', function (event) {
		self._lastPos = self.ui.position();
		event.preventDefault();
		event.stopPropagation();

		if (ContextMenu) {
			ContextMenu.remove();
		}

		if (SkillTargetSelection && SkillTargetSelection.__active) {
			if (event.which === 1 && self._player && self._player.state === 0) {
				SkillTargetSelection.intersectEntityId(self._aid);
			}
			SkillTargetSelection.remove();
			event.stopImmediatePropagation();
			return;
		}

		// Block dragging when UI is locked
		if (PartyFriendsV1 && PartyFriendsV1.isLocked && PartyFriendsV1.isLocked()) {
			event.stopImmediatePropagation();
		}
	});

	// Right-click context menu
	this.ui.on('contextmenu', function (event) {
		event.preventDefault();
		event.stopImmediatePropagation();

		// Prevent camera rotation from sticking
		if (Camera && Camera.rotate) {
			Camera.rotate(false);
		}

		// Block context menu when UI is locked
		if (PartyFriendsV1 && PartyFriendsV1.isLocked && PartyFriendsV1.isLocked()) {
			return false;
		}

		if (!ContextMenu) {
			return false;
		}

		ContextMenu.remove();
		ContextMenu.append();

		// Send Mail
		ContextMenu.addElement(DB.getMessage(98), function () {
			if (!self._player) {
				return;
			}
			if (Rodex) {
				Rodex.requestOpenWriteRodex(self._player.characterName);
			}
		});

		const isMe = self._player && Session && self._player.AID === Session.AID;

		if (isMe) {
			// Self: Leave party
			ContextMenu.addElement(DB.getMessage(2055), function () {
				UIManager.showPromptBox(DB.getMessage(357), 'ok', 'cancel', function () {
					if (PartyFriends && PartyFriends.onRequestLeave) {
						PartyFriends.onRequestLeave();
					} else {
						const ui = PartyFriends ? PartyFriends.getUI() : null;
						if (ui && ui.onRequestLeave) {
							ui.onRequestLeave();
						}
					}
				});
			});
		} else {
			// Others: 1:1 Chat
			ContextMenu.addElement(DB.getMessage(360), function () {
				if (!self._player) {
					return;
				}
				if (WhisperBox) {
					WhisperBox.show(self._player.characterName);
				} else if (ChatBox) {
					// Fallback to chatbox if whisperbox is not available
					ChatBox.ui.find('.username').val(self._player.characterName);
					ChatBox.ui.find('.message').select();
				}
			});
		}

		// Remove small party window
		ContextMenu.addElement('Remove small party window', function () {
			self._closedByUser = true;
			self.remove();
		});

		return false;
	});

	this.gridSnap = {
		width: 147 + 25, // container 147px + 25px gap
		height: 38 + 10, // container 38px + 10px gap
		padX: 0, // margin off edge of the screen
		padY: 4
	};
	this.snapDuration = 80;
	this.draggable(this.ui);

	this.onDragEnd = function () {
		if (PartyMemberExternal.onDragEnd) {
			PartyMemberExternal.onDragEnd(this);
		}
	};

	// Tooltip events
	this.ui.on('mouseenter', onTooltipShow);
	this.ui.on('mousemove', onTooltipMove);
	this.ui.on('mouseleave', onTooltipHide);
};

/**
 * Once append to the DOM, start to position the UI
 */
PartyMemberExternal.onAppend = function onAppend() {
	if (this._player) {
		this.update(this._player);
	}
};

/**
 * Set the member and update the UI
 * @param {number} AID
 * @param {object} player
 */
PartyMemberExternal.setMember = function setMember(AID, player) {
	this._aid = AID;
	this._player = player;
	if (this.__active) {
		this.update(player);
	}
};

/**
 * Update UI with player data
 * @param {object} player
 */
PartyMemberExternal.update = function update(player) {
	const ui = this.ui;
	const level = player.baseLevel || player.level || player.Level || 0;
	const jobID = player.class_ || player.job || player.Job || 0;
	const state = player.state || 0;
	const role = player.role || 0;

	const isOnline = state === 0;
	const isLeader = role === 0;

	ui.find('.name').text(player.characterName);
	ui.find('.level').text('Lv. ' + level);

	// Draw HP if available
	updateCanvasLife(
		ui,
		player.life && player.life.display ? player.life.hp : undefined,
		player.life && player.life.display ? player.life.hp_max : undefined
	);

	// Job Icon
	const jobIcon = ui.find('.job-icon');
	const isDead = !!player.isDead;
	const asset = isDead ? 'icon_jobs_' + jobID + '_die.bmp' : 'icon_jobs_' + jobID + '.bmp';

	Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/' + asset, function (url) {
		jobIcon.css('backgroundImage', 'url(' + url + ')');
	});

	// Crown
	ui.find('.crown').toggle(isLeader);
	if (isLeader) {
		Client.loadFile(DB.INTERFACE_PATH + 'renewalparty/ico_partycrown.bmp', function (url) {
			ui.find('.crown').css('backgroundImage', 'url(' + url + ')');
		});
	}

	// Tooltip and UI Text
	const mapDisplay = DB.getMapName(player.mapName || '');
	const tooltipText = 'Lv.' + level + ' ' + player.characterName + '(' + mapDisplay + ')';
	this.ui.attr('data-tooltip', tooltipText);

	const memberColor = isOnline ? 'white' : '#adadad';
	ui.find('.name').text(player.characterName).css('color', memberColor);
	ui.find('.map')
		.text('(' + mapDisplay + ')')
		.css('color', memberColor);
	ui.find('.level')
		.text('Lv. ' + level)
		.css('color', memberColor);

	ui.toggleClass('online', isOnline);
};

/**
 * Custom RO-style tooltips
 */
function onTooltipShow(event) {
	const text = jQuery(this).attr('data-tooltip');
	if (text) {
		let tooltip = jQuery('#ro-tooltip-party');
		if (!tooltip.length) {
			tooltip = jQuery('<div id="ro-tooltip-party" class="ro-tooltip"></div>').appendTo('body');
		}
		tooltip.text(text).addClass('show');
	}
}

function onTooltipMove(event) {
	const tooltip = jQuery('#ro-tooltip-party');
	if (tooltip.hasClass('show')) {
		tooltip.css({
			top: event.clientY + 15,
			left: event.clientX + 10
		});
	}
}

function onTooltipHide(event) {
	jQuery('#ro-tooltip-party').removeClass('show');
}

/**
 * Update HP bar
 * @param {number} hp
 * @param {number} maxhp
 */
PartyMemberExternal.updateMemberLife = function updateMemberLife(hp, maxhp) {
	updateCanvasLife(this.ui, hp, maxhp);
};

/**
 * Helper to update the HP bar on a canvas
 * @param {jQuery} node
 * @param {number} hp
 * @param {number} maxhp
 */
function updateCanvasLife(node, hp, maxhp) {
	const hasLife = hp !== undefined && maxhp !== undefined && maxhp > 0;
	const lifeRatio = hasLife ? hp / maxhp : 0;
	const barVisibility = 'visible'; // Always visible

	node.find('.hp-bar-container').css('visibility', barVisibility);

	if (hasLife) {
		var canvas = node.find('canvas').get(0);
		if (canvas) {
			var ctx = canvas.getContext('2d');
			const width = Math.floor(lifeRatio * 75);
			canvas.width = 75;
			canvas.height = 5;
			ctx.clearRect(0, 0, 75, 5);
			ctx.fillStyle = lifeRatio <= 0.25 ? '#ef1010' : '#32cd32';
			ctx.fillRect(0, 0, width, 5);
		}
		node.find('.hp-text').text(hp + '/' + maxhp);
	} else {
		var canvas = node.find('canvas').get(0);
		if (canvas) {
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, 75, 5);
		}
		node.find('.hp-text').text('');
	}
}

/**
 * Exports
 */
export default UIManager.addComponent(PartyMemberExternal);
