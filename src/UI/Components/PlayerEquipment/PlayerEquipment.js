/**
 * UI/Components/PlayerEquipment/PlayerEquipment.js
 *
 * Other player's Equipment window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                 = require('DB/DBManager');
	var Renderer           = require('Renderer/Renderer');
	var Camera             = require('Renderer/Camera');
	var SpriteRenderer     = require('Renderer/SpriteRenderer');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var Equipment          = require('UI/Components/Equipment/Equipment');
	var jQuery             = require('Utils/jquery');


	/**
	 * Create Component
	 */
	var PlayerEquipment = Equipment.clone('PlayerEquipment', true);

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PlayerEquipment);
});
