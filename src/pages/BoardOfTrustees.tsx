import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import aboutHero from "@/assets/about-hero-optimized.jpg";
import deepakSharmaPhoto from "@/assets/deepak sharma.webp";
import vaishnaviSaxenaPhoto from "@/assets/vaishnavi saxena.webp";

const trustees = [
  {
    name: "Deepak Kumar Sharma",
    role: "Founder and Managing Director",
    initials: "DS",
    photo: deepakSharmaPhoto,
    label: "Leadership",
  },
  {
    name: "Vaishnavi Saxena",
    role: "Trustee",
    initials: "VS",
    photo: vaishnaviSaxenaPhoto,
    label: "Trustee",
  },
];

const BoardOfTrustees = () => (
  <div className="relative overflow-hidden">
    <PageHero
      title="Board of Trustees"
      subtitle="Board of Trustees - Shivarpan Charitable Foundation"
      image={aboutHero}
    />

    <section className="relative overflow-hidden py-16 sm:py-20 md:py-24 section-gradient">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--accent)/0.15),transparent_35%),radial-gradient(circle_at_85%_85%,hsl(var(--primary)/0.18),transparent_40%)]" />
      <motion.div
        aria-hidden
        animate={{ x: [0, 18, 0], y: [0, -12, 0], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-20 left-6 h-44 w-44 rounded-full bg-accent/30 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute -bottom-24 right-[-6rem] h-96 w-96 rounded-full border border-accent/20"
      />
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-[2.6rem] border border-border/80 bg-card/95 p-8 shadow-[0_30px_80px_-55px_hsl(var(--foreground))]">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 -translate-y-10 translate-x-12 rounded-full bg-primary/15 blur-2xl" />
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
                Trustee Charter
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                Board of Trustees - Shivarpan Charitable Foundation
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                The Shivarpan Charitable Foundation is a public charitable trust committed to
                social welfare, education, and sustainable development. Our Board of Trustees
                consists of esteemed professionals, social entrepreneurs, and thought leaders
                who are dedicated to driving meaningful impact and positive change.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/80 bg-background/90 p-4">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Commitment to Service &amp; Change
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    At Shivarpan Charitable Foundation, we uphold the highest standards of transparency,
                    accountability, and ethical leadership. Our trustees play a vital role in ensuring
                    responsible governance, overseeing strategic initiatives, and fostering collaborations
                    that enhance our outreach and effectiveness.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/80 bg-background/90 p-4">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Our Leadership Approach
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    The Board of Trustees provides strategic direction and guidance, ensuring our
                    programs create lasting social change. With a focus on education, skill development,
                    and community empowerment, they bring their collective expertise to develop scalable
                    solutions that address critical social challenges.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm leading-relaxed text-primary sm:text-base">
                With a shared mission to uplift communities and improve lives, our trustees steer the
                foundation toward greater impact, ensuring every initiative is executed with integrity,
                innovation, and purpose.
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid gap-5">
              {[
                { label: "Governance", value: "Transparent oversight" },
                { label: "Strategy", value: "Long-term impact planning" },
                { label: "Collaboration", value: "Partnership-driven change" },
                { label: "Stewardship", value: "Ethical leadership and accountability" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-[0_18px_50px_-40px_hsl(var(--foreground))]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {trustees.map((member, index) => (
            <AnimatedSection key={member.name} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -10, rotateX: 4, rotateY: index % 2 === 0 ? -4 : 4 }}
                transition={{ type: "spring", stiffness: 190, damping: 22 }}
                className="group relative overflow-hidden rounded-[2.2rem] border border-border/85 bg-card/95 p-6 text-center shadow-[0_24px_60px_-45px_hsl(var(--foreground))] [transform-style:preserve-3d]"
              >
                <motion.div
                  aria-hidden
                  animate={{ x: ["-115%", "120%"] }}
                  transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.7, delay: index * 0.2, ease: "linear" }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent/18 to-transparent"
                />

                <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border border-primary/25 bg-primary/10 shadow-[0_16px_40px_-25px_hsl(var(--primary))]">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative mx-auto mb-4 h-16 w-16">
                  <motion.div
                    aria-hidden
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary)/0.7),hsl(var(--accent)/0.7),hsl(var(--primary)/0.7))] p-[2px]"
                  >
                    <div className="h-full w-full rounded-full bg-card" />
                  </motion.div>
                  <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-primary/10">
                    <span className="font-display text-2xl font-bold text-primary">
                      {member.initials}
                    </span>
                  </div>
                </div>

                <h4 className="font-display text-lg font-semibold">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                <motion.span
                  whileHover={{ y: -1 }}
                  className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                >
                  {member.label}
                </motion.span>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default BoardOfTrustees;
