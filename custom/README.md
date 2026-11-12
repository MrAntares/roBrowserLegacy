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
   files will trigger HMR (Hot Module Replacement) or a reload as usual. ## Extending instead of copying

To reuse the original module while modifying only specific parts, import it using a
**relative path** (relative imports bypass the alias, preventing recursion):

```js
// custom/UI/Components/Intro/Intro.js
import VanillaIntro from '../../../../src/UI/Components/Intro/Intro.js';

const Intro = Object.create(VanillaIntro);

Intro.onAppend = function () {
	VanillaIntro.onAppend.call(this);
	// your customizations...
};

export default Intro;
```

## Limitations

- **Only intercepts imports via alias** (e.g., `import x from 'UI/...'`). Internal
  relative imports within `src/` (e.g., `import './Foo.js'`) are not affected.
- Overrides apply to the **entire file**—there is no automatic partial merging.
- If the upstream source changes the original module's API, the override may break
  at runtime (this will not trigger a merge conflict; be sure to review after updates).
- Adding or removing files in `custom/` requires a restart of the development server.
