/**
 * Preferences/Graphics.js
 *
 * Graphics preferences
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
	return Preferences.get( 'Graphics', {

		/**
		 * Game size
		 */
		screensize:  '800x600',

		/*
		 * Game quality detail
		 * 100: Full
		 */
		quality:     100,


		/**
		 * Do we show official game cursor ?
		 */
		cursor:      true,


		/**
		 * Game FPS Limit
		 */
		fpslimit:    60,


		/**
		 * View Area Culling
		 */
		culling:    false,
		viewArea: 14,

		/**
		 * Damage Skin
		*/
		damageSkin: 0,

		/**
		 * Damage Motion Type
		 * 0: Default, 1: Left, 2: Top, 3: Right
		*/
		damageMotion: 0,

		pixelPerfectSprites: false,


		/**
		 * Game Post-Processing
		 */
		bloom:    false,
		bloomIntensity: 0.5,

		blur:    false,
		blurArea: 14.0,
		blurIntensity: 3.0,

		fxaaEnabled: false,  
		fxaaSubpix: 0.25, 
		fxaaEdgeThreshold: 0.125,

		vibranceEnabled: false,  
		vibrance: 0.15,

		cartoonEnabled: false,
		cartoonPower: 1.5, 
		cartoonEdgeSlope: 1.5,

		casEnabled:    false,
		casContrast: 0.0,
		casSharpening: 1.0

	}, 1.1 );

});
