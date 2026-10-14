/**
 * UI/Components/MiniMap/MiniMap.js
 *
 * MiniMap windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */

import MiniMap from './MiniMap/MiniMap.js';
import MiniMapV2 from './MiniMapV2/MiniMapV2.js';
import UIVersionManager from 'UI/UIVersionManager.js';

const publicName = 'MiniMap';
const versionInfo = {
	default: MiniMap,
	common: {
		20180124: MiniMapV2
	},
	re: {},
	prere: {}
};

const Controller = UIVersionManager.getUIController(publicName, versionInfo);

// Own property on the controller: not forwarded to the active UI
// (forwarding would overwrite the implementation and recurse).
Object.defineProperty(Controller, 'getMemberColor', {
	value: function getMemberColor(key) {
		const ui = Controller.getUI();
		return ui && typeof ui.getMemberColor === 'function' ? ui.getMemberColor(key) : 'white';
	},
	writable: true,
	configurable: true
});

export default Controller;
