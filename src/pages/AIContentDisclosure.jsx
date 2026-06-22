const SECTIONS = [
  {
    title: 'Use of AI in Creative Content',
    body: 'Certain imagery, campaign visuals, and lifestyle scenes presented across our website, marketing materials, and social media platforms may be digitally generated, enhanced, or assisted using artificial intelligence technologies. These tools are used to support creative direction, elevate visual composition, and bring conceptual storytelling to life.',
  },
  {
    title: 'Video and Motion Content',
    body: 'Some promotional videos and digital campaigns may include AI-generated or AI-enhanced elements. These may be used for illustrative, conceptual, or artistic purposes to support brand storytelling and campaign development.',
  },
  {
    title: 'Authenticity & Representation',
    body: 'While AI-assisted tools may be used in production, all product representations are designed to remain faithful to the craftsmanship, design intent, and luxury standards of Craig Shelly Beverly Hills. Physical products always reflect their true materials, quality, and finish.',
  },
  {
    title: 'Commitment to Transparency',
    body: 'We are committed to maintaining transparency in the use of emerging technologies while preserving the integrity, craftsmanship, and luxury identity of the Craig Shelly Beverly Hills brand.',
  },
];

export default function AIContentDisclosure() {
  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-12">
      <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-8">AI CONTENT DISCLOSURE</h1>

      <p className="font-sans text-sm text-steel leading-relaxed mb-8">
        Craig Shelly Beverly Hills embraces innovation in modern visual storytelling, including the use of advanced
        digital tools and artificial intelligence technologies in select creative productions.
      </p>

      <div className="flex flex-col gap-8">
        {SECTIONS.map(s => (
          <section key={s.title}>
            <h2 className="font-sans text-[13px] font-bold text-ink mb-2">{s.title}</h2>
            <p className="font-sans text-sm text-steel leading-relaxed whitespace-pre-line">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
