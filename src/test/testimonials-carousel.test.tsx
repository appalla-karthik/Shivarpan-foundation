import { render, screen } from "@testing-library/react";
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
            media: null,
            isVideoReview: false,
          },
        ]}
      />,
    );

    expect(screen.getByText(/A genuine community review\./)).toBeInTheDocument();
    expect(screen.getByText("Review Person")).toBeInTheDocument();
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
