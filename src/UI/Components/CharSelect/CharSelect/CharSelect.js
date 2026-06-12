/**
 * UI/Components/CharSelect/CharSelect.js
 *
 * Chararacter Selection windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
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
import htmlText from './CharSelect.html?raw';
import cssText from './CharSelect.css?raw';

/**
 * Create Chararacter Selection namespace
 */
const CharSelect = new GUIComponent('CharSelect', cssText);

CharSelect.render = () => htmlText;

/**
 * @var {Preferences} save where the cursor position is
 */
const _preferences = Preferences.get(
	'CharSelect',
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
 * Initialize UI
 */
CharSelect.init = function init() {
	const root = this.getRoot();

	this.draggable();

	// Bind buttons
	root.querySelector('.ok').addEventListener('click', connect);
	root.querySelector('.cancel').addEventListener('click', cancel);
	root.querySelector('.make').addEventListener('click', create);
	root.querySelector('.delete').addEventListener('click', suppress);

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
CharSelect.onAppend = function onAppend() {
	const root = this.getRoot();

	this._host.style.top = `${(Renderer.height - 342) / 2}px`;
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
CharSelect.onRemove = function onRemove() {
	_preferences.index = _index;
	_preferences.save();
	Renderer.stop();
};

/**
 * Bind Key events
 *
 * @param {object} event
 */
CharSelect.onKeyDown = function onKeyDown(event) {
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
CharSelect.setInfo = function setInfo(pkt) {
	const root = this.getRoot();

	_maxSlots = Math.floor(pkt.TotalSlotNum + pkt.PremiumStartSlot || 9); // default 9 ?
	_sex = pkt.sex;
	_slots.length = 0;
	_entitySlots.length = 0;
	_list.length = 0;

	if (pkt.charInfo) {
		for (let i = 0, count = pkt.charInfo.length; i < count; ++i) {
			CharSelect.addCharacter(pkt.charInfo[i]);

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
CharSelect.deleteAnswer = function deleteAnswer(error) {
	this.on('keydown');

	switch (error) {
		// Do nothing, just re-set the keydown
		case -2:
			return;

		// Success (clean up character)
		case -1: {
			const root = this.getRoot();

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
};

/**
 * Adding a Character to the list
 *
 * @param {object} character data
 */
CharSelect.addCharacter = function addCharacter(character) {
	if (!('sex' in character) || character.sex === 99) {
		character.sex = _sex;
	}

	_list.push(character);
	_slots[character.CharNum] = character;

	_entitySlots[character.CharNum] = new Entity();
	_entitySlots[character.CharNum].set(character);
	_entitySlots[character.CharNum].effectState =
		_entitySlots[character.CharNum]._effectState & ~StatusConst.EffectState.INVISIBLE;
};

/**
 * Disable or Enable the UI.
 *
 * @param {boolean}
 */
CharSelect.setUIEnabled = function setUIEnabled(value) {
	_disable_UI = !value;
};

/**
 * Callback to use
 */
CharSelect.onExitRequest = function onExitRequest() {};
CharSelect.onDeleteRequest = function onDeleteRequest() {};
CharSelect.onCreateRequest = function onCreateRequest() {};
CharSelect.onConnectRequest = function onConnectRequest() {};

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
 * Generic method to handle mousedown on arrow
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
				CharSelect.onExitRequest();
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
		CharSelect.onCreateRequest(_index);
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
			CharSelect.onConnectRequest(_slots[_index]);
		}
	}
}

/**
 * Delete a character
 */
function suppress() {
	if (_disable_UI === false) {
		if (_slots[_index]) {
			CharSelect.off('keydown');
			CharSelect.onDeleteRequest(_slots[_index].GID);
		}
	}
}

/**
 * Move cursor, update window value
 *
 * @param {number} index
 */
function moveCursorTo(index) {
	const root = CharSelect.getRoot();
	const charinfo = root.querySelector('.charinfo');

	// Set the last entity to idle
	let entity = _entitySlots[_index];
	if (entity) {
		entity.setAction({
			action: entity.ACTION.IDLE,
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

	// Not found, just clean up.
	entity = _entitySlots[_index];
	if (!entity) {
		charinfo.querySelectorAll('div').forEach(div => {
			div.textContent = '';
		});
		root.querySelector('.make').style.display = 'block';
		root.querySelector('.delete').style.display = 'none';
		root.querySelector('.ok').style.display = 'none';
		return;
	}

	// Animate the character
	entity.setAction({
		action: entity.ACTION.READYFIGHT,
		frame: 0,
		play: true,
		repeat: true
	});

	// Bind new value
	root.querySelector('.make').style.display = 'none';
	root.querySelector('.delete').style.display = 'block';
	root.querySelector('.ok').style.display = 'block';

	const info = _slots[_index];
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
export default UIManager.addComponent(CharSelect);
