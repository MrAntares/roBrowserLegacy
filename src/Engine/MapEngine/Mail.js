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
	var Network              = require('Network/NetworkManager');
	var PACKET               = require('Network/PacketStructure');
	var Mail       			 = require('UI/Components/Mail/Mail');

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
	 * Request to reset mail item and/or Zeny
	 *
	 * @param {int} type - PACKET.CZ.MAIL_RESET_ITEM
	 */
    /// type:
	///     0 = reset all
	///     1 = remove item
	///     2 = remove zeny
	Mail.offCreatMail = function offCreatMail(type)
	{
    	var pkt = new PACKET.CZ.MAIL_RESET_ITEM();
		pkt.Type = type;
		Network.sendPacket(pkt);
	}

	/**
	 * Request to add an item or Zeny to mail.
	 * PACKET.CZ.MAIL_ADD_ITEM
	 * @param {int} index 
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
		// Mail.parseMailSetattach(item.index, parseInt(count, 10 ) );
	}	
    
	/**
	 * Send mail list
	 * PACKET.ZC.MAIL_WINDOWS
	 */
	Mail.onClosePressed = function onClosePressed()
	{
		// var pkt = new PACKET.ZC.MAIL_WINDOWS();
		// pkt.Type = 1;
		// Network.sendPacket(pkt);
		Mail.remove();
	};
    

    /**
	 * Initialize
	 */
	return function MAILEngine()
	{
		Network.hookPacket( PACKET.ZC.MAIL_WINDOWS,      onOpenWindowsMail);
	};

 });