import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CircleDollarSign,
  Handshake,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProjectFundingActions from "@/components/ProjectFundingActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatRecentProjectsInr,
  recentProjectsNumberFormat,
  type RecentProject,
} from "@/data/recentProjects";

interface RecentProjectsShowcaseProps {
  projects?: RecentProject[];
}

const getUtilizationPercent = (spent: number, budget: number) =>
  budget > 0
    ? Math.min(100, Math.max(0, Math.round((spent / budget) * 100)))
    : 0;

const RecentProjectsShowcase = ({
  projects: providedProjects,
}: RecentProjectsShowcaseProps) => {
  const projects = useMemo(() => providedProjects ?? [], [providedProjects]);

  const activeProjects = projects.filter((project) => project.status === "Active");
  const completedProjects = projects.filter(
    (project) => project.status === "Completed",
  );
  const featuredProject = activeProjects[0] ?? projects[0];
  const totalBeneficiaries = projects.reduce(
    (sum, project) => sum + project.beneficiaries,
    0,
  );
  const totalVolunteers = projects.reduce(
    (sum, project) => sum + project.volunteers,
    0,
  );
  const totalPartners = projects.reduce((sum, project) => sum + project.partners, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);
  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const utilization = getUtilizationPercent(totalSpent, totalBudget);

  const topStats = [
    {
      label: "Live Projects",
      value: `${activeProjects.length}`,
      detail: `${completedProjects.length} completed this cycle`,
      icon: Sparkles,
    },
    {
      label: "People Reached",
      value: `${recentProjectsNumberFormat.format(totalBeneficiaries)}+`,
      detail: "Across food, education, health, and environment tracks",
      icon: Users,
    },
    {
      label: "Volunteer Force",
      value: recentProjectsNumberFormat.format(totalVolunteers),
      detail: `${recentProjectsNumberFormat.format(totalPartners)} partner relationships on ground`,
      icon: Handshake,
    },
    {
      label: "Budget Deployed",
      value: formatRecentProjectsInr(totalSpent),
      detail: `${utilization}% of ${formatRecentProjectsInr(totalBudget)} allocated`,
      icon: CircleDollarSign,
    },
  ];

  const editorialLanes = [
    "Live field chapters with project-wise funding routes",
    "Crisp portfolio reporting for partners and donors",
    "Measured delivery across food, education, health, and environment",
  ];

  if (projects.length === 0) {
    return (
      <div className="relative border-t border-border/60 bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Recent Projects
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
              No recent projects are published yet.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              New project updates are coming soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-t border-border/60 bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted))_32%,hsl(var(--background))_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,hsl(var(--primary)/0.14),transparent_26%),radial-gradient(circle_at_88%_18%,hsl(var(--accent)/0.18),transparent_24%),linear-gradient(180deg,transparent_0%,hsl(var(--background)/0.45)_100%)]" />
      <motion.div
        aria-hidden
        animate={{ x: [0, 30, 0], y: [0, -24, 0], opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-primary/18 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -24, 0], y: [0, 24, 0], opacity: [0.14, 0.26, 0.14] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-20 top-[24rem] h-96 w-96 rounded-full bg-accent/18 blur-3xl"
      />

      <section className="relative py-14 md:py-20">
        <div className="container relative mx-auto px-4">
          <div className="grid gap-6 xl:grid-cols-12">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="xl:col-span-8"
            >
              <div className="relative overflow-hidden rounded-[2.4rem] border border-border/80 bg-[linear-gradient(145deg,hsl(var(--card)/0.98),hsl(var(--background)/0.92)_54%,hsl(var(--muted)/0.9)_100%)] p-6 shadow-[0_34px_100px_-60px_hsl(var(--foreground))] sm:p-7 lg:p-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.14),transparent_26%),radial-gradient(circle_at_84%_22%,hsl(var(--accent)/0.16),transparent_28%)]" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Portfolio Snapshot
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Donation-ready project board
                    </span>
                  </div>
                  <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.95fr)] lg:items-end">
                    <div>
                      <h2 className="max-w-2xl font-display text-[2.6rem] font-bold leading-[0.94] text-foreground sm:text-[3rem] lg:text-[3.35rem]">
                    Recent Projects built like a professional portfolio, not a plain list.
                      </h2>
                      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                        Visible, measurable, and instantly actionable. Active work can be funded
                        directly, while completed work routes support into the next trusted cycle.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2.5">
                        {editorialLanes.map((lane) => (
                          <div
                            key={lane}
                            className="rounded-full border border-border/75 bg-background/70 px-4 py-2 text-[13px] leading-relaxed text-foreground/85 shadow-[0_14px_38px_-36px_hsl(var(--foreground))]"
                          >
                            {lane}
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="gap-2 rounded-full px-7">
                          <Link to="/donate-now">
                            Donate To The Mission
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="gap-2 rounded-full px-7">
                          <Link to="/contact">
                            Become A Project Partner
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {topStats.map((stat, index) => {
                          const StatIcon = stat.icon;

                          return (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, x: 14 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true, margin: "-50px" }}
                              transition={{ duration: 0.4, delay: index * 0.05 }}
                              className="rounded-[1.1rem] border border-border/75 bg-card/90 p-3 shadow-[0_18px_40px_-38px_hsl(var(--foreground))]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    {stat.label}
                                  </p>
                                  <p className="mt-1.5 font-display text-lg font-bold leading-none text-foreground">
                                    {stat.value}
                                  </p>
                                </div>
                                <span className="rounded-xl bg-primary/12 p-2.5 text-primary">
                                  <StatIcon className="h-3.5 w-3.5" />
                                </span>
                              </div>
                              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                                {stat.detail}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {featuredProject ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="xl:col-span-4"
              >
                <div className="sticky top-24 overflow-hidden rounded-[2.2rem] border border-border/80 bg-card/95 shadow-[0_34px_90px_-58px_hsl(var(--foreground))]">
                  <div className="relative">
                    <img
                      src={featuredProject.image}
                      alt={featuredProject.title}
                      className="h-[18rem] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/88 via-foreground/22 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        {featuredProject.focus}
                      </Badge>
                      <Badge className="border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        Active
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-[1.4rem] border border-primary-foreground/20 bg-foreground/55 p-4 text-primary-foreground backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
                        Lead Chapter
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight">
                        {featuredProject.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.3rem] border border-border/75 bg-background/80 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Live Reach
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {recentProjectsNumberFormat.format(featuredProject.beneficiaries)}
                        </p>
                      </div>
                      <div className="rounded-[1.3rem] border border-border/75 bg-background/80 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Remaining Need
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {formatRecentProjectsInr(
                            Math.max(featuredProject.budget - featuredProject.spent, 0),
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {featuredProject.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {featuredProject.timeline}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {featuredProject.objective}
                    </p>

                    <div className="mt-5 rounded-[1.45rem] border border-primary/15 bg-primary/5 p-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <p className="font-semibold text-foreground">Funding Progress</p>
                        <p className="text-muted-foreground">
                          {getUtilizationPercent(
                            featuredProject.spent,
                            featuredProject.budget,
                          )}
                          %
                        </p>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          style={{
                            width: `${getUtilizationPercent(
                              featuredProject.spent,
                              featuredProject.budget,
                            )}%`,
                            transformOrigin: "left center",
                          }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent"
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{formatRecentProjectsInr(featuredProject.spent)} raised</span>
                        <span>{formatRecentProjectsInr(featuredProject.budget)} target</span>
                      </div>
                    </div>

                    <ProjectFundingActions
                      title={featuredProject.title}
                      slug={featuredProject.slug}
                      donateLabel="Donate Now"
                      className="mt-5"
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative py-4 md:py-6">
        <div className="container relative mx-auto px-4">
          <div className="rounded-[2.1rem] border border-border/80 bg-[linear-gradient(135deg,hsl(var(--foreground))_0%,hsl(var(--foreground)/0.94)_60%,hsl(var(--primary)/0.78)_100%)] p-5 text-primary-foreground shadow-[0_34px_90px_-60px_hsl(var(--foreground))] sm:p-6 lg:p-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                  Funding Architecture
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
                  Direct support for active work. Strategic support for what comes next.
                </h3>
              </div>
              <div className="rounded-[1.3rem] border border-primary-foreground/12 bg-primary-foreground/8 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                  Active
                </p>
                <p className="mt-1 text-lg font-semibold">{activeProjects.length} lanes live</p>
              </div>
              <div className="rounded-[1.3rem] border border-primary-foreground/12 bg-primary-foreground/8 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                  Utilization
                </p>
                <p className="mt-1 text-lg font-semibold">{utilization}% deployed</p>
              </div>
              <Button asChild variant="secondary" size="lg" className="rounded-full px-6">
                <Link to="/donate-now">
                  Support The Portfolio
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-12 md:py-16">
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto mb-10 max-w-3xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">
              Project Collection
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              A sharper, cleaner read of every recent chapter.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Each card balances field story, budget clarity, and a direct action path.
            </p>
          </motion.div>

          <div className="space-y-6">
            {projects.map((project, index) => {
              const ProjectIcon = project.icon;
              const utilization = getUtilizationPercent(project.spent, project.budget);
              const remaining = Math.max(project.budget - project.spent, 0);
              const isActive = project.status === "Active";
              const isMirrored = index % 2 === 1;

              return (
                <motion.article
                  key={project.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative overflow-hidden rounded-[2.15rem] border border-border/80 bg-card/95 shadow-[0_30px_78px_-56px_hsl(var(--foreground))]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.08),transparent_28%),radial-gradient(circle_at_100%_100%,hsl(var(--accent)/0.1),transparent_30%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="grid gap-0 lg:grid-cols-12">
                    <div
                      className={`relative min-h-[19rem] overflow-hidden lg:col-span-5 ${
                        isMirrored ? "lg:order-2" : ""
                      }`}
                    >
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/26 to-transparent" />
                      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-foreground/26 to-transparent" />
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {project.focus}
                        </Badge>
                        <Badge
                          className={
                            isActive
                              ? "border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : "border-emerald-500/35 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="absolute right-4 top-4 rounded-full border border-primary-foreground/15 bg-foreground/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75 backdrop-blur-sm">
                        Chapter {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 rounded-[1.25rem] border border-primary-foreground/20 bg-foreground/55 p-3 text-primary-foreground backdrop-blur-md">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="rounded-2xl bg-primary-foreground/12 p-2.5 text-primary-foreground">
                              <ProjectIcon className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/75">
                                Field Snapshot
                              </p>
                              <p className="mt-1 text-xs text-primary-foreground/92">
                                {project.location}
                              </p>
                              <p className="mt-1 text-[11px] text-primary-foreground/72">
                                {project.timeline}
                              </p>
                            </div>
                          </div>
                          <span className="text-[2.4rem] font-display font-bold leading-none text-primary-foreground/14">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`relative p-5 sm:p-6 lg:col-span-7 lg:p-7 ${
                        isMirrored ? "lg:order-1" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                            Chapter {String(index + 1).padStart(2, "0")}
                          </p>
                          <h3 className="mt-1 font-display text-[1.85rem] font-bold leading-[0.98] text-foreground sm:text-[2.05rem]">
                            {project.title}
                          </h3>
                        </div>
                        <span className="hidden rounded-full border border-border bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground md:inline-flex">
                          {isActive ? "Donation Open" : "Completed Chapter"}
                        </span>
                      </div>

                      <div className="mt-4 rounded-[1.3rem] border border-border/75 bg-[linear-gradient(145deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_100%)] p-3.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Objective
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/82">
                        {project.objective}
                        </p>
                      </div>

                      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[1.15rem] border border-border/75 bg-background/80 p-3 shadow-[0_16px_34px_-34px_hsl(var(--foreground))]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Beneficiaries
                          </p>
                          <p className="mt-1.5 text-lg font-semibold text-foreground">
                            {recentProjectsNumberFormat.format(project.beneficiaries)}
                          </p>
                        </div>
                        <div className="rounded-[1.15rem] border border-border/75 bg-background/80 p-3 shadow-[0_16px_34px_-34px_hsl(var(--foreground))]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Volunteers
                          </p>
                          <p className="mt-1.5 text-lg font-semibold text-foreground">
                            {recentProjectsNumberFormat.format(project.volunteers)}
                          </p>
                        </div>
                        <div className="rounded-[1.15rem] border border-border/75 bg-background/80 p-3 shadow-[0_16px_34px_-34px_hsl(var(--foreground))]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Partners
                          </p>
                          <p className="mt-1.5 text-lg font-semibold text-foreground">
                            {recentProjectsNumberFormat.format(project.partners)}
                          </p>
                        </div>
                        <div className="rounded-[1.15rem] border border-border/75 bg-background/80 p-3 shadow-[0_16px_34px_-34px_hsl(var(--foreground))]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Remaining Need
                          </p>
                          <p className="mt-1.5 text-lg font-semibold text-foreground">
                            {formatRecentProjectsInr(remaining)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.35rem] border border-border/75 bg-[linear-gradient(145deg,hsl(var(--background))_0%,hsl(var(--muted)/0.6)_100%)] p-3.5 shadow-[0_20px_46px_-42px_hsl(var(--foreground))]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Raised
                            </p>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {formatRecentProjectsInr(project.spent)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Remaining
                            </p>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {formatRecentProjectsInr(remaining)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Progress
                            </p>
                            <p className="mt-2 text-sm font-semibold text-foreground">
                              {utilization}%
                            </p>
                            </div>
                          </div>
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {isActive ? "Funding Active" : "Target Achieved"}
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            style={{
                              width: `${utilization}%`,
                              transformOrigin: "left center",
                            }}
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.95, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent"
                          />
                        </div>
                        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span>{formatRecentProjectsInr(project.spent)} raised</span>
                          <span>{formatRecentProjectsInr(project.budget)} target</span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-2 md:grid-cols-2">
                        {project.outcomes.slice(0, 2).map((outcome) => (
                          <div
                            key={`${project.slug}-${outcome}`}
                            className="flex items-start gap-3 rounded-[1.05rem] border border-border/70 bg-background/70 px-3.5 py-3 text-sm leading-relaxed text-muted-foreground shadow-[0_14px_32px_-32px_hsl(var(--foreground))]"
                          >
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                            <span>{outcome}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-[1.25rem] border border-primary/15 bg-primary/5 p-3.5">
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                            {isActive ? "Direct project funding open" : "Completed chapter support"}
                          </p>
                          <ProjectFundingActions
                            title={project.title}
                            slug={project.slug}
                            donateLabel={isActive ? "Donate Now" : "Support Similar Work"}
                            compact
                            className="w-full sm:w-auto sm:min-w-[22rem]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {activeProjects.length > 0 ? (
        <section className="relative border-t border-border/70 py-12 md:py-16">
          <div className="container relative mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="mb-8 max-w-3xl"
            >
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                Active Funding Lanes
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Want to fund one project directly? Pick a live lane.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                These cards are designed for direct action: what is open, how much is left,
                and where someone can donate immediately.
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-[86rem] gap-5 xl:grid-cols-2">
              {activeProjects.map((project, index) => {
                const remaining = Math.max(project.budget - project.spent, 0);
                const utilization = getUtilizationPercent(project.spent, project.budget);

                return (
                  <motion.div
                    key={project.slug}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/96 shadow-[0_28px_84px_-56px_hsl(var(--foreground))]"
                  >
                    <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(205px,0.36fr)]">
                      <div className="p-6 md:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                              {project.focus}
                            </p>
                            <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">
                              {project.title}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {project.location} | {project.timeline}
                            </p>
                          </div>
                          <Badge className="border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Active
                          </Badge>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[1.25rem] border border-border/75 bg-background/80 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Raised
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {formatRecentProjectsInr(project.spent)}
                        </p>
                          </div>
                          <div className="rounded-[1.25rem] border border-border/75 bg-background/80 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Remaining
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {formatRecentProjectsInr(remaining)}
                        </p>
                          </div>
                          <div className="rounded-[1.25rem] border border-border/75 bg-background/80 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Reach
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {recentProjectsNumberFormat.format(project.beneficiaries)}
                        </p>
                          </div>
                        </div>

                        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            style={{
                              width: `${utilization}%`,
                              transformOrigin: "left center",
                            }}
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent"
                          />
                        </div>

                        <ProjectFundingActions
                          title={project.title}
                          slug={project.slug}
                          donateLabel="Donate Now"
                          className="mt-6 max-w-none grid-cols-1"
                          donateFirst
                        />
                      </div>

                      <div className="grid content-between border-t border-border/75 bg-[linear-gradient(180deg,hsl(var(--primary)/0.08)_0%,transparent_100%)] p-5 md:border-l md:border-t-0">
                        <div className="space-y-3">
                          <div className="rounded-[1.2rem] border border-border/70 bg-background/80 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Project Target
                            </p>
                            <p className="mt-2 text-lg font-semibold text-foreground">
                              {formatRecentProjectsInr(project.budget)}
                            </p>
                          </div>
                          <div className="rounded-[1.2rem] border border-border/70 bg-background/80 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Progress
                            </p>
                            <p className="mt-2 text-lg font-semibold text-foreground">
                              {utilization}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-[1.2rem] border border-border/70 bg-background/80 p-4">
                          <div className="flex items-center gap-3">
                            <span className="rounded-2xl bg-primary/12 p-3 text-primary">
                              {remaining > 0 ? (
                                <Target className="h-4 w-4" />
                              ) : (
                                <TrendingUp className="h-4 w-4" />
                              )}
                            </span>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Funding Status
                              </p>
                              <p className="mt-1 text-sm font-semibold text-foreground">
                                {remaining > 0 ? "Open for direct donations" : "Target reached"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default RecentProjectsShowcase;
