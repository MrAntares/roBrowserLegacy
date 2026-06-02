/**
 * UI/Components/CharSelect/CharSelect.js
 *
 * Chararacter Selection windows
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import MonsterTable from 'DB/Monsters/MonsterTable.js';
import Preferences from 'Core/Preferences.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Renderer from 'Renderer/Renderer.js';
import Entity from 'Renderer/Entity/Entity.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import StatusConst from 'DB/Status/StatusState.js';
import Camera from 'Renderer/Camera.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import htmlText from './CharSelectV4.html?raw';
import cssText from './CharSelectV4.css?raw';
import Client from 'Core/Client.js';

/**
 * Create Chararacter Selection namespace
 */
const CharSelectV4 = new GUIComponent('CharSelectV4', cssText);

CharSelectV4.render = () => htmlText;

/**
 * @var {Preferences} save preferences for the last index
 */
const _preferences = Preferences.get(
	'CharSelectV4',
	{
		index: 0
	},
	1.0
);

/**
 * @var {number} max slots
 */
let _maxSlots = 15;

/**
 * var {Array} list of characters
 */
const _list = [];

/**
 * @var {Array} list of characters (index by slot)
 */
const _slots = [];

/**
 * @var {Array} list of entities (index by slot)
 */
const _entitySlots = [];

/**
 * @var {number} selector index
 */
let _index = 0;

/**
 * @var {Array} canvas context
 */
const _ctx = [];

/**
 * var {number} sex
 */
let _sex = 0;

/**
 * var for background change
 */
let img = 0;
let _curindex = 0;
let shouldRunBackgroundChange = false;

let countdownInterval;

/**
 * var {boolean} disable input
 */
let _disable_UI = false;

/**
 * Helper to get shadow root
 */
function _getRoot() {
	return CharSelectV4._shadow || CharSelectV4._host;
}

/**
 * Initialize UI
 */
CharSelectV4.init = function init() {
	const root = _getRoot();

	// Bind buttons
	root.querySelector('.ok').addEventListener('click', connect);
	root.querySelector('.cancel').addEventListener('click', cancel);
	root.querySelector('.delete').addEventListener('click', reserve);
	root.querySelector('.canceldelete').addEventListener('click', removedelete);
	root.querySelector('.finaldelete').addEventListener('click', suppress);

	// Bind canvas
	for (let i = 0; i < 15; i++) {
		const slot = root.querySelector(`#slot${i}`);
		if (slot) {
			slot.addEventListener('mousedown', genericCanvasDown(i));
		}
	}

	root.querySelectorAll('canvas').forEach(canvas => {
		canvas.addEventListener('dblclick', () => {
			if (_slots[_index]) {
				connect();
			} else {
				create();
			}
		});
		_ctx.push(canvas.getContext('2d'));
	});

	// Load charinfo panel background
	Client.loadFile(`${DB.INTERFACE_PATH}select_character_ver3/img_info.bmp`, dataURI => {
		root.querySelector('.charinfo').style.backgroundImage = `url(${dataURI})`;
	});

	// Load default slot backgrounds
	for (let i = 0; i < 15; i++) {
		const slotCanvas = root.querySelector(`#slot${i}`);
		if (slotCanvas) {
			Client.loadFile(`${DB.INTERFACE_PATH}select_character_ver3/img_slot2_normal.bmp`, dataURI => {
				slotCanvas.style.backgroundImage = `url(${dataURI})`;
			});
		}
	}
};

let _bgInterval = null;

/**
 * Once append to body
 */
CharSelectV4.onAppend = function onAppend() {
	CharSelectV4.updateCharSlot();

	startCountdownInterval();

	// Update values
	moveCursorTo(_index);
	_bgInterval = setInterval(changeBackgroundEverySecond, 250);
	// Start rendering
	Renderer.render(render);
};

/**
 * Stop rendering
 */
CharSelectV4.onRemove = function onRemove() {
	if (_bgInterval) {
		clearInterval(_bgInterval);
		_bgInterval = null;
	}
	stopCountdownInterval();
	_preferences.index = _index;
	_preferences.save();
	Renderer.stop();
};

/**
 * Bind Key events
 *
 * @param {object} event
 */
CharSelectV4.onKeyDown = function onKeyDown(event) {
	if (this._host.style.display === 'none') {
		return true;
	}
	switch (event.which) {
		case KEYS.ESCAPE:
			cancel();
			break;

		case KEYS.LEFT:
			moveCursorTo(_index - 1 > _list.length - 1 ? _list.length - 1 : _index - 1 < 0 ? 0 : _index - 1);
			break;

		case KEYS.RIGHT:
			moveCursorTo(_index + 1 > _list.length - 1 ? _list.length - 1 : _index + 1 < 0 ? 0 : _index + 1);
			break;

		case KEYS.SUPR:
			if (_slots[_index]) {
				suppress();
			}
			break;

		case KEYS.ENTER:
			if (_slots[_index]) {
				connect();
			} else {
				create();
			}
			break;

		default:
			return true;
	}

	event.stopImmediatePropagation();
	return false;
};

/**
 * Add players to window
 *
 * @param {object} pkt - packet structure
 */
CharSelectV4.setInfo = function setInfo(pkt) {
	CharSelectV4.clearAllSlots();

	_maxSlots = Math.floor(pkt.TotalSlotNum + pkt.PremiumStartSlot || 15); // default 15 ?
	_sex = pkt.sex;

	if (pkt.charInfo) {
		for (let i = 0, count = pkt.charInfo.length; i < count; ++i) {
			CharSelectV4.addCharacter(pkt.charInfo[i]);
		}
	}

	moveCursorTo(_index);
};

/**
 * Format delay duration
 */
function formatDuration(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const replacer = DB.getMessage(3349).includes('%d') ? '%d' : '%02d';

	return DB.getMessage(3349)
		.replace(replacer, hours.toString().padStart(2, '0'))
		.replace(replacer, minutes.toString().padStart(2, '0'))
		.replace(replacer, remainingSeconds.toString().padStart(2, '0'));
}

/**
 * Countdown for delay in deletion
 */
function updateAllVisibleCountdowns() {
	const root = _getRoot();
	const visibleCountdowns = root.querySelectorAll('.timedelete:not(.hidden)');

	visibleCountdowns.forEach(countdownDiv => {
		const deleteReservedDuration = parseInt(countdownDiv.dataset.duration, 10);
		const updatedDuration = Math.max(0, deleteReservedDuration - 1);

		countdownDiv.textContent = formatDuration(updatedDuration);
		if (updatedDuration > 0) {
			countdownDiv.style.color = 'red';
		} else {
			countdownDiv.style.color = 'blue';
		}

		countdownDiv.dataset.duration = updatedDuration.toString();
	});
}

/**
 * Start the countdown update interval only when in CharSelectV4 UI
 */
function startCountdownInterval() {
	if (!countdownInterval) {
		countdownInterval = setInterval(updateAllVisibleCountdowns, 1000);
	}
}

/**
 * Stop the countdown update interval
 */
function stopCountdownInterval() {
	if (countdownInterval) {
		clearInterval(countdownInterval);
		countdownInterval = null;
	}
}

/**
 * Result of Request in Deleting the Character
 *
 * @param {object} pkt - packet structure
 */
CharSelectV4.reqdeleteAnswer = function reqdeleteAnswer(pkt) {
	this.on('keydown');
	const deleteReservedDate = pkt.DeleteReservedDate;
	const result = typeof pkt.Result === 'undefined' ? -1 : pkt.Result;
	const info = _slots[_index];

	switch (result) {
		case 0: // 0: An unknown error has occurred.
			return;

		case 1: {
			// 1: none/success
			const now = Math.floor(Date.now() / 1000);
			info.DeleteDate = deleteReservedDate + now;
			requestdelete(_index, deleteReservedDate);
			break;
		}

		case 3: // 3: A database error occurred.
			return;

		case 4: // 4: To delete a character you must withdraw from the guild.
			UIManager.showMessageBox(DB.getMessage(1818), 'ok');
			break;
		case 5: // 5: To delete a character you must withdraw from the party.
			UIManager.showMessageBox(DB.getMessage(1819), 'ok');
			break;

		default:
			return;
	}
};

/**
 * When successfully requested for character deletion
 * Update UI and add timer
 */
function requestdelete(index, timer) {
	const root = _getRoot();

	// Make it sit
	_entitySlots[index].action = 2;

	// Add the timer
	const countdown = root.querySelector(`.timedelete.slot${index}`);
	if (countdown) {
		countdown.dataset.duration = timer;
		countdown.classList.remove('hidden');
		countdown.style.display = 'block';
	}

	// Adjust the buttons
	root.querySelector('.delete').style.display = 'none';
	root.querySelector('.canceldelete').style.display = 'block';
	root.querySelector('.finaldelete').style.display = 'block';
}

/**
 * Cancel reservation of character for deletion
 * Update UI and remove timer
 */
function removedelete() {
	if (_slots[_index]) {
		const root = _getRoot();

		// Delete here as well? Though server should tell us this
		_slots[_index].DeleteDate = 0;

		// Make it stand
		_entitySlots[_index].action = 0;
		render();

		// Remove the timer
		const countdown = root.querySelector(`.timedelete.slot${_index}`);
		if (countdown) {
			countdown.dataset.duration = 0;
			countdown.classList.add('hidden');
			countdown.style.display = 'none';
		}

		// Adjust the buttons
		root.querySelector('.canceldelete').style.display = 'none';
		root.querySelector('.finaldelete').style.display = 'none';
		root.querySelector('.delete').style.display = 'block';

		// Send request to the server
		CharSelectV4.onCancelDeleteRequest(_slots[_index].GID);
	}
}

/**
 * Answer from server to delete a character
 *
 * @param {number} error id
 */
CharSelectV4.deleteAnswer = function deleteAnswer(error) {
	this.on('keydown');

	switch (error) {
		// Do nothing, just re-set the keydown
		case -1:
		case -2:
			return;

		// Success (clean up character)
		case 1: {
			delete _slots[_index];
			delete _entitySlots[_index];

			if (_preferences.index === _index) {
				_preferences.index = 0;
			}

			let i = 0;
			let count = _list.length;

			while (i < count) {
				if (_list[i].CharNum === _index) {
					_list.splice(i, 1);
					--count;
				} else {
					i++;
				}
			}

			CharSelectV4.updateCharSlot(_index);

			// Refresh UI
			moveCursorTo(_index);
			return;
		}

		default: // Others error ?
		case 0:
		case 2: // 2: Due to system settings can not be deleted.
		case 6: // 6: Name does not match.
			UIManager.showMessageBox(DB.getMessage(1821), 'ok');
			return;
		case 3: // 3: A database error occurred.
			UIManager.showMessageBox(DB.getMessage(1817), 'ok');
			return;
		case 4: // 4: Deleting not yet possible time.
			UIManager.showMessageBox(DB.getMessage(1820), 'ok');
			return;
		case 5: // 5: Date of birth do not match.
			UIManager.showMessageBox(DB.getMessage(1822), 'ok');
			return;
		case 7: // 7: Character Deletion has failed because you have entered an incorrect e-mail address.
			UIManager.showMessageBox(DB.getMessage(301), 'ok');
			return;
	}
};

/**
 * Adding a Character to the list
 *
 * @param {object} character data
 */
CharSelectV4.addCharacter = function addCharacter(character) {
	if (!('sex' in character) || character.sex === 99) {
		character.sex = _sex;
	}

	_list.push(character);
	_slots[character.CharNum] = character;

	_entitySlots[character.CharNum] = new Entity();
	_entitySlots[character.CharNum].set(character);
	_entitySlots[character.CharNum].effectState =
		_entitySlots[character.CharNum]._effectState & ~StatusConst.EffectState.INVISIBLE;
	_entitySlots[character.CharNum].hideShadow = true;

	CharSelectV4.updateCharSlot(character.CharNum);
};

/**
 * Disable or Enable the UI.
 *
 * @param {boolean}
 */
CharSelectV4.setUIEnabled = function setUIEnabled(value) {
	_disable_UI = !value;
};

/**
 * Callback to use
 */
CharSelectV4.onExitRequest = function onExitRequest() {};
CharSelectV4.onDeleteRequest = function onDeleteRequest() {};
CharSelectV4.onDeleteReqDelay = function onDeleteReqDelay() {};
CharSelectV4.onCreateRequest = function onCreateRequest() {};
CharSelectV4.onConnectRequest = function onConnectRequest() {};
CharSelectV4.onCancelDeleteRequest = function onCancelDeleteRequest() {};

/**
 * Generic method to handle mousedown on canvas
 *
 * @param {number} value to move
 */
function genericCanvasDown(value) {
	return event => {
		moveCursorTo(value);
		event.stopImmediatePropagation();
		return false;
	};
}

/**
 * Press "cancel" or ESCAPE key
 */
function cancel() {
	if (_disable_UI === false) {
		UIManager.showPromptBox(
			DB.getMessage(17),
			'ok',
			'cancel',
			() => {
				CharSelectV4.onExitRequest();
				CharSelectV4.clearAllSlots();
			},
			null
		);
		stopCountdownInterval();
	}
}

/**
 * Jumping to Character creation window
 */
function create() {
	if (_disable_UI === false) {
		CharSelectV4.onCreateRequest(_index);
	}
}

/**
 * Select Player, connect
 */
function connect() {
	if (_disable_UI === false) {
		if (_slots[_index] && !_slots[_index].DeleteDate) {
			_preferences.index = _index;
			_preferences.save();
			CharSelectV4.onConnectRequest(_slots[_index]);
			stopCountdownInterval();
		}
	}
}

/**
 * Request to delete a character
 */
function reserve() {
	if (_disable_UI === false) {
		if (_slots[_index]) {
			CharSelectV4.off('keydown');
			CharSelectV4.onDeleteReqDelay(_slots[_index].GID);
		}
	}
}

/**
 * Delete a character
 */
function suppress() {
	if (_disable_UI === false) {
		if (_slots[_index]) {
			CharSelectV4.off('keydown');
			CharSelectV4.onDeleteRequest(_slots[_index].GID);
		}
	}
}

/**
 * Move cursor, update window value
 *
 * @param {number} index
 */
function moveCursorTo(index) {
	const root = _getRoot();
	const charinfo = root.querySelector('.charinfo');

	const prevIndex = _index;
	let entity = _slots[_index];
	shouldRunBackgroundChange = false;

	if (entity) {
		Client.loadFile(`${DB.INTERFACE_PATH}select_character_ver3/img_slot_normal.bmp`, dataURI => {
			const prevSlot = root.querySelector(`#slot${prevIndex}`);
			if (prevSlot) {
				prevSlot.style.backgroundImage = `url(${dataURI})`;
			}
		});
	}

	const slotIndex = (_index = index > _maxSlots ? _maxSlots : index < 0 ? 0 : index);

	// Not found, just clean up.
	entity = _slots[_index];
	if (!entity) {
		charinfo.querySelectorAll('div').forEach(div => {
			div.textContent = '';
		});
		root.querySelector('.delete').style.display = 'none';
		root.querySelector('.canceldelete').style.display = 'none';
		root.querySelector('.finaldelete').style.display = 'none';
		root.querySelector('.ok').style.display = 'none';
		const countdown = root.querySelector(`.timedelete.slot${_index}`);
		if (countdown) {
			countdown.dataset.duration = 0;
			countdown.classList.add('hidden');
			countdown.style.display = 'none';
		}
		return;
	} else {
		_curindex = slotIndex;
		shouldRunBackgroundChange = true;
	}

	if (shouldRunBackgroundChange === true) {
		changeBackgroundEverySecond();
	}

	const info = _slots[_index];
	// Bind new value
	if (info.DeleteDate) {
		root.querySelector('.delete').style.display = 'none';
		root.querySelector('.canceldelete').style.display = 'block';
		root.querySelector('.finaldelete').style.display = 'block';
	} else {
		root.querySelector('.canceldelete').style.display = 'none';
		root.querySelector('.finaldelete').style.display = 'none';
		root.querySelector('.delete').style.display = 'block';
	}

	root.querySelector('.ok').style.display = 'block';

	charinfo.querySelector('.map').textContent = DB.getMapName(info.lastMap, '') || '';
	charinfo.querySelector('.job').textContent = MonsterTable[info.job] || '';
	charinfo.querySelector('.lvl').textContent = info.level;
	charinfo.querySelector('.exp').textContent = info.exp;
	charinfo.querySelector('.hp').textContent = info.hp;
	charinfo.querySelector('.sp').textContent = info.sp;
	charinfo.querySelector('.str').textContent = info.Str;
	charinfo.querySelector('.agi').textContent = info.Agi;
	charinfo.querySelector('.vit').textContent = info.Vit;
	charinfo.querySelector('.int').textContent = info.Int;
	charinfo.querySelector('.dex').textContent = info.Dex;
	charinfo.querySelector('.luk').textContent = info.Luk;
}

function changeBackgroundEverySecond() {
	const root = _getRoot();
	const backgroundchange = root.querySelector(`#slot${_curindex}`);
	if (backgroundchange && shouldRunBackgroundChange === true) {
		Client.loadFile(`${DB.INTERFACE_PATH}select_character_ver3/img_slot_select${img}.bmp`, dataURI => {
			backgroundchange.style.backgroundImage = `url(${dataURI})`;
			backgroundchange.style.width = '157px';
			backgroundchange.style.height = '197px';
			backgroundchange.style.backgroundSize = 'contain';
			backgroundchange.style.backgroundRepeat = 'no-repeat';
		});

		// Increment the slot index and wrap around if needed
		img = (img + 1) % 8;
	}
}

CharSelectV4.updateCharSlot = function updateCharSlot(slotId) {
	const root = _getRoot();
	let start = 0;
	let loopMax = Math.max(_maxSlots, _slots.length);

	if (typeof slotId !== 'undefined') {
		start = slotId;
		loopMax = slotId + 1;
	}

	const charCanvases = root.querySelectorAll('.char_canvas');
	const jobIcons = root.querySelectorAll('.job_icon');

	for (let i = start; i < loopMax; ++i) {
		if (charCanvases[i]) {
			charCanvases[i].querySelector('.name').innerHTML = _slots[i] ? _slots[i].name : '';
		}
		if (!_slots[i]) {
			if (jobIcons[i]) {
				jobIcons[i].style.backgroundImage = '';
			}
			const slotCanvas = root.querySelector(`#slot${i}`);
			if (slotCanvas) {
				Client.loadFile(`${DB.INTERFACE_PATH}select_character_ver3/img_slot2_normal.bmp`, dataURI => {
					slotCanvas.style.backgroundImage = `url(${dataURI})`;
				});
			}
			const countdown = root.querySelector(`.timedelete.slot${i}`);
			if (countdown) {
				countdown.dataset.duration = 0;
				countdown.classList.add('hidden');
				countdown.style.display = 'none';
			}
		} else {
			const slotCanvas = root.querySelector(`#slot${i}`);
			if (slotCanvas) {
				Client.loadFile(`${DB.INTERFACE_PATH}select_character_ver3/img_slot_normal.bmp`, dataURI => {
					slotCanvas.style.backgroundImage = `url(${dataURI})`;
				});
			}

			if (jobIcons[i]) {
				const slotJobIcon = jobIcons[i];
				Client.loadFile(`${DB.INTERFACE_PATH}renewalparty/icon_jobs_${_slots[i].job}.bmp`, dataURI => {
					slotJobIcon.style.backgroundImage = `url(${dataURI})`;
				});
			}

			if (_slots[i].DeleteDate) {
				const countdown = root.querySelector(`.timedelete.slot${i}`);
				if (countdown) {
					countdown.dataset.duration = _slots[i].DeleteDate;
					countdown.classList.remove('hidden');
					countdown.style.display = 'block';
				}
			}
		}
	}
};

CharSelectV4.clearAllSlots = function clearAllSlots() {
	_slots.length = 0;
	_entitySlots.length = 0;
	_list.length = 0;
	CharSelectV4.updateCharSlot();
};

/**
 * Render sprites to canvas
 */
function render() {
	Camera.direction = 4;
	const idx = Math.floor(_index / _maxSlots) * _maxSlots;
	const count = _ctx.length;

	for (let i = 0; i < count; ++i) {
		_ctx[i].clearRect(0, 0, _ctx[i].canvas.width, _ctx[i].canvas.height);

		if (_entitySlots[idx + i]) {
			SpriteRenderer.bind2DContext(_ctx[i], 78, 157);
			if (_slots[idx + i] && _slots[idx + i].DeleteDate) {
				_entitySlots[idx + i].action = 2;
			}
			_entitySlots[idx + i].renderEntity();
		}
	}
}

/**
 * Create componentand export it
 */
export default UIManager.addComponent(CharSelectV4);
