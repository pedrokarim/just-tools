# Next.js upgrade plan

The project now pins a stable Next.js release (`15.6.0`) alongside React `19.1.1` to pick up the CVE-2025-55182 fix and avoid running on a canary build. If Vercel’s changelog for CVE-2025-55182 later identifies a newer stable Next.js release that bundles the patched React runtime, upgrade to that version promptly. To keep the framework aligned with the patched React release, follow this process once the npm registry is reachable:

1. **Select the target release**
   - Use the pinned stable Next.js version (`15.6.0`) or any later stable release that the Vercel CVE changelog identifies as containing the patched React runtime (avoid canary builds unless specifically required).
   - Cross-check the Vercel CVE-2025-55182 changelog entry for any updated stable version and ship that release.
   - Update both `next` and `eslint-config-next` in `package.json` to the selected stable version to keep linting rules aligned.

2. **Refresh the lockfile**
   - Run `bun install --no-progress` to regenerate `bun.lock` with the new Next.js artifacts and integrity hashes.
   - Commit the updated `bun.lock` alongside `package.json` so installs stay deterministic.

3. **Verify the upgrade**
   - Run `bun run lint` and `bun run test` (or the relevant Vitest commands) to catch any breaking changes.
   - Exercise key flows locally with `bun run dev` to ensure the app and middleware behave correctly.

4. **Roll out safely**
   - Deploy to a staging environment first.
   - Monitor logs and error tracking for regressions before promoting to production.

Documenting these steps keeps the Next.js upgrade visible while registry access is restricted.
