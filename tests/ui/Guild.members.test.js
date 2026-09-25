import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { alternating, uniform } from '../fixtures/guildMembers.js';

const mocks = vi.hoisted(() => {
	class MockGUIComponent {
		constructor() {
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

	class MockEntity {
		constructor() {
			this.files = { shadow: {}, body: { spr: null }, head: {} };
			this.ACTION = { IDLE: 0 };
			this._sex = -1;
			this._job = 0;
		}

		// Mirrors EntityView, because this is the behaviour the guild portrait has
		// to steer around: the `job` setter loads a body sprite, and UpdateSex's
		// first statement is `this.job = this._job`, so assigning `sex` loads one
		// too. A portrait that touches either stops being a head.
		get sex() {
			return this._sex;
		}

		set sex(value) {
			this._sex = value;
			this.job = this._job;
		}

		get job() {
			return this._job;
		}

		set job(value) {
			this._job = value;
			this.files.body.spr = 'body.spr';
		}

		renderEntity() {}
	}
	MockEntity.TYPE_PC = 0;

	/** Every pixel opaque - the default the portrait cases inherit. */
	const opaqueEverywhere = (w, h) => new Uint8ClampedArray(w * h * 4).fill(255);

	return {
		MockGUIComponent,
		MockEntity,
		alpha: opaqueEverywhere,
		opaqueEverywhere,
		sprite: { bind2DContext: vi.fn() },
		renderer: { width: 1200, height: 800, tick: 0, render: vi.fn(), stop: vi.fn() },
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
		getMessage: (id, defaultText) => (defaultText !== undefined ? defaultText : `NO MSG ${id}`)
	}
}));
vi.mock('DB/Skills/SkillInfo.js', () => ({ default: {} }));
vi.mock('DB/Monsters/MonsterTable.js', () => ({ default: {} }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('Engine/SessionStorage.js', () => ({ default: mocks.session }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: mocks.MockEntity }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: mocks.sprite }));
vi.mock('Renderer/Camera.js', () => ({ default: {} }));
vi.mock('Renderer/Renderer.js', () => ({ default: mocks.renderer }));
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

// Every canvas the member list blits into, in the order it was blitted. The head
// is cropped out of an offscreen scratch canvas and drawn into the row's cell, so
// the destination of that drawImage - not the bind offset, which now names the
// scratch - is what says whose head landed where.
const blits = [];

HTMLCanvasElement.prototype.getContext = function () {
	if (!this.__ctx) {
		this.__ctx = {
			canvas: this,
			fillStyle: '',
			fillRect() {},
			clearRect() {},
			drawImage: (...args) => blits.push({ canvas: this, args }),
			// Opaque everywhere by default, which makes the bounding box the whole
			// scratch. A case that wants to pin WHICH region is copied replaces
			// this with a mask whose opaque part is somewhere else.
			getImageData: (_x, _y, w, h) => ({ data: mocks.alpha(w, h) })
		};
	}
	return this.__ctx;
};

const Guild = (await import('UI/Components/Guild/Guild.js')).default;
const ChatBox = (await import('UI/Components/ChatBox/ChatBox.js')).default;
const Configs = (await import('Core/Configs.js')).default;
const UIPreferences = (await import('Preferences/UI.js')).default;
const UIManager = (await import('UI/UIManager.js')).default;

// Captured before any test writes the flag, so it is the value the module
// ships rather than one a test put there.
const SHIPPED = { li: UIPreferences.li };


UIManager.addComponent(Guild);

/**
 * The names as rendered, top to bottom.
 */
function rendered() {
	return [...Guild.getRoot().querySelectorAll('.content.members tbody tr .name .value')].map(el => el.textContent);
}

describe('guild member list, ordered by login status', () => {
	beforeEach(() => {
		Configs.set('guild', { memberListSort: 'always' });
		UIPreferences.guildMemberListSorted = true;

		// UIPreferences is a module singleton, so a test that writes the flag
		// leaves it written for every test declared after it.
		UIPreferences.li = SHIPPED.li;
	});

	it("leaves the server's order alone in ver12's mode", () => {
		Configs.set('guild', { memberListSort: 'never' });
		Guild.setMembers(alternating(6), false);

		expect(rendered()).toEqual(['off-0', 'ON-1', 'off-2', 'ON-3', 'off-4', 'ON-5']);
	});

	it('puts the online members first in mars26\'s mode', () => {
		Guild.setMembers(alternating(6), false);

		expect(rendered()).toEqual(['ON-1', 'ON-3', 'ON-5', 'off-0', 'off-2', 'off-4']);
	});

	it("follows the player's checkbox in 2022's mode", () => {
		Configs.set('guild', { memberListSort: 'checkbox' });

		UIPreferences.guildMemberListSorted = true;
		Guild.setMembers(alternating(4), false);
		expect(rendered()).toEqual(['ON-1', 'ON-3', 'off-0', 'off-2']);

		UIPreferences.guildMemberListSorted = false;
		Guild.setMembers(alternating(4), false);
		expect(rendered()).toEqual(['off-0', 'ON-1', 'off-2', 'ON-3']);
	});

	it('reorders without dropping anyone', () => {
		const roster = alternating(9);
		Guild.setMembers(roster, false);

		const names = rendered();
		expect(names).toHaveLength(roster.length);
		expect([...names].sort()).toEqual(roster.map(m => m.CharName).sort());
	});

	it('is stable: members sharing a status keep the order they arrived in', () => {
		// The client merge-sorts, which preserves the server's order within a
		// group. A roster that is already uniform must come back untouched.
		const online = uniform(5, true).map((m, i) => ({ ...m, CharName: `same-${i}` }));
		Guild.setMembers(online, false);

		expect(rendered()).toEqual(['same-0', 'same-1', 'same-2', 'same-3', 'same-4']);
	});

	// The heads are drawn from `_members`, which keeps the order the server sent,
	// onto canvases collected from the DOM, which the sort has reordered. Walking
	// the two by position was correct until that sort existed; after it, an
	// online member's head lands on whatever row sits at the same offset.
	it('paints each head on its own row, not on whichever row shares its offset', () => {
		const roster = alternating(4); // off-0, ON-1, off-2, ON-3
		blits.length = 0;
		mocks.renderer.tick += 5000;

		Guild.setMembers(roster, false);

		const nameOfCanvas = canvas => {
			const row = canvas.closest('tr');
			return row ? row.querySelector('.name .value').textContent : '(detached)';
		};
		const painted = blits.map(blit => nameOfCanvas(blit.canvas));

		// Sorted order is ON-1, ON-3, off-0, off-2 - so positional indexing would
		// paint ON-1's head on ON-3's row and ON-3's onto off-0's, an offline row.
		expect(painted.sort()).toEqual(['ON-1', 'ON-3']);
	});

	// A member who logs in or out while the window is open used to stop being a
	// head. `updateMemberStatus` assigned `entity.sex`, and UpdateSex's first
	// statement is `this.job = this._job` - the real job setter - so a body sprite
	// loaded and the row started drawing the feet at the portrait's ground anchor.
	it('keeps a member head-only after a status update carries their look again', () => {
		const roster = uniform(2, true);
		Guild.setMembers(roster, false);

		const member = roster[0];
		const { entity } = member;
		expect(entity.files.body.spr).toBe(null);

		Guild.updateMemberStatus({
			AID: member.AID,
			GID: member.GID,
			status: 1,
			sex: member.Sex,
			head: member.HeadType,
			headPalette: member.HeadPalette
		});

		expect(entity.files.body.spr).toBe(null);
	});

	// rAthena fills the look from the member's session and sends gender, hairStyle
	// and hairColor as 0 once there is no session left to read, so the logout
	// notice is not a look change and must not be stored as one.
	it('does not take the zeroed look a logout notice carries', () => {
		const roster = uniform(2, true).map(m => ({ ...m, Sex: 1, HeadType: 7, HeadPalette: 3 }));
		Guild.setMembers(roster, false);

		const member = roster[0];
		Guild.updateMemberStatus({
			AID: member.AID,
			GID: member.GID,
			status: 0,
			sex: 0,
			head: 0,
			headPalette: 0
		});

		expect([member.Sex, member.HeadType, member.HeadPalette]).toEqual([1, 7, 3]);
	});

	// The client announces a member connecting or disconnecting, behind the flag
	// /li writes. All three clients test it before anything is printed, each on
	// its own global and mars26 on the opposite sense.
	// @see docs/reference/guild/login-announcements.md
	describe('announcing a member connecting or disconnecting', () => {
		function announce(roster, index, status) {
			ChatBox.addText.mockClear();
			Guild.setMembers(roster, false);
			ChatBox.addText.mockClear();
			Guild.updateMemberStatus({ AID: roster[index].AID, GID: roster[index].GID, status });
			return ChatBox.addText.mock.calls.map(call => call[0]);
		}

		beforeEach(() => {
			UIPreferences.li = true;
		});

		it('names the member, and says which way they went', () => {
			const roster = alternating(3);

			expect(announce(roster, 1, 0)).toEqual(['Guild Member ON-1 has disconnected.']);
			expect(announce(roster, 1, 1)).toEqual(['Guild Member ON-1 has connected.']);
		});

		// Without a default the lookup falls through to "NO MSG 485", which is what
		// the player used to see on any table that did not carry the id.
		it('has text to fall back on when the message table has no such id', () => {
			expect(announce(uniform(1, false), 0, 1)[0]).not.toMatch(/NO MSG/);
		});

		// A whole packetver band sends the member list with no character name at
		// all, so the rendered row falls back to a placeholder rather than an
		// empty cell. The only other assertion naming the placeholder is on the
		// delegation prompt, a different path.
		it('renders a placeholder when the list carries no name', () => {
			const roster = uniform(1, false).map(m => ({ ...m, CharName: '' }));
			Guild.setMembers(roster, false);

			const cell = Guild.getRoot().querySelector('.content.members tbody tr .name .value');

			expect(cell.textContent).toBe('Nameless');
		});

		// The name used to be read back out of the row's DOM node, which is found
		// through an index that the online-count loop has already spent.
		it('takes the name from the roster rather than the rendered row', () => {
			const roster = uniform(1, false).map(m => ({ ...m, CharName: 'Rostered' }));
			Guild.setMembers(roster, false);

			const row = Guild.getRoot().querySelector('.content.members tbody tr .name .value');
			row.textContent = 'WhateverTheDomSays';

			ChatBox.addText.mockClear();
			Guild.updateMemberStatus({ AID: roster[0].AID, GID: roster[0].GID, status: 1 });

			expect(ChatBox.addText.mock.calls[0][0]).toBe('Guild Member Rostered has connected.');
		});

		it('says nothing at all while /li is off', () => {
			UIPreferences.li = false;

			expect(announce(alternating(3), 1, 1)).toEqual([]);
		});

		// The port ships this on where the client ships it off, which is a
		// deliberate departure - so the default is worth a test of its own.
		// Every other case here writes the flag before reading it, which leaves
		// the shipped value unobserved.
		it('ships on, so a fresh install announces without being asked', () => {
			expect(SHIPPED.li).toBe(true);
		});
	});

	it('marks the online rows and only those', () => {
		Guild.setMembers(alternating(4), false);

		const rows = [...Guild.getRoot().querySelectorAll('.content.members tbody tr')];
		const online = rows.map(tr => tr.classList.contains('online'));

		// Sorted, so the online pair leads.
		expect(online).toEqual([true, true, false, false]);
	});
});

/**
 * The cell is 30x30 cropped out of a 96x96 scratch, so WHICH region is copied
 * is the whole point of measuring what was drawn: asserting only that a draw
 * happened leaves the crop free to be the wrong corner of the sprite.
 */
describe('guild member list, the head cropped to what was drawn', () => {
	/** A mask opaque only inside the given bounds, inclusive. */
	function opaqueRect(x0, x1, y0, y1) {
		return (w, h) => {
			const data = new Uint8ClampedArray(w * h * 4);
			for (let y = y0; y <= y1; ++y) {
				for (let x = x0; x <= x1; ++x) {
					data[(y * w + x) * 4 + 3] = 255;
				}
			}
			return data;
		};
	}

	// The mask is module state shared with every other describe, and the ones
	// declared after this would otherwise inherit whichever rectangle ran last.
	afterEach(() => {
		mocks.alpha = mocks.opaqueEverywhere;
	});

	/** The source origin of the blit into a member's own cell. */
	function cropOrigin() {
		blits.length = 0;
		mocks.renderer.tick += 5000;
		Guild.setMembers(uniform(1, true), false);

		const blit = blits.find(entry => entry.canvas.closest('.MemberView'));
		return blit && [blit.args[1], blit.args[2]];
	}

	it('centres a drawing shorter than the cell', () => {
		mocks.alpha = opaqueRect(40, 59, 50, 69);

		// 20 wide and 20 tall against a 30x30 cell: both axes centre, so the
		// origin backs off five pixels from the drawing on each.
		expect(cropOrigin()).toEqual([35, 45]);
	});

	it('keeps the top of a drawing taller than the cell, where the head is', () => {
		mocks.alpha = opaqueRect(40, 59, 10, 90);

		// 81 tall overflows the cell, so the top is kept rather than centred.
		expect(cropOrigin()).toEqual([35, 10]);
	});
});

/**
 * The ban list has the member list's hole and worse: the 0x0a87 generation
 * carries a char id and no name at all, so every one of its rows would be blank.
 */
describe('guild expel list, a row the server sends no name for', () => {
	function expelled() {
		return [...Guild.getRoot().querySelectorAll('.content.history tbody .ExpelView')].map(row => [
			row.querySelector('.name').textContent,
			row.querySelector('.reason').textContent
		]);
	}

	it('falls back to the placeholder, keeping the reason it did send', () => {
		Guild.setExpelList([
			{ charname: 'Dismissed', reason: 'left of their own accord' },
			{ charname: '', reason: 'banned' }
		]);

		expect(expelled()).toEqual([
			['Dismissed', 'left of their own accord'],
			['Nameless', 'banned']
		]);
	});
});

/**
 * The client draws the access date unconditionally, so this switch is a
 * deployment's own choice rather than a client behaviour being reproduced.
 */
describe('guild member list, the access date sub-line', () => {
	function lastLogins() {
		return [...Guild.getRoot().querySelectorAll('.content.members tbody tr .name .lastlogin')].map(
			el => el.textContent
		);
	}

	function membersPane() {
		return Guild.getRoot().querySelector('.content.members');
	}

	it('is absent by default, since only the 2022 client draws one', () => {
		Configs.set('guild', {});
		Guild.setMembers(alternating(3), false);

		expect(lastLogins()).toEqual(['', '', '']);
		expect(membersPane().classList.contains('has-lastlogin')).toBe(false);
	});

	it('is drawn when the deployment turns it on', () => {
		Configs.set('guild', { showLastLogin: true });
		Guild.setMembers(alternating(3), false);

		expect(lastLogins().every(text => text !== '')).toBe(true);
		expect(membersPane().classList.contains('has-lastlogin')).toBe(true);
	});

	// 20220330 pays 8px of row height for the access date, and no other client
	// draws one. A row carrying that client's
	// height without its date is a shape the client never produces, so the two
	// ride the same flag.
	it('takes the taller row with it', () => {
		Configs.set('guild', { showLastLogin: true });
		Guild.setMembers(alternating(2), false);
		expect(membersPane().classList.contains('has-lastlogin')).toBe(true);

		Configs.set('guild', { showLastLogin: false });
		Guild.setMembers(alternating(2), false);
		expect(membersPane().classList.contains('has-lastlogin')).toBe(false);
	});

	// The memo-era packet carries a note and no date at all, so the taller row
	// must not appear there even if a deployment asks for it.
	it('stays single-line on a memo-era list even when asked for', () => {
		Configs.set('guild', { showLastLogin: true });
		Guild.setMembers(alternating(2), true);

		expect(membersPane().classList.contains('has-memo')).toBe(true);
		expect(membersPane().classList.contains('has-lastlogin')).toBe(false);
	});

	it('leaves the sort alone when it is the only key the server sets', () => {
		// Configs hands back the server's object whole, so a config naming only
		// showLastLogin must not take memberListSort's default down with it.
		// Set it to the non-default value, or the case proves nothing.
		Configs.set('guild', { showLastLogin: true });
		Guild.setMembers(alternating(6), false);

		expect(rendered()).toEqual(['ON-1', 'ON-3', 'ON-5', 'off-0', 'off-2', 'off-4']);
	});

	// Switched on, so an empty cell here means the timestamp was missing rather
	// than the feature being off.
	it('stays empty for a member the server has no date for', () => {
		Configs.set('guild', { showLastLogin: true });
		Guild.setMembers(
			alternating(2).map(m => ({ ...m, LastLogin: 0 })),
			false
		);

		expect(lastLogins()).toEqual(['', '']);
	});
});
