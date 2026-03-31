# REVIEW.md — AMD to ES6 Modules Conversion

## 1. Executive Summary

The **roBrowserLegacy** repository has successfully completed the migration from **AMD (RequireJS)** module system to native **ES6 Modules**. There are no remaining `define()` or `require([])` calls in the main source code (`src/`). The bundler was replaced from RequireJS to **Vite**, and `package.json` declares `"type": "module"`.

However, the migration was **partial in scope** — while the module system was fully converted, the code itself still relies heavily on pre-ES6 idioms (constructor functions, object-literal singletons, `jQuery.Deferred`, no arrow functions, no template literals, no `async`/`await`, no classes). A second phase of modernization is needed to bring the codebase fully into modern JavaScript.

---

## 2. Current Migration Status

### 2.1 AMD Pattern Eliminated

| AMD Pattern                        | Occurrences in `src/` |
| ---------------------------------- | --------------------- |
| `define([...], function(...) {})`  | **0**                 |
| `require([...], function(...) {})` | **0**                 |
| `requirejs(...)`                   | **0**                 |

The module system conversion is **100% complete**.

### 2.2 ES6 Pattern Adopted

All files in `src/` use `import`/`export`:

```javascript
// Example: src/App/Online.js
import GameEngine from 'Engine/GameEngine.js';
import Plugins from 'Plugins/PluginManager.js';

export const roInitSpinner = { ... };
```

```javascript
// Example: src/Network/NetworkManager.js
import Configs from 'Core/Configs.js';
import BinaryReader from 'Utils/BinaryReader.js';
import PACKETVER from './PacketVerManager.js';
import PacketVersions from './PacketVersions.js';
```

### 2.3 Export Types Used

| Type                      | Example                               | Usage                                                     |
| ------------------------- | ------------------------------------- | --------------------------------------------------------- |
| `export default function` | `BinaryReader.js`                     | Modules with a single main export (constructor functions) |
| `export default` (object) | `NetworkManager.js`, `FileManager.js` | Singletons / namespaces                                   |
| `export const` (named)    | `BinaryReader.js` (`SEEK_CUR`, etc.)  | Constants and multiple exports                            |
| `export const` (multiple) | `Songs.js`                            | Modules with several named exports                        |
| `export { }` (re-export)  | `UIVersionManager.js`                 | Component re-exports                                      |

---

## 3. Module Resolution System

### 3.1 Path Aliases (Vite)

The RequireJS `paths` config was replaced by aliases in `vite.config.js`:

```javascript
resolve: {
    alias: {
        'jquery': path.resolve(__dirname, 'src/Vendors/jquery-1.9.1.js'),
        App: path.resolve(__dirname, './src/App'),
        Audio: path.resolve(__dirname, './src/Audio'),
        Controls: path.resolve(__dirname, './src/Controls'),
        Core: path.resolve(__dirname, './src/Core'),
        // ... 14 aliases total
    }
}
```

This allows imports like `import X from 'Utils/X.js'` instead of relative paths (`../../Utils/X.js`), preserving the ergonomics that RequireJS `paths` provided.

### 3.2 Import Convention

The project guidelines state:

> _"Use ES6 `import`/`export` syntax (no AMD `define()`/`require()`)"_
> _"Use path aliases for imports (e.g., `import X from 'Utils/X.js'`) instead of relative paths"_

---

## 4. Technical Debt: Pre-ES6 Idioms Still in Use

The module system was migrated, but the code inside the modules was largely left untouched. The following patterns are outdated and should be modernized.

### 4.1 Object-Literal Singletons (Should Be Classes)

Many modules use the **object literal singleton** pattern instead of ES6 classes:

```javascript
// src/Core/FileManager.js
const FileManager = {};
FileManager.remoteClient = '';
FileManager.gameFiles = [];
// ... methods assigned to the object
export default FileManager;
```

```javascript
// src/UI/UIManager.js
const UIManager = {};
UIManager.components = {};
UIManager.addComponent = function addComponent(component) { ... };
```

**Recommendation:** Convert to ES6 `class` with static methods, or instantiated singletons. This improves readability, enables IDE autocompletion, and makes inheritance explicit.

### 4.2 Constructor Functions (Should Be Classes)

```javascript
// src/UI/UIComponent.js
function UIComponent(name, htmlText, cssText) {
	this.name = name;
	this._htmlText = htmlText || null;
	// ...
}
```

**Recommendation:** Convert to `class UIComponent { constructor(...) { ... } }`. All constructor functions with prototype methods should be migrated to classes.

### 4.3 No Arrow Functions, No Template Literals, No Async/Await

The project currently prohibits arrow functions, template literals, and `async`/`await`.

**Recommendation:** These restrictions should be lifted. Arrow functions, template literals, and `async`/`await` are standard JavaScript features supported by all modern browsers and Node.js. They improve readability, reduce boilerplate, and are expected by any developer joining the project. The `jQuery.Deferred` pattern should be replaced with native `Promise` and `async`/`await`.

### 4.4 Global Assignments

Some constants are exported via ES6 **and** assigned to the global scope for Web Worker compatibility:

```javascript
// src/Utils/BinaryReader.js
export const SEEK_CUR = 1;
export const SEEK_SET = 2;
export const SEEK_END = 3;

const _global = typeof self !== 'undefined' ? self : window;
_global.SEEK_CUR = SEEK_CUR;
_global.SEEK_SET = SEEK_SET;
_global.SEEK_END = SEEK_END;
```

**Recommendation:** Refactor all consumers to use explicit ES6 imports and remove global assignments entirely.

### 4.5 `self.requireNode` (NW.js)

A few files use `self.requireNode` for Node.js API access in the NW.js desktop environment:

```javascript
// src/Core/FileManager.js
const fs = self.requireNode && self.requireNode('fs');
```

**Assessment:** This is a platform requirement for NW.js, not an AMD remnant. Acceptable as-is.

### 4.6 Vendors with CommonJS

Files in `src/Vendors/` contain internal `module.exports` and `require()` calls (70+ occurrences in `iconv-lite.js`), but these are bundled third-party libraries and are excluded from ESLint.

**Assessment:** Acceptable. Vendors are third-party bundles and should not be modified.

---

## 5. Build Infrastructure

### 5.1 Before (AMD/RequireJS)

| Aspect  | AMD (original roBrowser)                                         |
| ------- | ---------------------------------------------------------------- |
| Loader  | RequireJS (`require.js`)                                         |
| Config  | `require.config({ paths: {...} })`                               |
| Modules | `define(['dep1', 'dep2'], function(dep1, dep2) { return ...; })` |
| Build   | r.js optimizer                                                   |

### 5.2 After (ES6/Vite)

| Aspect     | ES6 (roBrowserLegacy)                              |
| ---------- | -------------------------------------------------- |
| Loader     | Native browser (`<script type="module">`)          |
| Config     | `vite.config.js` with `resolve.alias`              |
| Modules    | `import X from 'Path/X.js'; export default ...;`   |
| Build      | Vite + Rollup + custom builder (`builder-web.mjs`) |
| Dev Server | `vite` (native HMR)                                |
| Package    | `"type": "module"` in `package.json`               |

---

## 6. Modernization Roadmap

The AMD-to-ES6 module conversion was Phase 1. The following is the recommended Phase 2 to fully modernize the codebase.

### 6.1 High Priority

| Task                                                | Scope                                         | Impact                                               |
| --------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| **Lift arrow function restriction**                 | All `src/` files                              | Cleaner callbacks, shorter syntax, lexical `this`    |
| **Lift template literal restriction**               | All `src/` files                              | Readable string interpolation, multi-line strings    |
| **Adopt `async`/`await`**                           | Network, FileManager, Loaders                 | Eliminates callback hell, replaces `jQuery.Deferred` |
| **Replace `jQuery.Deferred` with native `Promise`** | Core, Network, Engine                         | Removes jQuery dependency for async flow             |
| **Convert constructor functions to `class`**        | `UIComponent`, `BinaryReader`, `Entity`, etc. | Modern OOP, better tooling support                   |

### 6.2 Medium Priority

| Task                                             | Scope                                              | Impact                                        |
| ------------------------------------------------ | -------------------------------------------------- | --------------------------------------------- |
| **Convert object-literal singletons to classes** | `FileManager`, `UIManager`, `NetworkManager`, etc. | Clearer structure, IDE support                |
| **Eliminate global assignments**                 | `BinaryReader.js`, `ROConfig`, etc.                | Proper encapsulation                          |
| **Use dynamic `import()`**                       | UI components, effects                             | Lazy-loading, better initial load performance |
| **Use destructuring and spread operators**       | Throughout codebase                                | Cleaner data manipulation                     |

### 6.3 Not Recommended

| Task                      | Reason                                   |
| ------------------------- | ---------------------------------------- |
| Modify vendor files       | Third-party bundles, should remain as-is |
| Remove `self.requireNode` | NW.js platform requirement               |

---

## 7. Conversion Metrics

| Metric                                         | Value                                                                                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Files with `import` in `src/`                  | ~400+                                                                                                                                         |
| Files with `export default` in `src/`          | ~300+                                                                                                                                         |
| Files with `export const`/`export {`           | ~40+                                                                                                                                          |
| Occurrences of `define()`                      | **0**                                                                                                                                         |
| Occurrences of AMD `require([])`               | **0**                                                                                                                                         |
| Occurrences of `module.exports` (vendors only) | ~79                                                                                                                                           |
| Path aliases configured                        | 14                                                                                                                                            |
| Subsystems migrated                            | 14 (`App`, `Audio`, `Controls`, `Core`, `DB`, `Engine`, `Loaders`, `Network`, `Plugins`, `Preferences`, `Renderer`, `UI`, `Utils`, `Vendors`) |

---

## 8. Conclusion

The AMD to ES6 Modules migration (Phase 1) is **complete** — zero AMD patterns remain in the source code. The Vite build system with path aliases provides a modern development experience with HMR and tree-shaking.

However, the modernization is **incomplete**. The code inside the modules still uses pre-ES6 idioms: constructor functions instead of classes, `jQuery.Deferred` instead of `async`/`await`, verbose `function` expressions where arrow functions would suffice, and string concatenation where template literals would be clearer. These restrictions were originally imposed for "consistency" but now represent technical debt that makes the codebase harder to read, maintain, and contribute to.

**Phase 2 should focus on adopting the full modern JavaScript feature set** — arrow functions, template literals, `async`/`await`, classes, destructuring, and native Promises — bringing the code quality in line with the already-modern module system and build tooling.
