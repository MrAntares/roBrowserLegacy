/**
 * UI/Components/MakeItemSelection/ItemConvertSelection/MakeModelMessage/MakeModelMessage.js
 *
 * MakeModelMessage windows
 *
 * @author Francisco Wallison
 */
define(function (require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var Renderer = require('Renderer/Renderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./MakeModelMessage.html');
	var cssText = require('text!./MakeModelMessage.css');
	var getModule = require;

	/**
	 * Create MakeModelMessage namespace
	 */
	var MakeModelMessage = new UIComponent('MakeModelMessage', htmlText, cssText);

	/**
	 * Initialize UI
	 */
	MakeModelMessage.init = function init()
	{
		// Show at center.
		this.ui.css({
			top: (Renderer.height - 200) / 2,
			left: (Renderer.width - 200) / 2
		});

		this.ui.find('.ok').on('click', onSendMaterial);
		this.ui.find('.cancel').on('click', onClose);

		this.draggable(this.ui.find('.titlebar'));
	};

	function onSendMaterial(event)
	{
		event.stopImmediatePropagation();
		getModule('UI/Components/MakeItemSelection/ItemConvertSelection/ConvertItems').validItemSend(true);
	}

	function onClose(event)
	{
		event.stopImmediatePropagation();
		getModule('UI/Components/MakeItemSelection/ItemConvertSelection/ConvertItems').validItemSend(false);
	}

	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(MakeModelMessage);
});
