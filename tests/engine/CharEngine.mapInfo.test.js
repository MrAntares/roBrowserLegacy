/**
 * The char server hands us to a map server once. While the client waits for
 * its databases it retries every 100 ms, and a retry may run after the game
 * moved on to another socket: only the packet itself marks the socket we leave.
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	handlers: {},
	db: { isLoaded: false, startedLazyInit: false, lazyInit: vi.fn() },
	network: {
		expectClose: vi.fn(),
		connect: vi.fn((_ip, _port, cb) => cb(true)),
		sendPacket: vi.fn(),
		read: vi.fn(),
		hookPacket: vi.fn((struct, cb) => {
			mocks.handlers[struct] = cb;
		}),
		utils: { longToIP: () => '127.0.0.1' }
	},
	mapEngine: { init: vi.fn() }
}));

vi.mock('DB/DBManager.js', () => ({ default: mocks.db }));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d, getServer: () => ({}) } }));
vi.mock('Core/Events.js', () => ({ default: {} }));
vi.mock('Audio/SoundManager.js', () => ({ default: {} }));
vi.mock('Audio/BGM.js', () => ({ default: { play: vi.fn() } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Engine/MapEngine.js', () => ({ default: mocks.mapEngine }));
vi.mock('Network/NetworkManager.js', () => ({ default: mocks.network }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20180704 } }));
vi.mock('Network/PacketStructure.js', () => ({
	default: new Proxy(
		{},
		{
			get: (_t, ns) =>
				new Proxy(
					{},
					{
						get: (_n, name) => {
							const Struct = function () {};
							Struct.toString = () => `${String(ns)}.${String(name)}`;
							return Struct;
						}
					}
				)
		}
	)
}));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn() } }));
vi.mock('UI/UIVersionManager.js', () => ({ default: { selectAllChar: vi.fn() } }));
vi.mock('UI/Background.js', () => ({ default: {} }));
vi.mock('UI/Components/PincodeWindow/PincodeWindow.js', () => ({ default: {} }));
vi.mock('UI/Components/InputBox/InputBox.js', () => ({ default: {} }));
vi.mock('UI/Components/JoystickUI/JoystickUI.js', () => ({ default: { onRestore: vi.fn() } }));
vi.mock('UI/Components/CharSelect/CharSelect.js', () => ({ default: {} }));
vi.mock('UI/Components/CharCreate/CharCreate.js', () => ({ default: {} }));
vi.mock('Renderer/Entity/Player.js', () => ({ default: {} }));

const CharEngine = (await import('Engine/CharEngine.js')).default;

describe('CharEngine on the map server address', () => {
	it('marks the socket it leaves once, not on every database retry', () => {
		vi.useFakeTimers();
		CharEngine.init({ ip: 0, port: 6121 });
		const onReceiveMapInfo = mocks.handlers['HC.NOTIFY_ZONESVR'];
		const pkt = { GID: 1, addr: { ip: 0, port: 5121 }, mapName: 'prontera.gat' };

		onReceiveMapInfo(pkt);
		vi.advanceTimersByTime(500);
		expect(mocks.network.expectClose).toHaveBeenCalledOnce();
		expect(mocks.mapEngine.init).not.toHaveBeenCalled();

		mocks.db.isLoaded = true;
		vi.advanceTimersByTime(100);
		vi.useRealTimers();

		expect(mocks.network.expectClose).toHaveBeenCalledOnce();
		expect(mocks.mapEngine.init).toHaveBeenCalledWith(0, 5121, 'prontera.gat');
	});
});
