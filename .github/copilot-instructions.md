# AI Agent Instructions for roBrowserLegacy

## Project Overview
roBrowserLegacy is a web-based Ragnarok Online client built with ES5, AMD modules, and WebGL. The architecture follows a strict modular design separating game logic (engines, network, loaders), UI components, and core utilities.

## Key Architecture Patterns

### AMD Modules (RequireJS)
All source files use AMD with `define()` function. Each module explicitly lists dependencies:
```javascript
define(['Utils/BinaryReader', 'Core/Configs'], function(BinaryReader, Configs) {
    // module code
    return { /* exports */ };
});
```
- Base path for modules: `src/` (directory structure mirrors module paths)
- Compiled output: `dist/Web/` for web, `dist/Desktop/` for NW.js
- Never use CommonJS syntax; maintain AMD consistency

### Core Service Layers
1. **Engine Layer** (`src/Engine/`): GameEngine, LoginEngine, MapEngine orchestrate game state
2. **Network Layer** (`src/Network/`): NetworkManager handles WebSocket/TCP via wsProxy, packet encryption, version management
3. **Loaders** (`src/Loaders/`): File parsers for GRF, SPR, ACT, STR (sprite data), models, maps
4. **Database** (`src/DB/`): DBManager loads job/skill/monster/map metadata from JSON files
5. **Renderer** (`src/Renderer/`): WebGL rendering with Three.js-like patterns for characters, maps, effects
6. **UI** (`src/UI/`): Component-based UI system with manager classes (UIManager, CursorManager, Scrollbar)
7. **Controls** (`src/Controls/`): Input handling - EntityControl, MapControl, KeyEventHandler, MouseEventHandler

### Data Flow
1. **Initialization**: GameEngine loads config → Client loads GRFs/executable → PACKETVER detected
2. **Login**: LoginEngine → NetworkManager connects via WebSocket → authenticates
3. **Map Entry**: MapEngine loads map/entity data → Renderer displays → Controls enable input
4. **Runtime**: InputHandler → ProcessCommand → NetworkManager sends → packet handlers update state

## Critical Files & Patterns

### Network Packet Handling
- **PacketRegister.js**: Maps packet IDs (0x69, 0x6a, etc.) to handlers
- **PacketStructure.js**: Defines AC/ZC/HC packet schemas (client ↔ server communication)
- **PacketVersions.js**: Per-version packet definitions; varies by kRO client date
- **PacketCrypt.js**: Packet encryption/decryption logic
- Pattern: Add handler in PacketRegister, define structure, implement response in controller

### Entity System
- **EntityControl.js**: Entity state, movement, animation
- **CharEngine.js**: Character rendering pipeline
- Entities identified by unique GID (global ID) and actor type

### Asset Loading
- **Loaders/GameFileDecrypt.js**: Decrypt GRF files
- **Loaders/Action.js**: Parse .act (sprite animation frames)
- **Loaders/Sprite.js**: Parse .spr (sprite texture/palette data)
- **Loaders/Str.js**: Parse .str (map string/prop data)
- **Loaders/Ground.js**: Parse .gat (map height/collision data)

## Code Conventions

### Style Rules (from .eslintrc.js)
- **Indentation**: Tab stops, width 4 spaces
- **Quotes**: Single quotes (no template literals)
- **Brace style**: Allman (opening brace on new line)
- **Semicolons**: Required at end of statements
- **ES5 syntax only**: No arrow functions, const/let, template literals, async/await

### Naming Conventions
- **Private vars**: Prefix with `_` (e.g., `_sockets`, `_currentSocket`)
- **Constants**: UPPER_SNAKE_CASE in db/const files
- **Classes/Constructors**: PascalCase (e.g., `EntityControl`, `BinaryReader`)
- **Functions/Methods**: camelCase (e.g., `sendPacket()`, `parseEntity()`)

### Common Return Patterns
- Use function hoisting for local helper functions
- Return objects with public methods (closure pattern)
- EventEmitter-style callbacks (jQuery.Deferred or simple callbacks)

## Build & Compilation

### NPM Scripts
```bash
npm run build              # Compile all modules (requires)
npm run build:online       # Only Online.js
npm run build:mapviewer    # Only MapViewer.js
npm run lint              # ESLint check (src/**/*.js)
npm run lint:fix          # Auto-fix ESLint errors
```

### Build System (tools/builder-web.js)
- Uses RequireJS optimizer to bundle AMD modules
- Entry points: `src/App/Online.js`, `src/App/MapViewer.js`, etc.
- Output: Single minified/non-minified .js file per app
- Thread handler built separately for worker thread

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
- RequireJS: Module loader and optimizer
- Terser: JS minification
- jQuery: DOM manipulation (vendored require.js wrapper)

## Packet & Version Management

### PACKETVER System
- Packet format changes with each game update (kRO updates ~monthly)
- PACKETVER detected from: executable date → PacketVerManager → PacketVersions matches version
- Each version maps packet IDs to different structure definitions
- Location: `src/Network/PacketVersions.js` (large switch on date)
- When adding packets: must account for multiple versions

### Packet Structure Definition
```javascript
// In PacketStructure.js
ZC.NOTIFY_INITCHAR: {
    index: 0x75,
    length: 106,
    fields: {
        gid: [0, 4],        // bytes 0-3 (little-endian uint32)
        x: [4, 2],
        y: [6, 2],
        // ...
    }
}
```

## UIManager & Components Pattern

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
npm run live              # Live-server on current dir + browser-examples
npm run pwa              # PWA app on live server
npm run build && npm run serve  # Production setup
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

## When Adding Features

1. **New packets**: Add struct to PacketStructure.js → register ID in PacketRegister.js → handle in appropriate engine/controller
2. **New UI component**: Create class in Components/ → register with UIManager → add keyboard shortcut to ProcessCommand if needed
3. **New asset type**: Add loader in Loaders/ → integrate into Client.js asset pipeline
4. **New game mechanic**: Likely spans GameEngine → Network packet handlers → UI/Renderer → EntityControl

## Repository Structure Notes
- `applications/`: HTML entry points, PWA config, NW.js desktop wrapper, tool builds
- `src/`: All source code (browser-executable after build)
- `doc/`: Setup guides and documentation
- `dist/`: Build output (generated, .gitignored)
- `tools/`: Build scripts and converters (rarely modified)

## Important Gotchas
- **PACKETVER mismatch**: Client and server packet definitions must align; debugging requires comparing hex packets
- **GRF paths**: Case-sensitive on Linux; relative to Remote Client or local file list
- **Module circular dependencies**: Rare but possible; check require order in define()
- **Texture limits**: WebGL has max texture dimensions; large sprite sheets can fail
- **UI Z-ordering**: Managed via CSS and component registration order, not trivial to debug
