import DOMPurify from "dompurify";

const sharedConfig = {
  FORBID_TAGS: ["script", "style", "object", "embed", "form", "input"],
  FORBID_ATTR: ["srcdoc"],
} as const;

export const sanitizeCmsHtml = (html: string) =>
  DOMPurify.sanitize(html, sharedConfig);

export const sanitizeEmbedHtml = (html: string) =>
  DOMPurify.sanitize(html, {
    ...sharedConfig,
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "referrerpolicy",
    ],
  });

export const safeCmsLink = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    return ["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol)
      ? trimmed
      : "";
  } catch {
    return "";
  }
};
