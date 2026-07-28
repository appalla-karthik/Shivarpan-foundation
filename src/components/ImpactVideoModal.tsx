import { useEffect } from "react";
import { X } from "lucide-react";
import { assetUrl } from "@/lib/api";
import type { ImpactVideoPayload } from "@/types/content";

interface ImpactVideoModalProps {
  video: ImpactVideoPayload | null;
  onClose: () => void;
}

const videoThumbnail = (video: ImpactVideoPayload) =>
  assetUrl(video.effective_thumbnail_url || video.thumbnail?.url) || "/placeholder.svg";

const ImpactVideoModal = ({ video, onClose }: ImpactVideoModalProps) => {
  useEffect(() => {
    if (!video) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, video]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-[#020b10]/[0.92] p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#071a23] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f5ad57]">
              Impact in Motion
            </p>
            <h3 className="truncate font-display text-lg font-semibold text-white">
              {video.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="aspect-video bg-black">
          {video.source_type === "youtube" && video.youtube_embed_url ? (
            <iframe
              src={`${video.youtube_embed_url}${
                video.youtube_embed_url.includes("?") ? "&" : "?"
              }autoplay=1&rel=0`}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <video
              src={assetUrl(video.video_file?.url)}
              poster={videoThumbnail(video)}
              className="h-full w-full"
              controls
              autoPlay
              playsInline
            >
              Your browser does not support HTML video.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpactVideoModal;
