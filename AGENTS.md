# AI Agent Instructions for roBrowserLegacy

## Project Overview

roBrowserLegacy is a web-based Ragnarok Online client built with ES6 modules and WebGL. It supports multiple platforms (browser, PWA, Electron desktop) and provides a complete game client experience.

### Key Statistics

- **14 subsystems** in `src/` (App, Audio, Controls, Core, DB, Engine, Loaders, Network, Plugins, Preferences, Renderer, UI, Utils, Vendors)
- **7 application entry points** in `src/App/` (1 game client: `Online.js` + 6 viewers: `EffectViewer.js`, `GrannyModelViewer.js`, `GrfViewer.js`, `MapViewer.js`, `ModelViewer.js`, `StrViewer.js`; plus `PreLoader.js` utility and `ThreadEventHandler.js` Web Worker in `src/Core/`)
- **100 UI Components** in `src/UI/Components/` (all migrated to `GUIComponent`)
- **42 Renderer Effect modules** (33 effect JS files in `src/Renderer/Effects/` + 9 post-processing shaders in `src/Renderer/Effects/Shaders/`, plus companion GLSL shaders)
- **19 Entity modules** in `src/Renderer/Entity/` (`Entity.js`, `Player.js`, `EntityOverlay.js`, and 16 entity mixins; 17 mixins composed dynamically into `Entity` with `Controls/EntityControl.js`)
- **29 MapEngine subsystems** in `src/Engine/MapEngine/`
- **23 packet versions** supported (kRO 2003–2025) in `src/Network/Packets/`

## Architecture

### ES6 Modules

All source files use ES6 `import`/`export`. Vite bundles them into optimized ES modules.

```javascript
import { BinaryReader } from 'Utils/BinaryReader.js';
import Configs from 'Core/Configs.js';
```

- Base path: `src/` (directory structure mirrors module paths)
- Output: `dist/Web/` for web, `dist/Desktop/` for Electron
- Build: Vite + custom builder script (`applications/tools/builder-web.mjs`)

### Module Path Aliases

| Alias       | Path             |
| ----------- | ---------------- |
| App         | src/App/         |
| Audio       | src/Audio/       |
| Controls    | src/Controls/    |
| Core        | src/Core/        |
| DB          | src/DB/          |
| Engine      | src/Engine/      |
| Loaders     | src/Loaders/     |
| Network     | src/Network/     |
| Plugins     | src/Plugins/     |
| Preferences | src/Preferences/ |
| Renderer    | src/Renderer/    |
| UI          | src/UI/          |
| Utils       | src/Utils/       |
| Vendors     | src/Vendors/     |

Example: `import Sprite from 'Loaders/Sprite.js';`

### Core Service Layers

1. **Engine** (`src/Engine/`): GameEngine (orchestrator), LoginEngine (auth), CharEngine (character), MapEngine (29 subsystems), SessionStorage, Replay (ReplayParser, ReplayPlayer, ReplaySocket, ReplayTypes), State
2. **Network** (`src/Network/`): PacketRegister, PacketStructure, PacketCrypt, PacketVersions.js, PacketVerManager, PacketLength, NetworkManager, SocketHelpers (WebSocket/NodeSocket)
3. **Loaders** (`src/Loaders/`): GameFileDecrypt, GameFile, Sprite, Action, Ground (.gnd), Altitude (.gat), World (.rsw), Str (.str effects), Model, GR2Loader (.gr2 3D skeletal models via granny-ro-js), MapLoader, Targa, /wasm loader files
4. **Database** (`src/DB/`): DBManager + data subdirectories (Effects, Items, Jobs, Map, Monsters, Pets, Skills, Status) + Emotions, TownInfo; `Skills/SkillTreeMerge.js` merges client `skilltreeview.lub` layouts with the built-in skill tree
5. **Renderer** (`src/Renderer/`): Renderer.js (WebGL context), MapRenderer, EntityManager, EffectManager, ScreenEffectManager, SignboardManager, Camera, SpriteRenderer, SpriteBatch (instanced entity sprite draws), SpriteAtlas (shared sprite frame and palette atlas for SpriteBatch), EntityComposer (composes and caches layered entity sprites for drawing), ItemObject + subdirectories (Effects, Entity, GR2, Map)
6. **UI** (`src/UI/`): UIManager, UIVersionManager, GUIComponent (base class, Shadow DOM), Custom Elements (`src/UI/Elements/`), CursorManager, Scrollbar, Background, TouchDrag, ClampToViewport, WhenDrawn (runs a callback the first time an element is drawn; window art waits for it), 100+ component directories
7. **Controls** (`src/Controls/`): EntityControl, MapControl, KeyEventHandler, MouseEventHandler, ProcessCommand, BattleMode, ScreenShot
8. **Audio** (`src/Audio/`): BGM.js, SoundManager.js
9. **Core** (`src/Core/`): Client, Configs, Context, Events, FileManager, FileSystem, MemoryItem, MemoryManager, Mobile, Preferences, Thread, ThreadEventHandler, AIDriver, LuaModuleLoader, PerfProbe (opt-in frame/draw-call/map-load probe, `perfProbe: true`)
10. **Preferences** (`src/Preferences/`): Audio, Graphics, Controls, UI, Camera, Map, ShortCutControls
11. **Plugins** (`src/Plugins/`): PluginManager.js
12. **Utils** (`src/Utils/`): BinaryReader, BinaryWriter, Struct, Inflate, PathFinding, WebGL, Texture, Executable, CRC32, CodepageManager, ConsoleManager, HTMLEntity, Queue, Base62, colors, partyColors, gl-matrix

### Data Flow

1. **Init**: GameEngine loads config → Client loads GRFs/executable → PACKETVER is set from config or auto-detected from executable PE timestamp
2. **Login**: LoginEngine → NetworkManager connects via WebSocket (browser) or NodeSocket (Electron) → authenticates with versioned packets
3. **Map Entry**: MapEngine loads map/entity data → Renderer displays → Controls enable input → 29 MapEngine subsystems manage live state
4. **Runtime**: InputHandler → ProcessCommand → NetworkManager sends → packet handlers update state → EntityManager updates → Renderer draws

### Multi-Platform Support

- **Browser**: WebSocket via wsProxy, ES modules loaded as `<script type='module'>`
- **PWA**: Progressive Web App with manifest and service worker support
- **Electron Desktop**: Direct TCP via NodeSocket (Electron preload), packaged executables

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

- **L1 — Primary** [`docs/UIComponent_to_GUIComponent.md`](docs/UIComponent_to_GUIComponent.md): consolidated operational memory (invariants, rules, failure matrix, custom elements). **Start here.**
- **L2 — Reflex** [`docs/UIComponent_to_GUIComponent_Firmware.md`](docs/UIComponent_to_GUIComponent_Firmware.md): compressed decision matrix for rapid lookup.
- **L0 — Archive** [`docs/UIComponent_to_GUIComponent_Scars.md`](docs/UIComponent_to_GUIComponent_Scars.md): full historical guide, postmortems, per-component migration reference.
- **Factory Deduplication** [`docs/GUIComponent_Version_Dedup_Factory.md`](docs/GUIComponent_Version_Dedup_Factory.md): rules and patterns for unified `*Common.js` factories.
- **Custom Elements**: [`docs/CustomElements.md`](docs/CustomElements.md) — reference for `<ui-button>`, `<ui-text>`, `<ui-image>`.
- **Historical Issue:** [Issue #1140](https://github.com/MrAntares/roBrowserLegacy/issues/1140) tracked the completed UIComponent→GUIComponent migration.

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
    - **chat/**: Parsing and display of received chat lines
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

## Code Conventions

### Style Rules

Formatting is handled by **Prettier** (defaults). ESLint extends `eslint:recommended` and `prettier`.

- **Quotes**: Single quotes (`avoidEscape: true`)
- **Semicolons**: Required
- **Trailing commas**: Forbidden (`comma-dangle: never`)
- **Curly braces**: Always required (`curly: 'all'`)
- **Variables**: `const` required where possible, `let` over `var`, `no-var: error`
- **No eval/implied-eval/new-func/with**: Error
- **Unused vars**: Warn (vars prefixed `_` ignored)
- **Vendors excluded**: `src/Vendors/**` ignored by ESLint

### Naming Conventions

- **Private vars**: Prefix with `_` (e.g., `_sockets`, `_currentSocket`)
- **Constants**: UPPER_SNAKE_CASE in db/const files
- **Classes/Constructors**: PascalCase (e.g., `EntityControl`, `BinaryReader`)
- **Functions/Methods**: camelCase (e.g., `sendPacket()`, `parseEntity()`)

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
