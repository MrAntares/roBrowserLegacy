/**
 * UI/Components/Refine/Refine.js
 *
 * Refine Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                 = require('DB/DBManager');
	var Configs            = require('Core/Configs');
	var Network            = require('Network/NetworkManager');
	var PACKET             = require('Network/PacketStructure');
	var PACKETVER   	   = require('Network/PacketVerManager');
	var jQuery             = require('Utils/jquery');
	var Client             = require('Core/Client');
	var Session            = require('Engine/SessionStorage');
	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var Announce       	   = require('UI/Components/Announce/Announce');
	var ChatBox      	   = require('UI/Components/ChatBox/ChatBox');
	var Equipment		   = require('UI/Components/Equipment/Equipment');
	var Inventory		   = require('UI/Components/Inventory/Inventory');
	var ItemCompare        = require('UI/Components/ItemCompare/ItemCompare');
	var ItemInfo           = require('UI/Components/ItemInfo/ItemInfo');
	var htmlText           = require('text!./Refine.html');
	var cssText            = require('text!./Refine.css');
	var getModule          = require;

	/**
	 * Create Component
	 */
	var Refine = new UIComponent( 'Refine', htmlText, cssText );

	/**
	 * Blacksmtith's Blessing ItemID
	 */
	var BSB_ITID = 6635;

	/**
	 * Variables for current Refine Session
	 */
	var refiningMaterials = [];
	var blacksmithBlessing = 0;
	var refine_item_index = 0;
	var refine_item_mat = 0;
	var refine_fee = 0;
	var refine_bsb = 0;
	var refine_result = 0;
	var refine_result_div = '';
	var refine_can_cont = 0;
	var refine_no_mats = 0;
	var refine_no_zeny = 0;
	var refine_no_bsb = 0;
	var refine_item_broken = 0;
	var refine_new_mats = 0;
	var refine_ongoing = 0;
	var initialsuccess;
	var currentLoopHandle;
	Refine.imageLoopTimeout = 0;
	Refine.messageTimeOut = 0;
	Refine.hammer = 0;


	/**
	 * Mapping for messageID and ItemID for Refine Info
	 * @var {messageID} : @var {itemId}
	 */
	const itemMessageMapping = {
		2988: [1000336, 1000355, 1000368, 1000369, 1000370, 1000371],	// Equipment will dissapear when refine fails
		2989: [6225, 6226, 1000331, 1000333],	// Equipment's refine level will be decreased when refine fails
		2990: [6223, 6624]	// Equipment will dissapear or refine level will decrease when refine fails
	};


	/** 
	 * Variables for images to play in between phases
	 */
	const images = {
		waiting: ['bg_refining_wait_00.bmp', 'bg_refining_wait_01.bmp', 'bg_refining_wait_02.bmp', 'bg_refining_wait_03.bmp'],
		readya: ['bg_refininga_ready_00.bmp', 'bg_refininga_ready_01.bmp', 'bg_refininga_ready_02.bmp'],
		readyb: ['bg_refiningb_ready_00.bmp', 'bg_refiningb_ready_01.bmp', 'bg_refiningb_ready_02.bmp'],
		processa: ['bg_refininga_process_00.bmp', 'bg_refininga_process_01.bmp', 'bg_refininga_process_02.bmp', 'bg_refininga_process_03.bmp',
			'bg_refininga_process_04.bmp', 'bg_refininga_process_05.bmp', 'bg_refininga_process_06.bmp', 'bg_refininga_process_07.bmp', 'bg_refininga_process_08.bmp',
			'bg_refining_process_09.bmp', 'bg_refining_process_10.bmp', 'bg_refining_process_11.bmp', 'bg_refining_process_12.bmp', 'bg_refining_process_13.bmp'],
		processb: ['bg_refiningb_process_00.bmp', 'bg_refiningb_process_01.bmp', 'bg_refiningb_process_02.bmp', 'bg_refiningb_process_03.bmp',
			'bg_refiningb_process_04.bmp', 'bg_refiningb_process_05.bmp', 'bg_refiningb_process_06.bmp', 'bg_refiningb_process_07.bmp', 'bg_refiningb_process_08.bmp',
			'bg_refining_process_09.bmp', 'bg_refining_process_10.bmp', 'bg_refining_process_11.bmp', 'bg_refining_process_12.bmp', 'bg_refining_process_13.bmp'],
		success: ['bg_refining_success_00.bmp', 'bg_refining_success_01.bmp', 'bg_refining_success_02.bmp', 'bg_refining_success_03.bmp', 'bg_refining_success_04.bmp',
			'bg_refining_success_05.bmp', 'bg_refining_success_06.bmp', 'bg_refining_success_07.bmp', 'bg_refining_success_08.bmp'],
		fail: [ 'bg_refining_fail_00.bmp', 'bg_refining_fail_01.bmp', 'bg_refining_fail_02.bmp', 'bg_refining_fail_03.bmp', 'bg_refining_fail_04.bmp',
			'bg_refining_fail_05.bmp', 'bg_refining_fail_06.bmp', 'bg_refining_fail_07.bmp', 'bg_refining_fail_08.bmp', 'bg_refining_fail_09.bmp',
			'bg_refining_fail_10.bmp', 'bg_refining_fail_11.bmp', 'bg_refining_fail_12.bmp', 'bg_refining_fail_13.bmp', 'bg_refining_fail_14.bmp'],
		success_wait: ['bg_refining_success_09.bmp',
			'bg_refining_success_10.bmp', 'bg_refining_success_11.bmp', 'bg_refining_success_12.bmp', 'bg_refining_success_13.bmp', 'bg_refining_success_14.bmp',
			'bg_refining_success_15.bmp', 'bg_refining_success_16.bmp'],
		fail_wait: ['bg_refining_fail_15.bmp', 'bg_refining_fail_16.bmp', 'bg_refining_fail_17.bmp', 'bg_refining_fail_18.bmp', 'bg_refining_fail_19.bmp']
	};


	/**
	 * Initialize UI
	 */
	Refine.init = function init()
	{
		this.ui.css({ top: 200, left:300 });
		this.ui.find('.titlebar .base').mousedown(stopPropagation);
		this.ui.find('.titlebar .close').click(onRefineClose);
		this.ui.find('.footer .cancel').click(onRefineClose);

		this.draggable(this.ui.find('.titlebar'));
	
		// Update success div text
		var successdiv = this.ui.find('.success');
		var initialValue = 0;
		var successtext = DB.getMessage(3724);
		initialsuccess = successtext.replace('%d%', `<span class="number">${initialValue}</span>`);
		successdiv.html(initialsuccess);

		// Some Functions
		this.ui.find('.item_to_refine')
			.on('drop', onItemDrop).on('dragover', stopPropagation)
			.on('dragstart',   '.item', onItemDragStart)
			.on('dragend',     '.item', onItemDragEnd);
		this.ui.find('.materials').on('mouseover', '.item', onItemOver).on('mouseout', onItemOut);
		this.ui.find('.materials').on('contextmenu', '.item', onItemInfo);
		this.ui.find('.item_to_refine').on('contextmenu', '.item', onItemInfo);
		this.ui.find('.refine_cont').on('mouseover', onItemOver).on('mouseout', onItemOut);
		this.ui.find('.panel .item_to_refine').on('dblclick', '.item', function() { 
			if (refine_ongoing === 0) {
				onRemoveItem(true);
			}
		});
		this.ui.find('.refine_enabled').click(onRequestRefine);
		this.ui.find('.success_refine_cont_enabled').click(onRequestRefine);
		this.ui.find('.fail_refine_cont_enabled').click(onRequestRefine);
		this.ui.find('.back_button').click(onCancelContRefine);

		// Hide buttons
		this.ui.find('.refine_enabled').hide();
		this.ui.find('.some_notifs').hide();
		onHideContRefineButtons();
	};


	/**
	 * Append to body
	 */
	Refine.onAppend = function onAppend()
	{
		Refine.hammer = 0;
		Refine.ui.find('.refine_button').show();

		// Clear any existing timeout
		clearTimeout(Refine.imageLoopTimeout);

		// Start the image loop with the 'waiting' phase
		controlPhase('waiting', true, 250);
	};


	/**
	 * Remove Refine Window (and so clean up items)
	 */
	Refine.onRemove = function onRemove()
	{
		clearTimeout(Refine.imageLoopTimeout);
		clearTimeout(currentLoopHandle);
		onRemoveItem(true);
		onHideContRefineButtons();
		clearRefineStates();
	};


	/**
	 * Completely clean-up variables for refining
	 */
	function clearRefineStates()
	{
		Refine.hammer = 0;
		Refine.imageLoopTimeout = 0;
		Refine.messageTimeOut = 0;
		currentLoopHandle = null;
		refiningMaterials = [];
		blacksmithBlessing = 0;
		refine_item_index = 0;
		refine_item_mat = 0;
		refine_fee = 0;
		refine_bsb = 0;
		refine_result = 0;
		refine_result_div = '';
		refine_can_cont = 0;
		refine_no_mats = 0;
		refine_no_zeny = 0;
		refine_no_bsb = 0;
		refine_new_mats = 0;
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
	 * Handles packet received from server to open Refine UI
	 * PACKET.ZC.OPEN_REFINING_UI
	 */
	function onOpenRefineUI()
	{
		
		if (!Configs.get('enableRefineUI') || PACKETVER.value < 20161012) {
			console.warn("Renewal Refine is enabled in your server. Please enable refine UI in your configs.");
			return false; // Exit early if conditions are not met
		}

		Refine.append();
		
		var isInventoryOpen = Inventory.getUI().ui ? Inventory.getUI().ui.is(':visible') : false;
		
		if (!isInventoryOpen) {
			Inventory.getUI().toggle();
		}

		var RefineInfoPos = Refine.ui.offset();
		var RefineWidth = Refine.ui.outerWidth();
		var RefineHeight = Refine.ui.outerHeight() - Inventory.getUI().ui.outerHeight();

		Inventory.getUI().ui.css({
			position: 'absolute',
			top: RefineInfoPos.top ? RefineInfoPos.top + RefineHeight : 200,
			left: RefineInfoPos.left ?  RefineInfoPos.left + RefineWidth : 300
		});

		return false;
	};


	/**
	 * Handles sending request to server to close Refine UI
	 */
	function onRefineClose()
	{
		Refine.remove();

		var pkt = new PACKET.CZ.CLOSE_REFINING_UI();
		Network.sendPacket(pkt);

		return false;
	};


	/**
	 * Function to control phases and image looping
	 * @param {string} phase - The phase to control
	 * @param {boolean} shouldLoop - Whether the phase should loop
	 * @param {number} interval - Interval between image changes in milliseconds
	 * @param {function} callback - A callback function to execute after the phase completes
	 */
	function controlPhase(phase, shouldLoop, interval, callback)
	{
		let currentImageIndex = 0;
		let imageArray = images[phase];
	
		if (!imageArray) {
			console.error('Invalid phase:', phase);
			return;
		}
	
		function showImages() {
			Client.loadFile(DB.INTERFACE_PATH + 'refining_renewal/' + imageArray[currentImageIndex], function (data) {
				Refine.ui.find('.image-container').css('backgroundImage', 'url(' + data + ')');
				currentImageIndex++;
	
				if (currentImageIndex >= imageArray.length) {
					if (shouldLoop) {
						currentImageIndex = 0;
					} else {
                    	if (callback && typeof callback === 'function') {
                    	    callback();
                    	}
                    	return;
                	}
				}
	
				// Save the timeout ID to clear it later if needed
				Refine.imageLoopTimeout = setTimeout(showImages, interval);
			});
		}
	
		// Start showing the images
		showImages();
	};
	

	/**
	 * Drop an item from inventory to Refine UI
	 *
	 * @param {event}
	 */
	function onItemDrop( event )
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
		if (data.type !== 'item' || (data.from !== 'Inventory')) {
			return false;
		}

		if (item) {
			Refine.onRequestItemRefine(item);
		}

	};


	/**
	 * Handles sending the server packet request to refine an item
	 */
	Refine.onRequestItemRefine = function onRequestItemRefine (item)
	{
		var pkt;
		pkt = new PACKET.CZ.REFINING_SELECT_ITEM();
		pkt.index = item.index;
		Network.sendPacket(pkt);
	};


	/**
	 * Handles the packet received from the server
	 * @param {pkt} - PACKET.ZC.REFINING_MATERIAL_LIST
	 */
	function onRefineUIUpdateMaterials(pkt)
	{
		if (!Configs.get('enableRefineUI') || PACKETVER.value < 20161012) {
			console.warn("Renewal Refine is enabled in your server. Please enable refine UI in your configs.");
			return false; // Exit early if conditions are not met
		}

		if (pkt && pkt.MaterialInfo.length > 0) {
			// Check if there is already an item in refine UI
			var existingItem = Refine.ui.find('.item_to_refine .item');
			if (existingItem.length > 0) {
				// Remove existing item from refine UI
				onRemoveItem(false);
			}

			refine_item_index = pkt.itemIndex;
			var item = Inventory.getUI().getItemByIndex(pkt.itemIndex);

			refiningMaterials = pkt.MaterialInfo;
        	blacksmithBlessing = pkt.blacksmithBlessing;

			if (!Refine.hammer) {
				onPopulateMaterials();

				// Clear any existing timeout
				clearTimeout(Refine.imageLoopTimeout);
				var isbsbenabled = blacksmithBlessing ? 'a' : 'b';
				controlPhase('ready' + isbsbenabled, false, 250);

			}

			var it      = DB.getItemInfo( item.ITID );
			var content = Refine.ui.find('.item_to_refine');

			content.append('<div class="item" data-index="'+ item.index +'" draggable="true">' +
						'<div class="icon"></div>' +
						'<div class="grade"></div>' +
						'</div>'
			);

			Client.loadFile( DB.INTERFACE_PATH + 'item/' + ( item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName ) + '.bmp', function(data){
				content.find('.item[data-index="'+ item.index +'"] .icon').css('backgroundImage', 'url('+ data +')');
			});

			if (item.enchantgrade) {
				Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/grade_icon' + item.enchantgrade + '.bmp', function(data){
					content.find('.item[data-index="'+ item.index +'"] .grade').css('backgroundImage', 'url('+ data +')');
				});
			}

			var itemname = Refine.ui.find('.item_to_refine_name');
			itemname.text(DB.getItemName(item));

			// Select previously selected material if available
			if (Refine.hammer >= 1 && refine_item_mat) {
			    var materialFound = false; // Flag to track if the material was found
				var item, material;

			    for (var i = 0; i < refiningMaterials.length; i++) {
			        material = refiningMaterials[i];
			        if (material.itemId === refine_item_mat) {
			            item = Inventory.getUI().getItemById(material.itemId);
			            materialFound = true; // Material found
						refine_new_mats = 0;
			            break;
			        }
			    }

			    // Show message if material was not found (Usually happens when item is already +10)
			    if (!materialFound) {
					refine_new_mats = 1;
			        showMessage(3242, 3, 'error');
			    }

				// We update BSB value first
				if (refine_bsb) {
					if (blacksmithBlessing === 0) { // From with BSB to no more BSB
						refine_new_mats = 1;
						showMessage(3242, 3, 'error');
					}
					refine_bsb = blacksmithBlessing;
				}

				// Update UI
				selectMaterial(material, item);
			}


		} else {
			showMessage(2970, 3, 'error');
			return false;
		}
	};


	/**
	 * Handles populating materials needed for refining
	 * Controls for selecting and de-selecting materials
	 */
	function onPopulateMaterials()
	{
		// Clear any existing materials
        Refine.ui.find('.materials .mat_overlay .material').empty();
        Refine.ui.find('.bsb_overlay .bsb').empty();

		// Update materials
        for (var i = 0; i < refiningMaterials.length; i++) {
            (function(i) {
                var material = refiningMaterials[i];
                var it = DB.getItemInfo(material.itemId);
				var item = Inventory.getUI().getItemById(material.itemId);
                var materialDiv = Refine.ui.find('.material_' + i);

				// Clear previous items
				materialDiv.empty();

                materialDiv.append('<div class="item" data-index="'+ material.itemId +'" draggable="false">' +
                    '<div class="icon"></div>'+
					'<div class="mat_count"></div>'+
					'</div>'
                );

                Client.loadFile(DB.INTERFACE_PATH + 'item/' + (it.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) + '.bmp', function(data) {
                    materialDiv.find('.item[data-index="'+ material.itemId +'"] .icon').css('backgroundImage', 'url('+ data +')');
                });

				var count = item ? item.count : 0;
                var countmsg = materialDiv.find('.item[data-index="'+ material.itemId +'"] .mat_count');
                // Wrap the count in a span if it's 0
        		if (count === 0) {
        		    countmsg.html('<span style="color: #ce1029;">' + count + '</span>/1');
        		} else {
        		    countmsg.text(count + '/1');
        		}

				// Material Selection upon clicking
				materialDiv.find('.icon').click(function () {
					var itemId = material.itemId;
    				var item = Inventory.getUI().getItemById(itemId);
					var count = item ? item.count : 0;

					if (count === 0) {
						return false;
					}

					// Check if item ID exists in the mapping and show corresponding message
    				for (var messageID in itemMessageMapping) {
    				    if (itemMessageMapping[messageID].includes(itemId)) {
    				        showMessage(messageID, 0, 'info'); // Adjust timeout and type as needed
    				        break;
    				    }
    				}

					Refine.ui.find('.mat_overlay').removeClass('selected'); // Remove selected class from all overlays
					materialDiv.closest('.mat_overlay').addClass('selected'); // Add selected class to the parent overlay
				
					// Clone the material and append it to the selected_mat
					var clonedMaterial = materialDiv.find('.item').clone();
					clonedMaterial.find('.mat_count').remove(); // Remove mat_count from the clone

					Refine.ui.find('.selected_mat').empty().append(clonedMaterial);

					// Enable refine button
					Refine.ui.find('.refine_enabled').show();

					// Update success and refining_zeny
					Refine.ui.find('.success .number').text(material.chance);
					Refine.ui.find('.chance_rate').text(DB.getMessage(3285).replace('%d%', material.chance));
					Refine.ui.find('.refine_zeny').text(material.zeny);
					Refine.ui.find('.refine_zeny_cont').text(material.zeny);
				
					// Set the refine_item_mat value to the selected material itemId
					refine_item_mat = material.itemId;
					refine_fee = material.zeny

					Refine.ui.find('.refine_cont').addClass('item').attr('data-index', material.itemId);
				});
            })(i); // IIFE to capture the current value of i
        }

        // Update blacksmith blessing if applicable
        if (blacksmithBlessing) {
            var bsbDiv = Refine.ui.find('.bsb_overlay .bsb');
            var bsbItem = DB.getItemInfo(BSB_ITID);
            var item = Inventory.getUI().getItemById(BSB_ITID);
			bsbDiv.append('<div class="item" data-index="'+ BSB_ITID +'" draggable="false">' +
                '<div class="icon"></div>'+
				'<div class="mat_count"></div>'
            );

            Client.loadFile(DB.INTERFACE_PATH + 'item/' + (bsbItem.IsIdentified ? bsbItem.identifiedResourceName : bsbItem.unidentifiedResourceName) + '.bmp', function(data) {
                bsbDiv.find('.item[data-index="'+ BSB_ITID +'"] .icon').css('backgroundImage', 'url('+ data +')');
            });

            var bsbcount = item ? item.count : 0;
            var bsbcountmsg = bsbDiv.find('.item[data-index="'+ BSB_ITID +'"] .mat_count');
            // Wrap the count in a span if it's 0
        	if (bsbcount === 0) {
        	    bsbcountmsg.html('<span style="color: #ce1029;">' + bsbcount + '</span>/' + blacksmithBlessing);
        	} else {
        	    bsbcountmsg.text(bsbcount + '/' + blacksmithBlessing);
        	}

			// Add select functionality
			bsbDiv.find('.icon').click(function () {
				var item = Inventory.getUI().getItemById(BSB_ITID);
				var bsbcount = item ? item.count : 0;

				if (bsbcount >= blacksmithBlessing) {
					var bsbOverlay = bsbDiv.closest('.bsb_overlay');
		
					if (bsbOverlay.hasClass('selected')) {
						bsbOverlay.removeClass('selected');
						Refine.ui.find('.bsb_selected').empty();
						Refine.ui.find('.some_notifs').hide();
					} else {
						Refine.ui.find('.bsb_overlay').removeClass('selected'); // Remove selected class from all overlays
						bsbOverlay.addClass('selected'); // Add selected class to the parent overlay
		
						// Clone the blacksmith blessing and append it to the selected_mat
						var clonedBSB = bsbDiv.find('.item').clone();
						clonedBSB.find('.mat_count').remove(); // Remove mat_count from the clone
		
						Refine.ui.find('.bsb_selected').empty().append(clonedBSB);

						// BSB will be used
						refine_bsb = blacksmithBlessing;

						// Show Info
						showMessage(2967, 0, 'info');
					}
				} else {
					showMessage(2969, 3, 'error'); // Show error message with ID 2969 for 3 seconds
				}
			});
        }
	};


	/**
	 * Handles update of variables for UI changes based on Refine result
	 */
	function selectMaterial(material, item)
	{
		var count = item ? item.count || 0 : 0;

    	// Initial assumption that refining can continue
    	refine_can_cont = 1;

    	// Check for materials
    	if (count) {
    	    refine_no_mats = 0;
    	} else {
    	    refine_no_mats = 1;	// No more Mats
    	    refine_can_cont = 0;
    	}

    	// Check for BSB
    	if (refine_bsb) {
    	    var bsbinInventory = Inventory.getUI().getItemById(BSB_ITID);
    	    var bsbCount = bsbinInventory ? bsbinInventory.count || 0 : 0;

    	    if (!bsbinInventory || bsbCount < refine_bsb) {
    	        refine_no_bsb = 1;	// No more BSB
    	        refine_can_cont = 0;
    	    } else {
    	        refine_no_bsb = 0;
    	    }
    	}

		// Check for zeny
		refine_fee = material.zeny;
		if (Session.zeny < material.zeny) {
			refine_no_zeny = 1;
			refine_can_cont = 0;
		}

    	// Check for broken item
    	if (onCheckItemBroken()) {
    	    refine_can_cont = 0;
    	}

		Refine.ui.find('.chance_rate').text(DB.getMessage(3285).replace('%d%', material.chance));
		Refine.ui.find('.refine_zeny_cont').text(material.zeny);

		if (refine_can_cont && !refine_new_mats && !refine_item_broken) {
			refine_result_div = refine_result ? 'fail_refine_cont_enabled' : 'success_refine_cont_enabled';
		} else {
			refine_result_div = refine_result ? 'fail_refine_cont_disabled' : 'success_refine_cont_disabled';
			Refine.ui.find('.refine_cont').removeClass('item').removeAttr('data-index');
		}
	};


	/**
	 * Show item name when mouse is over
	 */
	function onItemOver()
	{
		var idx  = parseInt( this.getAttribute('data-index'), 10);
		var it = DB.getItemInfo(idx);

		if (!idx) {
			return false;
		}

		// Get the position relative to the .item element
		var pos = jQuery(this).offset();
		var overlay = Refine.ui.find('.overlay');
	
		// Determine the immediate parent container explicitly based on the context
		var parentContainer = jQuery(this).closest('.materials, .refine_cont');
		var containerOffset = parentContainer.offset();
	
		// Calculate the desired position of the overlay relative to the container
		var top, left;
		if (parentContainer.hasClass('materials')) {
			top = pos.top - containerOffset.top + 30;
			left = pos.left - containerOffset.left + jQuery(this).outerWidth() - 39 ;
		} else if (parentContainer.hasClass('refine_cont')) {
			top = pos.top - containerOffset.top + 242;
			left = pos.left - containerOffset.left + jQuery(this).outerWidth() + 41;
		}
	
		// Display box
		overlay.show();
		// Adjust the position of the overlay to be on top of the item within the container
		overlay.css({ top: top, left: left });
		overlay.text(it.identifiedDisplayName);

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
		Refine.ui.find('.overlay').hide();
	};


	/**
	 * Handles clearance of variables and UI components when changing Item
	 */
	function onRemoveItem( backtowait )
	{
    	// Clear refiningMaterials and blacksmithBlessing
    	refiningMaterials = [];
    	blacksmithBlessing = 0;

    	// Clear .item_to_refine and .item_to_refine_name
    	Refine.ui.find('.item_to_refine').empty();
    	Refine.ui.find('.item_to_refine_name').text('');

    	// Update .success .number.text to 0
    	Refine.ui.find('.success .number').text('0');
    	Refine.ui.find('.refine_zeny').empty();

    	// Clear selected materials
    	Refine.ui.find('.selected_mat').empty();
    	Refine.ui.find('.bsb_selected').empty();
    	Refine.ui.find('.materials .item').empty();
    	Refine.ui.find('.bsb .item').empty();
    	Refine.ui.find('.mat_overlay').removeClass('selected');
    	Refine.ui.find('.bsb_overlay').removeClass('selected');

		if (backtowait === true) {
			// Clear current animation first
			if (currentLoopHandle) {
				clearTimeout(currentLoopHandle);
				currentLoopHandle = null;
			}
			if (Refine.imageLoopTimeout) {
				clearTimeout(Refine.imageLoopTimeout);
				Refine.imageLoopTimeout = null;
			}

    		// Make the phase go back to waiting
    		controlPhase('waiting', true, 250);

			// UI changes
			Refine.ui.find('.some_notifs').hide();
			Refine.ui.find('.refine_button').show();
			Refine.ui.find('.success').empty().html(initialsuccess);

			onHideContRefineButtons();
			clearRefineStates();
		}
	};


	/**
	 * Handles clearing of material components after requesting to refine
	 */
	function clearMaterials()
	{
		Refine.ui.find('.success').empty().hide();
		Refine.ui.find('.refine_zeny').empty();

		Refine.ui.find('.materials .item').hide();
		Refine.ui.find('.bsb .item').hide();

		// Needs to reselect
		Refine.ui.find('.selected_mat').empty();
		Refine.ui.find('.bsb_selected').empty();

		Refine.ui.find('.mat_overlay').removeClass('selected');
		Refine.ui.find('.bsb_overlay').removeClass('selected');

		// Disable refine_button
		Refine.ui.find('.refine_button').hide();
	};


	/**
	 * Show a message in .info_msg
	 * @param {number} messageID - The message ID to retrieve from DB
	 * @param {number} timeout - The duration to show the message, in seconds (0 for infinite)
	 * @param {string} type - The type of message ('error' or 'info')
	 */
	function showMessage(messageID, timeout, type) {
	    var message = DB.getMessage(messageID);
		var messageClass;

		switch (type) {
		    case 'error':
				messageClass = 'red';
				break;
			case 'info':
				messageClass = 'blue';
				break;
			default:
				messageClass = 'red';
				break;
		}

		// Clear any existing timeout
		if (Refine.messageTimeOut) {
			clearTimeout(Refine.messageTimeOut);
		}

		// Ensure .info_msg has no class of .red and .blue
    	Refine.ui.find('.info_msg').removeClass('red blue');

	    Refine.ui.find('.info_msg').text(message).addClass(messageClass);
		Refine.ui.find('.some_notifs').show();

	    if (timeout > 0) {
	        Refine.messageTimeOut = setTimeout(function() {
	            Refine.ui.find('.info_msg').removeClass(messageClass);
	            Refine.ui.find('.some_notifs').hide();
	        }, timeout * 1000); // Convert seconds to milliseconds
	    }
	};


	/**
	 * Send the server request to refine the item
	 */
	function onRequestRefine()
	{
		var item = Inventory.getUI().getItemByIndex(refine_item_index);
		var material = Inventory.getUI().getItemById(refine_item_mat);

		if (!item) {
			return false;
		}

		if (!material) {
			return false;
		}

		if (Session.zeny < refine_fee) {
			showMessage(2968, 3, 'error');
			return false;
		}

		if (!Refine.hammer) {
			clearMaterials();
		}

		// Increase hammer
		Refine.hammer++;

		// Hide the previous refine button first
		Refine.ui.find('.refine_button').hide();
		
		// Hack: Hide it here for the surprise
		Refine.ui.find('.item_to_refine_name').hide();
		Refine.ui.find('.success').hide();

		refine_ongoing = 1;

		// Send request to server
		var pkt;
		pkt = new PACKET.CZ.REQ_REFINING();
		pkt.index = refine_item_index;
		pkt.itemId = refine_item_mat;
		pkt.blacksmithBlessing = refine_bsb;
		Network.sendPacket(pkt);

	};


	/**
	 * Handles the received refine result packet
	 * @param {pkt} - PACKET.ZC.ACK_ITEMREFINING
	 */
	Refine.onRefineResult = function onRefineResult(pkt) {
		if (pkt) {

			// Hide some UIs
			Refine.ui.find('.back_button').hide();
			Refine.ui.find('.refine_cont').hide();

			var item = Inventory.getUI().removeItem(pkt.itemIndex, 1);
			if (item) {
				item.RefiningLevel = pkt.RefiningLevel;
				Inventory.getUI().addItem(item);
			}

			// Stop the current ongoing loop before running the animation
			stopCurrentLoop();

			refine_result = pkt.result;

			switch (pkt.result) {
				case 0: // success
					refine_can_cont = 1;
					onAnimateResult('success', function() {
						onUpdateRefineUI('success');
						startLoopingPhase('success_wait');
					});
					break;
				case 1: // failure
				case 3: // bsb failure
					onShowFailure( pkt.result );
					break;
				case 2: // downgrade
					onShowFailure( pkt.result );
					break;
			}
		}
	};


	/**
	 * Handles animation for failure and pass to UI if downgrade or fail
	 */
	function onShowFailure(result)
	{
		var showResult = (result === 2) ? 'downgrade' : 'fail';
	
		onAnimateResult('fail', function() {
			onUpdateRefineUI(showResult);
			startLoopingPhase('fail_wait');
		});
	};


	/**
	 * Handles animation sequences depending on Refine result
	 */
	function onAnimateResult(result, callback) {
		function runSuccessSequence() {
			if (refine_bsb) {
				controlPhase('processa', false, 50, function() {
					controlPhase('success', false, 50, callback);
				});
			} else {
				controlPhase('processb', false, 50, function() {
					controlPhase('success', false, 50, callback);
				});
			}
		}
	
		function runFailSequence() {
			if (refine_bsb) {
				controlPhase('processa', false, 50, function() {
					controlPhase('fail', false, 50, callback);
				});
			} else {
				controlPhase('processb', false, 50, function() {
					controlPhase('fail', false, 50, callback);
				});
			}
		}
	
		switch (result) {
			case 'success':
				runSuccessSequence();
				break;
			case 'fail':
				runFailSequence();
				break;
			default:
				if (callback) callback();
				break;
		}
	};


	/**
	 * Store and start phase animation
	 */
	function startLoopingPhase(phase) {
		currentLoopHandle = controlPhase(phase, true, 75);
	};


	/**
	 * Function to stop current stored on-going phase animation
	 */
	function stopCurrentLoop() {
		if (currentLoopHandle) {
			clearTimeout(currentLoopHandle);
			currentLoopHandle = null;
		}
		if (Refine.imageLoopTimeout) {
			clearTimeout(Refine.imageLoopTimeout);
			Refine.imageLoopTimeout = null;
		}
	};


	/**
	 * Handles how the UI changes depending on Refine result
	 */
	function onUpdateRefineUI(result)
	{
		// Hide all continous buttons first to just show the needed one for result
		onHideContRefineButtons();

		switch (result) {
			case 'success':
				Refine.ui.find('.back_success').show();
				Refine.ui.find('.success').text(DB.getMessage(2971)).show();
				ChatBox.addText(DB.getMessage(498),	// Upgrade success!!
					ChatBox.TYPE.BLUE,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 'fail':
				onCheckItemBroken();
				Refine.ui.find('.back_fail').show();
				Refine.ui.find('.success').text(DB.getMessage(2972)).show();
				ChatBox.addText(DB.getMessage(499),	// Upgrade failed!!
					ChatBox.TYPE.BLUE,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 'downgrade':
				onCheckItemBroken();
				Refine.ui.find('.back_fail').show();
				Refine.ui.find('.success').text(DB.getMessage(2972)).show();
				ChatBox.addText(DB.getMessage(1537), // Is now refining the value lowered
					ChatBox.TYPE.BLUE,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			default:
				break;
		}

		Refine.ui.find('.refine_text_cont').show();
		
		if (refine_result_div) {
            Refine.ui.find('.' + refine_result_div).show();
        }

		if (refine_can_cont && !refine_new_mats && !refine_item_broken) {
			Refine.ui.find('.chance_rate').show();
			Refine.ui.find('.refine_zeny_cont').show();
		}

		if (refine_no_mats) {
			showMessage(3243, 3, 'error');
		}
		if (refine_no_zeny) {
			showMessage(3244, 3, 'error');
		}
		if (refine_no_bsb) {
			showMessage(3245, 3, 'error');
		}

		// Show again the hidden UIs that has been updated
		Refine.ui.find('.back_button').show();
		Refine.ui.find('.refine_cont').show();

		// Hack: Show it here for the surprise
		Refine.ui.find('.item_to_refine_name').show();

		refine_ongoing = 0;
	};


	/**
	 * Handles hiding all buttons used in Continous Refine
	 */
	function onHideContRefineButtons()
	{
		Refine.ui.find('.back_button').hide();
		Refine.ui.find('.refine_cont').hide();
		Refine.ui.find('.back_success').hide();
		Refine.ui.find('.back_fail').hide();
		Refine.ui.find('.success_refine_cont_enabled').hide();
		Refine.ui.find('.success_refine_cont_disabled').hide();
		Refine.ui.find('.fail_refine_cont_enabled').hide();
		Refine.ui.find('.fail_refine_cont_disabled').hide();
		Refine.ui.find('.refine_text_cont').hide();
		Refine.ui.find('.chance_rate').hide();
		Refine.ui.find('.refine_zeny_cont').hide();
	};


	/**
	 * Check if the item being refined is broken
	 */
	function onCheckItemBroken()
	{
    	var refineditem = Inventory.getUI().getItemByIndex(refine_item_index);
    	if (!refineditem) {
    	    refine_result_div = 'fail_refine_cont_disabled';
    	    Refine.ui.find('.item_to_refine_name').text(DB.getMessage(3246));
    	    refine_item_broken = 1;
			return true;
    	} else {
			refine_item_broken = 0;
    	    return false;
    	}
	};


	/**
	 * Handles event when Back button was pressed during Continous Refine
	 */
	function onCancelContRefine()
	{
		Refine.hammer = 0;
		onHideContRefineButtons();
		stopCurrentLoop();

		if (!refine_item_broken) {
			onPopulateMaterials();
			var isbsbenabled = blacksmithBlessing ? 'a' : 'b';
			controlPhase('ready' + isbsbenabled, false, 250);
		} else {
			onRemoveItem(true);
		}

		Refine.ui.find('.refine_button').show();
		Refine.ui.find('.success').empty().html(initialsuccess);
	};


	/**
	 * Get item info (open description window)
	 */
	function onItemInfo(event)
	{
		event.stopImmediatePropagation();

		var ITID = parseInt(this.getAttribute('data-index'), 10);
		// Materials have item.ID as data-index, Item to be refine has item.index as data-index
		var item  = Inventory.getUI().getItemById(ITID) ? Inventory.getUI().getItemById(ITID) : Inventory.getUI().getItemByIndex(ITID);

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
	 * Check if Refine UI is open
	 */
	Refine.isRefineOpen = function isRefineOpen()
	{
		return Refine.ui.is(':visible');
	};


	/**
	 * Start dragging an item
	 */
	function onItemDragStart(event) {
        event.originalEvent.dataTransfer.setData('text', event.target.id);
    };


	/**
	 * End of dragging an item
	 */
    function onItemDragEnd(event) {
	    if (refine_ongoing) {
			return;
		}

    	var rect = Refine.ui[0].getBoundingClientRect();
    	var mouseX = event.clientX || event.originalEvent.clientX;
    	var mouseY = event.clientY || event.originalEvent.clientY;

    	if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) {
    	    onRemoveItem(true);
    	}
	};


	/**
	 * Refine announcement received
	 * @param {object} pkt - PACKET.ZC.BROADCAST_ITEMREFINING_RESULT
	 */
	function onBroadcastRefineResult(pkt)
	{
		if (pkt) {
			let item = DB.getItemInfo(pkt.itemId);
			let itemName = item.identifiedDisplayName;
			let messageID;
			switch (pkt.status) {
				case 0:
					messageID = 3272;
					break;
				case 1:
					messageID = 3271;
					break;
				default:
					break;
			}

			let message = (DB.getMessage(messageID)).replace('%s', pkt.charName).replace('%d', pkt.refineLevel).replace('%s', itemName);
			ChatBox.addText( message, ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_CHAT, '#FFB563' );
			Announce.append();
			Announce.set( message, '#FFB563' );
		}
	};


	/**
	 * Packet Hooks to functions
	 */
	Network.hookPacket( PACKET.ZC.OPEN_REFINING_UI,						onOpenRefineUI );
	Network.hookPacket( PACKET.ZC.REFINING_MATERIAL_LIST,				onRefineUIUpdateMaterials );
	Network.hookPacket( PACKET.ZC.BROADCAST_ITEMREFINING_RESULT,		onBroadcastRefineResult );


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(Refine);

});
