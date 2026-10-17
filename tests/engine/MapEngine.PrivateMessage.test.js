import { beforeEach, describe, expect, it, vi } from 'vitest';

// The packet handlers in Engine/MapEngine/PrivateMessage.js are module-private
// and only reachable through the hooks the engine registers, so the Network
// mock keeps the map of packet structure -> handler.
const mocks = vi.hoisted(() => ({
	hooks: new Map(),
	chat: vi.fn(),
	storage: { nick: '', msg: '', blockNicks: [] }
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (struct, fn) => mocks.hooks.set(struct, fn),
		sendPacket: vi.fn()
	}
}));
vi.mock('DB/DBManager.js', () => ({
	default: { getMessage: (id, defaultText) => (defaultText !== undefined ? defaultText : 'MSG ' + id) }
}));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: (...args) => mocks.chat(...args),
		saveNickName: vi.fn(),
		PrivateMessageStorage: mocks.storage,
		TYPE: { PRIVATE: 4, BLUE: 256 },
		FILTER: { WHISPER: 2 }
	}
}));
vi.mock('UI/Components/WhisperBox/WhisperBox.js', () => ({ default: { instances: {}, preferences: {} } }));
vi.mock('Engine/MapEngine/Friends.js', () => ({ default: { isFriend: () => false } }));

const PrivateMessageEngine = (await import('Engine/MapEngine/PrivateMessage.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;

/** Invoke the handler the engine hooked for a given packet structure. */
function deliver(struct, fields) {
	const handler = mocks.hooks.get(struct);
	if (!handler) {
		throw new Error('no handler hooked for that packet');
	}
	const pkt = Object.create(struct.prototype);
	Object.assign(pkt, fields);
	handler(pkt);
}

beforeEach(() => {
	mocks.hooks.clear();
	mocks.chat.mockClear();
	mocks.storage.blockNicks = ['Some Body'];

	PrivateMessageEngine();
});

describe('/ex and /in replies', () => {
	// The reply carries no name: the one /ex or /in sent leads the line.
	it.each([
		[0, 1, 'MSG 194'],
		[0, 2, 'MSG 195'],
		[1, 0, 'MSG 196'],
		[1, 1, 'MSG 197'],
		[1, 2, 'MSG 198']
	])('prints type %i result %i as the name followed by %s', (type, result, text) => {
		deliver(PACKET.ZC.SETTING_WHISPER_PC, { type, result });

		expect(mocks.chat).toHaveBeenCalledWith('Some Body' + text, 4, 2);
	});

	it('prints nothing for a block that went through', () => {
		deliver(PACKET.ZC.SETTING_WHISPER_PC, { type: 0, result: 0 });

		expect(mocks.chat).not.toHaveBeenCalled();
	});

	it('names each reply after its own request', () => {
		mocks.storage.blockNicks = ['Alice', 'Bob'];

		deliver(PACKET.ZC.SETTING_WHISPER_PC, { type: 0, result: 1 });
		deliver(PACKET.ZC.SETTING_WHISPER_PC, { type: 1, result: 0 });

		expect(mocks.chat.mock.calls).toEqual([
			['AliceMSG 194', 4, 2],
			['BobMSG 196', 4, 2]
		]);
	});

	it('lets a silent block use up its name', () => {
		mocks.storage.blockNicks = ['Alice', 'Bob'];

		deliver(PACKET.ZC.SETTING_WHISPER_PC, { type: 0, result: 0 });
		deliver(PACKET.ZC.SETTING_WHISPER_PC, { type: 1, result: 0 });

		expect(mocks.chat.mock.calls).toEqual([['BobMSG 196', 4, 2]]);
	});

	it('prints nothing for a result it does not know', () => {
		deliver(PACKET.ZC.SETTING_WHISPER_PC, { type: 0, result: 3 });

		expect(mocks.chat).not.toHaveBeenCalled();
	});
});

describe('/exall and /inall replies', () => {
	it.each([
		[0, 0, 'MSG 58'],
		[0, 1, 'MSG 59'],
		[1, 0, 'MSG 60'],
		[1, 1, 'MSG 61']
	])('prints type %i result %i as %s', (type, result, text) => {
		deliver(PACKET.ZC.SETTING_WHISPER_STATE, { type, result });

		expect(mocks.chat).toHaveBeenCalledWith(text, 4, 2);
	});

	it('prints nothing for a type it does not know', () => {
		deliver(PACKET.ZC.SETTING_WHISPER_STATE, { type: 2, result: 0 });

		expect(mocks.chat).not.toHaveBeenCalled();
	});
});

describe('block list', () => {
	it('says the list is empty', () => {
		deliver(PACKET.ZC.WHISPER_LIST, { wisperList: [] });

		expect(mocks.chat.mock.calls).toEqual([['MSG 62', 256, 2]]);
	});

	it('prints a header then one line per blocked name', () => {
		deliver(PACKET.ZC.WHISPER_LIST, { wisperList: [{ name: 'Alice' }, { name: 'Bob Two' }] });

		expect(mocks.chat.mock.calls).toEqual([
			['MSG 63', 256, 2],
			['Alice', 256, 2],
			['Bob Two', 256, 2]
		]);
	});
});
