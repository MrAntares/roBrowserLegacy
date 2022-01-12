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

    /**
	 * Server ask to select a monster
	 *
	 * @param {object} pkt - PACKET.ZC.MAIL_WINDOWS
	 */
	function onOpenWindowsMail( pkt )
	{
        console.log('onOpenWindowsMail', pkt)
	}
    
    

    /**
	 * Initialize
	 */
	return function MAILEngine()
	{
		Network.hookPacket( PACKET.ZC.MAIL_WINDOWS,      onOpenWindowsMail);
	};

 });