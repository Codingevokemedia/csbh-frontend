import CollectionPage from './CollectionPage.jsx';
import { heroBanner } from '../assets/index.js';

export default function LastCall() {
  return (
    <CollectionPage
      collection="last-call"
      title="Last Call"
      subtitle="Final chances on CS Beverly Hills pieces leaving the collection soon."
      banner={heroBanner}
      itemNoun="product"
    />
  );
}
