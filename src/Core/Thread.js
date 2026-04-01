/**
 * Core/Thread.js
 *
 * Client Thread
 * Manage the Client Thread to send data to it (let another Thread do the hard job : loading files, ...)
 *
 * This file is part of ROBrowser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @class Thread
 * @description Manages communication with the Web Worker thread for offshore tasks like file loading.
 */
class Thread {
	static #memory = {};
	static #hook = {};
	static #uid = 0;
	static #origin = [];
	static #source = null;
	static #input = { type: '', data: null, uid: 0 };

	/**
	 * Send data to thread
	 *
	 * @param {string} type
	 * @param {*} data
	 * @param {Function} [callback]
	 */
	static send(type, data, callback) {
		let uid = 0;

		if (callback) {
			uid = ++this.#uid;
			this.#memory[uid] = callback;
		}

		this.#input.type = type;
		this.#input.data = data;
		this.#input.uid = uid;

		this.#source.postMessage(this.#input, this.#origin);
	}

	/**
	 * Receive data from Thread
	 * Get back the data, find the caller and execute it
	 *
	 * @param {MessageEvent} event
	 */
	static receive(event) {
		const { uid, type, arguments: args, data } = event.data;

		// Direct callback
		if (uid && this.#memory[uid]) {
			this.#memory[uid](...args);
			delete this.#memory[uid];
		}

		// Hook Feature
		if (type && this.#hook[type]) {
			this.#hook[type](data);
		}
	}

	/**
	 * Hook receive data
	 *
	 * @param {string} type
	 * @param {Function} callback
	 */
	static hook(type, callback) {
		this.#hook[type] = callback;
	}

	/**
	 * Modify where to send informations
	 *
	 * @param {Window|Worker} source
	 * @param {string} origin
	 */
	static delegate(source, origin) {
		this.#source = source;
		this.#origin = origin;
	}

	/**
	 * Initialize Thread
	 */
	static init() {
		if (!this.#source) {
			this.#source = new Worker(new URL('./ThreadEventHandler.js', import.meta.url), { type: 'module' });
		}

		// Worker context
		if (this.#source instanceof Worker) {
			this.#source.addEventListener('message', (e) => this.receive(e), false);
		}
		// Other frame worker
		else {
			window.addEventListener('message', (e) => this.receive(e), false);
			this.#source.postMessage({ type: 'SYNC' }, this.#origin);
		}
	}
}

export default Thread;
