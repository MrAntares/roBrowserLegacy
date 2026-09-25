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
	default: { updateTab: vi.fn(), getTabs: () => [] }
}));

// KEYS is deliberately NOT mocked: `getDeepActiveElement` is installed with
// Object.defineProperty({ writable: false }), so a mock of it would be a
// different function than the one shipping, and the shadow-piercing walk is
// exactly what this guard depends on.
const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;
const KEYS = (await import('Controls/KeyEventHandler.js')).default;

function mountChatBox() {
	const host = document.createElement('div');
	host.innerHTML = ChatBox.render();
	document.body.appendChild(host);
	ChatBox._host = host;
	ChatBox._shadow = null;
	return host;
}

function enterEvent(target) {
	return {
		which: KEYS.ENTER,
		key: 'Enter',
		target,
		preventDefault: vi.fn(),
		stopImmediatePropagation: vi.fn(),
		getModifierState: () => false
	};
}

describe('ChatBox — Enter on a focused button', () => {
	let root;

	beforeEach(() => {
		document.body.innerHTML = '';
		root = mountChatBox();
	});

	// A native <button> activates on Enter keydown. ChatBox runs first, on
	// window in the capture phase, and used to cancel that default action for
	// every button in the client - which is why the guild tab strip answered
	// Space (activates on keyup, which ChatBox never touches) but not Enter.
	it('yields Enter to a focused button outside the ChatBox root', () => {
		const button = document.createElement('button');
		document.body.appendChild(button);
		button.focus();
		expect(KEYS.getDeepActiveElement()).toBe(button);

		const event = enterEvent(button);
		expect(ChatBox.onKeyDown(event)).toBe(true);
		expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	it('pierces the shadow boundary to see a button owned by another component', () => {
		const otherHost = document.createElement('div');
		document.body.appendChild(otherHost);
		const shadow = otherHost.attachShadow({ mode: 'open' });
		shadow.innerHTML = '<div class="tabs"><button class="members">Guildsmen Info</button></div>';
		const button = shadow.querySelector('button');
		button.focus();

		// document.activeElement stops at the host; only the deep walk reaches
		// the button, and the guard has to be reading the deep one.
		expect(document.activeElement).toBe(otherHost);
		expect(KEYS.getDeepActiveElement()).toBe(button);

		const event = enterEvent(otherHost);
		expect(ChatBox.onKeyDown(event)).toBe(true);
		expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
	});

	it('keeps Enter for its own buttons', () => {
		const ownButton = root.querySelector('button.cfunc');
		expect(ownButton).toBeTruthy();
		ownButton.focus();

		const event = enterEvent(ownButton);
		expect(ChatBox.onKeyDown(event)).toBe(false);
		expect(event.stopImmediatePropagation).toHaveBeenCalled();
	});

	it('still claims Enter when no button is focused', () => {
		document.body.focus();
		expect(KEYS.getDeepActiveElement().tagName).not.toBe('BUTTON');

		const event = enterEvent(document.body);
		expect(ChatBox.onKeyDown(event)).toBe(false);
		expect(event.stopImmediatePropagation).toHaveBeenCalled();
	});
});
