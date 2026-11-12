/**
 * UI/GUI/UIProxy.js
 *
 * Creates a jQuery-like proxy for UI components.
 *
 * @author AoShinHo
 */

/**
 * CSS properties that are unitless (don't need 'px')
 */
const CSS_NUMBER = {
	zIndex: true,
	opacity: true,
	fontWeight: true,
	lineHeight: true,
	columnCount: true,
	fillOpacity: true,
	orphans: true,
	widows: true,
	zoom: true
};

/**
 * Create a minimal jQuery-like proxy for this.ui so that
 * UIManager and old UIComponent.focus() can interoperate
 * during the transition period.
 */
export function createUIProxy(component) {
	const host = component._host;

	const proxy = {
		0: host,
		length: 1,

		css(prop, value) {
			// Setter: .css({ top: 100, left: 200 })
			if (typeof prop === 'object') {
				for (const [k, v] of Object.entries(prop)) {
					host.style[k] = typeof v === 'number' && !CSS_NUMBER[k] ? `${v}px` : String(v);
				}
				return proxy;
			}
			if (value === undefined) {
				// Getter: .css('top')
				return (
					window.getComputedStyle(host).getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase()) ||
					host.style[prop]
				);
			}
			// Setter: .css('top', 100)
			host.style[prop] = typeof value === 'number' && !CSS_NUMBER[prop] ? `${value}px` : String(value);
			return proxy;
		},

		offset() {
			const rect = host.getBoundingClientRect();
			return { left: rect.left + window.scrollX, top: rect.top + window.scrollY };
		},

		offsetParent() {
			let el = host.offsetParent || document.documentElement;
			while (el && el !== document.documentElement && window.getComputedStyle(el).position === 'static') {
				el = el.offsetParent;
			}
			el = el || document.documentElement;
			return {
				length: el ? 1 : 0,
				0: el
			};
		},

		position() {
			return {
				left: host.offsetLeft,
				top: host.offsetTop
			};
		},

		width() {
			return host.getBoundingClientRect().width;
		},
		height() {
			return host.getBoundingClientRect().height;
		},

		is(selector) {
			if (selector === ':visible') {
				return host.style.display !== 'none' && host.offsetParent !== null;
			}
			return host.matches(selector);
		},

		show() {
			host.style.display = '';
			component._fixPositionOverflow();
			return proxy;
		},
		hide() {
			host.style.display = 'none';
			return proxy;
		},
		toggle() {
			if (host.style.display === 'none') {
				host.style.display = '';
				component._fixPositionOverflow();
			} else {
				host.style.display = 'none';
			}
			return proxy;
		},

		parent() {
			return {
				length: host.parentNode ? 1 : 0,
				append(child) {
					host.parentNode?.appendChild(child._host || child[0] || child);
				}
			};
		},

		detach() {
			if (host.parentNode) host.parentNode.removeChild(host);
			return proxy;
		},

		appendTo(target) {
			const t = typeof target === 'string' ? document.querySelector(target) : target[0] || target;
			if (t) t.appendChild(host);
			return proxy;
		},

		trigger(eventName) {
			host.dispatchEvent(new CustomEvent(eventName, { bubbles: true }));
			return proxy;
		},

		find(selector) {
			const root = host.shadowRoot || host;
			const results = root.querySelectorAll(selector);
			const wrapper = {
				length: results.length,
				0: results[0],
				each(fn) {
					results.forEach((el, i) => fn.call(el, i, el));
					return wrapper;
				},
				click(fn) {
					results.forEach(el => el.addEventListener('click', fn));
					return wrapper;
				},
				text(val) {
					if (val === undefined) return results[0]?.textContent || '';
					results.forEach(el => {
						el.textContent = val;
					});
					return wrapper;
				},
				show() {
					results.forEach(el => {
						el.style.display = '';
					});
					return wrapper;
				},
				hide() {
					results.forEach(el => {
						el.style.display = 'none';
					});
					return wrapper;
				},
				css(prop, value) {
					if (typeof prop === 'object') {
						results.forEach(el => {
							for (const [k, v] of Object.entries(prop)) {
								el.style[k] = typeof v === 'number' && !CSS_NUMBER[k] ? `${v}px` : String(v);
							}
						});
						return wrapper;
					}
					if (value === undefined) {
						return results[0]
							? window
									.getComputedStyle(results[0])
									.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase())
							: '';
					}
					results.forEach(el => {
						el.style[prop] = typeof value === 'number' && !CSS_NUMBER[prop] ? `${value}px` : String(value);
					});
					return wrapper;
				},
				height() {
					return results[0] ? results[0].getBoundingClientRect().height : 0;
				},
				width() {
					return results[0] ? results[0].getBoundingClientRect().width : 0;
				}
			};
			return wrapper;
		}
	};
	component.ui = proxy;
}
