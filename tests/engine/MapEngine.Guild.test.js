import { beforeEach, describe, expect, it, vi } from 'vitest';

// The packet handlers in Engine/MapEngine/Guild.js are module-private and are
// only reachable through the hooks init() registers, so the Network mock keeps
// the map of packet structure -> handler that init builds.
const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	sent: [],
	chat: vi.fn(),
	messages: {},
	guild: {
		setMembers: vi.fn(),
		setMemberPositions: vi.fn(),
		setNotice: vi.fn(),
		setEmblem: vi.fn(),
		setExpelList: vi.fn(),
		updateMasterView: vi.fn()
	},
	entities: [],
	emblemRequests: [],
	// Invitation by click reads the entity the AID names; by default there is
	// nobody on screen, which is the fallback path.
	entityGet: () => null
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (struct, fn) => mocks.hooks.set(struct, fn),
		sendPacket: pkt => mocks.sent.push(pkt)
	}
}));

vi.mock('DB/DBManager.js', () => ({
	default: {
		getMessage: (id, defaultText) =>
			id in mocks.messages ? mocks.messages[id] : defaultText !== undefined ? defaultText : 'NO MSG ' + id,
		INTERFACE_PATH: ''
	}
}));

vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: (...args) => mocks.chat(...args),
		TYPE: { ERROR: 1, BLUE: 2, INFO: 4 },
		FILTER: { GUILD: 4, PUBLIC_LOG: 8 }
	}
}));

vi.mock('UI/Components/Guild/Guild.js', () => ({ default: mocks.guild }));
vi.mock('UI/Components/GuildCompanion/GuildCompanion.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: { showPromptBox: vi.fn(), showMessageBox: vi.fn() } }));
vi.mock('UI/Components/MiniMap/MiniMap.js', () => ({ default: { addGuildMemberMarker: vi.fn() } }));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d } }));
vi.mock('Renderer/EntityManager.js', () => ({
	default: { forEach: fn => mocks.entities.forEach(fn), get: AID => mocks.entityGet(AID) }
}));
vi.mock('Utils/Texture.js', () => ({ default: { load: vi.fn() } }));
vi.mock('Utils/Inflate.js', () => ({ default: class {} }));

const GuildEngine = (await import('Engine/MapEngine/Guild.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;
const PACKETVER = (await import('Network/PacketVerManager.js')).default;
const Session = (await import('Engine/SessionStorage.js')).default;
const UIPreferences = (await import('Preferences/UI.js')).default;

/** Invoke the handler init() hooked for a given packet structure. */
function deliver(struct, fields) {
	const handler = mocks.hooks.get(struct);
	if (!handler) {
		throw new Error('no handler hooked for that packet');
	}
	const pkt = Object.create(struct.prototype);
	Object.assign(pkt, fields);
	handler(pkt);
	return pkt;
}

beforeEach(() => {
	mocks.hooks.clear();
	mocks.sent.length = 0;
	mocks.entities.length = 0;
	mocks.emblemRequests.length = 0;
	mocks.messages = {};
	mocks.entityGet = () => null;
	mocks.chat.mockClear();
	// init() also hangs its own callbacks off the window object, so only the
	// spies are resettable.
	for (const key in mocks.guild) {
		const entry = mocks.guild[key];
		if (typeof entry.mockClear === 'function') {
			entry.mockClear();
		}
	}

	Session.Entity = { GUID: 42, GEmblemVer: 0 };
	Session.AID = 2000000;
	Session.ServerName = 'Test';
	Session.WebToken = 'token';
	PACKETVER.value = 20211103;
	UIPreferences.li = true;

	// The module under test owns this method, so record rather than replace it.
	vi.spyOn(GuildEngine, 'requestGuildEmblem').mockImplementation((guildId, version) => {
		mocks.emblemRequests.push({ guildId, version });
	});

	GuildEngine.init();
});

describe('the guild engine wires each packet to a handler', () => {
	it('hooks every member list generation onto the same handler', () => {
		expect(mocks.hooks.get(PACKET.ZC.MEMBERMGR_INFO)).toBe(mocks.hooks.get(PACKET.ZC.MEMBERMGR_INFO2));
		expect(mocks.hooks.get(PACKET.ZC.MEMBERMGR_INFO2)).toBe(mocks.hooks.get(PACKET.ZC.MEMBERMGR_INFO3));
	});

	it('hooks all three expel list generations', () => {
		expect(mocks.hooks.has(PACKET.ZC.BAN_LIST)).toBe(true);
		expect(mocks.hooks.has(PACKET.ZC.BAN_LIST2)).toBe(true);
		expect(mocks.hooks.has(PACKET.ZC.BAN_LIST3)).toBe(true);
	});

	// Only the oldest list carries a note, so the column shown follows the
	// packet rather than the deployment.
	it('tells the window which list generation carried a memo', () => {
		deliver(PACKET.ZC.MEMBERMGR_INFO, { memberInfo: [] });
		expect(mocks.guild.setMembers).toHaveBeenCalledWith([], true);

		deliver(PACKET.ZC.MEMBERMGR_INFO3, { memberInfo: [] });
		expect(mocks.guild.setMembers).toHaveBeenLastCalledWith([], false);
	});

	// Handing leadership over sends basic info, the member list and this - and
	// only this one carries who the player now is. The window has to repaint off
	// it, because the guild info that precedes it still names the old master.
	it('repaints what the guild-master flag decides, off the packet that moves it', () => {
		Session.isGuildMaster = true;
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 0, right: 0 });

		expect(Session.isGuildMaster).toBe(false);
		expect(mocks.guild.updateMasterView).toHaveBeenCalled();
	});

	it('repaints the same way when the flag arrives the other way up', () => {
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 1, right: 0 });

		expect(Session.isGuildMaster).toBe(true);
		expect(mocks.guild.updateMasterView).toHaveBeenCalled();
	});

	// This packet is not rare - it also rides every emblem change and every
	// member joining. The repaint rebuilds the member rows, which drops a guild
	// master's queued grade edits, so it must fire on a change and nothing else.
	it('repaints only when the flag actually moved', () => {
		Session.isGuildMaster = false;
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 0, right: 0 });

		expect(mocks.guild.updateMasterView).not.toHaveBeenCalled();
	});

	// Which tabs open is per character, and the server answers only when asked -
	// never on a handover, and never unsolicited to a member at all.
	it('asks which tabs this character may open, every time', () => {
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 0, right: 0 });
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 0, right: 0 });

		const asked = mocks.sent.filter(p => p instanceof PACKET.CZ.REQ_GUILD_MENUINTERFACE);
		expect(asked).toHaveLength(2);
	});
});

describe('a guild changing its emblem', () => {
	it('is hooked on all three packet generations', () => {
		const handler = mocks.hooks.get(PACKET.ZC.CHANGE_GUILD);

		expect(handler).toBeDefined();
		expect(mocks.hooks.get(PACKET.ZC.CHANGE_GUILD2)).toBe(handler);
		expect(mocks.hooks.get(PACKET.ZC.CHANGE_GUILD3)).toBe(handler);
	});

	// Registering stamps the opcode onto the structure, so two opcodes sharing
	// one structure leave the older one parsed and then dropped.
	it('gives each generation its own structure', () => {
		expect(PACKET.ZC.CHANGE_GUILD2).not.toBe(PACKET.ZC.CHANGE_GUILD3);
	});

	// The notice is sent once per entity of that guild in range, so a burst of
	// identical versions arrives before the first download can answer.
	it('asks for a given version once, however many copies arrive', () => {
		const before = mocks.emblemRequests.length;

		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 99, emblemVersion: 7, AID: 1 });
		deliver(PACKET.ZC.CHANGE_GUILD3, { GDID: 99, emblemVersion: 7, AID: 2 });
		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 99, emblemVersion: 7, AID: 3 });

		expect(mocks.emblemRequests.length - before).toBe(1);
	});

	it('asks again when the version actually moves on', () => {
		const before = mocks.emblemRequests.length;

		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 98, emblemVersion: 7, AID: 1 });
		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 98, emblemVersion: 8, AID: 1 });

		expect(mocks.emblemRequests.length - before).toBe(2);
	});

	it('records the new version when the guild is our own', () => {
		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 42, emblemVersion: 7, AID: 2000000 });

		expect(Session.Entity.GEmblemVer).toBe(7);
	});

	it('leaves our own version alone when another guild changes its emblem', () => {
		Session.Entity.GEmblemVer = 3;

		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 99, emblemVersion: 7, AID: 2000001 });

		expect(Session.Entity.GEmblemVer).toBe(3);
	});

	it('ignores a notice that carries no version, which would clear the emblem', () => {
		Session.Entity.GEmblemVer = 3;

		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 42, emblemVersion: 0, AID: 2000000 });

		expect(Session.Entity.GEmblemVer).toBe(3);
	});
});

describe('uploading an emblem tells the map server about it', () => {
	let sentRequests;

	beforeEach(() => {
		sentRequests = [];
		class MockXHR {
			open(method, url) {
				this.url = url;
			}
			send() {
				sentRequests.push(this);
				this.status = 200;
				this.responseText = JSON.stringify({ Type: 1, version: 5 });
				this.onload();
			}
		}
		vi.stubGlobal('XMLHttpRequest', MockXHR);
		vi.stubGlobal('FormData', class {
			append() {}
		});
	});

	// The web tier only writes the image and answers with a version. Without
	// this packet the map server keeps the old emblem id, so nobody else is
	// told and a relog loses the emblem.
	it('sends the new version on 0x0b46 once the upload comes back', () => {
		GuildEngine.sendEmblem(new Uint8Array([0x42, 0x4d, 0x00]));

		const pkt = mocks.sent.find(p => p instanceof PACKET.CZ.REQ_ADD_NEW_EMBLEM);
		expect(pkt).toBeDefined();
		expect(pkt.GDID).toBe(42);
		expect(pkt.version).toBe(5);
	});

	it('builds that packet at the ten bytes the server expects', () => {
		const pkt = new PACKET.CZ.REQ_ADD_NEW_EMBLEM();
		pkt.GDID = 42;
		pkt.version = 5;

		const view = new DataView(pkt.build().buffer);

		expect(view.byteLength).toBe(10);
		expect(view.getUint16(0, true)).toBe(0x0b46);
		expect(view.getUint32(2, true)).toBe(42);
		expect(view.getUint32(6, true)).toBe(5);
	});

	// The server only registers the handler from 20190724; before that the
	// upload has no way to announce itself at all.
	it('stays quiet on a packetver the server does not listen on', () => {
		PACKETVER.value = 20180101;

		GuildEngine.sendEmblem(new Uint8Array([0x42, 0x4d, 0x00]));

		// Without this the case cannot tell a gated send from an upload that
		// never happened at all.
		expect(sentRequests).toHaveLength(1);
		expect(mocks.sent.find(p => p instanceof PACKET.CZ.REQ_ADD_NEW_EMBLEM)).toBeUndefined();
	});
});

describe('the guild notice echo follows /li', () => {
	it('echoes the notice into the chat while /li is on', () => {
		deliver(PACKET.ZC.GUILD_NOTICE, { subject: 'Topic', notice: 'Body' });

		expect(mocks.chat).toHaveBeenCalled();
	});

	it('says nothing in the chat while /li is off', () => {
		UIPreferences.li = false;

		deliver(PACKET.ZC.GUILD_NOTICE, { subject: 'Topic', notice: 'Body' });

		expect(mocks.chat).not.toHaveBeenCalled();
	});

	it('hands the notice to the window either way', () => {
		UIPreferences.li = false;

		deliver(PACKET.ZC.GUILD_NOTICE, { subject: 'Topic', notice: 'Body' });

		expect(mocks.guild.setNotice).toHaveBeenCalledWith('Topic', 'Body');
	});
});

describe('the invitation result names who was invited', () => {
	// The ack is a flag byte and carries no name, so it can only come from
	// this side.
	it('substitutes the invited name into a table that asks for one', () => {
		mocks.messages[380] = '%s accepted your invitation.';
		GuildEngine.requestPlayerInvitationByName('ClaudeTestB');

		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });

		expect(mocks.chat.mock.calls[0][0]).toBe('ClaudeTestB accepted your invitation.');
	});

	it('falls back to a placeholder when nobody was invited from this client', () => {
		mocks.messages[380] = '%s accepted your invitation.';
		mocks.messages[581] = 'Nameless';

		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });

		expect(mocks.chat.mock.calls[0][0]).toBe('Nameless accepted your invitation.');
	});

	// The server drops some invites without answering at all, so a name held
	// past its own answer lands on the next, unrelated one.
	it('spends the name on one answer rather than keeping it for the next', () => {
		mocks.messages[380] = '%s accepted your invitation.';
		mocks.messages[581] = 'Nameless';
		GuildEngine.requestPlayerInvitationByName('ClaudeTestB');

		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });
		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });

		expect(mocks.chat.mock.calls[0][0]).toBe('ClaudeTestB accepted your invitation.');
		expect(mocks.chat.mock.calls[1][0]).toBe('Nameless accepted your invitation.');
	});

	// Clicking a player is the other way in, and it is the one with an entity to
	// read the name off - the packet carries an account id and nothing else.
	it('names a player invited by clicking them, not only one typed', () => {
		mocks.messages[380] = '%s accepted your invitation.';
		mocks.entityGet = AID => (AID === 2000007 ? { display: { name: 'Clicked' } } : null);

		GuildEngine.requestPlayerInvitation(2000007);
		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });

		expect(mocks.chat.mock.calls[0][0]).toBe('Clicked accepted your invitation.');
	});

	it('falls back when the player clicked has left the screen', () => {
		mocks.messages[380] = '%s accepted your invitation.';
		mocks.messages[581] = 'Nameless';

		GuildEngine.requestPlayerInvitation(2000007);
		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });

		expect(mocks.chat.mock.calls[0][0]).toBe('Nameless accepted your invitation.');
	});

	it('has text to fall back on for every answer the server sends', () => {
		for (const answer of [0, 1, 2, 3]) {
			mocks.chat.mockClear();

			deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer });

			expect(mocks.chat).toHaveBeenCalled();
			expect(mocks.chat.mock.calls[0][0]).not.toContain('NO MSG');
		}
	});
});

describe('a member info request that goes unanswered', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	// rAthena registers a length for 0x0157 and no handler, so the request is
	// dropped in silence. Name the reason rather than leave the click looking
	// like nothing happened.
	it('says so rather than leaving the click silent', () => {
		GuildEngine.requestMemberInfo(150000, 2000001);
		vi.advanceTimersByTime(3000);

		expect(mocks.chat).toHaveBeenCalled();
		expect(mocks.chat.mock.calls[0][0]).toContain('did not answer');
	});

	it('has text to fall back on when the table has no such id', () => {
		GuildEngine.requestMemberInfo(150000, 2000001);
		vi.advanceTimersByTime(3000);

		expect(mocks.chat.mock.calls[0][0]).not.toContain('NO MSG');
	});

	// The emulator is not the player's concern, and naming one is wrong on
	// every other server the client talks to.
	it('does not name the server emulator to the player', () => {
		GuildEngine.requestMemberInfo(150000, 2000001);
		vi.advanceTimersByTime(3000);

		expect(mocks.chat.mock.calls[0][0]).not.toContain('rAthena');
	});

	it('says nothing when the answer does arrive in time', () => {
		GuildEngine.requestMemberInfo(150000, 2000001);
		deliver(PACKET.ZC.ACK_OPEN_MEMBER_INFO, { AID: 2000001, GID: 150000 });
		vi.advanceTimersByTime(3000);

		expect(mocks.chat).not.toHaveBeenCalled();
	});
});
