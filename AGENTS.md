# AGENTS.md

Global repository instructions for AI coding agents working on **roBrowserLegacy**, a browser-based Ragnarok Online client built with ES modules, Vite + a custom builder (`applications/tools/builder-web.mjs`), and WebGL (OpenGL ES 2.0). Runs in Web Browsers, as a PWA, and as an Electron desktop app.

---

## 1. Documentation Routing (Read Before Editing)

Consult **only** the scoped instructions and reference documents relevant to your task. Mandatory references are prerequisites, not optional suggestions.

| Task / Subsystem                                                        | Required Documentation                                                                                                                                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI components, Shadow DOM, custom elements, scrollbars**              | [`src/UI/AGENTS.md`](src/UI/AGENTS.md) → [`docs/UIComponent_to_GUIComponent.md`](docs/UIComponent_to_GUIComponent.md), [`docs/CustomElements.md`](docs/CustomElements.md), [`docs/Scrollbar.md`](docs/Scrollbar.md) |
| **Versioned UI deduplication (`*Common.js` factories)**                 | [`src/UI/AGENTS.md`](src/UI/AGENTS.md) → [`docs/GUIComponent_Version_Dedup_Factory.md`](docs/GUIComponent_Version_Dedup_Factory.md)                                                                                 |
| **Packets, opcodes, lengths, `PACKETVER`, sockets**                     | [`src/Network/AGENTS.md`](src/Network/AGENTS.md)                                                                                                                                                                    |
| **WebGL renderer, `Entity` mixins, effects, shaders, GR2**              | [`src/Renderer/AGENTS.md`](src/Renderer/AGENTS.md) → [`docs/reference/renderer/README.md`](docs/reference/renderer/README.md)                                                                                       |
| **Game/Login/Char/Map engines & gameplay handlers**                     | [`src/Engine/AGENTS.md`](src/Engine/AGENTS.md) → [`docs/reference/README.md`](docs/reference/README.md)                                                                                                             |
| **Binary asset loaders (`.grf`, `.spr`, `.rsw`, `.gr2`, WASM)**         | [`src/Loaders/AGENTS.md`](src/Loaders/AGENTS.md) → [`docs/Encoding.md`](docs/Encoding.md)                                                                                                                           |
| **Database tables, constants, item/skill/status lookups**               | [`src/DB/AGENTS.md`](src/DB/AGENTS.md) → [`docs/Encoding.md`](docs/Encoding.md)                                                                                                                                     |
| **VFS (`Client`/`FileManager`), `ROConfig`, Workers, Lua/AI**           | [`src/Core/AGENTS.md`](src/Core/AGENTS.md) → [`docs/LuaModuleResolution.md`](docs/LuaModuleResolution.md), [`docs/Encoding.md`](docs/Encoding.md)                                                                   |
| **Controls, Audio, Preferences, Plugins, Utils**                        | [`docs/Architecture.md`](docs/Architecture.md)                                                                                                                                                                      |
| **Original Windows client behavioral notes (Guild, Chat, Pet, Mounts)** | [`docs/reference/README.md`](docs/reference/README.md)                                                                                                                                                              |
| **Architecture overview, JS modernization, debugging, glossary**        | [`docs/Architecture.md`](docs/Architecture.md)                                                                                                                                                                      |
| **Code review & PR invariants**                                         | [`REVIEW.md`](REVIEW.md)                                                                                                                                                                                            |

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
