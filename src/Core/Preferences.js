/**
 * Core/Preferences.js
 *
 * Store informations in local storage (window position, noctrl, etc.)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

const Storage = {
	get: function Get(key, fn) {
		const out = {};
		out[key] = localStorage.getItem(key);
		fn(out);
	},
	set: function Set(obj, fn) {
		const keys = Object.keys(obj);
		let i, count;

		for (i = 0, count = keys.length; i < count; ++i) {
			localStorage.setItem(keys[i], obj[keys[i]]);
		}

		if (fn) {
			fn();
		}
	}
};

/**
 * Get back values
 *
 * @param {string} key
 * @param {mixed} default value
 * @param {number} optional version
 */
function get(key, def, version) {
	Storage.get(key, function (value) {
		let data, keys;
		let i, count;

		version = version || 0.0;

		// Not existing, storing it
		if (!value[key] || JSON.parse(value[key])._version !== version) {
			save(def);
			return;
		}

		data = JSON.parse(value[key]);
		data._key = key;
		data._version = version;
		data.save = selfSave;

		keys = Object.keys(data);
		count = keys.length;

		for (i = 0; i < count; ++i) {
			def[keys[i]] = data[keys[i]];
		}
	});

	def._key = key;
	def._version = version;
	def.save = selfSave;

	return def;
}

/**
 * Save value in storage
 *
 * @param {string} key
 * @param {object} value to store
 */
function save(data) {
	const key = data._key;
	delete data._key;
	delete data.save;

	const store = {};
	store[key] = JSON.stringify(data);

	Storage.set(store);

	data._key = key;
	data.save = selfSave;
}

/**
 * Save from object
 */
function selfSave() {
	save(this);
}

/**
 * Export
 */
export default {
	get: get,
	save: save
};
