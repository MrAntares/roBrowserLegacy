/**
 * UI/Components/VendingReport/VendingReport.js
 *
 * Item Sell History
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB					= require('DB/DBManager');
	var jQuery				= require('Utils/jquery');
	var Network				= require('Network/NetworkManager');
	var PACKET				= require('Network/PacketStructure');
	var Client				= require('Core/Client');
	var Preferences			= require('Core/Preferences');
	var Mouse				= require('Controls/MouseEventHandler');
	var Renderer			= require('Renderer/Renderer');
	var EntityManager		= require('Renderer/EntityManager');
	var UIManager			= require('UI/UIManager');
	var UIComponent			= require('UI/UIComponent');
	var ItemInfo			= require('UI/Components/ItemInfo/ItemInfo');
	var Session				= require('Engine/SessionStorage');
	var VendingShop			= require('UI/Components/VendingShop/VendingShop');
	var htmlText			= require('text!./VendingReport.html');
	var cssText				= require('text!./VendingReport.css');
	var getModule			= require;


	/**
	 * Create Component
	 */
	var VendingReport = new UIComponent( 'VendingReport', htmlText, cssText );

	/**
	 * Store bought items
	 */
	var VendingReportTable = {
		list: [],
		_nextIndex: 0
	};


	/**
	 * @var {number} used to remember the window height
	 */
	VendingReport._resizing = false;
	VendingReport._startY = 0;
	VendingReport._startHeight = 0;


	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get('VendingReport', {
		x:        200,
		y:        200,
		width:    400,
		height:   180
	}, 1.0);


	/**
	 * Initialize UI
	 */
	VendingReport.init = function Init() {
		// Bind buttons
		this.ui.find('.btn.close').click(function(){
			VendingReport.onClose();
		});

		const self = this;

		this.ui.find('.extend').on('mousedown', function (e) {
			e.preventDefault();

			self._resizing = true;
			self._startY = e.clientY;
			self._startHeight = self.ui.find('.container .content').height();

			jQuery(document)
				.on('mousemove.vendingResize', self.onResizeDrag.bind(self))
				.on('mouseup.vendingResize', self.onResizeStop.bind(self));
		});

		this.ui
		// Items event
			.find('.container .content')
				.on('mousewheel DOMMouseScroll',  onScrollWheel)
				.on('wheel', onScrollWheel)
				.on('scroll', onScrollSync)
				.on('mouseover',   '.item', onItemOver)
				.on('mouseout',    '.item', onItemOut)
				.on('contextmenu', '.item', onItemInfo)

		this.draggable(this.ui.find('.titlebar'));
	};


	/**
	 * Apply preferences once append to body
	 */
	VendingReport.onAppend = function OnAppend() {
		//this.resize( _preferences.width, _preferences.height );

		this.ui.show();
	};


	/**
	 * Remove Inventory from window (and so clean up items)
	 */
	VendingReport.onRemove = function OnRemove() {

		VendingReport.reset();
		jQuery('.ItemInfo').remove();

		// Save preferences
		_preferences.y      =  parseInt(this.ui.css('top'), 10);
		_preferences.x      =  parseInt(this.ui.css('left'), 10);
		_preferences.save();

		this.ui.hide();

	};


	VendingReport.reset = function reset() {
		VendingReportTable.list.length = 0;
		VendingReportTable._nextIndex = 0;

		this.ui.find('.container .content').empty();
	};


	/**
	 * Extend window size
	 *
	 */
	VendingReport.onResizeDrag = function (e) {
		if (!this._resizing) return;

		const MIN_HEIGHT = 100;
		const MAX_HEIGHT = 260;

		const deltaY = e.clientY - this._startY;
		let newHeight = this._startHeight + deltaY;

		newHeight = Math.min(
			Math.max(newHeight, MIN_HEIGHT),
			MAX_HEIGHT
		);

		this.ui.find('.container .content').height(newHeight);
		this.ui.height(newHeight + 31 + 19);
	};


	/**
	 * Stop resizing window
	 *
	 * This function is called when the user stops resizing the window.
	 * It resets the _resizing flag and removes the event listener for the
	 * mousemove event.
	 */
	VendingReport.onResizeStop = function () {
		this._resizing = false;

		jQuery(document).off('.vendingResize');
	};


	/**
	 * Add a sold item to the Vending Report Table.
	 *
	 * @param {object} pkt - Sold item packet (contains index, count, zeny, date, and CID of buyer)
	 */
	VendingReport.add = function add(pkt) {
		if (!pkt) return;

		const shopItem = VendingShop.getItemByIndex(pkt.index);
		
		if (!shopItem) return;

		const entity = EntityManager.getByCID(pkt.CID);
		const buyer = entity ? entity.display.name : "Unknown";

		// Clone shop item snapshot
		const reportItem = jQuery.extend({}, shopItem, {
			reportId: ++VendingReportTable._nextIndex,
			shopindex: pkt.index,      // original shop slot
			count: pkt.count,          // sold count (override shop count)
			buyer: buyer,
			zeny: pkt.zeny,
			date: formatUnixDate(pkt.date),
			date_raw: pkt.date
		});

		this.addItem(reportItem);
	};


	/**
	 * Insert Item to Vending Report Table
	 *
	 * @param {object} Item
	 */
	VendingReport.addItem = function addItem(item) {
		// Every item is a unique transaction
		VendingReportTable.list.push(item);
		this.addItemSub(item);
	};


	/**
	 * Add item to Vending Report UI
	 *
	 * @param {object} Item
	 */
	VendingReport.addItemSub = function addItemSub(item) {
		var it = DB.getItemInfo(item.ITID);
		var content = this.ui.find('.container .content');

		content.append(
			'<div class="item" data-ITID="'+ item.ITID +'" data-index="'+ item.shopindex +'" data-id="'+ item.reportId +'">' +
				'<div class="icon"></div>' +
				'<div class="info">' +
					'<div class="count">' + item.count + '</div>' +
					'<div class="buyer">' + item.buyer + '</div>' +
					'<div class="zeny">' + prettyZeny(item.zeny, false).toLocaleString() + ' Zeny</div>' +
					'<div class="date">' + item.date + '</div>' +
				'</div>' +
			'</div>'
		);

		Client.loadFile(
			DB.INTERFACE_PATH + 'item/' +
			(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
			'.bmp',
			function (data) {
				content
					.find('.item[data-id="'+ item.reportId +'"] .icon')
					.css('backgroundImage', 'url('+ data +')');
			}
		);

		return true;
	};

	
	/**
	 * Prettify zeny : 1000000 -> 1,000,000
	 *
	 * @param {number} zeny
	 * @param {boolean} use color
	 * @return {string}
	 */
	function prettyZeny( val, useStyle ) {
		
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
	};


	/**
	 * Handle mouse wheel event to scroll the content.
	 *
	 * @param {Event} event The mouse wheel event.
	 *
	 * @return {boolean} false to prevent default handling.
	 */
	function onScrollWheel(event) {
		event.preventDefault();
		event.stopImmediatePropagation();

		const ROW_HEIGHT = 24;
		const oe = event.originalEvent;

		let delta = 0;
		if (oe.wheelDelta) {
			delta = oe.wheelDelta > 0 ? 1 : -1;
		} else if (oe.deltaY) {
			delta = oe.deltaY < 0 ? 1 : -1;
		}

		let target = this.scrollTop - delta * ROW_HEIGHT;

		const maxScroll = this.scrollHeight - this.clientHeight;
		target = Math.max(0, Math.min(target, maxScroll));

		target = Math.round(target / ROW_HEIGHT) * ROW_HEIGHT;

		this.scrollTop = target;
		this.style.backgroundPositionY = (-target) + "px";

		return false;
	};


	/**
	 * Sync the background position to the scroll position.
	 *
	 * This function is called whenever the content is scrolled.
	 */
	function onScrollSync() {
		// Just follow the scroll position
		this.style.backgroundPositionY = (-this.scrollTop) + "px";
	};


	/**
	 * Show item name when mouse is over
	 */
	function onItemOver() {
		var idx  = parseInt( this.getAttribute('data-id'), 10);
		var item = VendingReport.getItemByIndex(idx);

		if (!item) {
			return;
		}

		// Get back data
		var pos     = jQuery(this).position();
		var overlay = VendingReport.ui.find('.overlay');

		// Display box
		overlay.show();
		overlay.css({top: pos.top, left:pos.left+35});
		overlay.text(DB.getItemName(item));

		if (item.IsIdentified) {
			overlay.removeClass('grey');
		}
	};


	/**
	 * Hide the item name
	 */
	function onItemOut() {
		VendingReport.ui.find('.overlay').hide();
	};


	/**
	 * Get item info (open description window)
	 */
	function onItemInfo( event ) {
		event.stopImmediatePropagation();

		var index = parseInt(this.getAttribute('data-id'), 10);
		var item = VendingReport.getItemByIndex(index);

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
	};


	/**
	 * Search in a list for an item by its index
	 *
	 * @param {number} index
	 * @returns {Item}
	 */
	VendingReport.getItemByIndex = function getItemByIndex( index ) {
		var i, count;
		var list = VendingReportTable.list;

		for (i = 0, count = list.length; i < count; ++i) {
			if (list[i].reportId === index) {
				return list[i];
			}
		}

		return null;
	};


	/**
	* Format a Unix timestamp (seconds) into MM/DD - HH:mm:sec
	*
	* @param {number} unixTimestamp - Unix time in seconds
	* @returns {string} Formatted date string (MM/DD HH:mm)
	*/
	function formatUnixDate(unixTimestamp) {
		const d = new Date(unixTimestamp * 1000);

		return (
			String(d.getMonth() + 1).padStart(2, '0') + '/' +
			String(d.getDate()).padStart(2, '0') + ' - ' +
			String(d.getHours()).padStart(2, '0') + ':' +
			String(d.getMinutes()).padStart(2, '0') + ':' +
			String(d.getSeconds()).padStart(2, '0')
		);
	};


	/**
	 * Close
	 */
	VendingReport.onClose = function onClose() {
		this.onRemove();
	};


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(VendingReport);
});
