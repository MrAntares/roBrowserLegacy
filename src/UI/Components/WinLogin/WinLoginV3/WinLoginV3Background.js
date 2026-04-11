import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './WinLoginV3Background.html?raw';
import cssText from './WinLoginV3Background.css?raw';

const WinLoginV3Background = new GUIComponent('WinLoginV3Background', cssText);
WinLoginV3Background.render = () => htmlText;

WinLoginV3Background.init = function init() {};

WinLoginV3Background.onAppend = function onAppend() {};
WinLoginV3Background.mouseMode = GUIComponent.MouseMode.CROSS;

export default UIManager.addComponent(WinLoginV3Background);
