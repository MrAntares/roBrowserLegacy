# Migration Guide: UIComponent → GUIComponent

## Architecture Overview

### UIComponent (legacy) — `src/UI/UIComponent.js`

- jQuery-based: DOM manipulation, events, CSS, animations all use jQuery
- CSS injected into a global `<style>` tag in `<head>` via `jQuery('style:first').append(...)`
- HTML parsed via `jQuery(htmlText)`, interactive attributes handled by `parseHTML()` using `data-background`, `data-hover`, `data-down`, `data-active`, `data-text`, `data-preload`
- Lives in the Light DOM (direct child of `document.body`)
- `this.ui` is a jQuery object wrapping the root element

### GUIComponent (new) — `src/UI/GUIComponent.js`

- Native DOM + Shadow DOM (`attachShadow({ mode: 'open' })`)
- CSS injected inside the Shadow DOM via a `<style>` element (Common.css + component CSS)
- HTML returned by `render()` method as a string, inserted into `this._container.innerHTML`
- Uses Custom Elements (`<ui-button>`, `<ui-text>`, `<ui-image>`) instead of `data-*` attributes (see doc/CustomElements.md) [OPTIONAL]
- `this.ui` is a jQuery-compatible proxy that exists **only** for interoperability with `UIManager` and legacy `UIComponent` instances — **new code inside a GUIComponent should always use native DOM and Shadow DOM APIs directly**

### DOM Structure

```
document.body
└── div#ComponentName          ← this._host (position: absolute, z-index: 50)
    └── #shadow-root (open)    ← this._shadow
        ├── <style>            ← Common.css + component CSS
        └── div.ui-component-root  ← this._container
            └── <div id="ComponentName">  ← component HTML from render()
                └── ...content...
```

> **Note**: `this._host` receives `position: absolute` and `z-index: 50` via JavaScript during `prepare()`. You do **not** need to declare these in your `:host` CSS.

---

## Lifecycle Hooks

GUIComponent has three lifecycle hooks. Understanding when each runs is critical to avoid bugs like duplicate event bindings.

```
prepare()
  ├── build Shadow DOM, inject CSS, render HTML
  ├── _processAllDataAttrs()
  ├── _createUIProxy()
  ├── appendChild(host) to document.body   ← host IS in the DOM
  ├── init()                               ← runs ONCE
  ├── _setupMouseMode()
  └── host.remove()                        ← host removed from DOM

append()
  ├── appendChild(host) to target          ← host IS in the DOM
  ├── onAppend()                           ← runs EVERY TIME append() is called
  ├── _setupScrollbars()
  ├── _fixPositionOverflow()
  └── focus()

remove()
  ├── onRemove()                           ← runs EVERY TIME remove() is called
  ├── unbind keydown
  ├── dispatch 'x_remove' event
  └── host.remove()                        ← host removed from DOM
```

| Hook         | When it runs                                              | Use for                                                                  |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| `init()`     | Once, during `prepare()`. Host is temporarily in the DOM. | One-time setup: `draggable()`, event binding, initial hide               |
| `onAppend()` | Every time `append()` is called. Host is in the DOM.      | Position restore, anything that must run each time the component appears |
| `onRemove()` | Every time `remove()` is called, before detach.           | Save preferences, cleanup                                                |

**RULE**: Bind events in `init()` (runs once). Restore position/state in `onAppend()` (runs every time). Save state in `onRemove()`.

---

## Mouse Modes

Each GUIComponent has a `mouseMode` property that controls how mouse events interact with the 3D scene behind the UI:

```javascript
const MouseMode = Object.freeze({
	CROSS: 0, // Mouse crosses the UI and still intersects with the scene
	STOP: 1, // Blocks scene intersection when mouse is over the UI
	FREEZE: 2 // Blocks scene intersection while the UI is alive (modal)
});
```

| Mode     | Use case                                 | Example                         |
| -------- | ---------------------------------------- | ------------------------------- |
| `CROSS`  | Transparent overlays, HUD elements       | Minimap, chat bubbles           |
| `STOP`   | Standard windows (default)               | Clan, Inventory, Equipment      |
| `FREEZE` | Modal dialogs that block all interaction | NPC dialog, confirmation popups |

Set it on the component instance:

```javascript
Clan.mouseMode = GUIComponent.MouseMode.STOP;
```

---

## Step-by-Step Migration Checklist

### 1. Create the component files

Each GUIComponent needs three files:

- `ComponentName.js` — Logic
- `ComponentName.html` — Template (raw HTML string)
- `ComponentName.css` — Styles

### 2. Convert the JS file

**Before (UIComponent):**

```javascript
import UIComponent from 'UI/UIComponent.js';
import UIManager from 'UI/UIManager.js';
import htmlText from './Clan.html?raw';
import cssText from './Clan.css?raw';

const Clan = new UIComponent('Clan', htmlText, cssText);
```

**After (GUIComponent):**

```javascript
import GUIComponent from 'UI/GUIComponent.js';
import UIManager from 'UI/UIManager.js';
import 'UI/Elements/Elements.js'; // ← REQUIRED: registers <ui-button>, <ui-text>, <ui-image>
import htmlText from './Clan.html?raw';
import cssText from './Clan.css?raw';

const Clan = new GUIComponent('Clan', cssText); // ← only CSS, not HTML

Clan.render = () => htmlText; // ← HTML goes here
```

Key differences:

- `GUIComponent` constructor takes `(name, cssText)` — no HTML argument
- HTML is returned by `render()` method
- Must `import 'UI/Elements/Elements.js'` to register custom elements [OPTIONAL]

#### Components with `null` HTML (dynamic DOM)

Some legacy UIComponents pass `null` for HTML and build their root element dynamically in `init()`:

```javascript
// Before (UIComponent) — no HTML template, root created at runtime
const StatusIcons = new UIComponent('StatusIcons', null, cssText);

StatusIcons.init = function init() {
	this.ui = jQuery('<div/>').attr('id', 'StatusIcons');
	// ... dynamically create child elements later
};
```

For GUIComponent, you still need a minimal HTML template — the `render()` method must return something. Create a `.html` file with a minimal container:

```html
<!-- StatusIcons.html -->
<div id="StatusIcons"></div>
```

```javascript
// After (GUIComponent)
const StatusIcons = new GUIComponent('StatusIcons', cssText);
StatusIcons.render = () => htmlText; // ← returns the minimal <div> wrapper
// Dynamic child elements are appended to this container at runtime
```

### 3. Convert the HTML file [OPTIONAL]

Replace `data-*` attributes with Custom Elements:

| UIComponent (data-\*)                                                                      | GUIComponent (Custom Element)                                          |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `<button data-background="btn_ok.bmp" data-hover="btn_ok_a.bmp" data-down="btn_ok_b.bmp">` | `<ui-button bg="btn_ok.bmp" hover="btn_ok_a.bmp" down="btn_ok_b.bmp">` |
| `<span data-text="2355">Fallback</span>`                                                   | `<ui-text msg="2355">Fallback</ui-text>`                               |
| `<div data-background="image.bmp">`                                                        | `<ui-image src="image.bmp">`                                           |

Elements that still use `data-background`, `data-hover`, `data-down`, `data-active`, `data-text`, or `data-preload` will be processed by `GUIComponent._processAllDataAttrs()` during `prepare()`. Both approaches work; Custom Elements are preferred for new code but is optional. Create new custom elements if conversion demands it (see doc/CustomElements.md).

### 4. Convert the CSS file — CRITICAL

This is where most bugs occur. The CSS must be restructured for Shadow DOM.

#### 4a. Move dimensions and position to `:host`

The host element (`this._host`) is what the outside world sees. Its dimensions determine:

- `getBoundingClientRect()` used by magnetic snap
- `_fixPositionOverflow()` used by screen boundary checks
- `UIManager.fixResizeOverflow()` used by window resize

**RULE**: The `:host` selector MUST define `width`, `height`, `top`, and `left`. The inner root element (`#ComponentName`) MUST NOT have `top` or `left` (set them to 0 or omit them).

**Before:**

```css
#Clan {
	position: absolute;
	top: 150px;
	left: 150px;
	width: 400px;
	height: 317px;
}
```

**After:**

```css
:host {
	width: 400px;
	height: 317px;
	top: 150px;
	left: 150px;
}

#Clan {
	position: absolute;
	width: 400px;
	height: 317px;
}
```

> **Note**: You do NOT need `position: absolute` or `z-index` on `:host` — these are set via JavaScript in `prepare()`.

**WHY**: If `top`/`left` remain on the inner element, it offsets the content inside the host. The host's `getBoundingClientRect()` returns the host's position, not the inner element's visual position. This causes magnetic snap to align to wrong edges (especially bottom/right).

**WHY `position: absolute` on inner element**: The inner `#Clan` div needs `position: absolute` (or `relative`) to serve as a containing block for its children that use `position: absolute`. Without it, absolutely-positioned children would escape to the next positioned ancestor.

#### 4b. Dynamic-size components (no fixed width/height)

Some components (e.g., StatusIcons) have no fixed dimensions — they grow dynamically as children are added. In the original UIComponent, the single `#ComponentName` div was both the positioned element AND the container. In GUIComponent, `_host` is the positioned element and the inner `#ComponentName` div from `render()` is a separate element inside the shadow DOM.

**RULE for dynamic-size components**: Do NOT add `position: absolute` to the inner `#ComponentName` div. This creates an extra 0×0 containing block inside the shadow DOM that breaks layout for absolutely-positioned children. Let `.state` (or similar child) elements use `_host` as their containing block instead.

**Fixed-size components** (Clan, Inventory, etc.):

```css
:host {
	width: 400px;
	height: 317px;
	top: 150px;
	left: 150px;
}

#Clan {
	position: absolute; /* ← NEEDED: serves as containing block for children */
	width: 400px;
	height: 317px;
}
```

**Dynamic-size components** (StatusIcons, etc.):

```css
:host {
	top: 166px;
	right: 20px;
	overflow: visible; /* ← ensures children aren't clipped beyond 0×0 host bounds */
}

#StatusIcons {
	display: block; /* ← NO position: absolute — children position relative to _host */
}
```

**WHY**: In the original UIComponent, `position: absolute` on the root div was necessary because it was the top-level element appended to `document.body`. In GUIComponent, `_host` already has `position: absolute` (set by `prepare()`). Adding it again on the inner div creates a redundant 0×0 positioned container inside the shadow DOM. For fixed-size components this is harmless (both have the same explicit dimensions), but for dynamic-size components it breaks the containing block chain — absolutely-positioned children end up positioned relative to a 0×0 box instead of the properly-positioned `_host`.

### 5. Convert DOM queries

**Before (jQuery):**

```javascript
this.ui.find('.content.info .name .value').text(clan.name);
this.ui.find('.close').click(function() { ... });
```

**After (native DOM):**

```javascript
const root = this._shadow || this._host;
root.querySelector('.content.info .name .value').textContent = clan.name;

const closeBtn = root.querySelector('.close');
closeBtn.addEventListener('click', () => { ... });
```

**RULE**: Always query from `this._shadow` (or `this._host`), never from `document`. Elements inside Shadow DOM are invisible to `document.querySelector()`.

#### Helper: `_getRoot()` for module-level components

For components defined as module-level singletons (not using `this` inside methods), create a `_getRoot()` helper to avoid repeating the shadow root lookup:

```javascript
function _getRoot() {
	return StatusIcons._shadow || StatusIcons._host;
}

// Usage in any function:
function resetPositions() {
	const root = _getRoot();
	const elements = root.querySelectorAll('.state');
	// ...
}
```

This is preferred over `this._shadow || this._host` when the component's methods are plain functions (not on `this`), which is common for overlay/HUD components like StatusIcons, MiniMap, etc.

### 6. Convert event handlers

**Before:**

```javascript
Guild.init = function init() {
	this.ui.find('.close').mousedown(stopPropagation).click(Guild.toggle.bind(this));
	this.draggable(this.ui.find('.titlebar'));
	this.ui.hide();
};
```

**After:**

```javascript
Clan.init = function init() {
	this.draggable('.titlebar');
	const root = this._shadow || this._host;
	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => Clan.toggle());
	}
	this._host.style.display = 'none';
};
```

Key changes:

- `draggable()` accepts a CSS selector string (resolved inside shadow)
- Position restore goes in `onAppend()`
- Uses native DOM `addEventListener` instead of jQuery `.click()`/`.mousedown()`

### 7. The `this.ui` proxy — interop only

`this.ui` is a jQuery-compatible proxy that exists so `UIManager` and legacy `UIComponent` code can interact with GUIComponents without changes. **New code inside a GUIComponent should always use native DOM and Shadow DOM APIs.**

| Proxy method                           | Native DOM equivalent (preferred)                                                |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `this.ui.css('top', '100px')`          | `this._host.style.top = '100px'`                                                 |
| `this.ui.css({ top: 100, left: 200 })` | `Object.assign(this._host.style, { top: '100px', left: '200px' })`               |
| `this.ui.show()`                       | `this._host.style.display = ''` (+ call `this._fixPositionOverflow()` if needed) |
| `this.ui.hide()`                       | `this._host.style.display = 'none'`                                              |
| `this.ui.is(':visible')`               | `this._host.style.display !== 'none'`                                            |
| `this.ui.find('.foo')`                 | `this._shadow.querySelector('.foo')` or `this._shadow.querySelectorAll('.foo')`  |
| `this.ui.width()`                      | `this._host.getBoundingClientRect().width`                                       |
| `this.ui.height()`                     | `this._host.getBoundingClientRect().height`                                      |
| `this.ui.offset()`                     | `this._host.getBoundingClientRect()`                                             |
| `this.ui.position()`                   | `{ left: this._host.offsetLeft, top: this._host.offsetTop }`                     |
| `this.ui.parent()`                     | `this._host.parentNode`                                                          |
| `this.ui.trigger('event')`             | `this._host.dispatchEvent(new CustomEvent('event', { bubbles: true }))`          |
| `this.ui.detach()`                     | `this._host.remove()`                                                            |
| `this.ui.appendTo(target)`             | `target.appendChild(this._host)`                                                 |

> **Caveat**: `this.ui.show()` automatically calls `this._fixPositionOverflow()` to ensure the component stays within screen bounds. When using native DOM `this._host.style.display = ''`, call `this._fixPositionOverflow()` manually if the component may be near screen edges.

**When to use `this.ui`**: Only when passing the component to external code that expects a jQuery-like interface (e.g., `UIManager` internals, legacy components calling methods on other components).

**When to use native DOM**: Always, inside the component's own code (`init`, `onAppend`, `onRemove`, event handlers, etc.).

### 8. Convert preferences (save/restore position)

**Before:**

```javascript
Guild.onRemove = function onRemove() {
	_preferences.x = parseInt(this.ui.css('left'), 10);
	_preferences.y = parseInt(this.ui.css('top'), 10);
	_preferences.save();
};
```

**After:**

```javascript
Guild.onRemove = function onRemove() {
	_preferences.x = parseInt(this._host.style.left, 10);
	_preferences.y = parseInt(this._host.style.top, 10);
	_preferences.save();
};
```

**NEVER use for preferences saving:**

```javascript
// BAD — returns 0,0 when hidden
const rect = this._host.getBoundingClientRect();
_preferences.x = Math.round(rect.left);
```

```javascript
// BAD — position 0 becomes 100
_preferences.x = parseInt(this._host.style.left, 10) || 100;
```

```javascript
// BAD — proxy
_preferences.x = parseInt(this.ui.css('left'), 10);
```

### 9. Register with UIManager

Same as before:

```javascript
export default UIManager.addComponent(Clan);
```

`UIManager.addComponent()` accepts both `UIComponent` and `GUIComponent` instances.

---

## Additional Features

### Clone

Deep-clone a GUIComponent instance:

```javascript
const clone = Clan.clone();
```

---

## Known Shadow DOM Pitfalls (already fixed)

These issues were encountered during the first migration (Clan) and are documented here to explain the fixes and prevent regressions.

### 1. jQuery `.show()` sets `display: block`, breaking flex/grid layouts

**Bug**: jQuery's `.show()` sets `element.style.display = 'block'` regardless of the element's CSS `display` value. For elements that use `display: flex` (like the scrollbar), this breaks the layout.

**Fix applied in `src/UI/Scrollbar.js`** (commit `7ce87bf9`):

```javascript
// WRONG
$scrollbar.hide();
$scrollbar.show();

// CORRECT
$scrollbar[0].style.display = 'none';
$scrollbar[0].style.display = ''; // ← resets to CSS value (flex)
```

**RULE**: Never use jQuery `.show()`/`.hide()` on elements that may have non-block display. Use `element.style.display = ''` (empty string resets to the CSS-declared value) and `element.style.display = 'none'`.

### 2. Global CSS does not penetrate Shadow DOM

**Bug**: CSS rules in the global `<style>` tag (e.g., `.custom-cursor * { cursor: none !important; }` from CursorManager) do not affect elements inside Shadow DOM.

**Fix applied in `src/UI/Common.css`** (commit `f4183351`):

```css
:host-context(.custom-cursor) * {
	cursor: none !important;
}
```

This rule is inside `Common.css` which is injected into every Shadow DOM. `:host-context(.custom-cursor)` checks if any ancestor of the shadow host has the class `custom-cursor` (set on `document.body` by CursorManager).

**RULE**: Any global CSS that needs to affect Shadow DOM content must be added to `Common.css`.

### 3. Scrollbar CSS injection into Shadow DOM

**Bug**: The scrollbar CSS (`.ro-custom-scrollbar` styles) is injected into the global `<style>` tag by `Scrollbar.js setupStyles()`. These styles don't reach elements inside Shadow DOM.

**Fix applied in `src/UI/Scrollbar.js`** (commit `b9d21673`):

```javascript
const shadowRoot = element.getRootNode();
if (shadowRoot instanceof ShadowRoot && !shadowRoot.querySelector('style[data-scrollbar]')) {
	const scrollbarStyle = document.createElement('style');
	scrollbarStyle.setAttribute('data-scrollbar', '');
	scrollbarStyle.textContent = ScrollBar._cssText;
	shadowRoot.appendChild(scrollbarStyle);
}
```

`ScrollBar.applyDOMScrollbar()` now auto-detects if the target element is inside a Shadow DOM and injects the scrollbar CSS into that shadow root. No action needed from the component author.

### 4. `$element.closest('body')` fails inside Shadow DOM

**Bug**: jQuery's `.closest('body')` traverses up the DOM tree but stops at the shadow boundary. For elements inside Shadow DOM, it always returns an empty set, causing the scrollbar update poller to stop immediately.

**Fix applied in `src/UI/Scrollbar.js`** (commit `7ce87bf9`):

```javascript
// WRONG
if (!$element.closest('body').length) { ... }

// CORRECT
if (!$element[0].isConnected) { ... }
```

`Element.isConnected` is a native property that returns `true` if the element is connected to the document, including through Shadow DOM.

**RULE**: Never use jQuery `.closest('body')` or `jQuery.contains(document, element)` to check if an element is in the DOM. Use `element.isConnected` instead.

### 5. Mouse events are retargeted across Shadow DOM boundaries

**Bug**: When a `mouseover` event fires on an element inside Shadow DOM and bubbles to `document.body`, `e.target` is retargeted to the shadow host element. The CursorManager's `findClickableTarget(e.target)` never finds clickable elements (like `.ui-custom-scrollbar`, `ui-button`) inside the shadow.

**Fix applied in `src/UI/GUIComponent.js`** (commit `f4183351`):

```javascript
_setupShadowCursorEvents() {
    const container = this._container;
    // Register mouseover/mouseout/mousedown/mouseup directly on the container
    // INSIDE the shadow DOM, where e.target is the real element (no retargeting)
    container.addEventListener('mouseover', e => {
        if (e.target.closest && e.target.closest(CLICKABLE_SELECTOR)) {
            // Change cursor to hand
        }
    });
    // ... mouseout, mousedown, mouseup handlers
}
```

This method is called automatically by `_setupMouseMode()`. No action needed from the component author.

**RULE**: Event listeners that need to identify specific elements inside Shadow DOM must be registered INSIDE the shadow tree (on `this._container` or `this._shadow`), not on `document.body`.

### 6. `offsetParent()` mismatch between jQuery and native DOM

**Bug**: Legacy UIComponent's `draggable()` builds a snap cache and skips components whose `offsetParent` differs from the dragged component's `offsetParent`. jQuery's `.offsetParent()` walks up the tree and returns `document.documentElement` for elements whose parent chain is all `position: static`. Native `element.offsetParent` returns `document.body`. This mismatch causes legacy UIs to skip GUIComponent instances when building the snap cache.

**Fix applied in `src/UI/GUIComponent.js`** (commit `1813e446`):

```javascript
offsetParent() {
    let el = host.offsetParent || document.documentElement;
    while (el && el !== document.documentElement && window.getComputedStyle(el).position === 'static') {
        el = el.offsetParent;
    }
    el = el || document.documentElement;
    return { length: el ? 1 : 0, 0: el };
},
```

This mimics jQuery's `.offsetParent()` behavior. No action needed from the component author.

### ~~7. `this.ui.css()` object syntax~~ (FIXED)

Previously broken, now fixed. Both proxy syntaxes work:

```javascript
this.ui.css({ top: 100, left: 200 });
this.ui.css('top', 100);
```

Prefer native DOM:

```javascript
this._host.style.top = '100px';
this._host.style.left = '200px';
```

### ~~8. Keyboard input stolen from `<input>` / `<textarea>` inside Shadow DOM~~ (FIXED)

**Bug**: When a GUIComponent contains `<input>`, `<select>`, or `<textarea>` elements inside its Shadow DOM, users cannot type in them — keystrokes are intercepted by other global `keydown` handlers (ChatBox battle mode, shortcut system, etc.).

**Root cause**: Shadow DOM encapsulates focus. When an `<input>` inside a shadow root is focused:

- `document.activeElement` returns the **shadow host** (`<div>`) — not the actual `<input>`
- `event.target` on bubbled events is **retargeted** to the shadow host

Other global handlers (e.g., ChatBox line 816–826, line 928–941) check `document.activeElement.tagName` or `event.target.tagName` to detect focused inputs. They see `DIV` instead of `INPUT`, so they consume the keystroke instead of letting it through.

```
document.activeElement          → <div#ChatRoomCreate>  (host)
shadowRoot.activeElement        → <input name="title">  (real element)
event.target                    → <div#ChatRoomCreate>  (retargeted)
event.composedPath()[0]         → <input name="title">  (real element)
```

**Fix — two parts:**

**Part 1: Register `onKeyDown` in the capture phase**

The component's `onKeyDown` handler must run **before** all other `window.keydown` handlers. Set `captureKeyEvents = true` on the component instance. This makes `_bindKeyDown()` register the handler with `useCapture = true`, so it fires during the capture phase (before the bubble phase where other handlers listen).

```javascript
// In _bindKeyDown() — GUIComponent.js
_bindKeyDown() {
    if (!this.onKeyDown) return;
    this._unbindKeyDown();
    const handler = this.onKeyDown.bind(this);
    this._keyHandler = event => {
        if (handler(event) === false) {
            event.preventDefault();
        }
    };
    var useCapture = !!this.captureKeyEvents;
    window.addEventListener('keydown', this._keyHandler, useCapture);
}
```

**Part 2: Guard the `onKeyDown` handler**

Inside the component's `onKeyDown`, check if an input element inside the shadow is focused. If so, call `stopImmediatePropagation()` to block all other handlers, and return `true` (NOT `false`) so the wrapper does not call `preventDefault()` — the browser must execute the default action (typing the character).

Use `shadowRoot.activeElement` (not `document.activeElement`) to get the real focused element inside the shadow.

```javascript
ChatRoomCreate.onKeyDown = function onKeyDown(event) {
	var shadow = this._shadow || this._host;
	var focused = shadow.activeElement;

	// If an input inside the shadow is focused, let the browser handle the keystroke
	if (focused && focused.tagName && focused.tagName.match(/input|select|textarea/i)) {
		// Still handle Enter/Escape for form submission/close
		if (event.which === KEYS.ENTER) {
			submitForm.call(this);
			event.stopImmediatePropagation();
			return false;
		}
		if (event.which === KEYS.ESCAPE || event.key === 'Escape') {
			this.hide();
			event.stopImmediatePropagation();
			return false;
		}
		// Block other handlers from consuming the keystroke, but let the browser type it
		event.stopImmediatePropagation();
		return true; // ← CRITICAL: true, not false
	}

	// Normal key handling when no input is focused
	// ...
	return true;
};
```

**Component setup:**

```javascript
ChatRoomCreate.captureKeyEvents = true; // ← capture phase
```

**Why `return true` is critical**: The `_bindKeyDown` wrapper calls `event.preventDefault()` when the handler returns `false`. For text inputs, `preventDefault()` on `keydown` blocks the character from being inserted. Returning `true` (or any non-`false` value) skips `preventDefault()`, allowing normal typing.

**Why only some keys worked without the fix**: Keys like `z`, `x`, `c`, `v`, `b`, `n`, `m` are not mapped to any shortcut in the default `ShortCutControls.js`. All other keys (`a`–`y`, `0`–`9`, `F1`–`F12`) are consumed by the ChatBox battle mode handler (line 928–941) or the shortcut system before reaching the input.

**RULE**: Any GUIComponent with `<input>`, `<select>`, or `<textarea>` inside its Shadow DOM **must** set `captureKeyEvents = true` and guard its `onKeyDown` with a `shadowRoot.activeElement` check. Without this, users will not be able to type in those fields.

**Affected components**: ChatRoomCreate, ChatRoom, and any future GUIComponent with text input fields.

And also update `_unbindKeyDown()` in `src/UI/GUIComponent.js` (line 424-430) — it already removes both normal and capture listeners, which is correct. But `_bindKeyDown()` (line 412-422) needs to be updated to check `this.captureKeyEvents`:

```javascript
_bindKeyDown() {
    if (!this.onKeyDown) return;
    this._unbindKeyDown();
    const handler = this.onKeyDown.bind(this);
    this._keyHandler = event => {
        if (handler(event) === false) {
            event.preventDefault();
        }
    };
    var useCapture = !!this.captureKeyEvents;
    window.addEventListener('keydown', this._keyHandler, useCapture);
}
```

### 9. Arrow functions break `this`-dependent callbacks (e.g., `Texture.load`)

When converting callbacks from `function()` to arrow functions, check whether the callback relies on dynamic `this` binding via `.call()` or `.apply()`.

**Example**: `Texture.load()` in `src/Utils/Texture.js` calls `oncomplete.apply(canvas, args)`, setting `this` to the loaded canvas element. If you convert the callback to an arrow function, `this` captures the outer lexical scope instead of the canvas.

```javascript
// WRONG — arrow function ignores .apply(canvas), `this` is outer scope
Client.loadFile(path, data => {
	Texture.load(data, () => {
		addResizedStatusIcon(this, index); // `this` is NOT the canvas!
	});
});

// CORRECT — regular function receives `this` = canvas from .apply()
Client.loadFile(path, data => {
	Texture.load(data, function () {
		addResizedStatusIcon(this, index); // `this` is the canvas ✓
	});
});
```

**RULE**: Keep callbacks as regular `function()` when the caller uses `.call()`, `.apply()`, or sets `this` dynamically. This pattern appears in `Texture.load`, `Client.loadFile` completions, and some event handlers. The outer callback (e.g., `Client.loadFile`'s callback) can safely be an arrow function if it doesn't use `this`.

### 10. CSS `display: none` fallback trap when toggling visibility

**Bug**: Elements inside Shadow DOM styled with `display: none` in CSS cannot be shown by setting `element.style.display = ''`. The empty string removes the inline style, causing the element to fall back to the CSS-declared `display: none` — so it stays hidden.

This is different from Light DOM components where jQuery's `.show()` / `.hide()` set explicit inline values. In Shadow DOM with scoped CSS, the CSS `display: none` always wins when the inline style is cleared.

```css
/* WRONG — CSS declares display: none, inline '' just removes the override */
.skill-level {
	position: fixed;
	display: none; /* ← elements start hidden */
}
```

```javascript
// WRONG — '' removes inline style, falls back to CSS display: none
element.style.display = ''; // Still hidden!

// CORRECT — use explicit 'block' to override CSS
element.style.display = 'block'; // Visible ✓
element.style.display = 'none'; // Hidden ✓
```

**Better approach**: Don't use CSS `display: none` for elements whose visibility is toggled at runtime. Set the initial `display: none` via inline style in `init()`, then toggle with explicit values:

```css
/* CORRECT — no display in CSS */
.skill-level {
	position: fixed;
}
```

```javascript
// init() — hide initially via inline style
element.style.display = 'none';

// onAppend() — show
element.style.display = 'block';

// onRemove() — hide
element.style.display = 'none';
```

**RULE**: For elements toggled at runtime, manage `display` entirely through inline styles. Either use explicit values (`'block'`/`'none'`) or remove `display: none` from CSS and set the initial state in `init()`.

### 11. `pointer-events: none` on `:host` is inherited by Shadow DOM children

**Bug**: When `:host` has `pointer-events: none` (common for overlay/HUD components in CROSS mouse mode), all children inside the Shadow DOM inherit `pointer-events: none`. Unlike most CSS encapsulation in Shadow DOM, **inheritable CSS properties DO cross the shadow boundary** from host to children.

This means children (e.g., canvas elements, interactive overlays) silently become invisible to mouse events. They won't receive `click`, `mousedown`, `mouseover`, etc.

```css
/* Host is transparent to mouse — correct for overlays */
:host {
	pointer-events: none;
}

/* WRONG — canvas inherits pointer-events: none from :host */
.skill-level {
	position: fixed;
	/* no pointer-events override → inherits none → invisible to mouse */
}

/* CORRECT — explicitly opt children back in */
.skill-level {
	position: fixed;
	pointer-events: auto; /* ← overrides inherited none */
}
```

**When to use `pointer-events: auto`**: Add it to any child element that needs to participate in mouse event hit testing. For purely visual elements (like the skill level number following the cursor), `pointer-events: auto` is optional since event listeners on `window` still fire regardless. But if any system relies on `document.elementFromPoint()` or if the element itself has event listeners, it needs `pointer-events: auto`.

**Other inheritable properties that cross Shadow DOM**: `color`, `font-*`, `visibility`, `cursor`, `direction`, `text-align`, `line-height`, `letter-spacing`, `word-spacing`, `white-space`, `user-select`. Check for unintended inheritance when the host sets any of these.

**RULE**: When `:host` sets `pointer-events: none`, add `pointer-events: auto` to any child that needs mouse interaction. Review other inheritable properties that might leak from host to shadow children.

### 12. jQuery event priority (`events.unshift`) → capture phase + explicit propagation control

**Bug**: Some legacy UIComponents manipulate jQuery's internal event queue to ensure their handlers fire first:

```javascript
// BEFORE (UIComponent) — move handler to front of jQuery's internal queue
jQuery(window).one('mousedown.targetselection', intersectEntities);
events = jQuery._data(window, 'events').mousedown;
events.unshift(events.pop());
```

This pattern has no native DOM equivalent. `addEventListener` order is determined by registration order, and you cannot reorder handlers.

**Fix**: Use the **capture phase** (`addEventListener(event, handler, true)`) to guarantee the handler fires before all bubble-phase handlers. Capture phase runs top-down (window → document → ... → target) before the bubble phase runs bottom-up (target → ... → window). A capture handler on `window` fires before ANY other handler anywhere in the document.

```javascript
// AFTER (GUIComponent) — capture phase fires before all bubble handlers
_mousedownHandler = event => {
	intersectEntities(event);
};
window.addEventListener('mousedown', _mousedownHandler, true);

// Cleanup must also specify capture: true
window.removeEventListener('mousedown', _mousedownHandler, true);
```

**Also convert jQuery's `return false`**: In jQuery, returning `false` from an event handler calls both `event.stopPropagation()` and `event.preventDefault()`. In native DOM, the return value of an `addEventListener` callback is **ignored**. You must call these methods explicitly:

```javascript
// BEFORE (jQuery handler) — return false = stopPropagation + preventDefault
function intersectEntities(event) {
	event.stopImmediatePropagation();
	// ... process ...
	return false; // ← jQuery calls stopPropagation + preventDefault
}

// AFTER (native handler) — must be explicit
function intersectEntities(event) {
	event.stopImmediatePropagation();
	event.preventDefault(); // ← must call explicitly, return value is ignored
	// ... process ...
}
```

**RULE**: Replace jQuery event queue manipulation (`events.unshift(events.pop())`) with capture-phase listeners. Replace `return false` with explicit `stopImmediatePropagation()` + `preventDefault()` calls.

### 13. jQuery `.text()` override is lost — RO-style `^rrggbb` color codes rendered as literal text

**Bug**: The legacy codebase overrides jQuery's `.text()` method in `Utils/jquery.js` to add RO-specific text processing. When a UIComponent calls `this.ui.find('.content').text(value)`, it is NOT using standard jQuery `.text()` — the override:

1. **Sanitizes HTML** (whitelist: `<font>`, `<i>`, `<b>` — all other tags stripped)
2. **Converts `^rrggbb` color codes** to `<span style="color:#rrggbb">`
3. **Substitutes `^nItemID^NNN`** with the item's display name from DB
4. **Converts `\n` to `<br/>`**
5. Sets the result via `.html()` (innerHTML), not `.textContent`

When migrating to GUIComponent, the natural replacement for `.text()` is `.textContent`. This strips ALL processing — color codes appear as literal `^FF0000` text, newlines are ignored, and HTML tags are escaped.

**Affected components**: Any component that displays user-facing game text with `^rrggbb` color codes. Common examples: SkillDescription, NpcBox, Quest, ItemInfo, and any component using `DB.getSkillDescription()`, `DB.getMessage()`, or similar DB text that may contain color codes.

**Fix**: Replicate the jQuery `.text()` override logic natively. Create a local `_formatROText()` helper:

```javascript
const _allowedTags = new Set(['font', 'i', 'b']);

function _formatROText(value) {
	const tmp = document.createElement('div');
	tmp.innerHTML = String(value);

	tmp.querySelectorAll('*').forEach(el => {
		if (!_allowedTags.has(el.tagName.toLowerCase())) {
			el.replaceWith(...el.childNodes);
		}
	});

	let txt = tmp.innerHTML;

	let result;
	const colorReg = /\^([a-fA-F0-9]{6})/;
	while ((result = colorReg.exec(txt))) {
		txt = txt.replace(result[0], `<span style="color:#${result[1]}">`) + '</span>';
	}

	const itemReg = /\^nItemID\^(\d+)/g;
	while ((result = itemReg.exec(txt))) {
		txt = txt.replace(result[0], DB.getItemInfo(result[1]).identifiedDisplayName);
	}

	txt = txt.replace(/\n/g, '<br/>');

	return txt;
}
```

Then use `.innerHTML` instead of `.textContent`:

```javascript
// WRONG — loses color codes, newlines, item substitution
content.textContent = DB.getSkillDescription(id);

// CORRECT — preserves RO text formatting
content.innerHTML = _formatROText(DB.getSkillDescription(id));
```

**How to detect**: Search for `.text(` calls in the legacy component. If the argument could contain `^rrggbb` codes (skill descriptions, NPC dialog, item info, quest text), you need `_formatROText()` + `.innerHTML`. If the argument is always plain text (e.g., a numeric value or a simple label), `.textContent` is fine.

**RULE**: When replacing jQuery `.text(value)` with native DOM, check whether the value may contain RO-style formatting (`^rrggbb`, `^nItemID`, newlines). If it does, use `_formatROText()` + `.innerHTML`. If it's plain text, use `.textContent`.

---

## Reference: Clan Component (first GUIComponent migration)

### Files

- `src/UI/Components/Clan/Clan.js` — Component logic
- `src/UI/Components/Clan/Clan.html` — HTML template using `<ui-button>`, `<ui-text>`
- `src/UI/Components/Clan/Clan.css` — Styles with `:host` for dimensions/position

> **Note**: The Clan component was the first GUIComponent migration and still uses some `this.ui` proxy calls (`this.ui.hide()`, `this.ui.show()`, `this.ui.is(':visible')`). New components should use native DOM equivalents as described in this guide. But use proxy on `this.ui.hide()`, `this.ui.show()` because it calls fix overflow.

### CSS Pattern

```css
:host {
	width: 400px;
	height: 317px;
	top: 150px;
	left: 150px;
}

#Clan {
	position: absolute;
	width: 400px;
	height: 317px;
}
```

---

## Reference: StatusIcons Component (dynamic-size, no fixed dimensions)

### Files

- `src/UI/Components/StatusIcons/StatusIcons.js` — Component logic (module-level singleton with `_getRoot()` helper)
- `src/UI/Components/StatusIcons/StatusIcons.html` — Minimal template (`<div id="StatusIcons"></div>`)
- `src/UI/Components/StatusIcons/StatusIcons.css` — Dynamic-size CSS pattern (no `position: absolute` on inner div)

### Key Patterns

- **No fixed dimensions on `:host`**: The host has no `width`/`height` — children are absolutely positioned and extend outward. `overflow: visible` on `:host` prevents clipping.
- **No `position: absolute` on inner div**: The inner `#StatusIcons` is `display: block` only. `.state` children use `_host` as their containing block.
- **`_getRoot()` helper**: Module-level functions use `_getRoot()` instead of `this._shadow` since they're not methods on the component instance.
- **Mixed arrow/regular callbacks**: `Client.loadFile` callback is an arrow function, but `Texture.load` callback is a regular `function()` because it relies on `.apply(canvas)` for `this` binding.
- **`null` HTML original**: The original UIComponent used `null` HTML and created its root in `init()`. The GUIComponent version uses a minimal `.html` template instead.

### CSS Pattern

```css
:host {
	top: 166px;
	right: 20px;
	overflow: visible;
}

#StatusIcons {
	display: block;
}
```

---

## Reference: SkillTargetSelection Component (overlay, CROSS mouse mode, capture-phase events)

### Files

- `src/UI/Components/SkillTargetSelection/SkillTargetSelection.js` — Component logic (module-level singleton with `_getRoot()` helper)
- `src/UI/Components/SkillTargetSelection/SkillTargetSelection.html` — Minimal template (3 canvas elements)
- `src/UI/Components/SkillTargetSelection/SkillTargetSelection.css` — Overlay CSS pattern (`:host` with `pointer-events: none`, children with `position: fixed`)

### Key Patterns

- **CROSS mouse mode**: The host has `pointer-events: none` and `overflow: visible`. Mouse events pass through to the 3D scene behind the UI.
- **`pointer-events: auto` on children**: Canvas elements override inherited `pointer-events: none` from `:host` (see §11).
- **`position: fixed` inside Shadow DOM**: Canvas elements use `position: fixed` for viewport-relative positioning, independent of the host's `position: absolute`. Works correctly as long as no ancestor has `transform`, `perspective`, or `filter`.
- **Capture-phase mousedown**: Replaces jQuery queue reordering (`events.unshift(events.pop())`) with `addEventListener('mousedown', handler, true)` (see §12). Ensures skill targeting handler fires before MapControl.
- **Inline visibility management**: Canvas visibility toggled via `style.display = 'block'` / `'none'` in JS, not via CSS `display: none` (see §10).
- **`captureKeyEvents = true`**: Ensures ESCAPE key handler fires in capture phase, before other keydown handlers.
- **`needFocus = false`**: Overlay does not steal focus from other components.
- **Original appended canvases to `document.body`**: The legacy UIComponent created canvas elements dynamically and appended them directly to `document.body`. The GUIComponent version keeps them inside the Shadow DOM with `position: fixed` instead.

### CSS Pattern

```css
:host {
	top: 0;
	left: 0;
	overflow: visible;
	pointer-events: none;
}

#SkillTargetSelection {
	display: block;
}

.skill-level {
	position: fixed;
	left: 0;
	top: 0;
	z-index: 100;
	pointer-events: auto;
}
```

---

## Reference: SkillDescription Component (tooltip, dynamic position, RO text formatting)

### Files

- `src/UI/Components/SkillDescription/SkillDescription.js` — Component logic (module-level singleton with `_getRoot()` helper)
- `src/UI/Components/SkillDescription/SkillDescription.html` — Minimal template (close button + content div, uses `data-background`/`data-hover`)
- `src/UI/Components/SkillDescription/SkillDescription.css` — Tooltip CSS pattern (no fixed width/height on `:host`)

### Key Patterns

- **No fixed dimensions on `:host`**: The component sizes to its content. Only `top`/`left` are set on `:host` as defaults — actual position is set dynamically in `setSkill()` relative to the mouse cursor.
- **`_formatROText()` for RO text**: Skill descriptions contain `^rrggbb` color codes. Uses a local helper to sanitize HTML, convert color codes to `<span>` tags, substitute item IDs, and convert newlines (see §13).
- **`data-background`/`data-hover` on HTML**: The close button uses legacy `data-*` attributes which are processed by `GUIComponent._processAllDataAttrs()` — no Custom Element conversion needed.
- **Dynamic positioning via `getBoundingClientRect()`**: `setSkill()` measures the host's rendered size and positions it near the mouse, clamped to screen bounds.
- **Removed `onAppend` jQuery event reordering**: The original used `jQuery._data(window, 'events').keydown.unshift()` — unnecessary with GUIComponent's built-in key handling.

### CSS Pattern

```css
:host {
	top: 0px;
	left: 0px;
}

#SkillDescription {
	position: absolute;
	border-radius: 5px;
	padding: 1px;
	border: 1px solid #c5c5c5;
}
```

---

## Quick Reference: What NOT to do

| Don't                                                               | Do instead                                                   | Why                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `jQuery(element).show()` inside shadow                              | `element.style.display = ''`                                 | jQuery sets `display:block`, kills flex/grid                                                 |
| `$el.closest('body').length`                                        | `el.isConnected`                                             | `.closest()` can't cross shadow boundary                                                     |
| `document.querySelector('.my-shadow-element')`                      | `this._shadow.querySelector(...)`                            | Global queries can't see shadow content                                                      |
| `this.ui.find('.foo')`                                              | `this._shadow.querySelector('.foo')`                         | Proxy is for interop only                                                                    |
| `this.ui.css('top', '100px')`                                       | `this._host.style.top = '100px'`                             | Proxy is for interop only                                                                    |
| `this.ui.show()` / `this.ui.hide()`                                 | `this._host.style.display = ''` / `= 'none'`                 | Proxy is for interop only                                                                    |
| `this.ui.is(':visible')`                                            | `this._host.style.display !== 'none'`                        | Proxy is for interop only                                                                    |
| Put `top`/`left` on inner element                                   | Put on `:host`                                               | Breaks magnetic snap positioning                                                             |
| Omit `:host { width; height }`                                      | Always declare dimensions on `:host`                         | Host collapses to 0×0, snap/overflow broken                                                  |
| Register click handlers on `document.body` expecting shadow targets | Register inside `this._container`                            | Event retargeting hides real target                                                          |
| Bind events in `onAppend()`                                         | Bind in `init()`, restore state in `onAppend()`              | `onAppend()` runs every time — duplicates bindings                                           |
| Set `position`/`z-index` on `:host` in CSS                          | Omit — set automatically by JS                               | Redundant, may conflict                                                                      |
| `onKeyDown` without `shadowRoot.activeElement` guard                | Check `(this._shadow \|\| this._host).activeElement.tagName` | `document.activeElement` returns host, not the real input inside shadow                      |
| `position: absolute` on inner div of dynamic-size component         | `display: block` (no positioning)                            | Creates 0×0 containing block that breaks child positioning (see §4b)                         |
| `content.textContent = DB.getSkillDescription(id)`                  | `content.innerHTML = _formatROText(...)`                     | jQuery `.text()` is overridden to process `^rrggbb` colors, `^nItemID`, newlines (see §13)   |
| Convert all callbacks to arrow functions blindly                    | Keep `function()` when caller uses `.call()`/`.apply()`      | Arrow functions ignore dynamic `this` binding (see §9)                                       |
| CSS `display: none` + `element.style.display = ''` to show          | Use explicit `'block'`/`'none'`, or omit CSS `display: none` | Empty string removes inline style, falls back to CSS `none` (see §10)                        |
| Assume children inherit only scoped styles from `:host`             | Add `pointer-events: auto` on children if `:host` is `none`  | Inheritable CSS crosses shadow boundary: `pointer-events`, `color`, `cursor`, etc. (see §11) |
| `jQuery._data(window,'events').unshift(events.pop())`               | `addEventListener(event, handler, true)` (capture phase)     | Native DOM has no queue reordering; capture phase guarantees priority (see §12)              |
| `return false` from native event handler                            | Explicit `stopImmediatePropagation()` + `preventDefault()`   | Native handler return values are ignored; only jQuery interprets `return false` (see §12)    |
