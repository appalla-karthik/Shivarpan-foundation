import { useRef, useState } from "react";
import { motion } from "@/components/StaticMotion";
import { ArrowUpRight } from "lucide-react";

const whatsappLink =
  "https://api.whatsapp.com/send/?phone=919898038241&text&type=phone_number&app_absent=0";

const WhatsAppIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    className="h-5 w-5 shrink-0"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M27.18 4.78A15.06 15.06 0 0 0 16.52.3C8.24.3 1.5 7.03 1.5 15.33c0 2.66.7 5.26 2.03 7.55L1.3 31.7l9.06-2.14a15.03 15.03 0 0 0 6.16 1.3h.01c8.27 0 15-6.74 15-15.03 0-4-1.56-7.75-4.35-10.05Z"
      fill="currentColor"
      opacity="0.16"
    />
    <path
      d="M16.51 2.8c-6.9 0-12.5 5.61-12.5 12.52 0 2.48.73 4.88 2.1 6.94l-1.36 5 5.13-1.35a12.44 12.44 0 0 0 6.62 1.9c6.9 0 12.52-5.61 12.52-12.5A12.53 12.53 0 0 0 16.5 2.8Zm0 22.89a10.3 10.3 0 0 1-5.26-1.44l-.38-.23-3.04.8.81-2.96-.25-.4a10.34 10.34 0 0 1-1.6-5.53c0-5.72 4.64-10.38 10.37-10.38 2.76 0 5.35 1.08 7.3 3.04a10.3 10.3 0 0 1 3.04 7.34c0 5.72-4.66 10.37-10.39 10.37Z"
      fill="currentColor"
    />
    <path
      d="M22.68 18.43c-.34-.17-2.03-1-2.35-1.12-.31-.11-.54-.17-.77.18-.22.34-.88 1.11-1.07 1.33-.2.23-.4.26-.74.09-.35-.17-1.46-.54-2.78-1.72-1.03-.92-1.72-2.06-1.92-2.41-.2-.35-.02-.54.15-.71.15-.15.34-.4.52-.6.17-.2.23-.35.34-.58.11-.23.06-.43-.03-.6-.09-.17-.77-1.86-1.06-2.54-.28-.67-.56-.58-.77-.59h-.66c-.23 0-.6.08-.92.43-.31.34-1.2 1.17-1.2 2.85 0 1.69 1.23 3.33 1.4 3.55.17.23 2.43 3.72 5.89 5.22.82.36 1.47.58 1.97.74.83.26 1.58.22 2.17.13.67-.1 2.04-.84 2.33-1.65.29-.8.29-1.49.2-1.64-.08-.14-.31-.23-.66-.4Z"
      fill="currentColor"
    />
  </svg>
);

const FloatingWhatsAppButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dragBoundsRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={dragBoundsRef}
      className="pointer-events-none fixed inset-0 z-[60]"
    >
      <motion.div
        drag
        dragConstraints={dragBoundsRef}
        dragMomentum={false}
        whileTap={{ cursor: "grabbing" }}
        className="pointer-events-auto absolute bottom-20 right-4 cursor-grab sm:bottom-8 sm:right-6 lg:bottom-10"
      >
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Shivarpan Foundation on WhatsApp"
          className="relative inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => setIsExpanded(false)}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[#25D366]/10 opacity-80 blur-2xl"
          />

          <motion.span
            className={`relative hidden overflow-hidden rounded-full border border-white/90 bg-white/98 shadow-[0_18px_42px_-22px_rgba(15,23,42,0.34),0_10px_24px_-18px_rgba(37,211,102,0.2)] ring-1 ring-slate-900/5 backdrop-blur-xl transition-[width] duration-300 sm:flex ${
              isExpanded ? "w-[304px]" : "w-[68px]"
            }`}
            initial={false}
            animate={{ width: isExpanded ? 304 : 68 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.8 }}
          >
            <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))]" />
            <span className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-95" />

            <span className="relative flex w-full items-center gap-3 py-2.5 pl-3 pr-1.5">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_28px_-14px_rgba(37,211,102,0.95)]">
                <WhatsAppIcon />
              </span>

              <motion.span
                className={`flex min-w-[166px] flex-1 flex-col text-left leading-none transition duration-200 ${
                  isExpanded ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                }`}
                initial={false}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  x: isExpanded ? 0 : 8,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Instant Support
                </span>
                <span className="mt-1 text-[0.95rem] font-semibold tracking-[0.005em] text-slate-900">
                  Chat on WhatsApp
                </span>
              </motion.span>

              <motion.span
                className={`flex items-center gap-3 transition duration-200 ${
                  isExpanded ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                }`}
                initial={false}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  x: isExpanded ? 0 : 8,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <span className="h-9 w-px bg-slate-200/90" />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-emerald-700 ring-1 ring-slate-200 transition-all duration-300">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </motion.span>

            </span>
          </motion.span>

          <span className="relative inline-flex h-[3.7rem] w-[3.7rem] items-center justify-center rounded-full border border-white/90 bg-white/98 p-[0.34rem] shadow-[0_18px_42px_-16px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:hidden">
            <span className="absolute inset-[5px] rounded-full border border-emerald-100/80" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_24px_-14px_rgba(37,211,102,0.9)]">
              <WhatsAppIcon />
            </span>
          </span>
        </a>
      </motion.div>
    </div>
  );
};

export default FloatingWhatsAppButton;
