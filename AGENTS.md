# AI Agent Instructions for roBrowserLegacy

## Project Overview

roBrowserLegacy is a web-based Ragnarok Online client built with ES6 modules and WebGL. It supports multiple platforms (browser, PWA, NW.js desktop) and provides a complete game client experience.

### Key Statistics

- **14 subsystems** in `src/` (App, Audio, Controls, Core, DB, Engine, Loaders, Network, Plugins, Preferences, Renderer, UI, Utils, Vendors)
- **7 application entry points** in `src/App/`
- **95 UI Components** in `src/UI/Components/`
- **40 Renderer Effect modules** (31 effect JS files + 9 post-processing shaders)
- **17 Entity modules** in `src/Renderer/Entity/`
- **28 MapEngine subsystems** in `src/Engine/MapEngine/`
- **23 packet versions** supported (kRO 2003–2025) in `src/Network/Packets/`
- **29 NPM scripts** for build, dev, lint, and formatting

## Architecture

### ES6 Modules

All source files use ES6 `import`/`export`. Vite bundles them into optimized ES modules.

```javascript
import { BinaryReader } from 'Utils/BinaryReader.js';
import Configs from 'Core/Configs.js';

export default function () {
	// module code
}
```

- Base path: `src/` (directory structure mirrors module paths)
- Output: `dist/Web/` for web, `dist/Desktop/` for NW.js
- Build: Vite + custom builder script (`applications/tools/builder-web.mjs`)

### Module Path Aliases

| Alias       | Path                        |
| ----------- | --------------------------- |
| jquery      | src/Vendors/jquery-1.9.1.js |
| App         | src/App/                    |
| Audio       | src/Audio/                  |
| Controls    | src/Controls/               |
| Core        | src/Core/                   |
| DB          | src/DB/                     |
| Engine      | src/Engine/                 |
| Loaders     | src/Loaders/                |
| Network     | src/Network/                |
| Plugins     | src/Plugins/                |
| Preferences | src/Preferences/            |
| Renderer    | src/Renderer/               |
| UI          | src/UI/                     |
| Utils       | src/Utils/                  |
| Vendors     | src/Vendors/                |

Example: `import Sprite from 'Loaders/Sprite.js';`

### Core Service Layers

1. **Engine** (`src/Engine/`): GameEngine (orchestrator), LoginEngine (auth), CharEngine (character), MapEngine (28 subsystems), SessionStorage
2. **Network** (`src/Network/`): PacketRegister, PacketStructure, PacketCrypt, PacketVersions.js, PacketVerManager, PacketLength, NetworkManager, SocketHelpers (WebSocket/NodeSocket)
3. **Loaders** (`src/Loaders/`): 12 asset parsers — GameFileDecrypt, GameFile, Sprite, Action, Ground (.gnd), Altitude (.gat), World (.rsw), Str (.str effects), Model, GrannyModel, MapLoader, Targa
4. **Database** (`src/DB/`): DBManager + data subdirectories (Effects, Items, Jobs, Map, Monsters, Pets, Skills, Status) + Emotions, TownInfo
5. **Renderer** (`src/Renderer/`): Renderer.js (WebGL context), MapRenderer, EntityManager, EffectManager, ScreenEffectManager, SignboardManager, Camera, SpriteRenderer, ItemObject + subdirectories (Effects, Entity, Map)
6. **UI** (`src/UI/`): UIManager, UIVersionManager, UIComponent (base class), CursorManager, Scrollbar, Background, 95 component directories
7. **Controls** (`src/Controls/`): EntityControl, MapControl, KeyEventHandler, MouseEventHandler, ProcessCommand, BattleMode, ScreenShot
8. **Audio** (`src/Audio/`): BGM.js, SoundManager.js
9. **Core** (`src/Core/`): Client, Configs, Context, Events, FileManager, FileSystem, MemoryItem, MemoryManager, Mobile, Preferences, Thread, ThreadEventHandler, AIDriver
10. **Preferences** (`src/Preferences/`): Audio, Graphics, Controls, UI, Camera, Map, ShortCutControls (7 modules)
11. **Plugins** (`src/Plugins/`): PluginManager.js
12. **Utils** (`src/Utils/`): BinaryReader, BinaryWriter, Struct, Inflate, PathFinding, WebGL, Texture, Executable, CRC32, CodepageManager, ConsoleManager, HTMLEntity, Queue, Base62, colors, partyColors, gl-matrix, jquery

### Data Flow

1. **Init**: GameEngine loads config → Client loads GRFs/executable → PacketVerManager detects PACKETVER from executable date
2. **Login**: LoginEngine → NetworkManager connects via WebSocket (browser) or NodeSocket (NW.js) → authenticates with versioned packets
3. **Map Entry**: MapEngine loads map/entity data → Renderer displays → Controls enable input → 28 MapEngine subsystems manage live state
4. **Runtime**: InputHandler → ProcessCommand → NetworkManager sends → packet handlers update state → EntityManager updates → Renderer draws

### Multi-Platform Support

- **Browser**: WebSocket via wsProxy, ES modules loaded as `<script type='module'>`
- **PWA**: Progressive Web App with manifest and service worker support
- **NW.js Desktop**: Direct TCP via NodeSocket, packaged executables for Windows x86/x64

## Critical Files & Patterns

### Network Packet Handling

- **NetworkManager.js**: Connection management and packet dispatch
- **PacketRegister.js**: Maps packet IDs (0x69, 0x6a, etc.) to handlers
- **PacketStructure.js**: Defines AC/ZC/HC packet schemas
- **PacketVersions.js**: Per-version packet definitions (large switch on date)
- **PacketLength.js**: Packet length definitions
- **PacketCrypt.js**: Packet encryption/decryption
- **PacketVerManager.js**: Automatic PACKETVER detection from executable metadata
- **Packets/**: 23 version-specific length files (`packets2003_len_main.js` through `packets2025_len_main.js`)
- **SocketHelpers/**: WebSocket.js (browser), NodeSocket.js (NW.js desktop)
- Pattern: Add handler in PacketRegister → define structure in PacketStructure → implement response in appropriate engine

### Entity System (`src/Renderer/Entity/`)

17 specialized modules:

- **Entity.js**: Base entity state and GID tracking
- **EntityRender.js**: Core rendering logic and sprite/model selection
- **EntityAnimations.js**: Animation frame management and timing
- **EntityWalk.js**: Movement interpolation and path rendering
- **EntityCast.js**: Skill casting animations and effects
- **EntityState.js**: Status effects (poison, stun, etc.) visualization
- **EntityLife.js**: Health bars and life state indicators
- **EntityAction.js**: Action state handling
- **EntityAttachments.js**: Equipment/accessory visual attachments
- **EntityAura.js**: Character aura effects
- **EntityDialog.js**: Dialog display
- **EntityDisplay.js**: Name/title display
- **EntityDropEffect.js**: Item drop visual effects
- **EntityEmblem.js**: Guild/party emblem rendering
- **EntityRoom.js**: Chat room display
- **EntitySound.js**: Entity sound effects
- **EntityView.js**: View/appearance management

### Asset Loaders (`src/Loaders/`)

12 modules:

- **GameFileDecrypt.js**: Decrypt GRF files (DES/RC4)
- **GameFile.js**: GRF file container parsing
- **Action.js**: Parse .act (sprite animation frames)
- **Sprite.js**: Parse .spr (sprite texture/palette data)
- **Ground.js**: Parse .gnd (ground mesh/texture data)
- **Altitude.js**: Parse .gat (map height/collision data)
- **World.js**: Parse .rsw (resource world — models, lights, sounds)
- **Str.js**: Parse .str (visual effect files, compiled .ezv format)
- **Model.js**: Parse .rsm (3D model data)
- **GrannyModel.js**: Parse Granny RSAC format (3D skeletal models)
- **MapLoader.js**: Map loading orchestration
- **Targa.js**: Parse .tga (image format)

### MapEngine Subsystems (`src/Engine/MapEngine/`, 28 files)

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

### UI Components (`src/UI/Components/`, 95 directories)

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

31 effect JS files + 9 post-processing shaders:

**Effects:**

- **Weather**: CloudWeatherEffect, PokJukWeatherEffect, RainWeather, SakuraWeatherEffect, SnowWeather, Sky
- **Auras/Spheres**: GroundAura, SwirlingAura, SpiritSphere, WarlockSphere, Level99Bubble, QuadHorn
- **Ground**: GroundEffect, FlatColorTile, PropertyGround, LPEffect, SpiderWeb, Tiles
- **Combat**: Damage, MagnumBreak, PoisonEffect, MagicTarget, MagicRing, LockOnTarget
- **Visual**: StrEffect, RsmEffect, ThreeDEffect, TwoDEffect, Cylinder, Songs
- **Screen**: PostProcess

**Post-Processing Shaders** (`Effects/Shaders/`): Blind, Bloom, CAS, Cartoon, FXAA, GaussianBlur, Upsampling, VerticalFlip, Vibrance

### Map Renderer (`src/Renderer/Map/`)

- **Ground.js**: Ground mesh rendering
- **Altitude.js**: Height map rendering
- **Models.js**: Static 3D model rendering
- **AnimatedModels.js**: Animated 3D model rendering
- **Water.js**: Water surface rendering
- **Effects.js**: Map-level effects
- **GridSelector.js**: Tile selection overlay
- **Sounds.js**: Map ambient sounds

## Code Conventions

### Style Rules

Formatting is handled by **Prettier** (defaults). ESLint extends `eslint:recommended` and `prettier`.

ESLint enforces:

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

### Modern Patterns (Preferred)

When writing new code or modifying existing code, **use modern JavaScript features**:

- **Arrow functions** for callbacks and short functions
- **Template literals** for string interpolation and multi-line strings
- **`async`/`await`** for asynchronous operations (replace `jQuery.Deferred` and callback chains)
- **ES6 classes** for constructors and prototype-based objects
- **Destructuring** for extracting values from objects and arrays
- **Spread/rest operators** where appropriate
- **Native `Promise`** instead of `jQuery.Deferred`
- **`for...of`** loops where appropriate
- **Default parameters** instead of `|| fallback` patterns

### Legacy Patterns (Being Phased Out)

The codebase still contains legacy patterns from the AMD era. When touching these files, **modernize them**:

| Legacy Pattern                                           | Modern Replacement                                    |
| -------------------------------------------------------- | ----------------------------------------------------- |
| `function(a, b) { ... }` callbacks                       | `(a, b) => { ... }`                                   |
| `'string ' + variable + ' end'`                          | `` `string ${variable} end` ``                        |
| `jQuery.Deferred()` / `.done()` / `.fail()`              | `new Promise()` / `async`/`await`                     |
| `function Constructor() { this.x = 1; }`                 | `class Constructor { constructor() { this.x = 1; } }` |
| `Constructor.prototype.method = function() {}`           | `class Constructor { method() {} }`                   |
| `const Singleton = {}; Singleton.method = function() {}` | `class Singleton { static method() {} }`              |
| `var x = obj.x \|\| defaultVal;`                         | `const { x = defaultVal } = obj;` or default params   |
| Global assignments (`_global.CONST = val`)               | Explicit ES6 imports in all consumers                 |

### Global Browser APIs

- **ROConfig**: Runtime configuration object
- **$** / **jQuery**: jQuery global
- **SEEK_CUR, SEEK_SET, SEEK_END**: Binary reader constants (legacy globals — prefer importing from `Utils/BinaryReader.js`)
- **FileReaderSync, importScripts**: Web Worker APIs
- **Buffer**: Node.js fallback via requireNode

## Code Modernization

This section guides agents on how to modernize legacy code when working on files.

### Converting Constructor Functions to Classes

**Before:**

```javascript
function UIComponent(name, htmlText, cssText) {
	this.name = name;
	this._htmlText = htmlText || null;
	this._cssText = cssText || null;
}

UIComponent.prototype.open = function open() {
	// ...
};

export default UIComponent;
```

**After:**

```javascript
class UIComponent {
	constructor(name, htmlText = null, cssText = null) {
		this.name = name;
		this._htmlText = htmlText;
		this._cssText = cssText;
	}

	open() {
		// ...
	}
}

export default UIComponent;
```

### Converting Object-Literal Singletons to Classes

**Before:**

```javascript
const FileManager = {};

FileManager.remoteClient = '';
FileManager.gameFiles = [];

FileManager.load = function load(path) {
	// ...
};

export default FileManager;
```

**After:**

```javascript
class FileManager {
	static remoteClient = '';
	static gameFiles = [];

	static load(path) {
		// ...
	}
}

export default FileManager;
```

### Converting jQuery.Deferred to async/await

**Before:**

```javascript
function loadFile(path) {
	const deferred = new jQuery.Deferred();
	doSomething(
		path,
		function (result) {
			deferred.resolve(result);
		},
		function (error) {
			deferred.reject(error);
		}
	);
	return deferred.promise();
}

// caller
loadFile('test.txt')
	.done(function (data) {
		process(data);
	})
	.fail(function (err) {
		handleError(err);
	});
```

**After:**

```javascript
async function loadFile(path) {
	return new Promise((resolve, reject) => {
		doSomething(
			path,
			result => {
				resolve(result);
			},
			error => {
				reject(error);
			}
		);
	});
}

// caller
try {
	const data = await loadFile('test.txt');
	process(data);
} catch (err) {
	handleError(err);
}
```

### Using Arrow Functions

**Before:**

```javascript
list.forEach(function (item) {
	process(item);
});

events.on('click', function (event) {
	return handler(event);
});
```

**After:**

```javascript
list.forEach(item => {
	process(item);
});

events.on('click', event => handler(event));
```

> **Note:** Be careful with `this` context. Arrow functions inherit `this` from the enclosing scope. If a function relies on dynamic `this` binding (e.g., jQuery event handlers using `this` to refer to the DOM element, or prototype methods), keep it as a regular function or convert the whole module to a class first.

### Using Template Literals

**Before:**

```javascript
var msg = 'Player ' + name + ' (Lv.' + level + ') joined the party';
```

**After:**

```javascript
const msg = `Player ${name} (Lv.${level}) joined the party`;
```

### Removing Global Assignments

**Before:**

```javascript
export const SEEK_CUR = 1;
export const SEEK_SET = 2;
export const SEEK_END = 3;

const _global = typeof self !== 'undefined' ? self : window;
_global.SEEK_CUR = SEEK_CUR;
_global.SEEK_SET = SEEK_SET;
_global.SEEK_END = SEEK_END;
```

**After:**

```javascript
export const SEEK_CUR = 1;
export const SEEK_SET = 2;
export const SEEK_END = 3;

// No global assignments — all consumers import directly:
// import { SEEK_CUR, SEEK_SET, SEEK_END } from 'Utils/BinaryReader.js';
```

> **Note:** Only remove global assignments after verifying all consumers (including Web Workers) have been updated to use ES6 imports.

## Build & Compilation

### NPM Scripts

```bash
# Development
npm run dev               # Vite dev server
npm run live              # Vite dev server on browser-examples
npm run pwa               # Vite dev server on PWA
npm run tools             # Vite dev server on tools
npm run nw                # Launch NW.js desktop app

# Build (custom builder)
npm run build             # Base build command
npm run build:online      # Build Online.js (full client)
npm run build:mapviewer   # Build MapViewer.js
npm run build:grfviewer   # Build GrfViewer.js
npm run build:modelviewer # Build ModelViewer.js
npm run build:strviewer   # Build StrViewer.js
npm run build:effectviewer # Build EffectViewer.js
npm run build:threadhandler # Build ThreadEventHandler.js (web worker)
npm run build:html        # Generate HTML only
npm run build:ai          # Build AI scripts only
npm run build:all         # Build all apps
npm run build:all:minify  # Build all apps with Terser minification
npm run build:pwa         # Build PWA (Online + Thread + manifest)
npm run build:nw          # Build NW.js desktop (Windows x86/x64)
npm run build:vite        # Vite production build

# Quality
npm run lint              # ESLint check
npm run lint:fix          # ESLint auto-fix
npm run lint:check        # ESLint strict (zero warnings)
npm run format            # Prettier format
npm run format:check      # Prettier check
npm run ci                # lint + format:check

# Preview
npm run serve             # Vite preview server
npm run preview           # Vite preview server
```

### Application Entry Points (`src/App/`)

- **Online.js**: Full game client — depends on all engines, network, UI
- **MapViewer.js**: Standalone map viewer
- **ModelViewer.js**: 3D model viewer
- **GrfViewer.js**: GRF archive browser
- **StrViewer.js**: .str effect viewer
- **EffectViewer.js**: Visual effect viewer
- **GrannyModelViewer.js**: Granny format 3D model viewer

`ThreadEventHandler.js` (in `src/Core/`) is built separately as a Web Worker.

## Dependencies

### Infrastructure Requirements

- **wsProxy**: WebSocket proxy (server-side) translating TCP ↔ WebSocket
- **Remote Client (PHP/JS)**: HTTP server extracting/serving GRF assets
- **Game Server**: rAthena or Hercules compatible
- **kRO Client Files**: GRF assets + executable for PACKETVER detection

### Vendored Libraries (`src/Vendors/`)

- **jquery-1.9.1.js** / **jquery.js**: DOM manipulation
- **gl-matrix.js**: Matrix/vector math for WebGL
- **html2canvas.js**: HTML-to-canvas rendering
- **iconv-lite.js**: Character encoding conversion
- **libgif.js**: GIF parsing
- **wasmoon-lua5.1.js**: Lua 5.1 WASM runtime
- **xmlparse.js**: XML parsing

### Dev Dependencies (package.json)

- **vite**: Build tool and dev server
- **terser**: JS minification
- **eslint** + **eslint-config-prettier**: Linting
- **prettier**: Code formatting
- **@rollup/plugin-alias**: Module path aliases
- **bson**: Binary serialization (build tooling)
- **lodash**: Utility functions (build tooling)
- **nw** + **nwjs-builder-phoenix**: NW.js desktop builds

## Config System

- **Config.js**: Auto-generated default settings (servers, features, preferences)
- **Config.local.js**: Optional local overrides (not committed)
- **ROConfig**: Merged configuration object loaded at runtime

### Key Configuration Options

- **servers**: Array of server definitions (address, port, version)
- **packetDump**: Enable packet logging for debugging
- **skipIntro**: Bypass intro screen for testing
- **remoteClient**: GRF asset server URL
- **plugins**: Runtime plugin configuration
- **aura, autoLogin**: Game-specific settings

## Common Development Tasks

### Adding a New UI Component

1. Create directory in `src/UI/Components/NewComponent/`
2. Implement as an ES6 class with `open()`, `close()`, and shortcut methods
3. Register with UIManager
4. Add keyboard shortcut in `src/Controls/ProcessCommand.js` if needed

### Implementing a New Packet Handler

1. Define packet structure in `src/Network/PacketStructure.js`
2. Register handler in `src/Network/PacketRegister.js`
3. Implement handler in appropriate engine (MapEngine, LoginEngine, etc.)
4. Handle version-specific differences via PacketVersions.js
5. Test with `packetDump` enabled in config

### Adding a New Packet Version

1. Create file in `src/Network/Packets/` (e.g., `packets2026_len_main.js`)
2. Define packet lengths for all known packets in that version
3. Update `PacketVerManager.js` to include the new date range
4. Test against server with matching PACKETVER

### Creating a New Renderer Effect

1. Create effect module in `src/Renderer/Effects/`
2. Implement with `update()` and `render()` methods
3. Register with EffectManager
4. Test performance impact and object pooling

## Troubleshooting

- **Missing assets**: Verify GRF loading in Client.js, check Remote Client response
- **Packet errors**: Check PACKETVER matches server, verify PacketVersions.js, enable packetDump
- **Rendering issues**: Check WebGL capability (OpenGL ES 2.0 required), inspect Renderer.js context
- **Build errors**: Clear `dist/`, verify entry point exists in `src/App/`
- **Connection fails**: Check wsProxy configuration, firewall settings
- **PACKETVER mismatch**: Verify executable date matches server version
- **Module not found**: Check path aliases in vite.config.js and file extensions

## Important Gotchas

- **PACKETVER mismatch**: Client and server packet definitions must align; debug by comparing hex packets
- **GRF paths**: Case-sensitive on Linux; relative to Remote Client or local file list
- **Texture limits**: WebGL has max texture dimensions; large sprite sheets can fail
- **Path aliases**: Always use aliases (e.g., `'Utils/BinaryReader.js'`) instead of relative paths
- **Modernize on touch**: When modifying a file, convert legacy patterns (constructor functions, jQuery.Deferred, string concatenation, etc.) to modern equivalents
- **Arrow function `this` caveat**: Arrow functions capture `this` lexically — verify `this` usage before converting jQuery event handlers or prototype methods
- **Vendors excluded from lint**: `src/Vendors/**` is ignored by ESLint — don't modify vendored code
- **Global removal requires audit**: Before removing a global assignment (e.g., `SEEK_CUR`), verify all consumers including Web Workers have been updated to use ES6 imports

## Glossary

- **GID**: Global ID — unique identifier for game entities
- **GRF**: Game Resource File — container format for Ragnarok assets
- **PACKETVER**: Packet version — determines network protocol format based on kRO client date
- **wsProxy**: WebSocket proxy for TCP ↔ WebSocket translation
- **Entity**: Game object (player, NPC, monster) with rendering and state
- **Effect**: Visual effect (weather, auras, particles) managed by EffectManager
- **kRO**: Korean Ragnarok Online — reference client for packet versions

## Repository Structure

- `applications/`: HTML entry points, PWA config, NW.js wrapper, build tools
    - `api/`: API endpoints for external integrations
    - `browser-examples/`: Demo pages for different apps
    - `nwjs/`: NW.js desktop application wrapper
    - `pwa/`: Progressive Web App configuration
    - `tools/`: Build scripts (builder-web.mjs) and utilities
- `src/`: All source code
    - `App/`: 7 application entry points
    - `Audio/`: BGM and sound management (2 files)
    - `Controls/`: Input handling (7 files)
    - `Core/`: Core utilities and managers (13 files)
    - `DB/`: Game data, metadata, and constants
    - `Engine/`: Game logic — GameEngine, LoginEngine, CharEngine, MapEngine (28 subsystems), SessionStorage
    - `Loaders/`: Asset parsers (12 files)
    - `Network/`: Packet handling, 23 version files, socket helpers
    - `Plugins/`: PluginManager
    - `Preferences/`: User settings (7 modules)
    - `Renderer/`: WebGL pipeline — Effects (40 modules), Entity (17 modules), Map (8 files)
    - `UI/`: UIManager, 95 component directories
    - `Utils/`: Utility functions (18 files)
    - `Vendors/`: Third-party libraries (8 files)
- `dist/`: Build output (generated, .gitignored)
- `doc/`: Setup guides and documentation
