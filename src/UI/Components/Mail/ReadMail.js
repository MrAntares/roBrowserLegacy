/**
 * UI/Components/Mail/ReadMail.js
 *
 * Chararacter ReadMail
 *
 * @author Francisco Wallison
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
	 var KEYS               = require('Controls/KeyEventHandler');
	 var ChatBox            = require('UI/Components/ChatBox/ChatBox');
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
		ReadMail.ui.find('.right .close').click(function(event){
			event.stopImmediatePropagation();
			ReadMail.remove();
		});
		ReadMail.ui.find('#read_mail_del').click(deleteMail);
		ReadMail.ui.find('#read_mail_remail').click(replyMail);
		ReadMail.ui.find('#read_mail_return').click(returnMail);

		ReadMail.ui.css({
			top:  Math.min( Math.max( 0, parseInt(getModule('UI/Components/Mail/Mail').ui.css('top'), 10)), Renderer.height - ReadMail.ui.height()),
			left: Math.min( Math.max( 0, parseInt(getModule('UI/Components/Mail/Mail').ui.css('left'), 10)) + 300, Renderer.width  - ReadMail.ui.width())
		});

		ReadMail.draggable(ReadMail.ui.find('.titlebar'));
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
		ReadMail.remove();
		ReadMail.append();
		let textSender = inforMail.FromName;
		let textTitle =  inforMail.Header;
		let textMessage = inforMail.msg === "(no message)" ? "" : inforMail.msg;

		this.ui.find('.text_sender').text(textSender);
		this.ui.find('.text_title').text(textTitle);
		this.ui.find('.textarea_mail').val(textMessage);
		this.ui.find('.btn_return_reply_remove').data( "mailID", inforMail.MailID );

		if(inforMail.ITID != 0 || inforMail.Money != 0) {
			addItemSub(inforMail);
		}else{
			this.resetItemZeny();
		}
	}

	ReadMail.resetItemZeny = function resetItemZeny()
	{
		_preferences.item_add_email = {};
		_preferences.save();
		removeValueItemZeny();
		ReadMail.ui.find(".zeny_item_infor_box" ).remove();
	}

	ReadMail.onKeyDown = function onKeyDown( event )
	{
		if ((event.which === KEYS.ESCAPE || event.key === "Escape") && this.ui.is(':visible')) {
			this.remove();
		}
	};

	function addItemSub(itemMail)
	{
		removeValueItemZeny();
		var zenyItemContainer = ReadMail.ui.find('.zeny_item_container');
		if(itemMail.ITID != 0 && itemMail.count > 0){
			let item = itemMail;
			var it      = DB.getItemInfo( item.ITID );
			var content = ReadMail.ui.find('.container_item');
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

			ReadMail.ui
				.find('.container_item')
					// item
					.on('mouseover',   '.item', onItemOver)
					.on('mouseout',    '.item', onItemOut)
					.on('contextmenu', '.item', onItemInfo);
		}

		if(itemMail.Money > 0){
			ReadMail.ui.find('.input_zeny_amt').val(prettifyZeny(itemMail.Money));
			ReadMail.ui.find('.input_zeny_amt').prop('disabled', true);
		}


		ReadMail.ui.find(".zeny_item_infor_box" ).remove();
		zenyItemContainer.append(
			'<div class="zeny_item_infor_box"></div>'
		);
		ReadMail.ui
			.find('.zeny_item_infor')
				.mouseover(function(){
					ReadMail.ui.find('.zeny_item_infor_box').show();
				})
				.mouseout(function(){
					ReadMail.ui.find('.zeny_item_infor_box').hide();
				})

		_preferences.item_add_email = itemMail;
		_preferences.save();


		ReadMail.ui.find(".zeny_item_infor").click(function(event){
			event.stopImmediatePropagation();
			if(!validItemMoneyExists()){
				let mailID = ReadMail.ui.find('.btn_return_reply_remove').data('mailID');
				getModule('UI/Components/Mail/Mail').parseMailgetattach(mailID);
			}
		});

	}

	/**
	 * Hide the item name
	 */
	function onItemOut(event)
	{
		event.stopImmediatePropagation();
		ReadMail.ui.find('.container_item .overlay').hide();
	}

	/**
	 * Show item name when mouse is over
	 */
	function onItemOver(event)
	{
		event.stopImmediatePropagation();
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

	function replyMail(event)
	{
		event.stopImmediatePropagation();
		let textSender = ReadMail.ui.find('.text_sender').text();
		getModule('UI/Components/Mail/Mail').replyNewMail(textSender);
	}

	function deleteMail(event)
	{
		event.stopImmediatePropagation();

		if(validItemMoneyExists()){
			let mailID = ReadMail.ui.find('.btn_return_reply_remove').data('mailID');
			getModule('UI/Components/Mail/Mail').deleteMail(mailID);
		}else{
			ChatBox.addText( DB.getMessage(1105), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
		}
	}

	function validItemMoneyExists(){
		let validItem = _preferences.item_add_email.count === 0 && _preferences.item_add_email.ITID === 0;
		validItem = _preferences.item_add_email.ITID === undefined ? true : validItem;

		let validMoney = _preferences.item_add_email.Money === 0;
		validMoney = _preferences.item_add_email.Money === undefined ? true : validMoney;

		return validItem && validMoney
	}

	function returnMail(event)
	{
		event.stopImmediatePropagation();
		let mailID = ReadMail.ui.find('.btn_return_reply_remove').data('mailID');
		let textSender = ReadMail.ui.find('.text_sender').text();
		getModule('UI/Components/Mail/Mail').returnMail(mailID, textSender);
	}

	 /**
	  * Extend Mail window size
	  */
	 /*function onResize()
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
	 }*/ //UNUSED

	 /**
	 * Prettify number (15000 -> 15,000)
	 *
	 * @param {number}
	 * @return {string}
	 */
	function prettifyZeny( value )
	{
		var num = String(value);
		var i = 0, len = num.length;
		var out = '';

		while (i < len) {
			out = num[len-i-1] + out;
			if ((i+1) % 3 === 0 && i+1 !== len) {
				out = ',' + out;
			}
			++i;
		}

		return out;
	}

	function removeValueItemZeny(){
		ReadMail.ui.find(".item" ).remove();
		ReadMail.ui.find(".input_zeny_amt" ).val('');
	}

	 /**
	 * Callbacks
	 */

	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(ReadMail);
});
