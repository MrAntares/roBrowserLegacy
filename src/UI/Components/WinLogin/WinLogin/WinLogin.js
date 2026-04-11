/**
 * UI/Components/WinLogin/WinLogin.js
 *
 * WinLogin windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * Dependencies
 */
import WinLoginBackground from './WinLoginBackground.js';
import htmlText from './WinLogin.html?raw';
import cssText from './WinLogin.css?raw';
import { createWinLogin } from '../WinLoginCommon.js';

export default createWinLogin({
	name: 'WinLogin',
	htmlText,
	cssText,
	Background: WinLoginBackground
});
