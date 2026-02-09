/**
 * UI/Components/JoystickUI/JoystickModule.js
 *
 * Main entry point for the Joystick component.
 * Manages the initialization (prepare) and cleanup (dispose)
 * of all joystick-related sub-services and polling loops.
 *
 * @author AoShinHo
 */
define(function (require)
{
	'use strict';

	var Polling = require('./JoystickPollingLoop');
	var InputService = require('./JoystickInputService');
	var Interaction = require('./JoystickInteractionService');
	var ShortcutMapper = require('./JoystickShortcutMapper');
	var JoystickUIRenderer = require('./JoystickUIRenderer');

	return {
		prepare: function ()
		{
			ShortcutMapper.prepare();
			InputService.prepare();
			Interaction.prepare();
			Polling.start();
			JoystickUIRenderer.hide();
		},
		dispose: function ()
		{
			Polling.stop();
			Interaction.dispose();
			InputService.dispose();
			JoystickUIRenderer.dispose();
		}
	};
});
