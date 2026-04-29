/**
 * UI/Components/PincodeWindow/PincodeWindow.js
 *
 * Pincode windows
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Disaml, AoShinHo
 */

import DB from 'DB/DBManager.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import htmlText from './PincodeWindow.html?raw';
import cssText from './PincodeWindow.css?raw';
import 'UI/Elements/Elements.js';

/**
 * Pincode Window namespace
 */
const PincodeWindow = new GUIComponent('PincodeWindow', cssText);

/**
 * Render HTML
 */
PincodeWindow.render = () => htmlText;

PincodeWindow.resetUI = function resetUI() {
	PincodeWindow._resetstate = 0;
	PincodeWindow._keypad = undefined;
	PincodeWindow._currentSeed = undefined;
	PincodeWindow.init();
};

PincodeWindow.getResetState = function getResetState() {
	return PincodeWindow._resetstate;
};

PincodeWindow.clearPin = function clearPin() {
	switch (PincodeWindow.sel_input) {
		case 1:
			PincodeWindow._newpass = '';
			break;
		default:
			PincodeWindow._pass = '';
			break;
		case 2:
			PincodeWindow._checkpass = '';
			break;
	}
};

PincodeWindow.resetPins = function resetPins() {
	PincodeWindow._pass = '';
	PincodeWindow._checkpass = '';
	PincodeWindow._newpass = '';
};

PincodeWindow.setUserSeed = function setUserSeed(value) {
	PincodeWindow._keypad = generateKeypad(value);
	PincodeWindow._currentSeed = new Uint32Array([value]);
};

function shuffleUsingKeypad(keypad) {
	const root = PincodeWindow._shadow || PincodeWindow._host;
	if (!root || !keypad) {
		return;
	}

	// Store original positions from CSS
	const originalPositions = {};
	for (let loc = 0; loc < 10; loc++) {
		const btn = root.querySelector('.btn.num' + loc);
		if (!btn) continue;
		originalPositions[loc] = {
			top: btn.offsetTop,
			left: btn.offsetLeft
		};
	}

	// Move buttons to their shuffled positions
	for (let loc = 0; loc < 10; loc++) {
		const d = keypad[loc];
		const btn = root.querySelector('.btn.num' + d);
		if (!btn || !originalPositions[loc]) continue;

		btn.style.top = originalPositions[loc].top + 'px';
		btn.style.left = originalPositions[loc].left + 'px';
	}
}

function advanceVisualSeed() {
	if (PincodeWindow._currentSeed !== undefined) {
		const multiplier = parseInt('0x3498', 16);
		const baseSeed = parseInt('0x881234', 16);
		PincodeWindow._currentSeed[0] = (baseSeed + PincodeWindow._currentSeed[0] * multiplier) >>> 0;
		const visualKeypad = generateKeypad(PincodeWindow._currentSeed[0]);
		shuffleUsingKeypad(visualKeypad);
	}
}

/**
 * Initialize UI
 */
PincodeWindow.init = function init() {
	const root = this._shadow || this._host;

	this._host.style.top = (Renderer.height - 358) / 2 + 'px';
	this._host.style.left = (Renderer.width - 576) / 2 + 'px';

	// Disable pass fields
	root.querySelector('.pass').disabled = true;
	root.querySelector('.newpass').disabled = true;
	root.querySelector('.checkpass').disabled = true;

	// Hide unused exit button
	root.querySelector('.btn2.unused').style.display = 'none';

	// Hide and disable verify button
	const verifyBtn = root.querySelector('.btn2.verify');
	verifyBtn.disabled = true;
	verifyBtn.style.display = 'none';

	// Enable and show change and ok buttons
	const changeBtn = root.querySelector('.btn2.change');
	const okBtn = root.querySelector('.btn2.ok');
	changeBtn.disabled = false;
	okBtn.disabled = false;
	okBtn.style.display = '';

	// Remove old listeners via cloneNode trick
	const panel = root.querySelector('.panel');
	const oldBtns = panel.querySelectorAll('.btn, .btn2, .numReset');
	oldBtns.forEach(btn => {
		const clone = btn.cloneNode(true);
		btn.parentNode.replaceChild(clone, btn);
	});

	// Re-query after cloneNode
	const cancelBtn = root.querySelector('.btn2.cancel');
	const okBtnNew = root.querySelector('.btn2.ok');
	const changeBtnNew = root.querySelector('.btn2.change');
	const verifyBtnNew = root.querySelector('.btn2.verify');
	const numResetBtn = root.querySelector('.numReset');

	// Bind number buttons
	for (let i = 0; i <= 9; i++) {
		const numBtn = root.querySelector('.btn.num' + i);
		if (numBtn) {
			const num = String(i);
			numBtn.addEventListener('click', () => keyNum(num));
		}
	}

	// Bind action buttons
	cancelBtn.addEventListener('click', cancel);
	okBtnNew.addEventListener('click', success);
	changeBtnNew.addEventListener('click', PincodeWindow.userChangePin);

	numResetBtn.addEventListener('click', () => {
		PincodeWindow.clearPin();
		advanceVisualSeed();
	});

	// Randomize position of num buttons
	if (PincodeWindow._keypad !== undefined) {
		shuffleUsingKeypad(PincodeWindow._keypad);
	}

	// Don't activate drag when clicking on buttons
	const baseBtn = root.querySelector('.titlebar .base');
	if (baseBtn) {
		baseBtn.addEventListener('mousedown', stopPropagation);
	}
	cancelBtn.addEventListener('mousedown', stopPropagation);
	okBtnNew.addEventListener('mousedown', stopPropagation);

	this.draggable('.titlebar');

	PincodeWindow.resetPins();
	PincodeWindow.selectInput(0);
};

/**
 * Once append to body
 */
PincodeWindow.onAppend = function onAppend() {
	Renderer.render(render);
	this.focus();
};

/**
 * Stop rendering
 */
PincodeWindow.onRemove = function onRemove() {
	Renderer.stop(render);
};

/**
 * Stop an event from propagating
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	event.preventDefault();
}

PincodeWindow.selectInput = function selectInput(selection) {
	PincodeWindow.sel_input = selection;
	const root = PincodeWindow._shadow || PincodeWindow._host;
	if (!root) return;

	const passEl = root.querySelector('.pass');
	const newpassEl = root.querySelector('.newpass');
	const checkpassEl = root.querySelector('.checkpass');
	if (!passEl) return;

	const active = '#87CEFA';
	const inactive = '#D3D3D3';

	switch (selection) {
		case 1:
			passEl.style.backgroundColor = inactive;
			checkpassEl.style.backgroundColor = inactive;
			newpassEl.style.backgroundColor = active;
			break;
		case 2:
			newpassEl.style.backgroundColor = inactive;
			passEl.style.backgroundColor = inactive;
			checkpassEl.style.backgroundColor = active;
			break;
		default:
			newpassEl.style.backgroundColor = inactive;
			checkpassEl.style.backgroundColor = inactive;
			passEl.style.backgroundColor = active;
			break;
	}
};

/**
 * Called by the parent when the result of the old pincode check is received from the server.
 */
PincodeWindow.onOldPincodeCheckResult = function onOldPincodeCheckResult(result) {
	if (result === true) {
		success();
	} else {
		UIManager.showMessageBox(DB.getMessage(1892), 'ok');
	}
};

/**
 * Called by the parent when we have received a pincode reset request from the server.
 */
PincodeWindow.onParentPincodeResetReq = function onParentPincodeResetReq() {
	const root = PincodeWindow._shadow || PincodeWindow._host;
	if (
		PincodeWindow._resetstate === 3 &&
		typeof PincodeWindow.onPincodeReset === 'function' &&
		PincodeWindow._pass != PincodeWindow._newpass &&
		PincodeWindow._newpass.length > 3 &&
		PincodeWindow._newpass.length < 7 &&
		PincodeWindow._newpass == PincodeWindow._checkpass
	) {
		success();
	} else {
		if (PincodeWindow._resetstate === 2) {
			if (PincodeWindow.sel_input === 0) {
				if (PincodeWindow._pass.length > 3 && PincodeWindow._pass.length < 7) {
					PincodeWindow.selectInput(1);
					advanceVisualSeed();
				} else {
					UIManager.showMessageBox(DB.getMessage(1887), 'ok');
					PincodeWindow.clearPin();
				}
			} else {
				if (
					PincodeWindow._newpass.length > 3 &&
					PincodeWindow._newpass.length < 7 &&
					PincodeWindow._pass != PincodeWindow._newpass
				) {
					PincodeWindow.selectInput(2);
					PincodeWindow.clearPin();
					PincodeWindow._resetstate = 3;

					const verifyBtn = root.querySelector('.btn2.verify');
					const okBtn = root.querySelector('.btn2.ok');
					verifyBtn.disabled = true;
					okBtn.disabled = false;
					verifyBtn.style.display = 'none';
					okBtn.style.display = '';
					advanceVisualSeed();
				} else {
					UIManager.showMessageBox(DB.getMessage(1887), 'ok');
					if (PincodeWindow._newpass.length < 4 || PincodeWindow._newpass.length > 6) {
						PincodeWindow._newpass = '';
					}
				}
			}
		} else {
			const okBtn = root.querySelector('.btn2.ok');
			const changeBtn = root.querySelector('.btn2.change');
			const verifyBtn = root.querySelector('.btn2.verify');

			okBtn.disabled = true;
			okBtn.style.display = 'none';

			// Remove old click and rebind
			const okClone = okBtn.cloneNode(true);
			okBtn.parentNode.replaceChild(okClone, okBtn);
			okClone.addEventListener('click', () => PincodeWindow.onParentPincodeResetReq());
			okClone.addEventListener('mousedown', stopPropagation);

			changeBtn.disabled = true;
			verifyBtn.disabled = false;

			const verifyClone = verifyBtn.cloneNode(true);
			verifyBtn.parentNode.replaceChild(verifyClone, verifyBtn);
			verifyClone.addEventListener('click', () => PincodeWindow.onParentPincodeResetReq());

			verifyClone.style.display = '';
			PincodeWindow.selectInput(0);
			PincodeWindow.clearPin();
			PincodeWindow._resetstate = 2;
			advanceVisualSeed();
		}
	}
};

/**
 * Called by us when the user clicks on the change button in the UI.
 */
PincodeWindow.userChangePin = function userChangePin() {
	const root = PincodeWindow._shadow || PincodeWindow._host;
	if (
		PincodeWindow._resetstate === 3 &&
		typeof PincodeWindow.onPincodeReset === 'function' &&
		PincodeWindow._pass.length > 0 &&
		PincodeWindow._pass != PincodeWindow._newpass &&
		PincodeWindow._newpass.length > 3 &&
		PincodeWindow._newpass.length < 7 &&
		PincodeWindow._newpass == PincodeWindow._checkpass
	) {
		success();
	} else {
		if (
			PincodeWindow._resetstate === 2 &&
			typeof PincodeWindow.onPincodeReset === 'function' &&
			PincodeWindow._pass.length > 0 &&
			PincodeWindow._pass != PincodeWindow._newpass
		) {
			if (PincodeWindow._newpass.length > 3 && PincodeWindow._newpass.length < 7) {
				PincodeWindow.selectInput(2);
				PincodeWindow._resetstate = 3;

				const verifyBtn = root.querySelector('.btn2.verify');
				const okBtn = root.querySelector('.btn2.ok');
				verifyBtn.disabled = true;
				okBtn.disabled = false;
				verifyBtn.style.display = 'none';
				okBtn.style.display = '';
				advanceVisualSeed();
			} else {
				UIManager.showMessageBox(DB.getMessage(1887), 'ok');
			}
		} else {
			if (
				PincodeWindow._resetstate === 1 &&
				typeof PincodeWindow.onPincodeReset === 'function' &&
				PincodeWindow._pass.length > 0
			) {
				PincodeWindow.selectInput(1);
				PincodeWindow._resetstate = 2;
				advanceVisualSeed();
			} else {
				const okBtn = root.querySelector('.btn2.ok');
				const changeBtn = root.querySelector('.btn2.change');
				const verifyBtn = root.querySelector('.btn2.verify');

				okBtn.disabled = true;
				okBtn.style.display = 'none';

				const okClone = okBtn.cloneNode(true);
				okBtn.parentNode.replaceChild(okClone, okBtn);
				okClone.addEventListener('click', () => PincodeWindow.userChangePin());
				okClone.addEventListener('mousedown', stopPropagation);

				changeBtn.disabled = true;
				verifyBtn.disabled = false;

				const verifyClone = verifyBtn.cloneNode(true);
				verifyBtn.parentNode.replaceChild(verifyClone, verifyBtn);
				verifyClone.addEventListener('click', () => PincodeWindow.userChangePin());

				verifyClone.style.display = '';
				PincodeWindow.selectInput(0);
				PincodeWindow.resetPins();
				PincodeWindow._resetstate = 1;
				advanceVisualSeed();
				PincodeWindow.onUserPincodeResetReq();
			}
		}
	}
};

function generateKeypad(_userseed) {
	const tab = new Uint8Array([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9]);
	const keypad = new Uint8Array([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
	const multiplier = parseInt('0x3498', 16);
	const baseSeed = parseInt('0x881234', 16);
	let pos = 0;
	const userSeed = new Uint32Array([_userseed]);

	for (let i = 1; i < 10; i++) {
		userSeed[0] = (baseSeed + userSeed[0] * multiplier) >>> 0;
		pos = userSeed[0] % (i + 1);
		if (i != pos) {
			tab[i] ^= tab[pos];
			tab[pos] ^= tab[i];
			tab[i] ^= tab[pos];
		}
	}

	for (let i = 0; i < 10; i++) {
		keypad[tab[i]] = i;
	}

	return keypad;
}

function encryptPincode(pincode) {
	let intCode = 0;
	let strCode = '';
	let out = '';

	intCode = Number.parseInt(pincode);
	if (isNaN(intCode) === false && Number.isSafeInteger(intCode) === true) {
		if (intCode >= 0 && intCode < 1000000 && pincode.length >= 4 && pincode.length <= 6) {
			for (let ic = pincode.length - 1; ic > 0; ic--) {
				if (intCode < Math.pow(10, ic)) {
					strCode += '0';
				}
			}
			strCode += intCode.toString();

			for (let i = 0; i < strCode.length; i++) {
				const x = Number(strCode[i]);
				out += PincodeWindow._keypad[x].toString();
			}
		} else {
			console.error('ERROR: PincodeWindow.encryptPincode(): Pincode length invalid.');
		}
	} else {
		console.error('ERROR: PincodeWindow.encryptPincode(): Unsafe Int.');
	}

	return out;
}

function success() {
	let passEnc = PincodeWindow._pass;
	let newPassEnc = PincodeWindow._newpass;

	if (PincodeWindow._keypad !== undefined) {
		if (PincodeWindow._pass !== undefined && PincodeWindow._pass !== '') {
			passEnc = encryptPincode(PincodeWindow._pass);
		}
		if (PincodeWindow._newpass !== undefined && PincodeWindow._newpass !== '') {
			newPassEnc = encryptPincode(PincodeWindow._newpass);
		}
	}

	PincodeWindow._resetstate = 0;

	switch (PincodeWindow.sel_input) {
		case 2:
			PincodeWindow.onPincodeReset(passEnc, newPassEnc);
			break;
		default:
			PincodeWindow.onPincodeCheckRequest(passEnc);
			break;
	}

	PincodeWindow.resetPins();
}

/**
 * Press "cancel" or ESCAPE key
 */
function cancel() {
	UIManager.showPromptBox(
		DB.getMessage(17),
		'ok',
		'cancel',
		() => {
			PincodeWindow.resetPins();
			PincodeWindow.onExitRequest();
		},
		null
	);
}

function keyNum(num) {
	switch (PincodeWindow.sel_input) {
		case 1:
			PincodeWindow._newpass += num;
			break;
		default:
			PincodeWindow._pass += num;
			break;
		case 2:
			PincodeWindow._checkpass += num;
			break;
	}
}

/**
 * Methods to define (overridden by CharEngine.js)
 */
PincodeWindow.onPincodeCheckRequest = function onPincodeCheckRequest() {
	console.error('ERROR: PincodeWindow.onPincodeCheckRequest() not defined.');
};
PincodeWindow.onExitRequest = function onExitRequest() {
	console.error('WARNING: PincodeWindow.onExitRequest() not defined.');
	PincodeWindow.resetUI();
};
PincodeWindow.onPincodeReset = function onPincodeReset() {
	console.error('ERROR: PincodeWindow.onPincodeReset() not defined.');
};
PincodeWindow.onUserPincodeResetReq = function onUserPincodeResetReq() {
	console.error('ERROR: PincodeWindow.onUserPincodeResetReq() not defined.');
};

function render() {
	const root = PincodeWindow._shadow || PincodeWindow._host;
	if (!root) return;

	let str = '';
	for (let x = 0; x < PincodeWindow._newpass.length; x++) {
		str += '*';
	}
	const newpassEl = root.querySelector('.newpass');
	if (newpassEl) newpassEl.value = str;

	str = '';
	for (let x = 0; x < PincodeWindow._checkpass.length; x++) {
		str += '*';
	}
	const checkpassEl = root.querySelector('.checkpass');
	if (checkpassEl) checkpassEl.value = str;

	str = '';
	for (let x = 0; x < PincodeWindow._pass.length; x++) {
		str += '*';
	}
	const passEl = root.querySelector('.pass');
	if (passEl) passEl.value = str;
}

PincodeWindow.mouseMode = GUIComponent.MouseMode.STOP;
PincodeWindow.needFocus = true;

/**
 * Create component and export it
 */
export default UIManager.addComponent(PincodeWindow);
