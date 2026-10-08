# What a received chat line keeps, drops and breaks on

The chat window shows a line as plain text. Three things decide how that text
ends up on screen: how it is split into lines, what happens to `^RRGGBB`
colour codes, and which tags, if any, the window understands.

## The native client

The three builds agree on everything except the two oldest-era details marked
below.

| In the text | ver12 (2008) | 2022 | mars26 |
|---|---|---|---|
| a newline (`\n`) | drawn as a raw byte, no break | ends the chat entry; the rest becomes the next entry | same as 2022 |
| `^RRGGBB` | drawn as seven ordinary characters | removed from the text, colour discarded | same as 2022 |
| `^nItemID^<id>` | left as text | left as text | left as text |
| `<font>`, `<b>`, `<i>`, any HTML | left as text | left as text | left as text |
| `<ITEML>…</ITEML>`, `<NAVIL>…</NAVIL>` | no such thing | the item / navigation link is decoded and shown as its display name | same as 2022 |
| line width | wrapped at 94 bytes on the last space | 94 bytes, then re-wrapped to the box width | same as 2022 |

**The colour of a line never comes from its text.** Every build draws a chat
entry in the one colour the packet handler chose for it: white by default,
the player-chat green, the `blue` / `ssss` broadcast prefixes, the three colour
bytes of `ZC_BROADCAST2`. A `^RRGGBB` sequence inside the text is either drawn
literally (ver12) or thrown away (2022, mars26). It is never honoured.

A `^RRGGBB` sequence is recognised as `^` followed by exactly six hexadecimal
digits, upper or lower case. A `^` followed by anything else is ordinary text
on every build.

## This port

- `^RRGGBB` codes are removed from the text when a line is added
  (`ChatBox.addText`), as the two modern builds do. The removal happens before
  the item-link tags are looked for, which is also the client's order.
- A newline is kept as a line break *inside* one chat entry: the chat content
  has `white-space: pre-line`. The modern client instead turns each line into
  its own entry. The two render the same way, and one entry per `addText` call
  keeps the entry count that the history limit works on.
- Entries built from HTML (item links, name links, the `override` path) are
  not touched by either rule.

## Deviations

- **One entry, not several.** `/help` lists every command in one `addText`
  call; the client would make one entry per line, the port makes one entry
  with line breaks. Visible difference: none. Measurable difference: the
  history limit counts one entry instead of sixty.
- **No 94-byte wrap.** The port wraps on the box width only; the client wraps
  at 94 bytes first, then on the box width. A line longer than 94 bytes with no
  space in it breaks at the box edge here and at byte 94 there.
- **Still drawn literally:** `^nItemID^<id>` and HTML-looking tags, as on
  every build.

## Where the details come from

ver12: the chat window's add-line method (`fcn.004a0f10`, message `0x25`)
wraps the text at 94 bytes (`fcn.004d6730`) and hands each piece to the history
box (`fcn.0044f200`), whose draw (`fcn.0044f6f0`) goes straight to
`ExtTextOutW` with the per-line colour. Nothing on that path reads `^` or
`\n`; the colour-code parser the build does have (`fcn.004d7d20`) serves the
NPC dialog and other widgets.

2022: `UINewChatWnd` SendMsg (`fcn.005d5e80`, message `0x25`) strips the
codes (`fcn.00a8c300`, the decoded colour is never read), then splits on `\n`
and at 94 bytes (`fcn.00a80060`). mars26: the same shape in `fcn.00822e10` →
`fcn.008d0790` → `fcn.00899fc0`; there the `\n` byte stays at the head of the
next entry. The hex-digit tables (`0x6e1528` ver12, `0xe828e8` 2022,
`0xffe318` mars26) were dumped from the binaries: `0-9`, `A-F`, `a-f`.
