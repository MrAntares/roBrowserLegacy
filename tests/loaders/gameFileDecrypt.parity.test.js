import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

async function loadDecrypt({ fallback }) {
	vi.resetModules();
	if (fallback) {
		vi.doMock('Loaders/wasm/gameFileDecrypt.js', () => ({ getGameFileDecryptWasm: () => null }));
	} else {
		vi.doUnmock('Loaders/wasm/gameFileDecrypt.js');
		const { getGameFileDecryptWasm } = await import('Loaders/wasm/gameFileDecrypt.js');
		expect(getGameFileDecryptWasm()).not.toBeNull();
	}
	return (await import('Loaders/GameFileDecrypt.js')).default;
}

afterEach(() => {
	vi.doUnmock('Loaders/wasm/gameFileDecrypt.js');
});

// entry_len test cases covering different digit counts and cycle branches
// digits: 1 (cycle=3), 2 (cycle=3), 3 (cycle=4), 4 (cycle=5), 5 (cycle=14), 7 (cycle=22), 9 (cycle=24)
const ENTRY_LENS = [
	{ digits: 1, val: 5 },
	{ digits: 2, val: 42 },
	{ digits: 3, val: 350 },
	{ digits: 4, val: 4500 },
	{ digits: 5, val: 55000 },
	{ digits: 7, val: 7000000 },
	{ digits: 9, val: 900000000 }
];

describe('GameFileDecrypt parity (WASM vs JS Fallback)', () => {
	it.each([0, 4, 8, 15, 80, 160, 200, 323, 1024])(
		'decodeHeader matches across implementations for len=%i',
		async len => {
			const JS = await loadDecrypt({ fallback: true });
			const WASM = await loadDecrypt({ fallback: false });

			const inputJS = new Uint8Array(len + 16);
			for (let i = 0; i < inputJS.length; i++) inputJS[i] = (i * 13 + 37) & 0xff;
			const inputWASM = new Uint8Array(inputJS);

			JS.decodeHeader(inputJS, len);
			WASM.decodeHeader(inputWASM, len);

			expect(Buffer.from(inputWASM).equals(Buffer.from(inputJS))).toBe(true);
		}
	);

	it.each(ENTRY_LENS)(
		'decodeFull matches across implementations for digits=$digits (entry_len=$val)',
		async ({ val }) => {
			const JS = await loadDecrypt({ fallback: true });
			const WASM = await loadDecrypt({ fallback: false });

			// Use 350 bytes (43 blocks) + 13 trailing bytes to test > 20 blocks and non-multiple of 8
			const len = 350;
			const inputJS = new Uint8Array(len + 20);
			for (let i = 0; i < inputJS.length; i++) inputJS[i] = (i * 17 + 101) & 0xff;
			const inputWASM = new Uint8Array(inputJS);

			JS.decodeFull(inputJS, len, val);
			WASM.decodeFull(inputWASM, len, val);

			expect(Buffer.from(inputWASM).equals(Buffer.from(inputJS))).toBe(true);
		}
	);

	it('decodeFull matches on large buffer with memory grow', async () => {
		const JS = await loadDecrypt({ fallback: true });
		const WASM = await loadDecrypt({ fallback: false });

		// 80KB buffer (exceeds initial 64KB WASM page)
		const len = 81920;
		const inputJS = new Uint8Array(len);
		for (let i = 0; i < len; i++) inputJS[i] = (i * 3 + (i >> 8)) & 0xff;
		const inputWASM = new Uint8Array(inputJS);

		JS.decodeFull(inputJS, len, 12345);
		WASM.decodeFull(inputWASM, len, 12345);

		expect(Buffer.from(inputWASM).equals(Buffer.from(inputJS))).toBe(true);
	});

	it('preserves untouched bytes beyond len', async () => {
		const WASM = await loadDecrypt({ fallback: false });
		const total = 256;
		const len = 100; // leaves bytes 100..255 untouched

		const buf = new Uint8Array(total);
		for (let i = 0; i < total; i++) buf[i] = (i * 7 + 1) & 0xff;
		const tailCopy = buf.slice(len);

		WASM.decodeFull(buf, len, 999);
		expect(Buffer.from(buf.subarray(len)).equals(Buffer.from(tailCopy))).toBe(true);

		WASM.decodeHeader(buf, len);
		expect(Buffer.from(buf.subarray(len)).equals(Buffer.from(tailCopy))).toBe(true);
	});
});

describe('gameFileDecrypt.wat in sync with Base64', () => {
	it('wat2wasm(.wat) === Built-in Base64', async () => {
		vi.doUnmock('Loaders/wasm/gameFileDecrypt.js');
		vi.resetModules();
		const { GAME_FILE_DECRYPT_WASM_BASE64 } = await import('Loaders/wasm/gameFileDecrypt.js');
		const wabt = await (await import('wabt')).default();
		const src = fs.readFileSync(path.resolve('src/Loaders/wasm/gameFileDecrypt.wat'), 'utf8');
		const mod = wabt.parseWat('gameFileDecrypt.wat', src);
		mod.validate({});
		const { buffer } = mod.toBinary({});
		mod.destroy();

		expect(GAME_FILE_DECRYPT_WASM_BASE64).toBeTypeOf('string');
		expect(Buffer.from(buffer).toString('base64')).toBe(GAME_FILE_DECRYPT_WASM_BASE64);
	});
});
