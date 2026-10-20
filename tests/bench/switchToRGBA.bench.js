import { bench, describe, vi } from 'vitest';

vi.resetModules();
const { getPaletteConvertWasm } = await import('Loaders/wasm/paletteConvert.js');
const SPR_WASM = (await import('Loaders/Sprite.js')).default;
vi.resetModules();
vi.doMock('Loaders/wasm/paletteConvert.js', () => ({ getPaletteConvertWasm: () => null }));
const SPR_JS = (await import('Loaders/Sprite.js')).default;
vi.doUnmock('Loaders/wasm/paletteConvert.js');

if (!getPaletteConvertWasm()) throw new Error('WASM indisponível: o bench compararia JS com JS');

const FRAME_COUNT = 120;
const palette = new Uint8Array(1024).map((_, i) => (i * 31) & 0xff);
const dims = Array.from({ length: FRAME_COUNT }, (_, i) => [20 + ((i * 17) % 90), 20 + ((i * 29) % 110)]);
const sources = dims.map(([w, h]) => {
	const d = new Uint8Array(w * h);
	for (let i = 0; i < d.length; i++) d[i] = (i * 7 + Math.floor(i / w) * 13) & 0xff;
	return d;
});
const totalPx = dims.reduce((s, [w, h]) => s + w * h, 0);

function makeSprite(SPR) {
	const spr = Object.create(SPR.prototype);
	spr.palette = palette;
	spr.indexed_count = FRAME_COUNT;
	spr.frames = dims.map(([w, h], i) => ({ type: SPR.TYPE_PAL, width: w, height: h, data: sources[i].slice() }));
	return spr;
}

function run(SPR) {
	const spr = makeSprite(SPR);
	spr.switchToRGBA();
	return spr;
}

const a = run(SPR_WASM), b = run(SPR_JS);
a.frames.forEach((f, i) => {
	const g = b.frames[i].data;
	if (f.data.length !== g.length || !f.data.every((v, j) => v === g[j])) {
		throw new Error(`switchToRGBA bench: frame ${i} diverge entre WASM e JS`);
	}
});

console.log(`\nswitchToRGBA: ${FRAME_COUNT} frames, ${totalPx} px no total (~${Math.round(totalPx / FRAME_COUNT)} px/frame)`);

const opts = { time: 3000, warmupTime: 500 };
describe(`switchToRGBA ${FRAME_COUNT} frames`, () => {
	bench('JS fallback', () => run(SPR_JS), opts);
	bench('WASM', () => run(SPR_WASM), opts);
});