/**
 * Engine/MapEngine/PrivateMessage.js
 *
 * Manage Entity based on received packets from server
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function (require) {
	'use strict';

	/**
	 * Load dependencies
	 */
	var DB = require('DB/DBManager');
	var Friends = require('Engine/MapEngine/Friends');
	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var ChatBox = require('UI/Components/ChatBox/ChatBox');
	var WhisperBox = require('UI/Components/WhisperBox/WhisperBox');
	var Session = require('Engine/SessionStorage');
	var Preferences = require('Core/Preferences');
	var PACKETVER = require('Network/PacketVerManager');

	/**
	 * Check if WhisperBox should be used for a specific nickname
	 *
	 * @param {string} nickname
	 * @returns {boolean}
	 */
	function getShouldOpenWhisperBox(nickname) {
		if (PACKETVER.value < 20090617) {
			return false;
		}

		if (WhisperBox.instances[nickname]) {
			return true;
		}

		var prefs = WhisperBox.preferences;

		var isFriend = Friends.isFriend(nickname);
		return (isFriend && prefs.open1to1Friend) || (!isFriend && prefs.open1to1Stranger);
	}

	/**
	 * Main Player received PM
	 *
	 * @param {object} pkt - PACKET.ZC.WHISPER
	 */
	function onPrivateMessage(pkt) {
		var isFriend = Friends.isFriend(pkt.sender);
		var prefix = isFriend ? DB.getMessage(102) : 'From';
		var msg = pkt.msg.replace(/\|\d{2}/, '');

		// Use WhisperBox if open or allowed by settings (version dependent)
		if (getShouldOpenWhisperBox(pkt.sender)) {
			WhisperBox.addText(pkt.sender, pkt.sender + ' : ' + msg, '#b5deef');
			ChatBox.saveNickName(pkt.sender);
			return;
		}

		// Fallback to main ChatBox
		ChatBox.addText(
			'[ ' + prefix + ' <span class="nickname-link" data-nickname="' + pkt.sender + '" style="cursor:pointer; text-decoration:underline;">' + pkt.sender + '</span> ] : ' + msg,
			ChatBox.TYPE.PRIVATE,
			ChatBox.FILTER.WHISPER
		);
		ChatBox.saveNickName(pkt.sender);
	}

	/**
	 * Received data from a sent private message
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_WHISPER
	 */
	function onPrivateMessageSent(pkt) {
		var user = ChatBox.PrivateMessageStorage.nick;
		var msg = ChatBox.PrivateMessageStorage.msg;

		if (pkt.result === 0) {
			if (user && msg) {
				if (getShouldOpenWhisperBox(user)) {
					WhisperBox.addText(user, Session.Character.name + ' : ' + msg, '#ffff00');
				} else {
					ChatBox.addText('[ To <span class="nickname-link" data-nickname="' + user + '" style="cursor:pointer; text-decoration:underline;">' + user + '</span> ] : ' + msg, ChatBox.TYPE.PRIVATE, ChatBox.FILTER.WHISPER);
				}
			}
		} else {
			var errorMsg = '(' + user + ') : ' + DB.getMessage(147 + pkt.result);
			ChatBox.addText(errorMsg, ChatBox.TYPE.PRIVATE, ChatBox.FILTER.WHISPER);
		}

		ChatBox.PrivateMessageStorage.nick = '';
		ChatBox.PrivateMessageStorage.msg = '';
	}

	/**
	 * Initialize
	 */
	return function PrivateMessageEngine() {
		Network.hookPacket(PACKET.ZC.WHISPER, onPrivateMessage);
		Network.hookPacket(PACKET.ZC.WHISPER2, onPrivateMessage);
		Network.hookPacket(PACKET.ZC.ACK_WHISPER, onPrivateMessageSent);
		Network.hookPacket(PACKET.ZC.ACK_WHISPER2, onPrivateMessageSent);

		// Hook WhisperBox outbound messages
		WhisperBox.onRequestTalk = function (nickname, text) {
			var pkt = new PACKET.CZ.WHISPER();
			pkt.receiver = nickname;
			pkt.msg = text;
			Network.sendPacket(pkt);

			// Save temporarily to handle ACK
			ChatBox.PrivateMessageStorage.nick = nickname;
			ChatBox.PrivateMessageStorage.msg = text;
		};
	};
});
