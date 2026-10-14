# Chat window - reference notes

Background for `src/UI/Components/ChatBox/`.

The source files stay terse. What does not fit in one or two factual lines, and
outlives the commit that introduced it, is written down here: what the native
client does with the text of a received line, and where this port deliberately
departs from it.

A function that has depth available carries an
`@see docs/reference/chat/<topic>.md` right above it. CSS has no JSDoc, so there
the same pointer is written `See docs/reference/chat/<topic>.md`.
**`grep -rn 'docs/reference/chat/' src/` is the complete map** - it catches both
forms.

## Notes

| note | what it covers |
|---|---|
| [text-parsing.md](text-parsing.md) | What a received chat line keeps, drops and breaks on: newlines, `^RRGGBB`, `^nItemID^`, HTML-looking tags, item links |

## Reading the markers

Markers like `fcn.<address>` are always given **with the client build they
belong to**, since the same feature sits at a different address in each. The
three builds and where the details come from are covered once in the
[parent README](../README.md) - they are footnotes for tracing a claim later,
and no note depends on them to be useful.
