/**
 * UI/Components/PartyFriends/PartyHelper/PartyHelper.js
 *
 * Helper for the PartyFriends window child (to manage party creation, invitation and updating settings).
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
// Currently unused, preserved for future development.
import _jQuery from 'Utils/jquery.js';
import PACKETVER from 'Network/PacketVerManager.js';
import htmlText from './PartyHelper.html?raw';
import cssText from './PartyHelper.css?raw';
import WhisperBox from 'UI/Components/WhisperBox/WhisperBox.js';

/**
 * Create Component
 */
const PartyHelper = new UIComponent('PartyHelper', htmlText, cssText);

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
let _type = PartyHelper.Type.CREATE;

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
		const on = this.querySelector('.on');
		const off = this.querySelector('.off');

		if (!on || !off) {
			return;
		}

		// Toggle visual state
		on.classList.remove('on');
		on.classList.add('off');
		off.classList.remove('off');
		off.classList.add('on');

		// Save preferences immediately
		const prefs = WhisperBox.preferences;

		prefs.open1to1Stranger = parseInt(PartyHelper.ui.find('.open1to1Stranger .on').attr('data-value'), 10) === 1;
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

		const off = this;
		const on = this.parentNode.getElementsByClassName('on')[0];

		on.className = 'off';
		off.className = 'on';

		const tmp = on.style.backgroundImage;
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
	const self = this;
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
	const base = UIManager.getComponent('PartyFriends').ui;

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
			this.ui.find('.footer').css('height', '27px');
			this.ui.find('.footer .btn').show();
			break;

		case PartyHelper.Type.INVITE:
			this.ui.css('width', '130px');
			this.ui.find('.friend-content').hide();
			this.ui.find('.party-content').show();
			this.ui.find('.setup, .create').hide();
			this.ui.find('.invite').show();
			this.ui.find('.titlebar .setup, .titlebar .create, .titlebar .friend-setup').hide();
			this.ui.find('.titlebar .invite').show();
			this.ui.find('.footer').css('height', '27px');
			this.ui.find('.footer .btn').show();
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
		const on = off.parentNode.querySelector('.on');
		const tmp = on.style.backgroundImage;

		on.className = 'off';
		off.className = 'on';

		on.style.backgroundImage = off.style.backgroundImage;
		off.style.backgroundImage = tmp;
	}

	const list = ['exp_share', 'item_share', 'item_sharing_type'];
	const count = list.length;
	let element;

	for (let i = 0; i < count; ++i) {
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
		const on = off.parentNode.querySelector('.on');
		on.className = 'off';
		off.className = 'on';
	}

	const list = ['open1to1Stranger', 'open1to1Friend', 'alarm1to1'];
	const count = list.length;

	for (let i = 0; i < count; ++i) {
		const value = options[list[i]] === true || options[list[i]] == 1;
		const row = this.ui.find('.' + list[i]);
		const on = row.find('.on')[0];
		const off = row.find('.off')[0];

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
	let name;
	const PartyFriends = UIManager.getComponent('PartyFriends');

	switch (_type) {
		case PartyHelper.Type.CREATE:
			name = PartyHelper.ui.find('.content .name').val();
			if (name.length) {
				PartyFriends.onRequestPartyCreation(
					name,
					PartyHelper.ui.find('.item_share .on').data('value'),
					PartyHelper.ui.find('.item_sharing_type .on').data('value')
				);
				PartyHelper.remove();
			}
			break;

		case PartyHelper.Type.INVITE:
			name = PartyHelper.ui.find('.content .name').val();
			if (name.length) {
				PartyFriends.onRequestAddingMember(0, name);
			}
			break;

		case PartyHelper.Type.SETUP:
			PartyFriends.onRequestSettingUpdate(
				PartyHelper.ui.find('.exp_share .on').data('value'),
				PartyHelper.ui.find('.item_share .on').data('value'),
				PartyHelper.ui.find('.item_sharing_type .on').data('value')
			);
			PartyHelper.remove();
			break;
	}
}

/**
 * Hooks
 */
PartyHelper.onCreate = function onCreate() {};
PartyHelper.onInvite = function onInvite() {};
PartyHelper.onSetupUpdate = function onSetUpUpdate() {};

/**
 * Export component
 */
export default UIManager.addComponent(PartyHelper);
