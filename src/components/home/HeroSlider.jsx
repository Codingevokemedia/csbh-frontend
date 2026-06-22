import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { heroRaxer, heroBanner, heroMillion } from '../../assets/index.js';

const SLIDES = [
  {
    id: 'slide_1',
    image:    heroRaxer,
    eyebrow:  'New Arrival',
    title:    'RAXER\nMidnight',
    subtitle: 'Precision engineering meets Beverly Hills elegance. Swiss automatic. 72-hour reserve.',
    cta1:     { label: 'Shop Now',       to: '/product/raxer-midnight' },
    cta2:     { label: "Men's Watches",  to: '/mens' },
    align:    'left',
  },
  {
    id: 'slide_2',
    image:    heroBanner,
    eyebrow:  'Signature Collection',
    title:    'El Presidente\nGold',
    subtitle: '18k gold bezel. Perpetual calendar. 250 pieces worldwide. Authority in every detail.',
    cta1:     { label: 'Discover',          to: '/product/el-presidente-gold' },
    cta2:     { label: 'Limited Editions',  to: '/limited-editions' },
    align:    'right',
  },
  {
    id: 'slide_3',
    image:    heroMillion,
    eyebrow:  'Million Dollar Mile',
    title:    'Where Ambition\nMeets Time',
    subtitle: 'Every purchase gives back. A charitable donation is made on your behalf with each order.',
    cta1:     { label: 'Explore All',   to: '/mens' },
    cta2:     { label: 'New Arrivals',  to: '/new-arrivals' },
    align:    'center',
  },
];

const SLIDE_DURATION = 6000;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent(c => (c + 1) % SLIDES.length);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goTo = useCallback((idx) => {
    setCurrent(prev => {
      setDirection(idx > prev ? 1 : -1);
      return idx;
    });
    startTimer();
  }, [startTimer]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length);
    startTimer();
  }, [startTimer]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % SLIDES.length);
    startTimer();
  }, [startTimer]);

  const slide = SLIDES[current];

  return (
    <section className="w-full" aria-label="Featured collection">

      {/* ── MOBILE: stacked layout with fixed-height containers so nothing shifts during transitions ── */}
      <div className="sm:hidden flex flex-col">

        {/* Image: aspect-ratio container keeps height stable; images crossfade absolutely inside */}
        <div className="relative w-full aspect-[3/4] bg-black overflow-hidden">
          <AnimatePresence initial={false} mode="sync">
            <motion.img
              key={`mob-img-${slide.id}`}
              src={slide.image}
              alt=""
              aria-hidden="true"
              loading="eager"
              className="absolute inset-0 w-full h-full object-cover object-top"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
        </div>

        {/* Text: normal flow, no absolute positioning — image crossfade signals the slide change */}
        <div className="bg-[#111010] px-5 pt-6 pb-5 flex flex-col gap-2.5">
          <span className="font-sans text-[9px] tracking-[0.3em] uppercase font-semibold" style={{ color: '#C9A84C' }}>
            {slide.eyebrow}
          </span>
          <h1 className="font-display text-[1.75rem] font-light leading-[1.05] whitespace-pre-line text-white">
            {slide.title}
          </h1>
          <p className="font-sans text-[13px] text-white/65 leading-relaxed">
            {slide.subtitle}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to={slide.cta1.to}
              className="inline-flex items-center justify-center font-sans text-[10px] font-semibold tracking-widest uppercase px-5 py-3 min-h-[44px] border border-white text-white bg-transparent hover:bg-white hover:text-ink active:scale-[0.97] transition-all duration-300"
            >
              {slide.cta1.label}
            </Link>
            <Link
              to={slide.cta2.to}
              className="inline-flex items-center justify-center font-sans text-[10px] font-semibold tracking-widest uppercase px-5 py-3 min-h-[44px] border border-white/40 text-white/70 bg-transparent hover:border-white hover:text-white active:scale-[0.97] transition-all duration-300"
            >
              {slide.cta2.label}
            </Link>
          </div>
        </div>

        {/* Dots + progress: always stable, never inside AnimatePresence */}
        <div className="bg-[#111010] px-5 pb-4 flex flex-col gap-3">
          <div className="flex items-center gap-1">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="p-0 border-none bg-transparent cursor-pointer leading-none"
              >
                <span
                  className="block transition-all duration-300"
                  style={{ width: '22px', height: '2px', backgroundColor: i === current ? '#FFFFFF' : 'rgba(255,255,255,0.25)' }}
                />
              </button>
            ))}
          </div>
          <div className="h-[2px] bg-white/10">
            <motion.div
              className="h-full"
              key={`mob-progress-${current}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
              style={{ transformOrigin: 'left', backgroundColor: '#C9A84C' }}
            />
          </div>
        </div>
      </div>

      {/* ── DESKTOP: full-bleed overlay ── */}
      <div className="hidden sm:block relative h-[88dvh] min-h-[560px] overflow-hidden bg-black">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0"
              style={{
                background: slide.align === 'right'
                  ? 'linear-gradient(to left, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.25) 100%)'
                  : slide.align === 'center'
                  ? 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)'
                  : 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.25) 100%)',
              }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-10 lg:px-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={`desk-content-${slide.id}`}
              className={`flex flex-col gap-5 max-w-xl ${
                slide.align === 'center' ? 'mx-auto text-center' : 'text-left'
              } ${slide.align === 'right' ? 'ml-auto text-right' : ''}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: '#C9A84C' }}>
                {slide.eyebrow}
              </span>
              <h1
                className="font-display text-5xl lg:text-7xl xl:text-8xl font-light leading-[0.95] whitespace-pre-line"
                style={{ color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
              >
                {slide.title}
              </h1>
              <p
                className="font-sans text-sm leading-relaxed max-w-sm"
                style={{
                  color: 'rgba(255,255,255,0.88)',
                  textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                  marginLeft: slide.align === 'center' ? 'auto' : undefined,
                  marginRight: slide.align === 'center' ? 'auto' : undefined,
                }}
              >
                {slide.subtitle}
              </p>
              <div className={`flex flex-row gap-3 mt-1 ${
                slide.align === 'center' ? 'justify-center' : 'items-start'
              } ${slide.align === 'right' ? 'justify-end' : ''}`}>
                <Link
                  to={slide.cta1.to}
                  className="inline-flex items-center justify-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-7 py-4 active:scale-[0.97] transition-all duration-300 min-h-[44px] border border-white text-white bg-transparent hover:bg-white hover:text-ink"
                >
                  {slide.cta1.label}
                </Link>
                <Link
                  to={slide.cta2.to}
                  className="inline-flex items-center justify-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-7 py-4 active:scale-[0.97] transition-all duration-300 min-h-[44px] border border-white/70 text-white bg-transparent hover:border-white hover:bg-white hover:text-ink"
                >
                  {slide.cta2.label}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center" style={{ gap: '3px' }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', lineHeight: 0 }}
            >
              <span
                className="block transition-all duration-300"
                style={{ width: '22px', height: '2px', backgroundColor: i === current ? '#FFFFFF' : 'rgba(255,255,255,0.30)' }}
              />
            </button>
          ))}
        </div>

        {/* Prev/Next arrows */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center transition-all duration-200 bg-black/30 backdrop-blur-sm text-white hover:bg-black/60"
          style={{ border: '1px solid rgba(255,255,255,0.35)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full items-center justify-center transition-all duration-200 bg-black/30 backdrop-blur-sm text-white hover:bg-black/60"
          style={{ border: '1px solid rgba(255,255,255,0.35)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <motion.div
            className="h-full"
            key={`desk-progress-${current}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left', backgroundColor: '#C9A84C' }}
          />
        </div>
      </div>
    </section>
  );
}
