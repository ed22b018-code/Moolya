/**
 * Real photography, served from the Unsplash CDN (free to use under the Unsplash License).
 * Photos are illustrative stand-ins for pilot products, not photos of the actual SKUs.
 */
export const unsplash = (id: string, w = 900, h?: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}${h ? `&h=${h}` : ''}&q=72&auto=format&fit=crop`;

export const productPhotos: Record<string, string[]> = {
  H001: ['1740711152088-88a009e877bb', '1618591552964-837a5a315fb2', '1601522089844-8ac5e2ae6773'],
  H002: ['1643312892626-80632ef6d7dc', '1457545195570-67f207084966', '1779470703519-05af825e87cd'],
  H003: ['1610030469983-98e550d6193c', '1617627143750-d86bc21e42bb', '1641699862936-be9f49b1c38d'],
  H004: ['1619239635762-8132f6dba51c', '1763659411533-66ab57c6d81b', '1762638197960-d1ee50ddcff3'],
  H005: ['1590251024078-8a6d9f90b02d', '1702865071803-cb154cd45f48'],
  C001: ['1590751518505-1fc2d227ef9b', '1782216312755-42f2b13590c8', '1601330862030-1e08c703ac04'],
  C002: ['1549315393-aeac60e09d29', '1607437817193-3b3b029b5b75'],
  C003: ['1765441863467-12214bb5d729', '1497219055242-93359eeed651', '1687422810663-c316494f725a'],
  N001: ['1587049352851-8d4e89133924', '1613548058193-1cd24c1bebcf', '1558642452-9d2a7deb7f62'],
  N002: ['1679941279735-b3b35e8bc476', '1642067958050-bfba120a57e2', '1570634433336-be7629414ce1'],
};

export const scenes = {
  weaverAtLoom: '1640292343595-889db1c8262e',
  womanWeaving: '1719154717733-d37860cdee24',
  loomRoom: '1786871204247-60f342ae81a8',
  loomThreads: '1773847099342-33b0381cbe0d',
  weaverPatterned: '1788015737547-c54a34cbd562',
  artisanAtWork: '1687422810663-c316494f725a',
  beeFrame: '1586779161164-d89795b07b71',
  godavariBridge: '1706631519116-6607d09107b2',
  riverBoat: '1642148653914-5ed7b97479ca',
  greenFields: '1622023419267-cca058106066',
  rugHands: '1773739967506-2c858c8bde3c',
  communityLoom: '1759738099669-d64b0656f6cf',
};

/** Initials-based fallback when a remote photo fails to load. */
export const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = '1';
  img.src = '/favicon.svg';
  img.style.objectFit = 'contain';
  img.style.padding = '18%';
};
