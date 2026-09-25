# Guild window - reference notes

Background for `src/UI/Components/Guild/`, `src/Engine/MapEngine/Guild.js` and
`src/UI/Components/GuildCompanion/`.

The source files themselves stay terse, as the rest of the codebase does. What
does not fit in one or two factual lines, and outlives the commit that
introduced it, is written down here instead: why a behaviour reproduces the
native client, what the binary actually does, and where this port deliberately
departs from it.

A function that has depth available carries an
`@see docs/reference/guild/<topic>.md` right above it. CSS and HTML have no
JSDoc, so there the same pointer is written `See docs/reference/guild/<topic>.md`.
**`grep -rn 'docs/reference/guild/' src/` is the complete map** - it catches
both forms.

## Notes

| note | what it covers |
|---|---|
| [grade-change.md](grade-change.md) | Moving a member to another grade: why only the delta is sent, and the Apply queue |
| [member-list-sort.md](member-list-sort.md) | Online members first, the three client behaviours, and the config key |
| [member-portrait.md](member-portrait.md) | The 30x30 cell on a member row, why it is a head, and how the crop is derived |
| [login-announcements.md](login-announcements.md) | The member login and notice lines, and the `/li` toggle that gates them |
| [invitation-ack.md](invitation-ack.md) | `ZC_ACK_REQ_JOIN_GUILD`, and why no stock string can name the character |
| [info-tab-legacy.md](info-tab-legacy.md) | The tendency chart, Tax Point, and guild EXP at max level |
| [create-disband-dialogs.md](create-disband-dialogs.md) | One window, two modes, and the disband key check |
| [member-info-request.md](member-info-request.md) | `CZ_REQ_OPEN_MEMBER_INFO`, and the answer that never comes |

## Reading the markers

Markers like `fcn.<address>` are always given **with the client build they
belong to**, since the same feature sits at a different address in each. The
three builds and where the details come from are covered once in the
[parent README](../README.md) - in short, they are footnotes for tracing a claim
later, and no note depends on them to be useful.

Each note names the commit that introduced it. `git show <hash>` carries the
reasoning at the depth a reviewer of that change would want, and
`git log -L <start>,<end>:<file>` gives the history of exactly the lines you are
reading.

**Where a commit body and a note disagree, the note wins.** Bodies are frozen
at the moment they were written and two of them have since been corrected by
later work; the notes are kept current and say so where it matters.

## See also

- `docs/CustomElements.md` - `<ui-button>`, `<ui-text>` and the rest of the
  element vocabulary this window is built from
- `docs/UIComponent_to_GUIComponent.md` - the component base class and the
  Shadow DOM migration
- `REVIEW.md` - packet coverage and PACKETVER ranges
