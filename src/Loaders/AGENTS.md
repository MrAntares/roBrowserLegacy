# AGENTS.md — Asset Loaders (`src/Loaders/`)

Instructions for working on binary game asset parsers, GRF container extraction, and WebAssembly (`.wat` / `.js`) hot-path decoders.

## Mandatory Prerequisites

- **Character encoding & GRF filenames:** Read [`docs/Encoding.md`](../../docs/Encoding.md) (`Utils/CodepageManager.js`). GRF file paths and filename lookups must use `'windows-1252'` encoding. `FileManager` returns raw `Uint8Array` bytes; consumers decode strings with explicit context.

---

## Core Loader & Binary Parsing Invariants

1. **Binary Precision & Endianness:**
    - Ragnarok Online binary formats are little-endian. Offset or endianness mistakes in GRF, SPR, ACT, GAT, GND, RSW, RSM, GR2, STR, or TGA parsers silently corrupt game assets or crash the renderer.
    - Always consider the full pipeline from GRF/remote file access (`FileManager` / `Client.loadFile`) through worker/main-thread parsing, `MemoryManager` caching, and the consuming renderer or UI.
2. **WASM + JS Fallback Synchronization (Critical):**
    - Performance-critical decoders in `src/Loaders/wasm/` (`paletteConvert.wat`/`.js`, `spriteCompile.wat`/`.js`, `targa.wat`/`.js`) use WebAssembly embedded as Base64 alongside a pure-JS fallback (e.g., `SPR.switchToRGBA()` in `Sprite.js`).
    - **Never let `.wat` and `.js` fall out of sync:** If you modify a `.wat` file, regenerate the embedded Base64 in the companion `.js` file by running `npm run wasm:build` (`node ./applications/tools/build-wasm.mjs`).
    - **Bit-exact parity:** If you modify the JS fallback (byte order, vertical flip, palette layout, buffer sizes), update the `.wat` file to produce bit-exact identical output bytes, and vice versa.
    - **Graceful fallback:** The JS fallback must remain functional if `WebAssembly` is unavailable or instantiation fails.
    - **No unverified SIMD:** Do not introduce WASM SIMD opcodes (`v128`, `i32x4`, `FD` prefix) without verifying support across all target runtimes.
3. **Synthetic Test Fixtures Only:**
    - Never commit proprietary game files (`.grf`, `.spr`, `.act`, `.bmp`, `.mp3`). All unit tests in `tests/loaders/` must construct synthetic binary fixtures in-memory using `ArrayBuffer` / `DataView`.
4. **Cross-Platform Path Case:**
    - Remote Client HTTP requests and Linux filesystems are case-sensitive even when local Windows development appears case-insensitive. Preserve canonical path casing and backslash/slash normalization.

---

## Asset Loader Reference (`src/Loaders/`)

| File                 | Format / Responsibility                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `GameFileDecrypt.js` | GRF encryption/decryption (DES / RC4).                                                                           |
| `GameFile.js`        | `.grf` container header, file table decompression, and entry extraction.                                         |
| `Action.js`          | `.act` sprite animation actions, frames, layers, and sound triggers.                                             |
| `Sprite.js`          | `.spr` indexed-palette and RGBA sprite textures, RLE decompression, and palette conversion.                      |
| `Ground.js`          | `.gnd` ground mesh, lightmaps, tile colors, and textures.                                                        |
| `Altitude.js`        | `.gat` cell height and walkability/collision flags.                                                              |
| `World.js`           | `.rsw` resource world (models, lights, sounds, water parameters).                                                |
| `Str.js`             | `.str` multi-layer visual effect animations (including compiled `.ezv` assets).                                  |
| `Model.js`           | `.rsm` / `.rsm2` 3D map prop models and keyframe animations.                                                     |
| `GR2Loader.js`       | `.gr2` Granny3D skeletal models via `granny-ro-js` (replaces legacy `GrannyModel.js`).                           |
| `MapLoader.js`       | Orchestrates map loading across `.rsw`, `.gnd`, `.gat`, models, and textures.                                    |
| `Targa.js`           | `.tga` image parsing (uncompressed and RLE) into pixel buffers/canvases.                                         |
| `wasm/`              | `paletteConvert.wat`/`.js`, `spriteCompile.wat`/`.js`, `targa.wat`/`.js` (regenerated via `npm run wasm:build`). |

---

## Playbook: Modify an Asset Loader

1. Trace the binary format specification, `BinaryReader` offset reads, Web Worker transfer (`ThreadEventHandler.js`), `MemoryManager` cache key, and all renderer/UI consumers.
2. Check format version branches (e.g., `.spr` versions `1.x`–`2.1`, `.rsw` versions, `.rsm` vs `.rsm2`).
3. If touching `Sprite.js` or `Targa.js` hot paths, check `src/Loaders/wasm/` and run `npm run wasm:build` if `.wat` changes.
4. Add or update unit tests in `tests/loaders/` covering valid versions, boundary conditions, and malformed/missing asset inputs using synthetic `ArrayBuffer` fixtures.
