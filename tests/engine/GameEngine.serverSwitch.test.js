import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
	const hooks = {};
	return {
		hooks,
		winList: {
			append: vi.fn(),
			remove: vi.fn(),
			setList: vi.fn(),
			onIndexSelected: null,
			onExitRequest: null
		},
		dbInitLangtypes: [],
		loginInitServers: [],
		loadedServers: []
	};
});

import Configs from 'Core/Configs.js';

vi.mock('Audio/SoundManager.js', () => ({ default: { play: vi.fn(), stop: vi.fn() } }));
vi.mock('Audio/BGM.js', () => ({ default: { play: vi.fn(), setAvailableExtensions: vi.fn() } }));
vi.mock('DB/DBManager.js', () => ({
	default: {
		mapalias: {},
		onReady: null,
		onProgress: null,
		init: vi.fn(function () {
			mocks.dbInitLangtypes.push(Configs.get('langtype', 0));
			if (this.onReady) this.onReady();
		})
	}
}));
vi.mock('Core/Client.js', () => ({
	default: {
		onFilesLoaded: null,
		init: vi.fn(function () {
			if (this.onFilesLoaded) this.onFilesLoaded(1);
		}),
		loadFile: vi.fn()
	}
}));
vi.mock('Core/Thread.js', () => ({
	default: {
		hook: vi.fn((name, fn) => {
			mocks.hooks[name] = fn;
		}),
		init: vi.fn(() => {
			if (mocks.hooks.THREAD_READY) mocks.hooks.THREAD_READY();
		}),
		send: vi.fn()
	}
}));
vi.mock('Core/Context.js', () => ({ default: { checkSupport: vi.fn() } }));
vi.mock('Engine/LoginEngine.js', () => ({
	default: {
		init: vi.fn(server => {
			Configs.setServer(server);
			mocks.loginInitServers.push(server);
		}),
		setLoadedServer: vi.fn(server => {
			mocks.loadedServers.push(server);
		})
	}
}));
vi.mock('Network/NetworkManager.js', () => ({ default: { close: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 800, height: 600, init: vi.fn(), stop: vi.fn() } }));
vi.mock('Renderer/MapRenderer.js', () => ({ default: { cancelLoad: vi.fn(), free: vi.fn() } }));
vi.mock('UI/UIManager.js', () => ({ default: { removeComponents: vi.fn(), showMessageBox: vi.fn() } }));
vi.mock('UI/CursorManager.js', () => ({ default: { init: vi.fn(cb => cb()) } }));
vi.mock('UI/Scrollbar.js', () => ({ default: { init: vi.fn() } }));
vi.mock('UI/Background.js', () => ({
	default: {
		init: vi.fn(),
		resize: vi.fn(),
		setPercent: vi.fn(),
		setImage: vi.fn((_img, cb) => cb && cb())
	}
}));
vi.mock('UI/Components/Intro/Intro.js', () => ({ default: { remove: vi.fn(), append: vi.fn() } }));
vi.mock('UI/Components/WinList/WinList.js', () => ({ default: mocks.winList }));
vi.mock('Utils/ConsoleManager.js', () => ({ default: { init: vi.fn(), toggle: vi.fn() } }));
vi.mock('App/PreLoader.js', () => ({ roInitSpinner: { remove: vi.fn() } }));

import GameEngine from 'Engine/GameEngine.js';

describe('GameEngine server switching', () => {
	it('sets the newly selected server before reloading DB files on server switch', () => {
		const krServer = { display: 'KR', address: '127.0.0.1', port: 6900, langtype: 0 };
		const twServer = { display: 'TW', address: '127.0.0.1', port: 6901, langtype: 4 };
		Configs.set('skipIntro', true);
		Configs.set('servers', [krServer, twServer]);

		GameEngine.init();
		expect(mocks.dbInitLangtypes).toEqual([0]);
		expect(typeof mocks.winList.onIndexSelected).toBe('function');

		// Select second server (TW, langtype 4)
		mocks.winList.onIndexSelected(1);
		expect(Configs.get('langtype')).toBe(4);
		expect(mocks.loginInitServers).toEqual([twServer]);

		// Switch back to first server (KR, langtype 0)
		mocks.winList.onIndexSelected(0);

		// DB.init() inside loadFiles must already observe the destination server's langtype (0), not 4
		expect(mocks.dbInitLangtypes).toEqual([0, 0]);
		expect(mocks.loadedServers).toEqual([krServer]);
		expect(mocks.loginInitServers).toEqual([twServer, krServer]);
		expect(Configs.getServer()).toBe(krServer);
	});
});

