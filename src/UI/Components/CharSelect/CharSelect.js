/**
 * UI/Components/CharSelect/CharSelect.js
 *
 * Character Selection
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';
	
	var publicName = 'CharSelect';
	
	var CharSelect = require('./CharSelect/CharSelect');
	var CharSelect2 = require('./CharSelect2/CharSelect2');
	var CharSelectV2 = require('./CharSelectV2/CharSelectV2');
	var CharSelectV3 = require('./CharSelectV3/CharSelectV3');
	
	var UIVersionManager = require('UI/UIVersionManager');
	
	var versionInfo = {
		default: CharSelect,
		common: {
			20180124:	CharSelectV3,
			20141016:	CharSelectV2,
			20100803:	CharSelect2,
			20100728:	CharSelect,
			20100720:	CharSelect2
		},
		re: {
			
		},
		prere:{
			
		}
	};
	
	var Controller = UIVersionManager.getUIController(publicName, versionInfo);
	
	return Controller;
});