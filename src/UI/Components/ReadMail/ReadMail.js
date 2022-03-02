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
		this.ui.find('.right .close').click(remove);
		this.ui.find('#read_mail_del').click(deleteMail);
		this.ui.find('#read_mail_remail').click(replyMail);
		this.ui.find('#read_mail_return').click(returnMail);
		
		this.ui.css({
			top:  Math.min( Math.max( 0, parseInt(getModule('UI/Components/Mail/Mail').ui.css('top'), 10)), Renderer.height - this.ui.height()),
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
		let textMessage = inforMail.msg === "(no message)" ? "" : inforMail.msg;
		
		ReadMail.append();
		this.ui.find('.text_sender').text(textSender);
		this.ui.find('.text_title').text(textTitle);
		this.ui.find('.textarea_mail').val(textMessage);
		this.ui.find('.btn_return_reply_remove').data( "mailID", inforMail.MailID );
		addItemSub(inforMail);

// DeleteTime: 0
// FromName: "teste2"
// Header: "titulo 13"
// ITID: 0
// IsDamaged: 0
// IsIdentified: 0
// MailID: 15
// Money: 0
// RefiningLevel: 0
// Type: 0
// count: 0
// msg: "corpo 13"
// msg_len: 8
// slot: {card1: 0, card2: 0, card3: 0, card4: 0}
	}


	function addItemSub(itemMail)
	{
		let item = itemMail;
		var it      = DB.getItemInfo( item.ITID );
		var content = ReadMail.ui.find('.container_item');
		ReadMail.ui.find(".item" ).remove();
		content.append(
			'<div class="item" data-index="'+ item.index +'" draggable="true">' +
				'<div class="icon"></div>' +				
				'<div class="amount"><span class="count">' + (item.count || 1) + '</span></div>' +
			'</div>'
		);
		ReadMail.ui.find('.hide').show();
		Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
			content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		});

		_preferences.item_add_email = item;
		_preferences.save();

		ReadMail.ui
			.find('.container_item')
				// item
				.on('mouseover',   '.item', onItemOver)
				.on('mouseout',    '.item', onItemOut)
				.on('contextmenu', '.item', onItemInfo);

		

	}

	/**
	 * Hide the item name
	 */
	function onItemOut()
	{
		console.log('onItemOut');
		ReadMail.ui.find('.container_item .overlay').hide();
	}

	/**
	 * Show item name when mouse is over
	 */
	function onItemOver()
	{
		var item = _preferences.item_add_email;

		if (!item) {
			return;
		}

		// Get back data
		var overlay = ReadMail.ui.find('.container_item .overlay');

		// Display box
		overlay.show();
		overlay.text(DB.getItemName(item) + ' ' + (item.count || 1) + ' ea');

		if (item.IsIdentified) {
			overlay.removeClass('grey');
		}
		else {
			overlay.addClass('grey');
		}
	}

	/**
	 * Get item info (open description window)
	 */
	function onItemInfo( event )
	{
		console.log('onItemInfo');
		event.stopImmediatePropagation();

		var item = _preferences.item_add_email;
		if (!item) {
			return false;
		}

		// Don't add the same UI twice, remove it
		if (ItemInfo.uid === item.ITID) {
			ItemInfo.remove();
			return false;
		}

		// Add ui to window
		ItemInfo.append();
		ItemInfo.uid = item.ITID;
		ItemInfo.setItem(item);

		return false;
	}

	function replyMail()
	{
		let textSender = ReadMail.ui.find('.text_sender').text();
		getModule('UI/Components/Mail/Mail').replyNewMail(textSender);
	}

	function deleteMail()
	{
		let mailID = ReadMail.ui.find('.btn_return_reply_remove').data('mailID');
		getModule('UI/Components/Mail/Mail').deleteMail(mailID);
	}

	function returnMail()
	{
		let mailID = ReadMail.ui.find('.btn_return_reply_remove').data('mailID');
		let textSender = ReadMail.ui.find('.text_sender').text();
		getModule('UI/Components/Mail/Mail').returnMail(mailID, textSender);
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
	 function onResize()
	 {
		var ui         = ReadMail.ui;
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

	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(ReadMail);
});