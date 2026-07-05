import { useEffect, useState } from "react";
import { Calendar, MapPin, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { getJson } from "@/lib/api";

const EVENT_POSTER_URL = "/upcoming-event-poster.webp";

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
};

const fallbackEvent: UpcomingEventPayload = {
  id: 0,
  title: "Community Action Week 2026",
  subtitle: "Community Action Week 2026 – education support, health camps, and food relief drives.",
  description:
    "Join our upcoming drives across education support, health camps, and food relief. Volunteer slots, CSR participation, and donor collaborations are now open.",
  date_label: "April 2026",
  location_label: "Mumbai + Nearby Districts",
  poster_image: null,
  cta_text: "Register Interest",
  cta_url: "/contact",
};

const UpcomingEvents = () => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [event, setEvent] = useState<UpcomingEventPayload>(fallbackEvent);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await getJson<Partial<UpcomingEventPayload>>("upcoming-events/active");
        if (data && data.title) {
          setEvent({
            ...fallbackEvent,
            ...data,
          } as UpcomingEventPayload);
        } else {
          setEvent(fallbackEvent);
        }
      } catch {
        setEvent(fallbackEvent);
      }
    };

    loadEvent();
  }, []);

  return (
    <div className="relative overflow-hidden">
      <PageHero
        title="Upcoming Events"
        subtitle={event.subtitle || fallbackEvent.subtitle}
        image={event.poster_image?.url || EVENT_POSTER_URL}
      />

      <section className="relative py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="rounded-[1.6rem] border border-border/80 bg-card/90 p-6 shadow-[0_24px_70px_-52px_hsl(var(--foreground))] backdrop-blur-sm">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Featured Event
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  {event.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {event.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {event.date_label || fallbackEvent.date_label}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {event.location_label || fallbackEvent.location_label}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {event.cta_text || fallbackEvent.cta_text}
                  </Button>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Download Schedule
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="group relative w-full overflow-hidden rounded-[1.6rem] border border-border/80 bg-muted/30 shadow-[0_24px_70px_-52px_hsl(var(--foreground))] transition hover:shadow-lg"
                aria-label="View event poster"
              >
                <img
                  src={event.poster_image?.url || EVENT_POSTER_URL}
                  alt="Upcoming event poster"
                  className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-90" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                  Tap to view full size
                </span>
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <AnimatePresence>
        {isPreviewOpen ? (
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
              className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-primary/30 bg-background shadow-[0_40px_120px_-60px_hsl(var(--foreground))]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={event.poster_image?.url || EVENT_POSTER_URL}
                alt="Upcoming event poster full size"
                className="h-full w-full object-contain"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default UpcomingEvents;
