/**
 * UI/Components/Vending/VendingModelMessage/VendingModelMessage.js
 *
 * VendingModelMessage windows
 *
 * @author Francisco Wallison
 */
'use strict';

import DB from 'DB/DBManager';
import Renderer from 'Renderer/Renderer';
import UIManager from 'UI/UIManager';
import UIComponent from 'UI/UIComponent';
import htmlText from './VendingModelMessage.html?raw';
import cssText from './VendingModelMessage.css?raw';

/**
	 * Create VendingModelMessage namespace
	 */
	const VendingModelMessage = new UIComponent('VendingModelMessage', htmlText, cssText);

	/**
	 * Initialize UI
	 */
	VendingModelMessage.init = function init() {
		// Show at center.
		this.ui.css({
			top: (Renderer.height - 200) / 2,
			left: (Renderer.width - 200) / 2
		});

		this.ui.find('.ok').click(function (e) {
			e.stopImmediatePropagation();
			VendingModelMessage.onRemove();
		});
		this.draggable(this.ui.find('.titlebar'));
	};

	VendingModelMessage.setInit = function setInit(numMessage) {
		VendingModelMessage.append();
		VendingModelMessage.ui.show();
		const messageText = DB.getMessage(numMessage);
		VendingModelMessage.ui.find('.message').text(messageText);
	};

	VendingModelMessage.onRemove = function onRemove() {
		if (this.ui == undefined) {
			return;
		}

		this.ui.hide();
	};

	/**
	 * Create component based on view file and export it
	 */
export default UIManager.addComponent(VendingModelMessage);