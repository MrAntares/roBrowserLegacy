/**
 * UIVersionManager.js
 *
 * Manage Component
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Configs from 'Core/Configs.js';
import PacketVerManager from 'Network/PacketVerManager.js';

const _UIAliases = {};
class UIVersionManager {
	static getUIAlias(name) {
		return name in _UIAliases ? _UIAliases[name] : false;
	}

	static selectUIVersion(publicName, versionInfo) {
		let SelectedUI = versionInfo.default;
		let _maxDate = 0;

		function getUIbyGameMode(gameMode) {
			if (typeof gameMode === 'object' && Object.keys(gameMode).length > 0) {
				for (const [keydate, UI] of Object.entries(gameMode)) {
					const dateNum = parseInt(keydate);
					if (PacketVerManager.value >= dateNum && dateNum > _maxDate) {
						SelectedUI = UI;
						_maxDate = dateNum;
					}
				}
			}
		}

		// Common UI
		getUIbyGameMode(versionInfo.common);

		if (Configs.get('renewal')) {
			// Renewal only UI
			getUIbyGameMode(versionInfo.re);
		} else {
			// Classic only UI
			getUIbyGameMode(versionInfo.prere);
		}

		// Store selected UI name
		_UIAliases[publicName] = SelectedUI.name;
		console.log('%c[UIVersion] ' + publicName + ': ', 'color:#007000', SelectedUI.name);
		return SelectedUI;
	}

	static getUIController(publicName, versionInfo, options = {}) {
		// Methods that always resolve on the controller itself, never delegated to getUI()
		const CONTROLLER_OWN = new Set([
			'selectUIVersion',
			'selectUIVersionWithJob',
			'selectSpecificUIVersion',
			'selectUIVersionDefault',
			'getUI'
		]);
		let _selectedUI;

		// Writes made before (or across) version selection, replayed onto each selected UI
		const _pending = Object.create(null);

		function _applyPending() {
			if (_selectedUI) {
				for (const prop in _pending) {
					_selectedUI[prop] = _pending[prop];
				}
			}
		}

		const UIController = {
			selectUIVersion() {
				_selectedUI = UIVersionManager.selectUIVersion(publicName, versionInfo);
				_applyPending();
			},

			selectUIVersionWithJob(job) {
				_selectedUI = versionInfo.job[job] || versionInfo.job.default;
				_UIAliases[publicName] = _selectedUI.name;
				console.log('[UIVersion] ' + publicName + ': ', _selectedUI.name);
				_applyPending();
			},

			selectSpecificUIVersion(version) {
				_selectedUI = versionInfo.common[version] || versionInfo.default;
				_UIAliases[publicName] = _selectedUI.name;
				console.log('[UIVersion] ' + publicName + ': ', _selectedUI.name);
				_applyPending();
			},

			selectUIVersionDefault() {
				_selectedUI = versionInfo.default;
				_UIAliases[publicName] = _selectedUI.name;
				_applyPending();
			},

			getUI() {
				return _selectedUI;
			}
		};

		const proxy = new Proxy(UIController, {
			get(target, prop, receiver) {
				if (CONTROLLER_OWN.has(prop) || Object.prototype.hasOwnProperty.call(target, prop)) {
					return Reflect.get(target, prop, receiver);
				}
				if (!_selectedUI) {
					return prop in _pending ? _pending[prop] : undefined;
				}
				const val = _selectedUI[prop];
				return typeof val === 'function' ? val.bind(_selectedUI) : val;
			},

			set(target, prop, value) {
				if (CONTROLLER_OWN.has(prop) || Object.prototype.hasOwnProperty.call(target, prop)) {
					return Reflect.set(target, prop, value);
				}
				// Record the write so it survives (re)selection, and apply immediately
				_pending[prop] = value;
				if (_selectedUI) {
					_selectedUI[prop] = value;
				}
				return true;
			},

			has(target, prop) {
				return prop in target || prop in _pending || (_selectedUI !== undefined && prop in _selectedUI);
			}
		});

		// Register for batch selection
		UIVersionManager._registry.push({
			proxy,
			controller: UIController,
			versionInfo,
			publicName,
			phase: options.phase || null
		});

		return proxy;
	}

	/**
	 * Select the correct UI version for all map-phase controllers.
	 * Skips job-based controllers (versionInfo.job defined) — those are
	 * selected later via selectUIVersionWithJob() when the job is known.
	 * Also skips char-phase controllers registered via selectAllChar().
	 */
	static selectAll() {
		for (const entry of UIVersionManager._registry) {
			if (!entry.versionInfo.job && entry.phase !== 'char') {
				entry.proxy.selectUIVersion();
			}
		}
	}

	/**
	 * Select the correct UI version for char-phase controllers
	 * (CharSelect, CharCreate). Called from CharEngine.
	 */
	static selectAllChar() {
		for (const entry of UIVersionManager._registry) {
			if (entry.phase === 'char') {
				entry.controller.selectUIVersion();
			}
		}
	}

	/**
	 * Select versionInfo.default for every registered controller.
	 * Test-only helper: bypasses PACKETVER/renewal so components work
	 * without a server selection. Not called by the game runtime.
	 */
	static selectAllDefaults() {
		for (const entry of UIVersionManager._registry) {
			entry.controller.selectUIVersionDefault();
		}
	}

	/// DEPRECATED
	/// WILL BE REMOVED AFTER REFACTORING
	static getEquipmentVersion() {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PacketVerManager.value >= 20090601) {
				return 1;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		return 1;
	}
	static getWinStatsVersion() {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PacketVerManager.value >= 20090601) {
				return 1;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		return 1;
	}
	static getInventoryVersion() {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PacketVerManager.value >= 20090601) {
				return 1;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		return 1;
	}
}

// Internal registry for batch version selection
UIVersionManager._registry = [];

export default UIVersionManager;
