/**
 * Loaders/wasm/paletteConvert.js
 *
 * WebAssembly module for converting indexed 8-bit palette images to 32-bit RGBA
 * with vertical flip (dest row = height - y - 1).
 *
 * Embedded as Base64 to avoid requiring a separate wasm toolchain/loader during Vite build.
 */

// Pre-compiled paletteConvert WASM binary with vertical flip.
// Exports: (memory), convertPal(palPtr, srcPtr, dstPtr, width, height)
//
// IMPORTANT: this Base64 blob is generated from src/Loaders/wasm/paletteConvert.wat
// via `npm run wasm:build` (wabt/wat2wasm). Do NOT edit the Base64 by hand.
// If the .wat changes, regenerate this blob — and vice-versa: any change to the
// JS fallback in Sprite.js switchToRGBA() must be mirrored in the .wat
// (byte order, vertical flip, palette layout), then recompiled and re-embedded.
export const PALETTE_CONVERT_WASM_BASE64 =
	'AGFzbQEAAAABCQFgBX9/f39/AAMCAQAFAwEAAQcXAgZtZW1vcnkCAApjb252ZXJ0UGFsAAAKdwF1AQV/IANBAnQhCUEAIQUCQANAIAUgBE8NASABIAUgA2xqIQcgAiAEIAVrQQFrIAlsaiEIQQAhBgJAA0AgBiADTw0BIAggBkECdGogACAHIAZqLQAAQQJ0aigCADYCACAGQQFqIQYMAAsLIAVBAWohBQwACwsL';

/**
 * Decode base64 string to Uint8Array in browser / desktop environments
 */
const base64ToUint8Array = base64 => {
	const binaryString = atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; ++i) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes;
};

let _wasmInstance = null;
let _wasmFailed = false;

/**
 * Lazily loads and returns the compiled WASM converter instance.
 * Returns null if WebAssembly is not supported or instantiation fails.
 * @returns {object|null}
 */
export const getPaletteConvertWasm = () => {
	if (_wasmInstance) {
		return _wasmInstance;
	}
	if (_wasmFailed) {
		return null;
	}

	if (typeof WebAssembly !== 'object' || typeof WebAssembly.Module !== 'function') {
		_wasmFailed = true;
		return null;
	}

	try {
		const wasmBytes = base64ToUint8Array(PALETTE_CONVERT_WASM_BASE64);
		const module = new WebAssembly.Module(wasmBytes);
		_wasmInstance = new WebAssembly.Instance(module);
		return _wasmInstance;
	} catch (e) {
		_wasmFailed = true;
		console.warn('Loaders/wasm/paletteConvert - Failed to instantiate WASM module:', e);
		return null;
	}
};
