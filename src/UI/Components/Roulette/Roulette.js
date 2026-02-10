/**
 * UI/Components/Roulette/Roulette.js
 *
 * Roulette window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author [Your Name]
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var MiniMap = require('UI/Components/MiniMap/MiniMap');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PACKETVER = require('Network/PacketVerManager');
	var jQuery = require('Utils/jquery');
	var htmlText = require('text!./Roulette.html');
	var cssText = require('text!./Roulette.css');

	/**
	 * Create Component
	 */
	var Roulette = new UIComponent('Roulette', htmlText, cssText);

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
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
	var _rouletteInfo = {
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
	var _isSpinning = false;

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
	var _responseTimeout = null;

	/**
	 * Click on roulette icon
	 */
	function onClickIcon() {
		var pkt = new PACKET.CZ.REQ_OPEN_ROULETTE();
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
	};

	/**
	 * Prepare - Add roulette button to MiniMap
	 */
	Roulette.prepare = function prepare() {
		// Check if roulette is enabled in ROConfig
		if (ROConfig.enableRoulette === false) {
			return;
		}

		// Check if PACKETVER >= 20141008 (Roulette requires this version)
		if (PACKETVER.value < 20141008) {
			return;
		}

		// Try to add button with retry logic
		var attempts = 0;
		var maxAttempts = 20;

		var tryAddButton = function () {
			attempts++;
			var miniMapComponent = MiniMap.getUI();

			if (miniMapComponent && miniMapComponent.ui) {
				clearTimeout(retryTimeout);
				addButtonToMiniMap(miniMapComponent.ui);
			} else if (attempts < maxAttempts) {
				retryTimeout = setTimeout(tryAddButton, 500);
			}
		};

		var retryTimeout = setTimeout(tryAddButton, 100);
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
				var iconPath = 'basic_interface/roullette/RoulletteIcon.bmp';

				Client.loadFile(
					DB.INTERFACE_PATH + iconPath,
					function (data) {
						var btn = miniMapUI.find('.rouletteIcon');
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
					},
					function (error) {
						// Try alternative path with lowercase
						var altPath = 'basic_interface/roullette/roulletteicon.bmp';
						Client.loadFile(DB.INTERFACE_PATH + altPath, function (data) {
							miniMapUI.find('.rouletteIcon').css('backgroundImage', 'url(' + data + ')');
						});
					}
				);
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
		var pkt = new PACKET.CZ.REQ_CLOSE_ROULETTE();
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
		var pkt = new PACKET.CZ.REQ_GENERATE_ROULETTE();
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
		var wheelSlots = this.ui.find('.wheel-slots');
		wheelSlots.empty();

		var items = _rouletteInfo.items || [];
		var numSlots = items.length || 10; // Default 10 slots

		for (var i = 0; i < numSlots; i++) {
			var angle = (360 / numSlots) * i;
			var distance = 120; // Distance from center
			var radian = (angle - 90) * (Math.PI / 180);

			var x = distance * Math.cos(radian);
			var y = distance * Math.sin(radian);

			var slot = jQuery('<div class="wheel-slot"></div>');
			slot.attr('data-index', i);
			slot.css({
				transform: 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'deg)'
			});

			// Add item icon if available
			if (items[i]) {
				var itemId = items[i].itemId || items[i].item_id || items[i].ItemID;
				if (itemId) {
					Client.loadFile(
						DB.INTERFACE_PATH + 'item/' + itemId + '.bmp',
						function (slot, data) {
							var icon = jQuery('<div class="item-icon"></div>');
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

		var wheelSlots = this.ui.find('.wheel-slots');
		var numSlots = _rouletteInfo.items.length || 10;
		var degreesPerSlot = 360 / numSlots;

		// Calculate final rotation
		// Add multiple full rotations (5) plus the target slot
		var targetRotation = 360 * 5 + resultIndex * degreesPerSlot;

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
		var resultDisplay = this.ui.find('.result-item');
		resultDisplay.empty();

		if (_rouletteInfo.items[resultIndex]) {
			var item = _rouletteInfo.items[resultIndex];
			var itemId = item.itemId || item.item_id || item.ItemID;

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
		var pkt = new PACKET.CZ.RECV_ROULETTE_ITEM();
		pkt.condition = condition || 0; // 0 = normal, 1 = losing
		Network.sendPacket(pkt);
	};

	/**
	 * Export
	 */
	return UIManager.addComponent(Roulette);
});
