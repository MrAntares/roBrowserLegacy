# Changing a member's grade

Introduced by `0ebd8ae4`, with the tax field clamped by `3d8a17ab` and the
server's answer reported by `7b4fff0f`.

Picking a grade in the dropdown queues the change. Apply flushes the queue.
Nothing is sent on selection, and the whole roster is never sent.

## Rules

- **Send the delta, never the roster.** This is the bug the whole path exists
  to avoid - see below.
- **Queue keyed by GID**, one entry per member, last edit wins.
- **Flush on Apply, then clear.** Drop the queue whenever fresh guild data
  arrives (member list, grade names, the change acknowledgement) - the server
  is the truth and it has just overwritten what was pending.
- **Say so when a member list drops a queue.** That one can arrive unprompted,
  so the edit dies with nobody having touched anything. See below.
- **Do not ask for that data while something is queued.** Menus 1 and 2 are the
  two whose answer carries grade names, and a tab click is what sends them. See
  below.
- **Closing the window is the cancel, and a cancel restores.** There is no
  reset button, in the client or here. Dropping the queue is not enough: the row
  was moved to the picked grade when it was queued, so each entry also carries
  the grade to go back to, and the Positions tab is redrawn from `_positions`.
  See below.
- **The grade to go back to is recorded once per row, on its first edit.** Last
  edit wins on what is sent, never on where cancelling lands - only the first
  edit of a row saw a value the server had agreed to.
- **An acknowledged grade of 0 is skipped and nothing else.** Who holds the role
  is read off the belonging packet alone. See below.
- **Mark a row whose grade is queued**, or the only sign an edit exists is a
  button in the footer. Declared deviation, below.
- **Apply with an empty queue sends no packet at all.**
- **Guard the selection, silently, leaving the dropdown on the known grade**:
  grade 0 refused, a row already at grade 0 refused, an unchanged grade
  refused.
- **Reveal the Apply button once something is queued** - selecting no longer
  sends, so the members tab would otherwise have no way to flush.
- **`ZC_ACK_REQ_CHANGE_MEMBERS` (0x156) carries `memberInfo[]` only** - not
  `AID` / `GID` / `positionID`. An acknowledged grade of 0 is the guild master
  moving, not a grade change.
- **Send the three wire fields, built one by one.** The queue entry carries a
  fourth of its own - the grade a cancel returns to - and pushing the entry
  itself into the packet would offer that field to the builder.
- **Echo `ranking`, never recompute or renumber it.** The positions-tab apply
  entry is fixed-width, so the slot has to be filled whatever goes in it - and
  nothing the client puts there is ever read. See below.
- **A member sees the Positions tab and touches nothing in it** - including the
  cursor, which must not offer a click that cannot happen. See below.

## Why

### Sending the roster aborts the batch

The dropdown used to send the **whole** roster. Entry 0 of that roster is
always the guild master at grade 0, and since rAthena PR #7405 the handler
reads a grade-0 entry as a leadership transfer and returns out of the loop,
dropping the batch. `guild_gm_change` then returns false silently, because that
character already is the master. The row reverting a moment later is just the
next member list repainting server truth. 100% reproducible.

It used to work: until that PR the leadership branch was gated on a
single-entry packet, and the loop merely skipped `position == 0` and carried
on. The client code never changed - rAthena moved under it.

The native client never sends a roster. The queue-and-flush above is a
cross-version reading of ver12, 2022-03-30 and 2026, all three of which agree.

### Packetver

The outgoing packet (0x155) is **version-invariant**, so this holds on every
packetver. The member list is not - it has three generations (`0x0154`,
`0x0aa5`, `0x0b7d`) - but all three already share one handler.

### The tax field

The field accepted anything. Typing 60 sent 60 and rAthena stored 50 without a
word, via `cap_value(exp_mode, 0, battle_config.guild_exp_limit)`.

The native clients cap that edit at two characters, and 99 is also rAthena's
own ceiling for `guild_exp_limit`, so the field takes `maxlength` 2 and the
value is clamped to 0-99 on the way out. (The introducing commit says "both
native clients" without naming which two of the three were read - treat the
two-character cap as checked on two clients, not on all three.) A field that is not a number reads as
0 rather than going out as `NaN`, which also stopped the row looking edited
when it was not.

Then the acknowledged rate is compared against what Apply sent, and a
difference is reported in guild chat, quoting the server's own number.

### What a member sees on the Positions tab

The tab is drawn for everyone and editable by one person, and a member's rows
now hold **values rather than controls** - the title and the tax as text, the
three permission columns as the tick image alone. Full reasoning, the
cross-version evidence and the rule it generalises to are in
[member-view.md](member-view.md); what matters at this function is that the
Apply path rebuilds each entry's permission mode from the row it reads, so a
row of values would send an empty name and a zeroed mode for every grade. That
is what the master gate on the Apply case is for.

**Two earlier claims here were wrong and are retracted.**

- *"The client draws a member this tab with no widgets on it at all, only
  blitted images."* Half true, and read the wrong way round. A member really
  does get no interactive widget - but the title and the tax are `UIStaticText`
  widgets the draw fills, not blits, and the sentence was being used to describe
  the *tab* when it describes the *role*. The guild master's own view of the
  same tab is edit controls and checkboxes throughout.
- *"This costs a member the ability to select the text, and that is not a
  regression."* It was a real loss under the `pointer-events` rule that has
  since been removed, and the values that replaced those fields are listed in
  the selection carve-out, so the text is selectable again.

### The ranking field is echoed, and read by nobody

The positions-tab apply sends one entry per edited row, and each entry carries
a `ranking` the client read back out of its own store rather than computing.
That looks like a value being round-tripped for no reason, and half of it is:
the server never reads it. The parse walks the packet in fixed 40-byte strides
from offset 4 and consumes only the position id, the mode, the pay rate and the
name - the four bytes at `+8` are stepped over, and the structure it fills has
no member to hold them.

The slot is still mandatory. Because the stride is fixed, dropping those four
bytes does not shorten the entry, it desynchronises every entry after the
first. So the field is filled, and filled with what arrived rather than with a
guess.

Both packets that carry rank the other way synthesize it from the entry's own
index at send time, so it is not stored server-side either. On the wire it is
therefore always equal to the position id - which is why renumbering it
client-side would look harmless right up until it was not.

### The queue was destroyed by a refresh we asked for ourselves

The rule above is right and it was nearly fatal, because of who was sending the
data it drops on. Every tab click calls `onGuildInfoRequest` with the tab's own
menu type, and rAthena answers **menu 1** with `clif_guild_positionnamelist` then
`clif_guild_memberlist`, and **menu 2** with `clif_guild_positionnamelist` then
`clif_guild_positioninfolist`. Both clearers - the roster and the grade names -
hang off both menus.

So a guild master who picked a grade and looked at the Positions tab lost the
edit **on the way out**, to the menu-2 answer, not on the way back. The row went
back to the server's grade, Apply was gone, and nothing had been sent or said.

**An earlier claim here was wrong and is retracted.** *"Every refresh in that
story is one this client asked for: rAthena pushes neither list unprompted."*
True of the grade names - `clif_guild_positionnamelist` and
`clif_guild_positioninfolist` have one caller between them, the menu handler -
and false of the member list, which has three unprompted senders:

| Sender | When | Who gets it |
| --- | --- | --- |
| `guild_recv_info` | the member count changed | the player whose guild info came back from the char-server |
| `guild_member_withdraw` | a member leaves or is expelled | `guild_getavailablesd`, an `ARR_FIND` from index 0 |
| `guild_gm_changed` | leadership moved | every member, in a loop |

`clif_guild_memberlist` sends `SELF`, so each of those is a unicast. But index 0
of a guild is its master, which makes the second row the case that matters: the
one player who can edit grades is the one player certain to be told when
somebody else leaves. Holding the menus back does nothing for that push, and
nothing should - the roster is server truth. What was missing is that it
happened at all, hence the line in guild chat.

**The fix is not to ask.** Menu 1 and menu 2 are held back while the queue is
non-empty; the other four carry neither list and go out as before, so the Info,
Skills, History and Notice tabs still refresh mid-edit. Nothing is ignored when
it arrives - a genuine server push still drops the queue, by the rule above.
Sending fewer requests also moves toward the client rather than away from it: it
does not re-request on a tab click, as [member-view.md](member-view.md) notes for
the skill byte.

That leaves the rows standing still under an open `<select>`, which the dropdown
path already had to protect by hand, and it makes Apply's return on the way back
correct rather than decorative.

## Deviations

- **An edited row is marked while its edit is unsent.** The client has no such
  mark and no queue to mark: it sends on selection, so there is never a row whose
  displayed grade the server has not agreed to. Here there is, for as long as the
  master takes to press Apply, and the row shows the picked grade as though it had
  been taken. The mark is a class on the row - a tinted background and an asterisk
  before the name - dropped by the acknowledgement and by closing the window, the
  same two moments that drop the queue itself. Passes on *less buggy*: without it
  the only evidence an edit exists is a button in the footer, which names no row.
- **No clamp at 50.** That is the 2022 client's hardcoded limit and rAthena's
  default, but `guild_exp_limit` is per-server config and goes up to 99.
  Refusing 70 on a server that accepts it would be our bug, not the server's.
  The server caps what it will take.
- **Reporting the kept rate reads the server's number** rather than guessing
  at the limit. The native client hardcodes 50 twice over - once in the
  comparison, once inside msgstring 3486's text - and would misreport on a
  server set higher.
- **The guild master's own dropdown is rendered `disabled`.** The client draws
  the combobox live on that row and refuses on selection; marking it disabled
  is a deviation above the binary. `disabled` rather than dropping the element,
  so the column width and the row geometry do not move.

Guild-master delegation is a separate path: the client puts it on a context
menu with a Yes/No confirm and a single-entry packet.

## See also

- [member-list-sort.md](member-list-sort.md) - `_positions` and `_members`
  ordering, and the config key both live under
- [member-info-request.md](member-info-request.md) - the other place a server
  silently declines to answer
- `git show 0ebd8ae4` (delta-only send and the Apply queue),
  `git show 3d8a17ab` (the tax clamp), `git show 7b4fff0f` (reporting the
  server's rate)
