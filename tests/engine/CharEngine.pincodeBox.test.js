/**
 * tests/engine/CharEngine.pincodeBox.test.js
 *
 * The char server answers a PIN with a message box and the PincodeWindow
 * together. Both are modal: the window appended last comes in front, so the
 * box has to be shown after the PincodeWindow or it lands under its overlay.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	handlers: {},
	network: {
		connect: vi.fn(),
		sendPacket: vi.fn(),
		read: vi.fn(),
		hookPacket: vi.fn((struct, cb) => {
			mocks.handlers[struct] = cb;
		}),
		utils: { longToIP: () => '127.0.0.1' }
	}
}));

vi.mock('UI/CursorManager.js', () => ({
	default: { ACTION: { DEFAULT: 0 }, getActualType: vi.fn(() => 0), setType: vi.fn() }
}));
vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '', getMessage: id => `msg ${id}` } }));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(_path, callback) {
			callback?.('');
		},
		loadFiles(_paths, callback) {
			callback?.('', '');
		}
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800, render: vi.fn(), stop: vi.fn() } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { setOverEntity: vi.fn() } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('UI/UIVersionManager.js', () => ({ default: { getUIAlias: () => null, selectAllChar: vi.fn() } }));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d, getServer: () => ({}) } }));
vi.mock('Core/Events.js', () => ({ default: {} }));
vi.mock('Audio/SoundManager.js', () => ({ default: {} }));
vi.mock('Audio/BGM.js', () => ({ default: { play: vi.fn() } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Engine/MapEngine.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({ default: mocks.network }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20180704 } }));
vi.mock('Network/PacketStructure.js', () => ({
	default: new Proxy(
		{},
		{
			get: (_t, ns) =>
				new Proxy(
					{},
					{
						get: (_n, name) => {
							const Struct = function () {};
							Struct.toString = () => `${String(ns)}.${String(name)}`;
							return Struct;
						}
					}
				)
		}
	)
}));
vi.mock('UI/Background.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/JoystickUI/JoystickUI.js', () => ({ default: { onRestore: vi.fn() } }));
vi.mock('UI/Components/CharSelect/CharSelect.js', () => ({ default: { setUIEnabled: vi.fn() } }));
vi.mock('UI/Components/CharCreate/CharCreate.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/Player.js', () => ({ default: {} }));
vi.mock('Engine/LoginEngine.js', () => ({ default: { reload: vi.fn() } }));

const UIManager = (await import('UI/UIManager.js')).default;
await import('UI/Components/WinPopup/WinPopup.js');
const PincodeWindow = (await import('UI/Components/PincodeWindow/PincodeWindow.js')).default;
const CharEngine = (await import('Engine/CharEngine.js')).default;

CharEngine.init({ ip: 0, port: 6121 });
const onPincodeState = mocks.handlers['HC.SECOND_PASSWD_LOGIN'];

const boxes = [];
const showMessageBox = UIManager.showMessageBox.bind(UIManager);
vi.spyOn(UIManager, 'showMessageBox').mockImplementation((...args) => {
	const box = showMessageBox(...args);
	boxes.push(box);
	return box;
});

/**
 * Whether an element is drawn over another: higher zIndex, or the same one
 * and later in the document.
 *
 * @param {HTMLElement} a
 * @param {HTMLElement} b
 * @return {boolean}
 */
function isOver(a, b) {
	const za = parseInt(a.style.zIndex, 10);
	const zb = parseInt(b.style.zIndex, 10);
	if (za !== zb) return za > zb;
	return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
}

afterAll(() => new Promise(resolve => setTimeout(resolve, 600)));

beforeEach(() => {
	// remove() rather than clearing the body alone: an open window stays in the stacking
	for (const box of boxes.splice(0)) {
		box.remove();
	}
	PincodeWindow.remove();
	document.body.innerHTML = '';
});

describe('the char server answering a PIN', () => {
	it('shows the wrong PIN box over the PincodeWindow', () => {
		onPincodeState({ State: 1, Seed: 0 });
		onPincodeState({ State: 8, Seed: 0 });

		const [box] = boxes;
		expect(isOver(box._host, PincodeWindow._modalOverlay)).toBe(true);
		expect(isOver(box._host, PincodeWindow._host)).toBe(true);
	});

	// A click on the keypad raised the PincodeWindow and its overlay over the box
	it('keeps the PincodeWindow from taking clicks until the box is closed', () => {
		onPincodeState({ State: 1, Seed: 0 });
		onPincodeState({ State: 8, Seed: 0 });

		const [box] = boxes;
		expect(isOver(box._modalOverlay, PincodeWindow._host)).toBe(true);
		expect(isOver(box._host, box._modalOverlay)).toBe(true);

		const overlay = box._modalOverlay;
		box.remove();
		expect(overlay.isConnected).toBe(false);
	});

	it('shows the new PIN box over the PincodeWindow', () => {
		onPincodeState({ State: 2, Seed: 0 });

		const [box] = boxes;
		expect(isOver(box._host, PincodeWindow._modalOverlay)).toBe(true);
	});

	it('keeps the PIN creation message on the third failed creation', () => {
		onPincodeState({ State: 2, Seed: 0 });
		PincodeWindow.onExitRequest(); // start from no failed attempt
		onPincodeState({ State: 2, Seed: 0 });
		PincodeWindow.onPincodeCheckRequest('1234');

		onPincodeState({ State: 8, Seed: 0 });
		onPincodeState({ State: 8, Seed: 0 });
		onPincodeState({ State: 8, Seed: 0 });

		const texts = boxes.slice(-3).map(box => box._shadow.querySelector('.text').textContent);
		expect(texts).toEqual(['msg 1893', 'msg 1893', 'msg 1893']);
	});
});
