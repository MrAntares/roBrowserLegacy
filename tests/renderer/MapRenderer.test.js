import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	thread: { hook: vi.fn(), send: vi.fn() },
	soundManager: { stop: vi.fn() },
	bgm: { stop: vi.fn(), play: vi.fn() },
	uiManager: { removeComponents: vi.fn(), showErrorBox: vi.fn(() => ({ ui: { css: vi.fn() } })) },
	background: {
		remove: vi.fn(callback => callback()),
		setLoading: vi.fn(),
		setPercent: vi.fn()
	},
	cursor: {
		ACTION: { DEFAULT: 0 },
		setType: vi.fn()
	},
	mouse: { intersect: true },
	renderer: {
		stop: vi.fn(),
		remove: vi.fn(),
		getContext: vi.fn(() => ({})),
		render: vi.fn(),
		init: vi.fn(),
		show: vi.fn()
	},
	entityManager: { free: vi.fn() },
	effectManager: { free: vi.fn(), init: vi.fn() },
	screenEffects: { init: vi.fn(), startMapflagEffect: vi.fn() },
	sky: { setUpCloudData: vi.fn(), init: vi.fn() },
	damage: { free: vi.fn(), init: vi.fn() },
	joystickUI: { onRestore: vi.fn() },
	perfProbe: { enabled: false, mapStart: vi.fn(), mapReady: vi.fn() }
}));

vi.mock('Core/Thread.js', () => ({ default: mocks.thread }));
vi.mock('Audio/SoundManager.js', () => ({ default: mocks.soundManager }));
vi.mock('Audio/BGM.js', () => ({ default: mocks.bgm }));
vi.mock('DB/DBManager.js', () => ({ default: { getMap: () => null } }));
vi.mock('UI/UIManager.js', () => ({ default: mocks.uiManager }));
vi.mock('UI/Background.js', () => ({ default: mocks.background }));
vi.mock('UI/CursorManager.js', () => ({ default: mocks.cursor }));
vi.mock('Engine/SessionStorage.js', () => ({ default: {} }));
vi.mock('Core/MemoryManager.js', () => ({ default: {} }));
vi.mock('Controls/MouseEventHandler.js', () => ({ default: mocks.mouse }));
vi.mock('Renderer/Renderer.js', () => ({ default: mocks.renderer }));
vi.mock('Renderer/Camera.js', () => ({ default: {} }));
vi.mock('Renderer/EntityManager.js', () => ({ default: mocks.entityManager }));
vi.mock('Renderer/Map/GridSelector.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Ground.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Altitude.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Water.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Models.js', () => ({ default: {} }));
vi.mock('Renderer/Map/AnimatedModels.js', () => ({ default: {} }));
vi.mock('Renderer/Map/OccluderFade.js', () => ({ default: {} }));
vi.mock('Renderer/GR2/GR2ModelRenderer.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Sounds.js', () => ({ default: {} }));
vi.mock('Renderer/Map/Effects.js', () => ({ default: {} }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: { init: vi.fn() } }));
vi.mock('Renderer/EffectManager.js', () => ({ default: mocks.effectManager }));
vi.mock('Renderer/SignboardManager.js', () => ({ default: {} }));
vi.mock('Renderer/ScreenEffectManager.js', () => ({ default: mocks.screenEffects }));
vi.mock('Renderer/Effects/Sky.js', () => ({ default: mocks.sky }));
vi.mock('Renderer/Effects/Damage.js', () => ({ default: mocks.damage }));
vi.mock('Preferences/Graphics.js', () => ({ default: {} }));
vi.mock('Preferences/Map.js', () => ({ default: { useFog: true } }));
vi.mock('Utils/gl-matrix.js', () => ({ default: { mat4: {} } }));
vi.mock('Network/PacketVerManager.js', () => ({ default: {} }));
vi.mock('UI/Components/JoystickUI/JoystickUI.js', () => ({ default: mocks.joystickUI }));
vi.mock('Renderer/Effects/PostProcess.js', () => ({ default: { register: () => {} } }));
vi.mock('Renderer/Effects/Shaders/Bloom.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/VerticalFlip.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/GaussianBlur.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/CAS.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/FXAA.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/Vibrance.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/Cartoon.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/Blind.js', () => ({ default: {} }));
vi.mock('Renderer/Effects/Shaders/Upsampling.js', () => ({ default: {} }));
vi.mock('Utils/WebGL.js', () => ({ default: { detectBadWebGL: () => false } }));
vi.mock('Core/PerfProbe.js', () => ({ default: mocks.perfProbe }));

const { default: MapRenderer } = await import('Renderer/MapRenderer.js');

describe('MapRenderer joystick restoration', () => {
	let originalOnLoad;

	beforeEach(() => {
		vi.clearAllMocks();
		originalOnLoad = MapRenderer.onLoad;
		MapRenderer.loading = false;
		MapRenderer.currentMap = 'prontera.gat';
		MapRenderer.onLoad = vi.fn();
		mocks.mouse.intersect = true;
	});

	afterEach(() => {
		MapRenderer.onLoad = originalOnLoad;
	});

	it('restores joystick polling before re-appending UI after a same-map teleport', () => {
		MapRenderer.setMap('prontera.gat');

		expect(mocks.uiManager.removeComponents).toHaveBeenCalledOnce();
		expect(mocks.joystickUI.onRestore).toHaveBeenCalledOnce();
		expect(MapRenderer.onLoad).toHaveBeenCalledOnce();
		expect(mocks.joystickUI.onRestore.mock.invocationCallOrder[0]).toBeLessThan(
			MapRenderer.onLoad.mock.invocationCallOrder[0]
		);
	});

	it('leaves different-map restoration to the map completion lifecycle', () => {
		MapRenderer.setMap('geffen.gat');

		expect(mocks.background.setLoading).toHaveBeenCalledOnce();
		expect(mocks.joystickUI.onRestore).not.toHaveBeenCalled();
		expect(MapRenderer.onLoad).not.toHaveBeenCalled();
		expect(MapRenderer.loading).toBe(true);
		expect(MapRenderer.currentMap).toBe('geffen.gat');
	});

	it('asks the worker for the new map before the loading fade, and holds its results until the fade is done', () => {
		const free = vi.spyOn(MapRenderer, 'free').mockImplementation(() => {});
		mocks.renderer.remove = vi.fn();
		mocks.thread.send.mockImplementation(name => (name === 'LOAD_MAP' ? 7 : undefined));

		MapRenderer.setMap('geffen.gat');

		// The worker already has the map...
		const load = mocks.thread.send.mock.calls.find(([type]) => type === 'LOAD_MAP');
		expect(load[1]).toBe('geffen.rsw');
		expect(mocks.thread.send.mock.invocationCallOrder.at(-1)).toBeLessThan(
			mocks.background.setLoading.mock.invocationCallOrder[0]
		);

		// ...but what it sends back waits for the fade, then the old map is freed first.
		const hooks = Object.fromEntries(mocks.thread.hook.mock.calls);
		const onComplete = load[2];
		hooks.MAP_PROGRESS(50, 7);
		hooks.MAP_PROGRESS(40, 6); // another request's event
		onComplete(false, 'nope');
		expect(mocks.background.setPercent).not.toHaveBeenCalled();
		expect(mocks.uiManager.showErrorBox).not.toHaveBeenCalled();
		expect(free).not.toHaveBeenCalled();

		mocks.background.setLoading.mock.calls[0][0]();
		expect(free).toHaveBeenCalledOnce();
		expect(mocks.renderer.remove).toHaveBeenCalledOnce();
		expect(mocks.background.setPercent).toHaveBeenCalledWith(50);
		expect(mocks.background.setPercent).not.toHaveBeenCalledWith(40);
		expect(mocks.uiManager.showErrorBox).toHaveBeenCalledWith('nope');
		expect(free.mock.invocationCallOrder[0]).toBeLessThan(mocks.background.setPercent.mock.invocationCallOrder[0]);

		// Results after the fade go straight through.
		hooks.MAP_PROGRESS(60, 7);
		expect(mocks.background.setPercent).toHaveBeenLastCalledWith(60);
		hooks.MAP_PROGRESS(70, 6);
		expect(mocks.background.setPercent).toHaveBeenLastCalledWith(60);
		free.mockRestore();
		mocks.thread.send.mockReset();
	});

	it('starts the new map behind the closing fade, and hands over the mouse once the image is gone', () => {
		vi.spyOn(MapRenderer, 'free').mockImplementation(() => {});
		mocks.renderer.remove = vi.fn();
		mocks.mouse.intersect = false;
		let reveal;
		mocks.background.remove.mockImplementationOnce(callback => (reveal = callback));

		MapRenderer.setMap('geffen.gat');
		mocks.background.setLoading.mock.calls[0][0]();
		const onComplete = mocks.thread.send.mock.calls.find(([type]) => type === 'LOAD_MAP')[2];
		onComplete(true);

		// The map is set up and drawing under the loading image...
		expect(MapRenderer.loading).toBe(false);
		expect(MapRenderer.onLoad).toHaveBeenCalledOnce();
		expect(mocks.renderer.show).toHaveBeenCalledOnce();
		expect(mocks.renderer.render).toHaveBeenCalledOnce();
		expect(MapRenderer.onLoad.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.background.remove.mock.invocationCallOrder[0]
		);
		expect(mocks.mouse.intersect).toBe(false);

		// ...and a move the server sends meanwhile waits for the image to go.
		MapRenderer.setMap('payon.gat');
		expect(MapRenderer.currentMap).toBe('geffen.gat');
		expect(mocks.background.setLoading).toHaveBeenCalledOnce();

		reveal();
		expect(mocks.mouse.intersect).toBe(true);
		expect(MapRenderer.currentMap).toBe('payon.gat');
		expect(mocks.background.setLoading).toHaveBeenCalledTimes(2);
		MapRenderer.free.mockRestore();
	});

	it('marks the map ready for the perf probe after its set-up and before its first frame, not at the reveal', () => {
		vi.spyOn(MapRenderer, 'free').mockImplementation(() => {});
		mocks.renderer.remove = vi.fn();
		mocks.perfProbe.enabled = true;
		let reveal;
		mocks.background.remove.mockImplementationOnce(callback => (reveal = callback));

		MapRenderer.setMap('geffen.gat');
		mocks.background.setLoading.mock.calls[0][0]();
		const onComplete = mocks.thread.send.mock.calls.find(([type]) => type === 'LOAD_MAP')[2];
		onComplete(true);

		expect(mocks.perfProbe.mapStart).toHaveBeenCalledWith('geffen.gat');
		expect(mocks.perfProbe.mapReady).toHaveBeenCalledOnce();
		expect(MapRenderer.onLoad.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.perfProbe.mapReady.mock.invocationCallOrder[0]
		);
		expect(mocks.screenEffects.startMapflagEffect.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.perfProbe.mapReady.mock.invocationCallOrder[0]
		);
		expect(mocks.perfProbe.mapReady.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.renderer.render.mock.invocationCallOrder[0]
		);

		reveal();
		expect(mocks.perfProbe.mapReady).toHaveBeenCalledOnce();
		mocks.perfProbe.enabled = false;
		MapRenderer.free.mockRestore();
	});
});

describe('MapRenderer.cancelLoad', () => {
	let originalOnLoad;
	let originalFree;

	beforeEach(() => {
		vi.clearAllMocks();
		originalOnLoad = MapRenderer.onLoad;
		originalFree = MapRenderer.free;
		MapRenderer.loading = false;
		MapRenderer.currentMap = 'prontera.gat';
		MapRenderer.onLoad = vi.fn();
		MapRenderer.free = vi.fn();
	});

	afterEach(() => {
		MapRenderer.onLoad = originalOnLoad;
		MapRenderer.free = originalFree;
	});

	it('drops a load cancelled before the loading screen is up, though the worker had started on it', () => {
		let showLoading;
		mocks.background.setLoading.mockImplementationOnce(callback => {
			showLoading = callback;
		});
		mocks.thread.send.mockImplementation(name => (name === 'LOAD_MAP' ? 7 : undefined));

		MapRenderer.setMap('geffen.gat');
		const [, , onMapComplete] = mocks.thread.send.mock.calls.find(([name]) => name === 'LOAD_MAP');
		const onProgress = mocks.thread.hook.mock.calls.find(([name]) => name === 'MAP_PROGRESS')[1];
		onProgress(50, 7);
		onMapComplete(true);

		expect(MapRenderer._fadeQueue).toHaveLength(2);
		MapRenderer.cancelLoad();
		expect(MapRenderer._fadeQueue).toHaveLength(0);

		// What the worker still sends is not kept, even if the fade never ends
		onProgress(80, 7);
		onMapComplete(true);
		expect(MapRenderer._fadeQueue).toHaveLength(0);
		showLoading();

		expect(MapRenderer.free).not.toHaveBeenCalled();
		expect(mocks.background.setPercent).not.toHaveBeenCalled();
		expect(mocks.background.remove).not.toHaveBeenCalled();
		expect(MapRenderer.onLoad).not.toHaveBeenCalled();
		expect(MapRenderer.loading).toBe(false);
		mocks.thread.send.mockReset();
	});

	it('ignores the worker answers of a cancelled load', () => {
		mocks.background.setLoading.mockImplementationOnce(callback => callback());

		MapRenderer.setMap('geffen.gat');
		const [, , onMapComplete] = mocks.thread.send.mock.calls[0];
		const onProgress = mocks.thread.hook.mock.calls.find(([name]) => name === 'MAP_PROGRESS')[1];

		const [request] = mocks.thread.send.mock.results.map(result => result.value);

		MapRenderer.cancelLoad();
		onProgress(50, request);
		onMapComplete(true);

		expect(mocks.background.setPercent).not.toHaveBeenCalled();
		expect(mocks.background.remove).not.toHaveBeenCalled();
		expect(MapRenderer.onLoad).not.toHaveBeenCalled();
		expect(MapRenderer.loading).toBe(false);
	});

	it('keeps the late worker events of a cancelled load out of the next one', () => {
		mocks.background.setLoading.mockImplementation(callback => callback());
		mocks.thread.send.mockReturnValueOnce(7).mockReturnValueOnce(8);

		MapRenderer.setMap('geffen.gat');
		MapRenderer.cancelLoad();
		MapRenderer.setMap('payon.gat');
		const onProgress = mocks.thread.hook.mock.calls.filter(([name]) => name === 'MAP_PROGRESS').at(-1)[1];

		onProgress(80, 7);
		expect(mocks.background.setPercent).not.toHaveBeenCalled();

		onProgress(30, 8);
		expect(mocks.background.setPercent).toHaveBeenCalledWith(30);

		mocks.background.setLoading.mockReset();
	});

	it('does not re-enter the map when a same-map teleport is cancelled during its fade', () => {
		let fadeDone;
		mocks.background.remove.mockImplementationOnce(callback => {
			fadeDone = callback;
		});

		MapRenderer.setMap('prontera.gat');
		MapRenderer.cancelLoad();
		fadeDone();

		expect(MapRenderer.onLoad).not.toHaveBeenCalled();
		expect(mocks.renderer.render).not.toHaveBeenCalled();
	});

	it('drops the map change waiting behind a closing fade that is cancelled', () => {
		mocks.renderer.remove = vi.fn();
		mocks.mouse.intersect = false;
		let reveal;
		mocks.background.remove.mockImplementationOnce(callback => (reveal = callback));

		MapRenderer.setMap('geffen.gat');
		mocks.background.setLoading.mock.calls[0][0]();
		mocks.thread.send.mock.calls.find(([type]) => type === 'LOAD_MAP')[2](true);
		MapRenderer.setMap('payon.gat');

		MapRenderer.cancelLoad();
		reveal();

		expect(mocks.mouse.intersect).toBe(false);
		expect(mocks.background.setLoading).toHaveBeenCalledOnce();

		// The next map the server sends loads at once
		MapRenderer.setMap('izlude.gat');
		expect(MapRenderer.currentMap).toBe('izlude.gat');
		expect(mocks.background.setLoading).toHaveBeenCalledTimes(2);
	});

	it('lets the next map load after a cancel', () => {
		MapRenderer.setMap('geffen.gat');
		MapRenderer.cancelLoad();
		MapRenderer.setMap('payon.gat');

		expect(mocks.background.setLoading).toHaveBeenCalledTimes(2);
		expect(MapRenderer.currentMap).toBe('payon.gat');
	});
});

describe('MapRenderer.free', () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		mocks.entityManager.clearLifeCache = vi.fn();
		const freed = await Promise.all(
			[
				'Renderer/Map/GridSelector.js',
				'Renderer/Map/Sounds.js',
				'Renderer/Map/Effects.js',
				'Renderer/Map/Ground.js',
				'Renderer/Map/Water.js',
				'Renderer/Map/Models.js',
				'Renderer/Map/AnimatedModels.js',
				'Renderer/Map/OccluderFade.js',
				'Renderer/GR2/GR2ModelRenderer.js',
				'Renderer/SignboardManager.js'
			].map(path => import(path))
		);
		freed.forEach(module => {
			module.default.free = vi.fn();
		});
		const { default: PostProcess } = await import('Renderer/Effects/PostProcess.js');
		PostProcess.clean = vi.fn();
	});

	it('puts the cursor back to the default arrow when leaving the map', () => {
		MapRenderer.free();

		expect(mocks.cursor.setType).toHaveBeenCalledWith(mocks.cursor.ACTION.DEFAULT);
	});
});
