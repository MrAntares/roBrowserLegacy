/**
 * UI/Components/CharCreatev4/CharCreatev4.js
 *
 * Chararacter Creation windows
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Renderer from 'Renderer/Renderer.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Entity from 'Renderer/Entity/Entity.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';
import htmlText from './CharCreatev4.html?raw';
import cssText from './CharCreatev4.css?raw';
import Client from 'Core/Client.js';

/**
 * Create Chararacter Selection namespace
 */
const CharCreatev4 = new GUIComponent('CharCreatev4', cssText);

CharCreatev4.render = () => htmlText;

/**
 * @var {boolean} account sex
 */
let _accountSex = 0;

/**
 * @var for hairstylelist
 */
let _race = 'human';
let _gender = 'male';
let _prevhead = 1;
let _curhead = 1;
let _prevcolor = 0;
let _curcolor = 0;

/**
 * @var {object} chargen info
 */
const _chargen = {
	entity: new Entity(),
	ctx: null,
	render: false,
	tick: 0
};

/**
 * @var {object} doram info
 */
const _doram = {
	entity: new Entity(),
	ctx: null,
	render: false,
	tick: 0
};

/**
 * @var {object} model info
 */
const _model = {
	entity: new Entity(),
	ctx: null,
	render: false,
	tick: 0
};

/**
 * Initialize UI
 */
CharCreatev4.init = function init() {
	const root = CharCreatev4.getRoot();
	_chargen.ctx = root.querySelector('#human').getContext('2d');
	_doram.ctx = root.querySelector('#doram').getContext('2d');
	_model.ctx = root.querySelector('#style_model').getContext('2d');

	this.draggable();

	// Default stylist
	_race = 'human';
	_gender = 'male';
	_prevhead = 1;
	_curhead = 1;
	_prevcolor = 0;
	_curcolor = 0;

	// Update cursor
	const radioInputs = root.querySelectorAll('input[type="radio"]');
	const labels = root.querySelectorAll('label');

	radioInputs.forEach(input => {
		input.classList.add('event_add_cursor');
	});

	labels.forEach(label => {
		label.classList.add('event_add_cursor');
	});

	// Bind Events
	root.querySelector('.gender .male_button').addEventListener('mousedown', updateCharacterGeneric('gender', 1));
	root.querySelector('.gender .female_button').addEventListener('mousedown', updateCharacterGeneric('gender', 0));
	root.querySelector('#style .rot_left').addEventListener('mousedown', updateCharacterGeneric('direction', 0));
	root.querySelector('#style .rot_right').addEventListener('mousedown', updateCharacterGeneric('direction', 1));

	root.querySelectorAll('.race').forEach(el => {
		el.addEventListener('click', updateRace);
	});

	// Event delegation for hairstyle buttons
	root.addEventListener('click', event => {
		const hstyleBtn = event.target.closest('.hstyle_button');
		if (hstyleBtn) {
			updateHStyle(hstyleBtn);
			return;
		}
		const hcolorBtn = event.target.closest('.hcolor_button');
		if (hcolorBtn) {
			updateHColor(hcolorBtn);
		}
	});

	const charNameInput = root.querySelector('#char_name');
	charNameInput.addEventListener('mousedown', event => {
		charNameInput.focus();
		event.stopImmediatePropagation();
	});

	root.querySelector('.cancel').addEventListener('click', cancel);
	root.querySelector('.return').addEventListener('click', cancel);
	root.querySelector('.make').addEventListener('click', create);

	/* Msgstring Texts */
	root.querySelector('.title').textContent = DB.getMessage(3356 - 1);
	root.querySelector('.human_title').textContent = DB.getMessage(3017 - 1);
	root.querySelector('.human_desc').textContent = DB.getMessage(3021 - 1);
	root.querySelector('.doram_title').textContent = DB.getMessage(3019 - 1);
	root.querySelector('.doram_desc').textContent = DB.getMessage(3022 - 1);
	root.querySelector('.hair_style_title').textContent = DB.getMessage(3347 - 1);
	root.querySelector('.hair_color_title').textContent = DB.getMessage(3348 - 1);
	root.querySelector('.return').textContent = DB.getMessage(3352 - 1);
	root.querySelector('.make').textContent = DB.getMessage(3346 - 1);
};

/**
 * Setter for AccountSex
 *
 * @param {number} sex
 */
CharCreatev4.setAccountSex = function setAccountSex(sex) {
	_accountSex = sex;
};

/**
 * Once add to HTML, start rendering
 */
CharCreatev4.onAppend = function onAppend() {
	this._host.style.top = `${(Renderer.height - 342) / 2}px`;
	this._host.style.left = `${(Renderer.width - 576) / 2}px`;

	_chargen.render = true;
	_chargen.entity.set({
		sex: _accountSex,
		job: 0,
		head: 1,
		action: 0,
		direction: 5
	});

	_doram.render = true;
	_doram.entity.set({
		sex: _accountSex,
		job: 4218,
		head: 1,
		action: 0,
		direction: 5
	});

	_model.render = true;
	_model.entity.set({
		sex: 1,
		job: 0,
		head: 1,
		headpalette: 0,
		action: 0,
		direction: 4
	});

	const root = CharCreatev4.getRoot();
	const charNameInput = root.querySelector('#char_name');
	charNameInput.value = '';
	charNameInput.focus();

	// Set default race and gender
	_race = 'human';
	_gender = 'male';
	updateRace();
	cleanup();
	Renderer.render(render);
};

/**
 * Remove component from HTML
 * Stop rendering
 */
CharCreatev4.onRemove = function onRemove() {
	Renderer.stop(render);
};

/**
 * Key Handler
 *
 * @param {object} event
 * @return {boolean}
 */
CharCreatev4.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this._host.style.display !== 'none') {
		event.stopImmediatePropagation();
		cancel();
		return false;
	}

	return true;
};

/**
 * Update model hairstyle
 */
function updateHStyle(target) {
	const root = CharCreatev4.getRoot();
	const type = 'head';
	const value = parseInt(target.getAttribute('for'));

	_prevhead = _model.entity.head;
	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_hairstyle_normal.bmp`, dataURI => {
		const el = root.querySelector(`.style${_prevhead}`);
		if (el) {
			el.style.backgroundImage = `url(${dataURI})`;
		}
	});

	_curhead = value;

	updateCharacter(type, value);
}

/**
 * Update model haircolor
 */
function updateHColor(target) {
	const root = CharCreatev4.getRoot();
	const type = 'headpalette';
	const value = parseInt(target.getAttribute('for'));

	_prevcolor = _model.entity.headpalette;

	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/color0${parseInt(_prevcolor) + 1}_off.bmp`, dataURI => {
		const el = root.querySelector(`.cstyle0${_prevcolor}`);
		if (el) {
			el.style.backgroundImage = `url(${dataURI})`;
		}
	});

	_curcolor = value;

	updateCharacter(type, value);
}

/**
 * Update model race
 */
function updateRace() {
	const root = CharCreatev4.getRoot();
	const select = root.querySelector('.race:checked');
	const type = 'race';
	let value = 0;

	if (select && select.id === 'human_race') {
		Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/img_human_on.bmp`, dataURI => {
			root.querySelector('.human_label').style.backgroundImage = `url(${dataURI})`;
		});
		Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/img_doram_off.bmp`, dataURI => {
			root.querySelector('.doram_label').style.backgroundImage = `url(${dataURI})`;
		});
		value = 0;
	}

	if (select && select.id === 'doram_race') {
		Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/img_human_off.bmp`, dataURI => {
			root.querySelector('.human_label').style.backgroundImage = `url(${dataURI})`;
		});
		Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/img_doram_on.bmp`, dataURI => {
			root.querySelector('.doram_label').style.backgroundImage = `url(${dataURI})`;
		});
		value = 4218;
	}

	// In between changes of race, it needs to clear everything
	for (let i = 1; i <= 24; i++) {
		Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_hairstyle_normal.bmp`, dataURI => {
			const el = root.querySelector(`.style${i}`);
			if (el) {
				el.style.backgroundImage = `url(${dataURI})`;
			}
		});
	}

	// Reset Head
	_prevhead = 1;
	_curhead = 1;

	updateHstyleList(type, value);
	updateCharacter(type, value);
}

/**
 * Generic function to get a direct proxy to updateCharacter
 *
 * @param {string} type
 * @param {number} value
 */
function updateCharacterGeneric(type, value) {
	return () => {
		if (type === 'gender') {
			updateHstyleList(type, value);
		}
		updateCharacter(type, value);
	};
}

function updateHstyleList(type, value) {
	const root = CharCreatev4.getRoot();

	switch (type) {
		case 'gender':
			if (value === 1) {
				_gender = 'male';
			} else {
				_gender = 'female';
			}
			break;
		case 'race':
			if (value === 0) {
				_race = 'human';
			} else {
				_race = 'doram';
			}
			break;
	}

	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_male_off.bmp`, dataURI => {
		root.querySelector('#male_container').style.backgroundImage = `url(${dataURI})`;
	});
	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_female_off.bmp`, dataURI => {
		root.querySelector('#female_container').style.backgroundImage = `url(${dataURI})`;
	});

	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_${_gender}_on.bmp`, dataURI => {
		root.querySelector(`#${_gender}_container`).style.backgroundImage = `url(${dataURI})`;
	});

	// Hide everything first still
	root.querySelectorAll('.hair-style').forEach(el => {
		el.style.display = 'none';
	});

	// Show the correct one
	const hairStyleEl = root.querySelector(`#${_race}_${_gender}`);
	if (hairStyleEl) {
		hairStyleEl.style.display = 'block';
	}
}

/**
 * Send back informations to send the packet
 */
function create() {
	const root = CharCreatev4.getRoot();

	CharCreatev4.onCharCreationRequest(
		root.querySelector('#char_name').value,
		1,
		1,
		1,
		1,
		1,
		1,
		_model.entity.head,
		_model.entity.headpalette,
		_model.entity.job,
		_model.entity.sex
	);
}

function cleanup() {
	const root = CharCreatev4.getRoot();

	// Reset Default
	_race = 'human';
	_gender = 'male';
	_prevhead = 1;
	_curhead = 1;
	_prevcolor = 0;
	_curcolor = 0;

	const humanRace = root.querySelector('#human_race');
	if (humanRace) {
		humanRace.checked = true;
	}
	const maleInput = root.querySelector('#male');
	if (maleInput) {
		maleInput.checked = true;
	}
	root.querySelectorAll('.hstyle').forEach(el => {
		el.checked = false;
	});
	const defaultHstyle = root.querySelector('#1_human_male');
	if (defaultHstyle) {
		defaultHstyle.checked = true;
	}
	const defaultColor = root.querySelector('#0_color');
	if (defaultColor) {
		defaultColor.checked = true;
	}

	for (let i = 0; i <= 8; i++) {
		Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/color0${i + 1}_off.bmp`, dataURI => {
			const el = root.querySelector(`.cstyle0${i}`);
			if (el) {
				el.style.backgroundImage = `url(${dataURI})`;
			}
		});
	}

	updateCharacter('default', 0);
}

/**
 * Exit the window
 */
function cancel() {
	cleanup();
	CharCreatev4.onExitRequest();
}

/**
 * Update character hairstyle and haircolor
 *
 * @param {string} type (head or headpalette)
 * @param {number} increment (-1 or +1)
 */
function updateCharacter(type, increment) {
	switch (type) {
		case 'gender':
			_model.entity.sex = increment;
			break;

		case 'race':
			_model.entity.job = increment;
			_model.entity.head = 1;
			break;

		case 'direction':
			if (increment === 0) {
				_model.entity.direction = _model.entity.direction + 1;
			} else {
				_model.entity.direction = _model.entity.direction - 1;
			}
			break;

		case 'head':
			_prevhead = _model.entity.head;
			_model.entity.head = increment;
			break;

		case 'headpalette':
			_model.entity.headpalette = increment;
			break;

		case 'default':
			_model.entity.sex = 1;
			_model.entity.job = 0;
			_model.entity.head = 1;
			_model.entity.headpalette = 0;
			break;
	}
}

/**
 * Rendering the Character
 */
function render(tick) {
	const root = CharCreatev4.getRoot();

	if (_race === 'human') {
		if (_chargen.tick + 500 < tick) {
			_chargen.entity.set({
				action: 1,
				direction: 5
			});
			_chargen.tick = tick;
		}
	}

	// Rendering
	SpriteRenderer.bind2DContext(_chargen.ctx, 32, 115);
	_chargen.ctx.clearRect(0, 0, _chargen.ctx.canvas.width, _chargen.ctx.canvas.height);
	_chargen.entity.renderEntity();

	if (_race === 'doram') {
		if (_doram.tick + 500 < tick) {
			_doram.entity.set({
				action: 1,
				direction: 5
			});
			_doram.tick = tick;
		}
	}

	// Rendering
	SpriteRenderer.bind2DContext(_doram.ctx, 32, 115);
	_doram.ctx.clearRect(0, 0, _doram.ctx.canvas.width, _doram.ctx.canvas.height);
	_doram.entity.renderEntity();

	// Render the model
	SpriteRenderer.bind2DContext(_model.ctx, 32, 115);
	_model.ctx.clearRect(0, 0, _model.ctx.canvas.width, _model.ctx.canvas.height);
	_model.entity.renderEntity();

	root.querySelector('#char_name').focus();

	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/img_${_race}_on.bmp`, dataURI => {
		root.querySelector(`.${_race}_label`).style.backgroundImage = `url(${dataURI})`;
	});

	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_${_gender}_on.bmp`, dataURI => {
		root.querySelector(`#${_gender}_container`).style.backgroundImage = `url(${dataURI})`;
	});

	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/color0${parseInt(_curcolor) + 1}_on.bmp`, dataURI => {
		const el = root.querySelector(`.cstyle0${_curcolor}`);
		if (el) {
			el.style.backgroundImage = `url(${dataURI})`;
		}
	});

	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_hairstyle_normal.bmp`, dataURI => {
		const el = root.querySelector(`.style${_prevhead}`);
		if (el) {
			el.style.backgroundImage = `url(${dataURI})`;
		}
	});
	Client.loadFile(`${DB.INTERFACE_PATH}make_character_ver2/bt_hairstyle_select.bmp`, dataURI => {
		const el = root.querySelector(`.style${_curhead}`);
		if (el) {
			el.style.backgroundImage = `url(${dataURI})`;
		}
	});
}

/**
 * Callback to define
 */
CharCreatev4.onExitRequest = function OnExitRequest() {};

/**
 * Abstract callback to define
 */
CharCreatev4.onCharCreationRequest = function OnCharCreationRequest() {};

/**
 * Create componentand export it
 */
export default UIManager.addComponent(CharCreatev4);
