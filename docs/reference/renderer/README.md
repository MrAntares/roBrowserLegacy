# Renderer - reference notes

Background for `src/Renderer/Entity/` where the code does something specific on
purpose and the reason is not obvious from reading it. The source stays terse;
what outlives the commit that introduced it is written down here.

A function that has depth available carries an
`@see docs/reference/renderer/<topic>.md` right above it.
**`grep -rn 'docs/reference/renderer/' src/` is the complete map.**

## Notes

| note | what it covers |
|---|---|
| [body-palette.md](body-palette.md) | Which palette file dresses a dyed body on a mount, and why a halter-lead mount depends on the client build |

## Reading the markers

Markers like `fcn.<address>` are always given with the client build they
belong to; the builds and where the details come from are covered in the
[parent README](../README.md).
