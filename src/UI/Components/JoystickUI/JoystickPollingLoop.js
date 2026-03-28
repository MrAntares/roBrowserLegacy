/**
 * UI/Components/JoystickUI/JoystickPollingLoop.js
 *
 * Provides a high-frequency interval loop to poll the Gamepad API
 * and trigger input state updates at a consistent rate.
 *
 * @author AoShinHo
 */
'use strict';

import InputService from './JoystickInputService';

let timeoutHandle = null;
	let POLL_RATE_ACTIVE = 100; // 10 FPS
	let POLL_RATE_IDLE = 1000; // 1 FPS
export default {
		start: function () {
			if (timeoutHandle) {
				return;
			}
			this.run();
		},
		run: function () {
			let isConnected = InputService.update();

			let nextDelay = isConnected ? POLL_RATE_ACTIVE : POLL_RATE_IDLE;
			let self = this;
			timeoutHandle = setTimeout(function () {
				self.run();
			}, nextDelay);
		},
		stop: function () {
			if (timeoutHandle) {
				clearTimeout(timeoutHandle);
				timeoutHandle = null;
			}
		}
	};