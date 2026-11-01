# Server sites

One folder per client build and server on GitHub Pages: `https://robrowser.suuuper.app/<build>/<site>/`
(`native-plugin-manager/cyro.live/`, `upstream/cyro.live/`, `cyro/cyro.live/`…), each playable only with the
[roBrowser relay](https://github.com/meitogi/robrowser-relay) Firefox extension, which holds the client
folder (`data.grf` + `BGM/`…).

`.github/workflows/pages-sites.yml` runs after every "Deploy to GitHub Pages" of a source branch in
[`BUILDS`](BUILDS): for every build there and every folder here but `shared/`, `build-sites.sh` copies
`gh-pages/<safe-branch>/` to `gh-pages/<build>/<site>/` with `assemble.sh`, which adds the branch's
`plugins/`, then `shared/`, then the site's own files. Nothing is rebuilt.

| Build | Source branch | Access |
|---|---|---|
| `native-plugin-manager/` | `feat/native-plugin-manager` | access key |
| `upstream/` | `upstream-relay` (`upstream/master` + the login auto-retry and the Patch Notes window) | open |
| `cyro/` | `cyro-prod` (the client cyro.live serves, rebuilt from source; its worker loaded next to `Online.js`) | open |
| `.` (the site at the root, `/cyro.live/`) | `feat/native-plugin-manager` | access key, the same keys |

`upstream` is in the workflow's trigger too: that branch's `pages.yml` (upstream's own file, never edited
here) clears `gh-pages/upstream/` on every push, `upstream/cyro.live/` included, and the next run of this
workflow puts it back.

| File | Role |
|---|---|
| `BUILDS` | one line per build: gh-pages folder, source branch, `key` or `open` |
| `build-sites.sh` | assembles every build × site into a gh-pages tree; locks the `key` builds |
| `assemble.sh` | one build × one site |
| `encrypt.mjs` | locks a `key` build: `Online.js` → `Online.js.enc` (AES-GCM, a new content key per deploy) + `keyslots.json`, one slot per access key of the `NPM_ACCESS_KEYS` secret |
| `access-key.test.mjs` | `node --test .github/pages-sites/access-key.test.mjs`, also run by the workflow before it deploys |
| `relay-frame.test.mjs` | a same-origin frame (a camera tile) of a relay page: `gate.js` takes the top page's relay state, `pwa/relay-client.js` leaves the files to it; run by the workflow too |
| `patchlogs/<safe-branch>.json` | the patch log of a branch whose tree has none (`upstream-relay`): copied to `<build>/<site>/patchlog.json`, which the Patch Notes window reads; `feat/native-plugin-manager` ships its own (`patch-notes/patchlog.json`, copied by its `pages.yml`) |
| `<site>/Config.local.js` | the server block; `/grf/` and the API root-absolute; the native plugin managers under the copy's own folder, on every build but `upstream/` and `cyro/`; loads the shared scripts |
| `shared/sw.js`, `shared/pwa/` | the page-shell service worker and the relay (`/grf/` from the extension's folder, the API from `https://cyro.live/api`) |
| `shared/access-key.js` | browser side of `encrypt.mjs`: opens a slot with the player's key (kept in `localStorage`, shared by every keyed site of the origin), decrypts `Online.js.enc` |
| `shared/gate.js` | holds `loadApp()` until the relay is on and the service worker controls the page; on a keyed build it also needs the key, then imports the decrypted client from a `blob:` URL, with `import.meta.url` replaced by the URL `Online.js` would have had; else a message, and the client is never loaded |
| `shared/index.html` | `/<build>/<site>/`: landing page (server name from the site folder, the notice, install link, the access key on a keyed build, live relay state, **Play** → `api.html?app=ONLINE`) |
| `shared/build-switch.js` | on the login screen of `upstream/`, `cyro/` and `native-plugin-manager/`, top right: a switch to the same site's client on the other builds, with each build's date and, on hover, its update and the upstream commit it is based on, linked (its `version.json`); NPM is in it on its own build, and on the others once an access key is kept; `cyro/` also shows the build date of the client cyro.live serves (`version` of the site's `Config.local.js`) |

## Access keys

A key opens the keyed builds and nothing else: the sources are public, so it is a door, not code
protection. Keys are 32 hex digits; the secret `NPM_ACCESS_KEYS` of this repository holds one
`<label> <key>` line per key. A new deploy draws a new content key, so a key removed from the secret
stops working at the next deploy.

- New key: `wtf pages key new <label>` in the dev monorepo, which appends it to its key list and prints
  the `gh secret set` command, then redeploy: `gh workflow run pages-sites.yml -R Stitchuuuu/roBrowserLegacy`.
- Revoke: delete its line from that list, run the same `gh secret set`, redeploy.
- Without the secret, the workflow fails before it deploys anything.

`<site>/Config.local.js` is ignored by the root `.gitignore` (`Config.local.js`): add a new one with
`git add -f`. Once tracked, its edits show as usual.

`shared/sw.js` and `shared/pwa/` are copies of `robrowser/pwa/` in the dev monorepo, which
`wtf robrowser prod --local-grf` serves: edit them there first, then copy them here unchanged.

The relay holds one client folder and calls `https://cyro.live/api` only: a second server with another
GRF or another API needs the relay to do so first.

Run it locally, from a folder holding `feat-native-plugin-manager/`, `upstream-relay/` and `cyro-prod/`
(three `dist/Web` builds), `<plugins-root>/<safe-branch>/` (each branch's `plugins/`) and, optionally,
`<plugins-root>/<safe-branch>.commit` (`<sha> <date>` of the built commit) and `<plugins-root>/<safe-branch>.base` (the same of its upstream merge base), which `version.json` carries:

```bash
NPM_ACCESS_KEYS='me 0123-4567-89ab-cdef-0123-4567-89ab-cdef' bash .github/pages-sites/build-sites.sh <plugins-root>
```
