/**
 * UI/Components/BasicInfo/BasicInfo.js
 *
 * Chararacter Basic information windows
 *
 * Note: For different versions, please use different Object names and main div IDs to avoid conflicts in settings and styles
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';
	
	var publicName = 'BasicInfo';
	
	var BasicInfo = require('./BasicInfo/BasicInfo');
	var BasicInfoV0 = require('./BasicInfoV0/BasicInfoV0');
	var BasicInfoV3 = require('./BasicInfoV3/BasicInfoV3');
	var BasicInfoV4 = require('./BasicInfoV4/BasicInfoV4');
	
	var UIVersionManager = require('UI/UIVersionManager');
	
	var versionInfo = {
		default: BasicInfo,
		keys: {
			common: {
				20180124:	BasicInfoV4,
				20160101:	BasicInfoV3,
				20090601:	BasicInfoV0,
			},
			re: {
				
			},
			prere:{
				
			}
		}
	};
	
	return UIVersionManager.selectUIVersion(publicName, versionInfo);
});
