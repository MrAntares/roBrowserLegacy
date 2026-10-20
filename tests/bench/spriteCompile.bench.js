import { bench, describe, vi } from 'vitest';
import { getSpriteCompileWasm } from 'Loaders/wasm/spriteCompile.js';

// Realistic sprite dimensions (e.g. 200x200 in a 256x256 Power-of-Two texture)
const PAL_W = 200;
const PAL_H = 200;
const PAL_GL_W = 256;
const PAL_GL_H = 256;
const PAL_START_X = Math.floor((PAL_GL_W - PAL_W) * 0.5);
const PAL_START_Y = Math.floor((PAL_GL_H - PAL_H) * 0.5);

const RGBA_W = 100;
const RGBA_H = 100;
const RGBA_GL_W = 128;
const RGBA_GL_H = 128;
const RGBA_START_X = Math.floor((RGBA_GL_W - RGBA_W) * 0.5);
const RGBA_START_Y = Math.floor((RGBA_GL_H - RGBA_H) * 0.5);

const MAGENTA = 0xffff00ff;

// Generate test palette and source data
const pal32 = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
	if (i === 10 || i === 20) {
		pal32[i] = MAGENTA; // Magic color transparent
	} else if (i === 0) {
		pal32[i] = 0;
	} else {
		pal32[i] = (0xff << 24) | ((i * 3) << 16) | ((i * 5) << 8) | (i & 0xff);
	}
}

const palData = new Uint8Array(PAL_W * PAL_H).map((_, i) => (i * 13 + (i >> 5)) & 0xff);

const rgbaData = new Uint8Array(RGBA_W * RGBA_H * 4);
for (let i = 0; i < RGBA_W * RGBA_H; i++) {
	const a = (i % 7 === 0) ? 0 : 255;
	rgbaData[i * 4 + 0] = a;
	rgbaData[i * 4 + 1] = (i * 11) & 0xff; // B
	rgbaData[i * 4 + 2] = (i * 7) & 0xff;  // G
	rgbaData[i * 4 + 3] = (i * 5) & 0xff;  // R
}

// ---------------- PAL Benchmark & Parity ----------------

function runPalJS() {
	const out = new Uint8Array(PAL_GL_W * PAL_GL_H);
	for (let y = 0; y < PAL_H; ++y) {
		const srcRow = y * PAL_W;
		const dstRow = (y + PAL_START_Y) * PAL_GL_W + PAL_START_X;
		for (let x = 0; x < PAL_W; ++x) {
			const idx = palData[srcRow + x];
			if (pal32[idx] === MAGENTA) {
				out[dstRow + x] = 0;
			} else {
				out[dstRow + x] = idx;
			}
		}
	}
	return out;
}

const wasm = getSpriteCompileWasm();

function runPalWASM() {
	if (!wasm) {
		return runPalJS();
	}

	const { memory, compilePal } = wasm.exports;
	const palPtr = 0;
	const srcPtr = 1024;
	const srcBytes = PAL_W * PAL_H;
	const dstBytes = PAL_GL_W * PAL_GL_H;
	const dstPtr = srcPtr + srcBytes;
	const need = dstPtr + dstBytes;

	if (memory.buffer.byteLength < need) {
		memory.grow(Math.ceil((need - memory.buffer.byteLength) / 65536));
	}

	new Uint32Array(memory.buffer, palPtr, 256).set(pal32);
	new Uint8Array(memory.buffer, dstPtr, dstBytes).fill(0);
	new Uint8Array(memory.buffer, srcPtr, srcBytes).set(palData);

	compilePal(palPtr, srcPtr, dstPtr, PAL_W, PAL_H, PAL_GL_W, PAL_GL_H, PAL_START_X, PAL_START_Y);

	return new Uint8Array(new Uint8Array(memory.buffer, dstPtr, dstBytes));
}

// ---------------- RGBA Benchmark & Parity ----------------

function runRgbaJS() {
	const out = new Uint8Array(RGBA_GL_W * RGBA_GL_H * 4);
	const out32 = new Uint32Array(out.buffer);

	for (let y = 0; y < RGBA_H; ++y) {
		const srcRow = (RGBA_H - y - 1) * RGBA_W * 4;
		const dstRow = (y + RGBA_START_Y) * RGBA_GL_W + RGBA_START_X;

		for (let x = 0; x < RGBA_W; ++x) {
			const srcIdx = srcRow + x * 4;
			const a = rgbaData[srcIdx];
			if (a === 0) {
				out32[dstRow + x] = 0;
			} else {
				const r = rgbaData[srcIdx + 3];
				const g = rgbaData[srcIdx + 2];
				const b = rgbaData[srcIdx + 1];
				out32[dstRow + x] = (a << 24) | (b << 16) | (g << 8) | r;
			}
		}
	}
	return out;
}

function runRgbaWASM() {
	if (!wasm) {
		return runRgbaJS();
	}

	const { memory, compileRgba } = wasm.exports;
	const srcPtr = 1024;
	const srcBytes = RGBA_W * RGBA_H * 4;
	const dstBytes = RGBA_GL_W * RGBA_GL_H * 4;
	const dstPtr = srcPtr + srcBytes;
	const need = dstPtr + dstBytes;

	if (memory.buffer.byteLength < need) {
		memory.grow(Math.ceil((need - memory.buffer.byteLength) / 65536));
	}

	new Uint8Array(memory.buffer, dstPtr, dstBytes).fill(0);
	new Uint8Array(memory.buffer, srcPtr, srcBytes).set(rgbaData);

	compileRgba(srcPtr, dstPtr, RGBA_W, RGBA_H, RGBA_GL_W, RGBA_START_X, RGBA_START_Y);

	return new Uint8Array(new Uint8Array(memory.buffer, dstPtr, dstBytes));
}

// Parity check before benchmarks
const palJSOut = runPalJS();
const palWasmOut = runPalWASM();
if (
	palWasmOut.length !== palJSOut.length ||
	!palJSOut.every((val, idx) => val === palWasmOut[idx])
) {
	throw new Error('spriteCompile bench: PAL JS output != WASM output');
}

const rgbaJSOut = runRgbaJS();
const rgbaWasmOut = runRgbaWASM();
if (
	rgbaWasmOut.length !== rgbaJSOut.length ||
	!rgbaJSOut.every((val, idx) => val === rgbaWasmOut[idx])
) {
	throw new Error('spriteCompile bench: RGBA JS output != WASM output');
}

describe('sprite compile PAL 200x200 -> 256x256 POT', () => {
	bench('JS', runPalJS, { time: 5000, warmupTime: 500 });
	if (wasm) {
		bench('WASM', runPalWASM, { time: 5000, warmupTime: 500 });
	}
});

describe('sprite compile RGBA 100x100 -> 128x128 POT', () => {
	bench('JS', runRgbaJS, { time: 5000, warmupTime: 500 });
	if (wasm) {
		bench('WASM', runRgbaWASM, { time: 5000, warmupTime: 500 });
	}
});

// ---------------- SPR.compile() ----------------

async function loadSPR(fallback) {
	vi.resetModules();
	if (fallback) {
		vi.doMock('Loaders/wasm/spriteCompile.js', () => ({ getSpriteCompileWasm: () => null }));
	} else {
		vi.doUnmock('Loaders/wasm/spriteCompile.js');
	}
	return (await import('Loaders/Sprite.js')).default;
}

const SPR_WASM = await loadSPR(false);
const SPR_JS = await loadSPR(true);

// Paleta RGBA de 1024 bytes (com magenta no índice 10)
const rawPal = new Uint8Array(1024);
for (let i = 0; i < 256; i++) {
	rawPal[i * 4] = i;
	rawPal[i * 4 + 1] = (i * 3) & 0xff;
	rawPal[i * 4 + 2] = (i * 5) & 0xff;
}
rawPal.set([255, 0, 255, 0], 10 * 4);

function makeSprite(SPR) {
	const spr = Object.create(SPR.prototype);
	spr.palette = rawPal;
	spr.frames = [
		...Array.from({ length: 8 }, () => ({ type: SPR.TYPE_PAL, width: PAL_W, height: PAL_H, data: palData })),
		...Array.from({ length: 4 }, () => ({ type: SPR.TYPE_RGBA, width: RGBA_W, height: RGBA_H, data: rgbaData }))
	];
	spr.indexed_count = 8;
	spr.rgba_count = 4;
	return spr;
}

const sprWasm = makeSprite(SPR_WASM);
const sprJS = makeSprite(SPR_JS);

describe('SPR.compile() completo (8 PAL + 4 RGBA)', () => {
	bench('JS', () => sprJS.compile(), { time: 5000, warmupTime: 500 });
	bench('WASM', () => sprWasm.compile(), { time: 5000, warmupTime: 500 });
});