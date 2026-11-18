// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO [DOMAIN]: Hier die echte Domain eintragen, sobald sie feststeht.
// Sie wird für Sitemap, Canonical-Links und Open-Graph-Bilder gebraucht.
const SITE_URL = 'https://stromklug.example';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
