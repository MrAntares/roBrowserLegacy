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
		`[ ${ChatBox.escapeHTML(prefix)} <span class="nickname-link" data-nickname="${sender}" style="cursor:pointer; text-decoration:underline;">${sender}</span> ] : ${ChatBox.messageToHTML(msg)}`,
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
					`[ To <span class="nickname-link" data-nickname="${name}" style="cursor:pointer; text-decoration:underline;">${name}</span> ] : ${ChatBox.messageToHTML(msg)}`,
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
 * Result of a /ex or /in request
 *
 * @param {object} pkt - PACKET.ZC.SETTING_WHISPER_PC
 */
function onWhisperSettingResult(pkt) {
	// Every reply answers the oldest request, printed or not
	const name = ChatBox.PrivateMessageStorage.blockNicks.shift() || '';

	// A block that went through is not announced
	if (pkt.type > 1 || pkt.result > 2 || (pkt.type === 0 && pkt.result === 0)) {
		return;
	}

	const msg = DB.getMessage(193 + pkt.type * 3 + pkt.result);
	ChatBox.addText(`${name}${msg}`, ChatBox.TYPE.PRIVATE, ChatBox.FILTER.WHISPER);
}

/**
 * Result of a /exall or /inall request
 *
 * @param {object} pkt - PACKET.ZC.SETTING_WHISPER_STATE
 */
function onWhisperStateResult(pkt) {
	if (pkt.type > 1 || pkt.result > 1) {
		return;
	}

	ChatBox.addText(DB.getMessage(58 + pkt.type * 2 + pkt.result), ChatBox.TYPE.PRIVATE, ChatBox.FILTER.WHISPER);
}

/**
 * Received the whisper block list
 *
 * @param {object} pkt - PACKET.ZC.WHISPER_LIST
 */
function onWhisperList(pkt) {
	const list = pkt.wisperList;
	const count = list.length;

	ChatBox.addText(DB.getMessage(count ? 63 : 62), ChatBox.TYPE.BLUE, ChatBox.FILTER.WHISPER);

	for (let i = 0; i < count; ++i) {
		ChatBox.addText(list[i].name, ChatBox.TYPE.BLUE, ChatBox.FILTER.WHISPER);
	}
}

/**
 * Initialize
 */
export default function PrivateMessageEngine() {
	Network.hookPacket(PACKET.ZC.WHISPER, onPrivateMessage);
	Network.hookPacket(PACKET.ZC.WHISPER2, onPrivateMessage);
	Network.hookPacket(PACKET.ZC.ACK_WHISPER, onPrivateMessageSent);
	Network.hookPacket(PACKET.ZC.ACK_WHISPER2, onPrivateMessageSent);
	Network.hookPacket(PACKET.ZC.SETTING_WHISPER_PC, onWhisperSettingResult);
	Network.hookPacket(PACKET.ZC.SETTING_WHISPER_STATE, onWhisperStateResult);
	Network.hookPacket(PACKET.ZC.WHISPER_LIST, onWhisperList);

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
