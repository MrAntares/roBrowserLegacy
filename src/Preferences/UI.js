/**
 * Preferences/UI.js
 *
 * UI user preferences
 *
 */
'use strict';

import Preferences from 'Core/Preferences';

/**
 * Export
 */
export default Preferences.get(
	'UI',
	{
		windowmagnet: true
	},
	1.0
);
