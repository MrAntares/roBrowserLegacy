/**
 * UI/Components/JoystickUI/JoystickInteractionService.js
 *
 * Acts as the bridge between input signals and game actions. 
 * Orchestrates shortcut execution, mouse emulation, camera controls, 
 * and character interactions.
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var ShortCut = require('UI/Components/ShortCut/ShortCut');
	var InventoryUI = require('UI/Components/Inventory/Inventory');
	var ItemType = require('DB/Items/ItemType');
	var Character = require('./JoystickCharacterControl');
	var Target = require('./JoystickTargetService');
	var Cursor = require('./JoystickMouseCursorAdapter');
	var jQuery = require('Utils/jquery');
	var ControlsSettings = require('Preferences/Controls');
	var SelectionUI = require('./JoystickSelectionUI');

	return {
		prepare: function () {},

		dispose: function () {},

		cancelQuick: false,

		executeShortcut: function (index, group) {
			var shortcut = ShortCut.getList()[index];
			if (!shortcut) return;

			if (!shortcut.isSkill) {
				var item = InventoryUI.getUI().getItemById(shortcut.ID);
				if (!item || item.count === 0) return;
			} // Move mouse to target entity position  
			else if (ControlsSettings.attackTargetMode) {
				var targetEntity = Target.getEntity();
				if (targetEntity) {
					Cursor.moveMouseToEntity(targetEntity);
				}
			}

			ShortCut.onShortCut({
				cmd: 'EXECUTE' + index
			});

			if (ControlsSettings.joyQuick === 2)
				Cursor.quickCastClick();
			else if (ControlsSettings.joyQuick === 1) {
				this.cancelQuick = false;

				function waitforRelease() {
					setTimeout(function () {
						var Input = require('./JoystickInputService');
						var ShortcutMapper = require('./JoystickShortcutMapper');

						var buttons = Input.buttonStates;
						if (ShortcutMapper.getGroup(buttons) !== group) {
							Cursor.quickCastClick();
						} else if (!this.cancelQuick)
							waitforRelease();
					}, 50);
				}
				waitforRelease();
			}
		},

		openSelectionWindow: function (draggableElement) {
			var index = parseInt(draggableElement.getAttribute('data-index'), 10);
			var isSkill = draggableElement.closest('.skill');
			var itemData;

			if (!isSkill) {
				var item = InventoryUI.getUI().getItemByIndex(index);
				if (item) {
					if (item.type === ItemType.UNKNOWN ||
						item.type === ItemType.ETC ||
						item.type === ItemType.CARD ||
						item.type === ItemType.PETEGG ||
						item.type === ItemType.PETARMOR)
						return false;

					itemData = {
						isSkill: false,
						ID: item.ITID,
						value: item.count,
						name: require('DB/DBManager').getItemName(item)
					};
				}
			} else {
				var skill = ShortCut.getSkillById(index);
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
				SelectionUI.showSelection(itemData);
				return true;
			}

			return false;
		},

		leftClick: function () {
			if (jQuery('#CharSelect, #CharSelectV2, #CharSelectV3, #CharSelectV4').is(':visible')) {
				Cursor.leftClick(true);
				return;
			}
			Cursor.leftClick();
		},

		rightClick: function (holding) {
			Cursor.rightClick(holding);
		},

		pickUpItem: function () {
			Character.pickUp();
		},

		attackTargeted: function () {
			Character.attack();
		},

		moveCursor: function (dx, dy) {
			Cursor.move(dx, dy);
		},

		cameraZoom: function (zoom) {
			Cursor.changeCameraZoom(zoom);
		},

		cameraAngle: function (angle) {
			Cursor.changeCameraAngle(angle);
		},

		escape: function () {
			Cursor.esc();
		},

		enter: function () {
			Cursor.enter();
		},

		showinfo: function () {
			return Cursor.contextMenu();
		},

		navigateDpad: function (direction) {
			return Cursor.navigateDraggableItems(direction);
		},

		moveCharacter: function (x, y) {
			Character.move(x, y);
		}
	};
});
