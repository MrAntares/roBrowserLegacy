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
		// Every fillRect the tendency chart paints, in order, as
		// [x, y, w, h, fillStyle]. jsdom has no 2d context at all, so this
		// doubles as the stub the component needs to render without throwing.
		fills: [],
		contextMenu: { remove: vi.fn(), append: vi.fn(), addElement: vi.fn() },
		promptBox: vi.fn(),
		session: {
			AID: 2000000,
			GID: 150000,
			hasGuild: true,
			isGuildMaster: true,
			guildRight: 0,
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
		showPromptBox: mocks.promptBox,
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
vi.mock('UI/Components/WinStats/WinStats.js', () => ({ default: { getUI: () => ({ update: vi.fn() }) } }));

HTMLCanvasElement.prototype.getContext = function () {
	const ctx = {
		canvas: this,
		fillStyle: '',
		fillRect(x, y, w, h) {
			mocks.fills.push([x, y, w, h, ctx.fillStyle]);
		},
		clearRect() {},
		drawImage() {},
		getImageData: (_x, _y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4).fill(255) }),
	};
	return ctx;
};

const Guild = (await import('UI/Components/Guild/Guild.js')).default;
const Configs = (await import('Core/Configs.js')).default;

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

function root() {
	return Guild.getRoot();
}

function info(selector) {
	return root().querySelector(`.content.info ${selector}`);
}

function showTab(name) {
	root()
		.querySelector(`.tabs button.${name}`)
		.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('Guild info tab', () => {
	beforeEach(() => {
		mocks.messages = {};
		mocks.chat.length = 0;
		mocks.fills.length = 0;
		mocks.packetver.value = 20211103;
		mocks.session.isGuildMaster = true;
		Configs.set('guild', {});

		Guild._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(Guild._host);
		Guild._host.innerHTML = Guild.render();
		Guild.init();

		Guild.setAccess(0xff);
		Guild.onGuildInfoRequest = vi.fn();
		Guild.onRequestGuildEmblem = vi.fn();
		Guild.onRequestDeleteRelation = vi.fn();
		Guild.toggle = vi.fn();
	});

	describe('experience at max guild level', () => {
		// mars26 blanks the value AND reddens the line off one comparison
		// against 50 - fcn.008464c0.asm:0x8467e0, a cmovge on the sprintf
		// vararg and another on the colour. ver12 blanks only
		// (fcn.004a7e40.asm:271-302) and 2022 reddens only
		// (fcn.005f2750.asm:0x5f2abf). We draw the newest.
		it('below max level shows the real figure', () => {
			Guild.setGuildInformations(guildInfo({ level: 49, exp: 5121 }));

			expect(info('.exp .value').textContent).toBe('5121');
			expect(info('.exp').classList.contains('maxlevel')).toBe(false);
		});

		it('blanks the figure and reddens the line at max level', () => {
			Guild.setGuildInformations(guildInfo({ level: 50, exp: 5121 }));

			expect(info('.exp .value').textContent).toBe('0');
			expect(info('.exp').classList.contains('maxlevel')).toBe(true);
		});
	});

	describe('the legacy switches', () => {
		// Both off by default, so a deployment gets the newest client's tab.
		it('draw neither the chart nor Tax Point by default', () => {
			Guild.setGuildInformations(guildInfo());

			expect(info('').classList.contains('shows_tendency')).toBe(false);
			expect(info('').classList.contains('shows_taxpoint')).toBe(false);
		});

		it('turn on independently of each other', () => {
			Configs.set('guild', { showTendency: true });
			Guild.setGuildInformations(guildInfo());
			expect(info('').classList.contains('shows_tendency')).toBe(true);
			expect(info('').classList.contains('shows_taxpoint')).toBe(false);

			Configs.set('guild', { showTaxPoint: true });
			Guild.setGuildInformations(guildInfo());
			expect(info('').classList.contains('shows_tendency')).toBe(false);
			expect(info('').classList.contains('shows_taxpoint')).toBe(true);
		});

		// The switches decide whether those elements are drawn at all, so they
		// cannot wait for the first ZC_GUILD_INFO.
		it('are applied when the window opens, before any packet', () => {
			Configs.set('guild', { showTendency: true });
			// show() is a no-op on an already-open window, so start it closed.
			Guild.ui.is = vi.fn(() => false);
			Guild.show();

			expect(info('').classList.contains('shows_tendency')).toBe(true);
		});

		it('are applied on a tab change', () => {
			Configs.set('guild', { showTaxPoint: true });
			showTab('members');
			showTab('info');

			expect(info('').classList.contains('shows_taxpoint')).toBe(true);
		});

		// Naming one key must not silently take the other keys' defaults down
		// with it - Configs.get hands back the server's object whole.
		it('keep the other guild settings when a server names only one', () => {
			Configs.set('guild', { showTendency: true });
			Guild.setGuildInformations(guildInfo());

			expect(info('').classList.contains('shows_taxpoint')).toBe(false);
			expect(info('').classList.contains('shows_tendency')).toBe(true);
		});
	});

	describe('the tendency chart', () => {
		// ver12 draws frame (23,188,90,90) palette (14,6), face (24,189,88,88)
		// palette (6,2), axes (67,189,2,88) and (24,232,88,2) palette (22,2),
		// and a 2x2 palette-(2,2) marker - fcn.004a7e40.asm:433-562. The canvas
		// sits at (23,188), so these are those rects less that origin.
		function chart() {
			mocks.fills.length = 0;
			Configs.set('guild', { showTendency: true });
			Guild.setGuildInformations(guildInfo(...arguments));
			return mocks.fills;
		}

		it('paints the frame, face and both axes on the client rects', () => {
			const fills = chart();

			expect(fills[0]).toEqual([0, 0, 90, 90, '#c8c8c8']);
			expect(fills[1]).toEqual([1, 1, 88, 88, '#709fed']);
			expect(fills[2]).toEqual([44, 1, 2, 88, '#4262a5']);
			expect(fills[3]).toEqual([1, 44, 88, 2, '#4262a5']);
		});

		it('puts the marker dead centre when honor and virtue are zero', () => {
			// Which is every guild on rAthena: clif.cpp sends both hardcoded.
			const fills = chart({ honor: 0, virtue: 0 });

			expect(fills[4]).toEqual([44, 44, 2, 2, '#ffffff']);
		});

		it('moves honor along x towards F and virtue along y towards R', () => {
			expect(chart({ honor: 100, virtue: 0 })[4].slice(0, 2)).toEqual([86, 44]);
			expect(chart({ honor: -100, virtue: 0 })[4].slice(0, 2)).toEqual([2, 44]);
			expect(chart({ honor: 0, virtue: 100 })[4].slice(0, 2)).toEqual([44, 2]);
			expect(chart({ honor: 0, virtue: -100 })[4].slice(0, 2)).toEqual([44, 86]);
		});

		it('truncates towards zero rather than rounding', () => {
			// The client converts through _ftol, which sets the FPU rounding
			// mode to round-toward-zero first. 99 * 0.42 = 41.58: truncation
			// gives 41, rounding would give 42 and collide with honor 100.
			expect(chart({ honor: 99, virtue: 0 })[4][0]).toBe(85);
			expect(chart({ honor: -99, virtue: 0 })[4][0]).toBe(3);
		});

		it('carries all four compass labels', () => {
			expect(info('.tendency .righteous').textContent).toBe('R');
			expect(info('.tendency .famed').textContent).toBe('F');
			expect(info('.tendency .vulgar').textContent).toBe('V');
			expect(info('.tendency .wiked').textContent).toBe('W');
		});

		it('gives the label no value slot, since the client draws none', () => {
			expect(info('.tendency .title .value')).toBeNull();
		});
	});

	describe('the relation lists', () => {
		function relations(count, relation) {
			return Array.from({ length: count }, (_, i) => ({
				relation,
				GDID: 100 + i,
				guildName: `Guild${i}`
			}));
		}

		it('splits allies from antagonists on the relation field', () => {
			Guild.setRelations([...relations(2, 0), ...relations(3, 1)]);

			expect(info('.ally_list').children).toHaveLength(2);
			expect(info('.hostile_list').children).toHaveLength(3);
		});

		it('keeps every row the server sent, past the three the client draws', () => {
			// The client hard-stops its draw loop at three; rAthena's cap is
			// sixteen. The rows past the third are scrolled to, not dropped.
			Guild.setRelations(relations(6, 0));

			expect(info('.ally_list').children).toHaveLength(6);
		});

		it('marks only the right-clicked row active', () => {
			Guild.setRelations([...relations(3, 0), ...relations(1, 1)]);
			const rows = info('.ally_list').children;

			rows[1].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
			expect(rows[1].classList.contains('active')).toBe(true);

			rows[2].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
			expect(rows[1].classList.contains('active')).toBe(false);
			expect(rows[2].classList.contains('active')).toBe(true);
		});
	});

	describe('the members line', () => {
		// The client draws "Guildsmen : roster / cap" and then, past the online
		// icon, a separate count. roster is the member list's own length and cap
		// is maxUserNum; the packet's userNum is rAthena's connect_member, which
		// is what belongs beside the icon.
		it('takes the count beside the icon from the packet', () => {
			Guild.setGuildInformations(guildInfo({ userNum: 3, maxUserNum: 58 }));

			expect(info('.members .online').textContent).toBe('3');
			expect(info('.members .maxMember').textContent).toBe('58');
		});

		it('takes the roster from the member list, as the client does', () => {
			Guild.setGuildInformations(guildInfo({ userNum: 3, maxUserNum: 58 }));
			expect(info('.members .numMember').textContent).toBe('0');

			Guild.setMembers(
				[
					{ AID: 1, GID: 1, name: 'A', CurrentState: 1, positionID: 0 },
					{ AID: 2, GID: 2, name: 'B', CurrentState: 0, positionID: 1 }
				],
				false
			);

			expect(info('.members .numMember').textContent).toBe('2');
			expect(info('.members .online').textContent).toBe('1');
		});
	});
});
