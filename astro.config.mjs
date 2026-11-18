// @ts-check
import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// TODO [DOMAIN]: Hier die echte Domain eintragen, sobald sie feststeht.
// Sie wird für Sitemap, Canonical-Links und Open-Graph-Bilder gebraucht.
const SITE_URL = 'https://stromklug.example';

// Gibt es schon Ratgeber-Artikel? Sonst die leere Übersicht nicht in die Sitemap aufnehmen.
const hatArtikel = readdirSync(new URL('./src/content/ratgeber/', import.meta.url)).some(
  (f) => f.endsWith('.md') && !f.startsWith('_'),
);

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Seiten mit "noindex" gehören nicht in die Sitemap
      filter: (page) =>
        !/\/(impressum|datenschutz)\/$/.test(page) && (hatArtikel || !page.endsWith('/ratgeber/')),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
