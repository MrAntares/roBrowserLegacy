/**
 * UI/Components/WinLogin/WinLogin.js
 *
 * Login Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';
	
	var publicName = 'WinLogin';
	
	var WinLogin = require('./WinLogin/WinLogin');
	var WinLoginV2 = require('./WinLoginV2/WinLoginV2');
	
	var UIVersionManager = require('UI/UIVersionManager');
	
	var versionInfo = {
		default: WinLogin,
		common: {
			20181114:	WinLoginV2
		},
		re: {
			
		},
		prere:{
			
		}
	};
	
	var Controller = UIVersionManager.getUIController(publicName, versionInfo);
	
	return Controller;
});