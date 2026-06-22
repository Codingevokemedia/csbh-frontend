import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { heroRaxer } from '../../assets/index.js';

export default function RaxerHero() {
  return (
    <section className="relative w-full">
      <img
        src={heroRaxer}
        alt="RAXER Swiss Made Timepiece"
        className="w-full h-auto block"
        loading="eager"
        fetchPriority="high"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.08)' }}
      />

      <motion.div
        className="absolute bottom-[8%] left-[3%] sm:left-[5%]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
      >
        <div
          className="flex flex-col items-center gap-3 text-center"
          style={{
            width: 'clamp(150px, 22vw, 340px)',
            padding: 'clamp(10px, 1.8vw, 26px)',
            background: 'rgba(200, 200, 200, 0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span
            className="font-sans font-light w-full"
            style={{
              fontSize: 'clamp(7px, 0.9vw, 12px)',
              color: 'rgba(255, 255, 255, 0.75)',
              letterSpacing: '0.04em',
            }}
          >
            Swiss made timepieces
          </span>

          <h1
            className="font-display font-bold leading-none uppercase w-full"
            style={{
              fontSize: 'clamp(14px, 3vw, 48px)',
              letterSpacing: '0.08em',
              color: '#FFFFFF',
            }}
          >
            RAXER
          </h1>

          {/* Wipe-fill: white slides in from left on hover, text inverts to dark */}
          <motion.div
            className="w-full relative overflow-hidden cursor-pointer"
            style={{ background: '#0a0a0a', border: '1px solid #0a0a0a' }}
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            initial="rest"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none block"
              style={{ background: '#ffffff', transformOrigin: '0% 50%' }}
              variants={{
                rest: { scaleX: 0 },
                hover: { scaleX: 1 },
              }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            />
            <Link
              to="/product/251010004"
              className="relative z-10 w-full inline-flex items-center justify-center font-sans font-semibold uppercase"
              style={{
                fontSize: 'clamp(7px, 0.85vw, 11px)',
                letterSpacing: '0.18em',
                padding: 'clamp(7px, 0.9vw, 13px) 0',
                minHeight: '0',
              }}
            >
              <motion.span
                variants={{
                  rest: { color: '#FFFFFF' },
                  hover: { color: '#0a0a0a' },
                }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                SHOP NOW
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
