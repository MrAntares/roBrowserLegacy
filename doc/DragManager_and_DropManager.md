# DragManager and DropManager

## Overview

`DragManager` and `DropManager` are project-owned UI infrastructure for drag/drop behavior. They are not browser APIs and they are not external dependencies.

They deliberately stay as two managers:

- `DragManager` owns drag sources and custom pointer-driven drag sessions.
- `DropManager` owns drop zones and Shadow DOM-aware target routing.

The split matters because `DropManager` can route both custom drags from `DragManager` and browser-native drag/drop events from legacy code or external sources. `DragManager` depends on `DropManager` during movement and release, but `DropManager` does not require `DragManager`.

Prefer the component helper APIs in normal UI code:

```javascript
this.dragSource('.container .content', {
	selector: '.item',
	data(source) {
		return { type: 'item', from: 'Inventory', data: item };
	}
});

this.droppable({
	accept(data) {
		return data && data.type === 'item';
	},
	drop(event, data) {
		// Use the payload directly.
	}
});
```

Use direct manager imports only for lower-level integrations such as map canvas registration or tests.

---

## Responsibilities

### DragManager

`src/UI/DragManager.js`

`DragManager` replaces browser-native `draggable="true"` for game UI item, skill, shortcut, and icon dragging. It behaves like official client:

- starts from pointer, mouse, or touch input,
- waits for a movement threshold before activating,
- creates a fixed-position helper clone or custom helper,
- moves the helper by pointer coordinates,
- keeps keyboard shortcuts active during drag,
- avoids the browser-native drag cursor and native `dataTransfer` drag session,
- sets `window._OBJ_DRAG_` while an active custom drag is running,
- routes hover and drop through `DropManager`,
- falls back to dispatching a legacy DOM `drop` event when no `DropManager` zone matches.

### DropManager

`src/UI/DropManager.js`

`DropManager` is a Shadow DOM-aware drop target router:

- registers native DOM elements as drop zones,
- reads drag payload data from `window._OBJ_DRAG_` or native `dataTransfer`,
- resolves the top accepted zone at a coordinate,
- calls `enter`, `leave`, `over`, and `drop` callbacks,
- supports browser-native `dragover`, `drop`, `dragend`, and `blur` events,
- ignores hidden, detached, or rejected zones,
- preserves legacy direct DOM drop handlers when no registered zone matches.

---

## Component Helpers

Both `UIComponent` and `GUIComponent` expose helpers so components do not need to import the managers directly.

### `this.dragSource(targetOrOptions, options)`

Registers a `DragManager` source owned by the component.

Supported target forms:

```javascript
this.dragSource({ data });
this.dragSource('.container .content', { selector: '.item', data });
this.dragSource(element, { selector: '.item', data });
```

Behavior:

- `this.dragSource({ ... })` registers the component root.
- In `GUIComponent`, selector targets are resolved inside the component Shadow DOM.
- In `UIComponent`, selector targets are resolved from the component's jQuery root.
- The helper injects `component: this`.
- The unregister callback is stored in `__dragUnregisters`.

Cleanup:

```javascript
this.clearDragSources();
```

### `this.droppable(targetOrOptions, options)`

Registers a `DropManager` zone owned by the component.

Supported target forms:

```javascript
this.droppable({ drop });
this.droppable('.slot', { accept, drop });
this.droppable(element, { accept, drop });
```

Behavior:

- `this.droppable({ ... })` registers the component root or host.
- In `GUIComponent`, selector targets are resolved inside the component Shadow DOM.
- In `UIComponent`, selector targets are resolved from the component's jQuery root.
- The helper injects `component: this`.
- The unregister callback is stored in `__dropUnregisters`.

Cleanup:

```javascript
this.clearDroppables();
```

### Legacy event mode

Use `legacyEvent: true` only when migrating old drop handlers that still read `event.originalEvent.dataTransfer.getData('Text')`.

```javascript
this.droppable({
	legacyEvent: true,
	accept(data) {
		return data && data.type === 'item';
	},
	drop: onOldDropHandler
});
```

New code should consume `data` directly:

```javascript
this.droppable({
	accept(data) {
		return data && data.type === 'item' && data.from === 'Inventory';
	},
	drop(_event, data) {
		EquipmentV3.onEquipItem(data.data.index, data.data.location);
	}
});
```

---

## DragManager API

Import:

```javascript
import DragManager from 'UI/DragManager.js';
```

### `DragManager.register(root, options)`

Registers a drag source root and returns an idempotent unregister function.

```javascript
const unregister = DragManager.register(root, {
	selector: '.item',
	data(source, event) {
		return { type: 'item', from: 'Inventory', data: item };
	}
});
```

`root` may be:

- a native `Element`,
- a `ShadowRoot`,
- a jQuery-like object whose first element is a native element or `ShadowRoot`.

Required option:

| Option                | Type       | Purpose                                                                                |
| --------------------- | ---------- | -------------------------------------------------------------------------------------- |
| `data(source, event)` | `Function` | Returns the drag payload. Return `null`, `undefined`, or `false` to cancel activation. |

Optional options:

| Option                                | Default                                              | Purpose                                                                                             |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `component`                           | `null`                                               | Owner component used by `unregisterComponent`.                                                      |
| `selector`                            | `null`                                               | Delegated source selector inside `root`.                                                            |
| `helper(source, data)`                | `source.cloneNode(true)` with computed styles copied | Returns the helper element shown during drag.                                                       |
| `cursorAt`                            | pointer's position inside source                     | jQuery-style helper offset. Supports `left`, `top`, `right`, `bottom`.                              |
| `threshold`                           | `4`                                                  | Pixels before a pending press becomes an active drag. Preserves normal click/double-click behavior. |
| `zIndex`                              | `2500`                                               | Helper `z-index`.                                                                                   |
| `appendTo`                            | `document.body`                                      | Helper parent. May be a ShadowRoot.                                                                 |
| `hideSource`                          | `false`                                              | Temporarily sets source visibility to hidden.                                                       |
| `sourceClass`                         | `null`                                               | Class added to source while active.                                                                 |
| `start(source, event, data)`          | none                                                 | Called after activation.                                                                            |
| `move(source, event, data)`           | none                                                 | Called after each active movement.                                                                  |
| `end(source, event, data, result)`    | none                                                 | Called after release. `result` is the matched drop zone or `null`.                                  |
| `cancel(source, event, data, reason)` | none                                                 | Called when an active drag is canceled.                                                             |

### `DragManager.unregister(token)`

Unregisters a source.

`token` may be:

- the unregister function returned by `register`,
- a numeric registration id,
- a registration-like object with `id`.

If the registration owns the current drag session, the drag is canceled.

### `DragManager.unregisterComponent(component)`

Unregisters all drag sources whose `component` option matches the component.

Usually components should call:

```javascript
this.clearDragSources();
```

### `DragManager.start(event, options)`

Starts a drag programmatically from an event and options object.

```javascript
DragManager.start(event, {
	root,
	source,
	data() {
		return payload;
	}
});
```

This uses the same behavior as `register`, but creates a one-off registration with id `0`.

### `DragManager.cancel(reason)`

Cancels the current pending or active drag session.

```javascript
DragManager.cancel('modal-opened');
```

### `DragManager.isDragging()`

Returns `true` only while a drag is active. A pending press below threshold is not considered dragging.

### `DragManager.getData()`

Returns the active drag payload, or `null` when no active drag is running.

### `DragManager.createLegacyEvent(type, event, data, target)`

Builds a jQuery-style event object with:

- `type`
- `target`
- `currentTarget`
- `clientX`, `clientY`, `pageX`, `pageY`
- `button`, `which`
- `preventDefault()`
- `stopPropagation()`
- `stopImmediatePropagation()`
- `originalEvent.dataTransfer.getData('Text')`
- `originalEvent.dataTransfer.getData('text/plain')`

Use this only for legacy handlers that still expect `event.originalEvent.dataTransfer`.

---

## Drag Session Lifecycle

1. `pointerdown`, `mousedown`, or `touchstart` occurs inside a registered root.
2. `DragManager` finds the source:
    - if `selector` exists, it uses `event.target.closest(selector)`;
    - otherwise the root itself is the source.
3. A pending session is created.
4. Movement stays below `threshold`: no helper is created and normal click behavior remains.
5. Movement reaches `threshold`:
    - `data(source, event)` is called,
    - a falsy cancel value stops the drag,
    - the helper is created and positioned,
    - `window._OBJ_DRAG_` is set,
    - `sourceClass` and `hideSource` are applied,
    - `start(source, event, data)` is called,
    - `DropManager.overAt(...)` is called immediately.
6. During movement:
    - the source event is prevented,
    - the helper follows the pointer,
    - `DropManager.overAt(...)` routes hover callbacks,
    - `move(source, event, data)` is called.
7. On release:
    - `DropManager.dropAt(...)` is called,
    - if no zone matches, a synthetic DOM `drop` is dispatched to `document.elementFromPoint(...)`,
    - helper/source state/window payload are cleaned,
    - `end(source, event, data, result)` is called.
8. On cancel:
    - `DropManager.clearHover(...)` is called,
    - helper/source state/window payload are cleaned,
    - `cancel(source, event, data, reason)` is called.

`DragManager` also prevents native `dragstart` for matching sources. This is important while old markup still contains `draggable="true"` during migration.

---

## DropManager API

Import:

```javascript
import DropManager from 'UI/DropManager.js';
```

### `DropManager.register(element, options)`

Registers a drop zone and returns an idempotent unregister function.

```javascript
const unregister = DropManager.register(element, {
	accept(data) {
		return data && data.type === 'item';
	},
	drop(event, data, zone) {
		// handle drop
	}
});
```

`element` must be a native DOM element. `ShadowRoot` is not accepted as a drop zone because hit testing uses the zone element's bounding rect.

Required option:

| Option                    | Type       | Purpose                                        |
| ------------------------- | ---------- | ---------------------------------------------- |
| `drop(event, data, zone)` | `Function` | Called when this zone receives a matched drop. |

Optional options:

| Option                      | Default                        | Purpose                                                                       |
| --------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `component`                 | `null`                         | Owner component used by `unregisterComponent` and default z-index resolution. |
| `accept(data, event, zone)` | accepts non-null data          | Filters payloads.                                                             |
| `enter(event, data, zone)`  | none                           | Called when hover changes into this zone.                                     |
| `leave(event, data, zone)`  | none                           | Called when hover leaves this zone.                                           |
| `over(event, data, zone)`   | none                           | Called on every routed hover over this zone.                                  |
| `getZIndex(zone)`           | component/host/element z-index | Override for overlap resolution.                                              |
| `stopPropagation`           | `true`                         | Stops matched native/drop events after `preventDefault`.                      |

### `DropManager.unregister(elementOrToken)`

Unregisters zones by:

- the unregister function returned by `register`,
- numeric zone id,
- zone-like object with `id`,
- registered element.

### `DropManager.unregisterComponent(component)`

Unregisters all zones whose `component` option matches the component.

Usually components should call:

```javascript
this.clearDroppables();
```

### `DropManager.getTargetAt(clientX, clientY, data, event)`

Returns the best accepted zone at the coordinate, or `null`.

If `data` is `undefined`, `DropManager.getDragData(event)` is used.

### `DropManager.overAt(clientX, clientY, event, data)`

Routes hover for custom drags. This is what `DragManager` calls while moving.

Behavior:

- finds the current accepted zone,
- calls `leave` on the previous hovered zone when it changes,
- calls `enter` on the new hovered zone when it changes,
- calls `event.preventDefault()` when a zone matches,
- calls `zone.over(event, data, zone)` when provided,
- returns the matched zone or `null`.

### `DropManager.dropAt(clientX, clientY, event, data)`

Routes a custom drop. This is what `DragManager` calls on release.

Behavior:

- finds the current accepted zone,
- clears hover state,
- prevents the event when a zone matches,
- stops propagation unless `stopPropagation: false`,
- calls `zone.drop(event, data, zone)`,
- returns the matched zone or `null`.

### `DropManager.clearHover(event, data)`

Clears the currently hovered zone and calls its `leave` callback when needed.

### `DropManager.getDragData(event)`

Reads payload data in this order:

1. `window._OBJ_DRAG_` when defined,
2. `event.originalEvent.dataTransfer.getData('Text')`,
3. `event.originalEvent.dataTransfer.getData('text/plain')`.

`dataTransfer` strings are JSON-parsed when possible. If JSON parsing fails, the raw string is returned.

---

## Drop Target Resolution

A zone is eligible only when:

- its element exists,
- its element is connected to the document,
- the element and composed parents are not `display: none` or `visibility: hidden`,
- the pointer coordinate is inside the element's bounding rect,
- `accept(data, event, zone)` returns truthy, or no `accept` callback exists and `data` is non-null.

When multiple zones overlap, `DropManager` chooses:

1. highest z-index,
2. smaller bounding area,
3. latest registration order.

Default z-index resolution:

1. `zone.component._host` for `GUIComponent`,
2. the shadow host when the zone is inside Shadow DOM,
3. the registered element.

Use `getZIndex(zone)` when a component needs custom stacking rules.

---

## Native Drag Compatibility

`DropManager` installs global native listeners lazily when the first zone is registered:

- `document.dragover`
- `document.drop`
- `document.dragend`
- `window.blur`

On native `dragover`, it calls `overAt(...)`.

On native `drop`, it:

- reads data via `getDragData(event)`,
- resolves the target zone,
- clears hover,
- does nothing when no zone matches,
- prevents/stops the event and calls `drop` when a zone matches.

That "do nothing when no zone matches" rule is important. It allows old direct drop handlers, such as a canvas or legacy component handler, to continue receiving DOM drop events until they are migrated.

---

## Payload Conventions

The managers do not enforce a payload schema. Current UI migrations use this shape for inventory items:

```javascript
{
	type: 'item',
	from: 'Inventory',
	data: item
}
```

Recommended fields:

| Field  | Purpose                                                               |
| ------ | --------------------------------------------------------------------- |
| `type` | Generic payload category: `item`, `skill`, `shortcut`, etc.           |
| `from` | Source family or component: `Inventory`, `Storage`, `CartItems`, etc. |
| `data` | The actual game object or minimal command payload.                    |

Drop zones should filter with `accept()` and then consume the exact payload fields they need.

```javascript
this.droppable({
	accept(data) {
		return data && data.type === 'item' && data.from === 'Inventory';
	},
	drop(_event, data) {
		const item = data.data;
		EquipmentV3.onEquipItem(item.index, item.location);
	}
});
```

Avoid parsing `dataTransfer` in new code. Use direct payload data.

---

## Inventory Item Drag Example

This pattern is used by the migrated Inventory versions.

```javascript
this.dragSource('.container .content', {
	selector: '.item',
	cursorAt: { right: 10, bottom: 10 },
	data(source) {
		const index = parseInt(source.getAttribute('data-index'), 10);
		const item = InventoryV2.getItemByIndex(index);

		if (!item) {
			return null;
		}

		return {
			type: 'item',
			from: 'Inventory',
			data: item
		};
	},
	helper(source) {
		const icon = source.querySelector('.icon');
		const helper = document.createElement('div');
		helper.className = 'item-drag-helper';
		helper.style.width = '24px';
		helper.style.height = '24px';
		helper.style.backgroundRepeat = 'no-repeat';
		helper.style.backgroundPosition = 'center';
		helper.style.backgroundSize = 'contain';

		const backgroundImage = icon.style.backgroundImage || window.getComputedStyle(icon).backgroundImage;
		if (backgroundImage && backgroundImage !== 'none') {
			helper.style.backgroundImage = backgroundImage;
		}

		return helper;
	},
	start() {
		onItemOut();
	}
});
```

Why use `helper()` here?

The source `.item` may contain amount labels, lock overlays, or other UI details. A custom helper can show only the icon while the source element remains unchanged.

---

## Equipment Drop Example

New drop handlers should consume `data` directly.

```javascript
this.droppable({
	accept(data) {
		const item = data && data.type === 'item' && data.from === 'Inventory' ? data.data : null;
		return Boolean(item && item.IsIdentified && !item.IsDamaged);
	},
	over(_event, data) {
		const item = data.data;
		showEquipmentDropHighlight(item.location);
	},
	leave() {
		clearEquipmentDropHighlight();
	},
	drop(_event, data) {
		const item = data.data;
		clearEquipmentDropHighlight();
		EquipmentV3.onEquipItem(item.index, item.location);
	}
});
```

Use `legacyEvent: true` only if the existing `drop` function still expects old jQuery/native data-transfer access.

---

## Map Canvas Drop Example

For non-component targets such as the map canvas, register directly with `DropManager`.

```javascript
const unregister = DropManager.register(Renderer.canvas, {
	accept(data) {
		return data && data.type === 'item' && data.from === 'Inventory';
	},
	drop(event, data) {
		onDrop.call(this, DragManager.createLegacyEvent('drop', event, data, Renderer.canvas));
	}
});
```

This keeps map behavior working while other UI families migrate one by one.

---

## Shadow DOM Notes

`DropManager` is Shadow DOM-aware in target resolution:

- visibility checks walk composed parents through shadow hosts,
- default z-index checks the component host for `GUIComponent`,
- `GUIComponent.droppable('.slot', options)` resolves `.slot` inside the component shadow root.

`DragManager` supports Shadow DOM source roots:

- `DragManager.register(shadowRoot, options)` is valid,
- `GUIComponent.dragSource('.content', options)` resolves the root inside shadow,
- delegated `selector` matching still uses `event.target.closest(selector)`, so register inside the shadow tree when you need real internal targets.

For GUI components, prefer:

```javascript
this.dragSource('.content', {
	selector: '.item',
	data(source) {
		return payload;
	}
});

this.droppable('.equipment-slot', {
	drop(event, data) {
		// ...
	}
});
```

Do not register listeners on `document.body` expecting Shadow DOM internals as `event.target`; browser retargeting hides internal nodes outside the shadow tree.

---

## Cleanup Rules

Most components do not need to unregister on normal `remove()`.

Reasons:

- `DropManager` ignores disconnected elements.
- `DragManager` cancels stale pending sessions when sources are detached or replaced.
- Many UI components are detached and re-appended rather than destroyed.

Use cleanup when a component permanently replaces dynamic source/drop nodes:

```javascript
this.clearDragSources();
this.clearDroppables();
```

For lower-level direct registrations:

```javascript
const unregister = DropManager.register(element, options);
unregister();
```

The unregister functions are idempotent, so calling them more than once is safe.

---

## Common Pitfalls

### Do not use browser-native `draggable` for game item dragging, skill icon dragging

Native HTML drag starts a browser drag session. That can switch to the system cursor and interfere with game keyboard shortcuts. Use `DragManager` for game UI data dragging.

### Do not parse `dataTransfer` in new code

New drop handlers receive `data` directly.

Wrong for new code:

```javascript
const data = JSON.parse(event.originalEvent.dataTransfer.getData('Text'));
```

Preferred:

```javascript
drop(_event, data) {
	const item = data.data;
}
```

### Keep window movement separate

`DragManager` is for item, skill, shortcut, and icon payload dragging.

Window movement should continue to use:

```javascript
this.draggable('.titlebar');
```

### Register smaller nested zones after broad zones

`DropManager` already prefers smaller area when z-index ties. Registering specific nested targets after broader root targets also helps latest registration order choose the intended zone when size and z-index are equal.

### Return `null` from `data()` to cancel drag

Do not create dummy payloads for missing items.

```javascript
data(source) {
	const item = getItem(source);
	return item ? { type: 'item', from: 'Inventory', data: item } : null;
}
```

### Use custom helpers for clean drag visuals

When the source contains amounts, labels, locks, or overlays, keep the source selector on the real item and customize the helper.

```javascript
this.dragSource('.content', {
	selector: '.item',
	helper(source) {
		return source.querySelector('.icon').cloneNode(true);
	},
	data(source) {
		return payload;
	}
});
```

---

## Testing Checklist

For drag source migrations:

- primary mouse button starts drag,
- right click does not start drag,
- movement below threshold still clicks normally,
- helper appears only after threshold,
- helper follows the cursor and is removed on release,
- `window._OBJ_DRAG_` exists only during active drag,
- keyboard shortcuts still fire during drag,
- source visibility/class is restored after end/cancel,
- no native browser drag cursor appears.

For drop target migrations:

- accepted payload drops call `drop`,
- rejected payloads do not call `drop`,
- `over` runs while hovering an accepted zone,
- `leave` runs when leaving or dropping,
- hidden and detached zones are ignored,
- nested/smaller zones win over broad zones when z-index ties,
- higher z-index zones win when overlapping,
- legacy direct DOM drop handlers still work when no `DropManager` zone matches.
