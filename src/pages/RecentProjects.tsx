import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import RecentProjectsIntro from "@/components/recent-projects/RecentProjectsIntro";
import RecentProjectsShowcase from "@/components/recent-projects/RecentProjectsShowcase";
import {
  mapRecentProjectsFromApi,
  type RecentProjectsApiItem,
} from "@/data/recentProjects";
import { getJson, reportApiError } from "@/lib/api";

const introRowCount = 5;
const introColCount = 7;

const RecentProjects = () => {
  const [apiProjects, setApiProjects] = useState<RecentProjectsApiItem[] | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    getJson<RecentProjectsApiItem[]>("projects/", { cache: false })
      .then((response) => {
        setApiProjects(response);
      })
      .catch((error) => {
        reportApiError("Unable to fetch recent projects", error);
        setApiProjects([]);
      })
      .finally(() => {
        setIsLoadingProjects(false);
      });
  }, []);

  const showcaseProjects = useMemo(
    () => mapRecentProjectsFromApi(apiProjects),
    [apiProjects],
  );

  const introSectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const introTitleRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<HTMLDivElement[]>([]);
  const introImagePool = showcaseProjects.map((project) => project.image);

  const introRows = useMemo(
    () =>
      Array.from({ length: introRowCount }, (_, rowIndex) =>
        Array.from(
          { length: introColCount },
          (_, colIndex) =>
            introImagePool[
              (rowIndex * introColCount + colIndex) % introImagePool.length
            ],
        ),
      ),
    [introImagePool],
  );

  useLayoutEffect(() => {
    if (introRows.some((row) => row.some((image) => !image))) {
      return;
    }

    const rows = rowRefs.current.filter(Boolean);
    if (!rows.length) {
      return;
    }

    const winsize = { width: window.innerWidth, height: window.innerHeight };
    const mousepos = { x: winsize.width / 2, y: winsize.height / 2 };
    const minAmt = 0.05;
    const maxAmt = 0.1;
    const baseAmt = 0.1;
    const middleRowIndex = Math.floor(rows.length / 2);
    const renderedStyles = rows.map((_, index) => {
      const distanceFromMiddle = Math.abs(index - middleRowIndex);
      const amt = Math.max(baseAmt - distanceFromMiddle * 0.03, minAmt);
      const scaleAmt = Math.min(baseAmt + distanceFromMiddle * 0.03, maxAmt);

      return {
        amt,
        scaleAmt,
        translateX: { previous: 0, current: 0 },
        contrast: { previous: 100, current: 100 },
        brightness: { previous: 100, current: 100 },
      };
    });

    const lerp = (start: number, end: number, amount: number) =>
      start + (end - start) * amount;

    const updateMousePosition = (clientX: number, clientY: number) => {
      mousepos.x = clientX;
      mousepos.y = clientY;
    };

    const render = () => {
      const mappedTranslateX =
        ((mousepos.x / winsize.width) * 2 - 1) * 40 * winsize.width / 100;
      const normalized = Math.abs((mousepos.x / winsize.width) * 2 - 1);
      const contrastTarget = 100 - normalized * normalized * (100 - 330);
      const brightnessTarget = 100 - normalized * normalized * (100 - 15);

      rows.forEach((row, index) => {
        const style = renderedStyles[index];
        style.translateX.current = mappedTranslateX;
        style.contrast.current = contrastTarget;
        style.brightness.current = brightnessTarget;

        style.translateX.previous = lerp(style.translateX.previous, style.translateX.current, style.amt);
        style.contrast.previous = lerp(style.contrast.previous, style.contrast.current, style.scaleAmt);
        style.brightness.previous = lerp(style.brightness.previous, style.brightness.current, style.amt);

        gsap.set(row, {
          x: style.translateX.previous,
          filter: `contrast(${style.contrast.previous}%) brightness(${style.brightness.previous}%)`,
        });
      });

      rafId = window.requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      updateMousePosition(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        updateMousePosition(touch.clientX, touch.clientY);
      }
    };

    const handleResize = () => {
      winsize.width = window.innerWidth;
      winsize.height = window.innerHeight;
    };

    let rafId = 0;

    rafId = window.requestAnimationFrame(render);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [introRows]);

  if (isLoadingProjects) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <p className="rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground">
          Loading recent projects...
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background recent-projects-page">
      {showcaseProjects.length > 0 ? (
        <RecentProjectsIntro
          introRows={introRows}
          introSectionRef={introSectionRef}
          introTitleRef={introTitleRef}
          gridRef={gridRef}
          rowRefs={rowRefs}
        />
      ) : null}
      <RecentProjectsShowcase projects={showcaseProjects} />
    </div>
  );
};

export default RecentProjects;
