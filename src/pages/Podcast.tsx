import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Headphones,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { useNavigate } from "react-router-dom";
import type { PodcastEpisodeItem } from "@/data/podcastEpisodes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assetUrl, getJson } from "@/lib/api";

type EpisodeWithMeta = PodcastEpisodeItem & {
  category: string;
  publishedOn: string;
  listensK: number;
  code: string;
};

const getDurationInMinutes = (duration: string) => {
  const value = Number(duration.split(" ")[0]);
  return Number.isNaN(value) ? 0 : value;
};

const Podcast = () => {
  const navigate = useNavigate();
  const episodesSectionRef = useRef<HTMLDivElement | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisodeItem[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);

  useEffect(() => {
    getJson<any[]>("podcast/episodes/")
      .then((res) => {
        const items = Array.isArray(res) ? res : [];
        const formatted = items
          .map((item: any, index: number) => {
            const imageUrl = assetUrl(item?.cover_image?.url);
            if (!imageUrl) return null;
            return {
              id: item?.id ?? index + 1,
              slug: item?.slug ?? `episode-${index + 1}`,
              title: item?.title ?? "Podcast Episode",
              host: item?.host ? `Host: ${item.host}` : "Host: Shivarpan",
              duration: item?.duration_label ?? "0 min",
              summary: item?.summary ?? "",
              description: item?.description ?? "",
              image: imageUrl,
              videoUrl: item?.audio_url ?? "",
            };
          })
          .filter(Boolean);

        setEpisodes(formatted as PodcastEpisodeItem[]);
      })
      .catch(() => {
        setEpisodes([]);
      })
      .finally(() => {
        setIsLoadingEpisodes(false);
      });
  }, []);

  const episodeCatalog = useMemo<EpisodeWithMeta[]>(
    () =>
      episodes.map((episode, index) => ({
        ...episode,
        category:
          index % 3 === 0
            ? "Field Stories"
            : index % 3 === 1
              ? "Education & Youth"
              : "Health & Community",
        publishedOn:
          index % 3 === 0
            ? "March 2026"
            : index % 3 === 1
              ? "February 2026"
              : "January 2026",
        listensK: Number((16.4 - index * 1.9).toFixed(1)),
        code: `EP-${String(index + 1).padStart(2, "0")}`,
      })),
    [episodes],
  );

  const spotlightEpisode = episodeCatalog[0];

  const totalMinutes = useMemo(
    () =>
      episodeCatalog.reduce(
        (sum, episode) => sum + getDurationInMinutes(episode.duration),
        0,
      ),
    [episodeCatalog],
  );

  const totalListens = useMemo(
    () =>
      `${episodeCatalog
        .reduce((sum, episode) => sum + episode.listensK, 0)
        .toFixed(1)}k`,
    [episodeCatalog],
  );

  const handleBrowseAllEpisodes = useCallback(() => {
    const episodesSection = episodesSectionRef.current;
    if (!episodesSection) return;

    const navOffset = 104;
    const targetY =
      episodesSection.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
  }, []);

  return (
    <div className="bg-background podcast-page">
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <AnimatedSection className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Podcast
                </p>
                <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                  Discover Stories From the Ground
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Curated episodes from community leaders and field experts.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:col-span-4">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Episodes
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-foreground">
                    <Headphones className="h-5 w-5 text-primary" />
                    {episodeCatalog.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Runtime
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-foreground">
                    <Clock3 className="h-5 w-5 text-primary" />
                    {totalMinutes}m
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Listens
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {totalListens}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {spotlightEpisode ? (
            <AnimatedSection className="mt-6">
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="grid lg:grid-cols-12 lg:gap-4 xl:gap-6">
                  <div className="relative w-full aspect-[4/3] overflow-hidden lg:col-span-5 lg:aspect-auto lg:h-[380px]">
                    <img
                      src={spotlightEpisode.image}
                      alt={spotlightEpisode.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 rounded-full border border-background/30 bg-background/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background backdrop-blur">
                      Featured
                    </div>
                  </div>
                  <div className="min-w-0 lg:col-span-7 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full border border-border px-3 py-1 font-semibold uppercase tracking-[0.12em] text-primary">
                        {spotlightEpisode.code}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                        {spotlightEpisode.category}
                      </span>
                      <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">
                        {spotlightEpisode.duration}
                      </span>
                    </div>
                    <h2 className="mt-3 font-display text-xl font-semibold leading-tight text-foreground md:text-2xl">
                      {spotlightEpisode.title}
                    </h2>
                    <p className="mt-1.5 text-sm font-medium text-primary">
                      {spotlightEpisode.host}
                    </p>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {spotlightEpisode.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        {spotlightEpisode.publishedOn}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        {spotlightEpisode.listensK}k listens
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => navigate(`/podcast/${spotlightEpisode.slug}`)}
                      className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Play Episode
                    </Button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ) : null}

          <AnimatedSection className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold text-foreground">
                All Episodes
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowseAllEpisodes}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Browse All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </AnimatedSection>

          <div
            ref={episodesSectionRef}
            className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {isLoadingEpisodes ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-sm font-medium text-muted-foreground md:col-span-2 xl:col-span-3">
                Loading podcast episodes...
              </div>
            ) : null}
            {!isLoadingEpisodes && episodeCatalog.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--accent)/0.2),transparent_34%),radial-gradient(circle_at_84%_22%,hsl(var(--primary)/0.18),transparent_32%),linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--background))_55%,hsl(var(--primary)/0.08)_100%)] p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.1)] md:col-span-2 md:p-10 xl:col-span-3"
              >
                <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 right-10 h-44 w-44 rounded-full bg-primary/18 blur-3xl" />
                <div className="relative mx-auto flex max-w-3xl flex-col items-center">
                  <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border border-primary/20" />
                    <span className="absolute inset-3 rounded-full border border-accent/30" />
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_34px_hsl(var(--primary)/0.22)]">
                      <Headphones className="h-8 w-8" />
                    </span>
                  </div>
                  <p className="rounded-full border border-accent/35 bg-accent/12 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                    Podcast Coming Soon
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                    New conversations are warming up
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Field voices, community conversations, and inspiring episodes are coming soon.
                  </p>
                  <div className="mt-6 grid w-full max-w-xl gap-3 sm:grid-cols-3">
                    {[
                      { label: "Episodes", icon: <PlayCircle className="h-4 w-4" /> },
                      { label: "Hosts", icon: <Headphones className="h-4 w-4" /> },
                      { label: "Runtime", icon: <Clock3 className="h-4 w-4" /> },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-background/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary shadow-sm"
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}
            {episodeCatalog.map((episode, index) => (
              <motion.article
                key={episode.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={episode.image}
                    alt={episode.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    {episode.category}
                  </p>
                  <h4 className="mt-2 line-clamp-2 font-display text-xl font-semibold leading-tight text-foreground">
                    {episode.title}
                  </h4>
                  <p className="mt-2 text-sm font-medium text-primary">{episode.host}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {episode.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {episode.publishedOn}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-primary" />
                      {episode.duration}
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={() => navigate(`/podcast/${episode.slug}`)}
                    className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Open Episode
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Podcast;
