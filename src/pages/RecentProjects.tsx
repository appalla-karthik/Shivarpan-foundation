import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import RecentProjectsIntro from "@/components/recent-projects/RecentProjectsIntro";
import RecentProjectsShowcase from "@/components/recent-projects/RecentProjectsShowcase";
import {
  applyCampaignFundingToProjects,
  type CampaignFundingSummary,
  mapRecentProjectsFromApi,
  recentIntroGridImages,
  type RecentProjectsApiItem,
} from "@/data/recentProjects";
import { getJson, reportApiError } from "@/lib/api";

const introRowCount = 5;
const introColCount = 7;

const RecentProjects = () => {
  const [apiProjects, setApiProjects] = useState<RecentProjectsApiItem[] | null>(null);
  const [campaignFunding, setCampaignFunding] = useState<CampaignFundingSummary | null>(null);

  useEffect(() => {
    getJson<RecentProjectsApiItem[]>("projects/")
      .then((response) => {
        setApiProjects(response);
      })
      .catch((error) => {
        reportApiError("Unable to fetch recent projects", error);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchFunding = () => {
      getJson<CampaignFundingSummary>("donations/funding-summary/", { cache: false })
        .then((response) => {
          if (isMounted) {
            setCampaignFunding(response);
          }
        })
        .catch((error) => {
          reportApiError("Unable to fetch campaign funding", error);
        });
    };

    fetchFunding();
    const intervalId = window.setInterval(fetchFunding, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const showcaseProjects = useMemo(
    () => applyCampaignFundingToProjects(mapRecentProjectsFromApi(apiProjects), campaignFunding),
    [apiProjects, campaignFunding],
  );

  const introSectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const introTitleRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<HTMLDivElement[]>([]);
  const introImagePool = showcaseProjects.length > 0
    ? showcaseProjects.map((project) => project.image)
    : recentIntroGridImages;

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

  return (
    <div className="relative overflow-hidden bg-background recent-projects-page">
      <RecentProjectsIntro
        introRows={introRows}
        introSectionRef={introSectionRef}
        introTitleRef={introTitleRef}
        gridRef={gridRef}
        rowRefs={rowRefs}
      />
      <RecentProjectsShowcase projects={showcaseProjects} />
    </div>
  );
};

export default RecentProjects;
