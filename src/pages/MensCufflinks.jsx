import CollectionPage from './CollectionPage.jsx';
import { cufflinksBanner } from '../assets/index.js';

export default function MensCufflinks() {
  return (
    <CollectionPage
      collection="mens-cufflinks"
      title="Men's Cufflinks"
      subtitle="Handcrafted cufflinks for the modern gentleman — precision detail, Swiss-inspired design."
      itemNoun="product"
      banner={cufflinksBanner}
    />
  );
}
