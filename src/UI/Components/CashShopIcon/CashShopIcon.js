/**
 * UI/Components/CashShopIcon/CashShopIcon.js
 *
 * CashShop Icon
 *
 * @author Alisonrag
 *
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var CashShop = require('UI/Components/CashShop/CashShop');
	var Network = require('Network/NetworkManager');
	var PACKETVER = require('Network/PacketVerManager');
	var PACKET = require('Network/PacketStructure');
	var Network = require('Network/NetworkManager');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./CashShopIcon.html');
	var cssText = require('text!./CashShopIcon.css');

	/**
   * Create Component
   */
	var CashShopIcon = new UIComponent('CashShopIcon', htmlText, cssText);

	/**
	 * Apply preferences once append to body
	 */
	CashShopIcon.onAppend = function OnAppend() {
		this.ui.find('.cashshop-icon').on('mousedown', stopPropagation).on('click', this.onClickCashShopIcon);
	};

	CashShopIcon.onClickCashShopIcon = function onClickCashShopIcon() {
		if (CashShop.ui.is(':visible')) {
			var pkt = new PACKET.CZ.CASH_SHOP_CLOSE();
			Network.sendPacket(pkt);
			CashShop.remove();
		} else {
			if (PACKETVER.value >= 20191224) {
				var pkt = new PACKET.CZ.SE_CASHSHOP_OPEN2();
				pkt.tab = 0;
				Network.sendPacket(pkt);
			} else {
				var pkt = new PACKET.CZ.SE_CASHSHOP_OPEN1();
				Network.sendPacket(pkt);
			}
		}
	}

	/**
 * Stop event propagation
 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(CashShopIcon);
});

