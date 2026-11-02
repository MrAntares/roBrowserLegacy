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

	return { MockGUIComponent, ItemInfo: { append: vi.fn(), setItem: vi.fn() } };
});

vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH: '',
		getMessage: (id, defaultText) => (defaultText !== undefined ? defaultText : `NO MSG ${id}`),
		parseItemLink: () => ({ name: 'Red Potion' })
	}
}));
vi.mock('Renderer/Renderer.js', () => ({
	default: { width: 1200, height: 800, tick: 0, render: vi.fn(), stop: vi.fn() }
}));
vi.mock('Renderer/EntityManager.js', () => ({
	default: { get: vi.fn(), getOverEntity: vi.fn(), setOverEntity: vi.fn() }
}));
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
vi.mock('Controls/ProcessCommand.js', () => ({ default: { add: vi.fn() } }));
vi.mock('UI/CursorManager.js', () => ({ default: { setType: vi.fn(), ACTION: {} } }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({
	default: { addComponent: c => c, showMessageBox: vi.fn(), getComponent: () => mocks.ItemInfo }
}));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ContextMenu/ContextMenu.js', () => ({
	default: {
		remove: vi.fn(),
		append: vi.fn(),
		addElement: vi.fn(),
		prepare: vi.fn(),
		__loaded: true,
		ui: { find: () => ({ css: vi.fn(), height: () => 0, width: () => 0 }) }
	}
}));
vi.mock('UI/Components/ChatBoxSettings/ChatBoxSettings.js', () => ({
	default: { updateTab: vi.fn(), getTabs: () => [], append: vi.fn(), tabOption: [] }
}));

const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;
const ChatBoxSettings = (await import('UI/Components/ChatBoxSettings/ChatBoxSettings.js')).default;

ChatBox.magnet = {};
document.body.innerHTML = '';
const host = document.createElement('div');
host.innerHTML = ChatBox.render();
document.body.appendChild(host);
ChatBox._host = host;
ChatBox._shadow = null;
ChatBox.init();

describe('ChatBox - clicking a tab', () => {
	const tabInput = () => host.querySelector('.header tr td div.on input');
	const mouse = (type, target) => {
		const event = new MouseEvent(type, { bubbles: true, cancelable: true, which: 1 });
		target.dispatchEvent(event);
		return event;
	};
	const key = (input, name) => {
		const onWindowKey = vi.fn();
		window.addEventListener('keydown', onWindowKey);
		input.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
		window.removeEventListener('keydown', onWindowKey);
		return onWindowKey;
	};
	const savedName = () => ChatBox.tabs[ChatBox.activeTab].name;

	it('does not put the name in edit mode on a single click', () => {
		const input = tabInput();

		expect(input.readOnly).toBe(true);
		expect(mouse('mousedown', input).defaultPrevented).toBe(true);
	});

	it('edits the name on a double-click, focused and selected', () => {
		const input = tabInput();
		mouse('dblclick', input);

		expect(input.readOnly).toBe(false);
		expect(document.activeElement).toBe(input);
		expect([input.selectionStart, input.selectionEnd]).toEqual([0, input.value.length]);
		expect(mouse('mousedown', input).defaultPrevented).toBe(false);
		input.blur();
	});

	it('keeps the new name on Enter, without passing the key on to the game', () => {
		const input = tabInput();
		mouse('dblclick', input);
		input.value = 'Trade';

		expect(key(input, 'Enter')).not.toHaveBeenCalled();
		expect(document.activeElement).not.toBe(input);
		expect(input.readOnly).toBe(true);
		expect(input.value).toBe('Trade');
		expect(savedName()).toBe('Trade');
	});

	it('stays in edit mode on Enter with an empty name', () => {
		const input = tabInput();
		mouse('dblclick', input);
		input.value = '  ';
		key(input, 'Enter');

		expect(document.activeElement).toBe(input);
		expect(input.readOnly).toBe(false);
		input.blur();
	});

	it('drops the new name on Escape', () => {
		const input = tabInput();
		const before = savedName();
		mouse('dblclick', input);
		input.value = 'Loot';

		expect(key(input, 'Escape')).not.toHaveBeenCalled();
		expect(input.readOnly).toBe(true);
		expect(input.value).toBe(before);
		expect(savedName()).toBe(before);
	});

	it('drops the new name when the focus leaves it', () => {
		const input = tabInput();
		const before = savedName();
		mouse('dblclick', input);
		input.value = 'Loot';
		input.blur();

		expect(input.readOnly).toBe(true);
		expect(input.value).toBe(before);
	});

	it('leaves the filter window alone while the name is typed', () => {
		const input = tabInput();
		mouse('dblclick', input);
		ChatBoxSettings.updateTab.mockClear();
		for (const letter of 'Loot') {
			const event = new KeyboardEvent('keydown', { key: letter, bubbles: true });
			input.dispatchEvent(event);
			ChatBox.onKeyDown(event);
			input.dispatchEvent(new KeyboardEvent('keyup', { key: letter, bubbles: true }));
		}

		expect(ChatBoxSettings.updateTab).not.toHaveBeenCalled();
		input.blur();
	});

	it('drops the new name when another tab is clicked', () => {
		const input = tabInput();
		const before = savedName();
		mouse('dblclick', input);
		input.value = 'Loot';
		const other = [...host.querySelectorAll('.header td.tab input')].find(el => el !== input);
		mouse('mousedown', other);

		expect(document.activeElement).not.toBe(input);
		expect(input.value).toBe(before);
	});
});

describe('ChatBox - a tab name with markup', () => {
	const markup = '"><img src=x onerror=alert(1)>';

	it('shows it as text in its tab', () => {
		ChatBox.addNewTab(markup);
		const input = host.querySelector('.header tr td div.on input');

		expect(input.value).toBe(markup);
		expect(host.querySelector('.header img')).toBeNull();
	});

	it('shows it as text in the /savechat line', () => {
		window.URL.createObjectURL = vi.fn(() => 'blob:chat');
		const addText = vi.spyOn(ChatBox, 'addText').mockImplementation(() => {});
		ChatBox.tabs[ChatBox.activeTab].name = markup;
		ChatBox.saveCurrentTabChat();
		const line = document.createElement('div');
		line.innerHTML = addText.mock.calls[0][0];
		addText.mockRestore();

		expect(line.querySelector('img')).toBeNull();
		expect(line.textContent).toContain(`Chat History [${markup}]`);
		expect(line.querySelector('a').getAttribute('download')).toContain(markup);
	});
});

describe('ChatBox - the + button', () => {
	it('adds a tab with every filter off', () => {
		const before = ChatBox.tabCount;
		host.querySelector('.chat-function .battleopt2').click();

		expect(ChatBox.tabCount).toBe(before + 1);
		expect(ChatBoxSettings.tabOption[ChatBox.activeTab]).toEqual([]);
	});
});
