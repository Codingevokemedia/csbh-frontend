import CollectionPage from './CollectionPage.jsx';
import { heroBanner } from '../assets/index.js';

export default function Bestsellers() {
  return (
    <CollectionPage
      collection="bestsellers"
      title="Bestsellers"
      subtitle="Our most-loved timepieces, chosen by collectors and connoisseurs."
      banner={heroBanner}
    />
  );
}
