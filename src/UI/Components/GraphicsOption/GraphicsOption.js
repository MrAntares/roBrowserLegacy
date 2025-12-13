/**
 * UI/Components/GraphicsOption/GraphicsOption.js
 *
 * Manage Graphics details
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
	var FPS              = require('UI/Components/FPS/FPS');
	var Configs          = require('Core/Configs');
	var Context          = require('Core/Context');
	var Preferences      = require('Core/Preferences');
	var GraphicsSettings = require('Preferences/Graphics');
	var Renderer         = require('Renderer/Renderer');
	const MapRenderer		 = require('Renderer/MapRenderer');
	const Session		     = require('Engine/SessionStorage');
	var UIManager        = require('UI/UIManager');
	var UIComponent      = require('UI/UIComponent');
	var htmlText         = require('text!./GraphicsOption.html');
	var cssText          = require('text!./GraphicsOption.css');


	/**
	 * Create Component
	 */
	var GraphicsOption = new UIComponent( 'GraphicsOption', htmlText, cssText );


	/**
	 * @var {Preferences} Graphics
	 */
	var _preferences = Preferences.get('GraphicsOption', {
		x:    300,
		y:    300
	}, 1.1);


	/**
	 * Initialize UI
	 */
	GraphicsOption.init = function Init()
	{
		this.ui.find('.base').mousedown(function(event) {
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.find('.close').click(this.remove.bind(this));
		this.ui.find('.details').change(onUpdateQualityDetails);
		this.ui.find('.cursor-option').change(onToggleGameCursor);
		this.ui.find('.screensize').change(onUpdateScreenSize);
		this.ui.find('.fpslimit').change(onUpdateFPSLimit);
		this.ui.find('.fps').change(onToggleFPSDisplay);
		this.ui.find('.pixel-perfect').change(onTogglePixelPerfect);
		this.ui.find('.bloom').change(onToggleBloom);
		this.ui.find('.bloom-intensity').change(onUpdateBloomIntensity);

		this.draggable(this.ui.find('.titlebar'));
	};



	/**
	 * When append the element to html
	 */
	GraphicsOption.onAppend = function OnAppend()
	{
		this.ui.css({
			top:  _preferences.y,
			left: _preferences.x,
		});

		this.ui.find('.details').val(GraphicsSettings.quality);
		this.ui.find('.screensize').val(GraphicsSettings.screensize);
		this.ui.find('.cursor-option').attr('checked', GraphicsSettings.cursor);
		this.ui.find('.fpslimit').val(GraphicsSettings.fpslimit);
		this.ui.find('.fps').attr('checked', FPS.ui.is(':visible'));
		this.ui.find('.pixel-perfect').attr('checked', GraphicsSettings.pixelPerfectSprites);
		this.ui.find('.bloom').attr('checked', GraphicsSettings.bloom);
		this.ui.find('.bloom-intensity').val(GraphicsSettings.bloomIntensity);
	};


	/**
	 * Once remove, save preferences
	 */
	GraphicsOption.onRemove = function OnRemove()
	{
		_preferences.x    = parseInt(this.ui.css('left'), 10);
		_preferences.y    = parseInt(this.ui.css('top'), 10);
		_preferences.save();
	};


	/**
	 * Modify game details to perform faster
	 */
	function onUpdateQualityDetails()
	{
		GraphicsSettings.quality = parseInt(this.value, 10);
		GraphicsSettings.save();

		Configs.set('quality', GraphicsSettings.quality);
		Renderer.resize();
	}


	/**
	 * Toggle game cursor
	 */
	function onToggleGameCursor()
	{
		GraphicsSettings.cursor = !!this.checked;
		GraphicsSettings.save();

		// display cursor depending on user settings
		if (!GraphicsSettings.cursor) {
			document.body.classList.remove('custom-cursor');
		} else {	
			document.body.classList.add('custom-cursor');
		}
	}

	/**
	 * Update the fps limit
	 */
	function onUpdateFPSLimit()
	{
		GraphicsSettings.fpslimit = parseInt( this.value, 10 );
		GraphicsSettings.save();

		if( Renderer.frameLimit > 0 ) {
			clearInterval( Renderer.updateId );
		}

		Renderer.frameLimit = GraphicsSettings.fpslimit;
		Renderer.rendering = false;
		Renderer.render( null );
	}

	/**
	 * Toggle the fps display
	 */
	function onToggleFPSDisplay()
	{
		FPS.toggle(!!this.checked);
	}

	function onTogglePixelPerfect()
	{
	    GraphicsSettings.pixelPerfectSprites = !!this.checked;
	    GraphicsSettings.save();

		MapRenderer.forceReloadMap();
	}

	/**
	 * Post-Processing
	 */
	function onToggleBloom()
	{
		GraphicsSettings.bloom = !!this.checked;
		GraphicsSettings.save();
	}

	function onUpdateBloomIntensity()  
	{  
		GraphicsSettings.bloomIntensity = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	/**
	 * Resizing window size
	 */
	function onUpdateScreenSize()
	{
		var isFullScreen = Context.isFullScreen();

		GraphicsSettings.screensize = this.value;
		GraphicsSettings.save();

		// FullScreen
		if (GraphicsSettings.screensize === 'full') {
			if (!isFullScreen) {
				Context.requestFullScreen();
			}
			return;
		}

		if (isFullScreen) {
			Context.cancelFullScreen();
		}

		// Resizing
		if (Context.Is.POPUP) {
			var size = GraphicsSettings.screensize.split('x');

			// Only resize/move if needed
			if (size[0] != window.innerWidth && size[1] != window.innerHeight) {
				window.resizeTo( size[0], size[1] );
				window.moveTo( (screen.availWidth - size[0]) / 2, (screen.availHeight - size[1]) / 2 );
			}
		}
	}


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(GraphicsOption);
});
