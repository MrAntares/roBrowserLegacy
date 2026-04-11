/**
 * UI/Components/WinLoginV2/WinLoginV2Background.js
 *
 * WinLoginV2Background windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

/**
 * Dependencies
 */
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './WinLoginV2Background.html?raw';
import cssText from './WinLoginV2Background.css?raw';

/**
 * Create WinLogin namespace
 */
const WinLoginV2Background = new GUIComponent('WinLoginV2Background', cssText);
WinLoginV2Background.render = () => htmlText;

/**
 * Initialize win_login UI - Inherit from UIComponent
 */
WinLoginV2Background.init = function init() {};

/**
 * Once the component is on html - InHerit from UIComponent
 */
WinLoginV2Background.onAppend = function onAppend() {};
WinLoginV2Background.mouseMode = GUIComponent.MouseMode.CROSS;

/**
 * Create component based on view file and export it
 */
export default UIManager.addComponent(WinLoginV2Background);
