# What a member sees

The guild window is built once and shown to two different people. Almost every
tab has something on it that only the guild master may change, and for twenty
commits the answer to that was to draw the control anyway and refuse it on
contact. This note is the rule that replaced it, the evidence for it, and the
two places this port deliberately goes further than the client.

## The rule

**A member is shown values, not controls.**

Not a disabled control, not a control taken out of hit testing, not a control
whose handler returns early - no control. A control that cannot be operated is
a promise the window does not keep, and every mechanism short of removing it
leaks somewhere:

| mechanism | what it still lets through |
|---|---|
| the handler returns early | the cursor over the control still says *clickable* |
| `pointer-events: none` | Tab. It is a mouse-only rule, and focus does not hit-test |
| `readonly` | focus, and with it every side effect a focus handler carries |
| `disabled` | nothing - but it draws a greyed control the client never had |

That list is not hypothetical. Each row of it was the state of this window at
some point, and the `pointer-events` row shipped: a member could Tab into the
Positions tab's fields, type, and press an Apply button their own focus had
revealed. rAthena refuses the packet that follows, silently, and the tax-clamp
message then fires once per grade on the next refresh.

## What the client does, tab by tab

### Positions

The layout function branches on the guild-master flag and builds a **different
widget set** per branch: `UIEditCtrl` for the master, `UIStaticText` for
everyone else, for both the title and the tax column. The draw then branches on
the widget pointer rather than on the flag, filling whichever one exists.

- 20220330 `fcn.005f0380.c:98` (master branch, edits at `:165`), `:216-253`
  (the static-text branch), `:363` parks the OK button at (-200, -200)
- ver12 `fcn.004adf70.c:115 / :160 / :372`, statics built at `:213-253`
- mars26 `fcn.00843e70.c:111 / :221 / :417` - note pdg inverts the test here, so
  `:111` is the non-master side and the master's is the `else` at `:154`
- the draw: 20220330 `fcn.005f34b0.c:143-162` (title), `:208-229` (tax),
  `:163-205` (the permission columns)

Two details worth carrying:

- **The permission columns are widgets for the master and a blit for the
  member**, which is the same split as the other two columns rather than an
  exception to it. The master's are real `UICheckBox` objects, eleven per column,
  built inside the same master branch (20220330 `fcn.005f0380.c:99-164` via
  `fcn.005204c0`; ver12 `fcn.004adf70.c:116-159`, **two** columns, not three;
  mars26 `fcn.00843e70.c:155-220`). The member has no widget there at all, and
  the draw blits `checkbox_<0|1>.bmp` on the null pointer
  (`fcn.005f34b0.c:163-205`). So a member's tick is an image and nothing more,
  which is why ours carries `tick` rather than `checkbox` - the latter is what
  puts an element on the clickable-cursor list.
- **The tax unit moves.** The master gets `%d` in the field and a separately
  blitted `%` beside it (`fcn.005f34b0.asm:495-509`); the member's is one
  string, `sprintf("%d %s", payRate, "%")` (`.asm:513-521`). So a member's cell
  reads `50 %`, space included, and that space is the client's, not a choice
  made here.

**This corrects an earlier reading.** `grade-change.md` said the client draws a
member this tab "with no widgets on it at all, only blitted images". It is true
of a **member** - across all five or six columns - and false of the guild
master, who gets edit controls and checkboxes. The sentence was read as a fact
about the tab when it is a fact about the role, which is the whole point of this
note.

### Notice

The client creates **real, focusable, typeable edit boxes for everyone** - they
are built before the flag is read, and no read-only or disabled bit is ever
written to the widget (ver12 `fcn.004b23a0.c:80-120`, 20220330
`fcn.005efea0.c:73-114`, mars26 `fcn.00843750.c:86-129`). The body is **nine
single-line rows** on ver12 and mars26, stepping `0x13` from `0x68` to `0x113`,
and **one multi-line control** on 20220330 - which is the shape a browser gives
us anyway.

The flag is never read to decide whether a box exists. It is read to place the
Send button and again inside the command handler that would send; ver12 and
mars26 read it twice more besides, re-placing that button when a box changes.

- the button is parked at (-200, -200) for a non-master on ver12
  (`fcn.004b23a0.c:225-234`) and mars26 (`fcn.00843750.c:272-277`)
- the send is gated again at ver12 `fcn.004b28c0.c:140-143`, 20220330
  `fcn.005f8090.c:78-81`, mars26 `fcn.0084bec0.c:82-89`

So in the client a member types into a scratch pad that can never be sent. On
ver12 and mars26 they cannot even see the button; the 20220330 build has no
`else` on that placement, so its button is left at its constructor default of
(0, 0) and sits over the title bar - a defect in that build, not an era
behaviour, and not something to reproduce.

**The double gate is worth keeping and is kept.** A hidden button is a layout
fact, not a guarantee; the handler refusing is the guarantee.

### Skills

The `SkillPoint : %d` readout is emitted at the tail of the skills draw, at the
merge point where the row loop exits, straight through to `ret` - no branch, no
read of the master flag (ver12 `fcn.004b0710.asm:253-279`, 20220330
`fcn.005f3c20.asm:234-263`, mars26 `fcn.008476a0.asm:229-258`) - stronger than
that, the flag's global does not appear anywhere in any of those three
functions. It gates only the per-row level-up button, as one of five conditions
that park it off-screen (20220330 `fcn.005f5a60.c:42` and peers). **The client
shows the count to everyone.**

## Deliberate deviations

Both were taken knowing what the binary does, and both are one-way: they remove
something, never add an affordance the client lacks.

1. **The skill-point readout is hidden from a member.** Every control that
   spends a point is already master-gated, so the count stands alone as a
   number a member can do nothing with. Cited above as client-false.
2. **A tab the access mask refuses is marked, not left looking live.** The
   client draws all six cells and refuses the click inside its own message
   handler — the `je` lands on the function epilogue, so there is no chat line,
   no message box, no sound and no cursor change, and it does not even close the
   tab that is open (ver12 `fcn.004a76a0.asm:80`, 20220330
   `fcn.005f9040.asm:81`, mars26 `fcn.0084d0f0.asm:79-81`; the mask array is
   `{0, 1, 2, 4, 0x10, 0x80, 0x40}` indexed by tab). That is a silent no-op on a
   control that looks exactly like its neighbours — the one shape the rest of
   this note exists to remove. The tab strip itself never reads the mask on any
   client; only the command handler does.

   Two channels say so instead: the label goes grey, and the **game cursor**
   takes `NOWALK`, the client's own refusal shape. No wording — a cell you
   cannot click, in a game, is explicit enough, and it is strictly better than
   one that invites the click and then does nothing.

   The tooltip is a separate matter and carries **the label only**. Every cell
   is 64px and the client ellipsises rather than widening, so the full label is
   worth a hover whoever is looking; it is read through the message id, because
   until the table lands a label is only the markup's English fallback.

   **The cursor could not be done in CSS**, which is why `GUIComponent` learned
   the word `denied`: the custom cursor forces `cursor: none` across the whole
   window, so a `not-allowed` rule is invisible exactly when it matters. That
   was measured, not inferred — a live read of all six tabs returned
   `cursor: none` on every one of them. The CSS rule is kept for the
   custom-cursor-off case, the same reasoning as `#Guild .checkbox`.

   **Marking is only half of it.** The window outlives a character change, so
   logging in as the guild master, opening Announcement and then logging in as a
   member reuses the same window with that tab still selected — a member left
   standing on a pane the mask refuses. The mask's own handler sends them to the
   first tab, which carries no bit and is therefore always somewhere to go.

3. **The Notice tab is text for a member, not an edit box.** The client's
   scratch pad works there because its window is modal-ish and its Send button
   is simply gone. Here the field would sit in a pane that also has to answer
   Tab, and the server's refusal is silent - so an edit would stand in the box
   looking accepted. The text stays selectable, so copying the notice, which is
   the only thing a member wanted from it, still works.

## Rules for the code

- **Repaint from `ZC_UPDATE_GDID` (`0x016c`), and from nothing else.** It is the
  only packet that carries who the player now is, and handing leadership over
  moves the flag with the window already open. rAthena sends three packets to
  every online member on a leadership change, in this order:

  | packet | what it does here |
  |---|---|
  | `clif_guild_basicinfo` `0x01b6` | `setGuildInformations` - flag still stale |
  | `clif_guild_memberlist` `0x0154` | repaints rows, carries no role signal |
  | `clif_guild_belonginfo` `0x016c` | sets the flag, and must repaint |

  The order is what makes this load-bearing: the guild info that would otherwise
  be the window's last word arrives **before** the flag moves. Repainting from
  `0x01b6` as well is not a belt - it is a redraw with a knowingly stale flag,
  and the server sends that packet on every tab switch.

  **`ZC_ACK_REQ_CHANGE_MEMBERS` (`0x0156`) is not that packet, though the window
  reads a grade of 0 out of it as a leadership move.** It cannot carry one:
  `clif_parse_GuildChangeMemberPosition` branches on `position == 0` to
  `guild_gm_change` and returns before reaching `guild_change_memberposition`,
  which is the only sender of the ack. So a repaint hung off that branch never
  runs on a real server - which is where this was first, and wrong.

- **Both directions matter.** The same packet promotes, and a member who becomes
  the guild master has to be given the controls without closing the window.
- **A member's rows are never read back.** The positions Apply rebuilds each
  entry's permission mode from the row it finds, so a row of values yields an
  empty name and a zeroed mode for every grade. It is gated on the flag for
  that reason, not merely for symmetry with the server.
- **Unsent edits die with the demotion.** The dirty guard that protects a
  master's typing from an incoming refresh is scoped to the master; a demoted
  one loses the edit, hides Apply, and gets the values back. The server would
  have refused them anyway.
- **`tick` and `value` are the member's classes.** `checkbox` and the form
  elements are the master's, and the clickable-cursor list and the selection
  carve-out are both written against those names.
- **The markup ships the master's fields**, so the Notice pane is drawn once at
  `init()` rather than only when a notice arrives. A guild whose notice is empty
  gets no `ZC_GUILD_NOTICE` at all, and without that first draw a member would
  be looking at an edit box until one did.
- **Only the role changing may swap a pane.** A redraw that rebuilds
  unconditionally destroys whatever the pane was holding - the guild master's
  unsent notice draft, the caret, a member's text selection. The Notice view
  compares the shape it has against the shape it wants and returns when they
  agree; the stored notice is written separately, by the packet that brings it.

## Known gaps

- **The emblem controls and the Disband button do not repaint on the flag.**
  Both are set in `setGuildInformations`, which on a leadership change runs
  before the flag moves, so a demoted guild master keeps a working file picker
  and a Disband button until the next `0x01b6`. Both refuse - in the handler and
  again on the server - so this is the *looks live, refuses on contact* form
  rather than a hole. Pre-existing; named here rather than fixed, because the
  fix wants the emblem block lifted out of `setGuildInformations` first.
- **A member cannot reach the Notice tab at all on rAthena**, so the read-only
  pane behind it is defence rather than the thing a member sees.
  `clif_guild_masterormember` sends `menuFlag 0xd7` to the master and `0x57` to
  everyone else, and the tab's own bit is `0x80` - the only bit that differs.
  Confirmed live by clicking all six as a grade-1 member: five opened, that one
  did not. The pane still has to exist - the gate is one `menuFlag` from open,
  no other emulator is bound by rAthena's value, and the send gate behind it is
  what stops a forged Apply.

## See also

- [grade-change.md](grade-change.md) - the Positions tab's Apply path, whose
  master gate this note's rule explains
- [emblem-picker.md](emblem-picker.md) - the other guild-master gate in this
  window, and the one whose shape the Positions tab should have copied
- [member-list-sort.md](member-list-sort.md) - the other deployment-visible
  difference between two people looking at the same window
