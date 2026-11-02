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
- Add on specified *Engine: `Component.append()`. Remove: `Component.remove()`.
- Add `show()`, `hide()` — runtime show and hide UI in specified buttons or add in `src/Controls/ProcessCommand.js` only if needed.
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