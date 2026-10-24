# AGENTS.md — Engine Subsystem (`src/Engine/`)

Instructions for working on `GameEngine.js`, `LoginEngine.js`, `CharEngine.js`, `MapEngine.js`, the 29 `src/Engine/MapEngine/` subsystems, `SessionStorage.js`, `Replay/`, and `State/`.

## Mandatory References

- **Packet handlers & PACKETVER routing:** Read [`src/Network/AGENTS.md`](../Network/AGENTS.md).
- **UI component integration:** Read [`src/UI/AGENTS.md`](../UI/AGENTS.md) and [`docs/UIComponent_to_GUIComponent.md`](../../docs/UIComponent_to_GUIComponent.md).
- **Original Windows client behavioral notes:**
    - Guild systems (`src/Engine/MapEngine/Guild.js`): [`docs/reference/guild/README.md`](../../docs/reference/guild/README.md)
    - Pet systems (`src/Engine/MapEngine/Pet.js`): [`docs/reference/pet/README.md`](../../docs/reference/pet/README.md)
    - Chat parsing: [`docs/reference/chat/README.md`](../../docs/reference/chat/README.md)

---

## Core Engine Invariants

1. **Packet-to-Engine Routing:**
    - Register inbound packet handlers via `Network.hookPacket(PACKET.<FAMILY>.*, handler)` in the owning engine:
        - `PACKET.AC.*` / `PACKET.SC.*` → `LoginEngine.js`
        - `PACKET.HC.*` → `CharEngine.js` (and `MapEngine` where cross-server packets apply)
        - `PACKET.ZC.*` → `MapEngine.js` or the corresponding `src/Engine/MapEngine/*.js` subsystem
    - Outbound packets (`PACKET.CA.*`, `PACKET.CH.*`, `PACKET.CZ.*`, `PACKET.CS.*`) are instantiated, populated, and sent via `Network.sendPacket(pkt)`. Always verify `PACKETVER`-dependent fields in `src/Network/PacketVersions.js` and `PacketStructure.js`.
2. **Entity Lifecycle & Map Transitions (`src/Engine/MapEngine/Entity.js`):**
    - `src/Engine/MapEngine/Entity.js` manages unit spawning, status updates, actions, and removal based on server packets.
    - Inspect creation, removal, and map-teleport cleanup carefully—this file contains known edge cases around attack/damage miss, status handling, floor footprints, cast bar progress,pending transformations, and NPC minimap mark cleanup.
3. **Versioned UI Selection:**
    - When opening or updating versioned UI families from `MapEngine`, `LoginEngine`, or `CharEngine`, interact through the `UIVersionManager` controller (`Component.selectUIVersion()`, `Component.getUI()`) rather than hardcoding a single version sibling (`V0`, `V1`, etc.).
4. **Original Client Deviations:**
    - Before changing subtle gameplay/UI behaviors in `Guild.js`, `Pet.js`, or chat handling, check `docs/reference/` to see whether the current implementation matches a verified Windows client behavior or an intentional documented deviation.

---

## Subsystem Inventory (`src/Engine/`)

### Top-Level Engine Modules

- `GameEngine.js` — Root orchestrator: initializes configuration (`ROConfig`), loads GRF/executable files via `Client`, sets `PACKETVER`, initializes `DBManager`, `SoundManager`, `BGM`, `UIManager`, and transitions to `LoginEngine`.
- `LoginEngine.js` — Server selection, authentication (`PACKET.CA.*` / `PACKET.AC.*`), `PACKETVER` initialization, and transition to `CharEngine`.
- `CharEngine.js` — Character list, creation, deletion, pincode, and map-server handoff (`PACKET.CH.*` / `PACKET.HC.*`).
- `MapEngine.js` — Map entry orchestration, map loading, player entity setup, UI initialization, and sub-engine registration.
- `SessionStorage.js` — Runtime session state (`Session.Entity`, `Session.Character`, `Session.AuthCode`, `Session.AID`, `Session.GID`, party/guild/companion flags).
- `Replay/` — `ReplayParser.js`, `ReplayPlayer.js`, `ReplaySocket.js`, `ReplayTypes.js` (`.rrec` packet replay support).
- `State/` — `VisitedMaps.js` (map visitation state persistence).

### MapEngine Subsystems (`src/Engine/MapEngine/`, 29 files)

- **Core Loop & State:** `Main.js` (player stats, status properties, server tick, warp/restart), `MapState.js` (map flags/state), `UIOpen.js` (server-triggered UI window lifecycle).
- **Entities & Combat:** `Entity.js` (unit spawn/move/action/vanish/status/effects), `Skill.js` (skill list, casting, ground skills, auto-spell), `OffhandWeapon.js` (dual-wield / offhand weapon vs shield resolution).
- **Items & Storage:** `Item.js` (pickup, drop, inventory, equipment, cards, refine, reform, enchant, Laphine), `Storage.js` (Kafra/guild storage).
- **NPC & Commerce:** `NPC.js` (dialogs, menus, inputs, cutins, progress bars, navigation), `Store.js` (NPC buy/sell, vending, buying store), `Trade.js` (player-to-player trade), `CashShop.js`, `Bank.js`, `Roulette.js`.
- **Social & Communication:** `Group.js` (party), `Guild.js` (guild info, members, grades, skills, emblems, alliances), `Clan.js`, `Friends.js`, `PrivateMessage.js` (whispers), `ChatRoom.js`.
- **Messaging & Progress:** `Mail.js`, `Rodex.js`, `Quest.js`, `Achievement.js`.
- **Companions:** `Homun.js`, `Pet.js`, `Mercenary.js`.
- **Security & Timers:** `Captcha.js`, `PCGoldTimer.js`.
