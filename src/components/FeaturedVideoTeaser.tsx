import { ArrowUpRight, Film, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { assetUrl } from "@/lib/api";
import type { ImpactVideoPayload } from "@/types/content";

interface FeaturedVideoTeaserProps {
  video: ImpactVideoPayload;
}

const FeaturedVideoTeaser = ({ video }: FeaturedVideoTeaserProps) => {
  const thumbnail =
    assetUrl(video.effective_thumbnail_url || video.thumbnail?.url) || "/placeholder.svg";

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <Link
          to="/news-stories#impact-in-motion"
          className="group grid overflow-hidden rounded-[2.2rem] border border-border/70 bg-[#082b3a] shadow-[0_35px_90px_-55px_rgba(4,31,43,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 lg:grid-cols-[1.25fr_0.75fr]"
          aria-label={`Watch ${video.title} in Impact in Motion`}
        >
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[380px]">
            <img
              src={thumbnail}
              alt={video.thumbnail?.alt_text || `${video.title} video thumbnail`}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#082b3a]/30 lg:to-[#082b3a]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03131b]/70 via-transparent to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/45 bg-white/18 text-white shadow-2xl backdrop-blur-md transition group-hover:scale-105 group-hover:bg-accent group-hover:text-accent-foreground">
              <Play className="ml-1 h-6 w-6" fill="currentColor" />
            </span>
          </div>

          <div className="relative flex flex-col justify-center p-7 text-white sm:p-10 lg:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
            <span className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.19em] text-[#f5ad57]">
              <Film className="h-4 w-4" />
              Featured video
            </span>
            <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.17em] text-white/55">
              {video.category || "Impact in Motion"}
            </p>
            <h2 className="relative mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
              {video.title}
            </h2>
            {video.short_description ? (
              <p className="relative mt-4 text-sm leading-relaxed text-white/68 sm:text-base">
                {video.short_description}
              </p>
            ) : null}
            <span className="relative mt-7 inline-flex w-fit items-center gap-2 border-b border-[#f5ad57]/70 pb-1 text-sm font-semibold text-[#ffc078] transition group-hover:border-[#ffc078] group-hover:text-white">
              Watch in Impact in Motion
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default FeaturedVideoTeaser;
