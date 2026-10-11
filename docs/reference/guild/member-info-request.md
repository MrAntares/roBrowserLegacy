# The member info request

Introduced by `ff56560d`, with the reason named by `ce761f73`.

"View Information" on the member context menu sends
`CZ_REQ_OPEN_MEMBER_INFO` (0x157) and needs `ZC_ACK_OPEN_MEMBER_INFO` (0x158)
back to show anything. On rAthena that answer never comes.

## Rules

- **The entry stays.** This is a client, and a server that does implement the
  reply should keep working.
- **Going unanswered is reported in chat**, naming the reason, rather than
  looking like a dead button.
- **Name the reason, do not call it a timeout.** "The server did not answer"
  reads like something the next click might survive. It will not.
- **The 0x158 handler is hooked purely to call the timer off.** That is also
  what will carry the data once there is a window to put it in.
- **A character change calls it off too.** The timer is module state and outlives
  the character who armed it, so a request left waiting on its own silence would
  otherwise report itself in the guild chat of whoever entered the map next -
  three seconds is easily enough to cross a character selection.

## Why

rAthena registers 0x157 with a **null handler** - `packet(0x0157,6)` rather
than `parseable_packet` - so the request is read off the wire and dropped, and
0x158 never comes back. That is still true as of 2026-09.

So the click was silent: nothing opened, nothing said.

## Deviations

None. The client has no equivalent message because its server answers.

Note that sub-op `0x7a` on the member context menu is *View Information*
(packet 0x157), not an expel action - a reading that was corrected once and is
easy to get wrong again.

## See also

- [grade-change.md](grade-change.md) - the same silence from rAthena on a
  different guild path
- [create-disband-dialogs.md](create-disband-dialogs.md) - a refusal answered
  with no packet at all, and the client-side stand-in for it
- `git show ff56560d` (the report and the hook), `git show ce761f73` (naming
  the reason)
