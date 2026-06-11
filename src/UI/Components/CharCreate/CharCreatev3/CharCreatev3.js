/**
 * UI/Components/CharCreatev3/CharCreatev3.js
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
import htmlText from './CharCreatev3.html?raw';
import cssText from './CharCreatev3.css?raw';
import Client from 'Core/Client.js';

/**
 * Create Chararacter Selection namespace
 */
const CharCreatev3 = new GUIComponent('CharCreatev3', cssText);

CharCreatev3.render = () => htmlText;

/**
 * @var {boolean} account sex
 */
let _accountSex = 0;

const TYPE = {
	RACE: 1,
	GENDER: 2,
	HEAD: 3,
	HEADPALETTE: 4,
	DIRECTION: 5,
	DEFAULT: -1
};

const GENDER = {
	FEMALE: 0,
	MALE: 1
};

const RACE = {
	HUMAN: 0,
	DORAM: 4218
};

const DIRECTION = {
	LEFT: 1,
	RIGHT: -1
};

const VALUE = {
	INCREASE: 1,
	DECREASE: -1
};

const CAP = {
	[RACE.HUMAN]: {
		HEAD: {
			MIN: 1,
			MAX: 29
		},
		HEADPALETTE: {
			MIN: 0,
			MAX: 8
		}
	},
	[RACE.DORAM]: {
		HEAD: {
			MIN: 1,
			MAX: 6
		},
		HEADPALETTE: {
			MIN: 0,
			MAX: 7
		}
	}
};

const RACE_MARK = `${DB.INTERFACE_PATH}make_character/select_mark_cha_create.bmp`;

/**
 * @var {object} chargen info
 */
const _human = {
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
CharCreatev3.init = function init() {
	const root = this.getRoot();
	_human.ctx = root.querySelector('#canvas_human').getContext('2d');
	_doram.ctx = root.querySelector('#canvas_doram').getContext('2d');
	_model.ctx = root.querySelector('#canvas_model').getContext('2d');

	this.draggable();

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
	root.querySelector('.race_select #human').addEventListener('click', () => {
		updateCharacter(TYPE.RACE, RACE.HUMAN);
	});
	root.querySelector('.race_select #doram').addEventListener('click', () => {
		updateCharacter(TYPE.RACE, RACE.DORAM);
	});

	root.querySelector('#style .rot_left').addEventListener('click', () => {
		updateCharacter(TYPE.DIRECTION, DIRECTION.LEFT);
	});
	root.querySelector('#style .rot_right').addEventListener('click', () => {
		updateCharacter(TYPE.DIRECTION, DIRECTION.RIGHT);
	});

	root.querySelector('#style .gender .button.male').addEventListener('click', () => {
		updateCharacter(TYPE.GENDER, GENDER.MALE);
	});
	root.querySelector('#style .gender .button.female').addEventListener('click', () => {
		updateCharacter(TYPE.GENDER, GENDER.FEMALE);
	});

	root.querySelector('#style .hairstyle .left').addEventListener('click', () => {
		updateCharacter(TYPE.HEAD, VALUE.DECREASE);
	});
	root.querySelector('#style .hairstyle .right').addEventListener('click', () => {
		updateCharacter(TYPE.HEAD, VALUE.INCREASE);
	});

	root.querySelector('#style .haircolor .left').addEventListener('click', () => {
		updateCharacter(TYPE.HEADPALETTE, VALUE.DECREASE);
	});
	root.querySelector('#style .haircolor .right').addEventListener('click', () => {
		updateCharacter(TYPE.HEADPALETTE, VALUE.INCREASE);
	});

	const charNameInput = root.querySelector('#char_name');
	charNameInput.addEventListener('click', event => {
		charNameInput.focus();
		event.stopImmediatePropagation();
	});

	root.querySelector('.button.close').addEventListener('click', cancel);
	root.querySelector('.button.make').addEventListener('click', create);

	/* Msgstring Texts */
	root.querySelector('.race_select .human .title').textContent = DB.getMessage(3017 - 1);
	root.querySelector('.race_select .human .desc').textContent = DB.getMessage(3021 - 1);
	root.querySelector('.race_select .human .jobs').textContent = DB.getMessage(3018 - 1);

	root.querySelector('.race_select .doram .title').textContent = DB.getMessage(3019 - 1);
	root.querySelector('.race_select .doram .desc').textContent = DB.getMessage(3022 - 1);
	root.querySelector('.race_select .doram .jobs').textContent = DB.getMessage(3020 - 1);
};

/**
 * Setter for AccountSex
 *
 * @param {number} sex
 */
CharCreatev3.setAccountSex = function setAccountSex(sex) {
	_accountSex = sex;
};

/**
 * Once add to HTML, start rendering
 */
CharCreatev3.onAppend = function onAppend() {
	this._host.style.top = `${(Renderer.height - 342) / 2}px`;
	this._host.style.left = `${(Renderer.width - 576) / 2}px`;

	_human.entity.set({
		sex: _accountSex,
		job: RACE.HUMAN,
		head: 1,
		action: 0,
		direction: 5
	});
	_human.render = true;

	_doram.entity.set({
		sex: _accountSex,
		job: RACE.DORAM,
		head: 1,
		action: 0,
		direction: 5
	});
	_doram.render = true;

	_model.entity.set({
		sex: GENDER.MALE,
		job: RACE.HUMAN,
		head: 1,
		headpalette: 0,
		action: 0,
		direction: 4
	});
	_model.render = true;

	const root = this.getRoot();
	const charNameInput = root.querySelector('#char_name');
	charNameInput.value = '';
	charNameInput.focus();

	// Set default race and gender
	setDefault();
	Renderer.render(render);
};

/**
 * Remove component from HTML
 * Stop rendering
 */
CharCreatev3.onRemove = function onRemove() {
	Renderer.stop(render);
};

/**
 * Key Handler
 *
 * @param {object} event
 * @return {boolean}
 */
CharCreatev3.onKeyDown = function onKeyDown(event) {
	if ((event.which === KEYS.ESCAPE || event.key === 'Escape') && this._host.style.display !== 'none') {
		event.stopImmediatePropagation();
		cancel();
		return false;
	}

	return true;
};

/**
 * Send back informations to send the packet
 */
function create() {
	const root = CharCreatev3.getRoot();
	const charname = root.querySelector('#char_name').value;

	CharCreatev3.onCharCreationRequest(
		charname,
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

function setDefault() {
	updateCharacter(TYPE.DEFAULT, 0);
}

/**
 * Exit the window
 */
function cancel() {
	setDefault();
	CharCreatev3.onExitRequest();
}

/**
 * Update character hairstyle and haircolor
 *
 * @param {string} type (head or headpalette)
 * @param {number} value
 */
function updateCharacter(type, value) {
	const root = CharCreatev3.getRoot();

	switch (type) {
		case TYPE.GENDER:
			_model.entity.sex = value;

			if (_model.entity.sex == GENDER.MALE) {
				Client.loadFile(`${DB.INTERFACE_PATH}make_character/btn_gender_m_press.bmp`, dataURI => {
					root.querySelector('#male_container').style.backgroundImage = `url(${dataURI})`;
				});
				Client.loadFile(`${DB.INTERFACE_PATH}make_character/btn_gender_f_out.bmp`, dataURI => {
					root.querySelector('#female_container').style.backgroundImage = `url(${dataURI})`;
				});
			} else {
				Client.loadFile(`${DB.INTERFACE_PATH}make_character/btn_gender_m_out.bmp`, dataURI => {
					root.querySelector('#male_container').style.backgroundImage = `url(${dataURI})`;
				});
				Client.loadFile(`${DB.INTERFACE_PATH}make_character/btn_gender_f_press.bmp`, dataURI => {
					root.querySelector('#female_container').style.backgroundImage = `url(${dataURI})`;
				});
			}
			break;

		case TYPE.RACE:
			_model.entity.job = value;
			_model.entity.head = 1;

			if (_model.entity.job === RACE.HUMAN) {
				Client.loadFile(RACE_MARK, dataURI => {
					root.querySelector('.race_select .human label').style.backgroundImage = `url(${dataURI})`;
				});
				root.querySelector('.race_select .doram label').style.backgroundImage = 'none';
			} else {
				root.querySelector('.race_select .human label').style.backgroundImage = 'none';
				Client.loadFile(RACE_MARK, dataURI => {
					root.querySelector('.race_select .doram label').style.backgroundImage = `url(${dataURI})`;
				});
			}

			break;

		case TYPE.DIRECTION:
			_model.entity.direction += value;
			break;

		case TYPE.HEAD: {
			let headval = _model.entity.head + value;
			if (headval > CAP[_model.entity.job].HEAD.MAX) {
				headval = CAP[_model.entity.job].HEAD.MIN;
			}
			if (headval < CAP[_model.entity.job].HEAD.MIN) {
				headval = CAP[_model.entity.job].HEAD.MAX;
			}
			_model.entity.head = headval;
			break;
		}

		case TYPE.HEADPALETTE: {
			let headpaletteval = _model.entity.headpalette + value;
			if (headpaletteval > CAP[_model.entity.job].HEADPALETTE.MAX) {
				headpaletteval = CAP[_model.entity.job].HEADPALETTE.MIN;
			}
			if (headpaletteval < CAP[_model.entity.job].HEADPALETTE.MIN) {
				headpaletteval = CAP[_model.entity.job].HEADPALETTE.MAX;
			}
			_model.entity.headpalette = headpaletteval;
			break;
		}

		case TYPE.DEFAULT:
			updateCharacter(TYPE.RACE, RACE.HUMAN);
			updateCharacter(TYPE.GENDER, GENDER.MALE);
			_model.entity.headpalette = 0;
			break;
	}
}

/**
 * Rendering the Character
 */
function render(tick) {
	if (_model.entity.job === RACE.HUMAN) {
		if (_human.tick + 500 < tick) {
			_human.entity.set({
				action: 1,
				direction: 5
			});
			_human.tick = tick;
		}
	}

	// Rendering
	SpriteRenderer.bind2DContext(_human.ctx, 32, 115);
	_human.ctx.clearRect(0, 0, _human.ctx.canvas.width, _human.ctx.canvas.height);
	_human.entity.renderEntity();

	if (_model.entity.job === RACE.DORAM) {
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

	const root = CharCreatev3.getRoot();
	root.querySelector('#char_name').focus();
}

/**
 * Callback to define
 */
CharCreatev3.onExitRequest = function OnExitRequest() {};

/**
 * Abstract callback to define
 */
CharCreatev3.onCharCreationRequest = function OnCharCreationRequest() {};

/**
 * Create componentand export it
 */
export default UIManager.addComponent(CharCreatev3);
