# Test Fixtures

Real binary files extracted from a Ragnarok Online client, used as fixtures for loader tests.

Files have `.bin` appended to their original extension to prevent automatic association with external tools.

## Usage

```js
import { loadFixture } from '../helpers/loadFixture.js';

const data = loadFixture('_test.gat.bin');
const gat = new GAT(data); // returns an ArrayBuffer in the jsdom realm
```

The `loadFixture.js` helper reads the file with `fs.readFileSync` and copies the bytes into a `Uint8Array` created in the jsdom realm, avoiding cross-realm `instanceof ArrayBuffer` issues with Vitest's jsdom environment.

---

## Fixture Inventory

| File | Format | Source | Size |
|---|---|---|---|
| `_test.gat.bin` | GAT (Altitude) | ma_zif01.gat | ~71 KB |
| `_test.gnd.bin` | GND (Ground) | ma_zif01.gnd | ~25 KB |
| `_test.rsw.bin` | RSW (World) | ma_zif01.rsw | ~65 KB |
| `_test.rsm.bin` | RSM (Model) | coin_j_01.rsm | ~1 KB |
| `_test.spr.bin` | SPR (Sprite) | 9 indexed frames | ~14 KB |
| `_test.act.bin` | ACT (Action) | ork_warrior.act | ~59 KB |
| `_test.str.bin` | STR (Effect) | note_1.str | ~17 KB |
| `_test.24b.tga.bin` | TGA 24-bit | ete_smoke_01.tga | ~4 KB |
| `_test.32b.tga.bin` | TGA 32-bit | mandragora.tga | ~5 KB |
| `_test.grf.bin` | GRF (Archive) | contains 1 TGA | ~2 KB |

> **Note:** `_test.act.bin` (ork_warrior) and `_test.spr.bin` come from **different** sprites — they do not correspond to each other.

---

## Expected Values per Fixture

### `_test.gat.bin` — GAT (Altitude)

| Field | Value | Notes |
|---|---|---|
| Header | `GRAT` | `readBinaryString(4)` |
| Version | `1.2` | `readUByte() + readUByte() / 10` |
| Width | `60` | `readULong()` |
| Height | `60` | `readULong()` |
| Cells | `3600` (60×60) | |
| Cells array length | `18000` (3600×5) | 4 heights + 1 type per cell |

Loader: `src/Loaders/Altitude.js`

---

### `_test.spr.bin` — SPR (Sprite)

| Field | Value | Notes |
|---|---|---|
| Header | `SP` | `readBinaryString(2)` |
| Version | `2.1` | `readUByte() / 10 + readUByte()` |
| Indexed images | `9` | `readUShort()` |
| RGBA images | `0` | `readUShort()` (version > 1.1) |
| Total frames | `9` | indexed + rgba |
| RLE | Yes | version >= 2.1 → `readIndexedImageRLE()` |
| Palette | 1024 bytes | `Uint8Array(fp.buffer, fp.length - 1024, 1024)` |
| Frame[0] width | `54` | `readUShort()` |
| Frame[0] height | `52` | `readUShort()` |

Loader: `src/Loaders/Sprite.js`

---

### `_test.act.bin` — ACT (Action)

| Field | Value | Notes |
|---|---|---|
| Header | `AC` | `readBinaryString(2)` |
| Version | `2.5` | `readUByte() / 10 + readUByte()` |
| Actions | `40` | |
| Sounds | `8` | version >= 2.1 |
| Delays | Yes | version >= 2.2 → `readFloat() * 25` per action |

**Frames per action group:**

| Actions | Frames each |
|---|---|
| [0–7] | 17 |
| [8–15] | 10 |
| [16–23] | 9 |
| [24–31] | 3 |
| [32–39] | 12 |

Loader: `src/Loaders/Action.js`

---

### `_test.gnd.bin` — GND (Ground)

| Field | Value | Notes |
|---|---|---|
| Header | `GRGN` | `readBinaryString(4)` |
| Version | `1.7` | `readUByte() + readUByte() / 10` |
| Width | `30` | `readULong()` |
| Height | `30` | `readULong()` |
| Textures | `0` | `parseTextures()` |
| Lightmaps | `0` | `parseLightmaps()` |
| Lightmap grid | 8×8 | width=8, height=8, per cell=64 |
| Tiles | `0` | `parseTiles()` |
| Surfaces (cubes) | `900` | `parseSurfaces()` = 30×30 |
| Water | N/A | version 1.7 < 1.8, water block not read |

Loader: `src/Loaders/Ground.js`

---

### `_test.rsw.bin` — RSW (World)

| Field | Value | Notes |
|---|---|---|
| Header | `GRSW` | `readBinaryString(4)` |
| Version | `2.1` | `readByte() + readByte() / 10` |

> **Note:** The RSW loader stores `version` as a local `const` variable, NOT as `this.version`. It is not accessible on the instance.

**Sub-files** (3 strings of 40 bytes + 1 extra for version >= 1.4):

| Field | Value |
|---|---|
| `files.gnd` | `ma_zif01.gnd` |
| `files.gat` | `ma_zif01.gat` |

**Water** (version 2.1 >= 1.3, >= 1.8, >= 1.9):

| Field | Raw value | Parsed value | Transform |
|---|---|---|---|
| level | 0 | `0` | `readFloat() / 5` |
| type | 0 | `0` | `readLong()` |
| waveHeight | 1.0 | `0.2` | `readFloat() / 5` |
| waveSpeed | 2.0 | `2.0` | `readFloat()` |
| wavePitch | 50.0 | `50.0` | `readFloat()` |
| animSpeed | 3 | `3` | `readLong()` |

**Light** (version >= 1.5, >= 1.7):

| Field | Value |
|---|---|
| longitude | `45` |
| latitude | `45` |
| diffuse | `[1, 1, 1]` |
| ambient | `[0.3, 0.3, 0.3]` |
| opacity | `0.5` |

**Ground frustum** (version >= 1.6):

| Field | Value |
|---|---|
| top | `0` |
| bottom | `0` |
| left | `1108574208` |
| right | `33` |

**Objects:**

| Field | Value |
|---|---|
| Total objects | `1` |
| Models | `1` |
| Lights | `0` |
| Sounds | `0` |
| Effects | `0` |
| Quad tree nodes | `1365` |

Loader: `src/Loaders/World.js`

---

### `_test.rsm.bin` — RSM (Model)

| Field | Value | Notes |
|---|---|---|
| Header | `GRSM` | `readBinaryString(4)` |
| Version | `1.4` | `readByte() + readByte() / 10` |
| animLen | `32000` | `readLong()` |
| shadeType | `2` | `readLong()` |
| alpha | `1.0` | `readUByte() / 255.0` (version >= 1.4, raw=255) |
| Main node name | `coin_j_01` | `readBinaryString(40)` |
| Nodes | `1` | `readLong()` |
| Textures | `1` | `["abyss\\abyss_j_07.bmp"]` |

Code path: version < 2.2 → reads 16 reserved bytes, texture count, additionalTextures, mainNodeName.

Loader: `src/Loaders/Model.js`

---

### `_test.str.bin` — STR (Effect)

| Field | Value | Notes |
|---|---|---|
| Header | `STRM` | `readBinaryString(4)` |
| Version | `0x94` (148) | `readULong()` |
| FPS | `60` | `readULong()` |
| maxKey | `90` | `readULong()` |
| Layers | `16` | `readULong()` |

**Layers summary:**

| Layer | Textures | Key frames |
|---|---|---|
| 0 | 0 | 0 |
| 1–6 | 1 | 11 |
| 7 | 1 | 9 |
| 8 | 1 | 11 |
| 9 | 1 | 5 |
| 10–15 | 1 | 5 |

Loader: `src/Loaders/Str.js`

---

### `_test.24b.tga.bin` / `_test.32b.tga.bin` — TGA (Targa)

| Field | 24-bit | 32-bit |
|---|---|---|
| pixelDepth | `24` | `32` |
| width | > 0 | > 0 |
| height | > 0 | > 0 |
| imageType | `2` (RGB) | `2` (RGB) |

> **Note:** The `Targa` constructor takes no arguments. Use `new Targa()` then `tga.load(new Uint8Array(data))`.

Loader: `src/Loaders/Targa.js`

---

### `_test.grf.bin` — GRF (GameFile)

| Field | Value | Notes |
|---|---|---|
| Signature | `Master of Magic` | 15 bytes + null |
| Contents | 1 file | `data\marshofabyss24.tga` |

> **Note:** The GRF loader requires `FileReaderSync` (Web Worker API). Tests must mock it globally before instantiation. See `tests/loaders/GameFile.test.js` for the mock pattern.

Loader: `src/Loaders/GameFile.js`

---

## How to Extract New Fixtures

1. Open your client's `.grf` file with **GRF Editor** (or similar tool)
2. Extract the desired file (e.g., a `.gat`, `.spr`, `.act`, etc.)
3. Place it in `tests/fixtures/` with the naming convention `_test.<description>.<ext>.bin`
4. Document the expected values in this README using GRF Editor's properties panel
5. **Verify values by running the actual loader** — GRF Editor may display composite/aggregate values that differ from per-frame or per-field values parsed by the code

## Naming Convention

```
_test.<description>.<original_extension>.bin
```

Examples:
- `_test.gat.bin` — default GAT fixture
- `_test.24b.tga.bin` — 24-bit TGA fixture
- `_test.grf.bin` — default GRF fixture

The `.bin` suffix prevents OS/editor file associations with the original format.

## Important Notes

- Keep fixtures small (< 100 KB each) to avoid bloating the repository
- For large formats (GAT, GND), prefer small indoor maps over cities
- The `loadFixture()` helper handles the jsdom cross-realm `ArrayBuffer` issue automatically
- Always verify expected values by running the loaders, not just reading GRF Editor — tool UIs may show different representations of the data
