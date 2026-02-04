/**
 * UI/Components/LaphineUpg/LaphineUpg.js
 *
 * Laphine Upgrade UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
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
	var Network            = require('Network/NetworkManager');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var Equipment		   = require('UI/Components/Equipment/Equipment');
	var Inventory		   = require('UI/Components/Inventory/Inventory');
	var ItemCompare        = require('UI/Components/ItemCompare/ItemCompare');
	var ItemInfo           = require('UI/Components/ItemInfo/ItemInfo');
	var Client             = require('Core/Client');
	var KEYS               = require('Controls/KeyEventHandler');
	var htmlText           = require('text!./LaphineUpg.html');
	var cssText            = require('text!./LaphineUpg.css');
	var PACKET        	   = require('Network/PacketStructure');
	var PACKETVER   	   = require('Network/PacketVerManager');
	var getModule     	   = require;


	/**
	 * Create Component
	 */
	var LaphineUpg = new UIComponent( 'LaphineUpg', htmlText, cssText );


	/**
	 * @var {number} LaphineUpg
	 */
	const LaphineUpgUIState = {
		itemId: null,
		needRefineMin: null,
		needRefineMax: null,
		needoptionnummin: null,
		notsocketenchantitem: null,
		targetItems: [],
		needSourceString: null
	};


	// Initialize a list to keep track of submitted items
    LaphineUpg.submittedIndex = 0;


	/**
	 * Once append to the DOM
	 */
	LaphineUpg.onKeyDown = function onKeyDown( event )
	{
		if ((event.which === KEYS.ESCAPE || event.key === "Escape") && this.ui.is(':visible')) {
			LaphineUpg.remove();
		}
	};


	/**
	 * Once append
	 */
	LaphineUpg.onAppend = function onAppend()
	{
		// Seems like "EscapeWindow" is execute first, push it before.
		var events = jQuery._data( window, 'events').keydown;
		events.unshift( events.pop() );

		LaphineUpg.ui.find('.some_notifs').hide();
		LaphineUpg.ui.find('.make_enabled').hide();
		LaphineUpg.ui.find('.make_disabled').show();
	};


	/**
	 * Once removed from html
	 */
	LaphineUpg.onRemove = function onRemove()
	{
		LaphineUpg.submittedIndex = 0;
		LaphineUpg.ui.find('.submit_button_enabled').show();
        LaphineUpg.ui.find('.submit_button_disabled').hide();
        LaphineUpg.ui.find('.submitted_mat_list').empty();
		LaphineUpg.ui.find('.some_notifs').hide();
		clearLaphineUpgUIState();
	};


	/**
	 * Clears the variables in the LaphineUpgUIState object.
	 */
	function clearLaphineUpgUIState() {
		Object.keys(LaphineUpgUIState).forEach(function(key) {
            if (Array.isArray(LaphineUpgUIState[key])) {
                LaphineUpgUIState[key] = [];
            } else {
                LaphineUpgUIState[key] = null;
            }
        });
	};


	/**
	 * Initialize UI
	 */
	LaphineUpg.init = function init()
	{
		var ui = this.ui;

		// UI initializations
		ui.find('.submit_button_disabled').hide();
		ui.find('.some_notifs').hide();
		ui.css({ top: 200, left:480 });
		this.draggable(ui.find('.titlebar'));

		// Functions bind
		ui.find('.close, .cancel').click(onRequestLaphineUpgClose);
		ui.find('.available_mat_list, .left_panel')
			.on('dragover', stopPropagation)
			.on('dragstart',   '.item', onItemDragStart)
			.on('dragend',     '.item', onItemDragEnd);
		ui.find('.submit_button_enabled').click(onSubmitItem);
		ui.find('.available_mat_list')
			.on('click', '.item', onItemSelect)
			.on('drop', onRemoveSubmitDrop)
		ui.find('.left_panel')
			.on('drop', onSubmitItemDrop);
		ui.find('.make_enabled').click(onRequestLaphineUpg);
		ui.find('.available_mat_list, .submitted_mat_list')
			.on('mouseover',   '.item', onItemOver)
			.on('mouseout',    '.item', onItemOut)
			.on('contextmenu', '.item', onItemInfo);


		// Setting chatbox scrollbar
		Client.loadFiles([
			DB.INTERFACE_PATH + 'lapine/scrollbar_bg_btm.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_bg_mid.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_bg_top.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_out_btm.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_out_mid.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_out_top.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_over_btm.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_over_mid.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_over_top.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_press_btm.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_press_mid.bmp',
			DB.INTERFACE_PATH + 'lapine/scrollbar_thumb_press_top.bmp'
		], function (bgBottom, bgMid, bgTop, thumbOutBottom, thumbOutMid, thumbOutTop, thumbOverBottom, thumbOverMid, thumbOverTop, thumbPressBottom, thumbPressMid, thumbPressTop) {
			jQuery('style:first').append([
				'#LaphineUpg .available_mat_list::-webkit-scrollbar { width: 8px; height: 0px; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-corner { display: none; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-button:vertical:increment { background: url(' + bgBottom + ') center center no-repeat, url(' + bgMid + ') top no-repeat; height: 15px; width: 7px; background-color: transparent; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-button:vertical:decrement { background: url(' + bgTop + ') center center no-repeat, url(' + bgMid + ') bottom no-repeat; height: 15px; width: 7px; background-color: transparent; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-track-piece:vertical { background: url(' + bgTop + ') top no-repeat, url(' + bgMid + ') center repeat-y, url(' + bgBottom + ') bottom no-repeat; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-thumb:vertical { background: url(' + thumbOutTop + ') top no-repeat, url(' + thumbOutMid + ') center repeat-y, url(' + thumbOutBottom + ') bottom no-repeat !important; border-radius: 100px; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-thumb:vertical:hover { background: url(' + thumbOverTop + ') top no-repeat, url(' + thumbOverMid + ') center repeat-y, url(' + thumbOverBottom + ') bottom no-repeat !important; border-radius: 100px; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-thumb:vertical:active { background: url(' + thumbPressTop + ') top no-repeat, url(' + thumbPressMid + ') center repeat-y, url(' + thumbPressBottom + ') bottom no-repeat !important; border-radius: 100px; }',
				'#LaphineUpg .available_mat_list::-webkit-scrollbar-thumb:vertical{ -webkit-border-image: none; }'
			].join('\n'));
		});
	};


	/**
 	* Opens the Laphine UI and initializes its state based on the provided packet data.
 	* @param {object} pkt - The packet containing item information.
 	*/
	function onOpenLaphineUpgUI(pkt)
	{
		if (pkt) {
            clearLaphineUpgUIState();

			// Assume lapine_list is already loaded and available
			let laphineUpgInfo = DB.getLaphineUpgInfoById(pkt.itemId);

			if (laphineUpgInfo) {

				// Update the state object
				LaphineUpgUIState.itemId = laphineUpgInfo.ItemID;
				LaphineUpgUIState.needRefineMin = laphineUpgInfo.NeedRefineMin;
				LaphineUpgUIState.needRefineMax = laphineUpgInfo.NeedRefineMax;
				LaphineUpgUIState.needoptionnummin = laphineUpgInfo.NeedOptionNumMin;
				LaphineUpgUIState.notsocketenchantitem = laphineUpgInfo.NotSocketEnchantItem;
				LaphineUpgUIState.targetItems = laphineUpgInfo.TargetItems;
				LaphineUpgUIState.needSourceString = laphineUpgInfo.NeedSource_String;

				// Use a function to build/update your UI
				onUpdateLaphineUpgUI();
				populateAvailableUpgMatList();
				LaphineUpg.append();
			} else {
				console.warn("Item with ID", pkt.itemId, "not found in laphine upgrade list.");
			}
		}
	};


	/**
 	* Updates the Laphine UI with the current state information.
 	*/
	function onUpdateLaphineUpgUI()
	{
		var item = Inventory.getUI().getItemById(LaphineUpgUIState.itemId);

		if (!item) {
			return false;
		}

		var ui = LaphineUpg.ui;
		ui.find('.item_text').text(DB.getItemName(item));
		ui.find('.mat_info_list').text(LaphineUpgUIState.needSourceString);
	};


	/**
	 * Get item objects by id
	 *
	 * @param {number} id
	 * @returns {Array<Item>}
	 */
	function GetInventoryItemsById(id) {
	    var items = [];
	    var list = Inventory.getUI().list;

	    for (var i = 0, count = list.length; i < count; ++i) {
	        if (list[i].ITID === id) {
	            items.push(list[i]);
	        }
	    }

	    return items;
	};


	/**
 	* Populates the list of available materials.
 	*/
	function populateAvailableUpgMatList() {
		let availableMatList = LaphineUpg.ui.find('.available_mat_list');
		availableMatList.empty(); // Clear the list before populating

		LaphineUpgUIState.targetItems.forEach(targetItem => {
			let matchingItems = GetInventoryItemsById(targetItem.id);
			matchingItems.forEach(inventoryItem => {
				let isValid = true;

            	// Check refining level for weapons and equipment
            	if ((inventoryItem.type === ItemType.WEAPON || inventoryItem.type === ItemType.ARMOR) &&
            	    (inventoryItem.RefiningLevel < LaphineUpgUIState.needRefineMin ||
            	     inventoryItem.RefiningLevel > LaphineUpgUIState.needRefineMax)) {
            	    	isValid = false;
            	}

				if (LaphineUpgUIState.needoptionnummin) {
					isValid = false;
            		// Check the options count
            		if (inventoryItem.Options) {
						let numOfOptions = inventoryItem.Options.filter(Option => Option.index !== 0).length;
						if (numOfOptions && numOfOptions >= LaphineUpgUIState.needoptionnummin) {
            		    	isValid = true;
						}
            		}
				}

            	if (isValid) {
            	    // We get icon name from item table instead because some targetItem.name are not identifiedResourceName
					let it = DB.getItemInfo(targetItem.id);

					if (!it) {
						return;	// Skip this iteration of the inner forEach loop
					}

					let icon_name = it.identifiedResourceName;
					onAddMaterialItem(inventoryItem, icon_name);
            	}
			});
		});
	};


	/**
 	* Handles the addition of an item in the UI from the available materials list.
 	*/
	function onAddMaterialItem( item, target_iconname)
	{
		let availableMatList = LaphineUpg.ui.find('.available_mat_list');

		// Add item details
		let newItem = jQuery('<div class="item" data-index="' + item.index + '" draggable="true">' +
			'<div class="icon"></div>' +
			'<div class="name">'+DB.getItemName(item, {showItemGrade: false, showItemSlots:false})+'</div>' +
			'</div>'
		);

		newItem.dblclick(onSubmitItem); // Add double-click event listener to submit item
		availableMatList.append(newItem);

		Client.loadFile( DB.INTERFACE_PATH + 'item/' + target_iconname + '.bmp', function(data){
			availableMatList.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
		});

		Client.loadFile( DB.INTERFACE_PATH + 'lapine/list_selected_item.bmp', function(data){
			availableMatList.find('.item[data-index="'+ item.index +'"] .name').css('backgroundImage', 'url('+ data +')');
		});
	};


	/**
 	* Handles the result of Laphine Upgrade.
 	*/
	function onLaphineUpgResult(pkt)
	{
		if (pkt) {
			switch (pkt.result) {
				case 0:
					onRequestLaphineUpgClose();
					break;
				case 1:
				default:
					break;
			}
		}
	};


	/**
 	* Handles the close request of the Laphine UI and sends the appropriate packet.
 	*/
	function onRequestLaphineUpgClose()
	{
		LaphineUpg.remove();

		var pkt = new PACKET.CZ.RANDOM_UPGRADE_ITEM_UI_CLOSE();
		Network.sendPacket(pkt);
	};


	/**
 	* Handles the selection of an item from the available materials list.
 	*/
	function onItemSelect()
	{

		var idx = parseInt(this.getAttribute('data-index'), 10);
		var item = Inventory.getUI().getItemByIndex(idx);


		if (!item) {
			return false;
		}

		var ui = LaphineUpg.ui;
		ui.find('.name').removeClass('selected');
		ui.find('.item[data-index="' + item.index + '"] .name').addClass('selected');
	};


	/**
 	* Submits a selected item and updates the UI accordingly.
 	*/
	function onSubmitItem()
	{

        // Check if there's a currently selected item in the .name class
		let selectedItem = LaphineUpg.ui.find('.item .name.selected');
		let idx;
		var ui = LaphineUpg.ui;

		if (selectedItem.length > 0) {
			idx = parseInt(selectedItem.closest('.item').data('index'), 10);
		} else {
			idx = parseInt(this.getAttribute('data-index'), 10);
		}

		let item = Inventory.getUI().getItemByIndex(idx);

		// Ensure the item is valid
		if (!item) {
			return false;
		}

		// Check if any item is already submitted in LaphineUpg.submittedIndex
		if (LaphineUpg.submittedIndex !== 0) {
			return false; // An item is already submitted
		}

		// Check if any item already exists in the .submitted_mat_list .item elements
		if (ui.find('.submitted_mat_list .item').length > 0) {
			return false; // An item already exists in the submitted list
		}

		// Get the target item from LaphineUpgUIState.targetItems
		let targetItem = LaphineUpgUIState.targetItems.find(si => si.id === item.ITID);
		if (!targetItem) {
			return; // Target item not found
		}

		onUpdateSubmitList(item);
	};




	/**
	 * Updates the submit list with the given item.
	 */
	function onUpdateSubmitList(item)
	{
		let it   = DB.getItemInfo( item.ITID );
        let submittedMatList = LaphineUpg.ui.find('.submitted_mat_list');

		let newItem = jQuery('<div class="item" data-index="' + item.index + '" draggable="true">' +
			'<div class="icon"></div>' +
			'</div>'
		);

		newItem.dblclick(onItemRemove); // Add double-click event listener to remove item
		submittedMatList.append(newItem);

		Client.loadFile(DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function (data) {
			submittedMatList.find('.item[data-index="' + item.index + '"] .icon').css('backgroundImage', 'url(' + data + ')');
		});

		// Add the item index
		LaphineUpg.submittedIndex = item.index;

		var ui = LaphineUpg.ui;
		ui.find('.submit_button_enabled').show();
		ui.find('.submit_button_disabled').hide();
		ui.find('.make_disabled').hide();
		ui.find('.make_enabled').show();


		// Check submitted Item
		onCheckSubmittedItem(item);

		// Update the available materials list
		updateAvailableMatList(item.ITID, item.index, true);
	};


	/**
	 * Checks if the submitted item has any occupied slots and shows a message if it does.
	 */
	function onCheckSubmittedItem(item)
	{
		if (LaphineUpgUIState.notsocketenchantitem) {
			let occupiedSlots = Object.values(item.slot).filter(slot => slot !== 0).length;
			if (occupiedSlots) {
				showMessage(DB.getMessage(3646));
			}
		}
	};


	/**
 	* Handles the removal of a submitted item and updates the UI accordingly.
 	*/
	function onItemRemove() {
	    let idx = parseInt(this.getAttribute('data-index'), 10);
	    let item = Inventory.getUI().getItemByIndex(idx);

	    if (item) {
			onRemoveItemSubmitList(item, this); // Pass the DOM element to the next function
		}
	};


	/**
	 * Removes an item from the submitted items list and updates the UI accordingly.
	 * @param {Object} item - The item to be removed.
	 * @param {HTMLElement|null} [element=null] - The DOM element corresponding to the item. If not provided, it will be found.
	 */
	function onRemoveItemSubmitList(item, element = null)
	{
		let itemIndex = LaphineUpg.submittedIndex;
		if (itemIndex !== -1) {
			// Remove the item from the submitted items list
			LaphineUpg.submittedIndex = 0;

			// If element is not provided, find the corresponding DOM element
			if (!element) {
				element = LaphineUpg.ui.find(`.item[data-index="${item.index}"]`);
			}

	    	// Remove the item from the DOM
	    	jQuery(element).remove();

			var ui = LaphineUpg.ui;
	    	ui.find('.submit_button_enabled').show();
	    	ui.find('.submit_button_disabled').hide();
			ui.find('.make_disabled').show();
			ui.find('.make_enabled').hide();

			// Update the available materials list
			updateAvailableMatList(item.ITID, item.index, false);
	    }
	};


	/**
 	* Handles the changes in UI when submitting and removing item from submitted list.
 	*/
	function updateAvailableMatList(itemId, itemIndex, remove) {
		let availableMatList = LaphineUpg.ui.find('.available_mat_list');
		let itemExists = false;

		availableMatList.find('.item').each(function() {
			let idx = parseInt(jQuery(this).attr('data-index'), 10);
			let item = Inventory.getUI().getItemByIndex(idx);

			if (item.ITID === itemId && idx === itemIndex) {
				itemExists = true;
				if (remove) {
					jQuery(this).remove();
				}
			}
		});

		// If item doesn't exist and should be increased, add it back
		if (!remove && !itemExists) {
			let item = Inventory.getUI().getItemByIndex(itemIndex);
			if (item) {
            	let targetItem = LaphineUpgUIState.targetItems.find(targetItem => targetItem.id === itemId);
            	if (targetItem) {
					// We get icon name from item table instead because some targetItem.name are not identifiedResourceName
					let it = DB.getItemInfo(targetItem.id);

					if (!it) {
						return;	// Skip
					}

					let icon_name = it.identifiedResourceName;
					onAddMaterialItem(item, icon_name);
				}
			}
		}
	};


	/**
 	* Handles showing of message for notifications.
 	*/
	function showMessage(message)
	{
		var ui = LaphineUpg.ui;
		ui.find('.info_msg').empty().text(message);
		ui.find('.some_notifs').show();
	};


	/**
 	* Handles the synthesis request by preparing and sending the packet.
 	*/
	function onRequestLaphineUpg()
	{

		let item = Inventory.getUI().getItemByIndex(LaphineUpg.submittedIndex);

		if (!item) {
			return false;
		}

		var pkt;
	    pkt = new PACKET.CZ.REQ_RANDOM_UPGRADE_ITEM();
	    pkt.itemId = LaphineUpgUIState.itemId;
		pkt.item_index = LaphineUpg.submittedIndex;
	    Network.sendPacket(pkt);

		var ui = LaphineUpg.ui;
		ui.find('.make_enabled').hide();
		ui.find('.make_disabled').show();
	};


	/**
	 * Show item name when mouse is over
	 */
	function onItemOver()
	{
		var idx  = parseInt( this.getAttribute('data-index'), 10);
		var item = Inventory.getUI().getItemByIndex(idx);

		if (!item) {
			return;
		}

		// Get back data
		var pos     = jQuery(this);
		var overlay = LaphineUpg.ui.find('.overlay');

		// Determine the immediate parent container explicitly based on the context
		var parentContainer = jQuery(this).closest('.available_mat_list, .submitted_mat_list');
		var itemPos = pos.position();
		var containerPos = parentContainer.position();

		// Calculate the desired position of the overlay relative to the container
		var top = itemPos.top - overlay.outerHeight() + 25;
		var left = itemPos.left;

		// Display box
		overlay.show();
		overlay.css({
			top: top + containerPos.top, // Adjust position relative to the container
			left: left + containerPos.left
		});
		overlay.text(DB.getItemName(item, {showItemGrade: false, showItemSlots:false}));

		if (item.IsIdentified) {
			overlay.removeClass('grey');
		}
		else {
			overlay.addClass('grey');
		}
	};


	/**
	 * Hide the item name
	 */
	function onItemOut()
	{
		var ui = LaphineUpg.ui;
		ui.find('.overlay').hide();
	};


	/**
	 * Stop event propagation
	 */
	function stopPropagation( event )
	{
		event.stopImmediatePropagation();
		return false;
	};


	/**
	 * Start dragging an item
	 */
	function onItemDragStart( event )
	{
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item  = Inventory.getUI().getItemByIndex(index);

		if (!item) {
			return;
		}

		// Set image to the drag drop element
		var img   = new Image();
		var url = this.querySelector('.icon').style.backgroundImage.match(/\((.*?)\)/)[1].replace(/('|")/g,'');
		img.decoding = 'async';
		img.src   = url.replace(/^\"/, '').replace(/\"$/, '');

		event.originalEvent.dataTransfer.setDragImage( img, 12, 12 );
		event.originalEvent.dataTransfer.setData('Text',
			JSON.stringify( window._OBJ_DRAG_ = {
				type: 'item',
				from: 'LaphineUpg',
				data:  item
			})
		);

		onItemOut();
	};


	/**
	 * Stop dragging an item
	 *
	 */
	function onItemDragEnd()
	{
		delete window._OBJ_DRAG_;
	};


	/**
	 * Drop an item from available_mat_list into submitted_mat_list
	 *
	 * @param {event}
	 */
	function onSubmitItemDrop( event )
	{
		var item, data;
		var ui = LaphineUpg.ui;
		event.stopImmediatePropagation();

		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
			item = data.data;
		}
		catch(e) {
			return false;
		}

		// Just allow item from storage
		if (data.type !== 'item') {
			return false;
		}

		// Check if there's a currently selected item in the .name class
		let selectedItem = LaphineUpg.ui.find('.item .name.selected');
		let idx;

		if (selectedItem.length > 0) {
			idx = parseInt(selectedItem.closest('.item').data('index'), 10);
		} else {
			idx = parseInt(this.getAttribute('data-index'), 10);
		}

		// Ensure the item is valid
		if (!item) {
			return false;
		}

		// Check if any item is already submitted in LaphineUpg.submittedIndex
		if (LaphineUpg.submittedIndex !== 0) {
			return false; // An item is already submitted
		}

		// Check if any item already exists in the .submitted_mat_list .item elements
		if (ui.find('.submitted_mat_list .item').length > 0) {
			return false; // An item already exists in the submitted list
		}

		// Get the target item from LaphineUpgUIState.targetItems
		let targetItem = LaphineUpgUIState.targetItems.find(si => si.id === item.ITID);
		if (!targetItem) {
			return; // Target item not found
		}

        if (item) {
			onUpdateSubmitList(item);
		}
	};


	/**
	 * Drop an item from submitted_mat_list into available_mat_list
	 *
	 * @param {event}
	 */
	function onRemoveSubmitDrop(event)
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
		if (data.type !== 'item') {
			return false;
		}

		if (!item) {
			return false;
		}

		// Locate the DOM element based on the item's index
		let element = LaphineUpg.ui.find(`.item[data-index="${item.index}"]`);

		if (item) {
			onRemoveItemSubmitList(item, element.get(0)); // Pass the DOM element to the function
		}
	};


	/**
	 * Get item info (open description window)
	 */
	function onItemInfo(event)
	{
		event.stopImmediatePropagation();

		var idx = parseInt(this.getAttribute('data-index'), 10);
		var item  = Inventory.getUI().getItemByIndex(idx);

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

		return false;
	};


	/**
	 * Packet Hooks to functions
	 */
	Network.hookPacket( PACKET.ZC.RANDOM_UPGRADE_ITEM_UI_OPEN,		onOpenLaphineUpgUI );
	Network.hookPacket( PACKET.ZC.ACK_RANDOM_UPGRADE_ITEM,			onLaphineUpgResult );


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(LaphineUpg);

});
