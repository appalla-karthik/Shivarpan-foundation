import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatRecentProjectsInr,
  recentProjectsNumberFormat,
} from "@/data/recentProjects";
import type { RecentProject } from "@/data/recentProjects";

interface ProjectChaptersProps {
  projects: RecentProject[];
}

const ProjectChapters = ({ projects }: ProjectChaptersProps) => (
  <section className="relative py-14 md:py-20">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto mb-12 max-w-3xl text-center"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-accent">
          Project Chapters
        </span>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
          Editorial snapshots from the ground
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Each chapter pairs field context with delivery numbers so partners
          can read the work as both a story and an accountable record.
        </p>
      </motion.div>

      <div className="space-y-10">
        {projects.map((project, index) => {
          const ProjectIcon = project.icon;
          const utilizationPercent = project.budget > 0
            ? Math.min(Math.round((project.spent / project.budget) * 100), 100)
            : 0;
          const isCompleted = project.status === "Completed";

          return (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.05 }}
              className="group overflow-hidden rounded-[2.2rem] border border-border/80 bg-card/92 shadow-[0_26px_80px_-56px_hsl(var(--foreground))]"
            >
              <div className="grid gap-0 lg:grid-cols-12">
                <div
                  className={`relative min-h-[320px] overflow-hidden lg:col-span-5 ${
                    index % 2 === 1 ? "lg:order-2" : ""
                  }`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/82 via-foreground/18 to-transparent" />
                  <span className="absolute left-5 top-5 font-display text-6xl font-bold text-primary-foreground/18 sm:text-7xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute left-5 top-5 mt-10 flex flex-wrap gap-2">
                    <Badge className="bg-primary text-primary-foreground">
                      {project.focus}
                    </Badge>
                    <Badge
                      className={
                        isCompleted
                          ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 rounded-[1.4rem] border border-primary-foreground/20 bg-foreground/55 p-4 text-primary-foreground backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
                      Field View
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
                      {project.location}
                    </p>
                    <p className="mt-1 text-xs text-primary-foreground/75">
                      {project.timeline}
                    </p>
                  </div>
                </div>

                <div
                  className={`relative p-6 sm:p-8 lg:col-span-7 ${
                    index % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-2xl bg-primary/12 p-3 text-primary">
                      <ProjectIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                        Chapter {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {project.timeline}
                    </span>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-background/80 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Objective
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                      {project.objective}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Beneficiaries
                      </p>
                      <p className="mt-2 text-xl font-bold text-foreground">
                        {recentProjectsNumberFormat.format(project.beneficiaries)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Volunteers
                      </p>
                      <p className="mt-2 text-xl font-bold text-foreground">
                        {recentProjectsNumberFormat.format(project.volunteers)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-background/80 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Partner Orgs
                      </p>
                      <p className="mt-2 text-xl font-bold text-foreground">
                        {recentProjectsNumberFormat.format(project.partners)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-border/80 bg-background/80 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <p className="font-semibold text-foreground">
                        Budget Utilization
                      </p>
                      <p className="text-muted-foreground">{utilizationPercent}%</p>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${utilizationPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.05, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{formatRecentProjectsInr(project.spent)} spent</span>
                      <span>{formatRecentProjectsInr(project.budget)} allocated</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {project.outcomes.map((outcome) => (
                      <p
                        key={`${project.title}-${outcome}`}
                        className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{outcome}</span>
                      </p>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-primary/15 bg-primary/5 p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                        Support This Project
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {isCompleted
                          ? "Contribute to keep similar impact cycles funded and ready for the next chapter."
                          : "Donate directly for this active project and help the team close the remaining gap faster."}
                      </p>
                    </div>
                    <Button
                      asChild
                      className="bg-primary text-primary-foreground shadow-[0_18px_45px_-32px_hsl(var(--primary))] hover:bg-primary/90"
                    >
                      <Link to={`/donate-now?project=${encodeURIComponent(project.slug)}`}>
                        <Heart className="h-4 w-4" />
                        {isCompleted ? "Support Similar Work" : "Donate to This Project"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);

export default ProjectChapters;
