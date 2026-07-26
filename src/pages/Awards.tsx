import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import { assetUrl, getJson } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

interface AwardRecognition {
  id: number;
  title: string;
  category: string;
  presenter: string;
  year: string;
  summary: string;
  image: string;
  detailImages: string[];
  isUpcoming: boolean;
}

interface PreviewController {
  setProduct: (product: HTMLElement | null) => void;
  onResize: () => void;
  kill: () => void;
}

interface UpcomingAward {
  id: number;
  title: string;
  category: string;
  presenter: string;
  date: string;
  location: string;
  summary: string;
  image: string;
  shellClass: string;
}

const heroKineticLines = [
  "awards awards awards",
  "recognition recognition recognition",
  "impact impact impact",
  "milestones milestones milestones",
  "awards awards awards",
  "recognition recognition recognition",
  "impact impact impact",
  "milestones milestones milestones",
];

const Awards = () => {
  const [awardRecognitions, setAwardRecognitions] = useState<AwardRecognition[]>([]);
  const [isLoadingAwards, setIsLoadingAwards] = useState(true);
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [isHeroAnimating, setIsHeroAnimating] = useState(false);
  const experienceSectionRef = useRef<HTMLElement | null>(null);
  const heroTypeRef = useRef<HTMLDivElement | null>(null);
  const heroContentRef = useRef<HTMLDivElement | null>(null);
  const heroLineRefs = useRef<HTMLSpanElement[]>([]);
  const heroTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const parallaxSectionRef = useRef<HTMLElement | null>(null);
  const parallaxWrapperRef = useRef<HTMLDivElement | null>(null);
  const parallaxTrackRef = useRef<HTMLDivElement | null>(null);

  const productsRootRef = useRef<HTMLDivElement | null>(null);
  const previewLeftRef = useRef<HTMLDivElement | null>(null);
  const previewRightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getJson<any[]>("awards/")
      .then((res) => {
        const items = Array.isArray(res) ? res : [];
        const formatted = items
          .map((item: any, index: number) => {
            const imageUrl = assetUrl(item?.image?.url);
            if (!imageUrl) {
              return null;
            }
            const detailImages = Array.isArray(item?.detail_images)
              ? item.detail_images
                  .map((img: any) => assetUrl(img?.url))
                  .filter(Boolean)
              : [];
            return {
              id: item?.id ?? index,
              title: item?.title ?? "Recognition",
              category: item?.category ?? "",
              presenter: item?.presenter ?? "",
              year: item?.year ?? "",
              summary: item?.summary ?? "",
              image: imageUrl,
              detailImages: detailImages.length ? detailImages : [imageUrl],
              isUpcoming: Boolean(item?.is_upcoming),
            } as AwardRecognition;
          })
          .filter(Boolean) as AwardRecognition[];

        setAwardRecognitions(formatted);
      })
      .catch(() => {
        setAwardRecognitions([]);
      })
      .finally(() => {
        setIsLoadingAwards(false);
      });
  }, []);

  const parallaxSlides = useMemo(
    () => {
      if (awardRecognitions.length === 0) {
        return [];
      }

      return (
      Array.from({ length: 14 }, (_, index) => {
        const award = awardRecognitions[index % awardRecognitions.length];
        return {
          id: `${award.id}-${index}`,
          image: award.image,
          title: award.title,
          year: award.year,
        };
      })
      );
    },
    [awardRecognitions],
  );

  const previewLeftCards = useMemo(
    () => awardRecognitions,
    [awardRecognitions],
  );
  const previewRightCards = useMemo(
    () => awardRecognitions,
    [awardRecognitions],
  );

  const upcomingAwardCards = useMemo<UpcomingAward[]>(
    () => {
      const shellClasses = [
        "from-black via-[#17120a] to-[#7a4b00]",
        "from-[#1b1200] via-[#7b5a12] to-[#f2a532]",
        "from-[#12051d] via-[#3b1463] to-[#d3a200]",
      ];

      return awardRecognitions.filter((award) => award.isUpcoming).slice(0, 3).map((award, index) => ({
        id: award.id,
        title: award.title,
        category: award.category || "Upcoming Award",
        presenter: award.presenter || "Presented by Shivarpan Foundation",
        date: award.year || "Date to be announced",
        location: "Venue to be announced",
        summary: award.summary || "A new recognition showcase is being prepared for outstanding nominees.",
        image: award.image,
        shellClass: shellClasses[index % shellClasses.length],
      }));
    },
    [awardRecognitions],
  );

  const scrollToExperience = () => {
    window.setTimeout(() => {
      experienceSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const startExperience = () => {
    if (isHeroAnimating) {
      return;
    }

    if (!experienceStarted) {
      const typeEl = heroTypeRef.current;
      const contentEl = heroContentRef.current;
      const lines = heroLineRefs.current.filter(Boolean);

      if (!typeEl || !contentEl || lines.length === 0) {
        setExperienceStarted(true);
        scrollToExperience();
        return;
      }

      setIsHeroAnimating(true);
      heroTimelineRef.current?.kill();

      heroTimelineRef.current = gsap
        .timeline({
          onComplete: () => {
            setIsHeroAnimating(false);
            gsap.set(typeEl, { clearProps: "transform,opacity" });
            gsap.set(lines, { clearProps: "transform,opacity" });
            gsap.set(contentEl, { clearProps: "transform,opacity,filter" });
          },
        })
        .addLabel("start", 0)
        .addLabel("typeTransition", 0.25)
        .addLabel("experience", 2.25)
        .to(
          contentEl,
          {
            duration: 0.8,
            ease: "power2.inOut",
            opacity: 0,
            filter: "blur(14px)",
            yPercent: -8,
          },
          "start",
        )
        .to(
          typeEl,
          {
            duration: 1.4,
            ease: "power2.inOut",
            scale: 2.7,
            rotate: -90,
          },
          "typeTransition",
        )
        .to(
          lines,
          {
            keyframes: [
              { x: "20%", duration: 1, ease: "power1.inOut" },
              { x: "-200%", duration: 1.5, ease: "power1.in" },
            ],
            stagger: 0.04,
          },
          "typeTransition",
        )
        .to(
          lines,
          {
            keyframes: [
              { opacity: 1, duration: 1, ease: "power1.in" },
              { opacity: 0, duration: 1.5, ease: "power1.in" },
            ],
          },
          "typeTransition",
        )
        .add(() => {
          setExperienceStarted(true);
          scrollToExperience();
        }, "experience")
        .to(
          contentEl,
          {
            duration: 0.7,
            ease: "power3.out",
            opacity: 1,
            filter: "blur(0px)",
            yPercent: 0,
          },
          "experience",
        );

      return;
    }

    scrollToExperience();
  };

  useLayoutEffect(() => {
    return () => {
      heroTimelineRef.current?.kill();
    };
  }, []);

  useLayoutEffect(() => {
    document.body.classList.toggle("awards-hide-footer", !experienceStarted);
    return () => {
      document.body.classList.remove("awards-hide-footer");
    };
  }, [experienceStarted]);

  useLayoutEffect(() => {
    if (!experienceStarted) {
      return;
    }

    const section = parallaxSectionRef.current;
    const wrapper = parallaxWrapperRef.current;
    const track = parallaxTrackRef.current;

    if (!section || !wrapper || !track) {
      return;
    }

    const ctx = gsap.context(() => {
      let timeline: gsap.core.Timeline | null = null;

      const mediaItems = Array.from(track.querySelectorAll<HTMLElement>(".awards-hpg__media"));
      const images = Array.from(track.querySelectorAll<HTMLElement>(".awards-hpg__img"));
      const clamp = gsap.utils.clamp(-1, 1);

      const applyImageParallax = () => {
        const viewportCenter = window.innerWidth * 0.5;
        mediaItems.forEach((media, index) => {
          const image = images[index];
          if (!image) {
            return;
          }
          const rect = media.getBoundingClientRect();
          const mediaCenter = rect.left + rect.width * 0.5;
          const t = clamp((mediaCenter - viewportCenter) / viewportCenter);
          const distance = Math.abs(t);
          const mediaScale = Math.max(0.84, 1.08 - distance * 0.2);
          const mediaOpacity = 1 - distance * 0.28;
          const blurPx = distance * 3.5;

          gsap.set(media, {
            scale: mediaScale,
            opacity: mediaOpacity,
            filter: `blur(${blurPx}px)`,
            transformOrigin: "center center",
          });
          gsap.set(image, { xPercent: -t * 7 });
        });
      };

      const buildTimeline = () => {
        const maxScroll = Math.max(0, track.scrollWidth - wrapper.clientWidth);
        const introHold = Math.min(window.innerHeight * 0.1, 80);
        const firstMedia = mediaItems[0];
        const lastMedia = mediaItems[mediaItems.length - 1];

        const startX = firstMedia
          ? wrapper.clientWidth * 0.5 - (firstMedia.offsetLeft + firstMedia.offsetWidth * 0.5)
          : 0;
        const endX = lastMedia
          ? wrapper.clientWidth * 0.5 - (lastMedia.offsetLeft + lastMedia.offsetWidth * 0.5)
          : -maxScroll;
        const travelDistance = Math.abs(endX - startX);

        timeline?.scrollTrigger?.kill();
        timeline?.kill();

        if (travelDistance <= 2) {
          gsap.set(track, { x: startX });
          applyImageParallax();
          return;
        }

        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top+=80",
            end: () => `+=${travelDistance + window.innerHeight * 0.45 + introHold}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: applyImageParallax,
          },
        });

        gsap.set(track, { x: startX });
        timeline.to({}, { duration: 0.05, ease: "none" }, 0);
        timeline.to(track, { x: endX, ease: "none", duration: 1 }, 0.05);
        applyImageParallax();
      };

      buildTimeline();

      const onResize = () => {
        buildTimeline();
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        timeline?.scrollTrigger?.kill();
        timeline?.kill();
      };
    }, section);

    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
    };
  }, [experienceStarted]);

  useLayoutEffect(() => {
    if (!experienceStarted) {
      return;
    }

    if (window.matchMedia("(max-width: 1024px)").matches) {
      return;
    }

    const productsRoot = productsRootRef.current;
    const previewLeft = previewLeftRef.current;
    const previewRight = previewRightRef.current;

    if (!productsRoot || !previewLeft || !previewRight) {
      return;
    }

    const ctx = gsap.context(() => {
      const createPreviewController = (
        container: HTMLElement,
        products: HTMLElement[],
      ): PreviewController => {
        const clipped = container.querySelector<HTMLElement>(".awards-masked-preview");
        const title = container.querySelector<HTMLElement>(".awards-product-title");
        const presenter = container.querySelector<HTMLElement>(".awards-product-presenter");
        const year = container.querySelector<HTMLElement>(".awards-product-year");
        const allPreviewImages = Array.from(
          container.querySelectorAll<HTMLImageElement>(".awards-product-preview__images img"),
        );

        const previewImagesPerId = new Map<string, HTMLImageElement[]>();
        allPreviewImages.forEach((image) => {
          const id = image.dataset.id ?? "";
          const current = previewImagesPerId.get(id) ?? [];
          current.push(image);
          previewImagesPerId.set(id, current);
        });

        let armWidth = { x: 10, y: 10 };
        let scaleFactor = { x: 1, y: 1 };
        let timeline: gsap.core.Timeline | null = null;
        let galleryTimeline: gsap.core.Timeline | null = null;

        const collapsedClipPath = `polygon(
          50% 0%, 50% 0%, 50% 50%,
          100% 50%, 100% 50%, 50% 50%,
          50% 100%, 50% 100%, 50% 50%,
          0% 50%, 0% 50%, 50% 50%
        )`;

        const expandedClipPath = () => `polygon(
          ${50 - armWidth.x / 2}% 0%,
          ${50 + armWidth.x / 2}% 0%,
          ${50 + armWidth.x / 2}% ${50 - armWidth.y / 2}%,
          100% ${50 - armWidth.y / 2}%,
          100% ${50 + armWidth.y / 2}%,
          ${50 + armWidth.x / 2}% ${50 + armWidth.y / 2}%,
          ${50 + armWidth.x / 2}% 100%,
          ${50 - armWidth.x / 2}% 100%,
          ${50 - armWidth.x / 2}% ${50 + armWidth.y / 2}%,
          0% ${50 + armWidth.y / 2}%,
          0% ${50 - armWidth.y / 2}%,
          ${50 - armWidth.x / 2}% ${50 - armWidth.y / 2}%
        )`;

        const buildTimeline = () => {
          timeline?.kill();

          timeline = gsap.timeline({
            paused: true,
            defaults: { ease: "power2.inOut" },
          });

          timeline
            .to(container, { autoAlpha: 1 }, 0)
            .to(
              container,
              {
                scaleX: scaleFactor.x,
                scaleY: scaleFactor.y,
                transformOrigin: "center center",
              },
              0,
            )
            .to(
              products,
              {
                autoAlpha: 0,
                x: (index) => (index % 2 === 0 ? "2.5vw" : "-2.5vw"),
                y: (index) => (index < 2 ? "2.5vw" : "-2.5vw"),
              },
              0,
            );

          if (clipped) {
            timeline.fromTo(
              clipped,
              { clipPath: expandedClipPath() },
              { clipPath: collapsedClipPath },
              0,
            );
          }
        };

        const startPreviewGallery = (id: string) => {
          galleryTimeline?.kill();
          const images = previewImagesPerId.get(id) ?? [];
          if (!images.length) {
            return;
          }

          gsap.set(images, { autoAlpha: 0 });
          const sequence = gsap.timeline({ repeat: -1 });
          images.forEach((image) => {
            sequence.set(images, { autoAlpha: 0 }).set(image, { autoAlpha: 1 }).to({}, { duration: 0.6 });
          });
          galleryTimeline = sequence;
        };

        const onResize = () => {
          const bounds = container.getBoundingClientRect();
          if (!bounds.width || !bounds.height) {
            return;
          }

          const vw = window.innerWidth / 100 || 1;
          const armWidthVw = 5;
          const armWidthPx = armWidthVw * vw;

          armWidth = {
            x: (armWidthPx / bounds.width) * 100,
            y: (armWidthPx / bounds.height) * 100,
          };

          const widthInVw = bounds.width / vw;
          const heightInVw = bounds.height / vw;
          const shrinkVw = 5;

          scaleFactor = {
            x: (widthInVw - shrinkVw) / widthInVw,
            y: (heightInVw - shrinkVw) / heightInVw,
          };

          buildTimeline();
        };

        const setProduct = (product: HTMLElement | null) => {
          galleryTimeline?.kill();

          if (product) {
            const id = product.dataset.id ?? "";
            if (title) {
              title.textContent = product.dataset.name ?? "";
            }
            if (presenter) {
              presenter.textContent = product.dataset.presenter ?? "";
            }
            if (year) {
              year.textContent = product.dataset.year ?? "";
            }

            gsap.set(allPreviewImages, { autoAlpha: 0 });
            gsap.set(previewImagesPerId.get(id) ?? [], { autoAlpha: 1 });
            timeline?.play(0);
            startPreviewGallery(id);
          } else {
            timeline?.reverse();
          }
        };

        const kill = () => {
          timeline?.kill();
          galleryTimeline?.kill();
        };

        gsap.set(container, { autoAlpha: 0 });
        gsap.set(allPreviewImages, { autoAlpha: 0 });

        return { setProduct, onResize, kill };
      };

      const products = Array.from(productsRoot.querySelectorAll<HTMLElement>(".awards-product"));
      if (!products.length) {
        return;
      }

      const previewForLeftProducts = createPreviewController(
        previewRight,
        products.filter((_, index) => index % 4 === 2 || index % 4 === 3),
      );
      const previewForRightProducts = createPreviewController(
        previewLeft,
        products.filter((_, index) => index % 4 === 0 || index % 4 === 1),
      );

      previewForLeftProducts.onResize();
      previewForRightProducts.onResize();

      const resolvePreview = (product: HTMLElement) => {
        const index = Number(product.dataset.index ?? 0);
        const isLeft = index % 4 === 0 || index % 4 === 1;
        return isLeft ? previewForLeftProducts : previewForRightProducts;
      };

      let hoverDelay: number | null = null;
      let activeProduct: HTMLElement | null = null;

      const productMouseEnter = (product: HTMLElement) => {
        if (hoverDelay) {
          window.clearTimeout(hoverDelay);
          hoverDelay = null;
        }

        hoverDelay = window.setTimeout(() => {
          activeProduct = product;
          resolvePreview(product).setProduct(product);
          hoverDelay = null;
        }, 100);
      };

      const productMouseLeave = () => {
        if (hoverDelay) {
          window.clearTimeout(hoverDelay);
          hoverDelay = null;
        }

        if (activeProduct) {
          resolvePreview(activeProduct).setProduct(null);
          activeProduct = null;
        }
      };

      const listeners = products.map((product) => {
        const onEnter = () => productMouseEnter(product);
        const onLeave = () => productMouseLeave();

        product.addEventListener("mouseenter", onEnter);
        product.addEventListener("mouseleave", onLeave);
        product.addEventListener("focus", onEnter);
        product.addEventListener("blur", onLeave);

        return { product, onEnter, onLeave };
      });

      const onResize = () => {
        previewForLeftProducts.onResize();
        previewForRightProducts.onResize();
      };

      window.addEventListener("resize", onResize);

      return () => {
        if (hoverDelay) {
          window.clearTimeout(hoverDelay);
        }

        listeners.forEach(({ product, onEnter, onLeave }) => {
          product.removeEventListener("mouseenter", onEnter);
          product.removeEventListener("mouseleave", onLeave);
          product.removeEventListener("focus", onEnter);
          product.removeEventListener("blur", onLeave);
        });

        window.removeEventListener("resize", onResize);
        productMouseLeave();
        previewForLeftProducts.kill();
        previewForRightProducts.kill();
      };
    }, productsRoot);

    return () => {
      ctx.revert();
    };
  }, [experienceStarted]);

  return (
    <div className={`awards-v3${experienceStarted ? " is-experience-open" : ""}${isHeroAnimating ? " is-hero-animating" : ""}`}>
      <section className="awards-v3-banner">
        <div ref={heroTypeRef} className="awards-v3-banner-type" aria-hidden>
          {heroKineticLines.map((line, index) => (
            <span
              key={`hero-line-${index}`}
              ref={(node) => {
                if (node) {
                  heroLineRefs.current[index] = node;
                }
              }}
              className="awards-v3-banner-type-line"
            >
              {line}
            </span>
          ))}
        </div>

        <div ref={heroContentRef} className="awards-v3-banner-content">
          <p className="awards-v3-banner-kicker">
            <Sparkles className="h-4 w-4" />
            Awards Experience
          </p>

          <h1 className="awards-v3-banner-title">
            <span>Recognition</span>
            <span>Earned Through</span>
            <span>Community Action</span>
          </h1>

          <p className="awards-v3-banner-description">
            A recognition archive shaped by Shivarpan's work in education, healthcare,
            food support, volunteer leadership, and community resilience across the ground.
          </p>

          <button
            type="button"
            className="awards-v3-banner-button"
            onClick={startExperience}
            disabled={isHeroAnimating}
          >
            {experienceStarted ? "Open Recognition Journey" : "View Recognition Journey"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {experienceStarted && (
        <section ref={experienceSectionRef} className="awards-v3-experience">
          <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
              <AnimatedSection className="mb-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                  Upcoming Awards
                </p>
                <h2 className="mt-2 font-display text-4xl font-bold leading-[0.9] text-white sm:text-5xl lg:text-[4.6rem]">
                  Big award nights coming next.
                </h2>
                <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-white/68 sm:text-base">
                  A sharper preview of the next award showcases we want people to anticipate,
                  nominate for, and talk about.
                </p>
              </AnimatedSection>

              {upcomingAwardCards.length > 0 ? (
              <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
                {upcomingAwardCards.map((award, index) => (
                  <AnimatedSection key={award.id} delay={index * 0.08} className="h-full">
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_24px_80px_-56px_rgba(0,0,0,0.95)] backdrop-blur-md">
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${award.shellClass} opacity-30`} />

                      <div className="relative overflow-hidden border-b border-white/10">
                        <img
                          src={award.image}
                          alt={award.title}
                          className="h-[22rem] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.12)_32%,rgba(0,0,0,0.52)_100%)]" />
                        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
                          <span className="rounded-full border border-white/18 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/88 backdrop-blur-sm">
                            {award.presenter}
                          </span>
                          <span className="rounded-full border border-[#ffcf67]/30 bg-[#ffcf67]/16 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ffe08a]">
                            2026
                          </span>
                        </div>
                      </div>

                      <div className="relative flex flex-1 flex-col p-5">
                        <div className="min-h-[5.5rem]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ffd978]">
                            {award.category}
                          </p>
                          <h3 className="mt-2 max-w-[12ch] font-display text-[2.15rem] font-bold leading-[0.9] text-white sm:text-[2.35rem]">
                            {award.title}
                          </h3>
                          <div className="mt-3 h-px w-24 bg-gradient-to-r from-[#ffd978] via-[#ffcf67] to-transparent" />
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="flex h-full flex-col rounded-[1.15rem] border border-white/12 bg-white/[0.04] p-3.5">
                            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/48">
                              <CalendarDays className="h-3.5 w-3.5 text-accent" />
                              Event Date
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-snug text-white/92">
                              {award.date}
                            </p>
                          </div>
                          <div className="flex h-full flex-col rounded-[1.15rem] border border-white/12 bg-white/[0.04] p-3.5">
                            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/48">
                              <MapPin className="h-3.5 w-3.5 text-accent" />
                              Venue
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-snug text-white/92">
                              {award.location}
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                          <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/62">
                            Upcoming Showcase
                          </span>
                          <Link
                            to={`/awards/nominate/${award.id}`}
                            className="inline-flex min-w-[11.25rem] items-center justify-center gap-2 rounded-full bg-[#ffd455] px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#14110d] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#ffdf7c]"
                          >
                            Nominate Now
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </AnimatedSection>
                ))}
              </div>
              ) : !isLoadingAwards ? (
                <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-white/12 bg-white/[0.04] p-6 text-center">
                  <h3 className="font-display text-2xl font-semibold text-white">
                    Upcoming awards are coming soon.
                  </h3>
                  <p className="mt-2 text-sm text-white/62">
                    New nomination showcases are being prepared.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          {isLoadingAwards ? (
            <section className="px-4 py-16">
              <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-white/12 bg-white/[0.04] p-6 text-center text-sm font-medium text-white/70">
                Loading awards...
              </div>
            </section>
          ) : null}

          {!isLoadingAwards && awardRecognitions.length === 0 ? (
            <section className="px-4 py-16">
              <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-white/12 bg-white/[0.04] p-6 text-center">
                <h2 className="font-display text-2xl font-semibold text-white">
                  No awards are published yet.
                </h2>
                <p className="mt-2 text-sm text-white/62">
                  Recognition updates are coming soon.
                </p>
              </div>
            </section>
          ) : null}

          {awardRecognitions.length > 0 ? (
            <>
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1500px]">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                  Recognition Gallery
                </p>
                <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
                  Awards Rooted in Service, Trust, and Impact
                </h2>
              </div>

              <div className="space-y-14">
                {awardRecognitions.map((award) => (
                  <section key={award.id}>
                    <div className="mb-6 flex items-center gap-4">
                      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#ffd455] to-[#ffd455]" />
                      <h3 className="text-center text-lg font-semibold tracking-wide text-white sm:text-2xl">
                        {award.title}
                      </h3>
                      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#ffd455] to-[#ffd455]" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {award.detailImages.map((image, imageIndex) => (
                        <figure
                          key={`${award.id}-${imageIndex}`}
                          className="overflow-hidden rounded-xl border border-white/16 bg-white/[0.04]"
                        >
                          <img
                            src={image}
                            alt={`${award.title} image ${imageIndex + 1}`}
                            className="aspect-[4/3] w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </figure>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>
            </>
          ) : null}
        </section>
      )}
    </div>
  );
};

export default Awards;
