/**
 * UI/Components/MobileUI/MobileUI.js
 *
 * Mobile/Touchscreen assist UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
+ */
define(function (require) {
	'use strict';

	var jQuery = require('Utils/jquery');
	var Context = require('Core/Context');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Preferences = require('Core/Preferences');
	var Session = require('Engine/SessionStorage');
	var Renderer = require('Renderer/Renderer');
	var PACKETVER = require('Network/PacketVerManager');
	var PACKETVER = require('Network/PacketVerManager');
	var PACKET = require('Network/PacketStructure');
	var EntityManager = require('Renderer/EntityManager');
	var Network = require('Network/NetworkManager');
	var PathFinding = require('Utils/PathFinding');
	var Altitude = require('Renderer/Map/Altitude');
	var Events = require('Core/Events');
	var htmlText = require('text!./MobileUI.html');
	var cssText = require('text!./MobileUI.css');
	var glMatrix = require('Vendors/gl-matrix');
	var Camera = require('Renderer/Camera');
	var KEYS = require('Controls/KeyEventHandler');
	var vec2 = glMatrix.vec2;
	var mat2 = glMatrix.mat2;

	// Object to initialize
	var direction = vec2.create();
	var rotate = mat2.create();

	//Configure keys here
	/*var MOVE = {
		RIGHT: KEYS.RIGHT,
		LEFT: KEYS.LEFT,
		UP: KEYS.UP,
		DOWN: KEYS.DOWN
	};*/ // UNUSED

	//Multiple keys held
	//var KeyEvent = {}; // UNUSED

	//Memory
	var targetPos = [0, 0];

	//var keysDownTimeout = null; // UNUSED
	var movementTimer = null; // Timer for continuous joystick movement

	/**
	 * Create Component
	 */
	var MobileUI = new UIComponent('MobileUI', htmlText, cssText);

	/**
	 * @var {Preferences} window preferences
	 */
	var _preferences = Preferences.get(
		'MobileUI',
		{
			x: 0,
			y: 0,
			zIndex: 1000,
			width: Renderer.width,
			height: Renderer.height,
			show: false
		},
		1.0
	);

	var showButtons = false;
	var autoTargetTimer;
	const C_AUTOTARGET_DELAY = 500; //in ms. Lower values increase targeting frequency, but might cause performance drop when there are many enemies around!

	var centerX, centerY;
	var maxDistance = 0;
	// var lastSentMove = Date.now(); // UNUSED
	var normalizedX = 0; // Current normalized x-axis input
	var normalizedY = 0; // Current normalized y-axis input

	/**
	 * Initialize UI
	 */
	MobileUI.init = function init() {
		this.ui.find('#toggleUIButton').click(function (e) {
			toggleButtons();
			stopPropagation(e);
		});
		this.ui.find('#fullscreenButton').click(function (e) {
			toggleFullScreen();
			stopPropagation(e);
		});

		this.ui.find('#f1Button').click(function (e) {
			logKeyPress(112);
			stopPropagation(e);
		});
		this.ui.find('#f2Button').click(function (e) {
			logKeyPress(113);
			stopPropagation(e);
		});
		this.ui.find('#f3Button').click(function (e) {
			logKeyPress(114);
			stopPropagation(e);
		});
		this.ui.find('#f4Button').click(function (e) {
			logKeyPress(115);
			stopPropagation(e);
		});
		this.ui.find('#f5Button').click(function (e) {
			logKeyPress(116);
			stopPropagation(e);
		});
		this.ui.find('#f6Button').click(function (e) {
			logKeyPress(117);
			stopPropagation(e);
		});
		this.ui.find('#f7Button').click(function (e) {
			logKeyPress(118);
			stopPropagation(e);
		});
		this.ui.find('#f8Button').click(function (e) {
			logKeyPress(119);
			stopPropagation(e);
		});
		this.ui.find('#f9Button').click(function (e) {
			logKeyPress(120);
			stopPropagation(e);
		});

		this.ui.find('#n1Button').click(function (e) {
			logKeyPress(49);
			stopPropagation(e);
		});
		this.ui.find('#n2Button').click(function (e) {
			logKeyPress(50);
			stopPropagation(e);
		});
		this.ui.find('#n3Button').click(function (e) {
			logKeyPress(51);
			stopPropagation(e);
		});
		this.ui.find('#n4Button').click(function (e) {
			logKeyPress(52);
			stopPropagation(e);
		});
		this.ui.find('#n5Button').click(function (e) {
			logKeyPress(53);
			stopPropagation(e);
		});
		this.ui.find('#n6Button').click(function (e) {
			logKeyPress(54);
			stopPropagation(e);
		});
		this.ui.find('#n7Button').click(function (e) {
			logKeyPress(55);
			stopPropagation(e);
		});
		this.ui.find('#n8Button').click(function (e) {
			logKeyPress(56);
			stopPropagation(e);
		});
		this.ui.find('#n9Button').click(function (e) {
			logKeyPress(57);
			stopPropagation(e);
		});

		this.ui.find('#qButton').click(function (e) {
			logKeyPress(81);
			stopPropagation(e);
		});
		this.ui.find('#wButton').click(function (e) {
			logKeyPress(87);
			stopPropagation(e);
		});
		this.ui.find('#eButton').click(function (e) {
			logKeyPress(69);
			stopPropagation(e);
		});
		this.ui.find('#rButton').click(function (e) {
			logKeyPress(82);
			stopPropagation(e);
		});
		this.ui.find('#tButton').click(function (e) {
			logKeyPress(84);
			stopPropagation(e);
		});
		this.ui.find('#yButton').click(function (e) {
			logKeyPress(89);
			stopPropagation(e);
		});
		this.ui.find('#uButton').click(function (e) {
			logKeyPress(85);
			stopPropagation(e);
		});
		this.ui.find('#iButton').click(function (e) {
			logKeyPress(73);
			stopPropagation(e);
		});
		this.ui.find('#oButton').click(function (e) {
			logKeyPress(89);
			stopPropagation(e);
		});

		this.ui.find('#aButton').click(function (e) {
			logKeyPress(65);
			stopPropagation(e);
		});
		this.ui.find('#sButton').click(function (e) {
			logKeyPress(83);
			stopPropagation(e);
		});
		this.ui.find('#dButton').click(function (e) {
			logKeyPress(68);
			stopPropagation(e);
		});
		this.ui.find('#fButton').click(function (e) {
			logKeyPress(70);
			stopPropagation(e);
		});
		this.ui.find('#gButton').click(function (e) {
			logKeyPress(71);
			stopPropagation(e);
		});
		this.ui.find('#hButton').click(function (e) {
			logKeyPress(72);
			stopPropagation(e);
		});
		this.ui.find('#jButton').click(function (e) {
			logKeyPress(74);
			stopPropagation(e);
		});
		this.ui.find('#kButton').click(function (e) {
			logKeyPress(75);
			stopPropagation(e);
		});
		this.ui.find('#lButton').click(function (e) {
			logKeyPress(76);
			stopPropagation(e);
		});

		this.ui.find('#f10Button').click(function (e) {
			logKeyPress(121);
			stopPropagation(e);
		});
		this.ui.find('#f12Button').click(function (e) {
			logKeyPress(123);
			stopPropagation(e);
		});
		this.ui.find('#insButton').click(function (e) {
			logKeyPress(45);
			stopPropagation(e);
		});

		this.ui.find('#toggleStatusButton').click(function (e) {
			toggleStatus();
			stopPropagation(e);
		});
		this.ui.find('#toggleTargetingButton').click(function (e) {
			toggleTouchTargeting();
			stopPropagation(e);
		});
		this.ui.find('#toggleAutoFollowButton').click(function (e) {
			toggleAutoFollow();
			stopPropagation(e);
		});
		this.ui.find('#toggleAutoTargetButton').click(function (e) {
			toggleAutoTargeting();
			stopPropagation(e);
		});

		this.ui.find('#attackButton').click(function (e) {
			attackTargeted();
			stopPropagation(e);
		});

		this.ui.find('#pickupButton').click(function (e) {
			pickUpItem();
			stopPropagation(e);
		}); // Button for Picks up the nearest item - MicromeX

		this.ui.find('#switchshorcutButton').click(function (e) {
			switchSkillButtons();
			stopPropagation(e);
		});

		this.ui
			.find('.buttons')
			.on('mousedown', function (e) {
				jQuery(e.target).addClass('pressed');
			})
			.on('touchstart', function (e) {
				jQuery(e.target).addClass('pressed');
			})
			.on('mouseup', function (e) {
				jQuery(e.target).removeClass('pressed');
			})
			.on('touchend', function (e) {
				jQuery(e.target).removeClass('pressed');
			});

		this.ui
			.find('.FButton')
			.on('mousedown', function (e) {
				jQuery(e.target).addClass('pressed');
			})
			.on('touchstart', function (e) {
				jQuery(e.target).addClass('pressed');
			})
			.on('mouseup', function (e) {
				jQuery(e.target).removeClass('pressed');
			})
			.on('touchend', function (e) {
				jQuery(e.target).removeClass('pressed');
			});

		// Initialize the joystick - MicromeX
		setupJoystick();
		// Initialize the NPC Talk Button - MicromeX
		setupTalkToNpcButton();
	};

	/**
	 * Logs the key press to the console and performs the key press action.
	 * @param {number} keyCode - The key code of the pressed key.
	 */
	function logKeyPress(keyCode) {
		keyPress(keyCode);
	}

	/**
	 * Toggles full screen display
	 */
	function toggleFullScreen() {
		if (!Context.isFullScreen()) {
			Context.requestFullScreen();
		} else {
			Context.cancelFullScreen();
		}
	}

	/**
	 * Emulates a keypress event
	 *
	 * @param {number} keyId
	 */
	function keyPress(k) {
		var roWindow = window;
		roWindow.document.getElementsByTagName('body')[0].focus();
		roWindow.dispatchEvent(
			new KeyboardEvent('keydown', {
				keyCode: k,
				which: k
			})
		);
	}

	/**
	 * Toggles MobileUI button bars visibility (and thus buttons)
	 */
	function toggleButtons() {
		if (showButtons) {
			MobileUI.ui.find('#topBar').addClass('disabled');
			MobileUI.ui.find('#leftBar').addClass('disabled');
			MobileUI.ui.find('#rightBar').addClass('disabled');
			MobileUI.ui.find('#joystickContainer').addClass('disabled');
			MobileUI.ui.find('#buttonContainer').addClass('disabled');
			MobileUI.ui.find('#attackButton').addClass('disabled');
			MobileUI.ui.find('#pickupButton').addClass('disabled');
			MobileUI.ui.find('#talktonpcButton').addClass('disabled');
			MobileUI.ui.find('#switchshorcutButton').addClass('disabled');
			MobileUI.ui.find('#f1Button').addClass('disabled');
			MobileUI.ui.find('#f2Button').addClass('disabled');
			MobileUI.ui.find('#f3Button').addClass('disabled');
			MobileUI.ui.find('#f4Button').addClass('disabled');
			MobileUI.ui.find('#f5Button').addClass('disabled');
			MobileUI.ui.find('#f5Button').addClass('disabled');
			MobileUI.ui.find('#f7Button').addClass('disabled');
			MobileUI.ui.find('#f8Button').addClass('disabled');
			MobileUI.ui.find('#f9Button').addClass('disabled');
			MobileUI.ui.find('#n1Button').addClass('disabled');
			MobileUI.ui.find('#n2Button').addClass('disabled');
			MobileUI.ui.find('#n3Button').addClass('disabled');
			MobileUI.ui.find('#n4Button').addClass('disabled');
			MobileUI.ui.find('#n5Button').addClass('disabled');
			MobileUI.ui.find('#n6Button').addClass('disabled');
			MobileUI.ui.find('#n7Button').addClass('disabled');
			MobileUI.ui.find('#n8Button').addClass('disabled');
			MobileUI.ui.find('#n9Button').addClass('disabled');
			MobileUI.ui.find('#qButton').addClass('disabled');
			MobileUI.ui.find('#wButton').addClass('disabled');
			MobileUI.ui.find('#eButton').addClass('disabled');
			MobileUI.ui.find('#rButton').addClass('disabled');
			MobileUI.ui.find('#tButton').addClass('disabled');
			MobileUI.ui.find('#yButton').addClass('disabled');
			MobileUI.ui.find('#uButton').addClass('disabled');
			MobileUI.ui.find('#iButton').addClass('disabled');
			MobileUI.ui.find('#oButton').addClass('disabled');
			MobileUI.ui.find('#aButton').addClass('disabled');
			MobileUI.ui.find('#sButton').addClass('disabled');
			MobileUI.ui.find('#dButton').addClass('disabled');
			MobileUI.ui.find('#fButton').addClass('disabled');
			MobileUI.ui.find('#gButton').addClass('disabled');
			MobileUI.ui.find('#hButton').addClass('disabled');
			MobileUI.ui.find('#jButton').addClass('disabled');
			MobileUI.ui.find('#kButton').addClass('disabled');
			MobileUI.ui.find('#lButton').addClass('disabled');

			if (Session.TouchTargeting) {
				toggleTouchTargeting();
			}

			showButtons = false;
		} else {
			MobileUI.ui.find('#topBar').removeClass('disabled');
			MobileUI.ui.find('#leftBar').removeClass('disabled');
			MobileUI.ui.find('#rightBar').removeClass('disabled');
			MobileUI.ui.find('#joystickContainer').removeClass('disabled');
			MobileUI.ui.find('#buttonContainer').removeClass('disabled');
			MobileUI.ui.find('#attackButton').removeClass('disabled');
			MobileUI.ui.find('#pickupButton').removeClass('disabled');
			MobileUI.ui.find('#talktonpcButton').removeClass('disabled');
			MobileUI.ui.find('#switchshorcutButton').removeClass('disabled');
			MobileUI.ui.find('#f1Button').removeClass('disabled');
			MobileUI.ui.find('#f2Button').removeClass('disabled');
			MobileUI.ui.find('#f3Button').removeClass('disabled');
			MobileUI.ui.find('#f4Button').removeClass('disabled');
			MobileUI.ui.find('#f5Button').removeClass('disabled');
			MobileUI.ui.find('#f6Button').removeClass('disabled');
			MobileUI.ui.find('#f7Button').removeClass('disabled');
			MobileUI.ui.find('#f8Button').removeClass('disabled');
			MobileUI.ui.find('#f9Button').removeClass('disabled');

			showButtons = true;
		}
	}

	/**
	 * Toggles switch skill
	 */
	function switchSkillButtons() {
		let skillSets = [
			[
				'#f1Button',
				'#f2Button',
				'#f3Button',
				'#f4Button',
				'#f5Button',
				'#f6Button',
				'#f7Button',
				'#f8Button',
				'#f9Button'
			], // First skill set
			[
				'#n1Button',
				'#n2Button',
				'#n3Button',
				'#n4Button',
				'#n5Button',
				'#n6Button',
				'#n7Button',
				'#n8Button',
				'#n9Button'
			], // Second skill set
			[
				'#qButton',
				'#wButton',
				'#eButton',
				'#rButton',
				'#tButton',
				'#yButton',
				'#uButton',
				'#iButton',
				'#oButton'
			], // Third skill set
			['#aButton', '#sButton', '#dButton', '#fButton', '#gButton', '#hButton', '#jButton', '#kButton', '#lButton'] // Fourth skill set
		];

		let currentSetIndex = switchSkillButtons.currentSetIndex || 0; // Track current skill set
		let nextSetIndex = (currentSetIndex + 1) % skillSets.length; // Cycle through skill sets

		//  Hide all skill sets
		skillSets.flat().forEach(button => {
			MobileUI.ui.find(button).addClass('disabled');
		});

		//  Show only the next set
		skillSets[nextSetIndex].forEach(button => {
			MobileUI.ui.find(button).removeClass('disabled');
		});

		//  Update skill set index
		switchSkillButtons.currentSetIndex = nextSetIndex;
	}

	/**
	 * Toggles status view
	 */
	function toggleStatus() {
		// use jquery find id="StatusIcons" and hide/show
		jQuery('#StatusIcons').toggle();
	}

	/**
	 * Toggles touch targeting
	 */
	function toggleTouchTargeting() {
		if (Session.TouchTargeting) {
			MobileUI.ui.find('#toggleTargetingButton').removeClass('active');

			MobileUI.ui.find('#toggleAutoFollowButton').addClass('disabled');
			MobileUI.ui.find('#toggleAutoTargetButton').addClass('disabled');

			if (Session.AutoTargeting) {
				toggleAutoTargeting();
			}

			Session.TouchTargeting = false;
		} else {
			MobileUI.ui.find('#toggleTargetingButton').addClass('active');

			MobileUI.ui.find('#toggleAutoFollowButton').removeClass('disabled');
			MobileUI.ui.find('#toggleAutoTargetButton').removeClass('disabled');

			Session.TouchTargeting = true;
		}
	}

	/**
	 * Toggles automatic targeting
	 */
	function toggleAutoTargeting() {
		if (Session.AutoTargeting) {
			MobileUI.ui.find('#toggleAutoTargetButton').removeClass('active');
			Session.AutoTargeting = false;
		} else {
			MobileUI.ui.find('#toggleAutoTargetButton').addClass('active');
			Session.AutoTargeting = true;
			autoTarget();
		}
	}

	/**
	 * Toggles auto follow
	 */
	function toggleAutoFollow() {
		if (Session.autoFollow) {
			MobileUI.ui.find('#toggleAutoFollowButton').removeClass('active');
			Session.autoFollow = false;
		} else {
			var entityFocus = EntityManager.getFocusEntity();
			if (entityFocus) {
				MobileUI.ui.find('#toggleAutoFollowButton').addClass('active');
				Session.autoFollow = true;
				Session.autoFollowTarget = entityFocus;
				onAutoFollow();
			}
		}
	}

	/**
	 * Attacks a targeted enemy (if present)
	 */
	function attackTargeted() {
		var main = Session.Entity;
		var pkt;

		var entityFocus = EntityManager.getFocusEntity();

		if (!entityFocus || entityFocus.action === entityFocus.ACTION.DIE) {
			//If no target, try picking one first
			autoTarget();
			entityFocus = EntityManager.getFocusEntity();
		}

		if (entityFocus) {
			var out = [];
			var count = PathFinding.search(
				main.position[0] | 0,
				main.position[1] | 0,
				entityFocus.position[0] | 0,
				entityFocus.position[1] | 0,
				main.attack_range + 1,
				out
			);

			// Can't attack
			if (!count) {
				return true;
			}

			if (PACKETVER.value >= 20180307) {
				pkt = new PACKET.CZ.REQUEST_ACT2();
			} else {
				pkt = new PACKET.CZ.REQUEST_ACT();
			}
			pkt.action = 7;
			pkt.targetGID = entityFocus.GID;

			// in range send packet
			if (count < 2) {
				Network.sendPacket(pkt);
				return true;
			}

			// Move to entity
			Session.moveAction = pkt;

			if (PACKETVER.value >= 20180307) {
				pkt = new PACKET.CZ.REQUEST_MOVE2();
			} else {
				pkt = new PACKET.CZ.REQUEST_MOVE();
			}
			pkt.dest[0] = out[(count - 1) * 2 + 0];
			pkt.dest[1] = out[(count - 1) * 2 + 1];
			Network.sendPacket(pkt);
		}
	}

	/**
	 * Automatically targeting the closest enemy
	 */
	function autoTarget() {
		var Player = Session.Entity;

		var entityFocus = EntityManager.getFocusEntity();

		var closestEntity = EntityManager.getClosestEntity(Player, Session.Entity.constructor.TYPE_MOB);

		if (closestEntity) {
			if (entityFocus && closestEntity.GID !== entityFocus.GID) {
				entityFocus.onFocusEnd();
				EntityManager.setFocusEntity(null);

				//closestEntity.onMouseDown();
				closestEntity.onFocus();
				EntityManager.setFocusEntity(closestEntity);
			} else if (!entityFocus) {
				//closestEntity.onMouseDown();
				closestEntity.onFocus();
				EntityManager.setFocusEntity(closestEntity);
			} else {
				//Same entity, nothing to do
			}
		}

		if (Session.AutoTargeting && Session.Playing) {
			startAutoTarget();
		}
	}

	/**
	 * Starting automatic targeting cycle
	 */
	function startAutoTarget() {
		autoTargetTimer = window.setTimeout(autoTarget, C_AUTOTARGET_DELAY);
	}

	/**
	 * Stopping automatic targeting cycle
	 */
	function stopAutoTarget() {
		window.clearTimeout(autoTargetTimer);
	}

	/**
	 * Stop event propagation
	 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Auto follow logic
	 */
	function onAutoFollow() {
		if (Session.autoFollow) {
			var player = Session.Entity;
			var target = Session.autoFollowTarget;

			var dx = Math.abs(player.position[0] - target.position[0]);
			var dy = Math.abs(player.position[1] - target.position[1]);

			// Use square based range check instead of Pythagorean because of diagonals
			if (dx > 1 || dy > 1) {
				var dest = [0, 0];

				// If there is valid cell send move packet
				if (checkFreeCell(Math.round(target.position[0]), Math.round(target.position[1]), 1, dest)) {
					var pkt;
					if (PACKETVER.value >= 20180307) {
						pkt = new PACKET.CZ.REQUEST_MOVE2();
					} else {
						pkt = new PACKET.CZ.REQUEST_MOVE();
					}
					pkt.dest = dest;
					Network.sendPacket(pkt);
				}
			}

			Events.setTimeout(onAutoFollow, 500);
		} else {
			MobileUI.ui.find('#toggleAutoFollowButton').removeClass('active');
		}
	}

	/**
	 * Picks up the nearest item - MicromeX
	 */
	function pickUpItem() {
		const player = Session.Entity;

		if (!player) {
			return;
		}

		// Find the nearest item
		const closestItem = EntityManager.getClosestEntity(player, Session.Entity.constructor.TYPE_ITEM);

		if (!closestItem) {
			return;
		}

		// if the distance between Session.Entity and closestItem is greater then 2 so walk to the item
		var dx = Math.abs(player.position[0] - closestItem.position[0]);
		var dy = Math.abs(player.position[1] - closestItem.position[1]);
		if (dx < 0) {
			dx = -dx;
		}
		if (dy < 0) {
			dy = -dy;
		}

		if ((dx < dy ? dy : dx) > 2) {
			var dest = [0, 0];

			// If there is valid cell send move packet
			if (checkFreeCell(Math.round(closestItem.position[0]), Math.round(closestItem.position[1]), 1, dest)) {
				var pkt;
				if (PACKETVER.value >= 20180307) {
					pkt = new PACKET.CZ.REQUEST_MOVE2();
				} else {
					pkt = new PACKET.CZ.REQUEST_MOVE();
				}
				pkt.dest = dest;
				Network.sendPacket(pkt);
			}
		}

		// Check the packet version and create the appropriate packet
		let pickUpPacket;

		if (PACKETVER.value >= 20180307) {
			pickUpPacket = new PACKET.CZ.ITEM_PICKUP2();
		} else {
			pickUpPacket = new PACKET.CZ.ITEM_PICKUP();
		}

		// Set the ITAID for the packet
		pickUpPacket.ITAID = closestItem.GID;

		// Send the packet to the server
		Network.sendPacket(pickUpPacket);
	}

	/**
	 * Joystick handling for both mouse and touch input - MicromeX
	 */
	function setupJoystick() {
		const joystickBase = document.getElementById('joystickBase');
		const joystickThumb = document.getElementById('joystickThumb');

		maxDistance = joystickBase.offsetWidth / 2;

		joystickThumb.addEventListener('mousedown', startDrag);
		joystickThumb.addEventListener('touchstart', startDrag);
	}

	function startDrag(event) {
		event.preventDefault();

		const touch = event.touches ? event.touches[0] : event;

		// Dynamically calculate the center of the joystick
		const rect = joystickBase.getBoundingClientRect();
		centerX = rect.left + rect.width / 2;
		centerY = rect.top + rect.height / 2;

		document.addEventListener('mousemove', moveJoystick);
		document.addEventListener('mouseup', stopDrag);
		document.addEventListener('touchmove', moveJoystick);
		document.addEventListener('touchend', stopDrag);

		moveJoystick(touch); // Trigger initial movement
		startMovement(); // Start periodic movement updates
	}

	function moveJoystick(event) {
		const touch = event.touches ? event.touches[0] : event;

		const deltaX = touch.clientX - centerX;
		const deltaY = touch.clientY - centerY;

		const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
		const angle = Math.atan2(deltaY, deltaX);

		const offsetX = Math.cos(angle) * distance;
		const offsetY = Math.sin(angle) * distance;

		joystickThumb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

		// Normalize movement (-1 to 1)
		normalizedX = offsetX / maxDistance;
		normalizedY = -offsetY / maxDistance;
	}

	function stopDrag() {
		joystickThumb.style.transform = 'translate(0, 0)'; // Reset to center
		normalizedX = 0; // Reset normalized values
		normalizedY = 0;

		stopMovement(); // Stop periodic movement updates

		document.removeEventListener('mousemove', moveJoystick);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('touchmove', moveJoystick);
		document.removeEventListener('touchend', stopDrag);
	}

	function startMovement() {
		const tileSize = 3; // Number of tiles to move per step

		// Clear any existing timer to prevent duplicates
		if (movementTimer) {
			clearInterval(movementTimer);
		}

		// Function to execute movement logic
		const executeMove = () => {
			if (normalizedX !== 0 || normalizedY !== 0) {
				moveCharacter(normalizedX, normalizedY, tileSize);
			}
		};

		// execute immediately
		executeMove();

		// Start interval for continuous movement
		movementTimer = setInterval(executeMove, 100); // 100ms interval for smooth movement
	}

	function stopMovement() {
		if (movementTimer) {
			clearInterval(movementTimer);
			movementTimer = null;
		}
	}

	/**
	 * Moves the character to a new tile and waits for the movement to complete.
	 * @param {number} x - Normalized x-axis input (-1 to 1)
	 * @param {number} y - Normalized y-axis input (-1 to 1)
	 * @param {number} tileSize - The size of each tile in the game world
	 * @returns {Promise} Resolves when the character finishes moving
	 */
	function moveCharacter(x, y, tileSize) {
		const player = Session.Entity;

		if (!player) {
			return;
		}

		// Correct direction inversion by reversing the rotation angle
		direction[0] = x;
		direction[1] = y;

		// Reverse the angle of rotation for proper alignment
		mat2.identity(rotate);
		mat2.rotate(rotate, rotate, ((-Camera.direction * 45) / 180) * Math.PI);

		vec2.transformMat2(direction, direction, rotate);

		// Calculate the new position
		const newPos = [
			Math.round(player.position[0] + direction[0] * tileSize),
			Math.round(player.position[1] + direction[1] * tileSize)
		];

		const dest = [0, 0];

		// Search for a valid cell within range 5 of the target position
		if (checkFreeCell(newPos[0], newPos[1], 5, dest)) {
			// Check if the target position has changed
			if (targetPos[0] !== dest[0] || targetPos[1] !== dest[1]) {
				targetPos[0] = dest[0];
				targetPos[1] = dest[1];

				// Check the packet version and create the appropriate move packet
				let movePacket;
				if (PACKETVER.value >= 20180307) {
					movePacket = new PACKET.CZ.REQUEST_MOVE2(); // Use the newer packet structure
				} else {
					movePacket = new PACKET.CZ.REQUEST_MOVE(); // Use the older packet structure
				}

				// Set the destination for the move packet
				movePacket.dest[0] = dest[0];
				movePacket.dest[1] = dest[1];

				// Send the packet to the server
				Network.sendPacket(movePacket);
			}
		}
	}

	/**
	 * Talk to NPC Button Function - MicromeX
	 */

	function setupTalkToNpcButton() {
		const talkButton = document.getElementById('talktonpcButton');

		// Function to find the nearest NPC within 2 tiles
		function findNearestNpc() {
			const player = Session.Entity;

			if (!player) {
				return null;
			}

			let nearestNpc = null;
			let minDistance = 3; // Minimum distance in tiles (3 tiles)

			// Iterate through all entities to find the nearest NPC
			EntityManager.forEach(entity => {
				if (entity.objecttype === entity.constructor.TYPE_NPC) {
					const dx = entity.position[0] - player.position[0];
					const dy = entity.position[1] - player.position[1];
					const distance = Math.sqrt(dx ** 2 + dy ** 2);

					// Check if the NPC is within 2 tiles and closer than the current nearest NPC - MicromeX
					if (distance <= minDistance) {
						minDistance = distance;
						nearestNpc = entity;
					}
				}
			});

			return nearestNpc;
		}

		// Function to talk to the nearest NPC - MicromeX
		function talkToNearestNpc() {
			const nearestNpc = findNearestNpc();

			if (!nearestNpc) {
				return;
			}

			// Send the contact NPC packet
			const talkPacket = new PACKET.CZ.CONTACTNPC();
			talkPacket.NAID = nearestNpc.GID; // Target the NPC's GID - MicromeX

			Network.sendPacket(talkPacket);
		}

		// Add event listener to the button
		talkButton.addEventListener('click', talkToNearestNpc);
	}

	/**
	 * Search free cells around a position
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} range
	 * @param {array} out
	 */
	function checkFreeCell(x, y, range, out) {
		var _x, _y, r;
		var d_x = Session.Entity.position[0] < x ? -1 : 1;
		var d_y = Session.Entity.position[1] < y ? -1 : 1;

		// Search possible positions
		for (r = 0; r <= range; ++r) {
			for (_x = -r; _x <= r; ++_x) {
				for (_y = -r; _y <= r; ++_y) {
					if (isFreeCell(x + _x * d_x, y + _y * d_y)) {
						out[0] = x + _x * d_x;
						out[1] = y + _y * d_y;
						return true;
					}
				}
			}
		}

		return false;
	}

	/**
	 * Does a cell is free (walkable, and no entity on)
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {returns} is free
	 */
	function isFreeCell(x, y) {
		if (!(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE)) {
			return false;
		}

		var free = true;

		EntityManager.forEach(function (entity) {
			if (
				entity.objecttype != entity.constructor.TYPE_EFFECT &&
				entity.objecttype != entity.constructor.TYPE_UNIT &&
				entity.objecttype != entity.constructor.TYPE_TRAP &&
				Math.round(entity.position[0]) === x &&
				Math.round(entity.position[1]) === y
			) {
				free = false;
				return false;
			}

			return true;
		});

		return free;
	}

	/**
	 * Apply preferences once append to body
	 */
	MobileUI.onAppend = function onAppend() {
		// Apply preferences
		if (Session.isTouchDevice) {
			this.ui.show();
		} else {
			this.ui.hide();
		}

		this.ui.css({
			top: 0,
			left: 0,
			zIndex: 1000,
			width: Renderer.width,
			height: Renderer.height
		});
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	MobileUI.onShortCut = function onShortCut(key) {
		switch (key.cmd) {
			case 'SHOW':
				Session.isTouchDevice = true; // Fake it to make it :D
				this.show();
				break;
			case 'TOGGLE':
				toggleButtons();
				break;
			case 'TG':
				toggleTouchTargeting();
				break;
			case 'AT':
				toggleAutoTargeting();
				break;
			case 'ATK':
				attackTargeted();
				break;
		}
	};

	/**
	 * Removes MobileUI
	 */
	MobileUI.onRemove = function onRemove() {
		// Save preferences
		_preferences.y = 0;
		_preferences.x = 0;
		_preferences.zIndex = 1000;
		_preferences.width = Renderer.width;
		_preferences.height = Renderer.height;
		_preferences.save();

		if (Session.AutoTargeting) {
			toggleAutoTargeting();
		}
	};

	/**
	 * Shows MobileUI
	 */
	MobileUI.show = function show() {
		this.ui.show();
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(MobileUI);
});
