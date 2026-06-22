export default function Testimonials() {
  const videos = [
    { id: 1, label: 'Partner Testimonial 1' },
    { id: 2, label: 'Partner Testimonial 2' },
    { id: 3, label: 'Partner Testimonial 3' },
    { id: 4, label: 'Partner Testimonial 4' },
  ];

  return (
    <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-6 sm:px-10 py-12">
      <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-6">
        OUR PARTNERS TESTIMONIALS
      </h1>
      <div className="w-full h-px bg-cloud mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map(v => (
          <div
            key={v.id}
            className="relative aspect-video bg-pearl border border-cloud flex items-center justify-center cursor-pointer group"
            role="button"
            aria-label={`Play ${v.label}`}
            tabIndex={0}
          >
            {/* Play button */}
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors shadow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9.5" stroke="#9695A1" strokeWidth="1"/>
                <path d="M8 7l6 3-6 3V7z" fill="#9695A1"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
