# Chat tabs: click, double-click, rename

What the mouse and the keyboard do on the tabs of the chat window.

## The native client

ver12 has two fixed tabs and no rename. The 2022 and mars26 builds agree on
everything below.

| Action | What happens |
|---|---|
| click on another tab | switches to it; nothing else |
| click on the active tab | nothing |
| double-click on a tab | opens an edit box over that tab with its name, gives it the keyboard focus right away, whole name selected |
| Enter while renaming | keeps the new name and closes the edit box; with an empty name, nothing happens and the edit box stays |
| Escape while renaming | closes the edit box and keeps the old name |
| click on any tab while renaming | closes the edit box and keeps the old name |
| click inside the edit box while renaming | goes to the edit box, not the tabs: the rename stays open |
| right click on a tab | nothing |

A single click never gives the keyboard focus to a tab: what had it, the chat
input for example, keeps it.

A tab added with the `+` button starts with **every filter off**: it shows
nothing until the player ticks message types in the filter window. It is not a
copy of the current tab. At the bottom of the filter window, an `all on` check
box turns every filter of the tab on at once, or every one off when unticked;
it shows ticked only while all of them are on. The two tabs of a first run come from the client's Lua
data, not from the exe. At most 10 tabs exist, counting the ones torn off into
their own window.

A new name is refused with a message box when the tabs would no longer fit in
the window: the check is the number of tabs times the width of the name drawn
at 12 px plus 10, against the window width minus 90. There is no limit on the
number of characters.

## This port

- A tab's name is a read-only `input`. A click on a tab cancels the `mousedown`
  default, so the name gets no focus and no caret, and the focus stays where it
  was.
- A double-click makes it editable, focuses it and selects the whole name.
- Enter with a non-blank name saves it (trimmed) and ends the rename, and the
  key goes no further: it does not also open the chat input. Enter with a
  blank name does nothing.
- Escape, a click on a tab, or the focus leaving the name in any other way ends
  the rename and puts the saved name back.
- A click inside the name being edited only moves the caret: the rename stays
  open, as in the client.
- A tab added with `+` starts with every filter off, as in the client.
- The filter window's `All on` box (label included) does the same as the
  client's.

## Deviations

- **Focus loss cancels.** In the client the edit box stays open when the focus
  goes elsewhere; only Enter, Escape or a click on a tab close it. Here,
  anything that takes the focus away (a click on the map, another window)
  ends the rename and keeps the old name, so a tab is never left half-edited
  with no way to see it.
- **No width check.** A name that would not fit is not refused; it scrolls
  inside its tab.
- **Six tabs at most**, not ten.
- **No tab drag.** The client can tear a tab off into its own chat window when
  the window's drag toggle is on. The port does not.

## Where the details come from

2022: the tabs are a child tab control kept at `chatWnd+0x118` (init
`fcn.0054b010`, which also creates the rename edit box and parks it at
(-100, -100)). Click `fcn.0055cf60`: picks the tab under the cursor, hides the
edit box, sends message `0x16` to the chat window, whose handler
(`fcn.005d5e80`) only repaints when the index did not change. Double-click
`fcn.0055c9b0`: sets the edit text, moves it over the tab and gives it the
focus (`fcn.00642460`); on focus the text is selected `[0, len]`
(`fcn.0052a120`). The edit box is a child of the tab control (`AddChild`
`fcn.00a887a0`), and a click goes to the deepest child under the cursor: the
window manager's hit-test (`fcn.0062e5e0`, called from `fcn.0063e390`, which
then calls slot `+0x58` on the result) recurses through `UIWindow` slot
`+0xb8` (`fcn.00a8e950`), so a click on the open edit box never reaches the
tab click above. End of rename: tab-control `fcn.00565410`, message 0 from the
edit box, argument 0 = Enter (empty text: no-op; width check, refusal message
`0x629`), argument 1 = Escape (`fcn.0063ca70` case `0x1b`), which only hides
it. The edit box's kill-focus path (`fcn.0052d860` -> `fcn.00531bd0`) never
calls the tab control. New tab: chat-window case `0x16e` of `fcn.005d5e80`
names it `NewTab_<n>` and zeroes its 22 filter bytes (`0x005d792d`-`0x005d793e`);
the 10-tab cap is `this+0xf0 = 0xa` set in the ctor (`0x005b30a7`), refused with
message `0x62a`. `all on`: a check box built in the filter window's create
(`fcn.005c0200`, label at `0x005c02d8`, `checkbox_0.bmp` / `checkbox_1.bmp`),
control `0xcd` in its SendMsg (`fcn.005d3cc0`), which writes the one value to
all 22 filters; on a tab change the same handler ticks it only when the 22 are
set. mars26: the same shape in `fcn.00774670`,
`fcn.007880c0`, `fcn.007879e0`, `fcn.00790e10`, `fcn.008f1fd0`, new tab at
`0x00824a48` in `fcn.00822e10`. ver12: tab
click `fcn.004a00f0`, two tabs, no edit box.
