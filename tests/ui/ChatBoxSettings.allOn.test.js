import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor(name) {
			this.name = name;
			this._host = document.createElement('div');
			this.ui = { show: vi.fn(), hide: vi.fn() };
		}

		getRoot() {
			return this._host;
		}

		draggable() {}
	}
	MockGUIComponent.MouseMode = { STOP: 'stop' };

	return { MockGUIComponent };
});

vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '' } }));
vi.mock('Core/Preferences.js', () => ({
	default: {
		get: (_name, defaults) => ({ ...defaults, save: vi.fn() })
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800 } }));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(path, callback) {
			callback?.(path);
		}
	}
}));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: { screen: { x: 0, y: 0 } } }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));

const ChatBoxSettings = (await import('UI/Components/ChatBoxSettings/ChatBoxSettings.js')).default;

const host = ChatBoxSettings._host;
host.innerHTML = ChatBoxSettings.render();
ChatBoxSettings.init();

const allOn = () => host.querySelector('.footer-opt');
const box = () => host.querySelector('.footer-opt .allon').style.backgroundImage;
const filters = () => [...host.querySelectorAll('.listoption button')];

describe('ChatBoxSettings - All on', () => {
	beforeEach(() => {
		ChatBoxSettings.tabOption = [[1, 2]];
		ChatBoxSettings.updateTab(0, 'Public');
	});

	it('turns every filter of the tab on', () => {
		allOn().click();

		expect(ChatBoxSettings.tabOption[0]).toHaveLength(filters().length);
		expect(filters().every(btn => btn.classList.contains('on'))).toBe(true);
		expect(box()).toContain('checkbox_1.bmp');
	});

	it('turns them all off when they already are all on', () => {
		allOn().click();
		allOn().click();

		expect(ChatBoxSettings.tabOption[0]).toEqual([]);
		expect(filters().some(btn => btn.classList.contains('on'))).toBe(false);
		expect(box()).toContain('checkbox_0.bmp');
	});

	it('is ticked only while every filter is on', () => {
		expect(box()).toContain('checkbox_0.bmp');

		allOn().click();
		filters()[0].click();

		expect(box()).toContain('checkbox_0.bmp');
	});
});
