/**
 * UI/GUIComponent.js
 *
 * Modern base class for UI components using Shadow DOM.
 * Drop-in replacement for UIComponent — provides the same automation
 * (prepare, append, remove, focus, draggable, clone, scrollbar, etc.)
 * but uses native DOM + Shadow DOM instead of old UIComponent.
 *
 * @author AoShinHo
 */

import CommonCSS from 'UI/Common.css?raw';
import Mouse from 'Controls/MouseEventHandler.js';
import Session from 'Engine/SessionStorage.js';
import ClampToViewport from 'UI/ClampToViewport.js';
import whenDrawn from 'UI/WhenDrawn.js';
import { ensureDeps, getCursor, getEntityManager, getRenderer } from 'UI/GUI/GUIDeps.js';
import { addNoCursorFallback, trackNoCursorStyle, untrackNoCursorStyle } from 'UI/GUI/NoCursorFallback.js';
import { attachDraggable } from 'UI/GUI/Draggable.js';
import { MouseMode, frozenBy, setupMouseMode, setupShadowCursorEvents } from 'UI/GUI/MouseMode.js';
import { setupScrollbars } from 'UI/GUI/Scrollbars.js';
import { parseHTML, processAllDataAttrs, processDataAttrs } from './GUI/DataAttrs.js';
import { createUIProxy } from 'UI/GUI/UIProxy.js';

class GUIComponent {
	/**
	 * @param {string} name       - Unique component name
	 * @param {string} [cssText]  - CSS content (injected into Shadow DOM)
	 */
	constructor(name, cssText) {
		this.name = name;
		this._cssText = cssText || null;
		this._host = null; // The outer DOM element
		this._shadow = null; // ShadowRoot
		this._container = null; // Inner wrapper inside shadow

		this.magnet = { TOP: false, BOTTOM: false, LEFT: false, RIGHT: false };
		this._isDraggable = false;

		this.mouseMode = MouseMode.STOP;
		this.needFocus = true;
		this.manager = null; // Set by UIManager.addComponent()

		this.__loaded = false;
		this.__preparing = false;
		this.__active = false;
		this.__scrollbarObserver = null;
		this.__mouseStopBlock = null;

		this._keyHandler = null;
		this._enterCount = 0;
		this._savedIntersect = false;

		// Compatibility proxy — lets UIManager and old UIComponent
		// instances call .ui.css(), .ui[0], .ui.offset(), etc.
		this.ui = null; // Created in prepare()
	}

	// ─── Static ────────────────────────────────────────────

	static MouseMode = MouseMode;

	// ─── Lifecycle: prepare ────────────────────────────────

	/**
	 * Get the root element of the component.
	 */

	getRoot() {
		return this._shadow || this._host;
	}

	/**
	 * Build the Shadow DOM, inject CSS, call init(), set up
	 * mouse intersection and touch handling.
	 * Equivalent to UIComponent.prototype.prepare().
	 */
	prepare() {
		if (this.__loaded || this.__preparing) return;

		// Guards against re-entrancy and leaves __loaded false when _prepare() throws
		this.__preparing = true;
		try {
			this._prepare();
			this.__loaded = true;
		} finally {
			this.__preparing = false;
		}
	}

	_prepare() {
		ensureDeps();

		// Create host element
		this._host = document.createElement('div');
		this._host.id = this.name;
		this._host.style.zIndex = '50';
		this._host.style.position = 'absolute';

		// Attach Shadow DOM (open for devtools inspection)
		this._shadow = this._host.attachShadow({ mode: 'open' });

		// Inject Common CSS (shared, immutable)
		const commonStyle = document.createElement('style');
		commonStyle.textContent = CommonCSS;
		this._shadow.appendChild(commonStyle);

		// Hide native cursor where style queries are missing
		this._noCursorStyle = addNoCursorFallback(this._shadow);

		// Inject component CSS (hot-reloadable)
		const compStyle = document.createElement('style');
		compStyle.setAttribute('data-component', this.name);
		compStyle.textContent = this._cssText || '';
		this._shadow.appendChild(compStyle);

		// Create inner container for component content
		this._container = document.createElement('div');
		this._container.classList.add('ui-component-root');
		this._shadow.appendChild(this._container);

		// Render component content (subclass provides this)
		if (this.render) {
			this._container.innerHTML = this.render();
		}

		// Process legacy data-* attributes (background, hover, down, text, etc.)
		// Text now; each image when its node is first drawn.
		this._processAllDataAttrs(true);

		// Create jQuery compatibility proxy
		this._createUIProxy();

		document.body.appendChild(this._host);

		// Initialize (subclass provides this)
		if (this.init) {
			this.init();
		}

		// Mouse intersection handling
		this._setupMouseMode();

		this._host.remove();
		whenDrawn.suspend(this._host);
	}

	// ─── Lifecycle: append ─────────────────────────────────

	/**
	 * Add the component to the DOM.
	 * Equivalent to UIComponent.prototype.append().
	 *
	 * @param {HTMLElement|string} [target] - Target element. Defaults to document.body.
	 */
	append(target) {
		this.__active = true;

		if (!this.__loaded) {
			this.prepare();
			if (this.__active) this.append(target);
			return;
		}

		// Append host to target
		const parent = target ? (typeof target === 'string' ? document.querySelector(target) : target) : document.body;

		if (!parent) {
			console.error('[GUIComponent] Unable to find target element for appending UI.');
			return;
		}

		parent.appendChild(this._host);
		whenDrawn.resume(this._host);
		if (this._noCursorStyle) {
			trackNoCursorStyle(this._noCursorStyle);
		}

		// Bind keydown
		if (this.onKeyDown) {
			this._bindKeyDown();
		}

		// Freeze mode
		if (this.mouseMode === MouseMode.FREEZE) {
			if (!frozenBy.includes(this)) {
				frozenBy.push(this);
			}
			Mouse.intersect = false;
			Session.FreezeUI = true;
			getEntityManager()?.setOverEntity(null);
			getCursor()?.setType(getCursor()?.ACTION?.DEFAULT ?? 0);
		}

		// Hook
		if (this.onAppend) {
			this.onAppend();
		}

		// Scrollbars
		this._setupScrollbars();

		// Fix position overflow
		this._fixPositionOverflow();

		// Focus
		this.focus();
	}

	/**
	 * Fix component position after append or screen resize.
	 * Ensures the component stays within the visible viewport
	 * and respects magnet constraints.
	 *
	 * Skipped for non-draggable (fixed-position) components since their
	 * CSS position is intentional and should not be overridden.
	 */
	_fixPositionOverflow() {
		if (!this._host || !this._isDraggable) return;
		const WIDTH = getRenderer()?.width ?? window.innerWidth;
		const HEIGHT = getRenderer()?.height ?? window.innerHeight;
		ClampToViewport(this._host, WIDTH, HEIGHT, this.magnet);
	}

	// ─── Lifecycle: remove ─────────────────────────────────

	/**
	 * Remove the component from the DOM.
	 * Equivalent to UIComponent.prototype.remove().
	 */
	remove() {
		this.__active = false;

		if (this.__loaded && this._host && this._host.parentNode) {
			// Hook
			if (this.onRemove) {
				this.onRemove();
			}

			// Unbind keydown
			this._unbindKeyDown();

			// Fire x_remove event (used by mouse intersection cleanup)
			this._host.dispatchEvent(new Event('x_remove'));
			if (this._shadow) {
				this._shadow.querySelectorAll('*').forEach(node => {
					node.dispatchEvent(new Event('x_remove'));
				});
			}

			// Detach from DOM
			this._host.remove();
			whenDrawn.suspend(this._host);
			if (this._noCursorStyle) {
				untrackNoCursorStyle(this._noCursorStyle);
			}

			// Freeze mode cleanup
			if (this.mouseMode === MouseMode.FREEZE) {
				const index = frozenBy.indexOf(this);
				if (index !== -1) {
					frozenBy.splice(index, 1);
				}
				if (!frozenBy.length) {
					Mouse.intersect = true;
					Session.FreezeUI = false;
				}
			}

			// Scrollbar observer cleanup
			if (this.__scrollbarObserver) {
				this.__scrollbarObserver.disconnect();
				this.__scrollbarObserver = null;
			}
		}
	}

	// ─── Focus / zIndex management ─────────────────────────

	/**
	 * Focus the UI (bring to top of other components).
	 * Equivalent to UIComponent.prototype.focus().
	 */
	focus() {
		if (!this.manager || !this.needFocus) return;

		const components = this.manager.components;
		const list = [];

		// Collect zIndex values from other active components
		for (const name in components) {
			const other = components[name];
			if (other === this || !other.__active || !other.needFocus) continue;

			// Works with both UIComponent (.ui.css) and GUIComponent (._host.style)
			const z = parseInt(this._getZIndex(other), 10);
			list[z - 50] = z;
		}

		// Re-organize to remove gaps
		let j = 0;
		for (let i = 0; i < list.length; i++) {
			if (!list[i]) {
				j++;
				continue;
			}
			list[i] -= j;
		}

		// Apply new zIndex to all other components
		for (const name in components) {
			const other = components[name];
			if (other === this || !other.__active || !other.needFocus) continue;

			const z = parseInt(this._getZIndex(other), 10);
			this._setZIndex(other, list[z - 50]);
		}

		// Push ourselves to top
		this._setZIndex(this, list.length + 50 - j);
	}

	/**
	 * Place on top of all other components.
	 * Equivalent to UIComponent.prototype.placeOnTop().
	 */
	placeOnTop() {
		if (!this.manager) return;

		const components = this.manager.components;
		const zList = [];

		for (const name in components) {
			const other = components[name];
			if (other === this || !other.__active || !other.needFocus) continue;
			zList.push(parseInt(this._getZIndex(other), 10));
		}

		this._setZIndex(this, Math.max(50, ...zList) + 1);
	}

	/**
	 * Clone a component.
	 * Equivalent to UIComponent.prototype.clone().
	 *
	 * @param {string} name - New component name
	 * @param {boolean} [full] - Copy all properties
	 * @returns {GUIComponent}
	 */
	clone(name, full) {
		const cloned = new GUIComponent(name, this._cssText);

		// Copy render function so the clone produces the same HTML
		if (this.render) cloned.render = this.render;

		// Always inherit behavioral properties
		cloned.mouseMode = this.mouseMode;
		cloned.needFocus = this.needFocus;

		if (full) {
			for (const key of Object.keys(this)) {
				if (
					key === '_host' ||
					key === '_shadow' ||
					key === '_container' ||
					key === 'ui' ||
					key === '__loaded' ||
					key === '__preparing' ||
					key === '__scrollbarObserver'
				) {
					continue; // Don't copy DOM state
				}
				cloned[key] = this[key];
			}
		}

		return cloned;
	}

	// ─── Event binding ─────────────────────────────────────

	/**
	 * Enable event type. Only 'keydown' is supported (same as UIComponent).
	 * @param {string} type
	 */
	on(type) {
		if (type.toLowerCase() === 'keydown' && this.onKeyDown) {
			this._bindKeyDown();
		}
	}

	/**
	 * Disable event type.
	 * @param {string} type
	 */
	off(type) {
		if (type.toLowerCase() === 'keydown') {
			this._unbindKeyDown();
		}
	}

	// ─── Private: keydown helpers ──────────────────────────

	_bindKeyDown() {
		if (!this.onKeyDown) return;
		this._unbindKeyDown();
		const handler = this.onKeyDown.bind(this);
		this._keyHandler = event => {
			if (handler(event) === false) {
				event.preventDefault();
			}
		};
		const useCapture = !!this.captureKeyEvents;
		window.addEventListener('keydown', this._keyHandler, useCapture);
	}

	_unbindKeyDown() {
		if (this._keyHandler) {
			window.removeEventListener('keydown', this._keyHandler);
			window.removeEventListener('keydown', this._keyHandler, true); // capture phase
			this._keyHandler = null;
		}
	}

	/**
	 * Check if an editable element is focused.
	 * @returns {boolean}
	 */
	isEditableFocused() {
		const root = this.getRoot();
		const active = root && root.activeElement;
		if (!active || !active.tagName) return false;
		if (/input|textarea|select/i.test(active.tagName)) return true;
		else if (active.getAttribute('contenteditable') === 'true') return true;
		return false;
	}

	// ─── Private: zIndex helpers (cross-compatible) ────────

	/**
	 * Get zIndex from either a GUIComponent or a legacy UIComponent.
	 * @param {GUIComponent|UIComponent} comp
	 * @returns {string}
	 */
	_getZIndex(comp) {
		if (comp._host) {
			// GUIComponent
			return comp._host.style.zIndex || '50';
		}
		// Legacy UIComponent (jQuery)
		return comp.ui.css('zIndex') || '50';
	}

	/**
	 * Set zIndex on either a GUIComponent or a legacy UIComponent.
	 * @param {GUIComponent|UIComponent} comp
	 * @param {number} value
	 */
	_setZIndex(comp, value) {
		if (comp._host) {
			comp._host.style.zIndex = value;
		} else {
			comp.ui.css('zIndex', value);
		}
	}

	// ─── Draggable ─────────────────────────────────────────

	/**
	 * Make the component draggable.
	 * Equivalent to UIComponent.prototype.draggable().
	 *
	 * @param {string|HTMLElement} [handle] - CSS selector or element to use as drag handle.
	 *                                        Defaults to the host element.
	 * @returns {GUIComponent} this
	 */
	draggable(handle) {
		attachDraggable(this, handle);
		return this;
	}

	// ─── Mouse intersection setup ──────────────────────────
	_setupShadowCursorEvents() {
		setupShadowCursorEvents(this);
	}

	_setupMouseMode() {
		setupMouseMode(this);
	}

	// ─── Scrollbar setup ───────────────────────────────────

	_setupScrollbars() {
		setupScrollbars(this);
	}

	// ─── Process data-* attributes (replaces parseHTML) ────

	/**
	 * Process legacy data-* attributes on a single DOM element.
	 * Handles: data-background, data-hover, data-down, data-active, data-text, data-preload.
	 * Static so it can be called from anywhere (e.g. dynamically created buttons).
	 *
	 * @param {HTMLElement} node
	 * @param {object} [options]
	 * @param {boolean} [options.text] - set the localized text
	 * @param {boolean} [options.images] - fetch the images
	 * @param {string} [options.deferredFrom] - the node's inline background
	 *   when its images were deferred: a different one set since then by the
	 *   window itself stays
	 */
	static processDataAttrs(node, options) {
		return processDataAttrs(node, options);
	}

	/**
	 * Walk the shadow DOM and process all elements with data-* attributes.
	 * Called once during prepare().
	 *
	 * @param {boolean} [deferImages] - set the text now, and fetch each
	 *   node's images when it is first drawn (UI/WhenDrawn.js)
	 */
	_processAllDataAttrs(deferImages = false) {
		return processAllDataAttrs(this, deferImages);
	}

	/**
	 * Compatibility shim for UIComponent.parseHTML.
	 * When called via .call(element) or .each(parseHTML),
	 * `this` is the DOM element.
	 */
	get parseHTML() {
		return parseHTML;
	}

	// ─── CSS hot-reload ────────────────────────────────────

	reloadCSS(newCssText) {
		if (this._shadow) {
			const existing = this._shadow.querySelector('style[data-component]');
			if (existing) {
				existing.textContent = newCssText;
			}
		}
	}

	/**
	 * Static version for external callers (e.g. HMR).
	 */
	static reloadCSS(name, newCssText) {
		// Fallback for components not yet migrated
		const id = 'hmr-' + name;
		let hotStyle = document.getElementById(id);
		if (!hotStyle) {
			hotStyle = document.createElement('style');
			hotStyle.id = id;
			hotStyle.type = 'text/css';
			document.head.appendChild(hotStyle);
		}
		hotStyle.textContent = newCssText;
	}

	// ─── Compatibility proxy ───────────────────────────────

	/**
	 * Create a minimal jQuery-like proxy for this.ui so that
	 * UIManager and old UIComponent.focus() can interoperate
	 * during the transition period.
	 */
	_createUIProxy() {
		return createUIProxy(this);
	}
}

export default GUIComponent;
