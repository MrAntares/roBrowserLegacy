/**
 * UI/Components/Roulette/Roulette.js
 *
 * Roulette window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author [Your Name]
 */

import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import MiniMap from 'UI/Components/MiniMap/MiniMap.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import PACKETVER from 'Network/PacketVerManager.js';
import jQuery from 'Utils/jquery.js';
import htmlText from './Roulette.html?raw';
import cssText from './Roulette.css?raw';

/**
 * Create Component
 */
const Roulette = new UIComponent('Roulette', htmlText, cssText);

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'Roulette',
	{
		x: 200,
		y: 200,
		show: false
	},
	1.0
);

/**
 * @var {object} Roulette data
 */
const _rouletteInfo = {
	step: 0,
	idx: 0,
	goldPoint: 0,
	silverPoint: 0,
	bronzePoint: 0,
	additionItemID: 0,
	items: []
};

/**
 * @var {boolean} Is spinning
 */
let _isSpinning = false;

/**
 * Initialize UI
 */
Roulette.init = function init() {
	this.ui.find('.close').click(function () {
		Roulette.onClose();
	});

	this.ui.find('.btn-close').click(function () {
		Roulette.onClose();
	});

	this.ui.find('.btn-spin').click(function () {
		if (!_isSpinning) {
			Roulette.onSpin();
		}
	});

	this.ui.find('.btn-info').click(function () {
		Roulette.onInfo();
	});

	this.draggable(this.ui.find('.titlebar'));
};

/**
 * @var {number} Timeout ID for server response
 */
let _responseTimeout = null;

/**
 * Click on roulette icon
 */
function onClickIcon() {
	const pkt = new PACKET.CZ.REQ_OPEN_ROULETTE();
	Network.sendPacket(pkt);

	// Clear any existing timeout
	if (_responseTimeout) {
		clearTimeout(_responseTimeout);
	}

	// Set timeout: if no response in 2 seconds, assume server uses NPC mod
	// Standard rAthena: sends ZC_ACK_OPEN_ROULETTE → opens window (timeout cleared)
	// Modified server: no response → timeout expires → server handles via NPC script
	_responseTimeout = setTimeout(function () {
		_responseTimeout = null;
		// Server didn't respond - likely using NPC mod, no action needed
	}, 2000);
}

/**
 * Once append to the DOM
 */
Roulette.onAppend = function onAppend() {
	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});

	if (!_preferences.show) {
		this.ui.hide();
	}
	// Check if roulette is enabled in ROConfig
	if (ROConfig.enableRoulette === false) {
		return;
	}

	// Check if PACKETVER >= 20141008 (Roulette requires this version)
	if (PACKETVER.value < 20141008) {
		return;
	}

	// Try to add button with retry logic
	let attempts = 0;
	const maxAttempts = 20;

	const tryAddButton = function () {
		attempts++;
		const miniMapComponent = MiniMap.getUI();

		if (miniMapComponent && miniMapComponent.ui) {
			clearTimeout(retryTimeout);
			addButtonToMiniMap(miniMapComponent.ui);
		} else if (attempts < maxAttempts) {
			retryTimeout = setTimeout(tryAddButton, 500);
		}
	};

	let retryTimeout = setTimeout(tryAddButton, 100);
};

/**
 * Add button to MiniMap UI element
 */
function addButtonToMiniMap(miniMapUI) {
	try {
		// Check if button already exists
		if (miniMapUI.find('.rouletteIcon').length === 0) {
			miniMapUI.append('<button class="rouletteIcon"></button>');
			miniMapUI.on('click', '.rouletteIcon', onClickIcon);

			// Load roulette icon
			const iconPath = 'basic_interface/roullette/RoulletteIcon.bmp';

			Client.loadFile(DB.INTERFACE_PATH + iconPath, function (data) {
				const btn = miniMapUI.find('.rouletteIcon');
				btn.css({
					backgroundImage: 'url(' + data + ')',
					backgroundSize: 'contain',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					position: 'absolute',
					top: '57px',
					left: '-45px',
					width: '43px',
					height: '43px',
					border: 'none'
				});
			});
		}
	} catch (e) {
		console.error('[Roulette] Failed to add button:', e);
	}
}

/**
 * Remove from DOM
 */
Roulette.onRemove = function onRemove() {
	_preferences.show = this.ui.is(':visible');
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.save();
};

/**
 * Open Roulette Window
 */
Roulette.onOpen = function onOpen(pkt) {
	if (pkt) {
		_rouletteInfo.step = pkt.step || 0;
		_rouletteInfo.idx = pkt.idx || 0;
		_rouletteInfo.goldPoint = pkt.goldPoint || 0;
		_rouletteInfo.silverPoint = pkt.silverPoint || 0;
		_rouletteInfo.bronzePoint = pkt.bronzePoint || 0;
		_rouletteInfo.additionItemID = pkt.additionItemID || 0;
	}

	Roulette.ui.show();
	Roulette.updateUI();
	Roulette.focus();
};

/**
 * Close Roulette Window
 */
Roulette.onClose = function onClose() {
	Roulette.ui.hide();

	// Send close packet to server
	const pkt = new PACKET.CZ.REQ_CLOSE_ROULETTE();
	Network.sendPacket(pkt);
};

/**
 * Request to spin the roulette
 */
Roulette.onSpin = function onSpin() {
	if (_isSpinning) {
		return;
	}

	// Send spin request packet to server
	const pkt = new PACKET.CZ.REQ_GENERATE_ROULETTE();
	Network.sendPacket(pkt);
};

/**
 * Handle roulette item list response
 */
Roulette.onRouletteInfo = function onRouletteInfo(pkt) {
	if (pkt && pkt.items) {
		_rouletteInfo.items = pkt.items;
		_rouletteInfo.serial = pkt.serial;
	}

	// Update wheel with new items
	Roulette.generateWheelSlots();
};

/**
 * Show info window
 */
Roulette.onInfo = function onInfo() {
	// TODO: Show information about roulette
};

/**
 * Update UI with current roulette data
 */
Roulette.updateUI = function updateUI() {
	// Update points display (if available)
	// this.ui.find('.points-value').text(_rouletteInfo.count || 0);

	// Generate wheel slots
	this.generateWheelSlots();

	// Update button states
	this.ui.find('.btn-spin').prop('disabled', _isSpinning);
};

/**
 * Generate wheel slots from items
 */
Roulette.generateWheelSlots = function generateWheelSlots() {
	const wheelSlots = this.ui.find('.wheel-slots');
	wheelSlots.empty();

	const items = _rouletteInfo.items || [];
	const numSlots = items.length || 10; // Default 10 slots

	for (let i = 0; i < numSlots; i++) {
		const angle = (360 / numSlots) * i;
		const distance = 120; // Distance from center
		const radian = (angle - 90) * (Math.PI / 180);

		const x = distance * Math.cos(radian);
		const y = distance * Math.sin(radian);

		const slot = jQuery('<div class="wheel-slot"></div>');
		slot.attr('data-index', i);
		slot.css({
			transform: 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'deg)'
		});

		// Add item icon if available
		if (items[i]) {
			const itemId = items[i].itemId || items[i].item_id || items[i].ItemID;
			if (itemId) {
				Client.loadFile(
					DB.INTERFACE_PATH + 'item/' + itemId + '.bmp',
					function (slot, data) {
						const icon = jQuery('<div class="item-icon"></div>');
						icon.css('backgroundImage', 'url(' + data + ')');
						slot.append(icon);
					}.bind(this, slot)
				);
			}
		}

		wheelSlots.append(slot);
	}
};

/**
 * Start spinning animation
 */
Roulette.startSpin = function startSpin(resultIndex) {
	if (_isSpinning) {
		return;
	}

	_isSpinning = true;
	this.ui.find('.btn-spin').prop('disabled', true);

	const wheelSlots = this.ui.find('.wheel-slots');
	const numSlots = _rouletteInfo.items.length || 10;
	const degreesPerSlot = 360 / numSlots;

	// Calculate final rotation
	// Add multiple full rotations (5) plus the target slot
	const targetRotation = 360 * 5 + resultIndex * degreesPerSlot;

	wheelSlots.css({
		transform: 'translate(-50%, -50%) rotate(' + targetRotation + 'deg)'
	});

	// After animation completes
	setTimeout(function () {
		_isSpinning = false;
		Roulette.ui.find('.btn-spin').prop('disabled', false);
		Roulette.showResult(resultIndex);
	}, 3000);
};

/**
 * Show result after spin
 */
Roulette.showResult = function showResult(resultIndex) {
	const resultDisplay = this.ui.find('.result-item');
	resultDisplay.empty();

	if (_rouletteInfo.items[resultIndex]) {
		const item = _rouletteInfo.items[resultIndex];
		const itemId = item.itemId || item.item_id || item.ItemID;

		if (itemId) {
			Client.loadFile(DB.INTERFACE_PATH + 'item/' + itemId + '.bmp', function (data) {
				resultDisplay.css('backgroundImage', 'url(' + data + ')');
			});
		}
	}
};

/**
 * Handle roulette result from server
 */
Roulette.onResult = function onResult(pkt) {
	if (pkt.step !== undefined) {
		_rouletteInfo.step = pkt.step;
	}

	if (pkt.idx !== undefined) {
		_rouletteInfo.idx = pkt.idx;
	}

	// Update points remaining
	if (pkt.remainGold !== undefined) {
		_rouletteInfo.goldPoint = pkt.remainGold;
	}
	if (pkt.remainSilver !== undefined) {
		_rouletteInfo.silverPoint = pkt.remainSilver;
	}
	if (pkt.remainBronze !== undefined) {
		_rouletteInfo.bronzePoint = pkt.remainBronze;
	}

	// Start spinning to the result
	if (pkt.idx !== undefined) {
		Roulette.startSpin(pkt.idx);
	}
};

/**
 * Handle item received from server
 */
Roulette.onItemReceived = function onItemReceived(pkt) {
	// Update UI to show item was received
	Roulette.updateUI();

	// Optionally show a notification
	// ChatBox.addText( 'Roulette item received!', ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG );
};

/**
 * Request to receive the roulette item
 */
Roulette.requestReceiveItem = function requestReceiveItem(condition) {
	const pkt = new PACKET.CZ.RECV_ROULETTE_ITEM();
	pkt.condition = condition || 0; // 0 = normal, 1 = losing
	Network.sendPacket(pkt);
};

/**
 * Export
 */
export default UIManager.addComponent(Roulette);
