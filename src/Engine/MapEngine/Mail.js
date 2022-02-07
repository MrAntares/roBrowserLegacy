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
	 * Server ask to select a monster
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