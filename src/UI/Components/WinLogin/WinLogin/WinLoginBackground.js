import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './WinLoginBackground.html?raw';
import cssText from './WinLoginBackground.css?raw';

const WinLoginBackground = new GUIComponent('WinLoginBackground', cssText);
WinLoginBackground.render = () => htmlText;

WinLoginBackground.init = function init() {};

WinLoginBackground.onAppend = function onAppend() {};
WinLoginBackground.mouseMode = GUIComponent.MouseMode.CROSS;

export default UIManager.addComponent(WinLoginBackground);
