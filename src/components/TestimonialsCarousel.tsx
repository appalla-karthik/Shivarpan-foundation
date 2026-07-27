import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export interface TestimonialCarouselItem {
  quote: string;
  name: string;
  role: string;
  tag: string;
  monogram: string;
  glow: string;
  photoUrl?: string;
  media: {
    url: string;
    media_type?: string;
    title?: string;
    alt_text?: string;
  } | null;
  isVideoReview: boolean;
}

interface TestimonialsCarouselProps {
  items: TestimonialCarouselItem[];
}

const AUTOPLAY_INTERVAL_MS = 4500;

const TestimonialsCarousel = ({ items }: TestimonialsCarouselProps) => {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: safeItems.length > 1,
    slidesToScroll: 1,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const reduceMotion = useReducedMotion();
  const isPaused = isHovered || isFocused || isVideoPlaying || reduceMotion;

  const updateCarouselState = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setSnapCount(emblaApi.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateCarouselState();
    emblaApi.on("select", updateCarouselState);
    emblaApi.on("reInit", updateCarouselState);

    return () => {
      emblaApi.off("select", updateCarouselState);
      emblaApi.off("reInit", updateCarouselState);
    };
  }, [emblaApi, updateCarouselState]);

  useEffect(() => {
    if (!emblaApi || isPaused || snapCount <= 1) return;

    const timerId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        emblaApi.scrollNext();
      }
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [emblaApi, isPaused, snapCount]);

  const progressLabel = useMemo(
    () =>
      `${String(selectedIndex + 1).padStart(2, "0")} / ${String(
        Math.max(snapCount, 1),
      ).padStart(2, "0")}`,
    [selectedIndex, snapCount],
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
    >
      <div ref={viewportRef} className="overflow-hidden" aria-roledescription="carousel">
        <div className="flex gap-5">
          {safeItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-0.625rem)] lg:flex-[0_0_calc(33.333%-0.875rem)] xl:flex-[0_0_calc(25%-0.9375rem)]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${safeItems.length}`}
            >
              <motion.article
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 230, damping: 22 }}
                className="group relative flex h-full min-h-[27rem] flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-[0_28px_70px_-55px_hsl(var(--foreground))]"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="relative aspect-video shrink-0 overflow-hidden bg-foreground/90">
                  {item.media?.url ? (
                    item.isVideoReview ? (
                      <video
                        src={item.media.url}
                        controls
                        preload="metadata"
                        playsInline
                        poster={item.photoUrl || undefined}
                        className="h-full w-full bg-black object-contain"
                        aria-label={`${item.name} testimonial video`}
                        onPlay={() => setIsVideoPlaying(true)}
                        onPause={() => setIsVideoPlaying(false)}
                        onEnded={() => setIsVideoPlaying(false)}
                      />
                    ) : (
                      <img
                        src={item.media.url}
                        alt={item.media.alt_text || `${item.name} testimonial`}
                        width={420}
                        height={236}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.35),transparent_55%),linear-gradient(135deg,hsl(var(--foreground)),hsl(var(--primary)))]">
                      <span className="font-display text-3xl font-bold text-primary-foreground">
                        {item.monogram}
                      </span>
                    </div>
                  )}
                  {item.isVideoReview ? (
                    <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                      Video review
                    </span>
                  ) : (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/70 to-transparent" />
                  )}
                </div>

                <div className="relative flex flex-1 flex-col px-4 pb-4 pt-4">
                  <div className="flex items-center gap-1 text-accent" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
                    “{item.quote}”
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border/70 pt-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        item.monogram
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary 2xl:inline-flex">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </motion.article>
            </div>
          ))}
        </div>
      </div>

      {snapCount > 1 ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${
                isPaused ? "bg-accent" : "animate-pulse bg-emerald-500"
              }`}
            />
            {reduceMotion ? "Manual" : isPaused ? "Paused" : "Auto play"}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
              {progressLabel}
            </span>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TestimonialsCarousel;
