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
		// Every guild skill is INF_SELF_SKILL, so the SELF branch is the one the
		// window takes; TARGET is here only so the bit test has both sides.
		skillTargetSelection: { TYPE: { SELF: 4, TARGET: 2 }, append: vi.fn(), set: vi.fn() },
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
// Only the guild skills the cases below use. addSkill drops anything absent
// from this table, so an entry here is what makes a skill renderable at all.
vi.mock('DB/Skills/SkillInfo.js', () => ({
	default: {
		10000: { Name: 'GD_APPROVAL', SkillName: 'Official Guild Approval', MaxLv: 1, bSeperateLv: false },
		10002: { Name: 'GD_GUARDRESEARCH', SkillName: 'Guardian Research', MaxLv: 10, bSeperateLv: false },
		10005: { Name: 'GD_GLORYGUILD', SkillName: 'Guild Glory', MaxLv: 1, bSeperateLv: false },
		10013: { Name: 'GD_EMERGENCYCALL', SkillName: 'Urgent Call', MaxLv: 1, bSeperateLv: false }
	}
}));
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
vi.mock('UI/Components/SkillTargetSelection/SkillTargetSelection.js', () => ({ default: mocks.skillTargetSelection }));
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

/**
 * As ZC_GUILD_SKILLINFO delivers them: `type` is the skill's inf, so 4 is a
 * self-cast active and 0 a passive.
 */
function skill(overrides) {
	return {
		SKID: 10013,
		type: 4,
		level: 1,
		spcost: 0,
		attackRange: 1,
		upgradable: 1,
		...overrides
	};
}

function root() {
	return Guild.getRoot();
}

function rows() {
	return root().querySelectorAll('.content.skills .skill_list .skill');
}

function rowOf(SKID) {
	return root().querySelector(`.content.skills .skill.id${SKID}`);
}

function footer(selector) {
	return root().querySelector(`.footer ${selector}`);
}

/**
 * The tab handler reads the button it was called on, so drive it through the
 * real strip rather than by calling the private function.
 */
function showTab(name) {
	root()
		.querySelector(`.tabs button.${name}`)
		.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function selectRow(SKID) {
	rowOf(SKID).dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
}

describe('Guild skills tab', () => {
	beforeEach(() => {
		mocks.messages = {};
		mocks.chat.length = 0;
		mocks.session.isGuildMaster = true;

		Guild._host = document.createElement('div');
		document.body.innerHTML = '';
		document.body.appendChild(Guild._host);
		Guild._host.innerHTML = Guild.render();
		Guild.init();

		// Every tab is reachable, so onChangeTab is never refused on access.
		Guild.setAccess(0xff);
		Guild.onGuildInfoRequest = vi.fn();
		Guild.onUpdateSkill = vi.fn();
		Guild.onIncreaseSkill = vi.fn();
		Guild.onUseSkill = vi.fn();
		Guild.toggle = vi.fn();
	});

	describe('the footer', () => {
		it('carries Use, and none of the controls the client has no button for', () => {
			expect(footer('.btn_use')).not.toBeNull();
			expect(footer('.apply')).toBeNull();
			expect(footer('.reset')).toBeNull();
		});

		it('shows Use and the readout only while the skills tab is up', () => {
			showTab('skills');

			expect(footer('.btn_use').style.display).toBe('block');
			expect(footer('.skpoints').style.display).toBe('block');

			showTab('members');

			expect(footer('.btn_use').style.display).toBe('none');
			expect(footer('.skpoints').style.display).toBe('none');
		});

		// A deliberate departure from the client, which draws the count for
		// everyone. Nothing a member can reach spends a point - the level-up
		// buttons are already theirs to look at and not press - so the readout
		// goes with them rather than standing alone.
		it('keeps the readout from a member, and Use for them', () => {
			mocks.session.isGuildMaster = false;
			showTab('skills');

			expect(footer('.skpoints').style.display).toBe('none');
			expect(footer('.btn_use').style.display).toBe('block');
		});

		// The footer is the third view the owner flag decides, and the flag can
		// move with this tab already open.
		it('gives the readout back when the flag moves', () => {
			mocks.session.isGuildMaster = false;
			showTab('skills');
			expect(footer('.skpoints').style.display).toBe('none');

			mocks.session.isGuildMaster = true;
			Guild.updateMasterView();

			expect(footer('.skpoints').style.display).toBe('block');
		});

		it('casts the selected skill at its level when Use is pressed', () => {
			Guild.setPoints(0);
			Guild.setSkills([skill({ SKID: 10013, level: 1 })]);
			selectRow(10013);

			footer('.btn_use').dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(Guild.onUseSkill).toHaveBeenCalledWith(10013, 1);
		});

		it('sends nothing when Use is pressed with no row selected', () => {
			Guild.setPoints(0);
			Guild.setSkills([skill({ SKID: 10013 })]);

			footer('.btn_use').dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(Guild.onUseSkill).not.toHaveBeenCalled();
		});

		it('sends nothing for an unlearned skill or a passive', () => {
			Guild.setPoints(0);
			Guild.setSkills([skill({ SKID: 10013, level: 0 }), skill({ SKID: 10005, type: 0, level: 1 })]);

			selectRow(10013);
			footer('.btn_use').dispatchEvent(new MouseEvent('click', { bubbles: true }));
			selectRow(10005);
			footer('.btn_use').dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(Guild.onUseSkill).not.toHaveBeenCalled();
		});

		// The client builds one at x=92, unconditionally and never hidden, but it
		// is the only close button across the six guild tabs and it duplicates
		// the titlebar's - so it is deliberately not ported.
		it('carries no close button of its own', () => {
			expect(footer('.btn_skillclose')).toBeNull();
			expect([...root().querySelectorAll('.footer ui-button')].map(el => el.className)).not.toContain(
				'btn close'
			);
		});
	});

	describe('a skill row', () => {
		beforeEach(() => {
			Guild.setPoints(0);
			Guild.setSkills([skill({ SKID: 10013, level: 1, spcost: 0 })]);
		});

		it('lays its parts out the way the client draws them', () => {
			const row = rowOf(10013);
			const parts = [...row.children].map(el => el.className);

			expect(parts).toEqual(['icon', 'levelupcontainer', 'selectable']);

			// The highlight rect owns the name and the Lv/Sp line, which is why
			// .selectable is one box rather than the two cells it used to be.
			const box = row.querySelector('.selectable');
			expect([...box.children].map(el => el.className)).toEqual(['name', 'levelline']);
			expect([...box.querySelector('.levelline').children].map(el => el.className)).toEqual(['level', 'consume']);
		});

		it('builds no level arrows', () => {
			expect(rowOf(10013).querySelector('.currentUp')).toBeNull();
			expect(rowOf(10013).querySelector('.currentDown')).toBeNull();
		});

		it('is selected by a press anywhere on it, not just on the highlight', () => {
			Guild.setSkills([skill({ SKID: 10013 }), skill({ SKID: 10005, level: 1 })]);

			rowOf(10013).querySelector('.icon').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
			expect(rowOf(10013).classList.contains('selected')).toBe(true);

			rowOf(10005).querySelector('.name').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
			expect(rowOf(10005).classList.contains('selected')).toBe(true);
			expect(rowOf(10013).classList.contains('selected')).toBe(false);
		});

		it('keeps one row per skill and drops the previous list on a refresh', () => {
			Guild.setSkills([skill({ SKID: 10000 }), skill({ SKID: 10013 })]);

			expect(rows()).toHaveLength(2);

			Guild.setSkills([skill({ SKID: 10013 })]);

			expect(rows()).toHaveLength(1);
			expect(rowOf(10000)).toBeNull();
		});
	});

	describe('the level-up button', () => {
		it('appears only for a guild master holding points on an upgradable skill', () => {
			Guild.setPoints(3);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);

			expect(rowOf(10002).querySelector('.levelup').style.display).not.toBe('none');
		});

		it('stays hidden for a member, even with points on an upgradable skill', () => {
			mocks.session.isGuildMaster = false;
			Guild.setPoints(3);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);

			expect(rowOf(10002).querySelector('.levelup').style.display).toBe('none');
		});

		// The gate has to hold on all three paths that show the button. The test
		// above only reaches addSkill's, because setPoints runs before the list
		// exists and its loop body never executes.
		it('stays hidden for a member when a skill update arrives after the list', () => {
			mocks.session.isGuildMaster = false;
			Guild.setPoints(3);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);

			Guild.updateSkill(skill({ SKID: 10002, level: 2, upgradable: 1 }));

			expect(rowOf(10002).querySelector('.levelup').style.display).toBe('none');
		});

		// setPoints returns early when the count's truthiness does not change, so
		// the list has to start on zero points for its loop to run at all.
		it('stays hidden for a member when the point count arrives after the list', () => {
			mocks.session.isGuildMaster = false;
			Guild.setPoints(0);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);

			Guild.setPoints(3);

			expect(rowOf(10002).querySelector('.levelup').style.display).toBe('none');
		});

		it('follows the point count once the list is already up', () => {
			mocks.session.isGuildMaster = true;
			Guild.setPoints(0);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);

			expect(rowOf(10002).querySelector('.levelup').style.display).toBe('none');

			Guild.setPoints(2);

			expect(rowOf(10002).querySelector('.levelup').style.display).not.toBe('none');
		});

		// A handover repaints nothing on this tab of its own accord, and the
		// server's own "can this be raised" byte still says yes for the person who
		// just lost the guild - so without this the demoted master keeps arrows
		// that work as far as the click.
		it('goes away when the flag moves, with no skill packet behind it', () => {
			Guild.setPoints(3);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);
			expect(rowOf(10002).querySelector('.levelup').style.display).not.toBe('none');

			mocks.session.isGuildMaster = false;
			Guild.updateMasterView();

			expect(rowOf(10002).querySelector('.levelup').style.display).toBe('none');
		});

		// The promotion direction is deliberately NOT fixed: the byte arrives per
		// recipient and no server resends it, so it still reads 0 for the new
		// master. The client is stale in exactly the same way.
		// @see docs/reference/guild/member-view.md
		it('stays hidden on promotion, the server flag being what it is', () => {
			mocks.session.isGuildMaster = false;
			Guild.setPoints(3);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 0 })]);

			mocks.session.isGuildMaster = true;
			Guild.updateMasterView();

			expect(rowOf(10002).querySelector('.levelup').style.display).toBe('none');
		});

		// A hidden control is a layout fact; the handler is the guarantee.
		it('sends nothing when a member reaches the handler anyway', () => {
			Guild.setPoints(3);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);
			Guild.onIncreaseSkill = vi.fn();
			mocks.session.isGuildMaster = false;

			rowOf(10002).querySelector('.levelup').dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(Guild.onIncreaseSkill).not.toHaveBeenCalled();
		});

		it('raises the skill it sits in', () => {
			Guild.setPoints(3);
			Guild.setSkills([skill({ SKID: 10002, level: 1, upgradable: 1 })]);

			rowOf(10002).querySelector('.levelup').dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(Guild.onIncreaseSkill).toHaveBeenCalledWith(10002);
		});
	});
});
