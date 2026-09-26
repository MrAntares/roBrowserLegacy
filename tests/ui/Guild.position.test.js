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
		// Stands in for msgstringtable: what a server actually ships wins over
		// the fallback baked into the call.
		messages: {},
		chat: [],
		// The guild storage right, and its column, start at 20140205.
		packetver: { value: 20211103 },
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
			// Distinguishable, so the painted checkbox can be told from the class.
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

// jsdom ships no 2d context, and the component paints its tendency graph on init.
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
const PACKET = (await import('Network/PacketStructure.js')).default;
const Configs = (await import('Core/Configs.js')).default;

const MASTER = { AID: 2000000, GID: 150000, GPositionID: 0, CharName: 'Master' };
const ALICE = { AID: 2000001, GID: 150001, GPositionID: 1, CharName: 'Alice' };
const BOB = { AID: 2000002, GID: 150002, GPositionID: 1, CharName: 'Bob' };

function member(fixture) {
	return {
		AID: fixture.AID,
		GID: fixture.GID,
		GPositionID: fixture.GPositionID,
		CharName: fixture.CharName,
		HeadType: 1,
		HeadPalette: 0,
		Sex: 1,
		Job: 1,
		Level: 99,
		MemberExp: 0,
		CurrentState: 1,
		Memo: ''
	};
}

function root() {
	return Guild.getRoot();
}

/**
 * onValidate reads the visible tab, so only the members one may be displayed.
 */
function showMembersTab() {
	for (const content of root().querySelectorAll('.content')) {
		content.style.display = 'none';
	}
	root().querySelector('.content.members').style.display = 'block';
}

/**
 * onValidate reads the visible tab, so only the positions one may be displayed.
 */
function showPositionsTab() {
	for (const content of root().querySelectorAll('.content')) {
		content.style.display = 'none';
	}
	root().querySelector('.content.positions').style.display = 'block';
}

function positionRows() {
	return root().querySelectorAll('.content.positions tbody .PositionView');
}

/**
 * The `ui-button` half of the selector is what lets the behavioural cases below
 * run against the tree before the checkbox stopped being a button, so they fail
 * on the logic they are about rather than on a missing element.
 */
function checkboxOf(positionID, column) {
	return positionRows()[positionID].querySelector(`.${column} .checkbox, .${column} ui-button`);
}

function clickCheckbox(positionID, column) {
	const box = checkboxOf(positionID, column);
	box.dispatchEvent(new MouseEvent('click', { bubbles: true }));
	return box;
}

function selectOf(fixture) {
	return root().querySelector(`.member_${fixture.AID}_${fixture.GID}`);
}

function changeGrade(fixture, positionID) {
	const select = selectOf(fixture);
	select.value = String(positionID);
	select.dispatchEvent(new Event('change'));
	return select;
}

function applyButton() {
	return root().querySelector('.footer .btn_ok');
}

function clickApply() {
	applyButton().dispatchEvent(new Event('click'));
}

/**
 * Run the captured entries through the real packet builder and read the wire
 * back, so the assertions are on bytes and not on the intermediate array.
 */
function wireEntries(memberInfo) {
	const pkt = new PACKET.CZ.REQ_CHANGE_MEMBERPOS();
	pkt.memberInfo = memberInfo;

	const view = new DataView(pkt.build().buffer);
	expect(view.getUint16(0, true)).toBe(0x155);
	expect(view.getUint16(2, true)).toBe(4 + memberInfo.length * 12);

	const out = [];
	for (let offset = 4; offset < view.byteLength; offset += 12) {
		out.push({
			AID: view.getInt32(offset, true),
			GID: view.getInt32(offset + 4, true),
			positionID: view.getInt32(offset + 8, true)
		});
	}
	return out;
}

/**
 * The same, for the positions packet. The server walks it in fixed 40-byte
 * strides, so a field dropped or reordered here does not shorten an entry, it
 * misreads every entry after the first.
 */
function wirePositions(memberList) {
	const pkt = new PACKET.CZ.REG_CHANGE_GUILD_POSITIONINFO();
	pkt.memberList = memberList;

	const view = new DataView(pkt.build().buffer);
	expect(view.getUint16(0, true)).toBe(0x161);
	expect(view.getUint16(2, true)).toBe(4 + memberList.length * 40);

	const out = [];
	for (let offset = 4; offset < view.byteLength; offset += 40) {
		out.push({
			positionID: view.getInt32(offset, true),
			right: view.getInt32(offset + 4, true),
			ranking: view.getInt32(offset + 8, true),
			payRate: view.getInt32(offset + 12, true)
		});
	}
	return out;
}

let sent;
let sentPositions;
const chat = [];

beforeEach(() => {
	sent = [];
	sentPositions = [];
	chat.length = 0;
	mocks.chat = chat;
	mocks.packetver.value = 20211103;
	// Closing the window drops whatever the positions tab had queued, so every
	// case starts on a table the server is still allowed to repaint.
	Guild.onRemove();
	mocks.session.isGuildMaster = true;
	mocks.session.guildRight = 0;
	mocks.contextMenu.addElement.mockClear();
	mocks.promptBox.mockClear();
	for (const id in mocks.messages) {
		delete mocks.messages[id];
	}

	Guild.onChangeMemberPosRequest = list => sent.push(list);
	Guild.onPositionUpdateRequest = list => sentPositions.push(list);

	// Only 0x166 feeds the grade list here: 0x160 never arrives unless the
	// position tab was opened, and the dropdown has to work regardless.
	Guild.setPositionsName([
		{ positionID: 0, posName: 'Guild Master' },
		{ positionID: 1, posName: 'Member' },
		{ positionID: 2, posName: 'Officer' }
	]);
	Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
	showMembersTab();
});

describe('Guild member position', () => {
	it('sends one entry for one edited member', () => {
		changeGrade(ALICE, 2);
		clickApply();

		expect(sent).toHaveLength(1);
		expect(wireEntries(sent[0])).toEqual([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 2 }]);
	});

	it('batches several edits into a single packet, untouched members excluded', () => {
		changeGrade(ALICE, 2);
		changeGrade(BOB, 2);
		clickApply();

		expect(sent).toHaveLength(1);
		expect(wireEntries(sent[0])).toEqual([
			{ AID: ALICE.AID, GID: ALICE.GID, positionID: 2 },
			{ AID: BOB.AID, GID: BOB.GID, positionID: 2 }
		]);
	});

	it('keeps one entry per member, last edit wins', () => {
		changeGrade(ALICE, 2);
		changeGrade(ALICE, 1);
		changeGrade(ALICE, 2);
		clickApply();

		expect(wireEntries(sent[0])).toEqual([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 2 }]);
	});

	it('sends nothing when apply is pressed with no pending edit', () => {
		clickApply();

		expect(sent).toHaveLength(0);
	});

	it('sends nothing twice in a row', () => {
		changeGrade(ALICE, 2);
		clickApply();
		clickApply();

		expect(sent).toHaveLength(1);
	});

	// Closing the window drops them, and that had never fired: onRemove is the
	// engine's teardown, which a close does not reach.
	describe('pending edits are dropped by closing the window', () => {
		it('through hide, not only through engine teardown', () => {
			changeGrade(ALICE, 2);

			Guild.hide();
			clickApply();

			expect(sent).toHaveLength(0);
		});
	});

	describe('pending edits are dropped by fresh guild data', () => {
		it('on a member list', () => {
			changeGrade(ALICE, 2);
			Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
			showMembersTab();
			clickApply();

			expect(sent).toHaveLength(0);
		});

		it('on position names', () => {
			changeGrade(ALICE, 2);
			Guild.setPositionsName([{ positionID: 1, posName: 'Member' }]);
			clickApply();

			expect(sent).toHaveLength(0);
		});

		it('on the position acknowledgement', () => {
			changeGrade(ALICE, 2);
			Guild.setMemberPositions([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 2 }]);
			clickApply();

			expect(sent).toHaveLength(0);
		});
	});

	describe('refused selections', () => {
		it('ignores an unchanged grade', () => {
			changeGrade(ALICE, 1);
			clickApply();

			expect(sent).toHaveLength(0);
		});

		it('ignores grade 0, the guild master grade', () => {
			changeGrade(ALICE, 0);
			clickApply();

			expect(sent).toHaveLength(0);
		});

		it('refuses to move a row that sits at grade 0, the guild master own row', () => {
			// The dropdown is rendered on every row, the guard is what protects
			// grade 0 - exactly like the native client.
			expect(Guild.updateMemberPosition(MASTER.AID, MASTER.GID, 2, true)).toBe(false);

			changeGrade(MASTER, 2);
			clickApply();

			expect(sent).toHaveLength(0);
		});

		it('leaves the dropdown on the grade we know', () => {
			const select = changeGrade(ALICE, 0);

			expect(select.value).toBe('1');
		});

		it('keeps grade 0 listed in the dropdown', () => {
			expect(selectOf(ALICE).querySelector('option[value="0"]')).not.toBeNull();
		});
	});

	describe('reading a grade name the column is too narrow for', () => {
		// The cell a member sees carries its full text in a title; the dropdown
		// the guild master gets in its place did not, so the one player who can
		// change a grade was the one who could not read it.
		it('the dropdown carries the current grade name', () => {
			expect(selectOf(ALICE).title).toBe('Member');
		});

		it('it follows an accepted change', () => {
			changeGrade(ALICE, 2);

			expect(selectOf(ALICE).title).toBe('Officer');
		});

		it('a refused change leaves it on the grade the row still shows', () => {
			changeGrade(ALICE, 0);

			expect(selectOf(ALICE).title).toBe('Member');
		});

		it('it survives a single-row refresh', () => {
			Guild.setMember({ ...member(ALICE), GPositionID: 2 });

			expect(selectOf(ALICE).title).toBe('Officer');
		});
	});

	it('guards against the grade the row actually shows after a single-member refresh', () => {
		// ZC.ACK_GUILD_MEMBER_INFO re-renders one row from a brand new object.
		// The guard reads the member list back, so the list has to follow.
		Guild.setMember({ ...member(ALICE), GPositionID: 2 });

		expect(selectOf(ALICE).value).toBe('2');

		// 2 -> 1 is a real change and must be queued, not refused as unchanged.
		changeGrade(ALICE, 1);
		clickApply();

		expect(wireEntries(sent[0])).toEqual([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 1 }]);
	});

	it('sends the selected grade when only 0x166 fed the list', () => {
		// Regression: setPositionsName used to leave positionID unset, so the
		// option value read back as NaN and reached the wire as grade 0.
		expect(selectOf(ALICE).querySelector('option[value="undefined"]')).toBeNull();

		changeGrade(ALICE, 2);
		clickApply();

		expect(wireEntries(sent[0])[0].positionID).toBe(2);
	});

	it('still works when 0x160 fed the list instead', () => {
		Guild.setPositions(
			[
				{ positionID: 0, right: 0, ranking: 0, payRate: 0, posName: 'Guild Master' },
				{ positionID: 1, right: 0, ranking: 0, payRate: 0, posName: 'Member' },
				{ positionID: 2, right: 0, ranking: 0, payRate: 0, posName: 'Officer' }
			],
			true
		);
		Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
		showMembersTab();

		changeGrade(ALICE, 2);
		clickApply();

		expect(wireEntries(sent[0])[0].positionID).toBe(2);
	});

	describe('columns follow the packet', () => {
		function membersContent() {
			return root().querySelector('.content.members');
		}

		function lastLoginOf(fixture) {
			const index = fixture === ALICE ? 1 : 2;
			return root().querySelector(`.MemberView[data-index="${index}"] .name .lastlogin`);
		}

		it('hides the note column on a list that carries no note', () => {
			// 0x0aa5 / 0x0b7d: no memo on the wire, and the official client
			// dropped the column along with the field.
			expect(membersContent().classList.contains('has-memo')).toBe(false);
		});

		it('shows the note column on the list that does carry one', () => {
			Guild.setMembers([member(MASTER), member(ALICE)], true);

			expect(membersContent().classList.contains('has-memo')).toBe(true);
		});

		it('renders the last login when the list carries it', () => {
			// Off by default - only 2022 draws an access date - so the deployment
			// has to ask for it before there is anything to format.
			Configs.set('guild', { showLastLogin: true });
			Guild.setMembers([member(MASTER), { ...member(ALICE), LastLogin: 1758499200 }]);

			expect(lastLoginOf(ALICE).textContent).toContain('2025.09.22');
		});

		it('follows the format the server asks for, two-digit year included', () => {
			// The compiled default is %Y.%m.%d but the iRO table ships %y.%m.%d,
			// and the client hands whichever it has to strftime.
			mocks.messages[3011] = '%y.%m.%d';
			Configs.set('guild', { showLastLogin: true });
			Guild.setMembers([member(MASTER), { ...member(ALICE), LastLogin: 1758499200 }]);

			expect(lastLoginOf(ALICE).textContent).toContain('25.09.22');
			expect(lastLoginOf(ALICE).textContent).not.toContain('2025.09.22');
		});

		it('leaves the last login empty when the list does not', () => {
			Guild.setMembers([member(MASTER), member(ALICE)]);

			expect(lastLoginOf(ALICE).textContent).toBe('');
		});
	});

	describe('acknowledgement', () => {
		it('applies the grades the server confirms', () => {
			Guild.setMemberPositions([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 2 }]);

			expect(selectOf(ALICE).value).toBe('2');
		});

		it('reads a grade of 0 as the guild master moving', () => {
			Guild.setMemberPositions([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 0 }]);

			expect(mocks.session.isGuildMaster).toBe(false);
		});

		it('tolerates a packet with no entry', () => {
			expect(() => Guild.setMemberPositions(undefined)).not.toThrow();
		});
	});

	describe('delegation', () => {
		// Rows carry their index in the member list, in arrival order.
		function openMenuOn(index) {
			const cell = root().querySelector(`.MemberView[data-index="${index}"] td.name`);
			cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
		}

		const ALICE_ROW = 1;

		function entryLabelled(label) {
			for (const call of mocks.contextMenu.addElement.mock.calls) {
				if (call[0] === label) {
					return call[1];
				}
			}
			return null;
		}

		it('offers the entry to the guild master on someone else', () => {
			openMenuOn(ALICE_ROW);

			expect(entryLabelled('Assign Guild Leader')).not.toBeNull();
		});

		// The client hit-tests the whole row band, not the name cell. Every
		// other case here right-clicks the name, so they pass under either
		// selector and none of them notices if the band narrows back.
		it('opens from any cell of the row, not just the name', () => {
			const cell = root().querySelector(`.MemberView[data-index="${ALICE_ROW}"] td.position`);
			cell.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));

			expect(entryLabelled('Assign Guild Leader')).not.toBeNull();
		});

		it('hides the entry from a member who is not the guild master', () => {
			mocks.session.isGuildMaster = false;
			Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
			openMenuOn(ALICE_ROW);

			expect(entryLabelled('Assign Guild Leader')).toBeNull();
		});

		it('sends a single grade 0 entry once confirmed', () => {
			openMenuOn(ALICE_ROW);
			entryLabelled('Assign Guild Leader')();

			expect(sent).toHaveLength(0);

			mocks.promptBox.mock.calls[0][3]();

			expect(sent).toHaveLength(1);
			expect(wireEntries(sent[0])).toEqual([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 0 }]);
		});

		it('names the member in the confirmation', () => {
			openMenuOn(ALICE_ROW);
			entryLabelled('Assign Guild Leader')();

			expect(mocks.promptBox.mock.calls[0][0]).toContain('Alice');
		});

		it('drops the name rather than render an empty one', () => {
			// 0x0aa5 member lists carry no CharName at all.
			Guild.setMembers([member(MASTER), { ...member(ALICE), CharName: '' }]);
			openMenuOn(ALICE_ROW);
			entryLabelled('Assign Guild Leader')();

			expect(mocks.promptBox.mock.calls[0][0]).not.toContain('%s');
			expect(mocks.promptBox.mock.calls[0][0]).toContain('Nameless');
		});

		it('fills both placeholders, the member and the grade we are left with', () => {
			// The server swaps the two rows, so the outgoing master takes the
			// grade the member holds right now.
			openMenuOn(ALICE_ROW);
			entryLabelled('Assign Guild Leader')();

			const text = mocks.promptBox.mock.calls[0][0];

			expect(text).not.toContain('%s');
			expect(text).toContain('Alice');
			expect(text).toContain('Member');
		});

		it('does not queue itself as a pending edit', () => {
			openMenuOn(ALICE_ROW);
			entryLabelled('Assign Guild Leader')();
			mocks.promptBox.mock.calls[0][3]();
			sent.length = 0;

			showMembersTab();
			clickApply();

			expect(sent).toHaveLength(0);
		});
	});
});

// 0x111 is rathena's GUILD_PERM_DEFAULT - invite | expel | storage. Storage is
// the bit this tab has no column for, and must not destroy.
const POSITIONS = [
	{ positionID: 0, right: 0x111, ranking: 0, payRate: 50, posName: 'Guild Master' },
	{ positionID: 1, right: 0x001, ranking: 1, payRate: 10, posName: 'Member' },
	{ positionID: 2, right: 0x011, ranking: 2, payRate: 20, posName: 'Officer' }
];

const POSITION_NAMES = [
	{ positionID: 0, posName: 'Guild Master' },
	{ positionID: 1, posName: 'Member' },
	{ positionID: 2, posName: 'Officer' }
];

describe('Guild position tab', () => {
	describe('the permission checkbox', () => {
		it('is not a button, which would repaint over its own state', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			for (const column of ['invite', 'punish']) {
				expect(positionRows()[0].querySelector(`.${column} ui-button`)).toBeNull();
				expect(positionRows()[0].querySelector(`.${column} .checkbox`)).not.toBeNull();
			}
		});

		it('draws the storage column on a packetver that has the right', () => {
			Guild.setPositions(POSITIONS, true);

			// The class is what the stylesheet keys the sixth column and Title's
			// width off. It is decided at render, never at init: init runs at
			// import, long before the packetver is settled.
			expect(root().querySelector('.content.positions').classList.contains('has-storage')).toBe(true);
			expect(root().querySelector('.content.positions th.storage')).not.toBeNull();
		});

		it('drops the column again on an older packetver, and on "auto"', () => {
			for (const value of [20130101, 'auto']) {
				mocks.packetver.value = value;
				Guild.onRemove();
				Guild.setPositions(POSITIONS, true);

				expect(root().querySelector('.content.positions').classList.contains('has-storage')).toBe(false);
			}
		});

		it('paints the permissions the packet carried', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			expect(checkboxOf(0, 'invite').classList.contains('on')).toBe(true);
			expect(checkboxOf(0, 'punish').classList.contains('on')).toBe(true);
			expect(checkboxOf(1, 'invite').classList.contains('on')).toBe(true);
			expect(checkboxOf(1, 'punish').classList.contains('on')).toBe(false);

			expect(checkboxOf(0, 'invite').style.backgroundImage).toContain('checkbox_1.bmp');
			expect(checkboxOf(1, 'punish').style.backgroundImage).toContain('checkbox_0.bmp');
		});

		it('unticks as readily as it ticks', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			clickCheckbox(0, 'invite');
			expect(checkboxOf(0, 'invite').classList.contains('on')).toBe(false);
			expect(checkboxOf(0, 'invite').style.backgroundImage).toContain('checkbox_0.bmp');

			clickCheckbox(0, 'invite');
			expect(checkboxOf(0, 'invite').classList.contains('on')).toBe(true);
			expect(checkboxOf(0, 'invite').style.backgroundImage).toContain('checkbox_1.bmp');
		});

		it('stays where the guild master left it when the name list arrives', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();
			clickCheckbox(1, 'punish');

			// 0x166 rides in with the member list on every Members tab opening.
			Guild.setPositionsName(POSITION_NAMES);

			expect(checkboxOf(1, 'punish').classList.contains('on')).toBe(true);
		});

		it('leaves the highlight where the guild master put it', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			positionRows()[2].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
			expect(positionRows()[2].classList.contains('active')).toBe(true);

			// A refresh must not drag the bar back to the guild master's row. The
			// client only moves it from a click or from building the window.
			Guild.setPositions(POSITIONS, true);

			expect(positionRows()[2].classList.contains('active')).toBe(true);
			expect(positionRows()[0].classList.contains('active')).toBe(false);
		});

		it('starts on the first row, and goes back there with the window', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();
			positionRows()[2].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

			Guild.onRemove();
			Guild.setPositions(POSITIONS, true);

			expect(positionRows()[0].classList.contains('active')).toBe(true);
		});

		it('takes no edit from a member who is not the guild master', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();
			mocks.session.isGuildMaster = false;

			clickCheckbox(1, 'punish');

			expect(checkboxOf(1, 'punish').classList.contains('on')).toBe(false);
		});

		// Refusing the click is not enough on its own: the game cursor reads
		// whatever sits under the pointer, so a control left hit-testable still
		// offers a member a click that cannot happen. The stylesheet takes them
		// out of hit testing; this holds the flag the stylesheet keys off, which
		// is as far as jsdom can see - it has no layout and no hit testing.
		it('tells the stylesheet a member may look and not touch', () => {
			mocks.session.isGuildMaster = false;
			Guild.setPositions(POSITIONS, true);

			const pane = root().querySelector('.content.positions');
			expect(pane.classList.contains('readonly')).toBe(true);

			// Still drawn, and still showing the grades as they stand.
			expect(positionRows()).toHaveLength(3);
			expect(checkboxOf(1, 'invite').classList.contains('on')).toBe(true);
		});

		it('drops the flag again for the guild master', () => {
			mocks.session.isGuildMaster = false;
			Guild.setPositions(POSITIONS, true);

			mocks.session.isGuildMaster = true;
			Guild.setPositions(POSITIONS, true);

			expect(root().querySelector('.content.positions').classList.contains('readonly')).toBe(false);
		});
	});

	describe('the tax and title fields', () => {
		it('keep an unsaved edit when the name list arrives', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			const tax = positionRows()[1].querySelector('.tax input');
			tax.dispatchEvent(new Event('focus'));
			tax.value = '42';

			Guild.setPositionsName(POSITION_NAMES);

			expect(positionRows()[1].querySelector('.tax input').value).toBe('42');
		});
	});

	describe('applying', () => {
		it('leaves the bits the tab has no column for alone', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			clickCheckbox(0, 'invite');
			clickApply();

			expect(sentPositions).toHaveLength(1);
			expect(sentPositions[0]).toHaveLength(1);
			expect(sentPositions[0][0]).toMatchObject({ positionID: 0, right: 0x110 });
		});

		it('sends the whole mode a grant rebuilds, storage included', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			clickCheckbox(1, 'punish');
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 1, right: 0x011 });
		});

		it('carries the edited tax and title', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			const row = positionRows()[2];
			row.querySelector('.tax input').dispatchEvent(new Event('focus'));
			row.querySelector('.tax input').value = '42';
			row.querySelector('.title input').value = 'Veteran';
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 2, payRate: 42, posName: 'Veteran' });
		});

		it('keeps the tax inside the range the server can store', () => {
			// rathena caps to guild_exp_limit, per-server, ceiling 99. The native
			// edit takes two characters, which is that same ceiling.
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			const input = positionRows()[1].querySelector('.tax input');
			expect(input.getAttribute('maxlength')).toBe('2');

			input.dispatchEvent(new Event('focus'));
			input.value = '900';
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 1, payRate: 99 });
		});

		it('does not send a tax of NaN when the field is not a number', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			const input = positionRows()[1].querySelector('.tax input');
			input.dispatchEvent(new Event('focus'));
			input.value = 'ab';
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 1, payRate: 0 });
		});

		it('says so when the server keeps a different tax', () => {
			// rathena caps to guild_exp_limit and answers with what it stored.
			//
			// The cap has to differ from the number written into the message, or the
			// assertion cannot tell a substitution from the raw string: the table's
			// own text carries a literal limit rather than a placeholder, and the
			// default limit happens to be the same 50 a server would answer with.
			mocks.messages[3486] = "You can't enter value more than 50%.";

			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			const input = positionRows()[1].querySelector('.tax input');
			input.dispatchEvent(new Event('focus'));
			input.value = '99';
			clickApply();
			expect(sentPositions[0][0]).toMatchObject({ positionID: 1, payRate: 99 });

			chat.length = 0;
			Guild.setPositions([{ ...POSITIONS[1], payRate: 30 }], false);

			expect(chat).toHaveLength(1);
			// The number shown is the server's, not the one baked into the string.
			expect(chat[0]).toContain('30');
			expect(chat[0]).not.toContain('50');
			expect(chat[0]).not.toContain('%d');
		});

		it('stays quiet when the server kept what was sent', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			const input = positionRows()[1].querySelector('.tax input');
			input.dispatchEvent(new Event('focus'));
			input.value = '40';
			clickApply();

			chat.length = 0;
			Guild.setPositions([{ ...POSITIONS[1], payRate: 40 }], false);

			expect(chat).toHaveLength(0);
		});

		it('sends nothing when nothing was edited', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			clickApply();

			expect(sentPositions).toHaveLength(0);
		});

		it('grants the guild storage right from its own column', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			// Officer holds invite|expel; give it the storeroom too.
			expect(checkboxOf(2, 'storage').classList.contains('on')).toBe(false);
			clickCheckbox(2, 'storage');
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 2, right: 0x111 });
		});

		it('revokes it again, which nothing else in the tab can do', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			expect(checkboxOf(0, 'storage').classList.contains('on')).toBe(true);
			clickCheckbox(0, 'storage');
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 0, right: 0x011 });
		});

		it('leaves the bit alone on a packetver that has no column for it', () => {
			// Before 20140205 rathena does not define GUILD_PERM_STORAGE at all,
			// so the tab must neither show the right nor rewrite it.
			mocks.packetver.value = 20130101;
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			clickCheckbox(0, 'invite');
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 0, right: 0x110 });
		});

		it('survives a list the server sent with a gap in it', () => {
			// setPositions truncates the store's length to the entry count while
			// keying it by positionID, so a skipped id leaves a hole inside the
			// range. Rendering used to dereference it and throw.
			const sparse = [
				{ positionID: 0, right: 0x111, ranking: 0, payRate: 50, posName: 'Guild Master' },
				{ positionID: 1, right: 0x001, ranking: 1, payRate: 10, posName: 'Member' },
				{ positionID: 4, right: 0x011, ranking: 4, payRate: 20, posName: 'Position 4' }
			];

			Guild.setPositions([], true);
			expect(() => Guild.setPositions(sparse, true)).not.toThrow();
			showPositionsTab();

			// Ids 2 and 3 are holes: erase truncates the length to the entry
			// count, then writing index 4 grows it back past them. Only the ids
			// the server sent get a row, and Apply must pair each row with its
			// own entry rather than with row N.
			expect([...positionRows()].map(r => r.dataset.positionId)).toEqual(['0', '1', '4']);

			// Row 2, not row 1: row 1's id is also 1, so pairing by row ordinal and
			// pairing by id agree there and the assertion holds either way. Only a
			// row past a hole tells them apart.
			clickCheckbox(2, 'punish');
			clickApply();

			expect(sentPositions[0][0]).toMatchObject({ positionID: 4, right: 0x001 });
		});

		it('does not push a mode it never received', () => {
			// Only 0x166 has landed: the names are known, the rights are not, and
			// rebuilding a mode from zero here would revoke every permission.
			Guild.setPositions([], true);
			Guild.setPositionsName(POSITION_NAMES);
			showPositionsTab();
			clickCheckbox(1, 'invite');
			clickApply();

			expect(sentPositions).toHaveLength(0);
		});
	});

	// The field the server steps over is still the field the server counts on
	// being there, so the one instruction about it - echo it, never recompute -
	// is worth holding rather than only writing down.
	describe('what the positions packet puts on the wire', () => {
		it('carries the ranking it was given, in the slot the stride expects', () => {
			Guild.setPositions(POSITIONS, true);
			showPositionsTab();

			clickCheckbox(1, 'invite');
			clickApply();

			expect(wirePositions(sentPositions[0])).toEqual([
				{ positionID: 1, right: 0x000, ranking: 1, payRate: 10 }
			]);
		});
	});

	/**
	 * The tab holds its edits in its own rows, so leaving and coming back has to
	 * bring the way to apply them back too - and Apply having run has to take it
	 * away again.
	 */
	describe('Apply follows whether the tab has unsent edits', () => {
		// The display helpers above cannot serve here: it is onChangeTab that
		// decides, and only a real click runs it.
		function clickTab(name) {
			root()
				.querySelector(`.tabs button.${name}`)
				.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		}

		function applyIsOffered() {
			return applyButton().style.display !== 'none';
		}

		beforeEach(() => {
			// 0xd7 is what the server sends a guild master; onChangeTab refuses
			// the switch, silently, without the positions bit.
			Guild.setAccess(0xd7);
			Guild.setPositions(POSITIONS, true);

			// onChangeTab returns early on the tab already marked active, and the
			// mount is shared, so landing on positions takes a real transition.
			clickTab('info');
			clickTab('positions');
		});

		it('is offered again on returning to an edited tab', () => {
			clickCheckbox(1, 'invite');

			clickTab('info');
			expect(applyIsOffered()).toBe(false);
			clickTab('positions');

			expect(applyIsOffered()).toBe(true);
		});

		it('stops being offered once the edits have gone out', () => {
			clickCheckbox(1, 'invite');
			clickApply();
			expect(sentPositions).toHaveLength(1);

			clickTab('info');
			clickTab('positions');

			expect(applyIsOffered()).toBe(false);
		});
	});
});
