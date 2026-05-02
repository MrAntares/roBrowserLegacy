/**
 * UI/Components/WinLoginBackground/WinLoginBackground.js
 *
 * Login Background Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */

import WinLoginBackground from './WinLogin/WinLoginBackground.js';
import WinLoginBackgroundV2 from './WinLoginV2/WinLoginV2Background.js';
import WinLoginBackgroundV3 from './WinLoginV3/WinLoginV3Background.js';
import UIVersionManager from 'UI/UIVersionManager.js';

const publicName = 'WinLoginBackground';

const versionInfo = {
	default: WinLoginBackground,
	common: {
		20221207: WinLoginBackgroundV3,
		20181114: WinLoginBackgroundV2
	},
	re: {},
	prere: {}
};

const Controller = UIVersionManager.getUIController(publicName, versionInfo);

export default Controller;
