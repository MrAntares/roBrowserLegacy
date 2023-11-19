/**
 * UI/Components/Quest/Quest.js
 *
 * Quest Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function (require)
{
	'use strict';
	
	var publicName = 'Quest';
	
	var Quest = require('./Quest/Quest');
	var QuestV1 = require('./QuestV1/QuestV1');
	
	var UIVersionManager = require('UI/UIVersionManager');
	
	var versionInfo = {
		default: QuestV1,
		common: {
			20180307:	Quest
		},
		re: {
			
		},
		prere:{
			
		}
	};
	
	var Controller = UIVersionManager.getUIController(publicName, versionInfo);
	
	return Controller;
});