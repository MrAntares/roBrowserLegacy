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
 * Memory to get back data
 * @var List
 */
const _memory = {};

/**
 * List of hook callback
 * @var List
 */
const _hook = {};

/**
 * @var {number} uid
 */
let _uid = 0;

/**
 * @var {mixed} origin for security
 */
let _origin = [];

/**
 * @var {window|Worker} context to send data to
 */
let _source = null;

const _input = { type: '', data: null, uid: 0 };

class Thread {
	/**
	 * Send data to thread
	 *
	 * @param {string} type
	 * @param {mixed} data
	 * @param {function} callback
	 */
	static Send = (type, data, callback) => {
		let uid = 0;

		if (callback) {
			uid = ++_uid;
			_memory[uid] = callback;
		}

		_input.type = type;
		_input.data = data;
		_input.uid = uid;

		_source.postMessage(_input, _origin);
	};

	/**
	 * Receive data from Thread
	 * Get back the data, find the caller and execute it
	 *
	 * @param {object} event
	 */
	static Receive = event => {
		// In a window context, verify the origin if one is configured.
		// For Worker messages, event.origin is typically undefined and this check is skipped.
		if (typeof event.origin === 'string' && _origin && _origin !== '*' && event.origin !== _origin) {
			return;
		}

		// Basic validation of the expected message shape
		if (!event.data || typeof event.data !== 'object') {
			return;
		}

		const uid = event.data.uid;
		const type = event.data.type;

		// Direct callback
		if (uid in _memory) {
			_memory[uid].apply(null, event.data.arguments);
			delete _memory[uid];
		}

		// Hook Feature
		if (type && _hook[type]) {
			_hook[type].call(null, event.data.data);
		}
	};

	/**
	 * Hook receive data
	 *
	 * @param {string} type
	 * @param {function} callback
	 */
	static Hook = (type, callback) => {
		_hook[type] = callback;
	};

	/**
	 * Modify where to send informations
	 *
	 * @param {Window} source
	 * @param {string} origin
	 */
	static Delegate = (source, origin) => {
		_source = source;
		_origin = origin;
	};

	/**
	 * Initialize Thread
	 */
	static Init = () => {
		if (!_source) {
			_source = new Worker(new URL('./ThreadEventHandler.js', import.meta.url), { type: 'module' });
		}

		// Worker context
		if (_source instanceof Worker) {
			_source.addEventListener('message', Thread.Receive, false);
		}

		// Other frame worker
		else {
			window.addEventListener('message', Thread.Receive, false);
			_source.postMessage({ type: 'SYNC' }, _origin);
		}
	};
}
/**
 * Export
 */
export default Thread;
