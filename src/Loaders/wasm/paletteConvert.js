/**
 * Loaders/wasm/paletteConvert.js
 *
 * WebAssembly module for converting indexed 8-bit palette images to 32-bit RGBA
 * with vertical flip (dest row = height - y - 1).
 *
 * Embedded as Base64 to avoid requiring a separate wasm toolchain/loader during Vite build.
 */

import { createWasmLoader } from 'Utils/wasmLoader.js';

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
 * Lazily loads and returns the compiled WASM converter instance.
 * Returns null if WebAssembly is not supported or instantiation fails.
 * @returns {object|null}
 */
export const getPaletteConvertWasm = createWasmLoader(PALETTE_CONVERT_WASM_BASE64, 'paletteConvert');
