/**
 * UI/Components/MapName/MapName.js
 *
 * Bank window
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
	var DB                 = require('DB/DBManager');
	var Renderer           = require('Renderer/Renderer');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./MapName.html');
	var cssText            = require('text!./MapName.css');
	var Client             = require('Core/Client');


	/**
	 * Create Component
	 */
	var MapName = new UIComponent( 'MapName', htmlText, cssText );

	/**
	 * @var {array} _mapinfo
	 */
	var _mapinfo = [];

	/**
	 * Initialize UI
	 */
	MapName.init = function init()
	{
		
	};

	/**
	 * Append MapName
	 */
	MapName.onAppend = function onAppend()
	{
		if (_mapinfo && _mapinfo.notifyEnter) {
			// Apply preferences
			this.ui.css({
				top:  '90px',	// Below announce
				left: (Renderer.width  - this.ui.width() >> 1) + 'px'	// responsive to mobile
			});

			// Automatically remove the UI element after 5 seconds
			setTimeout(function() {
			    MapName.ui.remove();
			}, 5000); // 5000 milliseconds (5 seconds)
		}
	};

	/**
	 * Set map
	 *
	 * @param {string} mapname
	 */
	MapName.setMap = function setMap( mapname )
	{
        _mapinfo = DB.getMapInfo(mapname.replace('.gat', '.rsw'));
		console.log('Mapinfo:', _mapinfo);
		
		/*
		console.log('bg:%s, subtitle:%s, title:%s', _mapinfo.backgroundBmp, _mapinfo.signName.subTitle, _mapinfo.signName.mainTitle );
		*/
		if ( _mapinfo && _mapinfo.backgroundBmp ) {
			Client.loadFile( DB.INTERFACE_PATH + "display_mapname/"+_mapinfo.backgroundBmp+".png", function(dataURI) {
				MapName.ui.find('.mapbg').css('backgroundImage', 'url(' + dataURI + ')');
			});
		} else {
			MapName.ui.find('.mapbg').css('backgroundImage', 'none');
		}
		
		var mapsubtitle = MapName.ui.find('.mapsubtitle');
		if( _mapinfo && _mapinfo.signName && _mapinfo.signName.subTitle ) {
			mapsubtitle.text(_mapinfo.signName.subTitle);
		} else {
			mapsubtitle.empty();
		}
		
		var maptitle = MapName.ui.find('.maptitle');
		if( _mapinfo && _mapinfo.signName && _mapinfo.signName.mainTitle ) {
			maptitle.text(_mapinfo.signName.mainTitle);
		} else {
			maptitle.empty();
		}
	};

	/**
	 * Remove MapName from window (and so clean up items)
	 */
	MapName.onRemove = function OnRemove()
	{
		var maptitle = MapName.ui.find('.maptitle');
		var mapsubtitle = MapName.ui.find('.mapsubtitle');

		// Clean up
		MapName.ui.find('.mapbg').css('backgroundImage', 'none');
		mapsubtitle.empty();
		maptitle.empty();
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(MapName);
});
