/**
 * UI/Components/EnchantGrade/EnchantGrade.js
 *
 * EnchantGrade Window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var EffectConst = require('DB/Effects/EffectConst');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var EffectManager = require('Renderer/EffectManager');
	var Client = require('Core/Client');
	var Session = require('Engine/SessionStorage');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Announce = require('UI/Components/Announce/Announce');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var Equipment = require('UI/Components/Equipment/Equipment');
	var Inventory = require('UI/Components/Inventory/Inventory');
	var ItemCompare = require('UI/Components/ItemCompare/ItemCompare');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var htmlText = require('text!./EnchantGrade.html');
	var cssText = require('text!./EnchantGrade.css');

	/**
	 * Create Component
	 */
	var EnchantGrade = new UIComponent('EnchantGrade', htmlText, cssText);

	/**
	 * Variables for current EnchantGrade Session
	 */
	let gradingMaterials = [];
	let EnchantGrade_item_index = 0;
	let EnchantGrade_item_mat = 0;
	let EnchantGrade_result = 0;
	let EnchantGrade_can_cont = true;
	let EnchantGrade_blessing_used = false;
	let EnchantGrade_currentBlessing = 0;
	let EnchantGrade_current_success = 0;
	let materialNormal, materialOver, materialPick, startNormal, startDisable;
	EnchantGrade.imageLoopTimeout = {};

	/**
	 * Mapping for Grade Level
	 * @var {Grade} : @var {Grade String}
	 */
	const GradeMapping = {
		1: 'D',
		2: 'C',
		3: 'B',
		4: 'A'
	};

	/**
	 * Mapping for notification messages based on scenarios
	 * @var {scenario} : @var {array of message objects}
	 * message object: { id: messageID, color: hexColor }
	 */
	const scenarioMsgMapping = {
		initial: [
			{ id: 3870, color: '#de0808' },
			{ id: 3871, color: '#00ef5a' },
			{ id: 3872, color: '#00ef5a' }
		],
		waiting: [{ id: 3707, color: '#de0808' }],
		cannot_proceed: [{ id: 3821, color: '#de0808' }],
		insufficient: [{ id: 3708, color: '#de0808' }],
		destroyable: [{ id: 3712, color: '#de0808' }],
		non_destroyable: [{ id: 3822, color: '#00ef5a' }]
	};

	/**
	 * Variables for images to play in between phases
	 */
	const images = {
		idle: ['bg_gradeitem1.bmp', 'bg_gradeitem2.bmp', 'bg_gradeitem3.bmp', 'bg_gradeitem4.bmp', 'bg_gradeitem5.bmp'],
		process: ['gradewheel1.bmp', 'gradewheel2.bmp', 'gradewheel3.bmp']
	};

	/**
	 * Initialize UI
	 */
	EnchantGrade.init = function init() {
		this.ui.css({ top: 200, left: 300 });
		//this.ui.find('.titlebar').mousedown(stopPropagation);
		this.ui.find('.titlebar .close_btn').click(onEnchantGradeClose);
		this.ui.find('.footer .big_close_btn').click(onEnchantGradeClose);

		this.draggable(this.ui.find('.titlebar'));

		// Some Functions
		this.ui.find('.enchant_drop_proxy').on('drop', onItemDrop).on('dragover', stopPropagation);
		this.ui
			.find('.enchant_container')
			.on('dragstart', '.item', onItemDragStart)
			.on('dragend', '.item', onItemDragEnd);
		this.ui.find('.material_slot').on('contextmenu', '.item', onItemInfo);
		this.ui.find('.enchant_container').on('contextmenu', '.item', onItemInfo);
		this.ui.find('.BED_container').on('contextmenu', '.item', onItemInfo);
		this.ui.find('.enchant_container').on('dblclick', '.item', function () {
			onRemoveItem();
		});
	};

	/**
	 * Append to body
	 */
	EnchantGrade.onAppend = function onAppend() {
		EnchantGrade.hammer = 0;
		EnchantGrade.ui.find('.EnchantGrade_button').show();
		setMessages('initial');
		// Clear any existing timeout
		clearTimeout(EnchantGrade.imageLoopTimeout);
	};

	/**
	 * Remove EnchantGrade Window (and so clean up items)
	 */
	EnchantGrade.onRemove = function onRemove() {
		onRemoveItem();
		clearEnchantGradeStates();
	};

	/**
	 * Completely clean-up variables for grading
	 */
	function clearEnchantGradeStates() {
		gradingMaterials = [];
		EnchantGrade_item_index = 0;
		EnchantGrade_item_mat = 0;
		EnchantGrade_result = 0;
		EnchantGrade_can_cont = true;
		EnchantGrade_blessing_used = false;
		EnchantGrade_currentBlessing = 0;
		EnchantGrade_current_success = 0;
		EnchantGrade.imageLoopTimeout = {};
	}

	/**
	 * Stop event propagation
	 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Open EnchantGrade UI
	 *
	 */
	EnchantGrade.onOpenEnchantGradeUI = function onOpenEnchantGradeUI() {
		EnchantGrade.append();

		var isInventoryOpen = Inventory.getUI().ui ? Inventory.getUI().ui.is(':visible') : false;

		if (!isInventoryOpen) {
			Inventory.getUI().toggle();
		}

		var EnchantGradeInfoPos = EnchantGrade.ui.offset();
		var EnchantGradeWidth = EnchantGrade.ui.outerWidth();
		var EnchantGradeHeight = EnchantGrade.ui.outerHeight() - Inventory.getUI().ui.outerHeight();

		Inventory.getUI().ui.css({
			position: 'absolute',
			top: EnchantGradeInfoPos.top ? EnchantGradeInfoPos.top + EnchantGradeHeight : 200,
			left: EnchantGradeInfoPos.left ? EnchantGradeInfoPos.left + EnchantGradeWidth : 300
		});

		return false;
	};

	/**
	 * Handles sending request to server to close EnchantGrade UI
	 */
	function onEnchantGradeClose() {
		EnchantGrade.remove();

		var pkt = new PACKET.CZ.GRADE_ENCHANT_CLOSE_UI();
		Network.sendPacket(pkt);

		return false;
	}

	/**
	 * Function to control phases and image looping
	 * @param {string} phase - The phase to control
	 * @param {boolean} shouldLoop - Whether the phase should loop
	 * @param {number} interval - Interval between image changes in milliseconds
	 * @param {string} targetdiv - The target div to update images
	 * @param {function} callback - A callback function to execute after the phase completes
	 */
	function controlPhase(phase, shouldLoop, interval, targetdiv, callback) {
		// Stop existing loop for this phase only
		if (EnchantGrade.imageLoopTimeout[phase]) {
			clearTimeout(EnchantGrade.imageLoopTimeout[phase]);
			EnchantGrade.imageLoopTimeout[phase] = null;
		}

		let currentImageIndex = 0;
		let imageArray = images[phase];

		if (!imageArray) {
			console.error('Invalid phase:', phase);
			return;
		}

		function showImages() {
			Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/' + imageArray[currentImageIndex], function (data) {
				EnchantGrade.ui.find(targetdiv).css({
					backgroundImage: 'url(' + data + ')',
					visibility: 'visible'
				});
				currentImageIndex++;

				if (currentImageIndex >= imageArray.length) {
					if (shouldLoop) {
						currentImageIndex = 0;
					} else {
						EnchantGrade.imageLoopTimeout[phase] = null;
						if (callback && typeof callback === 'function') {
							callback();
						}
						return;
					}
				}

				// Save the timeout ID to clear it later if needed
				EnchantGrade.imageLoopTimeout[phase] = setTimeout(showImages, interval);
			});
		}

		// Start showing the images
		showImages();
	}

	/**
	 * Stops the image loop for a given phase
	 * @param {string} phase - The phase to stop the image loop for
	 */
	function stopPhase(phase) {
		if (EnchantGrade.imageLoopTimeout[phase]) {
			clearTimeout(EnchantGrade.imageLoopTimeout[phase]);
			EnchantGrade.imageLoopTimeout[phase] = null;
		}
	}

	/**
	 * Drop an item from inventory to EnchantGrade UI
	 *
	 * @param {event}
	 */
	function onItemDrop(event) {
		var item, data;
		event.stopImmediatePropagation();

		try {
			data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
			item = data.data;
		} catch (e) {
			return false;
		}

		// Just allow item from storage
		if (data.type !== 'item' || data.from !== 'Inventory') {
			return false;
		}

		if (item) {
			EnchantGrade.onRequestItemEnchantGrade(item);
		}
	}

	/**
	 * Handles sending the server packet request to EnchantGrade an item
	 */
	EnchantGrade.onRequestItemEnchantGrade = function onRequestItemEnchantGrade(item) {
		var pkt;
		pkt = new PACKET.CZ.GRADE_ENCHANT_SELECT_EQUIPMENT();
		pkt.index = item.index;
		Network.sendPacket(pkt);
	};

	/**
	 * Enables the item drop proxy to add dropped items in the EnchantGrade window
	 */
	function enableDropProxy() {
		EnchantGrade.ui.find('.enchant_drop_proxy').show();
		EnchantGrade.ui.find('.enchant_container').css('visibility', 'hidden');
	}

	/**
	 * Disable the item drop proxy to add dropped items in the EnchantGrade window
	 */
	function disableDropProxy() {
		EnchantGrade.ui.find('.enchant_drop_proxy').hide();
		EnchantGrade.ui.find('.enchant_container').css('visibility', 'visible');
	}

	/**
	 * Handles the packet received from the server
	 * @param {pkt} - PACKET.ZC.REFINING_MATERIAL_LIST
	 */
	function onEnchantGradeUIUpdateMaterials(pkt) {
		if (pkt && pkt.materialList.length > 0) {
			disableDropProxy();

			// Check if there is already an item in EnchantGrade UI
			var existingItem = EnchantGrade.ui.find('.enchant_container .item');
			if (existingItem.length > 0) {
				// Remove existing item from EnchantGrade UI
				onRemoveItem();
			}

			EnchantGrade_item_index = pkt.index;
			EnchantGrade_current_success = pkt.success_chance;
			var item = Inventory.getUI().getItemByIndex(pkt.index);

			gradingMaterials = pkt.materialList;

			// Update UI
			onPopulateMaterials();

			// Clear any existing timeout
			clearTimeout(EnchantGrade.imageLoopTimeout['idle']);
			controlPhase('idle', true, 225, '.grade_tank_container');

			var it = DB.getItemInfo(item.ITID);
			var content = EnchantGrade.ui.find('.enchant_container');

			// Notification Area
			EnchantGrade_can_cont = EnchantGrade_current_success > 0 ? true : false;
			setMessages(EnchantGrade_can_cont ? 'waiting' : 'cannot_proceed');

			// Item to EnchantGrade Area
			content.append(
				'<div class="item" data-index="' +
					item.index +
					'" draggable="true">' +
					'<div class="icon"></div>' +
					'<div class="grade"></div>' +
					'</div>'
			);

			Client.loadFile(
				DB.INTERFACE_PATH +
					'item/' +
					(item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
					'.bmp',
				function (data) {
					content
						.find('.item[data-index="' + item.index + '"] .icon')
						.css('backgroundImage', 'url(' + data + ')');
				}
			);

			if (item.enchantgrade) {
				Client.loadFile(
					DB.INTERFACE_PATH + 'grade_enchant/grade_icon' + item.enchantgrade + '.bmp',
					function (data) {
						content
							.find('.item[data-index="' + item.index + '"] .grade')
							.css('backgroundImage', 'url(' + data + ')');
					}
				);
			}

			// Update success chance
			var gradeChance = EnchantGrade.ui.find('.probability');
			gradeChance.text(EnchantGrade_current_success + '%');

			// Update zeny cost Area
			var zenyCost = EnchantGrade.ui.find('.zeny_cost_container');
			zenyCost.text('0');

			// Blessing Info
			const bless = pkt.blessing_info;
			if (!bless || !bless.id) return;

			const blessItem = DB.getItemInfo(bless.id);
			const invBless = Inventory.getUI().getItemById(bless.id);
			const invCount = invBless ? invBless.count : 0;

			EnchantGrade.ui.find('.BED_container').append(`
				<div class="item"
				     data-index="${bless.id}">
					<div class="icon"></div>
				</div>
				<div class="additional_mat_name" style="margin-right: 3px; margin-left: 7px;">${blessItem.identifiedDisplayName}</div>
				<div class="additonal_mat_amount">${EnchantGrade_currentBlessing} ea</div>
			`);

			Client.loadFile(
				DB.INTERFACE_PATH +
					'item/' +
					(blessItem.IsIdentified ? blessItem.identifiedResourceName : blessItem.unidentifiedResourceName) +
					'.bmp',
				data => EnchantGrade.ui.find('.BED_container .icon').css('backgroundImage', `url(${data})`)
			);

			// ADD / REMOVE BLESSING
			EnchantGrade.ui
				.find('.add_material_btn')
				.data('amount', bless.amount)
				.data('max', bless.max_blessing)
				.data('bonus', bless.bonus)
				.off('click')
				.on('click', function () {
					if (EnchantGrade_currentBlessing >= bless.max_blessing) return;
					if (invCount < (EnchantGrade_currentBlessing + 1) * bless.amount) return;

					EnchantGrade_blessing_used = true;
					EnchantGrade_currentBlessing++;

					updateBlessing();
				})
				.off('mouseenter mousemove mouseleave')
				.on('mouseenter mousemove', function (e) {
					showTooltip(DB.getMessage(3976).replace('%d', bless.amount), e, this);
				})
				.on('mouseleave', hideTooltip);

			EnchantGrade.ui
				.find('.remove_material_btn')
				.off('click')
				.on('click', function () {
					if (EnchantGrade_currentBlessing <= 0) {
						EnchantGrade_blessing_used = false;
						return;
					}

					EnchantGrade_currentBlessing--;

					updateBlessing();
				});

			/**
			 * Update the enchanting grade interface based on the current blessing amount.
			 */
			function updateBlessing() {
				const addedChance = EnchantGrade_currentBlessing * bless.bonus;
				const totalBlessing = EnchantGrade_currentBlessing * bless.amount;
				EnchantGrade.ui.find('.probability').text(EnchantGrade_current_success + addedChance + '%');

				EnchantGrade.ui.find('.BED_container .additonal_mat_amount').text(totalBlessing + ' ea');
			}

			/**
			 * Show a tooltip at the specified position with the given text
			 * @param {String} text - Text to be displayed in the tooltip
			 * @param {Event} e - Event object used to calculate the tooltip position
			 * @param {HTMLElement} targetEl - Element which the tooltip should be displayed next to
			 */
			function showTooltip(text, e, targetEl) {
				const tooltip = document.getElementById('enchant_tooltip');
				const root = document.getElementById('EnchantGrade');

				if (!tooltip || !targetEl || !root) return;

				tooltip.innerHTML = text;
				tooltip.style.display = 'block';

				const btnRect = targetEl.getBoundingClientRect();
				const rootRect = root.getBoundingClientRect();

				const x = e.clientX - rootRect.left;
				const y = btnRect.top - rootRect.top;

				tooltip.style.left = x - tooltip.offsetWidth / 2 + 'px';

				tooltip.style.top = y - tooltip.offsetHeight - 6 + 'px';
			}

			/**
			 * Hides the tooltip displayed next to the enchanting grade interface.
			 * This function is called when the user's mouse leaves the enchanting grade interface.
			 */
			function hideTooltip() {
				const tooltip = document.getElementById('enchant_tooltip');
				tooltip.style.display = 'none';
			}
		} else {
			return false;
		}
	}

	/**
	 * Handles populating materials needed for grading
	 * Controls for selecting and de-selecting materials
	 */
	function onPopulateMaterials() {
		// Clear any existing materials
		EnchantGrade.ui.find('.material_slot').empty();

		// Update materials
		for (var i = 0; i < gradingMaterials.length; i++) {
			(function (i) {
				var material = gradingMaterials[i];
				var it = DB.getItemInfo(material.itemId);
				var materialDiv = EnchantGrade.ui.find('.material_slot' + (i + 1));

				// Clear previous items
				materialDiv.empty();

				materialDiv
					.attr('data-index', i)
					.attr('data-itemid', material.itemId)
					.attr('data-amount', material.amount)
					.attr('data-price', material.price)
					.attr('data-downgrade', material.downgrade)
					.attr('data-breakable', material.breakable)
					.empty()
					.append(
						'<div class="item" data-index="' +
							material.itemId +
							'" "draggable="false">' +
							'<div class="icon"></div></div>' +
							'<div class="material_name">' +
							it.identifiedDisplayName +
							'</div>' +
							'<div class="material_amount">' +
							material.amount +
							' ea</div>'
					);

				Client.loadFile(
					DB.INTERFACE_PATH +
						'item/' +
						(it.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName) +
						'.bmp',
					function (data) {
						materialDiv
							.find('.item[data-index="' + material.itemId + '"] .icon')
							.css('backgroundImage', 'url(' + data + ')');
					}
				);
			})(i); // IIFE to capture the current value of i
		}

		let selectedMaterialBtn = null;

		Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/btn_material.bmp', d => (materialNormal = d));
		Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/btn_material_over.bmp', d => (materialOver = d));
		Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/btn_material_pick.bmp', d => (materialPick = d));
		Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/btn_start.bmp', d => (startNormal = d));
		Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/btn_start_disable.bmp', d => (startDisable = d));

		EnchantGrade.ui
			.find('.material_slot')
			.on('mouseenter', function () {
				// Do NOT reset if selected
				if (this === selectedMaterialBtn) return;
				this.style.backgroundImage = `url(${materialOver})`;
			})
			.on('mouseleave', function () {
				// Do NOT reset if selected
				if (this === selectedMaterialBtn) return;
				this.style.backgroundImage = `url(${materialNormal})`;
			})
			.on('click', function () {
				// Cannot select empty slot
				if (!this.dataset.index) return;

				// Blessing initialized
				if (EnchantGrade_blessing_used) {
					UIManager.showMessageBox(DB.getMessage(3831), 'ok');

					// Reset blessing usage
					onResetBlessing();
				}

				// Deselect previous
				if (selectedMaterialBtn && selectedMaterialBtn !== this) {
					selectedMaterialBtn.style.backgroundImage = `url(${materialNormal})`;
				}

				// Select new
				selectedMaterialBtn = this;
				this.style.backgroundImage = `url(${materialPick})`;

				// Read data from selected material
				EnchantGrade_item_mat = Number(this.dataset.index);
				let material_ITID = Number(this.dataset.itemid);
				let material_amount = Number(this.dataset.amount);
				let price = Number(this.dataset.price);
				//let downgrade = Number(this.dataset.downgrade); // UNUSED
				let breakable = Number(this.dataset.breakable);

				// Variable to track insufficiency
				let insufficent = false;

				// Update Zeny Cost
				let zenyCost = EnchantGrade.ui.find('.zeny_cost_container');
				zenyCost.text(price);

				// Check Selected Material Requirements
				// Material Count Check
				var item = Inventory.getUI().getItemById(material_ITID);
				var material_count = item ? item.count : 0;

				if (!item || material_count < material_amount) {
					// If no item or insufficient count
					insufficent = true;
				}

				// Zeny Check
				if (Session.zeny < price) {
					insufficent = true;
				}

				// Decide message scenarios
				const scenarios = [];
				scenarios.push(breakable === 1 ? 'destroyable' : 'non_destroyable');
				if (insufficent) {
					scenarios.push('insufficient');
				}

				// Update notification area
				if (EnchantGrade_can_cont) {
					setMessages(...scenarios);
				}

				// Update Start if with enough Materials and Zeny
				if (insufficent === false) {
					let startButton = EnchantGrade.ui.find('.start_grade');
					startButton.off('click');
					if (EnchantGrade_can_cont === true) {
						// Update start button
						startButton.css('backgroundImage', `url(${startNormal})`);
						startButton.on('click', function () {
							onRequestEnchantGrade();
						});
					} else {
						startButton.css('backgroundImage', `url(${startDisable})`);
					}
				}
			});
	}

	/**
	 * Reset the blessing usage flag and the current blessing count.
	 * Update the UI accordingly.
	 */
	function onResetBlessing() {
		EnchantGrade_blessing_used = false;
		EnchantGrade_currentBlessing = 0;

		EnchantGrade.ui.find('.probability').text(EnchantGrade_current_success + '%');

		EnchantGrade.ui.find('.BED_container .additonal_mat_amount').text(EnchantGrade_currentBlessing + ' ea');
	}

	/**
	 * Handles clearance of variables and UI components when changing Item
	 */
	function onRemoveItem() {
		// Clear gradingMaterials
		gradingMaterials = [];

		/* ---------- STOP ANIMATIONS ---------- */
		if (EnchantGrade.imageLoopTimeout) {
			Object.keys(EnchantGrade.imageLoopTimeout).forEach(stopPhase);
		}

		// Hide animation tank
		EnchantGrade.ui.find('.grade_tank_container').css('visibility', 'hidden');

		// Clear enchant_container
		EnchantGrade.ui.find('.enchant_container').empty();
		EnchantGrade.ui.find('.probability').empty();

		// Clear additional materials
		EnchantGrade.ui.find('.add_material_btn').off('click mouseenter mouseleave mousemove');
		EnchantGrade.ui.find('.BED_container').empty();
		EnchantGrade.ui.find('.enchant_tooltip').empty().css('display', 'none');

		// Clear zeny cost
		EnchantGrade.ui.find('.zeny_cost_container').empty();

		// Clear Notification Area
		EnchantGrade.ui.find('.notification_container').empty();
		setMessages('initial');

		// Clear any existing materials
		const slots = EnchantGrade.ui.find('.material_slot');

		slots
			.removeAttr('data-index data-itemid data-amount data-price data-downgrade data-breakable')
			.empty()
			.removeClass('selected')
			.off('click mouseenter mouseleave')
			.each(function () {
				this.style.backgroundImage = `url(${materialNormal})`;
			});

		// Reset Start Button
		const startBtn = EnchantGrade.ui.find('.start_grade');
		startBtn.off('click').css('backgroundImage', `url(${startDisable})`);

		// Re-enable drop proxy
		enableDropProxy();
	}

	/**
	 * Send the server request to EnchantGrade the item
	 */
	function onRequestEnchantGrade() {
		UIManager.showPromptBox(DB.getMessage(3823), 'ok', 'cancel', function () {
			var pkt = new PACKET.CZ.GRADE_ENCHANT_REQ();
			pkt.index = EnchantGrade_item_index;
			pkt.material_index = EnchantGrade_item_mat;
			pkt.blessing_flag = EnchantGrade_blessing_used ? 1 : 0;
			pkt.blessing_amount = EnchantGrade_currentBlessing;
			pkt.protect_flag = 0; // used only for PACKETVER_RE_NUM >= 20200723 && PACKETVER_RE_NUM <= 20200819
			Network.sendPacket(pkt);
		});
	}

	/**
	 * Handles the received EnchantGrade result packet
	 * @param {pkt} - PACKET_ZC_GRADE_ENCHANT_ACK
	 * pkt.result:
	 * 0 = The grade has been successfully upgraded.
	 * 1= Refinement failed.
	 * 2= The refine level has decreased.
	 * 3= Equipment destroyed.
	 * 4= The equipment is protected.
	 */
	function onEnchantGradeResult(pkt) {
		if (pkt) {
			EnchantGrade_result = pkt.result;

			// Show Effects and Grade Wheel Animation
			// Grade Wheel Animation
			controlPhase('process', true, 200, '.grade-wheel');

			// Play INTRO
			playEffect(EffectConst.EF_NEW_INTRO, 2000, function () {
				// Stop Grade Wheel Animation when the intro ends
				stopPhase('process');

				switch (EnchantGrade_result) {
					case 0: // success
						playEffect(EffectConst.EF_NEW_SUCCESS, 2000, function () {
							// Whatever result, reset UI
							onRemoveItem();
						});
						break;
					case 1: // failure
						playEffect(EffectConst.EF_NEW_FAILURE, 2000, function () {
							// Whatever result, reset UI
							onRemoveItem();
						});
						break;
					default:
						break;
				}
			});

			// Update item in Inventory
			var item = Inventory.getUI().removeItem(pkt.index, 1);
			if (item) {
				// Update grade level
				item.enchantgrade = pkt.grade;

				// Upon success, reset refining level (default)
				item.RefiningLevel = pkt.result === 0 ? 0 : item.RefiningLevel;
				// Re-add item to inventory
				Inventory.getUI().addItem(item);
			}
		}
	}

	/**
	 * Set the messages to be displayed in the notification area.
	 * @param {...scenarioKeys} The keys of the messages to be displayed.
	 */
	function setMessages(...scenarioKeys) {
		const messages = [].concat(...scenarioKeys.map(key => scenarioMsgMapping[key] || []));
		const notificationArea = EnchantGrade.ui.find('.notification_container');

		//clear before adding new messages
		notificationArea.empty();

		messages.slice(0, 3).forEach(msg => {
			const line = document.createElement('div');
			Client.loadFile(DB.INTERFACE_PATH + 'grade_enchant/caution.bmp', function (data) {
				line.innerHTML = `<img src="${data}" style="margin-right: 2px;"><span style="color: ${msg.color};">${DB.getMessage(msg.id)}</span>`;
			});
			notificationArea.append(line);
		});
	}

	/**
	 * Get item info (open description window)
	 */
	function onItemInfo(event) {
		event.stopImmediatePropagation();

		var ITID = parseInt(this.getAttribute('data-index'), 10);
		// Materials have item.ID as data-index, Item to be EnchantGrade has item.index as data-index
		var item = Inventory.getUI().getItemById(ITID)
			? Inventory.getUI().getItemById(ITID)
			: Inventory.getUI().getItemByIndex(ITID);

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
	}

	/**
	 * Check if EnchantGrade UI is open
	 */
	EnchantGrade.isEnchantGradeOpen = function isEnchantGradeOpen() {
		if (EnchantGrade.ui && EnchantGrade.ui.is(':visible')) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Start dragging an item
	 */
	function onItemDragStart(event) {
		event.originalEvent.dataTransfer.setData('text', event.target.id);
	}

	/**
	 * End of dragging an item
	 */
	function onItemDragEnd(event) {
		var rect = EnchantGrade.ui[0].getBoundingClientRect();
		var mouseX = event.clientX || event.originalEvent.clientX;
		var mouseY = event.clientY || event.originalEvent.clientY;

		if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) {
			onRemoveItem();
		}
	}

	/**
	 * EnchantGrade announcement received
	 * @param {object} pkt - PACKET.ZC.GRADE_ENCHANT_BROADCAST_RESULT
	 */
	function onBroadcastEnchantGradeResult(pkt) {
		if (pkt) {
			let item = DB.getItemInfo(pkt.itemId);
			let itemName = item.identifiedDisplayName;
			let messageID;
			switch (pkt.status) {
				case 0: // Failure
					messageID = 3719;
					break;
				case 1: // Success
					messageID = 3718;
					break;
				default:
					break;
			}

			let message = DB.getMessage(messageID)
				.replace('%s', pkt.char_name)
				.replace('%s', GradeMapping[pkt.grade])
				.replace('%s', itemName);
			ChatBox.addText(message, ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_CHAT, '#FFB563');
			Announce.append();
			Announce.set(message, '#FFB563');
		}
	}

	/**
	 * Play an effect on the client
	 * @param {number} effectId - The id of the effect to play
	 * @param {number} duration - The duration of the effect in milliseconds
	 * @param {function} [onEnd] - A callback to execute when the effect ends
	 */
	function playEffect(effectId, duration, onEnd) {
		const EF_Init_Par = {
			effectId: effectId,
			ownerAID: Session.AID
		};

		EffectManager.spam(EF_Init_Par);

		if (onEnd) {
			setTimeout(onEnd, duration);
		}
	}

	/**
	 * Packet Hooks to functions
	 */
	Network.hookPacket(PACKET.ZC.GRADE_ENCHANT_MATERIAL_LIST, onEnchantGradeUIUpdateMaterials);
	Network.hookPacket(PACKET.ZC.GRADE_ENCHANT_ACK, onEnchantGradeResult);
	Network.hookPacket(PACKET.ZC.GRADE_ENCHANT_BROADCAST_RESULT, onBroadcastEnchantGradeResult);

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(EnchantGrade);
});
