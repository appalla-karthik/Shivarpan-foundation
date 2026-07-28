import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Heart,
  Handshake,
  Mail,
  Mic,
  Play,
  Sparkles,
  TreePine,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import FeaturedVideoTeaser from "@/components/FeaturedVideoTeaser";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import campaignFood from "@/assets/campaign-food.jpg";
import campaignEducation from "@/assets/campaign-education.jpg";
import campaignHealth from "@/assets/campaign-health.jpg";
import campaignEnvironment from "@/assets/campaign-environment.jpg";
import campaignFoodThumb from "@/assets/campaign-food-thumb.jpg";
import campaignEducationThumb from "@/assets/campaign-education-thumb.jpg";
import campaignHealthThumb from "@/assets/campaign-health-thumb.jpg";
import campaignEnvironmentThumb from "@/assets/campaign-environment-thumb.jpg";
import adrsKLogo from "@/assets/ADRSK-small.jpg";
import hotelLogo from "@/assets/hotel-small.jpg";
import { aboutContent, homeHeroContent } from "@/data/siteContent";
import {
  mapRecentProjectsFromApi,
  type RecentProject,
  type RecentProjectsApiItem,
} from "@/data/recentProjects";
import { assetUrl, getJson, reportApiError } from "@/lib/api";
import type { ImpactVideoPayload } from "@/types/content";

const ImpactCounter = lazy(() => import("@/components/ImpactCounter"));
const CinematicImpactStory = lazy(() => import("@/components/CinematicImpactStory"));
const ProjectFundingActions = lazy(() => import("@/components/ProjectFundingActions"));

const heroStats = [
  { value: "500+", label: "Lives Transformed" },
  { value: "3000+", label: "Active Volunteers" },
  { value: "100+", label: "Community Projects" },
];

const heroParticles = [
  { top: "14%", left: "8%", delay: 0, size: "h-1.5 w-1.5" },
  { top: "20%", left: "82%", delay: 0.4, size: "h-2 w-2" },
  { top: "34%", left: "16%", delay: 0.8, size: "h-1.5 w-1.5" },
  { top: "40%", left: "74%", delay: 1.2, size: "h-2.5 w-2.5" },
  { top: "56%", left: "10%", delay: 1.6, size: "h-2 w-2" },
  { top: "62%", left: "86%", delay: 2, size: "h-1.5 w-1.5" },
  { top: "78%", left: "20%", delay: 2.4, size: "h-2 w-2" },
  { top: "82%", left: "70%", delay: 2.8, size: "h-1.5 w-1.5" },
];

const impactStats = [
  { end: 500, suffix: "+", label: "Lives Transformed", icon: <Heart className="h-7 w-7" /> },
  { end: 3000, suffix: "+", label: "Volunteers", icon: <Users className="h-7 w-7" /> },
  { end: 100, suffix: "+", label: "Community Projects", icon: <TreePine className="h-7 w-7" /> },
  { end: 50, suffix: "+", label: "Scholarships Awarded", icon: <BookOpen className="h-7 w-7" /> },
];

const aboutPoints = aboutContent.highlights;

const aboutVisualLayouts = [
  {
    alt: "About Shivarpan",
    label: "Community Action",
    className: "col-span-2 h-52 sm:h-64",
  },
  {
    alt: "Education",
    label: "Education Drive",
    className: "h-36 sm:h-44",
  },
  {
    alt: "Community support",
    label: "Food Support",
    className: "h-36 sm:h-44",
  },
];

const awards = [
  {
    year: "2025",
    title: "Excellence in Community Development",
    issuer: "Maharashtra Social Impact Council",
  },
  {
    year: "2024",
    title: "Best Grassroots NGO Initiative",
    issuer: "India Volunteer Network",
  },
  {
    year: "2023",
    title: "Green Leadership Recognition",
    issuer: "National Environment Forum",
  },
];

const episodes = [
  { title: "Grassroots Change: Where Impact Begins", duration: "28 min", host: "Host: Meera Kulkarni" },
  { title: "From Scholarship to Success", duration: "32 min", host: "Host: Rajendra Shivarpan" },
  { title: "Inside a Rural Health Camp", duration: "24 min", host: "Host: Dr. Anita Desai" },
];

const partners = [
  {
    name: "Shivora Events",
    focus: "Event Partner",
    tag: "Events",
    monogram: "SE",
    glow: "from-accent/20 via-primary/10 to-transparent",
    url: "#",
  },
  {
    name: "Zorsk Digital Marketing",
    focus: "Marketing Partner",
    tag: "Marketing",
    monogram: "ZD",
    glow: "from-accent/20 via-primary/10 to-transparent",
    logoUrl: adrsKLogo,
    logoWidth: 360,
    logoHeight: 145,
    url: "https://adrsk.onrender.com/",
  },
  {
    name: "The Fern Residency",
    focus: "Hospitality Partner",
    tag: "Hotel Partner",
    monogram: "Hotel",
    glow: "from-primary/20 via-primary/5 to-transparent",
    logoUrl: hotelLogo,
    logoWidth: 220,
    logoHeight: 178,
    url: "https://theblueshotels.com",
  },
  {
    name: "Shivarpan Foundation",
    focus: "Community Partner",
    tag: "Foundation",
    monogram: "SF",
    glow: "from-accent/20 via-primary/10 to-transparent",
  },
];

const partnerRowOne = [...partners, ...partners];

type MediaAsset = {
  id: number;
  title: string;
  alt_text: string;
  media_type?: "image" | "video" | "pdf" | "document" | "other" | string;
  url: string;
};

type GalleryItemPayload = {
  id: number;
  title: string;
  category: string;
  image: string | null;
};

type StoryItemPayload = {
  id: number;
  title: string;
  image: string | null;
  description?: string;
};

type ProjectPayload = RecentProjectsApiItem;

type HomepageProjectCard = {
  title: string;
  slug: string;
  category: string;
  raised: number;
  goal: number;
  image: string;
};

type HomepagePayload = {
  hero_title: string;
  hero_subtitle: string;
  hero_background_image: MediaAsset | null;
  hero_slider_images: MediaAsset[];
  hero_cta_text: string;
  hero_cta_url: string;
  partner_logos: MediaAsset[];
  show_testimonials: boolean;
};

type TestimonialPayload = {
  id: number;
  name: string;
  designation: string;
  organization: string;
  quote: string;
  rating: number;
  photo: MediaAsset | null;
  media: MediaAsset | null;
};

type UpcomingEventPayload = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  date_label: string;
  location_label: string;
  poster_image: MediaAsset | null;
  cta_text: string;
  cta_url: string;
};

const isVideoMedia = (media?: Pick<MediaAsset, "media_type" | "url"> | null) =>
  Boolean(media?.url) &&
  (media?.media_type === "video" || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(media.url));

const quickAccessLinks = [
  {
    title: "Our Mission",
    description: aboutContent.quickAccessDescription,
    to: "/about",
    icon: <Users className="h-4 w-4" />,
    accent: "from-primary/15 to-transparent",
  },
  {
    title: "Live Projects",
    description: "Track ongoing interventions with transparent funding status.",
    to: "/recent-projects",
    icon: <Compass className="h-4 w-4" />,
    accent: "from-accent/18 to-transparent",
  },
  {
    title: "Impact Gallery",
    description: "Visual proof from field activities and community events.",
    to: "/gallery",
    icon: <Camera className="h-4 w-4" />,
    accent: "from-primary/10 to-transparent",
  },
  {
    title: "Partner With Us",
    description: "Start volunteer, CSR, or collaboration conversations quickly.",
    to: "/contact",
    icon: <Handshake className="h-4 w-4" />,
    accent: "from-accent/14 to-transparent",
  },
];

const formatCurrency = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;
const transformProjectsForHomepage = (
  projects: RecentProject[],
): HomepageProjectCard[] =>
  projects.slice(0, 4).map((project) => ({
    title: project.title,
    slug: project.slug,
    category: project.focus,
    raised: project.spent,
    goal: project.budget,
    image: project.image,
  }));

const getSmallProjectImage = (image: string) => {
  if (image === campaignFood) return campaignFoodThumb;
  if (image === campaignEducation) return campaignEducationThumb;
  if (image === campaignHealth) return campaignHealthThumb;
  if (image === campaignEnvironment) return campaignEnvironmentThumb;
  return image;
};

const sectionTagClass =
  "inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary";
const sectionTitleClass = "mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl";
const darkSectionTagClass =
  "inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground";
const darkSectionTitleClass = "mt-3 font-display text-2xl font-bold text-primary-foreground sm:text-3xl md:text-4xl";

const Index = () => {
  const [homepage, setHomepage] = useState<HomepagePayload | null>(null);
  const [testimonialItems, setTestimonialItems] = useState<TestimonialPayload[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItemPayload[]>([]);
  const [storyItems, setStoryItems] = useState<StoryItemPayload[]>([]);
  const [impactVideos, setImpactVideos] = useState<ImpactVideoPayload[]>([]);
  const [projectItems, setProjectItems] = useState<ProjectPayload[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEventPayload[]>([]);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroMediaReady, setHeroMediaReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadHomepage = async () => {
      try {
        const data = await getJson<HomepagePayload>("homepage/", { cache: true, cacheTTL: 60 * 1000 });
        if (isMounted) {
          setHomepage(data);
        }
      } catch (error) {
        reportApiError("Homepage API error", error);
      }
    };

    const loadTestimonials = async () => {
      try {
        const data = await getJson<TestimonialPayload[]>("testimonials/", { cache: true, cacheTTL: 60 * 1000 });
        if (isMounted) {
          setTestimonialItems(data);
        }
      } catch (error) {
        reportApiError("Testimonials API error", error);
      }
    };

    const loadGallery = async () => {
      try {
        const data = await getJson<GalleryItemPayload[]>("gallery/", { cache: true, cacheTTL: 60 * 1000 });
        if (isMounted) {
          setGalleryItems(
            data.map((item) => ({
              ...item,
              image: assetUrl(item.image),
            })),
          );
        }
      } catch (error) {
        reportApiError("Gallery API error", error);
      }
    };

    const loadStoryItems = async () => {
      try {
        const data = await getJson<StoryItemPayload[]>("story-items/", { cache: true, cacheTTL: 60 * 1000 });
        if (isMounted) {
          setStoryItems(
            data.map((item) => ({
              ...item,
              image: assetUrl(item.image),
            })),
          );
        }
      } catch (error) {
        reportApiError("Story items API error", error);
      }
    };

    const loadImpactVideos = async () => {
      try {
        const data = await getJson<ImpactVideoPayload[]>("impact-videos/", {
          cache: true,
          cacheTTL: 60 * 1000,
        });
        if (isMounted) {
          setImpactVideos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        reportApiError("Impact videos API error", error);
      }
    };

    const loadProjects = async () => {
      try {
        const data = await getJson<ProjectPayload[]>("projects/", { cache: false });
        if (isMounted) {
          setProjectItems(data);
        }
      } catch (error) {
        reportApiError("Projects API error", error);
      }
    };

    const loadUpcomingEvents = async () => {
      try {
        const data = await getJson<UpcomingEventPayload[]>("upcoming-events/?is_active=true", { cache: true, cacheTTL: 60 * 1000 });
        if (isMounted) {
          setUpcomingEvents(data.filter((event) => event.title).slice(0, 4));
        }
      } catch (error) {
        reportApiError("Upcoming events API error", error);
      }
    };

    void Promise.all([
      loadHomepage(),
      loadTestimonials(),
      loadProjects(),
      loadUpcomingEvents(),
      loadImpactVideos(),
    ]).catch((error) => {
      console.error("Error loading priority homepage data:", error);
    });

    const nonCriticalDataTimer = window.setTimeout(() => {
      Promise.all([
        loadGallery(),
        loadStoryItems(),
      ]).catch((error) => {
        console.error("Error loading non-critical data:", error);
      });
    }, 12000);

    return () => {
      isMounted = false;
      window.clearTimeout(nonCriticalDataTimer);
    };
  }, []);

  const heroTitle = homepage?.hero_title?.trim() || homeHeroContent.title;
  const configuredHeroDescription = homepage?.hero_subtitle?.trim() || "";
  const heroDescription =
    configuredHeroDescription && configuredHeroDescription.length <= 220
      ? configuredHeroDescription
      : homeHeroContent.description;
  const heroTitleLines =
    heroTitle === "Driven by Compassion, Committed to Change"
      ? ["Driven by Compassion,", "Committed to Change"]
      : [heroTitle];
  const heroCtaText = homepage?.hero_cta_text?.trim() || "Donate or Partner";
  const heroCtaUrl = homepage?.hero_cta_url?.trim() || "/contact";
  const heroImageSrc = assetUrl(homepage?.hero_background_image?.url);
  const heroSlides = useMemo(() => {
    const uploadedSlides =
      homepage?.hero_slider_images
        ?.filter((image) => image.url)
        .map((image) => ({
          ...image,
          url: assetUrl(image.url),
        })) ?? [];

    if (uploadedSlides.length > 0) {
      return uploadedSlides;
    }

    if (heroImageSrc) {
      return [
        {
          ...homepage!.hero_background_image!,
          url: heroImageSrc,
        },
      ];
    }

    return [];
  }, [heroImageSrc, homepage]);

  useEffect(() => {
    setActiveHeroSlide(0);

    if (heroSlides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, [heroSlides]);

  useEffect(() => {
    const timerId = window.setTimeout(() => setHeroMediaReady(true), 9000);
    return () => window.clearTimeout(timerId);
  }, []);

  const latestEvent = upcomingEvents[0];
  const nextHeroSlide = () => {
    if (heroSlides.length === 0) {
      return;
    }
    setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
  };
  const previousHeroSlide = () => {
    if (heroSlides.length === 0) {
      return;
    }
    setActiveHeroSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };

  const partnerCards = useMemo(() => {
    if (homepage?.partner_logos?.length) {
      return homepage.partner_logos.map((logo, index) => {
        const fallback = partners[index % partners.length];
        return {
          ...fallback,
          name: logo.title || fallback.name,
          logoUrl: assetUrl(logo.url),
          logoWidth: "logoWidth" in fallback ? fallback.logoWidth : undefined,
          logoHeight: "logoHeight" in fallback ? fallback.logoHeight : undefined,
        };
      });
    }
    return partners;
  }, [homepage]);

  const partnerRow = [...partnerCards, ...partnerCards, ...partnerCards];

  const aboutVisualsData = useMemo(
    () =>
      galleryItems
        .filter((item) => item.image)
        .slice(0, aboutVisualLayouts.length)
        .map((item, index) => {
        const visual = aboutVisualLayouts[index];
        return {
          ...visual,
          image: item.image,
          alt: item.title || visual.alt,
          label: item.category || visual.label,
        };
      }),
    [galleryItems],
  );

  const galleryShotsData = useMemo(
    () =>
      galleryItems
        .filter((item) => item.image)
        .slice(0, 5)
        .map((item) => ({
          title: item.title || "Gallery image",
          image: item.image,
          tag: item.category || "Gallery",
        })),
    [galleryItems],
  );

  const storiesData = useMemo(
    () =>
      storyItems
        .filter((item) => item.image)
        .slice(0, 3)
        .map((item) => ({
          title: item.title || "Impact story",
          excerpt: item.description || "",
          date: "Published story",
          image: item.image,
        })),
    [storyItems],
  );

  const featuredImpactVideo = useMemo(
    () =>
      [...impactVideos].sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured) ||
          a.sort_order - b.sort_order,
      )[0],
    [impactVideos],
  );

  const normalizedRecentProjects = useMemo(
    () => mapRecentProjectsFromApi(projectItems),
    [projectItems],
  );

  const projectsData = useMemo(() => {
    return transformProjectsForHomepage(normalizedRecentProjects);
  }, [normalizedRecentProjects]);

  const totalRaised = projectsData.reduce((sum, project) => sum + project.raised, 0);
  const totalGoal = projectsData.reduce((sum, project) => sum + project.goal, 0);
  const completionRate = totalGoal === 0 ? 0 : Math.round((totalRaised / totalGoal) * 100);
  const fullyFunded = projectsData.filter((project) => project.raised >= project.goal).length;
  const featuredProject = projectsData[0];
  const featuredProgress = featuredProject && featuredProject.goal > 0
    ? Math.min((featuredProject.raised / featuredProject.goal) * 100, 100)
    : 0;
  const featuredShortfall = featuredProject
    ? Math.max(featuredProject.goal - featuredProject.raised, 0)
    : 0;

  const testimonialsToShow = useMemo(() => {
    if (homepage && homepage.show_testimonials === false) {
      return [];
    }

    return testimonialItems.map((item, index) => {
      const testimonialMedia = item.media || item.photo;
      const initials =
        item.name
          ?.split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "SP";

      return {
        quote: item.quote,
        name: item.name,
        role: [item.designation, item.organization].filter(Boolean).join(", "),
        tag: item.organization || "Partner",
        monogram: initials,
        glow: index % 2 === 0 ? "from-accent/20 via-primary/10 to-transparent" : "from-primary/20 via-accent/10 to-transparent",
        rating: Math.min(5, Math.max(1, Math.round(Number(item.rating) || 5))),
        photoUrl: assetUrl(item.photo?.url),
        media: testimonialMedia
          ? { ...testimonialMedia, url: assetUrl(testimonialMedia.url) }
          : null,
        isVideoReview: isVideoMedia(testimonialMedia),
      };
    });
  }, [homepage, testimonialItems]);

  const testimonialAverageRating = useMemo(() => {
    if (!testimonialsToShow.length) return 0;
    const ratingTotal = testimonialsToShow.reduce(
      (total, item) => total + item.rating,
      0,
    );
    return ratingTotal / testimonialsToShow.length;
  }, [testimonialsToShow]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden md:min-h-[calc(100vh-5rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.35),transparent_55%),radial-gradient(circle_at_20%_80%,hsl(var(--accent)/0.25),transparent_52%),linear-gradient(135deg,hsl(var(--foreground))_0%,hsl(var(--primary))_45%,hsl(var(--accent))_100%)]" />
        {heroSlides.map((slide, index) => {
          if (!heroMediaReady && index !== activeHeroSlide) {
            return null;
          }

          const isVideo = isVideoMedia(slide);
          const sharedMotionProps = {
            initial: false,
            animate: {
              opacity: index === activeHeroSlide ? 1 : 0,
              scale: index === activeHeroSlide ? 1.04 : 1,
            },
            transition: { duration: 1.15, ease: "easeInOut" as const },
            className: "absolute inset-0 h-full w-full object-cover brightness-[0.94] contrast-[1.08] saturate-[1.06]",
          };

          if (isVideo) {
            return (
              <motion.video
                key={`${slide.url}-${index}`}
                src={slide.url}
                autoPlay
                muted
                loop
                playsInline
                preload={index === activeHeroSlide ? "auto" : "metadata"}
                aria-label={slide.alt_text || slide.title || "Shivarpan Foundation video"}
                {...sharedMotionProps}
              />
            );
          }

          return (
            <motion.img
              key={`${slide.url}-${index}`}
              src={slide.url}
              alt={slide.alt_text || slide.title || "Shivarpan Foundation"}
              loading={index === 0 ? "eager" : "lazy"}
              decoding={index === 0 ? "sync" : "async"}
              width={1800}
              height={1013}
              {...sharedMotionProps}
            />
          );
        })}
        <div className="absolute inset-0 hero-overlay opacity-[0.12]" />
        <div className="absolute inset-0 bg-foreground/55 lg:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,hsl(var(--foreground)/0.88)_0%,hsl(var(--foreground)/0.72)_34%,hsl(var(--foreground)/0.30)_62%,hsl(var(--foreground)/0.08)_100%)] lg:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/18 via-transparent to-foreground/72" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_85%_28%,hsl(var(--accent)/0.18),transparent_58%)]" />

        <motion.div
          animate={{ x: [0, 18, 0], y: [0, -12, 0], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 right-8 w-72 h-72 md:w-80 md:h-80 rounded-full bg-accent/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -22, 0], y: [0, 14, 0], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/4 w-60 h-60 md:w-72 md:h-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="pointer-events-none absolute inset-0">
          {heroParticles.map((particle) => (
            <motion.span
              key={`${particle.left}-${particle.top}`}
              aria-hidden
              style={{ left: particle.left, top: particle.top }}
              animate={{ y: [0, -14, 0], opacity: [0.2, 0.85, 0.2], scale: [1, 1.25, 1] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: particle.delay }}
              className={`absolute rounded-full bg-primary-foreground/75 ${particle.size}`}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-28 pb-28 sm:pb-32 md:pt-32 md:pb-36">
          {latestEvent ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="absolute right-4 top-5 z-20 max-w-[calc(100%-2rem)] sm:top-7 sm:max-w-[19rem]"
            >
              <Link
                to={latestEvent.cta_url || "/upcoming-events"}
                className="group flex items-center gap-3 rounded-xl border border-primary-foreground/20 bg-foreground/48 px-3 py-2 text-primary-foreground shadow-[0_14px_40px_-24px_rgba(0,0,0,0.95)] backdrop-blur-lg transition hover:border-accent/55 hover:bg-foreground/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`View upcoming event: ${latestEvent.title}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-accent">
                    Suggested · Upcoming event
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-semibold sm:text-[13px]">
                    {latestEvent.title}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-primary-foreground/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            </motion.div>
          ) : null}

          <div className="max-w-6xl pl-2 sm:pl-4 lg:pl-6 xl:pl-8">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-foreground/48 px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-[0_12px_34px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md lg:mx-0"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              {homeHeroContent.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mb-6 text-center font-display text-4xl font-bold leading-[0.99] text-primary-foreground [text-shadow:0_3px_28px_rgba(0,0,0,0.82),0_1px_3px_rgba(0,0,0,0.95)] sm:text-5xl md:text-[3.5rem] lg:text-left lg:text-6xl"
            >
              {heroTitleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mx-auto mb-8 max-w-4xl text-center text-sm font-medium leading-relaxed text-primary-foreground/95 [text-shadow:0_2px_14px_rgba(0,0,0,0.85)] sm:text-base lg:mx-0 lg:text-left"
            >
              {heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mx-0"
            >
              {heroStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="group relative overflow-hidden rounded-2xl border border-primary-foreground/22 bg-foreground/52 px-4 py-3 shadow-[0_18px_48px_-30px_rgba(0,0,0,0.95)] backdrop-blur-lg"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <motion.div
                    aria-hidden
                    animate={{ x: ["-120%", "130%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 1.2, ease: "linear", delay: index * 0.25 }}
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary-foreground/35 to-transparent"
                  />
                  <p className="relative text-xl font-bold text-primary-foreground sm:text-2xl">{stat.value}</p>
                  <p className="relative text-xs uppercase tracking-wider text-primary-foreground/80">{stat.label}</p>
                  <motion.div
                    aria-hidden
                    animate={{ width: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.18, ease: "easeInOut" }}
                    className="relative mt-2 h-0.5 rounded-full bg-accent/85"
                  />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link to={heroCtaUrl}>
                <Button className="group bg-accent text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25">
                  <Heart className="mr-2 h-4 w-4" />
                  {heroCtaText}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/recent-projects">
                <Button
                  variant="outline"
                  className="border-primary-foreground/40 bg-foreground/42 text-primary-foreground shadow-lg backdrop-blur-md hover:bg-primary-foreground hover:text-foreground"
                >
                  Explore Projects
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {heroSlides.length > 0 ? (
        <div className="absolute inset-x-0 bottom-7 z-20">
          <div className="container mx-auto flex flex-col gap-4 px-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={previousHeroSlide}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/30 bg-foreground/58 text-primary-foreground shadow-lg backdrop-blur-lg transition hover:bg-primary-foreground hover:text-foreground"
                aria-label="Previous hero slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextHeroSlide}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/30 bg-foreground/58 text-primary-foreground shadow-lg backdrop-blur-lg transition hover:bg-primary-foreground hover:text-foreground"
                aria-label="Next hero slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="h-px w-16 bg-primary-foreground/40" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/75">
                Slide {String(activeHeroSlide + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="flex w-full flex-wrap justify-center gap-2 lg:max-w-3xl lg:justify-end">
              {heroSlides.map((slide, index) => {
                const isVideo = isVideoMedia(slide);
                const thumbnailUrl = (slide as { thumbUrl?: string }).thumbUrl;

                return (
                  <button
                    key={`hero-thumb-${slide.url}-${index}`}
                    type="button"
                    onClick={() => setActiveHeroSlide(index)}
                    className={`relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-xl border transition sm:w-20 ${
                      index === activeHeroSlide
                        ? "border-accent ring-2 ring-accent/45"
                        : "border-primary-foreground/20 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Open hero slide ${index + 1}`}
                    aria-current={index === activeHeroSlide ? "true" : undefined}
                  >
                    {isVideo && !thumbnailUrl ? (
                      <span className="flex h-full w-full items-center justify-center gap-1 bg-foreground/50 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground backdrop-blur-sm">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Video
                      </span>
                    ) : (
                      <img
                        src={thumbnailUrl || slide.url}
                        alt=""
                        width={96}
                        height={56}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        ) : null}

      </section>

      {/* Recent Projects - Impact Dashboard */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,hsl(var(--primary)/0.1),transparent_40%),radial-gradient(circle_at_86%_80%,hsl(var(--accent)/0.12),transparent_42%)]" />
        <motion.div
          aria-hidden
          animate={{ x: [0, 20, 0], y: [0, -12, 0], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-20 right-8 h-72 w-72 rounded-full bg-primary/25 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -18, 0], y: [0, 15, 0], opacity: [0.1, 0.24, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-accent/25 blur-3xl"
        />

        <div className="container relative z-10 mx-auto px-4">
          <AnimatedSection className="mb-8 md:mb-10">
            <div className="relative overflow-hidden rounded-[2.2rem] border border-border/85 bg-[linear-gradient(135deg,hsl(var(--card)/0.96)_0%,hsl(var(--background)/0.92)_48%,hsl(var(--primary)/0.08)_100%)] p-5 shadow-[0_34px_95px_-58px_hsl(var(--foreground))] backdrop-blur-sm md:p-7">
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/18 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-56 rounded-full bg-primary/12 blur-3xl" />
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="max-w-2xl">
                  <span className={sectionTagClass}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Recent Projects
                  </span>
                  <h2 className={sectionTitleClass}>Impact Dashboard in Motion</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    One featured initiative plus live snapshots from active drives so visitors can instantly see what is
                    funded, what is progressing, and what still needs support.
                  </p>
                </div>
                <Link to="/recent-projects">
                  <Button className="group bg-primary text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90">
                    View More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="group rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-[0_16px_42px_-36px_hsl(var(--foreground))] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_54px_-38px_hsl(var(--foreground))]">
                  <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 text-accent" /> Total Raised
                  </p>
                  <p className="font-display text-xl font-bold text-foreground">{formatCurrency(totalRaised)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Across visible homepage projects</p>
                </div>
                <div className="group rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-[0_16px_42px_-36px_hsl(var(--foreground))] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_54px_-38px_hsl(var(--foreground))]">
                  <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <TreePine className="h-3.5 w-3.5 text-primary" /> Overall Target
                  </p>
                  <p className="font-display text-xl font-bold text-foreground">{formatCurrency(totalGoal)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Live goal pulled project-wise</p>
                </div>
                <div className="group rounded-2xl border border-border/80 bg-background/80 px-4 py-3 shadow-[0_16px_42px_-36px_hsl(var(--foreground))] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_54px_-38px_hsl(var(--foreground))]">
                  <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Award className="h-3.5 w-3.5 text-accent" /> Completion
                  </p>
                  <p className="font-display text-xl font-bold text-foreground">
                    {completionRate}% ({fullyFunded}/{projectsData.length} Achieved)
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Transparent funding status</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {projectsData.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-12">
            <AnimatedSection className="xl:col-span-8">
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                className="group relative overflow-hidden rounded-[2.25rem] border border-border/85 bg-[linear-gradient(145deg,hsl(var(--card))_0%,hsl(var(--background))_58%,hsl(var(--primary)/0.08)_100%)] shadow-[0_34px_100px_-58px_hsl(var(--foreground))]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,hsl(var(--accent)/0.14),transparent_30%),radial-gradient(circle_at_90%_85%,hsl(var(--primary)/0.12),transparent_34%)] opacity-80" />
                <div className="relative grid lg:grid-cols-5">
                  <div className="relative min-h-[22rem] overflow-hidden lg:col-span-2">
                    <img
                      src={featuredProject.image}
                      alt={featuredProject.title}
                      width={720}
                      height={720}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/88 via-foreground/22 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex rounded-full border border-primary-foreground/25 bg-primary-foreground/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground backdrop-blur-sm">
                      Spotlight
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-[1.4rem] border border-primary-foreground/18 bg-primary-foreground/12 p-4 text-primary-foreground backdrop-blur-md">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
                        Featured Project
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold leading-none">
                        {featuredProgress.toFixed(0)}%
                      </p>
                      <p className="mt-1 text-xs text-primary-foreground/78">funding progress</p>
                    </div>
                  </div>

                  <div className="lg:col-span-3 p-5 md:p-7 lg:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                        {featuredProject.category}
                      </p>
                      <p className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                        Donation Open
                      </p>
                    </div>
                    <h3 className="mt-4 font-display text-3xl font-bold leading-[0.98] text-foreground md:text-[2.55rem]">
                      {featuredProject.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Project-wise data, image, target, and donation route stay tied to the same recent-project record.
                      Share it instantly or contribute directly to this chapter.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border/80 bg-background/75 p-3 shadow-[0_16px_38px_-36px_hsl(var(--foreground))]">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Raised</p>
                        <p className="mt-1 text-sm font-bold text-primary sm:text-base">{formatCurrency(featuredProject.raised)}</p>
                      </div>
                      <div className="rounded-2xl border border-border/80 bg-background/75 p-3 shadow-[0_16px_38px_-36px_hsl(var(--foreground))]">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Goal</p>
                        <p className="mt-1 text-sm font-bold text-foreground sm:text-base">{formatCurrency(featuredProject.goal)}</p>
                      </div>
                      <div className="rounded-2xl border border-border/80 bg-background/75 p-3 shadow-[0_16px_38px_-36px_hsl(var(--foreground))]">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Left</p>
                        <p className="mt-1 text-sm font-bold text-foreground sm:text-base">{formatCurrency(featuredShortfall)}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.35rem] border border-primary/15 bg-primary/5 p-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary">Funding Progress</span>
                        <span className="text-muted-foreground">{featuredProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${featuredProgress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>

                    <Suspense fallback={null}>
                      <ProjectFundingActions
                        title={featuredProject.title}
                        slug={featuredProject.slug}
                        donateLabel="Donate Now"
                        className="mt-5"
                      />
                    </Suspense>
                  </div>
                </div>
              </motion.article>
            </AnimatedSection>

            <AnimatedSection className="xl:col-span-4">
              <div className="grid h-full gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {projectsData.slice(1).map((project, i) => {
                  const progress = project.goal > 0 ? Math.min((project.raised / project.goal) * 100, 100) : 0;
                  const shortfall = Math.max(project.goal - project.raised, 0);

                  return (
                    <motion.article
                      key={project.title}
                      whileHover={{ y: -5, x: 2 }}
                      transition={{ duration: 0.22 }}
                      className="group relative overflow-hidden rounded-[1.7rem] border border-border/85 bg-[linear-gradient(135deg,hsl(var(--card)/0.98)_0%,hsl(var(--background)/0.94)_60%,hsl(var(--muted)/0.55)_100%)] p-4 shadow-[0_22px_62px_-48px_hsl(var(--foreground))] transition-all duration-300 hover:border-primary/25 hover:shadow-[0_30px_78px_-48px_hsl(var(--foreground))] sm:p-5"
                    >
                      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/12 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="pointer-events-none absolute bottom-3 right-4 font-display text-6xl font-bold leading-none text-foreground/[0.04]">
                        {String(i + 2).padStart(2, "0")}
                      </div>
                      <div className="relative flex gap-4">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/70 shadow-[0_18px_44px_-32px_hsl(var(--foreground))]">
                          <img
                            src={getSmallProjectImage(project.image)}
                            alt={project.title}
                            width={96}
                            height={96}
                            loading="eager"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 rounded-full bg-primary-foreground/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-foreground">
                            {progress.toFixed(0)}%
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-accent">{project.category}</p>
                            <p className="text-[10px] font-semibold text-muted-foreground">#{i + 2}</p>
                          </div>
                          <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight text-foreground">
                            {project.title}
                          </h3>
                          <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                            {shortfall === 0 ? "Goal achieved" : `${formatCurrency(shortfall)} left`}
                          </p>
                        </div>
                      </div>

                      <div className="relative mt-4 rounded-[1.15rem] border border-border/70 bg-background/65 p-3">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-primary">{formatCurrency(project.raised)}</span>
                          <span className="text-muted-foreground">Goal {formatCurrency(project.goal)}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.12 }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          />
                        </div>
                      </div>
                      <Suspense fallback={null}>
                        <ProjectFundingActions
                          title={project.title}
                          slug={project.slug}
                          donateLabel="Donate Now"
                          compact
                          className="mt-3"
                        />
                      </Suspense>
                    </motion.article>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
          ) : (
            <div className="rounded-[1.6rem] border border-border bg-card p-6 text-center shadow-sm">
              <h3 className="font-display text-2xl font-semibold text-foreground">
                No recent projects are published yet.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                New project updates are coming soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Access */}
      <section className="relative border-b border-border/70 py-10 md:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,hsl(var(--primary)/0.07),transparent_40%),radial-gradient(circle_at_90%_80%,hsl(var(--accent)/0.08),transparent_42%)]" />
        <div className="container relative z-10 mx-auto px-4">
          <AnimatedSection className="mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className={sectionTagClass}>
                  <Compass className="h-3.5 w-3.5" />
                  Quick Access
                </span>
                <h2 className={sectionTitleClass}>
                  Fast Routes to What Matters
                </h2>
              </div>
              <Link to="/about" className="inline-flex items-center text-sm font-semibold text-primary">
                Explore Foundation <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickAccessLinks.map((item, index) => (
              <AnimatedSection key={item.title} delay={index * 0.06}>
                <Link to={item.to} className="group block h-full">
                  <motion.article
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 210, damping: 20 }}
                    className="relative h-full overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-shadow group-hover:shadow-lg"
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                      {item.icon}
                    </span>
                    <h3 className="relative mt-3 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    <span className="relative mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-primary">
                      Open <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </motion.article>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="relative overflow-hidden border-b border-border bg-card py-14 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.07),transparent_42%),radial-gradient(circle_at_78%_70%,hsl(var(--accent)/0.08),transparent_44%)]" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
            {impactStats.map((item, index) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 190, damping: 20 }}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card/85 px-3 py-5 shadow-[0_22px_60px_-50px_hsl(var(--foreground))] backdrop-blur-sm sm:px-4"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <motion.div
                  aria-hidden
                  animate={{ x: ["-120%", "130%"] }}
                  transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.4, ease: "linear", delay: index * 0.2 }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/18 to-transparent"
                />
                <Suspense fallback={null}>
                  <ImpactCounter end={item.end} suffix={item.suffix} label={item.label} icon={item.icon} delay={index * 0.1} />
                </Suspense>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <CinematicImpactStory />
      </Suspense>

      {/* About */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <motion.div
          aria-hidden
          animate={{ x: [0, 26, 0], y: [0, -14, 0], opacity: [0.15, 0.32, 0.15] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-14 left-4 md:left-14 h-60 w-60 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -20, 0], y: [0, 16, 0], opacity: [0.12, 0.24, 0.12] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 right-2 md:right-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_46%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.1),transparent_44%)]" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid items-center gap-8 lg:grid-cols-12 xl:gap-10">
            <AnimatedSection direction="left" className="order-2 lg:order-1 lg:col-span-6">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="group relative overflow-hidden rounded-[2rem] border border-border/85 bg-card/95 p-6 shadow-[0_24px_80px_-45px_hsl(var(--foreground))] backdrop-blur-sm md:p-9"
              >
                <motion.div
                  aria-hidden
                  animate={{ x: ["-100%", "150%"] }}
                  transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.4, ease: "linear" }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-sm"
                />

                <span className={`relative mb-4 ${sectionTagClass}`}>
                  <Users className="h-4 w-4" /> About
                </span>

                <h2 className={`relative mb-4 ${sectionTitleClass}`}>
                  Purpose-Driven, Community-Rooted
                </h2>
                <p className="relative mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {aboutContent.homepageSummary}
                </p>

                <div className="relative mb-7 space-y-3">
                  {aboutPoints.map((point, index) => (
                    <motion.div
                      key={point}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ x: 8 }}
                      className="flex gap-2.5 rounded-xl border border-transparent px-2.5 py-2 transition-all duration-300 hover:border-border hover:bg-muted/45"
                    >
                      <motion.span
                        aria-hidden
                        animate={{ scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <p className="text-sm text-muted-foreground">{point}</p>
                    </motion.div>
                  ))}
                </div>

                <Link to="/about">
                  <Button className="group/btn bg-primary text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
                    View More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                  </Button>
                </Link>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection direction="right" className="order-1 lg:order-2 lg:col-span-6">
              <div className="relative">
                <motion.div
                  aria-hidden
                  animate={{ rotate: [0, 2, -2, 0], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute -inset-2 rounded-[2rem] border border-primary/20"
                />
                {aboutVisualsData.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {aboutVisualsData.map((visual, index) => (
                    <motion.div
                      key={visual.alt}
                      initial={{ opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.55, delay: index * 0.12 }}
                      whileHover={{
                        y: -10,
                        scale: 1.02,
                        rotate: index === 0 ? 0.2 : index % 2 === 0 ? -0.8 : 0.8,
                      }}
                      className={`group relative overflow-hidden rounded-2xl border border-border/90 shadow-lg shadow-foreground/10 ${visual.className}`}
                    >
                      <img
                        src={visual.image}
                        alt={visual.alt}
                        width={640}
                        height={420}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/15 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="pointer-events-none absolute inset-y-0 -left-2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-primary-foreground/35 to-transparent opacity-0 transition-all duration-700 group-hover:left-[110%] group-hover:opacity-100" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground sm:text-[13px]">
                          {visual.label}
                        </p>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary-foreground/35 bg-primary-foreground/15 backdrop-blur-sm">
                          <ArrowRight className="h-3.5 w-3.5 text-primary-foreground transition-transform duration-300 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.8rem] border border-border/85 bg-card/90 p-6 text-center shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground">
                      Community visuals are coming soon.
                    </p>
                  </div>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 md:py-24 section-gradient relative overflow-hidden">
        <motion.div
          animate={{ x: [0, 14, 0], opacity: [0.14, 0.3, 0.14] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <span className={sectionTagClass}>
                <Camera className="h-3.5 w-3.5" />
                Gallery
              </span>
              <h2 className={sectionTitleClass}>Visual Storytelling Wall</h2>
            </div>
            <Link to="/gallery">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </AnimatedSection>

          {galleryShotsData.length > 0 ? (
            <div className="grid md:grid-cols-12 gap-4">
              <Link to="/gallery" className="block md:col-span-5">
                <motion.div
                  whileHover={{ y: -6 }}
                  className="rounded-2xl overflow-hidden border border-border h-60 sm:h-72 md:h-[430px] group relative"
                >
                  <img
                    src={galleryShotsData[0].image}
                    alt={galleryShotsData[0].title}
                    width={900}
                    height={520}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </motion.div>
              </Link>

              <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
                {galleryShotsData.slice(1).map((shot) => (
                  <Link key={shot.title} to="/gallery" className="block">
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="rounded-2xl overflow-hidden border border-border h-48 sm:h-52 md:h-[206px] group relative"
                    >
                      <img
                        src={shot.image}
                        alt={shot.title}
                        width={480}
                        height={280}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                New gallery moments are coming soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {featuredImpactVideo ? (
        <FeaturedVideoTeaser video={featuredImpactVideo} />
      ) : null}

      {/* Stories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-10 md:mb-12">
            <span className={sectionTagClass}>
              <FileText className="h-3.5 w-3.5" />
              Stories
            </span>
            <h2 className={sectionTitleClass}>Impact Stories From the Ground</h2>
          </AnimatedSection>

          {storiesData.length > 0 ? (
            <div className="grid lg:grid-cols-5 gap-6">
              <AnimatedSection className="lg:col-span-3">
                <motion.div whileHover={{ y: -6 }} className="rounded-3xl overflow-hidden border border-border bg-card h-full shadow-lg group">
                  <div className="relative h-64 sm:h-72 md:h-80">
                    <img
                      src={storiesData[0].image}
                      alt={storiesData[0].title}
                      width={720}
                      height={420}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                    <p className="absolute bottom-3 left-3 text-primary-foreground text-xs uppercase tracking-wider">Featured Story</p>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      {storiesData[0].date}
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-3">{storiesData[0].title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{storiesData[0].excerpt}</p>
                  </div>
                </motion.div>
              </AnimatedSection>

              <AnimatedSection className="lg:col-span-2">
                <div className="space-y-4">
                  {storiesData.slice(1).map((story, i) => (
                    <motion.div
                      key={story.title}
                      whileHover={{ x: 4 }}
                      className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-xs uppercase tracking-wider text-accent">Story {i + 2}</p>
                        <span className="text-xs text-muted-foreground">{story.date}</span>
                      </div>
                      <h4 className="font-display text-lg font-semibold mb-2">{story.title}</h4>
                      <p className="text-sm text-muted-foreground">{story.excerpt}</p>
                    </motion.div>
                  ))}
                  <Link to="/news-stories" className="inline-block">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      View More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          ) : (
            <div className="rounded-[1.6rem] border border-border bg-card p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                New impact stories are coming soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Partners */}
      <section className="relative overflow-hidden border-y border-border/70 py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,hsl(var(--primary)/0.08),transparent_40%),radial-gradient(circle_at_90%_70%,hsl(var(--accent)/0.1),transparent_44%)]" />
        <div className="container relative z-10 mx-auto px-4">
          <AnimatedSection className="mb-8 md:mb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className={sectionTagClass}>
                  <Handshake className="h-3.5 w-3.5" />
                  Our Partners
                </span>
                <h2 className={sectionTitleClass}>Trust Built Through Shared Missions</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  CSR teams, community groups, and mission-aligned organizations power every project we deliver.
                </p>
              </div>
              <Link to="/contact">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Become a Partner
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/70 px-6 py-10 backdrop-blur-sm shadow-[0_30px_90px_-60px_hsl(var(--foreground))]">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/90 to-transparent" />
            <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_96px,_black_calc(100%-96px),transparent_100%)]">
              <div className="partner-marquee flex w-max items-center gap-10">
                {partnerRow.map((partner, index) => (
                  <a
                    key={`${partner.name}-${index}`}
                    href={"url" in partner && partner.url ? partner.url : undefined}
                    target={"url" in partner && partner.url ? "_blank" : undefined}
                    rel={"url" in partner && partner.url ? "noreferrer" : undefined}
                    className="flex h-20 w-40 items-center justify-center rounded-xl border border-border/60 bg-background/80 px-4 shadow-sm transition hover:scale-[1.03] hover:shadow-md"
                    aria-label={partner.name}
                  >
                    {"logoUrl" in partner && partner.logoUrl ? (
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        width={"logoWidth" in partner && partner.logoWidth ? partner.logoWidth : 224}
                        height={"logoHeight" in partner && partner.logoHeight ? partner.logoHeight : 56}
                        loading="lazy"
                        decoding="async"
                        className="h-14 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {partner.monogram}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {testimonialsToShow.length > 0 ? (
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,hsl(var(--accent)/0.12),transparent_40%),radial-gradient(circle_at_86%_78%,hsl(var(--primary)/0.1),transparent_42%)]" />
          <motion.div
            aria-hidden
            animate={{ x: [0, 16, 0], y: [0, -10, 0], opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-20 right-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ x: [0, -16, 0], y: [0, 12, 0], opacity: [0.12, 0.24, 0.12] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="container relative z-10 mx-auto px-4">
            <AnimatedSection className="mb-10 md:mb-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <span className={sectionTagClass}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Testimonials
                  </span>
                  <h2 className={sectionTitleClass}>Voices That Trust Our Work</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Feedback from partner leaders and volunteers that reflects the on-the-ground impact.
                  </p>
                </div>
                <div className="rounded-full border border-border/80 bg-card/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {testimonialAverageRating.toFixed(1)}/5 Partner Rating
                </div>
              </div>
            </AnimatedSection>

            <TestimonialsCarousel items={testimonialsToShow} />
          </div>
        </section>
      ) : null}

      {/* Awards */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid xl:grid-cols-12 gap-8 md:gap-10">
            <AnimatedSection className="xl:col-span-12">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-lg h-full">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <span className={sectionTagClass}>
                      <Award className="h-3.5 w-3.5" />
                      Awards
                    </span>
                    <h2 className={sectionTitleClass}>Recognition Timeline</h2>
                  </div>
                  <Link to="/awards">
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      View More
                    </Button>
                  </Link>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-5">
                    {awards.map((item) => (
                      <motion.div key={item.title} whileHover={{ x: 4 }} className="relative rounded-2xl border border-border p-4">
                        <span className="absolute -left-[29px] top-4 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                        <p className="text-xs uppercase tracking-wider text-accent mb-1">{item.year}</p>
                        <h3 className="font-display text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.issuer}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Podcast */}
      <section className="py-16 md:py-24 bg-foreground text-primary-foreground relative overflow-hidden">
        <motion.div
          animate={{ y: [0, 18, 0], opacity: [0.14, 0.32, 0.14] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 left-16 w-72 h-72 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <AnimatedSection className="lg:col-span-5">
              <span className={darkSectionTagClass}>
                <Mic className="w-4 h-4" /> Podcast
              </span>
              <h2 className={`${darkSectionTitleClass} mb-4`}>Podcast Listening Room</h2>
              <p className="text-primary-foreground/75 text-sm sm:text-base leading-relaxed mb-6">
                Audio-led storytelling with a live visualizer style block and episode previews for quick discovery.
              </p>

              <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Now Highlighting</span>
                  <span className="text-xs text-primary-foreground/65">Live Visualizer</span>
                </div>
                <div className="h-14 flex items-end gap-1">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <motion.span
                      key={i}
                      animate={{ height: [8, 26 + (i % 5) * 5, 10 + (i % 3) * 3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.04, ease: "easeInOut" }}
                      className="w-1.5 rounded-full bg-accent/90"
                    />
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-7">
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <motion.div
                    key={episode.title}
                    whileHover={{ x: 6 }}
                    className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm p-4 sm:p-5 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wider text-accent mb-1">{episode.duration}</p>
                      <h3 className="font-display text-lg sm:text-xl font-semibold mb-1">{episode.title}</h3>
                      <p className="text-sm text-primary-foreground/70">{episode.host}</p>
                    </div>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 hover:bg-accent/90 transition-colors"
                      aria-label={`Play ${episode.title}`}
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                <Link to="/podcast" className="inline-block pt-2">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    View More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 md:p-12 shadow-xl relative overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2"
              />
              <motion.div
                animate={{ scale: [1.08, 1, 1.08], opacity: [0.14, 0.3, 0.14] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 w-56 h-56 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2"
              />

              <div className="relative z-10 grid lg:grid-cols-12 gap-7 items-center">
                <div className="lg:col-span-8">
                  <span className={sectionTagClass}>
                    <Mail className="w-4 h-4" /> Contact Us
                  </span>
                  <h2 className={`${sectionTitleClass} mb-3`}>
                    Ready to Co-Create the Next Impact Chapter?
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
                    Reach out for volunteering, partnerships, donations, CSR programs, or local project collaboration.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col xl:flex-row lg:justify-end gap-3">
                  <Link to="/contact" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 px-6">
                      <Heart className="w-4 h-4 mr-2" /> Donate Now
                    </Button>
                  </Link>
                  <Link to="/contact" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6">
                      View More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
