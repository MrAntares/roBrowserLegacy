/**
 * Engine/MapEngine/PrivateMessage.js
 *
 * Manage Entity based on received packets from server
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Friends from 'Engine/MapEngine/Friends.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import WhisperBox from 'UI/Components/WhisperBox/WhisperBox.js';
import Session from 'Engine/SessionStorage.js';
import PACKETVER from 'Network/PacketVerManager.js';

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

	const prefs = WhisperBox.preferences;

	const isFriend = Friends.isFriend(nickname);
	return (isFriend && prefs.open1to1Friend) || (!isFriend && prefs.open1to1Stranger);
}

/**
 * Main Player received PM
 *
 * @param {object} pkt - PACKET.ZC.WHISPER
 */
function onPrivateMessage(pkt) {
	const isFriend = Friends.isFriend(pkt.sender);
	const prefix = isFriend ? DB.getMessage(102) : 'From';
	const msg = pkt.msg.replace(/\|\d{2}/, '');

	// Use WhisperBox if open or allowed by settings (version dependent)
	if (getShouldOpenWhisperBox(pkt.sender)) {
		WhisperBox.addText(pkt.sender, pkt.sender + ' : ' + msg, '#b5deef');
		ChatBox.saveNickName(pkt.sender);
		return;
	}

	// Fallback to main ChatBox
	const sender = ChatBox.escapeHTML(pkt.sender);
	ChatBox.addText(
		'[ ' +
			prefix +
			' <span class="nickname-link" data-nickname="' +
			sender +
			'" style="cursor:pointer; text-decoration:underline;">' +
			sender +
			'</span> ] : ' +
			ChatBox.messageToHTML(msg),
		ChatBox.TYPE.PRIVATE,
		ChatBox.FILTER.WHISPER,
		null,
		true
	);
	ChatBox.saveNickName(pkt.sender);
}

/**
 * Received data from a sent private message
 *
 * @param {object} pkt - PACKET.ZC.ACK_WHISPER
 */
function onPrivateMessageSent(pkt) {
	const user = ChatBox.PrivateMessageStorage.nick;
	const msg = ChatBox.PrivateMessageStorage.msg;

	if (pkt.result === 0) {
		if (user && msg) {
			if (getShouldOpenWhisperBox(user)) {
				WhisperBox.addText(user, Session.Entity.display.name + ' : ' + msg, '#ffff00');
			} else {
				const name = ChatBox.escapeHTML(user);
				ChatBox.addText(
					'[ To <span class="nickname-link" data-nickname="' +
						name +
						'" style="cursor:pointer; text-decoration:underline;">' +
						name +
						'</span> ] : ' +
						ChatBox.messageToHTML(msg),
					ChatBox.TYPE.PRIVATE,
					ChatBox.FILTER.WHISPER,
					null,
					true
				);
			}
		}
	} else {
		const errorMsg = '(' + user + ') : ' + DB.getMessage(147 + pkt.result);
		ChatBox.addText(errorMsg, ChatBox.TYPE.PRIVATE, ChatBox.FILTER.WHISPER);
	}

	ChatBox.PrivateMessageStorage.nick = '';
	ChatBox.PrivateMessageStorage.msg = '';
}

/**
 * Initialize
 */
export default function PrivateMessageEngine() {
	Network.hookPacket(PACKET.ZC.WHISPER, onPrivateMessage);
	Network.hookPacket(PACKET.ZC.WHISPER2, onPrivateMessage);
	Network.hookPacket(PACKET.ZC.ACK_WHISPER, onPrivateMessageSent);
	Network.hookPacket(PACKET.ZC.ACK_WHISPER2, onPrivateMessageSent);

	// Hook WhisperBox outbound messages
	WhisperBox.onRequestTalk = function (nickname, text) {
		const pkt = new PACKET.CZ.WHISPER();
		pkt.receiver = nickname;
		pkt.msg = text;
		Network.sendPacket(pkt);

		// Save temporarily to handle ACK
		ChatBox.PrivateMessageStorage.nick = nickname;
		ChatBox.PrivateMessageStorage.msg = text;
	};
}
