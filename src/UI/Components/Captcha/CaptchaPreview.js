/**
 * UI/Components/Captcha/CaptchaPreview.js
 *
 * Captcha Upload Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var htmlText = require('text!./CaptchaPreview.html');
	var cssText = require('text!./CaptchaPreview.css');
	var jQuery = require('Utils/jquery');

	/**
	 * Create Component
	 */
	var CaptchaPreview = new UIComponent('CaptchaPreview', htmlText, cssText);

	/**
	 * Preferences
	 */
	var _preferences = Preferences.get(
		'CaptchaPreview',
		{
			x: 230,
			y: 295
		},
		2.0
	);

	/**
	 * Initialize GUI
	 */
	CaptchaPreview.init = function Init()
	{
		this.ui.find('.close').click(this.remove.bind(this));
		this.draggable('.titlebar');
	};

	/**
	 * Append to DOM
	 */
	CaptchaPreview.onAppend = function OnAppend()
	{
		// Apply preferences
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});
	};

	/**
	 * Remove data from UI
	 */
	CaptchaPreview.onRemove = function OnRemove()
	{
		// save preferences
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.save();

		// clean inputs
		this.ui.find('.preview_box').empty();
	};

	/**
	 * Set Image
	 */
	CaptchaPreview.setImage = function SetImage(imageData)
	{
		// imageData is expected to be Uint8Array or Blob usually, need to convert to URL
		// If it's pure binary from packet, we might need conversion
		var blob = new Blob([imageData], { type: 'image/bmp' }); // Assuming BMP as typical in RO
		var url = URL.createObjectURL(blob);

		var img = jQuery('<img/>').attr('src', url);
		this.ui.find('.preview_box').empty().append(img);
	};

	/**
	 * Stored component and return it
	 */
	return UIManager.addComponent(CaptchaPreview);
});
