/**
 * UI/UIComponent.js
 *
 * Manage Component
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import CommonCSS from './Common.css?raw';
import { animateElement } from 'Utils/HtmlHelper.js';
import Mouse from 'Controls/MouseEventHandler.js';
import UIPreferences from 'Preferences/UI.js';
import Session from 'Engine/SessionStorage.js';
import Targa from 'Loaders/Targa.js';

/**
 * Heavy modules loaded lazily to keep viewer bundles lightweight.
 * In Online/full-game context these resolve instantly (already loaded).
 * In viewer context they are never triggered.
 */
let _Cursor = null;
let _DB = null;
let _Client = null;
let _Renderer = null;
let _EntityManager = null;
let _ScrollBar = null;
let _depsPromise = null;

async function _loadHeavyDeps() {
	if (_Cursor) return;
	const [CursorMod, DBMod, ClientMod, RendererMod, EntityManagerMod, ScrollBarMod] = await Promise.all([
		import('UI/CursorManager.js'),
		import('DB/DBManager.js'),
		import('Core/Client.js'),
		import('Renderer/Renderer.js'),
		import('Renderer/EntityManager.js'),
		import('UI/Scrollbar.js')
	]);
	_Cursor = CursorMod.default;
	_DB = DBMod.default;
	_Client = ClientMod.default;
	_Renderer = RendererMod.default;
	_EntityManager = EntityManagerMod.default;
	_ScrollBar = ScrollBarMod.default;
}

function _ensureDeps() {
	if (!_depsPromise) {
		_depsPromise = _loadHeavyDeps();
	}
	return _depsPromise;
}

/**
 * CSS properties that are unitless (don't need 'px')
 */
const CSS_NUMBER = {
	zIndex: true,
	opacity: true,
	fontWeight: true,
	lineHeight: true,
	columnCount: true
};

/**
 * Create a minimal find-results wrapper with jQuery-compatible API.
 * @param {NodeList|Array} results
 * @param {HTMLElement} host - the proxy host for addBack()
 * @returns {Object}
 */
function _createFindWrapper(results, host) {
	const arr = Array.from(results);
	const wrapper = {
		length: arr.length,
		each(fn) {
			arr.forEach((el, i) => fn.call(el, i, el));
			return wrapper;
		},
		text(val) {
			if (val === undefined) return arr[0]?.textContent || '';
			arr.forEach(el => { el.textContent = val; });
			return wrapper;
		},
		show() {
			arr.forEach(el => { el.style.display = ''; });
			return wrapper;
		},
		hide() {
			arr.forEach(el => { el.style.display = 'none'; });
			return wrapper;
		},
		css(p, v) {
			if (typeof p === 'object') {
				arr.forEach(el => {
					for (const [k, val] of Object.entries(p)) {
						el.style[k] = typeof val === 'number' && !CSS_NUMBER[k] ? val + 'px' : String(val);
					}
				});
				return wrapper;
			}
			if (v === undefined) {
				return arr[0]
					? window.getComputedStyle(arr[0]).getPropertyValue(p.replace(/([A-Z])/g, '-$1').toLowerCase()) || arr[0].style[p]
					: '';
			}
			arr.forEach(el => {
				el.style[p] = typeof v === 'number' && !CSS_NUMBER[p] ? v + 'px' : String(v);
			});
			return wrapper;
		},
		click(fn) {
			arr.forEach(el => el.addEventListener('click', fn));
			return wrapper;
		},
		on(events, fn) {
			events.split(/\s+/).forEach(evt => {
				const type = evt.split('.')[0];
				arr.forEach(el => el.addEventListener(type, fn));
			});
			return wrapper;
		},
		height() { return arr[0] ? arr[0].getBoundingClientRect().height : 0; },
		width() { return arr[0] ? arr[0].getBoundingClientRect().width : 0; },
		addClass(cls) { arr.forEach(el => el.classList.add(cls)); return wrapper; },
		removeClass(cls) { arr.forEach(el => el.classList.remove(cls)); return wrapper; },
		hasClass(cls) { return arr[0] ? arr[0].classList.contains(cls) : false; },
		val(v) {
			if (v === undefined) return arr[0]?.value || '';
			arr.forEach(el => { el.value = v; });
			return wrapper;
		},
		attr(name, val) {
			if (val === undefined) return arr[0]?.getAttribute(name) ?? '';
			arr.forEach(el => el.setAttribute(name, val));
			return wrapper;
		},
		data(key) { return arr[0]?.dataset[key]; },
		html(val) {
			if (val === undefined) return arr[0]?.innerHTML || '';
			arr.forEach(el => { el.innerHTML = val; });
			return wrapper;
		},
		empty() { arr.forEach(el => { el.innerHTML = ''; }); return wrapper; },
		append(child) {
			if (arr[0]) {
				if (typeof child === 'string') {
					arr[0].insertAdjacentHTML('beforeend', child);
				} else {
					arr[0].appendChild(child[0] || child);
				}
			}
			return wrapper;
		},
		remove() {
			arr.forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); });
			return wrapper;
		},
		is(sel) {
			if (sel === ':visible') {
				return arr[0] ? arr[0].style.display !== 'none' && arr[0].offsetParent !== null : false;
			}
			return arr[0] ? arr[0].matches(sel) : false;
		},
		trigger(eventName) {
			arr.forEach(el => el.dispatchEvent(new CustomEvent(eventName, { bubbles: true })));
			return wrapper;
		},
		focus() { if (arr[0]) arr[0].focus(); return wrapper; },
		blur() { if (arr[0]) arr[0].blur(); return wrapper; },
		mousedown(fn) { arr.forEach(el => el.addEventListener('mousedown', fn)); return wrapper; },
		mouseup(fn) { arr.forEach(el => el.addEventListener('mouseup', fn)); return wrapper; },
		index(el) {
			const target = el[0] || el;
			return arr.indexOf(target);
		},
		eq(i) {
			return arr[i] ? _createUIProxy(arr[i]) : { length: 0 };
		},
		not(sel) {
			return _createFindWrapper(arr.filter(el => !el.matches(sel)), host);
		},
		filter(fn) {
			return _createFindWrapper(arr.filter((el, i) => fn.call(el, i, el)), host);
		},
		addBack() {
			return _createFindWrapper([host, ...arr], host);
		},
		find(sel) {
			if (!arr[0]) return _createFindWrapper([], host);
			return _createFindWrapper(arr[0].querySelectorAll(sel), arr[0]);
		}
	};
	for (let i = 0; i < arr.length; i++) {
		wrapper[i] = arr[i];
	}
	return wrapper;
}

/**
 * Create a jQuery-compatible proxy wrapping a single DOM element.
 * Provides the subset of jQuery API used by UIComponent and its children
 * for backward compatibility during the migration period.
 *
 * @param {HTMLElement} host - The raw DOM element to wrap
 * @returns {Object} jQuery-compatible proxy
 */
function _createUIProxy(host) {
	let _animHandle = null;
	const _handlers = new Map();

	const proxy = {
		0: host,
		length: host ? 1 : 0,

		css(prop, value) {
			if (typeof prop === 'object') {
				for (const [k, v] of Object.entries(prop)) {
					host.style[k] = typeof v === 'number' && !CSS_NUMBER[k] ? v + 'px' : String(v);
				}
				return proxy;
			}
			if (value === undefined) {
				return (
					window.getComputedStyle(host).getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase()) ||
					host.style[prop]
				);
			}
			host.style[prop] = typeof value === 'number' && !CSS_NUMBER[prop] ? value + 'px' : String(value);
			return proxy;
		},

		find(selector) {
			return _createFindWrapper(host.querySelectorAll(selector), host);
		},

		each(fn) {
			fn.call(host, 0, host);
			return proxy;
		},

		appendTo(target) {
			const t = typeof target === 'string' ? document.querySelector(target) : (target[0] || target);
			if (t) t.appendChild(host);
			return proxy;
		},

		detach() {
			if (host.parentNode) host.parentNode.removeChild(host);
			return proxy;
		},

		parent() {
			return {
				length: host.parentNode ? 1 : 0,
				append(child) {
					host.parentNode?.appendChild(child[0] || child);
				}
			};
		},

		trigger(eventName) {
			if (typeof eventName === 'string') {
				host.dispatchEvent(new CustomEvent(eventName, { bubbles: true }));
			}
			return proxy;
		},

		on(events, fn) {
			events.split(/\s+/).forEach(evt => {
				const type = evt.split('.')[0];
				host.addEventListener(type, fn);
				if (!_handlers.has(evt)) _handlers.set(evt, new Set());
				_handlers.get(evt).add(fn);
			});
			return proxy;
		},

		off(events) {
			if (events) {
				events.split(/\s+/).forEach(evt => {
					const type = evt.split('.')[0];
					const fns = _handlers.get(evt);
					if (fns) {
						fns.forEach(fn => host.removeEventListener(type, fn));
						_handlers.delete(evt);
					}
				});
			}
			return proxy;
		},

		mouseenter(fn) { host.addEventListener('mouseenter', fn); return proxy; },
		mouseleave(fn) { host.addEventListener('mouseleave', fn); return proxy; },
		mousedown(fn) { host.addEventListener('mousedown', fn); return proxy; },
		mouseup(fn) { host.addEventListener('mouseup', fn); return proxy; },
		mouseover(fn) { host.addEventListener('mouseover', fn); return proxy; },
		mouseout(fn) { host.addEventListener('mouseout', fn); return proxy; },

		offset(val) {
			if (val) {
				if (val.top !== undefined) host.style.top = val.top + 'px';
				if (val.left !== undefined) host.style.left = val.left + 'px';
				return proxy;
			}
			const rect = host.getBoundingClientRect();
			return { left: rect.left + window.scrollX, top: rect.top + window.scrollY };
		},

		position() {
			return { left: host.offsetLeft, top: host.offsetTop };
		},

		width() { return host.getBoundingClientRect().width; },
		height() { return host.getBoundingClientRect().height; },
		outerWidth() { return host.offsetWidth; },
		outerHeight() { return host.offsetHeight; },

		is(selector) {
			if (selector === ':visible') {
				return host.style.display !== 'none' && host.offsetParent !== null;
			}
			return host.matches(selector);
		},

		filter(fn) {
			if (fn.call(host, 0, host)) {
				return proxy;
			}
			return { length: 0, 0: undefined };
		},

		offsetParent() {
			let el = host.offsetParent || document.documentElement;
			while (el && el !== document.documentElement && window.getComputedStyle(el).position === 'static') {
				el = el.offsetParent;
			}
			el = el || document.documentElement;
			return { length: el ? 1 : 0, 0: el };
		},

		stop() {
			if (_animHandle) {
				_animHandle.stop();
				_animHandle = null;
			}
			return proxy;
		},

		animate(props, duration, callback) {
			proxy.stop();
			_animHandle = animateElement(host, props, duration, callback);
			return proxy;
		},

		data(key) {
			return host.dataset[key];
		},

		hasClass(cls) { return host.classList.contains(cls); },
		addClass(cls) { host.classList.add(cls); return proxy; },
		removeClass(cls) { host.classList.remove(cls); return proxy; },
		toggleClass(cls, force) {
			host.classList.toggle(cls, force);
			return proxy;
		},

		text(val) {
			if (val === undefined) return host.textContent;
			host.textContent = val;
			return proxy;
		},

		html(val) {
			if (val === undefined) return host.innerHTML;
			host.innerHTML = val;
			return proxy;
		},

		val(v) {
			if (v === undefined) return host.value;
			host.value = v;
			return proxy;
		},

		attr(name, val) {
			if (val === undefined) return host.getAttribute(name);
			host.setAttribute(name, val);
			return proxy;
		},

		prop(name, val) {
			if (val === undefined) return host[name];
			host[name] = val;
			return proxy;
		},

		empty() { host.innerHTML = ''; return proxy; },

		append(child) {
			if (typeof child === 'string') {
				host.insertAdjacentHTML('beforeend', child);
			} else {
				host.appendChild(child[0] || child);
			}
			return proxy;
		},

		prepend(child) {
			if (typeof child === 'string') {
				host.insertAdjacentHTML('afterbegin', child);
			} else {
				host.insertBefore(child[0] || child, host.firstChild);
			}
			return proxy;
		},

		remove() {
			if (host.parentNode) host.parentNode.removeChild(host);
			return proxy;
		},

		show() { host.style.display = ''; return proxy; },
		hide() { host.style.display = 'none'; return proxy; },
		toggle() {
			host.style.display = host.style.display === 'none' ? '' : 'none';
			return proxy;
		},

		closest(sel) {
			const found = host.closest(sel);
			return found ? _createUIProxy(found) : { length: 0 };
		},

		children(sel) {
			if (sel) return _createFindWrapper(host.querySelectorAll(':scope > ' + sel), host);
			return _createFindWrapper(host.querySelectorAll(':scope > *'), host);
		},

		scrollTop(val) {
			if (val === undefined) return host.scrollTop;
			host.scrollTop = val;
			return proxy;
		},

		focus() { host.focus(); return proxy; },
		select() { if (host.select) host.select(); return proxy; }
	};

	return proxy;
}


/**
 * Create a component
 *
 * @param {string} name
 * @param {string} htmlText content
 * @param {string} cssText content
 */
function UIComponent(name, htmlText, cssText) {
	this.name = name;
	this._htmlText = htmlText || null;
	this._cssText = cssText || null;
	this.magnet = {
		TOP: false,
		BOTTOM: false,
		LEFT: false,
		RIGHT: false
	};
}

/**
 * @var {HTMLElement} <style>
 */
let _style = document.querySelector('style');
if (!_style) {
	_style = document.createElement('style');
	_style.type = 'text/css';
	document.head.appendChild(_style);
}
_style.textContent += CommonCSS;

function getComponentZIndex(comp) {
	if (comp._host) return comp._host.style.zIndex; // GUIComponent
	if (comp.ui) return comp.ui.css('zIndex'); // UIComponent
	return '50';
}

function setComponentZIndex(comp, value) {
	if (comp._host)
		comp._host.style.zIndex = value; // GUIComponent
	else if (comp.ui) comp.ui.css('zIndex', value); // UIComponent
}

/**
 * @var {enum} Mouse mode
 */
UIComponent.MouseMode = {
	CROSS: 0, // cross the ui and intersect with scene
	STOP: 1, // don't intersect the scene if mouse over the ui
	FREEZE: 2 // don't intersect the scene if ui is alive in scene
};

/**
 * @var {number} mouse behavior
 */
UIComponent.prototype.mouseMode = UIComponent.MouseMode.STOP;

/**
 * @var {boolean} is Component ready ?
 */
UIComponent.prototype.__loaded = false;

/**
 * @var {boolean} is Component active ?
 */
UIComponent.prototype.__active = false;

/**
 * @var {boolean} focus element zIndex ?
 */
UIComponent.prototype.needFocus = true;

let _snapCache = [];

/**
 * Prepare the component to be used
 */
UIComponent.prototype.prepare = function prepare() {
	_ensureDeps();
	if (this.__loaded) {
		return;
	}

	if (this._htmlText) {
		const _template = document.createElement('template');
		_template.innerHTML = this._htmlText.trim();
		this.ui = _createUIProxy(_template.content.firstElementChild);
		this.ui.css('zIndex', 50);
	}

	// Add style to view
	if (this._cssText) {
		// Avoid adding css each time the same component is created
		if (_style.textContent.indexOf('\n\n/** ' + this.name + ' **/\n') === -1) {
			_style.textContent += '\n\n/** ' + this.name + ' **/\n' + this._cssText;
		}
		document.body.appendChild(this.ui[0]);
	}

	// Prepare html
	if (this._htmlText) {
		this.parseHTML.call(this.ui[0]);
		this.ui[0].querySelectorAll('*').forEach(el => this.parseHTML.call(el));
	}

	// Initialize
	if (this.init) {
		this.init();
	}

	// If the ui don't allow to be crossed by mouse to intersect the scene then
	// _enter variable is here to fix a recurrent bug in mouseenter and mouseleave
	// when mouseenter can be triggered multiples time
	if (this.mouseMode === UIComponent.MouseMode.STOP) {
		let _intersect,
			_enter = 0;
		const element = this.__mouseStopBlock || this.ui;
		const rawEl = element[0] || element;

		// stop intersection
		rawEl.addEventListener('mouseenter', () => {
			if (_enter === 0) {
				_intersect = Mouse.intersect;
				_enter++;
				if (_intersect) {
					Mouse.intersect = false;
					_Cursor?.setType(_Cursor?.ACTION?.DEFAULT ?? 0);
					_EntityManager?.setOverEntity(null);
				}
			}
		});

		// restore previous state
		rawEl.addEventListener('mouseleave', () => {
			if (_enter > 0) {
				_enter--;

				if (_enter === 0 && _intersect) {
					if (!Session.FreezeUI) {
						Mouse.intersect = true;
					}
					_EntityManager?.setOverEntity(null);
				}
			}
		});

		// Custom fix for firefox, mouseleave isn't trigger when element is
		// removed from body, test case: http://jsfiddle.net/7h4sj/
		rawEl.addEventListener('x_remove', () => {
			if (_enter > 0) {
				_enter = 0;
				if (_intersect) {
					Mouse.intersect = true;
					_EntityManager?.setOverEntity(null);
				}
			}
		});

		// Focus the UI on mousedown
		rawEl.addEventListener('mousedown', this.focus.bind(this));
	}

	if (this.mouseMode !== UIComponent.MouseMode.CROSS) {
		const rawEl = (this.__mouseStopBlock || this.ui)[0] || this.__mouseStopBlock || this.ui;
		// Do not cross
		rawEl.addEventListener('touchstart', event => {
			event.stopImmediatePropagation();
		});
	}

	if (this._htmlText) {
		this.ui.detach();
	}

	this.__loaded = true;
};

/**
 * Remove a component from HTML
 */
UIComponent.prototype.remove = function remove() {
	this.__active = false;

	if (this.__loaded && this.ui.parent().length) {
		if (this.onRemove) {
			this.onRemove();
		}

		if (this.onKeyDown) {
			if (this._keydownHandler) {
				window.removeEventListener('keydown', this._keydownHandler);
				this._keydownHandler = null;
			}
		}

		this.ui.trigger('x_remove');
		this.ui.detach();

		if (this.mouseMode === UIComponent.MouseMode.FREEZE) {
			Mouse.intersect = true;
			Session.FreezeUI = false;
		}

		if (this.__scrollbarObserver) {
			this.__scrollbarObserver.disconnect();
			this.__scrollbarObserver = null;
		}
	}
};

/**
 * Add the component to HTML
 *
 * @param {string|HTMLElement} [target] - Target element to append the UI to. If not provided, appends to body.
 */
UIComponent.prototype.append = function append(target) {
	this.__active = true;

	if (!this.__loaded) {
		this.prepare();

		if (this.__active) {
			this.append();
		}

		return;
	}

	// Determine the target element
	let targetEl;
	if (target) {
		targetEl = typeof target === 'string' ? document.querySelector(target) : (target[0] || target);
		if (!targetEl) {
			console.error('Error: Unable to find target element for appending UI.');
			return;
		}
	} else {
		targetEl = document.body;
	}

	// Append UI content to the target element
	targetEl.appendChild(this.ui[0]);

	if (this.onKeyDown) {
		if (this._keydownHandler) {
			window.removeEventListener('keydown', this._keydownHandler);
		}
		this._keydownHandler = this.onKeyDown.bind(this);
		window.addEventListener('keydown', this._keydownHandler);
	}

	if (this.mouseMode === UIComponent.MouseMode.FREEZE) {
		Mouse.intersect = false;
		Session.FreezeUI = true;
		_Cursor?.setType(_Cursor?.ACTION?.DEFAULT ?? 0);
	}

	if (this.onAppend) {
		this.onAppend();
	}

	// Apply custom JS scrollbar to dynamically added overflowing containers
	const self = this;
	setTimeout(function () {
		if (!self.ui || !self.ui.length) {
			return;
		}

		function checkScrollbars(root) {
			if (!root || root.nodeType !== 1) return;
			const elements = [root, ...root.querySelectorAll('*')];
			for (const el of elements) {
				if (el.nodeType !== 1) continue;
				if (el._roScrollbarApplied) {
					_ScrollBar?.applyDOMScrollbar(el);
					continue;
				}
				const oy = window.getComputedStyle(el).overflowY;
				if (oy === 'auto' || oy === 'scroll') {
					_ScrollBar?.applyDOMScrollbar(el);
				}
			}
		}

		// Stagger checks to wait for CSS parsing completion
		checkScrollbars(self.ui[0]);
		setTimeout(function () {
			checkScrollbars(self.ui[0]);
		}, 50);
		setTimeout(function () {
			checkScrollbars(self.ui[0]);
		}, 150);
		setTimeout(function () {
			checkScrollbars(self.ui[0]);
		}, 500);

		// Re-apply if visibility or content changes
		const observer = new MutationObserver(function (mutations) {
			let needsCheck = false;
			mutations.forEach(function (mutation) {
				if (mutation.type === 'childList') {
					needsCheck = true;
				} else if (mutation.type === 'attributes') {
					if (mutation.attributeName === 'style') {
						const oldVal = mutation.oldValue || '';
						const wasHidden =
							oldVal.indexOf('display: none') !== -1 || oldVal.indexOf('display:none') !== -1;
						const isHidden = mutation.target.style.display === 'none';
						if (wasHidden && !isHidden) {
							needsCheck = true;
						}
					} else if (mutation.attributeName === 'class') {
						needsCheck = true;
					}
				}
			});

			if (needsCheck) {
				checkScrollbars(self.ui[0]);
			}
		});

		observer.observe(self.ui[0], {
			childList: true,
			subtree: true,
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ['style', 'class']
		});
		self.__scrollbarObserver = observer;
	}, 0);

	//Fix position after append (screen changed since last time and it loads invalid positions)
	if (this.ui) {
		const uiEl = this.ui[0];
		const rect = uiEl.getBoundingClientRect();
		const x = rect.left + window.scrollX;
		const y = rect.top + window.scrollY;
		const width = uiEl.offsetWidth;
		const height = uiEl.offsetHeight;
		const WIDTH = _Renderer?.width ?? window.innerWidth;
		const HEIGHT = _Renderer?.height ?? window.innerHeight;

		if (y + height > HEIGHT) {
			uiEl.style.top = (HEIGHT - Math.min(height, HEIGHT)) + 'px';
		}

		if (x + width > WIDTH) {
			uiEl.style.left = (WIDTH - Math.min(width, WIDTH)) + 'px';
		}

		//Magnet
		if (this.magnet.TOP) {
			//nothing to do
		}
		if (this.magnet.BOTTOM) {
			uiEl.style.top = (HEIGHT - height) + 'px';
		}
		if (this.magnet.LEFT) {
			//nothing to do
		}
		if (this.magnet.RIGHT) {
			uiEl.style.left = (WIDTH - width) + 'px';
		}
	}

	this.focus();
};

/**
 * Focus the UI
 * (stay at the top of others)
 */
UIComponent.prototype.focus = function focus() {
	if (!this.manager || !this.needFocus) {
		return;
	}

	const components = this.manager.components;
	let name, zIndex;
	const list = [];
	let i, count, j;

	// Store components zIndex in a list
	for (name in components) {
		if (this !== components[name] && components[name].__active && components[name].needFocus) {
			zIndex = parseInt(getComponentZIndex(components[name]), 10);
			list[zIndex - 50] = zIndex;
		}
	}

	// Re-organize it to have a linear zIndex order (remove gap)
	for (i = 0, j = 0, count = list.length; i < count; ++i) {
		if (!list[i]) {
			j++;
			continue;
		}
		list[i] -= j;
	}

	// Apply new zIndex to list
	for (name in components) {
		if (this !== components[name] && components[name].__active && components[name].needFocus) {
			zIndex = parseInt(getComponentZIndex(components[name]), 10);
			setComponentZIndex(components[name], list[zIndex - 50]);
		}
	}

	// Push our zIndex at top
	setComponentZIndex(this, list.length + 50 - j);
};

/**
 * add UI at the top of others
 */
UIComponent.prototype.placeOnTop = function placeOnTop() {
	if (!this.manager) {
		return;
	}

	const components = this.manager.components;
	let name, zIndex;
	const list = [];

	// Store components zIndex in a list
	for (name in components) {
		if (this !== components[name] && components[name].__active) {
			zIndex = parseInt(getComponentZIndex(components[name]), 10);
			list.push(zIndex);
		}
	}
	const lastZIndex = Math.max(...list);
	setComponentZIndex(this, lastZIndex + 1);
};

/**
 * Clone a component
 *
 * @param {string} name - new component name
 */
UIComponent.prototype.clone = function clone(name, full) {
	const ui = new UIComponent(name, this._htmlText, this._cssText);

	if (full) {
		const keys = Object.keys(this);
		let i;
		const count = keys.length;

		for (i = 0; i < count; ++i) {
			ui[keys[i]] = this[keys[i]];
		}
	}

	return ui;
};

/**
 * Enable a type (keydown is the only one supported yet)
 *
 * @param {string} type to enable
 */
UIComponent.prototype.on = function on(type) {
	switch (type.toLowerCase()) {
		case 'keydown':
			if (this.onKeyDown) {
				if (this._keydownHandler) {
					window.removeEventListener('keydown', this._keydownHandler);
				}
				this._keydownHandler = this.onKeyDown.bind(this);
				window.addEventListener('keydown', this._keydownHandler);
			}
			break;
	}
};

/**
 * Disable a type (keydown is the only one supported yet)
 *
 * @param {string} type to disable
 */
UIComponent.prototype.off = function off(type) {
	switch (type.toLowerCase()) {
		case 'keydown':
			if (this._keydownHandler) {
				window.removeEventListener('keydown', this._keydownHandler);
				this._keydownHandler = null;
			}
			break;
	}
};

/**
 * Drag an element
 */
UIComponent.prototype.draggable = function draggable(element) {
	const containerEl = this.ui[0];
	if (!containerEl || containerEl.nodeType !== 1) return this;
	const container = this.ui;

	const component = this;
	const SNAP_DISTANCE = 10;

	// Resolve drag handle element
	let dragEl;
	if (!element) {
		dragEl = containerEl;
	} else {
		dragEl = element[0] || element;
		if (!dragEl || dragEl.nodeType !== 1) return this;
	}

	// Drag drop stuff
	function onDragStart(event) {
		if (event.type === 'touchstart') {
			Mouse.screen.x = event.touches[0].pageX;
			Mouse.screen.y = event.touches[0].pageY;
		}

		// Only on left click
		else if (event.which !== 1) {
			return;
		}

		let drag;
		const startPos = container.position();
		const x = startPos.left - Mouse.screen.x;
		const y = startPos.top - Mouse.screen.y;

		const width = container.width();
		const height = container.height();

		let lastMx = Mouse.screen.x;
		let lastMy = Mouse.screen.y;
		let currentOpacity = parseFloat(container.css('opacity') || 1);

		_snapCache = [];
		if (UIPreferences.windowmagnet && component.manager) {
			const containerParent = containerEl.offsetParent;
			const components = component.manager.components;

			for (const name in components) {
				const other = components[name];

				if (
					!other ||
					other === component ||
					!other.__active ||
					!other.needFocus ||
					!other.ui ||
					!other.ui.length ||
					!other.ui.is(':visible')
				) {
					continue;
				}

				const otherEl = other.ui[0];
				const otherParent = otherEl ? otherEl.offsetParent : null;
				if (containerParent && otherParent && otherParent !== containerParent) {
					continue;
				}

				const oPos = other.ui.position();
				const oW = other.ui.width();
				const oH = other.ui.height();

				_snapCache.push({
					left: oPos.left,
					top: oPos.top,
					right: oPos.left + oW,
					bottom: oPos.top + oH
				});
			}
		}

		let snapX, snapY, snapXD, snapYD, currentX, currentY;

		function checkX(val) {
			const d = Math.abs(val - currentX);
			if (d < snapXD) {
				snapXD = d;
				snapX = val;
			}
		}
		function checkY(val) {
			const d = Math.abs(val - currentY);
			if (d < snapYD) {
				snapYD = d;
				snapY = val;
			}
		}
		function isNear(startA, endA, startB, endB) {
			return !(endA + SNAP_DISTANCE < startB || endB + SNAP_DISTANCE < startA);
		}

		// Start the loop
		container.stop();
		drag = requestAnimationFrame(dragging);

		// Stop the drag
		function onDragEnd(ev) {
			if (ev.type === 'touchend' || ev.which === 1) {
				if (component.gridSnap) {
					const pos = container.position();
					const gw = component.gridSnap.width;
					const gh = component.gridSnap.height;
					const padX = component.gridSnap.padX || 0;
					const padY = component.gridSnap.padY || 0;

					const maxXIndex = Math.floor(
						((_Renderer?.width ?? window.innerWidth) - container.width() - padX) / gw
					);
					const maxYIndex = Math.floor(
						((_Renderer?.height ?? window.innerHeight) - container.height() - padY) / gh
					);

					let gridXIndex = Math.round((pos.left - padX) / gw);
					let gridYIndex = Math.round((pos.top - padY) / gh);

					gridXIndex = Math.max(0, Math.min(gridXIndex, maxXIndex));
					gridYIndex = Math.max(0, Math.min(gridYIndex, maxYIndex));

					const snappedX = gridXIndex * gw + padX;
					const snappedY = gridYIndex * gh + padY;

					container
						.stop()
						.animate(
							{ left: snappedX, top: snappedY, opacity: 1.0 },
							component.snapDuration || 150,
							() => {
								if (component.onDragEnd) {
									component.onDragEnd();
								}
							}
						);
				} else {
					container.stop().animate({ opacity: 1.0 }, 150, () => {
						if (component.onDragEnd) {
							component.onDragEnd();
						}
					});
				}

				cancelAnimationFrame(drag);
				window.removeEventListener('mouseup', onDragEnd);
				window.removeEventListener('touchend', onDragEnd);
				_snapCache = [];
			}
		}
		window.addEventListener('mouseup', onDragEnd);
		window.addEventListener('touchend', onDragEnd);

		// Process dragging
		function dragging() {
			const mx = Mouse.screen.x;
			const my = Mouse.screen.y;

			// Skip frame if mouse hasn't moved
			if (mx === lastMx && my === lastMy) {
				drag = requestAnimationFrame(dragging);
				return;
			}
			lastMx = mx;
			lastMy = my;

			let x_ = mx + x;
			let y_ = my + y;
			currentOpacity = Math.max(currentOpacity - 0.02, 0.7);

			if (component.magnet) {
				component.magnet.TOP = component.magnet.BOTTOM = component.magnet.LEFT = component.magnet.RIGHT = false;
			}

			// Magnet on border
			if (Math.abs(x_) < SNAP_DISTANCE) {
				x_ = 0;
				if (component.magnet) component.magnet.LEFT = true;
			}
			if (Math.abs(y_) < SNAP_DISTANCE) {
				y_ = 0;
				if (component.magnet) component.magnet.TOP = true;
			}
			if (Math.abs(x_ + width - Mouse.screen.width) < SNAP_DISTANCE) {
				x_ = Mouse.screen.width - width;
				if (component.magnet) component.magnet.RIGHT = true;
			}
			if (Math.abs(y_ + height - Mouse.screen.height) < SNAP_DISTANCE) {
				y_ = Mouse.screen.height - height;
				if (component.magnet) component.magnet.BOTTOM = true;
			}

			if (UIPreferences.windowmagnet && component.manager) {
				const lockX = component.magnet && (component.magnet.LEFT || component.magnet.RIGHT);
				const lockY = component.magnet && (component.magnet.TOP || component.magnet.BOTTOM);
				snapX = null;
				snapY = null;
				snapXD = SNAP_DISTANCE + 1;
				snapYD = SNAP_DISTANCE + 1;
				currentX = x_;
				currentY = y_;

				const len = _snapCache.length;
				for (let i = 0; i < len; i++) {
					const box = _snapCache[i];

					if (!lockX && isNear(y_, y_ + height, box.top, box.bottom)) {
						checkX(box.left);
						checkX(box.right);
						checkX(box.left - width);
						checkX(box.right - width);
					}

					if (!lockY && isNear(x_, x_ + width, box.left, box.right)) {
						checkY(box.top);
						checkY(box.bottom);
						checkY(box.top - height);
						checkY(box.bottom - height);
					}
				}

				if (!lockX && snapX !== null) x_ = snapX;
				if (!lockY && snapY !== null) y_ = snapY;
			}

			container.offset({ top: y_, left: x_ });
			container.css('opacity', Math.max(currentOpacity, 0.7));
			drag = requestAnimationFrame(dragging);
		}
	}

	dragEl.addEventListener('mousedown', onDragStart);
	dragEl.addEventListener('touchstart', onDragStart);

	return this;
};

/**
 * Parse a component html view (data-* attributes)
 */
UIComponent.prototype.parseHTML = function parseHTML() {
	const node = this;
	if (!_Client || !_DB) {
		_ensureDeps().then(() => parseHTML.call(node));
		return;
	}
	const background = node.dataset.background;
	const preload = node.dataset.preload;
	const hover = node.dataset.hover;
	const down = node.dataset.down;
	const active = node.dataset.active;
	const msgId = node.dataset.text;

	let preloads, i, count;

	let bg_uri = null;
	let hover_uri = null;
	let active_uri = null;
	let down_uri = null;

	const state = {
		hover: false,
		down: false,
		active: false
	};

	function updateBackground() {
		if (state.down && down_uri) {
			node.style.backgroundImage = 'url(' + down_uri + ')';
		} else if (state.active && active_uri) {
			node.style.backgroundImage = 'url(' + active_uri + ')';
		} else if (state.hover && hover_uri) {
			node.style.backgroundImage = 'url(' + hover_uri + ')';
		} else if (bg_uri) {
			node.style.backgroundImage = 'url(' + bg_uri + ')';
		} else {
			node.style.backgroundImage = '';
		}
	}

	// text
	if (msgId && _DB?.getMessage(msgId, '')) {
		node.textContent = _DB?.getMessage(msgId, '');
	}

	// Default background
	if (background) {
		_Client?.loadFile(_DB.INTERFACE_PATH + background, function (dataURI) {
			bg_uri = dataURI;
			if (dataURI instanceof ArrayBuffer) {
				try {
					const tga = new Targa();
					tga.load(new Uint8Array(dataURI));
					bg_uri = tga.getDataURL();
				} catch (e) {
					console.error(e.message);
				}
			}
			updateBackground();
		});
	}

	// Active background
	if (active) {
		_Client?.loadFile(_DB.INTERFACE_PATH + active, function (dataURI) {
			active_uri = dataURI;

			// Initialize active state if class is already present
			if (node.classList.contains('active')) {
				state.active = true;
				updateBackground();
			}
		});

		// Watch for class changes
		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.attributeName === 'class') {
					const isActive = node.classList.contains('active');
					if (state.active !== isActive) {
						state.active = isActive;
						updateBackground();
					}
				}
			});
		});

		observer.observe(node, {
			attributes: true,
			attributeFilter: ['class']
		});

		// Clean up observer when node is removed
		node.addEventListener('remove', () => {
			observer.disconnect();
		});
	}

	// On mouse over
	if (hover) {
		_Client?.loadFile(_DB.INTERFACE_PATH + hover, function (dataURI) {
			hover_uri = dataURI;
		});
		node.addEventListener('mouseover', () => {
			state.hover = true;
			updateBackground();
		});
		node.addEventListener('mouseout', () => {
			state.hover = false;
			updateBackground();
		});
	}

	// On mouse down
	if (down) {
		_Client?.loadFile(_DB.INTERFACE_PATH + down, function (dataURI) {
			down_uri = dataURI;
		});
		node.addEventListener('mousedown', () => {
			state.down = true;
			updateBackground();
		});
		node.addEventListener('mouseup', () => {
			state.down = false;
			updateBackground();
		});

		// If not hovering, we need to handle mouseout to reset down state if dragged out
		if (!hover) {
			node.addEventListener('mouseout', () => {
				state.down = false;
				state.hover = false; // Just in case
				updateBackground();
			});
		}
	}

	// Preload images ?
	if (preload) {
		preloads = preload.split(';');
		for (i = 0, count = preloads.length; i < count; ++i) {
			preloads[i] = _DB.INTERFACE_PATH + preloads[i].trim();
		}
		_Client?.loadFiles(preloads);
	}
};

/**
 * Hot-reload CSS for a specific component
 * @param {string} name - Component name
 * @param {string} newCssText - New CSS content
 */
UIComponent.reloadCSS = function reloadCSS(name, newCssText) {
	// Use a separate <style> tag per component for hot-reload
	// This avoids touching the global <style> tag and breaking other components
	const id = 'hmr-' + name;
	let hotStyle = document.getElementById(id);
	if (!hotStyle) {
		hotStyle = document.createElement('style');
		hotStyle.id = id;
		hotStyle.type = 'text/css';
		document.head.appendChild(hotStyle);
	}
	hotStyle.textContent = newCssText;
};

/**
 * Export
 */
export default UIComponent;
