import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { assetUrl } from "@/lib/api";
import type { ImpactVideoPayload } from "@/types/content";

interface FeaturedVideoTeaserProps {
  videos: ImpactVideoPayload[];
}

interface YouTubePlayer {
  playVideo: () => void;
  destroy: () => void;
}

interface YouTubePlayerEvent {
  data: number;
  target: YouTubePlayer;
}

interface YouTubePlayerOptions {
  videoId: string;
  width: string;
  height: string;
  playerVars: Record<string, string | number>;
  events: {
    onReady: (event: YouTubePlayerEvent) => void;
    onStateChange: (event: YouTubePlayerEvent) => void;
    onError: () => void;
  };
}

interface YouTubeApi {
  Player: new (element: HTMLElement, options: YouTubePlayerOptions) => YouTubePlayer;
}

type YouTubeWindow = Window & {
  YT?: YouTubeApi;
  onYouTubeIframeAPIReady?: () => void;
};

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

const loadYouTubeApi = () => {
  const youtubeWindow = window as YouTubeWindow;
  if (youtubeWindow.YT?.Player) return Promise.resolve(youtubeWindow.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReadyHandler = youtubeWindow.onYouTubeIframeAPIReady;
    youtubeWindow.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      if (youtubeWindow.YT?.Player) {
        resolve(youtubeWindow.YT);
      } else {
        youtubeApiPromise = null;
        reject(new Error("YouTube player API did not initialize."));
      }
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener(
      "error",
      () => {
        youtubeApiPromise = null;
        reject(new Error("Unable to load the YouTube player API."));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
};

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
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeHostRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const uploadedVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (activeIndex >= orderedVideos.length) setActiveIndex(0);
  }, [activeIndex, orderedVideos.length]);

  useEffect(() => {
    if (orderedVideos.some((video) => video.source_type === "youtube")) {
      void loadYouTubeApi().catch(() => undefined);
    }
  }, [orderedVideos]);

  useEffect(() => {
    setHasStarted(false);
    setIsPlaying(false);
  }, [activeIndex]);

  useEffect(() => {
    if (orderedVideos.length < 2 || isCarouselPaused || hasStarted) return;
    const timerId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % orderedVideos.length);
    }, 7000);
    return () => window.clearInterval(timerId);
  }, [hasStarted, isCarouselPaused, orderedVideos.length]);

  const activeVideo = orderedVideos[activeIndex] || orderedVideos[0] || null;

  useEffect(() => {
    if (
      !activeVideo ||
      !hasStarted ||
      activeVideo.source_type !== "youtube" ||
      !activeVideo.youtube_video_id ||
      !youtubeHostRef.current
    ) {
      return;
    }

    let isCancelled = false;

    void loadYouTubeApi()
      .then((youtubeApi) => {
        if (isCancelled || !youtubeHostRef.current) return;

        youtubePlayerRef.current = new youtubeApi.Player(youtubeHostRef.current, {
          videoId: activeVideo.youtube_video_id,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => event.target.playVideo(),
            onStateChange: (event) => {
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                setIsPlaying(false);
                setHasStarted(false);
              }
            },
            onError: () => {
              setIsPlaying(false);
              setHasStarted(false);
            },
          },
        });
      })
      .catch(() => {
        if (!isCancelled) {
          setIsPlaying(false);
          setHasStarted(false);
        }
      });

    return () => {
      isCancelled = true;
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
    };
  }, [activeVideo, hasStarted]);

  const playInlineVideo = async () => {
    if (!activeVideo) return;

    setHasStarted(true);
    setIsPlaying(true);

    if (activeVideo.source_type === "youtube") {
      youtubePlayerRef.current?.playVideo();
      return;
    }

    try {
      await uploadedVideoRef.current?.play();
    } catch {
      setHasStarted(false);
      setIsPlaying(false);
    }
  };

  if (!activeVideo) return null;

  const activeThumbnail = thumbnailUrl(activeVideo);
  const activeDate = formatVideoDate(activeVideo.published_on);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/placeholder.svg";
  };

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.38)_48%,hsl(var(--background))_100%)] py-16 md:py-24"
      onMouseEnter={() => setIsCarouselPaused(true)}
      onMouseLeave={() => setIsCarouselPaused(false)}
      onFocusCapture={() => setIsCarouselPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsCarouselPaused(false);
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

          <div className="overflow-hidden rounded-[2rem] border border-[#123f50]/40 bg-[#061f2b] shadow-[0_38px_90px_-48px_rgba(4,31,43,0.9)] md:rounded-[2.5rem]">
            <div
              className="group relative aspect-[4/5] min-h-[560px] overflow-hidden bg-[#061f2b] sm:aspect-[4/3] sm:min-h-[620px] lg:aspect-video lg:min-h-0"
              data-playing={isPlaying ? "true" : "false"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVideo.id}
                  initial={{ opacity: 0, scale: 1.035 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={activeThumbnail}
                    alt={
                      activeVideo.thumbnail?.alt_text ||
                      `${activeVideo.title} video thumbnail`
                    }
                    className="h-full w-full object-cover object-center transition [transition-duration:1400ms] ease-out group-hover:scale-[1.035]"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </motion.div>
              </AnimatePresence>

              {hasStarted ? (
                <div className="absolute inset-0 z-10 bg-black">
                  {activeVideo.source_type === "youtube" ? (
                    <div
                      ref={youtubeHostRef}
                      className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
                      aria-label={`${activeVideo.title} YouTube video`}
                    />
                  ) : (
                    <video
                      ref={uploadedVideoRef}
                      src={assetUrl(activeVideo.video_file?.url)}
                      poster={activeThumbnail}
                      className="h-full w-full bg-black object-contain"
                      controls
                      autoPlay
                      playsInline
                      aria-label={`${activeVideo.title} video`}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => {
                        setIsPlaying(false);
                        setHasStarted(false);
                      }}
                      onError={() => {
                        setIsPlaying(false);
                        setHasStarted(false);
                      }}
                    >
                      Your browser does not support HTML video.
                    </video>
                  )}
                </div>
              ) : null}

              <div
                className={`absolute inset-0 z-20 transition-opacity duration-500 ${
                  isPlaying ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,11,16,0.2)_0%,rgba(2,11,16,0.04)_30%,rgba(2,11,16,0.3)_58%,rgba(2,11,16,0.96)_100%)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] bg-[linear-gradient(0deg,rgba(2,11,16,0.98)_0%,rgba(3,25,35,0.88)_28%,rgba(3,25,35,0.38)_62%,transparent_100%)]" />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-[78%] bg-gradient-to-r from-[#020b10]/40 via-transparent to-transparent" />

                <button
                  type="button"
                  onClick={() => void playInlineVideo()}
                  className="absolute left-1/2 top-[30%] z-20 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation place-items-center rounded-full border border-white/55 bg-black/25 text-white shadow-[0_16px_45px_rgba(0,0,0,0.38)] backdrop-blur-sm transition duration-300 hover:scale-110 hover:border-[#f5a13f] hover:bg-[#f5a13f] hover:text-[#102632] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-20 sm:w-20 lg:top-[36%]"
                  aria-label={`${hasStarted ? "Resume" : "Play"} ${activeVideo.title}`}
                >
                  <Play
                    className="pointer-events-none ml-1 h-6 w-6 sm:h-7 sm:w-7"
                    fill="currentColor"
                  />
                </button>

                <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 lg:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeVideo.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="max-w-4xl text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.62)]"
                    >
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
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
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:mt-4 sm:text-base">
                        {activeVideo.short_description ||
                          "Watch this story from the field and discover the people behind Shivarpan's impact."}
                      </p>
                      <button
                        type="button"
                        onClick={() => void playInlineVideo()}
                        className="mt-5 inline-flex w-fit cursor-pointer touch-manipulation items-center gap-3 rounded-full bg-[#f5a13f] px-5 py-3 text-sm font-semibold text-[#102632] shadow-[0_14px_32px_-16px_rgba(245,161,63,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffb45a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:mt-6"
                        aria-label={`${hasStarted ? "Continue" : "Watch"} ${activeVideo.title}`}
                      >
                        <Play className="h-4 w-4" fill="currentColor" />
                        {hasStarted ? "Continue video" : "Watch video"}
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 z-30 ring-1 ring-inset ring-white/10" />
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
                        onClick={() => {
                          setHasStarted(false);
                          setIsPlaying(false);
                          setActiveIndex(index);
                        }}
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
  );
};

export default FeaturedVideoTeaser;
