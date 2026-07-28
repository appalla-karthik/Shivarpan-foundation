import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { assetUrl } from "@/lib/api";
import type { ImpactVideoPayload } from "@/types/content";

interface FeaturedVideoTeaserProps {
  videos: ImpactVideoPayload[];
}

const formatVideoDate = (value: string | null) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const thumbnailUrl = (video: ImpactVideoPayload) =>
  assetUrl(video.effective_thumbnail_url || video.thumbnail?.url) || "/placeholder.svg";

const FeaturedVideoTeaser = ({ videos }: FeaturedVideoTeaserProps) => {
  const orderedVideos = useMemo(
    () =>
      [...videos].sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          a.sort_order - b.sort_order,
      ),
    [videos],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeIndex >= orderedVideos.length) setActiveIndex(0);
  }, [activeIndex, orderedVideos.length]);

  useEffect(() => {
    if (orderedVideos.length < 2 || isPaused) return;
    const timerId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % orderedVideos.length);
    }, 7000);
    return () => window.clearInterval(timerId);
  }, [isPaused, orderedVideos.length]);

  if (orderedVideos.length === 0) return null;

  const activeVideo = orderedVideos[activeIndex] || orderedVideos[0];
  const activeThumbnail = thumbnailUrl(activeVideo);
  const activeDate = formatVideoDate(activeVideo.published_on);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/placeholder.svg";
  };

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.38)_48%,hsl(var(--background))_100%)] py-16 md:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent/[0.12] blur-3xl"
      />

      <div className="container relative mx-auto px-4">
        <div className="mb-8 flex flex-col gap-5 border-b border-border/70 pb-7 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold leading-none text-foreground sm:text-5xl">
              Featured Videos
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Real voices, field moments, and stories of impact—captured as they happened.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <p className="text-xs font-semibold tabular-nums tracking-[0.16em] text-muted-foreground">
              {String(activeIndex + 1).padStart(2, "0")}
              <span className="mx-2 text-border">/</span>
              {String(orderedVideos.length).padStart(2, "0")}
            </p>
            <Link
              to="/news-stories#impact-in-motion"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View all videos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#072b3a] shadow-[0_40px_100px_-55px_rgba(4,31,43,0.95)] md:rounded-[2.5rem]">
          <div className="grid lg:grid-cols-[minmax(0,1.48fr)_minmax(20rem,0.72fr)]">
            <Link
              to="/news-stories#impact-in-motion"
              className="group relative min-h-[320px] overflow-hidden bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f5a13f] sm:min-h-[430px] lg:min-h-[520px]"
              aria-label={`Watch ${activeVideo.title} in Impact in Motion`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVideo.id}
                  initial={{ opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={activeThumbnail}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.55] blur-2xl"
                    onError={handleImageError}
                  />
                  <img
                    src={activeThumbnail}
                    alt={
                      activeVideo.thumbnail?.alt_text ||
                      `${activeVideo.title} video thumbnail`
                    }
                    className="relative h-full w-full object-contain transition duration-700 group-hover:scale-[1.018]"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </motion.div>
              </AnimatePresence>
              <span className="absolute inset-0 bg-gradient-to-t from-[#020b10]/72 via-transparent to-[#020b10]/18" />
              <span className="absolute left-5 top-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:left-7 sm:top-7">
                Film {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/[0.45] bg-white/[0.16] text-white shadow-2xl backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:border-[#f5a13f] group-hover:bg-[#f5a13f] group-hover:text-[#102632] sm:h-20 sm:w-20">
                <Play className="ml-1 h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" />
              </span>
              <span className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
                <span className="ml-auto hidden items-center gap-2 rounded-full border border-white/20 bg-[#061923]/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:inline-flex">
                  Watch film
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </span>
            </Link>

            <div className="relative flex min-h-[360px] flex-col justify-center overflow-hidden p-7 text-white sm:p-10 lg:min-h-[520px] lg:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/[0.28] blur-3xl"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVideo.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                    <span className="text-[#ffc278]">
                      {activeVideo.category || "Impact in Motion"}
                    </span>
                    {activeDate ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {activeDate}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-[2.65rem]">
                    {activeVideo.title}
                  </h3>
                  {activeVideo.short_description ? (
                    <p className="mt-5 text-sm leading-relaxed text-white/[0.66] sm:text-base">
                      {activeVideo.short_description}
                    </p>
                  ) : (
                    <p className="mt-5 text-sm leading-relaxed text-white/[0.66] sm:text-base">
                      Watch this story from the field and discover the people behind
                      Shivarpan&apos;s impact.
                    </p>
                  )}
                  <Link
                    to="/news-stories#impact-in-motion"
                    className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#f5a13f] px-5 py-3 text-sm font-semibold text-[#102632] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffb45a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    Watch video
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {orderedVideos.length > 1 ? (
            <div className="border-t border-white/10 bg-[#041d28]/90 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.22)_transparent]">
                {orderedVideos.map((video, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`group/item grid min-w-[17rem] snap-start grid-cols-[6.5rem_minmax(0,1fr)] gap-3 rounded-[1.2rem] border p-2 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a13f] sm:min-w-[19rem] ${
                        isActive
                          ? "border-[#f5a13f]/[0.65] bg-white/10"
                          : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.07]"
                      }`}
                      aria-pressed={isActive}
                      aria-label={`Show ${video.title}`}
                    >
                      <span className="relative aspect-video overflow-hidden rounded-xl bg-black">
                        <img
                          src={thumbnailUrl(video)}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover opacity-[0.88] transition duration-500 group-hover/item:scale-105"
                          loading="lazy"
                          onError={handleImageError}
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/[0.16]">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-full border backdrop-blur-sm ${
                              isActive
                                ? "border-[#f5a13f] bg-[#f5a13f] text-[#102632]"
                                : "border-white/30 bg-black/[0.35] text-white"
                            }`}
                          >
                            <Play className="ml-0.5 h-3 w-3" fill="currentColor" />
                          </span>
                        </span>
                      </span>
                      <span className="min-w-0 self-center pr-1">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ffc278]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-1.5 line-clamp-2 block font-display text-base font-semibold leading-tight text-white">
                          {video.title}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVideoTeaser;
