/**
 * Loaders/wasm/spriteCompile.js
 *
 * WebAssembly module for compiling SPR frames to Power-of-Two textures:
 * - compilePal: copies 8-bit palette indices with magenta (0xFFFF00FF) transparency zeroing into centered Power-of-Two buffer
 * - compileRgba: copies 32-bit RGBA with vertical flip, zeroing when alpha is 0, and channel swizzle (a<<24)|(b<<16)|(g<<8)|r
 *
 * Embedded as Base64 to avoid requiring a separate wasm toolchain/loader during Vite build.
 */

import { createWasmLoader } from 'Utils/wasmLoader.js';

// Pre-compiled spriteCompile WASM binary.
// Exports: (memory), compilePal(...), compileRgba(...)
//
// IMPORTANT: this Base64 blob is generated from src/Loaders/wasm/spriteCompile.wat
// via `npm run wasm:build` (wabt/wat2wasm). Do NOT edit the Base64 by hand.
export const SPRITE_COMPILE_WASM_BASE64 =
	'AGFzbQEAAAABJgRgCX9/f39/f39/fwBgB39/f39/f38AYAR/f39/AGAFf39/f38AAwUEAAECAwUDAQABB0wFBm1lbW9yeQIACmNvbXBpbGVQYWwAAAtjb21waWxlUmdiYQABEWZyYW1lUmdiYVRvQ2FudmFzAAIQZnJhbWVQYWxUb0NhbnZhcwADCqcEBIQBAQV/QQAhCQJAA0AgCSAETw0BIAEgCSADbGohCyACIAkgCGogBWwgB2pqIQxBACEKAkADQCAKIANPDQEgCyAKai0AACENIAAgDUECdGooAgBB/4F8RgRAIAwgCmpBADoAAAUgDCAKaiANOgAACyAKQQFqIQoMAAsLIAlBAWohCQwACwsLsQEBCX8gAkECdCEJQQAhBwJAA0AgByADTw0BIAAgAyAHa0EBayAJbGohCiABIAcgBmogBGwgBWpBAnRqIQtBACEIAkADQCAIIAJPDQEgCiAIQQJ0aiEMIAsgCEECdGohDSAMLQAAIQ4gDkUEQCANQQA2AgAFIA5BGHQgDC0AAUEQdHIgDC0AAkEIdCAMLQADcnIhDyANIA82AgALIAhBAWohCAwACwsgB0EBaiEHDAALCwuhAQEHfyACQQJ0IQZBACEEAkADQCAEIANPDQEgACAEIAZsaiEHIAEgAyAEa0EBayAGbGohCEEAIQUCQANAIAUgAk8NASAHIAVBAnRqKAIAIQkgCUH/AXFBGHQgCUGA/gNxQQh0ciAJQYCA/AdxQQh2IAlBgICAeHFBGHZyciEKIAggBUECdGogCjYCACAFQQFqIQUMAAsLIARBAWohBAwACwsLSQEEfyADIARsIQZBACEFAkADQCAFIAZPDQEgASAFai0AACEHIAAgB0ECdGooAgAhCCACIAVBAnRqIAg2AgAgBUEBaiEFDAALCws=';

/**
 * Lazily loads and returns the compiled WASM converter instance.
 * Returns null if WebAssembly is not supported or instantiation fails.
 * @returns {object|null}
 */
export const getSpriteCompileWasm = createWasmLoader(SPRITE_COMPILE_WASM_BASE64, 'spriteCompile');
