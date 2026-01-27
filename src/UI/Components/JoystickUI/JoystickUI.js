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
	var GraphicsSettings = require('Preferences/Graphics');

	var Inventory = require('UI/Components/Inventory/Inventory');
	var SkillList = require('UI/Components/SkillList/SkillList');

	var JoystickUI = new UIComponent('JoystickUI', htmlText, cssText);

	var gamepadTimer = null;
	var isGamepadActive = false;
	var _list = [];
	var currentSet = 1;

	var direction = glMatrix.vec2.create();
	var rotate = glMatrix.mat2.create();
	var moveInterval = null;
	var setChangeInterval = null;
	var ClickInterval = null;

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

	JoystickUI.onAppend = function onAppend() {};

	function isInCharSelect() {
		return jQuery('#CharSelect, #CharSelectV2, #CharSelectV3, #CharSelectV4').is(':visible');
	}

	function getCharSelectComponent() {
		return require('UI/Components/CharSelect/CharSelect').getUI();
	}

	function selectCurrentChar() {
		var charSelect = getCharSelectComponent();
		if (!charSelect) return;

		var eventOptions = {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: Mouse.screen.x,
			clientY: Mouse.screen.y,
			which: 1
		};

		var el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);
		if (el) {
			el.dispatchEvent(new MouseEvent('mousedown', eventOptions));
			setTimeout(function () {
				el.dispatchEvent(new MouseEvent('mouseup', eventOptions));
				el.dispatchEvent(new MouseEvent('click', eventOptions));
			}, 100);
		}
	}

	function updateJoystickSlot(joystickSlotIndex, shortcutIndex) {
		var item = ShortCut.getList()[shortcutIndex];
		var $slot = JoystickUI.ui.find('.slot').eq(joystickSlotIndex);

		var $label = $slot.find('.key-label').detach();
		$slot.empty().append($label);

		if (!item || item.ID <= 1) return;

		$slot.find('.icon').remove();

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
			var inventoryItem = Inventory.getUI().getItemById(item.ID);
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
			// R1 group (slots 12-15): Y, X, B, A  
			13, 14, 15, 16,
			// R2 group (slots 16-19): Y, X, B, A  
			9, 10, 11, 12,

			// Set 2 mapping  
			// L1 group (slots 20-23): Y, X, B, A  
			18, 19, 20, 21,
			// L2 group (slots 24-27): Y, X, B, A  
			22, 23, 24, 25,
			// L1R1 group (slots 28-31): Y, X, B, A  
			8, 17, 26, 35,
			// R1 group (slots 32-35): Y, X, B, A  
			31, 32, 33, 34,
			// R2 group (slots 36-39): Y, X, B, A  
			27, 28, 29, 30
		];
		for (var i = 0; i < 20; i++) {
			updateJoystickSlot(i, slotMapping[startIdx + i]);
		}
	};

	JoystickUI.setupShortcutSync = function () {
		var oldonUpdate = ShortCut.onChange;
		ShortCut.onChange = function () {
			oldonUpdate.call(ShortCut);
			JoystickUI.fullSync();
		};
		var oldSetList = ShortCut.setList;
		ShortCut.setList = function (list) {
			oldSetList.call(ShortCut, list);
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

	function getLowestHpEntity(player, entityType) {
		var lowestHpEntity = null;
		var lowestHp = Infinity;

		EntityManager.forEach(function (entity) {
			if (entity.objecttype === entityType &&
				entity.life &&
				entity.life.hp > 0 &&
				entity.life.hp < entity.life.hp_max) {

				var distance = vec2.distance(player.position, entity.position);
				if (distance <= player.attack_range && entity.life.hp < lowestHp) {
					lowestHp = entity.life.hp;
					lowestHpEntity = entity;
				}
			}
		});

		return lowestHpEntity;
	}

	function attackTargeted() {
		if (!Session.Entity) {
			return;
		}

		var Player = Session.Entity;
		var Entity = Player.constructor;
		var attackMode = GraphicsSettings.attackTargetMode || 0;
		var targetEntity = null;
		if (attackMode === 1) { // LOWEST_HP   
			targetEntity = getLowestHpEntity(Player, Entity.TYPE_MOB);
			if (!targetEntity) {
				targetEntity = getLowestHpEntity(Player, Entity.TYPE_PC);
			}
		} else { // CLOSEST
			targetEntity = EntityManager.getClosestEntity(Player, Entity.TYPE_MOB);
			if (!targetEntity) {
				targetEntity = EntityManager.getClosestEntity(Player, Entity.TYPE_PC);
			}
		}
		if (!targetEntity) return;
		var entityFocus = EntityManager.getFocusEntity();
		if (!entityFocus || entityFocus.action === entityFocus.ACTION.DIE) { //If no target, try picking one first
			entityFocus = EntityManager.getFocusEntity();
		}
		if (entityFocus && targetEntity.GID !== entityFocus.GID) {
			entityFocus.onFocusEnd();
			EntityManager.setFocusEntity(null);

			targetEntity.onFocus();
			EntityManager.setFocusEntity(targetEntity);
		} else if (!entityFocus) {
			targetEntity.onFocus();
			EntityManager.setFocusEntity(targetEntity);
		} else {
			return;
		}



		var main = Session.Entity;
		var pkt;



		if (!entityFocus) return;
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
		if (ClickInterval) {
			clearInterval(ClickInterval);
			ClickInterval = null;
		}
	}

	function stopSetChangeInterval() {
		if (setChangeInterval) {
			clearInterval(setChangeInterval);
			setChangeInterval = null;
		}
	}

	function leftClick() {
		if (isInCharSelect()) {
			selectCurrentChar();
			return;
		}
		var el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);
		var isCanvas = el && el.tagName.toLowerCase() === 'canvas';

		if (!el || isCanvas) {
			handleWorldLeftClick();
			return;
		}
		var draggableElement = el.closest('.item, .skill');
		if (draggableElement) {
			var index = parseInt(draggableElement.getAttribute('data-index'), 10);
			var isSkill = draggableElement.closest('.skill');
			if (!isSkill) {
				var item = Inventory.getUI().getItemByIndex(index);
				if (item) Inventory.getUI().useItem(item);
			} else {
				var item = SkillList.getUI().getSkillById(index);
				if (item) SkillList.getUI().useSkillID(item.SKID, item.selectedLevel ? item.selectedLevel : item.level);
			}
			return;
		}

		var eventOptions = {
			bubbles: true,
			cancelable: true,
			view: window,
			clientX: Mouse.screen.x,
			clientY: Mouse.screen.y,
			which: 1
		};

		el.dispatchEvent(new MouseEvent('mousedown', eventOptions));
		ClickInterval = setTimeout(function () {
			el.dispatchEvent(new MouseEvent('mouseup', eventOptions));
			el.dispatchEvent(new MouseEvent('click', eventOptions));
			stopClickInterval();
		}, 100);

	}

	function getJoystickComboForSlot(slotIndex) {

		var combos = {
			0: 'L1+Y',
			1: 'L1+X',
			2: 'L1+B',
			3: 'L1+A',
			4: 'L2+Y',
			5: 'L2+X',
			6: 'L2+B',
			7: 'L2+A',
			8: 'L1+R1+Y',

			9: 'R1+Y',
			10: 'R1+X',
			11: 'R1+B',
			12: 'R1+A',
			13: 'R2+Y',
			14: 'R2+X',
			15: 'R2+B',
			16: 'R2+A',
			17: 'L1+R1+X',

			18: 'L1+Y (Set2)',
			19: 'L1+X (Set2)',
			20: 'L1+B (Set2)',
			21: 'L1+A (Set2)',
			22: 'L2+Y (Set2)',
			23: 'L2+X (Set2)',
			24: 'L2+B (Set2)',
			25: 'L2+A (Set2)',
			26: 'L1+R1+B',

			27: 'R1+Y (Set2)',
			28: 'R1+X (Set2)',
			29: 'R1+B (Set2)',
			30: 'R1+A (Set2)',
			31: 'R2+Y (Set2)',
			32: 'R2+X (Set2)',
			33: 'R2+B (Set2)',
			34: 'R2+A (Set2)',
			35: 'L1+R1+A'
		};

		return combos[slotIndex];
	}

	function showShortcutSelection(itemData) {

		var selectionUI = jQuery('<div id="shortcut-selection">' +
			'<h3>Select slot for ' + itemData.name + '</h3>' +
			'<div class="tab-container">' +
			'<div class="tab-buttons"></div>' +
			'<div class="shortcut-grid"></div>' +
			'</div>' +
			'<div style="margin-top: 15px; font-size: 12px; text-align: center; opacity: 0.8;">' +
			'    Use L1/R1 to change tab, D-pad to navigate slot, A to select, B to cancel' +
			'</div>' +
			'</div>');

		selectionUI.css({
			position: 'fixed',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			background: 'rgba(0,0,0,0.95)',
			border: '2px solid #fff',
			padding: '20px',
			zIndex: 10000,
			color: 'white',
			minWidth: '780px',
			boxShadow: '0 0 20px rgba(0,0,0,0.5)',
			borderRadius: '8px'
		});


		jQuery('body').append(selectionUI);


		var tabContainer = selectionUI.find('.tab-container');
		var tabButtons = selectionUI.find('.tab-buttons');
		var grid = selectionUI.find('.shortcut-grid');


		tabButtons.css({
			display: 'flex',
			gap: '5px',
			marginBottom: '10px'
		});

		grid.css({
			display: 'grid',
			gridTemplateColumns: 'repeat(9, 1fr)',
			gap: '8px',
			justifyContent: 'center',
			padding: '10px',
			background: 'rgba(255,255,255,0.05)',
			borderRadius: '5px'
		});


		for (var t = 0; t < 4; t++) {
			var tabBtn = jQuery('<button class="tab-btn" data-tab="' + t + '">Tab ' + (t + 1) + '</button>');
			tabBtn.css({
				padding: '5px 10px',
				background: t === 0 ? '#ff6600' : '#666',
				border: '1px solid #fff',
				color: 'white',
				cursor: 'pointer'
			});
			tabButtons.append(tabBtn);
		}

		var currentTab = 0;
		var slotInTab = 0;

		function updateGrid() {
			grid.empty();
			var startIdx = currentTab * 9;

			for (var i = 0; i < 9; i++) {
				var globalIndex = startIdx + i;
				var slot = ShortCut.getList()[globalIndex];
				var isEmpty = !slot || (!slot.isSkill && !slot.ID);

				var joystickCombo = getJoystickComboForSlot(globalIndex);
				var displayText = joystickCombo || (i + 1);

				var slotDiv = jQuery('<div class="slot-btn" data-index="' + i + '">' + displayText + '</div>');

				slotDiv.css({
					width: '75px',
					height: '60px',
					border: '2px solid #555',
					background: isEmpty ? '#222' : '#555',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '11px',
					fontWeight: 'bold',
					cursor: 'pointer',
					color: 'white',
					transition: 'all 0.1s',
					borderRadius: '5px',
					textAlign: 'center',
					lineHeight: '1.2',
					padding: '5px',
					boxSizing: 'border-box'
				});

				grid.append(slotDiv);
			}

			updateSelection();
		}

		function updateSelection() {
			grid.find('.slot-btn').removeClass('selected').css('background', '#333');

			grid.find('.slot-btn[data-index="' + slotInTab + '"]')
				.addClass('selected').css('background', '#ff6600');
		}

		function updateTabButtons() {
			tabButtons.find('.tab-btn').css('background', '#666');
			tabButtons.find('.tab-btn[data-tab="' + currentTab + '"]').css('background', '#ff6600');
		}

		updateGrid();
		updateTabButtons();

		window._shortcutSelectionActive = true;
		window._shortcutSelectionData = itemData;

		function closeSelection() {
			selectionUI.remove();
			window._shortcutSelectionActive = false;
			window._shortcutSelectionData = null;
		}

		function selectSlot() {
			var row = (currentTab * 9) + slotInTab;

			ShortCut.removeElement(true, itemData.ID, row, itemData.value);
			ShortCut.addElement(row, itemData.isSkill, itemData.ID, itemData.value);
			ShortCut.onChange(row, itemData.isSkill, itemData.ID, itemData.value);
			closeSelection();
		}

		window._tempGamepadHandler = function (gamepad) {
			var buttons = gamepad.buttons;

			if (buttons[0].pressed) { // A - select  
				setClickInterval();
				selectSlot();
				return true;
			}

			if (buttons[1].pressed) { // B - cancel  
				setClickInterval();
				closeSelection();
				return true;
			}

			if (buttons[6].pressed) { // L2  
				setClickInterval();
				if (currentTab > 0) {
					currentTab--;
					slotInTab = 0;
					updateGrid();
					updateTabButtons();
				}
				return true;
			}

			if (buttons[7].pressed) { // R2 
				setClickInterval();
				if (currentTab < 4) {
					currentTab++;
					slotInTab = 0;
					updateGrid();
					updateTabButtons();
				}
				return true;
			}

			if (buttons[12].pressed) { // D-pad up  
				setClickInterval();
				if (slotInTab >= 3) {
					slotInTab -= 3;
					updateSelection();
				}
				return true;
			}

			if (buttons[13].pressed) { // D-pad down  
				setClickInterval();
				if (slotInTab < 6) {
					slotInTab += 3;
					updateSelection();
				}
				return true;
			}

			if (buttons[14].pressed) { // D-pad left  
				setClickInterval();
				if (slotInTab > 0) {
					slotInTab--;
					updateSelection();
				}
				return true;
			}

			if (buttons[15].pressed) { // D-pad right  
				setClickInterval();
				if (slotInTab < 8) {
					slotInTab++;
					updateSelection();
				}
				return true;
			}

			return false;
		};
	}

	function rightClick() {
		var el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);
		var isCanvas = el && el.tagName.toLowerCase() === 'canvas';

		if (!el) {
			handleWorldRightClick();
			return;
		}
		var draggableElement = el.closest('.item, .skill');

		if (draggableElement) {
			var index = parseInt(draggableElement.getAttribute('data-index'), 10);
			var isSkill = draggableElement.closest('.skill');
			var itemData;

			if (!isSkill) {
				var item = Inventory.getUI().getItemByIndex(index);
				if (item) {
					itemData = {
						isSkill: false,
						ID: item.ITID,
						value: item.count,
						name: require('DB/DBManager').getItemName(item)
					};
				}
			} else {
				var skill = SkillList.getUI().getSkillById(index);
				if (skill) {
					itemData = {
						isSkill: true,
						ID: skill.SKID,
						value: skill.selectedLevel ? skill.selectedLevel : skill.level,
						name: require('DB/Skills/SkillInfo')[skill.SKID].SkillName
					};
				}
			}

			if (itemData) {
				showShortcutSelection(itemData);
			}

			setClickInterval();
		}
	}

	function handleWorldLeftClick() {
		if (!Mouse.intersect) Mouse.intersect = true;
		jQuery(Renderer.canvas).trigger({
			type: 'mousedown',
			which: 1
		});

		ClickInterval = setTimeout(function () {
			jQuery(Renderer.canvas).trigger({
				type: 'mouseup',
				which: 1
			});
			stopClickInterval();
		}, 200);
	}

	function handleWorldRightClick() {
		if (!Mouse.intersect) Mouse.intersect = true;
		jQuery(Renderer.canvas).trigger({
			type: 'mousedown',
			which: 3
		});

		ClickInterval = setTimeout(function () {
			jQuery(Renderer.canvas).trigger({
				type: 'mouseup',
				which: 3
			});
			stopClickInterval();
		}, 200);
	}

	function setClickInterval() {
		ClickInterval = setTimeout(function () {
			stopClickInterval();
		}, 200);
	}

	function navigateDraggableItems(direction) {
		var el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);

		var container = el.closest('.container, .content, .inventory, .skill_list, .item, .skill');

		if (!container) {
			// Fall back to regular arrow key navigation  
			var keyCode;
			switch (direction) {
				case 'up':
					keyCode = 38;
					break;
				case 'down':
					keyCode = 40;
					break;
				case 'left':
					keyCode = 37;
					break;
				case 'right':
					keyCode = 39;
					break;
			}
			jQuery(document).trigger({
				type: 'keydown',
				which: keyCode
			});
			return;
		}

		var $container = jQuery(container);
		var allDraggables = $container.find('.item, .skill');

		if (allDraggables.length === 0) {
			allDraggables = jQuery('.item:visible, .skill:visible');

		}

		// Check if we're in a skill container by looking for skill-specific structure  
		var isSkillContainer = container.id && container.id.indexOf('positionSkills') === 0 ||
			container.querySelector('#positionSkills1, #positionSkills2, #positionSkills3, #positionSkills4, #positionSkills5') ||
			container.closest('.skillCol') !== null;

		var draggableElement = container.closest('.item, .skill');

		var currentIndex = allDraggables.index(draggableElement);
		var newIndex = currentIndex;

		// Use fixed grid width based on container type  
		var GRID_WIDTH;
		if (isSkillContainer) {
			// Skills always use fixed 7-column grid  
			GRID_WIDTH = 7;
		} else {
			// Items: calculate based on container width and icon size  
			var containerWidth = $container.width() || 200;
			var iconElement = jQuery(draggableElement).find('.icon');
			var iconWidth = iconElement.width() || 24; // .icon has fixed 24px width  
			var iconMargin = 4; // margin from CSS: margin: 4px 4px 4px 4px  
			var totalIconWidth = iconWidth + (iconMargin * 2);
			GRID_WIDTH = Math.max(6, Math.min(8, Math.floor(containerWidth / totalIconWidth)));
		}

		switch (direction) {
			case 'up':
				newIndex = currentIndex - GRID_WIDTH;
				break;
			case 'down':
				newIndex = currentIndex + GRID_WIDTH;
				break;
			case 'left':
				newIndex = currentIndex - 1;
				break;
			case 'right':
				newIndex = currentIndex + 1;
				break;
		}

		// Bounds checking  
		newIndex = Math.max(0, Math.min(allDraggables.length - 1, newIndex));

		if (newIndex !== currentIndex && newIndex < allDraggables.length) {
			var targetElement = allDraggables.eq(newIndex);
			var targetOffset = targetElement.offset();

			if (targetOffset) {
				var targetCenterX = targetOffset.left + (targetElement.outerWidth() / 2);
				var targetCenterY = targetOffset.top + (targetElement.outerHeight() / 2);

				// Move mouse to target element  
				Mouse.screen.x = targetCenterX;
				Mouse.screen.y = targetCenterY;

				var _selector = document.querySelector('.cursor');
				if (_selector) {
					_selector.style.left = targetCenterX + 'px';
					_selector.style.top = targetCenterY + 'px';
				}
			}
		}
	}

	function processGamepadButtons(gamepad) {

		if (ClickInterval)
			return false;

		if (window._shortcutSelectionActive && window._tempGamepadHandler) {
			return window._tempGamepadHandler(gamepad);
		}

		var buttons = gamepad.buttons;
		var buttonActive = false;

		if (isInCharSelect()) {

			if (buttons[0].pressed) { // A  
				selectCurrentChar();
				setClickInterval();
				return true;
			}

			if (buttons[9].pressed) { // Start  
				var charSelect = getCharSelectComponent();
				if (charSelect && charSelect.ui.find('.ok').length > 0) {
					charSelect.ui.find('.ok').click();
				}
				setClickInterval();
				return true;
			}

			return false;
		}
		var selectPressed = buttons[8].pressed;

		if (selectPressed) {
			if (buttons[12].pressed) { // D-pad Up
				Camera.setZoom(-2);
				setClickInterval();
				return true;
			}
			if (buttons[13].pressed) { // D-pad Down
				Camera.setZoom(2);
				setClickInterval();
				return true;
			}
			if (buttons[14].pressed) { // D-pad Left
				Camera.angleFinal[1] -= 5;
				Camera.updateState();
				Camera.save();
				setClickInterval();
				return true;
			}
			if (buttons[15].pressed) { // D-pad Right  
				Camera.angleFinal[1] += 5;
				Camera.updateState();
				Camera.save();
				setClickInterval();
				return true;
			}
			if (buttons[9].pressed) { // Start button    
				jQuery(document).trigger({
					type: 'keydown',
					which: 27
				}); // Esc    
				setClickInterval();
				return true;
			}
			var el = document.elementFromPoint(Mouse.screen.x, Mouse.screen.y);
			var draggableElement = el.closest('.item, .skill');

			if (el && draggableElement) {
				var contextMenuEvent = new MouseEvent('contextmenu', {
					bubbles: true,
					cancelable: true,
					view: window,
					clientX: Mouse.screen.x,
					clientY: Mouse.screen.y,
					which: 3
				});

				el.dispatchEvent(contextMenuEvent);
				setClickInterval();
				return true;
			}
		}


		if (buttons[12].pressed) { // D-pad Up      
			navigateDraggableItems('up');
			setClickInterval();
			return true;
		}
		if (buttons[13].pressed) { // D-pad Down        
			navigateDraggableItems('down');
			setClickInterval();
			return true;
		}
		if (buttons[14].pressed) { // D-pad Left      
			navigateDraggableItems('left');
			setClickInterval();
			return true;
		}
		if (buttons[15].pressed) { // D-pad Right      
			navigateDraggableItems('right');
			setClickInterval();
			return true;
		}

		if (buttons[9].pressed) { // Start button    
			jQuery(document).trigger({
				type: 'keydown',
				which: 13
			}); // Enter    
			setClickInterval();
			return true;
		}

		// Xbox mapping: 0=A, 1=B, 2=X, 3=Y, 4=LB, 5=RB, 6=LT, 7=RT  
		var l1 = buttons[4] ? buttons[4].pressed : false;
		var r1 = buttons[5] ? buttons[5].pressed : false;
		var l2 = buttons[6] ? buttons[6].pressed : false;
		var r2 = buttons[7] ? buttons[7].pressed : false;

		// L2+R2 change skill set
		if (l2 && r2 && !setChangeInterval) {
			if (currentSet === 1) {
				setChangeInterval = setTimeout(function () {
					currentSet = 2;
					updateSetIndicator();
					JoystickUI.fullSync();
					stopSetChangeInterval();
				}, 200);
				return true;
			} else {
				setChangeInterval = setTimeout(function () {
					currentSet = 1;
					updateSetIndicator();
					JoystickUI.fullSync();
					stopSetChangeInterval();
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
				setClickInterval();
				return true;

			}

			if (buttons[3].pressed) { // Y 
				toggleGetItem();
				setClickInterval();
				return true;

			}
		}

		var shortcutIndex = getShortcutIndex(l1, r1, l2, r2, buttons);
		if (shortcutIndex !== -1) {
			executeShortcut(shortcutIndex);
			setClickInterval();
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
					if (!isGamepadActive && JoystickUI.ui) {
						JoystickUI.ui.css('display', 'flex');
						JoystickUI.show();
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
				startMovement();
				return true;
			} else {
				normalizedX = 0;
				normalizedY = 0;
			}
		}

		if (gamepad.axes.length >= 4) {
			var deadzone = 0.10;
			var rightX = gamepad.axes[2];
			var rightY = gamepad.axes[3];
			if (Math.abs(rightX) > deadzone || Math.abs(rightY) > deadzone) {
				mouseDeltaX = rightX * 25;
				mouseDeltaY = rightY * 25;

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
		}, 150);
		setTimeout(function () {
			stopMovement();
		}, 400); // default client walkdelay
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
			if (!JoystickUI.ui || !JoystickUI.ui.is(':visible')) {
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
		gamepadTimer = setInterval(checkGamepadInput, 60);
	}

	function stopGamepadPolling() {
		if (gamepadTimer) {
			clearInterval(gamepadTimer);
			gamepadTimer = null;
		}
	}

	function setupControllerConnection() {
		window.addEventListener('gamepadconnected', function () {
			if (JoystickUI.ui) {
				JoystickUI.ui.css('display', 'flex');
				JoystickUI.show();
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
		if (!this.__loaded) {
			this.prepare();
		}
		if (!gamepadTimer) {
			startGamepadPolling();
			setupControllerConnection();
		}
		setupMouseHide();
	};

	JoystickUI.onRemove = function onRemove() {
		stopGamepadPolling();
		stopMovement();
		jQuery(document).off('mousemove.joystick');
	};

	JoystickUI.init = function init() {
		setupMouseHide();
		setupControllerConnection();
		JoystickUI.setupShortcutSync();
		if (!gamepadTimer) {
			startGamepadPolling();
		}
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
