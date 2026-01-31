/**
 * Engine/MapEngine/Roulette.js
 *
 * Manage Roulette System
 *
 * @author [Your Name]
 */

define(function (require) {
	'use strict';

	/**
	 * Load dependencies
	 */
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var Roulette = require('UI/Components/Roulette/Roulette');


	/**
	 * Send Packets
	 */

	/**
	 * Request to Open Roulette
	 */
	function requestOpenRoulette() {
		var pkt = new PACKET.CZ.REQ_OPEN_ROULETTE();
		Network.sendPacket(pkt);
	}


	/**
	 * Request Roulette Info
	 */
	function requestRouletteInfo() {
		var pkt = new PACKET.CZ.REQ_ROULETTE_INFO();
		Network.sendPacket(pkt);
	}


	/**
	 * Request to Close Roulette
	 */
	function requestCloseRoulette() {
		var pkt = new PACKET.CZ.REQ_CLOSE_ROULETTE();
		Network.sendPacket(pkt);
	}


	/**
	 * Receive Packets
	 */

	/**
	 * Open Roulette Window
	 * 
	 * @param {object} pkt - PACKET.ZC.ACK_OPEN_ROULETTE
	 */
	function onOpenRoulette(pkt) {
		// pkt structure:
		// {
		//   result: number,       // 0 = success, 1 = fail
		//   serial: number,
		//   step: number,
		//   idx: number,
		//   additionItemID: number,
		//   goldPoint: number,
		//   silverPoint: number,
		//   bronzePoint: number
		// }
		
		// Server responded (standard rAthena implementation)
		if (pkt.result === 0) {
			Roulette.onOpen(pkt);
		} else {
			console.error('Failed to open roulette:', pkt.result);
		}
	}


	/**
	 * Receive Roulette Info (item list)
	 * 
	 * @param {object} pkt - PACKET.ZC.ACK_ROULETTE_INFO
	 */
	function onRouletteInfo(pkt) {
		// pkt structure:
		// {
		//   serial: number,
		//   items: [{row, position, itemId, count}, ...]
		// }
		
		Roulette.onRouletteInfo(pkt);
	}


	/**
	 * Receive Roulette Spin Result
	 * 
	 * @param {object} pkt - PACKET.ZC.ACK_GENERATE_ROULETTE
	 */
	function onGenerateRoulette(pkt) {
		// pkt structure:
		// {
		//   result: number,       // 0 = success, other = fail
		//   step: number,
		//   idx: number,
		//   additionItemID: number,
		//   remainGold: number,
		//   remainSilver: number,
		//   remainBronze: number
		// }

		if (pkt.result === 0) {
			Roulette.onResult(pkt);
		} else {
			console.error('Roulette spin failed:', pkt.result);
		}
	}


	/**
	 * Receive Roulette Close ACK
	 * 
	 * @param {object} pkt - PACKET.ZC.ACK_CLOSE_ROULETTE
	 */
	function onCloseRoulette(pkt) {
		// pkt structure:
		// {
		//   result: number  // 0 = success, other = fail
		// }
		
		if (pkt.result === 0) {
			Roulette.ui.hide();
		}
	}


	/**
	 * Initialize
	 */
	return function RouletteEngine() {
		Network.hookPacket(PACKET.ZC.ACK_OPEN_ROULETTE, onOpenRoulette);
		Network.hookPacket(PACKET.ZC.ACK_ROULETTE_INFO, onRouletteInfo);
		Network.hookPacket(PACKET.ZC.ACK_GENERATE_ROULETTE, onGenerateRoulette);
		Network.hookPacket(PACKET.ZC.ACK_CLOSE_ROULETTE, onCloseRoulette);
	};
});
