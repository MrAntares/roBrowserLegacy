/**
 * UI/Components/PetEvolution/PetEvolution.js
 *
 * Display Pet Evolution
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var Inventory = require('UI/Components/Inventory/Inventory');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var htmlText = require('text!./PetEvolution.html');
	var cssText = require('text!./PetEvolution.css');

	/**
	 * Create Component
	 */
	var PetEvolution = new UIComponent('PetEvolution', htmlText, cssText);

	/**
	 * Variables
	 */
	let currentMaterials = [];
	let targetEvoPetEggId = 0;

	/**
	 * @var {Preferences} Window preferences
	 */
	var _preferences = Preferences.get(
		'PetEvolution',
		{
			x: 200,
			y: 200,
			show: true
		},
		1.0
	);

	/**
	 * Initialize component
	 */
	PetEvolution.init = function init() {
		this.draggable(this.ui.find('.titlebar'));

		this.ui.find('.base').mousedown(stopPropagation);
		this.ui.find('.close').click(onClose);
		this.ui.find('.big_cancel').click(onClose);
		this.ui.find('.evolve').click(onRequestEvolve);
	};

	PetEvolution.onAppend = function onAppend() {};

	/**
	 * Once remove from body, save user preferences
	 */
	PetEvolution.onRemove = function onRemove() {
		// Save preferences
		_preferences.show = this.ui.is(':visible');
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.save();

		// Clear variables
		currentMaterials = [];
		targetEvoPetEggId = 0;
	};

	/**
	 * Update UI
	 *
	 * @param {object} pet evolution info
	 */
	PetEvolution.SetInfo = function SetInfo(baseJobID) {
		const baseData = DB.getPetByJobID(baseJobID);

		if (!baseData) {
			console.warn('Pet Base Data data not found');
			return;
		}

		const evoData = DB.getPetByEggID(Number(Object.keys(baseData.Evolution)[0]));
		if (!evoData) {
			console.warn('Evo Data data not found');
			return;
		}

		Client.loadFile('data/texture/userinterface/illust/' + baseData.PetIllust, function (url) {
			PetEvolution.ui.find('.base_pet_illust').css('backgroundImage', 'url(' + url + ')');
		});
		Client.loadFile('data/texture/userinterface/illust/' + evoData.PetIllust, function (url) {
			PetEvolution.ui.find('.target_pet_illust').css('backgroundImage', 'url(' + url + ')');
		});

		targetEvoPetEggId = evoData.PetEggID;

		PetEvolution.ui.find('.base_petEggId').text(baseData.PetString).attr('data-index', baseData.PetEggID);
		PetEvolution.ui.find('.target_petEggId').text(evoData.PetString).attr('data-index', evoData.PetEggID);

		// Add ItemInfo
		PetEvolution.ui.find('.base_petEggId').click(onItemInfo);
		PetEvolution.ui.find('.target_petEggId').click(onItemInfo);

		// === Evolution Requirements ===
		const reqBox = PetEvolution.ui.find('.evo_requirements');
		reqBox.empty();

		const targetEggID = Number(Object.keys(baseData.Evolution)[0]);
		const materials = baseData.Evolution[targetEggID];

		// Save materials for later checks
		currentMaterials = materials;

		// Title
		const title = document.createElement('div');
		title.className = 'evo_requirements_title';
		title.textContent = DB.getMessage(2569);
		reqBox.append(title);

		// Spacer / empty row
		const spacer = document.createElement('div');
		spacer.className = 'evo_requirement_spacer';
		spacer.style.height = '20px';
		reqBox.append(spacer);

		// Materials
		materials.forEach(mat => {
			const item = DB.getItemInfo(mat.MaterialID);
			const itemName = item ? item.identifiedDisplayName || item.Name : `Item ${mat.MaterialID}`;

			const row = document.createElement('div');
			row.className = 'evo_requirement_row';

			// Create clickable item name span
			const nameSpan = document.createElement('span');
			nameSpan.className = 'evo_item_name';
			nameSpan.textContent = itemName;
			nameSpan.setAttribute('data-index', mat.MaterialID);
			nameSpan.style.cursor = 'pointer';
			nameSpan.addEventListener('click', onItemInfo);

			// Create amount span
			const amountSpan = document.createElement('span');
			amountSpan.className = 'evo_item_amount';
			amountSpan.textContent = ` - ${mat.Amount} ea`;

			// Append spans to row
			row.appendChild(nameSpan);
			row.appendChild(amountSpan);

			reqBox.append(row);
		});

		// Spacer / empty row
		const spacer2 = document.createElement('div');
		spacer2.className = 'evo_requirement_spacer2';
		spacer2.style.height = '35px';
		reqBox.append(spacer2);

		// Title
		const title2 = document.createElement('div');
		title2.className = 'evo_requirements_title2';
		title2.textContent = DB.getMessage(2570);
		reqBox.append(title2);
	};

	/**
	 * Check if player has enough materials for evolution
	 *
	 * @return {boolean} True if player has enough materials, false otherwise
	 */
	PetEvolution.hasEnoughMaterials = function () {
		if (!currentMaterials) {
			return false;
		}

		for (const mat of currentMaterials) {
			const item = Inventory.getUI().getItemById(mat.MaterialID);
			const count = item ? item.count : 0;

			if (count < mat.Amount) {
				return false;
			}
		}

		return true;
	};

	/**
	 * Send a request to evolve the pet.
	 * If the player has enough materials, send a PACKET.CZ.PET_EVOLUTION packet.
	 * If the player does not have enough materials, display an error message.
	 */
	function onRequestEvolve() {
		if (PetEvolution.hasEnoughMaterials() === true) {
			var pkt = new PACKET.CZ.PET_EVOLUTION();
			pkt.evolutionPetEggITID = targetEvoPetEggId;
			Network.sendPacket(pkt);
		} else {
			ChatBox.addText(DB.getMessage(2574), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
		}
	}

	/**
	 * Closing window
	 */
	function onClose() {
		PetEvolution.ui.hide();

		// Clear variables
		currentMaterials = [];
		targetEvoPetEggId = 0;
	}

	/**
	 * Stop event propagation
	 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Get item info (open description window)
	 */
	function onItemInfo(event) {
		event.stopImmediatePropagation();

		var ITID = parseInt(this.getAttribute('data-index'), 10);
		var item = DB.getItemInfo(ITID);

		// Hack
		item.ITID = ITID;
		item.IsIdentified = 1;

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
	 * Handle the result of a pet evolution request
	 * @param {PACKET.ZC.PET_EVOLUTION} pkt
	 */
	function onPetEvolveResult(pkt) {
		if (pkt) {
			switch (pkt.result) {
				case 0: // Unknown Error
					ChatBox.addText(DB.getMessage(2571), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					break;
				case 1: // No pet can be summoned.
					ChatBox.addText(DB.getMessage(2572), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					break;
				case 2: // It is not requested petal
					ChatBox.addText(DB.getMessage(2573), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					break;
				case 3:
				case 4: // Lack of required materials for evolution
					ChatBox.addText(DB.getMessage(2575), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					break;
				case 5: // Pet can only be evolved when intimacy is Loyal
					ChatBox.addText(DB.getMessage(2576), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					break;
				case 6: // Success
					if (PetEvolution.ui) {
						PetEvolution.ui.hide();
					}
					break;
				default:
					break;
			}
		}
	}

	/**
	 * Packet Hooks to functions
	 */
	Network.hookPacket(PACKET.ZC.PET_EVOLUTION_RESULT, onPetEvolveResult);

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PetEvolution);
});
