import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const W = 64, H = 32; // multi-linha, sem simetria vertical

function makePalette() {
	const pal = new Uint8Array(1024);
	for (let i = 0; i < 256; i++) {
		pal[i * 4] = i; pal[i * 4 + 1] = 255 - i; pal[i * 4 + 2] = (i * 37) & 0xff; pal[i * 4 + 3] = 0;
	}
	return pal;
}

function makeIndices(w, h) {
	const d = new Uint8Array(w * h);
	for (let i = 0; i < d.length; i++) d[i] = (i * 7 + Math.floor(i / w) * 13) & 0xff; // inclui o índice 0 (transparente)
	return d;
}

// Referência: especificação independente do código de produção
function reference(pal, idx, w, h) {
	const out = new Uint8Array(w * h * 4);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const c = idx[y * w + x];
			const o = ((h - y - 1) * w + x) * 4;
			// convert32bPal(pal, false) => (r<<24|g<<16|b<<8|a) em LE => bytes [a, b, g, r]
			out[o] = c === 0 ? 0 : 255;
			out[o + 1] = pal[c * 4 + 2];
			out[o + 2] = pal[c * 4 + 1];
			out[o + 3] = pal[c * 4];
		}
	}
	return out;
}

async function loadSPR({ fallback }) {
	vi.resetModules();
	if (fallback) {
		vi.doMock('Loaders/wasm/paletteConvert.js', () => ({ getPaletteConvertWasm: () => null }));
	}
	return (await import('Loaders/Sprite.js')).default;
}

const CASES = [
	['multi-linha (flip vertical)', [[W, H]]],
	['vários frames', [[4, 4], [1, 9], [9, 1], [0, 0]]],
	['frame grande (força memory.grow)', [[300, 300]]], // 90k*5 bytes > 1 página de 64KiB
];

afterEach(() => { vi.doUnmock('Loaders/wasm/paletteConvert.js'); });

// Monta um SPR v2.1 mínimo (RLE sem zeros => 1 byte por pixel)
function buildSPR(w, h, idx, pal) {
	const size = 8 + 6 + idx.length + 1024;
	const buf = new ArrayBuffer(size), v = new DataView(buf), b = new Uint8Array(buf);
	b.set([0x53, 0x50, 1, 2]); v.setUint16(4, 1, true); v.setUint16(6, 0, true);
	v.setUint16(8, w, true); v.setUint16(10, h, true); v.setUint16(12, idx.length, true);
	b.set(idx, 14); b.set(pal, size - 1024);
	return buf;
}

describe.each([['WASM', false], ['fallback JS', true]])('integração parse → switchToRGBA via %s', (_, fallback) => {
	it('sprite parseado bate com a referência', async () => {
		const SPR = await loadSPR({ fallback });
		const w = 16, h = 8, pal = makePalette();
		const idx = makeIndices(w, h).map(c => c || 1); // sem 0 para o RLE ser literal
		const spr = new SPR(buildSPR(w, h, idx, pal));
		spr.switchToRGBA();
		expect(spr.frames[0].type).toBe(SPR.TYPE_RGBA);
		expect(Buffer.from(spr.frames[0].data).equals(Buffer.from(reference(pal, idx, w, h)))).toBe(true);
	});
});

describe('paletteConvert.wat em sincronia com o Base64', () => {
	it('WASM instancia', async () => {
		vi.resetModules();
		const { getPaletteConvertWasm } = await import('Loaders/wasm/paletteConvert.js');
		expect(getPaletteConvertWasm()).not.toBeNull();
	});

	it('wat2wasm(.wat) === Base64 embutido', async () => {
		const { PALETTE_CONVERT_WASM_BASE64 } = await import('Loaders/wasm/paletteConvert.js');
		const wabt = await (await import('wabt')).default();
		const src = fs.readFileSync(path.resolve('src/Loaders/wasm/paletteConvert.wat'), 'utf8');
		const mod = wabt.parseWat('paletteConvert.wat', src);
		const { buffer } = mod.toBinary({});
		mod.destroy();
		expect(Buffer.from(buffer).toString('base64')).toBe(PALETTE_CONVERT_WASM_BASE64);
	});
});