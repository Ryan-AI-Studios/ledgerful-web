# WEB-0006 Dependency Baseline Plan

- [x] Query live npm versions for direct dependencies.
- [x] Run `npm outdated`, `npm audit`, and `npm ls`.
- [x] Verify Next.js Node and ESLint requirements in current documentation.
- [x] Verify the PostCSS advisory and upstream Next.js remediation.
- [x] Record ESLint 10 upstream-plugin incompatibility.
- [x] Override Next.js's vendored PostCSS with patched version 8.5.10.
- [x] Regenerate and inspect `package-lock.json`.
- [x] Confirm `npm audit` is clean.
- [x] Run build, lint, quiet-preview, link, and ChangeGuard gates.
- [x] Record final decisions and close the track.
