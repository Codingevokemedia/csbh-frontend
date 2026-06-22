import CollectionPage from './CollectionPage.jsx';
import { goldenWatch } from '../assets/index.js';

// Top-level "Men's" landing — ALL men's products (watches + cufflinks). The
// dedicated "Men's Watches" page lives at /mens (MensWatches.jsx, watches only).
export default function MensAll() {
  return (
    <CollectionPage
      collection="mens-all"
      title="Men's"
      subtitle="The complete men's collection — bold timepieces and refined cufflinks."
      banner={goldenWatch}
      itemNoun="product"
    />
  );
}
