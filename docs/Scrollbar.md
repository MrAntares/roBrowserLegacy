# Custom Scrollbar Usage Guide

The custom scrollbar system in roBrowserLegacy provides stylized scrollbars that match the Ragnarok Online interface while solving common issues like layout jitter and browser inconsistencies.

## 1. Basic Usage

The system automatically applies a scrollbar to any scrollable element inside a `GUIComponent` during `_setupScrollbars()` if it has:

- `overflow-y: auto;`
- `overflow-y: scroll;`

When attached to an element within a Shadow DOM, `ScrollBar.applyDOMScrollbar()` automatically injects `<style data-scrollbar>` into the component's `ShadowRoot`.

### Dynamic Padding

The scrollbar **automatically** manages `padding-right`. It will only add the space (e.g., 13px) when the content is long enough to require scrolling. If the content fits, the padding is removed to maximize your display area.

## 2. Using Custom Skins

To use a non-default skin (like the **ChatBox** skin), add the `data-scrollbar-skin` attribute to your HTML element:

```html
<!-- Inside your HTML template or JS creation -->
<div class="content" data-scrollbar-skin="chatbox">...</div>
```

## 3. Adding a New Skin

To add a new skin, modify [Scrollbar.js](../src/UI/Scrollbar.js).

### Step 1: Update `skinsToLoad`

Add a new object to the `skinsToLoad` array in `ScrollBar.init`:

```javascript
{
    name: 'myskin',
    files: [
        `${DB.INTERFACE_PATH}path/to/down.bmp`,  // [0] Down Button
        `${DB.INTERFACE_PATH}path/to/mid.bmp`,   // [1] Track (Repeated Y)
        `${DB.INTERFACE_PATH}path/to/up.bmp`,    // [2] Up Button
        `${DB.INTERFACE_PATH}path/to/bdown.bmp`, // [3] Thumb Bottom Part
        `${DB.INTERFACE_PATH}path/to/bmid.bmp`,  // [4] Thumb Middle Part
        `${DB.INTERFACE_PATH}path/to/bup.bmp`    // [5] Thumb Top Part
    ],
    colors: {
        track: '#000000', // Optional: Used if mid file is null
        thumb: '#9a9a9a'  // Optional: Used if thumb files are null
    },
    width: 13,      // Total width of the scrollbar area
    btnHeight: 12,  // Height of the up/down buttons
    btnWidth: 12,   // Width of the up/down buttons
    trackWidth: 13  // Width of the track and thumb
}
```

### Step 2: Component Tagging

Once the skin is added to `Scrollbar.js`, tag your component's element with `data-scrollbar-skin="myskin"`.

## 4. Manual Updates & Dynamic Content

- **Programmatic Scrolling (`scrollTop`)**:
  Programmatic changes to `element.scrollTop` (such as auto-scrolling to bottom, keyboard navigation, or scroll clamping) automatically trigger the native `scroll` event listener attached by `Scrollbar.js` (`element._roScrollHandler`). The scroll thumb position is synchronized immediately without requiring any manual notification or timer restarts.

- **Dynamic Content & Layout Changes**:
  If your component's content changes dynamically (e.g., elements inserted, removed, or resized) and you need to immediately refresh the scrollbar track and thumb dimensions without waiting for the automatic 300ms polling interval, call:
  ```javascript
  import ScrollBar from 'UI/Scrollbar.js';
  ScrollBar.applyDOMScrollbar(myElement);
  ```
  *(Note: If the scrollbar is already applied, `applyDOMScrollbar` safely refreshes the thumb geometry via its internal restart hook.)*
