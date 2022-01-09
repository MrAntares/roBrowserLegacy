/**
 * UI/Components/ShortCuts/ShortCuts.js
 *
 * Chararacter ShortCuts
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 * In some cases the client will send packet twice.eg NORMAL_ITEMLIST4; fixit [skybook888] 
 *
 */
 define(function(require)
 {
	 'use strict';
 
 
	 /**
	  * Dependencies
	  */
	 var DB                 = require('DB/DBManager');
	 var ItemType           = require('DB/Items/ItemType');
	 var jQuery             = require('Utils/jquery');
	 var Client             = require('Core/Client');
	 var Preferences        = require('Core/Preferences');
	 var Renderer           = require('Renderer/Renderer');
	 var Mouse              = require('Controls/MouseEventHandler');
	 var UIManager          = require('UI/UIManager');
	 var UIComponent        = require('UI/UIComponent');
	 var InputBox           = require('UI/Components/InputBox/InputBox');
	 var ItemInfo           = require('UI/Components/ItemInfo/ItemInfo');
	 var Emoticons          = require('UI/Components/Emoticons/Emoticons');
	 var htmlText           = require('text!./ShortCuts.html');
	 var cssText            = require('text!./ShortCuts.css');
	 var getModule          = require;
 
 
	 /**
	  * Create Component
	  */
	 var ShortCuts = new UIComponent( 'ShortCuts', htmlText, cssText );
 
 
	 /**
	  * Tab constant
	  */
	 ShortCuts.TAB = {
		 USABLE: 0,
		 EQUIP:  1,
		 ETC:    2
	 };
 
 
	 /**
	  * Store ShortCuts items
	  */
	 ShortCuts.list = [];
 
 
	 /**
	  * @var {number} used to remember the window height
	  */
	 var _realSize = 0;
 
 
	 /**
	  * @var {Preferences} structure
	  */
	 var _preferences = Preferences.get('ShortCuts', {
		 x:        0,
		 y:        172,
		 width:    7,
		 height:   4,
		 show:     false,
		 reduce:   false,
		 tab:      ShortCuts.TAB.USABLE,
		 magnet_top: false,
		 magnet_bottom: false,
		 magnet_left: true,
		 magnet_right: false
	 }, 1.0);
 
 
	 /**
	  * Initialize UI
	  */
	 ShortCuts.init = function Init()
	 {

		this.ui.find('.footer button').mousedown(function(){
			if( this.className == 'emoticons')
				Emoticons.onShortCut({cmd: 'TOGGLE'})
		});

		this.ui.find('.close').click(onClose);

		console.log("this.ui.find('.view button')", this.ui.find('.view button'))
		this.draggable(this.ui.find('.titlebar'));
	 };
 
 
	 /**
	  * Apply preferences once append to body
	  */
	 ShortCuts.onAppend = function OnAppend()
	 {
		if (!_preferences.show) {
			this.ui.hide();
		}

		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});
	 };
 
 
	 /**
	  * Remove ShortCuts from window (and so clean up items)
	  */
	 ShortCuts.onRemove = function OnRemove()
	 {
		 this.ui.find('.container .content').empty();
		 this.list.length = 0;
		 jQuery('.ItemInfo').remove();
 
		 // Save preferences
		 _preferences.show   =  this.ui.is(':visible');
		 _preferences.reduce = !!_realSize;
		 _preferences.y      =  parseInt(this.ui.css('top'), 10);
		 _preferences.x      =  parseInt(this.ui.css('left'), 10);
		 _preferences.width  =  Math.floor( (this.ui.width()  - (23 + 16 + 16 - 30)) / 32 );
		 _preferences.height =  Math.floor( (this.ui.height() - (31 + 19 - 30     )) / 32 );
		 _preferences.magnet_top = this.magnet.TOP;
		 _preferences.magnet_bottom = this.magnet.BOTTOM;
		 _preferences.magnet_left = this.magnet.LEFT;
		 _preferences.magnet_right = this.magnet.RIGHT;
		 _preferences.save();
	 };
 
 
	 /**
	  * Process shortcut
	  *
	  * @param {object} key
	  */
	 ShortCuts.onShortCut = function onShurtCut( key )
	 {
		switch (key.cmd) {
			case 'TOGGLE':
				this.ui.toggle();
				if (this.ui.is(':visible')) {
					this.focus();
				}
				break;
		}
	 };
 
 
	 /**
	  * Extend ShortCuts window size
	  *
	  * @param {number} width
	  * @param {number} height
	  */
	 ShortCuts.resize = function Resize( width, height )
	 {
		 width  = Math.min( Math.max(width,  6), 9);
		 height = Math.min( Math.max(height, 2), 6);
 
		 this.ui.find('.container .content').css({
			 width:  width  * 32 + 13, // 13 = scrollbar
			 height: height * 32
		 });
 
		 this.ui.css({
			 width:  23 + 16 + 16 + width  * 32,
			 height: 31 + 19      + height * 32
		 });
	 };
 
 
	 /**
	  * Get item object
	  *
	  * @param {number} id
	  * @returns {Item}
	  */
	 ShortCuts.getItemById = function GetItemById( id )
	 {
		 var i, count;
		 var list = ShortCuts.list;
 
		 for (i = 0, count = list.length; i < count; ++i) {
			 if (list[i].ITID === id) {
				 return list[i];
			 }
		 }
 
		 return null;
	 };
 
 
	 /**
	  * Search in a list for an item by its index
	  *
	  * @param {number} index
	  * @returns {Item}
	  */
	 ShortCuts.getItemByIndex = function getItemByIndex( index )
	 {
		 var i, count;
		 var list = ShortCuts.list;
 
		 for (i = 0, count = list.length; i < count; ++i) {
			 if (list[i].index === index) {
				 return list[i];
			 }
		 }
 
		 return null;
	 };
 
 
	 /**
	  * Add items to the list
	  * if the item index is exist you should clear it;[skybook888]
	  */
	 ShortCuts.setItems = function SetItems(items)
	 {
		 var i, count;
		 
		 for (i = 0, count = items.length; i < count ; ++i) {
			 var object= this.getItemByIndex(items[i].index);
			 if(object){
				 var item=this.removeItem(object.index,object.count);
			 }
			 if(this.addItemSub(items[i])){
				 this.list.push(items[i]);
			 }
			 
			 
		 }
		 
	 };
 
 
	 /**
	  * Insert Item to ShortCuts
	  *
	  * @param {object} Item
	  */
	 ShortCuts.addItem = function AddItem( item )
	 {
		 var object = this.getItemByIndex(item.index);
		 //console.log("add");
 
		 if (object) {
			 object.count += item.count;
			 this.ui.find('.item[data-index="'+ item.index +'"] .count').text( object.count );
			 this.onUpdateItem(object.ITID, object.count);
			 return;
		 }
 
		 object = jQuery.extend({}, item);
		 if (this.addItemSub(object)) {
			 this.list.push(object);
			 this.onUpdateItem(object.ITID, object.count);
		 }
	 };
 
 
	 /**
	  * Add item to ShortCuts
	  *
	  * @param {object} Item
	  */
	 ShortCuts.addItemSub = function AddItemSub( item )
	 {
		//  var tab;
		//  switch (item.type) {
		// 	 case ItemType.HEALING:
		// 	 case ItemType.USABLE:
		// 	 case ItemType.USABLE_SKILL:
		// 	 case ItemType.USABLE_UNK:
		// 		 tab = ShortCuts.TAB.USABLE;
		// 		 break;
 
		// 	 case ItemType.WEAPON:
		// 	 case ItemType.EQUIP:
		// 	 case ItemType.PETEGG:
		// 	 case ItemType.PETEQUIP:
		// 		 tab = ShortCuts.TAB.EQUIP;
		// 		 break;
 
		// 	 default:
		// 	 case ItemType.ETC:
		// 	 case ItemType.CARD:
		// 	 case ItemType.AMMO:
		// 		 tab = ShortCuts.TAB.ETC;
		// 		 break;
		//  }
 
		//  // Equip item (if not arrow)
		//  if (item.WearState && item.type !== ItemType.AMMO && item.type !== ItemType.CARD) {
		// 	 Emoticons.equip(item);
		// 	 return false;
		//  }
 
		//  if (tab === _preferences.tab) {
		// 	 var it      = DB.getItemInfo( item.ITID );
		// 	 var content = this.ui.find('.container .content');
 
		// 	 content.append(
		// 		 '<div class="item" data-index="'+ item.index +'" draggable="true">' +
		// 			 '<div class="icon"></div>' +
		// 			 '<div class="amount"><span class="count">' + (item.count || 1) + '</span></div>' +
		// 		 '</div>'
		// 	 );
 
		// 	 if (content.height() < content[0].scrollHeight) {
		// 		 this.ui.find('.hide').hide();
		// 	 }
		// 	 else {
		// 		 this.ui.find('.hide').show();
		// 	 }
 
		// 	 Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
		// 		 content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		// 	 });
		//  }
 
		 return true;
	 };
 
 
	 /**
	  * Remove item from ShortCuts
	  *
	  * @param {number} index in ShortCuts
	  * @param {number} count
	  */
	 ShortCuts.removeItem = function RemoveItem( index, count )
	 {
		//  var item = this.getItemByIndex(index);
 
		//  // Emulator failed to complete the operation
		//  // do not remove item from ShortCuts
		//  if (!item || count <= 0) {
		// 	 return null;
		//  }
 
		//  if (item.count) {
		// 	 item.count -= count;
 
		// 	 if (item.count > 0) {
		// 		 this.ui.find('.item[data-index="'+ item.index +'"] .count').text( item.count );
		// 		 this.onUpdateItem(item.ITID, item.count);
		// 		 return item;
		// 	 }
		//  }
		 
		//  this.list.splice( this.list.indexOf(item), 1 );
		//  this.ui.find('.item[data-index="'+ item.index +'"]').remove();
		//  this.onUpdateItem(item.ITID, 0);
 
		//  var content = this.ui.find('.container .content');
		//  if (content.height() === content[0].scrollHeight) {
		// 	 this.ui.find('.hide').show();
		//  }
 
		 return item;
	 };
 
 
	 /**
	  * Remove item from ShortCuts
	  *
	  * @param {number} index in ShortCuts
	  * @param {number} count
	  */
	 ShortCuts.updateItem = function UpdateItem( index, count )
	 {
		//  var item = this.getItemByIndex(index);
 
		//  if (!item) {
		// 	 return;
		//  }
 
		//  item.count = count;
 
		//  // Update quantity
		//  if (item.count > 0) {
		// 	 this.ui.find('.item[data-index="'+ item.index +'"] .count').text( item.count );
		// 	 this.onUpdateItem(item.ITID, item.count);
		// 	 return;
		//  }
 
		//  // no quantity, remove
		//  this.list.splice( this.list.indexOf(item), 1 );
		//  this.ui.find('.item[data-index="'+ item.index +'"]').remove();
		//  this.onUpdateItem(item.ITID, 0);
 
		//  var content = this.ui.find('.container .content');
		//  if (content.height() === content[0].scrollHeight) {
		// 	 this.ui.find('.hide').show();
		//  }
	 };
 
 
	 /**
	  * Use an item
	  *
	  * @param {Item} item
	  */
	 ShortCuts.useItem = function UseItem( item )
	 {
		//  switch (item.type) {
 
		// 	 // Usable item
		// 	 case ItemType.HEALING:
		// 	 case ItemType.USABLE:
		// 	 case ItemType.USABLE_UNK:
		// 		 ShortCuts.onUseItem( item.index );
		// 		 break;
 
		// 	 // Use card
		// 	 case ItemType.CARD:
		// 		 ShortCuts.onUseCard( item.index );
		// 		 break;
 
		// 	 case ItemType.USABLE_SKILL:
		// 		 break;
 
		// 	 // Equip item
		// 	 case ItemType.WEAPON:
		// 	 case ItemType.EQUIP:
		// 	 case ItemType.PETEQUIP:
		// 	 case ItemType.AMMO:
		// 		 if (item.IsIdentified && !item.IsDamaged) {
		// 			 ShortCuts.onEquipItem( item.index, item.location );
		// 		 }
		// 		 break;
		//  }
 
		 return;
	 };
 
 
	/**
	 * Exit window
	 */
	function onClose()
	{
		ShortCuts.ui.hide();
	}
 
 
	 /**
	  * Extend ShortCuts window size
	  */
	 function onResize()
	 {
		 var ui      = ShortCuts.ui;
		 var content = ui.find('.container .content');
		 var hide    = ui.find('.hide');
		 var top     = ui.position().top;
		 var left    = ui.position().left;
		 var lastWidth  = 0;
		 var lastHeight = 0;
		 var _Interval;
 
		 function resizing()
		 {
			 var extraX = 23 + 16 + 16 - 30;
			 var extraY = 31 + 19 - 30;
 
			 var w = Math.floor( (Mouse.screen.x - left - extraX) / 32 );
			 var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );
 
			 // Maximum and minimum window size
			 w = Math.min( Math.max(w, 6), 9);
			 h = Math.min( Math.max(h, 2), 6);
 
			 if (w === lastWidth && h === lastHeight) {
				 return;
			 }
 
			 ShortCuts.resize( w, h );
			 lastWidth  = w;
			 lastHeight = h;
 
			 //Show or hide scrollbar
			 if (content.height() === content[0].scrollHeight) {
				 hide.show();
			 }
			 else {
				 hide.hide();
			 }
		 }
 
		 // Start resizing
		 _Interval = setInterval( resizing, 30);
 
		 // Stop resizing on left click
		 jQuery(window).on('mouseup.resize', function(event){
			 if (event.which === 1) {
				 clearInterval(_Interval);
				 jQuery(window).off('mouseup.resize');
			 }
		 });
	 }
 
 
	 /**
	  * Modify tab, filter display entries
	  */
	 function onSwitchTab()
	 {
		 var idx          = jQuery(this).index();
		 _preferences.tab = parseInt(idx, 10);
 
		 Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_0'+ (idx+1) +'.bmp', function(data){
			 ShortCuts.ui.find('.tabs').css('backgroundImage', 'url(' + data + ')');
			 requestFilter();
		 });
	 }
 
 
	 /**
	  * Hide/show ShortCuts's content
	  */
	 function onToggleReduction()
	 {
		 var ui = ShortCuts.ui;
 
		 if (_realSize) {
			 ui.find('.panel').show();
			 ui.height(_realSize);
			 _realSize = 0;
		 }
		 else {
			 _realSize = ui.height();
			 ui.height(17);
			 ui.find('.panel').hide();
		 }
	 }
 
 
	 /**
	  * Update tab, reset ShortCuts content
	  */
	 function requestFilter()
	 {
		 ShortCuts.ui.find('.container .content').empty();
 
		 var list = ShortCuts.list;
		 var i, count;
 
		 for (i = 0, count = list.length; i < count; ++i) {
			 ShortCuts.addItemSub( list[i] );
		 }
	 }
 
 
	 /**
	  * Drop an item from storage to ShortCuts
	  *
	  * @param {event}
	  */
	 function onDrop( event )
	 {
		 var item, data;
		 event.stopImmediatePropagation();
 
		 try {
			 data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
			 item = data.data;
		 }
		 catch(e) {
			 return false;
		 }
 
		 // Just allow item from storage
		 if (data.type !== 'item' || (data.from !== 'Storage' && data.from !== 'CartItems')) {
			 return false;
		 }
 
		 // Have to specify how much
		 if (item.count > 1) 
		 {
			 InputBox.append();
			 InputBox.setType('number', false, item.count);
			 
			 InputBox.onSubmitRequest = function OnSubmitRequest( count ) 
			 {
				 InputBox.remove();
				 
					 switch(data.from)
					 {
					 case 'Storage':
						 getModule('UI/Components/Storage/Storage').reqRemoveItem(
							 item.index,
							 parseInt(count, 10 )
							 );
					 break;
					 
					 case 'CartItems':
						 getModule('UI/Components/CartItems/CartItems').reqRemoveItem(
							 item.index,
							 parseInt(count, 10 )
							 );
					 break;					
				 
					 }
			 };
			 return false;
		 }
		 
		 switch(data.from)
		 {
			 case 'Storage':
				 getModule('UI/Components/Storage/Storage').reqRemoveItem( item.index, 1 );
			 break;
					 
			 case 'CartItems':
				 getModule('UI/Components/CartItems/CartItems').reqRemoveItem( item.index, 1 );
			 break;							
		 }
 
		 return false;
	 }
 
 
	 /**
	  * Block the scroll to move 32px at each move
	  */
	 function onScroll( event )
	 {
		 var delta;
 
		 if (event.originalEvent.wheelDelta) {
			 delta = event.originalEvent.wheelDelta / 120 ;
			 if (window.opera) {
				 delta = -delta;
			 }
		 }
		 else if (event.originalEvent.detail) {
			 delta = -event.originalEvent.detail;
		 }
 
		 this.scrollTop = Math.floor(this.scrollTop/32) * 32 - (delta * 32);
		 event.stopImmediatePropagation();
		 return false;
	 }
 
 
	 /**
	  * Show item name when mouse is over
	  */
	 function onItemOver()
	 {
		 var idx  = parseInt( this.getAttribute('data-index'), 10);
		 var item = ShortCuts.getItemByIndex(idx);
 
		 if (!item) {
			 return;
		 }
 
		 // Get back data
		 var pos     = jQuery(this).position();
		 var overlay = ShortCuts.ui.find('.overlay');
 
		 // Display box
		 overlay.show();
		 overlay.css({top: pos.top, left:pos.left+35});
		 overlay.text(DB.getItemName(item) + ' ' + (item.count || 1) + ' ea');
 
		 if (item.IsIdentified) {
			 overlay.removeClass('grey');
		 }
		 else {
			 overlay.addClass('grey');
		 }
	 }
 
 
	 /**
	  * Hide the item name
	  */
	 function onItemOut()
	 {
		 ShortCuts.ui.find('.overlay').hide();
	 }
 
 
	 /**
	  * Start dragging an item
	  */
	 function onItemDragStart( event )
	 {
		 var index = parseInt(this.getAttribute('data-index'), 10);
		 var item  = ShortCuts.getItemByIndex(index);
 
		 if (!item) {
			 return;
		 }
 
		 // Set image to the drag drop element
		 var img   = new Image();
		 var url   = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1];
		 img.src   = url.replace(/^\"/, '').replace(/\"$/, '');
 
		 event.originalEvent.dataTransfer.setDragImage( img, 12, 12 );
		 event.originalEvent.dataTransfer.setData('Text',
			 JSON.stringify( window._OBJ_DRAG_ = {
				 type: 'item',
				 from: 'ShortCuts',
				 data:  item
			 })
		 );
 
		 onItemOut();
	 }
 
 
	 /**
	  * Stop dragging an item
	  *
	  */
	 function onItemDragEnd()
	 {
		 delete window._OBJ_DRAG_;
	 }
 
 
	 /**
	  * Get item info (open description window)
	  */
	 function onItemInfo( event )
	 {
		 event.stopImmediatePropagation();
 
		 var index = parseInt(this.getAttribute('data-index'), 10);
		 var item  = ShortCuts.getItemByIndex(index);
 
		 if (!item) {
			 return false;
		 }
 
		 // Don't add the same UI twice, remove it
		 if (ItemInfo.uid === item.ITID) {
			 ItemInfo.remove();
			 return false;
		 }
 
		 // Add ui to window
		 ItemInfo.append();
		 ItemInfo.uid = item.ITID;
		 ItemInfo.setItem(item);
 
		 return false;
	 }
 
 
	 /**
	  * Ask to use an item
	  */
	 function onItemUsed( event )
	 {
		 var index = parseInt(this.getAttribute('data-index'), 10);
		 var item  = ShortCuts.getItemByIndex(index);
 
		 if (item) {
			 ShortCuts.useItem(item);
			 onItemOut();
		 }
 
		 event.stopImmediatePropagation();
		 return false;
	 }
 
 
	 /**
	  * functions to define
	  */
	 ShortCuts.onUseItem    = function OnUseItem(/* index */){};
	 ShortCuts.onUseCard    = function onUseCard(/* index */){};
	 ShortCuts.onEquipItem  = function OnEquipItem(/* index, location */){};
	 ShortCuts.onUpdateItem = function OnUpdateItem(/* index, amount */){};
 
 
	 /**
	  * Create component and export it
	  */
	 return UIManager.addComponent(ShortCuts);
 });
 