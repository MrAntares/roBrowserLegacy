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
 * The host and the elements under it, in its light and shadow DOM, that
 * still wait to be drawn.
 *
 * @param {Element} host
 * @returns {Element[]}
 */
function pendingWithin(host) {
	const elements = [host, ...host.querySelectorAll('*')];
	if (host.shadowRoot) {
		elements.push(...host.shadowRoot.querySelectorAll('*'));
	}
	return elements.filter(element => _pending.has(element));
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

/**
 * Stop watching what waits under a window taken off the page, so the
 * observer does not hold on to a window that is never shown again. The
 * callbacks stay with their elements and are freed with them.
 *
 * @param {Element} host
 */
whenDrawn.suspend = function suspend(host) {
	if (!_observer || !host) return;
	for (const element of pendingWithin(host)) {
		_observer.unobserve(element);
	}
};

/**
 * Watch again what waits under a window put back on the page.
 *
 * @param {Element} host
 */
whenDrawn.resume = function resume(host) {
	if (!_observer || !host) return;
	for (const element of pendingWithin(host)) {
		_observer.observe(element);
	}
};
