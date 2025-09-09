/**
 * UI/Components/NpcBox/NpcBox.js
 *
 * NPC Box windows
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
	var jQuery      = require('Utils/jquery');
	var KEYS        = require('Controls/KeyEventHandler');
	var Renderer    = require('Renderer/Renderer');
	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ItemInfo    = require('UI/Components/ItemInfo/ItemInfo');
	var Navigation  = require('UI/Components/Navigation/Navigation');
	var htmlText    = require('text!./NpcBox.html');
	var cssText     = require('text!./NpcBox.css');


	/**
	 * Create NpcBox component
	 */
	var NpcBox = new UIComponent( 'NpcBox', htmlText, cssText );


	/**
	 * @var {boolean} does the box need to be clean up?
	 */
	var _needCleanUp = false;


	/**
	 * @var {integer} NPC GID
	 */
	NpcBox.ownerID = 0;


	/**
	 * Process NAVI tags in text (<NAVI>Display Name<INFO>mapname,x,y,0,000,flag</INFO></NAVI>)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with processed NAVI tags
	 */
	function processNAVITags(text) {
		if (!text) return '';
		text = String(text);
		return text.replace(/<NAVI>([^<]+)<INFO>([^<]+)<\/INFO><\/NAVI>/g, function(match, displayName, naviInfo) {
			return '<span class="navi-link" data-navi-info="' + naviInfo + '" data-navi-name="' + displayName + '">' + displayName + '</span>';
		});
	}

	/**
	 * Process ITEM tags in text (<ITEM>Name<INFO>ID</INFO></ITEM>)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with processed item tags
	 */
	function processItemTags(text) {
		if (!text) return '';
		text = String(text);
		return text.replace(/<ITEM>([^<]+)<INFO>(\d+)<\/INFO><\/ITEM>/g, function(match, itemName, itemId) {
			return '<span class="item-link" data-item-id="' + itemId + '">' + itemName + '</span>';
		});
	}

	/**
	 * Process color codes in text (^RRGGBB)
	 * @param {string} text - The text to process
	 * @returns {string} HTML with color spans
	 */
	function processColorCodes(text) {
		if (!text) return '';
		text = String(text);
		return text.replace(/\^([0-9A-Fa-f]{6})/g, function(match, color) {
			return '<span style="color:#' + color + '">';
		}).replace(/\^000000/g, '</span>');
	}

	/**
	 * Process all text formatting (color codes, NAVI tags, and item tags)
	 * @param {string} text - The text to process
	 * @returns {string} Fully processed HTML
	 */
	function processText(text) {
		if (!text) return '';
		text = processItemTags(text);
		text = processNAVITags(text);
		text = processColorCodes(text);
		return text;
	}

	/**
	 * Initialize Component
	 */
	NpcBox.init = function init()
	{
		this.ui.css({
			top: Math.max(100, Renderer.height/2 - 200),
			left: Math.max( Renderer.width/3, 20)
		});

		// Bind mouse
		this.ui.find('.next').click( NpcBox.next.bind(this) );
		this.ui.find('.close').click( NpcBox.close.bind(this) );

		// Content do not drag window (official)
		// Will also fix the problem about the scrollbar
		this.ui.find('.content').mousedown(function(event){
			event.stopImmediatePropagation();
		});

		// Add click handler for item links
		this.ui.on('click', '.item-link', function(event) {
			var itemId = parseInt(jQuery(this).data('item-id'), 10);
			if (!itemId) {
				return;
			}

			// Don't add the same UI twice, remove it
			if (ItemInfo.uid === itemId) {
				ItemInfo.remove();
				return;
			}

			// Add ui to window
			ItemInfo.append();
			ItemInfo.uid = itemId;
			ItemInfo.setItem({ ITID: itemId, IsIdentified: true });
		});

		// Add click handler for navi links
		this.ui.on('click', '.navi-link', function(event) {
			var naviInfo = jQuery(this).data('navi-info');
			var displayName = jQuery(this).data('navi-name');

			if (!naviInfo) {
				return;
			}

			// If the Navigation window is already showing this location, toggle it off
			if (Navigation.uid === naviInfo && Navigation.ui.is(':visible')) {
				Navigation.hide();
				return;
			}

			// Show the Navigation window and set the info
			Navigation.show();
			Navigation.uid = naviInfo;
			Navigation.setNaviInfo(naviInfo, displayName);
		});

		this.draggable();
	};


	/**
	 * Once NPC Box is removed from HTML, clean up data
	 */
	NpcBox.onRemove = function onRemove()
	{
		this.ui.find('.next').hide();
		this.ui.find('.close').hide();
		this.ui.find('.content').text('');

		_needCleanUp = false;
		NpcBox.ownerID = 0;

		// Cutin system
		var cutin = document.getElementById('cutin');
		if (cutin) {
			document.body.removeChild( cutin );
		}
	};


	/**
	 * Add support for Enter key
	 */
	NpcBox.onKeyDown = function onKeyDown( event )
	{
		switch (event.which) {
			case KEYS.SPACE:	// Same as Enter
			case KEYS.ENTER:
				if (this.ui.find('.next').is(':visible')) {
					this.next();
					break;
				}
				else if (this.ui.find('.close').is(':visible')) {
					this.close();
					break;
				}
				return true;

			case KEYS.ESCAPE:
				if (this.ui.find('.close').is(':visible')) {
					this.close();
					break;
				}
				return true;

			default:
				return true;
		}

		event.stopImmediatePropagation();
		return false;
	};


	/**
	 * Add text to box
	 *
	 * @param {string} text to display
	 * @param {number} gid - npc id
	 */
	NpcBox.setText = function SetText( text, gid )
	{
		var content = this.ui.find('.content');
		NpcBox.ownerID = gid;

		if (_needCleanUp) {
			_needCleanUp = false;
			content.text('');
		}

		content.append( jQuery('<div/>').html(processText(text)) );
	};


	/**
	 * Add next button
	 *
	 * @param {number} gid - npc id
	 */
	NpcBox.addNext = function addNext( gid )
	{
		NpcBox.ownerID = gid;
		this.ui.find('.next').show();
	};


	/**
	 * Add close button
	 *
	 * @param {number} gid - npc id
	 */
	NpcBox.addClose = function addClose( gid )
	{
		NpcBox.ownerID = gid;
		this.ui.find('.close').show();
	};


	/**
	 * Press "next" button
	 */
	NpcBox.next = function Next()
	{
		_needCleanUp = true;
		this.ui.find('.next').hide();
		this.onNextPressed( NpcBox.ownerID );
	};


	/**
	 * Press "close" button
	 */
	NpcBox.close = function Close()
	{
		_needCleanUp = true;
		this.ui.find('.close').hide();
		this.onClosePressed( NpcBox.ownerID );
	};


	/**
	 * Callback
	 */
	NpcBox.onClosePressed = function OnClosePressed(){};
	NpcBox.onNextPressed  = function OnNextPressed(){};


	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(NpcBox);
});
