/**
 * Core/Preferences.js
 *
 * Store informations in local storage (window position, noctrl, etc.)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @class Preferences
 * @description Manages persistent user preferences using localStorage.
 */
class Preferences {
	/**
	 * Get back values from storage
	 *
	 * @param {string} key
	 * @param {Object} def - default value
	 * @param {number} [version=0.0] - optional version
	 * @returns {Object} the preference object
	 */
	static get(key, def, version = 0.0) {
		const rawValue = localStorage.getItem(key);

		// Not existing, storing it
		if (!rawValue) {
			const data = Object.assign(def, { _key: key, _version: version });
			this.save(data);
			data.save = () => this.save(data);
			return data;
		}

		try {
			const stored = JSON.parse(rawValue);

			// Version mismatch, update and save defaults
			if (stored._version !== version) {
				const data = Object.assign(def, { _key: key, _version: version });
				this.save(data);
				data.save = () => this.save(data);
				return data;
			}

			// Apply stored values
			Object.assign(def, stored, { _key: key, _version: version });
			def.save = () => this.save(def);
			return def;
		} catch (e) {
			// Failed to parse, use defaults
			const data = Object.assign(def, { _key: key, _version: version });
			this.save(data);
			data.save = () => this.save(data);
			return data;
		}
	}

	/**
	 * Save value in storage
	 *
	 * @param {Object} data - value to store
	 */
	static save(data) {
		const key = data._key;

		if (!key) {
			console.error(`[Preferences] Cannot save object without '_key' property:`, data);
			return;
		}

		// Don't save internal properties
		const { _key, save, ...toStore } = data;
		localStorage.setItem(key, JSON.stringify(toStore));
	}
}

export default Preferences;
