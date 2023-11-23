/**
 * UI/Components/Rodex/ReadRodex.js
 *
 * Chararacter ReadRodex
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
	 var DB                 = require('DB/DBManager');
	 var Preferences        = require('Core/Preferences');
	 var Renderer           = require('Renderer/Renderer');
	 var Client             = require('Core/Client');
	 var UIManager          = require('UI/UIManager');
	 var UIComponent        = require('UI/UIComponent');
	 var htmlText           = require('text!./ReadRodex.html');
	 var cssText            = require('text!./ReadRodex.css');
	 var Rodex              = require('UI/Components/Rodex/Rodex');
	 var getModule    		= require;
  
	 /**
	  * Create Component
	  */
	 var ReadRodex = new UIComponent( 'ReadRodex', htmlText, cssText );

	 ReadRodex.MailID = 0;
	 ReadRodex.openType = 0;
 
	 /**
	  * @var {Preferences} structure
	  */
	 var _preferences = Preferences.get('ReadRodex', {
		 show:     false,
	 }, 1.0);

	/**
	 * Initialize Component
	 */
	ReadRodex.onAppend = function onAppend()
	{
		// Bind buttons
		ReadRodex.ui.find('.right .close').on('click', onClickClose);
		
		ReadRodex.ui.css({
			top:  Math.min( Math.max( 0, parseInt(getModule('UI/Components/Rodex/Rodex').ui.css('top'), 10)), Renderer.height - ReadRodex.ui.height()),
			left: Math.min( Math.max( 0, parseInt(getModule('UI/Components/Rodex/Rodex').ui.css('left'), 10)) + 310, Renderer.width  - ReadRodex.ui.width())
		});

		ReadRodex.draggable(ReadRodex.ui.find('.titlebar'));
	};

	/**
	  * Remove Mail from window (and so clean up items)
	  */
	ReadRodex.onRemove = function OnRemove()
	{
		 _preferences.show   =  this.ui.is(':visible');
		 _preferences.save();
	}


	ReadRodex.initData = function initData( data, mail )
	{
		ReadRodex.MailID = mail.MailID;
		ReadRodex.openType = mail.openType;
		ReadRodex.SenderName = mail.SenderName;
		ReadRodex.ui.find('.name').html(mail.SenderName);
		ReadRodex.ui.find('.title-text').html(mail.title);
		ReadRodex.ui.find('.content-text').html(data.Textcontent);
		ReadRodex.ui.find('.value').html(prettifyZeny(data.zeny));
		this.ui.find('.get-content').on('click', onClickGetItems);
		this.ui.find('.get-zeny').on('click', onClickGetZeny);
		this.ui.find('.delete').on('click', onClickDelete);
		this.ui.find('.reply').on('click', onClickReply);
		let content = ReadRodex.ui.find('.item-list');
		content.html('');
		for(let i = 0; i < data.ItemList.length; i++) {
			let item = data.ItemList[i];
			let it      = DB.getItemInfo( item.ITID );
			content.append(
				'<div class="item" data-index="'+ i +'">' +
					'<div class="icon"></div>' +				
					'<div class="amount"><span class="count">' + (item.count || 1) + '</span></div>' +
				'</div>'
			);
			Client.loadFile( DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp', function(data){
				content.find('.item[data-index="'+ i +'"] .icon').css('backgroundImage', 'url('+ data +')');
			});
		}
		if(data.ItemList.length > 0) {
			this.ui.find('.get-content').show();
		} else {
			this.ui.find('.get-content').hide();
		}
		if(data.zeny > 0) {
			this.ui.find('.get-zeny').show();
		} else {
			this.ui.find('.get-zeny').hide();
		}
		ReadRodex.ui.show();
		ReadRodex.ui.focus();

	}

	function onClickClose(e) {
		e.stopImmediatePropagation();
		ReadRodex.MailID = 0;
		ReadRodex.openType = 0;
		ReadRodex.SenderName = ""
		ReadRodex.ui.hide();
	}

	function onClickGetItems(e) {
		e.stopImmediatePropagation();
		Rodex.requestItemsFromRodex(ReadRodex.openType, ReadRodex.MailID);
	}

	function onClickGetZeny(e) {
		e.stopImmediatePropagation();
		Rodex.requestZenyFromRodex(ReadRodex.openType, ReadRodex.MailID);
	}

	

	function onClickDelete(e) {
		e.stopImmediatePropagation();
		Rodex.requestDeleteRodex(ReadRodex.openType, ReadRodex.MailID);
	}

	function onClickReply(e) {
		e.stopImmediatePropagation();
		Rodex.requestOpenWriteRodex(ReadRodex.SenderName);
	}

	ReadRodex.clearItemList = function clearItemList() {
		ReadRodex.ui.find('.item-list').html('');

	}

	ReadRodex.clearZeny = function clearZeny() {
		ReadRodex.ui.find('.value').html('');
	}

	ReadRodex.close = function close() {
		ReadRodex.MailID = 0;
		ReadRodex.openType = 0;
		ReadRodex.SenderName = ""
		ReadRodex.ui.hide();
	}

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

	 /**
	 * Callbacks
	 */

	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(ReadRodex);
});
