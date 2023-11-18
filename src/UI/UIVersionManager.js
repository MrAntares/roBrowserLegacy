/**
 * UIVersionManager.js
 *
 * Manage Component
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';

	var Configs = require('Core/Configs');
	var PACKETVER = require('Network/PacketVerManager');
	var UIVersionManager = {};
	
	var _UIAliases = {};
	
	UIVersionManager.getUIAlias = function( name ){
		return name in _UIAliases ? _UIAliases[name] : false;
	};
	
	UIVersionManager.selectUIVersion = function( publicName, versionInfo ){
		var SelectedUI = versionInfo.default;
		
		function getUIbyGameMode(gameMode){
			if(typeof gameMode === 'object' && Object.keys(gameMode).length > 0){
				for (const [keydate, UI] of Object.entries(gameMode)) {
					if(PACKETVER.value >= parseInt(keydate)){
						SelectedUI = UI;
					}
				}
			}
		}
		
		// Common UI
		getUIbyGameMode(versionInfo.common);
		
		if(Configs.get('renewal')){
			// Renewal only UI
			getUIbyGameMode(versionInfo.re);
		} else {
			// Classic only UI
			getUIbyGameMode(versionInfo.prere);
		}
		
		// Store selected UI name
		_UIAliases[publicName] = SelectedUI.name;
		console.log( "%c[UIVersion] "+publicName+": ", "color:#007000", SelectedUI.name );
		return SelectedUI;
	}
	
	UIVersionManager.getUIController = function(publicName, versionInfo){
		var _selectedUI;
	
		var UIController = {};
		
		UIController.selectUIVersion = function(){
			_selectedUI = UIVersionManager.selectUIVersion(publicName, versionInfo);
		};
		
		UIController.getUI = function(){
			return _selectedUI;
		}
		
		return UIController;
	}
	
	
	
	/// DEPRECATED
	/// WILL BE REMOVED AFTER REFACTORING
	UIVersionManager.category = function () {
		return ['PacketVer', 'PreRenewal', 'Renewal'];
	}

	UIVersionManager.getUIComponent = function(componentName) {
		switch (componentName) {
			case 'BasicInfo':
				if (UIVersionManager.getBasicInfoVersion() === 0) {
					return 'BasicInfoV0';
				} else if (UIVersionManager.getBasicInfoVersion() === 3) {
					return 'BasicInfoV3';
				} else if (UIVersionManager.getBasicInfoVersion() === 4) {
					return 'BasicInfoV4';
				} else {
					return 'BasicInfo';
				}
			case 'SkillList':
				if (UIVersionManager.getSkillListVersion() === 0) {
					return 'SkillListV0';
				} else {
					return 'SkillList';
				}
		}
	}
	
	function versionsExists(url){
		var req = new XMLHttpRequest();
        req.open('HEAD', url, false);
        req.send();
        return req.status==200;
	}

	UIVersionManager.getBasicInfoVersion = function () {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PACKETVER.value >= 20180124) {
				return 4;
			} else if (PACKETVER.value >= 20160101) {
				return 3;
			} else if(PACKETVER.value >= 20090601) {
				return 2;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		if (Configs.get('clientVersionMode') === 'Renewal') {
			if (PACKETVER.value >= 20180124) {
				return 4;
			} else if (PACKETVER.value >= 20160101) {
				return 3;
			} else if(PACKETVER.value >= 20090601) {
				return 2;
			}
		}

		return 2;
	}
	UIVersionManager.getEquipmentVersion = function () {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PACKETVER.value >= 20090601) {
				return 1;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		return 1;
	}
	UIVersionManager.getWinStatsVersion = function () {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PACKETVER.value >= 20090601) {
				return 1;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		return 1;
	}
	UIVersionManager.getInventoryVersion = function () {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PACKETVER.value >= 20090601) {
				return 1;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		return 1;
	}
	UIVersionManager.getSkillListVersion = function () {
		if (Configs.get('clientVersionMode') === 'PacketVer') {
			if (PACKETVER.value >= 20090601) {
				return 1;
			} else {
				return 0;
			}
		}
		if (Configs.get('clientVersionMode') === 'PreRenewal') {
			return 0;
		}
		return 1;
	}

	return UIVersionManager;
});
