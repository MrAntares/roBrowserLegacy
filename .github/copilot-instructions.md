# AI Agent Instructions for roBrowserLegacy

## Project Overview

roBrowserLegacy is a comprehensive web-based Ragnarok Online client built with ES6 modules and WebGL, featuring a sophisticated modular architecture. The project supports multiple platforms (browser, PWA, NW.js desktop) and provides a complete game client experience with 8 distinct applications, 80+ UI components, and extensive network protocol support for 23+ game versions (2003-2025).

### Key Statistics

- **~40,000 lines** of ES6 modular code
- **12 major subsystems** in src/ (App, Audio, Controls, Core, DB, Engine, Loaders, Network, Plugins, Preferences, Renderer, UI)
- **80+ UI Components** covering full game interface (inventory, chat, skills, quests, etc.)
- **40+ Renderer Effects** for visual systems (weather, auras, damage text, ground effects)
- **16 Entity modules** for game object rendering pipeline
- **27 MapEngine subsystems** for live game state management
- **23 packet versions** supported (kRO 2003-2025)
- **18+ build commands** for different compilation targets

The architecture follows a strict separation of concerns: game logic (engines), network (packet handling), UI (component-based), and core utilities. The build system uses Vite with a custom builder for optimized ES module bundling.

## Key Architecture Patterns

### ES6 Modules

All source files use ES6 modules with `import`/`export` syntax. The build system bundles them into optimized ES modules for the browser using Vite and Rollup.

```javascript
import { BinaryReader } from 'Utils/BinaryReader.js';
import Configs from 'Core/Configs.js';

export default function () {
	// module code
}
```

- Base path for modules: `src/` (directory structure mirrors module paths)
- Compiled output: `dist/Web/` for web, `dist/Desktop/` for NW.js
- Build system uses Vite for bundling and optimization with custom builder script

### Module Path Aliases

The project uses path aliases for clean imports:

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

1. **Engine Layer** (`src/Engine/`): GameEngine (global orchestrator), LoginEngine (authentication), MapEngine (27 subsystems for live game state)
2. **Network Layer** (`src/Network/`): PacketRegister, PacketStructure, PacketCrypt, PacketVersions (23 versions), SocketHelpers (WebSocket/NodeSocket dual support)
3. **Loaders** (`src/Loaders/`): GameFileDecrypt, Sprite, Action, Ground, Str, Model, Targa, World parsers for GRF assets
4. **Database** (`src/DB/`): DBManager loads job/skill/monster/map metadata from JSON files
5. **Renderer** (`src/Renderer/`): WebGL rendering with MapRenderer, EntityManager, EffectManager, 40+ specialized effects
6. **UI** (`src/UI/`): Component-based UI system with UIManager, UIVersionManager, 80+ components, CursorManager, Scrollbar
7. **Controls** (`src/Controls/`): Input handling - EntityControl, MapControl, KeyEventHandler, MouseEventHandler, ProcessCommand
8. **Audio** (`src/Audio/`): BGM.js, SoundManager.js for game audio
9. **Preferences** (`src/Preferences/`): Audio, Graphics, Controls, UI, Camera, Map, ShortCutControls persistence

### Data Flow

1. **Initialization**: GameEngine loads config → Client loads GRFs/executable → PacketVerManager detects PACKETVER from executable date
2. **Login**: LoginEngine → NetworkManager connects via WebSocket (browser) or NodeSocket (NW.js) → authenticates with versioned packets
3. **Map Entry**: MapEngine loads map/entity data → Renderer displays → Controls enable input → 27 MapEngine subsystems manage live state
4. **Runtime**: InputHandler → ProcessCommand → NetworkManager sends → packet handlers update state → EntityManager updates → Renderer draws

### Multi-Platform Support

- **Browser**: WebSocket via wsProxy, ES modules loaded as `<script type='module'>`
- **PWA**: Progressive Web App with manifest, service worker support
- **NW.js Desktop**: Direct TCP via NodeSocket, packaged executables for Windows x86/x64

### Plugin System

- **PluginManager**: Loads and manages runtime plugins
- **socketFactory**: Custom socket implementations (WebSocket, NodeSocket)
- Extensible architecture for custom features

## Critical Files & Patterns

### Network Packet Handling

- **PacketRegister.js**: Maps packet IDs (0x69, 0x6a, etc.) to handlers
- **PacketStructure.js**: Defines AC/ZC/HC packet schemas (client ↔ server communication)
- **PacketVersions.js**: Per-version packet definitions; varies by kRO client date (23 versions: 2003-2025)
- **PacketCrypt.js**: Packet encryption/decryption logic
- **PacketVerManager.js**: Automatic PACKETVER detection from executable metadata
- **SocketHelpers/**: WebSocket.js (browser), NodeSocket.js (NW.js desktop)
- Pattern: Add handler in PacketRegister, define structure, implement response in appropriate engine/controller

### Entity System

- **EntityControl.js**: Entity state, movement, animation
- **CharEngine.js**: Character rendering pipeline
- **EntityManager.js**: Maintains active entity pool with GID tracking
- **16 specialized modules**: EntityRender, EntityWalk, EntityCast, EntityState, EntityLife, etc.
- Entities identified by unique GID (global ID) and actor type

### Asset Loading

- **Loaders/GameFileDecrypt.js**: Decrypt GRF files (DES/RC4)
- **Loaders/Action.js**: Parse .act (sprite animation frames)
- **Loaders/Sprite.js**: Parse .spr (sprite texture/palette data)
- **Loaders/Str.js**: Parse .str (map string/prop data)
- **Loaders/Ground.js**: Parse .gat (map height/collision data)
- **Loaders/Model.js**: Parse GrannyModel RSAC format
- **Loaders/World.js**: Parse altitude maps
- **Loaders/Targa.js**: Parse TGA image format

### MapEngine Subsystems (27 controllers)

- **Main.js**: Core game loop and state management
- **Entity.js**: Main entity controller
- **UIOpen.js**: UI component lifecycle
- **MapState.js**: State persistence
- **Achievement.js, Quest.js, Guild.js, Clan.js**: Progress systems
- **Group.js, Friends.js, PrivateMessage.js**: Social features
- **CashShop.js, Refine.js, Enchant.js, ItemCompare.js**: Commerce/crafting
- **Homun.js, Pet.js, Mercenary.js**: Companion systems
- **NPC.js, Store.js, Trade.js, Vending.js**: Interaction systems

### UI Components (80+)

- **Intro.js**: File upload & server selection
- **WinList.js**: Character selection
- **WinLogin.js**: Account authentication
- **Inventory.js, Equipment.js, Storage.js, Bank.js, CashShop.js**: Item management
- **ChatBox.js, ChatRoom.js, WhisperBox.js**: Communication
- **NpcBox.js, NpcStore.js, NpcMenu.js**: NPC interaction
- **SkillList.js, SkillDescription.js, SkillTargetSelection.js**: Skill system
- **Quest.js, Mail.js, Rodex.js, Trade.js, Vending.js**: Game systems
- **GrfViewer.js, ModelViewer.js, StrViewer.js**: Asset viewers
- **Clan.js, Guild.js, PartyFriends.js**: Social systems
- **MiniMap.js, WorldMap.js, Navigation.js**: Navigation
- Plus many specialized components

### Renderer Effects (40+)

- **Weather effects**: Rain, snow, fog systems
- **Aura effects**: Character auras and halos
- **Damage text**: Floating damage numbers
- **Ground effects**: Area-of-effect visuals
- **Skill effects**: Spell animations and particles
- **Screen effects**: Post-processing filters
- **Signboard effects**: Entity nameplates and status

### Preferences System (7 modules)

- **Audio.js**: Sound and music settings
- **Graphics.js**: Visual quality options
- **Controls.js**: Input bindings
- **UI.js**: Interface customization
- **Camera.js**: Viewport controls
- **Map.js**: Map display settings
- **ShortCutControls.js**: Hotkey configuration

## Code Conventions

### Style Rules (from .eslintrc.cjs)

- **Indentation**: Tab stops, width 4 spaces
- **Quotes**: Single quotes (no template literals)
- **Brace style**: Allman (opening brace on new line)
- **Semicolons**: Required at end of statements
- **ES6 modules and basic syntax**: Use import/export, const/let; avoid arrow functions, template literals, async/await

### Naming Conventions

- **Private vars**: Prefix with `_` (e.g., `_sockets`, `_currentSocket`)
- **Constants**: UPPER_SNAKE_CASE in db/const files
- **Classes/Constructors**: PascalCase (e.g., `EntityControl`, `BinaryReader`)
- **Functions/Methods**: camelCase (e.g., `sendPacket()`, `parseEntity()`)

### Common Return Patterns

- Use function hoisting for local helper functions
- Return objects with public methods (closure pattern)
- EventEmitter-style callbacks (jQuery.Deferred or simple callbacks)

### Global Browser APIs

- **ROConfig**: Runtime configuration object (loaded from Config.js + Config.local.js)
- **$**: jQuery global
- **FileReaderSync, importScripts**: Web Worker APIs
- **Buffer, process**: Node.js fallbacks via requireNode

## Build & Compilation

### NPM Scripts

```bash
npm run build              # Compile all modules using custom builder
npm run build:online       # Build Online.js only
npm run build:mapviewer    # Build MapViewer.js only
npm run build:grfviewer    # Build GrfViewer.js only
npm run build:modelviewer  # Build ModelViewer.js only
npm run build:strviewer    # Build StrViewer.js only
npm run build:effectviewer # Build EffectViewer.js only
npm run build:threadhandler # Build ThreadEventHandler.js only
npm run build:html         # Generate HTML only
npm run build:ai           # Build AI scripts only
npm run build:all          # Build all apps
npm run build:all:minify   # Build all apps with minification
npm run build:pwa          # Build PWA app with manifest
npm run build:nw           # Build NW.js desktop executables
npm run lint               # ESLint check (src/**/*.js)
npm run lint:fix           # Auto-fix ESLint errors
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting
npm run ci                 # Run lint and format check
```

### Build System (applications/tools/builder-web.mjs)

- Uses custom builder script with Vite to bundle ES6 modules into optimized ES modules for the browser
- Entry points: `src/App/Online.js`, `src/App/MapViewer.js`, etc.
- Output: Single bundled ES module file per app
- Thread handler built separately for worker thread
- Supports optional Terser minification with ASCII-only output
- Auto-generates Config.js and HTML scaffolding
- PWA manifest and icon generation for progressive web app builds
- NW.js packaging for desktop executables (Windows x86/x64)

### Key Modules Compiled into Apps

- **Online.js**: Full game client - depends on all engines, network, UI
- **MapViewer/ModelViewer/GrfViewer/StrViewer/EffectViewer**: Standalone asset viewers
- **GrannyModelViewer.js**: 3D model viewer for Granny format
- **ThreadEventHandler.js**: Web Worker for computations

### Key Modules Compiled into Apps

- **Online.js**: Full game client - depends on all engines, network, UI
- **MapViewer/ModelViewer/GrfViewer**: Standalone asset viewers
- **ThreadEventHandler.js**: Web Worker for computations

## External Dependencies & Integrations

### Infrastructure Requirements

- **wsProxy**: WebSocket proxy (server-side) translating TCP packets to WebSocket
- **Remote Client (PHP/JS)**: HTTP server extracting/serving GRF assets
- **Game Server**: rAthena or Hercules (TCP packets compatible with this client)
- **kRO Client Files**: Source of GRF assets and executable for packet version detection

### Bundled Libraries

- Vite: Build tool and bundler for ES modules
- Terser: JS minification
- jQuery: DOM manipulation (vendored)

### Runtime Dependencies

- **jQuery 1.9.1** (vendored in src/Vendors/)
- **gl-matrix** - Math library (vendored)
- **BSON** - Binary serialization
- **Lodash** - Utility functions

## Packet & Version Management

### PACKETVER System

- Packet format changes with each game update (kRO updates ~monthly)
- PACKETVER detected from: executable date → PacketVerManager → PacketVersions matches version
- Each version maps packet IDs to different structure definitions
- Location: `src/Network/PacketVersions.js` (large switch on date)
- When adding packets: must account for multiple versions

### Packet Versions Support

The client supports 23 different packet versions corresponding to kRO client updates from 2003 to 2025:

- **2003-2004**: Early versions with basic packet structures
- **2005-2008**: Introduction of extended features and new packet types
- **2009-2012**: Major UI and gameplay additions
- **2013-2016**: Modern features, cash shop, achievements
- **2017-2020**: Advanced systems, homunculus, mercenaries
- **2021-2025**: Latest updates with refined mechanics

Each version has its own packet length definitions and encryption methods. The PacketVerManager automatically detects the version from the executable's timestamp and loads the appropriate definitions from `src/Network/PacketVersions/`.

### Adding Support for New Packet Versions

1. Create new file in `src/Network/PacketVersions/` (e.g., `packets2026_len_main.js`)
2. Define packet lengths for all known packets in that version
3. Update PacketVerManager.js to include the new date range
4. Test against server with matching PACKETVER

### Packet Encryption

- **PacketCrypt.js**: Handles encryption/decryption for secure communication
- **Version-specific keys**: Different encryption keys per client version
- **Automatic negotiation**: Client and server agree on encryption method during handshake

## Development Workflow

### Component Registration

- Components registered in UIManager with .add() / .remove()
- Each UI component: constructor + open/close/shortcut methods
- Stored in `src/UI/Components/` (e.g., Intro, WinList, EquipWindow)
- CursorManager, Scrollbar shared across components

### Event Handling

- Global keybinds managed by KeyEventHandler (→ ProcessCommand)
- Mouse events (MapControl, EntityControl) handle targeting
- UI components overlay on map rendering

## Testing & Debugging

### Local Development

```bash
npm run live              # Vite dev server on browser-examples
npm run pwa               # Vite dev server on PWA
npm run dev               # Vite dev server
npm run build && npm run serve  # Build and preview production
```

### Browser Console Access

- Packets logged with structure (Network tab in DevTools)
- All game state accessible via module requires
- Check F12 console for asset loading errors (GRF paths, texture upload issues)

### Common Issues

- **Missing assets**: Verify GRF loading in Client.js, check Remote Client response
- **Packet errors**: Check PACKETVER matches server, verify PacketVersions.js definition
- **Rendering issues**: WebGL capability (need OpenGL ES 2.0), check Three.js integration
- **Build errors**: Clear dist/, verify src/App/{name}.js exists

## Advanced Features

### Dual Environment Support

- **Browser Mode**: Uses WebSocket via wsProxy for TCP packet translation
- **NW.js Desktop**: Direct TCP connection via NodeSocket, bypassing WebSocket proxy
- **Plugin System**: socketFactory allows custom socket implementations

### Preferences Persistence

- **7 Preference Modules**: Audio, Graphics, Controls, UI, Camera, Map, ShortCutControls
- **Persistent Storage**: User settings saved across sessions
- **Dynamic Loading**: Preferences applied at runtime

### Audio System

- **BGM.js**: Background music management
- **SoundManager.js**: Sound effects and audio controls
- **Format Support**: MP3 files with configurable extensions

### Extended UI Features

- **UIVersionManager**: Version-specific UI aliases for compatibility
- **Component Lifecycle**: Managed through MapEngine/UIOpen subsystem
- **80+ Components**: Comprehensive game interface coverage

### MapEngine Architecture

- **27 Specialized Controllers**: Handle different game aspects (Entity, NPC, Quest, Guild, etc.)
- **State Persistence**: MapState.js manages game state across sessions
- **Subsystem Pattern**: Each controller handles specific packet types and UI interactions

### Entity Rendering Pipeline

- **16 Entity Modules**: Specialized rendering for different entity types
- **GID Tracking**: Unique global ID system for entity management
- **Animation System**: Integrated with sprite and model loading

### Renderer Effects System

- **40+ Effects**: Weather, auras, damage text, ground effects, skill animations
- **Post-Processing**: Screen effects and filters
- **Performance Optimized**: WebGL-based rendering pipeline

## Config System

### Runtime Configuration

- **Config.js**: Auto-generated default settings for servers, features, and preferences
- **Config.local.js**: Optional overrides for local development (not committed)
- **ROConfig**: Merged configuration object loaded at runtime
- **Dynamic Loading**: Config loaded via script injection in generated HTML

### Configuration Options

- **servers**: Array of server definitions (address, port, version, etc.)
- **packetDump**: Enable packet logging for debugging
- **skipIntro**: Bypass intro screen for testing
- **remoteClient**: GRF asset server URL
- **plugins**: Runtime plugin configuration
- **aura, autoLogin**: Game-specific settings

## Common Development Tasks

### Adding a New UI Component

1. Create `src/UI/Components/NewComponent.js`
2. Implement constructor, open(), close(), and shortcut methods
3. Register with UIManager: `UIManager.addComponent('NewComponent', NewComponent)`
4. Add keyboard shortcut in `src/Controls/ProcessCommand.js` if needed
5. Test component lifecycle and z-ordering

### Implementing a New Packet Handler

1. Define packet structure in `src/Network/PacketStructure.js`
2. Register handler in `src/Network/PacketRegister.js`
3. Implement handler logic in appropriate engine (MapEngine, LoginEngine, etc.)
4. Test with packetDump enabled in config
5. Handle version-specific differences if needed

### Creating a New Renderer Effect

1. Create effect module in `src/Renderer/Effects/`
2. Implement Effect class with update() and render() methods
3. Register with EffectManager
4. Add to appropriate effect list (weather, aura, etc.)
5. Test performance impact and pooling

### Adding Asset Loading Support

1. Create loader in `src/Loaders/` (e.g., NewAsset.js)
2. Implement parsing logic for file format
3. Integrate with Client.js asset loading pipeline
4. Add to DB if metadata needed
5. Test with sample assets

## Troubleshooting Guide

### Build Issues

- **Module not found**: Check path aliases and file extensions
- **Vite errors**: Verify entry points exist in `applications/tools/builder-web.mjs`
- **Minification fails**: Check for invalid JavaScript syntax

### Runtime Issues

- **WebGL context lost**: Handle context restoration in Renderer.js
- **Packet desync**: Enable packetDump, compare with server logs
- **Asset loading fails**: Check GRF paths, Remote Client configuration
- **UI not rendering**: Verify component registration and z-index

### Network Issues

- **Connection fails**: Check wsProxy configuration, firewall settings
- **PACKETVER mismatch**: Verify executable date matches server version
- **Encryption errors**: Update PacketCrypt.js for new versions

### Performance Issues

- **Low FPS**: Profile WebGL calls, reduce effect complexity
- **Memory leaks**: Check entity pooling, effect cleanup
- **Large GRF loading**: Implement progressive loading

## Security Considerations

- **Packet encryption**: All network traffic uses version-specific encryption
- **Asset integrity**: GRF files use DES/RC4 decryption
- **Client validation**: Executable metadata verification for PACKETVER
- **Config isolation**: Config.local.js not committed to prevent credential leaks

## Glossary

- **GID**: Global ID, unique identifier for game entities
- **GRF**: Game Resource File, container format for Ragnarok assets
- **PACKETVER**: Packet version, determines network protocol format
- **wsProxy**: WebSocket proxy for TCP ↔ WebSocket translation
- **Entity**: Game object (player, NPC, monster) with rendering and state
- **Effect**: Visual effect (weather, auras, particles) managed by EffectManager

## When Adding Features

1. **New packets**: Add struct to PacketStructure.js → register ID in PacketRegister.js → handle in appropriate engine/controller
2. **New UI component**: Create class in Components/ → register with UIManager → add keyboard shortcut to ProcessCommand if needed
3. **New asset type**: Add loader in Loaders/ → integrate into Client.js asset pipeline
4. **New game mechanic**: Likely spans GameEngine → Network packet handlers → UI/Renderer → EntityControl

## Repository Structure Notes

- `applications/`: HTML entry points, PWA config, NW.js desktop wrapper, tool builds
    - `api/`: API endpoints for external integrations
    - `browser-examples/`: Demo pages for different apps
    - `nwjs/`: NW.js desktop application wrapper
    - `pwa/`: Progressive Web App configuration
    - `tools/`: Build scripts and utilities
- `src/`: All source code (browser-executable after build)
    - `App/`: 8 application entry points
    - `Audio/`: Sound and music management
    - `Controls/`: Input handling systems
    - `Core/`: Core utilities and managers
    - `DB/`: Game data and metadata
    - `Engine/`: Game logic engines
    - `Loaders/`: Asset parsers and loaders
    - `Network/`: Packet handling and network communication
    - `Plugins/`: Plugin system
    - `Preferences/`: User settings persistence
    - `Renderer/`: WebGL rendering pipeline
    - `UI/`: User interface components
    - `Utils/`: Utility functions
    - `Vendors/`: Third-party libraries
- `dist/`: Build output (generated, .gitignored)
- `doc/`: Setup guides and documentation
- `tools/`: Build scripts and converters (rarely modified)

## Important Gotchas

- **PACKETVER mismatch**: Client and server packet definitions must align; debugging requires comparing hex packets
- **GRF paths**: Case-sensitive on Linux; relative to Remote Client or local file list
- **Module circular dependencies**: Rare but possible; check import order
- **Texture limits**: WebGL has max texture dimensions; large sprite sheets can fail
- **UI Z-ordering**: Managed via CSS and component registration order, not trivial to debug
- **ES6 features**: Use const/let but avoid arrow functions, template literals, async/await for consistency
- **Path aliases**: Always use aliases (e.g., 'Utils/BinaryReader') instead of relative paths
- **Component registration**: UI components must be registered with UIManager for proper lifecycle
- **Entity GID**: All entities tracked by unique Global ID for state management
- **Renderer effects**: 40+ specialized effects require proper EffectManager integration

## Renderer Pipeline Details

### Core Rendering Components

- **Renderer.js**: Main WebGL context manager and frame loop orchestrator
- **MapRenderer**: Handles ground, models, altitude, and animated map elements
- **EntityManager**: Manages all game entity rendering (players, NPCs, monsters)
- **EffectManager**: Coordinates 40+ visual effects (weather, auras, damage text)
- **ScreenEffectManager**: Post-processing filters and screen-wide effects
- **SignboardManager**: Entity nameplates, status indicators, and UI overlays

### Entity Rendering System

The entity pipeline consists of 16 specialized modules:

- **Entity.js**: Base entity state and GID tracking
- **EntityRender.js**: Core rendering logic and sprite/model selection
- **EntityAnimations.js**: Animation frame management and timing
- **EntityWalk.js**: Movement interpolation and path rendering
- **EntityCast.js**: Skill casting animations and effects
- **EntityState.js**: Status effects (poison, stun, etc.) visualization
- **EntityLife.js**: Health bars and life state indicators
- **Additional modules**: EntityAction, EntityAttach, EntityDirection, EntityEmotion, EntityHat, EntityMount, EntityShield, EntityWeapon

### Effects System Architecture

40+ specialized effects organized by category:

- **Weather Effects**: Rain, snow, fog, sakura systems
- **Aura Effects**: Character halos, skill auras, elemental effects
- **Damage Text**: Floating numbers with color coding and animation
- **Ground Effects**: Area-of-effect circles, targeting indicators
- **Skill Effects**: Spell animations, particle systems, projectile trails
- **Screen Effects**: Post-processing shaders, screen shakes, fades
- **Signboard Effects**: Nameplates, guild tags, status icons

### Performance Considerations

- WebGL texture limits and sprite sheet optimization
- Entity culling based on viewport and distance
- Effect pooling and reuse to minimize allocations
- Frame rate management and vsync synchronization
- Memory management for large GRF assets

## Development Workflow

### Setting Up Development Environment

1. Clone repository and install dependencies: `npm install`
2. Configure local settings in `Config.local.js` (copy from `Config.local.js.example`)
3. Run development server: `npm run dev` or `npm run live`
4. Build for testing: `npm run build:all`
5. Lint and format code: `npm run lint:fix && npm run format`

### Adding New Features

1. **Packets**: Define in PacketStructure.js, register in PacketRegister.js, handle in engine
2. **UI Components**: Create in UI/Components/, register with UIManager, add shortcuts
3. **Assets**: Add loader in Loaders/, integrate with Client.js
4. **Entities**: Extend EntityManager, add specialized modules if needed
5. **Effects**: Implement in Renderer/Effects/, register with EffectManager

### Testing and Debugging

- Use browser DevTools for packet inspection (enable packetDump in config)
- Check console for GRF loading errors and WebGL issues
- Test on multiple platforms: browser, PWA, NW.js
- Validate packet versions against server PACKETVER
- Monitor performance with WebGL frame analysis

### Deployment

- Build production: `npm run build:all:minify`
- For PWA: `npm run build:pwa`
- For desktop: `npm run build:nw`
- Deploy dist/ contents to web server with wsProxy for network
