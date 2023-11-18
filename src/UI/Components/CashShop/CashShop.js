/**
 * UI/Components/CashShop/CashShop.js
 *
 * CashShop windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Stephen-A
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                 = require('DB/DBManager');
	var Client             = require('Core/Client');
	var jQuery             = require('Utils/jquery');
	var Network            = require('Network/NetworkManager');
	var PACKETVER          = require('Network/PacketVerManager');
	var PACKET             = require('Network/PacketStructure');
	var InputBox           = require('UI/Components/InputBox/InputBox');
	var ChatBox      	   = require('UI/Components/ChatBox/ChatBox');
	var Renderer           = require('Renderer/Renderer');
	var Preferences        = require('Core/Preferences');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./CashShop.html');
	var cssText            = require('text!./CashShop.css');

	var UIVersionManager      = require('UI/UIVersionManager');
	// Version Dependent UIs
	var MiniMap;

	var CashShop = new UIComponent( 'CashShop', htmlText, cssText );

	/**
	 * @var {number} used to remember the window height
	 */
	var _realSize = 0;

	/**
	 * Store cash shop items
	 */
	CashShop.list = [];
	
	var _preferences = Preferences.get('CashShop', {
		x:        80,
		y:        100,
		show:     false,
		reduce:   false,
		magnet_top: false,
		magnet_bottom: false,
		magnet_left: true,
		magnet_right: false
	}, 1.0);

	/**
	 * Store cash shop items
	 */

	CashShop.cashShopListItem = [];
	CashShop.csListItemSearchResult = [];

	/**
	 * place your banner images here from grf. size.(611x65)
	 */
	CashShop.cashShopBanner = 'questitem/main_sample_title.bmp';

	/**
	 * CASH SHOP MENU
	 */
	CashShop.cmenus = [
		'CASHSHOP_TAB_NEW',
		'CASHSHOP_TAB_POPULAR',
		'CASHSHOP_TAB_LIMITED',
		'CASHSHOP_TAB_RENTAL',
		'CASHSHOP_TAB_PERPETUITY',
		'CASHSHOP_TAB_BUFF',
		'CASHSHOP_TAB_RECOVERY',
		'CASHSHOP_TAB_ETC',
	];

	/**
	 * Active cash shop menu
	 */
	CashShop.activeCashMenu = 0;

	/**
	 * Current Cash shop points user
	 */
	CashShop.cashPoint = 0;

	/**
	 * Current Kafra points user
	 */
	CashShop.kafraPoints = 0;

	/**
	 * urrent Item in cart item
	 */
	CashShop.cartItem = [];

	/**
	 * Current cart item total price
	 */
	CashShop.cartItemTotalPrice = 0;

	/**
	 *  Check your item_cash_db.txt if how many tab is active
	 */
	CashShop.totalActiveCategory = 3;

	/**
	 * checking how many tab been loaded
	 */
	CashShop.loadedCategory = 0;

	/**
	 * Pagination
	 */
	CashShop.pageOffset = 1;
	CashShop.pageLimit = 9;
	CashShop.currentPage = 1;
	CashShop.totalPage = 0;
	CashShop.isFirstPage = true;
	CashShop.isLastPage = false;
	CashShop.isNotRefresh = false;
	CashShop.cartItemLen = 0;
	CashShop.checkCartItemLen = 0;
	CashShop.pageEnd = 9;
	CashShop.isSearch = false;
	
	CashShop.init = function init()
	{
		MiniMap   = require('UI/Components/MiniMap/MiniMap').getUI();

		//this.ui.hide();
		this.ui.find('.titlebar .base').mousedown(stopPropagation);
		this.ui.find('.titlebar .mini').click(onToggleReduction);
		this.ui.find('.tabs button').mousedown(onSwitchTab);
		this.ui.find('.titlebar .close').click(function(){
			var pkt        = new PACKET.CZ.CASH_SHOP_CLOSE();
            Network.sendPacket(pkt);
			CashShop.ui.hide();
			CashShop.onRemove();
		});
		// on drop item
		this.ui
			.on('drop',     onDrop)
			.on('dragover', stopPropagation)

			// Items event
				.find('.container .content')
					.on('dragstart',   '.item', onItemDragStart)
					.on('dragend',     '.item', onItemDragEnd);

		//this.ui.find('.ncnt').text(0);
		//this.ui.find('.mcnt').text(100);
		

		this.draggable(this.ui.find('.titlebar'));
		this.ui.on('click', '.purchase-btn-container button', onClickActionAddCartItem);
		this.ui.on('click', '#cart-list .items .item .counter-btn', onClickActionCounterButtonCart);
		this.ui.on('click', '#cart-list .items .item .delete-item', onClickDeleteItemInCart);
		this.ui.on('click', '#purchase-btn', onClickActionBuyItem);
		this.ui.on('click', '#main-menu .menu', onClickMenu);
		this.ui.on('click', '.item-paginations .page', onClickPagination);
		this.ui.on('click', '.item-searcher .btnSearch', onClickSearch);
		if(this.ui.find('#cart-list items').length > 0){
			CashShop.onResetCartListCashShop();
		}
		
		MiniMap.ui.append('<button class="cashshopIcon"></button>');
		MiniMap.ui.on('click', '.cashshopIcon', onClickIcon);

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/nc_cashshop.bmp', function(data){
			MiniMap.ui.find('.cashshopIcon').css('backgroundImage', 'url('+ data +')');
		});
	};
	
	CashShop.onAppend = function OnAppend()
	{
		// Apply preferences
		if (!_preferences.show) {
			this.ui.hide();
		}
		this.resize( _preferences.width, _preferences.height );

		this.ui.css({
			top:  Math.min( Math.max( 0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min( Math.max( 0, _preferences.x), Renderer.width  - this.ui.width())
		});

		this.magnet.TOP = _preferences.magnet_top;
		this.magnet.BOTTOM = _preferences.magnet_bottom;
		this.magnet.LEFT = _preferences.magnet_left;
		this.magnet.RIGHT = _preferences.magnet_right;

		//this.ui.find('.titlebar .mini').trigger('mousedown');
	};

	/**
	 * Search in a list for an item by its index
	 *
	 * @param {number} index
	 * @returns {Item}
	 */
	CashShop.getItemByIndex = function getItemByIndex( index )
	{
		var i, count;
		var list = CashShop.list;

		for (i = 0, count = list.length; i < count; ++i) {
			if (list[i].index === index) {
				return list[i];
			}
		}

		return null;
	};
	
	CashShop.show = function show()
	{
		this.ui.show();
	};
	
	CashShop.hide = function hide()
	{
		this.ui.hide();
	};
	
	CashShop.resize = function Resize( width, height )
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

	CashShop.readPoints = function readPoints(cashPoint, kafraPoints, tab){
		this.cashPoint = cashPoint;
		this.kafraPoints = kafraPoints;
		this.activeCashMenu = tab;
		this.ui.find('#cashpoint > span').html(this.cashPoint);
		this.ui.find('.cashpoint_footer').html(this.cashPoint);
		var pkt = new PACKET.CZ.PC_CASH_POINT_ITEMLIST();
            Network.sendPacket(pkt);
	}

	/**
	 * Success reponse buying cash shop item
	 */
	CashShop.setSuccessCashShopUpdate = function setSuccessCashShopUpdate(res){

		if(res){
			CashShop.checkCartItemLen += 1;
			switch(res.result) {
				case 0:
					if(CashShop.checkCartItemLen >= CashShop.cartItemLen){
						CashShop.cartItemLen = 0;
						CashShop.checkCartItemLen = 0;
						UIManager.showMessageBox( 'Successfully done buying items from cash shop!', 'ok');
						ChatBox.addText( 'Successfully done buying items from cash shop!', ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
						CashShop.ui.find('#cashpoint span').html(res.cashPoints);
						CashShop.ui.find('.cashpoint_footer').html(res.cashPoints);
						onResetCartListCashShop();
					}
				break;
				case 2:
					//insuficient cashpoint or kafra points
					UIManager.showMessageBox( 'Insuficient cash points or kafra points!', 'ok');
					ChatBox.addText( 'Insuficient cash points or kafra points!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
				break;

				case 4:
					//overweight limit
					UIManager.showMessageBox( `You are over you're weight limit!`, 'ok');
					ChatBox.addText( 'You are over youre weight limit!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
				break;

				default:
					UIManager.showMessageBox( 'Something went wrong while using cashshop!', 'ok');
					ChatBox.addText( 'Something went wrong while using cashshop!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
				break;
			}
			CashShop.ui.find('#purchase-btn').prop('disabled', false);
		}
	}

	CashShop.readCashShopItems = function readCashShopItems(items){
		
		if(CashShop.loadedCategory >= CashShop.totalActiveCategory){
			CashShop.cashShopListItem.push({
				count: items.count,
				items: items.items,
				tabNum: items.tabNum,
			});

			if(CashShop.cashShopListItem[CashShop.activeCashMenu].items.length > 0){
				CashShop.paginationOffsetLimit();
				CashShop.renderCashShopItems(
					CashShop.paginate(
						CashShop.cashShopListItem[CashShop.activeCashMenu].items,
						CashShop.pageOffset,
						CashShop.pageEnd,
					)
				);
				CashShop.totalPage = Math.ceil(CashShop.cashShopListItem[CashShop.activeCashMenu].items.length / CashShop.pageLimit);
				CashShop.ui.find('.item-paginations span.pagi-countpage').html(CashShop.totalPage);
				CashShop.isNotRefresh = true;
			} else {
				CashShop.ui.find('.container-body .items').html('<div class="no-list-item">No item in list</div>');
			}
			return true;
		} else {
			CashShop.cashShopListItem.push({
				count: items.count,
				items: items.items,
				tabNum: items.tabNum,
			});
		}
		CashShop.loadedCategory += 1;
	}

	/**
	 * Load Cash Shop Components
	 */
	CashShop.loadComponentCashShop = function renderTab() {

		//CashShop.cashShopListItem = [];
		CashShop.ui.find('.item-searcher .inp-search').val('');
		let i = 0;
		for(let menu of CashShop.cmenus){
			let menuName = '';
			let iconName = '';
			var html = '';
			var shopElem = this.ui;
			var content = shopElem.find('#main-menu');
			var carContainer = shopElem.find('.container-cart');
			switch(menu){
				case 'CASHSHOP_TAB_NEW':
					menuName = 'Newest';
					iconName = 'img_shop_tap0_on';
				break;
				case 'CASHSHOP_TAB_POPULAR':
					menuName = 'Popular';
					iconName = 'img_shop_tap1_on';
				break;
				case 'CASHSHOP_TAB_LIMITED':
					menuName = 'Limited';
					iconName = 'img_shop_tap2_on';
				break;
				case 'CASHSHOP_TAB_RENTAL':
					menuName = 'Rental';
					iconName = 'img_shop_tap3_on';
				break;
				case 'CASHSHOP_TAB_PERPETUITY':
					menuName = 'Perpetuity';
					iconName = 'img_shop_tap4_on';
				break;
				case 'CASHSHOP_TAB_BUFF':
					menuName = 'Buffs';
					iconName = 'img_shop_tap5_on';
				break;
				case 'CASHSHOP_TAB_RECOVERY':
					menuName = 'Recovery';
					iconName = 'img_shop_tap6_on';
				break;
				case 'CASHSHOP_TAB_ETC':
					menuName = 'ETC';
					iconName = 'img_shop_tap7_on';
				break;
			}
			html = `<div class="menu ${this.activeCashMenu === i ? 'active' : ''}" data-index="${menu}">
					<button></button>
					<div class="menu-icon" data-index="${menuName}"></div>
					<div class="menu-name">${menuName}</div>
				</div>`;
			content.append(html);
			Client.loadFile(DB.INTERFACE_PATH + `cashshop/${iconName}.bmp`, function(data){
				content.find('.menu-icon[data-index="'+ menuName +'"]').css('backgroundImage', 'url('+ data +')');
			});
			i++;
		}

		//Load Cash Shop Banner
		var contentCSBanner = this.ui.find('.container-banner');
		Client.loadFile(DB.INTERFACE_PATH + CashShop.cashShopBanner, function(data){
			contentCSBanner.css('backgroundImage', 'url('+ data +')');
		});

		//Load Searcher Item component
		var contentItemSearcher = this.ui.find('.item-searcher');
		Client.loadFile(DB.INTERFACE_PATH + `cashshop/btn_searchbar_normal.bmp`, function(data){
			contentItemSearcher.find('button').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + CashShop.cashShopBanner, function(data){
			carContainer.find('.container-cart-header').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'item/dalcom_coin.bmp', function(data){
			shopElem.find('.icon-gold-coin').css('backgroundImage', 'url('+ data +')');
		});

		if(CashShop.cartItem.length === 0){
			CashShop.ui.find('#cart-list .items').html(`<li class="no-items">No Item in cart!</li>`);
		}
	}

	CashShop.renderCashShopItems = function renderCashShopItems(items){
		this.ui.find('#items').empty();
		for (var i = 0; i < items.length; i++) {
			let item = structuredClone(items[i]);
			var content = this.ui.find('#items');
			var it = DB.getItemInfo( item.itemId );
			content.append(
				`<div class="item" draggable="true" title="${it.identifiedDisplayName}" data-index="${item.itemId}">
					<div class="top-con">
						<span class="item-name">${it.identifiedDisplayName}</span>
					</div>
					<div class="lower-con">
						<div class="item-left-img"></div>
						<div class="item-right-desc">
							<div class="item-desc-price">
								<div class="icon-gold-coin"></div>
								<span>${item.price}</span>
							</div>
							<div class="purchase-btn-container">
								<button data-itemId="${item.itemId}" tab-index="${i}">Purchase</button>
							</div>
						</div>
					</div>
				</div>`
			);
			
			Client.loadFile( DB.INTERFACE_PATH + 'collection/' + ( it.identifiedResourceName ) + '.bmp', function(data){
				content.find('.item[data-index="'+ item.itemId +'"] .item-left-img').css('backgroundImage', 'url('+ data +')');
			});
		}
	}

	CashShop.initPagination = function initPagination(items){
		CashShop.currentPage = 1;
		CashShop.pageOffset = 0;
		CashShop.pageEnd = CashShop.pageLimit;
		CashShop.isFirstPage = true;
		CashShop.isLastPage = items.length >= CashShop.pageLimit ? false : true;

		var content = CashShop.ui.find('.item-paginations');
		const arrowsL = CashShop.isFirstPage ? 'off' : 'on';
		const arrowsR = CashShop.isLastPage ? 'off' : 'on';

		CashShop.totalPage = Math.ceil(items.length / CashShop.pageLimit);
		CashShop.ui.find('.item-paginations span.pagi-countpage').html(CashShop.totalPage);
		CashShop.ui.find('.item-paginations span.pagi-changepage').html(1);

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR_'+arrowsR+'.bmp', function(data){
			content.find('.go-next .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR2_'+arrowsR+'.bmp', function(data){
			content.find('.go-last .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL_'+arrowsL+'.bmp', function(data){
			content.find('.go-prev .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL2_'+arrowsL+'.bmp', function(data){
			content.find('.go-first .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});
	}

	// /**
	//  * Remove Cash shop
	//  */
	CashShop.onRemove = function onRemove(){
		this.activeCashMenu = 0;
		this.checkCartItemLen = 0;
	};

	CashShop.paginate = function paginate(items, start, end){
		return items.slice(start, end);
	}

	CashShop.paginationOffsetLimit = function paginationOffsetLimit(){
		var start = (CashShop.currentPage - 1) * CashShop.pageLimit;
		var end = CashShop.pageLimit * CashShop.currentPage;
		CashShop.pageOffset = start;
		CashShop.pageEnd = end;
	}

	function onClickPagination(e){
		let index = parseInt(e.currentTarget.dataset.index);
		let items = CashShop.isSearch 
			? CashShop.csListItemSearchResult 
			: CashShop.cashShopListItem[CashShop.activeCashMenu].items;
		var content = CashShop.ui.find('.item-paginations');

		CashShop.isFirstPage = false;
		CashShop.isLastPage = false;

		switch(index){
			case 1: //go first//
				CashShop.currentPage = 1;
				CashShop.pageOffset = 0;
				CashShop.isFirstPage = true;
			break;
			case 2://go prev//
				CashShop.currentPage--;
				if(CashShop.currentPage <= 1){
					CashShop.currentPage = 1;
					CashShop.isFirstPage = true;
				}
			break;
			case 3://go next//
				CashShop.currentPage++;
				if(CashShop.currentPage >= CashShop.totalPage){
					CashShop.currentPage = CashShop.totalPage;
					CashShop.isLastPage = true;
				}
			break;
			case 4://go last//
				CashShop.currentPage = CashShop.totalPage;
				CashShop.pageOffset = (CashShop.currentPage - 1) * CashShop.pageLimit;
				CashShop.isLastPage = true;
			break;
		}
		CashShop.paginationOffsetLimit();

		const arrowsL = CashShop.isFirstPage ? 'off' : 'on';
		const arrowsR = CashShop.isLastPage ? 'off' : 'on';
		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR_'+arrowsR+'.bmp', function(data){
			content.find('.go-next .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR2_'+arrowsR+'.bmp', function(data){
			content.find('.go-last .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL_'+arrowsL+'.bmp', function(data){
			content.find('.go-prev .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL2_'+arrowsL+'.bmp', function(data){
			content.find('.go-first .pagi-handler').css('backgroundImage', 'url('+ data +')');
		});

		CashShop.ui.find('.item-paginations span.pagi-changepage').html(CashShop.currentPage);

		CashShop.renderCashShopItems(
			CashShop.paginate(
				items,
				CashShop.pageOffset,
				CashShop.pageEnd,
			)
		);
	}

	function onClickSearch(){
		let val = CashShop.ui.find('.inp-search').val().toLowerCase();
		let newList = [];

		CashShop.isSearch = true;
		CashShop.activeCashMenu = 'SEARCH_RESULT';
		if(val && CashShop.cashShopListItem.length > 0){
			for(var i = 0; i < CashShop.cashShopListItem.length; ++i){
				var items = CashShop.cashShopListItem[i].items;
				for(var iit = 0; iit < items.length; ++iit){
					items[iit].tab = CashShop.cashShopListItem[i].tabNum;
					var it = DB.getItemInfo( items[iit].itemId );
					
					if(it.identifiedDisplayName){
						var matches = new RegExp(val).test(it.identifiedDisplayName.toLowerCase());
						if(matches) newList.push(items[iit]);
					}
				}
			}
		}

		if(CashShop.ui.find('#main-menu .search-result').length === 0){
			CashShop.ui.find('#main-menu .menu').removeClass('active');
			CashShop.ui.find('#main-menu')
			.append(`
				<div class="menu search-result">
					<div class="menu-icon"></div>
					<div class="menu-name">Result</div>
				</div>
			`);
			CashShop.ui.find('#main-menu .menu.search-result').addClass('active');
		}

		Client.loadFile(DB.INTERFACE_PATH + `cashshop/btn_searchbar_normal.bmp`, function(data){
			CashShop.ui.find('#main-menu .search-result .menu-icon').css('backgroundImage', 'url('+ data +')');
		});

		if(newList.length === 0){
			CashShop.ui.find('.container-body .items').html('<div class="no-list-item">No item in list</div>');
			return;
		}

		CashShop.csListItemSearchResult = newList;
		CashShop.initPagination(newList);
		CashShop.paginationOffsetLimit();
		CashShop.renderCashShopItems(
			CashShop.paginate(
				newList,
				CashShop.pageOffset,
				CashShop.pageEnd,
			)
		);
	}

	function onClickIcon() {
		CashShop.checkCartItemLen = 0;
		CashShop.csListItemSearchResult = [];
		if (CashShop.ui.is(':visible')) {
			var pkt        = new PACKET.CZ.CASH_SHOP_CLOSE();
            Network.sendPacket(pkt);
			CashShop.ui.hide();
			CashShop.hide();
			CashShop.onRemove();
		}
		else {
			CashShop.show();
			CashShop.ui.find("#main-menu").empty();
			
			if(!CashShop.isNotRefresh){
				var pkt        = new PACKET.CZ.SE_CASHSHOP_OPEN2();
					pkt.tab        = 0;
					Network.sendPacket(pkt);
			} else {
				CashShop.paginationOffsetLimit();
				CashShop.renderCashShopItems(
					CashShop.paginate(
						CashShop.cashShopListItem[CashShop.activeCashMenu].items,
						CashShop.pageOffset,
						CashShop.pageEnd,
					)
				);
				CashShop.initPagination(CashShop.cashShopListItem[CashShop.activeCashMenu].items);
			}
			CashShop.loadComponentCashShop();
		}
	}

	function onClickActionCounterButtonCart(e){
		var counter = e.currentTarget.dataset.index;
		var itemId = jQuery(e.currentTarget).closest('.item').data('index');
		const itemCart = CashShop.cartItem.find(i => i.itemId === itemId);

		if(itemCart.amount >= 99 && counter === 'up'){
			UIManager.showMessageBox( 'Max Quantity 99!', 'ok');
			ChatBox.addText( 'Max Quantity 99!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		if(itemCart.amount <= 1 && counter === 'down'){
			UIManager.showMessageBox( 'Minimum Quantity 1!', 'ok');
			ChatBox.addText( 'Minimum Quantity 1!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}
		
		if(counter === 'up'){
			itemCart.amount += 1;
		} else {
			itemCart.amount -= 1;
		}

		jQuery(e.currentTarget).closest('.item').find('.item-counter .item-cnt').html(itemCart.amount);;
		CashShop.cartItemTotalPrice = CashShop.cartItem.map(item => item.price * item.amount).reduce((prev, next) => prev + next);
		CashShop.ui.find('.container-cart-footer .item-desc-price span').html(CashShop.cartItemTotalPrice);
	}

	function onClickDeleteItemInCart(e){
		var item = jQuery(e.currentTarget).closest('.item');
		var itemId = item.data('index');
		var deletedItem = CashShop.cartItem.find(i => i.itemId === itemId);
		var getPriceQtyItem = deletedItem.price * deletedItem.amount;

		CashShop.cartItem = CashShop.cartItem.filter(item => item.itemId != itemId);
		CashShop.cartItemTotalPrice = CashShop.cartItemTotalPrice - getPriceQtyItem;
		CashShop.ui.find('.container-cart-footer .item-desc-price span').html(CashShop.cartItemTotalPrice);
		item.remove();
	}

	/**
	 * Add cash item in cart list
	 */
	function onClickActionAddCartItem(e){
		
		var html = '';
		let itemId = parseInt(e.currentTarget.dataset.itemid);
		var it = DB.getItemInfo( itemId );
		var content = CashShop.ui.find('.container-cart');
		const itemCart = CashShop.cartItem.find(i => i.itemId === itemId);
		var item = [];
		var tab = 0;
		if(CashShop.activeCashMenu !== 'SEARCH_RESULT'){
			item = CashShop.cashShopListItem[CashShop.activeCashMenu].items.find(i => i.itemId === itemId);
			tab = CashShop.cashShopListItem[CashShop.activeCashMenu].tabNum;
		} else {
			item = CashShop.csListItemSearchResult.find(i => i.itemId === itemId);
			tab = item.tab;
		}

		if(content.find('#cart-list .items .no-items').length > 0){
			content.find('#cart-list .items .no-items').remove();
		}

		if(CashShop.cartItem.length > 4 && typeof itemCart === 'undefined'){
			//only 5 item can store in cart
			UIManager.showMessageBox( '5 Item can only stored in cart!', 'ok');
			return;
		}

		if(item.amount >= 99){
			UIManager.showMessageBox( 'Max Quantity 99!', 'ok');
			ChatBox.addText( 'Max Quantity 99!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		if(typeof itemCart === 'undefined'){
			item.amount = 1;
			item.tab = tab;
			CashShop.cartItem.push(item);
			html = `<li class="item" data-index="${itemId}">
					<div class="inner-item-dt">
						<div class="delete-item"><button>x</button></div>
						<div class="item-dt-img"></div>
						<div class="item-dt-desc">
							<div class="item-desc-top">${it.identifiedDisplayName}</div>
							<div class="item-counter">
								<div class="item-cnt">${item.amount}</div>
								<button class="counter-btn item-cnt-up" data-index="up"></button>
								<button class="counter-btn item-cnt-down" data-index="down"></button>
							</div>
							<div class="item-desc-price">
								<div class="icon-gold-coin"></div>
								<span>${item.price}</span>
							</div>
						</div>
					</div>
				</li>`;
			content.find('.items').append(html);
			Client.loadFile( DB.INTERFACE_PATH + 'collection/' + ( it.identifiedResourceName ) + '.bmp', function(data){
				content.find('.item[data-index="'+ itemId +'"] .item-dt-img').css('backgroundImage', 'url('+ data +')');
			});

			Client.loadFile( DB.INTERFACE_PATH + 'cashshop/img_shop_itemBg2.bmp', function(data){
				content.find('.item-counter').css('backgroundImage', 'url('+ data +')');
			});
		} else {
			itemCart.amount += 1;
			content.find('.items .item[data-index="'+itemId+'"] .item-cnt').html(itemCart.amount);
		}
		CashShop.cartItemTotalPrice = CashShop.cartItem.map(item => item.price * item.amount).reduce((prev, next) => prev + next);
		CashShop.ui.find('.container-cart-footer .item-desc-price span').html(CashShop.cartItemTotalPrice);
	}

	function onResetCartListCashShop(){
		CashShop.cartItem = [];
		CashShop.cartItemTotalPrice = 0;
		CashShop.ui.find('.container-cart .item-desc-price span').html(0);
		CashShop.ui.find('.container-cart #cart-list .items').empty();
		CashShop.ui.find('#cart-list .items').html(`<li class="no-items">No Item in cart!</li>`);
	}

	/**
	 * purchase item list in cart
	 */
	function onClickActionBuyItem(){
		const itemlist = CashShop.cartItem;
		CashShop.cartItemLen = itemlist.length;

		CashShop.ui.find('#purchase-btn').prop('disabled', true);
		UIManager.showPromptBox( 'Are you sure you want to buy this items?', 'ok', 'cancel', function(){
			if(CashShop.cartItem.length > 0){
				var pkt        	= new PACKET.CZ.SE_PC_BUY_CASHITEM_LIST();
				pkt.kafraPoints 	= 0;
				pkt.item_list 		= CashShop.cartItem;
				Network.sendPacket(pkt);
			} else {
				UIManager.showMessageBox( 'No item in cart!', 'ok');
				ChatBox.addText( 'No item in cart!', ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
				CashShop.ui.find('#purchase-btn').prop('disabled', false);
			}
		}, function(){
			CashShop.ui.find('#purchase-btn').prop('disabled', false);
		});
	}

	/**
	 * Menu navigation
	 */
	function onClickMenu(e){

		var contentMenu = CashShop.ui.find('#main-menu');
		var contentListItem = CashShop.ui.find('.container-body .inner-body .items');
		var selectedMenu = e.currentTarget.dataset.index.toUpperCase();
		selectedMenu = CashShop.cmenus.indexOf(selectedMenu);

		CashShop.ui.find('.item-searcher .inp-search').val('');
		if(contentMenu.find('.search-result').length > 0){
			contentMenu.find('.search-result').remove();
		}

		if(selectedMenu !== CashShop.activeCashMenu){
			CashShop.isSearch = false;
			CashShop.activeCashMenu = selectedMenu;
			contentListItem.empty();
			contentMenu.find('.menu').removeClass('active');
			e.currentTarget.classList.add('active');

			if(typeof CashShop.cashShopListItem[CashShop.activeCashMenu] !== 'undefined'){
				CashShop.initPagination(CashShop.cashShopListItem[CashShop.activeCashMenu].items);
				CashShop.renderCashShopItems(
					CashShop.paginate(
						CashShop.cashShopListItem[CashShop.activeCashMenu].items,
						CashShop.pageOffset,
						CashShop.pageEnd,
					)
				);
			} else {
				CashShop.ui.find('.container-body .items').html('<div class="no-list-item">No item in list</div>');
			}
		}
	}

	/**
	 * Hide the item name
	 */
	function onItemOut()
	{
		CashShop.ui.find('.overlay').hide();
	}


	/**
	 * Start dragging an item
	 */
	function onItemDragStart( event )
	{
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item  = CashShop.getItemByIndex(index);

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
				from: 'CashShop',
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
	 * Drop an item from storage to cash shop
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
		if (data.type !== 'item' || (data.from !== 'Storage' && data.from !== 'CartItems' && data.from !== 'Mail')) {
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

					case 'Mail':
						getModule('UI/Components/Mail/Mail').reqRemoveItem(
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

			case 'Mail':
				getModule('UI/Components/Mail/Mail').reqRemoveItem( item.index, 1 );
			break;
		}

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
	 * Hide/show cash shop's content
	 */
	function onToggleReduction()
	{
		var ui = CashShop.ui;

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
	 * Modify tab, filter display entries
	 */
	function onSwitchTab()
	{
		var idx          = jQuery(this).index();
		_preferences.tab = parseInt(idx, 10);

		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/tab_itm_0'+ (idx+1) +'.bmp', function(data){
			CashShop.ui.find('.tabs').css('backgroundImage', 'url(' + data + ')');
			//requestFilter();
		});
	}
	
	return UIManager.addComponent(CashShop);
});
