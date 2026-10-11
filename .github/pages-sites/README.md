# Server sites

One folder per server on GitHub Pages: `https://robrowser.suuuper.app/<site>/` (`cyro.live/`…), each
playable only with the **roBrowser relay** Firefox extension, which holds the client folder
(`data.grf` + `BGM/`…).

`.github/workflows/pages-sites.yml` runs after every "Deploy to GitHub Pages" of
`feat/native-plugin-manager`: for every folder here but `shared/`, it copies
`gh-pages/feat-native-plugin-manager/` to `gh-pages/<site>/` with `assemble.sh`, which adds `plugins/`,
then `shared/`, then the site's own files. Nothing is rebuilt.

| File | Role |
|---|---|
| `<site>/Config.local.js` | the server block; `/grf/` and the API root-absolute; the native plugin managers under `/<site>/plugins/`; loads the three shared scripts |
| `shared/sw.js`, `shared/pwa/` | the page-shell service worker and the relay (`/grf/` from the extension's folder, the API from `https://cyro.live/api`) |
| `shared/gate.js` | holds `loadApp()` until the relay is on and the service worker controls the page; else a message, and the client is never loaded |
| `shared/index.html` | `/<site>/` → `api.html?app=ONLINE` |

`<site>/Config.local.js` is ignored by the root `.gitignore` (`Config.local.js`): add a new one with
`git add -f`. Once tracked, its edits show as usual.

`shared/sw.js` and `shared/pwa/` are copies of `robrowser/pwa/` in the dev monorepo, which
`wtf robrowser prod --local-grf` serves: edit them there first, then copy them here unchanged.

The relay holds one client folder and calls `https://cyro.live/api` only: a second server with another
GRF or another API needs the relay to do so first.

Run it locally:

```bash
bash .github/pages-sites/assemble.sh dist/Web plugins .github/pages-sites/cyro.live /tmp/site/cyro.live
```
