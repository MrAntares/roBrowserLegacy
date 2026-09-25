# The login announcements and `/li`

Introduced by `784f3dd8`.

Three chat lines - the guild member login line, the guild notice, and the
friend notice - are gated on one flag, and `/li` is the command that writes it.

## Rules

- **All three lines share one toggle.** Two of them are guild lines, one is the
  friend list's. They are gated together because the client gates them
  together, on a single global.
- **The preference ships on**, where the clients initialise it to 0. See
  Deviations.
- **The guild window still records the notice** when the chat echo is
  silenced - the toggle governs the chat line, not the data.
- **Read the member's name from the roster entry, not from the DOM.** And not
  from `_members[i]` at the site of the login line either: that index is
  already spent by the online-count loop that runs before it.
- **Give every id default text.** A table without id 485 otherwise renders
  `NO MSG 485`.

## Why

All three clients open each case body with a comparison on **the same global**
before anything is printed - in ver12 that is `cmp dword [data.0079fa74], 1`.
The sites are ver12 `fcn.00585c80` case 0x99, 2022 `fcn.00788200` case 140,
mars26 `fcn.00b55460` case 140. The `cmp` is the **first** instruction of the
case body, so nothing reaches the print without it.

The guild notice takes the same gate, in ver12 through `fcn.005a5580`, where
`cmp dword [data.0079fa74], 1` guards the print in the same way.

`/li` is what writes that flag. It is the **friend-list** toggle, confirmed
through the `0x0206` path to ver12 `fcn.0065cae0`, which uses ids 1041/1042;
the toggle's own confirmations are ids 1044/1045. Both string tables name it
explicitly: "Display online status of friends in Chat Window. [/li ON]".

roBrowser printed all three lines unconditionally and had no such command at
all.

msgstrings 485 and 486 are the member login and logout lines. They carry a real
`%s`, and the client prints them on a packet roBrowser was handling silently -
ver12's 0x16d handler looks the member up by GID, takes the name at `+4`, and
posts a UI message with `(name, online)`, posting nothing at all when the
lookup fails.

## Deviations

**The preference defaults on**, against the clients' 0. These lines have always
been printed here, and there is no options window in which to find the command,
so defaulting off would look like three separate things breaking at once.

## See also

- [invitation-ack.md](invitation-ack.md) - the other guild chat line, and why
  that one cannot name anybody
- [member-list-sort.md](member-list-sort.md) - the same login and logout
  notices, on the roster side
- [member-portrait.md](member-portrait.md) - why a logout notice's look is
  discarded
- `git show 784f3dd8` - the gate, the command, and the two defects at the
  member line
