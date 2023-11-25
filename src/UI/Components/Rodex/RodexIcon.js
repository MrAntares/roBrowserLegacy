/**
 * UI/Components/Rodex/RodexIcon.js
 *
 * Rodex Icon
 *
 * @author Alisonrag
 *
 */
 define(function(require)
 {
	 'use strict';
 
 
	 /**
	  * Dependencies
	  */
	 var UIManager          = require('UI/UIManager');
	 var UIComponent        = require('UI/UIComponent');
	 var htmlText           = require('text!./RodexIcon.html');
	 var cssText            = require('text!./RodexIcon.css');
	 var Rodex              = require('UI/Components/Rodex/Rodex');
 
 	 /**
	  * Create Component
	  */
	 var RodexIcon = new UIComponent( 'RodexIcon', htmlText, cssText );
 
	 /**
	  * Apply preferences once append to body
	  */
	 RodexIcon.onAppend = function OnAppend()
	 {
		let icon = this.ui.find('.rodex-icon');
		icon.on('click', onClickRodexIcon);
		icon.focus();
	 };

	 RodexIcon.toggle = function toggle()
	 {
		this.ui.toggle();
		if (this.ui.is(':visible')) {
			this.focus();
		}
	 };

	 function onClickRodexIcon() {
		Rodex.openRodexBox();
		Rodex.append();
		Rodex.ui.show();
		Rodex.ui.focus();
	 }

	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(RodexIcon);
 });
 
