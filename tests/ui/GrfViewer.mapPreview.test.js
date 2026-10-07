import { beforeAll, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	hooks: {},
	sent: [],
	app: null
}));

vi.mock('Core/Thread.js', () => ({
	default: {
		hook: (type, fn) => {
			mocks.hooks[type] = fn;
		},
		send: (type, data, callback) => {
			mocks.sent.push({ type, data, callback });
			return 40 + mocks.sent.length;
		},
		init: vi.fn()
	}
}));
vi.mock('Core/Configs.js', () => ({ default: { get: (_k, d) => d } }));
vi.mock('Core/Client.js', () => ({ default: { init: vi.fn() } }));
vi.mock('Core/MemoryManager.js', () => ({ default: {} }));
vi.mock('Core/Events.js', () => ({ default: { setTimeout: vi.fn(), process: vi.fn() } }));
vi.mock('Controls/KeyEventHandler.js', () => ({ default: {} }));
vi.mock('Loaders/Sprite.js', () => ({ default: {} }));
vi.mock('Loaders/Targa.js', () => ({ default: {} }));
vi.mock('UI/Components/GrfViewer/History.js', () => ({ default: { push: vi.fn(), init: vi.fn() } }));
vi.mock('UI/GUIComponent.js', () => ({
	default: class {
		constructor() {
			this._shadow = document.createElement('div');
		}

		getRoot() {
			return this._shadow;
		}
	}
}));

import Viewer from 'UI/Components/GrfViewer/GrfViewer.js';

// The map preview runs in its own frame, with its own Thread and request ids
class FakeROBrowser {
	constructor() {
		this._APP = { postMessage: vi.fn(), frameElement: { style: {} } };
		mocks.app = this;
	}

	start() {}
}
FakeROBrowser.TYPE = { FRAME: 'frame' };
FakeROBrowser.APP = { MAPVIEWER: 'mapviewer' };

describe('GrfViewer map preview', () => {
	beforeAll(() => {
		globalThis.ROBrowser = FakeROBrowser;
		Viewer._shadow.innerHTML = Viewer.render();
		Viewer.init();

		const icon = document.createElement('div');
		icon.className = 'map';
		icon.setAttribute('data-path', 'data\\prontera.rsw');
		Viewer.getRoot().querySelector('#grfviewer').appendChild(icon);
		icon.click();
		mocks.app.onReady();
	});

	it("forwards the worker's map events under the preview's own request id", () => {
		window.dispatchEvent(new MessageEvent('message', { data: { type: 'LOAD_MAP', data: 'prontera.rsw', uid: 3 } }));
		const parentRequest = 40 + mocks.sent.length;

		mocks.hooks.MAP_WORLD({ light: {} }, parentRequest);

		expect(mocks.app._APP.postMessage).toHaveBeenLastCalledWith(
			{ type: 'MAP_WORLD', data: { light: {} }, request: 3 },
			location.origin
		);

		// Once the load answers, its id is forgotten
		mocks.sent.at(-1).callback(true);
		mocks.hooks.MAP_WORLD({ light: {} }, parentRequest);

		expect(mocks.app._APP.postMessage).toHaveBeenLastCalledWith(
			{ type: 'MAP_WORLD', data: { light: {} }, request: undefined },
			location.origin
		);
	});
});
