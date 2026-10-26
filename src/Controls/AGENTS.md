# AGENTS.md — Input Controls (`src/Controls/`)

Instructions for keyboard, mouse, map, entity, chat-command, and screenshot controls.

## Control Map (`src/Controls/`)

| File                   | Responsibility                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `EntityControl.js`     | Entity interaction behavior mixed into `Entity`, including hover/click actions, targeting, and packets. |
| `MapControl.js`        | Map canvas and window input; movement, camera, map interaction, and drag/drop handling.                 |
| `KeyEventHandler.js`   | Keyboard event handling and normalized key identifiers used by controls and shortcuts.                  |
| `MouseEventHandler.js` | Mouse/touch event state shared by map and entity controls.                                              |
| `BattleMode.js`        | Battle-mode shortcut bindings and execution of configured commands.                                     |
| `ProcessCommand.js`    | Chat command registry, alias handling, and command dispatch to gameplay, network, and UI modules.       |
| `ScreenShot.js`        | Screenshot capture from the client view.                                                                |

## Invariants

- Preserve the entity composition model: `EntityControl.js` is installed through its initializer; do not convert it to inheritance or bypass the mixin setup.
- Trace input through its consumers. A control action can update renderer/entity state, open UI, or send a versioned network packet.
- Keep keyboard and mouse behavior consistent with focusable UI controls, chat input, mobile/touch input, and configured preferences.
- Keep chat-command registration and aliases compatible with `ProcessCommand.js` and `BattleMode.js`; avoid duplicating command dispatch logic.
- When changing map or entity input, check event registration and removal behavior as well as the effects on camera and movement state.
