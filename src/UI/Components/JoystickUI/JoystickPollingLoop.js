/**
 * UI/Components/JoystickUI/JoystickPollingLoop.js
 *
 * Provides a high-frequency interval loop to poll the Gamepad API 
 * and trigger input state updates at a consistent rate.
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var InputService = require('./JoystickInputService');

	var interval = null;
	var POLL_RATE = 100;

	return {
		start: function () {
			if (!interval) {
				interval = setInterval(function () {
					InputService.update();
				}, POLL_RATE);
			}
		},

		stop: function () {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		}
	};
});
