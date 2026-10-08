import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	// Mirrors GUIComponent: prepare() leaves a detached host with no inline display.
	class MockGUIComponent {
		constructor(name) {
			this.name = name;
			this.__active = false;
		}

		prepare() {
			this._host = document.createElement('div');
		}

		append() {
			this.__active = true;
			document.body.appendChild(this._host);
		}

		focus() {}
	}

	return { MockGUIComponent };
});

vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '', getMessage: id => `MSG ${id}` } }));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn() } }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_name, defaults) => ({ ...defaults, save: vi.fn() }) } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: { ESCAPE: 27 } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: { addText: vi.fn(), TYPE: {}, FILTER: {} } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));

const Rodex = (await import('UI/Components/Rodex/Rodex.js')).default;

describe('Rodex toggle', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		Rodex.__active = false;
		Rodex.openRodexBox = vi.fn();
		Rodex.closeRodexBox = vi.fn();
		Rodex.prepare();
	});

	it('opens the mailbox on the first click after the map loads', () => {
		Rodex.toggle();

		expect(Rodex.openRodexBox).toHaveBeenCalledTimes(1);
		expect(Rodex.closeRodexBox).not.toHaveBeenCalled();
		expect(Rodex._host.style.display).toBe('');
	});

	it('closes the mailbox on the second click', () => {
		Rodex.toggle();
		Rodex.toggle();

		expect(Rodex.closeRodexBox).toHaveBeenCalledTimes(1);
		expect(Rodex._host.style.display).toBe('none');
	});
});
