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

	const messages = {};

	class MockEntity {
		constructor() {
			this.files = { shadow: {}, body: { spr: null }, head: {} };
			this.ACTION = { IDLE: 0 };
		}

		renderEntity() {}
	}
	MockEntity.TYPE_PC = 0;

	/** The preload answering at once, which is what every case but one wants. */
	const loadFilesNow = (_paths, callback) => callback?.('checkbox_0.bmp', 'checkbox_1.bmp');

	return {
		MockGUIComponent,
		MockEntity,
		messages,
		loadFiles: loadFilesNow,
		loadFilesNow,
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
		// Table-backed, as the sibling guild files are: a case that only ever
		// sees the fallback cannot tell one msgstring id from another.
		getMessage: (id, defaultText) =>
			id in mocks.messages ? mocks.messages[id] : defaultText !== undefined ? defaultText : `NO MSG ${id}`
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
			mocks.loadFiles(_paths, callback);
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

	// Taking a control out of hit testing only answers the mouse. Tab does not
	// hit-test, so a field left in the markup stayed reachable, took focus,
	// revealed Apply and sent an edit the server refuses without saying so.
	// Nothing the keyboard can reach is the only form of that which holds.
	for (const name of ['positions', 'notice']) {
		it(`offers a member no control at all on ${name}`, () => {
			mocks.session.isGuildMaster = false;
			Guild.setPositions(POSITIONS, true);
			Guild.setNotice('Subject', 'Body');
			showTab(name);

			const offered = reachableControls().filter(el => el.closest(`.content.${name}`));

			expect(offered).toEqual([]);
		});
	}

	// rAthena sends the guild master 0xd7 and everyone else 0x57; the only bit
	// that differs is 0x80, the Announcement tab. The client draws the cell and
	// refuses the click in silence - marking it is a deliberate deviation.
	it('marks the tab a member cannot open, and only that one', () => {
		Guild.setAccess(0x57);

		const denied = [...root().querySelectorAll('.tabs button.denied')].map(b => b.className.split(' ')[0]);

		expect(denied).toEqual(['notice']);
	});

	// Marking the cell answers the mouse; the keyboard needs its own answer, or
	// Tab still lands on the tab and Enter still activates it into a silent
	// no-op. A declared deviation - the client has no such notion.
	it('takes a refused tab out of the keyboard order', () => {
		Guild.setAccess(0x57);

		const notice = root().querySelector('.tabs button.notice');
		const members = root().querySelector('.tabs button.members');

		expect(notice.tabIndex).toBe(-1);
		expect(notice.getAttribute('aria-disabled')).toBe('true');
		expect(members.tabIndex).toBe(0);
		expect(members.getAttribute('aria-disabled')).toBe('false');
	});

	it('puts it back when the mask allows it', () => {
		Guild.setAccess(0x57);
		Guild.setAccess(0xd7);

		const notice = root().querySelector('.tabs button.notice');

		expect(notice.tabIndex).toBe(0);
		expect(notice.getAttribute('aria-disabled')).toBe('false');
	});

	// The mask goes unknown on a character change, so a tab refused for the
	// previous character must not stay out of the next one's reach.
	it('puts it back on a character change', () => {
		Guild.setAccess(0x57);

		Guild.reset();

		expect(root().querySelector('.tabs button.notice').tabIndex).toBe(0);
	});

	it('leaves the guild master no tab marked', () => {
		Guild.setAccess(0x57);
		Guild.setAccess(0xd7);

		expect(root().querySelectorAll('.tabs button.denied')).toHaveLength(0);
	});

	// The client ships the text - it just never shows it here. Nothing is
	// invented, and the tooltip goes away with the refusal.
	//
	// The table's text is deliberately NOT the source's fallback. Seed them the
	// same and the case passes for any id at all, which is how a clamp-message
	// assertion in this suite once stayed green with its substitution deleted.
	// The cell is 64px and the client ellipsises rather than widening, so every
	// label is a candidate for clipping whoever is looking at it. The tooltip is
	// the label and nothing else - the refusal is said by the grey and the
	// cursor, not written out.
	it('gives every tab its full label to hover, refused or not', () => {
		mocks.messages[345] = 'Announcement';
		Guild.setAccess(0x57);

		const notice = root().querySelector('.tabs button.notice');
		expect(notice.classList.contains('denied')).toBe(true);
		expect(notice.title).toBe('Announcement');

		Guild.setAccess(0xd7);
		expect(notice.title).toBe('Announcement');
	});

	// The message table can arrive after the window is built, so the label read
	// at init is the markup's English fallback until something refreshes it.
	it('takes the label from the message table, not the markup', () => {
		mocks.messages[345] = 'Announcement';
		Guild._host.innerHTML = Guild.render();
		Guild.init();
		const notice = root().querySelector('.tabs button.notice');
		expect(notice.title).toBe('Announcement');

		delete mocks.messages[345];
		Guild._host.innerHTML = Guild.render();
		Guild.init();

		expect(root().querySelector('.tabs button.notice').title).toBe('Guild Notice');
	});

	// The window outlives a character change: log in as the guild master, open
	// Announcement, log in again as a member, and the same window is reused with
	// that tab still selected. Marking it refused leaves them standing on it.
	it('sends a member off a tab the guild master left open', () => {
		Guild.setAccess(0xd7);
		showTab('notice');
		expect(panel('notice').style.display).toBe('block');

		Guild.setAccess(0x57);

		expect(panel('notice').style.display).toBe('none');
		expect(panel('info').style.display).toBe('block');
		expect(root().querySelector('.tabs button.notice').classList.contains('active')).toBe(false);
	});

	it('leaves the guild master where they were', () => {
		Guild.setAccess(0xd7);
		showTab('notice');

		Guild.setAccess(0xd7);

		expect(panel('notice').style.display).toBe('block');
	});

	// Reported live: log in as a member, go back to character select, log in as
	// the guild master, and the window was still the member's - the roster even
	// showed the character who had just logged OUT as online, and the one now
	// playing as offline, because it was the previous session's list.
	it('keeps nothing of the character who was here before', () => {
		// As a member, so the notice renders as text and its content can be read
		// at all - an <input>'s textContent is always '', which is how the first
		// version of this case passed with the notice left untouched.
		mocks.session.isGuildMaster = false;
		Guild.setAccess(0x57);
		Guild.setPositions(POSITIONS, true);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
		Guild.setNotice('Old guild', 'Old notice');

		expect(root().querySelectorAll('.content.members tbody .MemberView').length).toBeGreaterThan(0);
		expect(root().querySelector('.tabs button.notice').classList.contains('denied')).toBe(true);

		Guild.reset();

		expect(root().querySelectorAll('.content.members tbody .MemberView')).toHaveLength(0);
		expect(root().querySelectorAll('.content.positions tbody .PositionView')).toHaveLength(0);
		expect(root().querySelector('.content.notice .subject').textContent).toBe('');
		// Nothing stays marked from a mask that belonged to someone else.
		expect(root().querySelectorAll('.tabs button.denied')).toHaveLength(0);

		// And no tab stays active. `onShow` asks for the access mask only when
		// none is - leave one and the next character is stranded on a zeroed
		// mask, which refuses every tab and never refills the roster.
		expect(root().querySelectorAll('.tabs button.active')).toHaveLength(0);
	});

	// The grade cell is a control for one person and text for everyone else, so
	// a handover has to rebuild the rows it already drew for the wrong one.
	it('rebuilds the member rows when the owner flag moves', () => {
		mocks.session.isGuildMaster = false;
		Guild.setPositionsName(POSITION_NAMES);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
		expect(root().querySelectorAll('.content.members select.changePosition')).toHaveLength(0);

		mocks.session.isGuildMaster = true;
		Guild.updateMasterView();

		expect(root().querySelectorAll('.content.members select.changePosition').length).toBeGreaterThan(0);
	});

	it('survives a reset before the window has ever been built', () => {
		const host = Guild._host;
		Guild._host = null;

		expect(() => Guild.reset()).not.toThrow();

		Guild._host = host;
	});

	// The mask is zero again after a reset, and every tab but the first reads as
	// refused against zero - so recomputing the marks there would grey the strip
	// on the way into the map, before the server has said anything.
	it('does not grey the whole strip between the reset and the access packet', () => {
		Guild.setAccess(0xd7);

		Guild.reset();

		expect(root().querySelectorAll('.tabs button.denied')).toHaveLength(0);
	});

	// The mask is unknown rather than zero until the packet lands, which is the
	// client's own sentinel: zero refuses every tab, so marking off it early
	// would paint the whole strip refused.
	//
	// Marked first, then unknown, so the second read cannot pass on a strip that
	// was never marked in the first place.
	it('marks nothing while the mask is unknown', () => {
		Guild.setAccess(0x57);
		expect(root().querySelectorAll('.tabs button.denied')).toHaveLength(1);

		Guild.setAccess(-1);
		expect(root().querySelectorAll('.tabs button.denied')).toHaveLength(0);
	});

	// The character-switch report: the window outlives the change, so the reset
	// leaves it visible with no mask. Refusing every tab is what was reported as
	// "I can't click anything".
	it('refuses no tab after a character change', () => {
		Guild.reset();

		const strip = [...root().querySelectorAll('.tabs button')];

		expect(strip.length).toBeGreaterThan(0);
		expect(strip.filter(b => b.classList.contains('denied'))).toEqual([]);
		showTab('members');
		expect(root().querySelector('.tabs button.members').classList.contains('active')).toBe(true);
	});

	it('offers the guild master those same controls', () => {
		Guild.setPositions(POSITIONS, true);
		Guild.setNotice('Subject', 'Body');

		showTab('positions');
		expect(reachableControls().filter(el => el.closest('.content.positions')).length).toBeGreaterThan(0);

		showTab('notice');
		expect(reachableControls().filter(el => el.closest('.content.notice'))).toHaveLength(2);
	});
});

/**
 * The official client never puts CZ_REQ_GUILD_MENUINTERFACE on the wire - its one
 * send site is behind a sentinel no build ever writes. We have to ask, because no
 * server tells a member unsolicited and none tells anybody on a handover, so the
 * count is what is under test: once per identity or role change, never per packet.
 *
 * See docs/reference/guild/member-view.md
 */
describe('guild window, asking which tabs open', () => {
	let asked;

	beforeEach(() => {
		mount();
		asked = vi.fn();
		Guild.onRequestAccess = asked;
	});

	it('does not ask again once the mask is known', () => {
		Guild.setAccess(0x57);

		Guild.requestAccessIfUnknown();
		Guild.requestAccessIfUnknown();

		expect(asked).not.toHaveBeenCalled();
	});

	it('asks while the mask is unknown', () => {
		Guild.invalidateAccess();

		Guild.requestAccessIfUnknown();

		expect(asked).toHaveBeenCalledTimes(1);
	});

	// The server answers a guildless player too, with no guild check of its own,
	// and that answer would then stand in for the guild they join next.
	it('does not ask without a guild to ask about', () => {
		mocks.session.hasGuild = false;
		Guild.invalidateAccess();

		Guild.requestAccessIfUnknown();

		expect(asked).not.toHaveBeenCalled();
		mocks.session.hasGuild = true;
	});

	// Twice is the regression this replaced: the handler asked on every
	// ZC_UPDATE_GDID, which an emblem change sends to the whole roster.
	it('asks once, however many times it is invited to', () => {
		Guild.invalidateAccess();

		Guild.requestAccessIfUnknown();
		Guild.setAccess(0x57);
		Guild.requestAccessIfUnknown();
		Guild.requestAccessIfUnknown();

		expect(asked).toHaveBeenCalledTimes(1);
	});

	it('asks again after a character change', () => {
		Guild.setAccess(0x57);

		Guild.reset();
		Guild.requestAccessIfUnknown();

		expect(asked).toHaveBeenCalledTimes(1);
	});

	// The client's own trigger is the window being built, and it asks whatever
	// tab is showing. Ours used to ask only when no tab was active, which is a
	// one-time bootstrap: a window already open across a character change would
	// never ask again, and that was the reported bug.
	it('asks on opening the window even with a tab already active', () => {
		Guild.invalidateAccess();
		showTab('members');
		Guild.ui.is = vi.fn(() => false);

		Guild.show();

		expect(asked).toHaveBeenCalledTimes(1);
	});

	// The marks must not outlive the mask that earned them. Forgetting the mask
	// without repainting leaves a tab grey, refusal-cursored and out of the tab
	// order while the click gate - reading the same unknown mask - lets it
	// through: the rarer direction, looks absent and still works. It also
	// re-opens a path onChangeTab cannot parse, since it derives its pane by
	// stripping only `active` from the class list.
	it('clears the marks when it forgets the mask', () => {
		Guild.setAccess(0x57);
		const notice = root().querySelector('.tabs button.notice');
		expect(notice.classList.contains('denied')).toBe(true);

		Guild.invalidateAccess();

		expect(notice.classList.contains('denied')).toBe(false);
		expect(notice.tabIndex).toBe(0);
		expect(notice.getAttribute('aria-disabled')).toBe('false');
	});

	it('leaves a tab it just unmarked actually openable', () => {
		Guild.setAccess(0x57);

		Guild.invalidateAccess();
		showTab('notice');

		const notice = root().querySelector('.tabs button.notice');
		expect(notice.classList.contains('active')).toBe(true);
		expect(panel('notice').style.display).toBe('block');
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
		mocks.loadFiles = mocks.loadFilesNow;
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

	// The preload is asynchronous, so the images can arrive after the checkbox
	// has already been shown once. Painting it on every visit rather than once
	// at bind is what keeps that first visit from staying blank for good.
	it('repaints the image on every visit, not once at bind', () => {
		Configs.set('guild', { memberListSort: 'checkbox' });

		let deliver;
		mocks.loadFiles = (_paths, callback) => {
			deliver = callback;
		};
		mount();

		const image = () => sortlogin().querySelector('ui-button').style.backgroundImage;

		deliver('early_off.bmp', 'early_on.bmp');
		showTab('members');
		expect(image()).toContain('early_on.bmp');

		// A second answer stands in for images that only landed after that paint.
		deliver('late_off.bmp', 'late_on.bmp');
		showTab('info');
		showTab('members');

		expect(image()).toContain('late_on.bmp');
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

/**
 * The value the module starts on, which no other test can reach: every one of
 * them arrives at the unknown mask through setAccess, invalidateAccess or reset.
 * A freshly loaded module is the state a first-ever login is in, and the bug this
 * sentinel exists to fix - a strip that refuses every tab - lives exactly there.
 *
 * resetModules re-runs the module and its vi.mock factories, so this needs its
 * own Guild instance rather than the one the rest of the file shares.
 */
describe('guild window, straight off a cold module', () => {
	it('starts with the mask unknown, so nothing is refused', async () => {
		vi.resetModules();
		const FreshGuild = (await import('UI/Components/Guild/Guild.js')).default;

		FreshGuild._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(FreshGuild._host);
		FreshGuild._host.innerHTML = FreshGuild.render();
		FreshGuild.init();
		FreshGuild.onGuildInfoRequest = vi.fn();
		FreshGuild.onRequestGuildEmblem = vi.fn();

		const strip = [...FreshGuild.getRoot().querySelectorAll('.tabs button')];
		expect(strip.length).toBeGreaterThan(0);
		expect(strip.filter(b => b.classList.contains('denied'))).toEqual([]);

		// And the tab a member would be refused on a real mask opens here, which
		// is what tells an unknown mask from a zero one.
		FreshGuild.getRoot()
			.querySelector('.tabs button.notice')
			.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(FreshGuild.getRoot().querySelector('.tabs button.notice').classList.contains('active')).toBe(true);
	});

	it('asks for the mask on that first open', async () => {
		vi.resetModules();
		const FreshGuild = (await import('UI/Components/Guild/Guild.js')).default;
		const asked = vi.fn();

		FreshGuild._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(FreshGuild._host);
		FreshGuild._host.innerHTML = FreshGuild.render();
		FreshGuild.init();
		FreshGuild.onGuildInfoRequest = vi.fn();
		FreshGuild.onRequestGuildEmblem = vi.fn();
		FreshGuild.onRequestAccess = asked;
		FreshGuild.ui.is = vi.fn(() => false);

		FreshGuild.show();

		expect(asked).toHaveBeenCalledTimes(1);
	});
});
