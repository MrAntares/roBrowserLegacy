/**
 * UI/Components/JoystickUI/JoystickInputService.js
 *
 * Service responsible for monitoring gamepad connection states,
 * processing raw button/axis data into internal states, and
 * managing the activation/deactivation of the joystick UI.
 *
 * @author AoShinHo
 */
define(function (require)
{
	'use strict';

	var ButtonInput = require('./JoystickButtonInput');
	var AxisInput = require('./JoystickAxisInput');
	var JoystickUIRenderer = require('./JoystickUIRenderer');
	var ControlsSettings = require('Preferences/Controls');
	var hideTimeout = false;

	return {
		active: false,
		buttonStates: {},

		prepare: function ()
		{
			this._boundOnConnect = this._onConnect.bind(this);
			this._boundOnDisconnect = this._onDisconnect.bind(this);

			window.addEventListener('gamepadconnected', this._boundOnConnect);
			window.addEventListener('gamepaddisconnected', this._boundOnDisconnect);
		},

		dispose: function ()
		{
			window.removeEventListener('gamepadconnected', this._boundOnConnect);
			window.removeEventListener('gamepaddisconnected', this._boundOnDisconnect);

			this.active = false;
			this.buttonStates = {};
		},

		getStates: function (gp)
		{
			if (!gp) {return null;}
			var states = {
				buttons: [],
				axes: []
			};
			var self = this;

			// Process Buttons with 3-state logic
			gp.buttons.forEach(function (btn, index)
			{
				var isPressed = btn.pressed;
				var prevState = self.buttonStates[index] || 'unpressed';
				var newState = 'unpressed';
				if (isPressed)
				{
					newState = prevState === 'unpressed' ? 'pressed' : 'holding';
				}
				self.buttonStates[index] = newState;
				states.buttons[index] = newState;
			});
			// Process Axes
			gp.axes.forEach(function (axis, index)
			{
				states.axes[index] = Math.abs(axis) > ControlsSettings.joyDeadline ? axis : 0;
			});
			return states;
		},

		update: function ()
		{
			var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

			var activeGamepad = null;
			for (var i = 0; i < gamepads.length; i++)
			{
				if (gamepads[i])
				{
					activeGamepad = gamepads[i];
					break;
				}
			}
			if (!activeGamepad)
			{
				if (this.active)
				{
					this.active = false;
					JoystickUIRenderer.hide();
				}
				return false;
			}
			var states = this.getStates(activeGamepad);

			var anyActivity = false;

			if (!states)
			{
				this.active = false;
				return false;
			}

			var buttonsActive = ButtonInput.update(states.buttons);
			var axisActive = AxisInput.update(states.axes);

			if (buttonsActive || axisActive)
			{
				anyActivity = true;
			}

			if (anyActivity && !this.active)
			{
				JoystickUIRenderer.show();
				this.active = true;
			}

			if (!anyActivity && this.active && !hideTimeout)
			{
				hideTimeout = true;
				var self = this;
				this.active = false;
				setTimeout(function ()
				{
					hideTimeout = false;
					if (self.active === false)
					{
						JoystickUIRenderer.hide();
					}
				}, 30000);
			}
			else if (!hideTimeout) {this.active = true;}
			return true;
		},

		_onConnect: function ()
		{
			require('./JoystickModule').prepare();
			this.active = true;
			JoystickUIRenderer.show();
		},

		_onDisconnect: function ()
		{
			require('./JoystickModule').dispose();
			this.active = false;
			JoystickUIRenderer.hide();
		}
	};
});
