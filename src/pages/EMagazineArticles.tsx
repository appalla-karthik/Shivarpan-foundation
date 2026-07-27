import { Button } from "@/components/ui/button";
import { assetUrl, getJson, reportApiError } from "@/lib/api";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookOpen, CalendarDays } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type MediaAsset = {
  id: number;
  title: string;
  alt_text: string;
  media_type: string;
  url: string;
};

type MagazineIssue = {
  id: number;
  title: string;
  description: string;
  publish_at: string;
  cover_image: MediaAsset | null;
};

type MagazineStory = {
  id: number;
  title: string;
  excerpt: string;
  publish_at: string;
  featured_image: MediaAsset | null;
  issue: MagazineIssue | null;
};

const EMagazineArticles = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stories, setStories] = useState<MagazineStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStories = async () => {
      try {
        const data = await getJson<MagazineStory[]>("magazine/stories/");
        if (isMounted) {
          setStories(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (fetchError) {
        reportApiError("Magazine stories fetch failed", fetchError);
        if (isMounted) {
          setError("Unable to load magazine stories. Please try again.");
          setStories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStories();

    return () => {
      isMounted = false;
    };
  }, []);

  const formattedStories = useMemo(
    () =>
      stories.map((story) => {
        const coverImage =
          (story.featured_image?.media_type === "image" && assetUrl(story.featured_image.url)) ||
          (story.issue?.cover_image?.media_type === "image" && assetUrl(story.issue.cover_image.url)) ||
          "";
        const description =
          story.excerpt ||
          story.issue?.description ||
          "Magazine update from Shivarpan Foundation.";
        const publishDate = story.publish_at
          ? new Date(story.publish_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";

        return {
          ...story,
          coverImage,
          description,
          publishDate,
        };
      }),
    [stories],
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, index) => {
        if (!card) {
          return;
        }

        gsap.set(card, { transformPerspective: 1700, transformStyle: "preserve-3d" });
        const introTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 94%",
            end: "top 24%",
            scrub: 0.9,
          },
        });

        introTimeline.fromTo(
          card,
          {
            opacity: 0.25,
            y: 135,
            z: -240,
            rotateX: 18,
            rotateY: index % 2 === 0 ? -10 : 10,
            rotateZ: index % 2 === 0 ? -2.5 : 2.5,
            scale: 0.82,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: -24,
            z: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1.06,
            filter: "blur(0px)",
            ease: "power3.out",
            duration: 0.7,
          },
          0,
        );

        introTimeline.to(
          card,
          {
            y: 0,
            scale: 1,
            ease: "power2.out",
            duration: 0.3,
          },
          0.7,
        );

        const media = card.querySelector(".mag-card-media");
        if (!media) {
          return;
        }

        gsap.fromTo(
          media,
          { yPercent: -12, scale: 1.13 },
          {
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [formattedStories.length]);

  return (
    <div className="min-h-screen bg-[#fffdf5]">
      <section ref={sectionRef} className="container mx-auto max-w-[1180px] px-4 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="inline-flex rounded-full border border-[#14532d]/20 bg-[#14532d]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#14532d]">
            Magazine Library
          </p>
          <h1
            className="mt-4 text-3xl font-semibold text-[#14532d] md:text-5xl"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Reports & Publications
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
            Browse annual reports and open each issue in a realistic digital
            flipbook experience.
          </p>
        </motion.div>

        <div
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:grid-cols-4"
          style={{ perspective: "1700px" }}
        >
          {isLoading ? (
            <div className="col-span-full rounded-2xl border border-slate-200/80 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
              Loading magazine stories...
            </div>
          ) : null}
          {!isLoading && error ? (
            <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          {!isLoading && !error && formattedStories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="col-span-full overflow-hidden rounded-[2rem] border border-[#14532d]/15 bg-[radial-gradient(circle_at_16%_20%,rgba(245,158,11,0.22),transparent_34%),radial-gradient(circle_at_86%_22%,rgba(20,83,45,0.16),transparent_30%),linear-gradient(135deg,#ffffff_0%,#fff8e7_52%,#eef8f0_100%)] p-6 text-center shadow-[0_24px_70px_rgba(20,83,45,0.12)] sm:p-10"
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center">
                <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-[#f59e0b]/30" />
                  <span className="absolute inset-3 rounded-full border border-[#14532d]/20" />
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#14532d] text-white shadow-[0_18px_34px_rgba(20,83,45,0.24)]">
                    <BookOpen className="h-8 w-8" />
                  </span>
                </div>
                <p className="rounded-full border border-[#f59e0b]/35 bg-[#f59e0b]/12 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#14532d]">
                  Magazine Launching Soon
                </p>
                <h2
                  className="mt-4 text-3xl font-semibold leading-tight text-[#14532d] sm:text-4xl"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Reports & stories are getting ready
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  Fresh reports, field notes, and digital flipbooks are being prepared for readers.
                </p>
                <div className="mt-6 grid w-full max-w-xl gap-3 sm:grid-cols-3">
                  {["Cover", "Stories", "Flipbook"].map((label) => (
                    <div key={label} className="rounded-2xl border border-[#14532d]/10 bg-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#14532d] shadow-sm">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
          {formattedStories.map((magazine, index) => (
            <div
              key={magazine.id}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className="mx-auto h-full w-full max-w-[320px] will-change-transform"
            >
              <div className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.12)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_56px_rgba(15,23,42,0.2)] active:scale-[0.99]">
                <div className="mag-card-media relative aspect-[5/6] overflow-hidden">
                  {magazine.coverImage ? (
                    <img
                      src={magazine.coverImage}
                      alt={magazine.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      No cover
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/18 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
                    Magazine Story
                  </span>
                  <Button
                    type="button"
                    onClick={() =>
                      navigate(`/e-magazine-articles/${magazine.id}`)
                    }
                    className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 bg-[#f59e0b] text-[#10381f] shadow-lg hover:bg-[#f8b33a] md:inline-flex md:opacity-0 md:group-hover:opacity-100"
                  >
                    Read Now
                  </Button>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f59e0b]">
                    Story #{magazine.id}
                  </p>
                  <h2
                    className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-[#14532d]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {magazine.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {magazine.description}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarDays className="h-4 w-4 text-[#f59e0b]" />
                    {magazine.publishDate ? `Published ${magazine.publishDate}` : "Publish date unavailable"}
                  </p>
                  <Button
                    type="button"
                    onClick={() =>
                      navigate(`/e-magazine-articles/${magazine.id}`)
                    }
                    className="mt-4 w-full bg-[#f59e0b] text-[#10381f] hover:bg-[#f8b33a]"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read Magazine
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EMagazineArticles;
