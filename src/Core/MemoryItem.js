/**
 * Core/MemoryItem.js
 *
 * Cache Item into memory
 * Used to manage each object in cache, manage callbacks etc.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @class MemoryItem
 * @description Object stored in cache with load/error event handling.
 */
class MemoryItem {
	/**
	 * @constructor
	 * @param {Function} [onload]
	 * @param {Function} [onerror]
	 */
	constructor(onload, onerror) {
		this._onload = [];
		this._onerror = [];
		this._data = null;
		this._error = '';
		this.complete = false;
		this.lastTimeUsed = 0;

		if (onload) {
			this.addEventListener('load', onload);
		}

		if (onerror) {
			this.addEventListener('error', onerror);
		}
	}

	/**
	 * Get data from Item
	 * @returns {*} data
	 */
	get data() {
		this.lastTimeUsed = Date.now();
		return this._data;
	}

	/**
	 * Add an event listener
	 * @param {string} event
	 * @param {Function} callback
	 */
	addEventListener(event, callback) {
		if (!(callback instanceof Function)) {
			throw new Error('MemoryItem::addEventListener() - callback must be a function !');
		}

		const eventName = event.toLowerCase();
		if (eventName === 'load') {
			if (this.complete) {
				if (this._data) {
					callback(this._data);
				}
				return;
			}
			this._onload.push(callback);
		} else if (eventName === 'error') {
			if (this.complete) {
				if (this._error) {
					callback(this._error);
				}
				return;
			}
			this._onerror.push(callback);
		} else {
			throw new Error(`MemoryItem::addEventListener() - Invalid event "${event}" used.`);
		}
	}

	/**
	 * Once the item in cache is load, execute all callback
	 * @param {*} data
	 */
	onload(data) {
		this._data = data;
		this.complete = true;
		this.lastTimeUsed = Date.now();

		this._onload.forEach(callback => callback(data));

		this._onload.length = 0;
		this._onerror.length = 0;
	}

	/**
	 * When an error occured with the item
	 * @param {string} [error='']
	 */
	onerror(error = '') {
		this._error = error;
		this.complete = true;
		this.lastTimeUsed = Date.now();

		this._onerror.forEach(callback => callback(error));

		this._onload.length = 0;
		this._onerror.length = 0;
	}
}

export default MemoryItem;
