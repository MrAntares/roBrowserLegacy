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
- `this.ui` is a jQuery-compatible proxy object so UIManager and legacy UIComponent instances can interoperate without changes

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

Clan.render = function render() {
	return htmlText; // ← HTML goes here
};
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
	this.draggable('.titlebar'); // ← accepts CSS selector string (resolved inside shadow)
};

Clan.onAppend = function onAppend() {
	const root = this._shadow || this._host;
	const closeBtn = root.querySelector('.close');
	if (closeBtn) {
		closeBtn.addEventListener('mousedown', e => e.stopImmediatePropagation());
		closeBtn.addEventListener('click', () => Clan.toggle());
	}
};
```

**RULE**: `draggable()` accepts a CSS selector string — it resolves inside the shadow DOM automatically. Event binding that depends on the DOM being in the document should go in `onAppend()`, not `init()`.

### 7. Convert show/hide/toggle

**Before:**

```javascript
Guild.toggle = function () {
	if (this.ui.is(':visible')) this.ui.hide();
	else this.ui.show();
};
```

**After (identical — proxy handles it):**

```javascript
Clan.toggle = function () {
	if (this.ui.is(':visible')) this.ui.hide();
	else this.ui.show();
};
// Or use this.hide() / this.show() if defined
```

The `this.ui` proxy implements `.is(':visible')`, `.show()`, `.hide()`, `.css()`, `.offset()`, `.position()`, `.width()`, `.height()`, `.find()`, `.parent()`, `.detach()`, `.appendTo()`, `.trigger()`.

### 8. Convert preferences (position save/restore)

**Before:**

```javascript
// Position is saved/restored via jQuery .position() and .css()
```

**After:**

```javascript
Clan.onRemove = function onRemove() {
	const rect = this._host.getBoundingClientRect();
	_preferences.x = rect.left;
	_preferences.y = rect.top;
	_preferences.save();
};
```

### 9. Register with UIManager

Same as before:

```javascript
export default UIManager.addComponent(Clan);
```

`UIManager.addComponent()` accepts both `UIComponent` and `GUIComponent` instances.

---

## Known Shadow DOM Pitfalls (Bug Reference)

### 1. jQuery `.show()` sets `display: block` instead of restoring original value

**Bug**: jQuery 1.9.1's `isHidden()` function uses `jQuery.contains(document, element)` which returns `false` for elements inside Shadow DOM (because `Node.contains()` does not traverse shadow boundaries). When `.show()` is called, jQuery thinks the element was never in the document, falls back to `css_defaultDisplay("DIV")` which returns `"block"`, and sets `display: block` inline — overriding any CSS `display: flex` or `display: grid`.

**Fix applied in `src/UI/Scrollbar.js`** (commit `7ce87bf9`):

```javascript
// WRONG — jQuery .show() sets display:block, kills flex layout
$scrollbar.show();
$scrollbar.hide();

// CORRECT — manipulate style.display directly
$scrollbar[0].style.display = ''; // removes inline style, CSS rule applies
$scrollbar[0].style.display = 'none';
```

**RULE**: Never use jQuery `.show()`, `.hide()`, `.toggle()`, `.fadeIn()`, `.fadeOut()` on elements inside Shadow DOM. Always use `element.style.display` directly.

### 2. Global CSS does not penetrate Shadow DOM

**Bug**: CSS rules in the global `<style>` tag (e.g., `.custom-cursor * { cursor: none!important; }` from CursorManager) do not affect elements inside Shadow DOM.

**Fix applied in `src/UI/Common.css`** (commit `f4183351`):

```css
:host-context(.custom-cursor) * {
	cursor: none !important;
}
```

This rule is inside `Common.css` which is injected into every Shadow DOM. `:host-context(.custom-cursor)` checks if any ancestor of the shadow host has the class `custom-cursor` (set on `document.body` by CursorManager).

**RULE**: Any global CSS that needs to affect Shadow DOM content must be added to `Common.css`.

### 3. Scrollbar CSS injection into Shadow DOM

**Bug**: The scrollbar CSS (`.ui-custom-scrollbar` styles) is injected into the global `<style>` tag by `Scrollbar.js setupStyles()`. These styles don't reach elements inside Shadow DOM.

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

### 7. The `this.ui.css()` proxy does not support object syntax as first argument

**Current limitation**: The `css()` method on the proxy checks `if (value === undefined)` before `if (typeof prop === 'object')`. Calling `this.ui.css({ top: 100, left: 200 })` enters the getter branch and crashes with `prop.replace is not a function`.

**Workaround**: Use individual calls:

```javascript
this.ui.css('top', 100);
this.ui.css('left', 200);
```

Or manipulate the host directly:

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

| Don't                                                               | Do instead                           | Why                                          |
| ------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- |
| `jQuery(element).show()` inside shadow                              | `element.style.display = ''`         | jQuery sets `display:block`, kills flex/grid |
| `$el.closest('body').length`                                        | `el.isConnected`                     | `.closest()` can't cross shadow boundary     |
| `document.querySelector('.my-shadow-element')`                      | `this._shadow.querySelector(...)`    | Global queries can't see shadow content      |
| Put `top`/`left` on inner element                                   | Put on `:host`                       | Breaks magnetic snap positioning             |
| Omit `:host { width; height }`                                      | Always declare dimensions on `:host` | Host collapses to 0×0, snap/overflow broken  |
| Register click handlers on `document.body` expecting shadow targets | Register inside `this._container`    | Event retargeting hides real target          |
