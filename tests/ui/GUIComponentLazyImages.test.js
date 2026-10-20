/**
 * Entering the map prepares dozens of windows the player may never open.
 * Their art is fetched when each element is first drawn (UI/WhenDrawn.js),
 * not when the window is prepared or appended hidden.
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ requested: [], observed: new Set(), callback: null }));

// jsdom draws nothing; a test says which elements are on screen
globalThis.IntersectionObserver = class {
	constructor(callback) {
		mocks.callback = callback;
	}
	observe(element) {
		mocks.observed.add(element);
	}
	unobserve(element) {
		mocks.observed.delete(element);
	}
};
function draw(predicate = () => true) {
	const entries = [...mocks.observed].filter(predicate).map(target => ({ target, isIntersecting: true }));
	mocks.callback?.(entries);
}

vi.mock('Core/Client.js', () => ({
	default: {
		loadFile(path, onload) {
			mocks.requested.push(path);
			onload?.(`img:${path}`);
		},
		loadFiles(files) {
			mocks.requested.push(...files);
		}
	}
}));
vi.mock('DB/DBManager.js', () => ({
	default: { INTERFACE_PATH: '', getMessage: id => (id === '7' ? 'Close' : '') }
}));
vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: () => 0, setType: vi.fn() } }));
vi.mock('Renderer/Renderer.js', () => ({ default: {} }));
vi.mock('Renderer/EntityManager.js', () => ({ default: {} }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_k, def) => ({ ...def, save: vi.fn() }) } }));

const { default: GUIComponent } = await import('UI/GUIComponent.js');
await import('UI/Elements/UIButton.js');
await import('UI/Elements/UIImage.js');

// GUIComponent loads Client and DB itself before it handles a node
await new Promise(r => setTimeout(r, 20));

function makeWindow(name) {
	const component = new GUIComponent(name, '');
	component.render = () =>
		`<div class="bg" data-background="${name}/bg.bmp"></div>` +
		`<button class="close" data-text="7" data-hover="${name}/close_a.bmp" data-preload="${name}/extra.bmp"></button>`;
	return component;
}

const inWindow = win => element => win.getRoot().contains(element);

describe('window art is fetched when first drawn', () => {
	it('sets the text on prepare but fetches no image', async () => {
		mocks.requested = [];
		const win = makeWindow('lazyprep');
		win.prepare();
		await new Promise(r => setTimeout(r, 20));
		expect(mocks.requested).toEqual([]);
		expect(win.getRoot().querySelector('.close').textContent).toBe('Close');
	});

	it('fetches a node’s images once it is drawn, and only once', () => {
		mocks.requested = [];
		const win = makeWindow('lazydrawn');
		win.append();
		expect(mocks.requested).toEqual([]);
		draw(inWindow(win));
		expect(mocks.requested.sort()).toEqual(['lazydrawn/bg.bmp', 'lazydrawn/close_a.bmp', 'lazydrawn/extra.bmp']);
		expect(win.getRoot().querySelector('.bg').style.backgroundImage).toContain('lazydrawn/bg.bmp');
		draw(inWindow(win));
		expect(mocks.requested.length).toBe(3);
		win.remove();
	});

	it('keeps a background the window set before its art was drawn', () => {
		mocks.requested = [];
		const win = makeWindow('lazystate');
		win.append();
		// e.g. a mini layout or a selected tab, set in onAppend
		const bg = win.getRoot().querySelector('.bg');
		bg.style.backgroundImage = 'url(lazystate/mini.bmp)';
		draw(inWindow(win));
		expect(mocks.requested).toContain('lazystate/bg.bmp');
		expect(bg.style.backgroundImage).toContain('lazystate/mini.bmp');
		win.remove();
	});

	it('still draws its art over an inline image the node already had when it was deferred', () => {
		mocks.requested = [];
		const win = new GUIComponent('lazyinline', '');
		win.render = () =>
			`<div class="bg" style="background-image: url(lazyinline/placeholder.bmp)" data-background="lazyinline/bg.bmp"></div>`;
		win.append();
		draw(inWindow(win));
		expect(win.getRoot().querySelector('.bg').style.backgroundImage).toContain('lazyinline/bg.bmp');
		win.remove();
	});

	it('stops watching a window taken off the page, and watches it again when put back', () => {
		mocks.requested = [];
		const win = makeWindow('lazyremoved');
		win.prepare();
		const watched = () => [...mocks.observed].filter(inWindow(win)).length;
		expect(watched()).toBe(0);
		win.append();
		expect(watched()).toBe(2);
		win.remove();
		expect(watched()).toBe(0);
		win.append();
		expect(watched()).toBe(2);
		draw(inWindow(win));
		expect(mocks.requested.sort()).toEqual([
			'lazyremoved/bg.bmp',
			'lazyremoved/close_a.bmp',
			'lazyremoved/extra.bmp'
		]);
		win.remove();
	});

	it('waits for <ui-button> and <ui-image> to be drawn too', async () => {
		mocks.requested = [];
		const host = document.createElement('div');
		host.innerHTML = '<div class="frame"><ui-image src="el/frame.bmp"></ui-image></div><ui-button bg="el/ok.bmp" hover="el/ok_a.bmp"></ui-button>';
		document.body.appendChild(host);
		await new Promise(r => requestAnimationFrame(r));
		expect(mocks.requested).toEqual([]);
		draw(element => host.contains(element));
		expect(mocks.requested.sort()).toEqual(['el/frame.bmp', 'el/ok.bmp', 'el/ok_a.bmp']);
		expect(host.querySelector('.frame').style.backgroundImage).toContain('el/frame.bmp');
		host.remove();
	});
});
