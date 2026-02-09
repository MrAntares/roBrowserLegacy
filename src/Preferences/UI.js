/**
 * Preferences/UI.js
 *
 * UI user preferences
 *
 */
define(['Core/Preferences'], function (Preferences)
{
	'use strict';

	/**
	 * Export
	 */
	return Preferences.get(
		'UI',
		{
			windowmagnet: true
		},
		1.0
	);
});
