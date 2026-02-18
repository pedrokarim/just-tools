# PWA Update System (Vercel)

## Overview

This project uses a custom Service Worker (`public/sw.js`) and a build-time version pipeline to keep the app installable offline and update it reliably.

Main pieces:

1. `scripts/update-version.js`
2. `scripts/build-sw.js`
3. `public/sw.js`
4. client registration script in `src/app/layout.tsx`
5. cache headers in `next.config.ts`

---

## Build-Time Versioning

During `bun run build`:

1. `scripts/update-version.js` writes `public/version.json` with:
   - `version`
   - `buildTime`
   - `commitSha`
   - `gitTag`
   - `cacheVersion`
2. `scripts/build-sw.js` injects:
   - `CACHE_NAME` in `public/sw.js`
   - `APP_VERSION` label in `public/sw.js`

`cacheVersion` is built from `version + gitTag + shortSha + timestamp`, so cache keys change on each build.

### Git tags

Tags are supported and used when available:

- `VERSION_TAG` env var (highest priority)
- GitHub tag context (`GITHUB_REF_TYPE=tag`, `GITHUB_REF_NAME`)
- fallback Git commands (`git describe ...`)

If no tag is found, the system still works with SHA and timestamp.

---

## Service Worker Strategy

Implemented in `public/sw.js`:

1. Install:
   - precaches core pages/assets
   - calls `skipWaiting()`
2. Activate:
   - deletes old caches
   - calls `clients.claim()`
3. Fetch:
   - Navigation requests: `network-first` (prevents stale HTML lock-in)
   - Static assets (`/_next/static`, script/style/font/image): `stale-while-revalidate`
   - Other same-origin GET requests: `cache-first`
   - `/api/*`: bypassed (network)
4. Messages:
   - `SKIP_WAITING` to activate waiting SW
   - `GET_VERSION` to read runtime SW version

---

## Client Update Flow

In `src/app/layout.tsx`:

1. Registers SW with `{ updateViaCache: 'none' }`
2. Triggers update checks:
   - every 5 minutes
   - when tab becomes visible
   - when network comes back online
3. If a new SW is installed, sends `SKIP_WAITING`
4. On `controllerchange`, reloads once to apply the new version

This avoids common cases where users stay on old code after deploy.

---

## Vercel Notes

`next.config.ts` sets:

- `/sw.js` -> `Cache-Control: no-cache, no-store, must-revalidate`
- `/version.json` -> `Cache-Control: no-cache, no-store, must-revalidate`
- `/manifest.json` -> `Cache-Control: no-cache`

This is important on Vercel/CDN so SW update checks are not blocked by HTTP cache.

---

## Troubleshooting

If users still see stale versions:

1. Confirm `public/version.json` changes on every deploy.
2. Confirm `CACHE_NAME` in served `sw.js` changes on deploy.
3. In browser devtools:
   - Application -> Service Workers: check active/waiting worker
   - Application -> Cache Storage: ensure old caches are removed
4. Confirm production is HTTPS and not `localhost`.
