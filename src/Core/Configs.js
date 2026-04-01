/**
 * Core/Configs.js
 *
 * Manage application configurations
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @class Configs
 * @description Manage application and server-specific configurations.
 */
class Configs {
	static #global = {};
	static #server = {};

	/**
	 * Initialize Configs
	 * Apply configurations from a source object (usually window.ROConfig)
	 * @param {object} configs
	 */
	static init(configs) {
		if (typeof configs !== 'object' || configs === null) {
			return;
		}

		Object.keys(configs).forEach(key => {
			this.set(key, configs[key]);
		});
	}

	/**
	 * Set a config
	 *
	 * @param {string} key name
	 * @param {*} value
	 */
	static set(key, value) {
		this.#global[key] = value;
	}

	/**
	 * Get the value of a config
	 *
	 * @param {string} key name
	 * @param {*} defaultValue
	 * @return {*} data
	 */
	static get(key, defaultValue) {
		if (key in this.#server) {
			return this.#server[key];
		}

		if (key in this.#global) {
			return this.#global[key];
		}

		return defaultValue;
	}

	/**
	 * Store the server information
	 *
	 * @param {object} server config
	 */
	static setServer(server) {
		this.#server = server;
	}

	/**
	 * Return the server information
	 * @returns {object}
	 */
	static getServer() {
		return this.#server;
	}
}

// Initialize with window.ROConfig if it exists
Configs.init(window.ROConfig);

export default Configs;
