/**
 * UI/Components/Equipment/Equipment.js
 *
 * Chararacter Equipment window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var Preferences = require('Core/Preferences');
	var Session = require('Engine/SessionStorage');
	var Renderer = require('Renderer/Renderer');
	var Entity = require('Renderer/Entity/Entity');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var KEYS = require('Controls/KeyEventHandler');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var ChatRoom = require('UI/Components/ChatRoom/ChatRoom');
	var Client = require('Core/Client');
	var DB = require('DB/DBManager');
	var htmlText = require('text!./ChangeCart.html');
	var cssText = require('text!./ChangeCart.css');

	// Config
	var CART_LIMIT = 13;

	/**
	 * Create Component
	 */
	var ChangeCart = new UIComponent('ChangeCart', htmlText, cssText);

	/**
	 * @var {object} data info
	 */
	var _carts = {};
	var _layerEntity = new Entity();

	/**
	 * Initialize UI
	 */
	ChangeCart.init = function init() {
		var carts = this.ui.find('.cart');
		var canvases = this.ui.find('.canvas');

		this.ui.css({
			top: (Renderer.height - 100) / 2.0,
			left: (Renderer.width - 400) / 2.0
		});

		this.ui.find('.titlebar .close').click(function () {
			ChangeCart.ui.hide();
		});
		this.draggable(this.ui.find('.titlebar'));

		carts.hide();
		carts.addClass('event_add_cursor');
		carts.on('click', function (event) {
			onCart(event.target.getAttribute('data-id'));
		});

		// Pre-load carts
		loadCartData();
	};

	/**
	 * Load Carts assets
	 */
	function loadCartData() {
		var i;
		for (i = 0; i <= CART_LIMIT; ++i) {
			(function (id) {
				var path = DB.getCartPath(id);
				Client.loadFiles([path + '.spr', path + '.act'], function (spr, act) {
					_carts[id] = {
						spr: spr,
						act: act
					};
				});
			})(i);
		}
	}

	/**
	 * Change cart (Change cart packet IDs are not the same as global cart IDs!!)
	 */
	function onCart(num) {
		if (Session.Entity.hasCart == false || num < 0 || num > 8) {
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
	ChangeCart.onAppend = function onAppend() {
		this.ui.hide();
		loadCartData();
	};

	ChangeCart.onChangeCartSkill = function onChangeCartSkill() {
		if (Session.Entity.hasCart == false) {
			return;
		}

		this.ui.show();

		var msg = 'Change Cart!!';

		if (ChatRoom.isOpen) {
			ChatRoom.message(msg);
			return;
		}

		ChatBox.addText(msg, ChatBox.TYPE.PUBLIC | ChatBox.TYPE.SELF, ChatBox.FILTER.PUBLIC_LOG);
		if (Session.Entity) {
			Session.Entity.dialog.set(msg);
		}

		updateList(Session.Character.level);
		Renderer.render(render);
	};

	ChangeCart.onLevelUp = function onLevelUp(blvl) {
		updateList(blvl);
	};

	function updateList(blvl) {
		if (Session.Entity.hasCart == false) {
			return;
		}

		ChangeCart.ui.find('.cart').hide();
		//stopAllCart();

		if (blvl > 131) {
			ChangeCart.ui.find(".cart[data-id='9']").show();
		}
		if (blvl > 121) {
			ChangeCart.ui.find(".cart[data-id='8']").show();
		}
		if (blvl > 111) {
			ChangeCart.ui.find(".cart[data-id='7']").show();
		}
		if (blvl > 100) {
			ChangeCart.ui.find(".cart[data-id='6']").show();
		}
		if (blvl > 90) {
			ChangeCart.ui.find(".cart[data-id='5']").show();
		}
		if (blvl > 80) {
			ChangeCart.ui.find(".cart[data-id='4']").show();
		}
		if (blvl > 65) {
			ChangeCart.ui.find(".cart[data-id='3']").show();
		}
		if (blvl > 40) {
			ChangeCart.ui.find(".cart[data-id='2']").show();
		}

		ChangeCart.ui.find(".cart[data-id='1']").show();
	}

	/**
	 * Remove component from HTML
	 * Stop rendering
	 */
	ChangeCart.onRemove = function onRemove() {
		Renderer.stop(render);
	};

	ChangeCart.onKeyDown = function onKeyDown(event) {
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
			this.hide();
		}
	};

	/**
	 * Pick layers from act
	 * @param {Object} act
	 * @param {number} actionId
	 * @returns {Object[]}
	 */
	function pickLayers(act, actionId) {
		var a = act.actions[actionId];
		if (!a || !a.animations || !a.animations.length) {
			return null;
		}
		return a.animations[(a.animations.length / 2) | 0].layers;
	}

	/**
	 * Draw action to canvas
	 */
	function drawActionToCanvas(ctx, act, spr, actionId, x, y) {
		var layers = pickLayers(act, actionId);
		if (!layers) {
			return;
		}

		// Gravity fonts: no anchor correction
		SpriteRenderer.bind2DContext(ctx, x, y);

		for (var i = 0; i < layers.length; i++) {
			_layerEntity.renderLayer(layers[i], spr, spr, 1.0, [0, 0], false);
		}
	}

	/**
	 * Rendering the Carts
	 */
	function render(tick) {
		var canvases = ChangeCart.ui.find('.canvas:visible');

		canvases.each(function () {
			var id = this.getAttribute('data-id');
			var data = _carts[id];

			if (!data || !data.spr || !data.act) {
				return;
			}

			var ctx = this.getContext('2d');
			ctx.clearRect(0, 0, this.width, this.height);

			// Cart is rendered with Action 0 (Idle)
			// Direction depends on view, but for UI we can pick a specific one, e.g. 0 or 4
			// Original code used direction 5 (South-East?) for some reason, standard is usually 0
			// Let's use 0 (Camera.direction + entity.direction + 8 % 8) logic from EntityRender?
			// Action 0 is Idle.
			// Directions: 0=S, 1=SW, 2=W, 3=NW, 4=N, 5=NE, 6=E, 7=SE
			// Let's pick 0 for now (South facing)
			// Actually let's use what matches the original code attempt: direction 5
			// Action * 8 + Direction
			// Action 0, Direction 5? Or Direction 0?
			// EntityRender uses: (entity.action * 8 + ((Camera.direction + entity.direction + 8) % 8)) % act.actions.length
			// Let's try idle (0) and direction (0) -> 0.
			// Or maybe direction 0 looks best in UI.
			var actionId = 0; // (0 * 8 + 0)

			drawActionToCanvas(ctx, data.act, data.spr, actionId, this.width / 2, this.height + 10);
		});
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(ChangeCart);
});
