/**
 * UI/Components/MakeArrowSelection/MakeArrowSelection.js
 *
 * MakeArrowSelection windows
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
	var SkillInfo   = require('DB/Skills/SkillInfo');
	var Client      = require('Core/Client');
	var Renderer    = require('Renderer/Renderer');
	var UIManager   = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Inventory   = require('UI/Components/Inventory/Inventory');
	var htmlText    = require('text!./MakeArrowSelection.html');
	var cssText     = require('text!./MakeArrowSelection.css');


	/**
	 * Create MakeArrowSelection namespace
	 */
	var MakeArrowSelection = new UIComponent( 'MakeArrowSelection', htmlText, cssText );


	/**
	 * Initialize UI
	 */
	MakeArrowSelection.init = function init()
	{
		// Show at center.
		this.ui.css({
			top:  (Renderer.height- 200)/2,
			left: (Renderer.width - 200)/2
		});

		this.list  = this.ui.find('.list:first');
		this.index = 0;

		this.draggable(this.ui.find('.head'));
		this.ui.topDroppable().droppable();

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
				MakeArrowSelection.setIndex( Math.floor(this.getAttribute('data-index')) );
			});
	};


	/**
	 * Add elements to the list
	 *
	 * @param {Array} list object to display
	 */
	MakeArrowSelection.setList = function setList( list )
	{
		var i, count;
		var item, it, file, name;

		MakeArrowSelection.list.empty();

		for (i = 0, count = list.length; i < count; ++i) {

			item = list[i];
			it   = DB.getItemInfo( item.index );
			file = it.identifiedResourceName;
			name = it.identifiedDisplayName;


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
		MakeArrowSelection.list.append(
			'<div class="item" data-index="'+ index +'">' +
				'<div class="icon"></div>' +
				'<span class="name">' + jQuery.escape(name) + '</span>' +
			'</div>'
		);

		Client.loadFile( url, function(data){
			MakeArrowSelection.list
				.find('div[data-index='+ index +'] .icon')
				.css('backgroundImage', 'url('+ data +')');
		});
	}


	/**
	 * Change selection
	 *
	 * @param {number} id in list
	 */
	MakeArrowSelection.setIndex = function setIndex( id )
	{
		this.list.find('div[data-index='+ this.index +']').css('backgroundColor', 'transparent');
		this.list.find('div[data-index='+ id         +']').css('backgroundColor', '#cde0ff');
		this.index = id;
	};


	/**
	 * Select a server, callback
	 */
	MakeArrowSelection.selectIndex = function selectIndex()
	{
		this.onIndexSelected( this.index );
		this.remove();
	};



	/**
	 * Free variables once removed from HTML
	 */
	MakeArrowSelection.onRemove = function onRemove()
	{
		this.index = 0;
	};


	/**
	 * Set new window name
	 *
	 * @param {string} title
	 */
	MakeArrowSelection.setTitle = function setTitle( title )
	{
		this.ui.find('.head .text').text( title );
	};


	/**
	 * Functions to define
	 */
	MakeArrowSelection.onIndexSelected = function onIndexSelected(){};


	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(MakeArrowSelection);
});
