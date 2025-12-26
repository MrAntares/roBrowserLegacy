/**
 * UI/Components/ItemInfo/ItemInfo.js
 *
 * Item Information
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
	var jQuery             = require('Utils/jquery');
	var DB                 = require('DB/DBManager');
	var ItemType           = require('DB/Items/ItemType');
	var Client             = require('Core/Client');
	var KEYS               = require('Controls/KeyEventHandler');
	var CardIllustration   = require('UI/Components/CardIllustration/CardIllustration');
	var UIManager          = require('UI/UIManager');
	var Mouse              = require('Controls/MouseEventHandler');
	var UIComponent        = require('UI/UIComponent');
	var Cursor             = require('UI/CursorManager');
	var ItemCompare        = require('UI/Components/ItemCompare/ItemCompare');
	var MakeReadBook       = require('UI/Components/MakeReadBook/MakeReadBook');
	var Renderer           = require('Renderer/Renderer');
	var SpriteRenderer     = require('Renderer/SpriteRenderer');
	var Sprite             = require('Loaders/Sprite');
	var Action             = require('Loaders/Action');
	var htmlText           = require('text!./ItemInfo.html');
	var cssText            = require('text!./ItemInfo.css');
	var Network       	   = require('Network/NetworkManager');
	var PACKET        	   = require('Network/PacketStructure');
	var getModule     = require;


	/**
	 * Create Component
	 */
	var ItemInfo = new UIComponent( 'ItemInfo', htmlText, cssText );

	/**
	 * @var {Sprite,Action} objects
	 */
	var _sprite, _action;

	/**
	 * @var {CanvasRenderingContext2D}
	 */
	 var _ctx;

	/**
	 * @var {number} type
	 */
	 var _type = 0;

	 /**
	 * @var {number} start tick
	 */
	var _start = 0;

	/**
	 * @var {number} ItemInfo unique id
	 */
	ItemInfo.uid = -1;

	/**
	 * ItemMoveInfo messages mapping
	 */
	const MOVE_INFO_MESSAGES = [
		{ key: 'Drop',          msgId: 2788 },
		{ key: 'Storage',       msgId: 2789 },
		{ key: 'Cart',          msgId: 2790 },
		{ key: 'Mail',          msgId: 2791 },
		{ key: 'Exchange',      msgId: 2792 },
		// 2793 Auction → intentionally skipped
		{ key: 'GuildStorage',  msgId: 2794 },
		{ key: 'NPCSale',       msgId: 2795 }
	];

	/**
	 * Once append to the DOM
	 */
	ItemInfo.onKeyDown = function onKeyDown( event )
	{
		if ((event.which === KEYS.ESCAPE || event.key === "Escape") && this.ui.is(':visible')) {
			// Cleanup moveInfo tooltip & cursor
			ItemInfo.hideMoveInfoTooltip();

			ItemInfo.remove();
			if (ItemCompare.ui) {
				ItemCompare.remove();
			}
		}
	};


	/**
	 * Once append
	 */
	ItemInfo.onAppend = function onAppend()
	{
		// Seems like "EscapeWindow" is execute first, push it before.
		var events = jQuery._data( window, 'events').keydown;
		events.unshift( events.pop() );
		resize(ItemInfo.ui.find('.description-inner').height() + 45);
	};


	/**
	 * Once removed from html
	 */
	ItemInfo.onRemove = function onRemove()
	{
		this.uid = -1;

		// Cleanup moveInfo tooltip & cursor
		ItemInfo.hideMoveInfoTooltip();

		// Remove existing compare UI if it's currently displayed
		if (ItemCompare.ui) {
			ItemCompare.remove();
		}
	};


	/**
	 * Initialize UI
	 */
	ItemInfo.init = function init()
	{
		this.ui.css({ top: 200, left:480 });
		this.ui.find('.extend').mousedown(onResize);
		this.ui.find('.close')
			.mousedown(function(event){
				event.stopImmediatePropagation();
				return false;
			})
			.click(function() {
				this.remove();
				if (ItemCompare.ui) {
					ItemCompare.remove();
				}
			}.bind(this));

		// Ask to see card.
		this.ui.find('.view').click(function(){
			CardIllustration.append();
			CardIllustration.setCard(this.item);
		}.bind(this));

		this.draggable(this.ui.find('.title'));

	};

	/**
	 * Bind component
	 *
	 * @param {object} item
	 */
	ItemInfo.setItem = function setItem( item )
	{
		var it = DB.getItemInfo( item.ITID );
		var ui = this.ui;
		var cardList = ui.find('.cardlist .border');
		var optionContainer = ui.find('.option-container');

		this.item = it;
		Client.loadFile( DB.INTERFACE_PATH + 'collection/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
			ui.find('.collection').css('backgroundImage', 'url('+data+')' );
		});


		var customname = '';
		var hideslots = false;

		if(item.slot){

			var very = '';
			var name = '';
			var elem = '';

			switch (item.slot['card1']) {
				case 0x00FF: // FORGE
					if (item.slot['card2'] >= 3840) {
						very = DB.getMessage(461); // Very Very Very Strong
					} else if (item.slot['card2'] >= 2560) {
						very = DB.getMessage(460); // Very Very Strong
					} else if (item.slot['card2'] >= 1024) {
						very = DB.getMessage(459); // Very Strong
					}
					switch (Math.abs(item.slot['card2'] % 10)){
						case 1: elem = DB.getMessage(452); break; // 's Ice
						case 2: elem = DB.getMessage(454); break; // 's Earth
						case 3: elem = DB.getMessage(451); break; // 's Fire
						case 4: elem = DB.getMessage(453); break; // 's Wind
						default: elem = DB.getMessage(450); break; // 's
					}
				case 0x00FE: // CREATE
					elem = DB.getMessage(450);
				case 0xFF00: // PET
					hideslots = true;

					name = '<font color="red" class="owner-' + GID + '">Unknown</font>';
					var GID = (item.slot['card4']<<16) + item.slot['card3'];

					if( DB.CNameTable[GID] && DB.CNameTable[GID] !== 'Unknown') {
						name = '<font color="blue" class="owner-' + GID + '">'+DB.CNameTable[GID]+'</font>';
					} else {

						//Add to item owner name update queue
						DB.UpdateOwnerName[GID] = onUpdateOwnerName;
						DB.getNameByGID(GID);
					}

					if(item.IsDamaged){
						customname = very + ' ' + name + elem + ' ';
					} else {
						customname = !DB.CNameTable[GID] ? very + ' ' + ' ' + name + ' ' + elem + ' ' : very + ' ' + ' ' + name + ' ' + elem + ' ';
					}

					break;
			}
			switch (item.slot['card4']) {
				case 0x1: //BELOVED PET
					hideslots = true;
					customname = DB.getMessage(756) + ' ' + customname;
					break;
			}
		}

		if(item.Options && item.IsIdentified){
			//Clear all option list
			optionContainer.html('');

			//Loop to Show Options
			for (let i = 1; i <= 5; i++) {
				if(item.Options[i].index > 0) {
					let randomOptionName = DB.getOptionName(item.Options[i].index);
					let optionList = 	'<div class="optionlist">' +
															'<div class="border">' +
															randomOptionName.replace('\%d', item.Options[i].value).replace('\%\%', '%') +
															'</div>' +
													'</div>';
					optionContainer.append(optionList);
				}
			}
			optionContainer.show();
		}else{
			optionContainer.hide();
		}

		// Damaged status
		if(item.IsDamaged){
			ui.find('.title').addClass('damaged');
		}else{
			ui.find('.title').removeClass('damaged');
		}

		/* Grade System */
		var container = ui.find('.container');
		if (item.enchantgrade)  {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/collection_bg_g' + item.enchantgrade + '.bmp', function(data){
				container.css('backgroundImage', 'url(' + data + ')');
			});
		} else {
			Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/collection_bg.bmp', function(data){
				container.css('backgroundImage', 'url(' + data + ')');
			});
		}

		var gradeName = '';
		if (item.enchantgrade) {
			let list = ['','D','C','B','A'];
			gradeName = '[' + list[item.enchantgrade] +'] ';
		}

		var refine = '';
		if (item.RefiningLevel) {
			refine = '+' + item.RefiningLevel + ' ';
		}

		ui.find('.title').text( item.IsIdentified ? (refine + gradeName + customname + it.identifiedDisplayName) : it.unidentifiedDisplayName );
		ui.find('.description-inner').text( item.IsIdentified ? it.identifiedDescriptionName : it.unidentifiedDescriptionName );

		if (item.HireExpireDate) {
			const dateText = DB.formatUnixDate(item.HireExpireDate);

			// Get message and replace %s
			let msg = DB.getMessage(1255).replace('%s', dateText);
			msg = DB.formatMsgToHtml(msg);

			ui.find('.description-inner').prepend(`<div>${msg}</div>`);
		}

		if (it.moveInfo) {
			const tooltipHtml = buildMoveInfoTooltip(it.moveInfo);
			if (!tooltipHtml) return;

			// Create the hoverable label
			const label = document.createElement('span');
			label.textContent = DB.getMessage(2796);
			label.className = 'moveinfo-label';

			// Append label to description
			ui.find('.description-inner').append(label);

			// Tooltip container
			const tooltip = document.getElementById('moveinfo-tooltip');

			// Mouse enter → show tooltip
			label.addEventListener('mouseenter', (e) => {
				Cursor.setType(Cursor.ACTION.CLICK);
				tooltip.innerHTML = tooltipHtml;
				tooltip.style.display = 'block';
				tooltip.style.left = e.pageX + 15 + 'px';
				tooltip.style.top = e.pageY + 2 + 'px';
			});
		
			// Mouse leave → hide tooltip
			label.addEventListener('mouseleave', () => {
				tooltip.style.display = 'none';
				Cursor.setType(Cursor.ACTION.DEFAULT);
			});
		
			// Mouse move → follow cursor
			label.addEventListener('mousemove', (e) => {
				tooltip.style.left = e.pageX + 20 + 'px';
				tooltip.style.top  = e.pageY + 2 + 'px';
			});
		}

		// Add view button (for cards)
		addEvent(item);

		switch (item.type) {
			// Not an equipement = no card
			default:
				cardList.parent().hide();
				break;

			case ItemType.ARMOR:
				// Pet Egg check for old versions (before ItemType.PETEGG existed)
				if (DB.isPetEgg(item.ITID)){
					hideslots = true;
				}
			case ItemType.WEAPON:
			case ItemType.SHADOWGEAR:
				if (hideslots){
					cardList.parent().hide();
					break;
				}
				var slotCount = it.slotCount || 0;
				var i;

				cardList.parent().show();
				cardList.empty();

				for (i = 0; i < 4; ++i) {
					addCard(cardList, (item.slot && item.slot['card' + (i+1)]) || 0, i, slotCount);
				}
				if (!item.IsIdentified ) {
					cardList.parent().hide();
				}
				break;

			case ItemType.PETEGG:
				cardList.parent().hide();
				break;

		}
		resize(ItemInfo.ui.find('.description-inner').height() + 45);
	};


	/**
	 * Add a card into a slot
	 *
	 * @param {object} jquery cart list DOM
	 * @param {number} item id
	 * @param {number} index
	 * @param {number} slot count
	 */
	function addCard( cardList, itemId, index, slotCount )
	{
		var file, name = '';
		var card = DB.getItemInfo(itemId);

		if (itemId && card) {
			file = 'item/' + card.identifiedResourceName + '.bmp';
			name = '<div class="name">'+ jQuery.escape(card.identifiedDisplayName) + '</div>';
		}
		// TODO: ADD VARIABLE WITH MAXIMUM OF LETTER
		else if (index < slotCount) {
			file = 'empty_card_slot.bmp';
		}
		else {
			file = 'basic_interface/coparison_disable_card_slot.bmp';
		}

		cardList.append(
			'<div class="item" data-index="'+ index +'">' +
				'<div class="icon"></div>' +
				name +
			'</div>'
		);

		Client.loadFile( DB.INTERFACE_PATH + file, function(data) {
			var element = cardList.find('.item[data-index="'+ index +'"] .icon');
			element.css('backgroundImage', 'url('+ data +')');

			if (itemId && card) {
				element.on('contextmenu',function(){
					ItemInfo.setItem({
						ITID:         itemId,
						IsIdentified: true,
						type:         6
					});
					return false;
				});
			}
		});
	}
	/**
	* Extend ItemInfo window size
	*/
	function onResize()
	{
		var ui      = ItemInfo.ui;
		var top     = ui.position().top;
		var left    = ui.position().left;
		var lastHeight = 0;
		var _Interval;

		function resizing()
		{
			var h = Math.floor((Mouse.screen.y - top));
			if (h === lastHeight) {
				return;
			}
			resize( h );
			lastHeight = h;
		}

		// Start resizing
		_Interval = setInterval(resizing, 30);

		// Stop resizing on left click
		jQuery(window).on('mouseup.resize', function(event){
			if (event.which === 1) {
				clearInterval(_Interval);
				jQuery(window).off('mouseup.resize');
			}
		});
	}


	/**
	* Extend ItemInfo window size
	*
	* @param {number} height
	*/
	function resize( height )
	{
		var container = ItemInfo.ui.find('.container');
		var description = ItemInfo.ui.find('.description');
		var descriptionInner = ItemInfo.ui.find('.description-inner');
		var containerHeight = height;
		var minHeight = 120;
		var maxHeight = descriptionInner.height() + 45 > 120 ? Math.min(descriptionInner.height() + 45, 448) : 120;

		if (containerHeight <= minHeight) {
			containerHeight = minHeight;
		}

		if (containerHeight >= maxHeight) {
			containerHeight = maxHeight;
		}

		container.css({
			height: containerHeight
		});
		description.css({
			height: containerHeight - 45
		});
	}

	function onUpdateOwnerName (pkt){
		var str = ItemInfo.ui.find('.owner-'+pkt.GID).text();
		ItemInfo.ui.find('.owner-'+pkt.GID).text(pkt.CName);

		delete DB.UpdateOwnerName[pkt.GID];
	}


	function addEvent(item){
		var event = ItemInfo.ui.find('.event_view');
		validateFieldsExist(event) ? '' : addEvent(item);

		event.find('.view').hide();
		event.find('canvas').remove();

		Renderer.stop(rendering)

		switch (item.type) {
			case ItemType.CARD:
				event.find('.view').show();
				break;
			case ItemType.ETC:
				let filenameBook =  `data/book/${item.ITID}.txt`;
				Client.loadFile( filenameBook, function(data) {
					MakeReadBook.startBook(data, item);
					eventsBooks();
				});
				break;
			default:
				event.find('.view').hide();
				event.find('canvas').remove();
				break;
		}
	}

	function eventsBooks(){
		var event = ItemInfo.ui.find('.event_view');

		Client.getFiles([
			'data/sprite/book/\xc3\xa5\xc0\xd0\xb1\xe2.spr',
			'data/sprite/book/\xc3\xa5\xc0\xd0\xb1\xe2.act'
			], function (spr, act) {

				try {
					_sprite = new Sprite( spr );
					_action = new Action( act );
				}
				catch(e) {
					console.error('Book::init() - ' + e.message );
					return;
				}
				var canvas;
				canvas  = _sprite.getCanvasFromFrame( 0 );
				canvas.className = 'book_open event_add_cursor';
				event.append(canvas);
				var bookOpen = ItemInfo.ui.find('.book_open');
				bookOpen.mouseover(function(e) {
					e.stopImmediatePropagation();
					ItemInfo.ui.find('.overlay_open').show();
				}).mouseout(function(e) {
					e.stopImmediatePropagation();
					ItemInfo.ui.find('.overlay_open').hide();
				});
				bookOpen.click(function(e){
					e.stopImmediatePropagation();
					MakeReadBook.openBook();
				}.bind(this));
				// icon read book
				event.append( '<canvas width="21" height="15" class="book_read event_add_cursor"/>' );
				canvas  			 = event.find('.book_read');
				canvas.width         = 21;
				canvas.height        = 15;
				_ctx 				 = canvas[0].getContext('2d');

				var bookRead = ItemInfo.ui.find('.book_read');
				bookRead.mouseover(function(e) {
					e.stopImmediatePropagation();
					ItemInfo.ui.find('.overlay_read').show();
				}).mouseout(function(e) {
					e.stopImmediatePropagation();
					ItemInfo.ui.find('.overlay_read').hide();
				});
				bookRead.click(function(e){
					e.stopImmediatePropagation();
					MakeReadBook.highlighter();
				}.bind(this));
				Renderer.render(rendering);

			}.bind(this)
		);
	}


	/**
	 * Rendering animation
	 */
	 var rendering = function renderingClosure()
	 {
		 var position  = new Uint16Array([0, 0]);

		 return function rendering()
		 {
			var i, count, max;
			var action, animation, anim;
			var Entity = getModule('Renderer/Entity/Entity');

			var _entity = new Entity();
			action = _action.actions[_type];
					max    = action.animations.length;
					anim   = Renderer.tick - _start;
					anim   = Math.floor(anim / action.delay);

					// if (anim >= max) {
					// 	Renderer.stop(rendering);
					// }

			animation = action.animations[anim % action.animations.length];


			// Initialize context
			SpriteRenderer.bind2DContext(_ctx,  10, 25);
			_ctx.clearRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
			// _ctx.clearRect(0, 0, 21, 15);

			// Render layers
			for (i = 0, count = animation.layers.length; i < count; ++i) {
				_entity.renderLayer( animation.layers[i], _sprite, _sprite, 1.0, position, false);
			}
			// _entity.renderLayer( animation.layers[0], _sprite, _sprite, 1.0, position, false);

			// Renderer.stop(rendering);

		 };
	 }();

	 function validateFieldsExist(event){

		if(event.length === 0){
			let validExitElement =
				'<div class="event_view">' +
            		'<button class="view" data-background="btn_view.bmp" data-down="btn_view_a.bmp" data-hover="btn_view_b.bmp"></button>'+
					'<span class="overlay_open" data-text="1294">'+DB.getMessage(1294)+'</span>'+
					'<span class="overlay_read" data-text="1295">'+DB.getMessage(1295)+'</span>'
        		'</div>';
			ItemInfo.ui.find('.collection').after(validExitElement);
			return false;
		}

		if(ItemInfo.ui.find('.overlay_open').length == 0
			&& ItemInfo.ui.find('.overlay_read').length == 0){
				event.append(
					'<span class="overlay_open" data-text="1294">'+DB.getMessage(1294)+'</span>'+
					'<span class="overlay_read" data-text="1295">'+DB.getMessage(1295)+'</span>'
				)
		}

		if(ItemInfo.ui.find('button').length == 0){
			event.append(
				'<button class="view" data-background="btn_view.bmp" data-down="btn_view_a.bmp" data-hover="btn_view_b.bmp"></button>'
			)
		}

		return true;
	 }


	/**
	 * A function that handles previewing an item.
	 *
	 * @param {type} pkt - The packet containing information about the item
	 * @return {type} Indicates success or failure of the preview action
	 */
	function onItemPreview(pkt)
	{
		if (pkt) {
			var Equipment = getModule('UI/Components/Equipment/Equipment');
			var Inventory = getModule('UI/Components/Inventory/Inventory');
			let item = Inventory.getUI().getItemByIndex(pkt.index);

			if (!item) {
				return false;
			}

			// Remove existing compare UI if it's currently displayed
			if (ItemCompare.ui) {
				ItemCompare.remove();
			}

			// Don't add the same UI twice, remove it
			if (ItemInfo.uid === item.ITID) {
				ItemInfo.remove();
				if (ItemCompare.ui) {
					ItemCompare.remove();
				}
				return false;
			}

			// Add ui to window
			ItemInfo.append();
			ItemInfo.uid = item.ITID;
			ItemInfo.setItem(item);

			// Check if there is an equipped item in the same location
			var compareItem = Equipment.getUI().isInEquipList(item.location);

			// If a comparison item is found, display comparison
			if (compareItem && Inventory.getUI().itemcomp) {
				ItemCompare.prepare();
				ItemCompare.append();
				ItemCompare.uid = compareItem.ITID;
				ItemCompare.setItem(compareItem);
			}
		}
	};

	/**
	 * Build moveInfo tooltip html content
	 * @param {object} moveInfo
	 * @returns {string} html content
	 */
	function buildMoveInfoTooltip(moveInfo) {
		let lines = [];

		for (const entry of MOVE_INFO_MESSAGES) {
			if (moveInfo[entry.key] === true) {
				lines.push(DB.getMessage(entry.msgId));
			}
		}
		return lines.map(l => `<div>${l}</div>`).join('');
	};

	/**
	 * Cleanup moveInfo tooltip and restore cursor state.
	 * Called when ItemInfo UI is removed.
	 */
	ItemInfo.hideMoveInfoTooltip = function hideMoveInfoTooltip() {
		const tooltip = document.getElementById('moveinfo-tooltip');
		if (tooltip) {
			tooltip.style.display = 'none';
		}
		Cursor.setType(Cursor.ACTION.DEFAULT);
	};

	/**
	 * Packet Hooks to functions
	 */
	Network.hookPacket( PACKET.ZC.CHANGE_ITEM_OPTION,		onItemPreview );

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(ItemInfo);
});
