/**
 * UI/Components/BasicInfo/BasicInfo.js
 *
 * Chararacter Basic information windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import htmlText from './BasicInfo.html?raw';
import cssText from './BasicInfo.css?raw';
import { createBasicInfo } from '../BasicInfoCommon.js';

export default createBasicInfo({
	name: 'BasicInfo',
	htmlText,
	cssText,
	prefKey: 'BasicInfo',
	reduceDefault: true,
	innerId: '#basicinfo',
	topbarItemSelector: '.topbar button',
	toggleButtonsEvent: 'mousedown',
	buttonsSelector: '.buttons button',
	buttonsEvent: 'mousedown',
	buttonKeyBy: 'class',
	infoOpensWinStats: false,
	barScale: 1.27
});
