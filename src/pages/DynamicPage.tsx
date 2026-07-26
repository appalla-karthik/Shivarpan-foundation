import { cloneElement, isValidElement, useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import PageHero from "@/components/PageHero";
import NotFound from "@/pages/NotFound";
import { getJson, reportApiError } from "@/lib/api";

type MediaAsset = {
  id: number;
  title: string;
  alt_text: string;
  url: string;
};

type PagePayload = {
  id: number;
  title: string;
  slug: string;
  body: string;
  embed_html: string;
  cover_image: MediaAsset | null;
  seo_description: string;
  sections: PageSectionPayload[];
};

type DynamicPageProps = {
  slug?: string;
  fallback?: ReactNode;
};

type PageSectionPayload = {
  id: number;
  section_type: string;
  title: string;
  body: string;
  image: MediaAsset | null;
  embed_html: string;
  button_text: string;
  button_url: string;
  sort_order: number;
  is_enabled: boolean;
  extra: Record<string, unknown>;
};

const DynamicPage = ({ slug: forcedSlug, fallback }: DynamicPageProps) => {
  const params = useParams();
  const slug = forcedSlug || params.slug;
  const [page, setPage] = useState<PagePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;
    const loadPage = async () => {
      if (!slug) {
        setIsLoading(false);
        setIsNotFound(true);
        return;
      }

      setIsLoading(true);
      setIsNotFound(false);

      try {
        const data = await getJson<PagePayload>(`pages/by-slug/${slug}/`);
        if (isMounted) {
          setPage(data);
        }
      } catch (error) {
        reportApiError("Page fetch failed", error);
        if (isMounted) {
          setIsNotFound(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!lightboxImage) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxImage(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  const heroSubtitle = useMemo(() => {
    if (!page?.seo_description) {
      return "Stay connected with Shivarpan Foundation’s latest initiatives and community updates.";
    }
    return page.seo_description;
  }, [page?.seo_description]);

  if (isNotFound) {
    return fallback ? <>{fallback}</> : <NotFound />;
  }

  if (isLoading || !page) {
    return (
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="h-40 animate-pulse rounded-3xl border border-border/70 bg-card/70" />
        </div>
      </div>
    );
  }

  const hasBody = Boolean(page.body?.trim());
  const hasEmbed = Boolean(page.embed_html?.trim());
  const enabledSections = page.sections?.filter((section) => section.is_enabled) ?? [];
  const hasSections = enabledSections.length > 0;
  const shouldShowFallback = Boolean(fallback) && !hasBody && !hasEmbed && !hasSections;

  if (shouldShowFallback) {
    if (isValidElement(fallback)) {
      return cloneElement(fallback, {
        heroTitle: page.title,
        heroSubtitle: page.seo_description?.trim() || undefined,
        heroImage: page.cover_image?.url || undefined,
      } as Record<string, unknown>);
    }
    return <>{fallback}</>;
  }

  return (
    <div className="relative overflow-hidden">
      <PageHero
        title={page.title}
        subtitle={heroSubtitle}
        image={page.cover_image?.url}
      />

      <section className="relative py-10 sm:py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <AnimatedSection className="mx-auto max-w-4xl rounded-[1.8rem] border border-border/85 bg-card/92 p-6 shadow-[0_24px_72px_-52px_hsl(var(--foreground))] backdrop-blur-sm sm:p-8">
              <div
                className="dynamic-content space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base"
                onClick={(event) => {
                  const target = event.target as HTMLElement | null;
                  if (!target || target.tagName !== "IMG") {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  const image = target as HTMLImageElement;
                  setLightboxImage({
                    src: image.currentSrc || image.src,
                    alt: image.alt || "Image preview",
                  });
                }}
              >
                {page.body ? (
                  <div dangerouslySetInnerHTML={{ __html: page.body }} />
                ) : (
                  <p>Fresh content is being prepared for this page.</p>
                )}
              </div>

              {page.embed_html ? (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-background/80"
                >
                  <div dangerouslySetInnerHTML={{ __html: page.embed_html }} />
                </motion.div>
              ) : null}
            </AnimatedSection>

            {enabledSections.length ? (
              <div className="space-y-5">
                {enabledSections.map((section) => {
                  const isSplit = ["split", "image-left", "image-right"].includes(section.section_type);
                  const isCta = section.section_type === "cta";
                  const isEmbed = section.section_type === "embed";
                  const imageLeft = section.section_type !== "image-right";

                  if (isEmbed && section.embed_html) {
                    return (
                      <AnimatedSection key={section.id}>
                        <div className="overflow-hidden rounded-[1.6rem] border border-border/80 bg-card/90 p-4 shadow-[0_24px_70px_-52px_hsl(var(--foreground))] backdrop-blur-sm">
                          <div dangerouslySetInnerHTML={{ __html: section.embed_html }} />
                        </div>
                      </AnimatedSection>
                    );
                  }

                  return (
                    <AnimatedSection key={section.id}>
                      <div
                        className={`rounded-[1.8rem] border border-border/85 bg-card/92 p-6 shadow-[0_24px_72px_-52px_hsl(var(--foreground))] backdrop-blur-sm sm:p-8 ${
                          isCta ? "border-primary/40 bg-primary/5" : ""
                        }`}
                      >
                        <div className={isSplit ? "grid gap-6 lg:grid-cols-2 lg:items-center" : "space-y-4"}>
                          {section.image && imageLeft ? (
                            <div className="overflow-hidden rounded-2xl border border-border/70">
                              <img src={section.image.url} alt={section.title || "Section image"} className="h-full w-full object-cover" />
                            </div>
                          ) : null}

                          <div className="dynamic-content space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                            {section.title ? (
                              <h2 className="font-display text-2xl font-bold text-foreground">{section.title}</h2>
                            ) : null}
                            {section.body ? (
                              <div dangerouslySetInnerHTML={{ __html: section.body }} />
                            ) : null}
                            {section.button_text && section.button_url ? (
                              <a
                                href={section.button_url}
                                className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"
                              >
                                {section.button_text}
                              </a>
                            ) : null}
                          </div>

                          {section.image && !imageLeft ? (
                            <div className="overflow-hidden rounded-2xl border border-border/70">
                              <img src={section.image.url} alt={section.title || "Section image"} className="h-full w-full object-cover" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {lightboxImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-[min(94vw,900px)] overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-sm font-semibold text-slate-700 shadow hover:bg-white"
            >
              ×
            </button>
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="block h-auto max-h-[85vh] w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DynamicPage;
