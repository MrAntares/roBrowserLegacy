# REVIEW.md — Code Review Guidelines

For architecture, conventions, and subsystem details, see [AGENTS.md](AGENTS.md).

---

## Review Priorities

### 🔴 Critical — Block the PR

| Area                                   | What to check                                                                                                                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB Constants** (`src/DB/`)           | Changing numeric IDs (skills, jobs, items, status, emotions) breaks server compatibility. CI tests pin these values — if a constant test fails, the change is wrong unless intentionally updating to match a new kRO version. |
| **Packet structures** (`src/Network/`) | Any change to `PacketStructure.js`, `PacketVersions.js`, or `PacketLength.js` can break one of 23 supported packet versions. Verify the change targets the correct PACKETVER date range and doesn't affect others.            |
| **Binary parsers** (`src/Loaders/`)    | Offset/endianness errors in GRF, SPR, GAT, GND, RSW, RSM, GR2, TGA parsers corrupt game assets silently.                                                                                                                      |
| **No proprietary files**               | Game assets (GRF, SPR, BMP, BGM) must never be committed. Test fixtures must be synthetic (built in-memory).                                                                                                                  |

### 🟡 Important — Request changes

| Area                          | What to check                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alias sync**                | Path aliases are defined in two places: `vite.config.js` (dev/test) and `applications/tools/builder-web.mjs` (production build). Changes to one must be mirrored in the other.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Entity mixins**             | Entity uses 17 composition mixins, not inheritance. Don't convert to class hierarchy — mixins are applied dynamically at runtime.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Global state**              | New `window.*` or `self.*` assignments are not allowed. Existing **file-local** globals (values attached to `window`/`self`/`globalThis` or otherwise leaked to global scope) should be removed when touching the file. **Not globals:** module-scoped `const` scratchpads/caches (e.g. preallocated `Float32Array`/`mat4`/`vec3` buffers reused per frame to avoid GC in render paths, and module-private GL resources like `_program`/`_buffer` in `src/Renderer/`) are an intentional performance pattern — do NOT flag them, and do not request moving them into an instance/state owner. **Exception:** `window._OBJ_DRAG_` is a shared cross-component drag-and-drop contract (written by ~20 source components, read by Equipment/SwitchEquip/SkillList drop targets) — do NOT remove it piecemeal. It must be migrated atomically across all producers and consumers in a dedicated PR, not as a side effect of unrelated changes. See "What NOT to Review". |
| **Vendors**                   | `src/Vendors/` is frozen. Never modify vendored files, Only add allowed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Shadow DOM (GUIComponent)** | Never use jQuery `.show()`/`.hide()` inside Shadow DOM. Never use `$el.closest('body')` — use `el.isConnected`. Global CSS doesn't penetrate shadow boundaries — add shared rules to `Common.css`. See `docs/UIComponent_to_GUIComponent.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Agents.md**                 | Newer Modules requires register in `Agents.md` topological map agent guidance.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

### 🟠 Flags — Always investigate

| Requirement              | Detail                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Never skip**           | When the Bug Catcher flags something as **Investigate**, always leave a comment — never silently skip.                |
| **Comment must include** | 1) What the flagged code does. 2) Whether it's a real issue or false positive. 3) If action is needed, suggest a fix. |

### 🟢 Nice to have — Always Suggest but don't block

| Area                   | What to check                                                                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Modernize on touch** | Legacy patterns (`constructor functions`, `var`, string concatenation, etc.) should be modernized when the file is already being changed. See [AGENTS.md](AGENTS.md) for the conversion table. |
| **Test coverage**      | New utilities and loaders should include tests. Tests go in `tests/` mirroring `src/` structure.                                                                                               |

### ✅ No Issues Found

When no bugs are found, confirm explicitly that the PR was reviewed and no issues were identified. Don't just skip the review silently.

---

## Deduplication JS into Factory Patterns Review Rules

When reviewing JS deduplication into a `FooCommon.js` factory pattern, hunt for
missing code, deduplication logic errors, and code injected outside of its
original version.

| Check                       | What to verify                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Component `name`**        | Each version keeps its exact original component name string — `UIManager`/`UIVersionManager` lookups depend on it.                      |
| **Preference keys**         | Every `Preferences.get(...)` key stays verbatim (per-version or shared, copied as-is). Renamed/merged keys reset or leak user settings. |
| **`versionInfo` mapping**   | PACKETVER→version mapping in the aggregator unchanged — a wrong map loads the wrong version for a client date.                          |
| **No shared mutable state** | Per-instance state lives inside `createFoo`, never at module scope shared across versions.                                              |
| **Flag minimalism**         | Each config flag maps to a real, pre-existing version difference — no invented/speculative options.                                     |
| **Faithful HTML/CSS**       | In-factory generated HTML matches legacy node-for-node (classes, ids, `data-*`, asset paths).                                           |
| **No behavior added**       | No new tabs/buttons/options; pre-existing bugs migrated 1:1 with a `// TODO`, not "fixed" here.                                         |

---

## Testing

```bash
npm test          # Vitest — runs all tests in tests/**/*.test.js
```

- **Environment**: `jsdom` (browser globals `window`, `self` are available)
- **Canvas API** must be mocked for tests that touch `Texture.js` or any 2D context
- **All fixtures must be synthetic** — built in-memory from `ArrayBuffer`/`DataView`, no game files
- **DB constant tests are regression guards** — they pin numeric IDs so accidental changes are caught by CI
- **Node.js**: `>=22` required (`.nvmrc` pins Node 22; CI uses Node 24). Note: Node 25+ has experimental native `localStorage` on `globalThis` that can conflict with `jsdom`.

### Test file organization

```
tests/
├── db/           # DB constants & tables (12 files)
├── engine/       # LoginEngine & MapEngine tests (2 files)
├── fixtures/     # Synthetic test fixtures & mock helpers (2 files)
├── loaders/      # Binary parsers (11 files, including GR2Loader.test.js)
├── network/      # Packet structure, registration & handler tests (4 files)
├── renderer/     # Renderer & GR2 tests (11 files, including 5 in GR2/)
├── ui/           # GUIComponent & UI subsystem tests (22 files)
└── util/         # Utilities (14 files)
```

---

## CI Pipeline

Five workflows run on PRs/pushes to `master`:

| Workflow                | Trigger               | What it does                                                  |
| ----------------------- | --------------------- | ------------------------------------------------------------- |
| **build.yml**           | PR + push to `master` | `npm test` → `npm run build` → validates `dist/Web/` exists   |
| **lint.yml**            | PR                    | `npm run lint` (ESLint)                                       |
| **format.yml**          | PR                    | `npm run format:check` (Prettier, `continue-on-error: true`)  |
| **analysis_codeql.yml** | PR + push to `master` | CodeQL security analysis (skips `src/Vendors/`, docs, config) |
| **lintandformat.yml**   | push to `master` only | Auto-fixes lint+format and commits directly                   |

> **Note**: `format.yml` uses `continue-on-error: true` — it won't block the PR, but failures should still be fixed.  
> **Note**: `lintandformat.yml` auto-commits to `master` after merge. Don't be surprised by `"code-quality: auto lint + format"` commits.

Both `npm test` (Vitest) and `npm run build` (custom builder) resolve imports through the same alias set. If one passes and the other fails, check **alias sync** (see above).

---

## What NOT to Review

- Auto-generated files in `dist/` — build output, not committed
- `src/Vendors/` — frozen third-party code, excluded from lint
- Lock files (`package-lock.json`) — unless dependencies changed intentionally
- `window.electronAPI` in Electron files — platform requirement, not removable
- `docs/*.md` — reference/prose docs (skip), EXCEPT agent operational memory (AGENTS.md, UIComponent_to_GUIComponent\*.md, GUIComponent_Version_Dedup_Factory.md) which is reviewed for correctness, not prose.
- `window._OBJ_DRAG_` — shared drag-and-drop state across ~20 source components (Inventory, Storage, Cart, Mail, SkillList, Equipment, ShortCut, etc.). The HTML5 DnD `dataTransfer` API can't read its payload during `dragover`, which is why this global exists. Don't flag it as removable global state in single-file PRs; it requires a coordinated migration (e.g. a shared `DragDropState` module).
- Module-scoped scratchpad buffers / caches in render code (`src/Renderer/**`) — these are deliberate per-frame allocation avoidance, not global state.

---

## PR Checklist (for authors)

- [ ] `npm run lint` passes (ESLint)
- [ ] `npm run format:check` passes (Prettier)
- [ ] `npm test` passes (Vitest)
- [ ] `npm run build` succeeds and `dist/Web/` is created
- [ ] No proprietary game files added (GRF, SPR, BMP, BGM)
- [ ] Path aliases synced in both `vite.config.js` and `applications/tools/builder-web.mjs`
- [ ] DB constant changes are intentional and documented in PR description
- [ ] Packet changes specify which PACKETVER date range is affected
- [ ] New loaders/utilities include tests in `tests/` mirroring `src/` structure
