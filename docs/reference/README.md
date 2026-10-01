# Reference notes

Background notes for parts of the UI where the code does something specific on
purpose and the reason is not obvious from reading it.

Each subdirectory covers one subsystem:

| directory | subsystem |
|---|---|
| [guild/](guild/) | the guild window, its six tabs, and the create / disband dialogs |

## Where the details come from

These notes describe how the original Windows client behaves. That behaviour was
worked out by observing the shipped client and comparing it against what the
server sends, then checked against the running port.

Notes are drafted alongside the change they document and reviewed with it, so
they say what was actually established rather than what was assumed. Where a
note and an older commit message disagree, the note is the current one.

You will see markers like `fcn.005f2150` and offsets like `this+0xa0` in the
text. They are internal labels from that analysis, kept so a specific claim can
be traced back and re-checked later. They point at particular client builds, are
meaningful only alongside the analysis they came from, and are **not needed to
work on this code** — every note states its conclusion in full, in plain terms.
Treat them the way you would treat a footnote.

Three client builds are referred to by short name throughout:

| short name | build |
|---|---|
| ver12 | ver12.0, pre-Renewal, 2008 |
| 2022 | 2022-03-30 |
| mars26 | 2026 |

The same feature usually sits at a different address in each, so a marker is
always given with the build it belongs to.

## Scope

A note covers behaviour and the reasoning behind a choice. It is not a spec and
not a substitute for the code. Where the port deliberately differs from the
original client, the note says so under **Deviations** — read that section
before "fixing" an apparent mismatch.
