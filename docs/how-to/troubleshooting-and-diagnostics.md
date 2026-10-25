# Troubleshooting and Diagnostics

## Troubleshooting

- **Missing assets**: Verify GRF loading in Client.js, check Remote Client response
- **Packet errors**: Check PACKETVER matches server, verify PacketVersions.js, enable packetDump
- **Rendering issues**: Check WebGL capability (OpenGL ES 2.0 required), inspect Renderer.js context
- **Build errors**: Clear `dist/`, verify entry point exists in `src/App/`
- **Connection fails**: Check wsProxy configuration, firewall settings
- **Module not found**: Check path aliases in vite.config.js and file extensions

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

## Cross-Platform Gotchas

- Browser: console may be silenced by ConsoleManager — check with F12 first
- Electron: errors may appear in the Electron DevTools, not the terminal
- GRF paths: case-sensitive on Linux, case-insensitive on Windows — bugs
  that only appear on Linux deployments
