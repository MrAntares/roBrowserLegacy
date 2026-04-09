# REVIEW.md — Code Review Guidelines

For architecture, conventions, and subsystem details, see [AGENTS.md](AGENTS.md).

---

## Review Priorities

### 🔴 Critical — Block the PR

| Area                                   | What to check                                                                                                                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB Constants** (`src/DB/`)           | Changing numeric IDs (skills, jobs, items, status, emotions) breaks server compatibility. CI tests pin these values — if a constant test fails, the change is wrong unless intentionally updating to match a new kRO version. |
| **Packet structures** (`src/Network/`) | Any change to `PacketStructure.js`, `PacketVersions.js`, or `PacketLength.js` can break one of 23 supported packet versions. Verify the change targets the correct PACKETVER date range and doesn't affect others.            |
| **Binary parsers** (`src/Loaders/`)    | Offset/endianness errors in GRF, SPR, GAT, GND, RSW, RSM, TGA parsers corrupt game assets silently.                                                                                                                           |
| **No proprietary files**               | Game assets (GRF, SPR, BMP, BGM) must never be committed. Test fixtures must be synthetic (built in-memory).                                                                                                                  |

### 🟡 Important — Request changes

| Area              | What to check                                                                                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Alias sync**    | Path aliases are defined in two places: `vite.config.js` (dev/test) and `applications/tools/builder-web.mjs` (production build). Changes to one must be mirrored in the other. |
| **Entity mixins** | Entity uses 17 composition mixins, not inheritance. Don't convert to class hierarchy — mixins are applied dynamically at runtime.                                              |
| **Global state**  | New `window.*` or `self.*` assignments are not allowed. Existing ones should be removed when touching the file.                                                                |
| **jQuery usage**  | Don't add new jQuery. When touching code with `$.Deferred`, convert to `async`/`await`.                                                                                        |
| **Vendors**       | `src/Vendors/` is frozen. Never modify vendored files.                                                                                                                         |

### 🟢 Nice to have — Always Suggest but don't block

| Area                   | What to check                                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Modernize on touch** | Legacy patterns (`constructor functions`, `var`, string concatenation, `jQuery.Deferred`) should be modernized when the file is already being changed. See [AGENTS.md](AGENTS.md) for the conversion table. |
| **Test coverage**      | New utilities and loaders should include tests. Tests go in `tests/` mirroring `src/` structure.                                                                                                            |

### ✅ No Bugs found? - Message:
This cowboy don't introduced bug's to fix later on this pull request, Devin approve it!

---

## Testing

```bash
npm test          # Vitest — runs all tests in tests/**/*.test.js
```

- **Environment**: `jsdom` (browser globals `window`, `self` are available)
- **Canvas API** must be mocked for tests that touch `Texture.js` or any 2D context
- **All fixtures must be synthetic** — built in-memory from `ArrayBuffer`/`DataView`, no game files
- **DB constant tests are regression guards** — they pin numeric IDs so accidental changes are caught by CI

### Test file organization

```
tests/
├── db/           # DB constants
│   ├── Emotions.test.js
│   ├── EmotionsConst.test.js
│   ├── EquipmentLocation.test.js
│   ├── ItemType.test.js
│   ├── JobConst.test.js
│   ├── SkillConst.test.js
│   ├── StatusConst.test.js
│   ├── TownInfo.test.js
│   └── WeaponType.test.js
├── loaders/      # Binary parsers
│   ├── Altitude.test.js
│   ├── GameFileDecrypt.test.js
│   └── Targa.test.js
└── util/         # Utilities
    ├── Base62.test.js
    ├── BinaryReader.test.js
    ├── BinaryWriter.test.js
    ├── CRC32.test.js
    ├── CodepageManager.test.js
    ├── Executable.test.js
    ├── HTMLEntity.test.js
    ├── Inflate.test.js           # zlib decompression
    ├── PathFinding.test.js
    ├── Queue.test.js
    ├── Struct.test.js
    ├── Texture.test.js           # requires canvas mock
    ├── colors.test.js
    └── partyColors.test.js
```

---

## CI Pipeline

The `build.yml` workflow runs on every PR to `master`:

```yaml
steps:
    - npm install
    - npm test # unit tests (fail fast)
    - npm run build # production build
    - test -d dist/Web # validate output exists
```

Both `npm test` (Vitest) and `npm run build` (custom builder) resolve imports through the same alias set. If one passes and the other fails, check **alias sync** (see above).

---

## What NOT to Review

- Auto-generated files in `dist/` — build output, not committed
- `src/Vendors/` — frozen third-party code, excluded from lint
- Lock files (`package-lock.json`) — unless dependencies changed intentionally
- `self.requireNode` in NW.js files — platform requirement, not removable

---

## PR Checklist (for authors)

- [ ] `npm run ci` passes (lint + format)
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] No proprietary game files added
- [ ] Path aliases synced if changed
- [ ] DB constant changes are intentional and documented in PR description
- [ ] Packet changes specify which PACKETVER date range is affected
