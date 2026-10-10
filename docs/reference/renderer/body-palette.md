# The body palette of a mounted player

Which `.pal` file dresses a dyed body depends on which sprite is being drawn,
and for a halter-lead mount it also depends on the client build.

## Rules

- **A classic mount (`MountTable`) is dyed with the mount sprite's own
  palette files**, named in `PalNameTable` under the mount job. The three
  client builds agree on that.
- **A halter-lead mount (`AllMountTable`) is dyed with the mount's own palette
  files when the archive ships them, and with the rider's palette otherwise.**
  The archive is asked once, through `MOUNT_PALETTE_SENTINEL` (the Creator
  boar's female palette 1), and `hasMountPalettes` keeps the answer for the
  session, by remote client, since a server of the list may serve another
  archive: the file cache drops a file unused for 30 s, so it cannot hold it.
  One request per archive, and no file is ever requested per entity that the
  archive does not have. `PalNameTable` names the mount's own file for every
  halter-lead mount; those entries are only read when the sentinel loads.
- **The answer dyes the entity as it is when the answer comes**: by then the
  player may have dismounted, changed dye, job or sex, so the callback runs
  `UpdateBodyPalette` again on the current state instead of writing a path
  built at request time.
- **There is no existence check and no fallback.** The client builds one file
  name and loads it; when the file is missing it shows an "Error" message box
  (`CPaletteRes :: Cannot find File : ...`) and the body keeps its embedded
  colours. Do not add a "try the mount's file, then the rider's" chain, it
  would not be the client's behaviour.
- **Palette 0 keeps the embedded palette**, mounted or not.

## Why

### One name, built from a job id and a table

The three builds share the mechanism. The body palette refresh of the player
actor (`CPc`: `fcn.00834290` on 2022, `fcn.00c073a0` on mars26, `fcn.005d4c90`
on ver12) picks a job id and hands it to a name builder (`fcn.00b16540`,
`fcn.00a25e00`, `fcn.00668f90`), which formats `몸\%s_%s_%d.pal` (ver12:
`몸\%s%s_%d.pal`) with the name found in a job-indexed table of the job-name
manager (`this+0xfa0` on 2022, `this+0xf94` on mars26, `this+0xa58` on ver12;
index = job id, or job id - 3950 above 3950).

### Classic mounts

The job fed in is the view job (`fcn.007496d0`, `fcn.00b11b70`,
`fcn.0055e500`): a Knight (7) riding becomes 13, a Crusader 21, a Lord Knight
4014, and so on. The table names the mount's own palette at those indices,
`페코페코_기사` at 13 on all three builds.

### Halter-lead mounts: the 2022 build and the 2025-12 build differ

The halter-lead state is a flag on the actor (`this+0x2d0` on 2022,
`this+0x2c4` on mars26), set by the `EFST_ALL_RIDING` (613) case of the
status handler through the actor's vtable slot `0xb8`.

- **2022** (`fcn.00834290`, `0x008342cb`-`0x0083432e`): with the flag set, the
  job is switched to the mount job (`fcn.00876b00`, the client's
  `AllMountTable`) only when the body style is 1 or more, when the job is a
  Doram (`fcn.0088e0d0`), or when it is a 4th class (`fcn.008677d0`). A plain
  first, second or transcendent job keeps its view job, so a dyed Creator on
  the boar loads `몸\크리에이터_여_2.pal`. Even on the switched path the 2022
  table names the rider's palette for those mounts (index 4121 holds
  `크리에이터` at `0x0086072a`).
- **mars26** (`fcn.00c073a0`, `0x00c073d8`-`0x00c073f4`): with the flag set,
  the job is switched to the mount job unconditionally (`fcn.00c4d580`), and
  the table names the mount's own palette: the table initialiser
  (`fcn.00c2fa40`) first writes `크리에이터` at index 4121 (`0x00c33704`) and
  later overrides it with `크리에이터멧돼지` (`0x00c339e3`). The Creator on the
  boar loads `몸\크리에이터멧돼지_여_2.pal`. The only build stamp in that
  binary is 20251219.
- **ver12** has no halter-lead mounts.

The archives follow the builds: the 2021-11 GRF has no `크리에이터멧돼지_여_2.pal`
and its boar sprite was drawn for the Creator's palette; the 2026 GRF ships a
redrawn boar with its own palette files. A 2026 boar sprite dyed with a 2021
Creator palette comes out pink. That is a data mix, not a client behaviour.

### Names that changed between the two builds

For the `AllMountTable` values of a first, second or transcendent job, the
2022 table carries the rider's palette name and the mars26 table the mount's
own. The port follows mars26 for these entries, since only the later path reads
them:

| mount | 2022 | mars26 |
|---|---|---|
| `PIG_CREATOR`, `PIG_ALCHE`, `PIG_WHITESMITH` | rider | `크리에이터멧돼지`, `연금술사멧돼지`, `화이트스미스멧돼지` |
| `SHEEP_MONK`, `SHEEP_CHAMP`, `SHEEP_HPRIEST` | rider | `몽크알파카`, `챔피온알파카`, `하이프리스트알파카` |
| `FOX_SAGE`, `FOX_PROF`, `FOX_HWIZ` | rider | `여우세이지`, `여우프로페서`, `여우하이위저드` |
| `OSTRICH_BARD`, `OSTRICH_DANCER`, `OSTRICH_CROWN`, `OSTRICH_ZIPSI`, `OSTRICH_SNIPER` | rider | `타조바드`, `타조무희`, `타조크라운`, `타조짚시`, `타조스나이퍼` |
| `DOG_ROGUE`, `DOG_STALKER`, `DOG_ASSA_X` | rider | `켈베로스로그`, `켈베로스스토커`, `켈베로스어쎄신크로스` |
| `LION_CRUSADER`, `LION_CRUSADER_H` | rider | `사자크루세이더`, `사자팔라딘` |
| `PORING_STAR`, `FROG_NINJA` | rider | `권성포링`, `두꺼비닌자` |

The baby forms are copied from the base mount by the initialiser on mars26
(`PORING_NOVICE_B` from `PORING_NOVICE`, and so on), except `LION_CRUSADER_B`,
which stays on `크루` in both builds. The 3rd-job mounts (`SHEEP_ARCB`,
`OSTRICH_RANGER`, `PIG_GENETIC`, ...) already have their own names in the 2022
table, and the port already matched them.

## Deviations

- **The sentinel is the port's own device.** Neither client asks whether a
  file exists; each follows its build. The port serves archives of both eras
  and the switch date between the 2022-03-24 build and the 2025-12-19 build is
  not known, so it reads the answer off the data instead of a `PACKETVER`
  gate. The 2021-11 archive ships palettes for exactly the four halter-lead
  mounts the 2022 table names on their own (`제네릭멧돼지`, `미케닉멧돼지`,
  `아크비숍알파카`, `슈라알파카`), and the 2026 archive for eighteen names, so
  the data and the client tables move together; one sentinel is enough.
- **The four 3rd-job mounts on an older archive** take the rider's palette,
  where the port used to load the mount's own file. The 2022 client does the
  same (a plain 3rd job keeps its view job, see above), and on the 2021-11
  archive the two files are byte-identical for all four mounts, both sexes and
  every palette the archive ships (0 to 3), so the dye on screen is unchanged.
- **A body style on a halter-lead mount** is switched to the mount job by the
  2022 client under the `costume_%d` naming. The port keeps its existing body
  style path for that case.
- **Found and left as they are**, outside this change:
  - classic mount names that differ from one or both builds: `CRUSADER2_B`
    (`신페코크루세이더`; both builds `페코페코_크루`), `RUNE_KNIGHT2_H`/`_B`
    (`룬나이트쁘띠`; `룬드래곤`), `RANGER2_H`/`_B` (`레인져늑대`;
    `울프레인저`), `MECHANIC2_H`/`_B` (`마도기어`; `미케닉_마도기어`),
    `MEISTER2` (`meister_madogear2`; `MEISTER_MADOGEAR1`), and the
    `ROYAL_GUARD2` family (`그리폰가드`; 2022 `그리폰로얄`); mars26 also renames
    `CRUSADER2` to `신페코크루세이더`, `KNIGHT2_H` to `로드페코` and
    `CRUSADER2_H` to `페코팔라딘`;
  - the 4th-job riding names are lower case in the port and upper case in the
    client tables;
  - `AllMountTable` sends a Star Emperor to `STAR_EMPEROR2` (4243), whose
    palette name is the rider's in both builds; the client sends it to the
    haetae mount, `HAETAE_STAR_EMPEROR` (4245), named `해태성제`;
  - `MountTable` has one entry under the key `undefined`;
  - `JobNameTable[FROG_NINJA]` names the poring sprite, not the toad.

## Reading the markers

Markers like `fcn.<address>` are given with the client build they belong to;
see the [parent README](../README.md).
