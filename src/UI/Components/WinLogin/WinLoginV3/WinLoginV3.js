import htmlText from '../WinLoginV2/WinLoginV2.html?raw';
import cssText from '../WinLoginV2/WinLoginV2.css?raw';
import WinLoginV3Background from './WinLoginV3Background.js';
import { createWinLogin } from '../WinLoginCommon.js';

export default createWinLogin({
	name: 'WinLoginV3',
	htmlText,
	cssText,
	Background: WinLoginV3Background
});
