import { bench, describe } from 'vitest';
import SPR from 'Loaders/Sprite.js';
import { getPaletteConvertWasm } from 'Loaders/wasm/paletteConvert.js';

const W = 256;
const H = 256;
const N = W * H;

const idx = new Uint8Array(N).map((_, i) => ((i * 7 + (i >> 8)) & 0xff));
const pal32 = new Uint32Array(256).map((_, i) => i * 0x01010101);

function runJS() {
	const out = new Uint32Array(N);
	for (let y = 0; y < H; y++) {
		const s = y * W;
		const d = (H - y - 1) * W;
		for (let x = 0; x < W; x++) {
			out[d + x] = pal32[idx[s + x]];
		}
	}
	return new Uint8Array(out.buffer);
}

const wasm = getPaletteConvertWasm();

function runWASM() {
	if (!wasm) {
		return runJS();
	}

	const { memory, convertPal } = wasm.exports;
	const need = 1024 + N * 5;

	if (memory.buffer.byteLength < need) {
		memory.grow(Math.ceil((need - memory.buffer.byteLength) / 65536));
	}

	new Uint32Array(memory.buffer, 0, 256).set(pal32);
	new Uint8Array(memory.buffer, 1024, N).set(idx);
	convertPal(0, 1024, 1024 + N, W, H);

	return new Uint8Array(new Uint8Array(memory.buffer, 1024 + N, N * 4));
}

const jsOut = runJS();
const wasmOut = runWASM();

if (wasmOut.length !== jsOut.length || !jsOut.every((value, index) => value === wasmOut[index])) {
	throw new Error('paletteConvert bench: JS output != WASM output');
}

describe('palette convert 256x256', () => {
	bench('JS', runJS, { time: 5000, warmupTime: 500 });
	if (wasm) {
		bench('WASM', runWASM, { time: 5000, warmupTime: 500 });
	}
});