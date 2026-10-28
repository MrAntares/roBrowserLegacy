# AGENTS.md — Database Subsystem (`src/DB/`)

Instructions for working on `DBManager.js` and game data tables (`Effects/`, `Items/`, `Jobs/`, `Map/`, `Monsters/`, `Pets/`, `Skills/`, `Status/`, `Emotions.js`, `TownInfo.js`).

## Mandatory Prerequisites

- **Character encoding & text decoding (CRITICAL):** Read [`docs/Encoding.md`](../../docs/Encoding.md) (`Utils/CodepageManager.js`). Never assume UTF-8 or use `String.fromCharCode` / raw `TextDecoder` directly on GRF text tables.
- **Lua / `.lub` table loading:** Read [`docs/LuaModuleResolution.md`](../../docs/LuaModuleResolution.md) when working on Lua-backed tables (`itemInfo.lua`/`.lub`, `skilltreeview.lub`, etc.).

---

## Core DB Invariants

1. **Do Not Change Numeric Constants Without Explicit Justification:**
    - Numeric IDs in `src/DB/` (`JobConst.js`, `SkillConst.js`, `StatusConst.js`, `StatusProperty.js`, `EmotionsConst.js`, `EquipmentLocation.js`, `ItemType.js`, `WeaponType.js`, `EffectConst.js`, `PetMessageConst.js`) are pinned by regression tests in `tests/db/`.
    - Changing an existing numeric ID breaks server protocol compatibility unless intentionally updating to match an official kRO change.
2. **Respect the Text Encoding Contract (`docs/Encoding.md`):**
    - `Client.loadFile` / `FileManager` returns raw `Uint8Array` bytes.
    - User-facing text tables (item names/descriptions, messages, skill descriptions, town info) must decode bytes with `TextEncoding.decode(buffer, userCharpage)` (`useCharPage = true` in `loadTable`).
    - GRF filesystem paths and internal lookups use `'windows-1252'`.
    - Base64-encoded CSV tables (used in newer kRO clients) decode Base64 first, then UTF-8; plain-text tables are tab/line-separated.
3. **Preserve Skill Tree Merging (`src/DB/Skills/SkillTreeMerge.js`):**
    - `SkillTreeMerge.js` merges client-supplied `skilltreeview.lub` layouts with the built-in `SkillTreeView.js` definitions (`resetSkillTree`, `keepBuiltInSkills`). Preserve fallback behavior when client files are missing or partial.
4. **Known Incomplete Areas:**
    - `src/DB/DBManager.js` contains legacy TODOs and incomplete mappings for newer kRO content; verify callers before altering existing lookup return types.

---

## Subsystem Structure (`src/DB/`)

- `DBManager.js` — Central database manager: loads text/CSV/XML/BSON/Lua tables (`MsgStringTable`, item tables, skill trees, palette probes, AI scripts) and exposes lookup helpers (`DB.getMessage()`, `DB.getItemInfo()`, `DB.formatMsgToHtml()`, `DB.INTERFACE_PATH`, etc.).
- `Effects/` — `EffectConst.js`, `EffectTable.js`, `WeatherEffect.js`.
- `Items/` — `EquipmentLocation.js`, `HatTable.js`, `ItemEffect.js`, `ItemRandomOptionTable.js`, `ItemTable.js`, `ItemType.js`, `RobeTable.js`, `ShieldTable.js`, `WeaponHitSoundTable.js`, `WeaponSoundTable.js`, `WeaponTable.js`, `WeaponTrailTable.js`, `WeaponType.js`, `WeaponTypeExpansion.js`.
- `Jobs/` — `AllMountTable.js`, `BabyTable.js`, `HairIndexTable.js`, `JobConst.js`, `JobHitSoundTable.js`, `JobNameTable.js`, `JobPropertyTable.js`, `MountTable.js`, `PalNameTable.js`, `RankingTypes.js`, `WeaponAction.js`, `WeaponJobTable.js`.
- `Map/` — `MapState.js`, `MapTable.js`, `PrivateAirship.js` (Private Airship start/end maps and payment items from `PrivateAirplane_True.lub`), `WorldMap.js`.
- `Monsters/` — `AttackEffectTable.js`, `MonsterNameTable.js`, `MonsterTable.js`, `ShadowTable.js`.
- `Pets/` — `PetAction.js`, `PetEmotionTable.js`, `PetFriendlyState.js`, `PetHungryState.js`, `PetIllustration.js`, `PetMessageConst.js`.
- `Skills/` — `CastAuraRule.js` (which skills get the element cast aura; 4th-job skills play only their own `castAuraEffectId` / `beginCastEffectId`), `SkillAction.js`, `SkillConst.js`, `SkillEffect.js`, `SkillInfo.js`, `SkillTreeMerge.js`, `SkillTreeView.js`, `SkillUnit.js`, `SkillUnitConst.js`.
- `Status/` — `StatusConst.js`, `StatusEffectTable.js` (effects drawn on an actor while a status is on), `StatusInfo.js`, `StatusProperty.js`, `StatusState.js`.
- `Emotions.js`, `EmotionsConst.js`, `TownInfo.js`.

---

## Playbook: Change a DB Table or Mapping

1. Read [`docs/Encoding.md`](../../docs/Encoding.md) if the change touches string/table parsing.
2. Trace the data source (built-in JS table vs GRF `.txt`/`.xml`/`.lua`/`.lub`), `DBManager.js` loader, caching layer, and all engine/renderer/UI consumers.
3. Check whether the format or ID mapping varies by `PACKETVER` or client episode.
4. Preserve existing constant names and return structures expected by callers.
5. Run `npx vitest run tests/db/` and add/update tests in `tests/db/` for new or modified mappings.
