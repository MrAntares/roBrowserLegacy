/**
 * Core/Mobile.js
 *
 * Help to handle touch devices
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import Context from 'Core/Context.js';
import Events from 'Core/Events.js';
import Camera from 'Renderer/Camera.js';
import Session from 'Engine/SessionStorage.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import MobileUI from 'UI/Components/MobileUI/MobileUI.js';

/**
 * @class Mobile
 * @description Handles touch interactions and gestures for mobile devices.
 */
class Mobile {
	static #processGesture = false;
	static #scale = 0;
	static #angle = 0;
	static #touches = null;
	static #intersect = false;
	static #timer = -1;
	static #autoFocusDone = false;

	// Callbacks for external overrides
	static onStart = null;
	static onEnd = null;

	/**
	 * Initialize
	 */
	static init() {
		// Initialization logic if needed
	}

	/**
	 * Remove autofocus on mobile.
	 * Let the user decide to focus an input/textarea by himself
	 */
	static #removeAutoFocus() {
		if (this.#autoFocusDone) {
			return;
		}

		jQuery.fn.focus = () => {};
		jQuery.fn.select = () => {};
		this.#autoFocusDone = true;
	}

	/**
	 * Return distance between touches
	 *
	 * @param {TouchList} touches
	 * @returns {number} distance
	 */
	static #getTouchDistance(touches) {
		const x = touches[0].pageX - touches[1].pageX;
		const y = touches[0].pageY - touches[1].pageY;
		return Math.sqrt(x * x + y * y);
	}

	/**
	 * Get angle from touches
	 *
	 * @param {TouchList} touches
	 * @returns {number} rotation angle
	 */
	static #getTouchAngle(touches) {
		const x = touches[0].pageX - touches[1].pageX;
		const y = touches[0].pageY - touches[1].pageY;
		return (Math.atan2(y, x) * 180) / Math.PI;
	}

	/**
	 * Get translation size (width)
	 *
	 * @param {TouchList} oldTouches
	 * @param {TouchList} touches
	 * @returns {number}
	 */
	static #getTouchTranslationX(oldTouches, touches) {
		const x1 = touches[0].pageX - oldTouches[0].pageX;
		const x2 = touches[1].pageX - oldTouches[1].pageX;

		if (x1 && x2 && (x1 < 0 === x2 < 0) && Math.abs(1 - x1 / x2) < 0.25) {
			return (x1 + x2) >> 1;
		}
		return 0;
	}

	/**
	 * Get translation size (height)
	 *
	 * @param {TouchList} oldTouches
	 * @param {TouchList} touches
	 * @returns {number}
	 */
	static #getTouchTranslationY(oldTouches, touches) {
		const y1 = touches[0].pageY - oldTouches[0].pageY;
		const y2 = touches[1].pageY - oldTouches[1].pageY;

		if (y1 && y2 && (y1 < 0 === y2 < 0) && Math.abs(1 - y1 / y2) < 0.25) {
			return (y1 + y2) >> 1;
		}
		return 0;
	}

	/**
	 * Start touching the screen
	 * @param {jQuery.Event} event
	 */
	static onTouchStart(event) {
		this.#removeAutoFocus();
		this.#touches = event.originalEvent.touches;
		event.stopImmediatePropagation();

		// Delayed click (to detect gesture)
		if (this.#timer > -1) {
			Events.clearTimeout(this.#timer);
			this.#timer = -1;
		}

		// Gesture detected
		if (this.#touches.length > 1) {
			this.#scale = this.#getTouchDistance(this.#touches);
			this.#angle = this.#getTouchAngle(this.#touches);
			this.#processGesture = true;
			return false;
		}

		Mouse.screen.x = this.#touches[0].pageX;
		Mouse.screen.y = this.#touches[0].pageY;

		if (!Session.FreezeUI) {
			Mouse.intersect = true;
			this.#intersect = true;
		}

		this.#timer = Events.setTimeout(() => {
			if (!this.#processGesture) {
				this.#timer = -1;
				if (typeof this.onStart === 'function') {
					this.onStart();
				}
				if (!this.#intersect) {
					if (typeof this.onEnd === 'function') {
						this.onEnd();
					}
				}
				Mouse.intersect = this.#intersect;
			}
		}, 200);

		return false;
	}

	/**
	 * End touching the screen
	 * @param {jQuery.Event} event
	 */
	static onTouchEnd(event) {
		if (this.#processGesture) {
			this.#processGesture = false;
			KEYS.SHIFT = false;
			Camera.rotate(false);
			return;
		}

		if (this.#timer > -1) {
			this.#intersect = false;
			return;
		}

		if (typeof this.onEnd === 'function') {
			this.onEnd();
		}

		Mouse.intersect = false;
	}

	/**
	 * Process touch movement
	 * @param {jQuery.Event} event
	 */
	static onTouchMove(event) {
		event.stopImmediatePropagation();

		const touches = event.originalEvent.touches;
		Mouse.screen.x = touches[0].pageX;
		Mouse.screen.y = touches[0].pageY;

		if (!this.#processGesture) {
			return;
		}

		const scale = this.#getTouchDistance(touches) - this.#scale;
		const x = Math.abs(this.#getTouchTranslationX(this.#touches, touches));
		const y = Math.abs(this.#getTouchTranslationY(this.#touches, touches));

		if (!Camera.action.active && (x > 10 || y > 10)) {
			KEYS.SHIFT = y > x;
			Camera.rotate(true);
			return;
		}

		// Process zoom
		if (Math.abs(scale) > 10) {
			Camera.zoomFinal -= scale * 0.1;
			Camera.zoomFinal = Math.min(
				Camera.zoomFinal,
				Math.abs(Camera.altitudeTo - Camera.altitudeFrom) * Camera.MAX_ZOOM
			);
			Camera.zoomFinal = Math.max(Camera.zoomFinal, 2.0);
		}
	}

	/**
	 * Global touch-device detection handler
	 */
	static onTouchDeviceDetected() {
		Session.isTouchDevice = true;
		if (Session.Playing) {
			MobileUI.show();
		}
	}
}

// Global initialization logic
if (Math.max(screen.availHeight, screen.availWidth) <= 800) {
	jQuery(window).on('touchstart', () => {
		if (!Context.isFullScreen()) {
			Context.requestFullScreen();
		}
	});
}

// Add mobile UI on touch
jQuery(window).one('touchstart', () => Mobile.onTouchDeviceDetected());

// Touch controls
jQuery(window)
	.on('touchstart', (e) => Mobile.onTouchStart(e))
	.on('touchend', (e) => Mobile.onTouchEnd(e))
	.on('touchmove', (e) => Mobile.onTouchMove(e));

export default Mobile;
