/**
 * tests/ui/ChatBox.itemLinks.test.js
 *
 * A received line holding an item link is rendered as HTML so the link can be
 * clicked; everything else in that line must still show as text.
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

const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;

function mountChatBox() {
	const host = document.createElement('div');
	host.innerHTML = ChatBox.render();
	document.body.appendChild(host);
	ChatBox._host = host;
	ChatBox._shadow = null;
	return host;
}

describe('ChatBox — item links in a received line', () => {
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

	function add(text) {
		ChatBox.addText(text, ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_CHAT);
		return lastLine();
	}

	it('renders a link as a clickable span that keeps the original tag', () => {
		const line = add('look <ITEML>0a1b2c</ITEML>');

		const links = line.querySelectorAll('span.item-link');
		expect(links).toHaveLength(1);
		expect(links[0].textContent).toBe('<Item>');
		expect(links[0].getAttribute('data-item')).toBe('<ITEML>0a1b2c</ITEML>');
		expect(line.textContent).toBe('look <Item>');
	});

	it('renders every link of a line', () => {
		const line = add('<ITEML>01</ITEML> or <ITEM>Apple<INFO>512</INFO></ITEM>?');

		const links = line.querySelectorAll('span.item-link');
		expect(links).toHaveLength(2);
		expect(links[1].getAttribute('data-item')).toBe('<ITEM>Apple<INFO>512</INFO></ITEM>');
		expect(line.textContent).toBe('<Item> or <Apple>?');
	});

	it('keeps the text around a link as text', () => {
		const line = add('<img src=x onerror="alert(1)"> Tom & Jerry <ITEML>01</ITEML>');

		expect(line.querySelector('img')).toBeNull();
		expect(line.textContent).toBe('<img src=x onerror="alert(1)"> Tom & Jerry <Item>');
	});

	it('does not let a colour code hide a tag next to a link', () => {
		const line = add('<im^FF0000g src=x onerror=alert(1)> <ITEML>01</ITEML>');

		expect(line.querySelector('img')).toBeNull();
		expect(line.textContent).toBe('<img src=x onerror=alert(1)> <Item>');
	});

	it('shows the name of a link as text', () => {
		const line = add('<ITEM><b>Apple</b><INFO>512</INFO></ITEM>');

		expect(line.querySelector('b')).toBeNull();
		expect(line.querySelector('span.item-link').textContent).toBe('<<b>Apple</b>>');
	});

	it('keeps a quote in the link inside its data-item attribute', () => {
		const link = '<ITEM>a" onmouseover="alert(1)<INFO>512</INFO></ITEM>';
		const span = add(link).querySelector('span.item-link');

		expect(span.hasAttribute('onmouseover')).toBe(false);
		expect(span.getAttribute('data-item')).toBe(link);
	});

	it('leaves a line without a link as plain text', () => {
		const line = add('<b>hi</b> & bye');

		expect(line.querySelector('b')).toBeNull();
		expect(line.textContent).toBe('<b>hi</b> & bye');
	});
});
