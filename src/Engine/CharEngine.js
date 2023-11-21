/**
 * Engine/CharEngine.js
 *
 * Char Engine
 * Manage char server, connection, character selection / creation / deletion, etc.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function( require )
{
	'use strict';


	// Load modules
	var jQuery     = require('Utils/jquery');
	var DB         = require('DB/DBManager');
	var Events     = require('Core/Events');
	var Sound      = require('Audio/SoundManager');
	var BGM        = require('Audio/BGM');
	var Session    = require('Engine/SessionStorage');
	var MapEngine  = require('Engine/MapEngine');
	var Network    = require('Network/NetworkManager');
	var PACKETVER  = require('Network/PacketVerManager');
	var PACKET     = require('Network/PacketStructure');
	var UIManager  = require('UI/UIManager');
	var Background = require('UI/Background');
	var PincodeWindow = require('UI/Components/PincodeWindow/PincodeWindow');
	var InputBox   = require('UI/Components/InputBox/InputBox');
	var getModule  = require;
	
	var UIVersionManager = require('UI/UIVersionManager');
	// Version Dependent UIs
	var CharSelect = require('UI/Components/CharSelect/CharSelect');
	var CharCreate = require('UI/Components/CharCreate/CharCreate');

	/**
	 * @var {object} server data
	 */
	var _server = null;

	/**
	 * @var {number} where to create character ?
	 */
	var _creationSlot = 0;

	/*
	 * Connect to char server
	 */
	function init( server )
	{
		BGM.play('01.mp3');
		
		//
		if(_server !== server){
			MapEngine.invalidate();
		}

		// Storing variable
		_server = server;

		// Connect to char server
		Network.connect( Network.utils.longToIP( server.ip ), server.port, function( success ){

			// Fail to connect...
			if (!success) {
				UIManager.showErrorBox( DB.getMessage(1) );
				return;
			}

			// Success, try to connect
			var pkt        = new PACKET.CH.ENTER();
			pkt.AID        = Session.AID;
			pkt.AuthCode   = Session.AuthCode;
			pkt.userLevel  = Session.UserLevel;
			pkt.Sex        = Session.Sex;
			pkt.clientType = Session.LangType;
			Network.sendPacket(pkt);

			// Server send back (new) AID
			Network.read(function(fp){
				Session.AID = fp.readLong();
			});
		});
		
		//Select UI version
		CharSelect.selectUIVersion();
		CharCreate.selectUIVersion();

		// Hook packets
		Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION,        onConnectionAccepted );
		Network.hookPacket( PACKET.HC.REFUSE_ENTER,                  onConnectionRefused );
		Network.hookPacket( PACKET.HC.ACCEPT_MAKECHAR_NEO_UNION,     onCreationSuccess );
		Network.hookPacket( PACKET.HC.ACCEPT_MAKECHAR,    			 onCreationSuccess );
		Network.hookPacket( PACKET.HC.REFUSE_MAKECHAR,               onCreationFail );
		Network.hookPacket( PACKET.HC.ACCEPT_DELETECHAR,             onDeleteAnswer );
		Network.hookPacket( PACKET.HC.DELETE_CHAR3,					 onDeleteAnswer );
		Network.hookPacket( PACKET.HC.REFUSE_DELETECHAR,             onDeleteAnswer );
		Network.hookPacket( PACKET.HC.NOTIFY_ZONESVR,                onReceiveMapInfo);
		Network.hookPacket( PACKET.HC.NOTIFY_ZONESVR2,               onReceiveMapInfo );
		Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION_HEADER, onConnectionAccepted );
		Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION_LIST,   onConnectionAccepted );
		Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION_LIST2,  onConnectionAccepted );
		Network.hookPacket( PACKET.HC.NOTIFY_ACCESSIBLE_MAPNAME,     onMapUnavailable);
		Network.hookPacket( PACKET.HC.SECOND_PASSWD_LOGIN, 			 onPincodeCheckSuccess);
		Network.hookPacket( PACKET.HC.DELETE_CHAR3_RESERVED,		 onRequestCharDel);
	}


	/**
	 * Reload Char-Select
	 */
	function reload()
	{
		Network.close();
		Background.setImage( 'bgi_temp.bmp', function() {
			UIManager.removeComponents();
			init( _server );
		});
	}


	/**
	 * Request to go back to Login Window
	 */
	function onExitRequest()
	{
		getModule('Engine/LoginEngine').reload();
	}


	/**
	 * Connection accepted from char-server
	 * Displaying Character list
	 *
	 * @param {object} pkt - PACKET.HC.ACCEPT_ENTER_NEO_UNION
	 */
	function onConnectionAccepted( pkt )
	{
		pkt.sex = Session.Sex;

		// Start sending ping
		var ping = new PACKET.CZ.PING();
		ping.AID = Session.AID;
		Network.setPing(function(){
			Network.sendPacket(ping);
		});

		Session.Playing = false;
    		Session.hasCart = false;

		UIManager.getComponent('WinLoading').remove();

		// Initialize window
		var ChSel = CharSelect.getUI();
		ChSel.onExitRequest = onExitRequest;
		ChSel.onConnectRequest = onConnectRequest;
		ChSel.onCreateRequest = onCreateRequest;
		ChSel.onDeleteRequest = onDeleteRequest;
		ChSel.onDeleteReqDelay = onDeleteReqDelay;
		ChSel.onCancelDeleteRequest = onCancelDeleteRequest;
		ChSel.append();
		ChSel.setInfo(pkt);
		
	}


	/**
	 * Server don't want the user to connect
	 *
	 * @param {object} pkt - PACKET.HC.REFUSE_ENTER
	 */
	function onConnectionRefused( pkt )
	{
		var msg_id;

		switch (pkt.ErrorCode) {
			default:
			case 0: msg_id = 3; break;
			// other types ?
		}

		UIManager.showErrorBox( DB.getMessage(msg_id) );
	}


	/**
	 * No map server available
	 *
	 * @param {object} pkt - PACKET.HC.NOTIFY_ACCESSIBLE_MAPNAME
	 */
	function onMapUnavailable( pkt )
	{
		// no map server avaiable
		UIManager.showMessageBox(
			DB.getMessage(1811),
			'ok',
			function(){
				UIManager.getComponent('WinLoading').remove();
				CharSelect.getUI().append();
			},
			true
		);
	}
	  
	/**
	 * Char Delete Request Result
	 */
	function onRequestCharDel (pkt) {
		
		if (!pkt)
			return;

		// Just pass the packet info
		CharSelect.getUI().reqdeleteAnswer(pkt);
	}

	/**
	 * Char Delete Request Cancel
	 */
	function onCancelDeleteRequest ( charID ) {
		
		if (charID === 0)
			return;
		
		var pkt = new PACKET.CH.DELETE_CHAR3_CANCEL();
		pkt.GID = charID;
		Network.sendPacket(pkt);
	}

	/**
	 * User want to delete a character with delay
	 *
	 * @param {number} charID - Character ID
	 */
	function onDeleteReqDelay ( charID )
	{
		if (!charID)
		return;
		
		var pkt = new PACKET.CH.DELETE_CHAR3_RESERVED();
		pkt.GID = charID;
		Network.sendPacket(pkt);
	}

	/**
	 * User want to delete a character
	 *
	 * @param {number} charID - Character ID
	 */
	function onDeleteRequest( charID )
	{
		var _ui_box;
		var _inputValue;
		var _overlay;
		var _time_end;
		var _render = false;
		var _canvas, _ctx, _width, _height;
		var _TimeOut;

		// Delete the character
		function deleteCharacter() {
			if (PACKETVER.value > 20100803) {
				var pkt = new PACKET.CH.DELETE_CHAR3();
				pkt.GID = charID;
				pkt.Birth = _inputValue.substring(2);	// Server only needs the 6 digits
				Network.sendPacket(pkt);
			} else {
				var pkt = new PACKET.CH.DELETE_CHAR();
				pkt.GID = charID;
				pkt.key = _inputValue;
				Network.sendPacket(pkt);
			}
		}

		// Cancel the prompt
		function onCancel() {
			InputBox.remove();
			_ui_box.remove();
			_overlay.detach();
			Events.clearTimeout(_TimeOut);
			onDeleteAnswer({ ErrorCode: -2});
		}

		// Ask the mail/birthdate
		function onOk(){
			InputBox.append();
			if (PACKETVER.value >= 20100803) {
				InputBox.setType('birthdate', true);
			} else {
				InputBox.setType('mail', true);
			}
			InputBox.onSubmitRequest = onSubmit;
			_ui_box.ui.css('zIndex', 50); // ui same zIndex bg
			_overlay.css('zIndex', 51); // overlay same zIndex input
			_ui_box.append(); // don't remove message box
		}

		// Display prompt message
		_ui_box  = UIManager.showPromptBox( DB.getMessage(19), 'ok', 'cancel', onOk, onCancel);
		_overlay = jQuery('<div/>').addClass('win_popup_overlay').appendTo('body');

		// Submit the mail/birthdate
		function onSubmit(input){
			_inputValue = input;
			InputBox.remove();
			_ui_box.remove();
			
			if (PACKETVER.value < 20180124) {	// Not sure which date should we not use this loading delete anymore
				// Stop rendering...
				_ui_box = UIManager.showMessageBox( DB.getMessage(296).replace('%d',10), 'cancel', function(){
					_render = false;
					onCancel();
				});

				// Build canvas
				_canvas = document.createElement('canvas');
				_ctx    = _canvas.getContext('2d');
				_width  = _canvas.width  = 240;
				_height = _canvas.height = 15;
				_canvas.style.marginTop  = '10px';
				_canvas.style.marginLeft = '20px';
				_ui_box.ui.append(_canvas);

				// Parameter
				_time_end = Date.now() + 10000;
				_render  = true;

				// Start the timing
				render();
			} else {	// No waiting time
				_ui_box.remove();
				_overlay.detach();
				deleteCharacter();
				return;
			}
		}

		// Rendering
		function render() {
			// Calculate percent
			var time_left = _time_end - Date.now();
			var percent   =  Math.round( 100 - time_left / 100 );

			// Delete character
			if (percent >= 100) {
				_ui_box.remove();
				_overlay.detach();
				deleteCharacter();
				return;
			}

			// Update text
			_ui_box.ui.find('.text').text( DB.getMessage(296).replace('%d', Math.round(10-percent/10) ) );

			// Update progressbar
			_ctx.clearRect(0, 0, _width, _height);
			_ctx.fillStyle = 'rgb(0,255,255)';
			_ctx.fillRect( 0, 0, _width, _height );
			_ctx.fillStyle = 'rgb(140,140,140)';
			_ctx.fillRect( 1, 1, _width-2 , _height-2 );
			_ctx.fillStyle = 'rgb(66,99,165)';
			_ctx.fillRect( 2, 2, Math.round(percent*(_width-4)/100) , _height-4 );
			_ctx.fillStyle = 'rgb(255,255,0)';
			_ctx.fillText( percent + '%' ,  ( _width - _ctx.measureText( percent+'%').width ) * 0.5 , 12  );

			_TimeOut = Events.setTimeout( render, 30);
		}
	}


	/*
	 * Answer from server to delete character
	 *
	 * @param {object} PACKET.HC.REFUSE_DELETECHAR or PACKET.HC.ACCEPT_DELETECHAR
	 * @param {object} PACKET.HC.DELETE_CHAR3 <GID> <Result>
	 */
	function onDeleteAnswer(pkt)
	{
		if (PACKETVER.value <= 20100803) { // Email deletion result
			var result = typeof( pkt.ErrorCode ) === 'undefined' ? -1 : pkt.ErrorCode;
		} else { // Birthday deletion result
			var result = typeof( pkt.Result ) === 'undefined' ? -1 : pkt.Result;
		}
		CharSelect.getUI().deleteAnswer(result);
	}


	/**
	 * Asking from CharSelect to create a character, moving to CharCreate window
	 *
	 * @param {number} index - slot where to create character
	 */
	function onCreateRequest( index )
	{
		var ChSel = CharSelect.getUI();
		var ChCre = CharCreate.getUI();
		_creationSlot = index;
		ChSel.remove();
		ChCre.setAccountSex( Session.Sex );
		ChCre.onCharCreationRequest = onCharCreationRequest;
		ChCre.onExitRequest = function(){
			ChCre.remove();
			ChSel.append();
		};
		ChCre.append();
	}


	/**
	 * User want to create a character, send data to server
	 *
	 * @param {string} name
	 * @param {number} Str - strength stat
	 * @param {number} Agi - agility stat
	 * @param {number} Vit - vitality stat
	 * @param {number} Int - intelligence stat
	 * @param {number} Dex - dexterity stat
	 * @param {number} Luk - luck stat
	 * @param {number} hair - hair style
	 * @param {number} color - hair color
	 * @param {number} job - job
	 * @param {number} sex - sex
	 */
	function onCharCreationRequest( name, Str, Agi, Vit, Int, Dex, Luk, hair, color, job, sex )
	{
		var pkt;

		// Old Packet required stats
		if (PACKETVER.value < 20120307) {
			pkt = new PACKET.CH.MAKE_CHAR();
			pkt.Str  = Str;
			pkt.Agi  = Agi;
			pkt.Vit  = Vit;
			pkt.Int  = Int;
			pkt.Dex  = Dex;
			pkt.Luk  = Luk;
		}
		else if ( ( PACKETVER.value >= 20120307 ) && ( PACKETVER.value < 20151001 ) ) {
			pkt = new PACKET.CH.MAKE_CHAR2();
		}
		else {
			pkt = new PACKET.CH.MAKE_CHAR3();
		}

		pkt.name    = name;
		pkt.head    = hair;
		pkt.headPal = color;
		pkt.CharNum = _creationSlot;
		pkt.Job = job;
		pkt.Sex = sex;
		Network.sendPacket(pkt);
	}


	/**
	 * Success to create a character
	 *
	 * @param {object} pkt - PACKET.HC.ACCEPT_MAKECHAR_NEO_UNION
	 * @param {object} pkt - PACKET.HC.ACCEPT_MAKECHAR
	 */
	function onCreationSuccess( pkt )
	{
		CharCreate.getUI().remove();
		var ChSel = CharSelect.getUI();
		ChSel.addCharacter(pkt.charinfo);
		ChSel.append();
	}


	/**
	 * Fail to create a character
	 *
	 * @param {object} pkt - PACKET.HC.REFUSE_MAKECHAR
	 */
	function onCreationFail( pkt )
	{
		var msg_id;

		switch (pkt.ErrorCode) {
			case 0x00: msg_id =   10;  break; // 'Charname already exists'
			case 0x01: msg_id =  298;  break; // 'You are underaged'
			case 0x02: msg_id = 1272;  break; // 'Symbols in Character Names are forbidden'
			case 0x03: msg_id = 1355;  break; // 'You are not elegible to open the Character Slot.'
			default:
			case 0xFF: msg_id =   11;  break; // 'Char creation denied'
		}

		UIManager.showMessageBox( DB.getMessage(msg_id), 'ok' );
	}

	function onPincodeCheckRequest(pincode)
	{
		var pkt;

		pkt = new PACKET.CH.PINCODE_CHECK();
		pkt.AID = Session.AID;
		pkt.PINCODE = pincode;

		Network.sendPacket(pkt);
	}

	function onPincodeCheckSuccess(pkt) {
		PincodeWindow.remove();
	}

	/**
	 * User ask to connect with its player
	 *
	 * @param {object} entity to connect with
	 */
	function onConnectRequest( entity )
	{
		// Play sound
		Sound.play('\xB9\xF6\xC6\xB0\xBC\xD2\xB8\xAE.wav');

		CharSelect.getUI().remove();
		UIManager.getComponent('WinLoading').append();
		Session.Character = entity;

		var pkt = new PACKET.CH.SELECT_CHAR();
		pkt.CharNum = entity.CharNum;
		Network.sendPacket(pkt);
	}


	/**
	 * Player selection successful, get mapserver information to connect
	 *
	 * @param {object} pkt - PACKET.HC.NOTIFY_ZONESVR
	 */
	function onReceiveMapInfo( pkt )
	{
		Session.GID = pkt.GID;
		MapEngine.init( pkt.addr.ip, pkt.addr.port, pkt.mapName);
	}


	// TODO: Add support for captcha, rename, changeslot and pincode.
	/*
	 * Captcha
	 *
	 * S 07e5 PACKET.CH.ENTER_CHECKBOT - Request for the captcha ?
	 * S 07e7 PACKET.CH.CHECKBOT - Send code
	 * R 07e8 PACKET.HC.CHECKBOT - image url ?
	 * R 07e9 PACKET.HC.CHECKBOT_RESULT - Result for captcha
	 */

	/*
	 * Rename (http://ragnarok.levelupgames.ph/main/new-loki-server-merge-faq/)
	 *
	 * S 08fc <char ID>.l <new name>.24B (new one) - Ask if valid
	 * S 028d PACKET.CH.REQ_IS_VALID_CHARNAME - Ask if valid
	 * R 028e PACKET.HC.ACK_IS_VALID_CHARNAME - Result
	 * S 028f PACKET.CH.REQ_CHANGE_CHARNAME (confirm)
	 */

	/*
	 * Change slot (http://ragnarok.levelupgames.ph/main/new-loki-server-merge-faq/)
	 *
	 * S 08d4 <from>.W <to>.W <unk>.W
	 * R 08d5 <len>.W <success>.W <unk>.W
	 */

	/*
	 * Pincode
	 *
	 * S 08b8 <AID>.L <data>.4B - check PIN
	 * S 08c5 <AID>.L <data>.4B - request for PIN button ?
	 * S 08be <AID>.L <old>.4B <new>.4B - change PIN
	 * S 08ba <AID>.L <new>.4B - set PIN
	 * R 08b9 <seed>.L <AID>.L <state>.W
	 *	State:
	 *	0 = pin is correct
	 *	1 = ask for pin - client sends 0x8b8
	 *	2 = create new pin - client sends 0x8ba
	 *	3 = pin must be changed - client 0x8be
	 *	4 = create new pin ?? - client sends 0x8ba
	 *	5 = client shows msgstr(1896)
	 *	6 = client shows msgstr(1897) Unable to use your KSSN number
	 *	7 = char select window shows a button - client sends 0x8c5
	 *	8 = pincode was incorrect
	 */


	/**
	 * Export
	 */
	return {
		init:   init,
		reload: reload
	};
});
