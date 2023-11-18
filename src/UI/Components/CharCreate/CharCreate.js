/**
 * UI/Components/CharCreate/CharCreate.js
 *
 * Character Creation
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';
	
	var publicName = 'CharCreate';
	
	var CharCreate = require('./CharCreate/CharCreate');
	var CharCreateV2 = require('./CharCreatev2/CharCreatev2');
	var CharCreateV3 = require('./CharCreatev3/CharCreatev3');
	var CharCreateV4 = require('./CharCreatev4/CharCreatev4');
	
	var UIVersionManager = require('UI/UIVersionManager');
	
	var versionInfo = {
		default: CharCreate,
		common: {
			20180124:	CharCreateV4,
			20151001:	CharCreateV3,
			20120307:	CharCreateV2
		},
		re: {
			
		},
		prere:{
			
		}
	};
	
	var Controller = UIVersionManager.getUIController(publicName, versionInfo);
	
	return Controller;
});