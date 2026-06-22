import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import Layout from './components/layout/Layout.jsx';

import Home                   from './pages/Home.jsx';
import MensWatches            from './pages/MensWatches.jsx';
import MensCufflinks          from './pages/MensCufflinks.jsx';
import WomensWatches          from './pages/WomensWatches.jsx';
import WomensWatchesOnly      from './pages/WomensWatchesOnly.jsx';
import WomensJewelry          from './pages/WomensJewelry.jsx';
import NewArrivals            from './pages/NewArrivals.jsx';
import Bestsellers            from './pages/Bestsellers.jsx';
import LimitedEditions        from './pages/LimitedEditions.jsx';
import ProductDetail          from './pages/ProductDetail.jsx';
import AllProducts            from './pages/AllProducts.jsx';
import CollectionPage         from './pages/CollectionPage.jsx';
import About                  from './pages/About.jsx';
import Contact                from './pages/Contact.jsx';
import Testimonials           from './pages/Testimonials.jsx';
import PrivacyPolicy          from './pages/PrivacyPolicy.jsx';
import Terms                  from './pages/Terms.jsx';
import ProductRegistration    from './pages/ProductRegistration.jsx';
import AmbassadorProgram      from './pages/AmbassadorProgram.jsx';
import CorporatePartnerProgram from './pages/CorporatePartnerProgram.jsx';
import News                   from './pages/News.jsx';
import PressRelease           from './pages/PressRelease.jsx';
import PeaceOfMind            from './pages/PeaceOfMind.jsx';
import CartBridge             from './pages/CartBridge.jsx';
import AIContentDisclosure    from './pages/AIContentDisclosure.jsx';
import Auth                   from './pages/Auth.jsx';

function NotFound() {
  return (
    <div className="min-h-[70svh] bg-cream flex flex-col items-center justify-center gap-5 text-center px-6">
      <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">404</span>
      <h1 className="font-display text-5xl text-ink font-light">Page Not Found</h1>
      <p className="font-sans text-sm text-steel">The page you are looking for does not exist or has moved.</p>
      <a href="/" className="inline-flex items-center border border-ink text-ink font-sans text-[11px] font-semibold tracking-widest uppercase px-7 py-3.5 hover:bg-ink hover:text-white transition-all duration-300 mt-2 active:scale-[0.97]">
        Return Home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Layout>
              <ScrollToTop />
              <Routes>
                <Route path="/"                          element={<Home />} />
                <Route path="/mens"                      element={<MensWatches />} />
                <Route path="/mens-cufflinks"            element={<MensCufflinks />} />
                <Route path="/womens"                    element={<WomensWatches />} />
                <Route path="/womens-watches"            element={<WomensWatchesOnly />} />
                <Route path="/womens-jewelry"            element={<WomensJewelry />} />
                <Route path="/new-arrivals"              element={<NewArrivals />} />
                <Route path="/bestsellers"               element={<Bestsellers />} />
                <Route path="/limited-editions"          element={<LimitedEditions />} />
                <Route path="/all-products"              element={<AllProducts />} />
                <Route path="/product/:slug"             element={<ProductDetail />} />
                <Route path="/collection/:slug"          element={<CollectionPage />} />
                <Route path="/collections/:collectionSlug" element={<CollectionPage />} />
                <Route path="/about"                     element={<About />} />
                <Route path="/contact"                   element={<Contact />} />
                <Route path="/our-partners-testimonials" element={<Testimonials />} />
                <Route path="/testimonials"              element={<Testimonials />} />
                <Route path="/privacy-policy"            element={<PrivacyPolicy />} />
                <Route path="/terms"                     element={<Terms />} />
                <Route path="/register-product"          element={<ProductRegistration />} />
                <Route path="/ambassador-program"        element={<AmbassadorProgram />} />
                <Route path="/corporate-partner-program" element={<CorporatePartnerProgram />} />
                <Route path="/news"                      element={<News />} />
                <Route path="/press-release"             element={<PressRelease />} />
                <Route path="/peace-of-mind"             element={<PeaceOfMind />} />
                <Route path="/ai-content-disclosure"     element={<AIContentDisclosure />} />
                <Route path="/cart-bridge"               element={<CartBridge />} />
                <Route path="/auth"                      element={<Auth />} />
                <Route path="*"                          element={<NotFound />} />
              </Routes>
            </Layout>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
