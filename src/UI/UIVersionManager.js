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
