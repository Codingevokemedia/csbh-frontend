import { motion } from 'framer-motion';

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignClass = {
    center: 'text-center items-center',
    left:   'text-left items-start',
    right:  'text-right items-end',
  }[align] || 'text-center items-center';

  return (
    <motion.div
      className={`flex flex-col gap-3 ${alignClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {eyebrow && (
        <span className="text-[10px] tracking-[0.25em] uppercase font-sans font-semibold text-gold">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-light leading-[1.08] text-ink text-4xl sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans font-light text-sm leading-relaxed max-w-xl text-steel">
          {subtitle}
        </p>
      )}
      <motion.div
        className="h-px bg-gold"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ width: '48px', transformOrigin: align === 'center' ? 'center' : 'left' }}
      />
    </motion.div>
  );
}
