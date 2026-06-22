const RELEASES = [
  {
    date: "December 2, 2025",
    title: "CS Beverly Hills Unveils the LEGION 333 Collection",
    body: "Beverly Hills, CA — CS Beverly Hills today announced the official launch of the LEGION 333 Collection, a limited-edition series of hand-assembled Swiss timepieces created to honor service, sacrifice, and brotherhood. Each piece in the collection is individually numbered and accompanied by a certificate of authenticity. Only 333 units will be produced worldwide.",
  },
  {
    date: "October 14, 2025",
    title: "Craig Shelly Named Among Top Philanthropic Luxury Brands",
    body: "Beverly Hills, CA — Craig Shelly Beverly Hills has been recognized as one of the most philanthropically driven luxury brands of 2025. The brand was highlighted for its Give Back Initiative, through which a portion of every sale is directed to veterans organizations, children health nonprofits, and educational foundations across the United States.",
  },
  {
    date: "August 8, 2025",
    title: "Shriners 100 Years Anniversary Collection Now Available",
    body: "Beverly Hills, CA — CS Beverly Hills proudly announces the launch of the Shriners 100 Years Anniversary Collection, an exclusive line created to commemorate a century of Shriners International impact on children healthcare. The collection features hand-engraved case backs and a portion of every sale benefits the Shriners Hospitals for Children network.",
  },
];

export default function PressRelease() {
  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-12">
      <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-8">PRESS RELEASE</h1>

      <div className="flex flex-col gap-10">
        {RELEASES.map((r, i) => (
          <article key={i} className="border-b border-cloud pb-10 last:border-none">
            <p className="font-sans text-[11px] text-mist mb-2">{r.date}</p>
            <h2 className="font-sans text-[15px] font-semibold text-ink mb-4 leading-snug">{r.title}</h2>
            <p className="font-sans text-sm text-steel leading-relaxed">{r.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 p-6 bg-cream border border-cloud">
        <p className="font-sans text-[13px] font-semibold text-ink mb-1">MEDIA INQUIRIES</p>
        <p className="font-sans text-sm text-steel">
          For press and media enquiries, please contact us at{' '}
          <a href="mailto:support@craigshelly.com" className="underline hover:text-ink">
            support@craigshelly.com
          </a>{' '}
          or call 562-472-1111. Our communications team responds to all media requests within one business day.
        </p>
      </div>
    </div>
  );
}
