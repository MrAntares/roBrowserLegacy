/**
 * UI/Components/JoystickUI/JoystickPollingLoop.js
 *
 * Provides a high-frequency interval loop to poll the Gamepad API
 * and trigger input state updates at a consistent rate.
 *
 * @author AoShinHo
 */
define(function (require)
{
	'use strict';

	var InputService = require('./JoystickInputService');

	var timeoutHandle = null;
	var POLL_RATE_ACTIVE = 100; // 10 FPS
	var POLL_RATE_IDLE = 1000; // 1 FPS

	return {
		start: function ()
		{
			if (timeoutHandle) {return;}
			this.run();
		},
		run: function ()
		{
			var isConnected = InputService.update();

			var nextDelay = isConnected ? POLL_RATE_ACTIVE : POLL_RATE_IDLE;
			var self = this;
			timeoutHandle = setTimeout(function ()
			{
				self.run();
			}, nextDelay);
		},
		stop: function ()
		{
			if (timeoutHandle)
			{
				clearTimeout(timeoutHandle);
				timeoutHandle = null;
			}
		}
	};
});
