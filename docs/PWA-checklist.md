# PWA Checklist for Study Buddy

This document lists actions to satisfy the exam PWA requirements and how to verify them.

1. Manifest & Icons
   - Ensure `public/manifest.webmanifest` includes `name`, `short_name`, `start_url`, `display`, `theme_color`, and `icons`.
   - Replace `placeholder-logo.png` with real PNG icons: 192x192 and 512x512.
   - Verify `icon.svg` exists for scalable icon.

2. Service Worker & Offline
   - `public/sw.js` precaches critical assets and serves `/offline.html` as navigation fallback.
   - Ensure `public/offline.html` exists (already added).
   - Recommended: add runtime caching for `_next/static` and common assets (done).

3. Installability & HTTPS
   - Deploy to a public HTTPS URL (Vercel recommended).
   - Set `NEXTAUTH_URL` to your production URL.
   - In Chrome DevTools, run Lighthouse → PWA to confirm 'Installable' and 'Works Offline'.

4. Testing locally
   - Build & start production server (service workers behave properly):
     ```bash
     npm run build
     npm run start
     ```
   - Open `https://localhost:3000` (or `http://localhost:3000` for local testing) and register the service worker in DevTools.
   - Toggle Network → Offline and navigate to confirm cached pages and `offline.html` appear.

5. Additional improvements (optional)
   - Implement cache expiration and size limits for runtime caches.
   - Implement background sync or IndexedDB-based queue for POST requests when offline.

6. Submission checklist for exam
   - Public HTTPS URL (deployed).
   - Lighthouse PWA report attached (Installable + Works Offline passing).
   - Short demo script showing offline behavior and PWA install.
