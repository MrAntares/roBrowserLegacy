import { bench, describe } from 'vitest';
import { getTargaWasm } from 'Loaders/wasm/targa.js';

// Realistic TGA dimensions (comparable to the spriteCompile benchmark sizes)
const RLE_W = 200;
const RLE_H = 200;

// RLE source: long runs so the encoder produces mostly RLE packets
const rleSource = new Uint8Array(RLE_W * RLE_H * 3);
for (let i = 0; i < RLE_W * RLE_H; i++) {
	const run = Math.floor(i / 16) & 0xff;
	rleSource[i * 3] = run;
	rleSource[i * 3 + 1] = (run * 3) & 0xff;
	rleSource[i * 3 + 2] = (run * 7) & 0xff;
}

/**
 * Encode raw pixels as a TGA RLE stream.
 *
 * TGA RLE packets count *pixels*, not bytes: an RLE packet is followed by a
 * single pixel that is repeated `count` times, a raw packet is followed by
 * `count` pixels.
 */
function encodeRLE(px, pixelSize = 3) {
	const out = [];
	const pixelCount = Math.floor(px.length / pixelSize);
	const same = (a, b) => {
		for (let k = 0; k < pixelSize; k++) {
			if (px[a * pixelSize + k] !== px[b * pixelSize + k]) return false;
		}
		return true;
	};

	let p = 0;
	while (p < pixelCount) {
		// RLE packet: count the identical pixels that follow
		let run = 1;
		while (p + run < pixelCount && run < 128 && same(p, p + run)) {
			run++;
		}

		if (run >= 2) {
			out.push(0x80 | (run - 1));
			for (let k = 0; k < pixelSize; k++) out.push(px[p * pixelSize + k]);
			p += run;
			continue;
		}

		// Raw packet: gather pixels until a run of 2+ identical pixels starts
		let len = 1;
		while (p + len < pixelCount && len < 128) {
			if (p + len + 1 < pixelCount && same(p + len, p + len + 1)) break;
			len++;
		}
		out.push(len - 1);
		for (let k = 0; k < len; k++) {
			for (let c = 0; c < pixelSize; c++) out.push(px[(p + k) * pixelSize + c]);
		}
		p += len;
	}
	return Uint8Array.from(out);
}

const rleData = encodeRLE(rleSource, 3);
const rleOutputSize = RLE_W * RLE_H * 3;

const wasm = getTargaWasm();

// ---------------- Reference implementation (JS) ----------------

function runRleJS() {
	const output = new Uint8Array(rleOutputSize);
	const pixels = new Uint8Array(3);
	let pos = 0;
	let offset = 0;

	while (pos < rleOutputSize) {
		const c = rleData[offset++];
		const count = (c & 0x7f) + 1;

		if (c & 0x80) {
			for (let i = 0; i < 3; ++i) {
				pixels[i] = rleData[offset++];
			}
			for (let i = 0; i < count; ++i) {
				output.set(pixels, pos);
				pos += 3;
			}
		} else {
			const total = count * 3;
			for (let i = 0; i < total; ++i) {
				output[pos++] = rleData[offset++];
			}
		}
	}
	return output;
}

// ---------------- WASM implementation ----------------

function runRleWASM() {
	if (!wasm) {
		return runRleJS();
	}

	const { memory, decodeRLE } = wasm.exports;
	const srcPtr = 0;
	const srcBytes = rleData.length;
	// keep the destination 4-byte aligned
	const dstPtr = (srcBytes + 3) & ~3;
	const need = dstPtr + rleOutputSize;

	if (memory.buffer.byteLength < need) {
		memory.grow(Math.ceil((need - memory.buffer.byteLength) / 65536));
	}

	new Uint8Array(memory.buffer, srcPtr, srcBytes).set(rleData);

	const written = decodeRLE(srcPtr, dstPtr, srcBytes, rleOutputSize, 3);

	return new Uint8Array(new Uint8Array(memory.buffer, dstPtr, written));
}

// ---------------- Parity check before benchmarks ----------------

function assertSame(label, a, b) {
	if (a.length !== b.length || !a.every((val, idx) => val === b[idx])) {
		throw new Error(`targa bench: ${label} JS output != WASM output`);
	}
}

assertSame('RLE', runRleJS(), runRleWASM());

describe('Targa decodeRLE 200x200 (24-bit)', () => {
	bench('JS', runRleJS, { time: 5000, warmupTime: 500 });
	if (wasm) {
		bench('WASM', runRleWASM, { time: 5000, warmupTime: 500 });
	}
});
