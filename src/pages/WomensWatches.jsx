import CollectionPage from './CollectionPage.jsx';
import { gearWatch } from '../assets/index.js';

export default function WomensWatches() {
  return (
    <CollectionPage
      collection="womens"
      title="Women's"
      subtitle="Refined elegance, Swiss precision — crafted for the extraordinary woman."
      banner={gearWatch}
    />
  );
}
