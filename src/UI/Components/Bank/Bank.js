/**
 * UI/Components/Bank/Bank.js
 *
 * Bank window
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import KEYS from 'Controls/KeyEventHandler.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './Bank.html?raw';
import cssText from './Bank.css?raw';
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
import NpcBox from 'UI/Components/NpcBox/NpcBox.js';
import NpcMenu from 'UI/Components/NpcMenu/NpcMenu.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import { DEPOSITAR, RECUSA, SACAR, quantiaDoPedido } from './quantiaDoBanco.js';
/**
 * Create Component
 */
const Bank = new GUIComponent('Bank', cssText);

/**
 * Render HTML
 */
Bank.render = () => htmlText;

/* Janela entra/sai com a animacao unica (Fase 3, 01/09/2026). */
Bank.riAnimaJanela = true;

/**
 * @var {Preferences} structure
 */
const _preferences = Preferences.get(
	'Bank',
	{
		x: 230,
		y: 295
	},
	2.0
);

/**
 * Initialize UI
 */
Bank.init = function init() {
	const root = this.getRoot();
	let isMax = false;
	const inputDepo = root.querySelector('.depo');

	this.draggable();

	root.querySelector('.plus').addEventListener('click', () => {
		if (isMax || inputDepo.value === '') {
			inputDepo.value = 1;
		} else {
			inputDepo.value = parseInt(inputDepo.value) + 1;
		}
		isMax = false;
		inputDepo.select();
	});

	root.querySelector('.minus').addEventListener('click', () => {
		if (isMax || inputDepo.value === '') {
			inputDepo.value = 0;
		} else {
			inputDepo.value = Math.max(parseInt(inputDepo.value) - 1, 0);
		}
		isMax = false;
		inputDepo.select();
	});

	root.querySelector('.max').addEventListener('click', () => {
		isMax = true;
		inputDepo.value = 'MAX';
		inputDepo.select();
	});

	root.querySelector('.tenmil').addEventListener('click', () => {
		isMax = false;
		inputDepo.value = addValueToInput(inputDepo.value, 10000000);
		inputDepo.select();
	});

	root.querySelector('.onemil').addEventListener('click', () => {
		isMax = false;
		inputDepo.value = addValueToInput(inputDepo.value, 1000000);
		inputDepo.select();
	});

	root.querySelector('.hundtsn').addEventListener('click', () => {
		isMax = false;
		inputDepo.value = addValueToInput(inputDepo.value, 100000);
		inputDepo.select();
	});

	function addValueToInput(inputValue, addValue) {
		if (isMax && inputValue === 'MAX') {
			return 'MAX';
		}
		const currentValue = parseInt(inputValue) || 0;
		if (!isMax) {
			return currentValue + addValue;
		}
	}

	root.querySelector('.deposit').addEventListener('click', () => {
		sendDepositRequest(inputDepo.value);
	});

	root.querySelector('.withdraw').addEventListener('click', () => {
		sendWithdrawRequest(inputDepo.value);
	});

	root.querySelector('.close').addEventListener('click', reqCloseBank);

	inputDepo.addEventListener('click', () => {
		inputDepo.select();
	});
};

/**
 * O AVISO DE CADA RECUSA (D-2307): [mensagem curta na janela, linha no chat].
 *
 * As do campo (vazio, letra, <= 0, acima do teto) sao as que `CheckValue`
 * sempre deu. As do saldo sao as que o SERVIDOR daria ao mesmo pedido
 * (`Engine/MapEngine/Bank.js`: deposito motivo 2 e 3, saque motivo 1) - a
 * janela passa a recusar antes, e o jogador ve o mesmo aviso de antes. O
 * saque que estoura a mao segue com o aviso que a janela ja dava.
 * `saldo-ilegivel` nao esta aqui de proposito: sai calado.
 */
const AVISO_DA_RECUSA = {
	[RECUSA.VAZIO]: () => [2781, 2779],
	[RECUSA.NAO_NUMERICO]: () => [2782, 2488],
	[RECUSA.NAO_POSITIVO]: () => [2784, 2769],
	[RECUSA.ACIMA_DO_TETO]: () => [2783, 2768],
	[RECUSA.SEM_SALDO]: operacao => (operacao === DEPOSITAR ? [2785, 2770] : [2786, 2455]),
	[RECUSA.ACIMA_DO_SALDO]: operacao => (operacao === DEPOSITAR ? [2780, 2456] : [2786, 2455]),
	[RECUSA.ESTOURA_O_COFRE]: () => [2783, 2787],
	[RECUSA.ESTOURA_A_MAO]: () => [2787, 2459]
};

/**
 * O saldo do cofre como NUMERO, guardado de quem o recebeu do servidor
 * (`updateBankDisplay`). Antes o "MAX" o relia do texto da tela, que esta no
 * formato do locale (D-2307). `null` = ainda nao veio.
 */
let _saldoNoCofre = null;

/**
 * Pede ao cofre: so sai pacote com a quantia que `quantiaDoPedido` aprovou
 * (inteiro finito > 0, ate o saldo). Recusa = o aviso de `AVISO_DA_RECUSA` e o
 * campo limpo, como a janela sempre fez nas recusas dela.
 */
function pedirAoCofre(operacao, entrada) {
	const root = Bank.getRoot();
	const input = root.querySelector('.depo');
	const decisao = quantiaDoPedido({
		operacao,
		entrada,
		zenyNaMao: Session.zeny,
		saldoNoCofre: _saldoNoCofre
	});

	if ('recusa' in decisao) {
		const aviso = AVISO_DA_RECUSA[decisao.recusa];
		if (aviso) {
			const [curta, noChat] = aviso(operacao);
			const error = root.querySelector('.errorupdate');
			if (error) {
				error.textContent = DB.getMessage(curta);
			}
			ChatBox.addText(DB.getMessage(noChat), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
		}
		input.value = '';
		return;
	}

	const pkt = operacao === DEPOSITAR ? new PACKET.CZ.REQ_BANKING_DEPOSIT() : new PACKET.CZ.REQ_BANKING_WITHDRAW();
	pkt.AID = Session.AID;
	pkt.money = decisao.quantia;
	Network.sendPacket(pkt);

	input.value = '';
}

/**
 * Send Request to server to deposit
 */
function sendDepositRequest(value) {
	pedirAoCofre(DEPOSITAR, value);
}

/**
 * Send Request to server to withdraw
 */
function sendWithdrawRequest(value) {
	pedirAoCofre(SACAR, value);
}

/**
 * Append to body
 */
Bank.onAppend = function onAppend() {
	const root = this.getRoot();

	this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - this._host.offsetHeight) + 'px';
	this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - this._host.offsetWidth) + 'px';

	const input = root.querySelector('.depo');
	input.value = '';
	input.focus();
};

/**
 * Key Handler
 */
Bank.onKeyDown = function onKeyDown(event) {
	if (InputBox._host && InputBox._host.style.display !== 'none' && InputBox.__active) {
		return true;
	}

	if (NpcMenu._host && NpcMenu._host.style.display !== 'none' && NpcMenu.__active) {
		return true;
	}

	if (NpcBox._host && NpcBox._host.style.display !== 'none' && NpcBox.__active) {
		return true;
	}

	if (this.isEditableFocused()) {
		if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
			reqCloseBank();
			event.stopImmediatePropagation();
			return false;
		}
		if (event.which === KEYS.ENTER) {
			event.stopImmediatePropagation();
			return false;
		}
		event.stopImmediatePropagation();
		return true;
	}

	if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
		reqCloseBank();
		event.stopImmediatePropagation();
		return false;
	}

	return true;
};

/**
 * Process shortcut
 */
Bank.onShortCut = function onShortCut(key) {
	switch (key.cmd) {
		case 'TOGGLE':
			this.toggle();
			break;
	}
};

/**
 * Request to toggle open/close bank
 */
Bank.toggle = function toggle() {
	if (!Bank.__active) {
		reqOpenBank();
	} else {
		reqCloseBank();
	}
};

/**
 * Request to open bank
 */
function reqOpenBank() {
	const pkt = new PACKET.CZ.REQ_BANK_OPEN();
	pkt.AID = Session.AID;
	Network.sendPacket(pkt);
}

/**
 * Request to close bank
 */
function reqCloseBank() {
	const pkt = new PACKET.CZ.REQ_BANK_CLOSE();
	pkt.AID = Session.AID;
	Network.sendPacket(pkt);
}

/**
 * Remove Bank from window
 */
Bank.onRemove = function onRemove() {
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.save();
	_saldoNoCofre = null;

	const root = this.getRoot();
	const error = root.querySelector('.errorupdate');
	if (error) {
		error.textContent = '';
	}
};

/**
 * Public methods for Engine/MapEngine/Bank.js
 */
Bank.updateBankDisplay = function updateBankDisplay(bankMoney, handMoney) {
	const root = this.getRoot();
	const inbank = root.querySelector('.inbank.currency');
	const onhand = root.querySelector('.onhand.currency');
	// O numero, e nao o texto formatado, e o que o MAX usa (D-2307).
	_saldoNoCofre = bankMoney;
	if (inbank) {
		inbank.textContent = bankMoney.toLocaleString() + 'z';
	}
	if (onhand) {
		onhand.textContent = handMoney.toLocaleString() + 'z';
	}
};

Bank.setError = function setError(message) {
	const root = this.getRoot();
	const error = root.querySelector('.errorupdate');
	if (error) {
		error.textContent = message;
	}
};

Bank.clearError = function clearError() {
	const root = this.getRoot();
	const error = root.querySelector('.errorupdate');
	if (error) {
		error.textContent = '';
	}
};

Bank.clearInput = function clearInput() {
	const root = this.getRoot();
	const input = root.querySelector('.depo');
	if (input) {
		input.value = '';
	}
};

Bank.focusInput = function focusInput() {
	const root = this.getRoot();
	const input = root.querySelector('.depo');
	if (input) {
		input.focus();
	}
};

Bank.getBankAmount = function getBankAmount() {
	const root = this.getRoot();
	const inbank = root.querySelector('.inbank.currency');
	if (inbank) {
		return inbank.textContent;
	}
	return '0z';
};

Bank.mouseMode = GUIComponent.MouseMode.STOP;
Bank.captureKeyEvents = true;
Bank.needFocus = true;

/**
 * Create component and export it
 */
export default UIManager.addComponent(Bank);
