import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "@/components/StaticMotion";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import shivarpanLogo from "@/assets/shivarpan-logo-tiny.jpg";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/news-stories", label: "Stories" },
  { to: "/recent-projects", label: "Recent Projects" },
  { to: "/awards", label: "Awards" },
  { to: "/e-magazine-articles", label: "Magazines" },
  { to: "/podcast", label: "Podcast" },
  { to: "/contact", label: "Contact Us" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isNavLinkActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="group shrink-0" aria-label="Shivarpan Foundation home">
            <div className="rounded-xl bg-card px-2 py-1 shadow-sm ring-1 ring-border/70 transition-all duration-300 group-hover:shadow-md group-hover:ring-primary/40">
              <img
                src={shivarpanLogo}
                alt="Shivarpan Foundation logo"
                width={240}
                height={59}
                className="h-10 w-auto object-contain sm:h-11"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden min-w-0 flex-1 items-center justify-end gap-2.5 xl:flex">
            <div className="flex min-w-0 items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative flex-none whitespace-nowrap rounded-[10px] px-2.5 py-2.5 text-sm font-medium leading-none transition-[color,background-color,box-shadow] duration-200 ${
                    isNavLinkActive(link.to)
                      ? "bg-[#eef5f7] text-[#075f82] shadow-[inset_0_0_0_1px_rgba(7,95,130,0.08)]"
                      : "text-muted-foreground hover:bg-slate-50 hover:text-[#163c50]"
                  }`}
                >
                  {link.label}
                  {isNavLinkActive(link.to) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute -bottom-px left-2 right-2 h-[3px] rounded-t-full bg-[#08709a]"
                    />
                  )}
                </Link>
              ))}
            </div>
            <Link to="/upcoming-events" className="shrink-0">
              <Button
                variant="outline"
                className="h-10 whitespace-nowrap border-primary px-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Upcoming Events
              </Button>
            </Link>
            <Link to="/donate-now" className="shrink-0">
              <Button className="h-10 whitespace-nowrap bg-accent px-3 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90">
                <Heart className="mr-2 h-4 w-4" />
                Donate Now
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 transition-colors hover:bg-muted xl:hidden"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isNavLinkActive(link.to)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link to="/upcoming-events" onClick={() => setIsOpen(false)} className="block pt-3">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Upcoming Events
                </Button>
              </Link>
              <Link to="/donate-now" onClick={() => setIsOpen(false)} className="block pt-3">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Heart className="w-4 h-4 mr-2" />
                  Donate Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
