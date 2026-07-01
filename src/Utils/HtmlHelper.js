/**
 * Utils/HtmlHelper.js
 *
 * Shared HTML/DOM utility helpers (replaces jQuery.escape, jQuery.animate, etc.).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

/**
 * Escape HTML special characters in a string.
 *
 * @param {string} text
 * @returns {string} escaped HTML string
 */
function escapeHtml(text) {
	const div = document.createElement('div');
	div.appendChild(document.createTextNode(text));
	return div.innerHTML;
}

/**
 * Animate CSS properties on an element using requestAnimationFrame.
 * Replaces jQuery.animate() for simple numeric/opacity transitions.
 *
 * @param {HTMLElement} element
 * @param {Object} props - CSS properties to animate (e.g. { opacity: 1.0 })
 * @param {number} duration - Animation duration in ms
 * @param {function} [callback] - Called when animation completes
 * @returns {{ stop: function }} - Handle to cancel the animation
 */
const _pixelProps = new Set([
	'left', 'top', 'right', 'bottom', 'width', 'height',
	'marginTop', 'marginLeft', 'marginRight', 'marginBottom',
	'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom',
	'fontSize', 'borderWidth'
]);

function animateElement(element, props, duration, callback) {
	const start = {};
	const keys = Object.keys(props);
	let cancelled = false;

	for (const key of keys) {
		start[key] = parseFloat(element.style[key]) || 0;
	}

	const startTime = performance.now();

	function step(now) {
		if (cancelled) return;
		const elapsed = now - startTime;
		const progress = Math.min(elapsed / duration, 1);

		for (const key of keys) {
			const from = start[key];
			const to = props[key];
			const value = from + (to - from) * progress;
			element.style[key] = _pixelProps.has(key) ? value + 'px' : value;
		}

		if (progress < 1) {
			requestAnimationFrame(step);
		} else if (callback) {
			callback();
		}
	}

	requestAnimationFrame(step);

	return {
		stop() {
			cancelled = true;
		}
	};
}

export { escapeHtml, animateElement };
