/**
 * UI/Components/CheckAttendance/CheckAttendance.js
 *
 * Manage interface for Attendance
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
	var DB = require('DB/DBManager');
	var Preferences = require('Core/Preferences');
	var Renderer = require('Renderer/Renderer');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var htmlText = require('text!./CheckAttendance.html');
	var cssText = require('text!./CheckAttendance.css');
	var jQuery = require('Utils/jquery');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');

	/**
	 * Create Component
	 */
	var CheckAttendance = new UIComponent('CheckAttendance', htmlText, cssText);

	/**
	 * @var {object} _checkAttendanceData
	 */
	var _checkAttendanceData;

	/**
	 * @var {object} _CheckAttendanceInfo
	 */
	var _CheckAttendanceInfo;

	/**
	 * @var {Preferences} structure
	 */
	var _preferences = Preferences.get(
		'CheckAttendance',
		{
			x: 200,
			y: 200
		},
		1.0
	);

	/**
	 * Initialize the component (event listener, etc.)
	 */
	CheckAttendance.init = function init() {
		// Avoid drag drop problems
		_CheckAttendanceInfo = DB.getCheckAttendanceInfo();
		this.ui.find('.base').mousedown(function (event) {
			event.stopImmediatePropagation();
			return false;
		});

		this.ui.find('.close-container-btn').click(CheckAttendance.onClose);
		this.draggable(this.ui.find('.titlebar'));
	};

	/**
	 * Once append to the DOM, start to position the UI
	 */
	CheckAttendance.onAppend = function onAppend() {
		this.ui.css({
			top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
			left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
		});

		if (!_preferences.show) {
			this.ui.hide();
		}

		if (_checkAttendanceData >= 0 && _CheckAttendanceInfo.Config) {
			CheckAttendance.updateUI();
			this.focus();
		} else {
			ChatBox.addText('Currently there is no attendance check event.', ChatBox.TYPE.ERROR | ChatBox.TYPE.SELF);
		}
	};

	/**
	 * Window Shortcuts
	 */
	CheckAttendance.onShortCut = function onShurtCut(key) {
		switch (key.cmd) {
			case 'TOGGLE':
				this.ui.toggle();
				if (this.ui.is(':visible')) {
					this.focus();
				}
				break;
		}
	};

	/**
	 * Show/Hide UI
	 */
	CheckAttendance.toggle = function toggle() {
		if (this.ui.is(':visible')) {
			this.ui.hide();
		} else {
			var _pkt = new PACKET.CZ.UI_OPEN();
			_pkt.UIType = 5;
			Network.sendPacket(_pkt);
		}
	};

	/**
	 * Set Data to Attendance
	 */
	CheckAttendance.setData = function setData(data) {
		_checkAttendanceData = data;
	};

	/**
	 * Update CheckAttendance UI
	 */
	CheckAttendance.updateUI = function updateUI() {
		let already_requested = 0;
		let attendance_count = 0;
		let current_day = 1;
		if (_CheckAttendanceInfo.Config) {
			var regex = /(\d{4})(\d{2})(\d{2})/;
			let start = regex.exec(_CheckAttendanceInfo.Config.StartDate);
			let end = regex.exec(_CheckAttendanceInfo.Config.EndDate);
			let period_string = `Event Period: From ${start[2]}/${start[3]} ~ Until ${end[2]}/${end[3]} (Month/Day) 24:00`;
			this.ui.find('.top-panel-period').html(period_string);

			if (_checkAttendanceData >= 0) {
				already_requested = _checkAttendanceData % 10;
				attendance_count = parseInt(_checkAttendanceData / 10);
				current_day = attendance_count + 1;
				let total_days_string =
					attendance_count >= 20 || already_requested
						? `${attendance_count} Day attendance success`
						: `Click the item to claim day ${current_day} reward`;

				let end_date = new Date(`${end[1]}-${end[2]}-${end[3]}`);
				let now_date = new Date();
				let remaining_days = Math.round(
					Math.abs((end_date.getTime() - now_date.getTime()) / (1000 * 3600 * 24))
				);

				this.ui.find('.total-days').html(total_days_string);
				this.ui.find('.remaining-day-text').html(remaining_days);
			}
		}

		if (_CheckAttendanceInfo.Rewards) {
			for (let i = 0; i < 20; i++) {
				let item = DB.getItemInfo(_CheckAttendanceInfo.Rewards[i].item_id);
				let day = i + 1;
				let background =
					!already_requested && day == current_day
						? 'data-background="check_attendance/bt_slot_a.bmp" data-down="check_attendance/bt_slot_press.bmp"'
						: '';
				let checked = day <= attendance_count ? 'checked' : 'checked-hidden';
				let slot_off = already_requested ? attendance_count - 1 : attendance_count;
				let slot_complete_string = day > slot_off ? 'bt_slot_complete' : 'bt_slot_off';
				let item_slot =
					'<li id="attendance_day_' +
					i +
					'" class="attendance-item"' +
					background +
					'>' +
					'<div class="item" data-background="' +
					DB.INTERFACE_PATH +
					'item/' +
					item.identifiedResourceName +
					'.bmp' +
					'">' +
					'<span class="item-quantity">' +
					_CheckAttendanceInfo.Rewards[i].quantity +
					'</span>' +
					'<span class="name">' +
					item.identifiedDisplayName +
					'</span>' +
					'<div class="' +
					checked +
					'" data-background="check_attendance/' +
					slot_complete_string +
					'.tga"></div>' +
					'</div>' +
					'<div class="day">' +
					day +
					' Day</div>' +
					'</li>';
				this.ui.find('.days-list').append(item_slot);
				if (!already_requested && day == current_day) {
					this.ui.find('#' + 'attendance_day_' + i).on('click', onClickAttendance);
					this.ui.find('#' + 'attendance_day_' + i).addClass('event_add_cursor');
				}
			}
		}

		this.ui.each(this.parseHTML).find('*').each(this.parseHTML);
	};

	/**
	 * Clean CheckAttendance UI
	 */
	CheckAttendance.cleanUI = function cleanUI() {
		CheckAttendance.ui.find('.top-panel-period').html('');
		CheckAttendance.ui.find('.days-list').empty('');
		CheckAttendance.ui.find('.total-days').html('');
		CheckAttendance.ui.find('.remaining-days-text').html('');
	};

	/**
	 * Close the window
	 */
	CheckAttendance.onClose = function onClose() {
		CheckAttendance.ui.hide();
	};

	/**
	 * Request Attendance Item
	 */
	function onClickAttendance(e) {
		// send reward request
		var toggle_element = jQuery(e.currentTarget);
		let id = toggle_element.attr('id');
		CheckAttendance.ui.find('#' + id + ' .checked-hidden').attr('class', 'checked');
		let completed_div = '<div class="completed" data-background="check_attendance/bt_slot_complete.tga"></div>';
		CheckAttendance.ui.find('#' + id).append(completed_div);
		let current_day = parseInt(_checkAttendanceData / 10) + 1;
		let total_days_string = `${current_day} Day attendance success`;
		CheckAttendance.ui.find('.total-days').html(total_days_string);
		var _pkt = new PACKET.CZ.REQ_CHECK_ATTENDANCE();
		Network.sendPacket(_pkt);
	}

	/**
	 * Export
	 */
	return UIManager.addComponent(CheckAttendance);
});
