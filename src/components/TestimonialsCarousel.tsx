import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export interface TestimonialCarouselItem {
  quote: string;
  name: string;
  role: string;
  tag: string;
  monogram: string;
  glow: string;
  rating: number;
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

const normalizedRating = (rating: number) =>
  Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));

const RatingStars = ({
  rating,
  inactiveClassName = "text-foreground/18",
}: {
  rating: number;
  inactiveClassName?: string;
}) => {
  const safeRating = normalizedRating(rating);

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, starIndex) => {
        const isFilled = starIndex < safeRating;
        return (
          <Star
            key={starIndex}
            className={`h-4 w-4 ${
              isFilled ? "fill-current text-accent" : inactiveClassName
            }`}
          />
        );
      })}
    </div>
  );
};

interface VideoTestimonialCardProps {
  item: TestimonialCarouselItem;
  videoKey: string;
  isActive: boolean;
  onPlaybackChange: (videoKey: string, isPlaying: boolean) => void;
}

const VideoTestimonialCard = ({
  item,
  videoKey,
  isActive,
  onPlaybackChange,
}: VideoTestimonialCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isActive) return;
    const video = videoRef.current;
    if (video && !video.paused) video.pause();
    setHasStarted(false);
    setIsPlaying(false);
  }, [isActive]);

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    setHasStarted(true);
    setIsPlaying(true);
    onPlaybackChange(videoKey, true);
    try {
      await video.play();
    } catch {
      setHasStarted(false);
      setIsPlaying(false);
      onPlaybackChange(videoKey, false);
    }
  };

  return (
    <motion.article
      whileHover={isPlaying ? undefined : { y: -5 }}
      transition={{ type: "spring", stiffness: 230, damping: 22 }}
      className="group relative h-full min-h-[29rem] overflow-hidden rounded-[1.6rem] border border-white/15 bg-black shadow-[0_32px_80px_-48px_hsl(var(--foreground))]"
      data-playing={isPlaying ? "true" : "false"}
    >
      <video
        ref={videoRef}
        src={item.media?.url}
        controls={hasStarted}
        preload="metadata"
        playsInline
        poster={item.photoUrl || undefined}
        className="absolute inset-0 h-full w-full bg-black object-contain"
        aria-label={`${item.name} testimonial video`}
        onPlay={() => {
          setHasStarted(true);
          setIsPlaying(true);
          onPlaybackChange(videoKey, true);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={() => {
          setHasStarted(false);
          setIsPlaying(false);
          onPlaybackChange(videoKey, false);
        }}
        onError={() => {
          setHasStarted(false);
          setIsPlaying(false);
          onPlaybackChange(videoKey, false);
        }}
      />

      <div
        className={`absolute inset-0 transition duration-500 ${
          isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,11,16,0.78)_0%,rgba(2,11,16,0.18)_34%,rgba(2,11,16,0.42)_54%,rgba(2,11,16,0.96)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#03131b] via-[#03131b]/88 to-transparent" />

        <div className="relative flex h-full flex-col p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
              Video review
            </span>
            <span className="rounded-full border border-white/16 bg-black/25 px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] text-white/72 backdrop-blur-md">
              {normalizedRating(item.rating)}.0 / 5
            </span>
          </div>

          <div className="mt-8 max-w-[92%]">
            <RatingStars rating={item.rating} inactiveClassName="text-white/28" />
            <p className="mt-3 line-clamp-4 font-display text-xl font-semibold leading-snug text-white drop-shadow-md">
              “{item.quote}”
            </p>
          </div>

          <div className="mt-auto">
            <button
              type="button"
              onClick={playVideo}
              className="group/play inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[#f5a13f]/80 bg-[#f5a13f] px-4 py-3 text-sm font-semibold text-[#082c3b] shadow-[0_14px_34px_-20px_rgba(245,161,63,0.95)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffb45a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Play ${item.name} testimonial video`}
            >
              <Play
                className="h-4 w-4 transition group-hover/play:scale-110"
                fill="currentColor"
              />
              {hasStarted ? "Continue review" : "Play review"}
            </button>

            <div className="mt-4 flex items-center gap-3 border-t border-white/16 pt-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/12 text-xs font-semibold text-white">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  item.monogram
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                <p className="truncate text-xs text-white/62">{item.role}</p>
              </div>
              <span className="hidden shrink-0 rounded-full border border-accent/40 bg-accent/12 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#ffc278] 2xl:inline-flex">
                {item.tag}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

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
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const isPaused = isHovered || isFocused || activeVideoKey !== null || reduceMotion;

  const handleVideoPlayback = useCallback((videoKey: string, isPlaying: boolean) => {
    setActiveVideoKey((currentVideoKey) => {
      if (isPlaying) return videoKey;
      return currentVideoKey === videoKey ? null : currentVideoKey;
    });
  }, []);

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
    setActiveVideoKey(null);
  }, [selectedIndex]);

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
          {safeItems.map((item, index) => {
            const videoKey = `${item.name}-${index}`;
            return (
              <div
                key={videoKey}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_calc(50%-0.625rem)] lg:flex-[0_0_calc(33.333%-0.875rem)] xl:flex-[0_0_calc(25%-0.9375rem)]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${safeItems.length}`}
              >
                {item.isVideoReview && item.media?.url ? (
                  <VideoTestimonialCard
                    item={item}
                    videoKey={videoKey}
                    isActive={activeVideoKey === videoKey}
                    onPlaybackChange={handleVideoPlayback}
                  />
                ) : (
                  <motion.article
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 230, damping: 22 }}
                    className="group relative flex h-full min-h-[29rem] flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-[0_28px_70px_-55px_hsl(var(--foreground))]"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <div className="relative aspect-video shrink-0 overflow-hidden bg-foreground/90">
                      {item.media?.url ? (
                        <img
                          src={item.media.url}
                          alt={item.media.alt_text || `${item.name} testimonial`}
                          width={420}
                          height={236}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.35),transparent_55%),linear-gradient(135deg,hsl(var(--foreground)),hsl(var(--primary)))]">
                          <span className="font-display text-3xl font-bold text-primary-foreground">
                            {item.monogram}
                          </span>
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-foreground/70 to-transparent" />
                    </div>

                    <div className="relative flex flex-1 flex-col px-4 pb-4 pt-4">
                      <RatingStars rating={item.rating} />
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
                )}
              </div>
            );
          })}
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
