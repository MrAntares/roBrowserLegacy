/**
 * UI/Components/PincodeWindow/PincodeWindow.js
 *
 * Pincode windows
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Disaml
 */

import DB from 'DB/DBManager.js';
import Renderer from 'Renderer/Renderer.js';
import UIManager from 'UI/UIManager.js';
import UIComponent from 'UI/UIComponent.js';
import htmlText from './PincodeWindow.html?raw';
import cssText from './PincodeWindow.css?raw';

/**
 * Pincode Window namespace
 */
const PincodeWindow = new UIComponent('PincodeWindow', htmlText, cssText);

/**
 * @var {Preference} window preferences
 */
/*var _preferences = Preferences.get('PincodeWindow', {
        x: 540,
        y: 320
    }, 1.0);

    let sel_input = 0;

    let _checkpass = '';

    let _newpass = '';

    let _pass = '';

    let _keypad = undefined;

    let _currentSeed = undefined;

    let _resetstate = 0;*/ // UNUSED

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
	const ui = PincodeWindow.ui;
	if (!ui || !keypad) {
		return;
	}
	for (let loc = 0; loc < 10; loc++) {
		const posBtn = ui.find('.btn.num' + loc);
		if (!posBtn || posBtn.length === 0) {
			continue;
		}

		const el = posBtn[0];
		const off = posBtn.offset();
		el.__original_x_pos = off.left;
		el.__original_y_pos = off.top;
	}
	for (let loc = 0; loc < 10; loc++) {
		const d = keypad[loc];
		const btn = ui.find('.btn.num' + d);
		if (!btn || btn.length === 0) {
			continue;
		}

		const targetEl = ui.find('.btn.num' + loc)[0];
		const target_x = targetEl.__original_x_pos;
		const target_y = targetEl.__original_y_pos;
		btn.offset({
			left: target_x,
			top: target_y
		});
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
	const ui = this.ui;

	this.ui.css({
		top: (Renderer.height - 358) / 2,
		left: (Renderer.width - 576) / 2
	});

	// Disable pass fields.
	ui.find('.pass').prop('disabled', true);
	ui.find('.newpass').prop('disabled', true);
	ui.find('.checkpass').prop('disabled', true);

	// This exit button was never used.
	ui.find('.btn2.unused').hide();

	// Hide, disable, and fix the location of the verify button.
	ui.find('.btn2.verify').prop('disabled', true);
	ui.find('.btn2.verify').hide();

	// Enable and show the change and ok buttons.
	ui.find('.btn2.change').prop('disabled', false);
	ui.find('.btn2.ok').prop('disabled', false);
	ui.find('.btn2.ok').show();

	// Unbind all buttons.
	ui.find('.btn2.cancel').off('click');
	ui.find('.btn2.ok').off('click');
	ui.find('.btn.num1').off('click');
	ui.find('.btn.num2').off('click');
	ui.find('.btn.num3').off('click');
	ui.find('.btn.num4').off('click');
	ui.find('.btn.num5').off('click');
	ui.find('.btn.num6').off('click');
	ui.find('.btn.num7').off('click');
	ui.find('.btn.num8').off('click');
	ui.find('.btn.num9').off('click');
	ui.find('.btn.num0').off('click');
	ui.find('.btn2.change').off('click');
	ui.find('.btn2.verify').off('click');
	ui.find('.numReset').off('click');

	// Bind buttons
	ui.find('.btn2.cancel').click(cancel);
	ui.find('.btn2.ok').click(success);
	ui.find('.btn.num1').click(function () {
		keyNum('1');
	});
	ui.find('.btn.num2').click(function () {
		keyNum('2');
	});
	ui.find('.btn.num3').click(function () {
		keyNum('3');
	});
	ui.find('.btn.num4').click(function () {
		keyNum('4');
	});
	ui.find('.btn.num5').click(function () {
		keyNum('5');
	});
	ui.find('.btn.num6').click(function () {
		keyNum('6');
	});
	ui.find('.btn.num7').click(function () {
		keyNum('7');
	});
	ui.find('.btn.num8').click(function () {
		keyNum('8');
	});
	ui.find('.btn.num9').click(function () {
		keyNum('9');
	});
	ui.find('.btn.num0').click(function () {
		keyNum('0');
	});
	ui.find('.btn2.change').click(PincodeWindow.userChangePin);

	ui.find('.numReset').click(() => {
		PincodeWindow.clearPin();
		advanceVisualSeed();
	});

	// Randomize position of num buttons.
	if (PincodeWindow._keypad !== undefined) {
		shuffleUsingKeypad(PincodeWindow._keypad);
	}

	// Deactivate stopPropagation.
	ui.find('.titlebar .base').off('mousedown');
	ui.find('.btn2.cancel').off('mousedown');
	ui.find('.btn2.ok').off('mousedown');

	// Don't activate drag drop when clicking on buttons
	ui.find('.titlebar .base').mousedown(stopPropagation);

	ui.find('.btn2.cancel').mousedown(stopPropagation);
	ui.find('.btn2.ok').mousedown(stopPropagation);

	this.draggable(ui.find('.titlebar'));

	PincodeWindow.resetPins();
	PincodeWindow.selectInput(0);
};

/**
 * Once append to body
 */
PincodeWindow.onAppend = function onAppend() {
	// Start rendering
	Renderer.render(render);
	PincodeWindow.ui.focus();
};

/**
 * Stop rendering
 */
PincodeWindow.onRemove = function onRemove() {
	Renderer.stop(render);
};

/**
 * Stop an event to propagate
 */
function stopPropagation(event) {
	event.stopImmediatePropagation();
	return false;
}

PincodeWindow.selectInput = function selectInput(selection) {
	PincodeWindow.sel_input = selection;
	if (PincodeWindow.ui !== undefined) {
		switch (selection) {
			case 1:
				PincodeWindow.ui.find('.pass').css({ 'background-color': '#D3D3D3' });
				PincodeWindow.ui.find('.checkpass').css({ 'background-color': '#D3D3D3' });
				PincodeWindow.ui.find('.newpass').css({ 'background-color': '#87CEFA' });
				break;
			default:
				PincodeWindow.ui.find('.newpass').css({ 'background-color': '#D3D3D3' });
				PincodeWindow.ui.find('.checkpass').css({ 'background-color': '#D3D3D3' });
				PincodeWindow.ui.find('.pass').css({ 'background-color': '#87CEFA' });
				break;
			case 2:
				PincodeWindow.ui.find('.newpass').css({ 'background-color': '#D3D3D3' });
				PincodeWindow.ui.find('.pass').css({ 'background-color': '#D3D3D3' });
				PincodeWindow.ui.find('.checkpass').css({ 'background-color': '#87CEFA' });
				break;
		}
	}
};

/**
 * Called by the parent when the result of the old pincode check is received from the server.
 */
PincodeWindow.onOldPincodeCheckResult = function onOldPincodeCheckResult(result) {
	if (result === true) {
		// Call success.
		success();
	} else {
		// Old pin code failed.
		UIManager.showMessageBox(DB.getMessage(1892), 'ok');
	}
};

/**
 * Called by the parent when we have received a pincode reset request from the server.
 */
PincodeWindow.onParentPincodeResetReq = function onParentPincodeResetReq() {
	const ui = PincodeWindow.ui;
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
					PincodeWindow.ui.find('.btn2.verify').prop('disabled', true);
					PincodeWindow.ui.find('.btn2.ok').prop('disabled', false);
					PincodeWindow.ui.find('.btn2.verify').hide();
					PincodeWindow.ui.find('.btn2.ok').show();
					advanceVisualSeed();
				} else {
					UIManager.showMessageBox(DB.getMessage(1887), 'ok');
					// Optionally clear _newpass if invalid length
					if (PincodeWindow._newpass.length < 4 || PincodeWindow._newpass.length > 6) {
						PincodeWindow._newpass = '';
					}
					// If same as old, perhaps another message, but for now stay
				}
			}
		} else {
			PincodeWindow.ui.find('.btn2.ok').prop('disabled', true);
			PincodeWindow.ui.find('.btn2.ok').hide();
			PincodeWindow.ui.find('.btn2.ok').off('click');
			PincodeWindow.ui.find('.btn2.ok').click(function () {
				PincodeWindow.onParentPincodeResetReq();
			});
			PincodeWindow.ui.find('.btn2.change').prop('disabled', true);
			PincodeWindow.ui.find('.btn2.verify').prop('disabled', false);
			PincodeWindow.ui.find('.btn2.verify').off('click');
			ui.find('.btn2.verify').click(function () {
				PincodeWindow.onParentPincodeResetReq();
			});
			PincodeWindow.ui.find('.btn2.verify').show();
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
	/**
	 * Note: Despite what the verify button says, the client only sends
	 * the old pin code for verification, before sending the change packet.
	 */
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
				PincodeWindow.ui.find('.btn2.verify').prop('disabled', true);
				PincodeWindow.ui.find('.btn2.ok').prop('disabled', false);
				PincodeWindow.ui.find('.btn2.verify').hide();
				PincodeWindow.ui.find('.btn2.ok').show();
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
				PincodeWindow.ui.find('.btn2.ok').prop('disabled', true);
				PincodeWindow.ui.find('.btn2.ok').hide();
				PincodeWindow.ui.find('.btn2.ok').off('click');
				PincodeWindow.ui.find('.btn2.ok').click(function () {
					PincodeWindow.userChangePin();
				});
				PincodeWindow.ui.find('.btn2.change').prop('disabled', true);
				PincodeWindow.ui.find('.btn2.verify').prop('disabled', false);
				PincodeWindow.ui.find('.btn2.verify').off('click');
				PincodeWindow.ui.find('.btn2.verify').click(function () {
					PincodeWindow.userChangePin();
				});
				PincodeWindow.ui.find('.btn2.verify').show();
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
	const tab = new Uint8Array([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9]); // This is a char array in rathena. (So 1 byte values.)
	const keypad = new Uint8Array([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]); // This is a char array in rathena. (So 1 byte values.)
	const multiplier = parseInt('0x3498', 16);
	const baseSeed = parseInt('0x881234', 16);
	let i = 0;
	let pos = 0;
	const userSeed = new Uint32Array([_userseed]); // It's tempting to make this a regular var, but we need the truncating behavior of an int32 for the pad generation.

	// Set up onetime pad.
	for (i = 1; i < 10; i++) {
		userSeed[0] = (baseSeed + userSeed[0] * multiplier) >>> 0;
		pos = userSeed[0] % (i + 1);
		if (i != pos) {
			tab[i] ^= tab[pos];
			tab[pos] ^= tab[i];
			tab[i] ^= tab[pos];
		}
	}

	// Set up keypad.
	for (i = 0; i < 10; i++) {
		keypad[tab[i]] = i;
	}

	return keypad;
}

function encryptPincode(pincode) {
	let intCode = 0;
	let strCode = '';
	//var keypad = undefined; //UNUSED
	let i = 0;
	let x = 0;
	let out = '';

	intCode = Number.parseInt(pincode);
	if (isNaN(intCode) === false && Number.isSafeInteger(intCode) === true) {
		if (intCode >= 0 && intCode < 1000000 && pincode.length >= 4 && pincode.length <= 6) {
			// Get intCode into a parseable string.
			for (let ic = pincode.length - 1; ic > 0; ic--) {
				if (intCode < Math.pow(10, ic)) {
					strCode += '0';
				}
			}
			strCode += intCode.toString();

			// Encrypt raw digits with pad.
			for (i = 0; i < strCode.length; i++) {
				x = Number(strCode[i]);
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
	let checkPassEnc = PincodeWindow._checkpass;
	let newPassEnc = PincodeWindow._newpass;

	if (PincodeWindow._keypad !== undefined) {
		if (PincodeWindow._pass !== undefined && PincodeWindow._pass !== '') {
			passEnc = encryptPincode(PincodeWindow._pass);
		}
		if (PincodeWindow._checkpass !== undefined && PincodeWindow._checkpass !== '') {
			checkPassEnc = encryptPincode(PincodeWindow._checkpass);
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
		function () {
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
 * Method to define
 */
// Called when the performing a new pin / check pin request and the user has typed in their pin.
PincodeWindow.onPincodeCheckRequest = function onPincodeCheckRequest() {
	console.error('ERROR: PincodeWindow.onPincodeCheckRequest() not defined.');
};
// Called when the window is closed.
PincodeWindow.onExitRequest = function onExitRequest() {
	console.error('WARNING: PincodeWindow.onExitRequest() not defined.');
	PincodeWindow.resetUI();
};
// Called when the user has provided all three pincodes needed for a reset.
PincodeWindow.onPincodeReset = function onPincodeReset() {
	console.error('ERROR: PincodeWindow.onPincodeReset() not defined.');
};
// Called when the user clicks on the change button.
PincodeWindow.onUserPincodeResetReq = function onUserPincodeResetReq() {
	console.error('ERROR: PincodeWindow.onUserPincodeResetReq() not defined.');
};

function render(tick) {
	let str = '';
	for (let x = 0; x < PincodeWindow._newpass.length; x++) {
		str += '*';
	}
	PincodeWindow.ui.find('.newpass').val(str);
	str = '';
	for (let x = 0; x < PincodeWindow._checkpass.length; x++) {
		str += '*';
	}
	PincodeWindow.ui.find('.checkpass').val(str);
	str = '';
	for (let x = 0; x < PincodeWindow._pass.length; x++) {
		str += '*';
	}
	PincodeWindow.ui.find('.pass').val(str);
}

/**
 * Create componentand export it
 */
export default UIManager.addComponent(PincodeWindow);
