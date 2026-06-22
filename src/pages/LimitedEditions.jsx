import CollectionPage from './CollectionPage.jsx';
import { heroBanner } from '../assets/index.js';

export default function LimitedEditions() {
  return (
    <CollectionPage
      collection="limited-editions"
      title="Limited Editions"
      subtitle="Rare numbered pieces — only a few remain. Each a collector's legacy."
      banner={heroBanner}
    />
  );
}
