import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { assetUrl, getJson } from "@/lib/api";

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

const UpcomingEventPopup = ({ enabled = true }: UpcomingEventPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState<UpcomingEventPayload | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsOpen(false);
      return;
    }

    const loadEvent = async () => {
      try {
        const data = await getJson<Partial<UpcomingEventPayload>>("upcoming-events/active");
        if (data && data.title && data.poster_image?.url) {
          setEvent(data as UpcomingEventPayload);
          setIsOpen(true);
        } else {
          setEvent(null);
          setIsOpen(false);
        }
      } catch {
        setEvent(null);
        setIsOpen(false);
      }
    };

    loadEvent();
  }, [enabled]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && event ? (
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
            className="relative inline-flex max-h-[88vh] max-w-[94vw] rounded-[2rem] border border-white/18 bg-white/10 p-3 text-white shadow-[0_42px_130px_-58px_hsl(var(--foreground))] backdrop-blur-md"
          >
            <div className="relative inline-flex max-h-[calc(88vh-1.5rem)] max-w-[calc(94vw-1.5rem)] items-center justify-center overflow-hidden rounded-[1.55rem] bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_54px_rgba(0,0,0,0.38)]">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/68 text-white shadow-[0_12px_28px_rgba(0,0,0,0.32)] backdrop-blur-md transition-colors hover:bg-black/85"
                aria-label="Close popup"
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={assetUrl(event.poster_image?.url)}
                alt="Upcoming event poster"
                width={600}
                height={600}
                decoding="async"
                className="block h-auto max-h-[calc(88vh-1.5rem)] w-auto max-w-[calc(94vw-1.5rem)] rounded-[1.35rem] object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default UpcomingEventPopup;
