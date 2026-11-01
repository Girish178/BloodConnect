BloodConnect - Neo-brutalist restyle (English + Marathi)

1. Unzip. Copy everything inside "frontend" into your bloodconnect/frontend folder, replacing files with the same name.
   - index.html  (replace; adds the fonts)
   - src/...     (replace/add; new folders: src/i18n)
2. DO NOT touch these (unchanged, keep yours): src/services/*, src/context/AuthContext.jsx, src/hooks/useGeolocation.js, vite.config.js
3. No new npm packages needed. Run: npm run dev
4. To change any text: edit src/i18n/translations.js (English block "en", Marathi block "mr").
