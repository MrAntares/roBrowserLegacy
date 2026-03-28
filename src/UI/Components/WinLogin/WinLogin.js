/**
 * UI/Components/WinLogin/WinLogin.js
 *
 * Login Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */

import WinLogin from './WinLogin/WinLogin.js';
import WinLoginV2 from './WinLoginV2/WinLoginV2.js';
import UIVersionManager from 'UI/UIVersionManager.js';

const publicName = 'WinLogin';

const versionInfo = {
	default: WinLogin,
	common: {
		20181114: WinLoginV2
	},
	re: {},
	prere: {}
};

const Controller = UIVersionManager.getUIController(publicName, versionInfo);

export default Controller;
