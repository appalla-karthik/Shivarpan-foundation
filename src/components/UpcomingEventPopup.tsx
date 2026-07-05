import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getJson } from "@/lib/api";

const EVENT_POSTER_URL = "/upcoming-event-poster.webp";

type UpcomingEventPopupProps = {
  enabled?: boolean;
};

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
  subtitle: "",
  description:
    "Join our upcoming drives across education support, health camps, and food relief. Volunteer slots, CSR participation, and donor collaborations are now open.",
  date_label: "April 2026",
  location_label: "Mumbai + Nearby Districts",
  poster_image: null,
  cta_text: "View Upcoming Events",
  cta_url: "/upcoming-events",
};

const UpcomingEventPopup = ({ enabled = true }: UpcomingEventPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState<UpcomingEventPayload>(fallbackEvent);

  useEffect(() => {
    if (enabled) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

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
  }, [enabled]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/70 px-4 py-8 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative h-[min(600px,86vh)] w-[min(600px,92vw)] overflow-hidden rounded-[1.5rem] bg-transparent text-white shadow-[0_40px_120px_-60px_hsl(var(--foreground))]"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-2 top-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white transition-colors hover:bg-black/80"
              aria-label="Close popup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-full w-auto items-center justify-center bg-transparent">
              <img
                src={event.poster_image?.url || EVENT_POSTER_URL}
                alt="Upcoming event poster"
                width={600}
                height={600}
                decoding="async"
                className="h-full w-full rounded-[0.85rem] object-contain shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default UpcomingEventPopup;
