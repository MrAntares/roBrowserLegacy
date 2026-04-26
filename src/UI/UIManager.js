/**
 * UI/UIManager.js
 *
 * Manage Interface
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import UIComponent from 'UI/UIComponent.js';
import GUIComponent from 'UI/GUIComponent.js';
import UIVersionManager from 'UI/UIVersionManager.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import GameEngine from 'Engine/GameEngine.js';

/**
 * Centralize popup position
 * @returns {{top: string, left: string, zIndex: string}}
 */
function _popupPosition() {
	return {
		top: `${(Renderer.height - 120) / 1.5 - 120}px`,
		left: `${(Renderer.width - 280) / 2.0}px`,
		zIndex: '100'
	};
}

/**
 * Create a button with data-attributes for parseHTML to process
 * @param {string} name - button name (ex: 'ok', 'cancel')
 * @param {function} onClick - click callback (fires once)
 * @param {function} parseHTML - reference to UIComponent.prototype.parseHTML
 * @returns {HTMLButtonElement}
 */
function _createButton(name, onClick) {
	const btn = document.createElement('button');
	btn.className = 'btn';
	btn.dataset.background = `btn_${name}.bmp`;
	btn.dataset.hover = `btn_${name}_a.bmp`;
	btn.dataset.down = `btn_${name}_b.bmp`;

	let clicked = false;
	btn.addEventListener('click', () => {
		if (clicked) return;
		clicked = true;
		onClick();
	});

	GUIComponent.processDataAttrs(btn);

	return btn;
}

/**
 * Create overlay that blocks interaction with the game
 * @returns {HTMLDivElement}
 */
function _createOverlay() {
	const overlay = document.createElement('div');
	overlay.className = 'win_popup_overlay';
	document.body.appendChild(overlay);
	return overlay;
}

/**
 * Reorder keydown handlers so the popup captures first.
 * NOTE: Uses jQuery._data (internal API) — migrate when the event system is refactored.
 */
function _prioritizeKeyDown() {
	// Re-bind keydown in capture phase so the popup handler fires
	// before any other keydown listener (native or jQuery).
	if (this._keyHandler) {
		window.removeEventListener('keydown', this._keyHandler);
		window.addEventListener('keydown', this._keyHandler, true);
	}
}

/**
 * User Interface Manager
 */
class UIManager {
	/**
	 * Components cache
	 * @var {array} Components List
	 */
	static components = {};

	/**
	 * Store a component in the manager
	 *
	 * @param {UIComponent} component object
	 */
	static addComponent(component) {
		if (!(component instanceof UIComponent) && !(component instanceof GUIComponent)) {
			throw new Error('UIManager::addComponent() - Invalid type of component');
		}

		component.manager = this;
		this.components[component.name] = component;
		return component;
	}

	/**
	 * Get component stored in manager
	 *
	 * @param {string} component name
	 * @return {UIComponent} object
	 */
	static getComponent(name) {
		const versionAlias = UIVersionManager.getUIAlias(name);
		if (versionAlias) {
			name = versionAlias;
		}

		if (!(name in this.components)) {
			throw new Error('UIManager.getComponent() - Component "' + name + '" not found');
		}

		return this.components[name];
	}

	/**
	 * Remove all components in screen
	 */
	static removeComponents() {
		const keys = Object.keys(this.components);
		const count = keys.length;

		for (let i = 0; i < count; ++i) {
			this.components[keys[i]].remove();
		}
	}

	/**
	 * When resizing window, some components can be outside the screen size and
	 * it sucks a lot. Try to correct the problem.
	 *
	 * @param {number} Game screen width
	 * @param {number} Game screen height
	 */
	static fixResizeOverflow(WIDTH, HEIGHT) {
		const keys = Object.keys(this.components);

		for (let i = 0; i < keys.length; ++i) {
			const component = this.components[keys[i]];

			const el = component.ui ? component.ui[0] : null;
			if (!el) continue;

			const rect = el.getBoundingClientRect();
			const x = rect.left;
			const y = rect.top;
			const width = rect.width;
			const height = rect.height;

			if (y + height > HEIGHT) {
				el.style.top = `${HEIGHT - Math.min(height, HEIGHT)}px`;
			}
			if (x + width > WIDTH) {
				el.style.left = `${WIDTH - Math.min(width, WIDTH)}px`;
			}

			// Magnet
			if (component.magnet.BOTTOM) {
				el.style.top = `${HEIGHT - height}px`;
			}
			if (component.magnet.RIGHT) {
				el.style.left = `${WIDTH - width}px`;
			}

			if (component.onResize) {
				component.onResize();
			}
		}
	}

	/**
	 * Display an error box component
	 * Will reload the game once selected
	 *
	 * @param {string} error message
	 */
	static showErrorBox(text) {
		const WinError = this.getComponent('WinPopup').clone('WinError');
		// eslint-disable-next-line
		let overlay;

		WinError.init = function Init() {
			const root = this._shadow;

			root.querySelector('.text').textContent = text;
			Object.assign(this._host.style, _popupPosition());

			root.querySelector('.btns').appendChild(
				_createButton('ok', () => {
					overlay.remove();
					WinError.remove();
					GameEngine.reload();
				})
			);
		};

		WinError.onKeyDown = function OnKeyDown(event) {
			event.stopImmediatePropagation();
			switch (event.which) {
				case KEYS.ENTER:
				case KEYS.ESCAPE:
					overlay.remove();
					this.remove();
					GameEngine.reload();
			}
		};

		overlay = _createOverlay();
		WinError.onAppend = _prioritizeKeyDown;
		WinError.append();

		return WinError;
	}

	/**
	 * Show a message box to the user
	 *
	 * @param {string} message to show
	 * @param {string} button name
	 * @param {function} callback once the button is pressed
	 */
	static showMessageBox(text, btn_name, callback, keydown) {
		const WinMSG = this.getComponent('WinPopup').clone('WinMSG');

		WinMSG.init = function Init() {
			this.draggable();
			const root = this._shadow;

			root.querySelector('.text').textContent = text;
			Object.assign(this._host.style, _popupPosition());

			if (btn_name) {
				root.querySelector('.btns').appendChild(
					_createButton(btn_name, () => {
						WinMSG.remove();
						if (callback) callback();
					})
				);
			}
		};

		if (keydown) {
			WinMSG.onKeyDown = function (event) {
				switch (event.which) {
					case KEYS.ENTER:
					case KEYS.ESCAPE:
						this.remove();
						if (callback) callback();
				}
				event.stopImmediatePropagation();
			};

			WinMSG.onAppend = _prioritizeKeyDown;
		}

		WinMSG.append();
		return WinMSG;
	}

	/**
	 * Prompt a message to the user
	 *
	 * @param {string} message to show
	 * @param {string} button ok
	 * @param {string} button cancel
	 * @param {function} callback when ok is pressed
	 * @param {function} callback when cancel is pressed
	 */
	static showPromptBox(text, btn_yes, btn_no, onYes, onNo) {
		const WinPrompt = this.getComponent('WinPopup').clone('WinPrompt');

		WinPrompt.init = function Init() {
			this.draggable();
			const root = this._shadow;

			root.querySelector('.text').textContent = text;
			Object.assign(this._host.style, _popupPosition());

			const btnsContainer = root.querySelector('.btns');

			btnsContainer.appendChild(
				_createButton(btn_yes, () => {
					WinPrompt.remove();
					if (onYes) onYes();
				})
			);

			btnsContainer.appendChild(
				_createButton(btn_no, () => {
					WinPrompt.remove();
					if (onNo) onNo();
				})
			);
		};

		WinPrompt.append();
		return WinPrompt;
	}

	/**
	 * Reload CSS of a component
	 * @param {string} componentName
	 * @param {string} newCssText
	 */
	static reloadCSS(componentName, newCssText) {
		UIComponent.reloadCSS(componentName, newCssText);
	}
}
/**
 * Export
 */
export default UIManager;
