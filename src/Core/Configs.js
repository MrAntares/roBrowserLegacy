/**
 * Core/Configs.js
 *
 * Manage application configurations
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import ApiConfig from 'Api/ApiConfig.js';

/**
 * @var {object} global configs
 */
const _global = {};

/**
 * @var {object} server configs
 */
let _server = {};

class Configs {
	/**
	 * Get the value of a config
	 *
	 * @param {string} key name
	 * @param {?} default data value
	 * @return {?} data
	 */
	static get = (key, defaultValue) => {
		if (key in _server) {
			return _server[key];
		}

		if (key in _global) {
			return _global[key];
		}

		return defaultValue;
	};
	/**
	 * Set a config
	 *
	 * @param {string} key name
	 * @param {?} data
	 */
	static set = (key, value) => {
		_global[key] = value;
	};
	/**
	 * Store the server informations
	 *
	 * @param {object} server config
	 */
	static setServer = server => {
		_server = server;
	};
	/**
	 * Return the server informations
	 *
	 */
	static getServer = () => {
		return _server;
	};
}

/**
 * Constructor
 * Apply configs
 */
(function init(configs) {
	function isPlainObject(obj) {
		if (!obj || typeof obj !== 'object') return false;
		const proto = Object.getPrototypeOf(obj);
		return proto === Object.prototype || proto === null;
	}

	function deepMerge(target, source) {
		for (const key of Object.keys(source)) {
			if (key === '__proto__' || key === 'constructor') continue;
			if (isPlainObject(source[key])) {
				target[key] = deepMerge(target[key] || {}, source[key]);
			} else {
				target[key] = source[key];
			}
		}
		return target;
	}
	let newconfig = deepMerge({}, ApiConfig.config);

	if (typeof configs === 'object') {
		newconfig = deepMerge(newconfig, configs);
	}

	const keys = Object.keys(newconfig);
	let i, count;

	for (i = 0, count = keys.length; i < count; ++i) {
		Configs.set(keys[i], newconfig[keys[i]]);
	}
})(window.ROConfig);

/**
 * Export
 */
export default Configs;
