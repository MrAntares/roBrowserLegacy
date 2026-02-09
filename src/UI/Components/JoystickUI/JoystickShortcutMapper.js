/**
 * UI/Components/JoystickUI/JoystickShortcutMapper.js
 *
 * Logic for mapping physical gamepad button combinations (L1, R1, etc.)
 * to specific game shortcut slots and managing UI synchronization
 * with the ShortCut component.
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var SetManager = require('./JoystickSetManager');

	var slotMapping = [
		// L1 group (slots 0-3): Y, X, B, A
		0, 1, 2, 3,
		// L2 group (slots 4-7): Y, X, B, A
		4, 5, 6, 7,
		// L1R1 group (special): Y, X, B, A
		8, 17, 26, 35,
		// R1 group (slots 12-15): Y, X, B, A
		13, 14, 15, 16,
		// R2 group (slots 8-11): Y, X, B, A
		9, 10, 11, 12,

		// Set 2 mapping
		// L1 group (slots 20-23): Y, X, B, A
		18, 19, 20, 21,
		// L2 group (slots 24-27): Y, X, B, A
		22, 23, 24, 25,
		// L1R1 group (special): Y, X, B, A
		8, 17, 26, 35,
		// R1 group (slots 32-35): Y, X, B, A
		31, 32, 33, 34,
		// R2 group (slots 28-31): Y, X, B, A
		27, 28, 29, 30
	];

	function getGroup(btn) {
		var l1 = btn[4] === 'holding';
		var r1 = btn[5] === 'holding';
		var l2 = btn[6] === 'holding';
		var r2 = btn[7] === 'holding';

		if (l1 && r1 && !l2 && !r2) {
			return 'L1R1';
		}
		if (l1) {
			return 'L1';
		}
		if (r1) {
			return 'R1';
		}
		if (l2) {
			return 'L2';
		}
		if (r2) {
			return 'R2';
		}
		return '';
	}

	function getIndexFromButtons(btn, set) {
		var group = getGroup(btn);
		if (group === '') {
			return -1;
		}

		var a = btn[0] !== 'unpressed';
		var b = btn[1] !== 'unpressed';
		var x = btn[2] !== 'unpressed';
		var y = btn[3] !== 'unpressed';

		var slot = -1;
		var tab = 1;
		var offset = 0;

		if (set === 2) {
			offset = 2;
		}

		if (group === 'L1R1') {
			tab = 0;
		} else if (group === 'L1') {
			tab = 1 + offset;
		} else if (group === 'R1') {
			tab = 2 + offset;
		} else if (group === 'L2') {
			tab = 1 + offset;
		} else if (group === 'R2') {
			tab = 2 + offset;
		}

		if (group === 'L1R1') {
			if (y) {
				slot = 8;
				tab = 1;
			} else if (x) {
				slot = 8;
				tab = 2;
			} else if (b) {
				slot = 8;
				tab = 3;
			} else if (a) {
				slot = 8;
				tab = 4;
			}
		} else if (group === 'L1' || group === 'R1') {
			if (y) {
				slot = 0;
			} else if (x) {
				slot = 1;
			} else if (b) {
				slot = 2;
			} else if (a) {
				slot = 3;
			}
		} else if (group === 'L2' || group === 'R2') {
			if (y) {
				slot = 4;
			} else if (x) {
				slot = 5;
			} else if (b) {
				slot = 6;
			} else if (a) {
				slot = 7;
			}
		}

		if (slot === -1) {
			return -1;
		}

		return (tab - 1) * 9 + slot;
	}

	function prepare() {
		if (!this.__loaded) {
			var ShortCut = require('UI/Components/ShortCut/ShortCut');
			var JoystickUIRenderer = require('./JoystickUIRenderer');

			var oldonChange = ShortCut.onChange;
			ShortCut.onChange = function (index, isSkill, ID, count) {
				oldonChange.call(ShortCut, index, isSkill, ID, count);
				JoystickUIRenderer.updateByIndex(index);
			};

			var oldSetList = ShortCut.setList;
			ShortCut.setList = function (list) {
				oldSetList.call(ShortCut, list);
				JoystickUIRenderer.sync();
			};

			var oldSetElement = ShortCut.setElement;
			ShortCut.setElement = function (isSkill, ID, count) {
				oldSetElement.call(ShortCut, isSkill, ID, count);
				JoystickUIRenderer.updateById(ID);
			};
			this.__loaded = true;
		}
	}

	return {
		slotMap: slotMapping,
		prepare: prepare,
		getGroup: getGroup,
		getShortcutIndex: function (btn) {
			var set = SetManager.getCurrentSet();
			var idx = getIndexFromButtons(btn, set);
			if (idx === -1) {
				return -1;
			}
			return idx;
		}
	};
});
