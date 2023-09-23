/**
 * Preferences/Map.js
 *
 * Map user preferences
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define( ['Core/Preferences'], function( Preferences )
{
	'use strict';


	/**
	 * Export
	 */
	return Preferences.get( 'Map', {

		/**
		 * Display the fog ?
		 *
		 * Toggle by using "/fog" in the chatbox
		 */
		fog: true,

		/**
		 * Display lightmap ?
		 *
		 * Toggle using "/lightmap" in the chatbox
		 */
		lightmap: true,


		/**
		 * Display effects ?
		 *
		 * Toggle using "/effect" in the chatbox
		 */
		effect: true,


		/**
		 * Display minify effects ?
		 *
		 * Toggle using "/mineeffect" in the chatbox
		 */
		mineffect: false,


		/**
		 * Should we display "miss" when monster/player miss an attack ?
		 *
		 * Toggle using "/miss" in the chatbox
		 */
		miss: true,


		/**
		 * Display simplified aura or disable entirely
		 *
		 * Toggle using "/aura" or "/aura2" in the chatbox
		 */
		aura: 1,

		/**
		 * Display different font style ?
		 *
		 * Toggle using "/showname" changes font styles.
		 */
		showname: true

	}, 1.1 );
});
