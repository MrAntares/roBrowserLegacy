# AGENTS.md — Tests (`tests/`)

## Topological snapshot

- `db/` — constants and metadata lookups.
- `loaders/` — binary asset parser tests and parity fixtures.
- `util/` — shared utility contracts.

## Test Topology (`tests/`)

| Directory / file | Coverage / responsibility |
| ---------------- | ------------------------- |
| `db/` | Database lookups, constants, equipment and skill metadata, and related merge behavior. |
| `loaders/` | Binary asset loaders and format behavior; `.wat`/JavaScript decoder parity tests. |
| `util/` | Shared utility behavior: binary I/O, encoding, pathfinding, checksums, textures, and related helpers. |
| `bench/` | Benchmarks for palette conversion, sprite compilation and frames, and Targa processing. |
| `setup.js` | Shared Vitest environment setup, including canvas and local-storage mocks. |

| Directory | Files Name |
| --- | --- |
| `bench/`| `paletteConvert.bench.js`, `spriteCompile.bench.js`, `spriteFrame.bench.js`, `targa.bench.js`, `gameFileDecrypt.bench.js`|
| `db/`| `BodyPalPath.test.js`, `Emotions.test.js`, `EmotionsConst.test.js`, `EquipmentLocation.test.js`, `IsShield.test.js`, `ItemType.test.js`, `JobConst.test.js`, `SkillAction.test.js`, `SkillConst.test.js`, `SkillTreeMerge.test.js`, `StatusConst.test.js`, `TownInfo.test.js`, `WeaponType.test.js` |
| `loaders/`| `Action.test.js`, `Altitude.test.js`, `GameFile.test.js`, `GameFileDecrypt.test.js`, `gameFileDecrypt.parity.test.js`, `GR2Loader.test.js`, `Ground.test.js`, `MapLoader.test.js`, `Model.test.js`, `paletteConvert.parity.test.js`, `Sprite.test.js`, `spriteCompile.parity.test.js`, `spriteFrame.parity.test.js`, `Str.test.js`, `Targa.parity.test.js`, `Targa.test.js`, `World.test.js` |
| `util/`| `Base62.test.js`, `BinaryReader.test.js`, `BinaryWriter.test.js`, `CodepageManager.test.js`, `colors.test.js`, `CRC32.test.js`, `Executable.test.js`, `HTMLEntity.test.js`, `Inflate.test.js`, `partyColors.test.js`, `PathFinding.test.js`, `Queue.test.js`, `Struct.test.js`, `Texture.test.js` |
| `setup.js`| `setup.js` |