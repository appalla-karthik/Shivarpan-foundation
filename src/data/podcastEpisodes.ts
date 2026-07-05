import aboutHero from "@/assets/about-hero-optimized.jpg";
import campaignEducation from "@/assets/campaign-education.jpg";
import campaignEnvironment from "@/assets/campaign-environment.jpg";
import campaignFood from "@/assets/campaign-food.jpg";
import campaignHealth from "@/assets/campaign-health.jpg";

export type PodcastEpisodeItem = {
  id: number;
  slug: string;
  title: string;
  host: string;
  duration: string;
  summary: string;
  description: string;
  image: string;
  videoUrl: string;
};

export const podcastEpisodes: PodcastEpisodeItem[] = [
  {
    id: 1,
    slug: "grassroots-change-where-impact-begins",
    title: "Grassroots Change: Where Impact Begins",
    host: "Host: Meera Kulkarni",
    duration: "28 min",
    summary:
      "A conversation on how local volunteers build trust and lasting change in underserved communities.",
    description:
      "Ground-level transformation starts with trust. In this episode, we discuss how volunteer networks identify real needs, build long-term engagement, and execute programs that communities actually adopt.",
    image: campaignFood,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: 2,
    slug: "from-scholarship-to-success",
    title: "From Scholarship to Success",
    host: "Host: Rajendra Shivarpan",
    duration: "32 min",
    summary:
      "Meet students whose education journey changed through mentorship and consistent support.",
    description:
      "Scholarship is only step one. We explore the mentorship framework behind academic continuity, confidence building, and career readiness for first-generation learners.",
    image: campaignEducation,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: 3,
    slug: "inside-a-rural-health-camp",
    title: "Inside a Rural Health Camp",
    host: "Host: Dr. Anita Desai",
    duration: "24 min",
    summary:
      "What it takes to deliver quality healthcare access in remote villages with limited infrastructure.",
    description:
      "From planning and diagnostics to referral pathways, this episode unpacks the operational blueprint used to run impactful camps in low-resource geographies.",
    image: campaignHealth,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  },
  {
    id: 4,
    slug: "power-of-collective-volunteering",
    title: "The Power of Collective Volunteering",
    host: "Host: Suresh Yadav",
    duration: "30 min",
    summary:
      "How coordinated community participation scales environmental and social outcomes.",
    description:
      "Large impact demands aligned local action. We cover volunteer coordination models, leadership handoff, and practical methods for scaling initiatives sustainably.",
    image: campaignEnvironment,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  },
  {
    id: 5,
    slug: "women-led-community-action",
    title: "Women-Led Community Action",
    host: "Host: Sneha Patil",
    duration: "27 min",
    summary:
      "Stories from women volunteers building local leadership and support systems.",
    description:
      "Women-led teams are redefining grassroots execution. This discussion highlights leadership journeys, local trust systems, and how women changemakers drive durable outcomes.",
    image: aboutHero,
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  },
];

export const getPodcastEpisodeBySlug = (slug: string) =>
  podcastEpisodes.find((episode) => episode.slug === slug);
