/**
 * UI/Components/JoystickUI/JoystickInteractionService.js
 *
 * Acts as the bridge between input signals and game actions.
 * Orchestrates shortcut execution, mouse emulation, camera controls,
 * and character interactions.
 *
 * @author AoShinHo
 */
'use strict';

import ShortCut from 'UI/Components/ShortCut/ShortCut';
import InventoryUI from 'UI/Components/Inventory/Inventory';
import ItemType from 'DB/Items/ItemType';
import Character from './JoystickCharacterControl';
import Target from './JoystickTargetService';
import Cursor from './JoystickMouseCursorAdapter';
import jQuery from 'Utils/jquery';
import ControlsSettings from 'Preferences/Controls';
import SelectionUI from './JoystickSelectionUI';
import Input from './JoystickInputService';
import DB from 'DB/DBManager';
import SkillInfo from 'DB/Skills/SkillInfo';
import ShortcutMapper from './JoystickShortcutMapper';

	export default {
		prepare: function () {},

		dispose: function () {},
		cancelQuick: false,
		executeShortcut: function (index, group) {
			const shortcut = ShortCut.getList()[index];
			if (!shortcut) {
				return;
			}

			if (!shortcut.isSkill) {
				const item = InventoryUI.getUI().getItemById(shortcut.ID);
				if (!item || item.count === 0) {
					return;
				}
			} // Move mouse to target entity position
			else if (ControlsSettings.attackTargetMode) {
				const targetEntity = Target.getEntity();
				if (targetEntity) {
					Cursor.moveMouseToEntity(targetEntity);
				}
			}

			ShortCut.onShortCut({
				cmd: 'EXECUTE' + index
			});

			if (ControlsSettings.joyQuick === 2) {
				Cursor.quickCastClick();
			} else if (ControlsSettings.joyQuick === 1) {
				this.cancelQuick = false;

				function waitforRelease() {
					setTimeout(function () {
						const buttons = Input.buttonStates;
						if (ShortcutMapper.getGroup(buttons) !== group) {
							Cursor.quickCastClick();
						} else if (!this.cancelQuick) {
							waitforRelease();
						}
					}, 50);
				}
				waitforRelease();
			}
		},

		openSelectionWindow: function (draggableElement) {
			const index = parseInt(draggableElement.getAttribute('data-index'), 10);
			const isSkill = draggableElement.closest('.skill');
			let itemData;

			if (!isSkill) {
				const item = InventoryUI.getUI().getItemByIndex(index);
				if (item) {
					if (
						item.type === ItemType.UNKNOWN ||
						item.type === ItemType.ETC ||
						item.type === ItemType.CARD ||
						item.type === ItemType.PETEGG ||
						item.type === ItemType.PETARMOR
					) {
						return false;
					}

					itemData = {
						isSkill: false,
						ID: item.ITID,
						value: item.count,
						name: DB.getItemName(item)
					};
				}
			} else {
				const skill = ShortCut.getSkillById(index);
				if (skill) {
					itemData = {
						isSkill: true,
						ID: skill.SKID,
						value: skill.selectedLevel ? skill.selectedLevel : skill.level,
						name: SkillInfo[skill.SKID].SkillName
					};
				}
			}

			if (itemData) {
				SelectionUI.showSelection(itemData);
				return true;
			}

			return false;
		},

		leftClick: function (click) {
			Cursor.leftClick(click);
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