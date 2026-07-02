import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Canonical from './components/seo/Canonical.jsx';
import RequireAdmin from './components/admin/RequireAdmin.jsx';

// Home is the landing route: keep it eager so the first paint needs no extra
// chunk round-trip. Every other route is lazy-loaded, so it no longer ships in
// the initial JS bundle and is only fetched when the user navigates there.
import Home                   from './pages/Home.jsx';

const MensAll                = lazy(() => import('./pages/MensAll.jsx'));
const MensWatches            = lazy(() => import('./pages/MensWatches.jsx'));
const MensCufflinks          = lazy(() => import('./pages/MensCufflinks.jsx'));
const WomensWatches          = lazy(() => import('./pages/WomensWatches.jsx'));
const WomensWatchesOnly      = lazy(() => import('./pages/WomensWatchesOnly.jsx'));
const WomensJewelry          = lazy(() => import('./pages/WomensJewelry.jsx'));
const NewArrivals            = lazy(() => import('./pages/NewArrivals.jsx'));
const Bestsellers            = lazy(() => import('./pages/Bestsellers.jsx'));
const LimitedEditions        = lazy(() => import('./pages/LimitedEditions.jsx'));
const ProductDetail          = lazy(() => import('./pages/ProductDetail.jsx'));
const AllProducts            = lazy(() => import('./pages/AllProducts.jsx'));
const CollectionPage         = lazy(() => import('./pages/CollectionPage.jsx'));
const About                  = lazy(() => import('./pages/About.jsx'));
const Contact                = lazy(() => import('./pages/Contact.jsx'));
const Testimonials           = lazy(() => import('./pages/Testimonials.jsx'));
const PrivacyPolicy          = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const Terms                  = lazy(() => import('./pages/Terms.jsx'));
const ProductRegistration    = lazy(() => import('./pages/ProductRegistration.jsx'));
const AmbassadorProgram      = lazy(() => import('./pages/AmbassadorProgram.jsx'));
const CorporatePartnerProgram = lazy(() => import('./pages/CorporatePartnerProgram.jsx'));
const News                   = lazy(() => import('./pages/News.jsx'));
const PressRelease           = lazy(() => import('./pages/PressRelease.jsx'));
const PeaceOfMind            = lazy(() => import('./pages/PeaceOfMind.jsx'));
const CartBridge             = lazy(() => import('./pages/CartBridge.jsx'));
const AIContentDisclosure    = lazy(() => import('./pages/AIContentDisclosure.jsx'));
const Auth                   = lazy(() => import('./pages/Auth.jsx'));
const AdminLogin             = lazy(() => import('./pages/admin/AdminLogin.jsx'));
const HomepageProductsAdmin  = lazy(() => import('./pages/admin/HomepageProductsAdmin.jsx'));

// Invisible fallback that only reserves vertical space while a route chunk loads.
// Navbar + Footer stay mounted (they live in Layout, outside <Routes>), so this
// never flashes a spinner or shifts the chrome.
function RouteFallback() {
  return <div className="min-h-[70svh]" aria-hidden="true" />;
}

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
              <Canonical />
              <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/"                          element={<Home />} />
                <Route path="/mens-all"                  element={<MensAll />} />
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
                <Route path="/admin/login"               element={<AdminLogin />} />
                <Route path="/admin/homepage-products"   element={<RequireAdmin><HomepageProductsAdmin /></RequireAdmin>} />
                <Route path="*"                          element={<NotFound />} />
              </Routes>
              </Suspense>
            </Layout>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
