/**
 * UI/Components/Vending/Vending.js
 *
 * Chararacter Basic information windows
 *
 *
 * @author Vincent Thibault
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var jQuery       = require('Utils/jquery');
	var DB           = require('DB/DBManager');
	var Network          = require('Network/NetworkManager');
	var PACKET           = require('Network/PacketStructure');	
	var ItemType     = require('DB/Items/ItemType');
	var Client       = require('Core/Client');
	var Preferences  = require('Core/Preferences');
	var Session      = require('Engine/SessionStorage');
	var Mouse        = require('Controls/MouseEventHandler');
	var KEYS         = require('Controls/KeyEventHandler');
	var UIManager    = require('UI/UIManager');
	var UIComponent  = require('UI/UIComponent');
	var ItemInfo     = require('UI/Components/ItemInfo/ItemInfo');
	var InputBox     = require('UI/Components/InputBox/InputBox');
	var ChatBox      = require('UI/Components/ChatBox/ChatBox');
	var CartItems    = require('UI/Components/CartItems/CartItems');
	var VendingModelMessage = require('UI/Components/Vending/VendingModelMessage/VendingModelMessage');
	var htmlText     = require('text!./Vending.html');
	var cssText      = require('text!./Vending.css');
	var Renderer     = require('Renderer/Renderer');


	/**
	 * Create NPC Menu component
	 */
	var Vending = new UIComponent( 'Vending', htmlText, cssText );



	/**
	 * Freeze the mouse
	 */
	//Vending.mouseMode = UIComponent.MouseMode.FREEZE;


	/**
	 * @var {Preferences} 
	 */
	var _preferences = Preferences.get('Vending', {
		inputWindow: {
			x:    100,
			y:    100,
			height: 2
		},
		outputWindow: {
			x:    100 + 280 + 10,
			y:    100 + (7*32) - (2*32),
			height: 5
		},
		select_all: false
	}, 1.0);


	/**
	 * @var {Array} item list
	 */
	var _input = [];


	/**
	 * @var {Array} output list
	 */
	var _output = [];
	var _slots = 0;


	/**
	 * @var {number} type (buy/sell)
	 */
	var _type;
	
	var _shopname = '';
	
	function isItemStackable(item){
		if(
			item.type === ItemType.WEAPON ||
			item.type === ItemType.EQUIP  ||
			item.type === ItemType.PETEGG ||
			item.type === ItemType.PETEQUIP
		){
			return false;
		} else {
			return true;
		}
	};


	/**
	 * Initialize component
	 */
	Vending.init = function init()
	{
		var ui           = this.ui;
		var InputWindow  = ui.find('.InputWindow');
		var OutputWindow = ui.find('.OutputWindow');

		// Client do not send packet
		//ui.find('.btn.cancel').click(this.remove.bind(this));
		ui.find('.btn.sell').click(function(e){
			e.stopImmediatePropagation();
			Vending.onSubmit();
		});
		this.ui.find('.btn.cancel').click(function(e){
			e.stopImmediatePropagation();
			Vending.onRemove();
		});
		
		InputWindow.find('.footer .extend').mousedown(onResizeInput);


		// Items options
		ui.find('.content')
			.on('mousewheel DOMMouseScroll', onScroll)
			.on('contextmenu',      '.icon', onItemInfo)
			.on('dblclick',         '.item', onItemSelected)
			.on('mousedown',        '.item', onItemFocus);

		// Drop items
		ui.find('.InputWindow, .OutputWindow')
			.on('dragover', function(event) {
				event.stopImmediatePropagation();
				return false;
			})
			.on('mousedown', function(){
				Vending.focus();
			});

		
		

		// Hacky drag drop
		this.draggable.call({ui: InputWindow },  InputWindow.find('.titlebar'));
		this.draggable.call({ui: OutputWindow }, OutputWindow.find('.titlebar'));
		this.ui.find('.InputWindow, .OutputWindow').topDroppable({drop: onDrop}).droppable();

		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/itemwin_mid.bmp', function(data){
			Vending.itemBg = data;
		});
	};


	/**
	 * Player should not be able to move when the store is opened
	 */
	Vending.onAppend = function onAppend()
	{
		var InputWindow  = this.ui.find('.InputWindow');
		var OutputWindow = this.ui.find('.OutputWindow');
		
		InputWindow.css({
			top:  Math.min( Math.max( 0, _preferences.inputWindow.y), Renderer.height - InputWindow.find('.content').height()),
			left: Math.min( Math.max( 0, _preferences.inputWindow.x), Renderer.width  - InputWindow.find('.content').width())
		});
		OutputWindow.css({
			top:  Math.min( Math.max( 0, _preferences.outputWindow.y), Renderer.height - OutputWindow.find('.content').height()),
			left: Math.min( Math.max( 0, _preferences.outputWindow.x), Renderer.width  - OutputWindow.find('.content').width())
		});

		resize( InputWindow.find('.content'),  _preferences.inputWindow.height );
		resize( OutputWindow.find('.content'), _preferences.outputWindow.height );

		// Seems like "EscapeWindow" is execute first, push it before.
		//var events = jQuery._data( window, 'events').keydown;
		//events.unshift( events.pop() );		
		
		this.ui.hide();
	};
	
	/**
	 * Resize the content
	 *
	 * @param {jQueryElement} content
	 * @param {number} height
	 */
	function resize( content, height )
	{
		height = Math.min( Math.max(height, 2), 9);
		content.css('height', height * 32);
	}	


	/**
	 * Released movement and save preferences
	 */
	Vending.onRemove = function onRemove()
	{
		
		var pkt = new PACKET.CZ.REQ_OPENSTORE2();
		pkt.storeName = '';
		pkt.result = 0; // canceled vending
		pkt.storeList = [];
		submitNetworkPacket(pkt);

		VendingModelMessage.onRemove();//remove message if show

		var InputWindow  = this.ui.find('.InputWindow');
		var OutputWindow = this.ui.find('.OutputWindow');

		_input.length    = 0;
		_output.length   = 0;

		_preferences.inputWindow.x       = parseInt( InputWindow.css('left'), 10);
		_preferences.inputWindow.y       = parseInt( InputWindow.css('top'), 10);
		_preferences.inputWindow.height  = InputWindow.find('.content').height() / 32 | 0;

		_preferences.outputWindow.x      = parseInt( OutputWindow.css('left'), 10);
		_preferences.outputWindow.y      = parseInt( OutputWindow.css('top'), 10);
		_preferences.outputWindow.height = OutputWindow.find('.content').height() / 32 | 0;

		_preferences.save();

		this.ui.find('.content').empty();
		
		this.ui.hide();		
	};


	/**
	 * Key Listener
	 *
	 * Remove the UI when Escape key is pressed
	 */
	Vending.onKeyDown = function onKeyDown( event )
	{
		if (event.which === KEYS.ESCAPE) {
			this.remove();
			event.stopImmediatePropagation();
			return false;
		}

		return true;
	};
	
	

	/**
	 * Add items to list
	 *
	 * @param {Array} item list
	 */
	Vending.setList = function setList( items )
	{
		var i, count;
		var it, item, out, content;

		this.ui.find('.content').empty();

		_input.length  = 0;
		_output.length = 0;
		
		
		content        = this.ui.find('.InputWindow .content');

		{		
				for (i = 0, count = items.length; i < count; ++i) {
					

					if (!('index' in items[i])) {
						items[i].index = i;
					}
					
					if(isItemStackable(items[i])){
						items[i].IsStackable = true;
					} else {
						items[i].IsStackable = false;
					}
					
					if(!(items[i].hasOwnProperty('count'))){
						items[i].count = 1;
					}
					
					out                   = jQuery.extend({}, items[i]);
					out.count             = 0;

					addItem( content, items[i], true);

					_input[items[i].index]  = items[i];
					_output[items[i].index] = out;
				}
		}
	};




	/**
	 * Prettify zeny : 1000000 -> 1,000,000
	 *
	 * @param {number} zeny
	 * @param {boolean} use color
	 * @return {string}
	 */
	function prettyZeny( val, useStyle )
	{
		
		var list = val.toString().split('');
		var i, count = list.length;
		var str = '';

		for (i = 0; i < count; i++) {
			str = list[count-i-1] + (i && i%3 ===0 ? ',' : '') + str;
		}

		if (useStyle) {
			var style = [
				'color:#000000; text-shadow:1px 0px #00ffff;', // 0 - 9
				'color:#0000ff; text-shadow:1px 0px #ce00ce;', // 10 - 99
				'color:#0000ff; text-shadow:1px 0px #00ffff;', // 100 - 999
				'color:#ff0000; text-shadow:1px 0px #ffff00;', // 1,000 - 9,999
				'color:#ff18ff;',                              // 10,000 - 99,999
				'color:#0000ff;',                              // 100,000 - 999,999
				'color:#000000; text-shadow:1px 0px #00ff00;', // 1,000,000 - 9,999,999
				'color:#ff0000;',                              // 10,000,000 - 99,999,999
				'color:#000000; text-shadow:1px 0px #cece63;', // 100,000,000 - 999,999,999
				'color:#ff0000; text-shadow:1px 0px #ff007b;', // 1,000,000,000 - 9,999,999,999
			];
			str = '<span style="' + style[count-1] + '">' + str + '</span>';
		}

		return str;
	}


	/**
	 * Add item to the list
	 *
	 * @param {jQuery} content element
	 * @param {Item} item info
	 */
	function addItem( content, item , isinput)
	{
		var it      = DB.getItemInfo(item.ITID);
		var element = content.find('.item[data-index='+ item.index +']:first').parent('.item-container');
		var price;
		var textPrice = DB.getMessage(1721); 

		// 0 as amount ? remove it
		if (item.count === 0) {
			if (element.length) {
				element.remove();
			}
			return;
		}

		// Already here, update it
		// Note: just the amount can be updated ?
		if (element.length) {
			element.find('.amount').text(item.IsStackable ? item.count : '');
			return;
		}

		if(isinput==false){
			price = prettyZeny(item.price, true);
		}

		// Create it
		if(isinput == true)
		{
			var itemObj = jQuery(
				'<div class="item-container"><div class="item" draggable="true" data-index="'+ item.index +'">' +
					'<div class="icon"></div>' +
					'<div class="amount">' + (item.IsStackable ? item.count : '') + '</div>' +
					'<div class="name">'+ jQuery.escape(DB.getItemName(item)) +'</div>' +
				'</div></div>'
			);		
		}
		else
		{
			var itemObj = jQuery(
				'<div class="item-container"><div class="item" draggable="true" data-index="'+ item.index +'">' +
					'<div class="icon"></div>' +
					'<div class="amount">' + (item.IsStackable ? item.count : '') + '</div>' +
					'<div class="name">'+ jQuery.escape(DB.getItemName(item)) +'</div>' +
					'<div class="price">'+textPrice+' '+ price +'</div>' +
				'</div></div>'
			);
		}

		if(item.IsDamaged){
			itemObj.css('backgroundImage', 'url("' + Vending.itemBg + '")');
			itemObj.addClass('damaged');
		}

		content.find('.item[data-index='+ item.index +']:first').draggable({
			refreshPositions: true,
			helper: "clone",
			cursor: false,
			zIndex: 2500,
			appendTo: "body",
			containment: "window",
			scroll: false,
			start: onDragStart,
			stop: function(){
				delete window._OBJ_DRAG_;
			},
			cursorAt: {
				left: 12, 
				top: 12
			}
		});

		content.append(itemObj);

		// Add the icon once loaded
		Client.loadFile( DB.INTERFACE_PATH + 'item/' + (item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) + '.bmp', function(data){
			content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		});
	}


	/**
	 * Transfer item from input to output (or the inverse)
	 *
	 * @param {jQueryElement} from content (input / output)
	 * @param {jQueryElement} to content (input / output)
	 * @param {boolean} is adding the content to the output element
	 * @param {number} item index
	 * @param {number} amount
	 */
	var transferItem = function transferItemQuantityClosure()
	{
		var tmpItem = {};

		return function transferItem(fromContent, toContent, isAdding, index, count)
		{
			// Add item to the list
			if (isAdding) {
				
				if(!_input[index].IsIdentified){
					VendingModelMessage.setInit(603);
					return;
				}
				
				_output[index].count = Math.min( _output[index].count + count, _input[index].count);

				// Update input ui item amount
				tmpItem = jQuery.extend({}, _input[index]);
				tmpItem.count = _input[index].count - _output[index].count;

				addItem( fromContent, tmpItem, true);
				addItem( toContent, _output[index], false);
			}

			// Remove item
			else {
				count = Math.min(count, _output[index].count);
				if (!count) {
					return;
				}

				_output[index].count = _output[index].count - count;

				// Update input ui item amount
				tmpItem = jQuery.extend({}, _input[index]);
				tmpItem.count = _input[index].count + _output[index].count;

				addItem( fromContent, _output[index], false);
				addItem( toContent,   tmpItem, true);
			}

			//Vending.calculateCost();
		};
	}();


	/**
	 * Request move item from box to another
	 *
	 * @param {number} item index
	 * @param {jQueryElement} from the content
	 * @param {jQueryElement} to the content
	 * @param {boolean} add the content to the output box ?
	 */
	function requestMoveItem( index, fromContent, toContent, isAdding)
	{
		console.log(isAdding);
		var item, count, item_price;

		item        = isAdding ? _input[index] : _output[index];

		if (isAdding) {
			// Don't add more than max Vending capacity
			if(!(countSlotsUsed() < _slots)){
				return false;
			}
			
			count = _input[index].count;
		}
		else {
			count = _output[index].count;
		}

		/*// Can't buy more than one same stackable item
		if ((_type === Vending.Type.BUY || _type === Vending.Type.VENDING_STORE) && !item.IsStackable && isAdding) {
			if (toContent.find('.item[data-index="'+ item.index +'"]:first').length) {
				return false;
			}
		}*/

		// Just one item amount
		if (item.count === 1 || !item.IsStackable/* || (_type === Vending.Type.SELL && _preferences.select_all)*/) {
			
			if(isAdding)
			{
				// Have to specify an price
				InputBox.append();
				InputBox.setType('price', false, item_price);
				InputBox.onSubmitRequest = function(item_price) {
					InputBox.remove();
					_output[index].price = item_price;
					if(item_price > 0)
					{
						transferItem(fromContent, toContent, isAdding, index, item.count );
					}
				};
			}
			else
			{			
				transferItem(fromContent, toContent, isAdding, index, item.count);
			}
			return false;
		}

		// Have to specify an amount
		InputBox.append();
		InputBox.setType('number', false, count);
		InputBox.onSubmitRequest = function(count) {
			InputBox.remove();
			if (count > 0) {
				
				if(isAdding)
				{
					// Have to specify an price
					InputBox.append();
					InputBox.setType('price', false, item_price);
					InputBox.onSubmitRequest = function(item_price) {
						InputBox.remove();
						_output[index].price = item_price;
						if(item_price > 0)
						{
							transferItem(fromContent, toContent, isAdding, index, count);
						}
					};
				}
				else
				{			
					transferItem(fromContent, toContent, isAdding, index, count);
				}
			}
		};
	}


	/**
	 * Drop an input in the InputWindow or OutputWindow
	 *
	 * @param {jQueryEvent} event
	 */
	function onDrop( event )
	{
		var data, thisClass;

		event.stopImmediatePropagation();

		try {
			data = window._OBJ_DRAG_;
		}
		catch(e) {
			return false;
		}

		if((data && typeof data.container === 'undefined')){
			return false;
		}

		if(data.container.includes('InputWindow')){
			data.container = 'InputWindow';
		}
		if(data.container.includes('OutputWindow')){
			data.container = 'OutputWindow';
		}

		thisClass = this.className.includes('OutputWindow') ? 'OutputWindow' : 'InputWindow';

		// Just allow item from store
		if (data.type !== 'item' || data.from !== 'Vending' || data.container === thisClass) {
			return false;
		}

		requestMoveItem(
			data.index,
			jQuery('.' + data.container + ' .content'),
			jQuery(this).find('.content'),
			thisClass === 'OutputWindow'
		);

		return false;
	}


	/**
	 * Get informations about an item
	 */
	function onItemInfo(event)
	{
		event.stopImmediatePropagation();
		
		var index = parseInt( this.parentNode.getAttribute('data-index'), 10);
		var item  = _input[index];


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
	 * Select an item, put it on the other box
	 */
	function onItemSelected()
	{
		var input, from, to;

		if (_type === Vending.Type.BUY || _type === Vending.Type.VENDING_STORE) {
			return;
		}

		input = Vending.ui.find('.InputWindow:first');

		if (jQuery.contains(input.get(0), this)) {
			from = input;
			to   = Vending.ui.find('.OutputWindow:first');
		}
		else {
			from = Vending.ui.find('.OutputWindow:first');
			to   = input;
		}

		requestMoveItem(
			parseInt( this.getAttribute('data-index'), 10),
			from.find('.content:first'),
			to.find('.content:first'),
			from === input
		);
	}


	/**
	 * Focus an item
	 */
	function onItemFocus()
	{
		Vending.ui.find('.item.selected').removeClass('selected');
		jQuery(this).addClass('selected');
	}


	/**
	 * Update scroll by block (32px)
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
		return false;
	}


	/**
	 * Start dragging an item
	 */
	function onDragStart( event )
	{
		var container;
		var InputWindow, OutputWindow;

		InputWindow  = Vending.ui.find('.InputWindow:first').get(0);
		OutputWindow = Vending.ui.find('.OutputWindow:first').get(0);

		container = (jQuery.contains(InputWindow, this) ? InputWindow : OutputWindow).className;

		window._OBJ_DRAG_ = {
			type:      'item',
			from:      'Vending',
			container: container,
			index:     this.getAttribute('data-index')
		}
	}
	
	/**
	 * Extend InputWindow size
	 */
	function onResizeInput()
	{
		var InputWindow  = Vending.ui.find('.InputWindow');
		var content = InputWindow.find('.container .content');
		var top     = InputWindow.position().top;
		var left    = InputWindow.position().left;
		var lastHeight = 0;
		var _Interval;

		function resizing()
		{
			var extraY = 31 + 19 - 30;

			var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );

			// Maximum and minimum window size
			h = Math.min( Math.max(h, 2), 6);

			if (h === lastHeight) {
				return;
			}

			resize( content, h );
			lastHeight = h;

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

	Vending.onVendingSkill = function onVendingSkill(pkt)
	{
		_slots = pkt.itemcount;
		this.setList(CartItems.list);
		this.ui.find('.add_shop')[0].style.height = (32 * _slots) + 'px';
		this.ui.find('.shopname').val('');
		this.ui.show();
	};


	Vending.onSubmit = function onSubmit()
	{
		
		var output;
		var i, count,shopname,ctr = 0;

		output = [];
		count  = _output.length;
		
		shopname = this.ui.find('.shopname').val();

		for (i = 0; i < count; ++i) {
			if (_output[i] && _output[i].count) {
				output.push(_output[i]);
				ctr++;
			}
		}

		if(ctr < 1)
		{
			VendingModelMessage.setInit(2494);
			return;
		}
	
        var pkt = new PACKET.CZ.REQ_OPENSTORE2();
		pkt.storeName = shopname;
		pkt.result = 1;
		pkt.storeList = output;

		if(!shopname)
		{
			VendingModelMessage.setInit(225);
			return;
		}
		else
		{
			this._shopname = shopname;
			submitNetworkPacket(pkt);
		}	
		
		this.onRemove();
		 
	};
	
	function countSlotsUsed(){
		var count = 0;
		_output.forEach((item) => {
			if(item.count > 0) { count++; }
		});
		return count;
	}


	function submitNetworkPacket(pkt)
	{
		Network.sendPacket(pkt);
	}


	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(Vending);
});
