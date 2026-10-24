# AGENTS.md — UI Subsystem (`src/UI/`)

Instructions for working on the UI subsystem, components (`src/UI/Components/`), custom elements (`src/UI/Elements/`), and UI managers.

## Mandatory Prerequisites

Before modifying or creating UI components, read the applicable reference guides:

- **Creating, modifying, or debugging any UI component:** [`docs/UIComponent_to_GUIComponent.md`](../../docs/UIComponent_to_GUIComponent.md) (L1 Primary Operational Memory — invariants, lifecycle, Shadow DOM rules, failure matrix).
- **Rapid pattern & reflex lookup:** [`docs/UIComponent_to_GUIComponent_Firmware.md`](../../docs/UIComponent_to_GUIComponent_Firmware.md) (L2) and [`docs/UIComponent_to_GUIComponent_Scars.md`](../../docs/UIComponent_to_GUIComponent_Scars.md) (L0 historical edge cases).
- **Versioned component families (`*Common.js` factories):** [`docs/GUIComponent_Version_Dedup_Factory.md`](../../docs/GUIComponent_Version_Dedup_Factory.md).
- **Custom Elements (`<ui-button>`, `<ui-text>`, `<ui-image>`):** [`docs/CustomElements.md`](../../docs/CustomElements.md).
- **Custom Scrollbars:** [`docs/Scrollbar.md`](../../docs/Scrollbar.md).
- **Original client behavior notes:** [`docs/reference/chat/README.md`](../../docs/reference/chat/README.md) (`ChatBox`) and [`docs/reference/guild/README.md`](../../docs/reference/guild/README.md) (`Guild` & `GuildCompanion`).

---

## Core UI Invariants

1. **`GUIComponent` Only:** All 100 UI components use `GUIComponent` with Shadow DOM, native DOM, and Custom Elements. Never reintroduce the removed legacy `UIComponent` or jQuery DOM patterns.
2. **Registration:** `UIManager.addComponent()` requires a `GUIComponent` instance.
3. **Shadow DOM Isolation:** Query internal nodes via `this.getRoot().querySelector(...)` or `ComponentName.getRoot().querySelector(...)`. Never use `document.querySelector()` for shadow content.
4. **Native DOM Ownership:** The `this.ui` proxy on `GUIComponent` provides a minimal jQuery-compatible API for legacy external interop only; internal component code must use native DOM APIs directly.
5. **Geometry Authority:** Put external dimensions and positioning (`top`, `left`, `width`, `height`) on `:host`; put internal layout rules on `#ComponentName`. Do not duplicate identical dimensions on both `:host` and the inner root, and do not set `position`/`z-index` on `:host` (JS sets `absolute`/`z-index: 50` in `prepare()`).
6. **Lifecycle Separation:**
    - `init()`: Bind event listeners once, register drag behavior, establish one-time DOM references, set initial inline visibility (toggle components only; never hide on-demand components in `init()`).
    - `onAppend()`: Restore position/preferences, sync runtime layout, apply global side effects. Never rebind event listeners here.
    - `onRemove()`: Save preferences, clean up external listeners and side effects.
7. **Asset-Driven Rendering:** Window frames, buttons, and backgrounds come from BMP/TGA images inside GRF files (loaded via `Client.loadFile` and `DBManager.INTERFACE_PATH`). Window art waits for `WhenDrawn.js` before fetching when hidden. Prefer `<ui-button>`, `<ui-text>`, and `<ui-image>` (importing `UI/Elements/Elements.js`) over legacy `data-*` attributes handled by `GUIComponent.processDataAttrs()`.
8. **Visibility & Events:** Manage runtime visibility with explicit inline `style.display` (never jQuery `.show()`/`.hide()`). Use `element.isConnected` instead of `closest('body')`. Replace `return false` with explicit `e.preventDefault(); e.stopImmediatePropagation();`. Suppress native context menus on right-click (`contextmenu` listener).
9. **Input Protection:** Components containing `<input>`, `<select>`, or `<textarea>` must set `captureKeyEvents = true` and guard `onKeyDown` with `this.isEditableFocused()`.
10. **Text Formatting:** Use `DB.formatMsgToHtml()` + `innerHTML` for RO text containing color codes (`^RRGGBB`) or markup; use `textContent` for plain text. Decode bytes using `Utils/CodepageManager.js` (see [`docs/Encoding.md`](../../docs/Encoding.md)).
11. **Drag-and-Drop Global Exception:** `window._OBJ_DRAG_` is a shared cross-component drag-and-drop payload contract used across ~20 components because HTML5 `dataTransfer` cannot be read during `dragover`. Do not remove it piecemeal in single-component edits.

---

## Playbooks

### Add a UI Component

UI uses `GUIComponent` (Shadow DOM) + Custom Elements. No legacy `data-*` UI patterns.

#### DSL

- `new GUIComponent('Name', cssText)` — constructor takes name + CSS only.
- `Component.render = () => htmlText` — HTML returned as a string (required).
- Markup: `<ui-button bg hover down>`, `<ui-text msg>`, `<ui-image src>` (import `UI/Elements/Elements.js`; see [`docs/CustomElements.md`](../../docs/CustomElements.md)).
- CSS: dimensions/position on `:host`; inner layout on `#Name`. Do not set `position`/`z-index` on `:host` (JS sets `absolute`/`z-index: 50` in `prepare()`).
- Query internals with `this.getRoot().querySelector(...)`; never query `document`. `this.ui` is jQuery-compat interop only — don't use for new code.
- `Component.mouseMode = GUIComponent.MouseMode.{CROSS|STOP|FREEZE}`; `needFocus`.

#### Auto-bound hooks (define only what you need)

- `render()` — returns HTML string. Required.
- `init()` — runs ONCE in `prepare()`; host briefly in DOM. One-time setup/binding.
- `onAppend()` — runs EVERY `append()`; position restore, per-show work.
- `onRemove()` — runs EVERY `remove()`; save prefs, cleanup.
- `onKeyDown` — if present, auto-bound on `append` / unbound on `remove`.
- `onResize()`, `onRestore()` — called when defined.

#### Register, mount & test

- `export default UIManager.addComponent(Component);`
- Show: `Component.append(target?)` (default `document.body`; target = element or selector). Hide: `Component.remove()`.
- Keyboard shortcut: add in `src/Controls/ProcessCommand.js` only if needed.
- Files: `src/UI/Components/Name/Name.{js,html,css}` (additional reference: [`docs/Scrollbar.md`](../../docs/Scrollbar.md)).
- Add or update tests in `tests/ui/` and verify the relevant UI/version lifecycle.

### Deduplicate Versioned UI Components into a Shared Factory

**Mandatory:** Read [`docs/GUIComponent_Version_Dedup_Factory.md`](../../docs/GUIComponent_Version_Dedup_Factory.md) before making changes.

Existing unified families (13/13) include `BasicInfo`, `CharCreate`, `CharSelect`, `Equipment`, `Inventory`, `MiniMap`, `PartyFriends`, `PlayerViewEquip`, `Quest`, `SkillList`, `Storage`, `WinLogin`, and `WinStats`.

For a new multi-version component family or version sibling:

1. Create `ComponentNameCommon.js` in the component directory exporting `createComponentName({ name, htmlText, cssText, ...flags })`.
2. Declare all per-instance state inside `createComponentName` (never at module scope shared across versions).
3. Move shared logic into the factory and represent real, pre-existing version differences through explicit capability flags.
4. Keep each version-specific module thin (imports + `createComponentName(...)` call).
5. Preserve each version's exact component `name` string, `Preferences.get(...)` keys, and `versionInfo` PACKETVER mappings in `UIVersionManager`.
6. Add or update tests in `tests/ui/`.

---

## Subsystem Inventory

### Core UI Modules (`src/UI/`)

- `UIManager.js` — Component registration, modal overlays, popup management, global `Common.css` injection.
- `UIVersionManager.js` — PACKETVER and game-mode (`re`/`prere`/`common`/`job`) UI version selection and controller delegation.
- `GUIComponent.js` — Shadow DOM base class (`prepare`, `append`, `remove`, `focus`, `draggable`, `clone`, `getRoot`, `isEditableFocused`).
- `Elements/` — `Elements.js`, `UIButton.js` (`<ui-button>`), `UIText.js` (`<ui-text>`), `UIImage.js` (`<ui-image>`).
- `Common.css` — Shared baseline styles injected into both document head and each component's Shadow DOM.
- `CursorManager.js`, `Scrollbar.js`, `Background.js`, `TouchDrag.js`, `ClampToViewport.js`, `WhenDrawn.js`.

### Component Categories (`src/UI/Components/`, 100 directories)

- **Entry & Auth:** `Intro`, `WinList`, `WinLogin`, `CharCreate`, `CharSelect`, `PincodeWindow`.
- **Character & Status:** `BasicInfo`, `WinStats`, `StatusIcons`, `Sense`.
- **Items & Storage:** `Inventory`, `Equipment`, `SwitchEquip`, `PlayerViewEquip`, `Storage`, `Bank`, `CashShop`, `CashShopIcon`, `CartItems`, `ChangeCart`, `CartDecoration`, `CardIllustration`, `ItemInfo`, `ItemObtain`, `ItemPreview`, `ItemSelection`, `ItemCompare`.
- **Crafting & Upgrade:** `Refine`, `RefineWeaponSelection`, `Enchant`, `EnchantGrade`, `ItemReform`, `LaphineSys`, `LaphineUpg`, `MakeArrowSelection`, `MakeItemSelection`, `MakeReadBook`.
- **Skills & Combat:** `SkillList`, `SkillListMH`, `SkillDescription`, `SkillTargetSelection`, `ShortCut`, `ShortCuts`, `ShortCutOption`.
- **Communication:** `ChatBox`, `ChatBoxSettings`, `ChatRoom`, `ChatRoomCreate`, `WhisperBox`, `Emoticons`, `Announce`.
- **NPC, Quests & Commerce:** `NpcBox`, `NpcStore`, `NpcMenu`, `Quest`, `Trade`, `Vending`, `VendingShop`, `VendingReport`, `Mail`, `Rodex`, `RodexIcon`, `Roulette`, `SlotMachine`.
- **Social & Companions:** `PartyFriends`, `Guild`, `Clan`, `EntityRoom`, `HomunInformations`, `MercenaryInformations`, `PetInformations`, `PetEvolution`.
- **Navigation:** `MiniMap`, `WorldMap`, `Navigation`, `MapName`.
- **System, Settings & Overlays:** `GraphicsOption`, `SoundOption`, `FPS`, `Escape`, `Error`, `WinPopup`, `WinPrompt`, `Captcha`, `CheckAttendance`, `Reputation`, `PvPCount`, `PvPTimer`, `PCGoldTimer`, `ContextMenu`, `EntitySignboard`, `JoystickUI`, `MobileUI`.
- **Asset Viewers:** `GrfViewer`, `ModelViewer`, `StrViewer`, `EffectViewer`, `GrannyModelViewer`.
