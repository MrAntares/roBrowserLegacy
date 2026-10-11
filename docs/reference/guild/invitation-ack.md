# The invitation result line

Introduced by `6b0f2bb3`.

`ZC_ACK_REQ_JOIN_GUILD` (0x169) is a single flag byte. The four outcomes map to
four message-table ids, and **no stock string can name the character** - the
name is substituted only if a deployment rewrites the table to ask for one.

## Rules

- **The flag is the only field the packet has.** Nothing on the wire carries a
  name: rAthena's `clif_guild_inviteack` sends the packet type and the result,
  `SELF` to the inviter.
- **The four ids keep the client's colour split** - the accepted case is
  painted differently from the three failures - and the guild chat filter.
- **The name comes from what this side recorded on the way out**, nothing
  else. The by-name path has it outright; the by-AID path reads it off the
  entity.
- **Give the four ids default text**, so a missing table renders English rather
  than `NO MSG 379`.

## Why

The handlers on all three clients - ver12 `fcn.005a5260`, 2022 `fcn.007da6e0`,
mars26 `fcn.00bad920` - switch on the byte at `+2` and do the same two things
per case: load the localised string for an id, and hand the pointer straight to
the chat printer. Nothing else. ver12's whole function is three `call`
instructions with no `sprintf` anywhere, and its header lists exactly two
callees, so there is no third call in which a name could hide and no read of
any pending-invite state.

| flag | id | colour |
|---|---|---|
| 0 | 378 | error |
| 1 | 379 | error |
| 2 | 380 | blue |
| 3 | 381 | error |

Only ver12 is traced to the opcode through the parse-loop jump table; the other
two were matched on shape (same switch, same ids in the same case order, same
colour on case 2, same prologue). Treat those two as identification rather than
proof of dispatch - the conclusion rests on ver12 and on all three agreeing.

### Why the wording reads oddly

Some tables render id 380 as "You have accepted the guild invitation." -
second person, for something somebody else did. That is an **iRO table
rewrite**, not the client's doing: older tables read `Offer Accepted` at the
same id, which is neutral and correct for the only recipient that exists. The
official client fed the same table shows the recruiter the identical sentence.

There is no recruited-side string. The recruited character is told nothing
about the invitation at all.

### The party is the counter-example

The party ack carries the **name** in the packet, so Gravity wrote `%s`
strings for it (ids 3501/3502) and the client really does format them through
`sprintf`. The guild ack carries a flag byte. That asymmetry is the whole
reason one has `%s` strings and the other does not, and it is why no amount of
fidelity can put a name in the guild line.

## Deviations

**Substituting `%s` is a deliberate step above the binary.** It is a no-op on
every stock table, none of whose strings contain a placeholder; rewriting id
380 as `"%s accepted the guild invitation."` is what turns it on. A real client
fed that table would print the literal `%s`.

This codebase already leans the same way once: the outgoing party invitation
prepends the invitee's name to id 2059 where no packet supplies it either.

**A case 4 is missing, and is currently unreachable.** Both post-ver12 clients
have a case 4 -> id 2090, "The character is not online or does not exist."
rAthena never sends flag 4, so it cannot arrive from this server. Not
implemented blind.

## See also

- [login-announcements.md](login-announcements.md) - the guild chat lines that
  *can* name a member, and the toggle that gates them
- [member-info-request.md](member-info-request.md) - another packet the server
  declines to complete
- `git show 6b0f2bb3` - the helper and the four default strings
