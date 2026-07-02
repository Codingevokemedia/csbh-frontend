import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import RaxerHero from '../components/home/RaxerHero.jsx';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import { getFeaturedProducts, getProductsByCollection, getStoreProducts, getHomepageSection, isExcludedBestseller } from '../services/products.js';
import { goldenWatch, gearWatch, heroMillion, empowerWatch, giftForYou } from '../assets/index.js';
import { mockTestimonials } from '../data/mockTestimonials.js';

export default function Home() {
  const [bestsellers, setBestsellers]       = useState([]);
  const [mensProducts, setMensProducts]     = useState([]);
  const [womensProducts, setWomensProducts] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [isMuted, setIsMuted]               = useState(true);
  const videoRef                            = useRef(null);

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }

  useEffect(() => {
    Promise.all([
      getFeaturedProducts(),
      getProductsByCollection('mens'),
      getProductsByCollection('womens'),
      getStoreProducts(),
      // Admin-curated overrides (empty arrays when a section isn't configured).
      getHomepageSection('bestsellers'),
      getHomepageSection('mens'),
      getHomepageSection('womens'),
    ])
      .then(([best, mens, womens, allProducts, cmsBest, cmsMens, cmsWomens]) => {
        // Lead with the real best-sellers; if fewer than 8 are flagged, top up
        // with other CS Beverly Hills pieces so the section fills two rows of 4.
        const eight = [...best];
        const seen = new Set(best.map(p => p.id));
        for (const p of [...mens, ...womens]) {
          if (eight.length >= 8) break;
          // Skip products explicitly excluded from the best-seller rail.
          if (!seen.has(p.id) && !isExcludedBestseller(p.id)) { seen.add(p.id); eight.push(p); }
        }
        // Admin-curated bestsellers win when configured; otherwise the
        // computed best-seller rail above is used.
        setBestsellers((cmsBest.length ? cmsBest : eight).slice(0, 8));

        const byId = new Map(allProducts.map(p => [String(p.id), p]));

        // "Signature Timepieces" (Men's) — pin these watches first (in order),
        // then top up with the rest of the men's collection. De-dupe, keep 4.
        const MENS_PINNED_IDS = ['241128030', '241207008', '241205017', '241207003'];
        const pinnedMens = MENS_PINNED_IDS.map(id => byId.get(String(id))).filter(Boolean);
        const mensSeen = new Set();
        const mensFour = [];
        for (const p of [...pinnedMens, ...mens]) {
          const id = String(p.id);
          if (mensSeen.has(id)) continue;
          mensSeen.add(id);
          mensFour.push(p);
          if (mensFour.length >= 4) break;
        }
        // Show the men's section in descending order of price.
        mensFour.sort((a, b) => (b.price || 0) - (a.price || 0));
        // Admin-curated men's section wins when configured.
        setMensProducts((cmsMens.length ? cmsMens : mensFour).slice(0, 4));

        // "Crafted for Her" — pin these 4 jewelry pieces first (in order), then
        // top up with the highest-priced jewelry. De-dupe, keep 4.
        const HER_PINNED_IDS = ['251017001', '241205024', '241204009', '251113001'];
        const pinnedHer = HER_PINNED_IDS.map(id => byId.get(String(id))).filter(Boolean);
        const jewelry = allProducts
          .filter(p => p.category === 'jewelry')
          .sort((a, b) => (b.price || 0) - (a.price || 0));
        const herSeen = new Set();
        const her = [];
        for (const p of [...pinnedHer, ...jewelry]) {
          const id = String(p.id);
          if (herSeen.has(id)) continue;
          herSeen.add(id);
          her.push(p);
          if (her.length >= 4) break;
        }
        // Admin-curated women's section wins when configured.
        setWomensProducts((cmsWomens.length ? cmsWomens : her).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero — video */}
      <section className="relative w-full lg:h-[calc(100svh-72px)] overflow-hidden">
        <video
          ref={videoRef}
          src="https://bulkproduct-images.s3.us-east-1.amazonaws.com/2411002/24110002/Raxer+Updated.mp4"
          className="w-full h-auto lg:h-full lg:object-cover block"
          autoPlay
          loop
          muted
          playsInline
        />
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          className="absolute bottom-6 right-6 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 active:scale-[0.95] hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        >
          {isMuted ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          )}
        </button>
      </section>

      {/* Bestsellers */}
      <section className="py-14 lg:py-24 px-6 sm:px-10 lg:px-16 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full">
        <motion.div
          className="flex flex-col items-center text-center gap-2.5 mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="font-sans text-[10px] tracking-[0.35em] uppercase font-semibold text-gold">
            Most Loved
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] text-ink font-light leading-none">
            Bestsellers
          </h2>
          <div style={{ width: '36px', height: '1.5px', background: '#CA8A04', marginTop: '4px' }} />
        </motion.div>

        <ProductGrid products={bestsellers} loading={loading} columns={4} />

        <div className="mt-10 text-center">
          <Link
            to="/bestsellers"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase border border-ink text-ink px-8 py-4 hover:bg-ink hover:text-white active:scale-[0.97] transition-all duration-300"
          >
            View All Bestsellers
          </Link>
        </div>
      </section>

      {/* RAXER banner */}
      <RaxerHero />

      {/* Men's grid */}
      <section className="py-12 lg:py-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full">
        <SectionHeader
          eyebrow="Men's Collection"
          title="Signature Timepieces"
          className="mb-12"
        />
        <ProductGrid products={mensProducts} loading={loading} columns={4} />
        <div className="mt-10 text-center">
          <Link
            to="/mens-all"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase border border-ink text-ink px-8 py-4 hover:bg-ink hover:text-white active:scale-[0.97] transition-all duration-300"
          >
            Shop All Men's →
          </Link>
        </div>
      </section>

      {/* Banner: Women's */}
      <section className="w-full relative">
        <img src={gearWatch} alt="LEGION 333 Swiss Made Diver Watch" loading="lazy" decoding="async" className="w-full h-auto block" />
        <motion.div
          className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-center"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div
            className="relative overflow-hidden cursor-pointer"
            style={{ background: '#0a0a0a', border: '1px solid #0a0a0a' }}
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            initial="rest"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none block"
              style={{ background: '#ffffff', transformOrigin: '0% 50%' }}
              variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            />
            <Link
              to="/product/241206026"
              className="relative z-10 inline-flex items-center justify-center font-sans font-semibold uppercase whitespace-nowrap"
              style={{ fontSize: 'clamp(8px, 1vw, 12px)', letterSpacing: '0.2em', padding: 'clamp(8px, 1vw, 14px) clamp(20px, 3vw, 48px)' }}
            >
              <motion.span
                variants={{ rest: { color: '#FFFFFF' }, hover: { color: '#0a0a0a' } }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                Shop Now
              </motion.span>
            </Link>
          </motion.div>
          <span className="uppercase mt-3" style={{
            fontFamily: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(22px, 4vw, 64px)',
            letterSpacing: '0.3em',
            display: 'block',
            transform: 'scaleX(1.04)',
            transformOrigin: 'center',
            color: '#e4bc7f',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.85)) drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
          }}>LEGION 333</span>
        </motion.div>
      </section>

      {/* Women's grid */}
      <section className="py-12 lg:py-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full">
        <SectionHeader
          eyebrow="Women's Collection"
          title="Crafted for Her"
          className="mb-12"
        />
        <ProductGrid products={womensProducts} loading={loading} columns={4} />
        <div className="mt-10 text-center">
          <Link
            to="/womens"
            className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase border border-ink text-ink px-8 py-4 hover:bg-ink hover:text-white active:scale-[0.97] transition-all duration-300"
          >
            Shop All Women's →
          </Link>
        </div>
      </section>

      {/* Banner: Golden Watch */}
      <section className="w-full relative">
        <img src={goldenWatch} alt="CS Beverly Hills Golden Timepiece" loading="lazy" decoding="async" className="w-full h-auto block" />
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2">
          <motion.div
            className="relative overflow-hidden cursor-pointer"
            style={{ background: '#ffffff', border: '1px solid #ffffff' }}
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            initial="rest"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none block"
              style={{ background: '#0a0a0a', transformOrigin: '0% 50%' }}
              variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            />
            <Link
              to="/product/241206019"
              className="relative z-10 inline-flex items-center justify-center font-sans font-semibold uppercase whitespace-nowrap"
              style={{ fontSize: 'clamp(8px, 1vw, 12px)', letterSpacing: '0.2em', padding: 'clamp(8px, 1vw, 14px) clamp(20px, 3vw, 48px)' }}
            >
              <motion.span
                variants={{ rest: { color: '#0a0a0a' }, hover: { color: '#FFFFFF' } }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                Shop Now
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Editorial 2×2: EL CAPITAN + EMPOWER */}
      <section className="w-full bg-white py-12 lg:py-16 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1290px] 2xl:max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2">

            {/* ① EL CAPITAN — top-left text */}
            <div className="flex flex-col items-center justify-center text-center gap-3 py-10 px-6 sm:aspect-[16/9] bg-bone">
              <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-steel">
                Swiss Made Timepieces
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-ink font-light leading-none">
                El Capitan
              </h2>
              <motion.div
                className="mt-1 relative overflow-hidden cursor-pointer"
                style={{ background: '#0d0d0d' }}
                whileHover="hover"
                whileTap={{ scale: 0.97 }}
                initial="rest"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none block"
                  style={{ background: '#ffffff', transformOrigin: '0% 50%' }}
                  variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                />
                <Link
                  to="/product/241126011"
                  className="relative z-10 inline-flex items-center justify-center font-sans text-[10px] font-semibold tracking-widest uppercase px-10 py-3"
                >
                  <motion.span
                    variants={{ rest: { color: '#FFFFFF' }, hover: { color: '#0d0d0d' } }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  >
                    Shop Now
                  </motion.span>
                </Link>
              </motion.div>
            </div>

            {/* ② El Capitan watch — top-right image */}
            <div className="sm:aspect-[16/9] overflow-hidden bg-[#EAE6E0]">
              <img
                src={heroMillion}
                alt="El Capitan Watch"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* ③ Empower watch — bottom-left image */}
            <div className="sm:aspect-[16/9] overflow-hidden bg-[#EDEAE5]">
              <img
                src={empowerWatch}
                alt="Empower Watch"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* ④ EMPOWER — bottom-right text */}
            <div className="flex flex-col items-center justify-center text-center gap-3 py-10 px-6 sm:aspect-[16/9] bg-bone">
              <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-steel">
                Swiss Made Timepieces
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-ink font-light leading-none">
                Empower
              </h2>
              <motion.div
                className="mt-1 relative overflow-hidden cursor-pointer"
                style={{ background: '#0d0d0d' }}
                whileHover="hover"
                whileTap={{ scale: 0.97 }}
                initial="rest"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none block"
                  style={{ background: '#ffffff', transformOrigin: '0% 50%' }}
                  variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                />
                <Link
                  to="/product/241126013"
                  className="relative z-10 inline-flex items-center justify-center font-sans text-[10px] font-semibold tracking-widest uppercase px-10 py-3"
                >
                  <motion.span
                    variants={{ rest: { color: '#FFFFFF' }, hover: { color: '#0d0d0d' } }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  >
                    Shop Now
                  </motion.span>
                </Link>
              </motion.div>
            </div>

          </div>
        </div>
      </section>



      {/* Giving back */}
      <section className="py-12 lg:py-20 px-6 sm:px-10 lg:px-16 max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">Give Back</span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink font-light leading-tight">
              Thanking the Giver in You
            </h2>
            <p className="font-sans text-sm text-steel leading-relaxed">
              Every CS Beverly Hills purchase contributes to meaningful causes through EVOKE Marketplace's give-back program — luxury that creates impact, at no extra cost.
            </p>
            <ul className="flex flex-col gap-3 mt-2">
              {['Complimentary gift with every order', 'Charitable donation per purchase', 'Verified giving through EVOKE', 'Free shipping on all US orders'].map(item => (
                <li key={item} className="flex items-center gap-3 font-sans text-sm text-steel">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase border border-ink text-ink px-7 py-3.5 hover:bg-ink hover:text-white active:scale-[0.97] transition-all duration-300 mt-2 self-start"
            >
              Our Story
            </Link>
          </motion.div>

          <motion.div
            className="aspect-square overflow-hidden"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={giftForYou}
              alt="Gift for you — with every purchase"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 lg:py-20 px-6 sm:px-10 lg:px-16 bg-bone">
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <SectionHeader
            eyebrow="Client Reviews"
            title="What They Say"
            subtitle="Trusted by collectors and connoisseurs across the country."
            className="mb-12"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTestimonials.slice(0, 3).map(t => (
              <motion.div
                key={t.id}
                className="bg-white border border-cloud p-6 flex flex-col gap-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45 }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#CA8A04" aria-hidden="true">
                      <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 8 3 9l1-3L1.5 4h3z"/>
                    </svg>
                  ))}
                </div>
                <p className="font-sans text-sm text-steel leading-relaxed">"{t.body}"</p>
                <div className="mt-auto">
                  <p className="font-sans text-xs text-ink font-medium">{t.name}</p>
                  <p className="font-sans text-[10px] text-mist">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="pt-12 lg:pt-20 pb-16 px-6 sm:px-10 bg-cream border-t border-cloud">
        <div className="max-w-xl mx-auto text-center flex flex-col gap-5">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">Stay Connected</span>
          <h2 className="font-display text-3xl sm:text-4xl text-ink font-light">First Access, Always</h2>
          <p className="font-sans text-sm text-steel">
            Subscribe for exclusive launches, limited edition drops, and members-only events.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 mt-2" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="Your email address"
              className="flex-1 bg-white border border-cloud text-ink font-sans text-sm px-4 py-3.5 placeholder:text-mist focus:outline-none focus:border-gold transition-colors"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="border border-ink text-ink font-sans text-[11px] font-semibold tracking-widest uppercase px-7 py-3.5 hover:bg-ink hover:text-white transition-all duration-300 active:scale-[0.97] whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="font-sans text-[10px] text-mist">No spam. Unsubscribe at any time.</p>
        </div>
      </section>
    </div>
  );
}

function CollectionBanner({ image, eyebrow, title, body, cta, align }) {
  const isRight = align === 'right';
  return (
    <section>
      {/* ── Mobile: stacked (image → text on solid bg) ── */}
      <div className="sm:hidden flex flex-col">
        <div className="w-full">
          <img src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" className="w-full h-auto block" />
        </div>
        <motion.div
          className="bg-cream px-6 py-8 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">{eyebrow}</span>
          <h2 className="font-display text-3xl text-ink font-light leading-tight">{title}</h2>
          <p className="font-sans text-[13px] text-steel leading-relaxed">{body}</p>
          <Link
            to={cta.to}
            className="inline-flex items-center gap-2 border border-ink text-ink font-sans text-[11px] font-semibold tracking-widest uppercase px-7 py-3.5 hover:bg-ink hover:text-white transition-all duration-300 active:scale-[0.97] self-start mt-1 min-h-[44px]"
          >
            {cta.label}
          </Link>
        </motion.div>
      </div>

      {/* ── Desktop: image with directional overlay ── */}
      <div className="relative hidden sm:block overflow-hidden min-h-[420px] lg:aspect-[21/9]">
        <img src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div
          className="absolute inset-0"
          style={{
            background: isRight
              ? 'linear-gradient(to left, rgba(0,0,0,0.82) 40%, rgba(0,0,0,0.08) 100%)'
              : 'linear-gradient(to right, rgba(0,0,0,0.82) 40%, rgba(0,0,0,0.08) 100%)',
          }}
        />
        <div className={`absolute inset-0 flex flex-col justify-center px-16 lg:px-24 ${isRight ? 'items-end text-right' : 'items-start text-left'}`}>
          <motion.div
            className="flex flex-col gap-4 max-w-md"
            initial={{ opacity: 0, x: isRight ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">{eyebrow}</span>
            <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl text-white font-light leading-[1.05]">{title}</h2>
            <p className="font-sans text-sm text-white/70 leading-relaxed">{body}</p>
            <Link
              to={cta.to}
              className="inline-flex items-center gap-2 border border-white text-white font-sans text-[11px] font-semibold tracking-widest uppercase px-7 py-3.5 hover:bg-white hover:text-ink transition-all duration-300 active:scale-[0.97] self-start mt-1 min-h-[44px]"
            >
              {cta.label}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
