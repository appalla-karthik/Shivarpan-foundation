import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Play } from "lucide-react";
import { Link } from "react-router-dom";
import ImpactVideoModal from "@/components/ImpactVideoModal";
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
  const [selectedVideo, setSelectedVideo] = useState<ImpactVideoPayload | null>(null);

  useEffect(() => {
    if (activeIndex >= orderedVideos.length) setActiveIndex(0);
  }, [activeIndex, orderedVideos.length]);

  useEffect(() => {
    if (orderedVideos.length < 2 || isPaused || selectedVideo) return;
    const timerId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % orderedVideos.length);
    }, 7000);
    return () => window.clearInterval(timerId);
  }, [isPaused, orderedVideos.length, selectedVideo]);

  if (orderedVideos.length === 0) return null;

  const activeVideo = orderedVideos[activeIndex] || orderedVideos[0];
  const activeThumbnail = thumbnailUrl(activeVideo);
  const activeDate = formatVideoDate(activeVideo.published_on);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/placeholder.svg";
  };

  return (
    <>
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
                Real voices, field moments, and stories of impact captured as they happened.
              </p>
            </div>
            <Link
              to="/news-stories#impact-in-motion"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View all videos
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#061f2b] shadow-[0_40px_100px_-55px_rgba(4,31,43,0.95)] md:rounded-[2.5rem]">
            <div className="group relative min-h-[650px] overflow-hidden bg-black sm:min-h-[700px] lg:min-h-[720px]">
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
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.58] blur-2xl"
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

              <div className="absolute inset-0 bg-gradient-to-t from-[#020b10] via-[#020b10]/35 to-[#020b10]/10" />
              <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-[#020b10] via-[#031923]/[0.88] to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedVideo(activeVideo)}
                className="absolute left-1/2 top-[32%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/[0.45] bg-white/[0.16] text-white shadow-2xl backdrop-blur-md transition duration-300 hover:scale-110 hover:border-[#f5a13f] hover:bg-[#f5a13f] hover:text-[#102632] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-20 sm:w-20 lg:top-[38%]"
                aria-label={`Play ${activeVideo.title}`}
              >
                <Play className="ml-1 h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVideo.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl rounded-[1.6rem] border border-white/15 bg-[#041923]/[0.64] p-5 text-white shadow-2xl backdrop-blur-xl sm:p-7 lg:p-8"
                  >
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.58]">
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
                    <h3 className="mt-3 max-w-3xl font-display text-3xl font-bold leading-[1.05] sm:text-4xl lg:text-5xl">
                      {activeVideo.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/[0.72] sm:text-base">
                      {activeVideo.short_description ||
                        "Watch this story from the field and discover the people behind Shivarpan's impact."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedVideo(activeVideo)}
                      className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-[#f5a13f] px-5 py-3 text-sm font-semibold text-[#102632] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffb45a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      aria-label={`Watch ${activeVideo.title}`}
                    >
                      <Play className="h-4 w-4" fill="currentColor" />
                      Watch video
                    </button>
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
                            {video.category || "Impact story"}
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

      <ImpactVideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
};

export default FeaturedVideoTeaser;
