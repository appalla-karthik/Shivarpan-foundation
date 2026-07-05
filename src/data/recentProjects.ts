import {
  BookOpenText,
  Calendar,
  CheckCircle2,
  HandHeart,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import aboutHero from "@/assets/about-hero-optimized.jpg";
import campaignEducation from "@/assets/campaign-education.jpg";
import campaignEnvironment from "@/assets/campaign-environment.jpg";
import campaignFood from "@/assets/campaign-food.jpg";
import campaignHealth from "@/assets/campaign-health.jpg";
import { assetUrl } from "@/lib/api";

export interface RecentProject {
  title: string;
  slug: string;
  image: string;
  icon: LucideIcon;
  focus: string;
  status: "Completed" | "Active";
  location: string;
  timeline: string;
  beneficiaries: number;
  volunteers: number;
  partners: number;
  budget: number;
  spent: number;
  objective: string;
  outcomes: string[];
}

export interface RecentProjectsApiItem {
  id?: number;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  partner_organization?: string;
  impact_numbers?: Record<string, unknown> | null;
  featured_image?: {
    url?: string | null;
  } | null;
}

export interface SectorSplit {
  title: string;
  icon: LucideIcon;
  share: number;
  description: string;
}

export interface DeliveryStep {
  title: string;
  detail: string;
  icon: LucideIcon;
}

export const recentProjects: RecentProject[] = [
  {
    title: "Winter Nutrition Relief Network",
    slug: "winter-nutrition-relief-network",
    image: campaignFood,
    icon: HandHeart,
    focus: "Food Security",
    status: "Completed",
    location: "Mumbai, Thane, Navi Mumbai",
    timeline: "Dec 2025 - Feb 2026",
    beneficiaries: 2180,
    volunteers: 124,
    partners: 9,
    budget: 180000,
    spent: 180000,
    objective:
      "Protect high-risk households from winter food insecurity through rapid distribution and nutrition support.",
    outcomes: [
      "500 household ration kits delivered in 72 hours",
      "Community kitchens served 12,800 hot meals",
      "Nutrition screening enabled targeted pediatric support",
    ],
  },
  {
    title: "Scholarship Continuity Accelerator",
    slug: "scholarship-continuity-accelerator",
    image: campaignEducation,
    icon: BookOpenText,
    focus: "Education",
    status: "Completed",
    location: "Maharashtra Cluster Schools",
    timeline: "Jan 2026 - Mar 2026",
    beneficiaries: 1200,
    volunteers: 61,
    partners: 14,
    budget: 220000,
    spent: 220000,
    objective:
      "Reduce dropout risk among first-generation learners through scholarship continuity and mentoring support.",
    outcomes: [
      "1,200 students received complete school-kit bundles",
      "50 full scholarships funded for board-year students",
      "Mentor circles launched across 14 partner institutions",
    ],
  },
  {
    title: "Rural Preventive Health Corridor",
    slug: "rural-preventive-health-corridor",
    image: campaignHealth,
    icon: Stethoscope,
    focus: "Healthcare",
    status: "Active",
    location: "Nashik and Palghar Blocks",
    timeline: "Feb 2026 - Apr 2026",
    beneficiaries: 860,
    volunteers: 48,
    partners: 7,
    budget: 260000,
    spent: 252000,
    objective:
      "Expand access to preventive diagnostics and follow-up referrals for underserved communities.",
    outcomes: [
      "500+ patients screened in camp format",
      "Referral desk mapped cases to district facilities",
      "Mobile follow-up system reduced missed consultations",
    ],
  },
  {
    title: "Urban Green Belt Restoration Grid",
    slug: "urban-green-belt-restoration-grid",
    image: campaignEnvironment,
    icon: Leaf,
    focus: "Environment",
    status: "Active",
    location: "Navi Mumbai Urban Fringe",
    timeline: "Jan 2026 - May 2026",
    beneficiaries: 1460,
    volunteers: 89,
    partners: 11,
    budget: 140000,
    spent: 125500,
    objective:
      "Rebuild degraded urban green stretches using high-survival plantation cycles and local stewardship.",
    outcomes: [
      "2,000 saplings planted with species diversification",
      "School eco-clubs adopted post-plantation maintenance",
      "Watering and survival audits now tracked weekly",
    ],
  },
];

export const sectorSplit: SectorSplit[] = [
  {
    title: "Food Security",
    icon: HandHeart,
    share: 31,
    description: "Emergency kits, community kitchens, and targeted nutrition support.",
  },
  {
    title: "Education",
    icon: BookOpenText,
    share: 29,
    description: "Scholarships, learning kits, and mentor continuity for students.",
  },
  {
    title: "Healthcare",
    icon: Stethoscope,
    share: 23,
    description: "Preventive screening, medicine access, and structured referral workflows.",
  },
  {
    title: "Environment",
    icon: Leaf,
    share: 17,
    description: "Tree plantation drives with community-led upkeep and audits.",
  },
];

export const deliverySteps: DeliveryStep[] = [
  {
    title: "Need Mapping",
    detail: "Field teams and community leaders validate demand, urgency, and population clusters.",
    icon: MapPin,
  },
  {
    title: "Program Design",
    detail: "Budget, timelines, and impact KPIs are set with partner institutions and volunteers.",
    icon: Calendar,
  },
  {
    title: "Execution Sprints",
    detail: "Campaigns run through weekly checkpoints for logistics, risk, and quality assurance.",
    icon: ShieldCheck,
  },
  {
    title: "Outcome Audits",
    detail: "Post-delivery evaluation confirms utilization, beneficiary reach, and retention impact.",
    icon: CheckCircle2,
  },
];

export const recentIntroGridImages = [
  aboutHero,
  campaignFood,
  campaignEducation,
  campaignHealth,
  campaignEnvironment,
  campaignFood,
  campaignEducation,
  campaignHealth,
  campaignEnvironment,
  aboutHero,
  campaignFood,
  campaignEducation,
  campaignHealth,
  campaignEnvironment,
  aboutHero,
  campaignFood,
  campaignEducation,
  campaignHealth,
  campaignEnvironment,
  aboutHero,
  campaignFood,
  campaignEducation,
  campaignHealth,
  campaignEnvironment,
  aboutHero,
  campaignFood,
];

export const recentProjectsNumberFormat = new Intl.NumberFormat("en-IN");

export const formatRecentProjectsInr = (value: number) =>
  `INR ${recentProjectsNumberFormat.format(value)}`;

const recentProjectFallbackMap = new Map(
  recentProjects.flatMap((project) => [
    [project.slug, project],
    [project.title.trim().toLowerCase(), project],
  ]),
);

const getFallbackProject = (item: Pick<RecentProjectsApiItem, "slug" | "title">) =>
  recentProjectFallbackMap.get(item.slug) ??
  recentProjectFallbackMap.get(item.title.trim().toLowerCase()) ??
  null;

const readImpactString = (
  impact: Record<string, unknown> | null | undefined,
  ...keys: string[]
) => {
  if (!impact) {
    return undefined;
  }

  for (const key of keys) {
    const value = impact[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const readImpactNumber = (
  impact: Record<string, unknown> | null | undefined,
  ...keys: string[]
) => {
  if (!impact) {
    return undefined;
  }

  for (const key of keys) {
    const value = impact[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const normalized = Number(
        value.replace(/[^\d.-]/g, "").replace(/(?!^)-/g, "").trim(),
      );
      if (Number.isFinite(normalized)) {
        return normalized;
      }
    }
  }

  return undefined;
};

const readImpactStringArray = (
  impact: Record<string, unknown> | null | undefined,
  ...keys: string[]
) => {
  if (!impact) {
    return undefined;
  }

  for (const key of keys) {
    const value = impact[key];
    if (Array.isArray(value)) {
      const items = value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);

      if (items.length > 0) {
        return items;
      }
    }
  }

  return undefined;
};

const normalizeProjectStatus = (value?: string): RecentProject["status"] => {
  if (!value) {
    return "Active";
  }

  const normalized = value.trim().toLowerCase();
  if (["completed", "complete", "closed", "done"].includes(normalized)) {
    return "Completed";
  }

  return "Active";
};

const resolveProjectIcon = (focus?: string, fallbackIcon?: LucideIcon) => {
  const normalized = focus?.trim().toLowerCase() ?? "";

  if (normalized.includes("food") || normalized.includes("nutrition")) {
    return HandHeart;
  }
  if (normalized.includes("education") || normalized.includes("scholar")) {
    return BookOpenText;
  }
  if (normalized.includes("health") || normalized.includes("medical")) {
    return Stethoscope;
  }
  if (
    normalized.includes("environment") ||
    normalized.includes("green") ||
    normalized.includes("climate")
  ) {
    return Leaf;
  }

  return fallbackIcon ?? Sparkles;
};

export const mapRecentProjectsFromApi = (
  items?: RecentProjectsApiItem[] | null,
): RecentProject[] => {
  if (!items || items.length === 0) {
    return recentProjects;
  }

  return items.map((item) => {
    const fallbackProject = getFallbackProject(item);
    const impact = item.impact_numbers ?? {};
    const focus =
      readImpactString(impact, "focus", "category", "sector", "track") ??
      fallbackProject?.focus ??
      "Community Impact";
    const status = normalizeProjectStatus(
      readImpactString(impact, "status", "project_status", "state") ??
        fallbackProject?.status,
    );
    const objective =
      readImpactString(impact, "objective", "objective_text") ??
      item.summary?.trim() ??
      item.description?.trim() ??
      fallbackProject?.objective ??
      "";
    const image = item.featured_image?.url?.trim()
      ? assetUrl(item.featured_image.url)
      : fallbackProject?.image || aboutHero;

    return {
      title: item.title,
      slug: item.slug,
      image,
      icon: resolveProjectIcon(focus, fallbackProject?.icon),
      focus,
      status,
      location:
        readImpactString(impact, "location", "geography", "region") ??
        fallbackProject?.location ??
        "Field location to be updated",
      timeline:
        readImpactString(impact, "timeline", "duration", "date_range") ??
        fallbackProject?.timeline ??
        "Timeline to be updated",
      beneficiaries:
        readImpactNumber(impact, "beneficiaries", "people_reached", "reach") ??
        fallbackProject?.beneficiaries ??
        0,
      volunteers:
        readImpactNumber(impact, "volunteers", "volunteer_count") ??
        fallbackProject?.volunteers ??
        0,
      partners:
        readImpactNumber(impact, "partners", "partner_count", "delivery_partners") ??
        fallbackProject?.partners ??
        0,
      budget:
        readImpactNumber(impact, "budget", "target", "allocated_budget") ??
        fallbackProject?.budget ??
        0,
      spent:
        readImpactNumber(impact, "spent", "raised", "utilized", "deployed") ??
        fallbackProject?.spent ??
        0,
      objective,
      outcomes:
        readImpactStringArray(impact, "outcomes", "highlights", "milestones") ??
        fallbackProject?.outcomes ??
        [],
    };
  });
};

export const findRecentProjectByIdentifier = (
  projects: RecentProject[],
  identifier: string | null | undefined,
) => {
  if (!identifier?.trim()) {
    return null;
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();

  return (
    projects.find((project) => project.slug === identifier.trim()) ??
    projects.find(
      (project) => project.title.trim().toLowerCase() === normalizedIdentifier,
    ) ??
    null
  );
};
