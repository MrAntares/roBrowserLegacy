/**
 * tests/ui/ChatBox.whisper.test.js
 *
 * A whisper is drawn as HTML so the sender name can be clicked; the name and the
 * message must still show as text, in the chat and in the whisper window.
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

	return { MockGUIComponent, handlers: {} };
});

vi.mock('DB/DBManager.js', () => ({
	default: {
		getMessage: id => `msg-${id}`,
		getItemInfo: () => ({ identifiedDisplayName: 'Item' }),
		parseItemLink: link => ({ name: (/<ITEM>(.*?)<INFO>/.exec(link) || [, 'Item'])[1] })
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

vi.mock('Network/NetworkManager.js', () => ({
	default: { hookPacket: (id, fn) => (mocks.handlers[id] = fn), sendPacket: vi.fn() }
}));
vi.mock('Network/PacketStructure.js', () => ({
	default: { ZC: { WHISPER: 'WHISPER', WHISPER2: 'WHISPER2', ACK_WHISPER: 'ACK', ACK_WHISPER2: 'ACK2' } }
}));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20200101 } }));
vi.mock('Engine/MapEngine/Friends.js', () => ({ default: { isFriend: () => false } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: { Entity: { display: { name: 'Me' } } } }));
vi.mock('Audio/SoundManager.js', () => ({ default: { play: vi.fn() } }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('UI/Components/NpcBox/NpcBox.js', () => ({ default: {} }));
vi.mock('UI/Components/NpcMenu/NpcMenu.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));

const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;
const WhisperBox = (await import('UI/Components/WhisperBox/WhisperBox.js')).default;
const PrivateMessageEngine = (await import('Engine/MapEngine/PrivateMessage.js')).default;
PrivateMessageEngine();

function mountChatBox() {
	const host = document.createElement('div');
	host.innerHTML = ChatBox.render();
	document.body.appendChild(host);
	ChatBox._host = host;
	ChatBox._shadow = null;
	return host;
}

const XSS = '<img src=x onerror="alert(1)">';

describe('ChatBox — whispers', () => {
	let root;
	let tab;

	beforeEach(() => {
		document.body.innerHTML = '';
		vi.stubGlobal('requestAnimationFrame', cb => cb());
		WhisperBox.instances = {};
		WhisperBox.preferences.open1to1Stranger = false;
		root = mountChatBox();
		tab = ChatBox.addNewTab();
	});

	function lastLine() {
		return root.querySelector(`.content[data-content="${tab}"] div:last-child`);
	}

	it('shows a received whisper as text, with a clickable sender', () => {
		mocks.handlers.WHISPER({ sender: 'Bob', msg: `${XSS} hi` });

		const line = lastLine();
		expect(line.querySelector('img')).toBeNull();
		expect(line.querySelector('.nickname-link').getAttribute('data-nickname')).toBe('Bob');
		expect(line.textContent).toBe(`[ From Bob ] : ${XSS} hi`);
	});

	it('keeps the item link of a received whisper and escapes the text around it', () => {
		mocks.handlers.WHISPER({ sender: 'Bob', msg: `${XSS} <ITEML>01</ITEML>` });

		const line = lastLine();
		expect(line.querySelector('img')).toBeNull();
		expect(line.querySelector('.nickname-link').textContent).toBe('Bob');
		expect(line.querySelector('span.item-link').getAttribute('data-item')).toBe('<ITEML>01</ITEML>');
		expect(line.textContent).toBe(`[ From Bob ] : ${XSS} <Item>`);
	});

	it('keeps a sender name with a quote inside its attribute', () => {
		mocks.handlers.WHISPER({ sender: 'a" onclick="x', msg: 'hi' });

		const link = lastLine().querySelector('.nickname-link');
		expect(link.hasAttribute('onclick')).toBe(false);
		expect(link.getAttribute('data-nickname')).toBe('a" onclick="x');
	});

	it('shows the echo of a sent whisper as text', () => {
		ChatBox.PrivateMessageStorage.nick = 'Bob';
		ChatBox.PrivateMessageStorage.msg = XSS;
		mocks.handlers.ACK({ result: 0 });

		const line = lastLine();
		expect(line.querySelector('img')).toBeNull();
		expect(line.textContent).toBe(`[ To Bob ] : ${XSS}`);
	});

	it('does not turn a public line holding a nickname-link span into HTML', () => {
		ChatBox.addText(`<span class="nickname-link">x</span>${XSS}`, ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_CHAT);

		const line = lastLine();
		expect(line.querySelector('img')).toBeNull();
		expect(line.querySelector('span')).toBeNull();
	});
});

describe('WhisperBox — received text', () => {
	let content;

	beforeEach(() => {
		content = document.createElement('div');
		WhisperBox.instances = { Bob: { _contentEl: content } };
	});

	it('shows the text around an item link as text', () => {
		WhisperBox.addText('Bob', `Bob : ${XSS} <ITEM><b>Apple</b><INFO>512</INFO></ITEM>`);

		const line = content.lastElementChild;
		expect(line.querySelector('img')).toBeNull();
		expect(line.querySelector('b')).toBeNull();
		expect(line.querySelector('span.item-link').getAttribute('data-item')).toBe(
			'<ITEM><b>Apple</b><INFO>512</INFO></ITEM>'
		);
		expect(line.textContent).toBe(`Bob : ${XSS} <<b>Apple</b>>`);
	});

	it('shows a line without a link as text', () => {
		WhisperBox.addText('Bob', `Bob : ${XSS}`);

		expect(content.lastElementChild.textContent).toBe(`Bob : ${XSS}`);
	});
});
