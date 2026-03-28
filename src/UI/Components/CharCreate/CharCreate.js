/**
 * UI/Components/CharCreate/CharCreate.js
 *
 * Character Creation
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
'use strict';

import CharCreate from './CharCreate/CharCreate';
import CharCreateV2 from './CharCreatev2/CharCreatev2';
import CharCreateV3 from './CharCreatev3/CharCreatev3';
import CharCreateV4 from './CharCreatev4/CharCreatev4';
import UIVersionManager from 'UI/UIVersionManager';

const publicName = 'CharCreate';
const versionInfo = {
	default: CharCreate,
	common: {
		20180124: CharCreateV4,
		20151001: CharCreateV3,
		20120307: CharCreateV2
	},
	re: {},
	prere: {}
};

const Controller = UIVersionManager.getUIController(publicName, versionInfo);
export default Controller;
