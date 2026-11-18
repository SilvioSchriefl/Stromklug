import { describe, expect, it } from 'vitest';
import { AFFILIATE_LINKS, aktiveLinks, type AffiliateId } from './affiliate';

describe('aktiveLinks', () => {
  it('liefert nur Links mit eingetragener URL', () => {
    const ids = Object.keys(AFFILIATE_LINKS) as AffiliateId[];
    const erwartet = ids.filter((id) => AFFILIATE_LINKS[id].url.trim() !== '');
    expect(aktiveLinks(ids).map((l) => l.id)).toEqual(erwartet);
  });

  it('jede eingetragene URL ist eine https-Adresse', () => {
    for (const l of Object.values(AFFILIATE_LINKS)) {
      if (l.url) expect(l.url).toMatch(/^https:\/\//);
    }
  });
});
