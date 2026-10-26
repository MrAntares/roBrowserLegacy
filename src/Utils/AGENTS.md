# AGENTS.md — Shared Utilities (`src/Utils/`)

Instructions for shared binary, encoding, rendering, and general-purpose utilities.

## Utility Map (`src/Utils/`)

| File                 | Responsibility                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `Base62.js`          | Base-62 value encoding and decoding.                                                           |
| `BinaryReader.js`    | Binary buffer reads, string decoding, structured reads, and seek/position handling.            |
| `BinaryWriter.js`    | Binary buffer writes, string encoding, and coordinate serialization.                           |
| `CodepageManager.js` | Text encoding/decoding and client language-to-codepage selection.                              |
| `colors.js`          | Converts packed 32-bit colors to RGB values.                                                   |
| `ConsoleManager.js`  | Configurable client console initialization and visibility controls.                            |
| `CRC32.js`           | CRC-32 checksums over binary data.                                                             |
| `Executable.js`      | Reads Ragnarok executable metadata, including client date/version information.                 |
| `gl-matrix.js`       | Re-exports the vendored `gl-matrix` API with project compatibility extensions.                 |
| `HTMLEntity.js`      | Decodes HTML entities in strings.                                                              |
| `HtmlHelper.js`      | HTML escaping/sanitization and lightweight element animation helpers.                          |
| `Inflate.js`         | DEFLATE decompression for binary data.                                                         |
| `partyColors.js`     | Produces deterministic party-member colors from entity identifiers.                            |
| `PathFinding.js`     | Grid pathfinding over map walkability data, including cell updates and range-limited searches. |
| `Queue.js`           | FIFO callback queue with sequential execution.                                                 |
| `Rijndael.js`        | Project wrapper for Rijndael encryption and decryption.                                        |
| `Struct.js`          | Defines and reads structured binary layouts.                                                   |
| `Texture.js`         | Image and GIF texture loading and pixel processing.                                            |
| `WebGL.js`           | WebGL context, shader/program, texture, and capability helpers.                                |

## Invariants

- Read `docs/Encoding.md` before changing binary string handling, codepage selection, or text decoding. Keep raw bytes distinct from decoded strings and use explicit encoding context.
- Binary readers and writers are shared by loaders, network, and core code. Preserve field widths, byte order, seek semantics, and the `SEEK_CUR`, `SEEK_SET`, and `SEEK_END` compatibility globals.
- Preserve the existing call contracts across browser, worker, PWA, and Electron contexts; shared utilities must not assume a DOM or `window` unless their current role is browser-only.
- Keep the project `gl-matrix.js` wrapper as the compatibility boundary. Never modify the frozen dependencies under `src/Vendors/`.
- Pathfinding operates on map walkability data; changes must retain consistency with the map altitude/cell representation and existing movement callers.
- Do not change encryption, checksums, or executable parsing behavior without tracing their consumers and binary-format expectations.
