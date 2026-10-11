# The emblem next to the character

Introduced by the nameplate emblem scaling fix in `EntityDisplay.js`
(hash added at commit).

The guild emblem a player wears on the map appears in two unrelated places:
on the **name plate** under the character, and as the **standalone siege
emblem** floating above enemies during WoE (`EntityEmblem.js`). They are
different widgets in the client too. This note covers the name plate; the
siege emblem was not measured and is deliberately untouched.

Everything below was read from the three client builds and re-walked at the
instruction level — including the cdecl push order of every draw call, since a
mislabelled x/y has shipped before.

## Rules

- **Keep the emblem twice the font.** The client draws the emblem at its
  native 24 x 24 next to a 12 px font, so it spans the character name *and*
  the guild line. `EntityDisplay` draws in backing-store pixels
  (`CSS px × devicePixelRatio`); the font is `12 * dpr`, so the emblem box,
  its 26 px gutter and the paddings must be `* dpr` too. Unscaled, the emblem
  shrinks to one line's height at dpr 2 — the bug this note comes from.
- **Centre the emblem on the plate, not on the first line.** The client
  computes plate height as `(fontHeight + 2) * lines + 6`, clamps it to at
  least 24 when an emblem is set, and blits at `y = (plateHeight - 24) / 2`.
  Two lines: y = 5, dead-centred on the text block. One line: the plate is
  clamped to 24 and the emblem overhangs the single line — that is client
  behaviour, keep it.
- **Never scale the emblem with camera zoom or resolution.** The client's
  blit takes `(x, y, srcW, srcH, pixels, flag)` — there is no destination
  size in the signature, so a stretched draw is inexpressible. Only the
  plate's *position* follows the screen.
- **The GIF redraw must clear exactly the rect it redraws.** Both rects live
  in backing pixels. When they disagreed (clear `24 * dpr` wide, draw 24),
  each animation frame erased the first glyphs of the name at dpr > 1.

## Why

### The size is the bitmap's own, end to end

The emblem texture is allocated 24 x 24 at decode time (ver12
`fcn.0042d4f0(0x18, 0x18)`; mars26 requests the texture as
`fcn.0054cd90(0x18, 0x18)`). The name-balloon draw hands it to a generic UI
blit that forwards `img.width` / `img.height` (`+0x114` / `+0x118`) straight
to the surface — ver12 `fcn.004d7a90`, 2022 `fcn.00a891c0`, mars26
`fcn.008cc6a0`, all three byte-identical in shape, none carrying a scale
factor or destination extent. The `- 0x18` visible in the draw sites is the
*centring* term, not a resize.

### The centring math

Two balloon classes, one per orientation. Horizontal (the normal plate,
`UINameBalloonText` by RTTI on 2022/mars26):

- name setter sizes the plate `height = (fontHeight + 2) * lines + 6` with
  `fontHeight = 12` (ver12 `fcn.00444200`, global `data.006e7918`; 2022
  `fcn.00534620`, `data.00eb8954`; mars26 `fcn.0075e660`, `data.010293f0`)
  — 20 for one line, 34 for two;
- the emblem setter re-sizes to `width = textExtent + 25`,
  `height = max(height, 24)` (ver12 `fcn.004447b0`, 2022 `fcn.005341e0`,
  mars26 `fcn.0075e150`);
- the draw blits the emblem at `x = 4, y = (height - 24) / 2` and starts
  text at x = 32, y = 4, stepping `fontHeight + 2` per line (ver12
  `fcn.00444890` @ `0x00444903-0x00444913`, 2022 `fcn.0052c6d0` @
  `0x0052c836-0x0052c849`, mars26 `fcn.00755e70` @ `0x00755fe0-0x00755ff3`).

So with name + guild the emblem occupies y 5..29 against text at y 4..32 —
covering both lines, centred. The vertical variant
(`UIVerticalNameBalloonText`) transposes the same rule: emblem at
`x = (width - 24) / 2, y = 0`, text offset by 28 past it (ver12
`fcn.00445180`, 2022 `fcn.0052d740`, mars26 `fcn.00756e40`; the text there
goes through a different primitive, `fcn.004d8550` on ver12, whose axis
mapping was not walked — the emblem placement is what is verified).

### What is version-specific and what is not

The size and centring are identical on all three builds. Post-Renewal
additions only decorate: 2022/mars26 can draw `emblem_frame.bmp` behind the
emblem (the setter then reserves `+29 / max(height, 28)`) and sniff `.bmp` /
`.gif` emblem filenames; ver12 has neither and loads the `.ebm`-derived
texture directly.

### The mapping to `EntityDisplay`

roBrowser's plate canvas is styled at `canvas.width / dpr` CSS pixels, so
whatever is drawn in backing pixels keeps its size relative to the text at
every dpr — which is exactly the invariant the client's fixed-pixel UI has.
The port therefore multiplies the client's constants by `dpr` and keeps its
own established text metrics (see Deviations). The emblem y reproduces the
client formula translated to the canvas' own text origin:
`(max((fontSize + 2 * dpr) * lines + 6 * dpr, 24 * dpr) - 24 * dpr) / 2 +
paddingTop - 4 * dpr` — the `- 4 * dpr` maps the client's text top (y = 4)
onto the canvas' (`paddingTop`).

## Deviations

- **Left geometry is kept, not the client's.** The emblem sits at x = 0 with
  text at 31 (client: 4 and 32). The plate here is a transparent canvas with
  no visible box, so the client's 4 px inner margin has nothing to be inside
  of.
- **Text metrics are the existing ones.** Line step `fontSize * 1.2`
  (client: `fontHeight + 2`), top padding 5 (client: 4), right padding 5 + 5
  (client: width = textExtent + 25). All within a pixel or two of the client
  at dpr 1; not worth destabilising every nameplate for.
- **No `emblem_frame.bmp`.** Post-Renewal decoration, out of scope for a
  pre-Renewal target.
- **The siege emblem (`EntityEmblem.js`) is untouched.** Different widget,
  no adjacent text to keep a ratio with, and its 24 CSS px on-screen size is
  dpr-independent already. If it is ever measured against the client, that
  belongs in its own note.

## See also

- [emblem-picker.md](emblem-picker.md) — the upload side of the same bitmap:
  the 24 x 24 rule and the guild-master gate
- [member-portrait.md](member-portrait.md) — the feet-anchor lesson; the
  plate itself is positioned from the entity's ground anchor, and the emblem
  only ever offsets inside the plate
