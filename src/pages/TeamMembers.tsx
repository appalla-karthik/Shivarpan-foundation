import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import aboutHero from "@/assets/about-hero-optimized.jpg";
import { assetUrl, getJson, reportApiError } from "@/lib/api";

type MediaAssetPayload = {
  id: number;
  title: string;
  alt_text: string;
  media_type: string;
  url: string;
};

type TeamMemberPayload = {
  id: number;
  state: string;
  state_label: string;
  state_summary: string;
  state_sort_order: number;
  name: string;
  position: string;
  photo: MediaAssetPayload | null;
  note: string;
  sort_order: number;
  is_active: boolean;
};

type TeamMembersResponse = TeamMemberPayload[] | { results?: TeamMemberPayload[] };

const getStateSectionId = (state: string) => `state-${state.toLowerCase().replace(/\s+/g, "-")}`;

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TM";

const normalizeTeamMembers = (payload: TeamMembersResponse): TeamMemberPayload[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.results) ? payload.results : [];
};

const TeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMemberPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getJson<TeamMembersResponse>("team-members/", { cache: false })
      .then((data) => {
        if (isMounted) {
          setTeamMembers(normalizeTeamMembers(data));
        }
      })
      .catch((error) => reportApiError("Unable to load team members", error))
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stateTeams = useMemo(() => {
    const grouped = new Map<
      string,
      {
        key: string;
        label: string;
        summary: string;
        sortOrder: number;
        members: TeamMemberPayload[];
      }
    >();

    teamMembers
      .filter((member) => member.is_active !== false)
      .forEach((member) => {
        const stateKey = member.state || member.state_label;
        const existing = grouped.get(stateKey);
        if (existing) {
          existing.members.push(member);
          return;
        }

        grouped.set(stateKey, {
          key: stateKey,
          label: member.state_label || stateKey.replace(/_/g, " "),
          summary:
            member.state_summary ||
            "State-wise team coordination and local outreach support.",
          sortOrder: Number(member.state_sort_order) || 0,
          members: [member],
        });
      });

    return Array.from(grouped.values()).sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.label.localeCompare(right.label),
    );
  }, [teamMembers]);

  const scrollToState = (state: string) => {
    document.getElementById(getStateSectionId(state))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="relative overflow-hidden">
      <PageHero
        title="Team Members"
        subtitle="State-wise coordination teams supporting Shivarpan Foundation programs, outreach, and community work."
        image={aboutHero}
      />

      <section className="relative overflow-hidden py-14 sm:py-16 md:py-20 section-gradient">
        <motion.div
          aria-hidden
          animate={{ x: [0, 24, 0], y: [0, -12, 0], opacity: [0.16, 0.3, 0.16] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[-4rem] top-28 h-52 w-52 rounded-full bg-primary/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -bottom-20 right-[-5rem] h-80 w-80 rounded-full border border-accent/20"
        />

        <div className="container relative z-10 mx-auto px-4">
          <AnimatedSection className="mx-auto mb-10 max-w-4xl text-center md:mb-14">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-accent">
              State Wise Team
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Our Team Across States
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Regional teams are organized by state so visitors can explore local leadership clearly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {stateTeams.map((team) => (
                <button
                  key={team.key}
                  type="button"
                  onClick={() => scrollToState(team.key)}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
                >
                  {team.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <div className="space-y-10">
            {stateTeams.map((team, stateIndex) => (
              <AnimatedSection
                key={team.key}
                id={getStateSectionId(team.key)}
                delay={stateIndex * 0.08}
                className="rounded-[2rem] border border-border/80 bg-card/70 p-5 shadow-[0_26px_80px_-58px_hsl(var(--foreground))] backdrop-blur-sm sm:p-7"
              >
                <div className="mb-6 flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
                      State Team
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                      {team.label}
                    </h3>
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-right">
                    {team.summary}
                  </p>
                </div>

                {team.members.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {team.members.map((member, index) => {
                      const photoUrl = assetUrl(member.photo?.url);

                      return (
                        <motion.div
                          key={member.id}
                          whileHover={{ y: -10, rotateX: 4, rotateY: index % 2 === 0 ? -4 : 4 }}
                          transition={{ type: "spring", stiffness: 190, damping: 22 }}
                          className="group relative overflow-hidden rounded-[1.9rem] border border-border/85 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--card)/0.94)_100%)] p-6 text-center shadow-[0_24px_70px_-48px_hsl(var(--foreground))] [transform-style:preserve-3d] sm:p-7"
                        >
                          <motion.div
                            aria-hidden
                            animate={{ x: ["-115%", "120%"] }}
                            transition={{
                              duration: 3.2,
                              repeat: Infinity,
                              repeatDelay: 1.7,
                              delay: index * 0.2,
                              ease: "linear",
                            }}
                            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-accent/18 to-transparent"
                          />
                          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />

                          <div className="relative mx-auto mb-4 h-24 w-24">
                            <motion.div
                              aria-hidden
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,hsl(var(--primary)/0.7),hsl(var(--accent)/0.7),hsl(var(--primary)/0.7))] p-[2px]"
                            >
                              <div className="h-full w-full rounded-full bg-card" />
                            </motion.div>
                            <div className="absolute inset-[6px] overflow-hidden rounded-full bg-primary/10">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={member.photo?.alt_text || member.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <span className="font-display text-2xl font-bold text-primary">
                                    {getInitials(member.name)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <h4 className="font-display text-xl font-semibold text-foreground">{member.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{member.position}</p>
                          <motion.span
                            whileHover={{ y: -1 }}
                            className="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary"
                          >
                            {team.label}
                          </motion.span>
                          {member.note ? (
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">{member.note}</p>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-border bg-background/55 px-5 py-8 text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {isLoading ? "Loading team members..." : "No team members added for this state yet."}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Team details are coming soon for this region.
                    </p>
                  </div>
                )}
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamMembers;
