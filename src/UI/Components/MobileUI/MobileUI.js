/**
 * UI/Components/MobileUI/MobileUI.js
 *
 * Mobile/Touchscreen assist UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
+ */
define(function(require)
{
	'use strict';
	
	
	var Context			= require('Core/Context');
	var UIManager		= require('UI/UIManager');
	var UIComponent		= require('UI/UIComponent');
	var Preferences		= require('Core/Preferences');
	var Session         = require('Engine/SessionStorage');
	var Renderer		= require('Renderer/Renderer');
	var htmlText		= require('text!./MobileUI.html');
	var cssText			= require('text!./MobileUI.css');
	
	/**
	 * Create Component
	 */
	var MobileUI = new UIComponent('MobileUI', htmlText, cssText);

	/**
	 * @var {Preferences} window preferences
	 */
	var _preferences = Preferences.get('MobileUI', {
		x: 0,
		y: 0,
		zIndex:   1000,
		width: Renderer.width,
		height: Renderer.height,
		show: false,
	}, 1.0);
	
	var showButtons = false;
	
	/**
	 * Mouse can cross this UI
	 */
	//MobileUI.mouseMode = UIComponent.MouseMode.CROSS;
	
	/**
	 * Initialize UI
	 */
	MobileUI.init = function init() {
		this.ui.find('#toggleUIButton').click(	function(e){ toggleButtons();	stopPropagation(e);});
		this.ui.find('#fullscreenButton').click(function(e){ toggleFullScreen();	stopPropagation(e);});
		this.ui.find('#f10Button').click(		function(e){ keyPress(121);			stopPropagation(e);});
		this.ui.find('#f12Button').click(		function(e){ keyPress(123);			stopPropagation(e);});
		this.ui.find('#insButton').click(		function(e){ keyPress(45);			stopPropagation(e);});
	}
	
	function toggleFullScreen() {
		if (!Context.isFullScreen()) {
			Context.requestFullScreen();
		} else {
			Context.cancelFullScreen();
		}
	}
	
	function keyPress(k) {
		var roWindow = window;
		roWindow.document.getElementsByTagName('body')[0].focus();
		roWindow.dispatchEvent(new KeyboardEvent('keydown', {
				keyCode: k,
				which: k
			}));
	}
	
	function toggleButtons(){
		if(showButtons){
			
			MobileUI.ui.find('#fullscreenButton').addClass('disabled');
			MobileUI.ui.find('#f10Button').addClass('disabled');
			MobileUI.ui.find('#f12Button').addClass('disabled');
			MobileUI.ui.find('#insButton').addClass('disabled');
			
			showButtons = false;
		} else {
			
			MobileUI.ui.find('#fullscreenButton').removeClass('disabled');
			MobileUI.ui.find('#f10Button').removeClass('disabled');
			MobileUI.ui.find('#f12Button').removeClass('disabled');
			MobileUI.ui.find('#insButton').removeClass('disabled');
			
			showButtons = true;
		}
	}
	
	function stopPropagation(event){
		event.stopImmediatePropagation();
		return false;
	}
	
	/**
	 * Apply preferences once append to body
	 */
	MobileUI.onAppend = function onAppend() {
		// Apply preferences
		if (Session.isTouchDevice) {
			this.ui.show();
		} else {
			this.ui.hide();
		}

		this.ui.css({
			top: 0,
			left: 0,
			zIndex: 1000,
			width: Renderer.width,
			height: Renderer.height
		});
	};
	
	MobileUI.onRemove = function onRemove() {
		// Save preferences
		_preferences.y = 0;
		_preferences.x = 0;
		_preferences.zIndex = 1000;
		_preferences.width = Renderer.width;
		_preferences.height = Renderer.height;
		_preferences.save();
	};
	
	MobileUI.show = function show() {
		this.ui.show();
	};
	
	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(MobileUI);
});
