/**
 * UI/Components/Captcha/CaptchaUpload.js
 *
 * Captcha Upload Window
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
	var DB                 = require('DB/DBManager');
	var Preferences        = require('Core/Preferences');
	var Renderer           = require('Renderer/Renderer');
	var htmlText           = require('text!./CaptchaUpload.html');
	var cssText            = require('text!./CaptchaUpload.css');

	/**
	 * Create Component
	 */
	var CaptchaUpload = new UIComponent( 'CaptchaUpload', htmlText, cssText );

	/**
	 * Preferences
	 */
	var _preferences = Preferences.get('CaptchaUpload', {
		x:        230,
		y:        295
	}, 2.0);

	/**
	 * Initialize GUI
	 */
	CaptchaUpload.init = function Init()
	{
		var selfCaptchaUpload = this;
		this.ui.find('.close').click(this.remove.bind(this));
		this.draggable('.titlebar');
		
		// Browse Button click
		this.ui.find('#captcha_browse_btn').click(function(){
			selfCaptchaUpload.ui.find('#captcha_file_input').click();
		});

		// File Input Change
		this.ui.find('#captcha_file_input').change(function(evt){
			var file = evt.target.files[0];
			if (file) {
				// show the file name in the input
				selfCaptchaUpload.ui.find('#captcha_file_text').val(file.name);

				// show the image in the preview box
				var reader = new FileReader();
				reader.onload = function(e) {
					var img = jQuery('<img/>').attr('src', e.target.result);
					selfCaptchaUpload.ui.find('.preview_box').empty().append(img);
				};
				reader.readAsDataURL(file);
				
				// compress the image
				Promise.resolve(selfCaptchaUpload.compressImage(file)).then(function(imageData) {
					selfCaptchaUpload.imageData = imageData;
				});
			}
		});

		// answer input change
		this.ui.find('.answer_input').change(function(){
			// if length is bigger then 16, then delete the extra characters
			let answer_input = selfCaptchaUpload.ui.find('.answer_input');
			if (answer_input.val().length > 16) {
				answer_input.val(answer_input.val().slice(0, 16));
			}
			selfCaptchaUpload.answer = answer_input.val();
		});

		// Confirm Button
		this.ui.find('.ok').click(function(){
			// check if is there any answer
			if(!selfCaptchaUpload.answer || selfCaptchaUpload.answer.length === 0) {
				UIManager.showMessageBox(
					DB.getMessage(2872),
					'ok',
					function(){},
					true
				);
				return;
			} 

			// check if is there any file selected
			if (!selfCaptchaUpload.imageData) {
				UIManager.showMessageBox(
					DB.getMessage(2874),
					'ok',
					function(){},
					true
				);
				return;
			}

			// confirm if answer is the same as the one in the image
			UIManager.showPromptBox(
				DB.getMessage(2873).replace('%s', selfCaptchaUpload.answer),
				'ok',
				'cancel',
				function(){
					if (selfCaptchaUpload.requestUploadCaptcha && selfCaptchaUpload.imageData) {
						selfCaptchaUpload.requestUploadCaptcha(selfCaptchaUpload.imageData.length, selfCaptchaUpload.answer);
					}
				}
			);
		});
	};

	/**
	 * Append to DOM
	 */
	CaptchaUpload.onAppend = function OnAppend()
	{
		// Apply preferences
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});
	};

	/**
	 * Remove data from UI
	 */
	CaptchaUpload.onRemove = function OnRemove()
	{
		// save preferences
		_preferences.y      =  parseInt(this.ui.css('top'), 10);
		_preferences.x      =  parseInt(this.ui.css('left'), 10);
		_preferences.save();

		// clean inputs
		this.ui.find('.preview_box').empty();
		this.ui.find('input').val('');

		// clean data
		this.answer = null;
		this.imageData = null;
	};

	CaptchaUpload.uploadError = function uploadError() {
		UIManager.showMessageBox(
			DB.getMessage(2881),
			'ok',
			function(){},
			true
		);
	};

	CaptchaUpload.uploadSuccess = function uploadSuccess() {
		UIManager.showMessageBox(
			DB.getMessage(2880),
			'ok',
			function(){},
			true
		);
	};

	/**
	 * Callbacks
	 */
	CaptchaUpload.requestUploadCaptcha = function(){};
	CaptchaUpload.uploadCaptcha = function(){};
	CaptchaUpload.compressImage = function(){};

	/**
	 * Stored component and return it
	 */
	return UIManager.addComponent(CaptchaUpload);
});
