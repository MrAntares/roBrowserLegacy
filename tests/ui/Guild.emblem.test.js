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
		packetver: { value: 20211103 },
		messageBox: vi.fn(),
		session: {
			AID: 2000000,
			GID: 150000,
			hasGuild: true,
			isGuildMaster: true,
			guildRight: 0,
			guildName: 'ClaudeGuild',
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
		showMessageBox: mocks.messageBox
	}
}));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ContextMenu/ContextMenu.js', () => ({
	default: { remove: vi.fn(), append: vi.fn(), addElement: vi.fn() }
}));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: vi.fn(), TYPE: { BLUE: 1 }, FILTER: { GUILD: 1 } }
}));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({
	default: { append: vi.fn(), setType: vi.fn(), remove: vi.fn(), ui: { find: () => ({ text: vi.fn() }) } }
}));
vi.mock('UI/Components/GuildCompanion/GuildCompanion.js', () => ({ default: { openDisband: vi.fn() } }));
vi.mock('UI/Components/SkillTargetSelection/SkillTargetSelection.js', () => ({ default: {} }));
vi.mock('UI/Components/SkillDescription/SkillDescription.js', () => ({ default: {} }));
vi.mock('UI/Components/WinStats/WinStats.js', () => ({ default: { getUI: () => ({ update: vi.fn() }) } }));

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
const Configs = (await import('Core/Configs.js')).default;

const REFUSAL = 'This file cannot be registered.';

/** A 24bit bitmap of the given size, headers filled as a real one would be. */
function bmp(width, height, length) {
	const data = new Uint8Array(length !== undefined ? length : 54 + width * Math.abs(height) * 3);
	const view = new DataView(data.buffer);
	data[0] = 0x42;
	data[1] = 0x4d;
	view.setUint32(2, data.length, true);
	view.setUint32(10, 54, true);
	view.setUint32(14, 40, true);
	view.setInt32(18, width, true);
	view.setInt32(22, height, true);
	view.setUint16(26, 1, true);
	view.setUint16(28, 24, true);
	return data;
}

/** A GIF whose logical screen is the given size. */
function gif(width, height, length) {
	const data = new Uint8Array(length !== undefined ? length : 128);
	const view = new DataView(data.buffer);
	data.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
	view.setUint16(6, width, true);
	view.setUint16(8, height, true);
	return data;
}

function file(data, name) {
	return new File([data], name);
}

function root() {
	return Guild.getRoot();
}

function info(selector) {
	return root().querySelector(`.content.info ${selector}`);
}

/** As ZC_GUILD_INFO delivers it. */
function guildInfo(overrides) {
	return {
		GDID: 1,
		level: 19,
		userNum: 3,
		maxUserNum: 58,
		userAverageLevel: 42,
		exp: 5121,
		maxExp: 90000,
		point: 0,
		honor: 0,
		virtue: 0,
		emblemVersion: 0,
		guildname: 'ClaudeGuild',
		masterName: 'Master',
		manageLand: '',
		...overrides
	};
}

/** Pick a file through the input the Edit button and the emblem share. */
function pick(picked) {
	const input = info('.emblem_pick input');
	Object.defineProperty(input, 'files', { value: [picked], configurable: true });
	input.dispatchEvent(new Event('change', { bubbles: true }));
	return input;
}

function overlay() {
	return root().querySelector('.emblem_drop');
}

/** Bring a file over the window, which is what raises the overlay. */
function dragEnter(types) {
	const event = new Event('dragenter', { bubbles: true, cancelable: true });
	event.dataTransfer = { types: types || ['Files'], files: [] };
	root().querySelector('#Guild').dispatchEvent(event);
	return event;
}

/** Drop a file on the overlay, which is what covers the window while dragging. */
function drop(dropped) {
	const event = new Event('drop', { bubbles: true, cancelable: true });
	event.dataTransfer = { types: ['Files'], files: dropped ? [dropped] : [] };
	overlay().dispatchEvent(event);
	return event;
}

function showTab(name) {
	root()
		.querySelector(`.tabs button.${name}`)
		.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

/**
 * Let a FileReader that was started run to completion.
 *
 * A refusal that never fires looks exactly like a file that was not read yet,
 * so anything asserting on nothing-happened has to wait for the read first.
 */
function settle() {
	return new Promise(resolve => {
		const reader = new FileReader();
		reader.onload = () => setTimeout(resolve, 0);
		reader.readAsArrayBuffer(new Blob([new Uint8Array(1)]));
	});
}

function sent() {
	return vi.waitFor(() => {
		expect(Guild.onSendEmblem).toHaveBeenCalled();
		return Guild.onSendEmblem.mock.calls[0][0];
	});
}

function refused() {
	return vi.waitFor(() => {
		expect(mocks.messageBox).toHaveBeenCalled();
		return mocks.messageBox.mock.calls[0];
	});
}

describe('Guild emblem picker', () => {
	beforeEach(() => {
		mocks.messages = {};
		mocks.packetver.value = 20211103;
		mocks.messageBox.mockReset();
		mocks.session.isGuildMaster = true;
		Configs.set('guild', {});

		Guild._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(Guild._host);
		Guild._host.innerHTML = Guild.render();
		Guild.init();

		// Without the access mask every tab but Guild Info refuses to open, so
		// the tab-scoping cases below would pass without ever leaving it.
		Guild.setAccess(0xff);
		Guild.onGuildInfoRequest = vi.fn();
		Guild.onRequestGuildEmblem = vi.fn();
		Guild.onSendEmblem = vi.fn();

		// No tab carries `active` in the markup, and the drop overlay is scoped
		// to the one the emblem is on.
		showTab('info');
	});

	describe('the guild-master gate', () => {
		// The client parks the Edit button off-screen for anyone but the master
		// and gates nothing else on this tab. Both web entry points ride on it.
		it('a non-master gets neither the button nor a clickable emblem', () => {
			mocks.session.isGuildMaster = false;

			Guild.setGuildInformations(guildInfo({ masterName: 'Someone Else' }));

			expect(info('.emblem_edit').style.display).toBe('none');
			expect(info('.emblem_pick').style.display).toBe('none');
		});

		// The emblem is the container's background and the picker is a label
		// inside it, so hiding the way in must not take the picture with it.
		// Nothing else pins that, and the tidier fix - hiding the container -
		// would blank the emblem for every member but the master.
		it('a non-master still sees the emblem, only not the way in', () => {
			mocks.session.isGuildMaster = false;

			Guild.setEmblem({ src: 'emblem.bmp' });
			Guild.setGuildInformations(guildInfo({ masterName: 'Someone Else' }));

			expect(info('.emblem_container').style.backgroundImage).toContain('emblem.bmp');
			expect(info('.emblem_container').style.display).not.toBe('none');
			expect(info('.emblem_pick').style.display).toBe('none');
		});

		it('the master gets both', () => {
			Guild.setGuildInformations(guildInfo());

			expect(info('.emblem_edit').style.display).toBe('');
			expect(info('.emblem_pick').style.display).toBe('');
		});

		it('a drop by a non-master does nothing at all', async () => {
			mocks.session.isGuildMaster = false;

			drop(file(bmp(24, 24), 'emblem.bmp'));
			await settle();

			expect(Guild.onSendEmblem).not.toHaveBeenCalled();
			expect(mocks.messageBox).not.toHaveBeenCalled();
		});

		it('a drop is swallowed either way, so the page is never navigated away', () => {
			mocks.session.isGuildMaster = false;

			expect(drop(file(bmp(24, 24), 'emblem.bmp')).defaultPrevented).toBe(true);
			expect(dragEnter().defaultPrevented).toBe(true);
		});

		it('only the master is offered the window as a drop target', () => {
			mocks.session.isGuildMaster = false;
			dragEnter();
			expect(overlay().classList.contains('dragover')).toBe(false);

			mocks.session.isGuildMaster = true;
			dragEnter();
			expect(overlay().classList.contains('dragover')).toBe(true);
		});
	});

	describe('the window as a drop target', () => {
		// The emblem alone is a 24x24 target, so the window stands in for it -
		// but only while a file is over it, and only where the emblem is.
		it('stays out of the way until a file is dragged over', () => {
			expect(overlay().classList.contains('dragover')).toBe(false);
		});

		it('ignores a drag that carries no file', () => {
			dragEnter(['text/plain']);

			expect(overlay().classList.contains('dragover')).toBe(false);
		});

		it('stays down on a tab the emblem does not live on', () => {
			showTab('members');

			dragEnter();

			expect(overlay().classList.contains('dragover')).toBe(false);
		});

		it('goes away when the drag leaves the window', () => {
			dragEnter();

			overlay().dispatchEvent(new Event('dragleave', { bubbles: true }));

			expect(overlay().classList.contains('dragover')).toBe(false);
		});

		it('goes away once the file is dropped', async () => {
			dragEnter();

			drop(file(bmp(24, 24), 'emblem.bmp'));
			await sent();

			expect(overlay().classList.contains('dragover')).toBe(false);
		});
	});

	describe('the three ways in', () => {
		// The browser dialog filters by name the way the client filtered its
		// directory listing; a drop bypasses it and the header check catches it.
		it('the picker offers the two formats the client enumerates', () => {
			expect(info('.emblem_pick input').getAttribute('accept')).toBe('.bmp,.gif,image/bmp,image/gif');
		});

		it('the Edit button opens the emblem picker', () => {
			const input = info('.emblem_pick input');
			input.click = vi.fn();

			info('.emblem_edit').dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(input.click).toHaveBeenCalled();
		});

		it('picking a file sends it', async () => {
			pick(file(bmp(24, 24), 'emblem.bmp'));

			expect(Array.from(await sent())).toEqual(Array.from(bmp(24, 24)));
			expect(mocks.messageBox).not.toHaveBeenCalled();
		});

		it('dropping a file sends it', async () => {
			drop(file(bmp(24, 24), 'emblem.bmp'));

			expect(Array.from(await sent())).toEqual(Array.from(bmp(24, 24)));
			expect(mocks.messageBox).not.toHaveBeenCalled();
		});

		it('dropping nothing is not an error', async () => {
			drop(null);
			await settle();

			expect(Guild.onSendEmblem).not.toHaveBeenCalled();
			expect(mocks.messageBox).not.toHaveBeenCalled();
		});

		// jsdom reports a file input's value as '' whatever happens to it, so
		// the assignment has to be watched rather than the result read back.
		it('the input is cleared, so the same file can be picked again', async () => {
			const input = info('.emblem_pick input');
			const cleared = vi.fn();
			Object.defineProperty(input, 'value', { get: () => '', set: cleared, configurable: true });

			pick(file(bmp(16, 16), 'small.bmp'));
			await refused();

			expect(cleared).toHaveBeenCalledWith('');
		});
	});

	describe('what is accepted', () => {
		it('a 24x24 bitmap stored top-down, whose height is negated', async () => {
			pick(file(bmp(24, -24), 'emblem.bmp'));

			await sent();
		});

		it('a 24x24 gif', async () => {
			pick(file(gif(24, 24), 'emblem.gif'));

			await sent();
		});
	});

	describe('what is refused', () => {
		// The size cap alone let this through: a 16x16 bitmap is 822 bytes, well
		// under the 1783 that stands in for a 24x24 one, and it uploaded.
		it('a bitmap that is not 24x24, whatever its size says', async () => {
			pick(file(bmp(16, 16), 'small.bmp'));

			await refused();
			expect(Guild.onSendEmblem).not.toHaveBeenCalled();
		});

		it('a gif that is not 24x24', async () => {
			pick(file(gif(32, 32), 'big.gif'));

			await refused();
			expect(Guild.onSendEmblem).not.toHaveBeenCalled();
		});

		// Both dimensions, separately. A square fixture cannot tell the two
		// comparisons apart: either one alone still rejects it.
		it('a bitmap right in one dimension and wrong in the other', async () => {
			pick(file(bmp(16, 24), 'narrow.bmp'));
			await refused();

			mocks.messageBox.mockReset();
			pick(file(bmp(24, 16), 'short.bmp'));
			await refused();

			expect(Guild.onSendEmblem).not.toHaveBeenCalled();
		});

		it('a gif right in one dimension and wrong in the other', async () => {
			pick(file(gif(16, 24), 'narrow.gif'));
			await refused();

			mocks.messageBox.mockReset();
			pick(file(gif(24, 16), 'short.gif'));
			await refused();

			expect(Guild.onSendEmblem).not.toHaveBeenCalled();
		});

		it('a bitmap too large for the server to store', async () => {
			pick(file(bmp(24, 24, 2358), 'deep.bmp'));

			await refused();
		});

		it('a gif over 50Kb', async () => {
			pick(file(gif(24, 24, 50001), 'animated.gif'));

			await refused();
		});

		it('a file that is neither, whatever it is named', async () => {
			pick(file(new Uint8Array(1000), 'emblem.bmp'));

			await refused();
		});

		it('a dropped file, the same way', async () => {
			drop(file(bmp(16, 16), 'small.bmp'));

			await refused();
			expect(Guild.onSendEmblem).not.toHaveBeenCalled();
		});

		it('with the client own message, on a single OK', async () => {
			pick(file(bmp(16, 16), 'small.bmp'));

			const call = await refused();
			expect(call[0]).toBe(REFUSAL);
			expect(call[1]).toBe('ok');
		});

		it('with the served string when the table carries one', async () => {
			mocks.messages[3587] = 'Das Bild kann nicht registriert werden.';
			pick(file(bmp(16, 16), 'small.bmp'));

			const call = await refused();
			expect(call[0]).toBe('Das Bild kann nicht registriert werden.');
		});
	});
});
