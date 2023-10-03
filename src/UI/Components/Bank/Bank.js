/**
 * UI/Components/Bank/Bank.js
 *
 * Bank window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                 = require('DB/DBManager');
	var Network            = require('Network/NetworkManager');
	var PACKET             = require('Network/PacketStructure');
	var KEYS               = require('Controls/KeyEventHandler');
	var jQuery      	   = require('Utils/jquery');
	var Preferences        = require('Core/Preferences');
	var Session            = require('Engine/SessionStorage');
	var Renderer           = require('Renderer/Renderer');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./Bank.html');
	var cssText            = require('text!./Bank.css');
	var ChatBox      	   = require('UI/Components/ChatBox/ChatBox');


	/**
	 * Create Component
	 */
	var Bank = new UIComponent( 'Bank', htmlText, cssText );

	/**
	 *  Max Int
	 */
	var maxInt = 2147483647;

	 /**
	  * @var {Preferences} structure
	  */
	 var _preferences = Preferences.get('Bank', {
		x:        230,
		y:        295
	}, 2.0);

	/**
	 * Initialize UI
	 */
	Bank.init = function init()
	{
		this.draggable();

		const inputDepo = document.querySelector('.depo');
		let isMax = false; // Flag to track if the value is set to MAX

		document.querySelector('.plus').addEventListener('click', function() {
			if (isMax || inputDepo.value === '')
				inputDepo.value = ( 0 + 1);	// reset input value to 0
			else
				inputDepo.value = parseInt(inputDepo.value) + 1;
			isMax = false;
			inputDepo.select();
		});

		document.querySelector('.minus').addEventListener('click', function() {
			if (isMax || inputDepo.value === '')
				inputDepo.value = Math.max( 0 - 1, 0); // reset input value to 0
			else
				inputDepo.value = Math.max(parseInt(inputDepo.value) - 1, 0);
			isMax = false;
			inputDepo.select();
		});

		document.querySelector('.max').addEventListener('click', function() {
			isMax = true;
			inputDepo.value = 'MAX';
			inputDepo.select();
		});

		document.querySelector('.tenmil').addEventListener('click', function() {
			isMax = false;
			inputDepo.value = addValueToInput(inputDepo.value, 10000000);
			inputDepo.select();
		});

		document.querySelector('.onemil').addEventListener('click', function() {
			isMax = false;
			inputDepo.value = addValueToInput(inputDepo.value, 1000000);
			inputDepo.select();
		});

		document.querySelector('.hundtsn').addEventListener('click', function() {
			isMax = false;
			inputDepo.value = addValueToInput(inputDepo.value, 100000);
			inputDepo.select();
		});

		/**
	 	* Update input value
	 	*/
		function addValueToInput(inputValue, addValue) {
			if (isMax && inputValue === 'MAX') return 'MAX';
			
			const currentValue = parseInt(inputValue) || 0;
			if (!isMax)
				return (currentValue + addValue);
		}
		
		document.querySelector('.deposit').addEventListener('click', function() {
			sendDepositRequest(inputDepo.value);
		});

		document.querySelector('.withdraw').addEventListener('click', function() {
			sendWithdrawRequest(inputDepo.value);
		});

		this.ui.find('.close').click(reqCloseBank);
		this.ui.find('.depo').click(selectAllText);
		this.ui.find('.depo').focus();
	};

	/**
	* Input box auto select
	*/
	function selectAllText ()
	{
		var input = Bank.ui.find('.depo');
		input.select();
	}

	/**
	* Check if input value is valid
	* Most checks and error messages were from client
	*/
	function CheckValue ( value )
	{
		var error = Bank.ui.find('.errorupdate');
				
		if (value === '') {	// Input is blank
			if (error)
				error.text ( DB.getMessage(2781) );
			ChatBox.addText( DB.getMessage(2779), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
			return false;
		}

		if (typeof value === 'string' && value !== 'MAX' && !/^\d+$/.test(value)) {	// Input is string other than MAX
			if (error)
				error.text ( DB.getMessage(2782) );
			ChatBox.addText( DB.getMessage(2488), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
			return false;
		}

		if (parseInt(value) <= 0) { // Input is equal or less than 0
			if (error)
				error.text ( DB.getMessage(2784) );
			ChatBox.addText( DB.getMessage(2769), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
			return false;
		}

		if (parseInt(value) > maxInt) {	// Input is higher than max int value
			if (error)
				error.text ( DB.getMessage(2783) );
			ChatBox.addText( DB.getMessage(2768), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
			return false;
		}

		return true;
	}

	/**
	* Send Request to server to deposit
	*/
	function sendDepositRequest ( value )
	{
		var input = Bank.ui.find('.depo');

		if ( CheckValue(value) === false) {
			input.val('');
			return;
		}

		if (value === 'MAX') {	// Input is MAX (Deposit max zeny value)
			var inbank = Bank.ui.find('.inbank.currency').text();
			var getval = parseInt(getIntValueFromFormattedString(inbank));
			if (Session.zeny + getval > maxInt && getval < maxInt)
				value = (parseInt(maxInt) - getval);
			else {
				if (Session.zeny === 0) {
					var error =  Bank.ui.find('.errorupdate');
					if (error)
						error.text( DB.getMessage(2785) );
					ChatBox.addText( DB.getMessage(2770), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
					input.val('');
					return;
				} 
				else {
					value = Session.zeny;
				}
			}
		}

		var pkt = new PACKET.CZ.REQ_BANKING_DEPOSIT();
		pkt.AID = Session.AID;
		pkt.money = value;
		Network.sendPacket( pkt );

		input.val('');
	}

	/**
	* Send Request to server to withdraw
	*/
	function sendWithdrawRequest ( value )
	{
		var input = Bank.ui.find('.depo');
		var error =  Bank.ui.find('.errorupdate');

		if ( CheckValue(value) === false) {
			input.val('');
			return;
		}

		if (value === 'MAX') {
			var inbank = Bank.ui.find('.inbank.currency').text();
			var getval = parseInt(getIntValueFromFormattedString(inbank));
			if (Session.zeny + getval > maxInt && Session.zeny < maxInt)
				value = (parseInt(maxInt) - Session.zeny);
			else if (getval === 0) {
				if (error)
					error.text( DB.getMessage(2785) );
				ChatBox.addText( DB.getMessage(2770), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
				input.val('');
				return;
			}
			else {
				value = getval;
			}
		}

		if (parseInt(Session.zeny) + parseInt(value) > parseInt(maxInt)) {
			if (error)
				error.text( DB.getMessage(2787) );
			ChatBox.addText( DB.getMessage(2459), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG );
			input.val('');
			return;
		}

		var pkt = new PACKET.CZ.REQ_BANKING_WITHDRAW();
		pkt.AID = Session.AID;
		pkt.money = value;
		Network.sendPacket( pkt );

		input.val('');
	}

	/**
	* Get int value from the input box
	*/
	function getIntValueFromFormattedString(formattedString) {
		// Remove commas and 'z' from the string
		const strippedString = formattedString.replace(/,/g, '').replace('z', '');
	
		// Parse the stripped string as an integer
		const intValue = parseInt(strippedString, 10);
	
		// Check if the parsing was successful
		if (!isNaN(intValue)) {
			return intValue;
		} else {
			// Handle the case where parsing fails (e.g., when the input is not a valid integer)
			return null; // Or you can return a default value or handle the error as needed
		}
	}

	/**
	 * Append to body
	 */
	Bank.onAppend = function onAppend()
	{
		// Seems like "EscapeWindow" is execute first, push it before.
		var events = jQuery._data( window, 'events').keydown;
		events.unshift( events.pop() );

		// Apply preferences
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});
		
		var input = Bank.ui.find('.depo');
		input.val('');
		input.focus();
	};

	/**
	 * Key Handler
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	Bank.onKeyDown = function onKeyDown( event )
	{
		if (event.which === KEYS.ESCAPE) {
			event.stopImmediatePropagation();
			reqCloseBank();
			return false;
		}

		return true;
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	Bank.onShortCut = function onShurtCut( key )
	{
		switch (key.cmd) {
			case 'TOGGLE':
				this.toggle();
				break;
		}
	};

	/**
	 * Request to toggle open/close bank
	 */
	Bank.toggle = function toggle()
	{
		if(!(Bank.__active)) {
			reqOpenBank();
		} else {
			reqCloseBank();
		}
	};

	/**
	 * Request to open bank
	 */
	function reqOpenBank ()
	{
		var pkt = new PACKET.CZ.REQ_BANK_OPEN();
		pkt.AID = Session.AID;
		Network.sendPacket( pkt );
	}

	/**
	 * Request to close bank
	 */
	function reqCloseBank ()
	{
		var pkt = new PACKET.CZ.REQ_BANK_CLOSE();
		pkt.AID = Session.AID;
		Network.sendPacket( pkt );
	}

	/**
	 * Remove Bank from window (and so clean up items)
	 */
	Bank.onRemove = function OnRemove()
	{
		// Save preferences
		_preferences.y      =  parseInt(this.ui.css('top'), 10);
		_preferences.x      =  parseInt(this.ui.css('left'), 10);
		_preferences.save();

		//Cleanup
		var error = Bank.ui.find('.errorupdate');
		error.empty();
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(Bank);
});
