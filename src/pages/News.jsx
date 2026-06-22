import { Link } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { getNewArrivals } from '../services/products.js';
import { useState, useEffect } from 'react';

const ARTICLES = [
  {
    id: 1,
    date: 'Nov 21, 2025',
    title: 'Water Resistance and Your Luxury Watch (Part One)',
    excerpt: "From 5 ATM to 5 ATM — what do these numbers really mean when you buy your watch? Because all you need to know is if it can get wet, right? Let's talk water...",
  },
  {
    id: 2,
    date: 'Nov 21, 2025',
    title: 'Why Wear A Watch? 5 Reasons Why Watches Trump Smartphones...',
    excerpt: "The timeless essence of timepieces is here — now and forever — even with the ever-omnipresent smartphones as technology develops — it innovates...",
  },
  {
    id: 3,
    date: 'Nov 21, 2025',
    title: 'Global Icon Citizen Award',
    excerpt: 'Craig Shelly Beverly Hills honored as one of the most Philanthropic brands in the world. Craig Shelly, Donor CEO as Cit...',
  },
];

export default function News() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getNewArrivals().then(p => setProducts(p.slice(0, 4)));
  }, []);

  return (
    <div>
      {/* Articles */}
      <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 py-12">
        <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-8">NEWS</h1>

        <div className="grid sm:grid-cols-3 gap-8">
          {ARTICLES.map(article => (
            <article key={article.id} className="flex flex-col gap-3">
              <p className="font-sans text-[11px] text-mist">{article.date}</p>
              <h2 className="font-sans text-[13px] font-semibold text-ink leading-snug">{article.title}</h2>
              <p className="font-sans text-[12px] text-steel leading-relaxed flex-1">{article.excerpt}</p>
              <Link
                to={`/news/${article.id}`}
                className="font-sans text-[11px] font-semibold text-steel hover:text-ink transition-colors"
              >
                READ MORE &gt;
              </Link>
            </article>
          ))}
        </div>
      </div>

      {/* Shop Now */}
      <div className="border-t border-cloud py-12 px-6 sm:px-10">
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <h2 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-8">SHOP NOW</h2>
          <ProductGrid products={products} columns={4} />
        </div>
      </div>
    </div>
  );
}
