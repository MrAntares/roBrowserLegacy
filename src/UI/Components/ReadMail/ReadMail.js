/**
 * UI/Components/ReadMail/ReadMail.js
 *
 * Chararacter ReadMail
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
	 var Client             = require('Core/Client');
	 var Session      		= require('Engine/SessionStorage');
	 var Renderer           = require('Renderer/Renderer');
	 var Mouse              = require('Controls/MouseEventHandler');
	 var InputBox           = require('UI/Components/InputBox/InputBox');
	 var ItemInfo           = require('UI/Components/ItemInfo/ItemInfo');
	 var UIManager          = require('UI/UIManager');
	 var UIComponent        = require('UI/UIComponent');
	 var htmlText           = require('text!./ReadMail.html');
	 var cssText            = require('text!./ReadMail.css');
	 var getModule    		= require;
 
 
	 /**
	  * Create Component
	  */
	 var ReadMail = new UIComponent( 'ReadMail', htmlText, cssText );
 
	 /**
	  * Store ReadMail items
	  */
	 ReadMail.list = [];
 
 
	 /**
	  * @var {number} used to remember the window height
	  */
	 var _realSize = 0;
 
 
	 /**
	  * @var {Preferences} structure
	  */
	 var _preferences = Preferences.get('ReadMail', {
		 x:        0,
		 y:        172,
		 width:    7,
		 height:   4,
		 show:     false,
		 reduce:   false,
		 magnet_top: false,
		 magnet_bottom: false,
		 magnet_left: true,
		 magnet_right: false,
		 item_add_email: {}
	 }, 1.0);

	/**
	 * Initialize Component
	 */
	ReadMail.onAppend = function onAppend()
	{
		// Bind buttons
		this.ui.find('.footer .close').click(remove);
		
		this.ui.css({
			top:  Math.min( Math.max( 0, parseInt(getModule('UI/Components/Mail/Mail').ui.css('top'), 10) ), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, parseInt(getModule('UI/Components/Mail/Mail').ui.css('left'), 10)) + 300, Renderer.width  - this.ui.width())
		});

		this.draggable(this.ui.find('.titlebar'));
	};

	/**
	  * Remove Mail from window (and so clean up items)
	  */
	ReadMail.onRemove = function OnRemove()
	{
		 this.list.length = 0;
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

	ReadMail.openEmail = function openEmail(inforMail)
	{
		let textSender = inforMail.FromName;
		let textTitle =  inforMail.Header;
		
		ReadMail.append();
		this.ui.find('.text_sender').text(textSender);
		this.ui.find('.text_title').text(textTitle);
	}

	function remove()
	{
		 this.list.length = 0;
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
	}

	/**
	 * Extend Mail window size
	 */
	function resizeHeight(height)
	{
		height = Math.min( Math.max(height, 8), 17);

	}

	 /**
	  * Extend Mail window size
	  */
	 function onResize()
	 {
		var ui         = Mail.ui;
		var top        = ui.position().top;
		var lastHeight = 0;
		var _Interval;

		function resizing()
		{
			var extraY = 31 + 19 - 30;
			var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );

			// Maximum and minimum window size
			h = Math.min( Math.max(h, 8), 17);

			if (h === lastHeight) {
				return;
			}

			resizeHeight(h);
			lastHeight = h;
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
	// Mail.onClosePressedReadMail  = function onClosePressedReadMail(){};
	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(ReadMail);
});