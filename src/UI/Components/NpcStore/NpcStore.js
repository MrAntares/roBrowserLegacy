/**
 * UI/Components/NpcStore/NpcStore.js
 *
 * Chararacter Basic information windows
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
	var jQuery       = require('Utils/jquery');
	var DB           = require('DB/DBManager');
	var ItemType     = require('DB/Items/ItemType');
	var Client       = require('Core/Client');
	var Preferences  = require('Core/Preferences');
	var Session      = require('Engine/SessionStorage');
	var Mouse        = require('Controls/MouseEventHandler');
	var Network      = require('Network/NetworkManager');
	var PACKETVER    = require('Network/PacketVerManager');
	var PACKET       = require('Network/PacketStructure');
	var KEYS         = require('Controls/KeyEventHandler');
	var UIManager    = require('UI/UIManager');
	var UIComponent  = require('UI/UIComponent');
	var ItemInfo     = require('UI/Components/ItemInfo/ItemInfo');
	var InputBox     = require('UI/Components/InputBox/InputBox');
	var ChatBox      = require('UI/Components/ChatBox/ChatBox');
	var Inventory    = require('UI/Components/Inventory/Inventory');
	var htmlText     = require('text!./NpcStore.html');
	var cssText      = require('text!./NpcStore.css');


	/**
	 * Create NPC Menu component
	 */
	var NpcStore = new UIComponent( 'NpcStore', htmlText, cssText );


	/**
	 * @var {enum} Store type
	 */
	NpcStore.Type = {
		BUY:  0,
		SELL: 1,
		VENDING_STORE: 2,
		BUYING_STORE: 3,
		MARKETSHOP: 4,
		BARTER_MARKET: 5,
		BARTER_MARKET_EXTENDED: 6,
		CASH_SHOP: 7,
	};


	/**
	 * Freeze the mouse
	 */
	NpcStore.mouseMode = UIComponent.MouseMode.FREEZE;


	/**
	 * @var {initialPreferences}
	 */
	const initialPreferences = {
		[NpcStore.Type.BARTER_MARKET_EXTENDED]: {
			inputWindow: { x: 100, y: 100, height: 7, width: 350 },
			outputWindow: { x: 100 + 350 + 10, y: 100, height: 7, width: 350 },
			AvailableItemsWindow: { x: 100 + 280 + 10, y: 100 + (4*32) - (2*32), height: 2 },
			PurchaseResult: { x: 100 + 280 + 10, y: 100 + (7*32) - (2*32), height: 2 }
		},
		DEFAULT: {
			inputWindow: { x: 100, y: 100, height: 7, width: 280 },
			outputWindow: { x: 100 + 280 + 10, y: 100 + (7*32) - (2*32), height: 2, width: 280 },
			AvailableItemsWindow: { x: 100 + 280 + 10, y: 100 + (4*32) - (2*32), height: 2 },
			PurchaseResult: { x: 100 + 280 + 10, y: 100 + (7*32) - (2*32), height: 2 }
		}
	};


	/**
	 * @var {Preferences}
	 */
	var _preferences = Preferences.get('NpcStore', {}, 1.0);


	/**
	 * @var {Array} item list
	 */
	var _input = [];


	/**
	 * @var {Array} output list
	 */
	var _output = [];


	/**
	 * @var {number} type (buy/sell)
	 */
	var _type;


	/**
	 * Initialize component
	 */
	NpcStore.init = function init()
	{
		var ui           = this.ui;
		var InputWindow  = ui.find('.InputWindow');
		var OutputWindow = ui.find('.OutputWindow');
		var AvailableItemsWindow = ui.find('.AvailableItemsWindow');
		var PurchaseResult = ui.find('.PurchaseResult');

		if (PACKETVER.value >= 20131223) {
			ui.find('.btn.cancel').click(function(){
				NpcStore.closeStore();
			});
		} else {
			ui.find('.btn.cancel').click(this.remove.bind(this));
		}

		// Client do not send packet
		ui.find('.btn.buy, .btn.sell').click(this.submit.bind(this));
		ui.find('.selectall').mousedown(onToggleSelectAmount);

		// Resize
		InputWindow.find('.resize').mousedown(function(){ onResize(InputWindow); });
		OutputWindow.find('.resize').mousedown(function(){ onResize(OutputWindow); });
		AvailableItemsWindow.find('.resize').mousedown(function(){ onResize(AvailableItemsWindow); });
		PurchaseResult.find('.resize').mousedown(function(){ onResize(PurchaseResult); });

		// Items options
		ui.find('.content')
			.on('mousewheel DOMMouseScroll', onScroll)
			.on('contextmenu',      '.icon', onItemInfo)
			.on('dblclick',         '.item', onItemSelected)
			.on('mousedown',        '.item', onItemFocus)
			.on('dragstart',        '.item', onDragStart)
			.on('dragend',          '.item', function(){
				delete window._OBJ_DRAG_;
			});

		// Drop items
		ui.find('.InputWindow, .OutputWindow, .AvailableItemsWindow')
			.on('drop', onDrop)
			.on('dragover', function(event) {
				event.stopImmediatePropagation();
				return false;
			})
			.on('mousedown', function(){
				NpcStore.focus();
			});

		// Hacky drag drop
		this.draggable.call({ui: InputWindow },  InputWindow.find('.titlebar'));
		this.draggable.call({ui: OutputWindow }, OutputWindow.find('.titlebar'));
		this.draggable.call({ui: AvailableItemsWindow }, AvailableItemsWindow.find('.titlebar'));
		this.draggable.call({ui: PurchaseResult }, PurchaseResult.find('.titlebar'));

		// MarketShop close
		ui.find('.btn.ok').click(function(){
			NpcStore.closeStore();
		})
	};


	/**
	 * Player should not be able to move when the store is opened
	 */
	NpcStore.onAppend = function onAppend()
	{
		Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (_preferences.select_all ? 1 : 0) + '.bmp', function(data){
			this.ui.find('.selectall:first').css('backgroundImage', 'url('+ data +')');
		}.bind(this));

		// Seems like "EscapeWindow" is execute first, push it before.
		var events = jQuery._data( window, 'events').keydown;
		events.unshift( events.pop() );
	};


	/**
	 * Released movement and save preferences
	 */
	NpcStore.onRemove = function onRemove()
	{
		var InputWindow  = this.ui.find('.InputWindow');
		var OutputWindow = this.ui.find('.OutputWindow');
		var AvailableItemsWindow = this.ui.find('.AvailableItemsWindow');
		var PurchaseResult = this.ui.find('.PurchaseResult');

		_input.length    = 0;
		_output.length   = 0;

		var currentPref = getCurrentPref();

		currentPref.inputWindow.x = parseInt(InputWindow.css('left'), 10);
		currentPref.inputWindow.y = parseInt(InputWindow.css('top'), 10);
		currentPref.inputWindow.height = InputWindow.find('.content').height() / 32 | 0;

		currentPref.outputWindow.x = parseInt(OutputWindow.css('left'), 10);
		currentPref.outputWindow.y = parseInt(OutputWindow.css('top'), 10);
		currentPref.outputWindow.height = OutputWindow.find('.content').height() / 32 | 0;

		currentPref.AvailableItemsWindow.x = parseInt(AvailableItemsWindow.css('left'), 10);
		currentPref.AvailableItemsWindow.y = parseInt(AvailableItemsWindow.css('top'), 10);
		currentPref.AvailableItemsWindow.height = AvailableItemsWindow.find('.content').height() / 32 | 0;

		currentPref.PurchaseResult.x = parseInt(PurchaseResult.css('left'), 10);
		currentPref.PurchaseResult.y = parseInt(PurchaseResult.css('top'), 10);
		currentPref.PurchaseResult.height = PurchaseResult.find('.content').height() / 32 | 0;

		_preferences.save();

		this.ui.find('.content').empty();
		this.ui.find('.total .result').text(0);
		this.ui.find('.totalP .resultP').text(0);
	};


	/**
	 * Key Listener
	 *
	 * Remove the UI when Escape key is pressed
	 */
	NpcStore.onKeyDown = function onKeyDown( event )
	{
		if ((event.which === KEYS.ESCAPE || event.key === "Escape") && this.ui.is(':visible')) {
			this.remove();

			if (PACKETVER.value >= 20131223) {
				NpcStore.StoreClosePacket(_type);
			}
		}
	};


	/**
	 * Specify the type of the shop
	 *
	 * @param {number} type (see NpcStore.Type.*)
	 */
	NpcStore.setType = function setType(type)
	{
		switch (type) {
			case NpcStore.Type.BUY:
			case NpcStore.Type.MARKETSHOP:
				this.ui.find('.WinSell, .WinVendingStore, .WinCash, .WinBuyingStore, .AvailableItemsWindow, .PurchaseResult').hide();
				this.ui.find('.WinBuy').show();
				break;

			case NpcStore.Type.SELL:
				this.ui.find('.WinBuy, .WinVendingStore, .WinCash, .WinBuyingStore, .AvailableItemsWindow, .PurchaseResult').hide();
				this.ui.find('.WinSell').show();
				break;

			case NpcStore.Type.VENDING_STORE:
				this.ui.find('.WinBuy, .WinSell, .WinCash, .WinBuyingStore, .AvailableItemsWindow, .PurchaseResult').hide();
				this.ui.find('.WinVendingStore').show();
				break;

			case NpcStore.Type.BUYING_STORE:
				this.ui.find('.WinBuy, .WinSell, .WinCash, .WinVendingStore, .PurchaseResult').hide();
				this.ui.find('.WinBuyingStore, .AvailableItemsWindow').show();
				this.ui.find('.content').css('height','160px');
				this.ui.find('.contentAvailable').css('height','65px');
				break;

			case NpcStore.Type.BARTER_MARKET:
			case NpcStore.Type.BARTER_MARKET_EXTENDED:
				this.ui.find('.WinSell, .WinVendingStore, .WinCash, .WinBuyingStore, .AvailableItemsWindow, .PurchaseResult').hide();
				this.ui.find('.WinBuy').show();
				this.ui.find('.total').hide();
				break;

			case NpcStore.Type.CASH_SHOP:
				this.ui.find('.WinSell, .WinVendingStore, .WinBuyingStore, .AvailableItemsWindow, .PurchaseResult, .total').hide();
				this.ui.find('.WinBuy').show();
				break;
		}

		_type = type;

		var currentPref = getCurrentPref();

		var InputWindow  = this.ui.find('.InputWindow');
		var OutputWindow = this.ui.find('.OutputWindow');
		var AvailableItemsWindow = this.ui.find('.AvailableItemsWindow');
		var PurchaseResult = this.ui.find('.PurchaseResult');

		// Apply saved positions
		InputWindow.css({ top: currentPref.inputWindow.y, left: currentPref.inputWindow.x });
		OutputWindow.css({ top: currentPref.outputWindow.y, left: currentPref.outputWindow.x });
		AvailableItemsWindow.css({ top: currentPref.AvailableItemsWindow.y, left: currentPref.AvailableItemsWindow.x });
		PurchaseResult.css({ top: currentPref.PurchaseResult.y, left: currentPref.PurchaseResult.x });

		// Apply resize heights
		resize(InputWindow.find('.content'), currentPref.inputWindow.height);
		resize(OutputWindow.find('.content'), currentPref.outputWindow.height);
		resize(AvailableItemsWindow.find('.content'), currentPref.AvailableItemsWindow.height);
		resize(PurchaseResult.find('.content'), currentPref.PurchaseResult.height);

		// Apply width
		InputWindow.css('width', currentPref.inputWindow.width);
		OutputWindow.css('width', currentPref.outputWindow.width);
	};


	/**
	 * Add items to list
	 *
	 * @param {Array} item list
	 */
	NpcStore.setList = function setList( items )
	{
		var i, count;
		var it, item, out, content, availableContent;

		this.ui.find('.content').empty();
		this.ui.find('.total .result').text(0);
		this.ui.find('.totalP .resultP').text(0);

		_input.length  = 0;
		_output.length = 0;
		content        = this.ui.find('.InputWindow .content');
		availableContent = this.ui.find('.AvailableItemsWindow .content');
		switch (_type) {

			case NpcStore.Type.BUY:
			case NpcStore.Type.VENDING_STORE:
			case NpcStore.Type.MARKETSHOP:
			case NpcStore.Type.CASH_SHOP:
				for (i = 0, count = items.length; i < count; ++i) {
					if (!('index' in items[i])) {
						items[i].index = i;
					}
					items[i].count        = items[i].count || Infinity;
					items[i].IsIdentified = true;
					out                   = jQuery.extend({}, items[i]);
					out.count             = 0;

					addItem( content, items[i]);

					_input[items[i].index]  = items[i];
					_output[items[i].index] = out;

				}
				break;
			case NpcStore.Type.BUYING_STORE:
				for (i = 0, count = items.length; i < count; ++i) {
					if (!('index' in items[i])) {
						items[i].index = i;
					}
					items[i].count        = items[i].count || Infinity;
					items[i].IsIdentified = true;
					out                   = jQuery.extend({}, items[i]);
					out.count             = 0;

					addItem( content, items[i]);
					it = Inventory.getUI().getItemById(items[i].ITID);

					if (it) {
						item                 = jQuery.extend({}, it);
						item.ITID            = it.ITID;
						item.price           = items[i].price;
						item.count           = ('count' in item) ? item.count : 1;
						item.maxCount        = isFinite(items[i].count) ? items[i].count : 0;

						out                  = jQuery.extend({}, item);
						out.count            = 0;

						addItem( availableContent, item);

						_input[item.index]  = item;
						_output[item.index] = out;
					}
				}
				break;

			case NpcStore.Type.BARTER_MARKET:
			case NpcStore.Type.BARTER_MARKET_EXTENDED:
				for (i = 0, count = items.length; i < count; ++i) {
					if (!('index' in items[i])) {
						items[i].index = i;
					}
					items[i].count        = items[i].count || Infinity;
					items[i].IsIdentified = true;
					out                   = jQuery.extend({}, items[i]);
					out.count             = 0;

					addItem( content, items[i]);

					_input[items[i].index]  = items[i];
					_output[items[i].index] = out;
				}
				break;

			case NpcStore.Type.SELL:
				var InventoryVersion = UIManager.getComponent('Inventory').name;
				for (i = 0, count = items.length; i < count; ++i) {
					it = Inventory.getUI().getItemByIndex(items[i].index);

					var condition = (InventoryVersion !== 'InventoryV0') ? it && (!Inventory.getUI().npcsalelock || it.PlaceETCTab < 1) : it;

					if (condition) {
						item                 = jQuery.extend({}, it);
						item.price           = items[i].price;
						item.overchargeprice = items[i].overchargeprice;
						item.count           = ('count' in item) ? item.count : 1;

						out                  = jQuery.extend({}, item);
						out.count            = 0;

						addItem( content, item);

						_input[item.index]  = item;
						_output[item.index] = out;
					}
				}
				break;
		}
	};

	NpcStore.setPriceLimit = function setPriceLimit(price)
	{
		let prettyPrice = prettyZeny(price);
		let text = DB.getMessage(1735);
		let result = text.replace("%s", prettyPrice); // workaround
		this.ui.find('.priceLimit').text(result);
	}

	/**
	 * Submit data to send items
	 */
	NpcStore.submit = function submit()
	{
		var output;
		var i, count;

		output = [];
		count  = _output.length;

		for (i = 0; i < count; ++i) {
			if (_output[i] && _output[i].count) {
				output.push(_output[i]);
			}
		}

		NpcStore.onSubmit( output );

		// work around - cashshop dont close after buy
		this.ui.find('.OutputWindow').find('.content').empty();
		this.ui.find('.totalP .resultP').text(0);

		for (i = 0; i < count; ++i) {
			if (_output[i] && _output[i].count) {
				_output[i].count = 0; // clear
			}
		}
	};


	/**
	 * Calculate the cost of all items in the output box
	 *
	 * @return {number}
	 */
	NpcStore.calculateCost = function calculateCost()
	{
		var i, count, total;

		total = 0;
		count = _output.length;

		for (i = 0; i < count; ++i) {
			if (_output[i]) {
				total += (_output[i].discountprice || _output[i].overchargeprice || _output[i].price) * _output[i].count;
			}
		}

		this.ui.find('.total .result').text(prettyZeny(total));
		this.ui.find('.totalP .resultP').text(prettyZeny(total))

		if (_type === NpcStore.Type.BARTER_MARKET) {
			this.ui.find('.total').hide();
		}

		return total;
	};


	/**
	 * Calculate the total weight of all items in the output box
	 *
	 * @return {number}
	 */
	NpcStore.calculateWeight = function calculateWeight() {
	    let totalWeight = 0;

	    _output.forEach(item => {
	        if (item && item.count > 0 && item.total_weight) {
	            totalWeight += item.total_weight;
	        }
	    });

	    return totalWeight;
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
	function addItem( content, item)
	{
		var it      = DB.getItemInfo(item.ITID);
		var currencyit = DB.getItemInfo(item.currencyITID);
		var element = content.find('.item[data-index='+ item.index +']:first');
		var price;
		let amountText;

		let currency_item;
		if (_type === NpcStore.Type.BARTER_MARKET) {
			currency_item = { ...item };  // Shallow copy of the item
			currency_item.ITID = item.currencyITID;
		}

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
			amountText = (_type == NpcStore.Type.BUYING_STORE && !(content.hasClass('contentAvailable'))) ? ' ea.' : '';
			element.find('.amount').text(isFinite(item.count) ? item.count + amountText: '');
			return;
		}

		if(!(content.hasClass('contentAvailable')) && (_type !== NpcStore.Type.BARTER_MARKET && _type !== NpcStore.Type.BARTER_MARKET_EXTENDED)) {
			price = prettyZeny(item.price, _type === NpcStore.Type.VENDING_STORE || _type === NpcStore.Type.BUYING_STORE);

			// Discount price
			if ('discountprice' in item && item.price !== item.discountprice) {
				price += ' -> ' + prettyZeny(item.discountprice);
			}
			else if ('overchargeprice' in item && item.price !== item.overchargeprice) {
				price += ' -> ' + prettyZeny(item.overchargeprice);
			}

			let buyingClass = (_type == NpcStore.Type.BUYING_STORE) ? ' amountBuying' : '';
			amountText = (_type == NpcStore.Type.BUYING_STORE) ? ' ea.' : '';
			// Create it
			content.append(
				'<div class="item" draggable="true" data-index="'+ item.index +'">' +
					'<div class="icon"></div>' +
					'<div class="amount' + buyingClass + '">' + (isFinite(item.count) ? item.count : (_type === NpcStore.Type.BUYING_STORE) ? 0 : '') + amountText + '</div>' +
					'<div class="name">'+ jQuery.escape(DB.getItemName(item)) +'</div>' +
					'<div class="price">'+ price +'</div>' +
					'<div class="unity">Z</div>' +
				'</div>'
			);
		} else if (_type === NpcStore.Type.BARTER_MARKET) {
			content.append(
				'<div class="item" draggable="true" data-index="'+ item.index +'" data-weight="'+ item.weight +'" data-location="'+ item.location +'" data-viewSprite="'+ item.viewSprite +'">' +
					'<div class="icon"></div>' +
					'<div class="amount">' + (isFinite(item.count) ? item.count : '') + '</div>' +
					'<div class="name">'+ jQuery.escape(DB.getItemName(item)) +'</div>' +
					'<div class="currency_icon" data-item="'+ item.currencyITID + '"></div>' +
					'<div class="currency_amount">' + item.currencyamount + '</div>' +
					'<div class="currency_nameOverlay">'+ jQuery.escape(DB.getItemName(currency_item)) +' '+ item.currencyamount +' ea</div>' +
				'</div>'
			);
		} else if (_type === NpcStore.Type.BARTER_MARKET_EXTENDED) {
			// Build the second layer (currency list)
			let currencySlotsHTML = '';
			let currencyOverlay = '';
			if (item.currencyList && item.currencyList.length > 0) {
				// Ensure fixed slots (2 slots max for currencies)
				for (let i = 0; i < item.currencyList.length; i++) {
					if (i < item.currencyList.length) {
						const currency = item.currencyList[i];
						const currencyItem = DB.getItemInfo(currency.ITID);

						//currency_item = { ...item };  // Shallow copy of the item
						//currency_item.ITID = item.currencyITID;

						currencySlotsHTML +=
                    	'<div class="currency_slot" data-item="' + currency.ITID + '">' +
                    	    '<div class="expanded_currency_holder">' +
								'<div class="expanded_currency_icon"></div>' +
							'</div>' +
                    	    '<div class="expanded_currency_amount">' + currency.amount + '</div>' +
							(currency.refine_level > 0 ? '<div class="expanded_currency_refinelvl">+' + currency.refine_level + '</div>' : '') +
                    	'</div>';

						currencyOverlay += '' + jQuery.escape(currencyItem.identifiedDisplayName) + ' ' + currency.amount + ' ea<br>';
					}
				}
			}
			content.append(
				'<div class="item expanded-barter" draggable="true" data-index="'+ item.index +'" data-weight="'+ item.weight +'" data-location="'+ item.location +'" data-viewSprite="'+ item.viewSprite +'">' +
					'<div class="expanded_currency_holder">' +
						'<div class="icon"></div>' +
					'</div>' +
					'<div class="amount">' + (isFinite(item.count) ? item.count : '') + '</div>' +
					'<div class="name">'+ jQuery.escape(DB.getItemName(item)) +'</div>' +
					'<div class="currency_section">' +
                		currencySlotsHTML +
            		'</div>' +
					'<div class="expanded_price">'+ item.price +'z</div>' +
					'<div class="expanded_currency_nameOverlay">' + currencyOverlay + '</div>' +
				'</div>'
			);
			// Lazy-load icons after appending
			if (item.currencyList && item.currencyList.length > 0) {
				for (let i = 0; i < item.currencyList.length; i++) {
					const currency = item.currencyList[i];
					const currencyItem = DB.getItemInfo(currency.ITID);

					Client.loadFile(DB.INTERFACE_PATH + 'item/' + currencyItem.identifiedResourceName + '.bmp', function(data) {
						content.find(`.currency_slot[data-item="${currency.ITID}"] .expanded_currency_icon`).css('backgroundImage', `url(${data})`);
					});
				}
			}
		} else {
			content.append(
				'<div class="item itemAvailable" draggable="true" data-index="'+ item.index +'">' +
					'<div class="icon"></div>' +
					'<div class="amount">' + (isFinite(item.count) ? item.count : '') + '</div>' +
					'<div class="nameOverlay">'+ jQuery.escape(DB.getItemName(item)) +'</div>' +
				'</div>'
			);
		}
		// Add the icon once loaded
		Client.loadFile( DB.INTERFACE_PATH + 'item/' + (item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) + '.bmp', function(data){
			content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile( DB.INTERFACE_PATH + 'basic_interface/itemwin_mid.bmp', function(data){
			content.find('.expanded_currency_holder').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile( DB.INTERFACE_PATH + 'item/' + (item.IsIdentified ? currencyit.identifiedResourceName : currencyit.unidentifiedResourceName) + '.bmp', function(data){
			content.find('.item[data-index="'+ item.index +'"] .currency_icon').css('backgroundImage', 'url('+ data +')');
		});
	}


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
	 * Resizing window
	 *
	 * @param {jQueryElement} ui element
	 */
	function onResize( ui )
	{
		var top        = ui.position().top;
		var content    = ui.find('.content:first');
		var lastHeight = 0;
		var interval;

		function resizing()
		{
			var extraY = 31 + 19 - 30;
			var h = Math.floor( (Mouse.screen.y - top  - extraY) / 32 );

			// Maximum and minimum window size
			h = Math.min( Math.max(h, 2), 9);
			if (h === lastHeight) {
				return;
			}

			resize( content, h );
			lastHeight = h;
		}

		// Start resizing
		interval = setInterval( resizing, 30);

		// Stop resizing on left click
		jQuery(window).on('mouseup.resize', function(event){
			if (event.which === 1) {
				clearInterval(interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	}


	/**
	 * Transfer item from input to output (or the inverse)
	 *
	 * @param {jQueryElement} fromContent (input / output)
	 * @param {jQueryElement} toContent (input / output)
	 * @param {boolean} isAdding adding the content to the output element
	 * @param {number} index item index
	 * @param {number} count amount
	 */
	const transferItem = function() {
	    const tmpItem = {
	        ITID: 0,
	        count: 0,
	        price: 0,
	        index: 0
	    };

	    const updateTmpItem = (inputItem, outputItem) => {
	        tmpItem.ITID = inputItem.ITID;
	        tmpItem.count = inputItem.count - outputItem.count;
	        tmpItem.price = inputItem.price;
	        tmpItem.index = inputItem.index;
	    };

	    return function(fromContent, toContent, isAdding, index, count) {
			const inputItem = _input[index];
			const outputItem = _output[index];

			if (isAdding) {
				if ((_type === NpcStore.Type.BUY || _type === NpcStore.Type.VENDING_STORE || _type === NpcStore.Type.MARKETSHOP) &&
					NpcStore.calculateCost() + (inputItem.discountprice || inputItem.price) * count > Session.zeny) {
					ChatBox.addText(DB.getMessage(55), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					return;
				}

				let originalCount = outputItem.count;
				outputItem.count = Math.min(outputItem.count + count, inputItem.count); // Update count

				if (_type === NpcStore.Type.BARTER_MARKET) {
					// Calculate weight
					let inputCurrency = NpcStore.ui.find(`.InputWindow .item[data-index="${index}"]`);
					let inputCurrencyDiv = NpcStore.ui.find(`.InputWindow .item[data-index="${index}"] .currency_amount`);
					let currencyItemWeight = parseInt(inputCurrency.attr('data-weight'), 10);
					let currencyAmount = parseInt(inputCurrencyDiv.text(), 10);
					let additionalWeight = currencyItemWeight * (outputItem.count - originalCount);
					let expectedWeight = Session.Character.weight + NpcStore.calculateWeight() + additionalWeight;


					if (expectedWeight > Session.Character.max_weight) {
						ChatBox.addText(DB.getMessage(56), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
						outputItem.count -= count; // Revert count change
						return;
					}

					outputItem.total_weight = currencyItemWeight * outputItem.count;

					// First, update the items
					updateTmpItem(inputItem, outputItem);
					addItem(fromContent, tmpItem);
					addItem(toContent, outputItem);

					// Then, update currency properties
					let outputCurrencyDiv = NpcStore.ui.find(`.OutputWindow .item[data-index="${index}"] .currency_amount`);
					let currencyItemDiv = NpcStore.ui.find(`.OutputWindow .item[data-index="${index}"] .currency_icon`);
					let currencyItem = parseInt(currencyItemDiv.attr('data-item'), 10);
					let currencyTotal = currencyAmount * outputItem.count;

					outputCurrencyDiv.text(currencyTotal); // Update displayed currency total
					outputItem.shopIndex = index; // Assign shop index
					outputItem.matcurrency = currencyItem; // Assign material currency ID
					outputItem.matcurrencyamount = currencyTotal; // Assign material currency amount
				} else {
					updateTmpItem(inputItem, outputItem);
					addItem(fromContent, tmpItem);
					addItem(toContent, outputItem);
				}

				if (typeof outputItem.maxCount !== 'undefined' && outputItem.count > outputItem.maxCount) {
					let text = DB.getMessage(1739).replace("%d", outputItem.maxCount);
					ChatBox.addText(text, ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
				}
			} else {
				count = Math.min(count, outputItem.count);
				if (!count) {
					return;
				}

				outputItem.count -= count;

				if (_type === NpcStore.Type.BARTER_MARKET) {
					let inputCurrency = NpcStore.ui.find(`.InputWindow .item[data-index="${index}"]`);
					let currencyItemWeight = parseInt(inputCurrency.attr('data-weight'), 10);
					outputItem.total_weight = currencyItemWeight * outputItem.count;

					let inputCurrencyDiv = NpcStore.ui.find(`.InputWindow .item[data-index="${index}"] .currency_amount`);
					let outputCurrencyDiv = NpcStore.ui.find(`.OutputWindow .item[data-index="${index}"] .currency_amount`);
					let currencyAmount = parseInt(inputCurrencyDiv.text(), 10);
					let currencyTotal = currencyAmount * outputItem.count;

					outputCurrencyDiv.text(currencyTotal);
					outputItem.matcurrencyamount = currencyTotal; // Update material currency amount
				}

				updateTmpItem(inputItem, outputItem);
				addItem(fromContent, outputItem);
				addItem(toContent, tmpItem);
			}

			NpcStore.calculateCost();
			NpcStore.calculateWeight(); // Update total weight after every operation
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
		var item, count;
		var isStackable;

		item        = isAdding ? _input[index] : _output[index];
		isStackable = (
			item.type !== ItemType.WEAPON &&
			item.type !== ItemType.EQUIP  &&
			item.type !== ItemType.PETEGG &&
			item.type !== ItemType.PETEQUIP
		);

		if (isAdding) {
			count = isFinite(_input[index].count) ? _input[index].count : 1;
		}
		else {
			count = _output[index].count;
		}

		// Can't buy more than one same stackable item
		if ((_type === NpcStore.Type.BUY || _type === NpcStore.Type.VENDING_STORE) && !isStackable && isAdding) {
			if (toContent.find('.item[data-index="'+ item.index +'"]:first').length) {
				return false;
			}
		}

		// Just one item amount
		if (item.count === 1 || (_type === NpcStore.Type.SELL && _preferences.select_all) || !isStackable) {
			transferItem(fromContent, toContent, isAdding, index, isFinite(item.count) ? item.count : 1 );
			return false;
		}

		// Have to specify an amount
		InputBox.append();
		InputBox.setType('number', false, count);
		InputBox.onSubmitRequest = function(count) {
			InputBox.remove();
			if (count > 0) {
				transferItem(fromContent, toContent, isAdding, index, count);
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
		var data;

		event.stopImmediatePropagation();

		try {
			data  = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
		}
		catch(e) {
			return false;
		}

		// Just allow item from store
		if (data.type !== 'item' || data.from !== 'NpcStore' || data.container === this.className) {
			return false;
		}

		requestMoveItem(
			data.index,
			jQuery('.' + data.container + ' .content'),
			jQuery(this).find('.content'),
			this.className === 'OutputWindow'
		);

		return false;
	}


	/**
	 * Get informations about an item
	 */
	function onItemInfo(event)
	{
		var index = parseInt( this.parentNode.getAttribute('data-index'), 10);
		var item  = _input[index];

		event.stopImmediatePropagation();

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

		if ((_type === NpcStore.Type.BUY || _type === NpcStore.Type.VENDING_STORE) && !Session.isTouchDevice) {
			return;
		}

		input = NpcStore.ui.find('.InputWindow:first');

		if (jQuery.contains(input.get(0), this)) {
			from = input;
			to   = NpcStore.ui.find('.OutputWindow:first');
		}
		else {
			from = NpcStore.ui.find('.OutputWindow:first');
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
		NpcStore.ui.find('.item.selected').removeClass('selected');
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
		var container, img, url;
		var InputWindow, OutputWindow, AvailableItemsWindow;

		InputWindow  = NpcStore.ui.find('.InputWindow:first').get(0);
		OutputWindow = NpcStore.ui.find('.OutputWindow:first').get(0);
		AvailableItemsWindow = NpcStore.ui.find('.AvailableItemsWindow:first').get(0);

		container = (jQuery.contains(InputWindow, this) ? InputWindow : (jQuery.contains(AvailableItemsWindow, this)) ? AvailableItemsWindow : OutputWindow).className;
		img       = new Image();
		url       = this.firstChild.style.backgroundImage.match(/\(([^\)]+)/)[1].replace(/"/g, '');
		img.src   = url;

		event.originalEvent.dataTransfer.setDragImage( img, 12, 12 );
		event.originalEvent.dataTransfer.setData('Text',
			JSON.stringify( window._OBJ_DRAG_ = {
				type:      'item',
				from:      'NpcStore',
				container: container,
				index:     this.getAttribute('data-index')
			})
		);
	}


	/**
	 * Option to automatically buy/sell alls items instead of specify the amount
	 */
	function onToggleSelectAmount()
	{
		_preferences.select_all = !_preferences.select_all;

		Client.loadFile(DB.INTERFACE_PATH + 'checkbox_' + (_preferences.select_all ? 1 : 0) + '.bmp', function(data) {
			this.style.backgroundImage = 'url('+ data +')';
		}.bind(this));
	}


	/**
	 * Handles the packet to send to the server when closing stores
	 */
	NpcStore.closeStore = function() {
		NpcStore.remove();
		this.ui.find('.total').show();

		NpcStore.StoreClosePacket(_type);
	};


	/**
	* Handles packet to close store based on the store type
	*
	* @param {String} type - The store type (e.g., NpcStore.Type.MARKETSHOP, etc.)
	*/
	NpcStore.StoreClosePacket = function(type) {
		let inputWindow  = NpcStore.ui.find('.InputWindow');
		let outputWindow = NpcStore.ui.find('.OutputWindow');

		let pkt;
		switch(type) {
			case NpcStore.Type.MARKETSHOP:
				pkt = new PACKET.CZ.NPC_MARKET_CLOSE();
				inputWindow.show();
				outputWindow.show();
				break;
			case NpcStore.Type.BARTER_MARKET:
				pkt = new PACKET.CZ.NPC_BARTER_MARKET_CLOSE();
				break;
			case NpcStore.Type.BARTER_MARKET_EXTENDED:
				pkt = new PACKET.CZ.NPC_EXPANDED_BARTER_MARKET_CLOSE();
				break;
			default:
				pkt = new PACKET.CZ.NPC_TRADE_QUIT();
				break;
		}
		Network.sendPacket(pkt);
	};


	/**
	 * Returns Npc Store Type
	 * @returns {_type}
	 */
	NpcStore.getCurrentType = function() {
		return _type;
	};


	/**
	 * Returns the current preference for NPCStore Type, or initialize from defaults
	 * @returns {_preferences[_type]}
	 */
	function getCurrentPref() {
		if (!_preferences[_type]) {
			_preferences[_type] = JSON.parse(JSON.stringify(initialPreferences[_type] || initialPreferences.DEFAULT));
		}
		return _preferences[_type];
	};


	/**
	 * Update Marketshop Result UI
	 *
	 * @param {Array.<PACKET.ZC.NPC_MARKET_PURCHASE_RESULT.Item>} itemList
	 * @param {Array.<PACKET.ZC.NPC_MARKET_PURCHASE_RESULT2.Item>} itemList
	 */
	NpcStore.onMarketShopResultUI = function(itemList) {
		let InputWindow  = NpcStore.ui.find('.InputWindow');
		let OutputWindow = NpcStore.ui.find('.OutputWindow');
		let OutputWindowcontent = OutputWindow.find('.content');
		let resultUI = NpcStore.ui.find('.PurchaseResult');
		let resultUIcontent =  resultUI.find('.content');

		// Update UI
		InputWindow.hide();
		OutputWindow.hide();
		resultUI.show();
		resultUIcontent.empty();

		if (!itemList || itemList.length === 0) {
			return;
		}

		// Hack (Using the itemList from packet rearranges the index, so clone OutputWindow instead)
		resultUIcontent.append(OutputWindowcontent.children().clone());

		// Reapply resize logic for PurchaseResult
		resultUI.find('.resize').off('mousedown').on('mousedown', function() {
    		onResize(resultUI);
		});
	};


	/**
	 * Exports
	 */
	NpcStore.onSubmit = function onSubmit(/* itemList */) {};


	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(NpcStore);
});
