import {
  createElement,
  forwardRef,
  type ElementType,
  type ReactNode,
} from "react";

const motionOnlyProps = new Set([
  "animate",
  "custom",
  "drag",
  "dragConstraints",
  "dragMomentum",
  "exit",
  "initial",
  "layout",
  "layoutId",
  "transition",
  "variants",
  "viewport",
  "whileFocus",
  "whileHover",
  "whileInView",
  "whileTap",
]);

const staticElement = (tag: ElementType) =>
  forwardRef<HTMLElement, Record<string, unknown> & { children?: ReactNode }>(
    ({ children, ...props }, ref) => {
      const domProps = Object.fromEntries(
        Object.entries(props).filter(([key]) => !motionOnlyProps.has(key)),
      );
      return createElement(tag, { ...domProps, ref }, children);
    },
  );

export const motion = {
  article: staticElement("article"),
  div: staticElement("div"),
  h1: staticElement("h1"),
  img: staticElement("img"),
  p: staticElement("p"),
  span: staticElement("span"),
  video: staticElement("video"),
};

export const AnimatePresence = ({ children }: { children?: ReactNode }) => (
  <>{children}</>
);
