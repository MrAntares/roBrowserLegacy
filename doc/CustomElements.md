## Custom Elements Reference

### Overview

Custom Elements replace the `data-*` attribute system (`data-background`, `data-hover`, `data-down`, `data-active`, `data-text`, `data-preload`) that was processed by `UIComponent.parseHTML()` (jQuery-based). They are registered once via `import 'UI/Elements/Elements.js'` and work inside Shadow DOM without any jQuery dependency.

All custom elements live in `src/UI/Elements/`:

```
src/UI/Elements/
├── Elements.js      ← imports and registers all elements
├── ROButton.js      ← <ro-button>
├── ROText.js        ← <ro-text>
└── ROImage.js       ← <ro-image>
```

### Existing Elements

#### `<ro-button>` — replaces `<button data-background data-hover data-down>`

```html
<!-- Before (UIComponent) -->
<button data-background="btn_ok.bmp" data-hover="btn_ok_a.bmp" data-down="btn_ok_b.bmp">OK</button>

<!-- After (ROComponent) -->
<ro-button bg="btn_ok.bmp" hover="btn_ok_a.bmp" down="btn_ok_b.bmp">OK</ro-button>
```

Handles `mouseover`/`mouseout`/`mousedown`/`mouseup` internally to swap background images. Loads BMP/TGA files via `Client.loadFile()`.

**CSS requirement**: `<ro-button>` extends `HTMLElement` (not `HTMLButtonElement`), so it defaults to `display: inline`. The rule `ro-button { display: inline-block; }` exists in `Common.css` and is injected into every Shadow DOM automatically. This has low specificity `(0,0,1)` so component rules like `#Clan .footer .btn_ok { display: none; }` still override it. **Never** set `display` via inline style in `connectedCallback()` — it would override CSS `display: none` rules and break show/hide logic.

**CSS selector update**: Any CSS rule targeting `button` by tag name must be updated to `ro-button`:

```css
/* Before */
#Clan .content.info .members button { ... }
/* After */
#Clan .content.info .members ro-button { ... }
```

**Cursor**: `ro-button` is included in `CLICKABLE_SELECTOR` in `CursorManager.js` and in `ROComponent._setupShadowCursorEvents()`. The custom hand cursor appears on hover automatically.

#### `<ro-text>` — replaces `<span data-text="msgId">`

```html
<!-- Before (UIComponent) -->
<span data-text="2355">Clan Info</span>

<!-- After (ROComponent) -->
<ro-text msg="2355">Clan Info</ro-text>
```

Resolves the message ID via `DB.getMessage()` on connect and on attribute change (reactive via `observedAttributes`). The inner text content serves as fallback if the message ID is not found.

#### `<ro-image>` — replaces `<div data-background="image.bmp">`

```html
<!-- Before (UIComponent) — data-background sets background on the element itself -->
<div class="titlebar" data-background="basic_interface/titlebar_mid.bmp">

<!-- After (ROComponent) — ro-image is a child element that sets background on itself -->
<div class="titlebar">
	<ro-image src="basic_interface/titlebar_mid.bmp" style="width: 100%; height: 100%; display: block"></ro-image>
```

**Behavior**: `<ro-image>` loads the image via `Client.loadFile()` and sets `background-image` on **itself** (not on its parent). Since custom elements default to `display: inline` with no intrinsic dimensions, you must give it explicit size via inline style or CSS.

**Preferred approach** — inline style in HTML (no CSS changes needed):

```html
<!-- Fill parent completely (titlebar) -->
<ro-image src="basic_interface/titlebar_mid.bmp" style="width: 100%; height: 100%; display: block"></ro-image>

<!-- Fixed height (footer bar) -->
<ro-image src="basic_interface/btnbar_mid2.bmp" style="width: 100%; height: 27px; display: block"></ro-image>
```

**Alternative** — CSS rule (when many `<ro-image>` share the same sizing):

```css
.titlebar ro-image {
	display: block;
	width: 100%;
	height: 100%;
}
```

Supports reactive `src` changes via `observedAttributes`.

### Custom Elements still needed

The following `data-*` patterns do NOT have custom elements yet. When migrating a component that uses them, **create the custom element** — do not rely on `_processAllDataAttrs()` as a permanent solution.

| Pattern        | Suggested element                                        | Behavior                                                                                                          |
| -------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `data-active`  | `<ro-toggle>` or extend `<ro-button>` with `active` attr | Toggles background when element has `.active` class. Currently uses a `MutationObserver` in `processDataAttrs()`. |
| `data-preload` | None needed — move to JS                                 | Non-visual. Call `Client.loadFiles()` directly in `init()` or `onAppend()`.                                       |

_(This list may be outdated. Always check `src/UI/Elements/` for the current set of elements.)_

### How to create a new Custom Element

**Step 1**: Create the element file (`src/UI/Elements/RONewElement.js`):

```javascript
import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import Targa from 'Loaders/Targa.js';

/**
 * <ro-newelement attr="value"></ro-newelement>
 *
 * Replaces: <div data-something="value">
 */
class RONewElement extends HTMLElement {
	connectedCallback() {
		const val = this.getAttribute('attr');
		// Set up behavior (load images, add listeners, etc.)
	}

	static get observedAttributes() {
		return ['attr'];
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if (name === 'attr') {
			/* update */
		}
	}
}

customElements.define('ro-newelement', RONewElement);
export default RONewElement;
```

**Step 2**: Register in `Elements.js`:

```javascript
import './ROButton.js';
import './ROText.js';
import './ROImage.js';
import './RONewElement.js'; // ← add
```

**Step 3**: Add default display rule to `Common.css` if the element needs dimensions:

```css
ro-newelement {
	display: inline-block; /* or block, depending on use case */
}
```

### Dynamic element creation in JS

When components create elements dynamically (e.g., buttons at runtime), use custom elements directly:

```javascript
const btn = document.createElement('ro-button');
btn.setAttribute('bg', 'btn_ok.bmp');
btn.setAttribute('hover', 'btn_ok_a.bmp');
btn.setAttribute('down', 'btn_ok_b.bmp');
btn.classList.add('btn');
btn.addEventListener('click', () => { ... });
container.appendChild(btn);
```
