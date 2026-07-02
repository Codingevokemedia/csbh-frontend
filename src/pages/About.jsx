import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import { heroBanner } from "../assets/index.js";

const values = [
  {
    title: "Curation",
    body: "We source only the finest timepieces, vetted through decades of collector relationships and horological expertise.",
  },
  {
    title: "Authenticity",
    body: "Every piece is certified genuine. Certificate of authenticity, numbered seal, and brand passport included as standard.",
  },
  {
    title: "Service",
    body: "White-glove concierge from discovery to delivery. Our team of watch specialists is available to advise on every purchase.",
  },
  {
    title: "Legacy",
    body: "We believe great timepieces transcend generations. Our clients become collectors, and collectors become connoisseurs.",
  },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={heroBanner}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-4 text-center px-6">
          <motion.span
            className="font-sans text-[10px] tracking-[0.35em] uppercase text-gold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Story
          </motion.span>
          <motion.h1
            className="font-display text-5xl sm:text-7xl text-white font-light leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            CS Beverly Hills
          </motion.h1>
          <motion.p
            className="font-sans text-sm text-white/70 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Born in Los Angeles. Refined for the world.
          </motion.p>
        </div>
      </div>

      {/* Intro */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-[900px] mx-auto">
        <motion.div
          className="flex flex-col gap-6 text-center items-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">
            Since 2011
          </span>
          <h2 className="font-display text-4xl sm:text-5xl text-ink font-light leading-tight">
            The Standard for Luxury Timepieces
          </h2>
          <p className="font-sans text-sm text-steel leading-loose max-w-2xl">
            CS Beverly Hills was founded with a singular vision: to bring the
            world's most extraordinary timepieces to collectors who demand more
            than a watch. We are curators, historians, and enthusiasts who
            believe that a truly great timepiece is never merely worn — it is
            experienced.
          </p>
          <p className="font-sans text-sm text-steel leading-loose max-w-2xl">
            Every movement is sourced from Switzerland's finest manufacturers.
            Every dial tells a story. Every case holds a legacy. Our Beverly
            Hills showroom and EVOKE Marketplace presence ensure that wherever
            you are, the world's finest horology is within reach.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-bone border-y border-cloud py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
          <SectionHeader
            eyebrow="What Drives Us"
            title="Our Values"
            className="mb-14"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                className="bg-white border border-cloud p-8 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <div className="w-8 h-px bg-gold" />
                <h3 className="font-display text-2xl text-ink font-light">
                  {v.title}
                </h3>
                <p className="font-sans text-sm text-steel leading-relaxed">
                  {v.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EVOKE partnership */}
      <section className="bg-bone border-t border-cloud py-16 px-6 sm:px-10">
        <div className="max-w-[700px] mx-auto text-center flex flex-col items-center gap-5">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold">
            Our Platform
          </span>
          <h2 className="font-display text-4xl text-ink font-light">
            Powered by EVOKE Marketplace
          </h2>
          <p className="font-sans text-sm text-steel leading-relaxed">
            CS Beverly Hills operates exclusively through EVOKE Marketplace,
            ensuring every transaction is secure, every product is
            authenticated, and every purchase creates a positive impact through
            our integrated give-back program.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 border border-ink text-ink font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 hover:bg-ink hover:text-white active:scale-[0.97] transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
