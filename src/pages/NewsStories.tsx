  import { useLayoutEffect, useRef } from "react";
  import type { CSSProperties } from "react";
  import { useEffect, useState } from "react";
  import {
    motion,
    MotionValue,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
  } from "framer-motion";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { ArrowUpRight, Calendar, Clock3, MapPin, Sparkles } from "lucide-react";
  import { Badge } from "@/components/ui/badge";
  import { useIsMobile } from "@/hooks/use-mobile";
  import { assetUrl, getJson } from "@/lib/api";
  import aboutHero from "@/assets/about-hero-optimized.jpg";
  import campaignFood from "@/assets/campaign-food.jpg";
  import campaignEducation from "@/assets/campaign-education.jpg";
  import campaignHealth from "@/assets/campaign-health.jpg";
  import campaignEnvironment from "@/assets/campaign-environment.jpg";

  gsap.registerPlugin(ScrollTrigger);

  interface Story {
    title: string;
    image: string;
    date: string;
    location: string;
    readTime: string;
    category: string;
    excerpt: string;
  }

  interface FlipShowcaseCard {
    id: string;
    title: string;
    category: string;
    image: string;
    alt: string;
    metric: string;
    summary: string;
    cta: string;
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

  const fallbackHeroImages = [
    aboutHero,
    campaignFood,
    campaignEducation,
    campaignHealth,
    campaignEnvironment,
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





  const flipSpreadPositionsDesktop = [14, 38, 62, 86];
  const flipSpreadPositionsMobile = [22, 40, 60, 78];
  const flipSpreadRotationsDesktop = [-15, -7.5, 7.5, 15];
  const flipSpreadRotationsMobile = [-12, -5.5, 5.5, 12];
  const flipFloatingDelays = [0, 0.2, 0.4, 0.6];
  const heroMaxRow = Math.max(...heroGridItems.map((item) => item.row));

  interface FlipStoryCardProps {
    card: FlipShowcaseCard;
    index: number;
    progress: MotionValue<number>;
    targetLeft: number;
    targetRotation: number;
    reduceMotion: boolean;
  }

  const FlipStoryCard = ({
    card,
    index,
    progress,
    targetLeft,
    targetRotation,
    reduceMotion,
  }: FlipStoryCardProps) => {
    const spreadEnd = 0.22;
    const staggerOffset = index * 0.04;
    const flipStart = Math.min(0.24 + staggerOffset, 0.9);
    const flipEnd = Math.min(0.56 + staggerOffset, 0.98);

    const leftValue = useTransform(progress, [0, spreadEnd, 1], [50, targetLeft, targetLeft]);
    const left = useTransform(leftValue, (value) => `${value}%`);
    const cardRotation = useTransform(
      progress,
      [0, spreadEnd, flipStart, flipEnd, 1],
      [0, targetRotation, targetRotation, 0, 0],
    );
    const frontRotation = useTransform(progress, [0, flipStart, flipEnd, 1], [0, 0, -180, -180]);
    const backRotation = useTransform(progress, [0, flipStart, flipEnd, 1], [180, 180, 0, 0]);
    const ambientLift = useTransform(progress, [0, 0.5, 1], [0, -4, 0]);

    return (
      <motion.article
        style={{
          top: "48%",
          left,
          x: "-50%",
          y: "-50%",
          rotate: cardRotation,
        }}
        className="absolute h-[clamp(13.5rem,52vw,18rem)] w-[clamp(9.5rem,36vw,13rem)] [perspective:1200px] sm:h-[clamp(15rem,42vw,22rem)] sm:w-[clamp(10.5rem,30vw,16rem)] lg:h-[clamp(16.5rem,38vw,26rem)] lg:w-[clamp(11.5rem,24vw,18.75rem)]"
      >
        <motion.div
          style={{ y: ambientLift }}
          animate={reduceMotion ? undefined : { y: [0, -28, 0] }}
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: flipFloatingDelays[index % flipFloatingDelays.length],
                }
          }
          className="relative h-full w-full"
        >
          <div className="relative h-full w-full [transform-style:preserve-3d]">
            <motion.div
              style={{ rotateY: frontRotation, backfaceVisibility: "hidden" }}
              className="absolute inset-0 overflow-hidden rounded-xl border border-primary-foreground/20 bg-card shadow-[0_24px_45px_hsl(var(--foreground)/0.35)]"
            >
              <img
                src={card.image}
                alt={card.alt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-primary/15" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
                  {card.category}
                </p>
                <h3 className="mt-1 line-clamp-2 text-lg font-display font-bold leading-tight">
                  {card.title}
                </h3>
              </div>
            </motion.div>

            <motion.div
              style={{ rotateY: backRotation, backfaceVisibility: "hidden" }}
              className="absolute inset-0 flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 text-foreground shadow-[0_24px_45px_hsl(var(--foreground)/0.2)]"
            >
              <Badge className="w-fit bg-primary/12 text-primary">{card.category}</Badge>

              <div className="space-y-2">
                <p className="font-display text-2xl font-bold leading-tight text-foreground">
                  {card.metric}
                </p>
                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {card.summary}
                </p>
              </div>

              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {card.cta}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.article>
    );
  };
  const NewsStories = () => {

    const [flipCards, setFlipCards] = useState<FlipShowcaseCard[]>([]);
    const [heroImages, setHeroImages] = useState<any[]>([]);
    const [storiesData, setStoriesData] = useState<Story[]>([]);

    const getHeroMedia = (imageIndex: number) => {
    if (!heroImages || heroImages.length === 0) {
    return {
      image: fallbackHeroImages[(imageIndex - 1) % fallbackHeroImages.length],
      alt: "fallback"
    };
  }
      return heroImages[(imageIndex - 1) % heroImages.length];
    };
  useEffect(() => {
    const getFallbackItems = () => {
      const fallbackItems = stories.map((story, index) => ({
        id: index + 1,
        title: story.title,
        image: story.image,
        category: "Impact Story",
        description: story.excerpt,
        date: story.date,
        location: "India",
        sort_order: index,
      }));

      if (fallbackItems.length < 4) {
        fallbackItems.push({
          id: 4,
          title: "Community Volunteers in Action",
          image: fallbackHeroSlides[0].url,
          category: "Volunteer Impact",
          description: "A closer look at the volunteers powering our field programs.",
          date: "Mar 2026",
          location: "India",
          sort_order: 3,
        });
      }

      return fallbackItems;
    };

    getJson<any[]>("story-items/")
      .then((items) => {
        const storyItems = Array.isArray(items) && items.length ? items : getFallbackItems();

        setFlipCards(
          storyItems.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category || "Story",
            image: assetUrl(item.image),
            alt: item.title,
            metric: "Impact",
            summary: item.description || "Story summary",
            cta: "Read More",
          })),
        );

        setHeroImages(
          storyItems.map((item: any) => ({
            image: assetUrl(item.image),
            alt: item.title || "Hero Image",
          })),
        );

        setStoriesData(
          storyItems.map((item: any) => ({
            title: item.title,
            image: assetUrl(item.image),
            date: item.date || "Mar 2026",
            location: item.location || "India",
            readTime: "3 min read",
            category: item.category || "Story",
            excerpt: item.description || "Story description",
          })),
        );
      })
      .catch(() => {
        const fallbackItems = getFallbackItems();

        setFlipCards(
          fallbackItems.map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            image: assetUrl(item.image),
            alt: item.title,
            metric: "Impact",
            summary: item.description,
            cta: "Read More",
          })),
        );

        setHeroImages(
          fallbackItems.map((item) => ({
            image: assetUrl(item.image),
            alt: item.title,
          })),
        );

        setStoriesData(
          fallbackItems.map((item) => ({
            title: item.title,
            image: assetUrl(item.image),
            date: item.date,
            location: item.location,
            readTime: "3 min read",
            category: item.category,
            excerpt: item.description,
          })),
        );
      });
  }, []);

    const reduceMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const introSectionRef = useRef<HTMLElement | null>(null);
    const heroScrollRef = useRef<HTMLDivElement | null>(null);
    const heroGridRef = useRef<HTMLDivElement | null>(null);
    const impactSectionRef = useRef<HTMLElement | null>(null);
    const flipSectionRef = useRef<HTMLElement | null>(null);
    const reducedProgress = useMotionValue(1);
    const flipScrollProgress = useMotionValue(0);
    const { scrollYProgress: impactProgress } = useScroll({
      target: impactSectionRef,
      offset: ["start 85%", "end 25%"],
    });
    const flipProgressSource = reduceMotion ? reducedProgress : flipScrollProgress;
    const smoothImpactProgress = useSpring(impactProgress, {
      stiffness: 110,
      damping: 28,
      mass: 0.35,
    });
    const smoothFlipProgress = useSpring(flipProgressSource, {
      stiffness: 220,
      damping: 34,
      mass: 0.2,
    });

    const titleY = useTransform(smoothImpactProgress, [0, 1], [28, -6]);
    const titleOpacity = useTransform(smoothImpactProgress, [0, 0.2, 1], [0.55, 1, 1]);
    const statsY = useTransform(smoothImpactProgress, [0, 1], [16, 0]);
    const statsOpacity = useTransform(smoothImpactProgress, [0, 0.25, 1], [0.6, 1, 1]);
    const flipHeaderY = useTransform(smoothFlipProgress, [0, 1], [-8, -34]);
    const flipHeaderOpacity = useTransform(smoothFlipProgress, [0, 1], [1, 1]);
    const flipTitleScale = useTransform(smoothFlipProgress, [0, 0.18, 1], [1.18, 1.08, 0.94]);
    const flipCardsY = useTransform(
      smoothFlipProgress,
      [0, 1],
      [isMobile ? 12 : 14, isMobile ? 28 : 42],
    );
    const flipBackdropScale = useTransform(smoothFlipProgress, [0, 1], [1.08, 1]);
    const flipHintOpacity = useTransform(smoothFlipProgress, [0, 0.15, 0.95, 1], [0, 0.8, 0.8, 0.24]);
    const spreadPositions = isMobile ? flipSpreadPositionsMobile : flipSpreadPositionsDesktop;
    const spreadRotations = isMobile ? flipSpreadRotationsMobile : flipSpreadRotationsDesktop;


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

    useLayoutEffect(() => {
      const flipElement = flipSectionRef.current;
      if (!flipElement || reduceMotion) {
        return;
      }

      const ctx = gsap.context(() => {
        const trigger = ScrollTrigger.create({
          trigger: flipElement,
          start: "center center",
          end: "+=140%",
          scrub: true,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            flipScrollProgress.set(self.progress);
          },
        });

        return () => {
          trigger.kill();
        };
      }, flipElement);

      ScrollTrigger.refresh();

      return () => {
        ctx.revert();
      };
    }, [flipScrollProgress, reduceMotion]);

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

        <section ref={impactSectionRef} className="relative pt-14 pb-20 md:pt-20 md:pb-28">
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
                  <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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

            <div className="mt-14 grid gap-6 lg:grid-cols-12">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-7 overflow-hidden rounded-[2.2rem] border border-border/80 bg-card p-4 shadow-[0_30px_85px_-58px_hsl(var(--foreground))] md:p-5"
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
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
                        Lead Dispatch
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
                        Rapid coordination compressed response time while keeping
                        aid delivery structured, dignified, and visible on the ground.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:col-span-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
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
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Published
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {leadStory?.date}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/80 bg-background px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Reading Time
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-primary" />
                          {leadStory?.readTime}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-border/80 bg-background p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        Story Angle
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        This lead piece shows how the foundation moves from immediate
                        crisis recognition to fast logistics and verified family support.
                      </p>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read Lead Dispatch
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
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
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
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
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Read Dispatch
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section ref={flipSectionRef} className="relative h-screen overflow-hidden isolate">
          <div className="h-full overflow-hidden bg-background">
            <motion.div
              aria-hidden
              style={{ scale: flipBackdropScale }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.18),transparent_50%),radial-gradient(circle_at_85%_20%,hsl(var(--accent)/0.2),transparent_46%),radial-gradient(circle_at_50%_85%,hsl(var(--primary)/0.14),transparent_48%)]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
            <div className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

            <div className="relative z-10 container mx-auto flex h-full flex-col px-4 pb-20 pt-6 md:pb-24 md:pt-8">
              <motion.div
                style={{ y: flipHeaderY, opacity: flipHeaderOpacity }}
                className="relative z-30 mx-auto max-w-4xl text-center text-foreground"
              >
                <span className="inline-flex items-center mt-3 gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary sm:text-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                  Compassion Stories
                </span>

                <motion.h2
                  style={{ scale: flipTitleScale }}
                  className="mt-4 origin-top font-display text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                >
                  Every Card Holds a Story of Care and Hope
                </motion.h2>

                <p className="mx-auto mt-7 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  From food support to health outreach, each card reflects real people,
                  volunteer effort, and the dignity-first work our NGO continues on the ground.
                </p>
              </motion.div>

              <motion.div
                style={{ y: flipCardsY }}
                className="relative z-10 mx-auto mb-8 mt-8 flex-1 w-full max-w-6xl sm:mt-14 sm:mb-10 md:mb-16 md:mt-[150px]"
              >
                {flipCards.slice(0, 4).map((card, index) => (
                  <FlipStoryCard
                    key={card.id}
                    card={card}
                    index={index}
                    progress={smoothFlipProgress}
                    targetLeft={spreadPositions[index]}
                    targetRotation={spreadRotations[index]}
                    reduceMotion={Boolean(reduceMotion)}
                  />
                ))}
              </motion.div>

              <motion.p
                style={{ opacity: flipHintOpacity }}
                className="pointer-events-none mx-auto mt-auto rounded-full border border-border bg-card/85 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                Scroll to witness stories of care, courage, and community support
              </motion.p>
            </div>
          </div>
        </section>
      </div>
    );
  };

  export default NewsStories;
