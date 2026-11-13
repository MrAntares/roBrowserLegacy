# Custom Overrides

This folder allows you to override any module from `src/` without modifying the
upstream code—helping to avoid merge conflicts when updating roBrowser.

## How it works

`.js` files placed here—**mirroring the structure of `src/`**—replace the
original modules during the build or development process. Mapping is based on
the alias directory names (e.g., `UI`, `Core`, `DB`, `Engine`, etc.—the same
ones defined in `aliases.json`).

| File in `custom/`                         | Overrides the import               |
| ----------------------------------------- | ---------------------------------- |
| `custom/UI/Components/Intro/Intro.js`     | `UI/Components/Intro/Intro.js`     |
| `custom/UI/Components/ChatBox/ChatBox.js` | `UI/Components/ChatBox/ChatBox.js` |
| `custom/Core/Thread.js`                   | `Core/Thread.js`                   |
| `custom/DB/DBManager.js`                  | `DB/DBManager.js`                  |

When starting the development server or running a build, any active overrides
are listed in the console:

```
[custom] overrides:
UI/Components/Intro/Intro.js → .../custom/UI/Components/Intro/Intro.js
```

## Adding an override

1. Copy the original file from `src/`, maintaining its relative path:

```
src/UI/Components/Intro/Intro.js
→
custom/UI/Components/Intro/Intro.js
```

2. Edit the file within the `custom/` directory as needed.

3. **Restart the development server**—the `custom/` folder is only scanned
   during Vite's startup. Once started, any subsequent edits to these custom
   files will trigger HMR (Hot Module Replacement) or a reload as usual.

## Limitations

- **Vite / web build:** only alias imports (`import x from 'UI/...'`) are
  overridden. Relative imports inside `src/` (`import './Foo.js'`) still load
  the original.
- **Electron:** any request for a `src/` file with a counterpart in `custom/`
  serves the custom version, including relative imports inside `src/`.
- Overrides replace the file entirely; importing the original from inside an
  override is not supported.

#### Assets (.html, .css)

Only `.js` files are aliased. If your override imports assets via relative  
paths (`import html from './Intro.html'`), copy those files into `custom/`  
alongside the `.js`. Importing an asset via alias (`UI/.../Intro.html`)  
loads the **original** file—useful when you only want to change logic.
