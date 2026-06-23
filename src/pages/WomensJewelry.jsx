import CollectionPage from './CollectionPage.jsx';
import { lumiereRing } from '../assets/index.js';

export default function WomensJewelry() {
  return (
    <CollectionPage
      collection="jewelry"
      title="Women's Jewelry"
      subtitle="Exquisite pieces crafted to complement the woman who commands every room."
      itemNoun="product"
      banner={lumiereRing}
    />
  );
}
