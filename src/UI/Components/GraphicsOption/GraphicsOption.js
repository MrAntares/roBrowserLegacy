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

		// Post-Processing
		this.ui.find('.bloom').change(onToggleBloom);
		this.ui.find('.bloom-intensity').change(onUpdateBloomIntensity);
		this.ui.find('.blur').change(onToggleBlur);
		this.ui.find('.blur-intensity').change(onUpdateBlurIntensity);
		this.ui.find('.blur-area').change(onUpdateBlurArea);
		this.ui.find('.casEnabled').change(oncasEnabled);
		this.ui.find('.casContrast').change(oncasContrast);
		this.ui.find('.casSharpening').change(oncasSharpening);
		this.ui.find('.fxaaEnabled').change(onfxaaEnabled);
		this.ui.find('.fxaaSubpix').change(onfxaaSubpix);
		this.ui.find('.fxaaEdgeThreshold').change(onfxaaEdgeThreshold);
		this.ui.find('.vibranceEnabled').change(onvibranceEnabled);
		this.ui.find('.vibrance').change(onvibrance);
		this.ui.find('.cartoonEnabled').change(oncartoonEnabled);
		this.ui.find('.cartoonPower').change(oncartoonPower);
		this.ui.find('.cartoonEdgeSlope').change(oncartoonEdgeSlope);

		// Culling
		this.ui.find('.culling').change(onToggleCulling);
		this.ui.find('.view-area').change(onUpdateAreaView);

		// Joystick
		this.ui.find('.attackTargetMode').change(onUpdateTargetOption);
		this.ui.find('.joySense').change(onUpdateSense);

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

		// Post-Processing
		this.ui.find('.bloom').attr('checked', GraphicsSettings.bloom);
		this.ui.find('.bloom-intensity').val(GraphicsSettings.bloomIntensity);
		this.ui.find('.blur').attr('checked', GraphicsSettings.blur);
		this.ui.find('.blur-area').val(GraphicsSettings.blurArea);
		this.ui.find('.blur-intensity').val(GraphicsSettings.blurIntensity);
		this.ui.find('.fxaaEnabled').attr('checked', GraphicsSettings.fxaaEnabled);
		this.ui.find('.fxaaSubpix').val(GraphicsSettings.fxaaSubpix);
		this.ui.find('.fxaaEdgeThreshold').val(GraphicsSettings.fxaaEdgeThreshold);
		this.ui.find('.vibranceEnabled').attr('checked', GraphicsSettings.vibranceEnabled);
		this.ui.find('.vibrance').val(GraphicsSettings.vibrance);
		this.ui.find('.casEnabled').attr('checked', GraphicsSettings.casEnabled);
		this.ui.find('.casContrast').val(GraphicsSettings.casContrast);
		this.ui.find('.casSharpening').val(GraphicsSettings.casSharpening);
		this.ui.find('.cartoonEnabled').attr('checked', GraphicsSettings.cartoonEnabled);
		this.ui.find('.cartoonEdgeSlope').val(GraphicsSettings.cartoonEdgeSlope);
		this.ui.find('.cartoonPower').val(GraphicsSettings.cartoonPower);

		// Culling
		this.ui.find('.culling').attr('checked', GraphicsSettings.culling);
		this.ui.find('.view-area').val(GraphicsSettings.viewArea);

		// Joystick
		this.ui.find('.attackTargetMode').val(GraphicsSettings.attackTargetMode);
		this.ui.find('.joySense').val(GraphicsSettings.joySense);
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

	function onToggleBlur()
	{
		GraphicsSettings.blur = !!this.checked;
		GraphicsSettings.save();
	}

	function onUpdateBlurIntensity()  
	{  
		GraphicsSettings.blurIntensity = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	function onUpdateBlurArea()  
	{  
		GraphicsSettings.blurArea = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	function oncasEnabled()
	{
		GraphicsSettings.casEnabled = !!this.checked;
		GraphicsSettings.save();
	}

	function oncasContrast()  
	{  
		GraphicsSettings.casContrast = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	function oncasSharpening()  
	{  
		GraphicsSettings.casSharpening = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	function onvibranceEnabled()
	{
		GraphicsSettings.vibranceEnabled = !!this.checked;
		GraphicsSettings.save();
	}

	function onvibrance()  
	{  
		GraphicsSettings.vibrance = parseFloat(this.value);  
		GraphicsSettings.save();  
	}


	function onfxaaEnabled()
	{
		GraphicsSettings.fxaaEnabled = !!this.checked;
		GraphicsSettings.save();
	}

	function onfxaaSubpix()  
	{  
		GraphicsSettings.fxaaSubpix = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	function onfxaaEdgeThreshold()  
	{  
		GraphicsSettings.fxaaEdgeThreshold = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	function oncartoonEnabled()
	{
		GraphicsSettings.cartoonEnabled = !!this.checked;
		GraphicsSettings.save();
	}

	function oncartoonPower()  
	{  
		GraphicsSettings.cartoonPower = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	function oncartoonEdgeSlope()  
	{  
		GraphicsSettings.cartoonEdgeSlope = parseFloat(this.value);  
		GraphicsSettings.save();  
	}

	/**
	 * Culling
	 */
	function onToggleCulling()
	{
		GraphicsSettings.culling = !!this.checked;
		GraphicsSettings.save();
	}

	function onUpdateAreaView()  
	{  
		GraphicsSettings.viewArea = parseInt(this.value);  
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

	function onUpdateTargetOption()
	{
		var opt = 1;
		if(this.value === 'NEAREST')
			opt = 0;
		GraphicsSettings.attackTargetMode = opt;
		GraphicsSettings.save();
	}

	function onUpdateSense()
	{
		GraphicsSettings.joySense = parseFloat(this.value, 10);
		GraphicsSettings.save();
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(GraphicsOption);
});
