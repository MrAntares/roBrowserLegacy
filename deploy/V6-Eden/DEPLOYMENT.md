# V6-Eden deployment

1. Back up the current `/ro/` directory and nginx site configuration.
2. Upload every runtime file in this directory except documentation, the example config and `SHA256SUMS`.
3. Create `Config.local.js` from `Config.local.example.js` on the server. Never put test credentials in it.
4. Apply the static-resource behavior from `nginx-ro.conf`, run `nginx -t`, then reload nginx.
5. Purge any CDN/browser cache for `api.html`, `api.js`, `Online.js` and `index.html`.
6. Run `node verify-deployment.mjs https://game.lastro.cn/ro`.
7. Open the launcher and complete the manual regression checklist below.

## Manual regression checklist

- Login page reaches account input without requesting `undefined.js`.
- Dedicated test account can select a character and enter a map.
- Coordinate movement and ordinary attack work.
- An explicitly selected offense skill, support skill and escape rule each execute once under their configured condition.
- An explicitly selected recovery item is used below its threshold; missing or ineffective recovery stops automation.
- Enabled loot pickup collects a nearby drop before patrol resumes.
- Teleporting stops automation, loads the new map and does not silently restart it.
- Disconnect, death and NPC/trade/storage windows pause or stop automation as described in the UI.

Record the date, PACKETVER, character, map names and pass/fail result. Do not record account credentials.
