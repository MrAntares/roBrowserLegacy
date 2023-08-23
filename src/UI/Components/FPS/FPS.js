/**
 * UI/Components/FPS/FPS.js
 *
 * Manage Graphics details
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author IssID
 */
define(function(require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var Preferences      = require('Core/Preferences');
	var UIManager        = require('UI/UIManager');
	var UIComponent      = require('UI/UIComponent');
	var htmlText         = require('text!./FPS.html');
	var cssText          = require('text!./FPS.css');

	/**
	 * Create Component
	 */
	var FPS = new UIComponent( 'FPS', htmlText, cssText );

	/**
	 * @var {Preferences} Graphics
	 */
	var _preferences = Preferences.get('FPS', {
		show: false,
		x:    300,
		y:    300
	}, 1.1);


	/**
	 * Initialize UI
	 */
	FPS.init = function Init()
	{
		this.ui.find('.base').mousedown(function(event) {
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.find('.close').click(this.remove.bind(this));

		this.draggable(this.ui.find('.titlebar'));
	};

	/**
	 * When append the element to html
	 */
	FPS.onAppend = function OnAppend()
	{
		// Apply preferences
		if (!_preferences.show) {
			this.ui.hide();
		} else {
			this.ui.show();
		}

		this.ui.css({
			top:  _preferences.y,
			left: _preferences.x,
		});

		var fps = document.getElementById("fpsCounter");
		var startTime = Date.now();
		var frame = 0;

		function tick() {
			var time = Date.now();
			frame++;
			if (time - startTime > 1000) {
				fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
				startTime = time;
				frame = 0;
			}
			window.requestAnimationFrame(tick);
		}
		tick();
	};


	/**
	 * Show/Hide UI
	 */
	FPS.toggle = function toggle(isVisible)
	{
		_preferences.show = isVisible;
		_preferences.save();

		this.ui.toggle();

		if (this.ui.is(':visible')) {
			this.focus();
		}
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(FPS);
});
