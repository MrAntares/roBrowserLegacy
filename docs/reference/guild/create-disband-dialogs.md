# The create and disband dialogs

Introduced by `f116b74c`.

`GuildCompanion` is one window serving two modes. That is not a shortcut - it
is what the client does.

## Rules

- **One window, two modes.** The client builds a single `UICreateGuildWnd` with
  a mode flag, and its draw swaps exactly two strings off that flag: the
  caption and the field label. Do not add a second component.
- **Captions and labels come from the message table**, not from English
  literals: 2076 / 2077 for create, 2088 / 2089 for disband, 2078 for the first
  pane, 2080 for an empty name, 2564 for the storage warning.
- **Buttons are `ui-button` on the client's bitmaps** - `btn_ok`, `btn_cancel`
  and the `guild_helper` set the client ships for this very window. Not raw
  `<button>`; every sibling window blits the client's bitmaps.
- **Both title bars are drag handles.** Only one was bound before, and it sat
  in the pane that disband mode hides - so that dialog could not be moved.
- **Keep the disband key check.** It is load-bearing, not a convenience. See
  below.
- **The storage warning is OK-only and not cancellable.**

## Why

### One window, two modes

Window class **`0xd5`** (create) and class **`0xd7`** (disband) are one
`UICreateGuildWnd` built with a mode flag. ver12's draw `fcn.005f2150` reads
that flag at **`this+0xa0`** and takes msgstrings `0x81c` / `0x81d` for create
and `0x828` / `0x829` for disband - ids 2076 / 2077 and 2088 / 2089. Those two
strings are the only difference.

### The key check stands in for a packet that never arrives

rAthena's `guild_break` returns 0 with **no packet at all** when the name does
not match, so without a client-side check the dialog waits for an answer that
never comes.

Message id 401 is what the client itself shows when the server refuses a
disband for a bad key: ver12's 0x15e handler `fcn.005a4cc0` maps reasons 0/1/2
to msgstrings 0x190/0x191/0x192. Our check exists only because rAthena returns
0 instead of sending that reason 1, so it stands in for it and quotes the same
string.

An empty field raises msgstring `0x820` (id 2080) rather than doing nothing,
which is what the client does too - ver12 `fcn.005f5da0`.

### The frame

The client's own box, from ver12's geometry block: `SetSize(0x96, 0x64)` =
150x100, the input `SetSize(0x7c, 0x14) SetPos(0xd, 0x2a)` = 124x20 at
(13, 42), OK at `(W - 0x5c, H - 0x18)` = (58, 76) and Cancel at
`(W - 0x2e, H - 0x18)` = (104, 76). Children are absolute so each number
appears once.

The edit's own max length is the window field **`+0x88` = `0x17` = 23**, which
is where the markup's `maxlength="23"` comes from.

The label is a bare `TextOut` at an anchor point - ver12 `fcn.00a90ee0(0x10,
0x17, ...)` = (16, 23) - with no box, no width, no alignment flag and no
measuring pass. A long string simply runs on until GDI clips it at the window
DC. An absolute CSS box has no such edge, which is why `overflow: hidden` is
needed rather than decorative: the served English fits, but a **localised
msgstring 2089 painted 86px past the frame**.

The input's `#e6e6e6` is ver12 `fcn.00534540(0xe6, 0xe6, 0xe6)` on the edit
widget - the same near-white this call sets on every edit box in the binary.
**`0xe8` is the more common one**, which is what makes `0xe6` a deliberate
value here rather than a typo.

The storage warning is a single-OK box: the client's own call `fcn.0062cea0`
passes 0 as the button-set selector and discards the result, then opens the
name window unconditionally through `fcn.005f62e0`. The selector is the
**second** argument, not the third, and it is 0 at both guild sites - so the
box cannot be cancelled.

### The body text has no message id

The literal "Join a guild or start your own!" is kept as a literal on purpose.
The client's tip window at this spot shows a **list of help entries, not a
one-line invitation**, so no table id carries this sentence and forcing it onto
one would mean using an id that means something else.

## Deviations

- **The label sits at x 13 rather than the client's 16**, flush with the
  field's left edge instead of with the text inside it. The client's own
  alignment reads as an indent. Deliberate.
- **Arial is dropped** so the window inherits the shared font stack. Overflow
  is clipped the way the window DC clips a bare `TextOut`.

## See also

- [grade-change.md](grade-change.md) - the other place rAthena answers a
  refusal with silence
- [member-info-request.md](member-info-request.md) - the same shape again, on a
  request rAthena declines to handle
- `git show f116b74c` - the strings, the controls and the frame geometry
