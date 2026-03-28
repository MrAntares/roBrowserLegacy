/**
 * Controls/BattleMode.js
 *
 * Manage the battle mode
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import KEYS from 'Controls/KeyEventHandler.js';
import ProcessCommand from 'Controls/ProcessCommand.js';
import Preferences from 'Preferences/ShortCutControls.js';
import UIManager from 'UI/UIManager.js';

/**
 * Create Namespace
 */
const BattleMode = {};

let KeyTable = getKeyTable();

/**
 * Update key table if setting changes
 */
BattleMode.reload = function () {
	KeyTable = getKeyTable();
};

BattleMode.getKeyName = function (keyId) {
	let keyName = keyId;

	if (KEYS.SHIFT) {
		keyName = 'SHIFT-' + keyName;
	}
	if (KEYS.ALT) {
		keyName = 'ALT-' + keyName;
	}
	if (KEYS.CTRL) {
		keyName = 'CTRL-' + keyName;
	}

	return keyName;
};

BattleMode.match = function (keyId) {
	return KeyTable[BattleMode.getKeyName(keyId)];
};

/**
 * BattleMode processing
 *
 * @param {number} key pressed id
 * @return {boolean} is shortcut found ?
 */
BattleMode.process = function process(keyId) {
	const keyName = BattleMode.getKeyName(keyId);

	const key = KeyTable[keyName];
	if (key) {
		if (key.component === '_SLASHCOMMAND') {
			ProcessCommand.processCommand(key.cmd);
		} else {
			const component = UIManager.getComponent(key.component);
			if (component.onShortCut) {
				component.onShortCut(key);
			}
		}
		return true;
	}
	return false;
};

/**
 * Convert component key to a readable string
 *
 * @param {string} component name
 * @param {string} command type
 * @return {string} readable key pressed
 */
BattleMode.shortcutToKeyString = function shortcutToKeyString(component, cmd) {
	let keys, shortcut;
	let i, count;

	keys = Object.keys(KeyTable);
	count = keys.length;

	for (i = 0; i < count; ++i) {
		shortcut = KeyTable[keys[i]];

		if (shortcut.component === component && shortcut.cmd === cmd) {
			const str = [];
			const tmp = KEYS.toReadableKey(parseInt(keys[i], 10));

			if (shortcut.alt) {
				str.push('ALT');
			}

			if (shortcut.shift) {
				str.push('SHIFT');
			}

			if (shortcut.ctrl) {
				str.push('CTRL');
			}

			if (tmp) {
				str.push(tmp);
			}

			return str.join(' + ');
		}
	}

	return 'None';
};

/**
 *	Translates the shortcut table into directly indexable format for event processing
 */
function getKeyTable() {
	const keySettings = {};

	const ShortCuts = Preferences.ShortCuts;

	if (ShortCuts) {
		Object.keys(ShortCuts).forEach(SC => {
			// Get initial settings
			let key = ShortCuts[SC].init.key;
			let shift = ShortCuts[SC].init.shift;
			let alt = ShortCuts[SC].init.alt;
			let ctrl = ShortCuts[SC].init.ctrl;

			// Get custom settings
			if (ShortCuts[SC].cust) {
				key = ShortCuts[SC].cust.key;
				shift = ShortCuts[SC].cust.shift;
				alt = ShortCuts[SC].cust.alt;
				ctrl = ShortCuts[SC].cust.ctrl;
			}

			// Only add if key is defined
			if (key) {
				let keyName = key;

				if (shift) {
					keyName = 'SHIFT-' + keyName;
				}
				if (alt) {
					keyName = 'ALT-' + keyName;
				}
				if (ctrl) {
					keyName = 'CTRL-' + keyName;
				}

				keySettings[keyName] = { component: ShortCuts[SC].component, cmd: ShortCuts[SC].cmd };
			}
		});
	}
	return keySettings;
}

/**
 * Export
 */
export default BattleMode;
