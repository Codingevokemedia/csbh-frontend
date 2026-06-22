const FEATURES = [
  {
    title: 'Two-Year Manufacturer Warranty',
    body: 'Every CS Beverly Hills timepiece is covered by a comprehensive two-year manufacturer warranty from the date of original purchase. This warranty protects against defects in materials and workmanship under normal use and care. Our warranty is honored globally at our authorized service centers.',
  },
  {
    title: 'Free Servicing in Year One',
    body: 'Within the first 12 months of ownership, we cover one complete inspection and service at no charge. This includes a pressure test, movement cleaning, case polishing, and strap replacement if required. We want your watch to feel as perfect at 12 months as it did on day one.',
  },
  {
    title: 'Product Registration',
    body: 'Register your timepiece on our website within 30 days of purchase to activate your warranty and gain access to exclusive owner benefits. Registered owners receive priority customer service, early access to new collections, and notifications about limited-edition releases.',
  },
  {
    title: 'Swiss-Certified Movements',
    body: 'Each watch houses a certified Swiss movement, carefully selected and tested for accuracy, reliability, and longevity. Our movements meet the strict criteria of Swiss horological standards — so the heart of your timepiece is built to last generations.',
  },
  {
    title: 'Secure and Insured Shipping',
    body: 'Every order is shipped in luxury packaging with full insurance up to the declared retail value of the product. A signature is required upon delivery for all orders above $500. If your package arrives damaged, contact us within 48 hours and we will arrange a replacement or full refund at no cost.',
  },
  {
    title: '30-Day Return Promise',
    body: 'If for any reason your timepiece does not meet your expectations, return it within 30 days of delivery for a full refund or exchange. The item must be in original, unworn condition with all original packaging and documentation included. We make returns straightforward — because you should shop with complete confidence.',
  },
];

export default function PeaceOfMind() {
  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-12">
      <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-4">PEACE OF MIND</h1>
      <p className="font-sans text-sm text-steel text-center leading-relaxed mb-10 max-w-xl mx-auto">
        When you invest in a CS Beverly Hills timepiece, you are investing with absolute confidence. Every aspect of
        your ownership experience — from purchase to service — is designed to give you complete peace of mind.
      </p>

      <div className="grid sm:grid-cols-2 gap-8">
        {FEATURES.map(f => (
          <div key={f.title} className="border border-cloud p-6">
            <h2 className="font-sans text-[13px] font-bold text-ink mb-3">{f.title}</h2>
            <p className="font-sans text-sm text-steel leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="font-sans text-sm text-steel mb-4">
          Have a question about your warranty, a return, or your registered product?
        </p>
        <a
          href="mailto:support@craigshelly.com"
          className="inline-block px-10 py-4 font-sans text-[13px] font-semibold tracking-widest uppercase border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-300 active:scale-[0.97]"
        >
          CONTACT CONCIERGE
        </a>
      </div>
    </div>
  );
}
