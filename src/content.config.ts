/**
 * Content Collections: Ratgeber-Artikel als Markdown-Dateien in src/content/ratgeber/.
 * Dateien, deren Name mit "_" beginnt (z. B. _vorlage.md), werden ignoriert.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const ratgeber = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/ratgeber' }),
  schema: z.object({
    /** Überschrift (H1) und Seitentitel */
    titel: z.string().min(10).max(70),
    /** Meta-Description für Google, 120–160 Zeichen ideal */
    beschreibung: z.string().min(50).max(170),
    veroeffentlicht: z.coerce.date(),
    aktualisiert: z.coerce.date().optional(),
    /** Slugs passender Rechner, z. B. ["balkonkraftwerk-rechner"] */
    rechner: z.array(z.string()).default([]),
    /** Quellen, die im Artikel genutzt werden */
    quellen: z
      .array(z.object({ titel: z.string(), url: z.url(), stand: z.string().optional() }))
      .default([]),
    /** true = wird nicht veröffentlicht */
    entwurf: z.boolean().default(false),
  }),
});

export const collections = { ratgeber };
