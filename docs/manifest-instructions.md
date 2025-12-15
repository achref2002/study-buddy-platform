# Manifest & Icons — Instructions

What I changed
- `public/manifest.webmanifest` updated to reference `icon-192.png`, `icon-512.png`, and `icon.svg` (SVG fallback).  
- Added SVG placeholder icons: `public/icon-192.svg`, `public/icon-512.svg`.

Why you should replace the placeholders
- Chrome/Lighthouse prefers PNG icons with exact pixel sizes (192x192 and 512x512) for PWA installability checks. SVG can work as a fallback, but for best compatibility produce real PNGs.

How to generate proper PNG icons (recommended)
- If you have ImageMagick installed, run from the repo root:

```bash
# generate PNGs from the SVG placeholders
convert public/icon-192.svg -resize 192x192 public/icon-192.png
convert public/icon-512.svg -resize 512x512 public/icon-512.png
```

- Alternatively use an online tool (e.g. favicon-generator or any image editor) to export 192x192 and 512x512 PNGs and place them in `public/`.

Test installability locally (production build recommended)

```bash
npm run build
npm run start
# open http://localhost:3000 and in DevTools -> Application -> Manifest
# then run Lighthouse (PWA) and check 'Installable' and 'Works Offline'
```

If Lighthouse complains about missing icon dimensions, ensure the PNG files exist and their actual pixel dimensions match the manifest `sizes` entries.

If you want, I can generate basic PNG placeholders and add them to `public/` now, or guide you through running the ImageMagick commands locally.
