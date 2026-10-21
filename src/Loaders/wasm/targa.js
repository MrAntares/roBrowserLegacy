/**
 * Loaders/wasm/targa.js
 *
 * WebAssembly module for Targa (.tga) decoding:
 * - decodeRLE: expands TGA run-length encoded packets into raw pixel bytes
 *
 * Embedded as Base64 to avoid requiring a separate wasm toolchain/loader during Vite build.
 */

// Pre-compiled targa WASM binary.
// Exports: (memory), decodeRLE(...)
//
// IMPORTANT: this Base64 blob is generated from src/Loaders/wasm/targa.wat
// via `npm run wasm:build` (wabt/wat2wasm). Do NOT edit the Base64 by hand.
// If the .wat changes, regenerate this blob — and vice-versa: any change to the
// JS fallback in Targa.js (decodeRLE) must be mirrored in the .wat, then
// recompiled and re-embedded.
export const TARGA_WASM_BASE64 =
	'AGFzbQEAAAABCgFgBX9/f39/AX8DAgEABQMBAAEHFgIGbWVtb3J5AgAJZGVjb2RlUkxFAAAKuwIBuAIBCn9BACEFQQAhDAJAA0AgDCADTw0BQQAhBiAFIAJJBEAgACAFai0AACEGCyAFQQFqIQUgBkH/AHEhByAHQQFqIQcgBkGAAXEEQCAFIQsgACALaiEKIAUgBGohBSAMIAcgBGxqIANLBEBBfw8LQQAhCQJAA0AgCSAHTw0BIAwgA08NAUEAIQgCQANAIAggBE8NASAMIANPDQFBACEOIAsgCGogAkkEQCAKIAhqLQAAIQ4LIAEgDGogDjoAACAMQQFqIQwgCEEBaiEIDAALCyAJQQFqIQkMAAsLBSAHIARsIQ1BACEIAkADQCAIIA1PDQEgDCADTw0BQQAhDiAFIAJJBEAgACAFai0AACEOCyABIAxqIA46AAAgBUEBaiEFIAxBAWohDCAIQQFqIQgMAAsLCwwACwsgDAs=';

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
 * Lazily loads and returns the compiled WASM targa instance.
 * Returns null if WebAssembly is not supported or instantiation fails.
 * @returns {object|null}
 */
export const getTargaWasm = () => {
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
		const wasmBytes = base64ToUint8Array(TARGA_WASM_BASE64);
		const module = new WebAssembly.Module(wasmBytes);
		_wasmInstance = new WebAssembly.Instance(module);
		return _wasmInstance;
	} catch (e) {
		_wasmFailed = true;
		console.warn('Loaders/wasm/targa - Failed to instantiate WASM module:', e);
		return null;
	}
};
