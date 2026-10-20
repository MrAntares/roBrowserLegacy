/**
 * UI/WhenDrawn.js
 *
 * Run a callback once, the first time an element is drawn on screen.
 *
 * Entering the map prepares dozens of windows and appends several of them
 * hidden, and each used to fetch all its art at once: hundreds of requests
 * for windows the player may never open. Window art waits for this instead.
 * An element inside a display:none window, or in a tab not shown, is not
 * drawn, so its art is fetched when it first is.
 *
 * Without IntersectionObserver the callback runs at once, as before.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

const _pending = new WeakMap();
let _observer = null;

function onIntersect(entries) {
	for (const entry of entries) {
		if (!entry.isIntersecting) continue;
		const callbacks = _pending.get(entry.target);
		_pending.delete(entry.target);
		_observer.unobserve(entry.target);
		for (const callback of callbacks || []) {
			try {
				callback();
			} catch (e) {
				console.error('[WhenDrawn]', e);
			}
		}
	}
}

/**
 * @param {Element} element
 * @param {function} callback
 */
export default function whenDrawn(element, callback) {
	if (typeof IntersectionObserver === 'undefined' || !element) {
		callback();
		return;
	}
	const callbacks = _pending.get(element);
	if (callbacks) {
		callbacks.push(callback);
		return;
	}
	_pending.set(element, [callback]);
	_observer ??= new IntersectionObserver(onIntersect);
	_observer.observe(element);
}
