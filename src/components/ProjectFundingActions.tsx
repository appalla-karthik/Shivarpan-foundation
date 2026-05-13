import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectFundingActionsProps {
  title: string;
  slug: string;
  donateLabel?: string;
  className?: string;
  compact?: boolean;
  donateWide?: boolean;
  donateFirst?: boolean;
}

const getProjectShareUrl = (slug: string) => {
  if (typeof window === "undefined") {
    return `/recent-projects?project=${encodeURIComponent(slug)}`;
  }

  return `${window.location.origin}/recent-projects?project=${encodeURIComponent(slug)}`;
};

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M16.04 4.1A11.8 11.8 0 0 0 5.9 21.95L4.3 27.9l6.1-1.57A11.8 11.8 0 1 0 16.04 4.1Zm0 21.45c-1.93 0-3.72-.57-5.22-1.55l-.37-.24-3.62.93.97-3.52-.25-.37a9.58 9.58 0 1 1 8.49 4.75Zm5.55-7.17c-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.18-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.25-.24-.58-.5-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.23 5.13 4.53.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.8-.73 2.05-1.44.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z"
    />
  </svg>
);

const ProjectFundingActions = ({
  title,
  slug,
  donateLabel = "Donate Now",
  className,
  compact = false,
  donateWide = false,
  donateFirst = false,
}: ProjectFundingActionsProps) => {
  const shareText = `Support Shivarpan Foundation's project: ${title}. Donate or share here: ${getProjectShareUrl(slug)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const donateHref = `/donate-now?project=${encodeURIComponent(slug)}`;

  return (
    <div className={cn("grid gap-2.5 sm:grid-cols-2", className)}>
      <Button
        asChild
        variant="outline"
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl border border-[#18d978]/55 bg-[linear-gradient(135deg,#ffffff_0%,#f4fff9_48%,#ecfff6_100%)] font-bold text-[#059654] shadow-[0_16px_42px_-28px_rgba(8,168,91,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#10c969] hover:bg-[linear-gradient(135deg,#ffffff_0%,#ecfff6_42%,#dffded_100%)] hover:text-[#047a45] hover:shadow-[0_22px_52px_-26px_rgba(8,168,91,0.95)]",
          compact ? "h-11 px-4 text-sm" : "h-12 px-5 text-base",
          donateFirst && "order-2",
        )}
      >
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`Share ${title} on WhatsApp`}
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.72)_48%,transparent_100%)] transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative flex items-center justify-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#18d978]/15 text-[#08a85b] ring-1 ring-[#18d978]/25">
              <WhatsAppGlyph className="h-5 w-5" />
            </span>
            Share
          </span>
        </a>
      </Button>
      <Button
        asChild
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(135deg,#15c7c7_0%,#08a8b4_46%,#057f98_100%)] font-bold text-white shadow-[0_18px_46px_-22px_rgba(8,168,180,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#20d6d2_0%,#0bb5bf_48%,#0789a2_100%)] hover:shadow-[0_24px_60px_-24px_rgba(8,168,180,1)]",
          compact ? "h-11 px-4 text-sm" : "h-12 px-5 text-base",
          donateWide && "sm:col-span-2 2xl:col-span-1 2xl:min-w-[13.5rem]",
          donateFirst && "order-1",
        )}
      >
        <Link to={donateHref} aria-label={`${donateLabel} for ${title}`}>
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.34),transparent_32%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] opacity-80" />
          <span className="relative flex items-center justify-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/18 text-white ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-110">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            {donateLabel}
          </span>
        </Link>
      </Button>
    </div>
  );
};

export default ProjectFundingActions;
