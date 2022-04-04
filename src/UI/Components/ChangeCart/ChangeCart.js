/**
 * UI/Components/Equipment/Equipment.js
 *
 * Chararacter Equipment window
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
	var Network          = require('Network/NetworkManager');
	var PACKET           = require('Network/PacketStructure');
	var jQuery             = require('Utils/jquery');
	var Client             = require('Core/Client');
	var Preferences        = require('Core/Preferences');
	var Session            = require('Engine/SessionStorage');
	var Renderer           = require('Renderer/Renderer');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var ChatBox        = require('UI/Components/ChatBox/ChatBox');
	var ChatRoom       = require('UI/Components/ChatRoom/ChatRoom');
	var htmlText           = require('text!./ChangeCart.html');
	var cssText            = require('text!./ChangeCart.css');


	/**
	 * Create Component
	 */
	var ChangeCart = new UIComponent( 'ChangeCart', htmlText, cssText );


	/**
	 * @var {Preference} window preferences
	 */
	var _preferences = Preferences.get('ChangeCart', {
		show:     false,
	}, 1.0);


	/**
	 * Initialize UI
	 */
	ChangeCart.init = function init()
	{
		var ui = this.ui;

		ui.css({
			top:  (Renderer.height - 100) / 2.0,
			left: (Renderer.width  - 400) / 2.0
		});


		this.ui.find('.titlebar .close').click(function(){ ChangeCart.ui.hide(); });
		this.draggable(this.ui.find('.titlebar'));

		this.ui.find('.cart').click(onCart);
		this.ui.find('.cart1').click(onCart1);
		this.ui.find('.cart2').click(onCart2);
		this.ui.find('.cart3').click(onCart3);
		this.ui.find('.cart4').click(onCart4);
		this.ui.find('.cart5').click(onCart5);
		this.ui.find('.cart6').click(onCart6);
		this.ui.find('.cart7').click(onCart7);
		this.ui.find('.cart8').click(onCart8);

		this.ui.find('.cart').hide();
		this.ui.find('.cart1').hide();
		this.ui.find('.cart2').hide();
		this.ui.find('.cart3').hide();
		this.ui.find('.cart4').hide();
		this.ui.find('.cart5').hide();
		this.ui.find('.cart6').hide();
		this.ui.find('.cart7').hide();
		this.ui.find('.cart8').hide();
	};

	function onCart()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  1*/)
		{
			return;
		}

		var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 1;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart1()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  2*/)
		{
			return;
		}
		var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 2;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart2()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  3*/)
		{
			return;
		}
        var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 3;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart3()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  4*/)
		{
			return;
		}
        var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 4;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart4()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  5*/)
		{
			return;
		}
        var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 5;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart5()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  6*/)
		{
			return;
		}
        var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 6;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart6()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  7*/)
		{
			return;
		}
        var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 7;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart7()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  8*/)
		{
			return;
		}
        var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 8;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	function onCart8()
	{
		if(Session.Entity.hasCart == false/* || Session.Entity.CartNum ==  9*/)
		{
			return;
		}
        var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = 9;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	/**
	 * Append to body
	 */
	ChangeCart.onAppend = function onAppend()
	{
		if (!_preferences.show) {
			this.ui.hide();
		}

		this.ui.find('.cart').hide();
		this.ui.find('.cart1').hide();
		this.ui.find('.cart2').hide();
		this.ui.find('.cart3').hide();
		this.ui.find('.cart4').hide();
		this.ui.find('.cart5').hide();
		this.ui.find('.cart6').hide();
		this.ui.find('.cart7').hide();
		this.ui.find('.cart8').hide();

		if(Session.Character.level > 131)
        {
			this.ui.find('.cart8').show();
		}

		if(Session.Character.level > 121)
        {
			this.ui.find('.cart7').show();
		}

		if(Session.Character.level > 111)
        {
			this.ui.find('.cart6').show();
		}

		if(Session.Character.level > 100)
        {
			this.ui.find('.cart5').show();
		}

       	if(Session.Character.level > 90)
        {
			this.ui.find('.cart4').show();
		}

		if(Session.Character.level > 80)
		{
			this.ui.find('.cart3').show();
		}

		if(Session.Character.level > 65)
		{
			this.ui.find('.cart2').show();
		}

		if(Session.Character.level > 40)
		{
			this.ui.find('.cart1').show();
		}

		this.ui.find('.cart').show();
	};

	ChangeCart.onChangeCartSkill = function onChangeCartSkill()
	{
		if(Session.Entity.hasCart == false)
		{
			return;
		}

		this.ui.show();

		var msg = "Change Cart!!";

		if (ChatRoom.isOpen) {
			ChatRoom.message(msg);
			return;
		}

		ChatBox.addText( msg, ChatBox.TYPE.PUBLIC | ChatBox.TYPE.SELF );
		if (Session.Entity) {
			Session.Entity.dialog.set( msg );
		}
	};


	ChangeCart.onLevelUp = function onLevelUp(blvl)
	{
		if(Session.Entity.hasCart == false)
		{
			return;
		}

		this.ui.find('.cart').hide();
		this.ui.find('.cart1').hide();
		this.ui.find('.cart2').hide();
		this.ui.find('.cart3').hide();
		this.ui.find('.cart4').hide();
		this.ui.find('.cart5').hide();
		this.ui.find('.cart6').hide();
		this.ui.find('.cart7').hide();
		this.ui.find('.cart8').hide();


		if(blvl > 131)
        {
			this.ui.find('.cart8').show();
		}

		if(blvl > 121)
        {
			this.ui.find('.cart7').show();
		}

		if(blvl > 111)
        {
			this.ui.find('.cart6').show();
		}

		if(blvl > 100)
        {
			this.ui.find('.cart5').show();
		}

       	if(blvl > 90)
        {
			this.ui.find('.cart4').show();
		}

		if(blvl > 80)
		{
			this.ui.find('.cart3').show();
		}

		if(blvl > 65)
		{
			this.ui.find('.cart2').show();
		}

		if(blvl > 40)
		{
			this.ui.find('.cart1').show();
		}

		this.ui.find('.cart').show();

	};


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(ChangeCart);
});
