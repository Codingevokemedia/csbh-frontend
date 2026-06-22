import { useState, useEffect } from 'react';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { getStoreProducts } from '../services/products.js';

export default function MensCufflinks() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreProducts()
      .then(p => {
        const filtered = p.filter(x => /cufflink/i.test(x.category || x.name || ''));
        setProducts(filtered.length ? filtered : getDummyProducts());
        setLoading(false);
      })
      .catch(() => {
        setProducts(getDummyProducts());
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 py-10">
        <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-2">MEN'S CUFFLINKS</h1>
        <p className="font-sans text-sm text-steel text-center mb-10 max-w-md mx-auto">
          Handcrafted cufflinks for the modern gentleman — precision detail, Swiss-inspired design.
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-cloud aspect-square mb-3" />
                <div className="bg-cloud h-3 w-2/3 mb-2 rounded" />
                <div className="bg-cloud h-3 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={products} columns={4} />
        )}
      </div>
    </div>
  );
}

function getDummyProducts() {
  return [
    { id: 'cl-1', name: 'Sterling Silver Barrels', price: 195, image: null, category: 'cufflinks' },
    { id: 'cl-2', name: 'Gold-Tone Monogram Set', price: 245, image: null, category: 'cufflinks' },
    { id: 'cl-3', name: 'Sapphire Face Oval Links', price: 320, image: null, category: 'cufflinks' },
    { id: 'cl-4', name: 'Carbon Fiber Modern Set', price: 275, image: null, category: 'cufflinks' },
  ];
}
