/**
 * UI/Components/CharSelect/CharSelect.js
 *
 * Character Selection
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
'use strict';

import CharSelect from './CharSelect/CharSelect';
import CharSelectV2 from './CharSelectV2/CharSelectV2';
import CharSelectV3 from './CharSelectV3/CharSelectV3';
import CharSelectV4 from './CharSelectV4/CharSelectV4';
import UIVersionManager from 'UI/UIVersionManager';

let publicName = 'CharSelect';
	let versionInfo = {
		default: CharSelect,
		common: {
			20180124: CharSelectV4,
			20141016: CharSelectV3,
			20100803: CharSelectV2,
			20100728: CharSelect,
			20100720: CharSelectV2
		},
		re: {},
		prere: {}
	};

	let Controller = UIVersionManager.getUIController(publicName, versionInfo);
export default Controller;