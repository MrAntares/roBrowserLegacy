/**
 * UI/Components/PartyFriends/PartyHelper/PartyHelper.js
 *
 * Helper for the PartyFriends window child (to manage party creation, invitation and updating settings).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';

	/**
	 * Dependencies
	 */
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var jQuery = require('Utils/jquery');
	var PACKETVER = require('Network/PacketVerManager');
	var htmlText = require('text!./PartyHelper.html');
	var cssText = require('text!./PartyHelper.css');

	/**
	 * Create Component
	 */
	var PartyHelper = new UIComponent('PartyHelper', htmlText, cssText);

	/**
	 * Window type constants
	 */
	PartyHelper.Type = {
		CREATE: 0,
		SETUP: 1,
		INVITE: 2,
		FRIEND_SETUP: 3
	};

	/**
	 * Current window type
	 */
	var _type = PartyHelper.Type.CREATE;

	/**
	 * Initialize component event listeners
	 */
	PartyHelper.init = function init() {
		// Stop propagation to prevent drag/drop conflicts
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

		// Close window handlers
		this.ui.on('click', '.close', function () {
			PartyHelper.remove();
		});

		this.ui.on('click', '.cancel', function () {
			PartyHelper.remove();
		});

		// Validation handler
		this.ui.find('.ok').click(function () {
			onValidate();
		});

		// Enter key validation
		this.ui.on('keydown', '.name', function (event) {
			if (event.which === 13) {
				onValidate();
				return false;
			}
			return true;
		});

		// Setting-row toggle handler (WhisperBox preferences)
		this.ui.on('mousedown', '.setting-row', function (event) {
			var on = this.querySelector('.on');
			var off = this.querySelector('.off');

			if (!on || !off) {
				return;
			}

			// Toggle visual state
			on.classList.remove('on');
			on.classList.add('off');
			off.classList.remove('off');
			off.classList.add('on');

			// Save preferences immediately
			var WhisperBox = require('UI/Components/WhisperBox/WhisperBox');
			var prefs = WhisperBox.preferences;

			prefs.open1to1Stranger =
				parseInt(PartyHelper.ui.find('.open1to1Stranger .on').attr('data-value'), 10) === 1;
			prefs.open1to1Friend = parseInt(PartyHelper.ui.find('.open1to1Friend .on').attr('data-value'), 10) === 1;
			prefs.alarm1to1 = parseInt(PartyHelper.ui.find('.alarm1to1 .on').attr('data-value'), 10) === 1;
			prefs.save();

			event.stopImmediatePropagation();
			return false;
		});

		// Radio button toggle logic
		this.ui.on('mousedown', '.off', function (event) {
			if (PartyHelper.ui.find('.content').hasClass('disabled')) {
				return;
			}

			// Managed by setting-row handler
			if (this.parentNode.classList.contains('setting-row')) {
				return;
			}

			var off = this;
			var on = this.parentNode.getElementsByClassName('on')[0];
			var tmp;

			on.className = 'off';
			off.className = 'on';

			tmp = on.style.backgroundImage;
			on.style.backgroundImage = off.style.backgroundImage;
			off.style.backgroundImage = tmp;
		});

		// Block interaction on 'on' buttons
		this.ui.on('mousedown', '.on', function (event) {
			if (this.parentNode.classList.contains('setting-row')) {
				return;
			}
			event.stopImmediatePropagation();
			return false;
		});

		this.draggable(this.ui.find('.titlebar'));

		// Close on Esc key
		var self = this;
		this._onKeyDown = function (event) {
			if (event.which === 27) {
				// Escape
				self.remove();
				event.stopImmediatePropagation();
				return false;
			}
		};
	};

	/**
	 * Position UI relative to PartyFriends window
	 */
	PartyHelper.onAppend = function onAppend() {
		var base = UIManager.getComponent('PartyFriends').ui;

		this.ui.find('.party-content, .friend-content').hide();
		this.ui.find('.name').val('');

		this.ui.css({
			top: base.css('top'),
			left: parseInt(base.css('left'), 10) + base.width() + 10
		});

		window.addEventListener('keydown', this._onKeyDown, true);
	};

	/**
	 * Cleanup on window removal
	 */
	PartyHelper.onRemove = function onRemove() {
		this.ui.find('.party-content, .friend-content').hide();
		this.ui.find('.name').val('');
		window.removeEventListener('keydown', this._onKeyDown, true);
	};

	/**
	 * Set window display mode
	 * @param {number} type
	 */
	PartyHelper.setType = function setType(type) {
		this.ui.find('.content').removeClass('disabled');
		this.ui.find('.footer').show();

		// Restrict Friend Setup by packet version
		if (type === PartyHelper.Type.FRIEND_SETUP && PACKETVER.value < 20090617) {
			type = PartyHelper.Type.SETUP;
		}

		switch (type) {
			case PartyHelper.Type.CREATE:
				this.ui.css('width', '130px');
				this.ui.find('.friend-content').hide();
				this.ui.find('.party-content').show();
				this.ui.find('.setup, .invite').hide();
				this.ui.find('.create').show();
				this.ui.find('.titlebar .setup, .titlebar .invite, .titlebar .friend-setup').hide();
				this.ui.find('.titlebar .create').show();
				break;

			case PartyHelper.Type.INVITE:
				this.ui.css('width', '130px');
				this.ui.find('.friend-content').hide();
				this.ui.find('.party-content').show();
				this.ui.find('.setup, .create').hide();
				this.ui.find('.invite').show();
				this.ui.find('.titlebar .setup, .titlebar .create, .titlebar .friend-setup').hide();
				this.ui.find('.titlebar .invite').show();
				break;

			case PartyHelper.Type.SETUP:
				this.ui.css('width', '130px');
				this.ui.find('.friend-content').hide();
				this.ui.find('.party-content').show();
				this.ui.find('.create, .invite').hide();
				this.ui.find('.setup').show();
				this.ui.find('.titlebar .create, .titlebar .invite, .titlebar .friend-setup').hide();
				this.ui.find('.titlebar .setup').show();
				this.ui.find('.footer').css('height', '27px');
				this.ui.find('.footer .btn').show();
				break;

			case PartyHelper.Type.FRIEND_SETUP:
				this.ui.css('width', '230px');
				this.ui.find('.party-content').hide();
				this.ui.find('.friend-content').show();
				this.ui.find('.titlebar .create, .titlebar .invite, .titlebar .setup').hide();
				this.ui.find('.titlebar .friend-setup').show();
				this.ui.find('.footer').css('height', '20px');
				this.ui.find('.footer .btn').hide();
				break;
		}

		_type = type;
	};

	/**
	 * Update party settings UI
	 * @param {object} options
	 * @param {boolean} editable
	 */
	PartyHelper.setOptions = function setOptions(options, editable) {
		function swap(off) {
			var on, tmp;
			on = off.parentNode.querySelector('.on');

			on.className = 'off';
			off.className = 'on';

			tmp = on.style.backgroundImage;
			on.style.backgroundImage = off.style.backgroundImage;
			off.style.backgroundImage = tmp;
		}

		var list = ['exp_share', 'item_share', 'item_sharing_type'];
		var i,
			count = list.length;
		var element;

		for (i = 0; i < count; ++i) {
			if (options[list[i]] === undefined) {
				continue;
			}

			element = this.ui.find('.' + list[i]).find('.off')[0];
			if (options[list[i]] == element.dataset.value) {
				swap(element);
			}
		}

		if (!editable) {
			this.ui.find('.content').addClass('disabled');
		} else {
			this.ui.find('.content').removeClass('disabled');
		}
	};

	/**
	 * Update friend/whisper settings UI
	 * @param {object} options
	 */
	PartyHelper.setFriendOptions = function setFriendOptions(options) {
		function swap(off) {
			var on = off.parentNode.querySelector('.on');
			on.className = 'off';
			off.className = 'on';
		}

		var list = ['open1to1Stranger', 'open1to1Friend', 'alarm1to1'];
		var i,
			count = list.length;

		for (i = 0; i < count; ++i) {
			var value = options[list[i]] === true || options[list[i]] == 1;
			var row = this.ui.find('.' + list[i]);
			var on = row.find('.on')[0];
			var off = row.find('.off')[0];

			if (on && value !== (on.dataset.value == 1)) {
				swap(off);
			}
		}
	};

	/**
	 * Get current window type
	 * @returns {number}
	 */
	PartyHelper.getType = function getType() {
		return _type;
	};

	/**
	 * Validate and process form data
	 */
	function onValidate() {
		var name, PartyFriends;
		PartyFriends = UIManager.getComponent('PartyFriends');

		switch (_type) {
			case PartyHelper.Type.CREATE:
				name = PartyHelper.ui.find('.content .name').val();
				if (name.length) {
					PartyFriends.getUI().onRequestPartyCreation(
						name,
						+PartyHelper.ui.find('.item_share .on').data('value'),
						+PartyHelper.ui.find('.item_sharing_type .on').data('value')
					);
				}
				break;

			case PartyHelper.Type.INVITE:
				name = PartyHelper.ui.find('.content .name').val();
				if (name.length) {
					PartyFriends.getUI().onRequestAddingMember(0, name);
				}
				break;

			case PartyHelper.Type.SETUP:
				PartyFriends.getUI().onRequestSettingUpdate(
					PartyHelper.ui.find('.exp_share .on').data('value'),
					PartyHelper.ui.find('.item_share .on').data('value'),
					PartyHelper.ui.find('.item_sharing_type .on').data('value')
				);
				break;
		}

		PartyHelper.remove();
	}

	/**
	 * Callbacks to use
	 */
	PartyHelper.onCreate = function onCreate() {};
	PartyHelper.onInvite = function onInvite() {};
	PartyHelper.onSetupUpdate = function onSetUpUpdate() {};

	/**
	 * Export
	 */
	return UIManager.addComponent(PartyHelper);
});
