/**
 * tests/ui/ChatBox.colorCodes.test.js
 *
 * A chat line is drawn in one colour: the client drops ^RRGGBB codes from the
 * text instead of honouring them. See docs/reference/chat/text-parsing.md.
 */
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
		getMessage: id => `msg-${id}`,
		getItemInfo: () => ({ identifiedDisplayName: 'Item' }),
		parseItemLink: () => ({ name: 'Item' })
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1200, height: 800, tick: 0, render: vi.fn(), stop: vi.fn() } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { get: vi.fn(), getOverEntity: vi.fn() } }));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile: vi.fn(),
		loadFiles: vi.fn(),
		getFile: vi.fn(),
		getFiles: vi.fn(),
		search: vi.fn()
	}
}));
vi.mock('Core/Events.js', () => ({ default: { setTimeout: vi.fn(), clearTimeout: vi.fn() } }));
vi.mock('Core/Preferences.js', () => ({
	default: { get: () => ({ save: vi.fn(), tabs: [] }) }
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
	default: { remove: vi.fn(), addElement: vi.fn(), append: vi.fn() }
}));
vi.mock('UI/Components/ChatBoxSettings/ChatBoxSettings.js', () => ({
	default: { updateTab: vi.fn(), getTabs: () => [], tabOption: [] }
}));

const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;

function mountChatBox() {
	const host = document.createElement('div');
	host.innerHTML = ChatBox.render();
	document.body.appendChild(host);
	ChatBox._host = host;
	ChatBox._shadow = null;
	return host;
}

describe('ChatBox — colour codes in a received line', () => {
	let root;
	let tab;

	beforeEach(() => {
		document.body.innerHTML = '';
		vi.stubGlobal('requestAnimationFrame', cb => cb());
		root = mountChatBox();
		tab = ChatBox.addNewTab();
	});

	function lastLine() {
		return root.querySelector(`.content[data-content="${tab}"] div:last-child`);
	}

	it('drops ^RRGGBB codes and keeps the rest of the text', () => {
		ChatBox.addText('^FF0000Server^ffffff restarts in 5 min', ChatBox.TYPE.ANNOUNCE, ChatBox.FILTER.PUBLIC_CHAT);

		const line = lastLine();
		expect(line.textContent).toBe('Server restarts in 5 min');
		expect(line.querySelector('span')).toBeNull();
	});

	it('keeps a ^ that is not followed by six hex digits', () => {
		ChatBox.addText('^_^ gg ^12345', ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_CHAT);

		expect(lastLine().textContent).toBe('^_^ gg ^12345');
	});
});
