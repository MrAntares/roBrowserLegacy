/**
 * Core/Events.js
 *
 * Client Manager
 * Manage client files, load GRFs, DATA.INI, extract files from GRFs, ...
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * @var {Array} events list
 */
const _events = [];

/**
 * @var {number} game tick (get from rendering loop)
 */
let _tick = 0;

/**
 * @var {number} unique id
 */
let _uid = 0;

/**
 * @class Events
 * @description Alias for setTimeout using the rendering loop for better performances.
 */
class Events {
	/**
	 * Alias for setTimeout using the rendering loop getting
	 * bad performances.
	 *
	 * @param {Function} callback
	 * @param {number} delay
	 * @returns {number} event unique id
	 */
	static setTimeout(callback, delay) {
		const tick = _tick + delay;
		const event = { callback, tick, uid: _uid++ };

		// Add it to the list, sorted by delay
		const count = _events.length;
		for (let i = 0; i < count; ++i) {
			if (tick < _events[i].tick) {
				_events.splice(i, 0, event);
				return event.uid;
			}
		}

		_events.push(event);
		return event.uid;
	}

	/**
	 * Alias for clearTimeout
	 * Remove an event pre-registered
	 *
	 * @param {number} uid - event unique id
	 */
	static clearTimeout(uid) {
		const index = _events.findIndex(event => event.uid === uid);
		if (index !== -1) {
			_events.splice(index, 1);
		}
	}

	/**
	 * Process at each rendering loop
	 *
	 * @param {number} tick - game tick
	 */
	static process(tick) {
		// Execute time out events.
		while (_events.length > 0) {
			if (_events[0].tick > tick) {
				break;
			}

			_events.shift().callback();
		}

		_tick = tick;
	}

	/**
	 * Delete events from memory
	 */
	static free() {
		_events.length = 0;
	}
}

export default Events;
