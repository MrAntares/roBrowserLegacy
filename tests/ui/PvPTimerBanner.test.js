/**
 * PvPTimer plays its banner on the first show(). Its sprite is fetched when
 * the timer is first drawn, so the banner waits for it, and for the timer
 * to be shown.
 */
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ loaded: null }));

vi.mock('Core/Client.js', () => ({
	default: {
		loadFile: vi.fn(),
		loadFiles(_files, callback) {
			mocks.loaded = callback;
		}
	}
}));
vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: '', getMessage: () => '' } }));
vi.mock('Renderer/SpriteRenderer.js', () => ({ default: { bind2DContext: vi.fn() } }));
vi.mock('Renderer/Entity/Entity.js', () => ({ default: class {} }));
vi.mock('Renderer/Renderer.js', () => ({ default: {} }));
vi.mock('Renderer/EntityManager.js', () => ({ default: {} }));
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: component => component } }));
vi.mock('UI/CursorManager.js', () => ({ default: { ACTION: {}, getActualType: () => 0, setType: vi.fn() } }));
vi.mock('UI/Scrollbar.js', () => ({ default: {} }));
vi.mock('Core/Preferences.js', () => ({ default: { get: (_k, def) => ({ ...def, save: vi.fn() }) } }));

const { default: PvPTimer } = await import('UI/Components/PvPTimer/PvPTimer.js');

// GUIComponent loads Client and DB itself before it handles a node
await new Promise(r => setTimeout(r, 20));

// The banner reads its sprite's actions only while it plays
let plays = 0;
const bannerAct = {
	get actions() {
		plays++;
		return [{ animations: [] }];
	}
};

describe('PvPTimer banner', () => {
	it('plays on the next show() when the timer was hidden before its sprite loaded', () => {
		PvPTimer.append();
		PvPTimer.show();
		PvPTimer.hide();
		expect(mocks.loaded).toBeTypeOf('function');

		mocks.loaded({ actions: [] }, {}, bannerAct, {});
		expect(plays).toBe(0);

		PvPTimer.show();
		const played = plays;
		expect(played).toBeGreaterThan(0);

		// once only
		PvPTimer.hide();
		PvPTimer.show();
		expect(plays).toBe(played);
		PvPTimer.remove();
	});
});
