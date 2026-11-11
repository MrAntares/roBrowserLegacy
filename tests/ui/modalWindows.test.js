/**
 * tests/ui/modalWindows.test.js
 *
 * The error box and the PincodeWindow block the windows behind them with a
 * win_popup_overlay; message boxes stack like any other window. Every window
 * now takes part in the stacking, so the overlay has to follow its window's
 * zIndex.
 */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('UI/CursorManager.js', () => ({
	default: { ACTION: { DEFAULT: 0 }, getActualType: vi.fn(() => 0), setType: vi.fn() }
}));
vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '', getMessage: () => '' } }));
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
vi.mock('UI/UIVersionManager.js', () => ({ default: { getUIAlias: () => null } }));

const GUIComponent = (await import('UI/GUIComponent.js')).default;
const UIManager = (await import('UI/UIManager.js')).default;
await import('UI/Components/WinPopup/WinPopup.js');
const PincodeWindow = (await import('UI/Components/PincodeWindow/PincodeWindow.js')).default;

let seq = 0;
const mounted = [];

/**
 * @param {GUIComponent} component - appended, then removed before the next case
 * @return {GUIComponent}
 */
function open(component) {
	component.append();
	mounted.push(component);
	return component;
}

/**
 * @return {GUIComponent} a plain window, appended
 */
function window_() {
	const component = new GUIComponent(`TestWindow${++seq}`, '');
	component.render = () => '<div></div>';
	return open(component);
}

const zIndex = el => parseInt(el.style.zIndex || getComputedStyle(el).zIndex, 10);

/**
 * Whether an element is drawn over another: higher zIndex, or the same one
 * and later in the document.
 *
 * @param {HTMLElement} a
 * @param {HTMLElement} b
 * @return {boolean}
 */
function isOver(a, b) {
	const za = zIndex(a);
	const zb = zIndex(b);
	if (za !== zb) return za > zb;
	return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
}

const overlays = () => [...document.querySelectorAll('.win_popup_overlay')];

afterAll(() => new Promise(resolve => setTimeout(resolve, 600)));

beforeEach(() => {
	for (const component of mounted.splice(0)) {
		component.remove();
	}
	document.body.innerHTML = '';
});

/**
 * The PincodeWindow set its overlay zIndex once, when appended. A window
 * closed under it left a gap the next focus() closed, so the window dropped to
 * its overlay's zIndex and the overlay, later in the document, covered it.
 */
describe('the PincodeWindow', () => {
	it('stays above its overlay once a message box over it is closed', async () => {
		const below = window_();
		open(PincodeWindow);
		await Promise.resolve();
		below.remove();

		const box = UIManager.showMessageBox('Wrong PIN', 'ok');
		box.remove();
		PincodeWindow.focus();

		const [overlay] = overlays();
		expect(isOver(PincodeWindow._host, overlay)).toBe(true);
	});
});

/**
 * A party, trade or guild request arrives at any time: it must not lock the
 * other windows.
 */
describe('a message box', () => {
	it('lets a window clicked after it come in front', () => {
		const inventory = window_();
		const box = UIManager.showPromptBox('Join the party?', 'ok', 'cancel');
		expect(isOver(box._host, inventory._host)).toBe(true);

		inventory._host.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(overlays()).toHaveLength(0);
		expect(isOver(inventory._host, box._host)).toBe(true);
		box.remove();
	});
});

/**
 * The box and its overlay sat at a fixed 100 and 99: with about fifty windows
 * open, the windows stacked above 99 came over both and took clicks.
 */
describe('the error box', () => {
	it('stays over every window, its overlay right under it', () => {
		const below = window_();
		const box = UIManager.showErrorBox('Disconnected from Server.');
		const after = window_();
		after.focus();

		const [overlay] = overlays();
		expect(isOver(overlay, below._host)).toBe(true);
		expect(isOver(overlay, after._host)).toBe(true);
		expect(isOver(box._host, overlay)).toBe(true);

		box.remove();
		expect(overlays()).toHaveLength(0);
	});
});

/**
 * Windows outside UIManager joined the stacking without the __active check
 * the manager's loop had.
 */
describe('a window marked inactive without remove()', () => {
	it('leaves the stacking', () => {
		const detached = window_();
		const storage = window_();
		detached.__active = false;
		detached._host.style.zIndex = '90';

		const search = window_();
		storage.focus();

		expect(detached._host.style.zIndex).toBe('90');
		expect(zIndex(storage._host)).toBe(zIndex(search._host) + 1);
	});
});
