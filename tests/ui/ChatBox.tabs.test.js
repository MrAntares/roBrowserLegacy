import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor(name) {
			this.name = name;
			this._host = document.createElement('div');
			this.ui = { show: vi.fn(), hide: vi.fn(), is: vi.fn(() => true) };
		}

		getRoot() {
			return this._host;
		}

		draggable() {}

		focus() {}

		parseHTML() {}
	}
	MockGUIComponent.MouseMode = { CROSS: 'cross', DEFAULT: 'default' };

	return { MockGUIComponent };
});

vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH: '',
		getMessage: (id, defaultText) => (defaultText !== undefined ? defaultText : `NO MSG ${id}`)
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800, tick: 0, render: vi.fn(), stop: vi.fn() } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { get: vi.fn(), getOverEntity: vi.fn() } }));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(_path, callback) {
			callback?.('');
		},
		loadFiles(_paths, callback) {
			callback?.('');
		}
	}
}));
vi.mock('Core/Events.js', () => ({ default: { setTimeout: vi.fn(), clearTimeout: vi.fn() } }));
vi.mock('Core/Preferences.js', () => ({
	default: {
		get: (_name, defaults) => ({ ...defaults, save: vi.fn() })
	}
}));
vi.mock('Core/Configs.js', () => ({ default: { get: vi.fn() } }));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: { screen: { x: 0, y: 0 } } }));
vi.mock('Controls/BattleMode.js', () => ({ default: { process: vi.fn(() => false) } }));
vi.mock('Controls/ProcessCommand.js', () => ({ default: vi.fn() }));
vi.mock('UI/CursorManager.js', () => ({ default: { setType: vi.fn(), ACTION: {} } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c, showMessageBox: vi.fn() } }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ContextMenu/ContextMenu.js', () => ({
	default: { remove: vi.fn(), append: vi.fn(), addElement: vi.fn() }
}));
vi.mock('UI/Components/ChatBoxSettings/ChatBoxSettings.js', () => ({
	default: { updateTab: vi.fn(), getTabs: () => [], tabOption: [] }
}));

const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;

/**
 * The tabs are built once and stay in the window across a remove: a counter
 * reset there gave the next new tab the id of an existing one.
 */
describe('ChatBox tabs after the window is removed and shown again', () => {
	const tabIds = () => [...ChatBox._host.querySelectorAll('td.tab')].map(td => td.dataset.tab);

	beforeEach(() => {
		document.body.innerHTML = '';
		const host = document.createElement('div');
		host.innerHTML = ChatBox.render();
		document.body.appendChild(host);
		ChatBox._host = host;
		ChatBox.magnet = {};
		ChatBox.tabs = [];
		ChatBox.tabCount = 0;
		ChatBox.lastTabID = -1;
		ChatBox.activeTab = 0;

		ChatBox.addNewTab('Public Log');
		ChatBox.addNewTab('Battle Log');
		ChatBox.switchTab('1');
		ChatBox.onRemove();
	});

	it('gives a new tab an id of its own', () => {
		const id = ChatBox.addNewTab();

		expect(tabIds()).toEqual(['0', '1', '2']);
		expect(ChatBox.tabs[0].name).toBe('Public Log');
		expect(ChatBox.tabs[id].name).toBe('New Tab');
	});

	it('shows chat in a new tab', async () => {
		const id = ChatBox.addNewTab();
		ChatBox.addText('hello', ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_CHAT);
		await new Promise(requestAnimationFrame);

		const content = [...ChatBox._host.querySelectorAll('.body .content')].pop();
		expect(content.dataset.content).toBe(String(id));
		expect(content.textContent).toBe('hello');
	});

	it('closes the tab on screen, not the first one', () => {
		ChatBox.removeTab();

		expect(tabIds()).toEqual(['0']);
	});
});
