/**
 * Loaders/wasm/spriteCompile.js
 *
 * WebAssembly module for compiling SPR frames to Power-of-Two textures:
 * - compilePal: copies 8-bit palette indices with magenta (0xFFFF00FF) transparency zeroing into centered Power-of-Two buffer
 * - compileRgba: copies 32-bit RGBA with vertical flip, zeroing when alpha is 0, and channel swizzle (a<<24)|(b<<16)|(g<<8)|r
 *
 * Embedded as Base64 to avoid requiring a separate wasm toolchain/loader during Vite build.
 */

// Pre-compiled spriteCompile WASM binary.
// Exports: (memory), compilePal(...), compileRgba(...)
//
// IMPORTANT: this Base64 blob is generated from src/Loaders/wasm/spriteCompile.wat
// via `npm run wasm:build` (wabt/wat2wasm). Do NOT edit the Base64 by hand.
export const SPRITE_COMPILE_WASM_BASE64 =
	'AGFzbQEAAAABFwJgCX9/f39/f39/fwBgB39/f39/f38AAwMCAAEFAwEAAQclAwZtZW1vcnkCAApjb21waWxlUGFsAAALY29tcGlsZVJnYmEAAQq6AgKEAQEFf0EAIQkCQANAIAkgBE8NASABIAkgA2xqIQsgAiAJIAhqIAVsIAdqaiEMQQAhCgJAA0AgCiADTw0BIAsgCmotAAAhDSAAIA1BAnRqKAIAQf+BfEYEQCAMIApqQQA6AAAFIAwgCmogDToAAAsgCkEBaiEKDAALCyAJQQFqIQkMAAsLC7EBAQl/IAJBAnQhCUEAIQcCQANAIAcgA08NASAAIAMgB2tBAWsgCWxqIQogASAHIAZqIARsIAVqQQJ0aiELQQAhCAJAA0AgCCACTw0BIAogCEECdGohDCALIAhBAnRqIQ0gDC0AACEOIA5FBEAgDUEANgIABSAOQRh0IAwtAAFBEHRyIAwtAAJBCHQgDC0AA3JyIQ8gDSAPNgIACyAIQQFqIQgMAAsLIAdBAWohBwwACwsL';

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
export const getSpriteCompileWasm = () => {
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
		const wasmBytes = base64ToUint8Array(SPRITE_COMPILE_WASM_BASE64);
		const module = new WebAssembly.Module(wasmBytes);
		_wasmInstance = new WebAssembly.Instance(module);
		return _wasmInstance;
	} catch (e) {
		_wasmFailed = true;
		console.warn('Loaders/wasm/spriteCompile - Failed to instantiate WASM module:', e);
		return null;
	}
};
