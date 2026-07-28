import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import FeaturedVideoTeaser from "@/components/FeaturedVideoTeaser";
import type { ImpactVideoPayload } from "@/types/content";

const createVideo = (
  id: number,
  title: string,
  sortOrder: number,
): ImpactVideoPayload => ({
  id,
  title,
  slug: `video-${id}`,
  short_description: `${title} description`,
  thumbnail: null,
  youtube_url: `https://www.youtube.com/watch?v=video${id}`,
  video_file: null,
  source_type: "youtube",
  youtube_video_id: `video${id}`,
  youtube_thumbnail_url: `https://example.com/video-${id}.jpg`,
  youtube_embed_url: `https://www.youtube-nocookie.com/embed/video${id}`,
  effective_thumbnail_url: `https://example.com/video-${id}.jpg`,
  category: "Community",
  published_on: "2026-07-28",
  is_featured: true,
  sort_order: sortOrder,
});

describe("FeaturedVideoTeaser", () => {
  it("renders a section title and supports multiple featured video selections", async () => {
    render(
      <MemoryRouter>
        <FeaturedVideoTeaser
          videos={[
            createVideo(1, "First field story", 1),
            createVideo(2, "Second field story", 2),
          ]}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Featured Videos", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Featured video$/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "First field story", level: 3 }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Show Second field story" }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Second field story", level: 3 }),
      ).toBeInTheDocument(),
    );
  });
});
