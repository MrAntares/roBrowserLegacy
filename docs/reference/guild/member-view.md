# What a member sees

Introduced by `07ffa446`, with the three gaps its review found closed by
`6e236a4e` and the access mask's own trigger corrected afterwards.

The guild window is built once and shown to two different people. Almost every
tab has something on it that only the guild master may change, and for twenty
commits the answer to that was to draw the control anyway and refuse it on
contact. This note is the rule that replaced it, the evidence for it, and the
four places this port deliberately goes further than the client.

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
  blitted `%` beside it (`fcn.005f34b0.asm:461-465` and `:499-507`); the member's
  is one string, `sprintf("%d %s", payRate, "%")` (`.asm:511-516`). So a member's cell
  reads `50 %`, space included, and that space is the client's, not a choice
  made here.

**This corrects an earlier reading.** `grade-change.md` said the client draws a
member this tab "with no widgets on it at all, only blitted images". It is true
of everything a member can *operate* - they get static text for the title and
the tax, and no widget at all in the permission columns - and false of the guild
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
`fcn.005f3c20.asm:234-264`, mars26 `fcn.008476a0.asm:229-259`) - stronger than
that, the flag's global does not appear anywhere in any of those three
functions. It gates only the per-row level-up button, as one of six conditions
that park it off-screen (20220330 `fcn.005f5a60.c:42` and peers). **The client
shows the count to everyone.**

Those six are worth naming, because one of them is a server field and it decides
what happens after a handover: the guild-master global, the row being on screen,
the row being within the list's count, skill points being non-zero, the skill
record being valid, and **the per-skill *can this be raised* byte the server
sent**. That last is the final byte of each entry in `ZC_GUILD_SKILLINFO`, stored
by the packet handler on all three builds, and the list itself is filtered on it
too - so it is read twice over.

The client refreshes it on Skills-window construction, which a tab click does by
destroying and rebuilding the window. **Not only there, on the two modern
builds**: their `ZC_UPDATE_GDID` handlers ask for skill info once as well, behind
a latch that is set in three places and cleared in none - so opening the Skills
tab even once burns it, and a handover can never re-request through it. ver12 has
no such site at all. The conclusion is the same on all three, by two different
routes.

`range` and the entry's `name` are never read on any build; the displayed name
comes from the client's own table.

## Deliberate deviations

Each was taken knowing what the binary does, and each is one-way: they remove
something a member could not use, never add an affordance the client lacks.

1. **The skill-point readout is hidden from a member.** Every control that
   spends a point is already master-gated, so the count stands alone as a
   number a member can do nothing with. Cited above as client-false: the binary
   draws it for everyone on all three builds, straight-line, with the flag's
   global absent from the whole function. **That is the only evidence this rests
   on, and the deviation is a judgement call on top of it** - an earlier draft
   also leaned on rAthena sending `upFlag` to the master alone, which is a
   different fact about a different field and supports nothing here.
   For the record, since an earlier review asked for it to be restated: the
   Skills footer's `Use` button is shown to everyone, and **that was never argued
   from rAthena anywhere in this tree.** The grounds in the source are the
   client's own - it draws the button for everyone and gates only the level-up
   arrow - so there was nothing to correct.
2. **A tab the access mask refuses is marked, not left looking live.** The
   client draws all six cells and refuses the click inside the shared tail of
   every guild pane's command handler - not a method of the window class itself -
   where the `je` lands on the function epilogue, so there is no chat line,
   no message box, no sound and no cursor change, and it does not even close the
   tab that is open (ver12 `fcn.004a76a0.asm:80`, 20220330
   `fcn.005f9040.asm:81`, mars26 `fcn.0084d0f0.asm:79-81`; the mask array is
   `{0, 1, 2, 4, 0x10, 0x80, 0x40}` indexed by tab). That is a silent no-op on a
   control that looks exactly like its neighbours - the one shape the rest of
   this note exists to remove. The tab strip reads the mask only to notice it has
   not arrived yet (`== -1`) and ask for it; the bit test lives in the command
   handler alone, and only tabs 1, 2, 4 and 5 are tested at all.

   Two channels say so instead: the label goes grey, and the **game cursor**
   takes `NOWALK`, the client's own refusal shape. No wording - a cell you
   cannot click, in a game, is explicit enough, and it is strictly better than
   one that invites the click and then does nothing.

   The tooltip is a separate matter and carries **the label only**. Every cell
   is 64px and the client ellipsises rather than widening, so the full label is
   worth a hover whoever is looking; it is read through the message id, because
   until the table lands a label is only the markup's English fallback.

   **The cursor could not be done in CSS**, which is why `GUIComponent` learned
   the word `denied`: the custom cursor forces `cursor: none` across the whole
   window, so a `not-allowed` rule is invisible exactly when it matters. That
   was measured, not inferred - a live read of all six tabs returned
   `cursor: none` on every one of them. The CSS rule is kept for the
   custom-cursor-off case, the same reasoning as `#Guild .checkbox`.

   **Marking is only half of it.** The window outlives a character change, so
   logging in as the guild master, opening Announcement and then logging in as a
   member reuses the same window with that tab still selected - a member left
   standing on a pane the mask refuses. The mask's own handler sends them to the
   first tab, which carries no bit and is therefore always somewhere to go.

3. **The Notice tab is text for a member, not an edit box.** The client's
   scratch pad works there because its window is modal-ish and its Send button
   is simply gone. Here the field would sit in a pane that also has to answer
   Tab, and the server's refusal is silent - so an edit would stand in the box
   looking accepted. The text stays selectable, so copying the notice, which is
   the only thing a member wanted from it, still works.

4. **A refused tab leaves the keyboard's reach as well as the mouse's.** It
   carries `aria-disabled="true"` and `tabindex="-1"`, so Tab does not stop on it
   and Enter cannot activate it. Marking the cell answered the mouse and nothing
   else: the tab still took focus, still drew a focus ring, and still fired a
   handler that returned early - the silent no-op this note exists to remove,
   reached the one way nobody had tried.

   **Passes on *more accessible***, which is the whole of its justification. The
   client has no such notion; it removes a dead end the original could not
   remove; it sends nothing. `disabled` is still not used - it would take the
   tooltip and the element out of the accessibility tree together - and note that
   the old argument against it, *"it draws a greyed control the client never
   had"*, no longer applies now that the cell is greyed on purpose. The reason to
   keep `aria-disabled` over `disabled` is the tooltip, not the greying.

   Recomputed wherever the mask is, `reset()` included, so a tab refused for the
   previous character does not stay out of the next one's reach.

## Rules for the code

- **The yardstick, first, because one rule below was written without it.**
  Packets sent, packets received, and the action each one triggers should match
  the official client. Departing needs a reason, and the reason may be that we
  found something better - cleaner, more accessible, or less buggy. Then it is a
  *declared* deviation, listed in this note and in the PR.

  Two halves, and they are not symmetric:

  - **What we draw may diverge on timing.** The client is immediate-mode and
    redraws from its globals every frame; we hold a retained DOM and have to
    repaint at some moment it has no equivalent for. Forced, not chosen.
  - **What we send may not diverge by accident.** An extra packet is not
    cleaner, not more accessible and not less buggy. It is traffic no server
    expects.

  And the reason is never *"rAthena does X"* on its own. rAthena is one server
  implementation; the target is the official client. Where a server's own
  behaviour is what forces a decision, say which server and say so plainly.

- **Repaint from `ZC_UPDATE_GDID` (`0x016c`), on a change and nothing else.** It
  is the only packet that carries who the player now is, and handing leadership
  over moves the flag with the window already open. But it is **not rare**: on
  rAthena five paths send it, and **two of the five reach the whole online
  roster** - an emblem change and a leadership handover. The other three go to one
  person: the invitee on accepting, the player on logging in, and the roster on a
  guild's first load. Repainting unconditionally rebuilds the member rows, and
  that drops a guild master's queued grade edits under them - so compare the flag
  against its previous value first.

  An earlier draft of this note said all five reach the roster and named *a member
  joining* as an example. That one is self-only, so the example was the worst of
  the five; the conclusion stands on the emblem path, which really is a broadcast.

- **Nothing else may write `Session.isGuildMaster`.** The rule above compares the
  flag against its previous value, so the comparison is only worth anything while
  that value is this handler's to move. It was not: the guild's basic information
  carries a `masterName`, and `updateSession` used to set the flag whenever that
  name matched our own character.

  On a handover rAthena sends basic info **first** and the belonging packet
  **third** (`guild.cpp:2270-2276`: basicinfo, member list, belonginfo). So on the
  client being *promoted*, the name set the flag three milliseconds before
  `0x016c` arrived, `wasMaster` was already `true`, the change was invisible, and
  the guard swallowed the whole repaint: that client kept the member's Positions
  and Announcement panes, kept the member's tab mask, and never re-asked for its
  own. The member rows and the emblem still flipped, because they are repainted by
  the packets that arrive *after* the flag was quietly set - which is what made the
  window inconsistent rather than simply stale.

  **Demotion escaped it entirely**, which is why it survived review: the name only
  ever set the flag, never cleared it, so `wasMaster` was still `true` when
  `isMaster: 0` arrived and everything repainted correctly.

  The fix is to leave the flag to the packet that carries it explicitly, rather
  than to a string comparison in a sibling handler. One writer for a value another
  handler's correctness depends on - a guard that compares state anyone may move is
  not a guard. Found by watching a real handover on two clients; seven tests drove
  `0x016c` directly and none could see it, because they mock the whole `Guild`
  module and so replace the very function that was writing the flag.
- **Ask for the access mask only when it cannot be known.** `_guildAccess`
  carries `-1` for *not received*, which is the client's own sentinel for it, and
  `-1` has every bit set - so nothing is refused while we wait, and a window that
  has just been emptied does not grey its whole strip. Zero is the value that
  refuses every tab, and leaving zero there after a character change is what was
  reported as *"I can't click anything"*.

  The ask itself is guarded on that sentinel, from two places: `show()`, which is
  the client's own trigger, and `0x016c`, which is the first packet that knows who
  the player is. One request per identity or role change, and none at all for the
  four other things that ride `0x016c`.

  **The sentinel alone is not enough to guard it, because it says nothing about a
  question already in the air.** Both send sites can fire between the request and
  the reply - `0x016c` arrives in bursts, and the window can be opened in the
  middle of one - and each saw an unknown mask and asked again. So a second piece
  of state tracks the request itself, raised on the way out and lowered by
  `setAccess`. Lowered *there* rather than on the reply, because that is also the
  path `invalidateAccess` takes: forgetting the mask for a new role has to permit
  the new question, not sit on the old one.

  **This is a declared deviation, and a rare one: the official client never sends
  `CZ_REQ_GUILD_MENUINTERFACE` (`0x014d`) at all.** Its single send site in all
  three builds is the `mask == -1` branch of the tab-strip builder, the function
  all seven guild sub-window constructors call first - fire and forget, it does not
  wait for the reply. The mask global is `0`-initialised in every image and the
  `0x014e` handler is its only writer, and **no instruction in any of the three
  images stores `-1`**, so the branch is dead in practice. Stated that precisely on
  purpose: the handler copies whatever the server sent, so a server answering
  `0x014e` with `0xffffffff` would make it live.

  - ver12 `fcn.004a6f00.c:59-61`, global `data.00777778`, handler
    `fcn.005a4310` - and the send is vtable slot `0x14`, message `0x76`
  - 20220330 `fcn.005ecfd0.c:41-42`, `data.01110f8c`, handler `fcn.007d8ff0`
  - mars26 `fcn.008406e0.c:41-42`, `data.013acb74`, handler `fcn.00bac180`
  - both modern builds use slot `0x18` and message `0x69`, so neither the slot
    nor the message number carries across the era boundary

  We ask because the protocol offers no other channel: rAthena
  sends the mask unsolicited **only to the guild master**, on request otherwise,
  and to nobody on a handover. It passes on *less buggy*, and it is the same packet
  from the same condition the client's own code tests.

  **Asking on map entry instead is too early**, which is why the sentinel and not
  a plain call in `reset()`: rAthena has not set its own guild-master flag by then,
  so a real guild master is answered `0x57` and gets a wrongly greyed tab until
  something asks again. It sends three packets to every online member on a
  leadership change, in this order:

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
- **`on` / `off` rides on both, deliberately.** One expression writes the state
  class for either role, and the master's is read back by the positions Apply.
  On a member's `tick` nothing reads it - no CSS rule matches either name, the
  picture being an inline background image - so it is inert there rather than
  wrong, and splitting the expression to drop it would buy a branch and nothing
  else.
- **`textarea.notice` in the Apply path is load-bearing, not over-specific.** The
  member's pane puts a `div` in the textarea's place, carrying the same class, so
  the tag qualifier is what makes the optional chain short-circuit into the
  intended no-send. Loosening it to `.content.notice textarea` reads the same on
  a master and starts reading a member's values back on a member.
- **The markup ships the master's fields**, so the Notice pane is drawn once at
  `init()` rather than only when a notice arrives. A guild whose notice is empty
  gets no `ZC_GUILD_NOTICE` at all, and without that first draw a member would
  be looking at an edit box until one did.
- **Only the role changing may swap a pane.** A redraw that rebuilds
  unconditionally destroys whatever the pane was holding - the guild master's
  unsent notice draft, the caret, a member's text selection. The Notice view
  compares the shape it has against the shape it wants and returns when they
  agree; the stored notice is written separately, by the packet that brings it.
- **`reset()` has to empty the Info tab by hand, and the other tabs do not.**
  Members, positions and history live in rows, so emptying their `tbody` empties
  them; skills empty with their list, and the notice with an empty `setNotice`.
  The Info tab is **values written in place** - name, master, level, average
  level, territory, exp, tax, the counters, the emblem background and the two
  relation lists - and nothing removes them by removing a container. Left alone,
  they survived the character change: the window is a singleton, `show()` opens
  the first tab straight away, and a second character opening Guild before their
  own `ZC_GUILD_INFO` landed read the first one's guild name, master and emblem.

  **Back to the markup, not to blank.** The counters ship at `0` and the rest
  ship empty, so an emptied tab is the tab the window was built with rather than
  a third state neither the markup nor the server produces. The relation lists go
  through `setRelations([])`, which already empties both and is the one place that
  knows where they live.

## The swap, in CSS

Four facts the stylesheet depends on and no longer states itself, the source
having been cut back to the house limit.

- **The `td.title` / `td.tax` padding reset is class-qualified; the widths are
  not.** Those two cells place their own contents, so they give up the shared
  `th, td` padding - but three classes outrank that rule, so leaving the override
  unqualified took the two *headings'* indent with it and left their labels flush
  against the border while the other four kept theirs. Scoping the reset to `td`
  restores them and moves no cell. The widths stay unqualified on purpose: there
  is no `colgroup`, so the fixed layout takes them from the header row.
- **`.checkbox` / `.tick` is `height: 16px`, which is the cell's content box** -
  20 less its border and top padding. The tick bitmap is 12x12 in a 61x20 cell,
  so before it filled the cell a click at the cell's centre landed on nothing.
  Filling it makes the whole cell the target and, since the cursor list matches
  the element under the pointer, makes it read as one.
- **Only the grade name can outgrow its cell**, which is why it is the one value
  rendered with a tooltip. The guild master's field was capped at 75px and text
  is not, so the name can clip where `50 %` cannot. `_asValue`'s third argument
  is that distinction, and it is passed at one call site only.
- **A member's notice keeps the subject on one line and lets the body wrap.**
  Each value carries the class of the field it stands in for, so the two rules
  that place the fields place the values too and neither box moves on the swap;
  what has to be restored by hand is only what the control did for free. The
  subject stands in for a single-line input inside a 14px box, so wrapping it
  would push text out of the box; the body inherits the textarea's wrap, line
  breaks and scroll.

## Known gaps

- **Whether a member reaches the Notice tab at all is the server's call, and
  `0x80` is the whole of it.** On rAthena they do not:
  `clif_guild_masterormember` sends `menuFlag 0xd7` to the master and `0x57` to
  everyone else, and the Notice bit is the only one that differs - confirmed live
  by clicking all six as a grade-1 member, five opened and that one did not. But
  that is **one server's value, not a property of the window.** Nothing in the
  protocol obliges a server to clear the bit, and the official client gives
  everyone a real edit box there, so on a deployment that sets it the read-only
  pane is simply **what a member sees** - the ordinary path, not a backstop. It is
  built and maintained on that basis. The send gate behind it is a separate
  guarantee and stays either way, because a hidden control is a layout fact and
  only the handler is a promise.

- **After a handover the new guild master's Skills tab shows no upgrade arrows**
  until they leave the tab and come back. **The client does exactly the same
  thing, for the same reason** - see the byte and its six conditions under
  *Skills* above - so this is faithful rather than a gap. rAthena resends no skill
  info on a handover, and the client refreshes that byte only when the Skills
  window is constructed, which a tab click does by destroying and rebuilding it.
  Ours re-requests on the same gesture, from `onChangeTab`. Fixing it would mean
  adding a request at a moment the client sends none, so it is left alone.

  The demotion direction *is* repainted, and has to be: the byte still says
  raisable, so without a repaint a demoted master would keep working arrows.
  `updateMasterView` hides them, and `onRequestSkillUp` refuses as well - a hidden
  control is a layout fact, the handler is the guarantee.

- **A member is never told which tabs they may open until they ask, and there is
  a window before the answer.** The mask starts unknown, which permits every tab,
  so between entering the game and the reply landing a member can open a tab their
  mask will later refuse. On rAthena that is exactly one, the Notice tab. It is
  the declared cost of the sentinel and it was chosen over the alternative: zero
  refuses *every* tab, which is what the character-switch bug actually was. All
  five surfaces agree inside that window - nothing marked, normal cursor, in the
  tab order, click allowed - so it is not an interface that lies, and the pane
  behind it is read-only for a member with the send gated twice over. When the
  reply lands, a member left standing on a refused tab is moved to the first one.

- **Being expelled from a guild, or leaving one, empties it on every packetver -
  which took two more opcodes.** rAthena swaps both packets at
  `PACKETVER_MAIN 20161019` / `RE 20160921` for forms that carry a **character id
  instead of a name**: `ZC_ACK_LEAVE_GUILD_DELNAME` (`0x0a83`) and
  `ZC_ACK_BAN_GUILD_DELNAME` (`0x0a82`). This port registered only the older
  opcodes, so on a modern server the packet was read and dropped: no departure chat
  line, and the handler that resets never ran. Both are registered now and both eras
  share one reporting path.

  **The two carry the same two fields in the opposite order**, and an earlier claim
  here that both are `<CID>.L <reason>.40B` was wrong:

  - `0x0a83` withdrawal — `<CID>.L <reason>.40B`
  - `0x0a82` expulsion — `<reason>.40B <CID>.L`

  Read with the neighbour's order, the reason loses its first four characters to the
  id field and the id is reason bytes, so the departing character is never
  recognised as themselves. It is not a subtle failure once seen - a reason of
  `u2 live check` arrives as `ive check` - but nothing in a same-shaped test fixture
  can see it, which is how it shipped: one builder served both packets and encoded
  the very assumption under test. Each opcode is built from its own layout now.

  **The id to match is `Session.GID`, not `Session.Entity.GID`.** The first is the
  character id, which is what the packet carries and what the member list is keyed
  by; the second is set from the account id and would never equal it, so the
  comparison would be false for the very character who left.

  **The name comes back off the roster**, which is where the client reads it from
  too - the packet has none. A roster generation that carries no name, and a member
  already dropped from the list, both fall back to the same placeholder the member
  list itself draws.

  That placeholder is also what the swapped order above looks like from the chat
  log, and it is a trap worth naming: a departure reported for the placeholder
  rather than for a member is the id having been read out of the wrong field, not
  the roster being short of a name. Against a live server the same expulsion read
  `Nameless has been expelled` before the order was fixed and `ClaudeTestB has been
  expelled` after, with nothing else changed.

## See also

- [grade-change.md](grade-change.md) - the Positions tab's Apply path, whose
  master gate this note's rule explains
- [emblem-picker.md](emblem-picker.md) - the other guild-master gate in this
  window, and the one whose shape the Positions tab should have copied
- [member-list-sort.md](member-list-sort.md) - the other deployment-visible
  difference between two people looking at the same window
