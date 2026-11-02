/**
 * tests/ui/ChatBox.paste.test.js
 *
 * The chat input is one line: text pasted into it must not bring line breaks.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: c => c, showMessageBox: vi.fn() } }));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ContextMenu/ContextMenu.js', () => ({
	default: { remove: vi.fn(), append: vi.fn(), addElement: vi.fn(), prepare: vi.fn(), __loaded: true }
}));
vi.mock('UI/Components/ChatBoxSettings/ChatBoxSettings.js', () => ({
	default: { updateTab: vi.fn(), getTabs: () => [], append: vi.fn(), tabOption: [] }
}));

const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;

ChatBox.magnet = {};
document.body.innerHTML = '';
const host = document.createElement('div');
host.innerHTML = ChatBox.render();
document.body.appendChild(host);
ChatBox._host = host;
ChatBox._shadow = null;
ChatBox.init();

const input = host.querySelector('.input-chatbox');

function paste(text) {
	const event = new Event('paste', { bubbles: true, cancelable: true });
	event.clipboardData = { getData: type => (type === 'text/plain' ? text : '') };
	input.dispatchEvent(event);
}

describe('ChatBox - paste into the chat input', () => {
	let inserted;

	beforeEach(() => {
		input.innerHTML = '';
		inserted = [];
		// jsdom has no editing commands: record what the browser would be asked to insert.
		document.queryCommandSupported = () => true;
		document.execCommand = (command, _ui, value) => {
			inserted.push(value);
			input.appendChild(document.createTextNode(value));
			return true;
		};
	});

	afterEach(() => {
		delete document.queryCommandSupported;
		delete document.execCommand;
	});

	it('turns each line break of the pasted text into a space', () => {
		paste('hello\r\nworld\nfrom\rme');

		expect(inserted).toEqual(['hello world from me']);
		expect(input.textContent).toBe('hello world from me');
	});

	it('pastes a single line unchanged', () => {
		paste('hello world');

		expect(inserted).toEqual(['hello world']);
	});
});
