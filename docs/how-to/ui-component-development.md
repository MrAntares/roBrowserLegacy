# UI Component Development

## Adding a New UI Component

**All components use GUIComponent (Shadow DOM):**

1. Create directory in `src/UI/Components/NewComponent/`
2. Create `NewComponent.js`, `NewComponent.html`, `NewComponent.css`
3. Instantiate `new GUIComponent('Name', cssText)` with `Component.render = () => htmlText`
4. Use Custom Elements (`<ui-button>`, `<ui-text>`, `<ui-image>`) instead of `data-*` attributes
5. CSS: dimensions/position on `:host`, inner layout on `#Name`
6. Register with `UIManager.addComponent(Component)`
7. Add keyboard shortcut in `src/Controls/ProcessCommand.js` if needed

Consult **L1** [UIComponent_to_GUIComponent.md](../UIComponent_to_GUIComponent.md) first; fall back to **L2** [UIComponent_to_GUIComponent_Firmware.md](../UIComponent_to_GUIComponent_Firmware.md) for quick lookups and **L0** [UIComponent_to_GUIComponent_Scars.md](../UIComponent_to_GUIComponent_Scars.md) for historical edge cases. See [CustomElements.md](../CustomElements.md) for element reference.

## Deduplicating Versioned Components

**Before starting, you MUST read [GUIComponent_Version_Dedup_Factory.md](../GUIComponent_Version_Dedup_Factory.md) — it contains invariants that cannot be violated.**

All 13 existing versioned component families (`BasicInfo`, `CharCreate`, `CharSelect`, `Equipment`, `Inventory`, `MiniMap`, `PartyFriends`, `PlayerViewEquip`, `Quest`, `SkillList`, `Storage`, `WinLogin`, `WinStats`) have been unified into `*Common.js` factories. For any new multi-version components:

1. Create a `ComponentNameCommon.js` in the component folder
2. Export `createComponentName({ name, htmlText, cssText, ...flags })`
3. Move shared JS into the factory, parametrizing version differences with flags
4. Thin each version file to imports + `createComponentName(...)`
