# AGENTS.md

Global repository instructions for AI coding agents working on **roBrowserLegacy**, a browser-based Ragnarok Online client built with ES modules, Vite + a custom builder (`applications/tools/builder-web.mjs`), and WebGL (OpenGL ES 2.0). Runs in Web Browsers, as a PWA, and as an Electron desktop app.

---

## 1. Documentation Routing (Read Before Editing)

Consult **only** the scoped instructions and reference documents relevant to your task. Mandatory references are prerequisites, not optional suggestions.

| Task / Subsystem | Required Documentation |
| --- | --- |
| **UI components, Shadow DOM, custom elements, scrollbars** | [`src/UI/AGENTS.md`](src/UI/AGENTS.md) → [`docs/UIComponent_to_GUIComponent.md`](docs/UIComponent_to_GUIComponent.md), [`docs/CustomElements.md`](docs/CustomElements.md), [`docs/Scrollbar.md`](docs/Scrollbar.md) |
| **Versioned UI deduplication (`*Common.js` factories)** | [`src/UI/AGENTS.md`](src/UI/AGENTS.md) → [`docs/GUIComponent_Version_Dedup_Factory.md`](docs/GUIComponent_Version_Dedup_Factory.md) |
| **Packets, opcodes, lengths, `PACKETVER`, sockets** | [`src/Network/AGENTS.md`](src/Network/AGENTS.md) |
| **WebGL renderer, `Entity` mixins, effects, shaders, GR2** | [`src/Renderer/AGENTS.md`](src/Renderer/AGENTS.md) → [`docs/reference/renderer/README.md`](docs/reference/renderer/README.md) |
| **Game/Login/Char/Map engines & gameplay handlers** | [`src/Engine/AGENTS.md`](src/Engine/AGENTS.md) → [`docs/reference/README.md`](docs/reference/README.md) |
| **Binary asset loaders (`.grf`, `.spr`, `.rsw`, `.gr2`, WASM)** | [`src/Loaders/AGENTS.md`](src/Loaders/AGENTS.md) → [`docs/Encoding.md`](docs/Encoding.md) |
| **Database tables, constants, item/skill/status lookups** | [`src/DB/AGENTS.md`](src/DB/AGENTS.md) → [`docs/Encoding.md`](docs/Encoding.md) |
| **VFS (`Client`/`FileManager`), `ROConfig`, Workers, Lua/AI** | [`src/Core/AGENTS.md`](src/Core/AGENTS.md) → [`docs/LuaModuleResolution.md`](docs/LuaModuleResolution.md), [`docs/Encoding.md`](docs/Encoding.md) |
| **Controls, Audio, Preferences, Plugins, Utils** | [`docs/Architecture.md`](docs/Architecture.md) |
| **Original Windows client behavioral notes (Guild, Chat, Pet, Mounts)** | [`docs/reference/README.md`](docs/reference/README.md) |
| **Architecture overview, JS modernization, debugging, glossary** | [`docs/Architecture.md`](docs/Architecture.md) |
| **Code review & PR invariants** | [`REVIEW.md`](REVIEW.md) |

> **Hierarchical Discovery Note:** When working in `src/<Subsystem>/`, always open and read the corresponding `src/<Subsystem>/AGENTS.md` file first if your coding agent does not load nested `AGENTS.md` files automatically.

---

## 2. Non-Negotiable Constraints

Never violate these rules unless the user explicitly directs a change to the constraint:

- **Do not modify `src/Vendors/`.** Vendored third-party files are frozen and excluded from ESLint.
- **Do not convert the `Entity` mixin/composition system into class inheritance.** 17 mixins (`src/Renderer/Entity/*` + `Controls/EntityControl.js`) are applied dynamically via `.call(this)`, and `Entity.prototype` properties act as an `Entity.prototype.hasOwnProperty` security whitelist for `Entity.set()`.
- **Do not change `PACKETVER` detection or block-size logic in `src/Network/PacketVerManager.js` without explicit instruction.**
- **Do not reintroduce the removed legacy `UIComponent` or jQuery UI patterns.** All UI components must use `GUIComponent`, Shadow DOM (`this.getRoot()`), and native DOM APIs.
- **Do not change numeric IDs in `src/DB/*Const.js` tables** unless intentionally matching an official kRO update.
- **Use configured path aliases with explicit `.js` extensions** for cross-directory imports (e.g., `import Client from 'Core/Client.js';`). Aliases (`App`, `Audio`, `Controls`, `Core`, `DB`, `Engine`, `Loaders`, `Network`, `Plugins`, `Preferences`, `Renderer`, `UI`, `Utils`, `Vendors` → `src/<Alias>`) must stay synchronized in both `vite.config.js` and `applications/tools/builder-web.mjs`.
- **Do not remove existing global assignments** (`ROConfig`, `ROBrowser`, `SEEK_CUR`, `SEEK_SET`, `SEEK_END`, `window._OBJ_DRAG_`) without auditing every consumer, including Web Workers and `applications/`.
- **Do not hand-edit generated defaults in `Config.js`** unless the task specifically requires changing the generator (`applications/tools/builder-web.mjs`) or default config.
- **Never commit proprietary game assets** (`.grf`, `.spr`, `.act`, `.bmp`, `.mp3`). Test fixtures must be synthetic in-memory buffers.

---

## 3. Operating Rules & Workflow

1. **Before editing:** Read the relevant scoped `AGENTS.md` and linked reference docs from the routing table. Inspect the current source files, callers, and tests—do not assume documentation summaries or packet names alone reflect the implementation.
2. **While editing:** Make the smallest focused change that solves the task. Follow established subsystem patterns, preserve public interfaces, and avoid unrelated formatting churn or sweeping refactors.
3. **Before finishing:** Ask the user whether to run lint, format, and relevant tests before executing them. If confirmed, run the requested checks and report the exact commands executed along with any checks that could not be run. Never report a check as passing unless it actually ran and succeeded.

---

## 4. Code Conventions

- **Formatting & Lint:** Enforced by ESLint (`eslint.config.js`) and Prettier (`npm run ci`).
- **Style:** Single quotes (`avoidEscape: true`), semicolons required, no trailing commas (`comma-dangle: 'never'`), braces required for all control-flow bodies (`curly: 'all'`).
- **Variables & Safety:** Use `const` by default, `let` when reassigned, never `var`. Prefix intentionally unused variables/parameters with `_`. Never use `eval`, implied eval, `new Function`, or `with`.
- **Naming:** `PascalCase` for classes/constructors, `camelCase` for functions/methods, `UPPER_SNAKE_CASE` for DB/protocol constants, `_prefix` for private/internal properties.
- **Modernization on Touch:** When editing legacy code, modernize only the touched lines if safe (watch out for dynamic `this` in callbacks—keep `function()` where callers use `.call`/`.apply`; see [`docs/Architecture.md`](docs/Architecture.md)).

---

## 5. Commands, Testing & Validation

Check [.nvmrc](.nvmrc) and [package.json](package.json) for Node.js requirements.
Check [package.json](package.json) for script commands.
