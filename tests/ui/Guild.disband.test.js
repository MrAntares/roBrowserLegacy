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
		promptBox: vi.fn(),
		messageBox: vi.fn(),
		companion: { openDisband: vi.fn(), toggleCreate: vi.fn() },
		session: {
			AID: 2000000,
			GID: 150000,
			hasGuild: true,
			isGuildMaster: true,
			guildPermission: 0,
			guildName: 'Valhalla',
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
		showPromptBox: mocks.promptBox,
		showMessageBox: mocks.messageBox
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
vi.mock('UI/Components/GuildCompanion/GuildCompanion.js', () => ({ default: mocks.companion }));
vi.mock('UI/Components/SkillTargetSelection/SkillTargetSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/SkillDescription/SkillDescription.js', () => ({ default: {} }));
vi.mock('UI/Components/WinStats/WinStats.js', () => ({ default: { update: vi.fn() } }));

HTMLCanvasElement.prototype.getContext = function () {
	return {
		canvas: this,
		fillStyle: '',
		fillRect() {},
		clearRect() {},
		drawImage() {},
		getImageData: (_x, _y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4).fill(255) }),
	};
};

const Guild = (await import('UI/Components/Guild/Guild.js')).default;
const Configs = (await import('Core/Configs.js')).default;

function root() {
	return Guild.getRoot();
}

function showTab(name) {
	root()
		.querySelector(`.tabs button.${name}`)
		.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function disbandButton() {
	return root().querySelector('.footer .btn_disband');
}

describe('Guild disband', () => {
	beforeEach(() => {
		mocks.messages = {};
		mocks.chat.length = 0;
		mocks.packetver.value = 20211103;
		mocks.messageBox.mockReset();
		mocks.companion.openDisband.mockReset();
		mocks.session.isGuildMaster = true;
		Configs.set('guild', {});

		Guild._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(Guild._host);
		Guild._host.innerHTML = Guild.render();
		Guild.init();

		Guild.setAccess(0xff);
		Guild.onGuildInfoRequest = vi.fn();
	});

	describe('the guild-master gate', () => {
		// The client gates its own button on the guild-master flag, and the port
		// gates twice: once on the button's visibility and once inside the
		// handler. The server refuses a non-master silently anyway, so a leak
		// here would read as a dead button rather than an error.
		// @see docs/reference/guild/create-disband-dialogs.md
		it('a non-master never sees the button', () => {
			mocks.session.isGuildMaster = false;
			showTab('info');

			expect(disbandButton().style.display).toBe('none');
		});

		it('the master sees it on the Info tab', () => {
			showTab('info');

			expect(disbandButton().style.display).toBe('block');
		});

		it('it is an Info-tab control, not a window one', () => {
			showTab('members');

			expect(disbandButton().style.display).toBe('none');
		});

		// A handover leaves the window open on whatever tab it was on, and the
		// flag's own packet is the only thing that follows it - so a demoted
		// master would keep a live Disband button standing on the Info tab.
		it('goes away when the flag moves, with no tab change behind it', () => {
			showTab('info');
			mocks.session.isGuildMaster = false;

			Guild.updateMasterView();

			expect(disbandButton().style.display).toBe('none');
		});

		it('comes back the same way', () => {
			mocks.session.isGuildMaster = false;
			showTab('info');
			mocks.session.isGuildMaster = true;

			Guild.updateMasterView();

			expect(disbandButton().style.display).toBe('block');
		});

		it('a non-master reaching the handler anyway opens nothing', () => {
			mocks.session.isGuildMaster = false;

			Guild.promptDisbandGuild();

			expect(mocks.messageBox).not.toHaveBeenCalled();
			expect(mocks.companion.openDisband).not.toHaveBeenCalled();
		});
	});

	describe('the warning step', () => {
		// The client fetches msgstring 2564, raises a box whose button-set
		// selector is 0 - a single OK - and then opens the name window without
		// testing the result.
		// @see docs/reference/guild/create-disband-dialogs.md
		it('quotes msgstring 2564 rather than a literal', () => {
			mocks.messages[2564] = 'If you are using a guild storage, all items inside it will disappear.';

			Guild.promptDisbandGuild();

			expect(mocks.messageBox.mock.calls[0][0]).toBe(
				'If you are using a guild storage, all items inside it will disappear.'
			);
		});

		it('a server shipping its own wording wins', () => {
			mocks.messages[2564] = 'Le contenu de l’entrepôt de guilde sera perdu.';

			Guild.promptDisbandGuild();

			expect(mocks.messageBox.mock.calls[0][0]).toBe('Le contenu de l’entrepôt de guilde sera perdu.');
		});

		it('carries a single OK, because the client passes button set 0', () => {
			Guild.promptDisbandGuild();

			expect(mocks.messageBox.mock.calls[0][1]).toBe('ok');
		});

		it('opens the name window unconditionally once acknowledged', () => {
			Guild.promptDisbandGuild();
			expect(mocks.companion.openDisband).not.toHaveBeenCalled();

			mocks.messageBox.mock.calls[0][2]();

			expect(mocks.companion.openDisband).toHaveBeenCalledTimes(1);
		});

		it('the button raises the same flow', () => {
			showTab('info');
			disbandButton().dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(mocks.messageBox).toHaveBeenCalledTimes(1);
		});
	});
});
