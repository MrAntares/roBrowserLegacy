/**
 * Engine/MapEngine/Bank.js
 *
 * Manage Bank sockets
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import DB from 'DB/DBManager.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import Session from 'Engine/SessionStorage.js';
import Bank from 'UI/Components/Bank/Bank.js';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';

/**
 * Load dependencies
 */
/**
 * Engine namespace
 */
const BankEngine = {};

/**
 * Open Bank and request to server bank details
 */
function onOpenBank(pkt) {
	const send_pkt = new PACKET.CZ.REQ_BANKING_CHECK();
	send_pkt.AID = Session.AID;
	Network.sendPacket(send_pkt);
}

/**
 * Get bank informations
 *
 * @param {object} pkt - PACKET.ZC.BANKING_CHECK
 */
function onBankInfo(pkt) {
	if (!Bank.__active) {
		const inbank = Bank.ui.find('.inbank.currency');
		const onhand = Bank.ui.find('.onhand.currency');
		if (inbank) {
			inbank.text(formatNumberWithCommas(pkt.money) + 'z');
		}
		if (onhand) {
			onhand.text(formatNumberWithCommas(Session.zeny) + 'z');
		}
		Bank.append();
		Bank.ui.find('.depo').focus();
	}
}

/**
 * Close Bank
 */
function onBankClose() {
	if (Bank.__active) {
		Bank.remove();
	}
}

/**
 * Format currency with comma
 */
function formatNumberWithCommas(number) {
	// Use toLocaleString to add commas and format the number
	return number.toLocaleString();
}

/**
 * Get bank update from deposit
 *
 * @param {object} pkt - PACKET.ZC.ACK_BANKING_DEPOSIT
 */
function onBankDepoUpdate(pkt) {
	if (!pkt) {
		return;
	}

	const input = Bank.ui.find('.depo');
	const error = Bank.ui.find('.errorupdate');

	switch (pkt.reason) {
		case 0: // Success - we just update the bank currency visuals
			UpdateBank(pkt.money, Session.zeny);
			if (error) {
				error.empty();
			}
			break;
		case 1: // BDA_ERROR
			// No idea how to reproduce
			break;
		case 2: // BDA_NO_MONEY
			if (error) {
				error.text(DB.getMessage(2780));
			}
			ChatBox.addText(DB.getMessage(2456), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			break;
		case 3: // BDA_OVERFLOW
			if (error) {
				error.text(DB.getMessage(2783));
			}
			ChatBox.addText(DB.getMessage(2787), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			break;
		default:
			break;
	}

	if (input) {
		input.val('');
	}
}

/**
 * Update bank from deposit or withdrawal
 */
function UpdateBank(money, zeny) {
	const inbank = Bank.ui.find('.inbank.currency');
	const onhand = Bank.ui.find('.onhand.currency');
	if (inbank) {
		inbank.text(formatNumberWithCommas(money) + 'z');
	}
	if (onhand) {
		onhand.text(formatNumberWithCommas(zeny) + 'z');
	}
}

/**
 * Get bank update from withdrawal
 *
 * @param {object} pkt - PACKET.ZC.ACK_WITHDRAW
 */
function onBankWithdrawUpdate(pkt) {
	if (!pkt) {
		return;
	}

	const input = Bank.ui.find('.depo');
	const error = Bank.ui.find('.errorupdate');

	switch (pkt.reason) {
		case 0: // Success - we just update the bank currency visuals
			UpdateBank(pkt.money, Session.zeny);
			if (error) {
				error.empty();
			}
			if (input) {
				input.empty();
			}
			break;
		case 1: // BWA_NO_MONEY
			if (error) {
				error.text(DB.getMessage(2786));
			}
			ChatBox.addText(DB.getMessage(2455), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			break;
		case 2: // BWA_UNKNOWN_ERROR
			break;
		default:
			break;
	}
}

/**
 * Initialize
 */
BankEngine.init = function init() {
	Network.hookPacket(PACKET.ZC.ACK_OPEN_BANKING, onOpenBank);
	Network.hookPacket(PACKET.ZC.BANKING_CHECK, onBankInfo);
	Network.hookPacket(PACKET.ZC.ACK_BANKING_DEPOSIT, onBankDepoUpdate);
	Network.hookPacket(PACKET.ZC.ACK_BANKING_WITHDRAW, onBankWithdrawUpdate);
	Network.hookPacket(PACKET.ZC.ACK_CLOSE_BANKING, onBankClose);
};

/**
 * Initialize
 */
export default BankEngine;
