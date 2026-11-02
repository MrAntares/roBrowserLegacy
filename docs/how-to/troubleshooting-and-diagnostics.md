# Troubleshooting and Diagnostics

## Troubleshooting

| Symptom | First Checks |
| --- | --- |
| Missing assets / 404s | GRF loading in `Client.js`, Remote Client configuration/response, `windows-1252` path encoding (`docs/Encoding.md`), and filename case sensitivity on Linux/HTTP. |
| Packet / protocol errors | `[PACKETVER] Set packet version <date>` log, `PacketVersions.js`, `PacketLength.js` (`packetsYYYY_len_main.js`), `packetDump: true`, and server `packet_obfuscation` (must be disabled). |
| Broken / garbled text | Missing `userCharpage` or double decoding in `CodepageManager.js` (see `docs/Encoding.md`). |
| Rendering / blank canvas | WebGL context creation in `Renderer.js` (OpenGL ES 2.0 required), shader compile errors, or oversized sprite sheet exceeding WebGL max texture size. |
| UI element invisible / unclickable | Shadow DOM query scope (`this.getRoot()`), `:host` geometry vs inner root, `pointer-events: none` inheritance, or `WhenDrawn.js` deferred asset loading (see `src/UI/AGENTS.md`). |
| Build or test import failure | Path alias synchronization between `vite.config.js` and `applications/tools/builder-web.mjs`, and explicit `.js` extensions on imports. |
| Connection failure | `wsProxy` running and reachable for browser `socketProxy`, or `NodeSocket.js` / firewall for Electron; check `forceUseAddress: true` in container/NAT setups. |
| No console output | Check `development`, `enableConsole`, and `ConsoleManager.js` in browser or Electron DevTools. |

## Enabling Debug Output

- Set `development: true` in ROConfig to enable console output
- Set `enableConsole: true` for console without full dev mode
- Set `perfProbe: true` to measure frame times, draw calls, map loads and startup (`src/Core/PerfProbe.js`); read it in game with `/perf`
- ConsoleManager (`src/Utils/ConsoleManager.js`) silences ALL console
  output in production — if you see no logs, check these flags first

## Network Debugging

- Set `packetDump: true` in ROConfig to log all packets
- Compare hex dumps against PacketStructure.js definitions
- Check PACKETVER detection: PacketVerManager logs `[PACKETVER] Set packet version <date>` when PACKETVER is set

## Common Bug Hotspots

- **Entity state** (`src/Engine/MapEngine/Entity.js`): 5 TODOs — entity
  creation/removal edge cases, especially during map transitions
- **Effect rendering** (`src/Renderer/Effects/`): 3 TODOs — damage display
  edge cases (Damage.js) and sky rendering (Sky.js)
- **DB tables** (`src/DB/DBManager.js`): 11 TODOs — incomplete data mappings
  for newer kRO content
- **Packet handling**: Version-specific edge cases where packet structure
  changed between kRO dates

