import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor() {
			this._host = document.createElement('div');
			this.ui = {
				show: vi.fn(),
				hide: vi.fn(),
				is: vi.fn(() => true)
			};
		}

		getRoot() {
			return this._host;
		}

		draggable() {}

		focus() {}

		parseHTML() {}
	}

	class MockEntity {
		constructor() {
			this.files = { shadow: {}, body: { spr: null }, head: {} };
			this.ACTION = { IDLE: 0 };
		}

		renderEntity() {}
	}
	MockEntity.TYPE_PC = 0;

	return {
		MockGUIComponent,
		MockEntity,
		messages: {},
		chat: [],
		packetver: { value: 20211103 },
		contextMenu: { remove: vi.fn(), append: vi.fn(), addElement: vi.fn() },
		session: {
			AID: 2000000,
			GID: 150000,
			hasGuild: true,
			isGuildMaster: true,
			guildPermission: 0,
			guildName: '',
			Character: {},
			Entity: { display: { name: 'Master' }, GUID: 1, GEmblemVer: 0 }
		}
	};
});

vi.mock('DB/DBManager.js', () => ({
	default: {
		INTERFACE_PATH: '',
		getMessage: (id, defaultText) =>
			id in mocks.messages ? mocks.messages[id] : defaultText !== undefined ? defaultText : `NO MSG ${id}`
	}
}));
vi.mock('DB/Skills/SkillInfo.js', () => ({ default: {} }));
vi.mock('DB/Monsters/MonsterTable.js', () => ({ default: {} }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('Engine/SessionStorage.js', () => ({ default: mocks.session }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: mocks.MockEntity }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: { bind2DContext: vi.fn() } }));
vi.mock('Renderer/Camera.js', () => ({ default: {} }));
vi.mock('Renderer/Renderer.js', () => ({
	default: { width: 1200, height: 800, tick: 0, render: vi.fn(), stop: vi.fn() }
}));
vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(_path, callback) {
			callback?.('');
		},
		loadFiles(_paths, callback) {
			callback?.('checkbox_0.bmp', 'checkbox_1.bmp');
		}
	}
}));
vi.mock('Network/PacketVerManager.js', () => ({ default: mocks.packetver }));
vi.mock('UI/GUIComponent.js', () => ({ default: mocks.MockGUIComponent }));
vi.mock('UI/UIManager.js', () => ({
	default: {
		addComponent(component) {
			const root = component.getRoot();
			document.body.appendChild(root);
			root.innerHTML = component.render();
			component.init();
			return component;
		},
		showPromptBox: vi.fn(),
		showMessageBox: vi.fn()
	}
}));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ContextMenu/ContextMenu.js', () => ({ default: mocks.contextMenu }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: text => mocks.chat.push(text),
		TYPE: { BLUE: 1, ERROR: 64 },
		FILTER: { GUILD: 1 }
	}
}));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({
	default: { append: vi.fn(), setType: vi.fn(), remove: vi.fn(), ui: { find: () => ({ text: vi.fn() }) } }
}));
vi.mock('UI/Components/GuildCompanion/GuildCompanion.js', () => ({ default: { openDisband: vi.fn() } }));
vi.mock('UI/Components/SkillTargetSelection/SkillTargetSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/SkillDescription/SkillDescription.js', () => ({ default: {} }));
vi.mock('UI/Components/WinStats/WinStats.js', () => ({ default: { update: vi.fn() } }));

// jsdom ships no 2d context, and the component paints its tendency graph on init.
HTMLCanvasElement.prototype.getContext = function () {
	return {
		canvas: this,
		fillStyle: '',
		fillRect() {},
		clearRect() {},
		drawImage() {},
		getImageData: (_x, _y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4).fill(255) })
	};
};

const Guild = (await import('UI/Components/Guild/Guild.js')).default;

function root() {
	return Guild.getRoot();
}

function pane() {
	return root().querySelector('.content.notice');
}

function subject() {
	return pane().querySelector('.subject');
}

function body() {
	return pane().querySelector('.notice');
}

function applyButton() {
	return root().querySelector('.footer .btn_ok');
}

function applyIsOffered() {
	return applyButton().style.display === 'block';
}

/**
 * The tab handler reads the button it was called on, so drive it through the
 * real strip rather than by calling the private function.
 */
function showTab(name) {
	root()
		.querySelector(`.tabs button.${name}`)
		.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

let sentNotices;

describe('Guild notice tab', () => {
	beforeEach(() => {
		mocks.messages = {};
		mocks.chat.length = 0;
		mocks.session.isGuildMaster = true;
		sentNotices = [];

		Guild._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(Guild._host);
		Guild._host.innerHTML = Guild.render();
		Guild.init();

		// Every tab is reachable, so onChangeTab is never refused on access.
		Guild.setAccess(0xff);
		Guild.onGuildInfoRequest = vi.fn();
		Guild.toggle = vi.fn();
		Guild.onNoticeUpdateRequest = vi.fn((subj, content) => sentNotices.push([subj, content]));
	});

	describe('what each side of the window is shown', () => {
		it('gives the guild master the two fields', () => {
			Guild.setNotice('Raid tonight', 'Meet at 20:00.\nBring supplies.');

			expect(subject().tagName).toBe('INPUT');
			expect(subject().value).toBe('Raid tonight');
			expect(body().tagName).toBe('TEXTAREA');
			expect(body().value).toBe('Meet at 20:00.\nBring supplies.');
		});

		// A deliberate departure from the client, which gives everyone a real edit
		// box and only takes the send away. The server drops a member's notice
		// without answering it at all, so a field would take an edit that is
		// neither confirmed nor refused - it simply stands there looking saved.
		it('gives a member the notice as text', () => {
			mocks.session.isGuildMaster = false;
			Guild.setNotice('Raid tonight', 'Meet at 20:00.\nBring supplies.');

			expect(subject().tagName).toBe('DIV');
			expect(subject().textContent).toBe('Raid tonight');
			expect(body().tagName).toBe('DIV');
			expect(body().textContent).toBe('Meet at 20:00.\nBring supplies.');

			expect(pane().querySelector('input')).toBeNull();
			expect(pane().querySelector('textarea')).toBeNull();
		});

		// Each value keeps the class its field was placed by, so the swap moves
		// neither box. `value` is what the stylesheet adds the wrap back with.
		it('leaves those values where the fields were', () => {
			mocks.session.isGuildMaster = false;
			Guild.setNotice('Subject', 'Body');

			expect(subject().classList.contains('value')).toBe(true);
			expect(body().classList.contains('value')).toBe(true);
		});

		// Delegation moves the flag with the window already open, and the packet
		// that carries it brings no notice of its own - so the repaint has to come
		// from the flag rather than from a notice arriving.
		it('gives the fields back when the flag moves', () => {
			mocks.session.isGuildMaster = false;
			Guild.setNotice('Raid tonight', 'Meet at 20:00.');
			expect(subject().tagName).toBe('DIV');

			mocks.session.isGuildMaster = true;
			Guild.updateMasterView();

			expect(subject().tagName).toBe('INPUT');
			expect(subject().value).toBe('Raid tonight');
			expect(body().value).toBe('Meet at 20:00.');
		});

		it('takes them away again when it moves back', () => {
			Guild.setNotice('Raid tonight', 'Meet at 20:00.');
			expect(subject().tagName).toBe('INPUT');

			mocks.session.isGuildMaster = false;
			Guild.updateMasterView();

			expect(subject().tagName).toBe('DIV');
			expect(subject().textContent).toBe('Raid tonight');
		});

		// A redraw that rebuilds the pane whatever the role destroys the draft the
		// guild master has not sent yet, and a member's text selection with it.
		// Only the role changing may swap the pair.
		it('leaves an unsent draft alone when nothing about the role changed', () => {
			Guild.setNotice('Subject', 'Body');
			const field = subject();
			field.value = 'Half-typed';

			Guild.updateMasterView();

			expect(subject()).toBe(field);
			expect(subject().value).toBe('Half-typed');
		});

		// The markup ships the fields, so anything that renders the pane only on
		// the first notice packet leaves a member looking at the master's.
		it('never shows a member the fields the markup ships', () => {
			mocks.session.isGuildMaster = false;
			Guild._host.innerHTML = Guild.render();
			Guild.init();

			expect(pane().querySelector('input')).toBeNull();
			expect(pane().querySelector('textarea')).toBeNull();
		});
	});

	describe('the way to send it', () => {
		it('offers the guild master Apply once they touch a field', () => {
			showTab('notice');
			Guild.setNotice('Subject', 'Body');
			expect(applyIsOffered()).toBe(false);

			subject().dispatchEvent(new Event('focus', { bubbles: true }));

			expect(applyIsOffered()).toBe(true);
		});

		// Two states, and only the first can tell the gate from the markup. The
		// pane is drawn at init, so a demotion under an open window is what leaves
		// a member holding fields: the reveal has to refuse on its own account
		// there. Once the pane has caught up there is nothing left to focus.
		it('never offers it to a member', () => {
			showTab('notice');
			Guild.setNotice('Subject', 'Body');
			expect(subject().tagName).toBe('INPUT');

			mocks.session.isGuildMaster = false;
			subject().dispatchEvent(new Event('focus', { bubbles: true }));
			expect(applyIsOffered()).toBe(false);

			Guild.updateMasterView();
			subject().dispatchEvent(new Event('focus', { bubbles: true }));

			expect(applyIsOffered()).toBe(false);
		});

		// The reveal happens on focus, so the demotion has to take back a button
		// the master had already been offered.
		it('takes Apply back from a master who is demoted mid-draft', () => {
			showTab('notice');
			Guild.setNotice('Subject', 'Body');
			subject().dispatchEvent(new Event('focus', { bubbles: true }));
			expect(applyIsOffered()).toBe(true);

			mocks.session.isGuildMaster = false;
			Guild.updateMasterView();

			expect(applyIsOffered()).toBe(false);
		});

		it('sends what the guild master typed', () => {
			showTab('notice');
			Guild.setNotice('Subject', 'Body');
			subject().value = 'New subject';
			body().value = 'New body';

			applyButton().dispatchEvent(new Event('click'));

			expect(sentNotices).toEqual([['New subject', 'New body']]);
		});

		// The second gate, the one the client also keeps: the button being gone is
		// not on its own a guarantee that nothing reaches the wire.
		it('sends nothing when a member reaches Apply anyway', () => {
			mocks.session.isGuildMaster = false;
			showTab('notice');
			Guild.setNotice('Subject', 'Body');

			applyButton().style.display = 'block';
			applyButton().dispatchEvent(new Event('click'));

			expect(sentNotices).toEqual([]);
		});
	});
});

/**
 * Both entry points are reached from packets, and a packet can arrive before the
 * window has ever been built - the component is only mounted when it is first
 * opened, while entering the map is not.
 */
describe('Guild notice tab, before the window exists', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		Guild._host = undefined;
		Guild._shadow = undefined;
	});

	it('takes a notice without a window to put it in', () => {
		expect(() => Guild.setNotice('Subject', 'Body')).not.toThrow();
	});

	it('redraws nothing rather than throwing', () => {
		expect(() => Guild.updateNoticeView()).not.toThrow();
	});

	// The widest of the three: the flag's packet arrives on entering the map,
	// which is before the window is ever opened.
	it('takes a flag change without a window to repaint', () => {
		expect(() => Guild.updateMasterView()).not.toThrow();
	});
});
