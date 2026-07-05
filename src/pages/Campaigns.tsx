import CampaignCard from "@/components/CampaignCard";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import aboutHero from "@/assets/about-hero-optimized.jpg";
import campaignFood from "@/assets/campaign-food.jpg";
import campaignEducation from "@/assets/campaign-education.jpg";
import campaignHealth from "@/assets/campaign-health.jpg";
import campaignEnvironment from "@/assets/campaign-environment.jpg";

const campaigns = [
  { title: "Feed 1000 Families This Winter", image: campaignFood, goal: 200000, raised: 142000, donors: 89, category: "Food Security", urgent: true, daysLeft: 12 },
  { title: "Education for Every Child – School Kit Drive", image: campaignEducation, goal: 150000, raised: 98500, donors: 67, category: "Education", daysLeft: 25 },
  { title: "Free Health Camp in Rural Maharashtra", image: campaignHealth, goal: 300000, raised: 175000, donors: 124, category: "Healthcare", daysLeft: 18 },
  { title: "Plant 10,000 Trees – Green India Mission", image: campaignEnvironment, goal: 100000, raised: 72000, donors: 53, category: "Environment", daysLeft: 40 },
  { title: "Clean Water for 500 Families", image: campaignHealth, goal: 250000, raised: 180000, donors: 95, category: "Healthcare", daysLeft: 30 },
  { title: "Women Skill Development Program", image: campaignEducation, goal: 120000, raised: 45000, donors: 32, category: "Empowerment", daysLeft: 60 },
  { title: "Winter Blanket Distribution Drive", image: campaignFood, goal: 80000, raised: 62000, donors: 41, category: "Food Security", urgent: true, daysLeft: 5 },
  { title: "Solar Lamps for Rural Schools", image: campaignEnvironment, goal: 175000, raised: 88000, donors: 56, category: "Education", daysLeft: 35 },
];

const Campaigns = () => (
  <div>
    <PageHero title="Our Campaigns" subtitle="Browse active campaigns and make your contribution count" image={aboutHero} />

    <section className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-10">
          <p className="text-muted-foreground max-w-2xl mx-auto">Every rupee you donate goes directly towards creating impact. Our campaigns are goal-based with full transparency — you can see exactly how much has been raised and how many donors have contributed.</p>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaigns.map((c, i) => (
            <AnimatedSection key={c.title + i} delay={i * 0.08}>
              <CampaignCard {...c} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Campaigns;
