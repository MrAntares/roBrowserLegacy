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
	var Events             = require('Core/Events');


	/**
	 * Create Component
	 */
	var MapName = new UIComponent( 'MapName', htmlText, cssText );

	/**
	 * Mouse can cross this UI
	 */
	MapName.mouseMode = UIComponent.MouseMode.CROSS;

	/**
	 * @var {array} _mapinfo
	 */
	var _mapinfo = [];
	
	/**
	 * Previous map check vars
	 */
	var _currMap = '';
	var _prevMap = '';
	var _newMap = false;

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
		if (_mapinfo && _mapinfo.notifyEnter && _newMap) {
			// Apply preferences
			this.ui.css({
				opacity: 1
			});
			
			var fadeTime = 1000;
			var fadeCycle = 20;
			var removeTime = 5000;
			var fadeProgress = 0;
			var fadeTimeout = null;
			
			function fade(){
				fadeProgress += fadeCycle;
				if(fadeProgress < fadeTime){
					MapName.ui.css('opacity', MapName.ui.css('opacity')*1 - (100/(fadeTime/fadeCycle)/100));
					fadeTimeout = setTimeout(function(){ fade(); }, fadeCycle);
				}
			}
			
			Events.setTimeout(function() {
				fade();
			}, removeTime-fadeTime);

			// Automatically remove the UI element after 5 seconds
			Events.setTimeout(function() {
				Events.clearTimeout(fadeTimeout);
			    MapName.ui.remove();
			}, removeTime); // 5000 milliseconds (5 seconds)
		} else {
			MapName.ui.remove();
		}
	};

	/**
	 * Set map
	 *
	 * @param {string} mapname
	 */
	MapName.setMap = function setMap( mapname )
	{
		_prevMap = _currMap;
		_currMap = mapname;
		_newMap = (_currMap !== _prevMap);
		
        _mapinfo = DB.getMapInfo(mapname.replace('.gat', '.rsw'));

		/*
		console.log('Mapinfo:', _mapinfo);
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
	 * Resets the state of the MapName component.
	 *
	 * Resets the current map name, previous map name, and the new map flag.
	 */
	MapName.resetState = function() {
		_currMap = '';
        _prevMap = '';
		_newMap = false;
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(MapName);
});
