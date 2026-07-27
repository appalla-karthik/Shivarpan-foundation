  import { useLayoutEffect, useRef } from "react";
  import type { CSSProperties } from "react";
  import { useEffect, useState } from "react";
  import {
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
  } from "framer-motion";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { ArrowUpRight, Calendar, Clock3, MapPin, Sparkles } from "lucide-react";
  import { Badge } from "@/components/ui/badge";
  import ImpactVideoSection from "@/components/ImpactVideoSection";
  import { assetUrl, getJson, reportApiError } from "@/lib/api";
  import type { ImpactVideoPayload, StoryPayload } from "@/types/content";
  import { Link } from "react-router-dom";

  gsap.registerPlugin(ScrollTrigger);

  interface Story {
    id: number;
    slug?: string;
    title: string;
    image: string;
    date: string;
    location: string;
    readTime: string;
    category: string;
    excerpt: string;
    hasBody: boolean;
  }

  interface HeroGridItem {
    row: number;
    col: number;
    imageIndex: number;
  }

  const storyStats = [
    { label: "Families Supported", value: "500+" },
    { label: "Students Sponsored", value: "50" },
    { label: "Patients Reached", value: "500+" },
    { label: "Trees Planted", value: "2000+" },
  ];

  const storyEditorialPillars = [
    {
      title: "Context First",
      detail: "Every dispatch begins with place, people, and the need that triggered action.",
    },
    {
      title: "Proof Over Noise",
      detail: "Outcomes are framed through delivery numbers, not vague feel-good summaries.",
    },
    {
      title: "Human Detail",
      detail: "Stories stay grounded in dignity, volunteer effort, and what changed on the ground.",
    },
  ];

  const heroGridItems: HeroGridItem[] = [
    { row: 1, col: 2, imageIndex: 6 },
    { row: 1, col: 5, imageIndex: 20 },
    { row: 1, col: 8, imageIndex: 2 },
    { row: 2, col: 1, imageIndex: 19 },
    { row: 2, col: 7, imageIndex: 3 },
    { row: 3, col: 6, imageIndex: 4 },
    { row: 4, col: 2, imageIndex: 5 },
    { row: 5, col: 1, imageIndex: 1 },
    { row: 5, col: 8, imageIndex: 7 },
    { row: 6, col: 3, imageIndex: 8 },
    { row: 6, col: 6, imageIndex: 9 },
    { row: 7, col: 2, imageIndex: 10 },
    { row: 7, col: 7, imageIndex: 11 },
    { row: 8, col: 4, imageIndex: 12 },
    { row: 9, col: 1, imageIndex: 13 },
    { row: 9, col: 8, imageIndex: 14 },
    { row: 10, col: 3, imageIndex: 15 },
    { row: 10, col: 6, imageIndex: 16 },
    { row: 11, col: 2, imageIndex: 17 },
    { row: 11, col: 7, imageIndex: 18 },
    { row: 12, col: 5, imageIndex: 19 },
  ];
  const heroMaxRow = Math.max(...heroGridItems.map((item) => item.row));
  const NewsStories = () => {

    const [heroImages, setHeroImages] = useState<any[]>([]);
    const [storiesData, setStoriesData] = useState<Story[]>([]);
    const [impactVideos, setImpactVideos] = useState<ImpactVideoPayload[]>([]);
    const [isLoadingStories, setIsLoadingStories] = useState(true);

    const getHeroMedia = (imageIndex: number) => {
      if (!heroImages || heroImages.length === 0) {
        return null;
      }
      return heroImages[(imageIndex - 1) % heroImages.length];
    };
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      getJson<any[]>("story-items/", { cache: true }),
      getJson<StoryPayload[]>("stories/", { cache: true }),
      getJson<ImpactVideoPayload[]>("impact-videos/", { cache: true }),
    ])
      .then(([storyItemsResult, storiesResult, videosResult]) => {
        if (!isMounted) return;

        const storyItems =
          storyItemsResult.status === "fulfilled" && Array.isArray(storyItemsResult.value)
            ? storyItemsResult.value
            : [];
        const publishedStories =
          storiesResult.status === "fulfilled" && Array.isArray(storiesResult.value)
            ? storiesResult.value
            : [];
        const videos =
          videosResult.status === "fulfilled" && Array.isArray(videosResult.value)
            ? videosResult.value
            : [];

        const storyItemHeroImages = storyItems.map((item: any) => ({
          image: assetUrl(item.image),
          alt: item.title || "Shivarpan Foundation impact",
        }));
        const publishedStoryHeroImages = publishedStories
          .filter((story) => story.featured_image?.url)
          .map((story) => ({
            image: assetUrl(story.featured_image?.url),
            alt: story.featured_image?.alt_text || story.title,
          }));
        const nextHeroImages =
          storyItemHeroImages.length > 0
            ? storyItemHeroImages
            : publishedStoryHeroImages;
        setHeroImages(nextHeroImages);
        setImpactVideos(videos);

        const fullStories = [...publishedStories]
          .sort(
            (a, b) =>
              Number(b.is_featured) - Number(a.is_featured) ||
              a.sort_order - b.sort_order,
          )
          .map((story, index): Story => ({
            id: story.id,
            slug: story.slug,
            title: story.title,
            image:
              assetUrl(story.featured_image?.url) ||
              nextHeroImages[index % Math.max(nextHeroImages.length, 1)]?.image ||
              "/placeholder.svg",
            date:
              story.date_label ||
              new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(story.publish_at)),
            location: story.location_label || "India",
            readTime: story.read_time || "3 min read",
            category: story.category || "Story",
            excerpt: story.excerpt || "A field dispatch from Shivarpan Foundation.",
            hasBody: story.has_body,
          }));

        const imageOnlyStories = storyItems.map(
          (item: any, index: number): Story => ({
            id: item.id ?? index,
            title: item.title || "Impact story",
            image: assetUrl(item.image) || "/placeholder.svg",
            date: "Field archive",
            location: "India",
            readTime: "Photo story",
            category: "Story",
            excerpt: "A moment from Shivarpan Foundation's work on the ground.",
            hasBody: false,
          }),
        );

        setStoriesData(fullStories.length > 0 ? fullStories : imageOnlyStories);

        if (storyItemsResult.status === "rejected") {
          reportApiError("Unable to load story media", storyItemsResult.reason);
        }
        if (storiesResult.status === "rejected") {
          reportApiError("Unable to load published stories", storiesResult.reason);
        }
        if (videosResult.status === "rejected") {
          reportApiError("Unable to load impact videos", videosResult.reason);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingStories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

    const reduceMotion = useReducedMotion();
    const introSectionRef = useRef<HTMLElement | null>(null);
    const heroScrollRef = useRef<HTMLDivElement | null>(null);
    const heroGridRef = useRef<HTMLDivElement | null>(null);
    const impactSectionRef = useRef<HTMLElement | null>(null);
    const { scrollYProgress: impactProgress } = useScroll({
      target: impactSectionRef,
      offset: ["start 85%", "end 25%"],
    });
    const smoothImpactProgress = useSpring(impactProgress, {
      stiffness: 110,
      damping: 28,
      mass: 0.35,
    });

    const titleY = useTransform(smoothImpactProgress, [0, 1], [28, -6]);
    const titleOpacity = useTransform(smoothImpactProgress, [0, 0.2, 1], [0.55, 1, 1]);
    const statsY = useTransform(smoothImpactProgress, [0, 1], [16, 0]);
    const statsOpacity = useTransform(smoothImpactProgress, [0, 0.25, 1], [0.6, 1, 1]);


    useLayoutEffect(() => {
      const sectionElement = introSectionRef.current;
      const scrollerElement = heroScrollRef.current;
      const gridElement = heroGridRef.current;
      if (!sectionElement || !scrollerElement || !gridElement) {
        return;
      }

      if (reduceMotion) {
        return;
      }

      const ctx = gsap.context(() => {
        const gridItems = gsap.utils.toArray<HTMLElement>(
          ".stories-codrops-grid > .stories-codrops-item",
        );

        const heroTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: gridElement,
            scroller: scrollerElement,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        gridItems.forEach((item) => {
          const image = item.querySelector<HTMLElement>(".stories-codrops-item-img");
          if (!image) {
            return;
          }

          const row = Number.parseFloat(getComputedStyle(item).getPropertyValue("--r")) || 1;
          const rowProgress = (row - 1) / Math.max(1, heroMaxRow - 1);
          const delayShift = (row % 5) * 0.012;
          const startAt = Math.min(0.94, rowProgress * 0.9 + delayShift);
          const driftDirection = row % 2 === 0 ? 1 : -1;
          const driftX = driftDirection * (16 + rowProgress * 54);
          const driftY = -(44 + rowProgress * 170);
          const driftRotate = driftDirection * (2 + rowProgress * 5);

          gsap.set(image, {
            transformOrigin: `${gsap.utils.random(0, 1) > 0.5 ? 0 : 100}% 100%`,
            scale: 1,
            opacity: 1,
          });

          heroTimeline.to(
            item,
            {
              x: driftX,
              y: driftY,
              rotate: driftRotate,
              ease: "none",
            },
            0,
          );

          // heroTimeline.to(
          //   image,
          //   {
          //     ease: "none",
          //     scale: 1,
          //     opacity: 1,
          //   },
          //   startAt,
          // );
        });

        const lockSectionScroll = (event: WheelEvent) => {
          const rect = sectionElement.getBoundingClientRect();
          const isHeroActive = rect.top <= 80 && rect.bottom >= window.innerHeight * 0.45;
          if (!isHeroActive) {
            return;
          }

          const maxScroll = Math.max(0, scrollerElement.scrollHeight - scrollerElement.clientHeight);
          if (maxScroll <= 0) {
            return;
          }

          const atTop = scrollerElement.scrollTop <= 1;
          const atBottom = scrollerElement.scrollTop >= maxScroll - 1;
          const isScrollingDown = event.deltaY > 0;
          const isScrollingUp = event.deltaY < 0;

          // Release control to the page scroll once mini-scroll reaches either edge.
          if ((isScrollingDown && atBottom) || (isScrollingUp && atTop)) {
            return;
          }

          const nextScrollTop = gsap.utils.clamp(0, maxScroll, scrollerElement.scrollTop + event.deltaY);
          if (nextScrollTop !== scrollerElement.scrollTop) {
            event.preventDefault();
            scrollerElement.scrollTop = nextScrollTop;
          }
        };

        window.addEventListener("wheel", lockSectionScroll, { passive: false });

        return () => {
          window.removeEventListener("wheel", lockSectionScroll);
        };
      }, sectionElement);
      ScrollTrigger.refresh();

      return () => {
        ctx.revert();
      };
    }, [reduceMotion]);

  const leadStory = storiesData?.[0];
  const supportStories = storiesData?.slice(1, 3) || [];
  const dispatchStories = storiesData.slice(3);

    return (
      <div className="relative overflow-hidden bg-background">
        <section
          ref={introSectionRef}
          className="stories-codrops-hero relative isolate"
        >
          <div className="stories-codrops-overlay">
            <div className="stories-codrops-cover">
              <span className="stories-codrops-tag">Community Impact</span>
              <h1 className="stories-codrops-title">
                Stories<sup>&reg;</sup>
              </h1>
              <p className="stories-codrops-subtitle">
                Ground reports, transformation journeys, and measurable impact from the
                communities we serve.
              </p>
            </div>
          </div>

          <div ref={heroScrollRef} className="stories-codrops-scroll">
            <div ref={heroGridRef} className="stories-codrops-grid">
          {heroGridItems.map((item, index) => {
    const media = getHeroMedia(item.imageIndex);

    if (!media) return null;

    const style = {
      "--r": item.row,
      "--c": item.col,
      "--cm": Math.max(1, Math.ceil(item.col / 2)),
    } as CSSProperties;

    return (
      <div
        key={`hero-${item.row}-${item.col}-${index}`}
        className="stories-codrops-item"
        style={style}
      >
        <div
          className="stories-codrops-item-img"
          style={{ backgroundImage: `url(${media.image})` }}
        />
      </div>
    );
  })}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-background/70 to-background" />
        </section>

        {isLoadingStories ? (
          <section className="px-4 py-16">
            <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-border bg-card p-6 text-center text-sm font-medium text-muted-foreground">
              Loading stories...
            </div>
          </section>
        ) : null}

        {!isLoadingStories && storiesData.length === 0 ? (
          <section className="px-4 py-16">
            <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-border bg-card p-6 text-center">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                No stories are published yet.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                New stories are coming soon.
              </p>
            </div>
          </section>
        ) : null}

        {storiesData.length > 0 ? (
          <>
        <section ref={impactSectionRef} className="relative pt-12 pb-14 md:pt-16 md:pb-20">
          <div className="container relative mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <motion.div
                style={{ y: titleY, opacity: titleOpacity }}
                className="relative overflow-hidden lg:col-span-7 rounded-[2.4rem] border border-border/70 bg-[linear-gradient(145deg,hsl(var(--background))_0%,hsl(var(--card))_58%,hsl(var(--accent)/0.08)_100%)] p-6 shadow-[0_32px_90px_-60px_hsl(var(--foreground))] md:p-8"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_55%),radial-gradient(circle_at_top_right,hsl(var(--accent)/0.16),transparent_46%)]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--accent)/0.08)_100%)]"
                />

                <div className="relative flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Stories
                  </span>
                  <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Field Dispatches
                  </span>
                </div>

                <div className="relative mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_15rem]">
                  <div>
                    <h2 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-[2.9rem]">
                      Ground-Level Impact, Told with Clarity
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      From emergency response to long-term community programs, these
                      stories are shaped like field dispatches: clear context, visible
                      outcomes, and the human momentum behind every intervention.
                    </p>
                  </div>

                  <div className="rounded-[1.6rem] border border-border/70 bg-background/90 p-4 shadow-[0_18px_40px_-34px_hsl(var(--foreground))] backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                      Editorial Lens
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      We treat each story as a verified ground note, not a generic
                      update. What happened, where it happened, and why it matters
                      come first.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ y: statsY, opacity: statsOpacity }}
                className="grid gap-3 sm:grid-cols-2 lg:col-span-5"
              >
                {storyStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className="rounded-[1.6rem] border border-border/80 bg-card px-4 py-4 shadow-[0_16px_45px_-42px_hsl(var(--foreground))]"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Story Metric
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold leading-none text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="mt-10 grid items-start gap-6 lg:grid-cols-12">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="self-start lg:col-span-7 overflow-hidden rounded-[2.2rem] border border-border/80 bg-card p-4 shadow-[0_30px_85px_-58px_hsl(var(--foreground))] md:p-5"
              >
                <div className="grid gap-5 md:grid-cols-12">
                  <div className="relative min-h-[380px] overflow-hidden rounded-[1.8rem] md:col-span-7">
                  {leadStory && (
    <img
      src={leadStory.image}
      alt={leadStory.title}
      className="h-full w-full object-cover"
    />
  )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/18 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <Badge className="bg-accent text-accent-foreground">
                      <p>{leadStory?.category}</p>
                      </Badge>
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs text-primary-foreground/90">
                        <MapPin className="h-3.5 w-3.5" />
                        {leadStory?.location}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-[1.5rem] border border-primary-foreground/20 bg-foreground/55 p-4 text-primary-foreground backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
                        Lead Dispatch
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
                        Rapid coordination compressed response time while keeping
                        aid delivery structured, dignified, and visible on the ground.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:col-span-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                      Featured Story
                    </p>
                    <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground">
                      {leadStory?.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {leadStory?.excerpt}
                    </p>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl border border-border/80 bg-background px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Published
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {leadStory?.date}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/80 bg-background px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Reading Time
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-primary" />
                          {leadStory?.readTime}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                        Story Angle
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        This lead piece shows how the foundation moves from immediate
                        crisis recognition to fast logistics and verified family support.
                      </p>
                    </div>

                    {leadStory?.hasBody && leadStory.slug ? (
                      <Link
                        to={`/news-stories/${leadStory.slug}`}
                        className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/75"
                      >
                        Read Lead Dispatch
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </motion.article>

              <div className="grid gap-4 lg:col-span-5">
                {supportStories.map((story, index) => (
                  <motion.article
                    key={story.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8%" }}
                    transition={{ duration: 0.55, delay: index * 0.08 }}
                    className="overflow-hidden rounded-[1.8rem] border border-border/80 bg-card p-4 shadow-[0_22px_60px_-50px_hsl(var(--foreground))]"
                  >
                    <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
                      <div className="relative h-44 overflow-hidden rounded-[1.4rem] sm:h-full">
                        <img
    src={story?.image}
    alt={story?.title}
    className="h-full w-full object-cover"
  />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-primary/12 text-primary hover:bg-primary/12">
                            {story?.category}
                          </Badge>
                          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            {story.date}
                          </span>
                        </div>
                        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">
                          {story.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {story.excerpt}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {story.location}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-primary" />
                            {story.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}

                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ duration: 0.55, delay: 0.12 }}
                  className="rounded-[1.9rem] border border-border/80 bg-foreground p-5 text-primary-foreground shadow-[0_24px_70px_-52px_hsl(var(--foreground))]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                    Story Blueprint
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                    Why this section reads differently
                  </h3>
                  <div className="mt-5 space-y-4">
                    {storyEditorialPillars.map((pillar) => (
                      <div
                        key={pillar.title}
                        className="rounded-[1.2rem] border border-primary-foreground/12 bg-primary-foreground/6 p-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                          {pillar.title}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-primary-foreground/82">
                          {pillar.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.article>
              </div>
            </div>

            <ImpactVideoSection videos={impactVideos} />

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {dispatchStories.map((story, index) => (
                <motion.article
                  key={story.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="group overflow-hidden rounded-[1.8rem] border border-border/80 bg-card p-4 shadow-[0_20px_55px_-48px_hsl(var(--foreground))]"
                >
                  <div className="relative h-56 overflow-hidden rounded-[1.4rem]">
                    <img
    src={story?.image}
    alt={story?.title}
    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
  />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4">
                      <Badge className="bg-accent text-accent-foreground">
                        {story?.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {story.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {story.date}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {story.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5 text-primary" />
                        {story.readTime}
                      </span>
                      {story.hasBody && story.slug ? (
                        <Link
                          to={`/news-stories/${story.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/75"
                        >
                          Read Dispatch
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
          </>
        ) : null}
        {storiesData.length === 0 && impactVideos.length > 0 ? (
          <ImpactVideoSection videos={impactVideos} />
        ) : null}
      </div>
    );
  };

  export default NewsStories;
