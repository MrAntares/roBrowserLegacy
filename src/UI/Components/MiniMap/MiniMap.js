/**
 * UI/Components/MiniMap/MiniMap.js
 *
 * MiniMap windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
'use strict';

import MiniMap from './MiniMap/MiniMap';
import MiniMapV2 from './MiniMapV2/MiniMapV2';
import UIVersionManager from 'UI/UIVersionManager';

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

/**
 * Proxy for getMemberColor
 */
Controller.getMemberColor = function getMemberColor(key) {
	const ui = Controller.getUI();
	return ui && ui.getMemberColor ? ui.getMemberColor(key) : 'white';
};
export default Controller;
