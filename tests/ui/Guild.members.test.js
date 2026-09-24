import { beforeEach, describe, expect, it, vi } from 'vitest';
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

	return {
		MockGUIComponent,
		MockEntity,
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
			// Opaque everywhere, so the portrait's bounding box is the whole scratch
			// and the crop runs its real arithmetic.
			getImageData: (_x, _y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4).fill(255) })
		};
	}
	return this.__ctx;
};

const Guild = (await import('UI/Components/Guild/Guild.js')).default;
const Configs = (await import('Core/Configs.js')).default;
const UIPreferences = (await import('Preferences/UI.js')).default;
const UIManager = (await import('UI/UIManager.js')).default;

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

	it('marks the online rows and only those', () => {
		Guild.setMembers(alternating(4), false);

		const rows = [...Guild.getRoot().querySelectorAll('.content.members tbody tr')];
		const online = rows.map(tr => tr.classList.contains('online'));

		// Sorted, so the online pair leads.
		expect(online).toEqual([true, true, false, false]);
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

	// 2022 pays 8px of row height for the access date - `add [esi+0x154], 8` in
	// its member layout - and no other client draws one. A row carrying 2022's
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
