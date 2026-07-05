import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle: string;
  image?: string | null;
}

const PageHero = ({ title, subtitle, image }: PageHeroProps) => (
  <section className="relative h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden">
    {image ? (
      <img src={image} alt={title} fetchpriority="high" loading="eager" decoding="sync" className="absolute inset-0 w-full h-full object-cover" />
    ) : (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.35),transparent_55%),radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.25),transparent_52%),linear-gradient(135deg,hsl(var(--foreground))_0%,hsl(var(--primary))_45%,hsl(var(--accent))_100%)]" />
    )}
    <div className="absolute inset-0 hero-overlay opacity-80" />
    <div className="relative z-10 text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-primary-foreground/80 text-lg max-w-2xl mx-auto"
      >
        {subtitle}
      </motion.p>
    </div>
  </section>
);

export default PageHero;
