/**
 * Engine/MapEngine/MapState.js
 *
 * Manage Map State based on received packets from server
 *
 * @author Alison Serafim
 */

define(function( require )
{
	'use strict';

	/**
	 * Load dependencies
	 */
	var MapState          = require('DB/Map/MapState');
	var Session           = require('Engine/SessionStorage');
	var Network           = require('Network/NetworkManager');
	var PACKET            = require('Network/PacketStructure');

	var MapProperty = MapState.MapProperty;
	var MapType     = MapState.MapType;
	var MapFlag     = MapState.MapFlag;

	/**
	 * Define Map Properties
	 *
	 * @param {object} pkt
	 */
	function onMapProperty( pkt )
	{
		Session.mapState.property = pkt.type;
		Session.mapState.flag = pkt.flag ? pkt.flag : 0;

		Session.mapState.isPVPZone =  pkt.type == MapProperty.FREEPVPZONE ? true : false;
		Session.mapState.isAgitZone =  pkt.type == MapProperty.AGITZONE ? true : false;
		
		if(pkt.flag) {
			Session.mapState.isPVP = ( pkt.flag & MapFlag.PVP ) != 0 ? true : false; // Show attack cursor on non-party members (PvP)
			Session.mapState.isGVG = ( pkt.flag & MapFlag.GVG ) != 0 ? true : false; // Show attack cursor on non-guild members (GvG)
			Session.mapState.isSiege = ( pkt.flag & MapFlag.GVG ) != 0 ? true : false; // Show emblem over characters heads when in GvG (WoE castle)
			Session.mapState.isNoLockOn = ( pkt.flag & MapFlag.DISABLE_LOCKON ) != 0 ? true : false; // Only allow attacks on other players with shift key or /ns active
			Session.mapState.showPVPCounter = ( pkt.flag & MapFlag.COUNT_PK ) != 0 ? true : false; // Show the PvP counter
			Session.mapState.showBFCounter = ( pkt.flag & MapFlag.BATTLEFIELD ) != 0 ? true : false; // Show the battlegrounds counter
		}
	}

	/**
	 * Define Map Type
	 *
	 * @param {object} pkt
	 */
	function onMapType( pkt )
	{
		Session.mapState.type = pkt.type;
		Session.mapState.isBattleField = pkt.type == MapType.BATTLEFIELD ? true : false;
	}

	/**
	 * Initialize
	 */
	return function MapStateEngine()
	{
		Network.hookPacket( PACKET.ZC.NOTIFY_MAPPROPERTY,            onMapProperty );   // map property
		Network.hookPacket( PACKET.ZC.NOTIFY_MAPPROPERTY2,           onMapType );       // map type
		Network.hookPacket( PACKET.ZC.MAPPROPERTY_R2,                onMapProperty );   // map property + flag
	};
});
