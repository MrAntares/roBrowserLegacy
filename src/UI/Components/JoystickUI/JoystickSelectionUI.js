/**
 * UI/Components/JoystickUI/JoystickSelectionUI.js
 *
 * Handles the UI for selecting a shortcut slot when an item/skill is selected via Context Menu.
 * Maintains the exact logic of the original monolithic function.
 *
 */
define(function (require) {
	'use strict';

	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ShortCut = require('UI/Components/ShortCut/ShortCut');
	var jQuery = require('Utils/jquery');
	var htmlText = require('text!./JoystickSelectionUI.html');
	var cssText = require('text!./JoystickSelectionUI.css');

	var JoystickSelectionUI = new UIComponent('JoystickSelectionUI', htmlText, cssText);

	// State variables
	var currentTab = 0;
	var slotInTab = 0;
	var itemData = null;
	var clickLock = null;

	// Internal Helper: Debounce for gamepad input
	function setClickInterval() {
		if (clickLock) clearTimeout(clickLock);
		clickLock = setTimeout(function () {
			clickLock = null;
		}, 200);
	}

	function isLocked() {
		return clickLock !== null;
	}

	// Internal Helper: Get Combo String
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

	function updateGrid() {
		var grid = JoystickSelectionUI.ui.find('.shortcut-grid');
		grid.empty();

		var startIdx = currentTab * 9;

		for (var i = 0; i < 9; i++) {
			var globalIndex = startIdx + i;
			var slot = ShortCut.getList()[globalIndex];
			var isEmpty = !slot || (!slot.isSkill && !slot.ID);

			var joystickCombo = getJoystickComboForSlot(globalIndex);
			var displayText = joystickCombo || (i + 1);

			var slotDiv = jQuery('<div class="slot-btn" data-index="' + i + '">' + displayText + '</div>');

			if (isEmpty) {
				slotDiv.addClass('empty');
			}

			grid.append(slotDiv);
		}

		updateSelection();
	}

	function updateSelection() {
		var grid = JoystickSelectionUI.ui.find('.shortcut-grid');
		grid.find('.slot-btn').removeClass('selected');
		grid.find('.slot-btn[data-index="' + slotInTab + '"]').addClass('selected');
	}

	function updateTabButtons() {
		var tabButtons = JoystickSelectionUI.ui.find('.tab-buttons');
		tabButtons.find('.tab-btn').removeClass('active');
		tabButtons.find('.tab-btn[data-tab="' + currentTab + '"]').addClass('active');
	}

	function createTabButtons() {
		var tabButtons = JoystickSelectionUI.ui.find('.tab-buttons');
		tabButtons.empty();

		for (var t = 0; t < 4; t++) {
			var tabBtn = jQuery('<button class="tab-btn" data-tab="' + t + '">Tab ' + (t + 1) + '</button>');
			tabButtons.append(tabBtn);
		}
	}

	function selectSlot() {
		if (!itemData) return;

		var row = currentTab;
		var pos = (row * 9) + slotInTab;

		ShortCut.removeElement(itemData.isSkill, itemData.ID, row, itemData.value);
		ShortCut.addElement(pos, itemData.isSkill, itemData.ID, itemData.value);
		ShortCut.onChange(pos, itemData.isSkill, itemData.ID, itemData.value);

		JoystickSelectionUI.hideSelection();
	}

	/**
	 * Main input handler
	 * as expected by JoystickButtonInput.js
	 */
	JoystickSelectionUI.handleGamepadInput = function handleGamepadInput(buttons) {
		if (isLocked()) return true;

		// A - select
		if (buttons[0] !== 'unpressed') {
			setClickInterval();
			selectSlot();
			return true;
		}

		// Select - cancel
		if (buttons[8] !== 'unpressed') {
			setClickInterval();
			JoystickSelectionUI.hideSelection();
			return true;
		}

		// L2 - Previous Tab
		if (buttons[6] !== 'unpressed') {
			setClickInterval();
			if (currentTab > 0) {
				currentTab--;
				slotInTab = 0;
				updateGrid();
				updateTabButtons();
			}
			return true;
		}

		// R2 - Next Tab
		if (buttons[7] !== 'unpressed') {
			setClickInterval();
			if (currentTab < 3) {
				currentTab++;
				slotInTab = 0;
				updateGrid();
				updateTabButtons();
			}
			return true;
		}

		// D-pad up
		if (buttons[12] !== 'unpressed') {
			setClickInterval();
			if (slotInTab >= 3) {
				slotInTab -= 3;
				updateSelection();
			}
			return true;
		}

		// D-pad down
		if (buttons[13] !== 'unpressed') {
			setClickInterval();
			if (slotInTab < 6) {
				slotInTab += 3;
				updateSelection();
			}
			return true;
		}

		// D-pad left
		if (buttons[14] !== 'unpressed') {
			setClickInterval();
			if (slotInTab > 0) {
				slotInTab--;
				updateSelection();
			}
			return true;
		}

		// D-pad right
		if (buttons[15] !== 'unpressed') {
			setClickInterval();
			if (slotInTab < 8) {
				slotInTab++;
				updateSelection();
			}
			return true;
		}

		return false;
	}

	JoystickSelectionUI.onAppend = function () {
		// Initialize structure once attached
		createTabButtons();
		this.ui.hide();
	};

	JoystickSelectionUI.showSelection = function (data) {
		itemData = data;
		currentTab = 0;
		slotInTab = 0;

		updateGrid();
		updateTabButtons();

		this.focus();
		this.ui.show();
		this.ui.css('display', 'block'); // Ensure display block for fixed positioning
	};

	JoystickSelectionUI.hideSelection = function () {
		this.ui.hide();
		itemData = null;
	};

	JoystickSelectionUI.active = function () {
		if(!this.ui) return false;
		return this.ui.is(':visible');
	};

	return UIManager.addComponent(JoystickSelectionUI);
});
