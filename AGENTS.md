# AGENTS.md

Global instructions for AI coding agents working on **roBrowserLegacy**, a browser-based Ragnarok Online client built with ES modules, Vite, a custom builder (`applications/tools/builder-web.mjs`), and WebGL (OpenGL ES 2.0). The project runs in web browsers, as a PWA, and as an Electron desktop application.

---

## 1. Documentation Routing

**Read the instructions and references relevant to the task before editing.** Mandatory references are prerequisites, not optional suggestions. Do not read unrelated subsystem documentation unless the investigation requires it.

| Task / subsystem                                                     | Required documentation                                                                                    |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| UI components, Shadow DOM, Custom Elements, scrollbars               | `src/UI/AGENTS.md` → `docs/UIComponent_to_GUIComponent.md`, `docs/CustomElements.md`, `docs/Scrollbar.md` |
| Versioned UI deduplication (`*Common.js` factories)                  | `src/UI/AGENTS.md` → `docs/GUIComponent_Version_Dedup_Factory.md`                                         |
| Packets, opcodes, lengths, `PACKETVER`, sockets                      | `src/Network/AGENTS.md`                                                                                   |
| WebGL renderer, `Entity` mixins, effects, shaders, GR2               | `src/Renderer/AGENTS.md` → `docs/reference/renderer/README.md`                                            |
| Game, Login, Char and Map engines; gameplay handlers                 | `src/Engine/AGENTS.md` → `docs/reference/README.md`                                                       |
| Binary asset loaders (`.grf`, `.spr`, `.rsw`, `.gr2`, WASM)          | `src/Loaders/AGENTS.md` → `docs/Encoding.md`                                                              |
| Database tables, constants, item/skill/status lookups                | `src/DB/AGENTS.md` → `docs/Encoding.md`                                                                   |
| VFS (`Client`/`FileManager`), `ROConfig`, Workers, Lua/AI            | `src/Core/AGENTS.md` → `docs/LuaModuleResolution.md`, `docs/Encoding.md`                                  |
| Controls, Audio, Preferences, Plugins, Utils                         | `docs/Architecture.md`                                                                                    |
| Original Windows client behavior (Guild, Chat, Pet, Mounts, etc.)    | `docs/reference/README.md` → applicable behavior references                                               |
| Architecture overview, JavaScript modernization, debugging, glossary | `docs/Architecture.md`                                                                                    |
| Code review and PR invariants                                        | `REVIEW.md`                                                                                               |

### Documentation discovery rules

- When working inside `src/<Subsystem>/`, read the corresponding `src/<Subsystem>/AGENTS.md` first if the coding agent does not automatically load nested `AGENTS.md` files.
- Follow the routing chain for the affected subsystem before editing.
- Read behavior references and how-to guides when the task touches the behavior or workflow they document.
- Treat implementation details as evidence to verify, not as a reason to ignore mandatory instructions.
- If the relevant documentation is missing, contradictory, or stale, inspect the code and report the discrepancy rather than inventing a rule.
- Do not expand the scope of investigation without a concrete dependency, regression risk, or unresolved question.

---

## 2. Non-Negotiable Constraints

Do not violate these constraints unless the user explicitly directs a change.

### 2.1 Protected code and data

- **Vendored dependencies:** Never modify `src/Vendors/`. These files are frozen and excluded from ESLint.
- **Entity composition:** Never convert the `Entity` mixin/composition system to class inheritance. Its dynamic composition and prototype-based property whitelist are intentional.
- **Packet version detection:** Do not change `src/Network/PacketVerManager.js` detection or block-size logic without explicit instruction.
- **UI modernization:** Do not reintroduce the removed legacy `UIComponent` or jQuery UI patterns. Use `GUIComponent`, Shadow DOM, and native DOM APIs.
- **Database constants:** Do not change numeric IDs in `src/DB/*Const.js` tables unless intentionally matching an official kRO update.
- **Generated configuration:** Do not hand-edit generated defaults in `Config.js` unless the task specifically requires changing the generator (`applications/tools/builder-web.mjs`) or the default configuration.
- **Game assets:** Never commit proprietary game assets such as `.grf`, `.spr`, `.act`, `.bmp`, or `.mp3`. Tests must use synthetic in-memory buffers.

### 2.2 Module resolution and globals

- Use configured path aliases with explicit `.js` extensions for cross-directory imports. Example: `import Client from 'Core/Client.js';`
- Keep aliases synchronized between `vite.config.js` and `applications/tools/builder-web.mjs`.
- Existing aliases map `App`, `Audio`, `Controls`, `Core`, `DB`, `Engine`, `Loaders`, `Network`, `Plugins`, `Preferences`, `Renderer`, `UI`, `Utils`, and `Vendors` to their respective `src/` directories.
- Do not remove existing global assignments (`ROConfig`, `ROBrowser`, `SEEK_CUR`, `SEEK_SET`, `SEEK_END`, `window._OBJ_DRAG_`) without auditing every consumer, including Web Workers and `applications/`.
- Before removing a global, verify that every consumer has been migrated to the appropriate import or replacement.

---

## 3. Architectural Decisions and Invariants

These decisions describe intentional design constraints. Do not refactor them away merely to make the code resemble a more conventional architecture.

### 3.1 Entity composition

`Entity.js` composes 16 behavior mixins from `src/Renderer/Entity/` with `Controls/EntityControl.js`, for a total of 17 mixin modules.

- Mixins are applied dynamically using `.call(this)`.
- `Entity.prototype` properties participate in the `Entity.set()` property whitelist through `Entity.prototype.hasOwnProperty`.
- `Player.js` specializes the player entity.
- Preserve the composition model and its property-validation behavior.

### 3.2 Packet versioning

Packet definitions are date-based.

- `PACKETVER` is configured per server through `packetver` or auto-detected from the kRO executable PE timestamp.
- `PacketVersions.js` maps client dates to packet definitions through `PACKETVER.addSupport`.
- `PacketLength.js` initializes packet lengths for supported versions.
- `Packets/` contains 23 version-specific length files, from `packets2003_len_main.js` through `packets2025_len_main.js`.
- Detection, opcode definitions, packet schemas, and packet lengths must remain compatible with the target client and server.

Changing `PacketVerManager.js` detection logic can break protocol compatibility. Preserve the explicit constraint in Section 2.

### 3.3 Network transport

Two socket implementations exist by design:

- **Browser:** `WebSocket.js`, requiring `wsProxy` for TCP ↔ WebSocket translation.
- **Electron:** `NodeSocket.js`, using direct TCP through the preload `contextBridge`.

Both implement the interface consumed by `NetworkManager`. Preserve this shared contract when changing transport code.

### 3.4 UI architecture

The UI uses `GUIComponent`, Shadow DOM, native DOM APIs, and Custom Elements.

- All 100 UI components use `GUIComponent`.
- `UIManager.addComponent()` requires `GUIComponent` instances.
- The legacy `UIComponent` implementation has been removed.
- Versioned component siblings have been deduplicated into shared `*Common.js` factories across 13 multi-version component families.
- The `this.ui` proxy on `GUIComponent` provides a minimal jQuery-compatible API for legacy interoperability. Internal component code must use native DOM and Shadow DOM APIs directly, such as `this.getRoot().querySelector(...)`.
- UI appearance is primarily asset-driven. Window frames, buttons, and backgrounds use BMP assets from GRF files. CSS is structural and positional rather than the primary source of visual styling.
- Components use Custom Elements such as `<ui-button>`, `<ui-text>`, and `<ui-image>`, or legacy `data-*` attributes processed by `GUIComponent.processDataAttrs()`.

**Primary references:**

- `docs/UIComponent_to_GUIComponent.md` — L1 migration guide.
- `docs/UIComponent_to_GUIComponent_Firmware.md` — L2 reflex lookup.
- `docs/UIComponent_to_GUIComponent_Scars.md` — L0 historical archive and edge cases.
- `docs/GUIComponent_Version_Dedup_Factory.md` — factory pattern rules.
- `docs/CustomElements.md` — Custom Elements reference.

### 3.5 Configuration and module resolution

`ROConfig` remains a runtime configuration global. Module aliases are part of the shared build architecture and must remain consistent across Vite and the custom web builder.

Changes to configuration generation, aliases, or global initialization may affect browsers, Electron, Workers, and application tooling. Audit all affected execution environments before modifying these interfaces.

---

## 4. Subsystem Topology

Use this section to identify ownership and likely entry points. Consult the relevant subsystem instructions before editing.

### 4.1 Repository layout — root and supporting trees

The repository is organized around the runtime modules in `src/`, with separate application shells, documentation, and subsystem tests. This map covers the stable project structure; generated build output, installed dependencies, and `.git/` are intentionally excluded.

**Root-level directories:**

| Path                               | Responsibility                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `.github/`                         | GitHub workflows, actions, issue templates, and repository Copilot instructions                       |
| `.vscode/`                         | Workspace settings and VS Code task definitions                                                       |
| `applications/`                    | Browser demos, PWA and Electron shells, API examples, and build tools; see the map below               |
| `docs/`                            | Architecture, development guides, encoding/UI references, and observed client behavior                 |
| `rathena/`                         | Optional local rAthena content; `tools/docker/asset/` holds Docker asset support                     |
| `roBrowserLegacy-RemoteClient-PHP/`| Optional Remote Client checkout location                                                              |
| `src/`                             | Client runtime modules and bundled vendor code; see the module map below                               |
| `tests/`                           | Vitest suites, benchmarks, and synthetic fixtures organized by subsystem                              |
| `vite/`                            | Vite plugins used by the development/build setup                                                       |

**Root-level files and configuration:**

| Path / pattern                                                | Responsibility                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `README.md`, `REVIEW.md`, `LICENSE`                           | Project overview, review invariants, and license                                     |
| `package.json`, `package-lock.json`, `.nvmrc`                 | Node dependencies, scripts, lockfile, and pinned Node version                        |
| `vite.config.js`, `jsconfig.json`                             | Vite configuration and JavaScript editor/module-resolution settings                  |
| `eslint.config.js`, `.prettierrc.json`, `.prettierignore`     | Linting and formatting configuration                                                 |
| `.editorconfig`, `.gitattributes`, `.gitignore`               | Editor, Git attributes, and ignored-file rules                                       |
| `Dockerfile*`, `docker-compose*.yaml`, `.dockerignore`, `DOCKER.md` | Container images, compose environments, and Docker usage                       |
| `DATA.INI`, `wsproxy.js`                                      | Runtime data/configuration input and WebSocket-to-TCP proxy entry point              |
| `GEMINI.md`                                                   | Additional repository guidance for Gemini-based agents                              |

The `.github/` subtree contains `actions/`, `ISSUE_TEMPLATE/`, and `workflows/`. The `rathena/` and Remote Client directories are local integration locations, not application source trees.

**Application shells and tooling:**

| Path                              | Responsibility                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `applications/api/`              | API entry page and browser API example                                                  |
| `applications/browser-examples/` | Local browser demos and popup/frame examples for online and asset viewers               |
| `applications/electron/`         | Electron main process, preload bridge, HTML entry point, and packaging configuration   |
| `applications/pwa/`              | PWA entry point, manifest, and generated/runtime configuration                          |
| `applications/shared/`           | Imports shared between application shells, including the import map                    |
| `applications/tools/`            | Custom web builder, tools UI, WASM builder, config/encoding helpers, and tool tests    |

The tools subtree is divided into `applications/tools/config/`, `applications/tools/encode/`, and `applications/tools/tests/`.

**Runtime module map (`src/`):**

| Path               | Responsibility                                                                        |
| ------------------ | ------------------------------------------------------------------------------------- |
| `src/App/`         | Application bootstrap and top-level client initialization                             |
| `src/Audio/`       | Audio playback and sound resource management                                          |
| `src/Controls/`    | Input controls and entity control behavior                                             |
| `src/Core/`        | Shared runtime services, VFS/client access, configuration, and worker support         |
| `src/DB/`          | Game data tables and lookups; subtrees include `Effects/`, `Items/`, `Jobs/`, `Map/`, `Monsters/`, `Pets/`, `Skills/`, and `Status/` |
| `src/Engine/`      | Login, character selection, map/gameplay, and replay flows; includes `MapEngine/` and `Replay/` |
| `src/Loaders/`     | Game asset and binary-format loaders; `wasm/` contains WebAssembly-related resources  |
| `src/Network/`     | Packet definitions, versioning, transport, and socket helpers; includes `Packets/` and `SocketHelpers/` |
| `src/Plugins/`     | Plugin interfaces and runtime integration                                             |
| `src/Preferences/` | User preference persistence and access                                                |
| `src/Renderer/`    | WebGL renderer, maps, entities, effects, shaders, and GR2 support                      |
| `src/UI/`          | GUI framework, Custom Elements, and game/application components; includes `Components/` and `Elements/` |
| `src/Utils/`       | Shared utilities used across runtime modules                                           |
| `src/Vendors/`     | Vendored third-party code; protected from modification                                |

Renderer subtrees are `src/Renderer/Effects/` (including `Shaders/GLSL/`), `Entity/`, `GR2/`, and `Map/`. Network sockets are implemented under `src/Network/SocketHelpers/`; packet length tables live in `src/Network/Packets/`.

**Documentation, references, and validation:**

| Path                              | Responsibility                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------ |
| `docs/`                           | Architecture, contribution, encoding, security, UI, and module-resolution documents |
| `docs/how-to/`                   | Task-oriented development guides for UI, packets, renderer effects, and diagnosis |
| `docs/reference/`                | Observed behavior references grouped by `chat/`, `guild/`, `pet/`, and `renderer/` |
| `docs/img/`                      | Images referenced by documentation                                              |
| `tests/bench/`                   | Performance benchmarks                                                         |
| `tests/controls/`, `tests/core/` | Control and core runtime tests                                                   |
| `tests/db/`, `tests/engine/`     | Database and engine tests                                                       |
| `tests/loaders/`, `tests/network/` | Asset-loader and network tests                                                |
| `tests/renderer/`, `tests/ui/`   | Renderer (including `GR2/`) and UI tests                                        |
| `tests/util/`                    | Utility tests                                                                   |
| `tests/fixtures/`                | Shared synthetic test data and fixture documentation                           |

### 4.2 Network packet handling — `src/Network/`

| File / directory      | Responsibility                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| `NetworkManager.js`   | Connection management, packet dispatch, and handler hooking through `Network.hookPacket`        |
| `PacketRegister.js`   | Maps opcode IDs (`0x69`, `0x6a`, etc.) to packet schema constructors                            |
| `PacketStructure.js`  | AC/ZC/HC/CZ packet schemas and data structures                                                  |
| `PacketVersions.js`   | Packet definition tables keyed by client date; registers support through `PACKETVER.addSupport` |
| `PacketLength.js`     | Packet length lookup and initialization for each `PACKETVER`                                    |
| `PacketCrypt.js`      | Packet encryption and decryption                                                                |
| `PacketVerManager.js` | Active `PACKETVER` state, packet-length coordination, and character information parsing         |
| `Packets/`            | Version-specific packet length tables                                                           |
| `SocketHelpers/`      | Browser `WebSocket.js` and Electron `NodeSocket.js`                                             |

**Packet implementation workflow:**

1. Define or update the schema in `PacketStructure.js`.
2. Map the opcode in `PacketRegister.js`.
3. Define packet lengths in `Packets/` and, when needed, outbound packet definitions in `PacketVersions.js`.
4. Hook the response through `Network.hookPacket(PACKET.<FAMILY>.*, handler)` in the appropriate engine.

Typical families include `PACKET.ZC.*` for `MapEngine`, `PACKET.AC.*` and `PACKET.SC.*` for `LoginEngine`, and `PACKET.HC.*` for `CharEngine`.

Read `docs/how-to/network-packet-development.md` when implementing packet handlers or adding packet versions.

### 4.3 Asset loaders — `src/Loaders/`

| File                 | Responsibility                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `GameFileDecrypt.js` | GRF decryption (DES/RC4)                                                                   |
| `GameFile.js`        | GRF container parsing                                                                      |
| `Action.js`          | `.act` sprite animation frames                                                             |
| `Sprite.js`          | `.spr` sprite texture and palette data                                                     |
| `Ground.js`          | `.gnd` ground mesh and texture data                                                        |
| `Altitude.js`        | `.gat` map height and collision data                                                       |
| `World.js`           | `.rsw` world resources, models, lights, and sounds                                         |
| `Str.js`             | `.str` visual effect files and compiled `.ezv` format                                      |
| `Model.js`           | `.rsm` 3D model data                                                                       |
| `GR2Loader.js`       | Granny3D `.gr2` skeletal models through `granny-ro-js`; supersedes legacy `GrannyModel.js` |
| `MapLoader.js`       | Map loading orchestration                                                                  |
| `Targa.js`           | `.tga` image parsing                                                                       |

Read `docs/Encoding.md` when a change affects encoding or binary data interpretation. Use `src/Loaders/AGENTS.md` for subsystem-specific requirements.

### 4.4 MapEngine — `src/Engine/MapEngine/`

The MapEngine contains 29 files covering game-loop management, state, gameplay, social systems, commerce, companions, and interaction handlers.

| Files / modules                                              | Responsibility                                       |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| `Main.js`, `Entity.js`                                       | Core game loop, state management, and entity control |
| `UIOpen.js`, `MapState.js`                                   | UI component lifecycle and state persistence         |
| `Achievement.js`, `Quest.js`, `Guild.js`, `Clan.js`          | Progression and group systems                        |
| `Group.js`, `Friends.js`, `PrivateMessage.js`, `ChatRoom.js` | Social features                                      |
| `CashShop.js`, `Bank.js`, `Roulette.js`                      | Commerce systems                                     |
| `Homun.js`, `Pet.js`, `Mercenary.js`                         | Companion systems                                    |
| `NPC.js`, `Store.js`, `Trade.js`                             | NPC and trade interactions                           |
| `Item.js`, `Storage.js`, `Skill.js`                          | Core gameplay systems                                |
| `Mail.js`, `Rodex.js`                                        | Messaging systems                                    |
| `Captcha.js`, `PCGoldTimer.js`                               | Security and timer systems                           |
| `OffhandWeapon.js`                                           | Offhand weapon handling                              |

Read `src/Engine/AGENTS.md` and applicable behavior references before modifying gameplay handlers.

### 4.5 GUI components — `src/UI/Components/`

The UI component tree contains 100 component directories. All components use the architecture described in Section 3.4.

The following index groups component names by functional area; it is a navigation aid, not a substitute for inspecting the relevant component implementation.

| Functional area       | Components                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Login and entry       | `Intro`, `WinList`, `WinLogin`                                                                                        |
| Inventory and items   | `Inventory`, `Equipment`, `Storage`, `Bank`, `CashShop`, `CartItems`                                                  |
| Communication         | `ChatBox`, `ChatRoom`, `ChatRoomCreate`, `WhisperBox`, `ChatBoxSettings`                                              |
| NPC interactions      | `NpcBox`, `NpcStore`, `NpcMenu`                                                                                       |
| Skills                | `SkillList`, `SkillListMH`, `SkillDescription`, `SkillTargetSelection`                                                |
| Game systems          | `Quest`, `Mail`, `Rodex`, `Trade`, `Vending`, `VendingShop`, `VendingReport`                                          |
| Crafting and upgrades | `Refine`, `RefineWeaponSelection`, `Enchant`, `EnchantGrade`, `ItemCompare`, `ItemReform`, `LaphineSys`, `LaphineUpg` |
| Social                | `Clan`, `Guild`, `PartyFriends`, `EntityRoom`                                                                         |
| Navigation            | `MiniMap`, `WorldMap`, `Navigation`, `MapName`                                                                        |
| Asset viewers         | `GrfViewer`, `ModelViewer`, `StrViewer`, `EffectViewer`, `GrannyModelViewer`                                          |
| Character information | `BasicInfo`, `WinStats`, `StatusIcons`, `Sense`                                                                       |
| Hotkeys               | `ShortCut`, `ShortCuts`, `ShortCutOption`                                                                             |
| General interface     | `Emoticons`, `Announce`, `FPS`, `Escape`, `Error`, `WinPopup`, `WinPrompt`                                            |
| Character management  | `CharCreate`, `CharSelect`, `PincodeWindow`                                                                           |
| Companions            | `HomunInformations`, `MercenaryInformations`, `PetInformations`, `PetEvolution`                                       |
| Item display          | `CardIllustration`, `ItemInfo`, `ItemObtain`, `ItemPreview`, `ItemSelection`                                          |
| Crafting utilities    | `MakeArrowSelection`, `MakeItemSelection`, `MakeReadBook`                                                             |
| Equipment management  | `PlayerViewEquip`, `SwitchEquip`, `ChangeCart`                                                                        |
| Settings              | `GraphicsOption`, `SoundOption`                                                                                       |
| Miscellaneous systems | `Captcha`, `CheckAttendance`, `Reputation`, `SlotMachine`, `PvPCount`, `PvPTimer`, `PCGoldTimer`                      |
| Interface elements    | `ContextMenu`, `EntitySignboard`, `JoystickUI`, `MobileUI`                                                            |

Read `src/UI/AGENTS.md` before editing UI components. Consult the factory guide when working on versioned siblings or `*Common.js` implementations.

### 4.6 Renderer effects — `src/Renderer/Effects/`

| Category                                     | Modules                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Weather and sky                              | `CloudWeatherEffect`, `PokJukWeatherEffect`, `RainWeather`, `SakuraWeatherEffect`, `SnowWeather`, `Sky` |
| Auras and spheres                            | `GroundAura`, `SwirlingAura`, `SpiritSphere`, `WarlockSphere`, `Level99Bubble`, `QuadHorn`              |
| Ground effects                               | `GroundEffect`, `FlatColorTile`, `PropertyGround`, `LPEffect`, `SpiderWeb`, `Tiles`                     |
| Combat effects                               | `Damage`, `MagnumBreak`, `PoisonEffect`, `MagicTarget`, `MagicRing`, `LockOnTarget`                     |
| Visual effects                               | `StrEffect`, `RsmEffect`, `ThreeDEffect`, `TwoDEffect`, `Cylinder`, `Songs`, `Trail`, `WaterfallEffect` |
| Screen effects                               | `PostProcess`                                                                                           |
| Post-processing shaders (`Effects/Shaders/`) | `Blind`, `Bloom`, `CAS`, `Cartoon`, `FXAA`, `GaussianBlur`, `Upsampling`, `VerticalFlip`, `Vibrance`    |

Read `src/Renderer/AGENTS.md` and `docs/reference/renderer/README.md` for renderer-specific changes. Read `docs/how-to/renderer-effects.md` when creating or extending effects.

### 4.7 Renderer entity modules — `src/Renderer/Entity/`

**Composition:**

- `Entity.js` composes `Controls/EntityControl.js` with 16 behavior mixins.
- `Player.js` specializes the player entity.

**Behavior mixins:**

- `EntityAction`
- `EntityAnimations`
- `EntityAttachments`
- `EntityAura`
- `EntityCast`
- `EntityDialog`
- `EntityDisplay`
- `EntityDropEffect`
- `EntityEmblem`
- `EntityLife`
- `EntityOverlay`
- `EntityRender`
- `EntityRoom`
- `EntitySound`
- `EntityState`
- `EntityView`
- `EntityWalk`

**Sprite composition and lifecycle:**

`EntityRender` delegates layered player-sprite capture and composition to `EntityComposer`. The composer caches the combined texture for `SpriteBatch` rendering.

- `EntityManager` releases cached composites when entities are removed and after batch rendering.
- `Renderer` resets composites after WebGL context loss.

Preserve these ownership and cleanup paths when changing entity rendering, caching, or WebGL resource lifecycle behavior.

---

## 5. Behavior References and How-to Guides

These documents are consulted on demand. Read the applicable reference when changing the behavior it covers.

### 5.1 Original Windows client behavior

`docs/reference/README.md` indexes focused notes about non-obvious behavior established by comparison with the original Windows client.

Relevant reference areas include:

- `docs/reference/guild/` — Guild tabs, dialogs, member data, emblems, and related packets.
- `docs/reference/chat/` — Parsing and display of received chat lines.
- `docs/reference/renderer/` — Entity rendering behavior, including mounted body palettes.
- `docs/reference/pet/` — Pet name display in chat.

These references document observed behavior and intentional deviations. They do not replace the code or automatically establish that every behavior is universal across client versions.

### 5.2 Development guides

| Guide                                            | Use when                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `docs/how-to/ui-component-development.md`        | Creating UI components or deduplicating versioned components        |
| `docs/how-to/network-packet-development.md`      | Implementing packet handlers or adding packet versions              |
| `docs/how-to/renderer-effects.md`                | Creating renderer effects                                           |
| `docs/how-to/troubleshooting-and-diagnostics.md` | Investigating runtime problems, diagnostics, or common bug hotspots |

---

## 6. Tests and Validation

Tests are grouped by subsystem under `tests/`:

- `controls/`
- `db/`
- `engine/`
- `loaders/`
- `network/`
- `renderer/`
- `ui/`
- `util/`

Supporting resources:

- `tests/setup.js` — shared test environment setup.
- `tests/fixtures/` — shared test data and fixture documentation.

For a code change:

1. Identify the affected subsystem and its existing tests.
2. Inspect relevant fixtures and test setup before adding new cases.
3. Run focused tests first, then broader validation as appropriate.
4. Report tests that were run, tests that were not run, and any environmental limitations.

Do not claim validation succeeded unless the corresponding command or check actually completed successfully.

---

## 7. Cross-Cutting Gotchas

| Concern                 | Risk / investigation                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `PACKETVER` mismatch    | Client and server packet definitions must align. Compare hexadecimal packets when debugging protocol mismatches.    |
| GRF paths               | Paths may be case-sensitive on Linux. Resolve them relative to the Remote Client or local file list, as applicable. |
| WebGL texture limits    | Hardware and context limits on maximum texture dimensions can cause large sprite sheets to fail.                    |
| Path aliases            | Prefer configured aliases, such as `Utils/BinaryReader.js`, over relative cross-directory imports.                  |
| Global removal          | Audit all consumers, including Web Workers and `applications/`, before replacing globals with ES module imports.    |
| UI migration            | Use `GUIComponent`, Shadow DOM, native DOM APIs, and the documented shared factory patterns.                        |
| Generated configuration | Change the generator or the intended default source rather than patching generated output blindly.                  |
| Entity texture caching  | Preserve composite texture cleanup during entity removal, batch rendering, and WebGL context loss.                  |

---

## 8. Globals Still in Use

| Global                             | Purpose / guidance                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `ROConfig`                         | Runtime configuration object                                                                         |
| `ROBrowser`                        | Existing application global; audit consumers before changing its initialization or removal           |
| `SEEK_CUR`, `SEEK_SET`, `SEEK_END` | `BinaryReader` constants; prefer importing them from `Utils/BinaryReader.js` in new or migrated code |
| `window._OBJ_DRAG_`                | Existing drag-related global; audit all consumers before changing it                                 |

The existence of a global does not imply that new code should depend on it. Prefer the documented module interface when available, while preserving compatibility with existing consumers.

---

## 9. Glossary

| Term          | Meaning                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| **GID**       | Global ID; unique identifier for game entities                                  |
| **GRF**       | Game Resource File; container format for Ragnarok assets                        |
| **PACKETVER** | Packet version; determines network protocol format based on the kRO client date |
| **wsProxy**   | WebSocket proxy for TCP ↔ WebSocket translation                                 |
| **Entity**    | Game object, such as a player, NPC, or monster, with rendering and state        |
| **Effect**    | Visual effect managed by `EffectManager`                                        |
| **kRO**       | Korean Ragnarok Online; reference client for packet versions                    |

---

## 10. Code Review

Read `REVIEW.md` for code review and PR invariants. Follow any additional constraints applicable to the affected subsystem.
=======
## Key Architectural Decisions

- **Entity system uses composition, not inheritance.** 17 mixin modules (16 in `src/Renderer/Entity/` + `Controls/EntityControl.js`) are composed into `Entity.js`. Do not refactor to class inheritance — the mixins are applied dynamically at runtime via `.call(this)`.
- **Packet versioning is date-based.** PACKETVER is configured per server (`packetver`) or auto-detected from the kRO executable PE timestamp. `PacketVersions.js` maps dates to packet definitions (`PACKETVER.addSupport`), and `PacketLength.js` maps dates to packet lengths across 23 packet versions. Changing detection logic in `PacketVerManager.js` can break compatibility.
- **Two socket paths exist by design.** Browser uses `WebSocket.js` (requires wsProxy for TCP↔WS translation). Electron uses `NodeSocket.js` (direct TCP via preload contextBridge). Both implement the same interface for `NetworkManager`.
- **Vendors are frozen.** `src/Vendors/` is excluded from ESLint. Never modify vendored files.
- **UI is 100% GUIComponent.** All 100 UI components use `GUIComponent` (Shadow DOM + native DOM + Custom Elements). Legacy `UIComponent` has been completely removed; `UIManager.addComponent()` strictly requires `GUIComponent` instances. All versioned component siblings have been deduplicated into shared `*Common.js` factories. Primary guide: `docs/UIComponent_to_GUIComponent.md` (L1). For reflex lookup see `docs/UIComponent_to_GUIComponent_Firmware.md` (L2); for historical edge cases see `docs/UIComponent_to_GUIComponent_Scars.md` (L0, archive); for factory pattern rules see `docs/GUIComponent_Version_Dedup_Factory.md`.
- **UI is asset-driven, not CSS-driven.** Window frames, buttons, and backgrounds come from BMP images in GRF files. Components use Custom Elements (`<ui-button>`, `<ui-text>`, `<ui-image>`) or legacy `data-*` attributes processed by `GUIComponent.processDataAttrs()`. CSS is structural/positional only.

## Subsystem Reference

### Network Packet Handling

- **NetworkManager.js**: Connection management, packet dispatch, and packet handler hooking (`Network.hookPacket`)
- **PacketRegister.js**: Maps packet opcode IDs (`0x69`, `0x6a`, etc.) to packet schema constructors in `PacketStructure.js`
- **PacketStructure.js**: Defines AC/ZC/HC/CZ packet schemas and data structures
- **PacketVersions.js**: Packet definition tables keyed by client date (registered via `PACKETVER.addSupport`)
- **PacketLength.js**: Packet length lookup and initialization for each PACKETVER
- **PacketCrypt.js**: Packet encryption/decryption
- **PacketVerManager.js**: Active PACKETVER state manager, packet length coordinator, and character info parser
- **Packets/**: 23 version-specific length files (`packets2003_len_main.js` through `packets2025_len_main.js`)
- **SocketHelpers/**: WebSocket.js (browser), NodeSocket.js (Electron desktop)
- Pattern: Define schema in `PacketStructure.js` → map opcode in `PacketRegister.js` → define lengths in `Packets/` (and outbound tables in `PacketVersions.js` if needed) → hook response handler via `Network.hookPacket(PACKET.<FAMILY>.*, handler)` in the appropriate engine (e.g., `PACKET.ZC.*` for MapEngine, `PACKET.AC.*` / `PACKET.SC.*` for LoginEngine, `PACKET.HC.*` for CharEngine)

### Asset Loaders (`src/Loaders/`)

- **GameFileDecrypt.js**: Decrypt GRF files (DES/RC4)
- **GameFile.js**: GRF file container parsing
- **Action.js**: Parse .act (sprite animation frames)
- **Sprite.js**: Parse .spr (sprite texture/palette data)
- **Ground.js**: Parse .gnd (ground mesh/texture data)
- **Altitude.js**: Parse .gat (map height/collision data)
- **World.js**: Parse .rsw (resource world — models, lights, sounds)
- **Str.js**: Parse .str (visual effect files, compiled .ezv format)
- **Model.js**: Parse .rsm (3D model data)
- **GR2Loader.js**: Parse Granny3D .gr2 skeletal model files via `granny-ro-js` (superseded legacy `GrannyModel.js`)
- **MapLoader.js**: Map loading orchestration
- **Targa.js**: Parse .tga (image format)

### MapEngine Subsystems (`src/Engine/MapEngine/`, 29 files)

- **Main.js**: Core game loop and state management
- **Entity.js**: Main entity controller
- **UIOpen.js**: UI component lifecycle
- **MapState.js**: State persistence
- **Achievement.js, Quest.js, Guild.js, Clan.js**: Progress systems
- **Group.js, Friends.js, PrivateMessage.js, ChatRoom.js**: Social features
- **CashShop.js, Bank.js, Roulette.js**: Commerce systems
- **Homun.js, Pet.js, Mercenary.js**: Companion systems
- **NPC.js, Store.js, Trade.js**: Interaction systems
- **Item.js, Storage.js, Skill.js**: Core gameplay
- **Mail.js, Rodex.js**: Messaging systems
- **Captcha.js, PCGoldTimer.js**: Security/timer systems
- **OffhandWeapon.js**: offhandweapon system

### GUI Components (`src/UI/Components/`, 100 directories)

- All 100 components are built with `GUIComponent` using Shadow DOM + native DOM + Custom Elements (`<ui-button>`, `<ui-text>`, `<ui-image>`)
- `UIManager.addComponent()` requires a `GUIComponent` instance
- `this.ui` proxy on `GUIComponent` provides a minimal jQuery-compatible API for legacy interop; internal component code must use native DOM and Shadow DOM APIs directly (`this.getRoot().querySelector(...)`)
- All 13 multi-version component families have been deduplicated into shared `*Common.js` factories (see `docs/GUIComponent_Version_Dedup_Factory.md`)

**UI Reference & Architecture Docs:**

- **Factory Deduplication** [`docs/GUIComponent_Version_Dedup_Factory.md`](docs/GUIComponent_Version_Dedup_Factory.md): rules and patterns for unified `*Common.js` factories.
- **Custom Elements**: [`docs/CustomElements.md`](docs/CustomElements.md) — reference for `<ui-button>`, `<ui-text>`, `<ui-image>`.

- **Intro.js**: File upload & server selection
- **WinList.js**: Character selection
- **WinLogin.js**: Account authentication
- **Inventory, Equipment, Storage, Bank, CashShop, CartItems**: Item management
- **ChatBox, ChatRoom, ChatRoomCreate, WhisperBox, ChatBoxSettings**: Communication
- **NpcBox, NpcStore, NpcMenu**: NPC interaction
- **SkillList, SkillListMH, SkillDescription, SkillTargetSelection**: Skill system
- **Quest, Mail, Rodex, Trade, Vending, VendingShop, VendingReport**: Game systems
- **Refine, RefineWeaponSelection, Enchant, EnchantGrade, ItemCompare, ItemReform, LaphineSys, LaphineUpg**: Crafting/upgrade
- **Clan, Guild, PartyFriends, EntityRoom**: Social systems
- **MiniMap, WorldMap, Navigation, MapName**: Navigation
- **GrfViewer, ModelViewer, StrViewer, EffectViewer, GrannyModelViewer**: Asset viewers
- **BasicInfo, WinStats, StatusIcons, Sense**: Character info
- **ShortCut, ShortCuts, ShortCutOption**: Hotkey systems
- **Emoticons, Announce, FPS, Escape, Error, WinPopup, WinPrompt**: Misc UI
- **CharCreate, CharSelect, PincodeWindow**: Character management
- **HomunInformations, MercenaryInformations, PetInformations, PetEvolution**: Companion UI
- **CardIllustration, ItemInfo, ItemObtain, ItemPreview, ItemSelection**: Item display
- **MakeArrowSelection, MakeItemSelection, MakeReadBook**: Crafting UI
- **PlayerViewEquip, SwitchEquip, ChangeCart**: Equipment UI
- **GraphicsOption, SoundOption**: Settings
- **Captcha, CheckAttendance, Reputation, SlotMachine, PvPCount, PvPTimer, PCGoldTimer**: Misc systems
- **ContextMenu, EntitySignboard, JoystickUI, MobileUI**: Interface elements

### Renderer Effects (`src/Renderer/Effects/`)

- **Weather**: CloudWeatherEffect, PokJukWeatherEffect, RainWeather, SakuraWeatherEffect, SnowWeather, Sky
- **Auras/Spheres**: GroundAura, SwirlingAura, SpiritSphere, WarlockSphere, Level99Bubble, QuadHorn
- **Ground**: GroundEffect, FlatColorTile, PropertyGround, LPEffect, SpiderWeb, Tiles
- **Combat**: Damage, MagnumBreak, PoisonEffect, MagicTarget, MagicRing, LockOnTarget
- **Visual**: StrEffect, RsmEffect, ThreeDEffect, TwoDEffect, Cylinder, Songs, Trail, WaterfallEffect
- **Screen**: PostProcess
- **Post-Processing Shaders** (`Effects/Shaders/`): Blind, Bloom, CAS, Cartoon, FXAA, GaussianBlur, Upsampling, VerticalFlip, Vibrance

### Renderer Entity Modules (`src/Renderer/Entity/`)

- **Composition**: `Entity.js` composes `Controls/EntityControl.js` with 16 behavior mixins; `Player.js` specializes the player entity.
- **Behavior mixins**: `EntityAction`, `EntityAnimations`, `EntityAttachments`, `EntityAura`, `EntityCast`, `EntityDialog`, `EntityDisplay`, `EntityDropEffect`, `EntityEmblem`, `EntityLife`, `EntityOverlay`, `EntityRender`, `EntityRoom`, `EntitySound`, `EntityState`, `EntityView`, `EntityWalk`.
- **Sprite composition**: `EntityRender` delegates layered player-sprite capture and composition to `EntityComposer`; the composer caches the combined texture for `SpriteBatch` rendering. `EntityManager` releases cached composites when entities are removed and after batch rendering, while `Renderer` resets them after WebGL context loss.

### Behavior Reference Documentation

Read these documents on demand when a task touches the behavior or workflow they cover:

- **Behavior references** (`docs/reference/`):
    - **README.md**: Index of focused notes explaining non-obvious behavior established by comparison with the original Windows client
    - **guild/**: Guild window tabs, dialogs, member data, emblems, and related packets
    - **chat/**: Parsing and display of received chat lines; chat tabs (click, rename, filters of a new tab, All on)
    - **renderer/**: Entity rendering behavior, including mounted body palettes
    - **pet/**: Pet name display in chat
    - Read applicable notes before changing behavior they cover; they document observed behavior and intentional deviations, not a replacement for the code
- **How-to guides** (`docs/how-to/`):
    - [UI component development](docs/how-to/ui-component-development.md): creating components and deduplicating versioned components
    - [Network packet development](docs/how-to/network-packet-development.md): implementing packet handlers and adding packet versions
    - [Renderer effects](docs/how-to/renderer-effects.md): creating renderer effects
    - [Troubleshooting and diagnostics](docs/how-to/troubleshooting-and-diagnostics.md): troubleshooting, runtime diagnostics, and common bug hotspots

### Tests (`tests/`)

- Tests are grouped by subsystem: `controls/`, `db/`, `engine/`, `loaders/`, `network/`, `renderer/`, `ui/`, and `util/`
- **setup.js**: Shared test environment setup
- **fixtures/**: Shared test data and fixture documentation

### Globals Still in Use

- **ROConfig**: Runtime configuration object
- **SEEK_CUR, SEEK_SET, SEEK_END**: BinaryReader constants (prefer importing from `Utils/BinaryReader.js`)

## Important Gotchas

- **PACKETVER mismatch**: Client and server packet definitions must align; debug by comparing hex packets
- **GRF paths**: Case-sensitive on Linux; relative to Remote Client or local file list
- **Texture limits**: WebGL has max texture dimensions; large sprite sheets can fail
- **Path aliases**: Always use aliases (e.g., `'Utils/BinaryReader.js'`) instead of relative paths
- **Global removal requires audit**: Before removing a global assignment (e.g., `SEEK_CUR`), verify all consumers including Web Workers have been updated to use ES6 imports

## Glossary

- **GID**: Global ID — unique identifier for game entities
- **GRF**: Game Resource File — container format for Ragnarok assets
- **PACKETVER**: Packet version — determines network protocol format based on kRO client date
- **wsProxy**: WebSocket proxy for TCP ↔ WebSocket translation
- **Entity**: Game object (player, NPC, monster) with rendering and state
- **Effect**: Visual effect (weather, auras, particles) managed by EffectManager
- **kRO**: Korean Ragnarok Online — reference client for packet versions

