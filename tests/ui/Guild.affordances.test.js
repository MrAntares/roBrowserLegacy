import { beforeEach, describe, expect, it, vi } from 'vitest';
import { member } from '../fixtures/guildMembers.js';

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
		}

		renderEntity() {}
	}
	MockEntity.TYPE_PC = 0;

	return {
		MockGUIComponent,
		MockEntity,
		sprite: { bind2DContext: vi.fn() },
		packetver: { value: 20211103 },
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
vi.mock('Network/PacketVerManager.js', () => ({ default: mocks.packetver }));
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

HTMLCanvasElement.prototype.getContext = function () {
	return { canvas: this, fillStyle: '', fillRect() {}, clearRect() {}, drawImage() {}, getImageData: (_x, _y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4).fill(255) }) };
};

const Guild = (await import('UI/Components/Guild/Guild.js')).default;
const Configs = (await import('Core/Configs.js')).default;
const UIPreferences = (await import('Preferences/UI.js')).default;

const TABS = ['info', 'members', 'positions', 'skills', 'history', 'notice'];

const POSITION_NAMES = [
	{ positionID: 0, posName: 'Guild Master' },
	{ positionID: 1, posName: 'Member' },
	{ positionID: 2, posName: 'Officer' }
];

// 0x160's payload. Apply skips any row whose `right` is still undefined - the
// mode arrives on that packet and nothing else carries it - so a positions test
// needs this and not just the names.
const POSITIONS = [
	{ positionID: 0, right: 0x111, ranking: 0, payRate: 50, posName: 'Guild Master' },
	{ positionID: 1, right: 0x001, ranking: 1, payRate: 10, posName: 'Member' },
	{ positionID: 2, right: 0x011, ranking: 2, payRate: 20, posName: 'Officer' }
];

// GPositionID comes from `i % 6`, so member(0) is the grade-0 row - the guild
// master's own - and 1 and 2 are ordinary members.
const MASTER = 0;
const ALICE = 1;
const BOB = 2;

function root() {
	return Guild.getRoot();
}

function showTab(name) {
	root()
		.querySelector(`.tabs button.${name}`)
		.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function panel(name) {
	return root().querySelector(`.content.${name}`);
}

/**
 * Remount per test rather than once for the file: `.sortlogin` latches its click
 * listener behind `dataset.bound`, so a shared mount would carry one test's
 * binding into the next.
 */
function mount() {
	Guild._host = document.createElement('div');
	document.body.innerHTML = '';
	document.body.appendChild(Guild._host);
	Guild._host.innerHTML = Guild.render();
	Guild.init();

	Guild.setAccess(0xff); // every tab reachable, or onChangeTab refuses silently
	Guild.onGuildInfoRequest = vi.fn();
	Guild.onRequestGuildEmblem = vi.fn();
	Guild.toggle = vi.fn();
}

/**
 * Keyboard reachability, the way the browser decides it: an element is in the
 * Tab order only if no ancestor is display:none.
 *
 * jsdom has no layout, so `offsetParent` is always null and `getComputedStyle`
 * cannot see Guild.css - the component stylesheet is never injected under the
 * mocked GUIComponent. The inline display that onChangeTab writes is what can be
 * read, and it is also the thing under test.
 */
function hiddenByAncestor(el) {
	for (let node = el; node && node !== root(); node = node.parentElement) {
		if (node.style.display === 'none') {
			return true;
		}
	}
	return false;
}

function reachableControls() {
	return [...root().querySelectorAll('input, select, textarea, button, a[href], [tabindex]')].filter(
		el => !el.disabled && !hiddenByAncestor(el)
	);
}

describe('guild window, tab order', () => {
	beforeEach(() => {
		Configs.set('guild', {});
		mocks.session.isGuildMaster = true;
		mount();
		Guild.setPositionsName(POSITION_NAMES);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
	});

	// The measured complaint was "72 focusable elements, Tab walks into hidden
	// tabs". It does not: all six panels live in the DOM at once, but the five
	// inactive ones carry display:none, which takes them out of the tab order.
	// The count came from a querySelectorAll with no visibility filter - live, the
	// same window reports 52 candidates against 7 to 46 genuinely focusable.
	// This pins the mechanism rather than the count: switch the hiding to
	// visibility or opacity and these fail.
	for (const name of TABS) {
		it(`hides every panel but ${name} while ${name} is up`, () => {
			showTab(name);

			for (const other of TABS) {
				expect(`${other}:${panel(other).style.display}`).toBe(`${other}:${other === name ? 'block' : 'none'}`);
			}
		});

		it(`keeps every reachable control inside ${name}`, () => {
			showTab(name);

			const strays = reachableControls()
				.map(el => el.closest('.content'))
				.filter(content => content && !content.classList.contains(name));

			expect(strays).toEqual([]);
		});
	}

	it('still offers the tab strip itself, so the window is not a dead end', () => {
		showTab('notice');

		const tabButtons = reachableControls().filter(el => el.closest('.tabs'));
		expect(tabButtons).toHaveLength(TABS.length);
	});
});

/**
 * 2022's control for the member sort, at (12, 299) on the bottom bar. ver12 never
 * had it and mars26 dropped it, having made the sort unconditional - so whether
 * it is offered at all is the deployment's `guild.memberListSort`.
 */
describe('guild window, the login-status checkbox', () => {
	beforeEach(() => {
		Configs.set('guild', {});
		mocks.session.isGuildMaster = true;
		UIPreferences.guildMemberListSorted = true;
		mount();
		Guild.setPositionsName(POSITION_NAMES);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
	});

	function sortlogin() {
		return root().querySelector('.footer .sortlogin');
	}

	// The default is mars26's 'always'. mars26 dropped the checkbox precisely
	// because the sort became unconditional, so drawing one here would offer a
	// control that toggles a preference nothing reads.
	it('is not drawn on any tab under the default sort mode', () => {
		for (const name of TABS) {
			showTab(name);
			expect(`${name}:${sortlogin().style.display}`).toBe(`${name}:none`);
		}
	});

	it("is not drawn in ver12's mode either", () => {
		Configs.set('guild', { memberListSort: 'never' });
		showTab('members');

		expect(sortlogin().style.display).toBe('none');
	});

	it("is drawn on the members tab, and only there, in 2022's mode", () => {
		Configs.set('guild', { memberListSort: 'checkbox' });

		for (const name of TABS) {
			showTab(name);
			expect(`${name}:${sortlogin().style.display}`).toBe(`${name}:${name === 'members' ? 'block' : 'none'}`);
		}
	});

	// The sort is a display order, not new guild data. It used to rebuild the
	// list through setMembers, which drops the queued grade changes as a side
	// effect and loses the guild master's unsent work.
	it('keeps the queued grade changes, which are not guild data', () => {
		Configs.set('guild', { memberListSort: 'checkbox' });
		showTab('members');
		vi.spyOn(UIPreferences, 'save').mockImplementation(() => {});

		const sent = [];
		Guild.onChangeMemberPosRequest = list => sent.push(list);

		const select = root().querySelector(`.member_${member(ALICE).AID}_${member(ALICE).GID}`);
		select.value = '2';
		select.dispatchEvent(new Event('change'));

		sortlogin().dispatchEvent(new MouseEvent('click', { bubbles: true }));
		root().querySelector('.footer .btn_ok').dispatchEvent(new Event('click'));

		expect(sent).toHaveLength(1);
		expect(sent[0]).toEqual([{ AID: member(ALICE).AID, GID: member(ALICE).GID, positionID: 2 }]);
	});

	it('reorders the list when clicked, and persists the answer', () => {
		Configs.set('guild', { memberListSort: 'checkbox' });
		showTab('members');

		const names = () => [...root().querySelectorAll('.content.members tbody tr .name .value')].map(el => el.textContent);
		const saved = vi.spyOn(UIPreferences, 'save').mockImplementation(() => {});

		// member(i) is online on odd indices, so the master is offline here and
		// sorted order genuinely differs from the server's.
		expect(names()).toEqual(['Member-1', 'Member-0', 'Member-2']);

		sortlogin().dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(UIPreferences.guildMemberListSorted).toBe(false);
		expect(saved).toHaveBeenCalled();
		expect(names()).toEqual(['Member-0', 'Member-1', 'Member-2']);

		saved.mockRestore();
	});
});

/**
 * The sort is a property of the list, not of the member-list packet. The client
 * re-sorts from its draw, so its roster is online-first at all times; ours only
 * reordered inside setMembers, which meant a member who logged in turned green
 * where they already sat and stayed there until the next full list arrived.
 */
describe('guild member list, re-sorting when someone logs in', () => {
	beforeEach(() => {
		Configs.set('guild', {});
		mocks.session.isGuildMaster = true;
		mount();
		Guild.setPositionsName(POSITION_NAMES);
	});

	function names() {
		return [...root().querySelectorAll('.content.members tbody tr .name .value')].map(el => el.textContent);
	}

	it('lifts a member to the online group the moment they connect', () => {
		const roster = [member(0, { CharName: 'a-off', CurrentState: 0 }), member(1, { CharName: 'b-on', CurrentState: 1 })];
		Guild.setMembers(roster, false);
		expect(names()).toEqual(['b-on', 'a-off']);

		const a = roster[0];
		Guild.updateMemberStatus({ AID: a.AID, GID: a.GID, status: 1 });

		// Both online now, so the server's own order is restored - and a-off came
		// first in it.
		expect(names()).toEqual(['a-off', 'b-on']);
	});

	it('drops a member to the offline group when they disconnect', () => {
		const roster = [member(0, { CharName: 'a-on', CurrentState: 1 }), member(1, { CharName: 'b-on', CurrentState: 1 })];
		Guild.setMembers(roster, false);
		expect(names()).toEqual(['a-on', 'b-on']);

		const a = roster[0];
		Guild.updateMemberStatus({ AID: a.AID, GID: a.GID, status: 0 });

		expect(names()).toEqual(['b-on', 'a-on']);
	});

	it("leaves the order alone in ver12's mode, where there is no sort", () => {
		Configs.set('guild', { memberListSort: 'never' });
		const roster = [member(0, { CharName: 'a-off', CurrentState: 0 }), member(1, { CharName: 'b-on', CurrentState: 1 })];
		Guild.setMembers(roster, false);
		expect(names()).toEqual(['a-off', 'b-on']);

		const b = roster[1];
		Guild.updateMemberStatus({ AID: b.AID, GID: b.GID, status: 0 });

		expect(names()).toEqual(['a-off', 'b-on']);
	});

	// The row keeps its identity through the move - appendChild relocates the
	// existing node - so the head canvas still belongs to the right member.
	it('moves the existing row rather than rebuilding it', () => {
		const roster = [member(0, { CharName: 'a-off', CurrentState: 0 }), member(1, { CharName: 'b-on', CurrentState: 1 })];
		Guild.setMembers(roster, false);
		const before = root().querySelector('.MemberView[data-index="0"]');

		const a = roster[0];
		Guild.updateMemberStatus({ AID: a.AID, GID: a.GID, status: 1 });

		expect(root().querySelector('.MemberView[data-index="0"]')).toBe(before);
	});
});

/**
 * The client draws the combobox on every row, including the guild master's own,
 * and refuses the change on selection. Marking it disabled instead is a
 * deliberate deviation above the binary - recorded in PR-NOTES.md - on the
 * grounds that a control which can never do anything should not look live.
 */
describe('guild window, the grade dropdown', () => {
	beforeEach(() => {
		Configs.set('guild', {});
		mocks.session.isGuildMaster = true;
		mount();
		Guild.setPositionsName(POSITION_NAMES);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
		showTab('members');
	});

	function selectOf(i) {
		const fixture = member(i);
		return root().querySelector(`.member_${fixture.AID}_${fixture.GID}`);
	}

	it("is inert on the guild master's own row", () => {
		expect(selectOf(MASTER).disabled).toBe(true);
	});

	it('is live on every other row', () => {
		expect(selectOf(ALICE).disabled).toBe(false);
		expect(selectOf(BOB).disabled).toBe(false);
	});

	// ROLLOUT decision, asm-derived: guard the combobox on newPos != 0 && oldPos
	// != 0, but keep position 0 listed. Disabling the master's row must not turn
	// into pruning the option list.
	it('still lists grade 0 on every row', () => {
		for (const i of [MASTER, ALICE, BOB]) {
			const values = [...selectOf(i).options].map(option => option.value);
			expect(values).toEqual(['0', '1', '2']);
		}
	});

	it('leaves the refusal in place, so the guard is not resting on the attribute', () => {
		// Disabled is presentation. The model-level guard is what actually keeps a
		// grade-0 row from moving, and it has to hold when called directly.
		const master = member(MASTER);
		expect(Guild.updateMemberPosition(master.AID, master.GID, 2, true)).toBe(false);
	});

	it('draws no dropdown at all for a member who is not the guild master', () => {
		mocks.session.isGuildMaster = false;
		mount();
		Guild.setPositionsName(POSITION_NAMES);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
		showTab('members');

		expect(root().querySelectorAll('.content.members .position select')).toHaveLength(0);
		// By data-index, not by row order: the rows are re-appended online-first and
		// the master is the offline one here, so he is not the first <tr>.
		expect(root().querySelector('.content.members .MemberView[data-index="0"] .position').textContent).toBe(
			'Guild Master'
		);
	});
});
