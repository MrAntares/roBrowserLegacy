/**
 * UI/Components/Captcha/CaptchaAnswer.js
 *
 * Captcha Answer Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import jQuery from 'Utils/jquery.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import Preferences from 'Core/Preferences.js';
import Renderer from 'Renderer/Renderer.js';
import htmlText from './CaptchaAnswer.html?raw';
import cssText from './CaptchaAnswer.css?raw';
import DB from 'DB/DBManager.js';

/**
 * Create Component
 */
const CaptchaAnswer = new UIComponent('CaptchaAnswer', htmlText, cssText);

/**
 * Preferences
 */
const _preferences = Preferences.get(
	'CaptchaAnswer',
	{
		x: 230,
		y: 295
	},
	2.0
);

let timer = null;

/**
 * Initialize GUI
 */
CaptchaAnswer.init = function Init() {
	this.draggable('.titlebar');

	const self = this;

	this.ui.find('.ok').click(function () {
		const answer = self.ui.find('.answer_input').val();
		if (answer && answer.length > 0 && self.onSend) {
			self.onSend(answer);
		}
	});
};

/**
 * Append to DOM
 */
CaptchaAnswer.onAppend = function OnAppend() {
	// Apply preferences
	this.ui.css({
		top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
		left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
	});
};

/**
 * Set Image
 */
CaptchaAnswer.setImage = function SetImage(imageData) {
	// imageData is expected to be Uint8Array or Blob usually, need to convert to URL
	// If it's pure binary from packet, we might need conversion
	const blob = new Blob([imageData], { type: 'image/bmp' }); // Assuming BMP as typical in RO
	const url = URL.createObjectURL(blob);

	const img = jQuery('<img/>').attr('src', url);
	this.ui.find('.preview_box').empty().append(img);
};

/**
 * Set Metadata
 */
CaptchaAnswer.setData = function SetData(retryCount, timeout) {
	this.ui.find('.retry_count').text(DB.getMessage(2886).replace('%d', retryCount));

	// if timer is already running, clear it
	if (timer) {
		clearInterval(timer);
		timer = null;
	}

	// Start timer logic here using timeout
	timer = setInterval(
		function () {
			timeout--;

			// get minutes and seconds
			const minutes = Math.floor(timeout / 60);
			const seconds = timeout % 60;

			// set timer text
			this.ui
				.find('.timer_text')
				.text(minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'));

			// set timer bar fill
			this.ui.find('.timer_bar_fill').css('width', (timeout / 60) * 100 + '%');

			// check if timer is finished
			if (timeout <= 0) {
				clearInterval(timer);
				timer = null;
			}
		}.bind(this),
		1000
	);
};

CaptchaAnswer.setError = function SetError(retryCount) {
	this.ui.find('.error_text').text(DB.getMessage(2875).replace('%d', retryCount));
};

CaptchaAnswer.showSuccessMessage = function ShowSuccessMessage() {
	UIManager.showMessageBox(
		DB.getMessage(2871),
		'ok',
		function () {
			CaptchaAnswer.remove();
		},
		true
	);
};

/**
 * Remove data from UI
 */
CaptchaAnswer.onRemove = function OnRemove() {
	// save preferences
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.save();

	// clean inputs
	this.ui.find('.image_container').empty();
	this.ui.find('.retry_count').text('Remaining chance: 0');
	this.ui.find('.timer_text').text('0');
	this.ui.find('.error_text').text('');

	// Stop timer
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
};

/**
 * Callback
 */
CaptchaAnswer.onSend = null;

/**
 * Stored component and return it
 */
export default UIManager.addComponent(CaptchaAnswer);
