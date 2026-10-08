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
		updateMasterView: vi.fn(),
		invalidateAccess: vi.fn(),
		requestAccessIfUnknown: vi.fn(),
		reset: vi.fn(),
		hide: vi.fn()
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
vi.mock('UI/Components/GuildCompanion/GuildCompanion.js', () => ({ default: { closeDisband: vi.fn() } }));
vi.mock('UI/UIManager.js', () => ({ default: { showPromptBox: vi.fn(), showMessageBox: vi.fn() } }));
vi.mock('UI/Components/MiniMap/MiniMap.js', () => ({ default: { addGuildMemberMarker: vi.fn() } }));
// The engine only assigns onRequestGuildSkills on it; the real module reaches
// NpcBox and ItemInfo, which register components at import time.
vi.mock('UI/Components/ShortCut/ShortCut.js', () => ({ default: {} }));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d } }));
vi.mock('Renderer/EntityManager.js', () => ({
	default: { forEach: fn => mocks.entities.forEach(fn), get: AID => mocks.entityGet(AID) }
}));
vi.mock('Utils/Texture.js', () => ({ default: { load: vi.fn() } }));
vi.mock('Utils/Inflate.js', () => ({ default: class {} }));

const GuildEngine = (await import('Engine/MapEngine/Guild.js')).default;
const Texture = (await import('Utils/Texture.js')).default;
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

	// The official client never sends this request at all, so the window decides
	// whether to - and it decides on the mask being unknown. The handler's job is
	// only to say when the mask it holds has stopped being true.
	it('lets the window decide whether to ask which tabs open', () => {
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 0, right: 0 });

		expect(mocks.guild.requestAccessIfUnknown).toHaveBeenCalled();
		expect(mocks.sent.filter(p => p instanceof PACKET.CZ.REQ_GUILD_MENUINTERFACE)).toHaveLength(0);
	});

	// The mask is per role and no server resends it on a handover, so a flag that
	// moved is the one thing that makes a held mask stale. hasGuild is set
	// deliberately in each of these three: it is what tells a real handover from
	// the first of these packets, and it is module state that leaks between tests.
	it('forgets the mask when the flag moves', () => {
		Session.hasGuild = true;
		Session.isGuildMaster = false;
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 1, right: 0 });

		expect(mocks.guild.invalidateAccess).toHaveBeenCalled();
	});

	// Every emblem change rides this packet, to the whole roster. Forgetting the
	// mask there would put a request on the wire for each one.
	it('keeps the mask when the flag did not move', () => {
		Session.hasGuild = true;
		Session.isGuildMaster = false;
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 0, right: 0 });

		expect(mocks.guild.invalidateAccess).not.toHaveBeenCalled();
	});

	// The first of these packets is not a handover: there was no earlier role for
	// the mask to have been answered under. rAthena sends a guild master their
	// mask unsolicited just before it, so forgetting it here would ask again for
	// what had only just arrived.
	it('keeps the mask on the first of these packets', () => {
		Session.hasGuild = false;
		Session.isGuildMaster = false;
		deliver(PACKET.ZC.UPDATE_GDID, { GDID: 150000, isMaster: 1, right: 0 });

		expect(Session.isGuildMaster).toBe(true);
		expect(mocks.guild.updateMasterView).toHaveBeenCalled();
		expect(mocks.guild.invalidateAccess).not.toHaveBeenCalled();
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

	// The download repaints the entities on the map by itself, so the map looked
	// right while an open window kept the old emblem until something else
	// rebuilt the Info tab. Watched happening on two clients at once.
	it('repaints an open window when the emblem is our own guild s', () => {
		const image = { src: 'data:image/png;base64,AAAA' };
		GuildEngine.requestGuildEmblem.mockImplementation((guildId, version, callback) => {
			mocks.emblemRequests.push({ guildId, version });
			callback(image, null);
		});

		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 42, emblemVersion: 11, AID: 2000000 });

		expect(mocks.guild.setEmblem).toHaveBeenCalledWith(image);
	});

	// Every guild in range announces its own changes, so an unfiltered repaint
	// would drop a stranger's emblem into our Info tab.
	it('leaves the window alone when the emblem belongs to another guild', () => {
		GuildEngine.requestGuildEmblem.mockImplementation((guildId, version, callback) => {
			mocks.emblemRequests.push({ guildId, version });
			callback({ src: 'data:image/png;base64,BBBB' }, null);
		});

		deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 777, emblemVersion: 11, AID: 4242 });

		expect(mocks.guild.setEmblem).not.toHaveBeenCalled();
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

	// The mark that stops the burst means "asked for", not "have". Holding it
	// through a download that gave up left every later broadcast of that version
	// refused, so a web server that blinked froze the emblem until the guild
	// changed it again.
	describe('a download that gave up', () => {
		/** Answer every request by failing, and count them. */
		function failEveryFetch() {
			GuildEngine.requestGuildEmblem.mockImplementation((guildId, version, _callback, onFailure) => {
				mocks.emblemRequests.push({ guildId, version });
				onFailure();
			});
		}

		// The mark outlives a test: it is module state keyed by guild, so each
		// case below needs a guild no earlier one has announced.
		it('lets the next broadcast of that same version try again', () => {
			failEveryFetch();

			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 4001, emblemVersion: 7, AID: 1 });
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 4001, emblemVersion: 7, AID: 2 });

			expect(mocks.emblemRequests).toHaveLength(2);
		});

		it('still holds the burst back once one of them succeeds', () => {
			failEveryFetch();
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 4002, emblemVersion: 7, AID: 1 });

			GuildEngine.requestGuildEmblem.mockImplementation((guildId, version, callback) => {
				mocks.emblemRequests.push({ guildId, version });
				callback({ src: 'data:image/png;base64,AAAA' }, null);
			});
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 4002, emblemVersion: 7, AID: 2 });
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: 4002, emblemVersion: 7, AID: 3 });

			expect(mocks.emblemRequests).toHaveLength(2);
		});
	});

	// Two versions can be in the air at once - the guild changed its emblem twice,
	// or an entity spawned while a broadcast was being answered - and the web tier
	// answers whenever it answers. These cases drive the real download rather than
	// the spy the rest of the file uses, because the order the images decode in is
	// the whole subject.
	describe('two downloads answering out of order', () => {
		let xhrs;
		let images;
		let guildId;
		let entity;
		let requests;
		// The emblem cache is module state keyed by guild and is never reset, so a
		// guild downloaded for once carries its version into every later case.
		let nextGuildId = 4100;

		beforeEach(() => {
			// The real method, not the recorder every other case installs - but still
			// counted, so a broadcast refused before it asks can be told from one that
			// asks and is answered out of the cache.
			GuildEngine.requestGuildEmblem.mockRestore();
			requests = vi.spyOn(GuildEngine, 'requestGuildEmblem');

			xhrs = [];
			images = [];

			vi.stubGlobal(
				'XMLHttpRequest',
				class MockXHR {
					open() {}
					// Recorded and left hanging: each case answers them by hand.
					send() {
						xhrs.push(this);
					}
					getResponseHeader() {
						return 'image/png';
					}
				}
			);
			vi.stubGlobal('FormData', class {
				append() {}
			});
			vi.stubGlobal('Image', class MockImage {
				constructor() {
					images.push(this);
				}
			});
			vi.stubGlobal('URL', {
				createObjectURL: blob => 'blob:' + blob.tag,
				revokeObjectURL: () => {}
			});
			Texture.load.mockImplementation((url, callback) => {
				callback.call({ toDataURL: () => url.replace('blob:', 'data:') });
			});

			// Our own guild, so the window is told and the commit is observable.
			guildId = ++nextGuildId;
			Session.Entity = { GUID: guildId, GEmblemVer: 0 };
			entity = { GUID: guildId, setEntityGuildEmblem: vi.fn() };
			mocks.entities.push(entity);
		});

		/**
		 * Answer one hanging request, tagging the image it carries
		 *
		 * @return {object} the image that answer produced, to decode when the case
		 *   wants it - the cache holds a placeholder of its own, so counting images
		 *   from the front finds the wrong one.
		 */
		function answer(index, tag) {
			const xhr = xhrs[index];
			xhr.status = 200;
			xhr.response = { tag: tag };
			xhr.onload();
			return images[images.length - 1];
		}

		it('paints the newer emblem, not the one that answered last', () => {
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 7, AID: 1 });
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 8, AID: 1 });
			expect(xhrs).toHaveLength(2);

			const newer = answer(1, 'newer');
			const older = answer(0, 'older');
			newer.onload();
			older.onload();

			expect(mocks.guild.setEmblem).toHaveBeenCalledTimes(1);
			expect(mocks.guild.setEmblem.mock.calls[0][0].src).toBe('data:newer');
			expect(entity.setEntityGuildEmblem).toHaveBeenCalledTimes(1);
			expect(entity.setEntityGuildEmblem.mock.calls[0][0].src).toBe('data:newer');
		});

		// Committing the older image also lowered the stored version, so the cache
		// stopped agreeing with what is on screen.
		it('leaves the stored version on the one it painted', () => {
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 7, AID: 1 });
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 8, AID: 1 });
			const newer = answer(1, 'newer');
			const older = answer(0, 'older');
			newer.onload();
			older.onload();

			const painted = [];
			GuildEngine.requestGuildEmblem(guildId, 8, image => painted.push(image));

			expect(xhrs).toHaveLength(2);
			expect(painted).toHaveLength(1);
			expect(painted[0].src).toBe('data:newer');
		});

		// One version is asked for by several callers at once - the guild info, the
		// broadcast, an entity coming into view - and each repaints something else:
		// the window, the player's own entity, a passer-by. A guard that let only
		// the first of them through left the rest of those surfaces on the emblem
		// before, which is what the map and the window actually showed.
		it('answers every caller waiting on the same version', () => {
			const painted = [];

			GuildEngine.requestGuildEmblem(guildId, 8, image => painted.push('info:' + image.src));
			GuildEngine.requestGuildEmblem(guildId, 8, image => painted.push('window:' + image.src));
			expect(xhrs).toHaveLength(2);

			answer(0, 'shiny').onload();
			answer(1, 'shiny').onload();

			expect(painted).toEqual(['info:data:shiny', 'window:data:shiny']);
		});

		// The web token arrives on its own schedule and a broadcast can land before
		// it. That is a sixth way to end with nothing painted, and it used to be the
		// one that kept the mark: the download never started, so no transport error
		// ever released it, and the version stayed refused once the token turned up.
		it('lets a version announced before the web token exists be asked for again', () => {
			Session.WebToken = '';

			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 7, AID: 1 });
			expect(xhrs).toHaveLength(0);

			Session.WebToken = 'token';
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 7, AID: 2 });

			expect(xhrs).toHaveLength(1);
			answer(0, 'late').onload();
			expect(mocks.guild.setEmblem).toHaveBeenCalledTimes(1);
		});

		// The mark is the handler's record of what it asked for. An older fetch
		// giving up must not hand back the mark a newer one is holding, or the
		// burst it was there to stop comes through.
		it('keeps the newer mark when the older fetch gives up', () => {
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 7, AID: 1 });
			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 8, AID: 1 });

			answer(1, 'newer').onload();
			xhrs[0].onerror();

			deliver(PACKET.ZC.CHANGE_GUILD2, { GDID: guildId, emblemVersion: 8, AID: 2 });

			// Held back by the mark, so it never reaches the request at all. Counting
			// downloads instead would pass either way: the cache answers a version it
			// already holds without one.
			expect(requests).toHaveBeenCalledTimes(2);
			expect(mocks.guild.setEmblem).toHaveBeenCalledTimes(1);
		});
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
		GuildEngine.requestPlayerInvitationByName('Seyren');

		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });

		expect(mocks.chat.mock.calls[0][0]).toBe('Seyren accepted your invitation.');
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
		GuildEngine.requestPlayerInvitationByName('Seyren');

		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });
		deliver(PACKET.ZC.ACK_REQ_JOIN_GUILD, { answer: 2 });

		expect(mocks.chat.mock.calls[0][0]).toBe('Seyren accepted your invitation.');
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

	// The window is a singleton and so is the timer. A character change is the one
	// moment the request can neither be answered nor reported to whoever asked.
	it('does not report itself in the guild chat of the character after', () => {
		GuildEngine.requestMemberInfo(150000, 2000001);

		GuildEngine.resetForNewCharacter();
		vi.advanceTimersByTime(3000);

		expect(mocks.chat).not.toHaveBeenCalled();
	});
});

/**
 * A one-line delegate rather than the two statements inline in MapEngine.js: that
 * module has no test file and building one means mocking ~50 imports, so the call
 * site was the one uncovered hunk a coverage sweep found. It is reached from
 * ZC_ACCEPT_ENTER.
 */
describe('entering the map as another character', () => {
	it('empties the guild window and drops the flag', () => {
		Session.isGuildMaster = true;

		GuildEngine.resetForNewCharacter();

		expect(Session.isGuildMaster).toBe(false);
		expect(mocks.guild.reset).toHaveBeenCalled();
	});
});

/**
 * The guild window is a singleton that outlives the guild. All three exits
 * already close it; closing is not emptying, so whoever opens it next would find
 * the dead guild's roster, notice and access mask still in it.
 *
 * See docs/reference/guild/member-view.md
 */
describe('leaving a guild empties the window', () => {
	beforeEach(() => {
		Session.Entity.display = { name: 'Eremes' };
		Session.hasGuild = true;
	});

	it('empties it when the guild is disbanded', () => {
		deliver(PACKET.ZC.ACK_DISORGANIZE_GUILD_RESULT, { reason: 0 });

		expect(mocks.guild.reset).toHaveBeenCalled();
		expect(Session.hasGuild).toBe(false);
	});

	// Reasons 1 and 2 are refusals: the guild is still there.
	it('leaves it alone when the disband was refused', () => {
		deliver(PACKET.ZC.ACK_DISORGANIZE_GUILD_RESULT, { reason: 2 });

		expect(mocks.guild.reset).not.toHaveBeenCalled();
		expect(Session.hasGuild).toBe(true);
	});

	// Ordering, not just occurrence: reset repaints, and the notice pane it
	// repaints branches on the guild-master flag. Emptying the window before the
	// flag is cleared leaves a departed master looking at their own edit boxes.
	for (const [label, struct, fields] of [
		['disbanded', PACKET.ZC.ACK_DISORGANIZE_GUILD_RESULT, { reason: 0 }],
		['expelled', PACKET.ZC.ACK_BAN_GUILD, { charName: 'Eremes', reasonDesc: 'bye' }],
		['left', PACKET.ZC.ACK_LEAVE_GUILD, { charName: 'Eremes', reasonDesc: 'bye' }]
	]) {
		it(`clears the flag before emptying, having been ${label}`, () => {
			Session.isGuildMaster = true;
			// The FIRST reset, not the last: a second call after the flags would
			// otherwise paper over a first one before them.
			const flagPerCall = [];
			mocks.guild.reset.mockImplementation(() => {
				flagPerCall.push(Session.isGuildMaster);
			});

			deliver(struct, fields);

			expect(flagPerCall).toEqual([false]);
		});
	}

	it('empties it when we are the one expelled', () => {
		deliver(PACKET.ZC.ACK_BAN_GUILD, { charName: 'Eremes', reasonDesc: 'bye' });

		expect(mocks.guild.reset).toHaveBeenCalled();
	});

	it('empties it when we are the one who left', () => {
		deliver(PACKET.ZC.ACK_LEAVE_GUILD, { charName: 'Eremes', reasonDesc: 'bye' });

		expect(mocks.guild.reset).toHaveBeenCalled();
	});

	// Both packets are sent to the whole roster, so the common case is somebody
	// else's name. Emptying on those would clear the window on every departure.
	for (const [label, struct] of [
		['expelled', PACKET.ZC.ACK_BAN_GUILD],
		['left', PACKET.ZC.ACK_LEAVE_GUILD]
	]) {
		it(`leaves it alone when somebody else ${label}`, () => {
			deliver(struct, { charName: 'Seyren', reasonDesc: 'bye' });

			expect(mocks.guild.reset).not.toHaveBeenCalled();
			expect(Session.hasGuild).toBe(true);
		});
	}

	/**
	 * rAthena swaps both packets at PACKETVER_MAIN 20161019 / RE 20160921 for forms
	 * that carry a character id and no name. Registering only the older opcodes
	 * left every departure on a modern server read and dropped: no chat line, and
	 * a window that stayed on the guild we had just been thrown out of.
	 * @see docs/reference/guild/member-view.md
	 */
	describe('on the era that sends a character id instead of a name', () => {
		beforeEach(() => {
			Session.GID = 150000;
			mocks.guild.getMemberName = vi.fn(() => 'Eremes');
		});

		for (const [label, struct] of [
			['expelled', PACKET.ZC.ACK_BAN_GUILD_DELNAME],
			['left', PACKET.ZC.ACK_LEAVE_GUILD_DELNAME]
		]) {
			it(`empties the window when we are the one ${label}`, () => {
				deliver(struct, { GID: 150000, reasonDesc: 'bye' });

				expect(mocks.guild.reset).toHaveBeenCalled();
				expect(Session.hasGuild).toBe(false);
			});

			it(`leaves it alone when somebody else ${label}`, () => {
				deliver(struct, { GID: 150001, reasonDesc: 'bye' });

				expect(mocks.guild.reset).not.toHaveBeenCalled();
				expect(Session.hasGuild).toBe(true);
			});
		}

		// Session.Entity.GID is the account's, and the two are different numbers.
		// Matching on it would never fire on the character who actually left.
		it('matches the character id, not the account one', () => {
			Session.Entity.GID = 2000000;

			deliver(PACKET.ZC.ACK_LEAVE_GUILD_DELNAME, { GID: 2000000, reasonDesc: 'bye' });

			expect(mocks.guild.reset).not.toHaveBeenCalled();
		});

		// The packet has no name in it, and the roster is where the client reads
		// one back from.
		it('names the departing member from the roster', () => {
			mocks.messages[364] = '%s has withdrawn from the guild';

			deliver(PACKET.ZC.ACK_LEAVE_GUILD_DELNAME, { GID: 150001, reasonDesc: 'bye' });

			expect(mocks.guild.getMemberName).toHaveBeenCalledWith(150001);
			expect(mocks.chat.mock.calls[0][0]).toBe('Eremes has withdrawn from the guild');
		});
	});
});
