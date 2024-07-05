/**
 * UI/Components/Equipment/EquipmentV1/EquipmentV1.js
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
	var htmlText           = require('text!./EquipmentV1.html');
	var cssText            = require('text!./EquipmentV1.css');
	var getModule          = require;


	/**
	 * Create Component
	 */
	var EquipmentV1 = new UIComponent( 'EquipmentV1', htmlText, cssText );


	/**
	 * @var {Preference} window preferences
	 */
	var _preferences = Preferences.get('EquipmentV1', {
		x:        480,
		y:        200,
		show:     false,
		reduce:   false,
		stats:    true
	}, 1.0);


	/**
	 * @var {Array} equipment list
	 */
	var _list = {};


	/**
	 * @var {CanvasRenderingContext2D} canvas context
	 */
	var _ctx = [];


	/**
	 * @var {boolean} show equipment to other people ?
	 */
	var _showEquip = false;


	/**
	 * @var {jQuery} button that appeared when level up
	 */
	var _btnLevelUp;

	var tabLinks = new Array();
    var contentDivs = new Array();
	var currentTabId = 'general'; // Variable to store the current tab's ID

	/**
	 * Initialize UI
	 */
	EquipmentV1.init = function init()
	{
		_ctx.push(this.ui.find('canvas')[0].getContext('2d'));
		_ctx.push(this.ui.find('canvas')[1].getContext('2d'));

		// Grab the tab links and content divs from the page
		var tabListItems = document.getElementById('tabs').childNodes;
		for ( var i = 0; i < tabListItems.length; i++ ) {
		  if ( tabListItems[i].nodeName == "DIV" ) {
			var tabLink = getFirstChildWithTagName( tabListItems[i], 'A' );
			var id = getHash( tabLink.getAttribute('href') );
			tabLinks[id] = tabLink;
			contentDivs[id] = document.getElementById( id );
		  }
		}

		// Assign onclick events to the tab links, and
		// highlight the first tab
		var i = 0;

		for ( var id in tabLinks ) {
		  tabLinks[id].onclick = showTab;
		  tabLinks[id].onfocus = function() { this.blur() };
		  if ( i == 0 ) tabLinks[id].className = 'tab selected';
		  i++;
		}

		// Hide all content divs except the first
		var i = 0;

		for ( var id in contentDivs ) {
			if (contentDivs[id]) {
				if (i != 0) {
				  contentDivs[id].classList.add('content', 'hide');
				}
				i++;
			}
		}

		if (UIVersionManager.getEquipmentVersion() > 0) {
			// Get button to open skill when level up
			_btnLevelUp = jQuery('#lvlup_base')
				.detach()
				.mousedown(stopPropagation)
				.click(function () {
					_btnLevelUp.detach();
					EquipmentV1.ui.show();
					EquipmentV1.ui.parent().append(EquipmentV1.ui);

					if (EquipmentV1.ui.is(':visible')) {
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
		this.ui.find('.titlebar .mini').click(function(){ EquipmentV1.ui.find('.panel').toggle(); });
		this.ui.find('.titlebar .close').click(function(){ EquipmentV1.ui.hide(); });

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

	function showTab() {
		var selectedId = getHash( this.getAttribute('href') );

		// Highlight the selected tab, and dim all others.
		// Also show the selected content div, and hide all others.
		for ( var id in contentDivs ) {
		  if ( id == selectedId ) {
			tabLinks[id].className = 'tab selected';
			contentDivs[id].className = 'content';
		  } else {
			tabLinks[id].className = 'tab';
			contentDivs[id].classList.add('content', 'hide');
		  }
		}

		// Update the current tab ID
		currentTabId = selectedId;

		// Stop the browser following the link
		return false;
	}

	function getFirstChildWithTagName( element, tagName ) {
		for ( var i = 0; i < element.childNodes.length; i++ ) {
	 		if ( element.childNodes[i].nodeName == tagName.toUpperCase() ) {
				return element.childNodes[i];
			}
		}
	}

	function getHash( url ) {
		var hashPos = url.lastIndexOf ( '#' );
		return url.substring( hashPos + 1 );
	}

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
	EquipmentV1.onAppend = function onAppend()
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
	EquipmentV1.onRemove = function onRemove()
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
	EquipmentV1.toggle = function toggle()
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
	EquipmentV1.onShortCut = function onShurtCut( key )
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
	EquipmentV1.setEquipConfig = function setEquipConfig( on )
	{
		_showEquip = on;

		Client.loadFile( DB.INTERFACE_PATH + 'checkbox_' + (on ? '1' : '0') + '.bmp', function(data){
			EquipmentV1.ui.find('.show_equip').css('backgroundImage', 'url(' + data + ')');
		});
	};


	/**
	 * Add an equipment to the window
	 *
	 * @param {Item} item
	 */
	EquipmentV1.equip = function equip( item, location )
	{
		var it            = DB.getItemInfo( item.ITID );
		item.equipped = location;
		_list[item.index] = item;

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
				'<span class="itemName">' + add3Dots(jQuery.escape(DB.getItemName(item)), 19) + '</span>' +
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
	EquipmentV1.unEquip = function unEquip( index, location )
	{
		var selector = getSelectorFromLocation( location );
		var item     = _list[ index ];
		item.equipped = 0;

		this.ui.find( selector ).empty();
		delete _list[ index ];

		return item;
	};


	/**
	 * Add the button when leveling up
	 */
	EquipmentV1.onLevelUp = function onLevelUp()
	{
		if (UIVersionManager.getEquipmentVersion() > 0) {
			_btnLevelUp.appendTo('body');
		}
	};

	/**
	 * Check equipment location for item
	 * @param {number} location - The equipment location to check
	 * @returns {item.wItemSpriteNumber} Object with { item }
	 */
	EquipmentV1.checkEquipLoc = function checkEquipLoc( location )
	{
		for (var key in _list) {
			if(_list[key].equipped & location) {
				return _list[key].wItemSpriteNumber;
			}
		}

		return 0;
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
		if (UIVersionManager.getEquipmentVersion() > 0) {
			var status = EquipmentV1.ui.find('.status_component');
			var self   = EquipmentV1.ui.find('.view_status');
			var state  = status.is(':visible') ? 'on' : 'off';

			status.toggle();

			Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/view' + state + '.bmp', function(data){
				self.css('backgroundImage', 'url(' + data + ')');
			});
		}
	}


	/**
	 * Does player can see your equipment ?
	 */
	function toggleEquip()
	{
		EquipmentV1.onConfigUpdate( 0, !_showEquip ? 1 : 0 );
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
			var Entity = getModule('Renderer/Entity/Entity');
			var equip_character = new Entity();
			equip_character.set({
				GID: Session.Entity.GID + '_EQUIP',
				objecttype: equip_character.constructor.TYPE_PC,
				job: Session.Entity.job,
				sex: Session.Entity.sex,
				name: "",
				hideShadow: true,
				head:   Session.Entity.head,
				headpalette: Session.Entity.headpalette,
				bodypalette: Session.Entity.bodypalette,
			});

			// If state change, we have to check if the new option is removable.
			if (Session.Entity.effectState !== _lastState || _hasCart !== Session.Entity.hasCart) {
				_lastState = Session.Entity.effectState;
				_hasCart   = Session.Entity.hasCart;

				if (_lastState & HasAttachmentState  || _hasCart) {
					EquipmentV1.ui.find('.removeOption').show();
				}
				else {
					EquipmentV1.ui.find('.removeOption').hide();
				}

				if (_lastState & HasCartState || _hasCart) {
					EquipmentV1.ui.find('.cartitems').show();
				}
				else {
					EquipmentV1.ui.find('.cartitems').hide();
				}
			}

			// General Tab only shows normal headgears
			if (currentTabId === 'general') {
				equip_character.accessory  = EquipmentV1.checkEquipLoc(EquipLocation.HEAD_BOTTOM);
				equip_character.accessory2 = EquipmentV1.checkEquipLoc(EquipLocation.HEAD_TOP);
				equip_character.accessory3 = EquipmentV1.checkEquipLoc(EquipLocation.HEAD_MID);
				equip_character.robe = EquipmentV1.checkEquipLoc(EquipLocation.GARMENT);
			}
			// Costume Tab only shows costume headgears
			else if (currentTabId === 'costume') {
				equip_character.accessory  = EquipmentV1.checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
				equip_character.accessory2 = EquipmentV1.checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
				equip_character.accessory3 = EquipmentV1.checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
				equip_character.robe = EquipmentV1.checkEquipLoc(EquipLocation.COSTUME_ROBE);
			}

			_savedColor.set(equip_character.effectColor);
			equip_character.effectColor.set(_cleanColor);

			// Set action
			Camera.direction = 0;
			equip_character.direction = 0;
			equip_character.headDir   = 0;
			equip_character.action    = equip_character.ACTION.IDLE;
			equip_character.animation = _animation;

			// Rendering
			for (var i = 0; i < _ctx.length; i++) {
				var ctx = _ctx[i];
				SpriteRenderer.bind2DContext( ctx, 30, 130 );
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height );
				equip_character.renderEntity(ctx);
			}
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

		// Costume Tab
		if (location & EquipLocation.COSTUME_HEAD_TOP)    selector.push('.costume_head_top');
		if (location & EquipLocation.COSTUME_HEAD_MID)    selector.push('.costume_head_mid');
		if (location & EquipLocation.COSTUME_HEAD_BOTTOM) selector.push('.costume_head_bottom');
		if (location & EquipLocation.SHADOW_ARMOR)        selector.push('.shadow_armor');
		if (location & EquipLocation.SHADOW_WEAPON)       selector.push('.shadow_weapon');
		if (location & EquipLocation.SHADOW_SHIELD)       selector.push('.shadow_shield');
		if (location & EquipLocation.COSTUME_ROBE)     	  selector.push('.shadow_garment');
		if (location & EquipLocation.SHADOW_SHOES)        selector.push('.shadow_shoes');
		if (location & EquipLocation.SHADOW_R_ACCESSORY_SHADOW)   selector.push('.shadow_accessory1');
		if (location & EquipLocation.SHADOW_L_ACCESSORY_SHADOW)   selector.push('.shadow_accessory2');

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
					ui       = EquipmentV1.ui.find(selector);

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
		EquipmentV1.ui.find('td').css('backgroundImage', 'none');
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
			    EquipmentV1.ui.find('td').css('backgroundImage','none');
				EquipmentV1.onEquipItem( item.index, 'location' in item ? item.location : item.WearState );
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
		EquipmentV1.onUnEquip( index );
		EquipmentV1.ui.find('.overlay').hide();
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
		var overlay = EquipmentV1.ui.find('.overlay');
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
		EquipmentV1.ui.find('.overlay').hide();
	}

	EquipmentV1.onUpdateOwnerName = function(){
		for (var index in _list) {
			var item = _list[index];
			if(item.slot && [0x00FF, 0x00FE, 0xFF00].includes(item.slot.card1)){
				EquipmentV1.ui.find('.item[data-index="'+ index +'"] .itemName').text( jQuery.escape(DB.getItemName(item)) );
			}
		}
	}

	EquipmentV1.getNumber = function(){
		var num = 0;
		for (var key in _list) {
			if(_list[key].location && _list[key].location != EquipLocation.AMMO){
				num++;
			}
		}
		return num;
	}

	/**
	 * Method to define
	 */
	EquipmentV1.onUnEquip      = function onUnEquip(/* index */){};
	EquipmentV1.onConfigUpdate = function onConfigUpdate(/* type, value*/){};
	EquipmentV1.onEquipItem    = function onEquipItem(/* index, location */){};
	EquipmentV1.onRemoveCart   = function onRemoveCart(){};


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(EquipmentV1);
});
