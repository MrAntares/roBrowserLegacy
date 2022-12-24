/**
 * Utils/jquery.js
 *
 * Extend jquery
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define( ['jquery', 'DB/DBManager', 'jqueryui', 'jqueryuitopdrop'], function( jQuery, DB, jQueryUI, topDrop  )
{
	'use strict';


	/**
	 * Overwrite text() to support npc code
	 *
	 * @param {string} value
	 */
	
	jQuery.fn.text = function( text ) {
		if (text === undefined) {
			return jQuery.text( this );
		}

		var reg, txt, result;

		// Escape, secure entry
		text = String(text);
		txt   = jQuery.escape(text);

		// Msg color ^000000
		reg = /\^([a-fA-F0-9]{6})/ ;
		while ((result = reg.exec(txt))) {
			txt = txt.replace( result[0], '<span style="color:#' + result[1] + '">') + '</span>';
		}

		// Hiding hack ^nItemID^502
		reg = /\^nItemID\^(\d+)/g;
		while ((result = reg.exec(txt))) {
			txt = txt.replace( result[0], DB.getItemInfo(result[1]).identifiedDisplayName );
		}


		reg = /\<url\>(.*?)\<info\>(.*?)\<\/info\>\<\/url\>/ig;
		while (result = reg.exec(txt)) {
				txt = txt.replace(result[0], '<a target=\'_blank\' href=\'$2\'>$1</a>');
		}
				

		// Line feed feature
		txt = txt.replace(/\n/g, '<br/>');

		return jQuery(this).html( txt );
	};


	/**
	 * Escape special chars from a string
	 *
	 * @param {string} text
	 * @returns {string} encoded string
	 */
	jQuery.escape = (function escapeClosure(){
		var element = document.createElement('div');

		return function escape(text) {
			element.textContent = text;
			return element.innerHTML;
		};
	})();


	/*
	* hideShow jQuery plugin
	* This plugin detects for visibility change on dom for attached elements.
	* Author : Pratik Soni
	* pratiksoni916@gmail.com
	*/
	jQuery.fn.extend({
		hideShow : function(callback) {
			this.checkForVisiblilityChange(callback);
			return this;
		},

		checkForVisiblilityChange : function(callback) {

			if(!(this.length >>>0 ))
				return undefined;

			var elem,i=0;

			while ( ( elem = this[ i++ ] ) ) {
				var curValue = jQuery(elem).is(":visible");

				(elem.lastVisibility === undefined) && (elem.lastVisibility = curValue);

				(curValue !== elem.lastVisibility) && (

					elem.lastVisibility = curValue,

					(typeof callback === "function") && (
						callback.apply(this, [new jQuery.Event('visibilityChanged'), curValue ? "shown" : "hidden"])
					),
					(function(elem, curValue){
						setTimeout(function(){
							jQuery(elem).trigger('visibilityChanged',[curValue ? "shown" : "hidden"])
						},10)
					})(elem, curValue)
				)
			}

			(function(that, a){
				setTimeout(function(){
					that.checkForVisiblilityChange.apply(that,a);
				},10)
			})(this, arguments)
		}
	})

	/**
	 * Export
	 */
	return jQuery.noConflict( true );
});
