import { beforeEach, describe, expect, it, vi } from 'vitest';

// /perf, registered when the configuration has perfProbe: true
const mocks = vi.hoisted(() => ({
	sent: [],
	probe: {
		enabled: true,
		stats: () => ({
			fps: 59.9,
			seconds: 12,
			drawingSeconds: 10,
			slowFrames: 1,
			frameMs: { p50: 16.7, p99: 18 },
			workMs: { avg: 4.2 },
			drawCalls: { avg: 120 },
			hitches: 1
		}),
		reset: () => {},
		slowFrames: () => [{ at: 1, frameMs: 40, workMs: 30, draws: 100 }],
		overlay: () => {}
	},
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
vi.mock('Core/Configs.js', () => ({ default: { get: (key, d) => (key === 'perfProbe' ? true : d) } }));
vi.mock('Core/PerfProbe.js', () => ({ default: mocks.probe }));
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

/** Type a command the way the chat box hands it over, without the slash. */
function run(text) {
	ProcessCommand.processCommand.call(mocks.chatBox, text);
}

const lastText = () => mocks.chatBox.addText.mock.calls.at(-1)[0];

beforeEach(() => {
	mocks.chatBox.addText.mockClear();
	mocks.probe.enabled = true;
	for (const name of ['reset', 'overlay', 'slowFrames']) {
		vi.spyOn(mocks.probe, name);
	}
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'table').mockImplementation(() => {});
});

describe('/perf', () => {
	it('is registered when the configuration switches the probe on', () => {
		expect(ProcessCommand.isEnabled('perf')).toBe(true);
	});

	it('prints a summary in the chat and the whole stats in the console', () => {
		run('perf');
		expect(lastText()).toBe('59.9 fps over 10 s of drawing: frame p50 16.7 / p99 18 ms, work 4.2 ms, 120 draws, 1 hitches');
		expect(console.log).toHaveBeenCalledWith('[PerfProbe] stats', expect.objectContaining({ fps: 59.9 }));
	});

	it('resets, lists slow frames and toggles the overlay', () => {
		run('perf reset');
		expect(mocks.probe.reset).toHaveBeenCalled();
		run('perf slow');
		expect(console.table).toHaveBeenCalledWith(mocks.probe.slowFrames.mock.results[0].value);
		expect(lastText()).toBe('1 frames over 33 ms since the last reset.');
		run('perf overlay off');
		expect(mocks.probe.overlay).toHaveBeenLastCalledWith(false);
		run('perf overlay');
		expect(mocks.probe.overlay).toHaveBeenLastCalledWith(true);
	});

	it('says so when the probe is not running', () => {
		mocks.probe.enabled = false;
		run('perf');
		expect(lastText()).toBe('The performance probe is not running.');
	});
});
