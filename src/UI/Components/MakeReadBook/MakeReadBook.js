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
	 var Sprite             = require('Loaders/Sprite');
	 var Client             = require('Core/Client');
	 var TextEncoding       = require('Vendors/text-encoding');
	 var ChatBox      		= require('UI/Components/ChatBox/ChatBox');
	 var getModule    		= require;
 
 
	 /**
	  * Create Component
	  */
	 var MakeReadBook = new UIComponent( 'MakeReadBook', htmlText, cssText );

	/**
	 * @var {Preferences} structure
	 */
	var _BOOK_INFORMATION	= Preferences.get('_BOOK_INFORMATION', {
		title:  	''	,
		contents:   ''	,
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
	 

	 MakeReadBook.startBook = function startBook(inforBook, item){
		var it = DB.getItemInfo( item.ITID );
	
		_BOOK_INFORMATION['title'] 	= it.identifiedDisplayName;
		let validtext = inforBook.substr(7);// remover color background
		let limitText = 1184;
		let intPagination = Math.floor(validtext.length/ 1184);
		let cout = 0;

		let arrayText = []
		for (let index = 0; index < (intPagination+1); index++) {
			let isEmpty = validtext.substr(cout,limitText);
			if(isEmpty.length === 0)
				break;
			
			arrayText.push(isEmpty)

			cout = limitText + cout;
		}

		console.log('validtext',  arrayText[arrayText.length-1]);

		_BOOK_INFORMATION['contents'] = inforBook; // 1184 caracteres
		_BOOK_INFORMATION.save();
	 }

	 MakeReadBook.openBook = function openBook(){
		MakeReadBook.remove();
		MakeReadBook.append();

		
		var textBook = TextEncoding.decodeString(_BOOK_INFORMATION['contents']);

		let addColor = textBook.substr(1, 7);
		this.ui.find('.panel').css('background-color', '#'+addColor);
		this.ui.find('.footer').css('background-color', '#'+addColor);

		this.ui.find('#titleBook').text(_BOOK_INFORMATION['title']);
		this.ui.find('#textBook').text(textBook.substr(7));
		
		Client.getFiles(
			[
				'data/sprite/book/\xc3\xa5\xb4\xdd\xb1\xe2.spr',
				'data/sprite/book/\xc3\xa5\xb0\xa5\xc7\xc7.spr',
				'data/sprite/book/\xc3\xa5\xbf\xde\xc2\xca.spr', // previous
				'data/sprite/book/\xc3\xa5\xbf\xc0\xb8\xa5\xc2\xca.spr', // next
			],function (spr_close, spr_highlighter, spr_previous, spr_next) {
				// close
				var sprite_close = new Sprite( spr_close );
				var canvas;
				canvas  = sprite_close.getCanvasFromFrame( 0 );
				canvas.className = 'clone_book event_add_cursor';
				MakeReadBook.ui.find('.footer').find('canvas').remove();
				MakeReadBook.ui.find('.footer').append(canvas);

				// highlighter
				var sprite_highlighter = new Sprite( spr_highlighter );
				var canvas;
				canvas  = sprite_highlighter.getCanvasFromFrame( 0 );
				canvas.className = 'highlighter event_add_cursor';
				MakeReadBook.ui.find('#highlighter').find('canvas').remove();
				MakeReadBook.ui.find('#highlighter').append(canvas);
				var highlighter = MakeReadBook.ui.find('.highlighter');
				highlighter.mouseover(function(e) {
					e.stopImmediatePropagation();
					MakeReadBook.ui.find('.bookmark').show();
				}).mouseout(function(e) {
					e.stopImmediatePropagation();
					MakeReadBook.ui.find('.bookmark').hide();
				});

				// remove canvas next and previous
				MakeReadBook.ui.find('#next_previous').find('canvas').remove();
				// previous
				var sprite_previous = new Sprite( spr_previous );
				var canvas;
				canvas  = sprite_previous.getCanvasFromFrame( 0 );
				canvas.className = 'previous_btn event_add_cursor';				
				MakeReadBook.ui.find('#next_previous').append(canvas);
				var previous_btn = MakeReadBook.ui.find('.previous_btn');
				previous_btn.mouseover(function(e) {
					e.stopImmediatePropagation();
					MakeReadBook.ui.find('.previous').show();
				}).mouseout(function(e) {
					e.stopImmediatePropagation();
					MakeReadBook.ui.find('.previous').hide();
				});

				// next
				var sprite_next = new Sprite( spr_next );
				var canvas;
				canvas  = sprite_next.getCanvasFromFrame( 0 );
				canvas.className = 'next_btn event_add_cursor';
				MakeReadBook.ui.find('#next_previous').append(canvas);
				var next_btn = MakeReadBook.ui.find('.next_btn');
				next_btn.mouseover(function(e) {
					e.stopImmediatePropagation();
					MakeReadBook.ui.find('.next').show();
				}).mouseout(function(e) {
					e.stopImmediatePropagation();
					MakeReadBook.ui.find('.next').hide();
				});

			})
		// Ã¥´Ý±â.spr
	}
 
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
 
