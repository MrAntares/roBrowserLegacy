/**
 * UI/Components/CashShop/CashShop.js
 *
 * CashShop windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Stephen-A
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var jQuery = require('Utils/jquery');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var KEYS = require('Controls/KeyEventHandler');
	var InputBox = require('UI/Components/InputBox/InputBox');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var Renderer = require('Renderer/Renderer');
	var Preferences = require('Core/Preferences');
	var Session = require('Engine/SessionStorage');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./CashShop.html');
	var cssText = require('text!./CashShop.css');

	var CashShop = new UIComponent('CashShop', htmlText, cssText);

	/**
	 * Store cash shop items
	 */
	CashShop.list = [];

	var _preferences = Preferences.get(
		'CashShop',
		{
			x: 80,
			y: 100,
			magnet_top: false,
			magnet_bottom: false,
			magnet_left: false,
			magnet_right: false
		},
		1.0
	);

	/**
	 * Store cash shop items
	 */

	CashShop.cashShopListItem = [];
	CashShop.csListItemSearchResult = [];

	/**
	 * Place the default banner image here
	 */
	CashShop.cashShopBannerTable = [];

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
	 * Current Item in cart item
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
	 * Pagination
	 */
	CashShop.pageOffset = 1;
	CashShop.pageLimit = 9;
	CashShop.currentPage = 1;
	CashShop.totalPage = 0;
	CashShop.isFirstPage = true;
	CashShop.isLastPage = false;
	CashShop.cartItemLen = 0;
	CashShop.checkCartItemLen = 0;
	CashShop.pageEnd = 9;
	CashShop.isSearch = false;

	/**
	 * Banner Carousel
	 */
	CashShop.bannerInterval = null;
	CashShop.currentBannerIndex = 0;
	CashShop.bannerRotationTime = 5000; // 5 seconds

	CashShop.init = function init() {
		this.ui.find('.titlebar .base').mousedown(stopPropagation);
		this.ui.find('.titlebar .close').click(function () {
			var pkt = new PACKET.CZ.CASH_SHOP_CLOSE();
			Network.sendPacket(pkt);
			CashShop.remove();
		});
		this.draggable(this.ui.find('.titlebar'));

		this.ui.on('click', '.purchase-btn-container button', onClickActionAddCartItem);
		this.ui.on('click', '#purchase-btn', onClickActionBuyItem);
		this.ui.on('click', '#panel-menu .tab', onClickMenu);
		this.ui.on('mouseover', '#panel-menu .tab', onMouseOverTab);
		this.ui.on('mousemove', '#panel-menu .tab', onMouseMoveTab);
		this.ui.on('mouseout', '#panel-menu .tab', onMouseOutTab);
		this.ui.on('click', '.panel-pagination .pagi-handler', onClickPagination);
		this.ui.on('click', '.cashshop-search-btn', onClickSearch);
		this.ui.on('click', '#cart-list .items .item .counter-btn', onClickActionCounterButtonCart);
		this.ui.on('click', '#cart-list .items .item .delete-item', onClickDeleteItemInCart);
		if (this.ui.find('#cart-list items').length > 0) {
			CashShop.onResetCartListCashShop();
		}

		// on drop item
		this.ui
			.on('dragover', stopPropagation)
			// Drop to cart
			.find('.panel-cart-body')
			.on('drop', onDropToCart)
			.on('dragover', stopPropagation)
			.end()
			// Banner events
			.on('click', '.banner-dot', function (e) {
				const index = parseInt(this.getAttribute('data-index'), 10);
				CashShop.goToBanner(index);
			})
			.on('click', '.banner-slide', function () {
				const url = this.getAttribute('data-url');
				if (url && url !== 'undefined' && url !== 'null') {
					window.open(url, '_blank');
				}
			})
			.on('click', '.panel-cart-charge-btn', function () {
				window.open(DB.getMessage(3301), '_blank');
			});

		// Items event
		this.ui
			.find('.panel-content .panel-items')
			.on('dragstart', '.item', onItemDragStart)
			.on('dragend', '.item', onItemDragEnd)
			.on('contextmenu', '.item', onItemInfo);

		CashShop.loadCashShopBanner();
	};

	CashShop.onAppend = function OnAppend() {
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		this.magnet.TOP = _preferences.magnet_top;
		this.magnet.BOTTOM = _preferences.magnet_bottom;
		this.magnet.LEFT = _preferences.magnet_left;
		this.magnet.RIGHT = _preferences.magnet_right;

		CashShop.loadComponentCashShop();
	};

	/**
	 * Remove Cash shop
	 */
	CashShop.onRemove = function onRemove() {
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.magnet_top = this.magnet.TOP;
		_preferences.magnet_bottom = this.magnet.BOTTOM;
		_preferences.magnet_left = this.magnet.LEFT;
		_preferences.magnet_right = this.magnet.RIGHT;
		_preferences.save();

		CashShop.stopBannerRotation();

		CashShop.csListItemSearchResult = [];
		CashShop.cashShopBannerTable = [];

		// empty .panel-items
		CashShop.ui.find('.panel-items').empty();

		// empty .cart-list .items
		CashShop.cartItem = [];
		CashShop.cartItemTotalPrice = 0;
		CashShop.cartItemLen = 0;
		CashShop.checkCartItemLen = 0;
		CashShop.ui.find('.cart-list .items').empty();

		// set price to 0C
		CashShop.ui.find('.cart-footer-action .total-price span').html('0 C');
		CashShop.ui.find('#use-free-points').val('0');
	};

	CashShop.clean = function clean() {
		CashShop.cashShopListItem = [];
		CashShop.csListItemSearchResult = [];
		CashShop.cashShopBannerTable = [];
		CashShop.cartItem = [];
		CashShop.cartItemTotalPrice = 0;
		CashShop.cartItemLen = 0;
		CashShop.checkCartItemLen = 0;
		Session.requestCashShop = true;
	};

	CashShop.loadCashShopBanner = function loadCashShopBanner() {
		this.cashShopBannerTable = DB.getCashShopBannerTable();

		if (CashShop.cashShopBannerTable?.length > 0) {
			const banners = CashShop.cashShopBannerTable;
			const slidesContainer = this.ui.find('.banner-slides');
			const dotsContainer = this.ui.find('.banner-dots');

			slidesContainer.empty();
			dotsContainer.empty();

			banners.forEach((banner, index) => {
				// Slide
				const slide = jQuery(
					'<div class="banner-slide" data-index="' +
						index +
						'" data-url="' +
						(banner.url || '') +
						'"><button class="btn-banner"></button></div>'
				);
				Client.loadFile(DB.INTERFACE_PATH + 'cashshop/' + banner.bmp, function (data) {
					slide.css('backgroundImage', 'url(' + data + ')');
				});
				if (index === 0) slide.addClass('active');
				slidesContainer.append(slide);

				// Dot
				const dot = jQuery(
					'<li class="banner-dot" data-background="cashshop/btn_ad_off.bmp" data-active="cashshop/btn_ad_on.bmp" data-index="' +
						index +
						'"><button class="btn-banner"></button></li>'
				);
				if (index === 0) dot.addClass('active');
				dotsContainer.append(dot);
			});

			this.ui.find('.banner-dots').each(this.parseHTML).find('*').each(this.parseHTML);

			CashShop.currentBannerIndex = 0;
		}
	};

	CashShop.onKeyDown = function onKeyDown(event) {
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
			var pkt = new PACKET.CZ.CASH_SHOP_CLOSE();
			Network.sendPacket(pkt);
			CashShop.remove();
		}
	};

	CashShop.readPoints = function readPoints(cashPoint, kafraPoints, tab) {
		this.cashPoint = cashPoint;
		this.kafraPoints = kafraPoints;
		this.activeCashMenu = tab || 0; // 0x0845 no tab
		this.ui.find('#cashpoint > span').html(this.cashPoint);
		this.ui.find('.cashpoint_footer').html(this.cashPoint + ' C');
		this.ui.find('.free-point').html(this.kafraPoints + ' C');
	};

	/**
	 * Search in a list for an item by its index
	 *
	 * @param {number} index
	 * @returns {Item}
	 */
	CashShop.getItemByIndex = function getItemByIndex(index) {
		var i, count;
		var list;

		if (CashShop.isSearch) {
			list = CashShop.csListItemSearchResult;
			for (i = 0, count = list.length; i < count; ++i) {
				if (list[i].itemId === index) {
					return list[i];
				}
			}
		} else {
			// Search in all loaded categories or just the active one?
			// The item should be in the active category if we are dragging it.
			if (CashShop.cashShopListItem[CashShop.activeCashMenu]) {
				list = CashShop.cashShopListItem[CashShop.activeCashMenu].items;
				for (i = 0, count = list.length; i < count; ++i) {
					if (list[i].itemId === index) {
						return list[i];
					}
				}
			}
		}

		return null;
	};

	/**
	 * Success reponse buying cash shop item
	 */
	CashShop.setSuccessCashShopUpdate = function setSuccessCashShopUpdate(res) {
		if (res) {
			CashShop.checkCartItemLen += 1;
			switch (res.result) {
				case 0:
					if (CashShop.checkCartItemLen >= CashShop.cartItemLen) {
						CashShop.cartItemLen = 0;
						CashShop.checkCartItemLen = 0;
						UIManager.showMessageBox('Successfully done buying items from cash shop!', 'ok');
						ChatBox.addText(
							'Successfully done buying items from cash shop!',
							ChatBox.TYPE.INFO,
							ChatBox.FILTER.PUBLIC_LOG
						);
						CashShop.ui.find('#cashpoint span').html(res.cashPoints);
						CashShop.ui.find('.cashpoint_footer').html(res.cashPoints);
						onResetCartListCashShop();
					}
					break;
				case 2:
					//insuficient cashpoint or kafra points
					UIManager.showMessageBox('Insuficient cash points or kafra points!', 'ok');
					ChatBox.addText(
						'Insuficient cash points or kafra points!',
						ChatBox.TYPE.ERROR,
						ChatBox.FILTER.PUBLIC_LOG
					);
					break;

				case 4:
					//overweight limit
					UIManager.showMessageBox(`You are over you're weight limit!`, 'ok');
					ChatBox.addText('You are over youre weight limit!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					break;

				default:
					UIManager.showMessageBox('Something went wrong while using cashshop!', 'ok');
					ChatBox.addText(
						'Something went wrong while using cashshop!',
						ChatBox.TYPE.ERROR,
						ChatBox.FILTER.PUBLIC_LOG
					);
					break;
			}
		}
	};

	CashShop.readCashShopItems = function readCashShopItems(items) {
		CashShop.cashShopListItem.push({
			count: items.count,
			items: items.items,
			tabNum: items.tabNum
		});
	};

	/**
	 * Load Cash Shop Components
	 */
	CashShop.loadComponentCashShop = function loadComponentCashShop() {
		if (CashShop.cashShopBannerTable?.length > 0) {
			CashShop.startBannerRotation();
		}

		CashShop.isSearch = false;

		// toggle active at activeCashmenu usind data-index to search
		CashShop.ui.find('#panel-menu .tab').removeClass('active');
		CashShop.ui.find('#panel-menu .tab[data-index="' + CashShop.activeCashMenu + '"]').addClass('active');

		let tab_items =
			CashShop.cashShopListItem[CashShop.activeCashMenu]?.items?.length >= 0
				? CashShop.cashShopListItem[CashShop.activeCashMenu].items
				: [];
		CashShop.initPagination(tab_items);
		CashShop.renderCashShopItems(CashShop.paginate(tab_items, CashShop.pageOffset, CashShop.pageEnd));
	};

	CashShop.startBannerRotation = function () {
		this.stopBannerRotation();
		if (this.cashShopBannerTable.length > 1) {
			this.bannerInterval = setInterval(() => {
				this.nextBanner();
			}, this.bannerRotationTime);
		}
	};

	CashShop.stopBannerRotation = function () {
		if (this.bannerInterval) {
			clearInterval(this.bannerInterval);
			this.bannerInterval = null;
		}
	};

	CashShop.nextBanner = function () {
		let nextIndex = this.currentBannerIndex + 1;
		if (nextIndex >= this.cashShopBannerTable.length) {
			nextIndex = 0;
		}
		this.goToBanner(nextIndex);
	};

	CashShop.goToBanner = function (index) {
		if (index === this.currentBannerIndex) return;

		const slides = this.ui.find('.banner-slide');
		const dots = this.ui.find('.banner-dot');

		slides.removeClass('active');
		dots.removeClass('active');

		slides.eq(index).addClass('active');
		dots.eq(index).addClass('active');

		this.currentBannerIndex = index;

		// Reset timer on manual interaction
		this.startBannerRotation();
	};

	CashShop.renderCashShopItems = function renderCashShopItems(items) {
		this.ui.find('#panel-items').empty();
		var content = this.ui.find('#panel-items');
		for (var i = 0; i < items.length; i++) {
			let item = structuredClone(items[i]);
			var it = DB.getItemInfo(item.itemId);
			content.append(
				`<div class="item" draggable="true" title="${it.identifiedDisplayName}" data-index="${item.itemId}" data-background="cashshop/img_shop_itembg.bmp">
					<div class="top-con">
						<span class="item-name">${it.identifiedDisplayName}</span>
					</div>
					<div class="lower-con">
						<div class="item-left-img" data-background="${'collection/' + it.identifiedResourceName + '.bmp'}"></div>
						<div class="item-right-desc">
							<div class="item-desc-price">
								<span>${item.price}</span>
							</div>
							<div class="purchase-btn-container">
								<button id="add-to-cart" class="add-to-cart" data-itemId="${item.itemId}" tab-index="${i}" data-background="cashshop/btn_add_normal.bmp" data-down="cashshop/btn_add_press.bmp">Purchase</button>
							</div>
						</div>
					</div>
				</div>`
			);
		}
		content.each(this.parseHTML).find('*').each(this.parseHTML);
	};

	CashShop.initPagination = function initPagination(items) {
		CashShop.currentPage = 1;
		CashShop.pageOffset = 0;
		CashShop.pageEnd = CashShop.pageLimit;
		CashShop.isFirstPage = true;
		CashShop.isLastPage = items.length >= CashShop.pageLimit ? false : true;

		var content = CashShop.ui.find('.panel-pagination');
		const arrowsL = CashShop.isFirstPage ? 'off' : 'on';
		const arrowsR = CashShop.isLastPage ? 'off' : 'on';

		CashShop.totalPage = Math.ceil(items.length / CashShop.pageLimit);
		CashShop.ui.find('.panel-pagination span.pagi-countpage').html(CashShop.totalPage);
		CashShop.ui.find('.panel-pagination span.pagi-changepage').html(CashShop.totalPage > 0 ? 1 : 0);

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR_' + arrowsR + '.bmp', function (data) {
			content.find('.go-next').css('backgroundImage', 'url(' + data + ')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR2_' + arrowsR + '.bmp', function (data) {
			content.find('.go-last').css('backgroundImage', 'url(' + data + ')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL_' + arrowsL + '.bmp', function (data) {
			content.find('.go-prev').css('backgroundImage', 'url(' + data + ')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL2_' + arrowsL + '.bmp', function (data) {
			content.find('.go-first').css('backgroundImage', 'url(' + data + ')');
		});
	};

	CashShop.paginate = function paginate(items, start, end) {
		return items.slice(start, end);
	};

	CashShop.paginationOffsetLimit = function paginationOffsetLimit() {
		var start = (CashShop.currentPage - 1) * CashShop.pageLimit;
		var end = CashShop.pageLimit * CashShop.currentPage;
		CashShop.pageOffset = start;
		CashShop.pageEnd = end;
	};

	function onClickPagination(e) {
		let index = parseInt(e.currentTarget.dataset.index);
		let items = CashShop.isSearch
			? CashShop.csListItemSearchResult
			: CashShop.cashShopListItem[CashShop.activeCashMenu]?.items || [];
		if (items.length === 0) return;
		var content = CashShop.ui.find('.panel-pagination');

		CashShop.isFirstPage = false;
		CashShop.isLastPage = false;

		switch (index) {
			case 1: //go first//
				CashShop.currentPage = 1;
				CashShop.pageOffset = 0;
				CashShop.isFirstPage = true;
				break;
			case 2: //go prev//
				CashShop.currentPage--;
				if (CashShop.currentPage <= 1) {
					CashShop.currentPage = 1;
					CashShop.isFirstPage = true;
				}
				break;
			case 3: //go next//
				CashShop.currentPage++;
				if (CashShop.currentPage >= CashShop.totalPage) {
					CashShop.currentPage = CashShop.totalPage;
					CashShop.isLastPage = true;
				}
				break;
			case 4: //go last//
				CashShop.currentPage = CashShop.totalPage;
				CashShop.pageOffset = (CashShop.currentPage - 1) * CashShop.pageLimit;
				CashShop.isLastPage = true;
				break;
		}
		CashShop.paginationOffsetLimit();

		const arrowsL = CashShop.isFirstPage ? 'off' : 'on';
		const arrowsR = CashShop.isLastPage ? 'off' : 'on';
		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR_' + arrowsR + '.bmp', function (data) {
			content.find('.go-next').css('backgroundImage', 'url(' + data + ')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowR2_' + arrowsR + '.bmp', function (data) {
			content.find('.go-last').css('backgroundImage', 'url(' + data + ')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL_' + arrowsL + '.bmp', function (data) {
			content.find('.go-prev').css('backgroundImage', 'url(' + data + ')');
		});

		Client.loadFile(DB.INTERFACE_PATH + 'cashshop/bt_arrowL2_' + arrowsL + '.bmp', function (data) {
			content.find('.go-first').css('backgroundImage', 'url(' + data + ')');
		});

		CashShop.ui.find('.panel-pagination span.pagi-changepage').html(CashShop.currentPage);

		CashShop.renderCashShopItems(CashShop.paginate(items, CashShop.pageOffset, CashShop.pageEnd));
	}

	function onClickSearch() {
		let val = CashShop.ui.find('.cashshop-search').val().toLowerCase();
		let newList = [];

		CashShop.isSearch = true;
		CashShop.activeCashMenu = 9;
		if (val && CashShop.cashShopListItem.length > 0) {
			for (var i = 0; i < CashShop.cashShopListItem.length; ++i) {
				var items = CashShop.cashShopListItem[i].items;
				for (var iit = 0; iit < items.length; ++iit) {
					items[iit].tab = CashShop.cashShopListItem[i].tabNum;
					var it = DB.getItemInfo(items[iit].itemId);

					if (it.identifiedDisplayName) {
						var matches = new RegExp(val).test(it.identifiedDisplayName.toLowerCase());
						if (matches) newList.push(items[iit]);
					}
				}
			}
		}

		if (CashShop.ui.find('#panel-menu .search-result').length === 0) {
			CashShop.ui.find('#panel-menu .tab').removeClass('active');
		}

		if (newList.length === 0) {
			UIManager.showMessageBox('No items found in auction search', 'ok');
			return;
		}

		CashShop.csListItemSearchResult = newList;
		CashShop.initPagination(newList);
		CashShop.paginationOffsetLimit();
		CashShop.renderCashShopItems(CashShop.paginate(newList, CashShop.pageOffset, CashShop.pageEnd));
	}

	function onClickActionCounterButtonCart(e) {
		var counter = e.currentTarget.dataset.index;
		var itemId = jQuery(e.currentTarget).closest('.item').data('index');
		const itemCart = CashShop.cartItem.find(i => i.itemId === itemId);

		if (itemCart.amount >= 99 && counter === 'up') {
			UIManager.showMessageBox('Max Quantity 99!', 'ok');
			ChatBox.addText('Max Quantity 99!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		if (itemCart.amount <= 1 && counter === 'down') {
			UIManager.showMessageBox('Minimum Quantity 1!', 'ok');
			ChatBox.addText('Minimum Quantity 1!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		if (counter === 'up') {
			itemCart.amount += 1;
		} else {
			itemCart.amount -= 1;
		}

		jQuery(e.currentTarget).closest('.item').find('.item-counter .item-cnt').html(itemCart.amount);
		updateCartTotal();
	}

	function onClickDeleteItemInCart(e) {
		var item = jQuery(e.currentTarget).closest('.item');
		var itemId = item.data('index');

		CashShop.cartItem = CashShop.cartItem.filter(item => item.itemId != itemId);
		item.remove();
		updateCartTotal();
	}

	function updateCartTotal() {
		if (CashShop.cartItem.length === 0) {
			CashShop.cartItemTotalPrice = 0;
		} else {
			CashShop.cartItemTotalPrice = CashShop.cartItem.reduce(
				(total, item) => total + item.price * item.amount,
				0
			);
		}
		CashShop.ui.find('.cart-footer-action .total-price span').html(CashShop.cartItemTotalPrice + ' C');
	}

	function onResetCartListCashShop() {
		CashShop.cartItem = [];
		CashShop.cartItemTotalPrice = 0;
		CashShop.ui.find('.cart-footer-action .total-price span').html('0 C');
		CashShop.ui.find('.panel-cart #cart-list .items').empty();
	}

	function onDropToCart(event) {
		var item, data;
		event.stopImmediatePropagation();

		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
			item = data.data;
		} catch (e) {
			return false;
		}

		if (data.type === 'item' && data.from === 'CashShop') {
			InputBox.append();
			InputBox.setType('number', false, 1);
			InputBox.onSubmitRequest = function OnSubmitRequest(count) {
				addItemToCart(item.itemId, count);
				InputBox.remove();
			};
		}

		return false;
	}

	function addItemToCart(itemId, amount = 1) {
		var html = '';
		var it = DB.getItemInfo(itemId);
		var content = CashShop.ui.find('.panel-cart');
		const itemCart = CashShop.cartItem.find(i => i.itemId === itemId);
		var item = [];
		var tab = 0;

		if (CashShop.activeCashMenu !== 9) {
			item = CashShop.cashShopListItem[CashShop.activeCashMenu].items.find(i => i.itemId === itemId);
			tab = CashShop.cashShopListItem[CashShop.activeCashMenu].tabNum;
		} else {
			item = CashShop.csListItemSearchResult.find(i => i.itemId === itemId);
			tab = item.tab;
		}

		if (!item) return; // Guard clause

		if (content.find('#cart-list .items .no-items').length > 0) {
			content.find('#cart-list .items .no-items').remove();
		}

		if (CashShop.cartItem.length > 7 && typeof itemCart === 'undefined') {
			UIManager.showMessageBox('8 Items can only be stored in cart!', 'ok');
			return;
		}

		if (item.amount >= 99) {
			UIManager.showMessageBox('Max Quantity 99!', 'ok');
			ChatBox.addText('Max Quantity 99!', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			return;
		}

		if (typeof itemCart === 'undefined') {
			item.amount = amount;
			item.tab = tab;
			CashShop.cartItem.push(item);
			html = `<li class="item" data-index="${itemId}" data-background="cashshop/img_shop_itembg2.bmp">
				<div class="inner-item-dt">
					<div class="delete-item" data-background="cashshop/btn_close.bmp"></div>
					<div class="item-dt-img"></div>
					<div class="item-dt-desc">
						<div class="item-desc-top">${it.identifiedDisplayName}</div>
						<div class="item-counter">
							<div class="item-cnt">${item.amount}</div>
							<button class="counter-btn item-cnt-up" data-index="up"></button>
							<button class="counter-btn item-cnt-down" data-index="down"></button>
						</div>
						<div class="item-desc-price">
							<span>${item.price}</span> C
						</div>
					</div>
				</div>
			</li>`;
			content.find('.items').append(html);
			Client.loadFile(DB.INTERFACE_PATH + 'collection/' + it.identifiedResourceName + '.bmp', function (data) {
				content
					.find('.item[data-index="' + itemId + '"] .item-dt-img')
					.css('backgroundImage', 'url(' + data + ')');
			});
		} else {
			itemCart.amount += amount;
			content.find('.items .item[data-index="' + itemId + '"] .item-cnt').html(itemCart.amount);
		}
		content.each(CashShop.parseHTML).find('*').each(CashShop.parseHTML);
		updateCartTotal();
	}

	/**
	 * Add cash item in cart list
	 */
	function onClickActionAddCartItem(e) {
		let itemId = parseInt(e.currentTarget.dataset.itemid);
		addItemToCart(itemId);
	}

	/**
	 * purchase item list in cart
	 */
	function onClickActionBuyItem() {
		const itemlist = CashShop.cartItem;
		CashShop.cartItemLen = itemlist.length;

		UIManager.showPromptBox('Are you sure you want to buy this items?', 'ok', 'cancel', function () {
			if (CashShop.cartItem.length > 0) {
				var pkt = new PACKET.CZ.SE_PC_BUY_CASHITEM_LIST();
				var useFreePoints = CashShop.ui.find('#use-free-points').val() || 0;
				if (useFreePoints >= 0 && useFreePoints <= CashShop.kafraPoints) {
					pkt.kafraPoints = useFreePoints;
					pkt.item_list = CashShop.cartItem;
					Network.sendPacket(pkt);
				} else {
					UIManager.showMessageBox('You dont have enough Kafra Points!', 'ok');
				}
			} else {
				UIManager.showMessageBox('No item in cart!', 'ok');
			}
		});
	}

	/**
	 * Menu navigation
	 */
	function onClickMenu(e) {
		var contentMenu = CashShop.ui.find('#panel-menu');
		var contentListItem = CashShop.ui.find('.panel-items');
		var selectedMenu = e.currentTarget.dataset.index.toUpperCase();

		CashShop.ui.find('#cashshop-search').val('');

		if (selectedMenu !== CashShop.activeCashMenu) {
			CashShop.isSearch = false;
			CashShop.activeCashMenu = selectedMenu;
			contentListItem.empty();
			contentMenu.find('.tab').removeClass('active');
			e.currentTarget.classList.add('active');

			let tab_items =
				CashShop.cashShopListItem[CashShop.activeCashMenu]?.items?.length >= 0
					? CashShop.cashShopListItem[CashShop.activeCashMenu].items
					: [];
			CashShop.initPagination(tab_items);
			CashShop.renderCashShopItems(CashShop.paginate(tab_items, CashShop.pageOffset, CashShop.pageEnd));
		}
	}

	/**
	 * Hide the item name
	 */
	function onItemOut() {
		CashShop.ui.find('.overlay').hide();
	}

	function onMouseMoveTab(event) {
		var overlay = CashShop.ui.find('.overlay');
		var offset = CashShop.ui.offset();
		var x = event.pageX - offset.left;
		var y = event.pageY - offset.top - 30;

		overlay.css({
			top: y + 'px',
			left: x + 'px'
		});
	}

	function onMouseOverTab() {
		var title = this.getAttribute('data-title');
		var overlay = CashShop.ui.find('.overlay');
		overlay.text(title).show();
	}

	function onMouseOutTab() {
		CashShop.ui.find('.overlay').hide();
	}

	/**
	 * Start dragging an item
	 */
	function onItemDragStart(event) {
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item = CashShop.getItemByIndex(index);

		if (!item) {
			return;
		}

		// Set image to the drag drop element
		var img = new Image();
		var url = this.querySelector('.item-left-img').style.backgroundImage.match(/\(([^\)]+)/)[1];
		img.decoding = 'async';
		img.src = url.replace(/^\"/, '').replace(/\"$/, '');

		event.originalEvent.dataTransfer.setDragImage(img, 12, 12);
		event.originalEvent.dataTransfer.setData(
			'Text',
			JSON.stringify(
				(window._OBJ_DRAG_ = {
					type: 'item',
					from: 'CashShop',
					data: item
				})
			)
		);

		onItemOut();
	}

	/**
	 * Stop dragging an item
	 *
	 */
	function onItemDragEnd() {
		delete window._OBJ_DRAG_;
	}

	function onItemInfo(event) {
		event.stopImmediatePropagation();

		var index = parseInt(this.getAttribute('data-index'), 10);
		var item = CashShop.getItemByIndex(index);

		if (!item) {
			return false;
		}

		// Don't add the same UI twice, remove it
		if (ItemInfo.uid === item.itemId) {
			ItemInfo.remove();
			return false;
		}

		var it = DB.getItemInfo(item.itemId);
		it.ITID = item.itemId;
		it.IsIdentified = true;

		// Add ui to window
		ItemInfo.append();
		ItemInfo.uid = it.ITID;
		ItemInfo.setItem(it);

		return false;
	}

	/**
	 * Stop event propagation
	 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	return UIManager.addComponent(CashShop);
});
