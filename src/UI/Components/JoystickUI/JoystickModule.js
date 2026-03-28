/**
 * UI/Components/JoystickUI/JoystickModule.js
 *
 * Main entry point for the Joystick component.
 * Manages the initialization (prepare) and cleanup (dispose)
 * of all joystick-related sub-services and polling loops.
 *
 * @author AoShinHo
 */
'use strict';

import Polling from './JoystickPollingLoop';
import InputService from './JoystickInputService';
import Interaction from './JoystickInteractionService';
import ShortcutMapper from './JoystickShortcutMapper';
import JoystickUIRenderer from './JoystickUIRenderer';

	export default {
		prepare: function () {
			ShortcutMapper.prepare();
			InputService.prepare();
			Interaction.prepare();
			Polling.start();
			JoystickUIRenderer.hide();
		},
		dispose: function () {
			Polling.stop();
			Interaction.dispose();
			InputService.dispose();
			JoystickUIRenderer.dispose();
		}
	};