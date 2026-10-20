import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getSpriteCompileWasm, SPRITE_COMPILE_WASM_BASE64 } from 'Loaders/wasm/spriteCompile.js';

const MAGENTA = 0xffff00ff;

function refPal(pal32, src, w, h, gw, gh, sx, sy) {
	const out = new Uint8Array(gw * gh);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
		const i = src[y * w + x];
		out[(y + sy) * gw + sx + x] = pal32[i] === MAGENTA ? 0 : i;
	}
	return out;
}

function refRgba(src, w, h, gw, gh, sx, sy) {
	const out = new Uint8Array(gw * gh * 4), o32 = new Uint32Array(out.buffer);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
		const s = ((h - y - 1) * w + x) * 4, a = src[s];
		o32[(y + sy) * gw + sx + x] = a === 0 ? 0 : ((a << 24) | (src[s + 1] << 16) | (src[s + 2] << 8) | src[s + 3]) >>> 0;
	}
	return out;
}

function ensure(mem, need) {
	if (mem.buffer.byteLength < need) mem.grow(Math.ceil((need - mem.buffer.byteLength) / 65536));
}

const CASES = [[3, 5, 4, 8], [200, 200, 256, 256], [300, 300, 512, 512]]; // o último força memory.grow

describe('spriteCompile WASM === referência JS', () => {
	const wasm = getSpriteCompileWasm();
	it('WASM disponível', () => expect(wasm).not.toBeNull());

	it.each(CASES)('compilePal %ix%i -> %ix%i', (w, h, gw, gh) => {
		const { memory, compilePal } = wasm.exports;
		const pal32 = new Uint32Array(256).map((_, i) => (i % 17 === 0 ? MAGENTA : (0xff000000 | i * 0x10101) >>> 0));
		const src = new Uint8Array(w * h).map((_, i) => (i * 13 + (i >> 5)) & 0xff);
		const sx = (gw - w) >> 1, sy = (gh - h) >> 1, dst = 1024 + w * h;
		ensure(memory, dst + gw * gh);
		new Uint32Array(memory.buffer, 0, 256).set(pal32);
		new Uint8Array(memory.buffer, 1024, w * h).set(src);
		new Uint8Array(memory.buffer, dst, gw * gh).fill(0);
		compilePal(0, 1024, dst, w, h, gw, gh, sx, sy);
		const got = new Uint8Array(memory.buffer, dst, gw * gh).slice();
		expect(Buffer.from(got).equals(Buffer.from(refPal(pal32, src, w, h, gw, gh, sx, sy)))).toBe(true);
	});

	it.each(CASES)('compileRgba %ix%i -> %ix%i', (w, h, gw, gh) => {
		const { memory, compileRgba } = wasm.exports;
		const src = new Uint8Array(w * h * 4).map((_, i) => ((i >> 2) % 7 === 0 && (i & 3) === 0 ? 0 : (i * 31) & 0xff));
		const sx = (gw - w) >> 1, sy = (gh - h) >> 1, dst = 1024 + w * h * 4;
		ensure(memory, dst + gw * gh * 4);
		new Uint8Array(memory.buffer, 1024, w * h * 4).set(src);
		new Uint8Array(memory.buffer, dst, gw * gh * 4).fill(0);
		compileRgba(1024, dst, w, h, gw, sx, sy);
		const got = new Uint8Array(memory.buffer, dst, gw * gh * 4).slice();
		expect(Buffer.from(got).equals(Buffer.from(refRgba(src, w, h, gw, gh, sx, sy)))).toBe(true);
	});
});

describe('spriteCompile.wat em sincronia com o Base64', () => {
	it('wat2wasm(.wat) === Base64 embutido', async () => {
		const wabt = await (await import('wabt')).default();
		const mod = wabt.parseWat('spriteCompile.wat', fs.readFileSync(path.resolve('src/Loaders/wasm/spriteCompile.wat'), 'utf8'));
		const { buffer } = mod.toBinary({});
		mod.destroy();
		expect(Buffer.from(buffer).toString('base64')).toBe(SPRITE_COMPILE_WASM_BASE64);
	});
});
