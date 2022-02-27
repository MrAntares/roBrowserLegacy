/**
 * Engine/MapEngine/Mail.js
 *
 * Manage Mails
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

 define(function( require )
 {
    'use strict';

    /**
     * Load dependencies
     */
	var DB                   = require('DB/DBManager');
	var ChatBox              = require('UI/Components/ChatBox/ChatBox');
	var Network              = require('Network/NetworkManager');
	var PACKET               = require('Network/PacketStructure');
	var Mail       			 = require('UI/Components/Mail/Mail');
	var ReadMail       	     = require('UI/Components/ReadMail/ReadMail');


	/**
	 * Request to send mail
	 *
	 * @param {object} pkt - PACKET.CZ.MAIL_SEND
	 */
    /// pkt:
	///     ReceiveName
	///     Header
	///    	msg_len
	/// 	msg
	Mail.parseMailSend = function parseMailSend(mail)
	{
    	var pkt = new PACKET.CZ.MAIL_SEND();

		pkt.ReceiveName 	= mail.ReceiveName;
		pkt.Header 			= mail.Header;
		pkt.msg_len			= mail.msg_len;
		pkt.msg 			= mail.msg;

		Network.sendPacket(pkt);
	}

	/**
	 * Request to reset mail item and/or Zeny
	 *
	 * @param {int} type - PACKET.CZ.MAIL_RESET_ITEM
	 */
    /// type:
	///     0 = reset all
	///     1 = remove item
	///     2 = remove zeny
	Mail.parseMailWinopen = function parseMailWinopen(type)
	{
    	var pkt = new PACKET.CZ.MAIL_RESET_ITEM();
		pkt.Type = type;
		Network.sendPacket(pkt);
	}

	/**
	 * Request to add an item or Zeny to mail.
	 * PACKET.CZ.MAIL_ADD_ITEM
	 * index : 0 - Zeny; >= 2 - Inventory item
	 * @param {int} index 
	 * count : amout of zeny or number of item
	 * @param {int} count
	 */
	Mail.parseMailSetattach = function parseMailSetattach(index, count)
	{
		if (count <= 0) {
			return;
		}
		
		var pkt   = new PACKET.CZ.MAIL_ADD_ITEM();
		pkt.index = index;
		pkt.count = count;
		Network.sendPacket( pkt );
		
	}

	/**
	 * Mail inbox list request.
	 * PACKET.CZ.MAIL_GET_LIST
	 */
	Mail.parseMailrefreshinbox = function parseMailrefreshinbox()
	{
		var pkt   = new PACKET.CZ.MAIL_GET_LIST();
		Network.sendPacket( pkt );
	}	

	/**
	 * Send mail list
	 * PACKET.ZC.MAIL_WINDOWS
	 */
	Mail.onClosePressed = function onClosePressed()
	{
		Mail.remove();
	};


	/**
	 * Send mail list
	 * PACKET.ZC.MAIL_WINDOWS
	 */
	Mail.onClosePressedReadMail = function onClosePressedReadMail()
	{
		ReadMail.remove();
	};

	/**
	 * Send mail list
	 * PACKET.ZC.MAIL_WINDOWS
	 */
	Mail.onClosePressed = function onClosePressed()
	{
		Mail.remove();
	};


	/**
	 * Send from mail to inventory
	 */
	Mail.reqRemoveItem = function ReqRemoveItem( index, count )
	{	
		this.parseMailWinopen(1); // remove item
		//BUG::does not update inventory, default behavior
		Mail.removeItem();
	};

	/**
	 * Opens/closes the mail window
	 *
	 * @param {object} pkt - PACKET.ZC.MAIL_WINDOWS
	 */
    /// type:
    ///     0 = open
    ///     1 = close
	function onOpenWindowsMail( pkt )
	{
        if( pkt.Type ){
			Mail.remove();
        }else{
			Mail.append();
        }
	}    

	/**
	 * Lists mails stored in inbox.
	 *
	 * @param {object} read - PACKET.ZC.MAIL_REQ_GET_LIST
	 */
    /// read:
    ///     0 = unread
    ///     1 = read
	function mailRefreshinbox( read )
	{
		Mail.mailList(read);
	}


	/**
	 * Notification about the result of adding an item to mail
	 *
	 * @param {int} result - PACKET.ZC.ACK_MAIL_ADD_ITEM
	 */
    /// result:
    ///     0 = success
    ///     1 = failure
	function mailSetattachment( result )
	{
        console.log('mailSetattachment-read', result.result)
		if(!result.result){
			Mail.addItemSub(result.Index);
		}
	}
	
	/**
	 * Notification about the result of sending a mail
	 *
	 * @param {int} result - PACKET.ZC.MAIL_REQ_SEND
	 */
    /// Result:
    ///     0 = success
    ///     1 = recipinent does not exist
	function mailSend( result )
	{
		if(result.Result){
			ChatBox.addText( DB.getMessage(1032), ChatBox.TYPE.ERROR);
		}else{
			ChatBox.addText( DB.getMessage(1031), ChatBox.TYPE.INFO);
		}
	}

	/**
	 * Notification about new mail.
	 *
	 * @param {object} result - PACKET.ZC.MAIL_RECEIVE
	 */
    /// result:
    ///     0 = success
    ///     1 = recipinent does not exist
	function mailNew( result )
	{
        console.log('mailNew-result', result);
		ChatBox.addText( DB.getMessage(1101), ChatBox.TYPE.MAIL);
	}

    /**
	 * Initialize
	 */
	return function MAILEngine()
	{
		Network.hookPacket( PACKET.ZC.MAIL_WINDOWS,      		onOpenWindowsMail);
		Network.hookPacket( PACKET.ZC.MAIL_REQ_GET_LIST,      	mailRefreshinbox);
		Network.hookPacket( PACKET.ZC.ACK_MAIL_ADD_ITEM,      	mailSetattachment);
		Network.hookPacket( PACKET.ZC.MAIL_REQ_SEND,      		mailSend);
		Network.hookPacket( PACKET.ZC.MAIL_RECEIVE,      		mailNew);

		
	};

 });