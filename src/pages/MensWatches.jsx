import CollectionPage from './CollectionPage.jsx';
import { goldenWatch } from '../assets/index.js';

export default function MensWatches() {
  return (
    <CollectionPage
      collection="mens"
      title="Men's Watches"
      subtitle="Bold timepieces engineered for precision and prestige."
      banner={goldenWatch}
    />
  );
}
