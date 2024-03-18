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
		var _maxDate = 0;
		
		function getUIbyGameMode(gameMode){
			if(typeof gameMode === 'object' && Object.keys(gameMode).length > 0){
				for (const [keydate, UI] of Object.entries(gameMode)) {
					var dateNum = parseInt(keydate);
					if(PACKETVER.value >= dateNum && dateNum > _maxDate){
						SelectedUI = UI;
						_maxDate = dateNum;
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

		UIController.selectSpecificUIVersion = function(version) {
			_selectedUI = versionInfo.common[version] || versionInfo.default;
			_UIAliases[publicName] = _selectedUI.name;
			console.log("[UIVersion] " + publicName + ": ", _selectedUI.name);
		};

		UIController.getUI = function(){
			return _selectedUI;
		}
		
		return UIController;
	}
	
	
	
	/// DEPRECATED
	/// WILL BE REMOVED AFTER REFACTORING
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


	return UIVersionManager;
});
