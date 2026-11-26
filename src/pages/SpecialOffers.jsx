import CollectionPage from './CollectionPage.jsx';
import { heroBanner } from '../assets/index.js';

export default function SpecialOffers() {
  return (
    <CollectionPage
      collection="special-offers"
      title="Special Offers"
      subtitle="Selected CS Beverly Hills pieces, now at a reduced price."
      banner={heroBanner}
      itemNoun="product"
    />
  );
}
