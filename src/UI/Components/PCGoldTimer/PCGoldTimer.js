/**
 * UI/Components/PCGoldTimer/PCGoldTimer.js
 *
 * PCGoldTimer Icon
 *
 * @author Alisonrag
 *
 */

import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './PCGoldTimer.html?raw';
import cssText from './PCGoldTimer.css?raw';
import PACKET from 'Network/PacketStructure.js';
import Network from 'Network/NetworkManager.js';
import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import Session from 'Engine/SessionStorage.js';

const MAX_GOLDPC_VAR = 300;

const _data = {
	isActive: 0,
	mode: 0,
	point: 0,
	playedTime: 0,
	backgroundImage: 'mileage_bg1.bmp'
};

/**
 * Create Component
 */
const PCGoldTimer = new UIComponent('PCGoldTimer', htmlText, cssText);

/**
 * Apply preferences once append to body
 */
PCGoldTimer.onAppend = function OnAppend() {
	// set background image
	Client.loadFile(
		DB.INTERFACE_PATH + 'basic_interface/' + _data.backgroundImage,
		function (url) {
			this.ui.find('.container').css('backgroundImage', 'url(' + url + ')');
		}.bind(this)
	);

	if (_data.isActive === 1 || Session.PCGoldTimer) {
		if (_data.isActive !== 1) {
			this.setData(Session.PCGoldTimer, true);
		}

		if (!this.timer) {
			// start timer
			this.startTimer();
		}

		// set on click event
		const container = this.ui.find('.container');
		container.on('click', onClickPCGoldTimer);
	} else {
		// stop timer
		this.stopTimer();

		// if ui is visible, hide it
		if (this.ui.is(':visible')) {
			this.ui.hide();
		}
	}
};

PCGoldTimer.toggle = function toggle() {
	// toggle ui visibility
	this.ui.toggle();
};

PCGoldTimer.setData = function setData(packet, refresh = false) {
	if (!refresh) {
		_data.startTime = Date.now();
	} else {
		_data.startTime = Session.PCGoldTimer.startTime;
	}
	if (_data.point === MAX_GOLDPC_VAR) {
		_data.startTime = -_data.startTime;
	}
	// set packet data to _data
	_data.isActive = packet.isActive ? packet.isActive : 0;
	_data.mode = packet.mode ? packet.mode : 0;
	_data.point = packet.point ? packet.point : 0;
	_data.playedTime = packet.playedTime ? packet.playedTime : 0;
	_data.backgroundImage = packet.mode == 1 ? 'mileage_bg1.bmp' : 'mileage_bg2.bmp';
	Session.PCGoldTimer = _data;
};

function onClickPCGoldTimer() {
	// send CZ_DYNAMICNPC_CREATE_REQUEST packet to server
	const packet = new PACKET.CZ.DYNAMICNPC_CREATE_REQUEST();
	packet.name = 'GOLDPCCAFE';
	Network.sendPacket(packet);
}

PCGoldTimer.startTimer = function startTimer() {
	// set Timer to update ui information every 1 second
	this.timer = setInterval(
		function () {
			// timer display how many time is missing to reach 00:00 from 60:00
			const millisecondsMissing = 60 * 60 * 1000 - (Date.now() - _data.startTime + _data.playedTime * 1000);
			let text = this.formatTime(millisecondsMissing);

			if (text.includes('-')) {
				text = '00:00';
				_data.point = Math.min(_data.point, MAX_GOLDPC_VAR);
				if (_data.point === MAX_GOLDPC_VAR) {
					text = '----:----';
				}
			}

			this.ui.find('.timer-text-value').text(text);
			this.ui.find('.total-points-value').text(_data.point);
		}.bind(this),
		1000
	);
};

PCGoldTimer.stopTimer = function stopTimer() {
	// stop timer
	if (this.timer) {
		clearInterval(this.timer);
		this.timer = null;
	}
};

PCGoldTimer.onRemove = function onRemove() {
	// stop timer
	this.stopTimer();
};

PCGoldTimer.formatTime = function formatTime(millisecondsMissing) {
	// format time to 00:00
	const minutes = Math.floor((millisecondsMissing % 3600000) / 60000);
	const seconds = Math.floor((millisecondsMissing % 60000) / 1000);
	return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
};

PCGoldTimer.needFocus = false;

/**
 * Create component and export it
 */
export default UIManager.addComponent(PCGoldTimer);
