import CollectionPage from './CollectionPage.jsx';
import { gearWatch } from '../assets/index.js';

// Dedicated "Women's Watches" page (watches only). The general "Women's"
// landing lives at /womens (WomensWatches.jsx) and includes jewelry too.
export default function WomensWatchesOnly() {
  return (
    <CollectionPage
      collection="womens-watches"
      title="Women's Watches"
      subtitle="Refined elegance, Swiss precision — crafted for the extraordinary woman."
      banner={gearWatch}
    />
  );
}
