import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Film,
  Play,
  Sparkles,
} from "lucide-react";
import { assetUrl } from "@/lib/api";
import type { ImpactVideoPayload } from "@/types/content";
import ImpactVideoModal from "@/components/ImpactVideoModal";

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
  const upNextVideos = remainingVideos.slice(0, 3);
  const libraryVideos = remainingVideos.slice(3);

  const renderThumbnail = (
    video: ImpactVideoPayload,
    imageClassName: string,
  ) => {
    const thumbnail = videoThumbnail(video);
    const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src = "/placeholder.svg";
    };

    return (
      <>
        <img
          src={thumbnail}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl"
          onError={handleImageError}
        />
        <img
          src={thumbnail}
          alt={video.thumbnail?.alt_text || `${video.title} video thumbnail`}
          className={`relative h-full w-full ${imageClassName}`}
          loading="lazy"
          onError={handleImageError}
        />
      </>
    );
  };

  return (
    <>
      <section
        id="impact-in-motion"
        className="relative left-1/2 mt-12 w-screen -translate-x-1/2 scroll-mt-28 overflow-hidden border-y border-white/10 bg-[#082c3b] py-16 text-white md:mt-16 md:py-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_5%,rgba(46,176,190,0.22),transparent_34%),radial-gradient(circle_at_88%_78%,rgba(245,161,63,0.18),transparent_30%),linear-gradient(135deg,#061f2b_0%,#0a3545_52%,#082a38_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5a13f]/80 to-transparent"
        />

        <div className="container relative mx-auto px-4">
          <div className="grid gap-8 border-b border-white/12 pb-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:pb-11">
            <div className="max-w-4xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f5a13f]/45 bg-[#f5a13f]/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ffc278]">
                <Film className="h-3.5 w-3.5" />
                Impact in Motion
              </span>
              <h2 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[0.98] sm:text-5xl lg:text-6xl">
                Stories you can see,
                <span className="block text-white/62">not just read.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
                Step into the field through real initiatives, community voices, and
                the people moving Shivarpan&apos;s work forward.
              </p>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <div className="rounded-2xl border border-white/12 bg-white/[0.055] px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/46">
                  Film archive
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  {orderedVideos.length.toString().padStart(2, "0")}
                  <span className="ml-2 font-sans text-xs font-medium text-white/48">
                    {orderedVideos.length === 1 ? "story" : "stories"}
                  </span>
                </p>
              </div>
              <div className="hidden h-14 w-14 place-items-center rounded-full border border-[#f5a13f]/30 bg-[#f5a13f]/10 text-[#ffc278] sm:grid">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div
            className={`mt-8 grid gap-5 ${
              upNextVideos.length > 0 ? "lg:grid-cols-12" : ""
            }`}
          >
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className={`group overflow-hidden rounded-[2rem] border border-white/14 bg-[#061b24]/72 shadow-[0_38px_100px_-52px_rgba(0,0,0,0.95)] ${
                upNextVideos.length > 0 ? "lg:col-span-8" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedVideo(featuredVideo)}
                className="relative block aspect-video w-full overflow-hidden bg-[#031118] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a13f] focus-visible:ring-inset"
                aria-label={`Play ${featuredVideo.title}`}
              >
                {renderThumbnail(featuredVideo, "object-contain")}
                <span className="absolute inset-0 bg-gradient-to-t from-[#020b10]/78 via-transparent to-[#020b10]/25" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#061923]/68 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.19em] text-white backdrop-blur-md sm:left-5 sm:top-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f5a13f] shadow-[0_0_0_4px_rgba(245,161,63,0.18)]" />
                  Featured film
                </span>
                <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/45 bg-white/16 text-white shadow-2xl backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:border-[#f5a13f] group-hover:bg-[#f5a13f] group-hover:text-[#102632] sm:h-[4.5rem] sm:w-[4.5rem]">
                  <Play className="ml-1 h-6 w-6" fill="currentColor" />
                </span>
                <span className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-full border border-white/20 bg-[#061923]/66 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md sm:inline-flex">
                  Watch now
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </button>

              <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/48">
                    <span className="text-[#ffc278]">
                      {featuredVideo.category || "Impact film"}
                    </span>
                    {formatVideoDate(featuredVideo.published_on) ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatVideoDate(featuredVideo.published_on)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 max-w-3xl font-display text-2xl font-semibold leading-tight sm:text-3xl">
                    {featuredVideo.title}
                  </h3>
                  {featuredVideo.short_description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/62">
                      {featuredVideo.short_description}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVideo(featuredVideo)}
                  className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-[#f5a13f] px-5 text-sm font-semibold text-[#102632] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffb45a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  Play film
                </button>
              </div>
            </motion.article>

            {upNextVideos.length > 0 ? (
              <motion.aside
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className="flex flex-col rounded-[2rem] border border-white/12 bg-white/[0.055] p-4 backdrop-blur-sm lg:col-span-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffc278]">
                      Continue watching
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-semibold">
                      Up next
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/12 px-3 py-1.5 text-xs font-semibold text-white/58">
                    {upNextVideos.length}
                  </span>
                </div>

                <div className="mt-2 divide-y divide-white/10">
                  {upNextVideos.map((video, index) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setSelectedVideo(video)}
                      className="group/next grid w-full grid-cols-[7.25rem_minmax(0,1fr)] gap-3 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a13f]"
                      aria-label={`Play ${video.title}`}
                    >
                      <span className="relative aspect-video overflow-hidden rounded-xl bg-[#031118]">
                        {renderThumbnail(video, "object-contain transition duration-500 group-hover/next:scale-[1.035]")}
                        <span className="absolute inset-0 bg-[#020b10]/18 transition group-hover/next:bg-transparent" />
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/35 bg-[#061923]/65 text-white backdrop-blur-sm">
                            <Play className="ml-0.5 h-3 w-3" fill="currentColor" />
                          </span>
                        </span>
                      </span>
                      <span className="min-w-0 self-center">
                        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#ffc278]">
                          {video.category || `Film ${index + 2}`}
                        </span>
                        <span className="mt-1.5 line-clamp-2 block font-display text-base font-semibold leading-tight text-white transition group-hover/next:text-[#ffc278]">
                          {video.title}
                        </span>
                        {formatVideoDate(video.published_on) ? (
                          <span className="mt-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/42">
                            {formatVideoDate(video.published_on)}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.aside>
            ) : null}
          </div>

          {libraryVideos.length > 0 ? (
            <div className="mt-12">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffc278]">
                    From the field
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold">
                    More impact stories
                  </h3>
                </div>
                <p className="hidden max-w-xs text-right text-xs leading-relaxed text-white/45 sm:block">
                  Select any film to open the distraction-free cinema player.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {libraryVideos.map((video, index) => (
                  <motion.button
                    key={video.id}
                    type="button"
                    onClick={() => setSelectedVideo(video)}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ delay: Math.min(index, 5) * 0.05 }}
                    className="group/library overflow-hidden rounded-[1.6rem] border border-white/12 bg-white/[0.055] p-3 text-left transition duration-300 hover:-translate-y-1 hover:border-[#f5a13f]/45 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f5a13f]"
                    aria-label={`Play ${video.title}`}
                  >
                    <span className="relative block aspect-video overflow-hidden rounded-[1.2rem] bg-[#031118]">
                      {renderThumbnail(video, "object-contain transition duration-700 group-hover/library:scale-[1.035]")}
                      <span className="absolute inset-0 bg-gradient-to-t from-[#020b10]/72 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-full border border-white/35 bg-[#061923]/70 text-white backdrop-blur-md transition group-hover/library:bg-[#f5a13f] group-hover/library:text-[#102632]">
                        <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                      </span>
                    </span>
                    <span className="block px-2 pb-2 pt-4">
                      <span className="flex items-center justify-between gap-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-white/42">
                        <span className="text-[#ffc278]">
                          {video.category || "Impact film"}
                        </span>
                        <span>{formatVideoDate(video.published_on)}</span>
                      </span>
                      <span className="mt-2 line-clamp-2 block font-display text-xl font-semibold leading-tight text-white">
                        {video.title}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <ImpactVideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
};

export default ImpactVideoSection;
