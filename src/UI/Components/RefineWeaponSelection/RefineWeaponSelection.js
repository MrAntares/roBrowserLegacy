/**
 * UI/Components/RefineWeaponSelection/RefineWeaponSelection.js
 *
 * RefineWeaponSelection windows
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
	var DB          = require('DB/DBManager');
	var Client      = require('Core/Client');
	var Renderer    = require('Renderer/Renderer');
	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText    = require('text!./RefineWeaponSelection.html');
	var cssText     = require('text!./RefineWeaponSelection.css');


	/**
	 * Create RefineWeaponSelection namespace
	 */
	var RefineWeaponSelection = new UIComponent( 'RefineWeaponSelection', htmlText, cssText );


	/**
	 * Initialize UI
	 */
	RefineWeaponSelection.init = function init()
	{
		// Show at center.
		this.ui.css({
			top:  (Renderer.height- 200)/2,
			left: (Renderer.width - 200)/2
		});

		this.list  = this.ui.find('.list:first');
		this.index = 0;

		this.draggable(this.ui.find('.head'));

		// Click Events
		this.ui.find('.ok').click( this.selectIndex.bind(this) );
		this.ui.find('.cancel').click(function(){
			this.index = -1;
			this.selectIndex();
		}.bind(this) );

		// Bind events
		this.ui
			.on('dblclick', '.item', this.selectIndex.bind(this))
			.on('mousedown', '.item', function(){
				RefineWeaponSelection.setIndex( Math.floor(this.getAttribute('data-index')) );
			});
	};


	/**
	 * Add elements to the list
	 *
	 * @param {Array} list object to display
	 */
	RefineWeaponSelection.setList = function setList( list )
	{
		var i, count;
		var item, it, file, name, refine;

		RefineWeaponSelection.list.empty();
		RefineWeaponSelection.ItemList = [];

		for (i = 0, count = list.length; i < count; ++i) {
			
			// Save list
			RefineWeaponSelection.ItemList[i] = list[i];

			it   = DB.getItemInfo( list[i].ITID );
			file = it.identifiedResourceName;
			refine = list[i].RefiningLevel;
			name = (refine>0) ? '+' + refine + ' ' + it.identifiedDisplayName : it.identifiedDisplayName;

			addElement( DB.INTERFACE_PATH + 'item/' + file + '.bmp', list[i].index, name);
		}

		this.setIndex(list[0].index);
	};


	/**
	 * Add an element to the list
	 *
	 * @param {string} image url
	 * @param {index} index in list
	 * @param {string} element name
	 */
	function addElement( url, index, name)
	{
		RefineWeaponSelection.list.append(
			'<div class="item" data-index="'+ index +'">' +
				'<div class="icon"></div>' +
				'<span class="name">' + jQuery.escape(name) + '</span>' +
			'</div>'
		);

		Client.loadFile( url, function(data){
			RefineWeaponSelection.list
				.find('div[data-index='+ index +'] .icon')
				.css('backgroundImage', 'url('+ data +')');
		});
	}


	/**
	 * Change selection
	 *
	 * @param {number} id in list
	 */
	RefineWeaponSelection.setIndex = function setIndex( id )
	{
		this.list.find('div[data-index='+ this.index +']').css('backgroundColor', 'transparent');
		this.list.find('div[data-index='+ id         +']').css('backgroundColor', '#cde0ff');
		this.index = id;
	};


	/**
	 * Select a server, callback
	 */
	RefineWeaponSelection.selectIndex = function selectIndex()
	{
		this.onIndexSelected( this.index );
		this.remove();
	};
	
	/**
	 * Select a server, callback
	 */
	RefineWeaponSelection.getItemByIndex = function getItemByIndex(index){
		var list = RefineWeaponSelection.ItemList;
		
		for (var i = 0; i < list.length; i++){
			if( RefineWeaponSelection.ItemList[i].index == index ){
				return RefineWeaponSelection.ItemList[i];
			}
		}
	}

	/**
	 * Free variables once removed from HTML
	 */
	RefineWeaponSelection.onRemove = function onRemove()
	{
		this.index = 0;
	};


	/**
	 * Set new window name
	 *
	 * @param {string} title
	 */
	RefineWeaponSelection.setTitle = function setTitle( title )
	{
		this.ui.find('.head .text').text( title );
	};


	/**
	 * Functions to define
	 */
	RefineWeaponSelection.onIndexSelected = function onIndexSelected(){};


	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(RefineWeaponSelection);
});
