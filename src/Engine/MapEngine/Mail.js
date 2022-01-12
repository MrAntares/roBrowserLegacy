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
           
        }else{
			Mail.append();
            console.log('open-mail', pkt.Type)
        }
       
	}
    
    

    /**
	 * Initialize
	 */
	return function MAILEngine()
	{
		Network.hookPacket( PACKET.ZC.MAIL_WINDOWS,      onOpenWindowsMail);
	};

 });