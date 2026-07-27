import { describe, expect, it } from "vitest";
import {
  safeCmsLink,
  sanitizeCmsHtml,
  sanitizeEmbedHtml,
} from "@/lib/sanitizeHtml";

describe("CMS content hardening", () => {
  it("removes executable scripts and event handlers", () => {
    const clean = sanitizeCmsHtml(
      '<p onclick="alert(1)">Safe text</p><script>alert(1)</script>',
    );

    expect(clean).toContain("Safe text");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("<script");
  });

  it("allows an iframe embed without allowing srcdoc", () => {
    const clean = sanitizeEmbedHtml(
      '<iframe src="https://www.youtube.com/embed/example" srcdoc="<script>alert(1)</script>"></iframe>',
    );

    expect(clean).toContain("<iframe");
    expect(clean).not.toContain("srcdoc");
    expect(clean).not.toContain("<script");
  });

  it("blocks executable CMS links", () => {
    expect(safeCmsLink("javascript:alert(1)")).toBe("");
    expect(safeCmsLink("https://shivarpanfoundation.org")).toBe(
      "https://shivarpanfoundation.org",
    );
  });
});
