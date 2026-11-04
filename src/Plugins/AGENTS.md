# AGENTS.md — Client Plugins (`src/Plugins/`)

PROHIBITED — Scope Discipline (read before anything else)

Read this file before modifying plugin loading or lifecycle behavior. This folder is the dynamic extension layer of the client: config-driven module loading and initialization. It can touch global state and runtime startup, so its contract should be understood before patching the loader.

## Topological snapshot

- `PluginManager.js` — config-based plugin resolution and initialization.
- `src/Core/Configs.js` and `ROConfig.plugins` — configuration source.
- Browser/PWA/Electron compatibility — plugin imports must remain valid across runtime targets.

Instructions for the client plugin loader and its configuration-driven lifecycle.

## Plugin Map (`src/Plugins/`)

| File               | Responsibility                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `PluginManager.js` | Reads `ROConfig.plugins`, resolves configured plugin paths, dynamically imports modules, and initializes them. |

## Invariants

- Plugin configuration is sourced from `Core/Configs.js` (`ROConfig.plugins`). Keep accepted string and `{ path, pars }` entries compatible.
- Plugins are dynamically imported as ES modules and may initialize global client state. Preserve the one-time initialization guard and report load/initialization failures explicitly.
- Plugin state is not scoped to a server selection and may not be reversible; consider cross-server effects before changing lifecycle or reload behavior.
- Preserve path resolution for browser builds and native ES module loading, including the `.js` / `.mjs` extension behavior.
