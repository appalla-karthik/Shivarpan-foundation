import { useEffect, useState } from "react";
import { Calendar, MapPin, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { assetUrl, getJson } from "@/lib/api";

type MediaAsset = {
  id: number;
  title: string;
  alt_text: string;
  url: string;
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
  sort_order: number;
};

type UpcomingEventsProps = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
};

const UpcomingEvents = ({ heroTitle, heroSubtitle, heroImage }: UpcomingEventsProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<UpcomingEventPayload | null>(null);
  const [events, setEvents] = useState<UpcomingEventPayload[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getJson<UpcomingEventPayload[]>("upcoming-events/?is_active=true", { cache: false });
        setEvents(Array.isArray(data) ? data.filter((item) => item.title) : []);
      } catch {
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  const featuredEvent = events[0];
  const pageHeroImage = assetUrl(heroImage);
  const openPreview = (event: UpcomingEventPayload) => {
    setPreviewEvent(event);
    setIsPreviewOpen(true);
  };

  return (
    <div className="relative overflow-hidden">
      <PageHero
        title={heroTitle || "Upcoming Events"}
        subtitle={heroSubtitle || featuredEvent?.subtitle || "Explore upcoming programs, camps, drives, and community gatherings."}
        image={pageHeroImage || undefined}
      />

      <section className="relative py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          {isLoadingEvents ? (
            <div className="mx-auto max-w-2xl rounded-[1.6rem] border border-border bg-card p-6 text-center text-sm font-medium text-muted-foreground">
              Loading upcoming events...
            </div>
          ) : null}

          {!isLoadingEvents && events.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-[1.6rem] border border-border bg-card p-6 text-center">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                No upcoming event is published yet.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Upcoming event details are coming soon.
              </p>
            </div>
          ) : null}

          {events.length > 0 ? (
            <AnimatedSection className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event, index) => {
                const posterUrl = assetUrl(event.poster_image?.url) || "/placeholder.svg";

                return (
                  <motion.article
                    key={event.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.04 }}
                    whileHover={{ y: -5 }}
                    className="group overflow-hidden rounded-[1.6rem] border border-border/80 bg-card/92 shadow-[0_24px_70px_-52px_hsl(var(--foreground))] backdrop-blur-sm"
                  >
                    <button
                      type="button"
                      onClick={() => openPreview(event)}
                      className="relative block aspect-square w-full overflow-hidden bg-[#07171d] text-left"
                      aria-label={`View ${event.title} poster`}
                    >
                      <img
                        src={posterUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-[-4%] h-[108%] w-[108%] scale-110 object-cover opacity-38 blur-xl saturate-110"
                      />
                      <img
                        src={posterUrl}
                        alt={event.title}
                        className="relative z-[1] h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.015]"
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-transparent to-black/16" />
                      <span className="absolute left-3 top-3 z-[3] inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        {event.sort_order === 0 ? "Featured Event" : `Event ${index + 1}`}
                      </span>
                      <span className="absolute bottom-3 left-3 z-[3] rounded-full border border-white/25 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        View poster
                      </span>
                    </button>

                    <div className="p-5 sm:p-6">
                      <h2 className="font-display text-2xl font-bold leading-tight text-foreground">
                        {event.title}
                      </h2>
                      {event.subtitle ? (
                        <p className="mt-2 text-sm font-semibold text-primary">{event.subtitle}</p>
                      ) : null}
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {event.description || "Event details are coming soon."}
                      </p>

                      <div className="mt-5 grid gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-2">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {event.date_label || "Upcoming"}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {event.location_label || "Location to be announced"}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        {event.cta_url ? (
                          <a href={event.cta_url} target="_blank" rel="noreferrer">
                            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                              {event.cta_text || "View Details"}
                            </Button>
                          </a>
                        ) : null}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => openPreview(event)}
                          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          View Poster
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatedSection>
          ) : null}
        </div>
      </section>

      <AnimatePresence>
        {isPreviewOpen && previewEvent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/80 px-4 py-8 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative inline-flex max-h-[90vh] max-w-[94vw] rounded-3xl border border-white/20 bg-white/10 p-3 shadow-[0_40px_120px_-60px_hsl(var(--foreground))] backdrop-blur-md"
              onClick={(modalEvent) => modalEvent.stopPropagation()}
            >
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute right-6 top-6 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/65 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/85"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="inline-flex max-h-[calc(90vh-1.5rem)] max-w-[calc(94vw-1.5rem)] items-center justify-center overflow-hidden rounded-[1.2rem] bg-black/25">
                <img
                  src={assetUrl(previewEvent.poster_image?.url) || "/placeholder.svg"}
                  alt={`${previewEvent.title} poster full size`}
                  decoding="async"
                  className="block h-auto max-h-[calc(90vh-1.5rem)] w-auto max-w-[calc(94vw-1.5rem)] object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default UpcomingEvents;
