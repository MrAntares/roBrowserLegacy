# The Info tab's legacy elements

Introduced by `72ca6572` (the switches), `b0d67c58` (the chart's geometry) and
`877ffdf0` (EXP at max level).

The tendency chart and the Tax Point line are drawn by ver12 and by no client
after it. They are deployment switches, not a packetver inference.

## Rules

- **`guild.showTendency` and `guild.showTaxPoint` are both off by default**, so
  the default tab is the newest client's. Turning either on reproduces ver12.
- **Apply the switches when the window opens and on every tab change**, not
  only when a guild-info packet lands. They decide whether those elements are
  drawn *at all*, so waiting for a packet means drawing them and taking them
  away afterwards.
- **The tendency marker truncates, it does not round.** See below - one pixel
  is a real difference here.
- **The Tax Point label has no value slot.** The client draws that msgstring
  through `"%s"` with no value and no separator. The chart is the value.
- **The pane is not a scroll container.** The chart's bottom label sits past
  what would be its lower edge, deliberately.

## Why

### They are legacy, and the switch is not a version cut

These were originally hidden on a packetver cut of 20220330 - the oldest client
where their absence is established. That left a 20211103 deployment drawing
both, which is the wrong half of the guess: ver12 is 2008 and 2022-03-30 is the
next binary that exists, so any line between them is invented, and "a 2021
client behaves like a 2008 one" is the less likely reading.

Neither 2022-03-30 nor mars26 ever passes msgstring 0x14e or 0x151 to the
message-table getter - read out of both draw functions end to end, not grepped
around. The raw values *do* occur in both binaries, as packet ids in the
packet-length registry, which is why the claim is about getter calls and not
about references.

Worth knowing before turning either on: **rAthena hardcodes point, honor and
virtue to 0**, so Tax Point can only ever read 0 and the chart's marker can
only ever sit dead centre.

### The chart's geometry

ver12 puts the label at (8, 161) and hangs the chart off it: frame 90x90 at
(23, 188), face inset one pixel, axes crossing at (67, 232), and **four**
labels - R above the frame at (63, 176), V and F on the horizontal at y 227, W
below at (64, 281).

The marker is honor along x towards F and virtue along y towards R, both scaled
by **0.42** - the pair of floats parked between this window's vtable and the
next. The scale is what fixes the domain: 100 * 0.42 = 42, just inside the 44px
half-axis.

The conversion **truncates**. The client reaches it through `_ftol`, which sets
the FPU rounding mode to round-toward-zero first. At honor 99 that is the
difference between 41 and 42 pixels, and between a distinct position and a
collision with honor 100.

Every colour is a pixel out of `colorchip.bmp` at the palette coordinate the
draw passes: frame (14,6), face (6,2), axes (22,2), marker (2,2). They are the
same four the rest of this window uses, so a skin that moves them moves them
everywhere together.

Tax Point sits at (200, 97). It only ever appears on the same client as the
chart, so no modern draw existed to diff it against - measuring the running
window is what caught it being five pixels low.

### Guild EXP at max level

At guild level 50 the figure stops meaning anything, and all three clients say
so differently. All branch on the same `level >= 50`:

| client | behaviour |
|---|---|
| ver12 | substitutes a literal 0, leaves the line black |
| 2022 | keeps the real value, paints the line red |
| mars26 | does both, off one comparison and a pair of cmovs |

mars26's is what is drawn, for the same reason the member list's sort defaults
to mars26's: it is the newest and the other two are each a strict subset of it,
so there is nothing for a deployment to pick between.

The colour covers the **whole line** because the client builds label and value
as one string and draws it in a single call - there is no separate value to
colour. It is red rather than blue because the argument reaches GDI32's
`SetTextColor`, and a `COLORREF` is `0x00BBGGRR`.

## Deviations

The emblem icon and its Edit button are centred on the "Emblem" label rather
than on the client's three unrelated centres, and the footer's three buttons sit
on one line rather than the client's 292 / 293 / 294. Both were asked for
explicitly. Anything diffing this tab or the footer against the asm will read
them as drift; they are not.

## See also

- [member-list-sort.md](member-list-sort.md) - the same `guild` config key, and
  the same "default to the newest client" rule
- [grade-change.md](grade-change.md) - the Info tab's neighbour, and the other
  place rAthena's own limits shape what is drawn
- `git show 72ca6572` (the switches), `git show b0d67c58` (chart geometry,
  colours and the marker), `git show 877ffdf0` (EXP at max level)
