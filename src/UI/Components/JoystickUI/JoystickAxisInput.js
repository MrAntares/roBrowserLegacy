/**
 * UI/Components/JoystickUI/JoystickAxisInput.js
 *
 * Processes analog stick movements (axes). 
 * Responsible for translating stick coordinates into character 
 * movement and mouse cursor positioning based on defined deadzones.
 *
 * @author AoShinHo
 */
define(function (require) {
	'use strict';

	var Interaction = require('./JoystickInteractionService');
	var ControlsSettings = require('Preferences/Controls');

	return {

		update: function (axes) {
			var active = false;

			// Left stick = movement
			var lx = axes[0];
			var ly = axes[1];
			if (Math.abs(lx) > ControlsSettings.joyDeadline || Math.abs(ly) > ControlsSettings.joyDeadline) {
				Interaction.moveCharacter(lx, -ly);
				Interaction.cancelQuick = true;
				active = true;
			}

			// Right stick = cursor
			if (axes.length >= 4) {
				var rx = axes[2];
				var ry = axes[3];
				if (Math.abs(rx) > ControlsSettings.joyDeadline || Math.abs(ry) > ControlsSettings.joyDeadline) {
					Interaction.moveCursor(rx, ry);
					active = true;
				}
			}
			if(active) require('./JoystickUIRenderer').show();

			return active;
		}
	};
});
