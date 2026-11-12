/**
 * UI/GUI/NoCursorFallback.js
 *
 * Provides a fallback for hiding the native cursor when CSS style queries are not supported.
 *
 * @author AoShinHo
 */

let _noCursorStyles;
let _noCursorMedia = 'not all';

export function supportsStyleQueries() {
	const probe = document.createElement('div');
	probe.innerHTML = '<style>@container style(--ro-probe: 1) { i { color: rgb(1, 2, 3); } }</style><i></i>';
	probe.style.setProperty('--ro-probe', '1');
	document.body.appendChild(probe);
	const supported = getComputedStyle(probe.lastChild).color === 'rgb(1, 2, 3)';
	probe.remove();
	return supported;
}

export function syncNoCursorStyles() {
	const media = document.body.classList.contains('custom-cursor') ? 'all' : 'not all';
	if (media === _noCursorMedia) {
		return;
	}
	_noCursorMedia = media;
	for (let i = 0; i < _noCursorStyles.length; i++) {
		_noCursorStyles[i].media = media;
	}
}

/**
 * Hides the native cursor in a shadow root where CSS style queries are
 * missing, following body.custom-cursor; null where Common.css handles it.
 * remove() lets go of it, so a closed window is not held.
 *
 * @param {ShadowRoot} shadow
 * @return {?HTMLStyleElement}
 */
export function addNoCursorFallback(shadow) {
	if (_noCursorStyles === undefined) {
		_noCursorStyles = supportsStyleQueries() ? null : [];
		if (_noCursorStyles) {
			syncNoCursorStyles();
			new MutationObserver(syncNoCursorStyles).observe(document.body, {
				attributes: true,
				attributeFilter: ['class']
			});
		}
	}
	if (!_noCursorStyles) {
		return null;
	}

	// `media` rather than `disabled`: a style element's sheet, and with it
	// `disabled`, is rebuilt each time the window is appended again.
	const style = document.createElement('style');
	style.setAttribute('data-no-cursor', '');
	style.media = _noCursorMedia;
	style.textContent = '* { cursor: none !important; }';
	shadow.appendChild(style);
	_noCursorStyles.push(style);
	return style;
}

export function trackNoCursorStyle(style) {
	style.media = _noCursorMedia;
	if (_noCursorStyles.indexOf(style) === -1) {
		_noCursorStyles.push(style);
	}
}

export function untrackNoCursorStyle(style) {
	const index = _noCursorStyles.indexOf(style);
	if (index !== -1) {
		_noCursorStyles.splice(index, 1);
	}
}
