/**
 * Preferences/Controls.js
 *
 * Control user preferences
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
'use strict';

import Preferences from 'Core/Preferences';

/**
	 * Export 
	 */
	export default Preferences.get(
		'Controls',
		{
			noctrl: true,
			noshift: false,
			snap: false,
			itemsnap: false,
			/* Joystick */
			attackTargetMode: 0,
			joyQuick: 0,
			joyDeadline: 0.1,
			joyDisableVirtualMouse: false,
			joyAutoHide: false,
			joyReverseStick: false,
			joySense: 25.0
		},
		1.0
	);