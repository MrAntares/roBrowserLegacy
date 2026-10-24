# AGENTS.md — Network Subsystem (`src/Network/`)

Instructions for working on packet structures, opcode registration, packet lengths, PACKETVER version management, network connections, and socket helpers.

## Mandatory Prerequisites & References

- **Text decoding in packets:** Read [`docs/Encoding.md`](../../docs/Encoding.md) (`Utils/CodepageManager.js` — never assume UTF-8 or use `String.fromCharCode` directly on binary strings).
- **Behavioral notes for specific packets:** Check [`docs/reference/README.md`](../../docs/reference/README.md) (e.g., guild and pet packet handling in `docs/reference/guild/` and `docs/reference/pet/`).

---

## Core Network & Protocol Invariants

1. **Do Not Modify `PacketVerManager.js` Detection Logic Without Explicit Instruction:**
    - `src/Network/PacketVerManager.js` controls `PACKETVER` selection, character block-size calculation (`calculateBlockSize` / `parseCharInfo`), and `PACKETVER.addSupport` version resolution across kRO client dates. Changing detection or block-size thresholds without explicit authorization can break compatibility across 23 supported packet-version years (kRO 2003–2025).
2. **Never Generalize Away Date-Specific Protocol Layouts:**
    - Packet structures (`PacketStructure.js`), outbound packet layouts (`PacketVersions.js`), and packet byte lengths (`src/Network/Packets/packetsYYYY_len_main.js`) vary by client date (`PACKETVER`).
    - Do not infer protocol behavior from packet names alone. Trace the packet definition, version mapping, length table entry, and engine handler across the target `PACKETVER` range.
    - Verify that changes to `PacketStructure.js`, `PacketVersions.js`, or `PacketLength.js` target the exact `PACKETVER` date range and do not regress earlier or later client versions.
3. **Keep Browser and Electron Socket Implementations Compatible:**
    - Browser connections use `src/Network/SocketHelpers/WebSocket.js` and require `wsProxy` (TCP-to-WebSocket translation).
    - Electron connections use `src/Network/SocketHelpers/NodeSocket.js`, communicating over direct TCP via the Electron preload `contextBridge`.
    - Replay playback uses `src/Engine/Replay/ReplaySocket.js`.
    - All socket implementations must satisfy the shared contract expected by `NetworkManager.js`.
4. **Server Compatibility Note:**
    - Server-side `packet_obfuscation` (rAthena/Hercules) is not supported unless explicitly implemented via `PacketCrypt.js`; invalid opcodes often indicate obfuscation or a `PACKETVER` mismatch.

---

## Subsystem Overview (`src/Network/`)

- `NetworkManager.js` — Connection lifecycle, packet reading/sending loop, ping/keepalive, and `Network.hookPacket()` registration.
- `PacketStructure.js` — Packet classes (`PACKET.AC.*`, `PACKET.HC.*`, `PACKET.ZC.*`, `PACKET.CA.*`, `PACKET.CH.*`, `PACKET.CZ.*`, `PACKET.SC.*`, `PACKET.CS.*`) with `.build()` (outbound) and `.read()` (inbound) methods.
- `PacketRegister.js` — Maps numeric opcodes (`0xXXXX`) to packet constructors from `PacketStructure.js`.
- `PacketVersions.js` — Maps outbound (`CZ`, etc.) packet structures and field offsets by client date via `PACKETVER.addSupport`.
- `PacketVerManager.js` — Stores active `PACKETVER` value (from `ROConfig` `packetver` or executable PE timestamp auto-detection), resolves date-versioned packet structures, and parses version-dependent `CHARACTER_INFO` blocks.
- `PacketLength.js` — Initializes the active year's length table from `src/Network/Packets/packets2003_len_main.js` through `packets2025_len_main.js` (23 files).
- `PacketCrypt.js` — Packet key encryption support.
- `SocketHelpers/` — `WebSocket.js` (browser) and `NodeSocket.js` (Electron).

---

## Playbooks

### Implement a Packet Handler

1. **Define or update the packet schema** in `src/Network/PacketStructure.js`:
    - Inbound packets (`ZC`, `AC`, `HC`, `SC`) implement `init(fp, end)` using `BinaryReader` methods (`fp.readLong()`, `fp.readShort()`, `fp.readBinaryString()`, etc.).
    - Outbound packets (`CZ`, `CA`, `CH`, `CS`) implement `build()` using `BinaryWriter`.
2. **Map the opcode** in `src/Network/PacketRegister.js` (for inbound packets).
3. **Add or update packet lengths** in the relevant `src/Network/Packets/packetsYYYY_len_main.js` file(s) (`-1` for variable-length packets whose bytes 2–3 carry the packet length).
4. **For outbound `CZ` packets**, add or update the date-specific definitions in `src/Network/PacketVersions.js` as required.
5. **Implement the handler** in the appropriate engine module and register it via `Network.hookPacket(PACKET.<FAMILY>.*, handler)`:
    - `PACKET.ZC.*` → `src/Engine/MapEngine.js` or `src/Engine/MapEngine/*.js`
    - `PACKET.AC.*` / `PACKET.SC.*` → `src/Engine/LoginEngine.js`
    - `PACKET.HC.*` → `src/Engine/CharEngine.js` (and `MapEngine` where applicable)
6. **Trace version variations:** Check whether the opcode is reused or superseded in newer/older `PACKETVER` dates.
7. **Validate:** Test with `packetDump: true` in `ROConfig` and add/update unit tests in `tests/network/` (using synthetic `ArrayBuffer`/`BinaryReader` fixtures).

### Add a Packet Version Year

1. Create `src/Network/Packets/packetsYYYY_len_main.js` (e.g., `packets2026_len_main.js`) defining lengths for all known packets required by the client.
2. Update explicit module imports, `packetModules` map, and the `years` array in `src/Network/PacketLength.js`.
3. Update `src/Network/PacketVerManager.js` only if character block sizes or version ranges changed for the new year (do not alter existing detection behavior without explicit instruction).
4. Review `src/Network/PacketVersions.js` and `src/Network/PacketStructure.js` for new date-gated structures.
5. Add unit tests in `tests/network/` and test against a server configured with the matching `PACKETVER` when possible.

---

## Diagnostics

- Set `packetDump: true` in `ROConfig` to dump hex bytes of sent/received packets and compare them against `PacketStructure.js`.
- Verify `[PACKETVER] Set packet version <date>` and `[Network] Packet Length initialized <date>` in the console when investigating protocol errors or stream desynchronization.
