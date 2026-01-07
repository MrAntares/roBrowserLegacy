/**
 * UI/Components/Captcha/CaptchaAnswer.js
 *
 * Captcha Answer Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var jQuery             = require('Utils/jquery');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var Preferences        = require('Core/Preferences');
	var Renderer           = require('Renderer/Renderer');
	var htmlText           = require('text!./CaptchaAnswer.html');
	var cssText            = require('text!./CaptchaAnswer.css');
	var DB                 = require('DB/DBManager');


	/**
	 * Create Component
	 */
	var CaptchaAnswer = new UIComponent( 'CaptchaAnswer', htmlText, cssText );

	/**
	 * Preferences
	 */
	var _preferences = Preferences.get('CaptchaAnswer', {
		x:        230,
		y:        295
	}, 2.0);

	var timer = null;


	/**
	 * Initialize GUI
	 */
	CaptchaAnswer.init = function Init()
	{
		this.draggable('.titlebar');
		
		var self = this;

		this.ui.find('.ok').click(function(){
            var answer = self.ui.find('.answer_input').val();
            if (answer && answer.length > 0 && self.onSend) {
                self.onSend(answer);
            }
		});
	};

	/**
	 * Append to DOM
	 */
	CaptchaAnswer.onAppend = function OnAppend()
	{
		// Apply preferences
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});
	};

    /**
     * Set Image
     */
	CaptchaAnswer.setImage = function SetImage(imageData) {
		// imageData is expected to be Uint8Array or Blob usually, need to convert to URL
		// If it's pure binary from packet, we might need conversion
		var blob = new Blob([imageData], {type: 'image/bmp'}); // Assuming BMP as typical in RO
		var url = URL.createObjectURL(blob);
		
		var img = jQuery('<img/>').attr('src', url);
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
		timer = setInterval(function() {
			timeout--;

			// get minutes and seconds
			let minutes = Math.floor(timeout / 60);
			let seconds = timeout % 60;

			// set timer text
			this.ui.find('.timer_text').text(minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0'));

			// set timer bar fill
			this.ui.find('.timer_bar_fill').css('width', (timeout / 60) * 100 + '%');

			// check if timer is finished
			if(timeout <= 0) {
				clearInterval(timer);
				timer = null;
			}
		}.bind(this), 1000);
    };

	CaptchaAnswer.setError = function SetError(retryCount) {
		this.ui.find('.error_text').text(DB.getMessage(2875).replace('%d', retryCount));
	};

	CaptchaAnswer.showSuccessMessage = function ShowSuccessMessage() {
		UIManager.showMessageBox(
			DB.getMessage(2871),
			'ok',
			function(){
				CaptchaAnswer.remove();
			},
			true
		);
	};

	/**
	 * Remove data from UI
	 */
	CaptchaAnswer.onRemove = function OnRemove()
	{
		// save preferences
		_preferences.y      =  parseInt(this.ui.css('top'), 10);
		_preferences.x      =  parseInt(this.ui.css('left'), 10);
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
	return UIManager.addComponent(CaptchaAnswer);
});
