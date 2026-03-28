/**
 * Engine/MapEngine/PCGoldTimer.js
 *
 * Manage PCGoldTimer Mails
 *
 * @author Alisonrag
 */

'use strict';

import Network from 'Network/NetworkManager';
import PACKET from 'Network/PacketStructure';
import PCGoldTimer from 'UI/Components/PCGoldTimer/PCGoldTimer';

/**
	 * Load dependencies
	 */
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
	function onPCGoldTimerPoint(pkt) {
		PCGoldTimer.setData(pkt);
		PCGoldTimer.append();
	}

	/**
	 * Initialize
	 */
export default function MainEngine() {
		Network.hookPacket(PACKET.ZC.GOLDPCCAFE_POINT, onPCGoldTimerPoint);
	};