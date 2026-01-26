define(function (require) {
	'use strict';

	var jQuery = require('Utils/jquery');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Session = require('Engine/SessionStorage');
	var ShortCut = require('UI/Components/ShortCut/ShortCut');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var EntityManager = require('Renderer/EntityManager');
	var PACKETVER = require('Network/PacketVerManager');
	var DB = require('DB/DBManager');
	var Mouse = require('Controls/MouseEventHandler');
	var Renderer = require('Renderer/Renderer');
	var glMatrix = require('Vendors/gl-matrix');
	var Camera = require('Renderer/Camera');
	var PathFinding = require('Utils/PathFinding');
	var Client = require('Core/Client');
	var htmlText = require('text!./JoystickUI.html');
	var cssText = require('text!./JoystickUI.css');

	var JoystickUI = new UIComponent('JoystickUI', htmlText, cssText);

	var gamepadTimer = null;
	var isGamepadActive = false;
	var _list = [];
	var currentSet = 1;

	var direction = glMatrix.vec2.create();
	var rotate = glMatrix.mat2.create();
	var moveInterval = null;
	var setChangeInterval = null;
	var moveClickInterval = null;
	var mouseDeltaX = 0;
	var mouseDeltaY = 0;

	var normalizedX = 0;
	var normalizedY = 0;

	/**  
	 * Show JoystickUI element  
	 */
	JoystickUI.show = function show() {
		this.ui.show();
	};

	/**  
	 * Hide JoystickUI element  
	 */
	JoystickUI.hide = function hide() {
		this.ui.hide();
	};

	JoystickUI.onAppend = function onAppend() {
		this.ui.hide();
		JoystickUI.onRestore();
	};

	function updateJoystickSlot(joystickSlotIndex, shortcutIndex) {
		var item = ShortCut.getList()[shortcutIndex];
		var $slot = JoystickUI.ui.find('.slot').eq(joystickSlotIndex);

		var $label = $slot.find('.key-label').detach();
		$slot.empty().append($label);

		if (!item || item.ID <= 1) return;
		var $icon = jQuery(
			'<div class="icon">' +
			'<div class="img"></div>' +
			'<div class="amount"></div>' +
			'</div>'
		);
		if (item.isSkill) {
			var skillInfo = require('DB/Skills/SkillInfo')[item.ID];
			if (skillInfo) {
				Client.loadFile(DB.INTERFACE_PATH + 'item/' + skillInfo.Name + '.bmp', function (url) {
					$icon.find('.img').css('backgroundImage', 'url(' + url + ')');
					$icon.find('.amount').text(item.count);
					$slot.append($icon);
				});
			}
		} else {
			var inventoryItem = require('UI/Components/Inventory/Inventory').getUI().getItemById(item.ID);
			if (inventoryItem) {
				var itemInfo = DB.getItemInfo(item.ID);
				var fileName = inventoryItem.IsIdentified ?
					itemInfo.identifiedResourceName :
					itemInfo.unidentifiedResourceName;

				Client.loadFile(DB.INTERFACE_PATH + 'item/' + fileName + '.bmp', function (url) {
					$icon.find('.img').css('backgroundImage', 'url(' + url + ')');
					$icon.find('.amount').text(item.count);
					$slot.append($icon);
				});
			}
		}
	}

	JoystickUI.fullSync = function fullSync() {
		var startIdx = (currentSet === 1) ? 0 : 20;

		var slotMapping = [
			// L1 group (slots 0-3): Y, X, B, A  
			0, 1, 2, 3,
			// L2 group (slots 4-7): Y, X, B, A    
			4, 5, 6, 7,
			// L1R1 group (slots 8-11): Y, X, B, A  
			8, 17, 26, 35,
			// R2 group (slots 12-15): Y, X, B, A  
			9, 10, 11, 12,
			// R1 group (slots 16-19): Y, X, B, A  
			13, 14, 15, 16,

			// Set 2 mapping  
			// L1 group (slots 20-23): Y, X, B, A  
			18, 19, 20, 21,
			// L2 group (slots 24-27): Y, X, B, A  
			22, 23, 24, 25,
			// L1R1 group (slots 28-31): Y, X, B, A  
			8, 17, 26, 35,
			// R2 group (slots 32-35): Y, X, B, A  
			27, 28, 29, 30,
			// R1 group (slots 36-39): Y, X, B, A  
			31, 32, 33, 34
		];
		for (var i = 0; i < 20; i++) {
			updateJoystickSlot(i, slotMapping[startIdx + i]);
		}
	};

	JoystickUI.setupShortcutSync = function () {
		var oldonUpdate = ShortCut.onUpdate;
		ShortCut.onUpdate = function () {
			oldonUpdate.call(ShortCut);
			JoystickUI.fullSync();
		};

		var oldSetList = ShortCut.setList;
		ShortCut.setList = function (list) {
			oldSetList.call(ShortCut, list);
			JoystickUI.fullSync();
		};

		var oldsetElement = ShortCut.setElement;
		ShortCut.setElement = function (list) {
			oldsetElement.call(ShortCut);
			JoystickUI.fullSync();
		};
	};


	function updateVisuals(gamepad) {
		if (!JoystickUI.ui) return;

		var buttons = gamepad.buttons;
		// 4:L1, 5:R1, 6:L2, 7:R2
		var l1 = buttons[4] ? buttons[4].pressed : false;
		var r1 = buttons[5] ? buttons[5].pressed : false;
		var l2 = buttons[6] ? buttons[6].pressed : false;
		var r2 = buttons[7] ? buttons[7].pressed : false;

		var containers = JoystickUI.ui.find('.group-container');

		containers.removeClass('active');

		// L1R1 > L1 > R1 > L2 > R2
		if (l1 && r1) {
			JoystickUI.ui.find('[data-group="L1R1"]').addClass('active');
		} else if (l1) {
			JoystickUI.ui.find('[data-group="L1"]').addClass('active');
		} else if (r1) {
			JoystickUI.ui.find('[data-group="R1"]').addClass('active');
		} else if (l2) {
			JoystickUI.ui.find('[data-group="L2"]').addClass('active');
		} else if (r2) {
			JoystickUI.ui.find('[data-group="R2"]').addClass('active');
		}
	}

	function getShortcutIndex(l1, r1, l2, r2, buttons) {
		var tab = 1;
		var slot = -1;

		if (currentSet === 2) {
			if (l1 && r1 && (!l2 && !r2)) tab = 0;
			else if (l1 && (!r1 && !l2 && !r2)) tab = 3;
			else if (r1 && (!l1 && !l2 && !r2)) tab = 4;
			else if (l2 && (!r2 && !l1 && !r1)) tab = 3;
			else if (r2 && (!l2 && !l1 && !r1)) tab = 4;
		} else {
			if (l1 && r1 && (!l2 && !r2)) tab = 0;
			else if (l1 && (!r1 && !l2 && !r2)) tab = 1;
			else if (r1 && (!l1 && !l2 && !r2)) tab = 2;
			else if (l2 && (!r2 && !l1 && !r1)) tab = 1;
			else if (r2 && (!l2 && !l1 && !r1)) tab = 2;
		}


		if ((r1 || l1) && (!l2 && !r2)) {
			if (buttons[3].pressed) slot = 0; // Y -> slot 1  
			else if (buttons[2].pressed) slot = 1; // X -> slot 2  
			else if (buttons[1].pressed) slot = 2; // B -> slot 3  
			else if (buttons[0].pressed) slot = 3; // A -> slot 4  
		}

		if ((r2 || l2) && (!l1 && !r1)) {
			if (buttons[3].pressed) slot = 4; // Y -> slot 5  
			else if (buttons[2].pressed) slot = 5; // X -> slot 6  
			else if (buttons[1].pressed) slot = 6; // B -> slot 7  
			else if (buttons[0].pressed) slot = 7; // A -> slot 8  
		}

		if (l1 && r1 && !l2 && !r2) {
			if (buttons[3].pressed) {
				slot = 8;
				tab = 1;
			} // L1+R1+Y -> slot 9  
			else if (buttons[2].pressed) {
				slot = 8;
				tab = 2;
			} // L1+R1+X -> slot 9  
			else if (buttons[1].pressed) {
				slot = 8;
				tab = 3;
			} // L1+R1+B -> slot 9  
			else if (buttons[0].pressed) {
				slot = 8;
				tab = 4;
			} // L1+R1+A -> slot 9  
		}

		if (slot === -1) return -1;

		return (tab - 1) * 9 + slot;
	}

	function executeShortcut(index) {
		ShortCut.onShortCut({
			cmd: 'EXECUTE' + index
		});
	}

	function attackTargeted() {
		if (Session.Entity) {

			var Player = Session.Entity;
			var Entity = Player.constructor;

			var entityFocus = EntityManager.getFocusEntity();

			var closestEntity = EntityManager.getClosestEntity(Player, Entity.TYPE_MOB);
			if (!closestEntity)
				closestEntity = EntityManager.getClosestEntity(Player, Entity.TYPE_PC);
			if (closestEntity) {

				if (entityFocus && closestEntity.GID !== entityFocus.GID) {
					entityFocus.onFocusEnd();
					EntityManager.setFocusEntity(null);

					closestEntity.onFocus();
					EntityManager.setFocusEntity(closestEntity);
				} else if (!entityFocus) {
					closestEntity.onFocus();
					EntityManager.setFocusEntity(closestEntity);
				} else {
					//Same entity, nothing to do
				}
			}


			var main = Session.Entity;
			var pkt;

			var entityFocus = EntityManager.getFocusEntity();

			if (!entityFocus || entityFocus.action === entityFocus.ACTION.DIE) { //If no target, try picking one first
				entityFocus = EntityManager.getFocusEntity();
			}

			if (entityFocus) {
				var out = [];
				var count = PathFinding.search(
					main.position[0] | 0, main.position[1] | 0,
					entityFocus.position[0] | 0, entityFocus.position[1] | 0,
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
	}

	function toggleGetItem() {
		const player = Session.Entity;

		if (!player) {
			return;
		}

		// Find the nearest item
		const closestItem = EntityManager.getClosestEntity(player, EntityManager.TYPE_ITEM);

		if (!closestItem) {
			return;
		}

		// Check the packet version and create the appropriate packet
		let pickUpPacket;

		if (PACKETVER.value >= 20180307) {
			pickUpPacket = new PACKET.CZ.ITEM_PICKUP2();
		} else {
			pickUpPacket = new PACKET.CZ.ITEM_PICKUP();
		}

		pickUpPacket.ITAID = closestItem.GID;

		// Send the packet to the server
		Network.sendPacket(pickUpPacket);
	}

	function updateSetIndicator() {
		JoystickUI.ui.find('.set-btn').removeClass('active');
		JoystickUI.ui.find('.set-btn:nth-child(' + currentSet + ')').addClass('active');
	}

	function stopClickInterval() {
		if (moveClickInterval) {
			clearInterval(moveClickInterval);
			moveClickInterval = null;
		}
	}

	function stopSetChangeInterval() {
		if (setChangeInterval) {
			clearInterval(setChangeInterval);
			setChangeInterval = null;
		}
	}

	function leftClick() {
		if (moveClickInterval) return;
		if (!Mouse.intersect) {
			Mouse.intersect = true;
		}

		jQuery(Renderer.canvas).trigger({
			type: 'mousedown',
			which: 1
		});

		moveClickInterval = setInterval(function () {
			jQuery(Renderer.canvas).trigger({
				type: 'mouseup',
				which: 1
			});
		}, 100);
	}

	function rightClick() {
		if (moveClickInterval) return;
		if (!Mouse.intersect) {
			Mouse.intersect = true;
		}

		jQuery(Renderer.canvas).trigger({
			type: 'mousedown',
			which: 3
		});

		moveClickInterval = setInterval(function () {
			jQuery(Renderer.canvas).trigger({
				type: 'mouseup',
				which: 3
			});
		}, 100);
	}

	function processGamepadButtons(gamepad) {
		var buttons = gamepad.buttons;
		var buttonActive = false;

		// Xbox mapping: 0=A, 1=B, 2=X, 3=Y, 4=LB, 5=RB, 6=LT, 7=RT  
		var l1 = buttons[4] ? buttons[4].pressed : false;
		var r1 = buttons[5] ? buttons[5].pressed : false;
		var l2 = buttons[6] ? buttons[6].pressed : false;
		var r2 = buttons[7] ? buttons[7].pressed : false;

		if (!l2 || !r2) {
			stopSetChangeInterval();
		}

		if (!buttons[0].pressed && !buttons[1].pressed) {
			stopClickInterval();
		}
		// L2+R2 troca para set 2  
		if (l2 && r2) {
			if (currentSet === 1) {
				if (setChangeInterval) return false;
				setChangeInterval = setInterval(function () {
					currentSet = 2;
					updateSetIndicator();
					JoystickUI.fullSync();
				}, 200);
				return true;
			} else {
				if (setChangeInterval) return false;
				setChangeInterval = setInterval(function () {
					currentSet = 1;
					updateSetIndicator();
					JoystickUI.fullSync();
				}, 200);
				return true;
			}
		}
		if (!l1 && !r1 && !l2 && !r2) {
			if (buttons[0].pressed) { // A  
				leftClick();
				return true;

			}

			if (buttons[1].pressed) { // B
				rightClick();
				return true;

			}

			if (buttons[2].pressed) { // X
				attackTargeted();
				return true;

			}

			if (buttons[3].pressed) { // Y 
				toggleGetItem();
				return true;

			}
		}

		var shortcutIndex = getShortcutIndex(l1, r1, l2, r2, buttons);
		if (shortcutIndex !== -1) {
			executeShortcut(shortcutIndex);
			buttonActive = true;
		}

		return buttonActive;
	}

	function checkGamepadInput() {
		var gamepads = navigator.getGamepads();
		var anyConnected = false;

		for (var i = 0; i < gamepads.length; i++) {
			var gamepad = gamepads[i];
			if (gamepad) {
				anyConnected = true;
				var axisActive = processGamepadAxes(gamepad);
				var buttonActive = processGamepadButtons(gamepad);

				if (axisActive || buttonActive) {
					if (!isGamepadActive) {
						JoystickUI.ui.css('display', 'flex');
						isGamepadActive = true;
					}
				}
				updateVisuals(gamepad);
			}
		}
		if (!anyConnected) {
			isGamepadActive = false;
		}
	}

	function startMouseMovement() {
		moveMouse(mouseDeltaX, mouseDeltaY);
	}

	function moveMouse(deltaX, deltaY) {
		Mouse.screen.x = Math.max(0, Math.min(Renderer.width, Mouse.screen.x + deltaX));
		Mouse.screen.y = Math.max(0, Math.min(Renderer.height, Mouse.screen.y + deltaY));

		var _selector = document.querySelector('.cursor');
		if (_selector) {
			_selector.style.left = Mouse.screen.x + 'px';
			_selector.style.top = Mouse.screen.y + 'px';
		}
	}

	function processGamepadAxes(gamepad) {
		if (gamepad.axes.length >= 2) {
			var deadzone = 0.10;
			var leftX = gamepad.axes[0];
			var leftY = gamepad.axes[1];

			if (Math.abs(leftX) > deadzone || Math.abs(leftY) > deadzone) {
				normalizedX = leftX;
				normalizedY = -leftY;
				if (!moveInterval) startMovement();
				return true;
			} else {
				normalizedX = 0;
				normalizedY = 0;
				stopMovement();
			}
		}

		if (gamepad.axes.length >= 4) {
			var deadzone = 0.10;
			var rightX = gamepad.axes[2];
			var rightY = gamepad.axes[3];
			if (Math.abs(rightX) > deadzone || Math.abs(rightY) > deadzone) {
				mouseDeltaX = rightX * 50;
				mouseDeltaY = rightY * 50;

				startMouseMovement();
				return true;
			} else {
				mouseDeltaX = 0;
				mouseDeltaY = 0;
			}
		}

		return false;
	}

	function startMovement() {
		if (moveInterval) return;
		moveInterval = setInterval(function () {
			if (normalizedX !== 0 || normalizedY !== 0) {
				moveCharacter(normalizedX, normalizedY, 3);
			}
		}, 200); // default client walkdelay
	}

	function stopMovement() {
		if (moveInterval) {
			clearInterval(moveInterval);
			moveInterval = null;
		}
	}

	function moveCharacter(x, y, tileSize) {
		var player = Session.Entity;
		if (!player) return;
		direction[0] = x;
		direction[1] = y;
		glMatrix.mat2.identity(rotate);
		glMatrix.mat2.rotate(rotate, rotate, -Camera.direction * 45 / 180 * Math.PI);
		glMatrix.vec2.transformMat2(direction, direction, rotate);
		var newPos = [
			Math.round(player.position[0] + direction[0] * tileSize),
			Math.round(player.position[1] + direction[1] * tileSize),
		];
		var movePacket = (PACKETVER.value >= 20180307) ? new PACKET.CZ.REQUEST_MOVE2() : new PACKET.CZ.REQUEST_MOVE();
		movePacket.dest[0] = newPos[0];
		movePacket.dest[1] = newPos[1];
		Network.sendPacket(movePacket);
	}


	function setupMouseHide() {
		var lastMouseX = 0;
		var lastMouseY = 0;

		function onMouseMove(event) {
			if (!JoystickUI.ui.is(':visible')) {
				return;
			}

			var deltaX = Math.abs(event.clientX - lastMouseX);
			var deltaY = Math.abs(event.clientY - lastMouseY);

			if (deltaX > 5 || deltaY > 5) {
				JoystickUI.hide();
				isGamepadActive = false;
			}

			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}

		jQuery(document).on('mousemove.joystick', onMouseMove);
	}

	function startGamepadPolling() {
		gamepadTimer = setInterval(checkGamepadInput, 50);
	}

	function stopGamepadPolling() {
		if (gamepadTimer) {
			clearInterval(gamepadTimer);
			gamepadTimer = null;
		}
	}

	function setupDragDrop() {
		JoystickUI.ui.find('.slot').attr('draggable', 'true');
	}

	function setupControllerConnection() {
		window.addEventListener('gamepadconnected', function () {
			if (JoystickUI.ui) {
				JoystickUI.ui.css('display', 'flex');
				isGamepadActive = true;
			}
		});

		window.addEventListener('gamepaddisconnected', function () {
			if (JoystickUI.ui) {
				JoystickUI.ui.hide();
				isGamepadActive = false;
			}
		});
	}

	JoystickUI.onRestore = function onRestore() {
		if (!gamepadTimer) {
			startGamepadPolling();
			setupControllerConnection();
		}
	};

	JoystickUI.init = function init() {
		startGamepadPolling();
		setupMouseHide();
		setupControllerConnection();
		JoystickUI.setupShortcutSync();
	};

	JoystickUI.onRemove = function onRemove() {
		stopGamepadPolling();
		stopMovement();
		jQuery(document).off('mousemove.joystick');
	};


	/**  
	 * Process shortcut  
	 *  
	 * @param {object} key  
	 */
	JoystickUI.onShortCut = function onShortCut(key) {
		switch (key.cmd) {
			case 'TOGGLE':
				this.toggle();
				break;
		}
	};

	return UIManager.addComponent(JoystickUI);
});
