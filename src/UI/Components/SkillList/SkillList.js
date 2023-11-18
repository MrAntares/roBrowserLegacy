/**
 * UI/Components/SkillList/SkillList.js
 *
 * SkillWindow
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';
	
	var publicName = 'SkillList';
	
	var SkillList = require('./SkillList/SkillList');
	var SkillListV0 = require('./SkillListV0/SkillListV0');
	
	var UIVersionManager = require('UI/UIVersionManager');
	
	var versionInfo = {
		default: SkillListV0,
		common: {
			20090601:	SkillList
		},
		re: {
			
		},
		prere:{
			
		}
	};
	
	var Controller = UIVersionManager.getUIController(publicName, versionInfo);
	
	return Controller;
});