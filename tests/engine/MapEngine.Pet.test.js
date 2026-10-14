import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The packet handlers in Engine/MapEngine/Pet.js are module-private and are
// only reachable through the hooks init() registers, so the Network mock keeps
// the map of packet structure -> handler that init builds (same pattern as
// tests/engine/MapEngine.Guild.test.js).
const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	sent: [],
	chat: vi.fn(),
	entities: {}
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (struct, fn) => mocks.hooks.set(struct, fn),
		sendPacket: pkt => mocks.sent.push(pkt)
	}
}));

vi.mock('DB/DBManager.js', () => ({
	default: {
		getMessage: (id, defaultText) => (defaultText !== undefined ? defaultText : 'NO MSG ' + id),
		getItemInfo: () => ({ identifiedDisplayName: 'Item' }),
		getPetFriendlyState: () => 0,
		getPetHungryState: () => 0,
		getPetTalkNumber: () => 0,
		getPetEmotion: () => 0,
		getPetEquipPath: () => null,
		getPetTalk: () => 'Woof!'
	}
}));

vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: (...args) => mocks.chat(...args),
		TYPE: { PUBLIC: 1, ERROR: 2 },
		FILTER: { PUBLIC_CHAT: 1, PUBLIC_LOG: 2 }
	}
}));

vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn() } }));
vi.mock('UI/UIManager.js', () => ({ default: { showPromptBox: vi.fn() } }));
vi.mock('UI/Components/SlotMachine/SlotMachine.js', () => ({ default: { append: vi.fn() } }));
vi.mock('UI/Components/SkillTargetSelection/SkillTargetSelection.js', () => ({
	default: { append: vi.fn(), set: vi.fn() }
}));
vi.mock('UI/Components/ItemSelection/ItemSelection.js', () => ({
	default: { append: vi.fn(), setList: vi.fn(), setTitle: vi.fn() }
}));
vi.mock('UI/Components/PetInformations/PetInformations.js', () => ({
	default: { append: vi.fn(), setInformations: vi.fn(), setIntimacy: vi.fn(), setHunger: vi.fn() }
}));
vi.mock('UI/Components/PetEvolution/PetEvolution.js', () => ({
	default: { prepare: vi.fn(), SetInfo: vi.fn(), append: vi.fn(), ui: { show: vi.fn() } }
}));
vi.mock('Renderer/EntityManager.js', () => ({
	default: { get: GID => mocks.entities[GID] ?? null }
}));

const PetEngine = (await import('Engine/MapEngine/Pet.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;
const PACKETVER = (await import('Network/PacketVerManager.js')).default;
const Session = (await import('Engine/SessionStorage.js')).default;

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

/** A fake entity shaped like EntityDisplay's load state machine. */
function makeEntity(GID, displayName) {
	return {
		GID,
		display: { name: displayName, load: 0, TYPE: { NONE: 0, LOADING: 1, COMPLETE: 2 } },
		dialog: { set: vi.fn() }
	};
}

beforeEach(() => {
	mocks.hooks.clear();
	mocks.sent.length = 0;
	mocks.entities = {};
	mocks.chat.mockClear();

	Session.petId = 0;
	Session.pet = {};
	PACKETVER.value = 20131223; // pre-client version from the issue (20130618 family)

	PetEngine();
});

afterEach(() => {
	vi.useRealTimers();
});

/** PET_ACT (0x01aa) triggers petTalk() when data encodes a talk line. */
function deliverPetTalk(GID) {
	return deliver(PACKET.ZC.PET_ACT, { GID, data: 5001 });
}

describe('a pet talking in chat', () => {
	it('names the own pet from the session cache before PROPERTY_PET sets the entity name', () => {
		Session.petId = 700000;
		Session.pet.name = 'Pochi';
		mocks.entities[700000] = makeEntity(700000, '');

		deliverPetTalk(700000);

		expect(mocks.chat.mock.calls[0][0]).toBe('Pochi : Woof!');
	});

	it('prefers the entity display name once PROPERTY_PET has set it', () => {
		Session.petId = 700000;
		Session.pet.name = 'Pochi';
		mocks.entities[700000] = makeEntity(700000, 'Pochi');

		deliverPetTalk(700000);

		expect(mocks.chat.mock.calls[0][0]).toBe('Pochi : Woof!');
	});

	it('keeps the own pet name when PROPERTY_PET arrives before the pet entity', () => {
		Session.petId = 700000;
		deliver(PACKET.ZC.PROPERTY_PET, { szName: 'Pochi', job: 1002, nLevel: 1, nFullness: 50, nRelationship: 1000 });
		mocks.entities[700000] = makeEntity(700000, '');

		deliverPetTalk(700000);

		expect(mocks.chat.mock.calls[0][0]).toBe('Pochi : Woof!');
	});

	it('keeps a new pet\'s name announced before its ownership update', () => {
		Session.petId = 700000;
		Session.pet.name = 'Pochi';
		mocks.entities[700001] = makeEntity(700001, '');

		deliver(PACKET.ZC.PROPERTY_PET, { szName: 'Luna', job: 1002, nLevel: 1, nFullness: 50, nRelationship: 1000 });
		deliver(PACKET.ZC.CHANGESTATE_PET, { type: 0, GID: 700001, data: 0 });
		deliverPetTalk(700001);

		expect(mocks.chat.mock.calls[0][0]).toBe('Luna : Woof!');
	});

	// Other players' pets never receive PROPERTY_PET (it is sent SELF-only by
	// the server), and before 20131223 the spawn packet carries no name, so the
	// entity's display name stays empty until requested.
	it('drops the talk of another player\'s unnamed pet and requests its name', () => {
		const entity = makeEntity(800000, '');
		mocks.entities[800000] = entity;

		deliverPetTalk(800000);

		expect(mocks.chat).not.toHaveBeenCalled();
		expect(entity.dialog.set).not.toHaveBeenCalled();

		const pkt = mocks.sent.find(p => p instanceof PACKET.CZ.REQNAME);
		expect(pkt).toBeDefined();
		expect(pkt.AID).toBe(800000);
		expect(entity.display.load).toBe(entity.display.TYPE.LOADING);
	});

	it('prints the next talk once the name has arrived', () => {
		const entity = makeEntity(800004, '');
		mocks.entities[800004] = entity;

		deliverPetTalk(800004);
		entity.display.name = 'Pochi';
		entity.display.load = entity.display.TYPE.COMPLETE;
		deliverPetTalk(800004);

		expect(mocks.chat).toHaveBeenCalledTimes(1);
		expect(mocks.chat.mock.calls[0][0]).toBe('Pochi : Woof!');
	});

	it('uses REQNAME2 once the client is past the 20180307 packet cut', () => {
		PACKETVER.value = 20200101;
		mocks.entities[800001] = makeEntity(800001, '');

		deliverPetTalk(800001);

		expect(mocks.sent.find(p => p instanceof PACKET.CZ.REQNAME2)).toBeDefined();
		expect(mocks.sent.find(p => p instanceof PACKET.CZ.REQNAME)).toBeUndefined();
	});

	it('does not ask again while a request for that pet is still in flight', () => {
		const entity = makeEntity(800002, '');
		mocks.entities[800002] = entity;

		deliverPetTalk(800002);
		deliverPetTalk(800002);

		const requests = mocks.sent.filter(p => p instanceof PACKET.CZ.REQNAME);
		expect(requests).toHaveLength(1);
	});

	it('asks again once 2.5 seconds have passed without a name', () => {
		vi.useFakeTimers();
		mocks.entities[800003] = makeEntity(800003, '');
		const requests = () => mocks.sent.filter(p => p instanceof PACKET.CZ.REQNAME);

		deliverPetTalk(800003);
		vi.advanceTimersByTime(2499);
		deliverPetTalk(800003);
		expect(requests()).toHaveLength(1);

		vi.advanceTimersByTime(1);
		deliverPetTalk(800003);
		expect(requests()).toHaveLength(2);
		expect(mocks.chat).not.toHaveBeenCalled();
	});

	it('asks for the name of a pet that came back into view, even within 2.5 seconds', () => {
		vi.useFakeTimers();
		mocks.entities[800005] = makeEntity(800005, '');
		deliverPetTalk(800005);

		vi.advanceTimersByTime(1000);
		mocks.entities[800005] = makeEntity(800005, '');
		deliverPetTalk(800005);

		expect(mocks.sent.filter(p => p instanceof PACKET.CZ.REQNAME)).toHaveLength(2);
	});
});
