# ALMOGHANI LIVE — full project archive

This repository keeps **both versions** of ALMOGHANI LIVE in one place.

## Static GitHub Pages website (repository root)

- `index.html`: published HTML site and built-in video player
- `admin.html`, `admin.js`, `control.js`, `admin/index.html`: admin dashboard
- `channels-arabic.m3u` and other `.m3u` files: channel playlists
- `design-backups/`: historical HTML designs
- `site-config.js`: publicly published site appearance and channel settings

## Complete Lovable / React application (`lovable-app/`)

The `import-lovable-site.yml` workflow copies the complete **source tree** from
[almoghani-net-22](https://github.com/9z44yj4h8m-afk/almoghani-net-22)
into `lovable-app/`: the TypeScript/React design, control studio, live player,
channel catalog, IPTV playlists, media assets, migrations and Android app source.

**Source code is not the deployed backend database.** Live subscriptions, account data,
database rows and authentication secrets are not copied. The source repository's
`.env` and `.github` files are intentionally excluded from the public mirror.
The workflow runs when explicitly updated/triggered; it does not regularly
overwrite channel content.

## Deployment

This repository does **not** automatically claim the production domain
`almoghani.net`. The original `Z` repository remains unchanged and continues
to control its custom domain until a separate migration has been verified.

For GitHub Pages static hosting, publish the repository root. The React/Lovable
application needs its own build and hosting configuration and is **not**
equivalent to the static root HTML site.

Only import and share video streams that you are authorized to use. URLs in
public M3U lists are accessible to repository visitors.
