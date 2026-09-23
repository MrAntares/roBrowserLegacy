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
			this.files = { shadow: {} };
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
	return { canvas: this, fillStyle: '', fillRect() {}, clearRect() {}, drawImage() {} };
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
/**
 * onKeyDown is bound to `window` and reads focus off the document, so the press
 * has to come from a real element inside the component.
 *
 * @param {Element} from - the element to focus first
 * @return {*} whatever the handler returned; false means "consumed"
 */
function pressEnter(from) {
	from.focus();
	return Guild.onKeyDown({ which: 13, key: 'Enter' });
}

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
 * Enter reaches a window as message 0, and the base UIWindow handler re-emits
 * `this+0x8c` as a WM_COMMAND. Only the member manager and the position manager
 * set that field, both to btn_ok's `0xb0`; the other four tabs keep the base
 * constructor's inert `0x239`. So Enter applies on exactly two of the six.
 */
describe('guild window, Enter applies where the client binds a default button', () => {
	let sent;
	let sentPositions;

	beforeEach(() => {
		Configs.set('guild', {});
		mocks.session.isGuildMaster = true;
		mount();
		Guild.setPositions(POSITIONS, true);
		Guild.setPositionsName(POSITION_NAMES);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);

		sent = [];
		sentPositions = [];
		Guild.onChangeMemberPosRequest = list => sent.push(list);
		Guild.onPositionUpdateRequest = list => sentPositions.push(list);
	});

	it('applies on the positions tab', () => {
		showTab('positions');
		const title = root().querySelector('.content.positions .PositionView .title input');
		title.value = 'Renamed';
		title.dispatchEvent(new Event('change', { bubbles: true }));

		expect(pressEnter(title)).toBe(false);
		expect(sentPositions).toHaveLength(1);
	});

	// btn_send on the Notice tab is a plain button - UIGuildNoticeWnd never writes
	// +0x8c. Enter there has to stay a newline in the textarea.
	it('does nothing on the notice tab', () => {
		showTab('notice');
		const textarea = root().querySelector('.content.notice textarea.notice');

		expect(pressEnter(textarea)).toBeUndefined();
	});

	it('does nothing on the four tabs with no default button', () => {
		for (const name of ['info', 'skills', 'history', 'notice']) {
			showTab(name);
			expect(`${name}:${pressEnter(root().querySelector(`.tabs button.${name}`))}`).toBe(`${name}:undefined`);
		}
	});

	// The handler is on `window`, so without this guard an Enter typed in the
	// chatbox would flush whatever the guild window had queued.
	it('ignores Enter when the focus is outside the window', () => {
		showTab('members');
		const select = selectOf(ALICE);
		select.value = '2';
		select.dispatchEvent(new Event('change'));

		const outside = document.createElement('input');
		document.body.appendChild(outside);
		outside.focus();

		expect(Guild.onKeyDown({ which: 13, key: 'Enter' })).toBeUndefined();
		expect(sent).toEqual([]);
	});

	// ChatBox owns Enter client-wide: it captures the key on window and focuses the
	// chat box. It already yields while an input or select elsewhere has focus, so
	// Enter can reach here at all - but that also means a swallowed Enter is a key
	// the player never gets back. With nothing to apply it has to fall through.
	it('leaves Enter alone when there is nothing to apply', () => {
		showTab('members');

		expect(pressEnter(selectOf(ALICE))).toBeUndefined();
		expect(sent).toEqual([]);
	});

	// ...and having applied, the control is released, so the *next* Enter is the
	// chat key again rather than a no-op behind ChatBox's own guard.
	it('releases the focus after applying, so the next Enter opens the chat', () => {
		showTab('members');
		const select = selectOf(ALICE);
		select.value = '2';
		select.dispatchEvent(new Event('change'));

		expect(pressEnter(select)).toBe(false);
		expect(sent).toHaveLength(1);
		expect(document.activeElement).not.toBe(select);

		// Second press: nothing queued, nothing focused, not consumed.
		expect(Guild.onKeyDown({ which: 13, key: 'Enter' })).toBeUndefined();
		expect(sent).toHaveLength(1);
	});

	// The tab strip is six real <button>s, which activate on Enter and Space by
	// themselves. Consuming Enter here would preventDefault that activation and
	// the tab would never switch.
	it('leaves Enter to a focused button rather than applying', () => {
		showTab('members');
		const select = selectOf(ALICE);
		select.value = '2';
		select.dispatchEvent(new Event('change'));

		expect(pressEnter(root().querySelector('.tabs button.positions'))).toBeUndefined();
		expect(sent).toEqual([]);
	});

	it('still closes on Escape', () => {
		Guild.toggle = vi.fn();
		showTab('members');

		Guild.onKeyDown({ which: 27, key: 'Escape' });

		expect(Guild.toggle).toHaveBeenCalled();
	});

	function selectOf(i) {
		const fixture = member(i);
		return root().querySelector(`.member_${fixture.AID}_${fixture.GID}`);
	}
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

	it('applies a queued grade change on Enter', () => {
		const sent = [];
		Guild.onChangeMemberPosRequest = list => sent.push(list);

		const alice = member(ALICE);
		const select = selectOf(ALICE);
		select.value = '2';
		select.dispatchEvent(new Event('change'));

		expect(pressEnter(select)).toBe(false); // consumed
		expect(sent).toHaveLength(1);
		expect(sent[0]).toEqual([{ AID: alice.AID, GID: alice.GID, positionID: 2 }]);
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
