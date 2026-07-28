import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import shivarpanLogo from "@/assets/shivarpan-logo-tiny.jpg";
import registrationImage from "@/assets/registration-1280.webp";
import registrationImageSmall from "@/assets/registration-768.webp";
import footerImage from "@/assets/footer-image-optimized-1600.webp";
import footerImageSmall from "@/assets/footer-image-optimized-960.webp";
import qrCodeImage from "../../foundation/static/img/qr_code.webp";
import { donationCategories } from "@/data/donationCategories";
import { aboutContent } from "@/data/siteContent";

const socialLinks = [
  { Icon: Facebook, link: "https://www.facebook.com/share/17EXvAn2U2/", label: "Facebook" },
  {
    Icon: Instagram,
    link: "https://www.instagram.com/shivarpan_foundation?igsh=bXc0NDY3dXl0bWM1",
    label: "Instagram",
  },
  {
    Icon: Linkedin,
    link: "https://www.linkedin.com/company/shivarpan-foundation/",
    label: "LinkedIn",
  },
  { Icon: Youtube, link: "https://youtu.be/HeUBBLW01Ms?si=wcvxeT97VEEgc6RI", label: "YouTube" },
];

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/gallery", label: "Gallery" },
  { to: "/news-stories", label: "Stories" },
  { to: "/contact", label: "Contact Us" },
];

const mediaLinks = [
  { to: "/awards", label: "Awards" },
  { to: "/podcast", label: "Podcast" },
  { to: "/e-magazine-articles", label: "E-Magazine" },
  { to: "/gallery", label: "Photo Gallery" },
  { to: "/news-stories", label: "Stories" },
];

const governanceLinks = [
  { to: "/board-of-trustees", label: "Board of Trustees" },
  { to: "/team-members", label: "Team Members" },
];

const Footer = () => {
  return (
    <>
    <section className="bg-white pb-6 pt-12 [content-visibility:auto] [contain-intrinsic-size:auto_760px] sm:pb-8 sm:pt-16">
      <div className="container mx-auto px-4 sm:px-6">
        <img
          src={registrationImage}
          srcSet={`${registrationImageSmall} 768w, ${registrationImage} 1280w`}
          sizes="(max-width: 768px) 100vw, 1280px"
          alt="Shivarpan Foundation registration and certification details"
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className="mx-auto w-full max-w-[86rem] scale-[1.08] object-contain"
        />
      </div>
    </section>

    <footer className="relative overflow-hidden bg-foreground text-primary-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[15rem] sm:h-[17.5rem] lg:h-[19.5rem]"
      >
        <img
          src={footerImage}
          srcSet={`${footerImageSmall} 960w, ${footerImage} 1600w`}
          sizes="100vw"
          alt=""
          width={1800}
          height={517}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-fill opacity-[0.78] brightness-[1.08] contrast-[1.08] saturate-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,28,0.38)_0%,rgba(8,20,28,0.08)_36%,rgba(8,20,28,0.34)_100%)]" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-0 opacity-90"
      >
        <div className="absolute -bottom-10 left-[-4%] h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-8 right-[6%] h-20 w-20 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,transparent_0%,hsl(var(--foreground))_100%)]" />
        <div className="absolute bottom-2 left-[12%] h-16 w-16 rounded-full border border-primary-foreground/10" />
        <div className="absolute bottom-4 right-[20%] h-10 w-24 rounded-full border border-accent/20" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12 sm:px-6 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(300px,1.35fr)] lg:gap-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)] backdrop-blur-[2px] sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <div className="mb-4 inline-flex rounded-xl bg-primary-foreground p-2 shadow-md">
              <img
                src={shivarpanLogo}
                alt="Shivarpan Foundation logo"
                width={240}
                height={59}
                loading="lazy"
                decoding="async"
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="max-w-xl text-sm leading-7 text-primary-foreground/75 lg:max-w-none lg:leading-relaxed lg:opacity-70">
              {aboutContent.footerSummary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map(({ Icon, link, label }) => (
                <a
                  key={label}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Shivarpan Foundation on ${label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
              <h4 className="mb-4 font-display text-lg font-semibold">
                Quick Links
              </h4>
              <ul className="space-y-3 lg:space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm leading-6 text-primary-foreground/70 transition-all duration-300 hover:text-accent hover:opacity-100 lg:opacity-70"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-5 sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
              <h4 className="mb-4 font-display text-lg font-semibold">
                Media & Resources
              </h4>
              <ul className="space-y-3 lg:space-y-2.5">
                {mediaLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm leading-6 text-primary-foreground/70 transition-all duration-300 hover:text-accent hover:opacity-100 lg:opacity-70"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-5 sm:col-span-2 sm:p-6 lg:col-span-1 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
              <h4 className="mb-4 font-display text-lg font-semibold">
                Governance
              </h4>
              <ul className="space-y-3 lg:space-y-2.5">
                {governanceLinks.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm leading-6 text-primary-foreground/70 transition-all duration-300 hover:text-accent hover:opacity-100 lg:opacity-70"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)] backdrop-blur-[2px] sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
            <h4 className="mb-4 font-display text-lg font-semibold">
              Get In Touch
            </h4>
            <ul className="space-y-3.5 sm:space-y-4">
              <li className="rounded-2xl bg-white/[0.03] p-3 text-sm text-primary-foreground/72 lg:rounded-none lg:bg-transparent lg:p-0 lg:opacity-70">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6 text-accent lg:h-auto lg:w-auto lg:rounded-none lg:bg-transparent lg:text-primary-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="max-w-[18rem] leading-7 sm:max-w-none sm:leading-6">
                    104-D, F.F. Titanium City Centre, Nr. Sachin Tower, 100 Feet
                    Ring Road, Anandnagar, Satellite, Ahmedabad - 380015
                  </span>
                </div>
              </li>
              <li className="rounded-2xl bg-white/[0.03] p-3 lg:rounded-none lg:bg-transparent lg:p-0">
                <a
                  href="tel:+919898038241"
                  className="flex items-center gap-3 text-sm text-primary-foreground/72 transition-colors duration-300 hover:text-accent lg:opacity-70"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6 lg:h-auto lg:w-auto lg:rounded-none lg:bg-transparent">
                    <Phone className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="break-words leading-6">+91 98980 38241</span>
                </a>
              </li>
              <li className="rounded-2xl bg-white/[0.03] p-3 lg:rounded-none lg:bg-transparent lg:p-0">
                <a
                  href="mailto:info@shivarpanfoundation.org"
                  className="flex items-start gap-3 text-sm text-primary-foreground/72 transition-colors duration-300 hover:text-accent lg:items-center lg:opacity-70"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6 lg:mt-0 lg:h-auto lg:w-auto lg:rounded-none lg:bg-transparent">
                    <Mail className="h-4 w-4 shrink-0" />
                  </span>
                  <span className="break-all leading-6 sm:break-words">
                    info@shivarpanfoundation.org
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-9 border-t border-primary-foreground/10 pt-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-8">
            <div className="shrink-0">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-accent">
                Our Work
              </p>
              <p className="mt-1 text-xs text-primary-foreground/55">
                Focused support where communities need it most.
              </p>
            </div>
            <ul
              className="flex min-w-0 flex-nowrap gap-2.5 overflow-x-auto pb-2 [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin] xl:flex-1 xl:justify-end xl:pb-0"
              aria-label="Shivarpan Foundation areas of work"
            >
              {donationCategories.map((category) => (
                <li
                  key={category}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/[0.045] px-3 py-2 text-[0.7rem] font-semibold leading-none text-primary-foreground/75"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                  />
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      <div className="relative z-10 border-t border-primary-foreground/10">
        <Link
          to="/donate-now"
          aria-label="Donate to Shivarpan Foundation"
          className="absolute right-12 top-[-2.75rem] hidden w-[9.25rem] rounded-[1.35rem] border border-white/70 bg-white p-3 text-center text-slate-900 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.65)] ring-1 ring-slate-900/5 transition-transform duration-300 hover:-translate-y-1 md:block lg:right-24"
        >
          <img
            src={qrCodeImage}
            alt="BHIM UPI scan and pay QR code for Shivarpan Foundation donation"
            width={164}
            height={205}
            loading="lazy"
            decoding="async"
            className="mx-auto h-auto w-full rounded-xl object-contain"
          />
          <p className="mt-2 text-[0.63rem] font-black uppercase tracking-[0.34em] text-slate-700">
            Donate Now
          </p>
        </Link>
        <div className="container mx-auto flex flex-col items-center justify-center gap-3 px-4 pb-5 pt-[8.75rem] text-center sm:px-6 sm:pt-[9.75rem] lg:pt-[11.75rem]">
          <p className="text-xs leading-5 opacity-50">
            (c) 2026 Shivarpan Charitable Foundation. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              to="/privacy-policy"
              className="text-xs opacity-50 transition-opacity hover:opacity-100"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-and-conditions"
              className="text-xs opacity-50 transition-opacity hover:opacity-100"
            >
              Terms &amp; Conditions
            </Link>
            <span className="text-xs opacity-50">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
