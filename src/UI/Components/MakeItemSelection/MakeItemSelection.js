/**
 * UI/Components/MakeItemSelection/MakeItemSelection.js
 *
 * MakeItemSelection windows
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
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
	var htmlText    = require('text!./MakeItemSelection.html');
	var cssText     = require('text!./MakeItemSelection.css');


	/**
	 * Create MakeItemSelection namespace
	 */
	var MakeItemSelection = new UIComponent( 'MakeItemSelection', htmlText, cssText );
	
	var validMaterials = 	[	
								1000 //star crumb
								,997 //great nature
								,996 //rough wind
								,995 //mystic frozen
								,994 //flame heart
							];

	/**
	 * Initialize UI
	 */
	MakeItemSelection.init = function init()
	{
		// Show at center.
		this.ui.css({
			top:  (Renderer.height- 200)/2,
			left: (Renderer.width - 200)/2
		});

		this.list  = this.ui.find('.list:first');
		this.index = 0;
		this.material = [];

		this.draggable(this.ui.find('.head'));
		
		// Click Events
		this.ui.find('.ok').click( this.advance.bind(this) );
		this.ui.find('.cancel').click(function(){
			this.index = -1;
			this.selectIndex();
		}.bind(this) );

		// Bind events
		this.ui
			.on('dblclick', '.item', this.advance.bind(this))
			.on('mousedown', '.item', function(){
				MakeItemSelection.setIndex( Math.floor(this.getAttribute('data-index')) );
			});
			
		// on drop item
		this.ui.find('.materials')
				.on('drop',     onDrop)
				.on('dragover', stopPropagation);
	};


	/**
	 * Add elements to the list
	 *
	 * @param {Array} list object to display
	 */
	MakeItemSelection.setList = function setList( list )
	{
		var i, count;
		var item, it, file, name;

		MakeItemSelection.list.empty();
		this.ui.find('.materials').empty();
		
		this.material = [];

		for (i = 0, count = list.length; i < count; ++i) {
			
			item = list[i];
			it   = DB.getItemInfo( item.ITID );
			file = it.identifiedResourceName;
			name = it.identifiedDisplayName;

			addElement( DB.INTERFACE_PATH + 'item/' + file + '.bmp', list[i].ITID, name);
		}
		
		this.ui.find('.list').css('backgroundColor', '#f7f7f7');
		this.ui.find('.materials').css('display', 'none');
		this.ui.find('.ok').unbind('click');
		this.ui.find('.ok').click( this.advance.bind(this) );
		this.setIndex(list[0].ITID);
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
		MakeItemSelection.list.append(
			'<div class="item" data-index="'+ index +'">' +
				'<div class="icon"></div>' +
				'<span class="name">' + jQuery.escape(name) + '</span>' +
			'</div>'
		);

		Client.loadFile( url, function(data){
			MakeItemSelection.list
				.find('div[data-index='+ index +'] .icon')
				.css('backgroundImage', 'url('+ data +')');
		});
	}
	
	
	/**
	 * Advances to the next screen of the item creation
	 *
	 * @param {number} index in list
	 */
	MakeItemSelection.advance = function advance(){
		var it, title;
		MakeItemSelection.list.empty();
		it   = DB.getItemInfo( this.index );
		title = it.identifiedDisplayName + ' ' + DB.getMessage(426);
		MakeItemSelection.setTitle(title);
		
		this.ui.find('.ok').unbind('click');
		this.ui.find('.ok').click( this.selectIndex.bind(this) );
		this.ui.find('.list').css('backgroundColor', '#ffffff');
		this.ui.find('.materials').css('display', 'block');
		
	};


	/**
	 * Change selection
	 *
	 * @param {number} id in list
	 */
	MakeItemSelection.setIndex = function setIndex( id )
	{
		this.list.find('div[data-index='+ this.index +']').css('backgroundColor', 'transparent');
		this.list.find('div[data-index='+ id         +']').css('backgroundColor', '#cde0ff');
		this.index = id;
	};


	/**
	 * Select a server, callback
	 */
	MakeItemSelection.selectIndex = function selectIndex()
	{
		this.onIndexSelected( this.index, this.material );
		if(this.index > -1){
			this.material.forEach(item => Inventory.removeItem(item.index, 1));
		}
		this.remove();
	};



	/**
	 * Free variables once removed from HTML
	 */
	MakeItemSelection.onRemove = function onRemove()
	{
		this.index = 0;
	};


	/**
	 * Set new window name
	 *
	 * @param {string} title
	 */
	MakeItemSelection.setTitle = function setTitle( title )
	{
		this.ui.find('.head .text').text( title );
	};


	/**
	 * Functions to define
	 */
	MakeItemSelection.onIndexSelected = function onIndexSelected(){};

	/**
	 * Insert material to creation
	 *
	 * @param {object} Item
	 */
	MakeItemSelection.addMaterial = function AddMaterial( item )
	{
		if( this.material.length < 3 && validMaterials.includes(item.ITID)){
			if (this.addItemSub(item)) {
				this.material.push(item);
			}
		}
	};
	
	/**
	 * Add item to inventory
	 *
	 * @param {object} Item
	 */
	MakeItemSelection.addItemSub = function AddItemSub( item )
	{
		
		var it      = DB.getItemInfo( item.ITID );
		var content = this.ui.find('.materials');

		content.append(
			'<div class="item" data-index="'+ item.index +'" draggable="false">' +
				'<div class="icon"></div>' +
			'</div>'
		);

		if (content.height() < content[0].scrollHeight) {
			this.ui.find('.hide').hide();
		}
		else {
			this.ui.find('.hide').show();
		}

		Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
			content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		});

		return true;
	};
	
	

	/**
	 * Drop an item from storage to inventory
	 *
	 * @param {event}
	 */
	function onDrop( event )
	{
		var item, data;

		try {
			data = JSON.parse(
				event.originalEvent.dataTransfer.getData('Text')
			);
		}
		catch(e) {}

		event.stopImmediatePropagation();

		// Just support items for now ?
		if (!data || data.type !== 'item' || data.from !== 'Inventory') {
			return false;
		}

		item = data.data;

		MakeItemSelection.addMaterial( item );
		return false;
	}


	/**
	 * Stop event propagation
	 */
	function stopPropagation( event )
	{
		event.stopImmediatePropagation();
		return false;
	}
	
	/**
	 * Create component based on view file and export it
	 */
	return UIManager.addComponent(MakeItemSelection);
});
