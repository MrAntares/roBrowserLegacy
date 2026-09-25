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
- **Apply with an empty queue sends no packet at all.**
- **Guard the selection, silently, leaving the dropdown on the known grade**:
  grade 0 refused, a row already at grade 0 refused, an unchanged grade
  refused.
- **Reveal the Apply button once something is queued** - selecting no longer
  sends, so the members tab would otherwise have no way to flush.
- **`ZC_ACK_REQ_CHANGE_MEMBERS` (0x156) carries `memberInfo[]` only** - not
  `AID` / `GID` / `positionID`. An acknowledged grade of 0 is the guild master
  moving, not a grade change.

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

## Deviations

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
