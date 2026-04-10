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
- Uses Custom Elements (`<ui-button>`, `<ui-text>`, `<ui-image>`) instead of `data-*` attributes (see doc/CustomElements.md)
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
- Must `import 'UI/Elements/Elements.js'` to register custom elements

### 3. Convert the HTML file

Replace `data-*` attributes with Custom Elements:

| UIComponent (data-\*)                                                                      | GUIComponent (Custom Element)                                          |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `<button data-background="btn_ok.bmp" data-hover="btn_ok_a.bmp" data-down="btn_ok_b.bmp">` | `<ui-button bg="btn_ok.bmp" hover="btn_ok_a.bmp" down="btn_ok_b.bmp">` |
| `<span data-text="2355">Fallback</span>`                                                   | `<ui-text msg="2355">Fallback</ui-text>`                               |
| `<div data-background="image.bmp">`                                                        | `<ui-image src="image.bmp">`                                           |

Elements that still use `data-background`, `data-hover`, `data-down`, `data-active`, `data-text`, or `data-preload` will be processed by `GUIComponent._processAllDataAttrs()` during `prepare()`. Both approaches work; Custom Elements are preferred for new code. Create new custom elements if conversion demands it (see doc/CustomElements.md).

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

### 6. Convert event handlers

**Before:**

```javascript
Guild.init = function init() {
	this.ui.find('.close').mousedown(stopPropagation).click(Guild.toggle.bind(this));
	this.draggable(this.ui.find('.titlebar'));
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

Clan.onAppend = function onAppend() {
	this._host.style.left = `${_preferences.x}px`;
	this._host.style.top = `${_preferences.y}px`;
};
```

Key changes:

- `draggable()` accepts a CSS selector string (resolved inside shadow)
- Event binding goes in `init()` (runs once), not `onAppend()` (runs every time)
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
Clan.onRemove = function onRemove() {
	const rect = this._host.getBoundingClientRect();
	_preferences.x = Math.round(rect.left);
	_preferences.y = Math.round(rect.top);
	_preferences.save();
};
```

Uses native `getBoundingClientRect()` instead of parsing CSS strings.

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

---

## Reference: Clan Component (first GUIComponent migration)

### Files

- `src/UI/Components/Clan/Clan.js` — Component logic
- `src/UI/Components/Clan/Clan.html` — HTML template using `<ui-button>`, `<ui-text>`
- `src/UI/Components/Clan/Clan.css` — Styles with `:host` for dimensions/position

> **Note**: The Clan component was the first GUIComponent migration and still uses some `this.ui` proxy calls (`this.ui.hide()`, `this.ui.show()`, `this.ui.is(':visible')`). New components should use native DOM equivalents as described in this guide.

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

## Quick Reference: What NOT to do

| Don't                                                               | Do instead                                      | Why                                                |
| ------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| `jQuery(element).show()` inside shadow                              | `element.style.display = ''`                    | jQuery sets `display:block`, kills flex/grid       |
| `$el.closest('body').length`                                        | `el.isConnected`                                | `.closest()` can't cross shadow boundary           |
| `document.querySelector('.my-shadow-element')`                      | `this._shadow.querySelector(...)`               | Global queries can't see shadow content            |
| `this.ui.find('.foo')`                                              | `this._shadow.querySelector('.foo')`            | Proxy is for interop only                          |
| `this.ui.css('top', '100px')`                                       | `this._host.style.top = '100px'`                | Proxy is for interop only                          |
| `this.ui.show()` / `this.ui.hide()`                                 | `this._host.style.display = ''` / `= 'none'`    | Proxy is for interop only                          |
| `this.ui.is(':visible')`                                            | `this._host.style.display !== 'none'`           | Proxy is for interop only                          |
| Put `top`/`left` on inner element                                   | Put on `:host`                                  | Breaks magnetic snap positioning                   |
| Omit `:host { width; height }`                                      | Always declare dimensions on `:host`            | Host collapses to 0×0, snap/overflow broken        |
| Register click handlers on `document.body` expecting shadow targets | Register inside `this._container`               | Event retargeting hides real target                |
| Bind events in `onAppend()`                                         | Bind in `init()`, restore state in `onAppend()` | `onAppend()` runs every time — duplicates bindings |
| Set `position`/`z-index` on `:host` in CSS                          | Omit — set automatically by JS                  | Redundant, may conflict                            |
