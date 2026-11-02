# AGENTS.md — Client Plugins (`src/Plugins/`)

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
