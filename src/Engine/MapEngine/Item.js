/**
 * Engine/MapEngine/Item.js
 *
 * Item dropped to the ground
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
	var DB           			 = require('DB/DBManager');
	var EquipLocation			 = require('DB/Items/EquipmentLocation');
	var Network      			 = require('Network/NetworkManager');
	var PACKET       			 = require('Network/PacketStructure');
	var PACKETVER   			 = require('Network/PacketVerManager');
	var ItemObject   			 = require('Renderer/ItemObject');
	var Altitude     			 = require('Renderer/Map/Altitude');
	var Session      			 = require('Engine/SessionStorage');
	var ChatBox      			 = require('UI/Components/ChatBox/ChatBox');
	var ItemObtain   			 = require('UI/Components/ItemObtain/ItemObtain');
	var ItemSelection			 = require('UI/Components/ItemSelection/ItemSelection');
	var Inventory    			 = require('UI/Components/Inventory/Inventory');
	var CartItems    			 = require('UI/Components/CartItems/CartItems');
	var Equipment    			 = require('UI/Components/Equipment/Equipment');
	var PlayerViewEquip    		 = require('UI/Components/PlayerViewEquip/PlayerViewEquip');
	var SwitchEquip	    		 = require('UI/Components/SwitchEquip/SwitchEquip');
	var Storage                  = require('UI/Components/Storage/Storage');
	var MakeItemSelection     	 = require('UI/Components/MakeItemSelection/MakeItemSelection');
	var ItemListWindowSelection  = require('UI/Components/MakeItemSelection/ItemListWindowSelection');

    var EffectManager = require('Renderer/EffectManager');


	/**
	 * Spam an item on the map
	 *
	 * @param {object} pkt - PACKET.ZC.ITEM_ENTRY
	 */
	function onItemExistInGround( pkt )
	{
		var x = pkt.xPos - 0.5 + pkt.subX / 12;
		var y = pkt.yPos - 0.5 + pkt.subY / 12;
		var z = Altitude.getCellHeight( x, y );

		ItemObject.add( pkt.ITAID, pkt.ITID, pkt.IsIdentified, pkt.count, x, y, z );
	}


	/**
	 * Spam a new item on the map
	 *
	 * @param {object} pkt - PACKET.ZC.ITEM_FALL_ENTRY
	 */
	function onItemSpamInGround( pkt )
	{
		var x = pkt.xPos - 0.5 + pkt.subX / 12;
		var y = pkt.yPos - 0.5 + pkt.subY / 12;
		var z = Altitude.getCellHeight( x, y ) + 5.0;

		ItemObject.add(
			pkt.ITAID,
			pkt.ITID,
			pkt.IsIdentified,
			pkt.count,
			x,
			y,
			z,
			pkt.dropeffectmode,
			pkt.showdropeffect
		);
	}


	/**
	 * Spam a new item on the map
	 *
	 * @param {object} pkt - PACKET.ZC.ITEM_DISAPPEAR
	 */
	function onItemInGroundVanish( pkt )
	{
		ItemObject.remove( pkt.ITAID );
	}


	/**
	 * Answer when player pick the item
	 *
	 * @param {object} pkt - PACKET.ZC.ITEM_PICKUP_ACK3
	 */
	function onItemPickAnswer( pkt )
	{
		// Fail
		if (pkt.result !== 0) {
			ChatBox.addText( DB.getMessage(53), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
			return;
		}

		ItemObtain.append();
		ItemObtain.set(pkt);

		var getTextItem = DB.getItemName(pkt);

		ChatBox.addText(
			DB.getMessage(153).replace('%s', getTextItem ).replace('%d', pkt.count ),
			ChatBox.TYPE.BLUE,
			ChatBox.FILTER.ITEM
		);

		Inventory.getUI().addItem(pkt);
	}


	/**
	 * Generic function to add items to inventory
	 *
	 * @param {object} pkt - PACKET.ZC.EQUIPMENT_ITEMLIST
	 */
	function onInventorySetList( pkt )
	{
		Inventory.getUI().setItems( pkt.itemInfo || pkt.ItemInfo );
	}


	/**
	 * Remove item from inventory
	 *
	 * @param {object} pkt - PACKET.ZC.ITEM_THROW_ACK
	 */
	function onIventoryRemoveItem( pkt )
	{
		Inventory.getUI().removeItem( pkt.Index, pkt.count || pkt.Count || 0);
	}


	/**
	 * Remove an item from equipment, add it to inventory
	 *
	 * @param {object} pkt - PACKET.ZC.REQ_TAKEOFF_EQUIP_ACK
	 */
	function onEquipementTakeOff( pkt )
	{
		if (pkt.result) {
			var item = Equipment.getUI().unEquip( pkt.index, pkt.wearLocation);

			if (item) {
				item.WearState = 0;

				var it = DB.getItemInfo( item.ITID );
				ChatBox.addText(
					it.identifiedDisplayName + ' ' + DB.getMessage(171),
					ChatBox.TYPE.ERROR,
					ChatBox.FILTER.ITEM
				);

				if (!(pkt.wearLocation & EquipLocation.AMMO)) {
					Inventory.getUI().addItem(item);
				}
			}

			if (pkt.wearLocation & EquipLocation.HEAD_TOP)    Session.Entity.accessory2 = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
			if (pkt.wearLocation & EquipLocation.HEAD_MID)    Session.Entity.accessory3 = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
			if (pkt.wearLocation & EquipLocation.HEAD_BOTTOM) Session.Entity.accessory  = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
			if (pkt.wearLocation & EquipLocation.GARMENT)     Session.Entity.robe       = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_ROBE);
			if (pkt.wearLocation & EquipLocation.WEAPON)      Session.Entity.weapon     = 0;
			if (pkt.wearLocation & EquipLocation.SHIELD)      Session.Entity.shield     = 0;
			if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_TOP)    Session.Entity.accessory2 = Equipment.getUI().checkEquipLoc(EquipLocation.HEAD_TOP);
			if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_MID)    Session.Entity.accessory3 = Equipment.getUI().checkEquipLoc(EquipLocation.HEAD_MID);
			if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_BOTTOM) Session.Entity.accessory  = Equipment.getUI().checkEquipLoc(EquipLocation.HEAD_BOTTOM);
			if (pkt.wearLocation & EquipLocation.COSTUME_ROBE)     Session.Entity.robe       = Equipment.getUI().checkEquipLoc(EquipLocation.GARMENT);
		
			if(PACKETVER.value >= 20170208) { // Remove from Switch Window as well
				if (!Inventory.getUI().isInEquipSwitchList(pkt.wearLocation)) {
					SwitchEquip.unEquip( pkt.index, pkt.wearLocation );
				}
			}
		}
	}


	/**
	 * Equip an item
	 *
	 * @param {object} pkt - PACKET.ZC.REQ_WEAR_EQUIP_ACK
	 */
	function onItemEquip( pkt )
	{
		if (pkt.result == 1) {
			var item = Inventory.getUI().removeItem( pkt.index, 1 );
			Equipment.getUI().equip( item, pkt.wearLocation );
			ChatBox.addText(
				DB.getItemName(item) + ' ' + DB.getMessage(170),
				ChatBox.TYPE.BLUE,
				ChatBox.FILTER.ITEM
			);

			// Variables for Headgear Checks
			var CostumeCheckTop = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
			var CostumeCheckMid = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
			var CostumeCheckBot = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
			var CostumeCheckRobe = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_ROBE);

			// Display
			if (pkt.wearLocation & EquipLocation.HEAD_TOP)    Session.Entity.accessory2 = (CostumeCheckTop)  ? CostumeCheckTop  : pkt.viewid;
			if (pkt.wearLocation & EquipLocation.HEAD_MID)    Session.Entity.accessory3 = (CostumeCheckMid)  ? CostumeCheckMid  : pkt.viewid;
			if (pkt.wearLocation & EquipLocation.HEAD_BOTTOM) Session.Entity.accessory  = (CostumeCheckBot)  ? CostumeCheckBot  : pkt.viewid;
			if (pkt.wearLocation & EquipLocation.GARMENT)     Session.Entity.robe       = (CostumeCheckRobe) ? CostumeCheckRobe : pkt.viewid;

			if (pkt.wearLocation & EquipLocation.WEAPON)      Session.Entity.weapon     = pkt.viewid;
			if (pkt.wearLocation & EquipLocation.SHIELD)      Session.Entity.shield     = pkt.viewid;

			// costume override regular equips
			if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_TOP)    Session.Entity.accessory2  = pkt.viewid;
			if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_MID)    Session.Entity.accessory3  = pkt.viewid;
			if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_BOTTOM) Session.Entity.accessory   = pkt.viewid;
			if (pkt.wearLocation & EquipLocation.COSTUME_ROBE)        Session.Entity.robe        = pkt.viewid;
		}

		// Fail to equip
		else {
			ChatBox.addText(
				DB.getMessage(372),
				ChatBox.TYPE.ERROR,
				ChatBox.FILTER.ITEM
			);
		}
	}


	/**
	 * Answer from the server to use an item
	 * @param {object} pkt - PACKET.ZC.USE_ITEM_ACK
	 */
	function onItemUseAnswer( pkt )
	{
		if (!pkt.hasOwnProperty('AID') || Session.Entity.GID === pkt.AID) {
			if (pkt.result) {
				Inventory.getUI().updateItem( pkt.index, pkt.count );
			}
			else {
				// should we show a msg in chatbox ?
			}
		}
		if(pkt.result){
			EffectManager.spamItem( pkt.id, pkt.AID, null, null, null);
		}
	}

	/**
	 * View other player's equipment - CZ_EQUIPWIN_MICROSCOPE
	 *
	 * @param {number} account id
	 */
	Equipment.onCheckPlayerEquipment = function onCheckPlayerEquipment( AID )
	{
		var pkt = new PACKET.CZ.EQUIPWIN_MICROSCOPE();
		pkt.AID = AID;
		Network.sendPacket(pkt);
	}

	/**
	 * Show other player's equipment
	 *
	 * @param {object} pkt - ZC_EQUIPWIN_MICROSCOPE
	 */
	function onShowPlayerEquip( pkt ){
		PlayerViewEquip.getUI().append();
		PlayerViewEquip.getUI().setTitleBar(pkt.characterName);
		PlayerViewEquip.getUI().setEquipmentData(pkt.ItemInfo);
		PlayerViewEquip.getUI().setChar2Render(pkt);
	}


	/**
	 * Equip an arrow
	 *
	 * @param {object} pkt - PACKET_ZC_EQUIP_ARROW
	 */
	function onArrowEquipped( pkt )
	{
		var item = Inventory.getUI().getItemByIndex( pkt.index );
		Equipment.getUI().equip( item, EquipLocation.AMMO);
	}


	/**
	 * @var {object} item
	 */
	var _cardComposition;


	/**
	 * Ask to get a list of equipments where we can put a card
	 *
	 * @param {number} card index
	 */
	function onUseCard(index)
	{
		_cardComposition = index;
		var pkt          = new PACKET.CZ.REQ_ITEMCOMPOSITION_LIST();
		pkt.cardIndex    = index;
		Network.sendPacket(pkt);
	};


	/**
	 * Get a list of equipments to insert card
	 *
	 * @param {object} pkt - PACKET.ZC.ITEMCOMPOSITION_LIST
	 */
	function onItemCompositionList( pkt )
	{
		if (!pkt.ITIDList.length) {
			return;
		}

		var card = Inventory.getUI().getItemByIndex(_cardComposition);

		ItemSelection.append();
		ItemSelection.setList(pkt.ITIDList);
		ItemSelection.setTitle(DB.getMessage(522) + '(' + DB.getItemInfo(card.ITID).identifiedDisplayName + ')');
		ItemSelection.onIndexSelected = function(index) {
			if (index >= 0) {
				var pkt        = new PACKET.CZ.REQ_ITEMCOMPOSITION();
				pkt.cardIndex  = _cardComposition;
				pkt.equipIndex = index;
				Network.sendPacket(pkt);
			}

			_cardComposition = null;
		};
	}


	/**
	 * Get the result once card inserted
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_ITEMCOMPOSITION
	 */
	function onItemCompositionResult( pkt )
	{
		switch (pkt.result) {
			case 0: // success
				var item = Inventory.getUI().removeItem(pkt.equipIndex, 1);
				var card = Inventory.getUI().removeItem(pkt.cardIndex,  1);

				if (item) {
					for (var i = 0; i < 4; ++i) {
						if (!item.slot['card'+(i+1)]) {
							item.slot['card'+(i+1)] = card.ITID;
							break;
						}
					}
					Inventory.getUI().addItem(item);
				}
				break;

			case 1: // Fail
				break;
		}
	}


	/**
	 * Get the result of a refine action
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_ITEMREFINING
	 */
	function onRefineResult( pkt )
	{
		var item = Inventory.getUI().removeItem( pkt.itemIndex, 1);
		if (item) {
			item.RefiningLevel = pkt.RefiningLevel;
			Inventory.getUI().addItem(item);
		}

		// TODO: effect ?
		switch (pkt.result) {
			case 0: // success
			case 1: // failure
			case 2: // downgrade
		}

	}

	/**
	 * Generic function to add items to cart
	 *
	 * @param {object} pkt - PACKET.ZC.CART_EQUIPMENT_ITEMLIST3
	 */
	function onCartSetList( pkt )
	{
		CartItems.setItems( pkt.itemInfo || pkt.ItemInfo );
	}

	/**
	 * Generic function to set cart info
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_CARTITEM_COUNTINFO
	 */
	function onCartSetInfo( pkt )
	{
		CartItems.setCartInfo( pkt.curCount, pkt.maxCount, pkt.curWeight, pkt.maxWeight  );
	}

	function onCartRemoveItem( pkt )
	{
		CartItems.removeItem( pkt.index, pkt.count);
	}

	CartItems.reqRemoveItem = function ReqRemoveItem( index, count )
	{
		if (count <= 0) {
			return;
		}

		var pkt   = new PACKET.CZ.MOVE_ITEM_FROM_CART_TO_BODY();
		pkt.index = index;
		pkt.count = count;
		Network.sendPacket( pkt );
	};

	function reqMoveItemToCart( index, count )
	{
		if (count <= 0) {
			return;
		}

		var pkt   = new PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_CART();
		pkt.index = index;
		pkt.count = count;
		Network.sendPacket( pkt );
	};

	Inventory.reqMoveItemToWriteRodex = function reqMoveItemToWriteRodex( index, count )
	{
		if (count <= 0) {
			return;
		}

		var pkt   = new PACKET.CZ.REQ_ADD_ITEM_RODEX();
		pkt.index = index;
		pkt.count = count;
		Network.sendPacket( pkt );
	};

	function onCartItemAdded( pkt )
	{
		CartItems.addItem(pkt);
	}

	function onAckAddItemToCart( pkt ){
		switch (pkt.result) {
			case 0:
				ChatBox.addText( DB.getMessage(220), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
				break;

			case 1:
				ChatBox.addText( DB.getMessage(221), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
				break;
		}
	}

	/**
	 * Get a list of items to create
	 *
	 * @param {object} pkt - PACKET.ZC.MAKABLEITEMLIST
	 */
	function onMakeitemList( pkt )
	{
		if (!pkt.itemList.length) {
			return;
		}

		MakeItemSelection.append();
		MakeItemSelection.setList(pkt.itemList);
		MakeItemSelection.setTitle(DB.getMessage(425));
		MakeItemSelection.onIndexSelected = function(index, material) {
			if (index >= -1) {
				var pkt   = new PACKET.CZ.REQMAKINGITEM();
				pkt.itemList.ITID = index;
				pkt.itemList.material_ID = {};
				pkt.itemList.material_ID[0] = (material[0] && material[0].ITID) ? material[0].ITID : 0;
				pkt.itemList.material_ID[1] = (material[1] && material[1].ITID) ? material[1].ITID : 0;
				pkt.itemList.material_ID[2] = (material[2] && material[2].ITID) ? material[2].ITID : 0;
				Network.sendPacket(pkt);
			}
		};
	}

	/**
	 * Get a list of items to create
	 *
	 * @param {object} pkt - PACKET.ZC.ITEMLISTWIN_OPEN
	 */
	function onListWinItem( ptk )
	{
		if(! ptk.Type){
			ItemListWindowSelection.append();
		}
	}


	/**
	 * item lis twin
	 * @param {object} inforMaterialList
	 */
	ItemListWindowSelection.onItemListWindowSelected = function onItemListWindowSelected( inforMaterialList )
	{
		var pkt;
		if(PACKETVER.value >= 20180307) {
			pkt   = new PACKET.CZ.ITEMLISTWIN_RES2();
		} else {
			pkt   = new PACKET.CZ.ITEMLISTWIN_RES();
		}

		pkt.Type = inforMaterialList.Type;
		pkt.Action = inforMaterialList.Action;
		pkt.MaterialList = inforMaterialList.MaterialList;

		Network.sendPacket( pkt );
	}

	/**
	 * Get a list of items to create
	 *
	 * @param {object} pkt - PACKET.ZC.MAKINGITEM_LIST
	 */
	function onMakeitem_List( pkt )
	{
		if (!pkt.idList.length) {
			return;
		}
		MakeItemSelection.append();
		MakeItemSelection.setCookingList(pkt.idList);
		MakeItemSelection.setTitle(DB.getMessage(425));
		MakeItemSelection.onIndexSelected = function(index, material, mkType) {
			if (index >= -1) {
				var pkt   = new PACKET.CZ.REQ_MAKINGITEM();
				pkt.mkType = mkType;
				pkt.id = index;
				Network.sendPacket(pkt);
			}
		};
	}

	/**
	 * Result of Inventory Expansion
	 *
	 * @param {object} pkt - PACKET.ZC.EXTEND_BODYITEM_SIZE
	 */
	function onBodyItemSize(pkt) {
        if (pkt) {
			var baselimit = 100;	// Base Limit
			var newlimit = baselimit + pkt.type;
			Inventory.getUI().ui.find('.mcnt').text(newlimit);
		}
    }

	/**
	 * Result of Inventory Expansion
	 *
	 * @param {object} pkt - PACKET.ZC.RECOVER_PENALTY_OVERWEIGHT
	 */
	function onRecoverPenaltyOverweight(pkt) {
		// TODO add it as status check
		// show percent to status, still a wip
		if (Session.Entity) {
			Session.Entity.overWeightPercent = pkt.percentage;
		}
	}

	/**
	 * Result of Inventory Expansion
	 *
	 * @param {object} pkt - PACKET.ZC.SPLIT_SEND_ITEMLIST_NORMAL
	 */
	function onItemListNormal(pkt) {
		switch (pkt.invType) {
			case 0:
				Inventory.getUI().setItems( pkt.itemInfo || pkt.ItemInfo );
				break;
			case 1:
				CartItems.setItems( pkt.itemInfo || pkt.ItemInfo );
				break;
			case 2:
				Storage.append();
				Storage.setItems(  pkt.itemInfo || pkt.ItemInfo );
				break;
			default:
				throw new Error("[PACKET.ZC.SPLIT_SEND_ITEMLIST_NORMAL] - Unknown invType '" + pkt.invType + "'.");
		}
	}

	/**
	 * Result of Inventory Expansion
	 *
	 * @param {object} pkt - PACKET.ZC.SPLIT_SEND_ITEMLIST_EQUIP
	 */
	function onItemListEquip(pkt) {
		switch (pkt.invType) {
			case 0:
				Inventory.getUI().setItems( pkt.itemInfo || pkt.ItemInfo );
				break;
			case 1:
				CartItems.setItems( pkt.itemInfo || pkt.ItemInfo );
				break;
			case 2:
				Storage.setItems(  pkt.itemInfo || pkt.ItemInfo );
				break;
			default:
				throw new Error("[PACKET.ZC.SPLIT_SEND_ITEMLIST_NORMAL] - Unknown invType '" + pkt.invType + "'.");
		}
	}


	/**
	 * Updates the favorite status of an item in the Inventory UI
	 *
	 * @param {object} pkt - PACKET.ZC.ITEM_FAVORITE
	 * pkt.favorite:
	 *  0 = move item to personal tab
	 * 	1 = move item to normal tab
	 */
	function onFavItemList(pkt) {
		if(pkt) {
			// So if favorite is 0, we send 1 to change item.PlaceETCTab to 1
			var isfavitem = pkt.favorite ? 0 : 1;
			Inventory.getUI().updatePlaceETCTab(pkt.index, isfavitem);
		}
	}


	/**
	 * Received Switch Equip List
	 */
	function onSwitchEquipList(pkt) {
		if (pkt && pkt.ItemInfo) {
			pkt.ItemInfo.forEach(function(item) {
				if (Inventory.getUI().getItemByIndex(item.index)) {
					Inventory.getUI().addItemtoSwitch(item.index);
				}
			});
		}
	}


	/**
	 * Add item to Switch Equip
	 */
	function onSwitchEquipAdd(pkt) {
		if (pkt) {
			switch (pkt.flag) {
				case 0:
					Inventory.getUI().addItemtoSwitch(pkt.index);
					break;
				case 1:
				case 2:
					break;
				default:
					throw new Error("[PACKET.ZC.REQ_WEAR_SWITCHEQUIP_ADD_RESULT] - Error!");
			}
		}
	}

	/**
	 * Remove item to Switch Equip
	 */
	function onSwitchEquipRemove(pkt) {
		if (pkt) {
			switch (pkt.flag) {
				case 0:
					Inventory.getUI().removeItemFromSwitch(pkt.index);
					break;
				case 1:
					break;
				case 2:
					break;
				default:
					throw new Error("[PACKET.ZC.REQ_WEAR_SWITCHEQUIP_ADD_RESULT] - Error!");
			}
		}
	}

	/**
	 * Initialize
	 */
	return function ItemEngine()
	{
		Network.hookPacket( PACKET.ZC.ITEM_ENTRY,             onItemExistInGround );
		Network.hookPacket( PACKET.ZC.ITEM_FALL_ENTRY,        onItemSpamInGround );
		Network.hookPacket( PACKET.ZC.ITEM_FALL_ENTRY2,       onItemSpamInGround );
		Network.hookPacket( PACKET.ZC.ITEM_FALL_ENTRY3,       onItemSpamInGround );
		Network.hookPacket( PACKET.ZC.ITEM_DISAPPEAR,         onItemInGroundVanish);
		Network.hookPacket( PACKET.ZC.ITEM_PICKUP_ACK,        onItemPickAnswer );
		Network.hookPacket( PACKET.ZC.ITEM_PICKUP_ACK2,       onItemPickAnswer );
		Network.hookPacket( PACKET.ZC.ITEM_PICKUP_ACK3,       onItemPickAnswer );
		Network.hookPacket( PACKET.ZC.ITEM_PICKUP_ACK5,       onItemPickAnswer );
		Network.hookPacket( PACKET.ZC.ITEM_PICKUP_ACK6, 			onItemPickAnswer);
		Network.hookPacket( PACKET.ZC.ITEM_PICKUP_ACK7, 			onItemPickAnswer);
		Network.hookPacket( PACKET.ZC.ITEM_PICKUP_ACK8, 			onItemPickAnswer);
		Network.hookPacket( PACKET.ZC.ITEM_THROW_ACK,         onIventoryRemoveItem );
		Network.hookPacket( PACKET.ZC.NORMAL_ITEMLIST,        onInventorySetList );
		Network.hookPacket( PACKET.ZC.NORMAL_ITEMLIST2,       onInventorySetList );
		Network.hookPacket( PACKET.ZC.NORMAL_ITEMLIST3,       onInventorySetList );
		Network.hookPacket( PACKET.ZC.NORMAL_ITEMLIST4,       onInventorySetList );
		Network.hookPacket( PACKET.ZC.CART_NORMAL_ITEMLIST3,        onCartSetList );
		Network.hookPacket( PACKET.ZC.CART_NORMAL_ITEMLIST4,        onCartSetList );
		Network.hookPacket( PACKET.ZC.CART_EQUIPMENT_ITEMLIST3,        onCartSetList );
		Network.hookPacket( PACKET.ZC.CART_EQUIPMENT_ITEMLIST4,        onCartSetList );
		Network.hookPacket( PACKET.ZC.NOTIFY_CARTITEM_COUNTINFO,        onCartSetInfo );
		Network.hookPacket( PACKET.ZC.EQUIPMENT_ITEMLIST,     onInventorySetList );
		Network.hookPacket( PACKET.ZC.EQUIPMENT_ITEMLIST2,    onInventorySetList );
		Network.hookPacket( PACKET.ZC.EQUIPMENT_ITEMLIST3,    onInventorySetList );
		Network.hookPacket( PACKET.ZC.EQUIPMENT_ITEMLIST4,    onInventorySetList );
		Network.hookPacket( PACKET.ZC.EQUIPMENT_ITEMLIST5,    onInventorySetList );
		Network.hookPacket( PACKET.ZC.REQ_TAKEOFF_EQUIP_ACK,  onEquipementTakeOff );
		Network.hookPacket( PACKET.ZC.REQ_TAKEOFF_EQUIP_ACK2, onEquipementTakeOff );
		Network.hookPacket( PACKET.ZC.ACK_TAKEOFF_EQUIP_V5,   onEquipementTakeOff );
		Network.hookPacket( PACKET.ZC.REQ_WEAR_EQUIP_ACK,     onItemEquip );
		Network.hookPacket( PACKET.ZC.REQ_WEAR_EQUIP_ACK2,    onItemEquip );
		Network.hookPacket( PACKET.ZC.ACK_WEAR_EQUIP_V5,      onItemEquip );
		Network.hookPacket( PACKET.ZC.DELETE_ITEM_FROM_BODY,  onIventoryRemoveItem );
		Network.hookPacket( PACKET.ZC.DELETE_ITEM_FROM_CART,  onCartRemoveItem );
		Network.hookPacket( PACKET.ZC.USE_ITEM_ACK,           onItemUseAnswer );
		Network.hookPacket( PACKET.ZC.USE_ITEM_ACK2,          onItemUseAnswer );
		Network.hookPacket( PACKET.ZC.EQUIP_ARROW,            onArrowEquipped );
		Network.hookPacket( PACKET.ZC.ITEMCOMPOSITION_LIST,   onItemCompositionList );
		Network.hookPacket( PACKET.ZC.ACK_ITEMCOMPOSITION,    onItemCompositionResult );
		Network.hookPacket( PACKET.ZC.ACK_ITEMREFINING,       onRefineResult);
		Network.hookPacket( PACKET.ZC.ADD_ITEM_TO_CART,          onCartItemAdded );
		Network.hookPacket( PACKET.ZC.ADD_ITEM_TO_CART2,         onCartItemAdded );
		Network.hookPacket( PACKET.ZC.ADD_ITEM_TO_CART3,         onCartItemAdded );
		Network.hookPacket( PACKET.ZC.ADD_ITEM_TO_CART4,         onCartItemAdded );
		Network.hookPacket( PACKET.ZC.MAKABLEITEMLIST,        onMakeitemList );
		Network.hookPacket( PACKET.ZC.MAKINGITEM_LIST,        onMakeitem_List );
		Network.hookPacket( PACKET.ZC.ACK_ADDITEM_TO_CART,        onAckAddItemToCart );
		Network.hookPacket( PACKET.ZC.ITEMLISTWIN_OPEN,        onListWinItem );
		Network.hookPacket( PACKET.ZC.EXTEND_BODYITEM_SIZE,        onBodyItemSize );
		Network.hookPacket( PACKET.ZC.RECOVER_PENALTY_OVERWEIGHT,        onRecoverPenaltyOverweight );
		Network.hookPacket( PACKET.ZC.SPLIT_SEND_ITEMLIST_NORMAL,       onItemListNormal );
		Network.hookPacket( PACKET.ZC.SPLIT_SEND_ITEMLIST_EQUIP,        onItemListEquip );
		Network.hookPacket( PACKET.ZC.SPLIT_SEND_ITEMLIST_EQUIP2,        onItemListEquip );

		Network.hookPacket( PACKET.ZC.EQUIPWIN_MICROSCOPE,        onShowPlayerEquip );
		Network.hookPacket( PACKET.ZC.EQUIPWIN_MICROSCOPE_V2,     onShowPlayerEquip );
		Network.hookPacket( PACKET.ZC.EQUIPWIN_MICROSCOPE_V3,     onShowPlayerEquip );
		Network.hookPacket( PACKET.ZC.EQUIPWIN_MICROSCOPE_V4,     onShowPlayerEquip );
		Network.hookPacket( PACKET.ZC.EQUIPWIN_MICROSCOPE_V5,     onShowPlayerEquip );
		Network.hookPacket( PACKET.ZC.EQUIPWIN_MICROSCOPE_V6,     onShowPlayerEquip );
		Network.hookPacket( PACKET.ZC.EQUIPWIN_MICROSCOPE_V7,     onShowPlayerEquip );

		/* Favorite Tab */
		Network.hookPacket( PACKET.ZC.ITEM_FAVORITE,			  onFavItemList );

		/* Switch Equipment*/
		Network.hookPacket( PACKET.ZC.SEND_SWAP_EQUIPITEM_INFO,   		 	onSwitchEquipList );
		Network.hookPacket( PACKET.ZC.REQ_WEAR_SWITCHEQUIP_ADD_RESULT,   	onSwitchEquipAdd );
		Network.hookPacket( PACKET.ZC.REQ_WEAR_SWITCHEQUIP_REMOVE_RESULT,   onSwitchEquipRemove );

		Inventory.getUI().onUseCard            = onUseCard;
		Inventory.getUI().reqMoveItemToCart	   = reqMoveItemToCart;
	};
});
