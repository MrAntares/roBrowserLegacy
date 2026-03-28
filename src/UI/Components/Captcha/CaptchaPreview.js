/**
 * UI/Components/Captcha/CaptchaPreview.js
 *
 * Captcha Upload Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import htmlText from './CaptchaPreview.html?raw';
import cssText from './CaptchaPreview.css?raw';
import jQuery from 'Utils/jquery.js';

/**
 * Create Component
 */
const CaptchaPreview = new UIComponent('CaptchaPreview', htmlText, cssText);

/**
 * Preferences
 */
const _preferences = Preferences.get(
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
CaptchaPreview.init = function Init() {
	this.ui.find('.close').click(this.remove.bind(this));
	this.draggable('.titlebar');
};

/**
 * Append to DOM
 */
CaptchaPreview.onAppend = function OnAppend() {
	// Apply preferences
	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});
};

/**
 * Remove data from UI
 */
CaptchaPreview.onRemove = function OnRemove() {
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
CaptchaPreview.setImage = function SetImage(imageData) {
	// imageData is expected to be Uint8Array or Blob usually, need to convert to URL
	// If it's pure binary from packet, we might need conversion
	const blob = new Blob([imageData], { type: 'image/bmp' }); // Assuming BMP as typical in RO
	const url = URL.createObjectURL(blob);

	const img = jQuery('<img/>').attr('src', url);
	this.ui.find('.preview_box').empty().append(img);
};

/**
 * Stored component and return it
 */
export default UIManager.addComponent(CaptchaPreview);
