import { Link } from 'react-router-dom';

export default function AmbassadorProgram() {
  return (
    <div className="max-w-[860px] mx-auto px-6 sm:px-10 py-12">
      <h1 className="font-sans text-xl font-bold text-ink text-center tracking-wide mb-1 underline">
        THE AMBASSADOR PROGRAM:
      </h1>
      <div className="w-full h-px bg-cloud my-6" />

      <section className="mb-8">
        <h2 className="font-sans text-base font-bold text-ink mb-3">THE AMBASSADOR PROGRAM:</h2>
        <p className="font-sans text-sm text-steel leading-relaxed mb-3">
          Joining the CS Beverly Hills Ambassador Program is an invitation-only opportunity reserved for individuals
          who embody excellence, influence, and purpose. Whether you are a coach, entrepreneur, executive, or public
          figure — if you appreciate quality and believe in the power of meaningful connections, this program was
          designed for you.
        </p>
        <p className="font-sans text-sm text-steel leading-relaxed mb-3">
          Our Ambassadors gain exclusive access to elite networking events, mastermind communities, and a curated
          circle of high-achieving professionals. From industry summits to private clubs, you will be in rooms where
          opportunities are created — not waited for.
        </p>
        <p className="font-sans text-sm text-steel leading-relaxed mb-3">
          As an Ambassador, you also become a champion of a brand that is driven by purpose. With every timepiece
          purchased through your affiliate link, a portion directly supports meaningful charitable initiatives —
          including children's education, veterans' care, and health-focused nonprofits. Luxury that gives back.
        </p>
        <p className="font-sans text-sm text-steel leading-relaxed">
          Take pride in representing a brand where every second counts — in the watch you wear and the impact you
          create in the world.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans text-base font-bold text-ink mb-3">HOW DOES IT WORK?</h2>
        <p className="font-sans text-sm text-steel leading-relaxed mb-3">
          Applying is straightforward. Submit your application through the form below. Our team reviews all
          applications within 24–48 hours. Once approved, you will receive a welcome package that includes branded
          materials, your unique affiliate tracking link, and access to our ambassador dashboard.
        </p>
        <p className="font-sans text-sm text-steel leading-relaxed">
          Every time a customer purchases through your link, you earn a commission — up to 20% on qualifying sales.
          Your dashboard tracks all activity in real time, giving you full visibility into traffic, conversions, and
          earnings. You can request a payout at any time once your balance reaches the minimum threshold.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans text-base font-bold text-ink mb-3">REAL-TIME STATISTICS AND REPORTING!</h2>
        <p className="font-sans text-sm text-steel leading-relaxed">
          Your Ambassador dashboard is available 24/7. Monitor your traffic, sales performance, commission balance,
          and affiliate link activity from any device. We believe transparency builds trust — so you always have a
          clear and accurate picture of your results. Set goals, track progress, and grow your income with data you
          can rely on.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-sans text-base font-bold text-ink mb-3">GET STARTED TODAY!</h2>
        <p className="font-sans text-sm text-steel leading-relaxed mb-3">
          Ready to join one of the most prestigious ambassador programs in the luxury watch space? Sign in to your
          CS Beverly Hills account and apply directly from your dashboard. If you are new, create a free account
          below to get started.
        </p>
        <p className="font-sans text-xs text-mist mb-6">
          Conditions apply. Each applicant may only enroll in one program. Purchasing a timepiece does not
          automatically enroll you into the Ambassador Program. All applications are subject to review and approval.
        </p>

        <div className="max-w-sm">
          <Link
            to="/auth"
            className="block w-full py-4 font-sans text-[13px] font-semibold tracking-widest uppercase border border-ink text-ink text-center mb-4 hover:bg-ink hover:text-white transition-all duration-300 active:scale-[0.97]"
          >
            LOGIN
          </Link>
          <p className="font-sans text-sm text-center text-steel">
            Don't have an account?{' '}
            <Link to="/auth" className="text-steel underline hover:text-ink">Create one</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
