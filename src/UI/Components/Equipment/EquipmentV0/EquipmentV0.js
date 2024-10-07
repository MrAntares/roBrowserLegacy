/**
 * UI/Components/Equipment/EquipmentV0/EquipmentV0.js
 *
 * Chararacter Equipment window
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
	var StatusConst        = require('DB/Status/StatusState');
	var EquipLocation      = require('DB/Items/EquipmentLocation');
	var Network            = require('Network/NetworkManager');
	var PACKET             = require('Network/PacketStructure');
	var ItemType           = require('DB/Items/ItemType');
	var jQuery             = require('Utils/jquery');
	var Client             = require('Core/Client');
	var Preferences        = require('Core/Preferences');
	var Session            = require('Engine/SessionStorage');
	var Renderer           = require('Renderer/Renderer');
	var Camera             = require('Renderer/Camera');
	var SpriteRenderer     = require('Renderer/SpriteRenderer');
	var UIVersionManager   = require('UI/UIVersionManager');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var ItemInfo           = require('UI/Components/ItemInfo/ItemInfo');
	var CartItems          = require('UI/Components/CartItems/CartItems');
	var WinStats           = require('UI/Components/WinStats/WinStats');
	var htmlText           = require('text!./EquipmentV0.html');
	var cssText            = require('text!./EquipmentV0.css');
	var getModule          = require;

	/**
	 * Create Component
	 */
	var EquipmentV0 = new UIComponent( 'EquipmentV0', htmlText, cssText );


	/**
	 * @var {Preference} window preferences
	 */
	var _preferences = Preferences.get('EquipmentV0', {
		x:        480,
		y:        200,
		show:     false,
		reduce:   false,
		stats:    false
	}, 1.0);


	/**
	 * @var {Array} equipment list
	 */
	var _list = {};


	/**
	 * @var {CanvasRenderingContext2D} canvas context
	 */
	var _ctx;


	/**
	 * @var {boolean} show equipment to other people ?
	 */
	var _showEquip = false;


	/**
	 * @var {jQuery} button that appeared when level up
	 */
	var _btnLevelUp;


	/**
	 * Initialize UI
	 */
	EquipmentV0.init = function init()
	{
		_ctx = this.ui.find('canvas')[0].getContext('2d');
		if (UIVersionManager.getEquipmentVersion() > 0) {
			// Get button to open skill when level up
			_btnLevelUp = jQuery('#lvlup_base')
				.detach()
				.mousedown(stopPropagation)
				.click(function () {
					_btnLevelUp.detach();
					EquipmentV0.ui.show();
					EquipmentV0.ui.parent().append(EquipmentV0.ui);

					if (EquipmentV0.ui.is(':visible')) {
						Renderer.render(renderCharacter);
					}
				});
		} else {
			this.ui.find('#equipment_footer').remove();
			this.ui.addClass('equipmentV0');
			this.ui.find('#lvlup_base').remove();
		}
		// Don't activate drag drop when clicking on buttons
		this.ui.find('.titlebar .base').mousedown(stopPropagation);
		this.ui.find('.titlebar .mini').click(function(){ EquipmentV0.ui.find('.panel').toggle(); });
		this.ui.find('.titlebar .close').click(function(){ EquipmentV0.ui.hide(); });

		this.ui.find('.removeOption').mousedown(onRemoveOption);
		this.ui.find('.view_status').mousedown(toggleStatus);
		this.ui.find('.show_equip').mousedown(toggleEquip);

		this.ui.find('.cartitems').click(onCartItems);


		// drag, drop items
		this.ui.on('dragover', onDragOver);
		this.ui.on('dragleave', onDragLeave);
		this.ui.on('drop', onDrop);

		// Bind items
		this.ui.find('.content')
			.on('contextmenu', '.item',  onEquipmentInfo)
			.on('dblclick',    '.item',  onEquipmentUnEquip)
			.on('mouseover',   'button', onEquipmentOver)
			.on('mouseout',    'button', onEquipmentOut);

		this.draggable(this.ui.find('.titlebar'));
	};


	function onCartItems()
	{
		if(Session.Entity.hasCart ==  false)
		{
			return;
		}
		CartItems.ui.toggle();
	}


	function onRemoveOption()
	{
		var pkt = new PACKET.CZ.REQ_CARTOFF();
		Network.sendPacket(pkt);
	}


	/**
	 * Append to body
	 */
	EquipmentV0.onAppend = function onAppend()
	{
		// Apply preferences
		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});

		// Hide window ?
		if (!_preferences.show) {
			this.ui.hide();
		}

		// Reduce window ?
		if (_preferences.reduce) {
			this.ui.find('.panel').hide();
		}

		// Show status window ?
		if (UIVersionManager.getEquipmentVersion() > 0) {
			if (!_preferences.stats) {
				this.ui.find('.status_component').hide();
				Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/viewon.bmp', function(data){
					this.ui.find('.view_status').css('backgroundImage', 'url(' + data + ')');
				}.bind(this));
			}
		}

		if (this.ui.find('canvas').is(':visible')) {
			Renderer.render(renderCharacter);
		}
	};


	/**
	 * Remove Inventory from window (and so clean up items)
	 */
	EquipmentV0.onRemove = function onRemove()
	{
		if (UIVersionManager.getEquipmentVersion() > 0) {
			_btnLevelUp.detach();
		}

		// Stop rendering
		Renderer.stop(renderCharacter);

		// Clean equipments
		_list = {};
		this.ui.find('.col1, .col3, .ammo').empty();

		// Save preferences
		_preferences.show   =  this.ui.is(':visible');
		_preferences.reduce =  this.ui.find('.panel').css('display') === 'none';
		_preferences.stats  =  this.ui.find('.status_component').css('display') !== 'none';
		_preferences.y      =  parseInt(this.ui.css('top'), 10);
		_preferences.x      =  parseInt(this.ui.css('left'), 10);
		_preferences.save();
	};


	/**
	 * Start/stop rendering character in UI
	 */
	EquipmentV0.toggle = function toggle()
	{
		this.ui.toggle();

		if (this.ui.is(':visible')) {
			Renderer.render(renderCharacter);
			if (UIVersionManager.getEquipmentVersion() > 0) {
				_btnLevelUp.detach();
			}
			this.focus();
		}
		else {
			Renderer.stop(renderCharacter);
		}
	};


	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	EquipmentV0.onShortCut = function onShurtCut( key )
	{
		switch (key.cmd) {
			case 'TOGGLE':
				this.toggle();
				break;
		}
	};


	/**
	 * Show or hide equipment
	 *
	 * @param {boolean} on
	 */
	EquipmentV0.setEquipConfig = function setEquipConfig( on )
	{
		_showEquip = on;

		Client.loadFile( DB.INTERFACE_PATH + 'checkbox_' + (on ? '1' : '0') + '.bmp', function(data){
			EquipmentV0.ui.find('.show_equip').css('backgroundImage', 'url(' + data + ')');
		});
	};


	/**
	 * Add an equipment to the window
	 *
	 * @param {Item} item
	 */
	EquipmentV0.equip = function equip( item, location )
	{
		var it            = DB.getItemInfo( item.ITID );
		_list[item.index] = item;

		if (arguments.length === 1) {
			if ('WearState' in item) {
				location = item.WearState;
			}
			else if ('location' in item) {
				location = item.location;
			}
		}


		function add3Dots(string, limit) {
			var dots = "...";
			if (string.length > limit) {
				string = string.substring(0,limit) + dots;
			}

			return string;
		}

		this.ui.find(getSelectorFromLocation(location)).html(
			'<div class="item" data-index="'+ item.index +'">' +
				'<button></button>' +
				'<span class="itemName">' + add3Dots(jQuery.escape(DB.getItemName(item, {showItemGrade: false, showItemSlots: false, showItemOptions: false})), 19) + '</span>' +
			'</div>'
		);

		Client.loadFile( DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp', function(data){
			this.ui.find('.item[data-index="'+ item.index +'"] button').css('backgroundImage', 'url('+ data +')');
		}.bind(this));

		var Inventory = getModule('UI/Components/Inventory/Inventory');

		if (!Inventory.getUI().equippedItems.includes(item.index)) {
			Inventory.getUI().equippedItems.push(item.index);
		}
	};


	/**
	 * Remove equipment from window
	 *
	 * @param {number} item index
	 * @param {number} item location
	 */
	EquipmentV0.unEquip = function unEquip( index, location )
	{
		var selector = getSelectorFromLocation( location );
		var item     = _list[ index ];

		this.ui.find( selector ).empty();
		delete _list[ index ];

		return item;
	};


	/**
	 * Add the button when leveling up
	 */
	EquipmentV0.onLevelUp = function onLevelUp()
	{
		if (UIVersionManager.getEquipmentVersion() > 0) {
			_btnLevelUp.appendTo('body');
		}
	};


	/**
	 * Stop an event to propagate
	 */
	function stopPropagation( event )
	{
		event.stopImmediatePropagation();
		return false;
	}


	/**
	 * Display or not status window
	 */
	function toggleStatus()
	{
		var self   = EquipmentV0.ui.find('.view_status');
		var status = WinStats.getUI().ui;
		var state  = status.is(':visible') ? 'on' : 'off';

		status.toggle();

		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/view' + state + '.bmp', function(data){
			self.css('backgroundImage', 'url(' + data + ')');
		});
	}


	/**
	 * Does player can see your equipment ?
	 */
	function toggleEquip()
	{
		EquipmentV0.onConfigUpdate( 0, !_showEquip ? 1 : 0 );
	}


	/**
	 * Rendering character
	 */
	var renderCharacter = function renderCharacterClosure()
	{
		var _lastState = 0;
		var _hasCart   = 0;

		var _cleanColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
		var _savedColor = new Float32Array(4);
		var _animation  = {
			tick:  0,
			frame: 0,
			repeat:true,
			play:  true,
			next:  false,
			delay: 0,
			save:  false
		};

		// Current removable options
		var HasAttachmentState =
			StatusConst.EffectState.FALCON   |
			StatusConst.EffectState.RIDING   |
			StatusConst.EffectState.DRAGON1  |
			StatusConst.EffectState.DRAGON2  |
			StatusConst.EffectState.DRAGON3  |
			StatusConst.EffectState.DRAGON4  |
			StatusConst.EffectState.DRAGON5  |
			StatusConst.EffectState.MADOGEAR |
			StatusConst.EffectState.CART1    |
			StatusConst.EffectState.CART2    |
			StatusConst.EffectState.CART3    |
			StatusConst.EffectState.CART4    |
			StatusConst.EffectState.CART5;

		var HasCartState =
			StatusConst.EffectState.CART1    |
			StatusConst.EffectState.CART2    |
			StatusConst.EffectState.CART3    |
			StatusConst.EffectState.CART4    |
			StatusConst.EffectState.CART5;

		return function renderCharacter()
		{
			var character = Session.Entity;
			var direction = character.direction;
			var headDir   = character.headDir;
			var action    = character.action;
			var animation = character.animation;

			// If state change, we have to check if the new option is removable.
			if (character.effectState !== _lastState || _hasCart !== character.hasCart) {
				_lastState = character.effectState;
				_hasCart   = character.hasCart;

				if (_lastState & HasAttachmentState  || _hasCart) {
					EquipmentV0.ui.find('.removeOption').show();
				}
				else {
					EquipmentV0.ui.find('.removeOption').hide();
				}

				if (_lastState & HasCartState || _hasCart) {
					EquipmentV0.ui.find('.cartitems').show();
				}
				else {
					EquipmentV0.ui.find('.cartitems').hide();
				}
			}

			// Set action
			Camera.direction    = 4;
			character.direction = 4;
			character.headDir   = 0;
			character.action    = character.ACTION.IDLE;
			character.animation = _animation;

			_savedColor.set(character.effectColor);
			character.effectColor.set(_cleanColor);

			// Rendering
			SpriteRenderer.bind2DContext( _ctx, 30, 130 );
			_ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height );
			character.renderEntity();

			// Revert changes
			character.direction = direction;
			character.headDir   = headDir;
			character.action    = action;
			character.animation = animation;
			character.effectColor.set(_savedColor);
		};
	}();


	/**
	 * Find elements in html base on item location
	 *
	 * @param {number} location
	 * @returns {string} selector
	 */
	function getSelectorFromLocation( location )
	{
		var selector = [];

		if (location & EquipLocation.HEAD_TOP)    selector.push('.head_top');
		if (location & EquipLocation.HEAD_MID)    selector.push('.head_mid');
		if (location & EquipLocation.HEAD_BOTTOM) selector.push('.head_bottom');
		if (location & EquipLocation.ARMOR)       selector.push('.armor');
		if (location & EquipLocation.WEAPON)      selector.push('.weapon');
		if (location & EquipLocation.SHIELD)      selector.push('.shield');
		if (location & EquipLocation.GARMENT)     selector.push('.garment');
		if (location & EquipLocation.SHOES)       selector.push('.shoes');
		if (location & EquipLocation.ACCESSORY1)  selector.push('.accessory1');
		if (location & EquipLocation.ACCESSORY2)  selector.push('.accessory2');
		if (location & EquipLocation.AMMO)        selector.push('.ammo');

		return selector.join(', ');
	}


	/**
	 * Drag an item over the equipment, show where to place the item
	 */
	function onDragOver( event )
	{
		if (window._OBJ_DRAG_) {
			var data = window._OBJ_DRAG_;
			var item, selector, ui;

			// Just support items for now ?
			if (data.type === 'item') {
				item = data.data;

				if ((item.type === ItemType.WEAPON || item.type === ItemType.EQUIP) &&
				    item.IsIdentified && !item.IsDamaged) {
					selector = getSelectorFromLocation( 'location' in item ? item.location : item.WearLocation);
					ui       = EquipmentV0.ui.find(selector);

					Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/item_invert.bmp', function(data){
						ui.css('backgroundImage', 'url('+ data + ')');
					});
				}
			}
		}

		event.stopImmediatePropagation();
		return false;
	}


	/**
	 * Drag out the window
	 */
	function onDragLeave( event )
	{
		EquipmentV0.ui.find('td').css('backgroundImage', 'none');
		event.stopImmediatePropagation();
		return false;
	}


	/**
	 * Drop an item in the equipment, equip it if possible
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

		// Just support items for now ?
		if (data && data.type === 'item') {
			item = data.data;

			if ((item.type === ItemType.WEAPON || item.type === ItemType.EQUIP || item.type === ItemType.AMMO) &&
			    item.IsIdentified && !item.IsDamaged) {
			    EquipmentV0.ui.find('td').css('backgroundImage','none');
				EquipmentV0.onEquipItem( item.index, 'location' in item ? item.location : item.WearState );
			}
		}

		event.stopImmediatePropagation();
		return false;
	}


	/**
	 * Right click on an item
	 */
	function onEquipmentInfo( event )
	{
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item  = _list[index];

		if (item) {

			// Don't add the same UI twice, remove it
			if (ItemInfo.uid === item.ITID) {
				ItemInfo.remove();
			}

			// Add ui to window
			else {
				ItemInfo.append();
				ItemInfo.uid = item.ITID;
				ItemInfo.setItem(item);
			}
		}

		event.stopImmediatePropagation();
		return false;
	}


	/**
	 * Double click on an equipment to remove it
	 */
	function onEquipmentUnEquip()
	{
		var index = parseInt(this.getAttribute('data-index'), 10);
		EquipmentV0.onUnEquip( index );
		EquipmentV0.ui.find('.overlay').hide();
	}


	/**
	 * When mouse is over an equipment, display the item name
	 */
	function onEquipmentOver()
	{
		var idx  = parseInt( this.parentNode.getAttribute('data-index'), 10);
		var item = _list[idx];

		if (!item) {
			return;
		}

		// Get back data
		var overlay = EquipmentV0.ui.find('.overlay');
		var pos     = jQuery(this).position();

		// Possible jquery error
		if (!pos.top && !pos.left) {
			return;
		}

		// Display box
		overlay.show();
		overlay.css({top: pos.top-22, left:pos.left-22});
		overlay.text(DB.getItemName(item));
	}


	/**
	 * Remove the item name
	 */
	function onEquipmentOut()
	{
		EquipmentV0.ui.find('.overlay').hide();
	}

	EquipmentV0.onUpdateOwnerName = function(){
		for (var index in _list) {
			var item = _list[index];
			if(item.slot && [0x00FF, 0x00FE, 0xFF00].includes(item.slot.card1)){
				EquipmentV0.ui.find('.item[data-index="'+ index +'"] .itemName').text( jQuery.escape(DB.getItemName(item)) );
			}
		}
	}

	EquipmentV0.getNumber = function(){
		var num = 0;
		for (var key in _list) {
			if(_list[key].location && _list[key].location != EquipLocation.AMMO){
				num++;
			}
		}
		return num;
	}

	EquipmentV0.checkEquipLoc = function checkEquipLoc( location )
	{
		return 0;
	};

	/**
	 * Method to define
	 */
	EquipmentV0.onUnEquip      = function onUnEquip(/* index */){};
	EquipmentV0.onConfigUpdate = function onConfigUpdate(/* type, value*/){};
	EquipmentV0.onEquipItem    = function onEquipItem(/* index, location */){};
	EquipmentV0.onRemoveCart   = function onRemoveCart(){};


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(EquipmentV0);
});
