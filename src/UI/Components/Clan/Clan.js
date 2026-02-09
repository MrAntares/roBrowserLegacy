/**
 * UI/Components/Clan/Clan.js
 *
 * Chararacter Clan
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author @vthibault, @Javierlog08, @scriptord3
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var KEYS = require('Controls/KeyEventHandler');
	var Session = require('Engine/SessionStorage');
	var Preferences = require('Core/Preferences');
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./Clan.html');
	var cssText = require('text!./Clan.css');

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
		'Clan',
		{
			x: 150,
			y: 150
		},
		1.0
	);

	/**
	 * Create Component
	 */
	var Clan = new UIComponent('Clan', htmlText, cssText);

	/**
	 * Initialize component
	 */
	Clan.init = function init() {
		this.ui.find('.titlebar .close').mousedown(stopPropagation).click(Clan.toggle.bind(this));
		this.draggable(this.ui.find('.titlebar'));

		this.ui.hide();
	};

	/**
	 * Removing Clan
	 */
	Clan.onRemove = function onRemove() {
		// save preferences
		_preferences.x = this.ui.position().left;
		_preferences.y = this.ui.position().top;
		_preferences.save();
	};

	/**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
	Clan.onShortCut = function onShurtCut(key) {
		switch (key.cmd) {
			case 'TOGGLE':
				this.toggle();
				break;
		}
	};

	/**
	 * Toggle Clan UI
	 */
	Clan.toggle = function onToggle() {
		if (!Session.hasClan) {
			return;
		}

		if (this.ui.is(':visible')) {
			this.hide();
		} else {
			this.show();
		}
	};

	/**
	 * Process keydown
	 *
	 * @param {object} event
	 */
	Clan.onKeyDown = function onKeyDown(event) {
		if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this.ui.is(':visible')) {
			this.toggle();
		}
	};

	/**
	 * Show Clan element
	 */
	Clan.show = function show() {
		this.focus();

		if (this.ui.is(':visible')) {
			return;
		}

		this.ui.show();
	};

	/**
	 * Hide Clan element
	 */
	Clan.hide = function hide() {
		this.ui.hide();
	};

	/**
	 * Update General Clan infos
	 *
	 * @param {object} data
	 */
	Clan.setData = function setData(clan) {
		var general = this.ui.find('.content.info');

		general.find('.name .value').text(clan.name);
		general.find('.level .value').text(clan.level);
		general.find('.master .value').text(clan.master);
		general.find('.members .online').text(clan.membersOnline);
		general.find('.members .maxMember').text(clan.membersTotal);
		general
			.find('.territory .value')
			.text(
				clan.territory.replace('.gat', '').charAt(0).toUpperCase() + clan.territory.replace('.gat', '').slice(1)
			);

		//Clan.onRequestClanEmblem(clan.GDID, clan.emblemVersion, Clan.setEmblem.bind(this));
	};

	/**
	 * Set members count
	 *
	 * @param {object} members
	 */
	Clan.setMembersCount = function setMembersCount(members) {
		var general = this.ui.find('.content.info');

		general.find('.members .online').text(members.membersOnline);
		general.find('.members .maxMember').text(members.membersTotal);
	};

	/**
	 * Set clan illust
	 *
	 * @param {Integer} id
	 */
	Clan.setIllust = function setIllust(id) {
		var self = this;
		Client.loadFile(
			DB.INTERFACE_PATH + 'clan_system/clan_illust' + id.toString().padStart(2, '0') + '.bmp',
			function (data) {
				self.ui
					.find('.content.info')
					.find('.clan_illust')
					.css('backgroundImage', 'url(' + data + ')');
			}
		);
	};

	/**
	 * Set Clan emblem
	 *
	 * @param {Integer} id
	 */
	Clan.setEmblem = function setEmblem(id) {
		var self = this;
		Client.loadFile(
			DB.INTERFACE_PATH + 'clan_system/clan_emblem' + id.toString().padStart(2, '0') + '.bmp',
			function (data) {
				self.ui
					.find('.content.info')
					.find('.emblem_container')
					.css('backgroundImage', 'url(' + data + ')');
			}
		);
	};

	/**
	 * Add Clan relation (ally / enemy)
	 *
	 * @param {Array} Clan list
	 */
	Clan.setRelations = function setRelations(type, clans) {
		var i, count;

		for (i = 0, count = clans.length; i < count; ++i) {
			this.addRelation(type, clans[i]);
		}
	};

	/**
	 * Add a relation
	 *
	 * @param {object} Clan
	 */
	Clan.addRelation = function addRelation(type, clan) {
		var list = this.ui.find('.' + (type === 0 ? 'ally' : 'hostile') + '_list');
		list.empty();
		var div = document.createElement('div');

		div.setAttribute('data-Clan-id', clan);
		div.textContent = clan;
		list.append(div);
	};

	Clan.leave = function leave() {
		Session.hasClan = false;
		this.ui.hide();
	};

	/**
	 * Stop propagation of events
	 */
	function stopPropagation(event) {
		event.stopImmediatePropagation();
		return false;
	}

	/**
	 * Create componentand export it
	 */
	return UIManager.addComponent(Clan);
});
