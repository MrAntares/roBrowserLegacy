# Pets - reference notes

Background for `src/Engine/MapEngine/Pet.js`.

The source files stay terse. What does not fit in one or two factual lines, and
outlives the commit that introduced it, is written down here: what the native
client does with a pet's packets, and where this port deliberately departs
from it.

A function that has depth available carries an
`@see docs/reference/pet/<topic>.md` right above it.
**`grep -rn 'docs/reference/pet/' src/` is the complete map.**

## Notes

| note | what it covers |
|---|---|
| [talk-name.md](talk-name.md) | The name in front of a pet's talk line: where it comes from, and what happens to a talk while it is unknown |

## Reading the markers

Markers like `fcn.<address>` are always given **with the client build they
belong to**, since the same feature sits at a different address in each. The
three builds and where the details come from are covered once in the
[parent README](../README.md) - they are footnotes for tracing a claim later,
and no note depends on them to be useful.
