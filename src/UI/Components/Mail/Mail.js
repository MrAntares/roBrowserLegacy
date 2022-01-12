/**
 * UI/Components/Mail/Mail.js
 *
 * Chararacter Mail
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 * In some cases the client will send packet twice.eg NORMAL_ITEMLIST4; fixit [skybook888] 
 *
 */
 define(function(require)
 {
	 'use strict';
 
 
	 /**
	  * Dependencies
	  */
	 var DB                 = require('DB/DBManager');
	 var jQuery             = require('Utils/jquery');
	 var Preferences        = require('Core/Preferences');
	 var Renderer           = require('Renderer/Renderer');
	 var Mouse              = require('Controls/MouseEventHandler');
	 var UIManager          = require('UI/UIManager');
	 var UIComponent        = require('UI/UIComponent');
	 var htmlText           = require('text!./Mail.html');
	 var cssText            = require('text!./Mail.css');
	 var getModule    		= require;
 
 
	 /**
	  * Create Component
	  */
	 var Mail = new UIComponent( 'Mail', htmlText, cssText );
 
	 /**
	  * Store Mail items
	  */
	 Mail.list = [];
 
 
	 /**
	  * @var {number} used to remember the window height
	  */
	 var _realSize = 0;
 
 
	 /**
	  * @var {Preferences} structure
	  */
	 var _preferences = Preferences.get('Mail', {
		 x:        0,
		 y:        172,
		 width:    7,
		 height:   4,
		 show:     false,
		 reduce:   false,
		 magnet_top: false,
		 magnet_bottom: false,
		 magnet_left: true,
		 magnet_right: false
	 }, 1.0);
 
 
	 /**
	  * Initialize UI
	  */
	 Mail.init = function Init()
	 {
		console.log('init-mail');
		this.draggable(this.ui.find('.titlebar'));
	 };
 
 
	 /**
	  * Apply preferences once append to body
	  */
	 Mail.onAppend = function OnAppend()
	 {
		if (!_preferences.show) {
			this.ui.hide();
		}
		
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});
	 };
 
 
	 /**
	  * Remove Mail from window (and so clean up items)
	  */
	 Mail.onRemove = function OnRemove()
	 {
		 this.ui.find('.container .content').empty();
		 this.list.length = 0;
		 jQuery('.ItemInfo').remove();
 
		 // Save preferences
		 _preferences.show   =  this.ui.is(':visible');
		 _preferences.reduce = !!_realSize;
		 _preferences.y      =  parseInt(this.ui.css('top'), 10);
		 _preferences.x      =  parseInt(this.ui.css('left'), 10);
		 _preferences.width  =  Math.floor( (this.ui.width()  - (23 + 16 + 16 - 30)) / 32 );
		 _preferences.height =  Math.floor( (this.ui.height() - (31 + 19 - 30     )) / 32 );
		 _preferences.magnet_top = this.magnet.TOP;
		 _preferences.magnet_bottom = this.magnet.BOTTOM;
		 _preferences.magnet_left = this.magnet.LEFT;
		 _preferences.magnet_right = this.magnet.RIGHT;
		 _preferences.save();
	 };
 
 
	 /**
	  * Process shortcut
	  *
	  * @param {object} key
	  */
	 Mail.onShortCut = function onShurtCut( key )
	 {
		switch (key.cmd) {
			case 'TOGGLE':
				this.ui.toggle();
				// Remove input focus
				if (this.ui.is(':visible')) {
					this.focus();
				}
				break;
		}
	 };
 
 
	 /**
	  * Extend Mail window size
	  *
	  * @param {number} width
	  * @param {number} height
	  */
	 Mail.resize = function Resize( width, height )
	 {
		 width  = Math.min( Math.max(width,  6), 9);
		 height = Math.min( Math.max(height, 2), 6);
 
		 this.ui.find('.container .content').css({
			 width:  width  * 32 + 13, // 13 = scrollbar
			 height: height * 32
		 });
 
		 this.ui.css({
			 width:  23 + 16 + 16 + width  * 32,
			 height: 31 + 19      + height * 32
		 });
	 };
 
 
	/**
	 * Exit window
	 */
	function onClose()
	{
		Mail.ui.hide();
	}
 
 
	 /**
	  * Extend Mail window size
	  */
	 function onResize()
	 {
		 var ui      = Mail.ui;
		 var content = ui.find('.container .content');
		 var hide    = ui.find('.hide');
		 var top     = ui.position().top;
		 var left    = ui.position().left;
		 var lastWidth  = 0;
		 var lastHeight = 0;
		 var _Interval;
 
		 function resizing()
		 {
			 var extraX = 23 + 16 + 16 - 30;
			 var extraY = 31 + 19 - 30;
 
			 var w = Math.floor( (Mouse.screen.x - left - extraX) / 32 );
			 var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );
 
			 // Maximum and minimum window size
			 w = Math.min( Math.max(w, 6), 9);
			 h = Math.min( Math.max(h, 2), 6);
 
			 if (w === lastWidth && h === lastHeight) {
				 return;
			 }
 
			 Mail.resize( w, h );
			 lastWidth  = w;
			 lastHeight = h;
 
			 //Show or hide scrollbar
			 if (content.height() === content[0].scrollHeight) {
				 hide.show();
			 }
			 else {
				 hide.hide();
			 }
		 }
 
		 // Start resizing
		 _Interval = setInterval( resizing, 30);
 
		 // Stop resizing on left click
		 jQuery(window).on('mouseup.resize', function(event){
			 if (event.which === 1) {
				 clearInterval(_Interval);
				 jQuery(window).off('mouseup.resize');
			 }
		 });
	 }

	
	 /**
	 * Callbacks
	 */

	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(Mail);
 });
 