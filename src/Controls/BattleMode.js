/**
 * Controls/BattleMode.js
 *
 * Manage the battle mode
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var KEYS = require('Controls/KeyEventHandler');
	var ProcessCommand = require('Controls/ProcessCommand');
	var Preferences = require('Preferences/ShortCutControls');
	var UIManager = require('UI/UIManager');

	/**
	 * Create Namespace
	 */
	var BattleMode = {};

	var KeyTable = getKeyTable();

	/**
	 * Update key table if setting changes
	 */
	BattleMode.reload = function () {
		KeyTable = getKeyTable();
	};

	BattleMode.getKeyName = function (keyId) {
		var keyName = keyId;

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
		var keyName = BattleMode.getKeyName(keyId);

		var key = KeyTable[keyName];
		if (key) {
			if (key.component == '_SLASHCOMMAND') {
				ProcessCommand.processCommand(key.cmd);
			} else {
				var component = UIManager.getComponent(key.component);
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
		var keys, shortcut;
		var i, count;

		keys = Object.keys(KeyTable);
		count = keys.length;

		for (i = 0; i < count; ++i) {
			shortcut = KeyTable[keys[i]];

			if (shortcut.component === component && shortcut.cmd === cmd) {
				var str = [];
				var tmp = KEYS.toReadableKey(parseInt(keys[i], 10));

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
		var keySettings = {};

		var ShortCuts = Preferences.ShortCuts;

		if (ShortCuts) {
			Object.keys(ShortCuts).forEach(SC => {
				// Get initial settings
				var key = ShortCuts[SC].init.key;
				var shift = ShortCuts[SC].init.shift;
				var alt = ShortCuts[SC].init.alt;
				var ctrl = ShortCuts[SC].init.ctrl;

				// Get custom settings
				if (ShortCuts[SC].cust) {
					key = ShortCuts[SC].cust.key;
					shift = ShortCuts[SC].cust.shift;
					alt = ShortCuts[SC].cust.alt;
					ctrl = ShortCuts[SC].cust.ctrl;
				}

				// Only add if key is defined
				if (key) {
					var keyName = key;

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
	 * Exports
	 */
	return BattleMode;
});
