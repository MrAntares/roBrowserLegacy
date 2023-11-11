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
	var Network     = require('Network/NetworkManager');
	var PACKET      = require('Network/PacketStructure');
	var jQuery      = require('Utils/jquery');
	var Client      = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Session     = require('Engine/SessionStorage');
	var Renderer    = require('Renderer/Renderer');
	var Entity      = require('Renderer/Entity/Entity');
	var SpriteRenderer  = require('Renderer/SpriteRenderer');
	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ChatBox     = require('UI/Components/ChatBox/ChatBox');
	var ChatRoom    = require('UI/Components/ChatRoom/ChatRoom');
	var htmlText    = require('text!./ChangeCart.html');
	var cssText     = require('text!./ChangeCart.css');


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
	 * @var {object} model info
	 */
	var _models = {};


	/**
	 * Initialize UI
	 */
	ChangeCart.init = function init()
	{
		var carts = this.ui.find('.cart');
		var canvases = this.ui.find('.canvas');
		
		this.ui.css({
			top:  (Renderer.height - 100) / 2.0,
			left: (Renderer.width  - 400) / 2.0
		});


		this.ui.find('.titlebar .close').click(function(){ ChangeCart.ui.hide(); });
		this.draggable(this.ui.find('.titlebar'));

		carts.hide();
		carts.addClass('event_add_cursor');
		carts.on('click',     function(event){ onCart(event.target.getAttribute('data-id')); })
			.on('mouseover', function(event){_models[event.target.getAttribute('data-id')].entity.action = 1;})
			.on('mouseout',  function(event){_models[event.target.getAttribute('data-id')].entity.action = 0;});
			
		canvases.each((idx, canvas) => {
			var cartid = canvas.getAttribute("data-id");
			var model = {
				entity: new Entity(),
				ctx:    canvas.getContext('2d'),
				render: false,
				tick:   0
			};
			model.entity.set({
				type: Entity.TYPE_EFFECT,
				action: 0,
				direction: 5
			});
			
			model.entity.hasCart = true;
			model.entity.CartNum = cartid;
			model.entity.hideShadow = true;
			_models[cartid] = model;
		});
	};

	/**
	 * Change cart (Change cart packet IDs are not the same as global cart IDs!!)
	 */
	function onCart(num)
	{
		if(Session.Entity.hasCart == false || num<0 || num>8)
		{
			return;
		}

		var pkt = new PACKET.CZ.REQ_CHANGECART();
		pkt.num = num;
		Network.sendPacket(pkt);
		ChangeCart.ui.hide();
	}

	/**
	 * Append to body
	 */
	ChangeCart.onAppend = function onAppend()
	{
		this.ui.hide();
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

		ChatBox.addText( msg, ChatBox.TYPE.PUBLIC | ChatBox.TYPE.SELF, ChatBox.FILTER.PUBLIC_LOG );
		if (Session.Entity) {
			Session.Entity.dialog.set( msg );
		}
		
		updateList(Session.Character.level);
		Renderer.render(render);
	};

	ChangeCart.onLevelUp = function onLevelUp(blvl)
	{
		updateList(blvl);
	};
	
	function updateList(blvl){
		if(Session.Entity.hasCart == false)
		{
			return;
		}

		ChangeCart.ui.find('.cart').hide();
		stopAllCart();

		if(blvl > 131) { ChangeCart.ui.find(".cart[data-id='9']").show(); _models['9'].render = true; }
		if(blvl > 121) { ChangeCart.ui.find(".cart[data-id='8']").show(); _models['8'].render = true; }
		if(blvl > 111) { ChangeCart.ui.find(".cart[data-id='7']").show(); _models['7'].render = true; }
		if(blvl > 100) { ChangeCart.ui.find(".cart[data-id='6']").show(); _models['6'].render = true; }
       	if(blvl > 90)  { ChangeCart.ui.find(".cart[data-id='5']").show(); _models['5'].render = true; }
		if(blvl > 80)  { ChangeCart.ui.find(".cart[data-id='4']").show(); _models['4'].render = true; }
		if(blvl > 65)  { ChangeCart.ui.find(".cart[data-id='3']").show(); _models['3'].render = true; }
		if(blvl > 40)  { ChangeCart.ui.find(".cart[data-id='2']").show(); _models['2'].render = true; }

		ChangeCart.ui.find(".cart[data-id='1']").show();
		_models['1'].render = true;
	}
	
	/**
	 * Remove component from HTML
	 * Stop rendering
	 */
	ChangeCart.onRemove = function onRemove()
	{
		stopAllCart();
		Renderer.stop(render);
	};
	
	/**
	 * Rendering the Carts
	 */
	function render( tick )
	{
		Object.entries(_models).forEach((entry) => {
			const [key, model] = entry;
			SpriteRenderer.bind2DContext(model.ctx, Math.floor(model.ctx.canvas.width), model.ctx.canvas.height);
			model.ctx.clearRect(0, 0, model.ctx.canvas.width, model.ctx.canvas.height );
			model.entity.renderEntity();
		});
	}
	
	function stopAllCart(){
		Object.entries(_models).forEach((entry) => {
			const [key, model] = entry;
			model.render = false;
		});
	}


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(ChangeCart);
});
