import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Film, Play, X } from "lucide-react";
import { assetUrl } from "@/lib/api";
import type { ImpactVideoPayload } from "@/types/content";

interface ImpactVideoSectionProps {
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

const videoThumbnail = (video: ImpactVideoPayload) =>
  assetUrl(video.effective_thumbnail_url || video.thumbnail?.url) || "/placeholder.svg";

const ImpactVideoSection = ({ videos }: ImpactVideoSectionProps) => {
  const [selectedVideo, setSelectedVideo] = useState<ImpactVideoPayload | null>(null);
  const orderedVideos = useMemo(
    () =>
      [...videos].sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          a.sort_order - b.sort_order,
      ),
    [videos],
  );

  useEffect(() => {
    if (!selectedVideo) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedVideo(null);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedVideo]);

  useEffect(() => {
    if (orderedVideos.length === 0 || window.location.hash !== "#impact-in-motion") return;
    const timerId = window.setTimeout(() => {
      document.getElementById("impact-in-motion")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
    return () => window.clearTimeout(timerId);
  }, [orderedVideos.length]);

  if (orderedVideos.length === 0) return null;

  const featuredVideo = orderedVideos[0];
  const remainingVideos = orderedVideos.slice(1);
  const sideVideos = remainingVideos.slice(0, 2);
  const moreVideos = remainingVideos.slice(2);

  const videoButton = (
    video: ImpactVideoPayload,
    featured = false,
  ) => (
    <button
      type="button"
      onClick={() => setSelectedVideo(video)}
      className={`group relative block w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 ${
        featured ? "aspect-video rounded-[1.8rem]" : "aspect-video rounded-[1.35rem]"
      }`}
      aria-label={`Play ${video.title}`}
    >
      <img
        src={videoThumbnail(video)}
        alt={video.thumbnail?.alt_text || `${video.title} video thumbnail`}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/placeholder.svg";
        }}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-[#061923]/85 via-[#061923]/18 to-transparent transition-colors group-hover:via-[#061923]/28" />
      <span
        className={`absolute grid place-items-center rounded-full border border-white/45 bg-white/18 text-white shadow-2xl backdrop-blur-md transition duration-300 group-hover:scale-105 group-hover:bg-accent group-hover:text-accent-foreground ${
          featured
            ? "left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2"
            : "left-4 top-4 h-11 w-11"
        }`}
      >
        <Play className={featured ? "ml-1 h-6 w-6" : "ml-0.5 h-4 w-4"} fill="currentColor" />
      </span>
      {!featured ? (
        <span className="absolute inset-x-4 bottom-4 line-clamp-2 font-display text-xl font-semibold leading-tight text-white">
          {video.title}
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      <section
        id="impact-in-motion"
        className="relative left-1/2 w-screen -translate-x-1/2 scroll-mt-28 border-y border-border/70 bg-[linear-gradient(135deg,hsl(var(--foreground))_0%,#0b3445_54%,#0a5269_100%)] py-16 text-white md:py-20"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f5ad57]">
                <Film className="h-4 w-4" />
                Impact in Motion
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
                Real work. Real people. Captured in motion.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base">
                Watch field moments, community initiatives, and the people behind
                Shivarpan Foundation&apos;s impact.
              </p>
            </div>
            <p className="max-w-xs border-l border-[#f5ad57]/55 pl-4 text-sm leading-relaxed text-white/66">
              Every film adds a visual chapter to the dispatches shared above.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-12">
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              className="rounded-[2.2rem] border border-white/12 bg-white/[0.075] p-4 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.9)] backdrop-blur-sm lg:col-span-8 md:p-5"
            >
              {videoButton(featuredVideo, true)}
              <div className="grid gap-4 px-1 pb-1 pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    {featuredVideo.category ? (
                      <span className="text-[#f5ad57]">{featuredVideo.category}</span>
                    ) : null}
                    {formatVideoDate(featuredVideo.published_on) ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatVideoDate(featuredVideo.published_on)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">
                    {featuredVideo.title}
                  </h3>
                  {featuredVideo.short_description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68">
                      {featuredVideo.short_description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVideo(featuredVideo)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f5a13f] px-5 text-sm font-semibold text-[#102632] transition hover:bg-[#ffb45a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  Watch film
                </button>
              </div>
            </motion.article>

            {sideVideos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
                {sideVideos.map((video, index) => (
                  <motion.article
                    key={video.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-[1.7rem] border border-white/12 bg-white/[0.065] p-3 backdrop-blur-sm"
                  >
                    {videoButton(video)}
                    <div className="px-1 pb-1 pt-3">
                      <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                        <span className="text-[#f5ad57]">{video.category || "Impact film"}</span>
                        <span>{formatVideoDate(video.published_on)}</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : null}
          </div>

          {moreVideos.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moreVideos.map((video, index) => (
                <motion.article
                  key={video.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ delay: Math.min(index, 4) * 0.05 }}
                  className="rounded-[1.7rem] border border-white/12 bg-white/[0.065] p-3 backdrop-blur-sm"
                >
                  {videoButton(video)}
                  <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    <span className="text-[#f5ad57]">
                      {video.category || "Impact film"}
                    </span>
                    <span>{formatVideoDate(video.published_on)}</span>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {selectedVideo ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-[#020b10]/92 p-3 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.title}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedVideo(null);
          }}
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#071a23] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f5ad57]">
                  Impact in Motion
                </p>
                <h3 className="truncate font-display text-lg font-semibold text-white">
                  {selectedVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/75 transition hover:bg-white/10 hover:text-white"
                aria-label="Close video"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              {selectedVideo.source_type === "youtube" && selectedVideo.youtube_embed_url ? (
                <iframe
                  src={`${selectedVideo.youtube_embed_url}&autoplay=1`}
                  title={selectedVideo.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video
                  src={assetUrl(selectedVideo.video_file?.url)}
                  poster={videoThumbnail(selectedVideo)}
                  className="h-full w-full"
                  controls
                  autoPlay
                  playsInline
                >
                  Your browser does not support HTML video.
                </video>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ImpactVideoSection;
