/**
 * Loaders/wasm/targa.js
 *
 * WebAssembly module for Targa (.tga) decoding:
 * - decodeRLE: expands TGA run-length encoded packets into raw pixel bytes
 *
 * Embedded as Base64 to avoid requiring a separate wasm toolchain/loader during Vite build.
 */

import { createWasmLoader } from 'Utils/wasmLoader.js';

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
 * Lazily loads and returns the compiled WASM targa instance.
 * Returns null if WebAssembly is not supported or instantiation fails.
 * @returns {object|null}
 */
export const getTargaWasm = createWasmLoader(TARGA_WASM_BASE64, 'targa');
