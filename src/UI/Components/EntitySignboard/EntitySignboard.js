/**
 * UI/Components/EntitySignboard/EntitySignboard.js
 *
 * Entity room (chat room, shop room, ...)
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
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./EntitySignboard.html');
	var cssText            = require('text!./EntitySignboard.css');


	/**
	 * Createcomponent
	 */
	var EntitySignboard = new UIComponent( 'EntitySignboard', htmlText, cssText );


	/**
	 * @var {boolean} do not focus this UI
	 */
	EntitySignboard.needFocus = false;


	/**
	 * Once in HTML, focus the input
	 */
	EntitySignboard.onAppend = function onAppend()
	{
		this.ui.find('button').dblclick(function(){
			if (this.onEnter) {
				this.onEnter();
			}
		}.bind(this));

		// Avoid player to move to the cell
		this.ui.mousedown(function(){
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
	EntitySignboard.setTitle = function setTitle( title, url )
	{
		this.ui.find('button').css('backgroundImage', 'url('+ url +')');
		this.ui.find('.title, .overlay').text(title);
		var titleElement = this.ui.find('.title');
		var overlayElement = this.ui.find('.overlay');
		titleElement.show();
		overlayElement.show();

		// Check if the title is overflowing
		if (!isOverflowing(titleElement[0]))
			overlayElement.hide(); // Hide the overlay if no overflow

	};


	/**
	 * Define title and icons
	 *
	 * @param {string} title
	 * @param {string} url - icon url
	 */
	EntitySignboard.setIconOnly = function setIconOnly(url)
	{
		this.ui.css('backgroundImage', 'none'); // Hide the background image of the entire signboard
		this.ui.find('button').addClass('icon-only').css('backgroundImage', 'url('+ url +')');
		this.ui.find('.title').hide();
		this.ui.find('.overlay').hide();
	};

	// Function to check if an element's content is overflowing
	function isOverflowing(element) {
	    return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
	}

	/**
	 * function to define
	 */
	EntitySignboard.onEnter = function onEnter(){};


	/**
	 * Stored component and return it
	 */
	return UIManager.addComponent(EntitySignboard);
});
