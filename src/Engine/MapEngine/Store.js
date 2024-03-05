/**
 * Engine/MapEngine/Store.js
 *
 * Manage npc store (buy/sell items)
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
	var DB            = require('DB/DBManager');
	var Session        = require('Engine/SessionStorage');
	var Network       = require('Network/NetworkManager');
	var PACKET        = require('Network/PacketStructure');
	var EntityManager = require('Renderer/EntityManager');
	var NpcStore      = require('UI/Components/NpcStore/NpcStore');
	var Vending       = require('UI/Components/Vending/Vending');
	var VendingShop   = require('UI/Components/VendingShop/VendingShop');
	var ChatBox       = require('UI/Components/ChatBox/ChatBox');


	/**
	 * Received items list to buy from cash npc
	 *
	 * @param {object} pkt - PACKET.ZC.ZC_PC_CASH_POINT_ITEMLIST
	 */
	function onBuyCashList( pkt )
	{
		NpcStore.append();
		NpcStore.setType(NpcStore.Type.CASH_SHOP);
		NpcStore.setList(pkt.itemList);

		var entity = Session.Entity;
		NpcStore.ui.find('.cashuser .buyer').text( entity ? entity.display.name : '');
		NpcStore.ui.find('.cashuser .cashpoints').text(pkt.KafraPoint);

		NpcStore.onSubmit = function(itemList)  // add prompt confirmation first later...
        {
			var i, count;
			var pkt;

			pkt   = new PACKET.CZ.PC_BUY_CASH_POINT_ITEM();
			count = itemList.length;
        	pkt.kafrapts = 0;

			for (i = 0; i < count; ++i)
            {
				pkt.list.push({
					count: itemList[i].count,
					ITID:  itemList[i].ITID
				});
            	//pkt.kafrapts += (itemList[i].discountprice || itemList[i].price) * itemList[i].count;
			}

			Network.sendPacket(pkt);
		};
	}


	/**
	 * Received items list to buy from cash npc
	 *
	 * @param {object} pkt - PACKET.ZC.ZC_PC_CASH_POINT_ITEMLIST
	 */
	function onBuyVendingList( pkt )
	{
		VendingShop.append();
		VendingShop.setItems(pkt.itemList);
	}

	function onDeleteVendingItem( pkt )
	{
		//TODO: add msg id: 231
		VendingShop.removeItem(pkt.index,pkt.count);
	}


	/**
	 * Received items list to buy from npc
	 *
	 * @param {object} pkt - PACKET.ZC.PC_PURCHASE_ITEMLIST
	 */
	function onBuyList( pkt )
	{
		NpcStore.append();
		NpcStore.setType(NpcStore.Type.BUY);
		NpcStore.setList(pkt.itemList);
		NpcStore.onSubmit = function(itemList) {
			var i, count;
			var pkt;

			pkt   = new PACKET.CZ.PC_PURCHASE_ITEMLIST();
			count = itemList.length;

			for (i = 0; i < count; ++i) {
				pkt.itemList.push({
					ITID:  itemList[i].ITID,
					count: itemList[i].count
				});
			}

			Network.sendPacket(pkt);
		};
	}


	/**
	 * Received purchased informations
	 *
	 * @param {object} pkt - PACKET_ZC_PC_PURCHASE_RESULT
	 */
	function onBuyResult( pkt )
	{
		NpcStore.remove();

		switch (pkt.result) {
			case 0:  ChatBox.addText( DB.getMessage(54),   ChatBox.TYPE.BLUE, ChatBox.FILTER.PUBLIC_LOG);  break; // success
			case 1:  ChatBox.addText( DB.getMessage(55),   ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // zeny
			case 2:  ChatBox.addText( DB.getMessage(56),   ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // overweight
			case 4:  ChatBox.addText( DB.getMessage(230),  ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // out of stock
			case 5:  ChatBox.addText( DB.getMessage(281),  ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // trade
			// case 6: 6 = Because the store information was incorrect the item was not purchased.
			case 7:  ChatBox.addText( DB.getMessage(1797), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // no sale information
			default: ChatBox.addText( DB.getMessage(57),   ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // deal failed
		}
	}

	/**
	 * Received purchased informations
	 *
	 * @param {object} pkt - PACKET_ZC_PC_CASH_POINT_UPDATE
	 */

	function onBuyCashResult( pkt )
	{
		NpcStore.remove();

		switch (pkt.Error) {
			case 0:  ChatBox.addText( DB.getMessage(54),   ChatBox.TYPE.BLUE, ChatBox.FILTER.PUBLIC_LOG);  break; // success
			case 1:  ChatBox.addText( DB.getMessage(1227),   ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // zeny
			case 2:  ChatBox.addText( DB.getMessage(1228),   ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // overweight
			case 4:  ChatBox.addText( DB.getMessage(1229),  ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // out of stock
			case 5:  ChatBox.addText( DB.getMessage(1230),  ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // trade
			case 6:   ChatBox.addText( DB.getMessage(1254),  ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break;
			case 7:  ChatBox.addText( DB.getMessage(1813), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // no sale information
			default: ChatBox.addText( DB.getMessage(1814),   ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG); break; // deal failed
		}
	}


	/**
	 * Received items list to buy from npc
	 *
	 * @param {object} pkt - PACKET.ZC.PC_SELL_ITEMLIST
	 */
	function onSellList( pkt )
	{
		NpcStore.append();
		NpcStore.setType(NpcStore.Type.SELL);
		NpcStore.setList(pkt.itemList);
		NpcStore.onSubmit = function(itemList) {
			var i, count;
			var pkt;

			pkt   = new PACKET.CZ.PC_SELL_ITEMLIST();
			count = itemList.length;

			for (i = 0; i < count; ++i) {
				pkt.itemList.push({
					index: itemList[i].index,
					count: itemList[i].count
				});
			}

			Network.sendPacket(pkt);
		};
	}


	/**
	 * Receive sell list result
	 *
	 * @param {object} pkt - PACKET_ZC.PC.SELL_RESULT
	 */
	function onSellResult( pkt )
	{
		NpcStore.remove();

		// success
		if (pkt.result === 0) {
			ChatBox.addText( DB.getMessage(54), ChatBox.TYPE.BLUE, ChatBox.FILTER.PUBLIC_LOG);
		}

		// Fail
		else {
			ChatBox.addText( DB.getMessage(57), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
		}
	}


	/**
	 * Received items list to buy from player
	 *
	 * @param {object} pkt - PACKET.ZC.PC_PURCHASE_ITEMLIST_FROMMC
	 */
	function onVendingStoreList( _pkt )
	{
		NpcStore.append();
		NpcStore.setType(NpcStore.Type.VENDING_STORE);
		NpcStore.setList(_pkt.itemList);

		// Get seller name
		var entity = EntityManager.get(_pkt.AID);
		NpcStore.ui.find('.seller').text( entity ? entity.display.name : '');

		// Bying items
		NpcStore.onSubmit = function(itemList) {
			NpcStore.remove();

			var i, count;
			var pkt;

			if(_pkt instanceof PACKET.ZC.PC_PURCHASE_ITEMLIST_FROMMC3) {
				pkt = new PACKET.CZ.PC_PURCHASE_ITEMLIST_FROMMC2();
				pkt.UniqueID = _pkt.UniqueID;
			} else if (_pkt instanceof PACKET.ZC.PC_PURCHASE_ITEMLIST_FROMMC2) {
				pkt = new PACKET.CZ.PC_PURCHASE_ITEMLIST_FROMMC2();
				pkt.UniqueID = _pkt.UniqueID;
			}
			else {
				pkt = new PACKET.CZ.PC_PURCHASE_ITEMLIST_FROMMC();
			}

			pkt.AID = _pkt.AID;
			count   = itemList.length;

			for (i = 0; i < count; ++i) {
				pkt.itemList.push({
					index:  itemList[i].index,
					count: itemList[i].count
				});
			}

			Network.sendPacket(pkt);
		};
	}

	/**
	 * Received items list to buy from player
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_ITEMLIST_BUYING_STORE
	 */
	function onBuyingStoreList( _pkt )
	{
		NpcStore.append();
		NpcStore.setType(NpcStore.Type.BUYING_STORE);
		NpcStore.setList(_pkt.itemList);
		NpcStore.setPriceLimit(_pkt.limitZeny);

		// Get seller name
		var entity = EntityManager.get(_pkt.AID);
		NpcStore.ui.find('.seller').text( entity ? entity.display.name : '');

		// Bying items
		NpcStore.onSubmit = function(itemList) {
			NpcStore.remove();

			var i, count;
			var pkt;

			pkt = new PACKET.CZ.REQ_TRADE_BUYING_STORE();
			pkt.UniqueID = _pkt.UniqueID;
			pkt.AID = _pkt.AID;

			count   = itemList.length;

			for (i = 0; i < count; ++i) {
				pkt.itemList.push({
					index:  itemList[i].index,
					ITID:  itemList[i].ITID,
					count: itemList[i].count
				});
			}

			Network.sendPacket(pkt);
		};
	}

	/**
	 * Open vending creation window with X slots
	 *
	 * @param {object} pkt - PACKET.ZC.PACKET_ZC_OPENSTORE
	 */
	function onOpenVending(pkt){
		Vending.onVendingSkill(pkt);
	}


	/**
	 * Open vending creation window with X slots
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_OPENSTORE2
	 */
	function onOpenVendingResult(pkt){
		// TODO: check what it do in client
	}

	/**
	 * Initialize
	 */
	return function MainEngine()
	{
		Network.hookPacket( PACKET.ZC.PC_CASH_POINT_ITEMLIST,       onBuyCashList );
		Network.hookPacket( PACKET.ZC.PC_CASH_POINT_UPDATE,         onBuyCashResult );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_ITEMLIST,         onBuyList );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_ITEMLIST2,         onBuyList );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_RESULT,           onBuyResult );
		Network.hookPacket( PACKET.ZC.PC_SELL_ITEMLIST,             onSellList );
		Network.hookPacket( PACKET.ZC.PC_SELL_RESULT,               onSellResult );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_ITEMLIST_FROMMC,  onVendingStoreList );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_ITEMLIST_FROMMC2, onVendingStoreList );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_ITEMLIST_FROMMC3, onVendingStoreList );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_RESULT_FROMMC,    onBuyResult );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_MYITEMLIST,       onBuyVendingList );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_MYITEMLIST2,      onBuyVendingList );
		Network.hookPacket( PACKET.ZC.DELETEITEM_FROM_MCSTORE,      onDeleteVendingItem );
		Network.hookPacket( PACKET.ZC.DELETEITEM_FROM_MCSTORE2,     onDeleteVendingItem );
		Network.hookPacket( PACKET.ZC.OPENSTORE,                    onOpenVending );
		Network.hookPacket( PACKET.ZC.ACK_OPENSTORE2,               onOpenVendingResult );
		Network.hookPacket( PACKET.ZC.PC_PURCHASE_ITEMLIST_FROMMC3, onVendingStoreList );
		Network.hookPacket( PACKET.ZC.ACK_ITEMLIST_BUYING_STORE,    onBuyingStoreList );
	};
});
