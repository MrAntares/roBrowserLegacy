/**
 * UI/Components/CashShopIcon/CashShopIcon.js
 *
 * CashShop Icon
 *
 * @author Alisonrag
 *
 */

import CashShop from 'UI/Components/CashShop/CashShop.js';
import Network from 'Network/NetworkManager.js';
import PACKETVER from 'Network/PacketVerManager.js';
import PACKET from 'Network/PacketStructure.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './CashShopIcon.html?raw';
import cssText from './CashShopIcon.css?raw';

/**
 * Create Component
 */
const CashShopIcon = new UIComponent('CashShopIcon', htmlText, cssText);

/**
 * Apply preferences once append to body
 */
CashShopIcon.onAppend = function OnAppend() {
	this.ui.find('.cashshop-icon').on('mousedown', stopPropagation).on('click', this.onClickCashShopIcon);
};

CashShopIcon.onClickCashShopIcon = function onClickCashShopIcon() {
	if (CashShop.ui.is(':visible')) {
		const pkt = new PACKET.CZ.CASH_SHOP_CLOSE();
		Network.sendPacket(pkt);
		CashShop.remove();
	} else {
		if (PACKETVER.value >= 20191224) {
			const pkt = new PACKET.CZ.SE_CASHSHOP_OPEN2();
			pkt.tab = 0;
			Network.sendPacket(pkt);
		} else {
			const pkt = new PACKET.CZ.SE_CASHSHOP_OPEN1();
			Network.sendPacket(pkt);
		}
	}
};

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
export default UIManager.addComponent(CashShopIcon);
