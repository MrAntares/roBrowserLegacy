# The emblem picker

Introduced by `e3dfcae9`, with the map-server notice added later.

The guild master replaces the guild's 24x24 emblem from the Info tab. The port
offers three ways in - the emblem itself, the Edit button next to it, and a file
dropped on the window - and all three reach one validation and one refusal.

## The picker cannot be the client's

This is the one place in this window where the binary is not the specification,
and it is not a shortcut.

The client's Edit button does not open a file dialog. It clears a list,
`sprintf`s a `<dir>\emblem\` path, enumerates it for `*.bmp` and `*.gif` with
`FindFirstFileA`, and fills an **in-game list window** at `(W - 0xa3, 0x56)`
which the player then picks from. Selecting a row is what loads and validates
the file. On 2022 the enumerator is `fcn.00503d90` - the function that carries
the `FindFirstFileA` import, called once per extension - and the pick is
`fcn.005f62e0` case `0x27`. With an empty directory it raises msgstring `0xbdd`
instead.

A browser cannot enumerate a directory. A file input is the only way to get the
same bitmap in, so the substitution is forced, and everything specific to the
list window - its geometry, its empty-directory message, the `emblem\`
convention itself - has no port.

What survives of the client's `*.bmp` / `*.gif` filter is the input's `accept`
attribute: the browser's own file dialog does the filtering the enumeration
used to. A drag and drop bypasses `accept`, as it must, and the header check
below catches whatever lands.

## Rules

- **24x24, and nothing else.** The client loads the picked file and refuses it
  unless both dimensions read `0x18`. This is the real rule; a size limit is
  not, and one on its own admits a 16x16 bitmap.
- **BMP or GIF**, the two the client enumerates.
- **One refusal, visible to the player.** msgstring 3587, a message box with a
  single OK. The id is stable across tables; the **wording is not**. The iRO
  table served to this port renders it `This file cannot be registered.` and
  another table in the same family reads `The file…` at the same id, so read the
  fallback text off the table actually shipped rather than off any copy.
- **Guild master only**, on every entry point, checked where the file is
  submitted rather than once per trigger.

## Why the dimensions are read from the file header

Decoding the image would mean `createImageBitmap` or an `Image`, neither of
which appears anywhere else in `src/`, and both of which are asynchronous on top
of the `FileReader` the upload already needs. The two headers give the same
answer synchronously off bytes that are already in hand:

| format | width | height |
|---|---|---|
| `BM` | `int32` at 18 | `int32` at 22, negated when the rows are stored top-down |
| `GIF` | `uint16` at 6 | `uint16` at 8 |

The format is taken from the magic bytes rather than from the file name or its
MIME type. `MapEngine/Guild.js` already reads the same magic to decide the
`ImgType` it puts on the wire, so the check and the upload now agree on what a
file is.

## Why the size caps survive the dimension check

They stop being a stand-in for 24x24 and become what they should always have
been: a guard on what the server will store. The client has a ceiling of its
own, read from a config object and compared against the file length, and it
raises **the same** msgstring 3587 - so a size refusal is not a web invention,
only the number is ours.

- **1783 bytes for a bitmap.** A 24-bit 24x24 BMP is `24 * 24 * 3 + 54` = 1782;
  an 8-bit one is 1654. A **32-bit** one is 2358, has perfectly valid
  dimensions, and would be dropped server-side - rAthena decompresses the
  emblem into a fixed 1800-byte buffer before it validates anything. The cap
  turns a silent server-side reject into the same visible refusal.
- **50000 bytes for a GIF**, which is the port's own allowance for an animated
  emblem. rAthena's validator only accepts a bitmap, so this matters to servers
  that went further.

## The guild-master gate

`ZC_GUILD_INFO` carries the master's name; the client compares it against the
local character and keeps the answer in a global. All three builds do this, at
their own address. On 2022 the global is also written straight from a packet
byte elsewhere, so the local comparison is one writer of several.

**What the flag gates is per build, and the difference is easy to miss.** On
2022 and mars26 the Info tab parks **two** widgets at `(-200, -200)` when the
flag is 0 - the emblem Edit button and the disband button - which reads in the
listing as four `0xffffff38` pushes. **ver12 parks one**: it has two pushes, no
disband button in this window at all (no `disband` string anywhere in the
build), and it gives the Edit button command id `0xd4` where 2022 uses `0x10e`.
Either way the emblem Edit button is gated and nothing else on the tab beyond
disband is - a port that hides more is inventing a restriction.

So the port hides the Edit button and the emblem's own label, which is what
makes the emblem stop reading as clickable: the shadow-DOM cursor list in
`GUIComponent.js` recognises a `<label>`, and a hidden one it never sees.
The window's drag listeners stay attached for everyone, deliberately - they call
`preventDefault()` unconditionally so that a drop a non-master makes is a no-op
instead of the browser navigating away from the game, and the submit path
refuses it.

## The drop target is the window, not the emblem

A 24x24 square is a poor place to aim a file at, so the whole window stands in
for it: bringing a file over the frame raises an overlay, and dropping anywhere
on it sets the emblem. Three conditions, all required, or the overlay stays
down - the drag carries a file, the player is the guild master, and the Info
tab is the one showing. Nothing else in the window accepts a drop, so an
overlay on another tab would be a target that does nothing.

Once up, the overlay covers the frame, which is what keeps it from flickering:
it owns every later drag event, and a `dragleave` on it really is the pointer
leaving the window rather than crossing onto a child.

It carries no new string. There is no client message for this - the client has
no drop - so it shows msgstring 336, the `Emblem` label the Info tab already
uses, rather than inventing English the tables cannot translate.

## Deviations

- **The 24x24 check is new.** Before it, `file.size <= 1783` stood in for the
  dimensions, so anything *smaller* was accepted: a 16x16 bitmap is 822 bytes
  and uploaded without complaint. Files that used to upload are now refused,
  which is the client's behaviour rather than a new restriction.
- **The refusal used to be a `console.warn`**, in hardcoded English, invisible
  to the player.
- **Clicking the emblem and dropping onto it have no client equivalent** -
  there is nothing to click in a window whose picker is a list.
- **The drop overlay is invented whole.** A dashed frame over the window while
  a file is dragged onto it, showing a label the client does have.
- **The empty-directory message (`0xbdd`) has no port**, there being no
  directory. Nor does msgstring 3586, which the client raises when the upload
  could not be **started** - the call it guards only enqueues the work, so the
  message says nothing about whether the transfer succeeded. The port's upload
  path reports differently.

## Where the file goes after that

`Guild.onSendEmblem` is the seam, and the two paths behind it are not this
window's:

- **Below packetver 20170315**, `CZ_REGISTER_GUILD_EMBLEM_IMG` (0x153), with
  the raw file wrapped in a stored - that is, uncompressed - zlib stream plus
  an adler32, which rAthena's `decode_zip` unpacks happily.
- **From 20170315**, a multipart POST to `<webserverAddress>/emblem/upload`,
  after which the new version is fetched back through the normal emblem
  request. A deployment without that endpoint gets no emblem change and a
  console warning.

## The web upload has to be announced to the map server

The web tier and the map server keep two different things. The POST writes the
image into the emblem table and answers with a version number; it never touches
the guild's own `emblem_id`, which is what the map server hands to everyone
else and what gates the download at login.

The bridge is **`CZ_REQ_ADD_NEW_EMBLEM` (0x0b46)**, `guild_id.L version.L`, ten
bytes, which the client sends once the POST comes back. Without it the upload
looks like it worked and is visible only to the uploader, only until relog:
nobody else is told, and the login-time fetch is gated on a version that is
still zero.

The server only listens for it **from 20190724**. Between 20170315 and that
build the upload has no way to announce itself at all, which is a gap in the
protocol rather than in the port.

The counterpart is **`ZC_CHANGE_GUILD`**, broadcast to everyone in range so
their client refetches. It has three generations - `0x01b4`, then `0x0b1f`
(main 20190703 / re 20190605 / zero 20190709), then `0x0b47` (main 20190807 /
re 20190731 / zero 20190814) - and the two newer ones reorder the fields and
widen the version from a short to a long.

All three are registered, **each against its own structure**: registering takes
the opcode on the structure object itself, so two opcodes sharing one structure
keep only the one registered last and the other is parsed and then dropped with
no handler and no error. The handler refetches for every entity of that guild,
and ignores a repeat of a version it has already asked for - the broadcast
arrives once per entity in range, not once per guild.

## A refusal is invisible, and the window repaints anyway

Nothing tells the client that the map server turned the change down. Of the four
exits in rAthena's `clif_parse_GuildChangeEmblem2`, two - a guild-id mismatch and
*not the guild master* - return without sending anything at all; WoE sends one
red chat line; only the fourth applies the version. The whole body is compiled in
from 20190724, so below that the packet parses to nothing. A further refusal for
guilds holding `GD_GLORYGUILD` answers with only a skill-fail. **There is no
acknowledgement packet for an emblem change**: the three packets that do go out
(`0x016c`, `0x0152`, `0x01b4`) are all on the success path.

The port repaints unconditionally once the POST returns 200 - it refetches
through the normal emblem request and sets the image - so a refused change still
shows. The client's own guild-master gate holds (`submitEmblem` returns early,
and neither the picker nor the drop target is rendered for a non-master); what
has no such check is the **web tier**, which writes the row regardless. The case
left over is a genuine guild master uploading during WoE.

Waiting for the `0x0152` / `0x01b4` broadcast instead - which is what the older
0x153 path already does - would close it. It is unported because what the native
client does after an upload has not been decoded, and this window reproduces the
client rather than improving on it.

## See also

- [info-tab-legacy.md](info-tab-legacy.md) - the other Info tab elements, and
  the two switches that decide whether they are drawn
- [create-disband-dialogs.md](create-disband-dialogs.md) - the second widget
  the same guild-master flag gates, and the message box factory this refusal
  uses
