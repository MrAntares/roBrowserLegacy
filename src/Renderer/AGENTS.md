# AGENTS.md — Renderer Subsystem (`src/Renderer/`)

Instructions for working on the WebGL renderer, Entity composition system (`src/Renderer/Entity/`), visual effects (`src/Renderer/Effects/`), map rendering (`src/Renderer/Map/`), and Granny3D skeletal models (`src/Renderer/GR2/`).

## Mandatory References

- **Entity body palette & mount behavior:** Read [`docs/reference/renderer/README.md`](../../docs/reference/renderer/README.md) (`docs/reference/renderer/body-palette.md`) before changing entity palette or mount rendering in `src/Renderer/Entity/`.
- **Guild nameplate emblem:** See [`docs/reference/guild/nameplate-emblem.md`](../../docs/reference/guild/nameplate-emblem.md).

---

## Core Renderer & Entity Invariants

1. **Do Not Convert the Entity Mixin/Composition System into Class Inheritance:**
    - `Entity.js` is composition-based. 17 mixins (16 under `src/Renderer/Entity/` plus `Controls/EntityControl.js`) are applied dynamically in `Entity`'s constructor via `.call(this)`.
    - Add or modify entity behavior through the appropriate mixin or composition path. Never replace mixins with subclasses or a new inheritance tree.
    - Note that `EntityComposer.js` and `EntityOverlay.js` in `src/Renderer/Entity/` are helper/compositing modules, and `Player.js` extends `Entity` for the local player session (`Session.Entity`).
2. **Keep `Entity.prototype` Data Whitelist Intact:**
    - `Entity.prototype` explicitly declares data fields (`objecttype`, `GID`, `AID`, `_sex`, `_job`, `_head`, `clevel`, `joblevel`, `money`, etc.) on the prototype rather than as ES2022 class instance fields.
    - `Entity.prototype.set(unit)` uses `Entity.prototype.hasOwnProperty(key)` (and `_${key}`) as a security/safety whitelist to decide which server packet properties can be auto-assigned. Moving these properties to class fields on `this` breaks `hasOwnProperty` checks on `Entity.prototype`.
    - Before changing Entity state, inspect creation, transformation (`EntityManager.pendingTransformations`), removal (`clean` / `remove`), and map-transition flows.
3. **Preserve Frame-Loop Performance & Scratchpad Buffers:**
    - Module-scoped `const` scratchpads/caches (such as preallocated `Float32Array`, `mat4`, `vec3` buffers reused per frame to avoid GC allocations, and module-private WebGL handles like `_program` / `_buffer`) are an intentional performance pattern in `src/Renderer/`. Do not flag them as global state or move them into per-frame allocations.
4. **WebGL & GPU Resource Lifecycle:**
    - Requires OpenGL ES 2.0 / WebGL support. Watch for maximum texture dimensions when packing or uploading sprite sheets (`SpriteAtlas`, `EntityComposer`).
    - When deleting WebGL textures or buffers in batched paths (`SpriteBatch`, `EntityComposer`), ensure queued draws are flushed first or defer deletion until `endFrame(gl)` to avoid blanking in-flight draws, and handle WebGL context loss gracefully.

---

## Subsystem Inventory (`src/Renderer/`)

### Top-Level Orchestrators

- `Renderer.js` — WebGL context management, resize handling, and main render loop callbacks.
- `FramePacer.js` — Frame pacing and timing management.
- `MapRenderer.js` — Coordinates map loading and world/ground/water/model/light/sound rendering.
- `EntityManager.js` — Manages active entities, picking priority, culling, and pending transformations.
- `EffectManager.js` — Spawns, updates, renders, and cleans up visual effects.
- `ScreenEffectManager.js` — Full-screen status/blind/post-processing effects.
- `SignboardManager.js` — World signboards.
- `Camera.js` — Camera positioning, rotation, zoom, and projection matrices.
- `SpriteRenderer.js` — 2D/3D billboarded sprite drawing and canvas fallback.
- `SpriteBatch.js` & `SpriteAtlas.js` — Instanced entity sprite batching and shared sprite frame/palette texture atlases (with companion `.vs`/`.fs` shaders).
- `ItemObject.js` — Ground item drop rendering.

### Entity Modules (`src/Renderer/Entity/`, 20 files)

- **Core:** `Entity.js` (base class + prototype property whitelist), `Player.js` (player entity), `EntityComposer.js` (single-sprite composite texture cache), `EntityOverlay.js` (overlay management).
- **16 Mixins in `src/Renderer/Entity/` (plus `Controls/EntityControl.js` = 17 total):**
  `EntityAction.js`, `EntityAnimations.js`, `EntityAttachments.js`, `EntityAura.js`, `EntityCast.js`, `EntityDialog.js`, `EntityDisplay.js`, `EntityDropEffect.js`, `EntityEmblem.js`, `EntityLife.js`, `EntityRender.js`, `EntityRoom.js`, `EntitySound.js`, `EntityState.js`, `EntityView.js`, `EntityWalk.js`.

### Effects (`src/Renderer/Effects/`, 33 effect JS files + GLSL shaders + 9 post-processing shaders)

- **Weather:** `CloudWeatherEffect`, `PokJukWeatherEffect`, `RainWeather`, `SakuraWeatherEffect`, `SnowWeather`, `Sky`.
- **Auras & Spheres:** `GroundAura`, `SwirlingAura`, `SpiritSphere`, `WarlockSphere`, `Level99Bubble`, `QuadHorn`.
- **Ground:** `GroundEffect`, `FlatColorTile`, `PropertyGround`, `LPEffect`, `SpiderWeb`, `Tiles`.
- **Combat:** `Damage`, `MagnumBreak`, `PoisonEffect`, `MagicTarget`, `MagicRing`, `LockOnTarget`.
- **Visual & World:** `StrEffect`, `RsmEffect`, `ThreeDEffect`, `TwoDEffect`, `Cylinder`, `Songs`, `Trail`, `WaterfallEffect`.
- **Screen & Post-Processing:** `PostProcess.js` and `Effects/Shaders/` (`Blind`, `Bloom`, `CAS`, `Cartoon`, `FXAA`, `GaussianBlur`, `Upsampling`, `VerticalFlip`, `Vibrance`).
- _Known note:_ `Damage.js` and `Sky.js` contain legacy particle class management TODOs; inspect carefully when modifying.

### Map Rendering (`src/Renderer/Map/`)

- `Altitude.js`, `AnimatedModels.js`, `Effects.js`, `GridSelector.js`, `Ground.js`, `Models.js`, `OccluderFade.js`, `Sounds.js`, `Water.js` (plus `.vs`/`.fs` shaders).

### Granny3D Skeletal Models (`src/Renderer/GR2/`)

- `GR2ModelRenderer.js`, `GR2ViewerRenderer.js`, `actorAction.js`, `gr2Banks.js`, `gr2Math.js`, `gr2Pack.js`, `gr2World.js` (plus `GR2Model.vs`/`GR2Model.fs`).

---

## Playbook: Create or Modify a Renderer Effect

1. Create or update the effect module under `src/Renderer/Effects/` (and companion `.vs`/`.fs` GLSL shaders if needed).
2. Implement static lifecycle hooks (`init(gl)`, `free(gl)`, `beforeRender(gl, modelView, projection, fog, tick)`, `afterRender(gl)`) and instance methods (`init()`, `free()`, `render(gl, tick)`) consistently with neighboring effects.
3. Register the effect with `EffectManager.js` (and map it in `src/DB/Effects/` if triggered by effect IDs or skills).
4. Minimize per-frame allocations in `render()` — reuse module-scoped typed arrays/matrices and use object pooling for frequently spawned particles.
5. Ensure `free(gl)` properly releases WebGL buffers/programs/textures.
6. Add or update unit tests in `tests/renderer/` where applicable.
