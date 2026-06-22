import CollectionPage from './CollectionPage.jsx';
import { heroRaxer } from '../assets/index.js';

export default function NewArrivals() {
  return (
    <CollectionPage
      collection="new-arrivals"
      title="New Arrivals"
      subtitle="The latest additions to the CS Beverly Hills collection."
      banner={heroRaxer}
    />
  );
}
