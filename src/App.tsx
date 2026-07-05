import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import ErrorBoundary from "./components/ErrorBoundary";

import UpcomingEventPopup from "./components/UpcomingEventPopup";
import Index from "./pages/Index";
import DynamicPage from "./pages/DynamicPage";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import NewsStories from "./pages/NewsStories";
import RecentProjects from "./pages/RecentProjects";
import Awards from "./pages/Awards";
import Podcast from "./pages/Podcast";
import PodcastEpisode from "./pages/PodcastEpisode";
import Contact from "./pages/Contact";
import DonateNow from "./pages/DonateNow";
import UpcomingEvents from "./pages/UpcomingEvents";
import EMagazineArticles from "./pages/EMagazineArticles";
import MagazineViewer from "./pages/MagazineViewer";
import BoardOfTrustees from "./pages/BoardOfTrustees";
import TeamMembers from "./pages/TeamMembers";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import AdminPanel from "./pages/AdminPanel";

const RouteFallback = () => (
  <div className="min-h-[60vh] bg-background" aria-label="Loading page" />
);

const POPUP_MOUNT_DELAY_MS = 60000;

const AppRoutes = () => {
  const location = useLocation();
  const isMagazineViewer = /^\/e-magazine-articles\/[^/]+$/.test(location.pathname);
  const isAdminPanel = location.pathname === "/admin-panel";
  const shouldShowFloatingWhatsApp = !isMagazineViewer && !isAdminPanel;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

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
            <Route path="/recent-projects" element={<DynamicPage slug="recent-projects" fallback={<RecentProjects />} />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/podcast" element={<DynamicPage slug="podcast" fallback={<Podcast />} />} />
            <Route path="/podcast/:episodeSlug" element={<PodcastEpisode />} />
            <Route path="/contact" element={<DynamicPage slug="contact" fallback={<Contact />} />} />
            <Route path="/donate-now" element={<DonateNow />} />
            <Route path="/upcoming-events" element={<DynamicPage slug="upcoming-events" fallback={<UpcomingEvents />} />} />
            <Route path="/privacy-policy" element={<DynamicPage slug="privacy-policy" fallback={<PrivacyPolicy />} />} />
            <Route path="/terms-and-conditions" element={<DynamicPage slug="terms-and-conditions" fallback={<TermsAndConditions />} />} />
            <Route path="/refund-policy" element={<DynamicPage slug="refund-policy" fallback={<RefundPolicy />} />} />
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
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
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
