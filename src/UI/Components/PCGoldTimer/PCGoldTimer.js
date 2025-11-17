/**
 * UI/Components/PCGoldTimer/PCGoldTimer.js
 *
 * PCGoldTimer Icon
 *
 * @author Alisonrag
 *
 */
define(function (require) {
	"use strict";

	/**
	 * Dependencies
	 */
	var UIManager = require("UI/UIManager");
	var UIComponent = require("UI/UIComponent");
	var htmlText = require("text!./PCGoldTimer.html");
	var cssText = require("text!./PCGoldTimer.css");
	var PACKET      = require("Network/PacketStructure");
	var Network     = require("Network/NetworkManager");
	var Client      = require("Core/Client");
	var DB          = require("DB/DBManager");


	var _data = {
		isActive: 0,
		mode: 0,
		point: 0,
		playedTime: 0,
		backgroundImage: "mileage_bg1.bmp"
	}

	/**
	 * Create Component
	 */
	var PCGoldTimer = new UIComponent("PCGoldTimer", htmlText, cssText);

	/**
	 * Apply preferences once append to body
	 */
	PCGoldTimer.onAppend = function OnAppend() {

		// set background image
		Client.loadFile(DB.INTERFACE_PATH + 'basic_interface/'+ _data.backgroundImage, function(url){
			this.ui.find('.container').css('backgroundImage', 'url('+ url +')');
		}.bind(this));

		if(_data.isActive == 1) {

			if(!this.timer) {
				// start timer
				this.startTimer();
			}

			// set on click event
			let container = this.ui.find(".container");
			container.on("click", onClickPCGoldTimer);
		}
		else {
			// stop timer
			this.stopTimer();

			// if ui is visible, hide it
			if(this.ui.is(":visible")) {
				this.ui.hide();
			}
		}
	};

	PCGoldTimer.toggle = function toggle() {
		// toggle ui visibility
		this.ui.toggle();
	};

	PCGoldTimer.setData = function setData(packet) {
		// set packet data to _data
		_data.isActive = packet.isActive ? packet.isActive : 0;
		_data.mode = packet.mode ? packet.mode : 0;
		_data.point = packet.point ? packet.point : 0;
		_data.playedTime = packet.playedTime ? packet.playedTime : 0;
		_data.backgroundImage = packet.mode == 1 ? "mileage_bg2.bmp" : "mileage_bg1.bmp";
		_data.startTime = Date.now();
	}

	function onClickPCGoldTimer() {
		// send CZ_DYNAMICNPC_CREATE_REQUEST packet to server
		var packet = new PACKET.CZ.DYNAMICNPC_CREATE_REQUEST();
		packet.name = "GOLDPCCAFE";
		Network.sendPacket(packet);
	}

	PCGoldTimer.startTimer = function startTimer() {
		// set Timer to update ui information every 1 second
		this.timer = setInterval(function() {
			let millisecondsSinceStart = (Date.now() - _data.startTime) + (_data.playedTime * 1000);
			let text = this.formatTime(millisecondsSinceStart);
			this.ui.find(".timer-text-value").text(text);
			this.ui.find(".total-points-value").text(_data.point);
		}.bind(this), 1000);
	}

	PCGoldTimer.stopTimer = function stopTimer() {
		// stop timer
		if(this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	PCGoldTimer.onRemove = function onRemove() {
		// stop timer
		this.stopTimer();
	}

	PCGoldTimer.formatTime = function formatTime(millisecondsSinceStart) {
		// format time to 00:00
		let minutes = Math.floor((millisecondsSinceStart % 3600000) / 60000);
		let seconds = Math.floor((millisecondsSinceStart % 60000) / 1000);
		return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
	}

	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(PCGoldTimer);
});
