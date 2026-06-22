export const COLLECTIONS = [
  {
    name:        'Hope Collection',
    slug:        'hope-collection',
    collectionKey: 'hope',
    eyebrow:     'Philanthropy & Purpose',
    description: 'A series of timepieces dedicated to those who build a better world. Every piece carries a giving commitment — Swiss-made precision with a mission.',
  },
  {
    name:        'Legacy Collection',
    slug:        'legacy-collection',
    collectionKey: 'legacy',
    eyebrow:     'Signature Series',
    description: 'Enduring forms refined across generations. The Legacy Collection honours the craftsmanship traditions that define Beverly Hills luxury.',
  },
  {
    name:        'Shriners 100 Years Anniversary Collection',
    slug:        'shriners-100-years-anniversary-collection',
    collectionKey: 'shriners',
    eyebrow:     'Centennial Edition',
    description: 'Commemorating a century of brotherhood, service, and distinction. Limited numbered pieces — each a permanent record of a milestone.',
  },
  {
    name:        'LEGION 333 Collection',
    slug:        'legion-333-collection',
    collectionKey: 'legion-333',
    eyebrow:     'Exclusive Release',
    description: 'Forged for those who operate at the edge of excellence. Bold architecture, disciplined detail, and an identity entirely its own.',
  },
];

export function getCollectionBySlug(slug) {
  return COLLECTIONS.find(c => c.slug === slug) || null;
}
