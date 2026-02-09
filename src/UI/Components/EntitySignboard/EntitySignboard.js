/**
 * UI/Components/EntitySignboard/EntitySignboard.js
 *
 * Entity room (chat room, shop room, ...)
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
	var htmlText = require('text!./EntitySignboard.html');
	var cssText = require('text!./EntitySignboard.css');
	var Client = require('Core/Client');

	/**
	 * Createcomponent
	 */
	var EntitySignboard = new UIComponent('EntitySignboard', htmlText, cssText);

	/**
	 * @var {boolean} do not focus this UI
	 */
	EntitySignboard.needFocus = false;

	/**
	 * Once in HTML, focus the input
	 */
	EntitySignboard.onAppend = function onAppend()
	{
		this.ui.find('button').dblclick(
			function ()
			{
				if (this.onEnter)
				{
					this.onEnter();
				}
			}.bind(this)
		);

		// Avoid player to move to the cell
		this.ui.mousedown(function ()
		{
			return false;
		});

		this.ui.css('zIndex', 45);
	};

	/**
	 * Remove data from UI
	 */
	EntitySignboard.onRemove = function onRemove()
	{
		this.ui.find('button').unbind();
		//this.ui.find('button').removeClass('icon-only');
	};

	/**
	 * Define title and icons
	 *
	 * @param {string} title
	 * @param {string} url - icon url
	 */
	EntitySignboard.setTitle = function setTitle(title, icon_location)
	{
		// add data-background attribute
		this.ui.attr('data-background', 'signboard/bg_signboard.bmp');
		this.ui.find('.title, .overlay').text(title);
		this.ui.find('.title').show();

		var self = this;

		// show overlay when mouse over .title
		this.ui.find('.title').hover(function ()
		{
			self.ui.find('.overlay').show();
		});

		// hide overlay when mouse out .title
		this.ui.find('.title').mouseout(function ()
		{
			self.ui.find('.overlay').hide();
		});

		Client.loadFile(icon_location, function (icon_location)
		{
			self.ui.find('button').css('backgroundImage', 'url(' + icon_location + ')');
			self.ui.each(self.parseHTML).find('*').each(self.parseHTML);
		});
	};

	/**
	 * Define title and icons
	 *
	 * @param {string} title
	 * @param {string} url - icon url
	 */
	EntitySignboard.setIconOnly = function setIconOnly(icon_location)
	{
		this.ui.find('.title').hide();
		this.ui.find('.overlay').hide();
		var self = this;
		Client.loadFile(icon_location, function (icon_location)
		{
			self.ui
				.find('button')
				.addClass('icon-only')
				.css('backgroundImage', 'url(' + icon_location + ')');
		});
	};

	// Function to check if an element's content is overflowing
	function isOverflowing(element)
	{
		return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
	}

	/**
	 * function to define
	 */
	EntitySignboard.onEnter = function onEnter() {};

	/**
	 * Stored component and return it
	 */
	return UIManager.addComponent(EntitySignboard);
});
