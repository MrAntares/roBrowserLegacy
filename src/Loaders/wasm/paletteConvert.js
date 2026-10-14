/**
 * Loaders/wasm/paletteConvert.js
 *
 * WebAssembly SIMD module for converting indexed 8-bit palette images to 32-bit RGBA
 * with vertical flip (dest row = height - y - 1).
 *
 * Embedded as Base64 to avoid requiring a separate wasm toolchain/loader during Vite build.
 */

// Probe module to validate WebAssembly SIMD support:
// tests standard v128 type and i32x4.splat
const SIMD_PROBE_BASE64 = 'AGFzbQEAAAABBQFgAAF7AwIBAAoKAQgAQQD9D/wCAAs=';

// Pre-compiled paletteConvert WASM binary with v128 SIMD and vertical flip
// Exports: (memory), convertPal(palPtr, srcPtr, dstPtr, width, height)
const PALETTE_CONVERT_WASM_BASE64 =
	'AGFzbQEAAAABCQFgBX9/f39/AAMCAQAFAwEAAQcXAgZtZW1vcnkCAApjb252ZXJ0UGFsAAAK/AEB+QEBCX8gA0ECdCEJQQAhBQJAA0AgBSAETw0BIAEgBSADbGohByACIAQgBWtBAWsgCWxqIQhBACEGAkADQCAGQQRqIANLDQEgByAGai0AACEKIAcgBmotAAEhCyAHIAZqLQACIQwgByAGai0AAyENIAggBkECdGogACAKQQJ0aigCAP0RIAAgC0ECdGooAgD9GwEgACAMQQJ0aigCAP0bAiAAIA1BAnRqKAIA/RsD/QsEACAGQQRqIQYMAAsLAkADQCAGIANPDQEgCCAGQQJ0aiAAIAcgBmotAABBAnRqKAIANgIAIAZBAWohBgwACwsgBUEBaiEFDAALCws=';

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

let _hasSIMD = null;
let _wasmInstance = null;
const _wasmMallocOffset = 0;

/**
 * Checks whether WebAssembly SIMD is supported by the runtime environment.
 * @returns {boolean}
 */
export const isWasmSIMDSupported = () => {
	if (_hasSIMD !== null) {
		return _hasSIMD;
	}

	if (typeof WebAssembly !== 'object' || typeof WebAssembly.validate !== 'function') {
		_hasSIMD = false;
		return false;
	}

	try {
		const probeBytes = base64ToUint8Array(SIMD_PROBE_BASE64);
		_hasSIMD = WebAssembly.validate(probeBytes);
	} catch (e) {
		_hasSIMD = false;
	}

	return _hasSIMD;
};

/**
 * Lazily loads and returns the compiled WASM converter instance.
 * Returns null if SIMD is not supported or instantiation fails.
 * @returns {object|null}
 */
export const getPaletteConvertWasm = () => {
	if (_wasmInstance) {
		return _wasmInstance;
	}

	if (!isWasmSIMDSupported()) {
		console.log('WASM SIMD not supported, using fallback');
		return null;
	}

	try {
		const wasmBytes = base64ToUint8Array(PALETTE_CONVERT_WASM_BASE64);
		const module = new WebAssembly.Module(wasmBytes);
		_wasmInstance = new WebAssembly.Instance(module);
		return _wasmInstance;
	} catch (e) {
		console.warn('Loaders/wasm/paletteConvert - Failed to instantiate WASM module:', e);
		_wasmInstance = null;
		_hasSIMD = false;
		return null;
	}
};

