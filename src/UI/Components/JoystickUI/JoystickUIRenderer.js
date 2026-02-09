/**
 * UI/Components/JoystickUI/JoystickUIRenderer.js
 *
 * Manages the visual representation of the joystick HUD.
 * Handles icon loading, slot updates, group highlighting,
 * and automatic visibility based on user activity.
 *
 * @author AoShinHo
 */
define(function (require)
{
	'use strict';

	var ShortCut = require('UI/Components/ShortCut/ShortCut');
	var InventoryUI = require('UI/Components/Inventory/Inventory');
	var SetManager = require('./JoystickSetManager');
	var jQuery = require('Utils/jquery');
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');

	var ui = null;
	var setIndicator = null;

	function setupUIHide()
	{
		var lastMouseX = 0;
		var lastMouseY = 0;

		function onMouseMove(event)
		{
			if (!ui || !ui.is(':visible'))
			{
				return;
			}

			var deltaX = Math.abs(event.clientX - lastMouseX);
			var deltaY = Math.abs(event.clientY - lastMouseY);

			if (deltaX > 5 || deltaY > 5)
			{
				hide();
				require('./JoystickInputService').active = false;
			}
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		}

		jQuery(document).on('mousemove.joystick', onMouseMove);
	}

	function attach(root)
	{
		ui = root;
		setIndicator = ui.find('.set-indicator');
		setupUIHide();
	}

	function updateJoystickSlot(joystickSlotIndex, shortcutIndex)
	{
		var item = ShortCut.getList()[shortcutIndex];

		var $slot = ui.find('.slot').eq(joystickSlotIndex);
		var $icon = $slot.find('.icon');
		var $img = $icon.find('.img');
		var $amount = $icon.find('.amount');

		if (!item || item.ID === 0)
		{
			$icon.hide();
			$img.css('backgroundImage', 'none');
			$amount.text('');
			return;
		}

		$icon.show();

		if (item.isSkill && item.count)
		{
			var skillInfo = require('DB/Skills/SkillInfo')[item.ID];
			if (skillInfo)
			{
				Client.loadFile(DB.INTERFACE_PATH + 'item/' + skillInfo.Name + '.bmp', function (url)
				{
					$img.css('backgroundImage', 'url(' + url + ')');
					$amount.text(item.count);
				});
			}
		}
		else
		{
			var inventoryItem = InventoryUI.getUI().getItemById(item.ID);
			if (inventoryItem)
			{
				var itemInfo = DB.getItemInfo(item.ID);
				var fileName = inventoryItem.IsIdentified
					? itemInfo.identifiedResourceName
					: itemInfo.unidentifiedResourceName;
				var count = inventoryItem.count;
				var ItemType = require('DB/Items/ItemType');
				if (
					(inventoryItem.type === ItemType.WEAPON ||
						inventoryItem.type === ItemType.ARMOR ||
						inventoryItem.type === ItemType.SHADOWGEAR) &&
					count
				)
				{
					count = 1;
				}
				Client.loadFile(DB.INTERFACE_PATH + 'item/' + fileName + '.bmp', function (url)
				{
					$img.css('backgroundImage', 'url(' + url + ')');
					$amount.text(count);
				});
			}
		}
	}

	function updateById(Id)
	{
		if (!ui) {return;}
		var startIdx = SetManager.getCurrentSet() === 1 ? 0 : 20;
		for (var i = 0; i < 20; i++)
		{
			var shortcutIndex = require('./JoystickShortcutMapper').slotMap[startIdx + i];
			var shortcut = ShortCut.getList()[shortcutIndex];
			if (shortcut && shortcut.ID === Id)
			{
				updateJoystickSlot(i, shortcutIndex);
			}
		}
	}

	function updateByIndex(index)
	{
		if (!ui) {return;}
		var startIdx = SetManager.getCurrentSet() === 1 ? 0 : 20;
		for (var i = 0; i < 20; i++)
		{
			var shortcutIndex = require('./JoystickShortcutMapper').slotMap[startIdx + i];
			if (shortcutIndex === index)
			{
				updateJoystickSlot(i, shortcutIndex);
			}
		}
	}

	function sync()
	{
		if (!ui) {return;}

		var startIdx = SetManager.getCurrentSet() === 1 ? 0 : 20;
		for (var i = 0; i < 20; i++)
		{
			var shortcutIndex = require('./JoystickShortcutMapper').slotMap[startIdx + i];
			updateJoystickSlot(i, shortcutIndex);
		}
	}

	function updateSetIndicator()
	{
		if (!setIndicator) {return;}
		ui.find('.set-btn').removeClass('active');
		ui.find('.set-btn:nth-child(' + SetManager.getCurrentSet() + ')').addClass('active');
	}

	function updateVisuals(buttons)
	{
		if (!ui) {return;}
		var containers = ui.find('.group-container');

		containers.removeClass('active');

		var activeGroup = require('./JoystickShortcutMapper').getGroup(buttons);

		if (activeGroup !== '') {ui.find('[data-group="' + activeGroup + '"]').addClass('active');}
	}

	function show()
	{
		if (ui && !ui.is(':visible')) {ui.show();}
	}

	function hide()
	{
		if (ui && ui.is(':visible')) {ui.hide();}
	}

	function dispose()
	{
		hide();
		jQuery(document).off('mousemove.joystick');
	}

	return {
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
});
