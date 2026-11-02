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

## Diagnostics

- Set `packetDump: true` in `ROConfig` to dump hex bytes of sent/received packets and compare them against `PacketStructure.js`.
- Verify `[PACKETVER] Set packet version <date>` and `[Network] Packet Length initialized <date>` in the console when investigating protocol errors or stream desynchronization.
