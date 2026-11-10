/**
 * tests/ui/modalWindows.test.js
 *
 * Message boxes and the PincodeWindow block the windows behind them with a
 * win_popup_overlay. Every window now takes part in the stacking, so the
 * overlay has to follow its window's zIndex.
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

	it('keeps blocking a window opened after it', async () => {
		open(PincodeWindow);
		await Promise.resolve();
		const whisper = window_();

		const [overlay] = overlays();
		expect(isOver(overlay, whisper._host)).toBe(true);
		expect(isOver(PincodeWindow._host, overlay)).toBe(true);
	});
});

/**
 * A message box only stayed in front: the windows behind it still took clicks.
 */
describe('a message box', () => {
	it('blocks the windows behind it until it is closed', () => {
		const inventory = window_();
		const box = UIManager.showMessageBox('Leave the party?', 'ok');

		const [overlay] = overlays();
		expect(overlay).toBeDefined();
		expect(isOver(overlay, inventory._host)).toBe(true);
		expect(isOver(box._host, overlay)).toBe(true);

		box.remove();
		expect(overlays()).toHaveLength(0);
	});

	it('keeps blocking a window opened after it', () => {
		const box = UIManager.showPromptBox('Exit?', 'ok', 'cancel');
		const menu = window_();

		const [overlay] = overlays();
		expect(isOver(overlay, menu._host)).toBe(true);
		expect(isOver(box._host, overlay)).toBe(true);
		box.remove();
	});

	it('is blocked in turn by a box opened over it', () => {
		const first = UIManager.showMessageBox('First', 'ok');
		const second = UIManager.showMessageBox('Second', 'ok');

		const [, overlay] = overlays();
		expect(isOver(overlay, first._host)).toBe(true);
		expect(isOver(second._host, overlay)).toBe(true);
		second.remove();
		first.remove();
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
