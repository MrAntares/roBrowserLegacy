import { bench, describe } from 'vitest';
import GameFileDecrypt from 'Loaders/GameFileDecrypt.js';
import { getGameFileDecryptWasm } from 'Loaders/wasm/gameFileDecrypt.js';

// Realistic file size for GRF extraction (64KB - 128KB)
const BUF_SIZE = 64 * 1024;
const ENTRY_LEN = 65536; // 5 digits -> cycle = 14

const sourceData = new Uint8Array(BUF_SIZE);
for (let i = 0; i < BUF_SIZE; i++) {
	sourceData[i] = (i * 31 + 17) & 0xff;
}

const wasm = getGameFileDecryptWasm();
const WASM_DATA_OFFSET = 704;

function runJS() {
	const buf = new Uint8Array(sourceData);
	const digits = ENTRY_LEN.toString().length;
	const cycle = digits < 3 ? 3 : digits < 5 ? digits + 1 : digits < 7 ? digits + 9 : digits + 15;
	GameFileDecrypt.decodeFullJS(buf, BUF_SIZE, cycle);
	return buf;
}

function runWASM() {
	if (!wasm) {
		return runJS();
	}
	const { memory, decodeFull } = wasm.exports;
	const needed = WASM_DATA_OFFSET + BUF_SIZE;
	if (memory.buffer.byteLength < needed) {
		memory.grow(Math.ceil((needed - memory.buffer.byteLength) / 65536));
	}

	const digits = ENTRY_LEN.toString().length;
	const cycle = digits < 3 ? 3 : digits < 5 ? digits + 1 : digits < 7 ? digits + 9 : digits + 15;

	new Uint8Array(memory.buffer, WASM_DATA_OFFSET, BUF_SIZE).set(sourceData);
	decodeFull(WASM_DATA_OFFSET, BUF_SIZE, cycle);
	return new Uint8Array(new Uint8Array(memory.buffer, WASM_DATA_OFFSET, BUF_SIZE));
}

// Parity verification before running benchmarks
const jsOut = runJS();
const wasmOut = runWASM();

if (wasmOut.length !== jsOut.length || !jsOut.every((val, idx) => val === wasmOut[idx])) {
	throw new Error('gameFileDecrypt bench: JS output != WASM output');
}

describe(`GameFileDecrypt decodeFull (${BUF_SIZE / 1024} KB)`, () => {
	bench('JS', runJS, { time: 5000, warmupTime: 500 });
	if (wasm) {
		bench('WASM', runWASM, { time: 5000, warmupTime: 500 });
	}
});
