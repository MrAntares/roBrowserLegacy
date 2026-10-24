# AGENTS.md

Repository instructions for AI coding agents working on **roBrowserLegacy**, a browser-based Ragnarok Online client built with ES modules and WebGL. The project can run as a web client, a Progressive Web App (PWA), and an Electron desktop application.

**Read this file before changing code.** If a task touches an area covered by a linked guide or behavior reference, read that document before editing the area. Treat the codebase as the source of truth for current file names and implementation details; approximate counts and examples in this document may become stale.

---

## 1. Operating Rules for Agents

### Before editing

1. Read this file and any task-specific instructions already present in the repository.
2. Inspect the current repository state, relevant source files, callers/consumers, tests, and configuration. Do not assume the current implementation still matches a summary in documentation.
3. Search for existing patterns in the same subsystem before introducing a new abstraction or convention.
4. Read linked design documents and `docs/reference/` notes that apply to the behavior being changed.
5. Identify the intended behavior, compatibility constraints, affected platforms, and tests that can verify the change.

### While editing

- Make the smallest focused change that fully solves the task.
- Preserve existing public interfaces and architectural invariants unless the user explicitly asks to change them.
- Follow established patterns in the affected subsystem rather than introducing a parallel implementation.
- Avoid unrelated refactors, formatting churn, and speculative changes.
- Do not infer protocol behavior from names alone. Trace the packet definition, version mapping, handler, and relevant tests.
- Do not claim a behavior is verified unless it was checked in code, by a test, or by a runtime/build command.

### Before finishing

1. Run `npm run lint:fix && npm run format`.
2. Run `npm run ci`.
3. Run `npm test`.
4. If build-sensitive code changed (for example, entry points, aliases, workers, or build configuration), run the relevant `npm run build*` target.
5. Review the final diff for unintended changes, generated files, secrets, and unrelated formatting.
6. Report what changed, the tests/build commands run, and any checks that could not be completed. Never report a command as passing unless it actually completed successfully.

If a command cannot run because of the environment or a known project limitation, state that clearly and continue with the strongest relevant checks available.

---

## 2. Quick Reference

### Common commands

```bash
npm run dev                  # Vite development server (demo.html)
npm test                     # Vitest suite (tests/**/*.test.js)
npm run lint                 # ESLint check
npm run lint:fix             # ESLint auto-fix
npm run lint:check           # ESLint with a zero-warning threshold
npm run format               # Prettier write ("src/**/*.js")
npm run format:check         # Prettier check ("src/**/*.js")
npm run ci                   # lint + format:check; used by CI
npm run build                # Full web build via applications/tools/builder-web.mjs (all apps + PWA)
npm run build:online         # Full online client (Online.js)
npm run build:all            # All seven apps: Online + six viewers
npm run build:pwa            # PWA build (Online + Thread + manifest)
npm run build:threadhandler  # Build ThreadEventHandler.js separately as a Web Worker
npm run electron              # Run Electron app
npm run electron:dev          # Run Electron with DevTools
npm run electron:build        # Package Electron app into dist/Desktop/
```

- Node.js requirement: `>=22`, pinned in `.nvmrc`; CI currently uses Node 24.
- Check `package.json` for the authoritative, current script list.
- Web build output: `dist/Web/`.
- Electron build output: `dist/Desktop/`.

---

## 3. Non-Negotiable Constraints

Never violate these rules unless the user explicitly directs a change to the relevant constraint. If an explicit request would invalidate a compatibility invariant, explain the risk and inspect all affected consumers before proceeding.

- **Do not modify `src/Vendors/`.** This directory is frozen and excluded from ESLint.
- **Do not convert the Entity mixin/composition system into class inheritance.** Mixins are applied dynamically with `.call(this)`.
- **Do not change PACKETVER detection logic in `src/Network/PacketVerManager.js` without explicit instruction.** It can break compatibility across kRO client versions.
- **Do not add legacy `UIComponent` code.** The legacy system has been removed. `UIManager.addComponent()` accepts `GUIComponent` instances.
- **Use the configured path aliases for imports rather than relative paths.** Include the `.js` extension. Verify aliases in the current Vite/build configuration if in doubt.
- **Do not remove an existing global assignment** (for example, `SEEK_CUR`) until every consumer has been audited, including Web Worker code.
- **Do not hand-edit generated defaults in `Config.js`** unless the task specifically requires changing the generator or its output.
- Do not introduce `eval`, implied eval, `new Function`, or `with`; lint rules reject these patterns.

---

## 4. Project Overview

roBrowserLegacy is a web-based Ragnarok Online client. It uses ES modules, Vite plus a custom build tool, and WebGL. It can run in a browser, as a PWA, and as an Electron desktop app.

### Key Statistics

- **14 subsystems** in `src/` (App, Audio, Controls, Core, DB, Engine, Loaders, Network, Plugins, Preferences, Renderer, UI, Utils, Vendors)
- **7 application entry points** in `src/App/` (1 game client: `Online.js` + 6 viewers: `EffectViewer.js`, `GrannyModelViewer.js`, `GrfViewer.js`, `MapViewer.js`, `ModelViewer.js`, `StrViewer.js`; plus `PreLoader.js` utility and `ThreadEventHandler.js` Web Worker in `src/Core/`)
- **100 UI Components** in `src/UI/Components/` (all migrated to `GUIComponent`)
- **42 Renderer Effect modules** (33 effect JS files in `src/Renderer/Effects/` + 9 post-processing shaders in `src/Renderer/Effects/Shaders/`, plus companion GLSL shaders)
- **19 Entity modules** in `src/Renderer/Entity/` (`Entity.js`, `Player.js`, `EntityOverlay.js`, and 16 entity mixins; 17 mixins composed dynamically into `Entity` with `Controls/EntityControl.js`)
- **29 MapEngine subsystems** in `src/Engine/MapEngine/` (including `OffhandWeapon.js`)
- **23 packet versions** supported (kRO 2003–2025) in `src/Network/Packets/`

### Application entry points

`src/App/` contains the main client and viewer entry points:

- `Online.js` — online game client.
- `EffectViewer.js`, `GrannyModelViewer.js`, `GrfViewer.js`, `MapViewer.js`, `ModelViewer.js`, and `StrViewer.js` — six viewers.
- `PreLoader.js` — preload utility.

`ThreadEventHandler.js`, the Web Worker entry point, is under `src/Core/`.

Subsystem and component counts are approximate and will drift. Inspect the current tree instead of relying on counts in old notes.

### External dependencies and infrastructure

- **wsProxy** — server-side TCP-to-WebSocket translation required by the browser connection path.
- **Remote Client (PHP/JS)** — HTTP service that extracts and serves assets from GRF files.
- **Game server** — compatible with rAthena or Hercules.
- **kRO client files** — GRF assets and the executable; the executable can be used for PACKETVER auto-detection.

---

## 5. Architecture and Data Flow

### Module system and aliases

Source code uses ES module `import`/`export`. Vite bundles the application, alongside the custom builder at `applications/tools/builder-web.mjs`. `src/` is the source base, and directory names correspond to module aliases.

| Alias         | Directory          |
| ------------- | ------------------ |
| `App`         | `src/App/`         |
| `Audio`       | `src/Audio/`       |
| `Controls`    | `src/Controls/`    |
| `Core`        | `src/Core/`        |
| `DB`          | `src/DB/`          |
| `Engine`      | `src/Engine/`      |
| `Loaders`     | `src/Loaders/`     |
| `Network`     | `src/Network/`     |
| `Plugins`     | `src/Plugins/`     |
| `Preferences` | `src/Preferences/` |
| `Renderer`    | `src/Renderer/`    |
| `UI`          | `src/UI/`          |
| `Utils`       | `src/Utils/`       |
| `Vendors`     | `src/Vendors/`     |

Use aliases and include `.js` in imports:

```javascript
import { BinaryReader } from 'Utils/BinaryReader.js';
import Configs from 'Core/Configs.js';
import Sprite from 'Loaders/Sprite.js';
```

Do not assume an alias exists just because a directory exists; check the active Vite/build configuration if you add or change aliases.

### Subsystems

| Layer       | Path               | Responsibility                                                                                                                                             |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine      | `src/Engine/`      | GameEngine orchestration, LoginEngine, CharEngine, MapEngine, session storage, replay, and state.                                                          |
| Network     | `src/Network/`     | Packet registration and structures, encryption, versions, lengths, version detection, network management, and socket helpers.                              |
| Loaders     | `src/Loaders/`     | GRF containers and game asset parsing.                                                                                                                     |
| DB          | `src/DB/`          | DBManager and game data for effects, items, jobs, maps, monsters, pets, skills, status, emotions, and town information.                                    |
| Renderer    | `src/Renderer/`    | WebGL rendering, map/entity/effect managers, screen effects, signboards, cameras, and sprite rendering.                                                    |
| UI          | `src/UI/`          | UIManager, UIVersionManager, GUIComponent, custom elements, cursor management, and UI components.                                                          |
| Controls    | `src/Controls/`    | Entity/map controls, keyboard and mouse handling, commands, battle mode, and screenshots.                                                                  |
| Audio       | `src/Audio/`       | Background music and sound management.                                                                                                                     |
| Core        | `src/Core/`        | Client, configuration/context, events, file management/filesystem, memory, mobile support, threads, AI driver, and Lua module loading.                     |
| Preferences | `src/Preferences/` | Audio, graphics, controls, UI, camera, map, and shortcut settings.                                                                                         |
| Plugins     | `src/Plugins/`     | PluginManager.                                                                                                                                             |
| Utils       | `src/Utils/`       | Binary readers/writers, data structures, compression, pathfinding, WebGL utilities, textures, CRC32, codepages, logging, queues, and supporting utilities. |

Notable implementation: `src/DB/Skills/SkillTreeMerge.js` merges the skill layouts loaded from client `skilltreeview.lub` files with the built-in skill tree.

#### Subsystem module breakdown

1. **Engine** (`src/Engine/`): GameEngine (orchestrator), LoginEngine (auth), CharEngine (character), MapEngine (28 subsystems), SessionStorage, Replay (ReplayParser, ReplayPlayer, ReplaySocket, ReplayTypes), State
2. **Network** (`src/Network/`): PacketRegister, PacketStructure, PacketCrypt, PacketVersions.js, PacketVerManager, PacketLength, NetworkManager, SocketHelpers (WebSocket/NodeSocket)
3. **Loaders** (`src/Loaders/`): GameFileDecrypt, GameFile, Sprite, Action, Ground (.gnd), Altitude (.gat), World (.rsw), Str (.str effects), Model, GR2Loader (.gr2 3D skeletal models via granny-ro-js), MapLoader, Targa, /wasm loader files
4. **Database** (`src/DB/`): DBManager + data subdirectories (Effects, Items, Jobs, Map, Monsters, Pets, Skills, Status) + Emotions, TownInfo; `Skills/SkillTreeMerge.js` merges client `skilltreeview.lub` layouts with the built-in skill tree
5. **Renderer** (`src/Renderer/`): Renderer.js (WebGL context), MapRenderer, EntityManager, EffectManager, ScreenEffectManager, SignboardManager, Camera, SpriteRenderer, SpriteBatch (instanced entity sprite draws), SpriteAtlas (shared sprite frame and palette atlas for SpriteBatch), ItemObject + subdirectories (Effects, Entity, GR2, Map)
6. **UI** (`src/UI/`): UIManager, UIVersionManager, GUIComponent (base class, Shadow DOM), Custom Elements (`src/UI/Elements/`), CursorManager, Scrollbar, Background, TouchDrag, ClampToViewport, WhenDrawn (runs a callback the first time an element is drawn; window art waits for it), 100+ component directories
7. **Controls** (`src/Controls/`): EntityControl, MapControl, KeyEventHandler, MouseEventHandler, ProcessCommand, BattleMode, ScreenShot
8. **Audio** (`src/Audio/`): BGM.js, SoundManager.js
9. **Core** (`src/Core/`): Client, Configs, Context, Events, FileManager, FileSystem, MemoryItem, MemoryManager, Mobile, Preferences, Thread, ThreadEventHandler, AIDriver, LuaModuleLoader, PerfProbe (opt-in frame/draw-call/map-load probe, `perfProbe: true`)
10. **Preferences** (`src/Preferences/`): Audio, Graphics, Controls, UI, Camera, Map, ShortCutControls
11. **Plugins** (`src/Plugins/`): PluginManager.js
12. **Utils** (`src/Utils/`): BinaryReader, BinaryWriter, Struct, Inflate, PathFinding, WebGL, Texture, Executable, CRC32, CodepageManager, ConsoleManager, HTMLEntity, Queue, Base62, colors, partyColors, gl-matrix

### Runtime data flow

1. **Initialization:** GameEngine loads configuration; Client loads GRFs and the executable; PACKETVER is taken from configuration or auto-detected from the executable's PE timestamp.
2. **Login:** LoginEngine uses NetworkManager to connect. The browser path uses WebSocket; Electron uses NodeSocket and direct TCP through the preload `contextBridge`. Authentication uses versioned packets.
3. **Map entry:** MapEngine loads map and entity data; Renderer displays it; Controls enable player input; 29 MapEngine subsystems manage live game state.
4. **Runtime:** Input handlers call ProcessCommand; NetworkManager sends packets; packet handlers update state; EntityManager and Renderer update and draw the result.

### Architectural invariants

#### Entity composition

The Entity system is composition-based, not inheritance-based. Approximately 17 mixins (16 under `src/Renderer/Entity/` plus `Controls/EntityControl.js`) are applied dynamically to `Entity.js` with `.call(this)`.

- Add or modify behavior through the appropriate mixin or composition path.
- Do not replace this with subclasses or move mixin behavior into a new inheritance tree.
- Before changing Entity state, inspect creation/removal flows and map transitions; these are known edge-case areas.

#### Packet versioning

- `PacketVersions.js` maps packet definitions by date through `PACKETVER.addSupport`.
- `PacketLength.js` maps packet lengths through date-specific files under `src/Network/Packets/`.
- PACKETVER comes from server configuration (`packetver`) or executable auto-detection.
- Protocol behavior can vary by client date. Verify all relevant version tables and handlers instead of assuming one packet layout applies universally.

#### Socket implementations

The browser uses `WebSocket.js` (`src/Network/SocketHelpers/WebSocket.js`) and requires wsProxy. Electron uses `NodeSocket.js` (`src/Network/SocketHelpers/NodeSocket.js`), which communicates over TCP through the preload `contextBridge`. Both implementations must satisfy the same interface expected by NetworkManager. Keep them behaviorally compatible when changing the shared socket contract.

#### UI system

- The current UI system uses `GUIComponent`, Shadow DOM, native DOM, and custom elements.
- Do not reintroduce the removed `UIComponent` implementation.
- Multi-version component families are deduplicated through shared `*Common.js` factories where applicable.
- The UI is asset-driven: window frames, buttons, and backgrounds generally come from BMP images inside GRF files. CSS should primarily define structure, dimensions, and positioning.
- Prefer `<ui-button>`, `<ui-text>`, and `<ui-image>` over legacy `data-*` attributes handled by `GUIComponent.processDataAttrs()`.

#### Configuration and globals

- `Config.js` contains generated default settings; `Config.local.js` is an optional local override and is not committed.
- `ROConfig` is the merged runtime configuration object.
- Existing globals may still be consumed by modules and Web Workers. Audit all consumers before changing global behavior. Prefer explicit imports where appropriate, but do not remove a global assignment without a full consumer audit.

---

## 6. Asset Loader Reference

Files in `src/Loaders/` include the following formats and responsibilities. Confirm the current source before editing a loader.

| File                 | Format / responsibility                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `GameFileDecrypt.js` | GRF decryption (DES/RC4).                                                          |
| `GameFile.js`        | GRF container parsing.                                                             |
| `Action.js`          | `.act` sprite animation frames.                                                    |
| `Sprite.js`          | `.spr` sprite texture and palette data.                                            |
| `Ground.js`          | `.gnd` ground mesh and textures.                                                   |
| `Altitude.js`        | `.gat` height and collision data.                                                  |
| `World.js`           | `.rsw` resource world, including models, lights, and sounds.                       |
| `Str.js`             | `.str` visual effects, including compiled `.ezv` assets.                           |
| `Model.js`           | `.rsm` 3D models.                                                                  |
| `GR2Loader.js`       | `.gr2` Granny3D skeletal models through `granny-ro-js`; replaces `GrannyModel.js`. |
| `MapLoader.js`       | Map-loading orchestration.                                                         |
| `Targa.js`           | `.tga` images.                                                                     |

When changing asset loading, consider the full path from GRF/file access through parsing, caching, and the consuming renderer or UI. Include relevant malformed/missing-asset cases in tests where feasible.

---

## 7. MapEngine, Renderer, and UI Areas

These lists are orientation aids, not exhaustive inventories. Verify the source tree before editing.

### MapEngine (`src/Engine/MapEngine/`, 29 files)

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

### GUI Components (`src/UI/Components/`, 100 directories)

- All 100 components are built with `GUIComponent` using Shadow DOM + native DOM + Custom Elements (`<ui-button>`, `<ui-text>`, `<ui-image>`)
- `UIManager.addComponent()` requires a `GUIComponent` instance
- `this.ui` proxy on `GUIComponent` provides a minimal jQuery-compatible API for legacy interop; internal component code must use native DOM and Shadow DOM APIs directly (`this.getRoot().querySelector(...)`)
- All 13 multi-version component families have been deduplicated into shared `*Common.js` factories (see `docs/GUIComponent_Version_Dedup_Factory.md`)

    > **UI Reference & Architecture Docs:**
    >
    > - **L1 — Primary** [`docs/UIComponent_to_GUIComponent.md`](docs/UIComponent_to_GUIComponent.md): consolidated operational memory (invariants, rules, failure matrix, custom elements). **Start here.**
    > - **L2 — Reflex** [`docs/UIComponent_to_GUIComponent_Firmware.md`](docs/UIComponent_to_GUIComponent_Firmware.md): compressed decision matrix for rapid lookup.
    > - **L0 — Archive** [`docs/UIComponent_to_GUIComponent_Scars.md`](docs/UIComponent_to_GUIComponent_Scars.md): full historical guide, postmortems, per-component migration reference.
    > - **Factory Deduplication** [`docs/GUIComponent_Version_Dedup_Factory.md`](docs/GUIComponent_Version_Dedup_Factory.md): rules and patterns for unified `*Common.js` factories.
    > - **Custom Elements**: [`docs/CustomElements.md`](docs/CustomElements.md) — reference for `<ui-button>`, `<ui-text>`, `<ui-image>`.
    > - **Historical Issue:** [Issue #1140](https://github.com/MrAntares/roBrowserLegacy/issues/1140) tracked the completed UIComponent→GUIComponent migration.

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

### Behavior Reference Notes (`docs/reference/`)

- **README.md**: Index of focused notes explaining non-obvious behavior established by comparison with the original Windows client
- **guild/**: Guild window tabs, dialogs, member data, emblems, and related packets
- **chat/**: Parsing and display of received chat lines
- **renderer/**: Entity rendering behavior, including mounted body palettes
- **pet/**: Pet name display in chat
- Read applicable notes before changing behavior they cover; they document observed behavior and intentional deviations, not a replacement for the code

### Tests (`tests/`)

- Tests are grouped by subsystem: `controls/`, `db/`, `engine/`, `loaders/`, `network/`, `renderer/`, `ui/`, and `util/`
- **setup.js**: Shared test environment setup
- **fixtures/**: Shared test data and fixture documentation

## Code Conventions

### Style Rules

Formatting is handled by **Prettier** (defaults). ESLint extends `eslint:recommended` and `prettier`.

### Style requirements

- Use single quotes where possible (`avoidEscape: true`).
- Use semicolons.
- Do not use trailing commas (`comma-dangle: never`).
- Always use braces for control-flow bodies (`curly: 'all'`).
- Prefer `const`; use `let` when reassignment is required. Never use `var`.
- Do not use `eval`, implied eval, `new Function`, or `with`.
- Unused variables are warnings; prefix intentionally unused variables with `_` where appropriate.

### Naming

- Private/internal variables: `_prefix` (for example, `_sockets`, `_currentSocket`).
- Constants in DB/constant files: `UPPER_SNAKE_CASE`.
- Classes and constructors: `PascalCase`.
- Functions and methods: `camelCase`.

### Preferred JavaScript

For new code, prefer arrow functions, template literals, `async`/`await`, ES classes, destructuring, spread/rest, native Promises, `for...of`, and default parameters.

When touching legacy patterns, modernize the code you are already changing when doing so is safe and behavior-preserving. Common replacements include:

| Older pattern                              | Preferred pattern                                                                |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| Callback `function(a, b) { ... }`          | `(a, b) => { ... }` when lexical `this` is correct.                              |
| String concatenation with variables        | Template literals.                                                               |
| Constructor function and prototype methods | ES class and instance methods.                                                   |
| Object-literal singleton methods           | Static class methods when the conversion is safe and consistent with the module. |
| `var x = obj.x \|\| defaultVal`            | Destructuring defaults or explicit defaulting where semantics are preserved.     |
| Global assignment consumed by modules      | Explicit ES imports where feasible and after auditing all consumers.             |

**Important `this` caveat:** arrow functions capture `this` lexically. Before converting jQuery callbacks, handlers, or prototype methods, verify whether the function depends on dynamic `this`. Keep a regular function where dynamic binding is required, or convert the entire relevant module consistently.

Example of an object-literal singleton converted to a static class:

```javascript
// Before
const FileManager = {};
FileManager.remoteClient = '';
FileManager.load = function load(path) {
	/* ... */
};
export default FileManager;

// After
class FileManager {
	static remoteClient = '';

	static load(path) {
		/* ... */
	}
}

export default FileManager;
```

Do **not** perform sweeping modernization on files unrelated to the task. Preserve behavior and keep the diff focused.

### Globals still in use

- `ROConfig` — runtime configuration object.
- `ROBrowser` — global constructor/namespace used when embedding or orchestrating viewers (e.g. in `applications/api/api.js`, `demo.html`, and `GrfViewer.js`).
- `SEEK_CUR`, `SEEK_SET`, `SEEK_END` — BinaryReader constants. Prefer importing these from `Utils/BinaryReader.js` where appropriate, but audit existing consumers before removing global exposure.

---

## 9. Configuration Rules

- `Config.js` is generated and contains default settings. Do not edit generated defaults by hand unless the task requires it.
- `Config.local.js` provides optional local overrides and is not committed.
- `ROConfig` is the merged configuration object at runtime.
- Important options include `servers` (address/port/version), `packetver`, `packetDump`, `skipIntro`, `remoteClient` (asset-server URL), `plugins`, `aura`, `autoLogin`, `development`, and `enableConsole`.

When changing configuration, verify where the setting is defined, merged, consumed, and exposed in supported app targets. Avoid leaking local configuration into committed changes.

---

## 10. Task Playbooks

### Add a UI component

**Read first:**

- `docs/UIComponent_to_GUIComponent.md` — primary guide.
- `docs/UIComponent_to_GUIComponent_Firmware.md` — quick reference.
- `docs/UIComponent_to_GUIComponent_Scars.md` — historical migration edge cases.
- `docs/CustomElements.md` — custom-element reference.
- `docs/Scrollbar.md` — custom scrollbar reference (`data-scrollbar-skin`).

Then:

1. Create `src/UI/Components/NewComponent/` with `NewComponent.js`, `NewComponent.html`, and `NewComponent.css`.
2. Instantiate `new GUIComponent('Name', cssText)` and assign `Component.render = () => htmlText` following neighboring components.
3. Use `<ui-button>`, `<ui-text>`, and `<ui-image>` as appropriate; do not reintroduce legacy `data-*`-based UI patterns.
4. Put dimensions and positioning on `:host`; put inner layout rules on `#Name`.
5. Use native DOM and Shadow DOM APIs inside the component, such as `this.getRoot().querySelector(...)`. The `this.ui` jQuery-like proxy exists for legacy interop only; do not use it for new internal code.
6. Register the component with `UIManager.addComponent(Component)`.
7. Add a shortcut in `src/Controls/ProcessCommand.js` only if the component needs a keyboard shortcut.
8. Add or update tests where practical and verify the relevant UI/version lifecycle.

### Implement a packet handler

1. Define or update the packet schema in `src/Network/PacketStructure.js`.
2. Map the opcode in `src/Network/PacketRegister.js`.
3. Add or update packet lengths in `src/Network/Packets/packetsYYYY_len_main.js`.
4. For outbound `CZ` packets, add the appropriate date-specific definitions in `PacketVersions.js` as required.
5. Implement the handler in the correct engine and register it through `Network.hookPacket(PACKET.<FAMILY>.*, handler)`:
    - `PACKET.ZC.*` → MapEngine.
    - `PACKET.AC.*` / `PACKET.SC.*` → LoginEngine.
    - `PACKET.HC.*` → CharEngine.
6. Trace all relevant packet-version variations; do not assume the new schema applies to every date.
7. Test with `packetDump: true` and add/update tests for packet parsing or handler behavior.

### Add a packet version

1. Create `src/Network/Packets/packetsYYYY_len_main.js` (for example, `packets2026_len_main.js`) with lengths for all known packets required by the project.
2. Update imports and the supported year range in `PacketLength.js`.
3. Update `PacketVerManager.js` where required, without changing existing detection behavior unless explicitly requested.
4. Review `PacketVersions.js` and other date-specific structures for relevant changes.
5. Test against a server using the matching PACKETVER when possible. If runtime validation is unavailable, state that limitation.

### Create a renderer effect

1. Create the effect module under `src/Renderer/Effects/`.
2. Implement `update()` and `render()` consistently with neighboring effects.
3. Register the effect with `EffectManager`.
4. Consider frame-loop cost, allocation frequency, cleanup, and lifecycle behavior.
5. Use object pooling for frequently spawned objects where appropriate.
6. Validate both visual behavior and performance-sensitive paths where possible.

### Deduplicate versioned UI components into a shared factory

**Mandatory:** read `docs/GUIComponent_Version_Dedup_Factory.md` before making changes. It contains invariants that must be preserved.

Existing unified families include `BasicInfo`, `CharCreate`, `CharSelect`, `Equipment`, `Inventory`, `MiniMap`, `PartyFriends`, `PlayerViewEquip`, `Quest`, `SkillList`, `Storage`, `WinLogin`, and `WinStats`.

For a new multi-version component family:

1. Create `ComponentNameCommon.js` in the component directory.
2. Export a factory such as `createComponentName({ name, htmlText, cssText, ...flags })`.
3. Move shared logic into the factory and represent real version differences through explicit parameters/flags.
4. Keep each version-specific module to the imports and factory call required for its version.
5. Preserve version-specific behavior and verify the relevant UIVersionManager/PACKETVER assumptions. Do not deduplicate code merely to reduce file count if behavior differs.
6. Add/update tests and update the relevant documentation if the pattern or migration rule changes.

### Change a loader or DB mapping

**Read first:** `docs/Encoding.md` — critical reference for character sets (e.g. `windows-1252` for GRF filesystem lookups vs client codepages for user-facing text).

1. Trace the data source, parsing/mapping code, caching layer, and all important consumers.
2. Check whether the format or mapping varies by client version or asset source.
3. Add or update tests using fixtures when possible, especially for malformed, missing, and boundary-case data.
4. Preserve compatibility with callers and avoid changing unrelated file formats or tables.

### Work with Lua scripting or Wasmoon VM

**Read first:** `docs/LuaModuleResolution.md` — reference for `LuaModuleLoader`, VFS/cache resolution pipeline, `MEMFS` mounting, and asynchronous candidate searches.

---

## 11. Testing and Validation

### Test framework and locations

- Test runner: Vitest.
- Tests live under `tests/**/*.test.js`.
- Tests are grouped by subsystem: `controls/`, `core/`, `db/`, `engine/`, `loaders/`, `network/`, `renderer/`, `ui/`, and `util/`.
- `tests/setup.js` contains shared environment setup.
- `tests/fixtures/` contains shared test data and fixture documentation.
- Run one test file with `npx vitest run tests/<area>/<file>.test.js`.

### Testing expectations

- Add or update tests when behavior changes, especially for loaders, network packet parsing/version maps, DB mappings, renderer behavior, and UI lifecycle.
- Prefer testing observable behavior and compatibility boundaries instead of mirroring implementation details unnecessarily.
- Do not weaken or rewrite tests simply to make a failing change pass. Confirm the intended behavior against implementation, references, and protocol/version requirements first.
- If a test cannot run or an environment dependency is missing, report it explicitly and run other relevant checks.
- For entry points, aliases, workers, or build configuration, run the corresponding build target in addition to tests.

### Minimum completion checklist

```bash
npm run lint:fix && npm run format
npm run ci
npm test
```

Run the relevant build target when build-sensitive code changes. Review `git diff` before completion and check that only intended files changed.

---

## 12. Behavior Reference Documentation

`docs/reference/` records non-obvious behaviors established by comparison with the original Windows client. These notes describe observed behavior and intentional deviations; they supplement, but do not replace, reading the implementation.

**Read applicable notes before changing behavior they cover.** Update the relevant note when a change alters documented behavior.

- `docs/reference/README.md` — index.
- `docs/reference/guild/` — guild tabs, dialogs, member data, emblems, and packets.
- `docs/reference/chat/` — parsing and displaying received chat lines.
- `docs/reference/renderer/` — renderer behavior, including mounted body palettes.
- `docs/reference/pet/` — pet-name display in chat.

Search the full `docs/reference/` tree for additional notes relevant to the task.

---

## 13. Debugging and Troubleshooting

### Enable logging

- Set `development: true` in `ROConfig` to enable development output.
- Set `enableConsole: true` to enable console output without full development mode.
- Set `perfProbe: true` to measure frame times, draw calls, map loads, and startup (`src/Core/PerfProbe.js`); inspect in-game via `/perf`.
- `ConsoleManager` (`src/Utils/ConsoleManager.js`) silences console output in production. If logs are missing, check these flags before assuming the code path did not execute.

### Network and packet diagnostics

- Set `packetDump: true` to log packets and compare their bytes with `PacketStructure.js`.
- `PacketVerManager` logs `[PACKETVER] Set packet version <date>` when PACKETVER is set. Check this early when investigating protocol errors.
- Verify the client PACKETVER against the server and inspect the relevant date-specific packet definitions and length table.

### Symptom-to-first-check reference

| Symptom             | First checks                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Missing assets      | GRF loading in `Client.js`, Remote Client response, asset paths, filename case.                          |
| Packet errors       | PACKETVER/client-server compatibility, `PacketVersions.js`, packet lengths, and `packetDump`.            |
| Rendering issues    | WebGL support (OpenGL ES 2.0 required) and renderer context initialization in `Renderer.js`.             |
| Build errors        | Clear `dist/` if stale output is suspected and confirm the relevant entry point exists under `src/App/`. |
| Connection failures | wsProxy configuration for the browser, Electron socket path, and firewall/network conditions.            |
| Module not found    | Alias configuration in `vite.config.js`/custom builder and the `.js` extension.                          |
| No console output   | `development`, `enableConsole`, and `ConsoleManager` behavior.                                           |

### Known bug-prone areas

- **Entity state:** `src/Engine/MapEngine/Entity.js` manages unit spawning, status updates, actions, and removal based on server packets; contains TODOs and edge cases around attack/damage miss, status handling, floor footprints, cast bar progress, and NPC minimap mark cleanup.
- **Effects:** `src/Renderer/Effects/Damage.js` and `src/Renderer/Effects/Sky.js` include particle class management TODOs.
- **DB tables:** `src/DB/DBManager.js` contains 11 TODOs and incomplete mappings for newer kRO content.
- **Packet handling:** packet structures and lengths can change between kRO client dates.

Treat these as areas that merit extra investigation, not as proof that every issue in them has the same cause.

### Cross-platform considerations

- In browsers, open DevTools and verify whether production console filtering is active.
- In Electron, errors may appear in Electron DevTools rather than the terminal.
- GRF paths are case-sensitive on Linux and may appear to work on Windows despite incorrect case.
- WebGL has maximum texture dimensions; oversized sprite sheets can fail even when the file parses correctly.

---

## 14. Change and Pull Request Guidelines

- Keep changes focused and avoid unrelated reformatting.
- Run `npm run ci` and `npm test`; both should pass before a pull request.
- Document user-visible behavior changes and identify the PACKETVER values and platforms tested (browser, PWA, Electron), where relevant.
- If a change affects behavior covered by `docs/reference/`, update the corresponding note.
- If UI migration rules or factory patterns change, update the relevant `docs/` guide.
- Summarize important implementation decisions, validation performed, and known limitations. Clearly distinguish automated test results from manual/runtime checks.

---

## 15. Glossary

- **GID** — Global ID; unique identifier for a game entity.
- **GRF** — Game Resource File; container format for Ragnarok Online assets.
- **PACKETVER** — Packet version; selects the network protocol format associated with a kRO client date.
- **wsProxy** — Server-side proxy that translates TCP to WebSocket for browser networking.
- **Entity** — Game object such as the player, an NPC, or a monster, including its state and rendering behavior.
- **Effect** — Visual behavior such as weather, auras, and particles managed by `EffectManager`.
- **kRO** — Korean Ragnarok Online; the reference client for packet versions.
