/**
 * UI/Components/StatusIcons/StatusIcons.js
 *
 * Status Icons UI
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import StatusTable from 'DB/Status/StatusInfo.js';
import DB from 'DB/DBManager.js';
import jQuery from 'Utils/jquery.js';
import Texture from 'Utils/Texture.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import ScreenEffectManager from 'Renderer/ScreenEffectManager.js';
import cssText from './StatusIcons.css?raw';

/**
 * Create component
 */
const StatusIcons = new UIComponent('StatusIcons', null, cssText);

/**
 * Mouse can cross this UI
 */
StatusIcons.mouseMode = UIComponent.MouseMode.CROSS;

/**
 * @var {boolean} do not focus this UI
 */
StatusIcons.needFocus = false;

/**
 * @var {Array} status list
 */
let _status = {};

/**
 * @var {int} last updated time
 */
let _last_updated_time = Date.now();

/**
 * @var {int} render wait time
 */
const _render_time = 500;

/**
 * Initialize component
 */
StatusIcons.init = function init() {
	this.ui = jQuery('<div/>').attr('id', 'StatusIcons');
};

/**
 * Start rendering icons
 */
StatusIcons.onAppend = function onAppend() {
	Renderer.render(rendering);
};

/**
 * Stop rendering icons
 */
StatusIcons.onRemove = function onRemove() {
	Renderer.stop(rendering);
};

/**
 * Clean up component
 */
StatusIcons.clean = function clean() {
	this.ui.empty();
	_status = {};
	ScreenEffectManager.clean();
};

/**
 * Update icon on screen
 *
 * @param {number} status id
 * @param {number} enable/disable
 * @param {number} life time
 */
StatusIcons.update = function update(index, state, life) {
	// Not in DB, no icons...
	if (!(index in StatusTable) || !StatusTable[index].icon) {
		return;
	}

	// Remove it
	if (!state && (!life || life <= 0)) {
		removeElementIndex(index);
		resetElementsPosition();
		return;
	}

	// Intialize slot
	if (!(index in _status)) {
		createElement(index);
	}

	// Save tick for progressbar
	_status[index].start = Renderer.tick;
	_status[index].end = Renderer.tick + life;

	// 9999 means Infinity in official client (lol)
	if (life === 9999) {
		_status[index].end = Infinity;
	}

	// Image already loaded
	if (_status.img) {
		return;
	}

	// Load image
	Client.loadFile('data/texture/effect/' + StatusTable[index].icon, function (data) {
		Texture.load(data, function () {
			if (_status[index] && !_status[index].img) {
				addResizedStatusIcon(this, index);
			}
		});
	});

	ScreenEffectManager.parseStatus(index);
};

function addResizedStatusIcon(img, index) {
	if (img.width < 33 && img.height < 33) {
		_status[index].img = img;
		addElement(_status[index].element);
		return;
	}

	const canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 32;
	const ctx = canvas.getContext('2d');

	ctx.save();
	ctx.translate(0, 32); // Move to left
	ctx.scale(1, -1); // flip vertical  (official client does)

	// resize with scale
	const scale = Math.min(32 / img.width, 32 / img.height);
	const width = img.width * scale;
	const height = img.height * scale;
	const x = (32 - width) / 2;
	const y = (32 - height) / 2;

	ctx.drawImage(img, x, y, width, height);
	ctx.restore();

	const resizedImg = new Image();
	resizedImg.src = canvas.toDataURL();
	resizedImg.onload = function () {
		_status[index].img = resizedImg;
		addElement(_status[index].element);
	};
}

/**
 * Reset elements position.
 *
 * Used when one element is removed.
 */
function resetElementsPosition() {
	let element, i, count, x, y;
	const elements = StatusIcons.ui.find('.state');

	count = elements.length;
	x = 0;
	y = 0;

	for (i = 0; i < count; ++i, y += 36) {
		if (y > Renderer.height - 166) {
			y = 0;
			x += 45;
		}

		element = elements[i];
		element.style.top = y + 'px';
		element.style.right = x + 'px';
	}
}

/**
 * Remove an element from list and DOM
 *
 * @param {number} index
 */
function removeElementIndex(index) {
	if (!(index in _status)) {
		return;
	}

	const element = _status[index].element;

	if (element && element.parentNode) {
		element.parentNode.removeChild(element);
	}

	ScreenEffectManager.cleanStatusEffect(index);

	delete _status[index];
}

/**
 * Create an element
 *
 * @param {number} index
 */
function createElement(index) {
	let state, canvas;

	state = document.createElement('div');
	state.className = 'state';

	canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 32;

	state.appendChild(canvas);

	_status[index] = {};
	_status[index].element = state;
	_status[index].ctx = canvas.getContext('2d');

	// Add description
	if (StatusTable[index].descript) {
		let i, count, time;
		let info, lines;

		info = document.createElement('div');
		info.className = 'description';

		lines = StatusTable[index].descript;
		count = lines.length;

		for (i = 0; i < count; ++i) {
			const line = document.createElement('div');
			line.textContent = lines[i][0];

			// Custom color
			if (lines[i][1]) {
				line.style.color = lines[i][1];
			}

			// Time value
			line.innerHTML = line.innerHTML.replace('%s', '<span class="time">0</span>');
			info.appendChild(line);
		}

		time = info.getElementsByClassName('time');
		if (time.length) {
			_status[index].time = time[0];
			_status[index].timeTick = 0;
		}

		state.appendChild(info);
	}
}

/**
 * Add element to the list, helper for multi-column
 *
 * @param {CanvasElement}
 */
function addElement(element) {
	let x, y, count;
	const elements = StatusIcons.ui.find('.state');
	const max = ((Renderer.height - 166) / 36) | 0;

	count = elements.length;
	x = ((count / max) | 0) * 45;
	y = (count % max) * 36;

	element.style.top = y + 'px';
	element.style.right = x + 'px';

	StatusIcons.ui.append(element);
}

/**
 * Rendering a status icon
 *
 * @param {object} status
 * @param {number} tick
 */
function renderStatus(status, now) {
	let start, end, perc;
	let color, ctx;

	if (!status.img) {
		return;
	}

	ctx = status.ctx;
	start = status.start;
	end = status.end;

	if (now > end) {
		end = now;
	}

	if (end < now + 60000) {
		color = 'rgba(255,150,50,0.65)';
		perc = 1 - (end - now) / 60000;
	} else {
		color = 'rgba(255,255,255,0.65)';
		perc = (now - start) / (end - 60000 - start);
	}

	ctx.clearRect(0, 0, 32, 32);
	ctx.drawImage(status.img, 0, 0);
	ctx.fillStyle = color;

	ctx.beginPath();
	ctx.arc(16, 16, 24, 1.5 * Math.PI, ((1.5 + perc * 2) % 2) * Math.PI);
	ctx.lineTo(16, 16);
	ctx.fill();

	if (status.time && status.timeTick + 1000 < now) {
		status.timeTick = now;

		const tick = ((end - now) / 1000) | 0;
		const seconds = tick % 60;
		const minutes = (tick / 60) | 0;

		status.time.textContent =
			now >= end || end === Infinity
				? ''
				: (minutes ? minutes + ' ' + DB.getMessage(1807, 'minute') + ' ' : '') +
					seconds +
					' ' +
					DB.getMessage(1808, 'second');
	}
}

/**
 * Rendering status icons progressbar
 *
 * @param {number} tick
 */
function rendering(tick) {
	let i, count;
	let indexes;

	indexes = Object.keys(_status);
	count = indexes.length;

	const time_now = Date.now();
	if (time_now - _last_updated_time > _render_time) {
		_last_updated_time = time_now;
		for (i = 0; i < count; ++i) {
			renderStatus(_status[indexes[i]], tick);
		}
	}
}

/**
 * Create component and return it
 */
export default UIManager.addComponent(StatusIcons);
