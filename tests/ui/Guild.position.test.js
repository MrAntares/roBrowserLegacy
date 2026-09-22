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
			this.files = { shadow: {} };
		}

		renderEntity() {}
	}
	MockEntity.TYPE_PC = 0;

	return {
		MockGUIComponent,
		MockEntity,
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
		getMessage: (id, defaultText) => (defaultText !== undefined ? defaultText : `NO MSG ${id}`)
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
			callback?.('', '');
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
		showPromptBox: mocks.promptBox,
		showMessageBox: vi.fn()
	}
}));
vi.mock('UI/Elements/Elements.js', () => ({}));
vi.mock('UI/Components/ContextMenu/ContextMenu.js', () => ({ default: mocks.contextMenu }));
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

// jsdom ships no 2d context, and the component paints its tendency graph on init.
HTMLCanvasElement.prototype.getContext = function () {
	return {
		canvas: this,
		fillStyle: '',
		fillRect() {},
		clearRect() {},
		drawImage() {}
	};
};

const Guild = (await import('UI/Components/Guild/Guild.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;

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

let sent;

beforeEach(() => {
	sent = [];
	mocks.session.isGuildMaster = true;
	mocks.session.guildRight = 0;
	mocks.contextMenu.addElement.mockClear();
	mocks.promptBox.mockClear();

	Guild.onChangeMemberPosRequest = list => sent.push(list);

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
			Guild.setMembers([member(MASTER), { ...member(ALICE), LastLogin: 1758499200 }]);

			expect(lastLoginOf(ALICE).textContent).toContain('2025.09.22');
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

			expect(entryLabelled('Delegate guild master')).not.toBeNull();
		});

		it('hides the entry from a member who is not the guild master', () => {
			mocks.session.isGuildMaster = false;
			Guild.setMembers([member(MASTER), member(ALICE), member(BOB)]);
			openMenuOn(ALICE_ROW);

			expect(entryLabelled('Delegate guild master')).toBeNull();
		});

		it('sends a single grade 0 entry once confirmed', () => {
			openMenuOn(ALICE_ROW);
			entryLabelled('Delegate guild master')();

			expect(sent).toHaveLength(0);

			mocks.promptBox.mock.calls[0][3]();

			expect(sent).toHaveLength(1);
			expect(wireEntries(sent[0])).toEqual([{ AID: ALICE.AID, GID: ALICE.GID, positionID: 0 }]);
		});

		it('names the member in the confirmation', () => {
			openMenuOn(ALICE_ROW);
			entryLabelled('Delegate guild master')();

			expect(mocks.promptBox.mock.calls[0][0]).toContain('Alice');
		});

		it('drops the name rather than render an empty one', () => {
			// 0x0aa5 member lists carry no CharName at all.
			Guild.setMembers([member(MASTER), { ...member(ALICE), CharName: '' }]);
			openMenuOn(ALICE_ROW);
			entryLabelled('Delegate guild master')();

			expect(mocks.promptBox.mock.calls[0][0]).not.toContain('%s');
			expect(mocks.promptBox.mock.calls[0][0]).not.toContain(' to ?');
		});

		it('does not queue itself as a pending edit', () => {
			openMenuOn(ALICE_ROW);
			entryLabelled('Delegate guild master')();
			mocks.promptBox.mock.calls[0][3]();
			sent.length = 0;

			showMembersTab();
			clickApply();

			expect(sent).toHaveLength(0);
		});
	});
});
