/**
 * UI/Components/JoystickUI/JoystickInputService.js
 *
 * Service responsible for monitoring gamepad connection states, 
 * processing raw button/axis data into internal states, and 
 * managing the activation/deactivation of the joystick UI.
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var ButtonInput = require('./JoystickButtonInput');
	var AxisInput = require('./JoystickAxisInput');
	var JoystickUIRenderer = require('./JoystickUIRenderer');
	var hideTimeout = false;

	return {
		active: false,
		buttonStates: {},
		AXIS_THRESHOLD: 0.5,

		prepare: function () {
			window.addEventListener('gamepadconnected', this._onConnect.bind(this));
			window.addEventListener('gamepaddisconnected', this._onDisconnect.bind(this));
		},

		dispose: function () {
			window.removeEventListener('gamepadconnected', this._onConnect);
			window.removeEventListener('gamepaddisconnected', this._onDisconnect);
		},

		getStates: function (gp) {
			if (!gp) return null;
			var states = {
				buttons: [],
				axes: []
			};
			var self = this;

			// Process Buttons with 3-state logic
			gp.buttons.forEach(function (btn, index) {
				var isPressed = btn.pressed;
				var prevState = self.buttonStates[index] || 'unpressed';
				var newState = 'unpressed';
				if (isPressed) {
					newState = (prevState === 'unpressed') ? 'pressed' : 'holding';
				}
				self.buttonStates[index] = newState;
				states.buttons[index] = newState;
			});
			// Process Axes
			gp.axes.forEach(function (axis, index) {
				states.axes[index] = Math.abs(axis) > self.AXIS_THRESHOLD ? axis : 0;
			});
			return states;
		},

		update: function () {
			var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

			var anyConnected = false;
			var anyActivity = false;
			if (gamepads.length) {
				var states = this.getStates(gamepads[0]);
				anyConnected = true;
				if (!states) {
					this.active = false;
					return;
				}

				var buttonsActive = ButtonInput.update(states.buttons);
				var axisActive = AxisInput.update(states.axes);

				if (buttonsActive || axisActive) {
					anyActivity = true;
				}

			}
			if (!anyConnected) {
				this.active = false;
				return;
			}

			if (anyActivity && !this.active) {
				JoystickUIRenderer.show();
				this.active = true;
				return;
			}

			if (!anyActivity && this.active && !hideTimeout) {
				hideTimeout = true;
				var self = this;
				this.active = false;
				setTimeout(function () {
					hideTimeout = false;
					if (self.active === false) {
						JoystickUIRenderer.hide();
					}
				}, 30000);
				return;
			}
			if (!hideTimeout)
				this.active = true;
		},

		_onConnect: function () {
			this.active = true;
			JoystickUIRenderer.show();
		},

		_onDisconnect: function () {
			this.active = false;
			JoystickUIRenderer.hide();
		}
	};
});
