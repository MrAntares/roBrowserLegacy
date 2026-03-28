/**
 * UI/Components/MakeItemSelection/ItemConvertSelection/MakeModelMessage/MakeModelMessage.js
 *
 * MakeModelMessage windows
 *
 * @author Francisco Wallison
 */

import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './MakeModelMessage.html?raw';
import cssText from './MakeModelMessage.css?raw';
import ConvertItems from 'UI/Components/MakeItemSelection/ItemConvertSelection/ConvertItems.js';

/**
 * Create MakeModelMessage namespace
 */
const MakeModelMessage = new UIComponent('MakeModelMessage', htmlText, cssText);

/**
 * Initialize UI
 */
MakeModelMessage.init = function init() {
	// Show at center.
	this.ui.css({
		top: (Renderer.height - 200) / 2,
		left: (Renderer.width - 200) / 2
	});

	this.ui.find('.ok').on('click', onSendMaterial);
	this.ui.find('.cancel').on('click', onClose);

	this.draggable(this.ui.find('.titlebar'));
};

function onSendMaterial(event) {
	event.stopImmediatePropagation();
	ConvertItems.validItemSend(true);
}

function onClose(event) {
	event.stopImmediatePropagation();
	ConvertItems.validItemSend(false);
}

/**
 * Create component based on view file and export it
 */
export default UIManager.addComponent(MakeModelMessage);
