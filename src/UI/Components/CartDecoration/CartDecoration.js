/**
 * UI/Components/CartDecoration/CartDecoration.js
 *
 * Cart Decoration (MC_CARTDECORATE) skill UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import Renderer from 'Renderer/Renderer.js';
import Entity from 'Renderer/Entity/Entity.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import htmlText from './CartDecoration.html?raw';
import cssText from './CartDecoration.css?raw';

/**
 * Create Component
 */
const CartDecoration = new UIComponent('CartDecoration', htmlText, cssText);

/**
 * @var {object} loaded cart sprite data keyed by cart type id
 */
const _carts = {};
const _layerEntity = new Entity();

/**
 * @var {number} identity sent by server
 */
let _identity = 0;

/**
 * Decorative cart type IDs
 */
const CART_TYPES = [10, 11, 12];

/**
 * Initialize UI
 */
CartDecoration.init = function init() {
	const carts = this.ui.find('.cart');

	this.ui.css({
		top: (Renderer.height - 100) / 2.0,
		left: (Renderer.width - 255) / 2.0
	});

	this.ui.find('.titlebar .close').click(() => {
		CartDecoration.ui.hide();
		Renderer.stop(render);
	});
	this.draggable(this.ui.find('.titlebar'));

	carts.addClass('event_add_cursor');
	carts.on('click', function (event) {
		onCartSelected(parseInt(event.currentTarget.getAttribute('data-id'), 10));
	});

	preloadCartData();
};

/**
 * Pre-load sprite & action data for decorative carts
 */
function preloadCartData() {
	for (const id of CART_TYPES) {
		const path = DB.getCartPath(id);
		Client.loadFiles([path + '.spr', path + '.act'], (spr, act) => {
			_carts[id] = { spr, act };
		});
	}
}

/**
 * @param {number} type - cart type id
 */
function onCartSelected(type) {
	if (!CART_TYPES.includes(type)) {
		return;
	}

	const pkt = new PACKET.CZ.SELECTCART();
	pkt.identity = _identity;
	pkt.type = type;
	Network.sendPacket(pkt);

	CartDecoration.ui.hide();
	Renderer.stop(render);
}

/**
 * Append to body
 */
CartDecoration.onAppend = function onAppend() {
	this.ui.hide();
	preloadCartData();
};

/**
 * @param {object} pkt - parsed ZC_SELECTCART packet
 */
CartDecoration.onSelectCart = function onSelectCart(pkt) {
	_identity = pkt.identity;

	const allCarts = CartDecoration.ui.find('.cart');
	allCarts.hide();

	const advertised = pkt.typeList && pkt.typeList.length ? pkt.typeList : CART_TYPES;
	for (const type of advertised) {
		CartDecoration.ui.find(`.cart[data-id='${type}']`).show();
	}

	CartDecoration.ui.show();
	Renderer.stop(render);
	Renderer.render(render);
};

/**
 * Remove component
 */
CartDecoration.onRemove = function onRemove() {
	Renderer.stop(render);
};

CartDecoration.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
		this.ui.hide();
		Renderer.stop(render);
	}
};

/**
 * Pick layers from action file
 */
function pickLayers(act, actionId) {
	const a = act.actions[actionId];
	if (!a || !a.animations || !a.animations.length) {
		return null;
	}
	return a.animations[(a.animations.length / 2) | 0].layers;
}

/**
 * Draw a cart action to a canvas context
 */
function drawActionToCanvas(ctx, act, spr, actionId, x, y) {
	const layers = pickLayers(act, actionId);
	if (!layers) {
		return;
	}
	SpriteRenderer.bind2DContext(ctx, x, y);
	for (let i = 0; i < layers.length; i++) {
		_layerEntity.renderLayer(layers[i], spr, spr, 1.0, [0, 0], false);
	}
}

/**
 * Render loop
 */
function render() {
	const canvases = CartDecoration.ui.find('.canvas:visible');

	canvases.each(function () {
		const id = parseInt(this.getAttribute('data-id'), 10);
		const data = _carts[id];

		if (!data || !data.spr || !data.act) {
			return;
		}

		const ctx = this.getContext('2d');
		ctx.clearRect(0, 0, this.width, this.height);
		drawActionToCanvas(ctx, data.act, data.spr, 0, this.width / 2, this.height + 10);
	});
}

/**
 * Create component and export it
 */
export default UIManager.addComponent(CartDecoration);
