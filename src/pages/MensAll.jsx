import CollectionPage from './CollectionPage.jsx';
import { goldenWatch } from '../assets/index.js';

// Top-level "Men's" landing — ALL men's products (watches of every type +
// cufflinks + accessories). The dedicated "Men's Watches" page lives at /mens
// (MensWatches.jsx) and shows men's + unisex watches only.
export default function MensAll() {
  return (
    <CollectionPage
      collection="mens-all"
      title="Men's"
      subtitle="The complete men's collection — timepieces, cufflinks and more."
      banner={goldenWatch}
      itemNoun="product"
    />
  );
}
