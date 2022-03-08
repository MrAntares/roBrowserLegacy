/**
 * UI/Components/MakeReadBook/MakeReadBook.js
 *
 * Chararacter MakeReadBook
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
	 var htmlText           = require('text!./MakeReadBook.html');
	 var cssText            = require('text!./MakeReadBook.css');
	 var ChatBox      		= require('UI/Components/ChatBox/ChatBox');
	 var getModule    		= require;
 
 
	 /**
	  * Create Component
	  */
	 var MakeReadBook = new UIComponent( 'MakeReadBook', htmlText, cssText );

	/**
	 * @var {Preferences} structure
	 */
	var _ALT_INIT = Preferences.get('_ALT_CMD', {
		Num_1:  '/hide'	,
		Num_2:  '/?'	,
		Num_3:  '/ho'	,
		Num_4:  '/lv'	,
		Num_5:  '/swt'	,
		Num_6:  '/ic'	,
		Num_7:  '/an'	,
		Num_8:  '/ag'	,
		Num_9:  '/$'	,
		Num_0:  '/...'
	}, 1.0);
 
	 /**
	  * Store MakeReadBook items
	  */
	 MakeReadBook.list = [];
 
 
	 /**
	  * @var {number} used to remember the window height
	  */
	 var _realSize = 0;
 
 
	 /**
	  * @var {Preferences} structure
	  */
	 var _preferences = Preferences.get('MakeReadBook', {
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
	 MakeReadBook.init = function Init()
	 {
		// this.ui.find('.close').click(onClose);
		this.draggable(this.ui.find('.titlebar'));
	 };
 
 
	 /**
	  * Apply preferences once append to body
	  */
	 MakeReadBook.onAppend = function OnAppend()
	 {
		
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});
	 };
 
 
	 /**
	  * Remove MakeReadBook from window (and so clean up items)
	  */
	 MakeReadBook.onRemove = function OnRemove()
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
	  * Extend MakeReadBook window size
	  *
	  * @param {number} width
	  * @param {number} height
	  */
	 MakeReadBook.resize = function Resize( width, height )
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
		MakeReadBook.ui.hide();
	}
 
 
	 /**
	  * Extend MakeReadBook window size
	  */
	 function onResize()
	 {
		 var ui      = MakeReadBook.ui;
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
 
			 MakeReadBook.resize( w, h );
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
	  * Create component and export it
	  */
	 return UIManager.addComponent(MakeReadBook);
 });
 
