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
import PACKETVER from 'Network/PacketVerManager.js';
import htmlText from './CharSelectV2.html?raw';
import cssText from './CharSelectV2.css?raw';

/**
 * Create Chararacter Selection namespace
 */
const CharSelectV2 = new GUIComponent('CharSelectV2', cssText);

CharSelectV2.render = () => htmlText;

/**
 * @var {Preferences} save where the cursor position is
 */
const _preferences = Preferences.get(
	'CharSelectV2',
	{
		index: 0
	},
	1.0
);

/**
 * @var {number} max slots
 */
let _maxSlots = 3 * 9;

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
 * var {boolean} disable input
 */
let _disable_UI = false;

/**
 * Helper to get shadow root
 */
function _getRoot() {
	return CharSelectV2._shadow || CharSelectV2._host;
}

/**
 * Initialize UI
 */
CharSelectV2.init = function init() {
	const root = _getRoot();

	this.draggable();

	// Bind buttons
	root.querySelector('.ok').addEventListener('click', connect);
	root.querySelector('.cancel').addEventListener('click', cancel);
	root.querySelector('.make').addEventListener('click', create);
	root.querySelector('.delete').addEventListener('click', reserve);
	root.querySelector('.canceldelete').addEventListener('click', removedelete);
	root.querySelector('.finaldelete').addEventListener('click', suppress);

	root.querySelector('.arrow.left').addEventListener('mousedown', genericArrowDown(-1));
	root.querySelector('.arrow.right').addEventListener('mousedown', genericArrowDown(+1));

	// Bind canvas
	root.querySelector('.slot1').addEventListener('mousedown', genericCanvasDown(0));
	root.querySelector('.slot2').addEventListener('mousedown', genericCanvasDown(1));
	root.querySelector('.slot3').addEventListener('mousedown', genericCanvasDown(2));

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
};

/**
 * Once append to body
 */
CharSelectV2.onAppend = function onAppend() {
	const root = _getRoot();

	this._host.style.top = `${(Renderer.height - 358) / 2}px`;
	this._host.style.left = `${(Renderer.width - 576) / 2}px`;

	_index = _preferences.index;

	root.querySelector('.slotinfo .number').textContent = `${_list.length} / ${_maxSlots}`;
	root.querySelector('.pageinfo .count').textContent = _maxSlots / 3;

	// Update values
	moveCursorTo(_index);

	// Start rendering
	Renderer.render(render);
};

/**
 * Stop rendering
 */
CharSelectV2.onRemove = function onRemove() {
	const root = _getRoot();

	_preferences.index = _index;
	_preferences.save();
	root.querySelectorAll('.timedelete').forEach(el => {
		el.style.display = 'none';
		el.textContent = '';
	});
	Renderer.stop();
};

/**
 * Bind Key events
 *
 * @param {object} event
 */
CharSelectV2.onKeyDown = function onKeyDown(event) {
	if (this._host.style.display === 'none') {
		return true;
	}
	switch (event.which) {
		case KEYS.ESCAPE:
			cancel();
			break;

		case KEYS.LEFT:
			moveCursorTo(_index - 1);
			break;

		case KEYS.RIGHT:
			moveCursorTo(_index + 1);
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
CharSelectV2.setInfo = function setInfo(pkt) {
	const root = _getRoot();

	_maxSlots = Math.floor(pkt.TotalSlotNum + pkt.PremiumStartSlot || 9); // default 9 ?
	_sex = pkt.sex;
	_slots.length = 0;
	_entitySlots.length = 0;
	_list.length = 0;

	if (pkt.charInfo) {
		for (let i = 0, count = pkt.charInfo.length; i < count; ++i) {
			CharSelectV2.addCharacter(pkt.charInfo[i]);

			// Guess the max slot
			// required if the client is < 20100413 and have more than 9 slots
			_maxSlots = Math.max(_maxSlots, Math.floor(pkt.charInfo[i].CharNum / 3 + 1) * 3);
		}
	}

	root.querySelector('.slotinfo .number').textContent = `${_list.length} / ${_maxSlots}`;
	root.querySelector('.pageinfo .count').textContent = _maxSlots / 3;

	moveCursorTo(_index);
};

/**
 * Answer from server to delete a character
 *
 * @param {number} error id
 */
CharSelectV2.deleteAnswer = function deleteAnswer(error) {
	this.on('keydown');

	if (PACKETVER.value >= 20100803) {
		switch (error) {
			// Do nothing, just re-set the keydown
			case -1:
			case -2:
				return;

			// Success (clean up character)
			case 1: {
				const root = _getRoot();

				delete _slots[_index];
				delete _entitySlots[_index];

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

				// Refresh UI
				moveCursorTo(_index);
				root.querySelector('.slotinfo .number').textContent = `${_list.length} / ${_maxSlots}`;
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
	} else {
		switch (error) {
			// Do nothing, just re-set the keydown
			case -2:
				return;

			// Success (clean up character)
			case -1: {
				const root = _getRoot();

				delete _slots[_index];
				delete _entitySlots[_index];

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

				// Refresh UI
				moveCursorTo(_index);
				root.querySelector('.slotinfo .number').textContent = `${_list.length} / ${_maxSlots}`;
				return;
			}

			default: // Others error ?
			case 0: // Incorrect adress email
				UIManager.showMessageBox(DB.getMessage(301), 'ok');
				break;
		}
	}
};

/**
 * Adding a Character to the list
 *
 * @param {object} character data
 */
CharSelectV2.addCharacter = function addCharacter(character) {
	const root = _getRoot();

	if (!('sex' in character) || character.sex === 99) {
		character.sex = _sex;
	}

	//Adjust from remaining time to fixed datetime
	if (character.DeleteDate) {
		const now = Math.floor(Date.now() / 1000);
		const timer =
			(PACKETVER.value > 20130000 && PACKETVER.value <= 20141022) || PACKETVER.value >= 20150513
				? character.DeleteDate + now
				: character.DeleteDate;
		character.DeleteDate = timer;
	}

	_list.push(character);
	_slots[character.CharNum] = character;

	_entitySlots[character.CharNum] = new Entity();
	_entitySlots[character.CharNum].set(character);
	_entitySlots[character.CharNum].effectState =
		_entitySlots[character.CharNum]._effectState & ~StatusConst.EffectState.INVISIBLE;

	if (PACKETVER.value >= 20100803) {
		if (_slots[character.CharNum].DeleteDate && Math.floor(_index / 3) === Math.floor(character.CharNum / 3)) {
			const slotNum = ((character.CharNum + _maxSlots) % _maxSlots) + 1;
			const countdown = root.querySelector(`.timedelete.slot${slotNum}`);
			const entity = _entitySlots[character.CharNum];
			if (countdown) {
				countdown.dataset.datetime = _slots[character.CharNum].DeleteDate;
				countdown.textContent = formatDatetime(_slots[character.CharNum].DeleteDate);
				countdown.style.display = 'block';
			}
			entity.setAction({
				action: entity.ACTION.SIT,
				frame: 0,
				play: true,
				repeat: true
			});
		}
	}
};

/**
 * Disable or Enable the UI.
 *
 * @param {boolean}
 */
CharSelectV2.setUIEnabled = function setUIEnabled(value) {
	_disable_UI = !value;
};

/**
 * Callback to use
 */
CharSelectV2.onExitRequest = function onExitRequest() {};
CharSelectV2.onDeleteReqDelay = function onDeleteReqDelay() {};
CharSelectV2.onCancelDeleteRequest = function onCancelDeleteRequest() {};
CharSelectV2.onDeleteRequest = function onDeleteRequest() {};
CharSelectV2.onCreateRequest = function onCreateRequest() {};
CharSelectV2.onConnectRequest = function onConnectRequest() {};

/**
 * Generic method to handle mousedown on arrow
 *
 * @param {number} value to move
 */
function genericArrowDown(value) {
	return event => {
		moveCursorTo((_index + _maxSlots + value) % _maxSlots);
		event.stopImmediatePropagation();
		return false;
	};
}

/**
 * Generic method to handle mousedown on canvas
 *
 * @param {number} value to move
 */
function genericCanvasDown(value) {
	return event => {
		moveCursorTo(Math.floor(_index / 3) * 3 + value);
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
				CharSelectV2.onExitRequest();
			},
			null
		);
	}
}

/**
 * Jumping to Character creation window
 */
function create() {
	if (_disable_UI === false) {
		CharSelectV2.onCreateRequest(_index);
	}
}

/**
 * Select Player, connect
 */
function connect() {
	if (_disable_UI === false) {
		if (_slots[_index]) {
			_preferences.index = _index;
			_preferences.save();
			CharSelectV2.onConnectRequest(_slots[_index]);
		}
	}
}

/**
 * Format delay date time
 */
function formatDatetime(epoch) {
	const datetime = new Date(0);
	datetime.setSeconds(epoch);

	const month = datetime.getMonth() + 1;
	const day = datetime.getDate();
	const hours = datetime.getHours();
	const minutes = datetime.getMinutes();
	const seconds = datetime.getSeconds();

	const formattedDatetime = DB.getMessage(2097)
		.replace('%d', `${month}`)
		.replace('%d', `${day}`)
		.replace('%d', `${hours}`)
		.replace('%d', `${minutes}`)
		.replace('%d', `${seconds}`);

	return formattedDatetime;
}

/**
 * Result of Request in Deleting the Character
 *
 * @param {object} pkt - packet structure
 */
CharSelectV2.reqdeleteAnswer = function reqdeleteAnswer(pkt) {
	this.on('keydown');
	const now = Math.floor(Date.now() / 1000);
	const result = typeof pkt.Result === 'undefined' ? -1 : pkt.Result;
	const info = _slots[_index];

	switch (result) {
		case 0: // 0: An unknown error has occurred.
			return;

		case 1: {
			// 1: none/success
			//Adjust from remaining time to fixed datetime
			const timer =
				(PACKETVER.value > 20130000 && PACKETVER.value <= 20141022) || PACKETVER.value >= 20150513
					? pkt.DeleteReservedDate + now
					: pkt.DeleteReservedDate;
			info.DeleteDate = timer;
			requestdelete(_index, timer);
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
	const entity = _entitySlots[index];
	let action;

	const countdown = root.querySelector(`.timedelete.slot${(index % 3) + 1}`);
	if (countdown) {
		countdown.dataset.datetime = timer;
		countdown.textContent = formatDatetime(timer);
		countdown.style.display = 'block';
		if (Math.floor(Date.now() / 1000) > timer) {
			countdown.classList.remove('waitdelete');
			countdown.classList.add('candelete');
			action = entity.ACTION.DIE;
		} else {
			countdown.classList.remove('candelete');
			countdown.classList.add('waitdelete');
			action = entity.ACTION.SIT;
		}
	}

	// Set action
	entity.action = action;

	// Adjust the buttons
	root.querySelector('.delete').style.display = 'none';
	root.querySelector('.canceldelete').style.display = 'block';
	if (Math.floor(Date.now() / 1000) > timer) {
		root.querySelector('.finaldelete').style.display = 'block';
	} else {
		root.querySelector('.finaldelete').style.display = 'none';
	}
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
		_entitySlots[_index].action = _entitySlots[_index].ACTION.READYFIGHT;
		render();

		// Remove the timer
		const countdown = root.querySelector(`.timedelete.slot${(_index % 3) + 1}`);
		countdown.dataset.datetime = 0;
		countdown.textContent = formatDatetime('');
		countdown.style.display = 'none';

		// Adjust the buttons
		root.querySelector('.canceldelete').style.display = 'none';
		root.querySelector('.finaldelete').style.display = 'none';
		root.querySelector('.delete').style.display = 'block';

		// Send request to the server
		CharSelectV2.onCancelDeleteRequest(_slots[_index].GID);
	}
}

/**
 * Request to delete a character
 */
function reserve() {
	if (_disable_UI === false) {
		if (_slots[_index]) {
			CharSelectV2.off('keydown');
			CharSelectV2.onDeleteReqDelay(_slots[_index].GID);
		}
	}
}

/**
 * Delete a character
 */
function suppress() {
	if (_disable_UI === false) {
		if (_slots[_index]) {
			CharSelectV2.off('keydown');
			CharSelectV2.onDeleteRequest(_slots[_index].GID);
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

	// Set the last entity to idle
	let entity = _entitySlots[_index];
	let info = _slots[_index];
	let action;
	if (entity) {
		if (PACKETVER.value >= 20100803 && info.DeleteDate) {
			action = entity.ACTION.SIT;
		} else {
			action = entity.ACTION.IDLE;
		}

		entity.setAction({
			action: action,
			frame: 0,
			play: true,
			repeat: true
		});
	}

	// Move
	_index = (index + _maxSlots) % _maxSlots;
	const boxSelect = root.querySelector('.box_select');
	boxSelect.classList.remove('slot1', 'slot2', 'slot3');
	boxSelect.classList.add(`slot${(_index % 3) + 1}`);

	// Set page
	root.querySelector('.pageinfo .current').textContent = Math.floor(_index / 3) + 1;

	// Update page deltimes
	for (let i = 0; i < 3; i++) {
		const tmpIndex = _index - (_index % 3) + i;
		info = _slots[tmpIndex];
		entity = _entitySlots[tmpIndex];
		const countdown = root.querySelector(`.timedelete.slot${(tmpIndex % 3) + 1}`);

		if (info && entity) {
			if (info.DeleteDate && PACKETVER.value >= 20100803) {
				countdown.dataset.datetime = info.DeleteDate;
				countdown.textContent = formatDatetime(info.DeleteDate);
				countdown.style.display = 'block';
				if (Math.floor(Date.now() / 1000) > info.DeleteDate) {
					countdown.classList.remove('waitdelete');
					countdown.classList.add('candelete');
				} else {
					countdown.classList.remove('candelete');
					countdown.classList.add('waitdelete');
				}
				entity.action = entity.ACTION.SIT;
			} else {
				countdown.dataset.datetime = 0;
				countdown.textContent = formatDatetime('');
				countdown.style.display = 'none';
				entity.action = entity.ACTION.IDLE;
			}
		} else {
			countdown.dataset.datetime = 0;
			countdown.textContent = formatDatetime('');
			countdown.style.display = 'none';
		}
	}

	// Not found, just clean up.
	entity = _entitySlots[_index];
	if (!entity) {
		charinfo.querySelectorAll('div').forEach(div => {
			div.textContent = '';
		});
		root.querySelector('.make').style.display = 'block';
		root.querySelector('.delete').style.display = 'none';
		root.querySelector('.canceldelete').style.display = 'none';
		root.querySelector('.finaldelete').style.display = 'none';
		root.querySelector('.ok').style.display = 'none';
		return;
	}

	info = _slots[_index];
	// Bind new value
	if (info.DeleteDate && PACKETVER.value >= 20100803) {
		root.querySelector('.delete').style.display = 'none';
		root.querySelector('.canceldelete').style.display = 'block';
		if (Math.floor(Date.now() / 1000) > info.DeleteDate) {
			root.querySelector('.finaldelete').style.display = 'block';
			action = entity.ACTION.DIE;
		} else {
			root.querySelector('.finaldelete').style.display = 'none';
			action = entity.ACTION.SIT;
		}
		root.querySelector('.make').style.display = 'none';
		root.querySelector('.ok').style.display = 'block';
	} else {
		if (PACKETVER.value >= 20100803) {
			root.querySelector('.delete').style.display = 'block';
			root.querySelector('.canceldelete').style.display = 'none';
			root.querySelector('.finaldelete').style.display = 'none';
		} else {
			root.querySelector('.delete').style.display = 'none';
			root.querySelector('.canceldelete').style.display = 'none';
			root.querySelector('.finaldelete').style.display = 'block';
		}
		root.querySelector('.make').style.display = 'none';
		root.querySelector('.ok').style.display = 'block';
		action = entity.ACTION.READYFIGHT;
	}

	// Animate the character
	entity.setAction({
		action: action,
		frame: 0,
		play: true,
		repeat: true
	});

	charinfo.querySelector('.name').textContent = info.name;
	charinfo.querySelector('.job').textContent = MonsterTable[info.job] || '';
	charinfo.querySelector('.lvl').textContent = info.level;
	charinfo.querySelector('.exp').textContent = info.exp;
	charinfo.querySelector('.hp').textContent = info.hp;
	charinfo.querySelector('.sp').textContent = info.sp;
	charinfo.querySelector('.map').textContent = DB.getMapName(info.lastMap, '') || '';
	charinfo.querySelector('.str').textContent = info.Str;
	charinfo.querySelector('.agi').textContent = info.Agi;
	charinfo.querySelector('.vit').textContent = info.Vit;
	charinfo.querySelector('.int').textContent = info.Int;
	charinfo.querySelector('.dex').textContent = info.Dex;
	charinfo.querySelector('.luk').textContent = info.Luk;
}

/**
 * Render sprites to canvas
 */
function render() {
	Camera.direction = 4;
	const idx = Math.floor(_index / 3) * 3;
	const count = _ctx.length;

	for (let i = 0; i < count; ++i) {
		_ctx[i].clearRect(0, 0, _ctx[i].canvas.width, _ctx[i].canvas.height);

		if (_entitySlots[idx + i]) {
			SpriteRenderer.bind2DContext(_ctx[i], 63, 130);
			_entitySlots[idx + i].renderEntity();
		}
	}
}

/**
 * Create componentand export it
 */
export default UIManager.addComponent(CharSelectV2);
