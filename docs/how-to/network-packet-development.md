# Network Packet Development

## Packet implementation workflow:
 
1. Define or update the schema in `PacketStructure.js`. 
2. Map the opcode in `PacketRegister.js`. 
3. Define packet lengths in `Packets/` and, when needed, outbound packet definitions in `PacketVersions.js`. 
4. Hook the response through `Network.hookPacket(PACKET.<FAMILY>.*, handler)` in the appropriate engine. 
 
Typical families include `PACKET.ZC.*` for `MapEngine`, `PACKET.AC.*` and `PACKET.SC.*` for `LoginEngine`, and `PACKET.HC.*` for `CharEngine`. 

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