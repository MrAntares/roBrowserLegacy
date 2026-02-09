/**
 * UI/Components/Equipment/PlayerViewEquipV1/PlayerViewEquipV1.js
 *
 * Show a player equip when allowed
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';

	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var EquipLocation = require('DB/Items/EquipmentLocation');
	var jQuery = require('Utils/jquery');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var Camera = require('Renderer/Camera');
	var SpriteRenderer = require('Renderer/SpriteRenderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var ItemInfo = require('UI/Components/ItemInfo/ItemInfo');
	var htmlText = require('text!./PlayerViewEquipV1.html');
	var cssText = require('text!./PlayerViewEquipV1.css');
	var getModule = require;

	/**
	 * Create Component
	 */
	var PlayerViewEquipV1 = new UIComponent('PlayerViewEquipV1', htmlText, cssText);

	/**
	 * @var {Preference} window preferences
	 */
	var _preferences = Preferences.get(
		'PlayerViewEquipV1',
		{
			x: 480,
			y: 200
		},
		1.0
	);

	/**
	 * @var {Array} equipment list
	 */
	var _list = {};

	/**
	 * @var {CanvasRenderingContext2D} canvas context
	 */
	var _vieweqctx = [];

	/**
	 * @var {Value} tab
	 */
	var tabLinks = new Array();
	var contentDivs = new Array();
	var currentTabId = 'vieweqgeneral'; // Variable to store the current tab's ID

	/**
	 *  @var {Value} packets
	 */
	var charName;
	var jobID;
	var headID;
	var sexID;
	var bodypalID;
	var headpalID;

	/**
	 * Initialize UI
	 */
	PlayerViewEquipV1.init = function init()
	{
		_vieweqctx.push(this.ui.find('canvas')[0].getContext('2d'));
		_vieweqctx.push(this.ui.find('canvas')[1].getContext('2d'));

		// Grab the tab links and content divs from the page
		var tabListItems = document.getElementById('vieweqtabs').childNodes;
		for (var i = 0; i < tabListItems.length; i++)
		{
			if (tabListItems[i].nodeName == 'DIV')
			{
				var tabLink = getFirstChildWithTagName(tabListItems[i], 'A');
				var id = getHash(tabLink.getAttribute('href'));
				tabLinks[id] = tabLink;
				contentDivs[id] = document.getElementById(id);
			}
		}

		// Assign onclick events to the tab links, and
		// highlight the first tab
		var i = 0;

		for (var id in tabLinks)
		{
			tabLinks[id].onclick = showTab;
			tabLinks[id].onfocus = function ()
			{
				this.blur();
			};
			if (i == 0) {tabLinks[id].className = 'vieweqtab selected';}
			i++;
		}

		// Hide all content divs except the first
		var i = 0;

		for (var id in contentDivs)
		{
			if (contentDivs[id])
			{
				if (i != 0)
				{
					contentDivs[id].classList.add('vieweqcontent', 'hide');
				}
				i++;
			}
		}

		this.ui.addClass('PlayerViewEquipV1');
		this.ui.find('#lvlup_base').remove();
		// Don't activate drag drop when clicking on buttons
		this.ui.find('.titlebar .base').mousedown(stopPropagation);
		this.ui.find('.titlebar .mini').click(function ()
		{
			PlayerViewEquipV1.ui.find('.panel').toggle();
		});
		this.ui.find('.titlebar .close').click(function ()
		{
			PlayerViewEquipV1.remove();
		});

		// drag, drop items
		this.ui.on('dragleave', onDragLeave);

		// Bind items
		this.ui
			.find('.vieweqcontent')
			.on('contextmenu', '.item', onEquipmentInfo)
			.on('mouseover', 'button', onEquipmentOver)
			.on('mouseout', 'button', onEquipmentOut);

		this.draggable(this.ui.find('.titlebar'));
	};

	/**
	 * Show the selected tab and hide others
	 */
	function showTab()
	{
		var selectedId = getHash(this.getAttribute('href'));

		// Highlight the selected tab, and dim all others.
		// Also show the selected content div, and hide all others.
		for (var id in contentDivs)
		{
			if (id == selectedId)
			{
				tabLinks[id].className = 'vieweqtab selected';
				contentDivs[id].className = 'vieweqcontent';
			}
			else
			{
				tabLinks[id].className = 'vieweqtab';
				contentDivs[id].classList.add('vieweqcontent', 'hide');
			}
		}

		// Update the current tab ID
		currentTabId = selectedId;

		// Stop the browser following the link
		return false;
	}

	/**
	 * Get the first child element with the specified tag name
	 *
	 * @param {HTMLElement} element The parent element
	 * @param {string} tagName The tag name to search for
	 * @returns {HTMLElement} The first child element with the specified tag name
	 */
	function getFirstChildWithTagName(element, tagName)
	{
		for (var i = 0; i < element.childNodes.length; i++)
		{
			if (element.childNodes[i].nodeName == tagName.toUpperCase())
			{
				return element.childNodes[i];
			}
		}
	}

	/**
	 * Get the hash part of a URL
	 *
	 * @param {string} url The URL
	 * @returns {string} The hash part of the URL
	 */
	function getHash(url)
	{
		var hashPos = url.lastIndexOf('#');
		return url.substring(hashPos + 1);
	}

	/**
	 * Append to body
	 */
	PlayerViewEquipV1.onAppend = function onAppend()
	{
		// Apply preferences
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		if (this.ui.find('canvas').is(':visible'))
		{
			Renderer.render(renderCharacter);
		}
	};

	/**
	 * Remove Inventory from window (and so clean up items)
	 */
	PlayerViewEquipV1.onRemove = function onRemove()
	{
		// Stop rendering
		Renderer.stop(renderCharacter);

		// Clean equipments
		_list = {};
		this.ui.find('.col1, .col3, .ammo').empty();

		// Save preferences
		_preferences.show = this.ui.is(':visible');
		_preferences.reduce = this.ui.find('.panel').css('display') === 'none';
		_preferences.y = parseInt(this.ui.css('top'), 10);
		_preferences.x = parseInt(this.ui.css('left'), 10);
		_preferences.save();
	};

	/**
	 * Add an equipment to the window
	 *
	 * @param {Item} item
	 */
	PlayerViewEquipV1.equip = function equip(item, location)
	{
		var it = DB.getItemInfo(item.ITID);

		if (arguments.length === 1)
		{
			if ('WearState' in item)
			{
				location = item.WearState;
			}
			else if ('location' in item)
			{
				location = item.location;
			}
		}

		item.equipped = location;
		_list[item.index] = item;

		function add3Dots(string, limit)
		{
			var dots = '...';
			if (string.length > limit)
			{
				string = string.substring(0, limit) + dots;
			}

			return string;
		}

		this.ui
			.find(getSelectorFromLocation(location))
			.html(
				'<div class="item" data-index="' +
					item.index +
					'">' +
					'<button></button>' +
					'<span class="itemName">' +
					add3Dots(jQuery.escape(DB.getItemName(item)), 19) +
					'</span>' +
					'</div>'
			);

		Client.loadFile(
			DB.INTERFACE_PATH + 'item/' + it.identifiedResourceName + '.bmp',
			function (data)
			{
				this.ui
					.find('.item[data-index="' + item.index + '"] button')
					.css('backgroundImage', 'url(' + data + ')');
			}.bind(this)
		);
	};

	/**
	 * Add an equipment to the window
	 *
	 * @param {Item} item The item to add
	 * @param {number} location The location where the item is equipped
	 */
	PlayerViewEquipV1.setEquipmentData = function setEquipmentData(equipmentData)
	{
		// Clear existing equipment
		_list = {};
		this.ui.find('.col1, .col3, .ammo').empty();

		// Populate with new equipment data
		equipmentData.forEach(function (item)
		{
			PlayerViewEquipV1.equip(item);
		});
	};

	/**
	 * Set the title bar with the character's name
	 *
	 * @param {string} characterName The character's name
	 */
	PlayerViewEquipV1.setTitleBar = function setTitleBar(characterName)
	{
		this.ui.find('.PlayerName').text(DB.getMessage(1361).replace('%s', characterName));
	};

	/**
	 * Stop an event to propagate
	 */
	function stopPropagation(event)
	{
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Set rendering variables from packets received
	 * @param {packets} pkt
	 */
	PlayerViewEquipV1.setChar2Render = function setChar2Render(pkt)
	{
		charName = pkt.characterName;
		jobID = pkt.job;
		headID = pkt.head;
		sexID = pkt.sex;
		bodypalID = pkt.bodypalette;
		headpalID = pkt.headpalette;
	};

	/**
	 * Rendering character
	 */
	var renderCharacter = (function renderCharacterClosure()
	{
		var _cleanColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
		var _savedColor = new Float32Array(4);
		var _animation = {
			tick: 0,
			frame: 0,
			repeat: true,
			play: true,
			next: false,
			delay: 0,
			save: false
		};

		return function renderCharacter()
		{
			var Entity = getModule('Renderer/Entity/Entity');
			var show_character = new Entity();
			show_character.set({
				GID: charName + '_EQUIP',
				objecttype: show_character.constructor.TYPE_PC,
				job: jobID,
				sex: sexID,
				name: '',
				hideShadow: true,
				head: headID,
				headpalette: headpalID,
				bodypalette: bodypalID
			});

			// General Tab only shows normal headgears
			if (currentTabId === 'vieweqgeneral')
			{
				show_character.accessory = PlayerViewEquipV1.checkEquipLoc(EquipLocation.HEAD_BOTTOM);
				show_character.accessory2 = PlayerViewEquipV1.checkEquipLoc(EquipLocation.HEAD_TOP);
				show_character.accessory3 = PlayerViewEquipV1.checkEquipLoc(EquipLocation.HEAD_MID);
				show_character.robe = PlayerViewEquipV1.checkEquipLoc(EquipLocation.GARMENT);
			}
			// Costume Tab only shows costume headgears
			else if (currentTabId === 'vieweqcostume')
			{
				show_character.accessory = PlayerViewEquipV1.checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
				show_character.accessory2 = PlayerViewEquipV1.checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
				show_character.accessory3 = PlayerViewEquipV1.checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
				show_character.robe = PlayerViewEquipV1.checkEquipLoc(EquipLocation.COSTUME_ROBE);
			}

			_savedColor.set(show_character.effectColor);
			show_character.effectColor.set(_cleanColor);

			// Set action
			Camera.direction = 0;
			show_character.direction = 0;
			show_character.headDir = 0;
			show_character.action = show_character.ACTION.IDLE;
			show_character.animation = _animation;

			// Rendering
			for (var i = 0; i < _vieweqctx.length; i++)
			{
				var ctx = _vieweqctx[i];
				SpriteRenderer.bind2DContext(ctx, 30, 130);
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				show_character.renderEntity(ctx);
			}
		};
	})();

	/**
	 * Find elements in html base on item location
	 *
	 * @param {number} location
	 * @returns {string} selector
	 */
	function getSelectorFromLocation(location)
	{
		var selector = [];

		if (location & EquipLocation.HEAD_TOP) {selector.push('.head_top');}
		if (location & EquipLocation.HEAD_MID) {selector.push('.head_mid');}
		if (location & EquipLocation.HEAD_BOTTOM) {selector.push('.head_bottom');}
		if (location & EquipLocation.ARMOR) {selector.push('.armor');}
		if (location & EquipLocation.WEAPON) {selector.push('.weapon');}
		if (location & EquipLocation.SHIELD) {selector.push('.shield');}
		if (location & EquipLocation.GARMENT) {selector.push('.garment');}
		if (location & EquipLocation.SHOES) {selector.push('.shoes');}
		if (location & EquipLocation.ACCESSORY1) {selector.push('.accessory1');}
		if (location & EquipLocation.ACCESSORY2) {selector.push('.accessory2');}
		if (location & EquipLocation.AMMO) {selector.push('.ammo');}

		// Costume Tab
		if (location & EquipLocation.COSTUME_HEAD_TOP) {selector.push('.costume_head_top');}
		if (location & EquipLocation.COSTUME_HEAD_MID) {selector.push('.costume_head_mid');}
		if (location & EquipLocation.COSTUME_HEAD_BOTTOM) {selector.push('.costume_head_bottom');}
		if (location & EquipLocation.SHADOW_ARMOR) {selector.push('.shadow_armor');}
		if (location & EquipLocation.SHADOW_WEAPON) {selector.push('.shadow_weapon');}
		if (location & EquipLocation.SHADOW_SHIELD) {selector.push('.shadow_shield');}
		if (location & EquipLocation.COSTUME_ROBE) {selector.push('.shadow_garment');}
		if (location & EquipLocation.SHADOW_SHOES) {selector.push('.shadow_shoes');}
		if (location & EquipLocation.SHADOW_R_ACCESSORY_SHADOW) {selector.push('.shadow_accessory1');}
		if (location & EquipLocation.SHADOW_L_ACCESSORY_SHADOW) {selector.push('.shadow_accessory2');}

		return selector.join(', ');
	}

	/**
	 * Drag out the window
	 */
	function onDragLeave(event)
	{
		PlayerViewEquipV1.ui.find('td').css('backgroundImage', 'none');
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Right click on an item
	 */
	function onEquipmentInfo(event)
	{
		var index = parseInt(this.getAttribute('data-index'), 10);
		var item = _list[index];

		if (item)
		{
			// Don't add the same UI twice, remove it
			if (ItemInfo.uid === item.ITID)
			{
				ItemInfo.remove();
			}

			// Add ui to window
			else
			{
				ItemInfo.append();
				ItemInfo.uid = item.ITID;
				ItemInfo.setItem(item);
			}
		}

		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * When mouse is over an equipment, display the item name
	 */
	function onEquipmentOver()
	{
		var idx = parseInt(this.parentNode.getAttribute('data-index'), 10);
		var item = _list[idx];

		if (!item)
		{
			return;
		}

		// Get back data
		var overlay = PlayerViewEquipV1.ui.find('.overlay');
		var pos = jQuery(this).position();

		// Possible jquery error
		if (!pos.top && !pos.left)
		{
			return;
		}

		// Display box
		overlay.show();
		overlay.css({ top: pos.top - 22, left: pos.left - 22 });
		overlay.text(DB.getItemName(item));
	}

	/**
	 * Remove the item name
	 */
	function onEquipmentOut()
	{
		PlayerViewEquipV1.ui.find('.overlay').hide();
	}

	/**
	 * Update the owner name for the equipment items
	 */
	PlayerViewEquipV1.onUpdateOwnerName = function ()
	{
		for (var index in _list)
		{
			var item = _list[index];
			if (item.slot && [0x00ff, 0x00fe, 0xff00].includes(item.slot.card1))
			{
				PlayerViewEquipV1.ui
					.find('.item[data-index="' + index + '"] .itemName')
					.text(jQuery.escape(DB.getItemName(item)));
			}
		}
	};

	/**
	 * Get the number of equipment items excluding AMMO location
	 *
	 * @returns {number} The number of equipment items
	 */
	PlayerViewEquipV1.getNumber = function ()
	{
		var num = 0;
		for (var key in _list)
		{
			if (_list[key].location && _list[key].location != EquipLocation.AMMO)
			{
				num++;
			}
		}
		return num;
	};

	/**
	 * Check if a specific location is equipped
	 *
	 * @param {number} location The location to check
	 * @returns {number} The sprite number of the item in the specified location, or 0 if not equipped
	 */
	PlayerViewEquipV1.checkEquipLoc = function checkEquipLoc(location)
	{
		for (var key in _list)
		{
			if (_list[key].equipped & location)
			{
				return _list[key].wItemSpriteNumber;
			}
		}

		return 0;
	};

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PlayerViewEquipV1);
});
