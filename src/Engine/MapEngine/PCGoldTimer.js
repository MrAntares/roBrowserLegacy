/**
 * Engine/MapEngine/PCGoldTimer.js
 *
 * Manage PCGoldTimer Mails
 *
 * @author Alisonrag
 */

define(function (require)
{
	'use strict';

	/**
	 * Load dependencies
	 */
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var PCGoldTimer = require('UI/Components/PCGoldTimer/PCGoldTimer');

	/**
	 * Send Packets
	 */

	// nothing yet

	/**
	 * Receive Packets
	 */

	/**
	 * Server sent request about PCGoldTimer Point
	 *
	 * @param {object} pkt - PACKET.ZC.GOLDPCCAFE_POINT
	 */
	function onPCGoldTimerPoint(pkt)
	{
		PCGoldTimer.setData(pkt);
		PCGoldTimer.append();
	}

	/**
	 * Initialize
	 */
	return function MainEngine()
	{
		Network.hookPacket(PACKET.ZC.GOLDPCCAFE_POINT, onPCGoldTimerPoint);
	};
});
