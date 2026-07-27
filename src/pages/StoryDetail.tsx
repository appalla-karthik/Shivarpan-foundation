import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHero from "@/components/PageHero";
import { assetUrl, getJson, reportApiError } from "@/lib/api";
import { sanitizeCmsHtml } from "@/lib/sanitizeHtml";
import type { StoryPayload } from "@/types/content";

const StoryDetail = () => {
  const { storySlug } = useParams();
  const [story, setStory] = useState<StoryPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!storySlug || !/^[a-zA-Z0-9_-]+$/.test(storySlug)) {
      setStory(null);
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setNotFound(false);

    getJson<StoryPayload>(`stories/by-slug/${storySlug}/`, { cache: true })
      .then((data) => {
        if (!isMounted) return;
        setStory(data);
        setNotFound(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        reportApiError("Unable to load story", error);
        setStory(null);
        setNotFound(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [storySlug]);

  useEffect(() => {
    if (!story) return;
    document.title = `${story.seo_title || story.title} | Shivarpan Foundation`;
    const description = story.seo_description || story.excerpt;
    if (description) {
      document
        .querySelector<HTMLMetaElement>('meta[name="description"]')
        ?.setAttribute("content", description);
    }
  }, [story]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-background px-4 py-24">
        <div className="mx-auto max-w-3xl animate-pulse rounded-[2rem] border border-border bg-card p-8">
          <div className="h-4 w-32 rounded-full bg-muted" />
          <div className="mt-5 h-10 w-4/5 rounded-xl bg-muted" />
          <div className="mt-8 h-72 rounded-[1.5rem] bg-muted" />
        </div>
      </div>
    );
  }

  if (notFound || !story) {
    return (
      <div className="min-h-[70vh] bg-background px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Story unavailable
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground">
            This dispatch could not be found.
          </h1>
          <Link
            to="/news-stories"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = assetUrl(story.featured_image?.url);

  return (
    <article className="bg-background">
      <PageHero
        title={story.title}
        subtitle={story.excerpt || "A field dispatch from Shivarpan Foundation."}
        image={heroImage}
      />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/news-stories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/75"
          >
            <ArrowLeft className="h-4 w-4" />
            All Stories
          </Link>

          <div className="mt-6 rounded-[2rem] border border-border/80 bg-card p-5 shadow-[0_28px_80px_-60px_hsl(var(--foreground))] sm:p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-border pb-6 text-sm text-muted-foreground">
              {story.category ? (
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {story.category}
                </span>
              ) : null}
              {story.date_label ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {story.date_label}
                </span>
              ) : null}
              {story.location_label ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  {story.location_label}
                </span>
              ) : null}
              {story.read_time ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {story.read_time}
                </span>
              ) : null}
            </div>

            {story.body?.trim() ? (
              <div
                className="mt-8 text-[1.02rem] leading-8 text-foreground/82 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_blockquote]:my-7 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:bg-muted/50 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-foreground [&_img]:my-7 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-[1.5rem] [&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:text-foreground [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(story.body) }}
              />
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                The full dispatch is being prepared.
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default StoryDetail;
