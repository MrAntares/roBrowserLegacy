# Test fixtures

`guildMembers.js` builds member-list rows shaped like `ZC_MEMBERMGR_INFO`, so a
test does not have to invent them and a live injection can reuse the same
shapes. Its own header documents what each builder covers.

## Known duplication - the mock preamble

Each UI test file opens with its own `vi.hoisted` block defining a
`MockGUIComponent`, and the guild ones add a `MockEntity` and a session object
to it. Across the twelve files that do this it comes to a little over 500 lines.

It is copied rather than shared because `vi.hoisted` runs before the file's own
imports, so reaching a helper module means `await vi.hoisted(async () => await
import(...))` - a mechanism change in every one of those files at once. The
copies also genuinely diverge: three different `MouseMode` tables, one
constructor that seeds markup into the host element, and a `MockEntity` that
mirrors `EntityView`'s `sex` / `job` setters for the portrait tests alone.

Worth collapsing into a single factory the next time these files are touched as
a group. Doing it piecemeal would leave both shapes in the tree at once, which
is worse than the duplication.
