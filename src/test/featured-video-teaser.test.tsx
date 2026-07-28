import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
  let emitPlayerState: ((state: number) => void) | null = null;

  beforeEach(() => {
    class MockYouTubePlayer {
      playVideo = vi.fn();
      destroy = vi.fn();

      constructor(
        _element: HTMLElement,
        options: {
          events: {
            onReady: (event: { data: number; target: MockYouTubePlayer }) => void;
            onStateChange: (event: {
              data: number;
              target: MockYouTubePlayer;
            }) => void;
          };
        },
      ) {
        emitPlayerState = (state: number) =>
          options.events.onStateChange({ data: state, target: this });
        options.events.onReady({ data: -1, target: this });
      }
    }

    Object.defineProperty(window, "YT", {
      configurable: true,
      value: { Player: MockYouTubePlayer },
    });
  });

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

    const centeredPlayButton = screen.getByRole("button", {
      name: "Play Second field story",
    });
    expect(centeredPlayButton).toHaveClass("inset-x-0", "mx-auto");
    fireEvent.click(centeredPlayButton);

    await waitFor(() =>
      expect(
        screen.getByLabelText("Second field story YouTube video"),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const inlinePlayer = screen
      .getByLabelText("Second field story YouTube video")
      .closest("[data-playing]");
    expect(inlinePlayer).toHaveAttribute("data-playing", "true");

    act(() => emitPlayerState?.(2));

    await waitFor(() => {
      expect(inlinePlayer).toHaveAttribute("data-playing", "false");
      expect(
        screen.getByRole("button", { name: "Resume Second field story" }),
      ).toBeInTheDocument();
    });
  });
});
