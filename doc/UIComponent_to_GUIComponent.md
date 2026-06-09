# UIComponent → GUIComponent Agent Operational Guide

## Mission
Migrate legacy jQuery `UIComponent` modules to Shadow DOM `GUIComponent` with minimum errors.

**Agent objective:** preserve behavior, layout, input semantics, and engine integration.

---

## 0. Hard Invariants

1. **New component code uses native DOM only.** `this.ui` exists only for legacy/UIManager interoperability.
2. **Query inside shadow root, never `document`.**
3. **Host owns outer geometry.** Inner root owns internal layout.
4. **Event binding is lifecycle-sensitive.** Bind once in `init()`, restore in `onAppend()`, persist/cleanup in `onRemove()`.
5. **Shadow DOM breaks global assumptions.** Global CSS, jQuery traversal, jQuery event semantics, and CSS inheritance assumptions must be revalidated.
6. **When visibility is toggled at runtime, prefer inline display management.**
7. **When data comes from server packets or async callbacks, null-guard and multi-match guard DOM updates.**

---

## 1. Canonical Migration Skeleton

### Legacy Pattern
```js
const X = new UIComponent('X', htmlText, cssText);
```

### Target Pattern
```js
import GUIComponent from 'UI/GUIComponent.js';
import 'UI/Elements/Elements.js';

const X = new GUIComponent('X', cssText);
X.render = () => htmlText;
```

### Rule
- Constructor becomes `(name, cssText)`.
- HTML moves to `render()`.
- If legacy HTML was `null`, still return a minimal root wrapper from `render()`.

---

## 2. Lifecycle Contract

| Hook | Use | Never use for |
|---|---|---|
| `init()` | one-time binding, draggable setup, initial inline visibility, initial DOM refs | repeated state restore |
| `onAppend()` | re-apply position, body/global side effects, per-append sync | event rebinding |
| `onRemove()` | save prefs, cleanup, detach side effects | first-time setup |

### Rule
- **Bind once in `init()`.**
- **Restore every show/append in `onAppend()`.**
- **Persist/cleanup in `onRemove()`.**

---

## 3. Minimal Structural Template

```txt
document.body
└─ host div (#this._host)
   └─ shadowRoot
      ├─ style
      └─ container
         └─ component root (#ComponentName)
```

### Rule
- `:host` is the externally positioned box.
- `#ComponentName` is the internal layout root.
- Never treat shadow children as globally queryable.

---

## 4. Migration Checklist (Single Pass)

1. Create `Component.js`, `Component.html`, `Component.css`.
2. Convert constructor + add `render()`.
3. Convert jQuery selectors to shadow-root native queries.
4. Convert jQuery events to native `addEventListener`.
5. Move outer geometry rules to `:host`.
6. Keep internal layout and absolute children in inner root.
7. Replace legacy `show/hide/text/closest/body` assumptions.
8. Revalidate mouse mode, right-click, keyboard, scrollbar, tooltip, and async DOM update behavior.
9. Register with `UIManager`.
10. Test: show/hide, drag, resize, overlay alignment, keyboard input, async updates, right-click, scrollbars.

---

## 5. Old → New Pattern Table

| Legacy | Target | Rule |
|---|---|---|
| `new UIComponent(name, html, css)` | `new GUIComponent(name, css)` + `render()` | HTML belongs in `render()` |
| `this.ui.find(sel)` | `this._shadow.querySelector(sel)` | Query inside shadow root |
| `this.ui.find(sel)[0]` | `this._shadow.querySelector(sel)` | Native DOM over jQuery proxy |
| `this.ui.find(sel).show()` | `el.style.display = 'block'` or `''` only when CSS does not force hidden | Runtime visibility must be explicit |
| `this.ui.find(sel).hide()` | `el.style.display = 'none'` | Avoid jQuery show/hide semantics |
| `this.ui.find(sel).text(v)` | `el.innerHTML = DB.formatMsgToHtml(v)` when RO/game text; else `textContent` | Preserve RO formatting behavior |
| `document.querySelector(sel)` | `this._shadow.querySelector(sel)` | Shadow DOM isolation |
| `element.closest('body')` / `jQuery.contains(document, el)` | `el.isConnected` | DOM presence check must be shadow-safe |
| jQuery `.click/.mousedown/.on` | `addEventListener` | Native events do not emulate jQuery return semantics |
| jQuery `return false` | `e.preventDefault(); e.stopPropagation();` | Must be explicit |
| jQuery event priority hacks | capture phase listener | Use `{capture:true}` |
| jQuery `.position()` / `offsetTop` assumption | `getBoundingClientRect()` diff | Correct overlay coordinates |
| dynamic `.css({...})` | `Object.assign(el.style, {...})` | Native style writes |
| global `body { ... }` in component CSS | apply in `onAppend()` or global stylesheet | Shadow CSS cannot style document body |

---

## 6. CSS Placement Rules

## 6.1 Fixed-size components
### Target Pattern
```css
:host {
  width: W;
  height: H;
  top: T;
  left: L;
}

#ComponentName {
  width: 100%;
  height: 100%;
}
```

### Rule
- `:host` must define outer dimensions/position.
- Inner root must not own outer `top/left`.
- JavaScript already sets host `position:absolute` and z-index.

## 6.2 Dynamic-size / auto-size components
### Rule
- If host must derive size from inner content, do **not** force inner root to `position:absolute`.
- Use inner root `position:relative` when it must both size the host and anchor absolute children.

## 6.3 Full-viewport components
### Target Pattern
```css
:host { width:100%; height:100%; top:0; left:0; }
#ComponentName { width:100%; height:100%; }
```

### Rule
- Host has no intrinsic size; viewport components must size host explicitly.

## 6.4 Body/global CSS
### Rule
- `body`, `html`, or other outside-tree selectors in component CSS are dead code inside shadow CSS.
- Move them to global CSS or apply in `onAppend()`.

---

## 7. Visibility Rules

## 7.1 Runtime show/hide
| Symptom | Cause | Solution | Rule |
|---|---|---|---|
| element stays hidden after `style.display = ''` | CSS still says `display:none` | remove CSS-hidden default or use explicit inline display | runtime-toggled elements must be controlled by inline display |
| layout breaks after `.show()` conversion | jQuery `.show()` defaults to `block`, destroying flex/grid/original display | reset to `''` only if CSS declares visible display; otherwise use exact desired display | never assume visible mode is `block` |
| on-demand component never appears | hidden in `init()` but later only appended, never explicitly shown | do not hide in `init()` for append-on-demand components | distinguish toggle-style vs append-on-demand |

### Rule
- **Toggle-style component:** may hide in `init()` if later `show/toggle` explicitly reveals it.
- **On-demand append component:** do not hide in `init()`.

---

## 8. Event Rules

## 8.1 Native event conversion
| Legacy symptom | Cause | Solution | Rule |
|---|---|---|---|
| handler no longer blocks browser/default scene behavior | native listeners ignore return value | call `preventDefault()` / `stopPropagation()` yourself | jQuery `return false` never survives migration |
| priority-sensitive handler runs too late | jQuery queue reorder has no native equivalent | use capture phase | use `{capture:true}` for "must run first" handlers |
| right-click browser menu appears | jQuery used implicit preventDefault | add `contextmenu` listener and block it | any component handling right-click must suppress `contextmenu` |
| element-specific logic fails when listener is on `document.body` | shadow retargeting hides internal target identity | bind inside shadow tree | element-sensitive listeners belong in shadow/container |

### Rule
- For hover, click, drag, and menu logic tied to shadow elements, register at `this._container` / `this._shadow`, not global body.

---

## 9. Input and Keyboard Rules

| Symptom | Cause | Solution | Rule |
|---|---|---|---|
| typing fails in `<input>/<textarea>/<select>` | global key system consumes native keydown first | set `captureKeyEvents = true` and guard `onKeyDown` using `shadowRoot.activeElement` | form-field components must opt in to protected key handling |
| callback `this` changes unexpectedly | arrow function captured lexical `this`; caller used `.call/.apply` | keep regular `function()` | any callback relying on dynamic `this` must not be arrowified |

---

## 10. DOM Query Rules

| Symptom | Cause | Solution | Rule |
|---|---|---|---|
| query returns nothing | searching from `document` | search from `this._shadow` or helper root | shadow content is invisible to document queries |
| visible element detection is wrong | only checking inline `style.display` | fall back to `getComputedStyle(el).display` | computed style is authoritative for visibility checks |
| server packet crashes DOM update | `querySelector(...)` returned `null` | null-guard before write | any selector using dynamic server indices must be null-checked |
| only first matching slot updates | `querySelector` but selector matches multiple nodes | use `querySelectorAll(...).forEach(...)` | async updates by attribute need multi-match awareness |

### Rule
- Write a local `_getRoot()` helper for module-singleton components to centralize shadow-root access.

---

## 11. Geometry & Overlay Rules

| Symptom | Cause | Solution | Rule |
|---|---|---|---|
| overlay/tooltip label appears offset | `offsetTop/offsetLeft` relative to wrong offset parent | compute positions from `getBoundingClientRect()` deltas | never trust `offsetTop/offsetLeft` for shadow overlay alignment |
| dragged/resized bounds wrong | host geometry not defined correctly | keep external size/position on `:host` | screen-boundary logic reads host geometry |
| host shows scrollbars unexpectedly | same fixed dimensions on both host and inner root while inner content slightly exceeds host | remove conflicting duplicate dimensions or re-balance host/inner sizing | if migration introduces scrollbars, audit host-vs-inner dual sizing first |
| bottom/right anchored child disappears when host clips | host clips with `overflow:hidden`, inner root lacks `height:100%` | set inner root `height:100%` | clipped host + bottom-anchored children needs full-height inner root |
| host collapses to 0×0 in auto-size mode | inner root was `position:absolute`, removed from flow | use inner root `position:relative` | auto-sized host cannot size from absolutely positioned inner root |

---

## 12. Shadow Boundary Rules

| Symptom | Cause | Solution | Rule |
|---|---|---|---|
| global CSS stops affecting component | shadow CSS isolation | duplicate required shared rules in component/Common.css | any shadow-visible styling must live inside shadow CSS |
| child stops receiving mouse events | `:host { pointer-events:none }` crossed boundary via inheritance | restore `pointer-events:auto` on interactive children | inheritable host properties can leak into shadow children |
| element moved to `document.body` loses all styling | scoped CSS stayed in shadow root | apply required inline styles before move or move styles global | moving outside shadow tree severs scoped CSS |
| body/global styling in component CSS has no effect | selector targets outside tree | move to global or apply via JS | shadow CSS styles only shadow descendants |

---

## 13. Text & Content Rules

| Symptom | Cause | Solution | Rule |
|---|---|---|---|
| `^rrggbb` or DB markup renders literally | legacy jQuery `.text()` was overridden with RO formatter semantics | use `DB.formatMsgToHtml()` then assign `innerHTML` | user-facing RO/game text must preserve formatter pipeline |
| duplicated formatting helper drifts from engine behavior | local helper copied shared logic | centralize on `DB.formatMsgToHtml()` | prefer canonical formatter over local clones |

### Rule
- Use `textContent` only for plain text with no RO markup semantics.

---

## 14. Scrollbar Rules

| Symptom | Cause | Solution | Rule |
|---|---|---|---|
| custom scrollbar thumb jumps after manual scroll change | thumb sync loop is delayed | after setting `scrollTop/scrollLeft`, call `_roScrollbarRestart()` if present | programmatic scroll changes must resync custom scrollbar immediately |
| scrollbar visuals/styles missing | CSS injection/global assumptions broke in shadow | ensure scrollbar styles exist inside shadow/Common.css | shadow components need local scrollbar styling |

---

## 15. Safety Rules for Special Cases

| Case | Operational rule |
|---|---|
| selector/class starts with digit (e.g. `.3d`) | escape for native selectors: use CSS unicode escape syntax |
| asset path constants | use canonical source such as `DBManager.INTERFACE_PATH`; do not duplicate constants across base classes |
| dynamic DOM component had no HTML originally | still return at least one wrapper root from `render()` |
| custom elements conversion | preferred for `data-background`, `data-hover`, `data-down`, `data-active`, `data-text`, `data-preload`, but legacy data-attrs can still work if framework processing exists |

---

## 16. Decision Matrix: Host vs Inner Root

| Context | `:host` dimensions | inner root position | Notes |
|---|---|---|---|
| fixed-size window | explicit width/height/top/left | usually `absolute` or fill layout only | default migration case |
| viewport viewer/overlay | `100% x 100%`, `top:0`, `left:0` | fill host | host must be explicitly sized |
| auto-sized content window with absolute children | omit width/height when host must size from content | `relative` | lets host derive size and still anchor absolute descendants |
| dynamic-size component with clipping/row reveal | host dynamic height, often `overflow:hidden` | `height:100%` on inner root | required for bottom-anchored children |

---

## 17. Decision Matrix: Visibility Strategy

| Component usage pattern | Initial hide in `init()` | Show mechanism |
|---|---|---|
| appended once at startup, then toggled | yes | explicit show/hide/toggle |
| appended only when needed (on-demand) | no | append itself makes it visible |
| child element controlled repeatedly | no CSS `display:none` default unless explicit inline show strategy is guaranteed | inline display writes |

---

## 18. Agent Execution Rules (Compressible Form)

1. Build `GUIComponent(name, css)`; put HTML in `render()`.
2. Query only from shadow root.
3. Bind once in `init()`, restore in `onAppend()`, save/cleanup in `onRemove()`.
4. Put external geometry on `:host`; internal layout on inner root.
5. Use native DOM; `this.ui` only when legacy interop is required.
6. Replace jQuery `return false` with explicit prevent+stop.
7. If event must win priority, use capture phase.
8. If component handles right-click, suppress `contextmenu`.
9. If component has form inputs, protect key handling.
10. For overlays/tooltips, compute positions from bounding rects.
11. For user-facing RO text, use `DB.formatMsgToHtml()`.
12. For runtime visibility, control inline `display`; never assume `block`.
13. If host uses `pointer-events:none`, restore `pointer-events:auto` on interactive children.
14. If moving node outside shadow, inline-style it first.
15. If async update may hit multiple nodes, use `querySelectorAll`.
16. If async/server selector may miss, null-guard.
17. After programmatic scroll changes, resync custom scrollbar.
18. If native selector starts with digit, escape it.
19. Do not duplicate shared engine constants/utilities.
20. Re-test drag, resize, focus, right-click, tooltip, scroll, and async DOM paths after every migration.

---

## 19. Pre-Commit Validation Checklist

- [ ] component renders with shadow root
- [ ] no `document.querySelector(...)` used for internal nodes
- [ ] no jQuery `.show()/.hide()/.text()/.closest('body')` assumptions remain
- [ ] host sizing strategy matches component type
- [ ] overlay coordinates verified visually
- [ ] keyboard input verified if form fields exist
- [ ] right-click verified if component handles mouse button 2/3
- [ ] async callbacks use null-guard / multi-match guard where needed
- [ ] moved-outside-shadow elements restyled explicitly
- [ ] custom scrollbar resync verified after programmatic scroll

---

## 20. Compact Failure Map

| If you see this | Check this first |
|---|---|
| element exists but invisible | CSS `display:none` fallback / wrong display mode / host size 0×0 |
| clicks don't fire | host/child `pointer-events`, shadow listener placement, explicit prevent/stop |
| overlay in wrong position | `getBoundingClientRect()` vs offset math |
| browser menu appears | missing `contextmenu.preventDefault()` |
| text markup broken | `DB.formatMsgToHtml()` not used |
| only one duplicated slot updates | `querySelectorAll` missing |
| crash during packet render | null guard missing |
| scroll thumb desyncs | `_roScrollbarRestart()` missing |
| body/global style missing | styling placed inside shadow CSS |
| component has new scrollbars | host + inner dimensions conflict |

---

## 21. Preferred Minimal Helper Patterns

### Shadow root lookup
```js
const root = this._shadow;
const el = root.querySelector('.x');
```

### Explicit visibility
```js
el.style.display = 'none';
el.style.display = 'block';
```

### Safe visibility check
```js
const shown = getComputedStyle(el).display !== 'none';
```

### Safe async update
```js
root.querySelectorAll(`[data-index="${idx}"]`).forEach((el) => {
  // update
});
```

### Dynamic index guard
```js
const el = root.querySelector(selector);
if (!el) return;
```

### Overlay position
```js
const a = target.getBoundingClientRect();
const b = rootEl.getBoundingClientRect();
const left = a.left - b.left;
const top = a.top - b.top;
```

### Native right-click suppression
```js
el.addEventListener('contextmenu', (e) => e.preventDefault());
```

---

## 22. Final Agent Rule

**Do not translate legacy jQuery behavior mechanically. Translate intent across these axes:**
- DOM scope
- geometry owner
- lifecycle timing
- event semantics
- visibility semantics
- formatter/util ownership
- async safety

If a migrated component fails, the root cause is usually one of those axes.
