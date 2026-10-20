import { bench, describe } from 'vitest';
import { getSpriteCompileWasm } from 'Loaders/wasm/spriteCompile.js';

// Setup test dimensions: realistic PAL (256x256), realistic RGBA (512x512), small frame (32x32)
const SIZES = {
	small: { w: 32, h: 32 },
	pal256: { w: 256, h: 256 },
	rgba512: { w: 512, h: 512 }
};

// Generate pal32 table (flip=true for ABGR little-endian -> Canvas RGBA)
const pal32 = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
	const r = i & 0xff;
	const g = (255 - i) & 0xff;
	const b = (i * 37) & 0xff;
	const a = i === 0 ? 0 : 255;
	pal32[i] = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

// Pre-allocate source buffers
const palDataSmall = new Uint8Array(SIZES.small.w * SIZES.small.h).map((_, i) => (i * 7 + (i >> 5)) & 0xff);
const palData256 = new Uint8Array(SIZES.pal256.w * SIZES.pal256.h).map((_, i) => (i * 7 + (i >> 5)) & 0xff);

const rgbaDataSmall = new Uint8Array(SIZES.small.w * SIZES.small.h * 4);
for (let i = 0; i < SIZES.small.w * SIZES.small.h; i++) {
	rgbaDataSmall[i * 4 + 0] = i % 5 === 0 ? 0 : 255; // A
	rgbaDataSmall[i * 4 + 1] = (i * 11) & 0xff;       // B
	rgbaDataSmall[i * 4 + 2] = (i * 7) & 0xff;        // G
	rgbaDataSmall[i * 4 + 3] = (i * 3) & 0xff;        // R
}

const rgbaData512 = new Uint8Array(SIZES.rgba512.w * SIZES.rgba512.h * 4);
for (let i = 0; i < SIZES.rgba512.w * SIZES.rgba512.h; i++) {
	rgbaData512[i * 4 + 0] = i % 5 === 0 ? 0 : 255;
	rgbaData512[i * 4 + 1] = (i * 11) & 0xff;
	rgbaData512[i * 4 + 2] = (i * 7) & 0xff;
	rgbaData512[i * 4 + 3] = (i * 3) & 0xff;
}

// Pre-allocate output buffers outside bench
const outPalSmallJS = new Uint32Array(SIZES.small.w * SIZES.small.h);
const outPalSmallWASM = new Uint8Array(SIZES.small.w * SIZES.small.h * 4);

const outPal256JS = new Uint32Array(SIZES.pal256.w * SIZES.pal256.h);
const outPal256WASM = new Uint8Array(SIZES.pal256.w * SIZES.pal256.h * 4);

const outRgbaSmallJS = new Uint32Array(SIZES.small.w * SIZES.small.h);
const outRgbaSmallWASM = new Uint8Array(SIZES.small.w * SIZES.small.h * 4);

const outRgba512JS = new Uint32Array(SIZES.rgba512.w * SIZES.rgba512.h);
const outRgba512WASM = new Uint8Array(SIZES.rgba512.w * SIZES.rgba512.h * 4);

// WASM instance
const wasm = getSpriteCompileWasm();
if (!wasm) {
	throw new Error('spriteFrame bench: WASM instance failed to load');
}

const { memory, framePalToCanvas, frameRgbaToCanvas } = wasm.exports;

function ensureMem(needed) {
	if (memory.buffer.byteLength < needed) {
		memory.grow(Math.ceil((needed - memory.buffer.byteLength) / 65536));
	}
}

// ---------------- Benchmark functions: PAL ----------------

function runPalSmallJS() {
	const w = SIZES.small.w;
	const h = SIZES.small.h;
	for (let y = 0; y < h; ++y) {
		const row = y * w;
		for (let x = 0; x < w; ++x) {
			outPalSmallJS[row + x] = pal32[palDataSmall[row + x]];
		}
	}
}

function runPalSmallWASM() {
	const w = SIZES.small.w;
	const h = SIZES.small.h;
	const srcBytes = w * h;
	const dstBytes = srcBytes * 4;
	const palPtr = 0;
	const srcPtr = 1024;
	const dstPtr = srcPtr + srcBytes;
	ensureMem(dstPtr + dstBytes);

	new Uint32Array(memory.buffer, palPtr, 256).set(pal32);
	new Uint8Array(memory.buffer, srcPtr, srcBytes).set(palDataSmall);
	framePalToCanvas(palPtr, srcPtr, dstPtr, w, h);
	outPalSmallWASM.set(new Uint8Array(memory.buffer, dstPtr, dstBytes));
}

function runPal256JS() {
	const w = SIZES.pal256.w;
	const h = SIZES.pal256.h;
	for (let y = 0; y < h; ++y) {
		const row = y * w;
		for (let x = 0; x < w; ++x) {
			outPal256JS[row + x] = pal32[palData256[row + x]];
		}
	}
}

function runPal256WASM() {
	const w = SIZES.pal256.w;
	const h = SIZES.pal256.h;
	const srcBytes = w * h;
	const dstBytes = srcBytes * 4;
	const palPtr = 0;
	const srcPtr = 1024;
	const dstPtr = srcPtr + srcBytes;
	ensureMem(dstPtr + dstBytes);

	new Uint32Array(memory.buffer, palPtr, 256).set(pal32);
	new Uint8Array(memory.buffer, srcPtr, srcBytes).set(palData256);
	framePalToCanvas(palPtr, srcPtr, dstPtr, w, h);
	outPal256WASM.set(new Uint8Array(memory.buffer, dstPtr, dstBytes));
}

// ---------------- Benchmark functions: RGBA ----------------

function runRgbaSmallJS() {
	const w = SIZES.small.w;
	const h = SIZES.small.h;
	const src32 = new Uint32Array(rgbaDataSmall.buffer);
	for (let y = 0; y < h; ++y) {
		const srcRow = y * w;
		const dstRow = (h - y - 1) * w;
		for (let x = 0; x < w; ++x) {
			const p = src32[srcRow + x];
			outRgbaSmallJS[dstRow + x] =
				((p & 0x000000ff) << 24) |
				((p & 0x0000ff00) << 8) |
				((p & 0x00ff0000) >> 8) |
				((p & 0xff000000) >>> 24);
		}
	}
}

function runRgbaSmallWASM() {
	const w = SIZES.small.w;
	const h = SIZES.small.h;
	const srcBytes = w * h * 4;
	const dstBytes = srcBytes;
	const srcPtr = 1024;
	const dstPtr = srcPtr + srcBytes;
	ensureMem(dstPtr + dstBytes);

	new Uint8Array(memory.buffer, srcPtr, srcBytes).set(rgbaDataSmall);
	frameRgbaToCanvas(srcPtr, dstPtr, w, h);
	outRgbaSmallWASM.set(new Uint8Array(memory.buffer, dstPtr, dstBytes));
}

function runRgba512JS() {
	const w = SIZES.rgba512.w;
	const h = SIZES.rgba512.h;
	const src32 = new Uint32Array(rgbaData512.buffer);
	for (let y = 0; y < h; ++y) {
		const srcRow = y * w;
		const dstRow = (h - y - 1) * w;
		for (let x = 0; x < w; ++x) {
			const p = src32[srcRow + x];
			outRgba512JS[dstRow + x] =
				((p & 0x000000ff) << 24) |
				((p & 0x0000ff00) << 8) |
				((p & 0x00ff0000) >> 8) |
				((p & 0xff000000) >>> 24);
		}
	}
}

function runRgba512WASM() {
	const w = SIZES.rgba512.w;
	const h = SIZES.rgba512.h;
	const srcBytes = w * h * 4;
	const dstBytes = srcBytes;
	const srcPtr = 1024;
	const dstPtr = srcPtr + srcBytes;
	ensureMem(dstPtr + dstBytes);

	new Uint8Array(memory.buffer, srcPtr, srcBytes).set(rgbaData512);
	frameRgbaToCanvas(srcPtr, dstPtr, w, h);
	outRgba512WASM.set(new Uint8Array(memory.buffer, dstPtr, dstBytes));
}

// ---------------- Verify parity before running bench ----------------

runPalSmallJS();
runPalSmallWASM();
if (!Buffer.from(outPalSmallJS.buffer).equals(Buffer.from(outPalSmallWASM.buffer))) {
	throw new Error('spriteFrame bench: PAL small (32x32) JS != WASM');
}

runPal256JS();
runPal256WASM();
if (!Buffer.from(outPal256JS.buffer).equals(Buffer.from(outPal256WASM.buffer))) {
	throw new Error('spriteFrame bench: PAL 256x256 JS != WASM');
}

runRgbaSmallJS();
runRgbaSmallWASM();
if (!Buffer.from(outRgbaSmallJS.buffer).equals(Buffer.from(outRgbaSmallWASM.buffer))) {
	throw new Error('spriteFrame bench: RGBA small (32x32) JS != WASM');
}

runRgba512JS();
runRgba512WASM();
if (!Buffer.from(outRgba512JS.buffer).equals(Buffer.from(outRgba512WASM.buffer))) {
	throw new Error('spriteFrame bench: RGBA 512x512 JS != WASM');
}

// ---------------- Vitest benchmarks ----------------

describe('spriteFrame PAL 32x32', () => {
	bench('JS', runPalSmallJS, { time: 10000, warmupTime: 50 });
	bench('WASM', runPalSmallWASM, { time: 10000, warmupTime: 50 });
});

describe('spriteFrame PAL 256x256', () => {
	bench('JS', runPal256JS, { time: 5000, warmupTime: 500 });
	bench('WASM', runPal256WASM, { time: 5000, warmupTime: 500 });
});

describe('spriteFrame RGBA 32x32', () => {
	bench('JS', runRgbaSmallJS, { time: 5000, warmupTime: 500 });
	bench('WASM', runRgbaSmallWASM, { time: 5000, warmupTime: 500 });
});

describe('spriteFrame RGBA 512x512', () => {
	bench('JS', runRgba512JS, { time: 5000, warmupTime: 500 });
	bench('WASM', runRgba512WASM, { time: 5000, warmupTime: 500 });
});
