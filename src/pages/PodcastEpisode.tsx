import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import type { PodcastEpisodeItem } from "@/data/podcastEpisodes";
import { ArrowLeft, Clock3, Mic, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assetUrl, getJson } from "@/lib/api";

const PodcastEpisode = () => {
  const { episodeSlug } = useParams();
  const navigate = useNavigate();
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [episode, setEpisode] = useState<PodcastEpisodeItem | undefined>(undefined);
  const [episodes, setEpisodes] = useState<PodcastEpisodeItem[]>([]);
  const [isLoadingEpisode, setIsLoadingEpisode] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIsPlayerVisible(false);
  }, [episodeSlug]);

  useEffect(() => {
    if (!episodeSlug) {
      setIsLoadingEpisode(false);
      return;
    }

    setIsLoadingEpisode(true);
    getJson<any[]>("podcast/episodes/")
      .then((res) => {
        const items = Array.isArray(res) ? res : [];
        const formatted = items.map((item: any, index: number) => {
          const imageUrl = assetUrl(item?.cover_image?.url);
          return {
            id: item?.id ?? index + 1,
            slug: item?.slug ?? `episode-${index + 1}`,
            title: item?.title ?? "Podcast Episode",
            host: item?.host ? `Host: ${item.host}` : "Host: Shivarpan",
            duration: item?.duration_label ?? "0 min",
            summary: item?.summary ?? "",
            description: item?.description ?? "",
            image: imageUrl || "/placeholder.svg",
            videoUrl: item?.audio_url ?? "",
          };
        });
        setEpisodes(formatted as PodcastEpisodeItem[]);
        const matched = items.find((item: any) => item?.slug === episodeSlug);
        if (!matched) {
          setEpisode(undefined);
          return;
        }
        const imageUrl = assetUrl(matched?.cover_image?.url);
        const nextEpisode = {
          id: matched?.id ?? 0,
          slug: matched?.slug ?? episodeSlug,
          title: matched?.title ?? "Podcast Episode",
          host: matched?.host ? `Host: ${matched.host}` : "Host: Shivarpan",
          duration: matched?.duration_label ?? "0 min",
          summary: matched?.summary ?? "",
          description: matched?.description ?? "",
          image: imageUrl || "/placeholder.svg",
          videoUrl: matched?.audio_url ?? "",
        };
        setEpisode(nextEpisode);
      })
      .catch(() => {
        setEpisode(undefined);
        setEpisodes([]);
      })
      .finally(() => {
        setIsLoadingEpisode(false);
      });
  }, [episodeSlug]);

  if (isLoadingEpisode) {
    return (
      <div className="min-h-[70vh] bg-background px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Loading podcast episode...
          </p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-[70vh] bg-background px-4 py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Podcast episode not found
          </h1>
          <p className="mt-3 text-muted-foreground">
            The episode you were trying to open is not available.
          </p>
          <Button type="button" onClick={() => navigate("/podcast")} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Podcast
          </Button>
        </div>
      </div>
    );
  }

  const relatedEpisodes = episodes
    .filter((item) => item.slug !== episode.slug)
    .slice(0, 3);

  return (
    <div>
      <PageHero
        title={episode.title}
        subtitle={episode.summary}
        image={episode.image}
      />

      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
                <Mic className="h-3.5 w-3.5 text-primary" />
                {episode.host}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
                <Clock3 className="h-3.5 w-3.5 text-primary" />
                {episode.duration}
              </span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-foreground md:text-4xl">
              {episode.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {episode.description}
            </p>

            {isPlayerVisible ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-black/90">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="h-full w-full"
                >
                  <source src={episode.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => {
                  setIsPlayerVisible(true);
                  window.setTimeout(() => {
                    void videoRef.current?.play().catch(() => undefined);
                  }, 40);
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                {isPlayerVisible ? "Replay Episode" : "Play Episode"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/podcast")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Podcast Carousel
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Related Episodes
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {relatedEpisodes.map((item) => (
                <Link
                  key={item.slug}
                  to={`/podcast/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {item.duration}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PodcastEpisode;
