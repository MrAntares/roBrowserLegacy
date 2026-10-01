import { describe, expect, it, vi } from 'vitest';

vi.mock('Preferences/Map.js', () => ({ default: { showname: false } }));
vi.mock('Renderer/Entity/EntityOverlay.js', () => ({ default: { append: vi.fn() } }));

// Take the non-ugly-shadow branch of the module's GPU probe
window.chrome = {};

HTMLCanvasElement.prototype.getContext = function () {
	if (!this._ctx) {
		this._ctx = {
			canvas: this,
			font: '',
			textBaseline: '',
			lineWidth: 1,
			shadowColor: '',
			shadowBlur: 0,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			fillStyle: '',
			strokeStyle: '',
			measureText: () => ({ width: 100 }),
			fillText() {},
			strokeText() {},
			fillRect() {},
			save() {},
			restore() {},
			setTransform() {},
			translate() {},
			drawImage: vi.fn(),
			clearRect: vi.fn(),
			getImageData: (_x, _y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) })
		};
	}
	return this._ctx;
};

const IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/** Import the module fresh under the given devicePixelRatio (read once at import) */
async function makeDisplay(dpr) {
	vi.resetModules();
	Object.defineProperty(window, 'devicePixelRatio', { value: dpr, configurable: true });
	const { default: Init } = await import('Renderer/Entity/EntityDisplay.js');
	const holder = {};
	Init.call(holder);
	return holder.display;
}

function gifSheet() {
	return {
		frameWidth: 24,
		frameHeight: 24,
		framesPerRow: 2,
		frameCount: 2,
		frameDelays: [10, 10],
		lastFrameChange: 0,
		currentFrame: 0,
		width: 48,
		height: 24
	};
}

describe('Renderer/Entity/EntityDisplay', () => {
	it('draws the emblem at 24x24 centred over both lines at dpr 1', async () => {
		const display = await makeDisplay(1);
		const img = {};

		display.name = 'Kathryne';
		display.guild_name = 'Valhalla';
		display.setEmblem(img);
		display.update(display.STYLE.DEFAULT);

		// plate = max((12 + 2) * 2 + 6, 24) = 34 -> y = (34 - 24) / 2 + 5 - 4
		expect(display.ctx.drawImage).toHaveBeenCalledWith(img, 0, 6, 24, 24);
		// text width + emblem gutter (26 + 5) + right padding
		expect(display.canvas.width).toBe(136);
	});

	it('scales the emblem box and gutters with the font at dpr 2', async () => {
		const display = await makeDisplay(2);
		const img = {};

		display.name = 'Kathryne';
		display.guild_name = 'Valhalla';
		display.setEmblem(img);
		display.update(display.STYLE.DEFAULT);

		expect(display.ctx.drawImage).toHaveBeenCalledWith(img, 0, 12, 48, 48);
		expect(display.canvas.width).toBe(100 + 31 * 2 + 5 * 2);
	});

	it('clamps the plate to the emblem height on a single line, like the client', async () => {
		const display = await makeDisplay(1);
		const img = {};

		display.name = 'Kathryne';
		display.setEmblem(img);
		display.update(display.STYLE.DEFAULT);

		// plate = max((12 + 2) * 1 + 6, 24) = 24 -> y = 0 + 5 - 4
		expect(display.ctx.drawImage).toHaveBeenCalledWith(img, 0, 1, 24, 24);
	});

	it('clears exactly the rect the gif redraw paints', async () => {
		const display = await makeDisplay(2);
		const gif = gifSheet();

		display.name = 'Kathryne';
		display.guild_name = 'Valhalla';
		display.setEmblem({}, gif);
		display.update(display.STYLE.DEFAULT);
		expect(display.ctx.drawImage).toHaveBeenCalledWith(gif, 0, 0, 24, 24, 0, 12, 48, 48);

		display.ctx.drawImage.mockClear();
		display.render(IDENTITY);

		expect(display.ctx.clearRect).toHaveBeenCalledWith(0, 12, 48, 48);
		expect(display.ctx.drawImage).toHaveBeenCalledWith(gif, 24, 0, 24, 24, 0, 12, 48, 48);
	});

	it('styles the canvas back to CSS pixels', async () => {
		const display = await makeDisplay(2);

		display.name = 'Kathryne';
		display.guild_name = 'Valhalla';
		display.setEmblem({});
		display.update(display.STYLE.DEFAULT);
		display.render(IDENTITY);

		expect(display.canvas.style.width).toBe(display.canvas.width / 2 + 'px');
	});
});
