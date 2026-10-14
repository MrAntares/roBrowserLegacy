import { beforeEach, describe, expect, it, vi } from 'vitest';

// processCommand runs with the chat box as `this`, so the same recording object
// stands in for the module and for the receiver.
const mocks = vi.hoisted(() => ({
	sent: [],
	chatBox: {
		addText: vi.fn(),
		TYPE: { INFO: 1 },
		FILTER: { PUBLIC_LOG: 8 },
		PrivateMessageStorage: { blockNicks: [] }
	}
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: pkt => mocks.sent.push(pkt), hookPacket: vi.fn() }
}));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({ default: mocks.chatBox }));
vi.mock('DB/DBManager.js', () => ({
	default: { getMessage: (id, defaultText) => (defaultText !== undefined ? defaultText : 'MSG ' + id) }
}));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d } }));
vi.mock('Engine/MapEngine/Group.js', () => ({ default: {} }));
vi.mock('Engine/MapEngine/Guild.js', () => ({ default: {} }));
vi.mock('Engine/MapEngine/Friends.js', () => ({ default: { sayHi: vi.fn() } }));
vi.mock('Audio/BGM.js', () => ({ default: { play: vi.fn(), stop: vi.fn() } }));
vi.mock('Audio/SoundManager.js', () => ({ default: { stop: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { tick: 0 } }));
vi.mock('Renderer/EntityManager.js', () => ({ default: { forEach: vi.fn() } }));
vi.mock('Renderer/EffectManager.js', () => ({ default: { spam: vi.fn(), remove: vi.fn() } }));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { currentMap: 'prontera.rsw' } }));
vi.mock('Renderer/Effects/SnowWeather.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/RainWeather.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/SakuraWeatherEffect.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/PokJukWeatherEffect.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/CloudWeatherEffect.js', () => ({ default: {} }));
vi.mock('UI/Components/ChatRoomCreate/ChatRoomCreate.js', () => ({ default: { show: vi.fn() } }));
vi.mock('UI/Components/ChatRoom/ChatRoom.js', () => ({ default: { remove: vi.fn() } }));
vi.mock('UI/Components/HomunInformations/HomunInformations.js', () => ({ default: { resetAI: vi.fn() } }));
vi.mock('UI/Components/MercenaryInformations/MercenaryInformations.js', () => ({
	default: { resetAI: vi.fn() }
}));
vi.mock('UI/Components/Captcha/CaptchaUpload.js', () => ({ default: {} }));
vi.mock('UI/Components/Captcha/CaptchaSelector.js', () => ({ default: {} }));
vi.mock('UI/Components/Navigation/Navigation.js', () => ({ default: {} }));

const ProcessCommand = (await import('Controls/ProcessCommand.js')).default;
const PACKET = (await import('Network/PacketStructure.js')).default;

/** Type a command the way the chat box hands it over, without the slash. */
function run(text) {
	ProcessCommand.processCommand.call(mocks.chatBox, text);
}

/** The single packet a command sent. */
function sentOne() {
	expect(mocks.sent).toHaveLength(1);
	return mocks.sent[0];
}

beforeEach(() => {
	mocks.sent.length = 0;
	mocks.chatBox.addText.mockClear();
	mocks.chatBox.PrivateMessageStorage.blockNicks.length = 0;
});

describe('whisper blocking', () => {
	it('blocks a name with /ex and keeps it for the reply', () => {
		run('ex Some Body');

		const pkt = sentOne();
		expect(pkt).toBeInstanceOf(PACKET.CZ.SETTING_WHISPER_PC);
		expect(pkt.name).toBe('Some Body');
		expect(pkt.type).toBe(0);
		expect(mocks.chatBox.PrivateMessageStorage.blockNicks).toEqual(['Some Body']);
	});

	it('allows a name again with /in', () => {
		run('in Some Body');

		const pkt = sentOne();
		expect(pkt).toBeInstanceOf(PACKET.CZ.SETTING_WHISPER_PC);
		expect(pkt.name).toBe('Some Body');
		expect(pkt.type).toBe(1);
		expect(mocks.chatBox.PrivateMessageStorage.blockNicks).toEqual(['Some Body']);
	});

	it('queues each name in request order', () => {
		run('ex Alice');
		run('in Bob');

		expect(mocks.sent).toHaveLength(2);
		expect(mocks.chatBox.PrivateMessageStorage.blockNicks).toEqual(['Alice', 'Bob']);
	});

	it('asks for the block list with a bare /ex', () => {
		run('ex');

		expect(sentOne()).toBeInstanceOf(PACKET.CZ.REQ_WHISPER_LIST);
	});

	it('prints the /in help line without a name', () => {
		run('in');

		expect(mocks.sent).toHaveLength(0);
		expect(mocks.chatBox.addText).toHaveBeenCalledWith('MSG 44', 1, 8);
	});

	it.each([
		['exall', 0],
		['inall', 1]
	])('sends /%s as whisper state %i', (cmd, type) => {
		run(cmd);

		const pkt = sentOne();
		expect(pkt).toBeInstanceOf(PACKET.CZ.SETTING_WHISPER_STATE);
		expect(pkt.type).toBe(type);
	});
});
