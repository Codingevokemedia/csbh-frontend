import { Link } from 'react-router-dom';
import { logo, flagUSA } from '../../assets/index.js';

const CUSTOMER_CARE = [
  { label: 'Terms & Conditions',        to: '/terms' },
  { label: 'Privacy Policy',            to: '/privacy-policy' },
  { label: 'AI Content Disclosure',     to: '/ai-content-disclosure' },
  { label: 'Register Your Watch',       to: '/register-product' },
];

const DISCOVER = [
  { label: 'News',                      to: '/news' },
  { label: 'Press Release',             to: '/press-release' },
  { label: 'Peace Of Mind',             to: '/peace-of-mind' },
];

export default function Footer() {
  return (
    <footer className="bg-bone border-t border-cloud mt-auto">

      {/* Main columns */}
      <div className="max-w-[1600px] mx-auto w-full px-4 lg:px-10 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-10 divide-y sm:divide-y-0 sm:divide-x divide-cloud">

          {/* Brand */}
          <div className="flex flex-col gap-4 sm:pr-8 lg:pr-12">
            <Link to="/" aria-label="CS Beverly Hills">
              <img src={logo} alt="CS Beverly Hills" className="h-10 w-auto object-contain" />
            </Link>
            <p className="font-sans text-[12px] text-steel leading-relaxed">
              Craig Shelly Beverly Hills, Swiss Made Timepieces and Hand Made Jewelry in Los Angeles.
            </p>
            <div className="flex flex-col gap-1.5 mt-1">
              <p className="font-sans text-[12px] text-steel">Beverly Hills CA 90210</p>
              <a
                href="mailto:support@craigshelly.com"
                className="font-sans text-[12px] text-steel hover:text-ink transition-colors"
              >
                support@craigshelly.com
              </a>
              <a
                href="tel:5624721111"
                className="font-sans text-[12px] text-steel hover:text-ink transition-colors"
              >
                562-472-1111
              </a>
            </div>
          </div>

          {/* Customer care */}
          <div className="flex flex-col gap-4 sm:px-8 lg:px-12">
            <h3 className="font-sans text-[12px] font-semibold tracking-widest uppercase text-ink">
              Customer Care
            </h3>
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {CUSTOMER_CARE.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="font-sans text-[12px] text-steel hover:text-ink transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div className="flex flex-col gap-4 sm:pl-8 lg:pl-12">
            <h3 className="font-sans text-[12px] font-semibold tracking-widest uppercase text-ink">
              Discover
            </h3>
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {DISCOVER.map(item => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="font-sans text-[12px] text-steel hover:text-ink transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cloud">
        <div className="max-w-[1600px] mx-auto w-full px-4 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button className="flex items-center gap-1.5 font-sans text-[12px] text-steel hover:text-ink transition-colors">
            <img src={flagUSA} alt="US" className="w-5 h-3.5 object-cover" />
            <span>United States (USD $)</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>

          <p className="font-sans text-[12px] text-steel">Copyright &copy; 2025 CSBH</p>

          <div className="flex items-center gap-2">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 border border-cloud bg-white flex items-center justify-center text-steel hover:text-ink hover:border-steel transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 border border-cloud bg-white flex items-center justify-center text-steel hover:text-ink hover:border-steel transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
