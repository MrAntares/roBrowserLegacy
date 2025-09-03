/**
 * Engine/MapEngine/CashShop.js
 *
 * Manage Trade packets and UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function( require )
{
	'use strict';

	/**
	 * Load dependencies
	 */
	var Network   = require('Network/NetworkManager');
	var PACKET    = require('Network/PacketStructure');
	var CashShop      = require('UI/Components/CashShop/CashShop');

	function onOpenCashShop(pkt){
		CashShop.readPoints(pkt.cashPoints, pkt.kafraPoints, pkt.tab);
	}

	function onOpenReqCashShopItemList(pkt){
		CashShop.readCashShopItems(pkt);
	}

	function onSuccessCashShopBuyList(pkt){
		CashShop.setSuccessCashShopUpdate(pkt);
	}

	/**
	 * Initialize
	 */
	return function MainEngine()
	{
		Network.hookPacket( PACKET.ZC.SE_CASHSHOP_OPEN,            onOpenCashShop );
		Network.hookPacket( PACKET.ZC.SE_CASHSHOP_OPEN2,           onOpenCashShop );
		Network.hookPacket( PACKET.ZC.SE_CASHSHOP_OPEN3,           onOpenCashShop ); // old with no tab
		Network.hookPacket( PACKET.ZC.ACK_SCHEDULER_CASHITEM,      onOpenReqCashShopItemList );
		Network.hookPacket( PACKET.ZC.SE_PC_BUY_CASHITEM_RESULT,      onSuccessCashShopBuyList );
	};
});
