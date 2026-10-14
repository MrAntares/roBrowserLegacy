# The name in front of a pet's talk line

A pet "talks" when its owner's client sends `CZ_PET_ACT` with a talk number
(feeding, hunger, intimacy lines). The server relays it to everyone around as
`ZC_PET_ACT`, and each client prints `<pet name> : <text>` in the chat and the
text in a balloon over the pet.

The name is the hard part. Before PACKETVER 20131223 the spawn packet carries
no name, and the pet's own information packet (`ZC_PROPERTY_PET`) goes to its
owner only. So a client watching someone else's pet does not know that pet's
name until it asks for it with a name request (`CZ_REQNAME`, answered by
`ZC_ACK_REQNAME`) - the same request a mouse hover sends. From 20131223 on the
spawn packet carries the name and the question never comes up.

## The native client

| | ver12 (2008) | 2022 | mars26 |
|---|---|---|---|
| name looked up in | the client's name cache, by GID | the same cache | the same cache |
| own pet, name not cached | the name kept from `ZC_PROPERTY_PET` / the owner's name reply | same | same |
| another pet, name not cached | sends a name request, at most once per GID every 2.5 seconds | no request (the spawn packet already filled it) | same as 2022 |
| the talk while the name is unknown | **dropped**: no chat line, no balloon | dropped | dropped |

**The talk is never held and never printed with something else in place of the
name.** The formatter returns an empty line, and the packet handler gives up on
an empty line before it reaches the chat or the balloon. The name request goes
out from the talk itself, so the *next* talk of that pet carries its name.

No spawn or appear handler asks for a name on any build: a name is requested
only by a talk and by the mouse (hover / click).

## This port

`petTalk` follows the same rule:

- the entity's display name when it has one;
- for the player's own pet, `Session.pet.name`: kept from `ZC_PROPERTY_PET`
  even when the pet's entity does not exist yet. Like the native client, a
  change of pet does not clear it - only the next `ZC_PROPERTY_PET` replaces
  it, and the server sends that one right after the new pet's
  `ZC_CHANGESTATE_PET`, whatever the order the client sees them in;
- otherwise a name request - when that entity has not asked yet, or 2.5
  seconds after the last request for the GID - and the talk is dropped, chat
  line and balloon. A pet that leaves and comes back into view is a new entity
  with no name, so it asks again at once.

## Deviations

- **Two throttles, not one.** The native client keeps a single "last request"
  time per GID, shared by the talk and the mouse. Here the hover keeps its own
  guard (`display.load`, one request until the reply) and the talk keeps a
  per-GID time in `Pet.js`. A talk right after a hover can therefore send a
  second request for the same pet. The answer is the same name twice.

## Where the details come from

ver12: the `ZC_PET_ACT` handler (`fcn.005a9100`) builds the line in
`fcn.0067b230`, which reads the name from the cache lookup `fcn.00574f50`. On
a miss that lookup sends `CZ_REQNAME` (`0x94`) unless the last request for the
same GID is under 2500 ms old (`cmp eax, 0x9c4`), and returns an empty name. The
formatter then checks the own pet's GID (`data.0079e770`, set by
`ZC_CHANGESTATE_PET`) and its name (`data.0079e778`, set by `ZC_PROPERTY_PET`
and `ZC_ACK_REQNAME`), and otherwise writes an empty string; the handler
compares the line against `""` and returns before the balloon call and the
chat print. The spawn handlers (`0x78`, `0x79`, `0x7b`, `0x7c`, `0x1d8`-`0x1da`,
`0x22a`-`0x22c`) reach no name request; the senders are reached from the talk,
the mouse handler (`fcn.0056e750`) and UI messages.

2022: the handler `fcn.007cda90` formats in `fcn.00876660`, whose name lookup
is a plain cache read (`fcn.0076cfc0`); an empty name that is not the own pet
(`data.0112d03c`) clears the line (`0x0087682b`) and nothing is printed.
mars26: the same shape in `fcn.00c4cd50` (own pet `data.014067a0`, empty line
at `0x00c4cf1b`).

Server side (rAthena): the spawn packet's name field is
`#if PACKETVER >= 20131223` (`packet_spawn_unit`); `ZC_PROPERTY_PET` is sent
`SELF`; `ZC_PET_ACT` is sent to the `AREA`; a name request for a unit off the
map or out of the area gets no reply.
