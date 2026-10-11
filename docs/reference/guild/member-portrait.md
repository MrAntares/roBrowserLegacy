# The member row portrait

Introduced by `08f18897`, with the row-placement fix in `6ee0e847`.

Each member row carries a 30x30 canvas showing that member's head. It is a head
deliberately, and the crop is measured rather than hardcoded - both of which
used to be true only by accident.

## Rules

- **Build the portrait entity through `memberPortrait()`.** Both callers
  (`setMember` and `updateMemberStatus`) go through it. A second path that
  assigns to an entity directly will reintroduce the bug below.
- **`sex` and `job` are written to the private fields (`_sex`, `_job`) on
  purpose.** Their public setters each start an asynchronous
  `Client.loadFile` for a body sprite, and a later `files.body.spr = null`
  cannot take that back once it lands.
- **`head` goes through its real setter** - it is the sprite actually being
  drawn, and it reads the job and sex that were just written.
- **Do not store the look from a logout notice.** Only the online notice
  carries a real one.
- **Resolve each member's canvas through the row's `data-index`, never by
  position.** `_members` keeps the order the server sent; the rows are
  re-appended in login order.
- **Do not replace the measured crop with a fixed bind offset.** See below.

## Why

### It was a head by accident

`setMember` wrote `entity._job` raw, bypassing the `job` property whose setter
starts a body load, so `files.body.spr` stayed null and `renderElement` skipped
every body pass. `updateMemberStatus` then assigned `entity.sex`, and
`UpdateSex`'s first statement is `this.job = this._job` - the real setter. So
any member who logged in or out **while the window was open** grew a whole
sprite. The renderer anchors an entity at its feet, so that one row showed a
pair of boots while every other row showed a head.

The split was never job, sex, level or class. It was roster-only member versus
member who logged in or out while the window was open.

### The crop has to be measured

`bind2DContext(ctx, 15, 45)` sets the entity's **ground anchor**, not a sprite
box. In a 30px cell that puts the feet at y = 27.5 and pushes the head off the
top. No fixed offset can be right in general either: a head `.act` places its
layers wherever it likes, because they are authored to be differenced against a
body attach point that a head-only portrait never has.

So the sprite is drawn into a 96px scratch canvas, its opaque bounds are
measured, and that crop is blitted centred into the cell. That holds for every
job and hairstyle - verified across 3 hairstyles x 2 sexes.

### Where `CELL_SHIFT` comes from

`RenderCanvas2D` draws every layer centred on **`bindY + offset - 0.5 * 35`**.
`CELL_SHIFT` is that same `0.5 * 35`, passed back in so the two cancel and the
entity's origin lands exactly where it was asked to. The `35` is not a free
parameter - change it only if that centring formula changes.

### The logout notice sends zeroes

`ZC_UPDATE_CHARSTAT2` carries the look; plain `ZC_UPDATE_CHARSTAT` does not.
rAthena fills gender, hairStyle and hairColor from the member's session and
sends all three as **0** once there is no session left to read
(`clif_guild_memberlogin_notice`). Keeping a logout's zeroes rewrote the member
as a female with hairstyle 0, which the next window open would then draw.

### The heads landed on the wrong rows

`renderMemberFaces` collected the canvases out of the DOM (sorted order) and
walked them against `_members` (server order). Indexing them in lockstep was
correct until the login sort existed. After it, each head landed on whichever
row happened to share its offset: with one offline member between two online
ones, an online member's row was cleared and left blank while their head was
painted onto the offline row above.

## Deviations

The frozen action and animation are not on the world's animation clock. That
matches what every other sprite portrait in this UI does (Equipment,
ItemPreview, CharSelect) - the frame is pinned rather than sampled off
`Date.now()`.

## See also

- [member-list-sort.md](member-list-sort.md) - the sort that made the row
  mismatch observable, and why `_members` keeps the server's order
- [login-announcements.md](login-announcements.md) - the other consumer of the
  login and logout notices
- `git show 08f18897` (portrait, crop, logout look), `git show 6ee0e847`
  (row placement, with a regression test on a roster whose sorted order differs
  from the server's)
