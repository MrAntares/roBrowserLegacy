# Network Packet Development

## Implementing a New Packet Handler

1. Define packet structure in `src/Network/PacketStructure.js`
2. Map packet opcode ID to structure in `src/Network/PacketRegister.js`
3. Define packet length in `src/Network/Packets/packetsYYYY_len_main.js` (and add date-specific tables in `src/Network/PacketVersions.js` if outbound CZ packet)
4. Implement handler in appropriate engine (`MapEngine`, `LoginEngine`, `CharEngine`, etc.) and hook with `Network.hookPacket(PACKET.<FAMILY>.*, handler)` (e.g., `PACKET.ZC.*` for MapEngine, `PACKET.AC.*` / `PACKET.SC.*` for LoginEngine, `PACKET.HC.*` for CharEngine)
5. Test with `packetDump: true` enabled in config

## Adding a New Packet Version

1. Create file in `src/Network/Packets/` (e.g., `packets2026_len_main.js`)
2. Define packet lengths for all known packets in that version
3. Update `PacketLength.js` (add module import and year range) and `PacketVerManager.js`
4. Test against server with matching PACKETVER
