import { beforeEach, describe, expect, it, vi } from 'vitest';

// onServerClosed is module-private and only reachable through the hook init()
// registers, so the Network mock keeps the packet name -> handler map.
const mocks = vi.hoisted(() => {
	const calls = [];
	const record = name => vi.fn(() => calls.push(name));

	return {
		calls,
		hooks: {},
		box: null,
		renderer: { width: 1200, height: 800, stop: record('Renderer.stop') },
		mapRenderer: { cancelLoad: record('MapRenderer.cancelLoad'), free: record('MapRenderer.free') },
		background: {
			setLoginBackground: record('Background.setLoginBackground'),
			init: vi.fn(),
			resize: vi.fn(),
			setPercent: vi.fn()
		},
		bgm: { play: vi.fn(), setAvailableExtensions: vi.fn() },
		winLogin: { append: record('WinLogin.append') },
		uiManager: {
			removeComponents: record('UIManager.removeComponents'),
			showErrorBox: vi.fn(),
			showMessageBox: vi.fn(),
			addComponent: vi.fn()
		}
	};
});

const packet = name => ({ name });

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (struct, fn) => {
			mocks.hooks[struct.name] = fn;
		},
		close: vi.fn()
	}
}));
vi.mock('Network/PacketStructure.js', () => ({
	default: new Proxy(
		{},
		{ get: (_t, group) => new Proxy({}, { get: (_g, name) => packet(group + '.' + name) }) }
	)
}));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20180704 } }));
vi.mock('DB/DBManager.js', () => ({ default: { getMessage: id => 'MSG ' + id } }));
vi.mock('Core/Configs.js', () => ({ default: { setServer: vi.fn(), get: (_k, d) => d, set: vi.fn() } }));
vi.mock('Core/Thread.js', () => ({ default: { send: vi.fn() } }));
vi.mock('Utils/CodepageManager.js', () => ({ default: { detectEncodingByLangtype: vi.fn() } }));
vi.mock('Audio/BGM.js', () => ({ default: mocks.bgm }));
vi.mock('Audio/SoundManager.js', () => ({ default: { play: vi.fn() } }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Engine/CharEngine.js', () => ({ default: { init: vi.fn() } }));
vi.mock('Plugins/PluginManager.js', () => ({ default: { init: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: mocks.renderer }));
vi.mock('Renderer/MapRenderer.js', () => ({ default: mocks.mapRenderer }));
vi.mock('UI/UIManager.js', () => ({ default: mocks.uiManager }));
vi.mock('UI/Background.js', () => ({ default: mocks.background }));
vi.mock('UI/Components/WinList/WinList.js', () => ({ default: {} }));
vi.mock('UI/Components/WinPopup/WinPopup.js', () => ({ default: { clone: () => ({}) } }));
vi.mock('UI/Components/WinLogin/WinLogin.js', () => ({
	default: { selectUIVersion: vi.fn(), getUI: () => mocks.winLogin }
}));
vi.mock('Vendors/spark-md5.min.js', () => ({ default: {} }));
vi.mock('Utils/Rijndael.js', () => ({ default: {} }));

import LoginEngine from 'Engine/LoginEngine.js';

describe('LoginEngine SC.NOTIFY_BAN', () => {
	beforeEach(() => {
		vi.spyOn(console, 'log').mockImplementation(() => {});
		LoginEngine.init({ address: '127.0.0.1', port: 6900 });
		mocks.calls.length = 0;
		mocks.uiManager.showMessageBox.mockClear();
	});

	it('stops the map behind the login screen once the ban is acknowledged', () => {
		mocks.hooks['SC.NOTIFY_BAN']({ ErrorCode: 15 });

		expect(mocks.uiManager.showMessageBox).toHaveBeenCalledOnce();
		const [text, , onOk] = mocks.uiManager.showMessageBox.mock.calls[0];
		expect(text).toBe('MSG 579');
		expect(mocks.calls).toEqual([]);

		onOk();

		expect(mocks.calls).toEqual([
			'Renderer.stop',
			'MapRenderer.cancelLoad',
			'MapRenderer.free',
			'UIManager.removeComponents',
			'Background.setLoginBackground',
			'WinLogin.append'
		]);
		expect(mocks.bgm.play).toHaveBeenCalledWith('01.mp3');
	});
});
