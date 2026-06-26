# WEB-0007 Quiet Preview Deployment Plan

- [x] Link the local repository to the Vercel project.
- [x] Configure `ledgerful.dev` and `www.ledgerful.dev`.
- [x] Configure Cloudflare DNS-only records.
- [x] Configure the apex-to-`www` permanent redirect.
- [x] Verify both hostnames and Vercel certificates.
- [x] Write a failing quiet-preview policy check.
- [x] Add `robots.txt` crawl blocking and page-level noindex metadata.
- [x] Make the quiet-preview policy check pass.
- [x] Exclude local environment and agent-state files from Vercel uploads.
- [x] Create `docs/ToDo.md`.
- [x] Run full local verification.
- [x] Deploy the source change to production.
- [x] Verify production robots metadata and close review findings.
- [ ] Commit and push the intentional source changes.
