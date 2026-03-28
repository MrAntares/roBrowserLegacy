/**
 * UI/Components/CardIllustration/CardIllustration.js
 *
 * Card image
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './CardIllustration.html?raw';
import cssText from './CardIllustration.css?raw';

/**
 * Create Component
 */
const CardIllustration = new UIComponent('CardIllustration', htmlText, cssText);

/**
 * Initialize events
 */
CardIllustration.init = function init() {
	this.ui.find('.close').click(this.remove.bind(this));
	this.draggable();
};

/**
 * Show image
 *
 * @param {object} item
 */
CardIllustration.setCard = function setCard(item) {
	this.ui.find('.titlebar .text').text(item.identifiedDisplayName);
	this.ui.find('.content').css('backgroundImage', 'none');

	Client.loadFile(
		DB.INTERFACE_PATH + 'cardbmp/' + item.illustResourcesName + '.bmp',
		function (data) {
			this.ui.find('.content').css('backgroundImage', 'url(' + data + ')');
		}.bind(this)
	);
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(CardIllustration);
