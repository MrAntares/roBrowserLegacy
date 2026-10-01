# The member list sort

Introduced by `0bc92620`, re-sorted on login by `4d7719a6`, moved under the
`guild` config key by `2fdf3f49`.

The client puts online members at the top of the guild roster. The three
binaries disagree on whether that is optional, so it is a deployment setting
here rather than a version inference.

## Rules

- **`_members` keeps the order the server sent. Only the table is sorted.**
  Storing the display order there destroys the only copy of the server's, and
  unticking the checkbox would then have nothing to restore - the sort would
  appear to work once and be inert from then on.
- **Reorder by moving rows (`appendChild`), never by rebuilding them.** A moved
  row keeps its listeners, its head canvas and its `data-index`, which is the
  link back to `_members`.
- **Re-sort from both paths.** The full member list and a single
  login/logout both change the sort key.
- **Read the config through `_config()`**, which spreads the defaults. See
  below - a bare `Configs.get` loses every key the server omits.

## Why

### Three client behaviours

| client | behaviour |
|---|---|
| ver12 | no such sort at all |
| 2022 | sorted behind a checkbox on the bottom bar, msgstring 2864, state in a global the member draw reads |
| mars26 | checkbox dropped, sort permanently on |

`guild.memberListSort` picks between them - `'never'`, `'checkbox'`,
`'always'` - defaulting to `'always'`. mars26's is the default because it is
the newest and the other two are each a strict subset of it.

The sort is stable, on the same field that paints a row green, so members
sharing a status keep the order the server sent them in. That is what the
client's own merge does.

### A login has to re-sort, not just repaint

The reorder originally lived inside `setMembers`, so it only ran when the full
member-list packet arrived. A member connecting goes through
`updateMemberStatus` instead, which toggled the row's online class and updated
the counter but never moved the row - so under the default mode someone
logging in turned green where they already sat and stayed there until the next
full list.

The client re-sorts from its draw (ver12 `fcn.005f2f10`), which means its
roster is online-first at all times rather than once per packet.

### Why the config merges its defaults

`Configs.get` hands back the server's object **whole** rather than merging it
into the client's. A server naming `guild` at all - to set one key - would
otherwise drop every key it omits, so asking for the access date to be hidden
would silently take the sort's default down with it. `_config()` spreads
`GUILD_CONFIG` at the read site. A test covers exactly that case.

The old flat `guildMemberListSort` key was renamed rather than aliased: it was
added on this branch and never deployed.

## The access date rides the same config, and only one client draws it

`guild.showLastLogin` is **off** by default because two of the three clients
draw no access date at all. Across ver12, 2022 and mars26 there is a single
real call site loading msgstrings 3011 and 3012 - the 2022 member row draw,
where it is unconditional. ver12 has none, and mars26's only apparent match is
a byte sequence inside a data blob rather than an instruction.

That one line is also why 2022's rows are taller: its member layout adds 8 to
the row height and no other client's does, so the date and the extra 8px appear
and disappear together. **ver12 rows are 34, mars26's 35, 2022's 43.** Hiding
the date while keeping 2022's height produces a row shape none of the three
clients draws, so the line and the height ride one flag (`19bb9c20`).

Worth knowing at the switch: the member tab has a control that looks like it
should govern this and does not - the checkbox beside it reorders the list and
never touches the sub-line.

> An earlier commit body (`2fdf3f49`) says all three clients draw the date
> unconditionally. That is **wrong** and was corrected by `19bb9c20`. Prefer
> this note.

## See also

- [member-portrait.md](member-portrait.md) - the head placement bug this sort
  made observable, and why `data-index` is the link back to `_members`
- [login-announcements.md](login-announcements.md) - the same login and logout
  notices, on the chat side
- `git show 0bc92620` (the sort), `git show 4d7719a6` (re-sort on login),
  `git show 2fdf3f49` (the config key and the merge)
