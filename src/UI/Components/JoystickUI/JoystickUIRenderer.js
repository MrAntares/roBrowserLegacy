/**
 * UI/Components/JoystickUI/JoystickUIRenderer.js
 *
 * Manages the visual representation of the joystick HUD.
 * Handles icon loading, slot updates, group highlighting,
 * and automatic visibility based on user activity.
 *
 * @author AoShinHo
 */
'use strict';

import ShortCut from 'UI/Components/ShortCut/ShortCut';
import InventoryUI from 'UI/Components/Inventory/Inventory';
import SetManager from './JoystickSetManager';
import jQuery from 'Utils/jquery';
import DB from 'DB/DBManager';
import Client from 'Core/Client';
import ControlsSettings from 'Preferences/Controls';
import ItemType from 'DB/Items/ItemType';
import JoystickShortcutMapper from './JoystickShortcutMapper';
import JoystickInputService from './JoystickInputService';
import SkillInfo from 'DB/Skills/SkillInfo';

let ui = null;
	let setIndicator = null;

	function setupUIHide() {
		let lastMouseX = 0;
		let lastMouseY = 0;

		function onMouseMove(event) {
			if (!ui || !ui.is(':visible')) {
				return;
			}

			const deltaX = Math.abs(event.clientX - lastMouseX);
			const deltaY = Math.abs(event.clientY - lastMouseY);

			if ((deltaX > 5 || deltaY > 5) && ControlsSettings.joyAutoHide) {
				hide();
				JoystickInputService.active = false;
			}
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}

		jQuery(document).on('mousemove.joystick', onMouseMove);
	}

	function attach(root) {
		ui = root;
		setIndicator = ui.find('.set-indicator');
		setupUIHide();
	}

	function updateJoystickSlot(joystickSlotIndex, shortcutIndex) {
		const item = ShortCut.getList()[shortcutIndex];

		const $slot = ui.find('.slot').eq(joystickSlotIndex);
		const $icon = $slot.find('.icon');
		const $img = $icon.find('.img');
		const $amount = $icon.find('.amount');

		if (!item || item.ID === 0) {
			$icon.hide();
			$img.css('backgroundImage', 'none');
			$amount.text('');
			return;
		}

		$icon.show();

		if (item.isSkill && item.count) {
			const skillInfo = SkillInfo[item.ID];
			if (skillInfo) {
				Client.loadFile(DB.INTERFACE_PATH + 'item/' + skillInfo.Name + '.bmp', function (url) {
					$img.css('backgroundImage', 'url(' + url + ')');
					$amount.text(item.count);
				});
			}
		} else {
			const inventoryItem = InventoryUI.getUI().getItemById(item.ID);
			if (inventoryItem) {
				const itemInfo = DB.getItemInfo(item.ID);
				const fileName = inventoryItem.IsIdentified
					? itemInfo.identifiedResourceName
					: itemInfo.unidentifiedResourceName;
				let count = inventoryItem.count;
				if (
					(inventoryItem.type === ItemType.WEAPON ||
						inventoryItem.type === ItemType.ARMOR ||
						inventoryItem.type === ItemType.SHADOWGEAR) &&
					count
				) {
					count = 1;
				}
				Client.loadFile(DB.INTERFACE_PATH + 'item/' + fileName + '.bmp', function (url) {
					$img.css('backgroundImage', 'url(' + url + ')');
					$amount.text(count);
				});
			}
		}
	}

	function updateById(Id) {
		if (!ui) {
			return;
		}
		const startIdx = SetManager.getCurrentSet() === 1 ? 0 : 20;
		for (let i = 0; i < 20; i++) {
			const shortcutIndex = JoystickShortcutMapper.slotMap[startIdx + i];
			const shortcut = ShortCut.getList()[shortcutIndex];
			if (shortcut && shortcut.ID === Id) {
				updateJoystickSlot(i, shortcutIndex);
			}
		}
	}

	function updateByIndex(index) {
		if (!ui) {
			return;
		}
		const startIdx = SetManager.getCurrentSet() === 1 ? 0 : 20;
		for (let i = 0; i < 20; i++) {
			const shortcutIndex = JoystickShortcutMapper.slotMap[startIdx + i];
			if (shortcutIndex === index) {
				updateJoystickSlot(i, shortcutIndex);
			}
		}
	}

	function sync() {
		if (!ui) {
			return;
		}

		const startIdx = SetManager.getCurrentSet() === 1 ? 0 : 20;
		for (let i = 0; i < 20; i++) {
			const shortcutIndex = JoystickShortcutMapper.slotMap[startIdx + i];
			updateJoystickSlot(i, shortcutIndex);
		}
	}

	function updateSetIndicator() {
		if (!setIndicator) {
			return;
		}
		ui.find('.set-btn').removeClass('active');
		ui.find('.set-btn:nth-child(' + SetManager.getCurrentSet() + ')').addClass('active');
	}

	function updateVisuals(buttons) {
		if (!ui) {
			return;
		}
		const containers = ui.find('.group-container');

		containers.removeClass('active');

		const activeGroup = JoystickShortcutMapper.getGroup(buttons);

		if (activeGroup !== '') {
			ui.find('[data-group="' + activeGroup + '"]').addClass('active');
		}
	}

	function show() {
		if (ui && !ui.is(':visible')) {
			ui.show();
		}
	}

	function hide() {
		if (ui && ui.is(':visible')) {
			ui.hide();
		}
	}

	function dispose() {
		hide();
		jQuery(document).off('mousemove.joystick');
	}
export default {
		attach: attach,
		dispose: dispose,
		sync: sync,
		updateById: updateById,
		updateByIndex: updateByIndex,
		updateSetIndicator: updateSetIndicator,
		updateVisuals: updateVisuals,
		show: show,
		hide: hide
	};