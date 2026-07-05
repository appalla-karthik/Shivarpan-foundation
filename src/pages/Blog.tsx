import { motion } from "framer-motion";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import aboutHero from "@/assets/about-hero-optimized.jpg";
import campaignFood from "@/assets/campaign-food.jpg";
import campaignEducation from "@/assets/campaign-education.jpg";
import campaignHealth from "@/assets/campaign-health.jpg";
import campaignEnvironment from "@/assets/campaign-environment.jpg";

const blogPosts = [
  { title: "How Your ₹100 Feeds a Family for a Week", image: campaignFood, date: "Feb 18, 2026", category: "Impact Story", excerpt: "Discover how our efficient distribution network ensures every rupee creates maximum impact for families in need." },
  { title: "5 Children Who Beat the Odds Through Education", image: campaignEducation, date: "Feb 10, 2026", category: "Success Story", excerpt: "Meet five incredible children who transformed their lives through our scholarship and mentorship programs." },
  { title: "Our Rural Health Camp Reached 500 Patients", image: campaignHealth, date: "Jan 28, 2026", category: "Event Recap", excerpt: "A look back at our biggest health camp yet, providing free checkups, medicines, and referrals in rural Maharashtra." },
  { title: "Green India: 2000 Trees Planted in One Day", image: campaignEnvironment, date: "Jan 15, 2026", category: "Environment", excerpt: "Volunteers from across Mumbai came together for our largest tree plantation drive, covering 10 acres of land." },
  { title: "Annual Gala 2026 – Save the Date!", image: campaignFood, date: "Mar 15, 2026", category: "Upcoming Event", excerpt: "Join us for our Annual Charity Gala on March 15, 2026. An evening of celebration, recognition, and fundraising." },
  { title: "Volunteer Spotlight: Priya's Journey of Service", image: campaignEducation, date: "Jan 5, 2026", category: "Volunteer Story", excerpt: "From weekend volunteer to program lead — Priya shares her transformative 3-year journey with Shivarpan." },
];

const Blog = () => (
  <div>
    <PageHero title="Blog & Events" subtitle="Stories of impact, upcoming events, and community updates" image={aboutHero} />

    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Featured Post */}
        <AnimatedSection className="mb-14">
          <div className="grid md:grid-cols-2 gap-8 bg-card rounded-3xl overflow-hidden border border-border shadow-lg group">
            <div className="relative overflow-hidden h-72 md:h-auto">
              <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <Badge className="bg-accent text-accent-foreground">{blogPosts[0].category}</Badge>
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4" />
                {blogPosts[0].date}
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{blogPosts[0].title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{blogPosts[0].excerpt}</p>
              <Button variant="outline" className="self-start border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
                Read More <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </AnimatedSection>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post, i) => (
            <AnimatedSection key={post.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-500 group cursor-pointer h-full flex flex-col"
              >
                <div className="relative overflow-hidden h-48">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" />{post.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>
                  <span className="text-primary text-sm font-semibold mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Blog;
