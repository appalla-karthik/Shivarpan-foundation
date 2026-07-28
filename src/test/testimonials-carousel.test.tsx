import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => cleanup());

describe("TestimonialsCarousel", () => {
  it("renders safely with testimonial items", () => {
    render(
      <TestimonialsCarousel
        items={[
          {
            quote: "A genuine community review.",
            name: "Review Person",
            role: "Volunteer",
            tag: "Community",
            monogram: "RP",
            glow: "from-primary/20 to-transparent",
            rating: 4,
            media: null,
            isVideoReview: false,
          },
        ]}
      />,
    );

    expect(screen.getByText(/A genuine community review\./)).toBeInTheDocument();
    expect(screen.getByText("Review Person")).toBeInTheDocument();
    expect(screen.getByLabelText("4 out of 5 stars")).toBeInTheDocument();
  });

  it("switches a video testimonial from its review overlay to full-card playback", async () => {
    render(
      <TestimonialsCarousel
        items={[
          {
            quote: "The field team made a visible difference.",
            name: "Video Reviewer",
            role: "Community Partner",
            tag: "Partner",
            monogram: "VR",
            glow: "from-primary/20 to-transparent",
            rating: 3,
            photoUrl: "/video-reviewer.jpg",
            media: {
              url: "/testimonial.mp4",
              media_type: "video",
            },
            isVideoReview: true,
          },
        ]}
      />,
    );

    expect(screen.getByLabelText("3 out of 5 stars")).toBeInTheDocument();
    expect(
      screen.getByText("“The field team made a visible difference.”"),
    ).not.toHaveClass("line-clamp-4");
    expect(
      screen.getByRole("img", { name: "Video Reviewer" }),
    ).toHaveAttribute("src", "/video-reviewer.jpg");
    const playButton = screen.getByRole("button", {
      name: "Play Video Reviewer testimonial video",
    });
    const video = screen.getByLabelText("Video Reviewer testimonial video");
    const videoCard = video.closest("article");

    expect(video).not.toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("poster");
    expect(video).toHaveAttribute("src", "/testimonial.mp4#t=0.001");
    expect(videoCard).toHaveAttribute("data-playing", "false");
    fireEvent.click(playButton);
    fireEvent.play(video);

    await waitFor(() => {
      expect(video).toHaveAttribute("controls");
      expect(videoCard).toHaveAttribute("data-playing", "true");
    });
    fireEvent.pause(video);
    expect(videoCard).toHaveAttribute("data-playing", "false");
    expect(video).toHaveAttribute("controls");
    expect(
      screen.getByRole("button", {
        name: "Play Video Reviewer testimonial video",
      }),
    ).toHaveTextContent("Continue review");
  });

  it("handles a missing runtime items value without crashing", () => {
    const { container } = render(
      <TestimonialsCarousel
        items={undefined as unknown as Parameters<typeof TestimonialsCarousel>[0]["items"]}
      />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
