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
	 var Client             = require('Core/Client');
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
	  * Create message
	  * 	Title at most 50 characters
	  * 	Email body max 198 characters
	  * Message box
	  * 	Display sender name is a maximum of 15, plus 3 characters "..."
	  * 	Display sender name in tooltip sent by sender has a maximum of 23 characters
	  * 	Display the title of the email sent by the sender has a maximum of 25, plus 3 characters "..."
	  * 	Display email title in tooltip sent by sender has a maximum of 39 characters
	  *  	The pagination numbers only appear when there is at least one message in the list, it displays "1/1" when there is only 1
	  *     The previous and next pagination events only work when there are more than 8 messages (VALIDATE)
	  */
	 Mail.init = function Init()
	 {		
		this.ui.find('.right .close').click(this.onClosePressed.bind(this)).removeClass( "hover" );
		this.ui.find('#inbox').click(offCreateMessagesOnWindowMailbox);  // remove all item reset layout
		this.ui.find('#create_mail_cancel').click(offCreateMessagesOnWindowMailbox); // remove all item reset layout
		this.ui.find('#write').click(onWindowCreateMessages);  // remove all item reset layout
		this.ui.find('#input_add_item').focus(addItemToEmail);
		this.ui.find('#zeny_amt').click(onAddZenyInput);
		this.ui.find('#zeny_ok').click(onValidZenyInput);
		onWindowMailbox();
		this.draggable(this.ui.find('.titlebar'));
	 };
 
	 /**
	  * Apply preferences once append to body
	  */
	 Mail.onAppend = function OnAppend()
	 {
		// Apply preferences
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});
		
	 };

	 /**
	 * Create messages window size
	 */
	function onWindowMailbox()
	{	
		// Off window create mail
		Mail.ui.find('.block_create_mail').hide();
		Mail.ui.find('.text_to').val("");
		Mail.ui.find('.input_title').val("");
		Mail.ui.find('.textarea_mail').val("");
		Mail.ui.find('.input_zeny_amt').val("");
		Mail.ui.find('.input_add_item').val("");
		
		// on window list mail
		Mail.ui.find('.prev_next').show();
		Mail.ui.find('.block_mail').show();		
		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/maillist1_bg.bmp', function(url) {
			Mail.ui.find('.titlebar').css('backgroundImage', 'url(' + url + ')');
		}.bind(this));
		Mail.ui.find('#title').text(DB.getMessage(1025));

	};

	function offCreateMessagesOnWindowMailbox()
	{
		onWindowMailbox();
		Mail.offCreatMail(0); // CZ_MAIL_RESET_ITEM
	};

	 /**
	 * Open Create messages window size
	 */
	function onWindowCreateMessages()
	{
		// Off window list mail
		Mail.ui.find('.prev_next').hide();
		Mail.ui.find('.block_mail').hide();

		// Off window create mail
		Mail.ui.find('.block_create_mail').show();
		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/maillist2_bg.bmp', function(url) {
			Mail.ui.find('.titlebar').css('backgroundImage', 'url(' + url + ')');
		}.bind(this));
		Mail.ui.find('#title').text(DB.getMessage(1026));
	};

	function onAddZenyInput()
	{
		Mail.ui.find('#zeny_amt').hide();
		Mail.ui.find('#zeny_ok').show();
	}
	
	function onValidZenyInput()
	{
		// CZ_MAIL_ADD_ITEM
		// ZC_ACK_MAIL_ADD_ITEM

		// CZ_REQ_ADD_ITEM_TO_MAIL
		// ZC_ACK_ADD_ITEM_TO_MAIL
		
		Mail.ui.find('#zeny_amt').show();
		Mail.ui.find('#zeny_ok').hide();
	}

	function addItemToEmail(){

		console.log('input_add_item', Mail.ui.find('#input_add_item').val());
		

		// Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
		// 	content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		// });

		// var box = this.ui.find('.box.recv');

		// box.append(
		// 	'<div class="item" data-index="'+ idx +'">' +
		// 		'<div class="icon"></div>' +
		// 		'<div class="amount">'+ item.count + '</div>' +
		// 		'<span class="name">' + jQuery.escape(DB.getItemName(item)) + '</span>' +
		// 	'</div>'
		// );

		// Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
		// 	box.find('.item[data-index="'+ idx +'"] .icon').css('backgroundImage', 'url('+ data +')');
		// }.bind(this));
	}

	 /**
	  * Remove Mail from window (and so clean up items)
	  */
	 Mail.onRemove = function OnRemove()
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
		 Mail.offCreatMail(0);
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
 
		 this.ui.css({
			 width:  23 + 16 + 16 + width  * 32,
			 height: 31 + 19      + height * 32
		 });
	 };
 
	 /**
	  * Extend Mail window size
	  */
	 function onResize()
	 {
		 var ui      = Mail.ui;
		//  var content = ui.find('.container .content');
		//  var hide    = ui.find('.hide');
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
	Mail.onClosePressed  = function onClosePressed(){};
	Mail.offCreatMail = function offCreatMail(/*type*/){};
	Mail.parseMailSetattach = function parseMailSetattach(/*index, count*/){};

	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(Mail);
 });
 