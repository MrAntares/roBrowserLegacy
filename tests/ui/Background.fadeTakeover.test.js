import { afterAll, describe, expect, it, vi } from 'vitest';

vi.mock('DB/DBManager.js', () => ({ default: { INTERFACE_PATH: 'data/texture/' } }));
vi.mock('Core/Client.js', () => ({ default: { loadFile: vi.fn((path, onload) => onload('blob:' + path)) } }));
vi.mock('Core/Configs.js', () => ({ default: { get: () => undefined } }));
vi.mock('Network/PacketVerManager.js', () => ({ default: { value: 20221005 } }));

// Frames by hand: the overlay's opacity is checked at chosen times
let now = 0;
const frames = [];
vi.spyOn(performance, 'now').mockImplementation(() => now);
vi.stubGlobal('requestAnimationFrame', fn => frames.push(fn));
const ctx = new Proxy({}, { get: () => () => ({ width: 0 }) });
const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);

function advance(ms) {
	now += ms;
	frames.splice(0).forEach(fn => fn(now));
}

const { default: Background } = await import('UI/Background.js');
const overlay = () => [...document.body.children].find(el => el.style.zIndex === '1000');

afterAll(() => {
	getContext.mockRestore();
	vi.unstubAllGlobals();
});

describe('Background transitions', () => {
	it('fades back in from black when the map loads before the fade to its loading image is over', () => {
		const revealed = vi.fn();

		// The map was already loaded: it is set up in setLoading's callback
		Background.setLoading(() => Background.remove(revealed));

		advance(250);
		expect(Number(overlay().style.opacity)).toBeCloseTo(0.505, 2);
		advance(250);
		advance(16);
		expect(revealed).toHaveBeenCalledOnce();

		// One fade back from black, not two fighting over the overlay
		advance(250);
		expect(Number(overlay().style.opacity)).toBeGreaterThan(0.4);
		expect(Number(overlay().style.opacity)).toBeLessThan(0.6);
		advance(260);
		expect(overlay()).toBeUndefined();
	});

	it('fades to black at the usual pace when the map loads while its loading image is fading in', () => {
		Background.setLoading();
		advance(500);
		advance(16);
		advance(200);
		const from = Number(overlay().style.opacity);
		expect(from).toBeGreaterThan(0.3);
		expect(from).toBeLessThan(0.9);

		const revealed = vi.fn();
		Background.remove(revealed);
		advance(250);
		expect(revealed).not.toHaveBeenCalled();
		expect(Number(overlay().style.opacity)).toBeLessThan(1);
		advance(260);
		expect(revealed).toHaveBeenCalledOnce();
		advance(510);
		expect(overlay()).toBeUndefined();
	});
});
