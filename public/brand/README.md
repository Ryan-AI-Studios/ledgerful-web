# Ledgerful brand assets (optimized)

Clean masters live in `masters/`. Sized site outputs are at this folder root.

| Use | Files |
|---|---|
| Header / footer wordmark | `banner-dark-960.webp`, `banner-light-960.webp` (+ `.png`) |
| Favicon | `favicon-32*.png`, `icon-*-32.png` |
| Apple touch | `apple-touch-icon.png` / `icon-dark-180.png` |
| High-res icon | `icon-*-512.png` |

**Banners use true alpha** (solid plate backgrounds are chroma-keyed out) so the
wordmark sits on the page canvas. Theme swap is pure CSS in `BrandMark` /
`globals.css` (`html[data-theme="light"]` shows the light wordmark).

Regenerate:

```bash
npm run generate:brand
```

Input priority: `masters/*-master.jpg`, then Desktop `assets/`, then existing
banner PNG as a last resort for re-keying.
