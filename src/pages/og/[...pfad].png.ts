/**
 * Erzeugt beim Bauen für jede Seite aus src/lib/og/seiten.ts ein Vorschaubild,
 * z. B. /og/balkonkraftwerk-rechner.png oder /og/ratgeber/grundlast-messen.png.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { ogSeiten, type OgSeite } from '@/lib/og/seiten';
import { zeichneOgBild } from '@/lib/og/bild';

export const getStaticPaths: GetStaticPaths = async () => {
  const seiten = await ogSeiten();
  return seiten.map((seite) => ({ params: { pfad: seite.pfad }, props: { seite } }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await zeichneOgBild((props as { seite: OgSeite }).seite);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
