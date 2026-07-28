import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import ErrorBoundary from "./components/ErrorBoundary";
import { postJson } from "./lib/api";

const UpcomingEventPopup = lazy(() => import("./components/UpcomingEventPopup"));
const Index = lazy(() => import("./pages/Index"));
const DynamicPage = lazy(() => import("./pages/DynamicPage"));
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/Gallery"));
const NewsStories = lazy(() => import("./pages/NewsStories"));
const StoryDetail = lazy(() => import("./pages/StoryDetail"));
const RecentProjects = lazy(() => import("./pages/RecentProjects"));
const Awards = lazy(() => import("./pages/Awards"));
const AwardNomination = lazy(() => import("./pages/AwardNomination"));
const Podcast = lazy(() => import("./pages/Podcast"));
const PodcastEpisode = lazy(() => import("./pages/PodcastEpisode"));
const Contact = lazy(() => import("./pages/Contact"));
const DonateNow = lazy(() => import("./pages/DonateNow"));
const UpcomingEvents = lazy(() => import("./pages/UpcomingEvents"));
const EMagazineArticles = lazy(() => import("./pages/EMagazineArticles"));
const MagazineViewer = lazy(() => import("./pages/MagazineViewer"));
const BoardOfTrustees = lazy(() => import("./pages/BoardOfTrustees"));
const TeamMembers = lazy(() => import("./pages/TeamMembers"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

const RouteFallback = () => (
  <div className="min-h-[60vh] bg-background" aria-label="Loading page" />
);

const POPUP_MOUNT_DELAY_MS = 60000;
const ROUTE_TITLES: Record<string, string> = {
  "/": "Shivarpan Charitable Foundation",
  "/about": "About Us | Shivarpan Foundation",
  "/gallery": "Impact Gallery | Shivarpan Foundation",
  "/news-stories": "Stories | Shivarpan Foundation",
  "/recent-projects": "Recent Projects | Shivarpan Foundation",
  "/awards": "Awards | Shivarpan Foundation",
  "/podcast": "Podcast | Shivarpan Foundation",
  "/contact": "Contact Us | Shivarpan Foundation",
  "/donate-now": "Donate | Shivarpan Foundation",
  "/upcoming-events": "Upcoming Events | Shivarpan Foundation",
  "/e-magazine-articles": "Reports & Publications | Shivarpan Foundation",
  "/board-of-trustees": "Board of Trustees | Shivarpan Foundation",
  "/team-members": "Team Members | Shivarpan Foundation",
  "/privacy-policy": "Privacy Policy | Shivarpan Foundation",
  "/terms-and-conditions": "Terms and Conditions | Shivarpan Foundation",
};

const migrateLegacyHashRoute = () => {
  if (typeof window === "undefined" || !window.location.hash.startsWith("#/")) {
    return;
  }

  const legacyPath = window.location.hash.slice(1);
  window.history.replaceState(null, "", legacyPath);
};

migrateLegacyHashRoute();

const AppRoutes = () => {
  const location = useLocation();
  const isMagazineViewer = /^\/e-magazine-articles\/[^/]+$/.test(location.pathname);
  const isAdminPanel = location.pathname === "/admin-panel";
  const shouldShowFloatingWhatsApp = !isMagazineViewer && !isAdminPanel;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    document.title =
      ROUTE_TITLES[location.pathname] || "Shivarpan Charitable Foundation";
    const canonicalUrl = `${window.location.origin}${location.pathname}`;
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", canonicalUrl);
    document
      .querySelector<HTMLMetaElement>('meta[property="og:url"]')
      ?.setAttribute("content", canonicalUrl);
  }, [location.pathname]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void postJson("analytics/page-view/", {
        path: location.pathname,
        full_path: `${location.pathname}${location.search}`,
      }).catch(() => {
        // Analytics must never interrupt page navigation.
      });
    }, 4000);

    return () => window.clearTimeout(timerId);
  }, [location.pathname, location.search]);

  return (
    <>
      {!isMagazineViewer && <Navbar />}
      <main className={isMagazineViewer ? "pt-0" : "pt-20"}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<DynamicPage slug="about" fallback={<About />} />} />
            <Route path="/gallery" element={<DynamicPage slug="gallery" fallback={<Gallery />} />} />
            <Route path="/news-stories" element={<DynamicPage slug="news-stories" fallback={<NewsStories />} />} />
            <Route path="/news-stories/:storySlug" element={<StoryDetail />} />
            <Route path="/recent-projects" element={<DynamicPage slug="recent-projects" fallback={<RecentProjects />} />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/awards/nominate/:awardId" element={<AwardNomination />} />
            <Route path="/podcast" element={<DynamicPage slug="podcast" fallback={<Podcast />} />} />
            <Route path="/podcast/:episodeSlug" element={<PodcastEpisode />} />
            <Route path="/contact" element={<DynamicPage slug="contact" fallback={<Contact />} />} />
            <Route path="/donate-now" element={<DonateNow />} />
            <Route path="/upcoming-events" element={<DynamicPage slug="upcoming-events" fallback={<UpcomingEvents />} />} />
            <Route path="/privacy-policy" element={<DynamicPage slug="privacy-policy" fallback={<PrivacyPolicy />} />} />
            <Route path="/terms-and-conditions" element={<DynamicPage slug="terms-and-conditions" fallback={<TermsAndConditions />} />} />
            <Route path="/board-of-trustees" element={<BoardOfTrustees />} />
            <Route path="/team-members" element={<TeamMembers />} />
            <Route path="/e-magazine-articles" element={<DynamicPage slug="e-magazine-articles" fallback={<EMagazineArticles />} />} />
            <Route path="/e-magazine-articles/:magazineId" element={<MagazineViewer />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/:slug" element={<DynamicPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      {shouldShowFloatingWhatsApp && <FloatingWhatsAppButton />}
      {!isMagazineViewer && <Footer />}
    </>
  );
};

const App = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowPopup(true), POPUP_MOUNT_DELAY_MS);
    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          {showPopup ? (
            <Suspense fallback={null}>
              <UpcomingEventPopup />
            </Suspense>
          ) : null}
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default App;
