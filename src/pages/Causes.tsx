import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Stethoscope, Heart, TreePine, Users, Shirt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import aboutHero from "@/assets/about-hero-optimized.jpg";

const causes = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Education",
    desc: "Providing quality education, school kits, scholarships, and teacher training to underprivileged children across rural India. Every child deserves the chance to learn.",
    stats: "3,000+ children supported",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: <Stethoscope className="w-8 h-8" />,
    title: "Healthcare",
    desc: "Free medical camps, health awareness drives, and affordable medicine distribution in underserved rural and urban communities.",
    stats: "5,000+ patients treated",
    color: "bg-red-500/10 text-red-600",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Food Security",
    desc: "Daily meal programs, community kitchens, and emergency food distribution drives to ensure no one goes hungry.",
    stats: "50,000+ meals served",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: <TreePine className="w-8 h-8" />,
    title: "Environment",
    desc: "Tree plantation drives, river cleaning initiatives, and sustainability education to preserve our planet for future generations.",
    stats: "10,000+ trees planted",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: <Shirt className="w-8 h-8" />,
    title: "Women Empowerment",
    desc: "Skill development workshops, self-help groups, and entrepreneurship training for women in rural communities.",
    stats: "1,500+ women empowered",
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Elder Care",
    desc: "Supporting senior citizens through shelter, medical aid, companionship programs, and dignified living support.",
    stats: "800+ seniors supported",
    color: "bg-purple-500/10 text-purple-600",
  },
];

const Causes = () => (
  <div>
    <PageHero title="Our Causes" subtitle="Six key areas where we create lasting impact" image={aboutHero} />

    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause, i) => (
            <AnimatedSection key={cause.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -8 }}
                className="bg-card rounded-2xl p-8 border border-border hover:shadow-2xl transition-all duration-500 group h-full flex flex-col"
              >
                <div className={`w-16 h-16 rounded-2xl ${cause.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {cause.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{cause.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">{cause.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-xs font-semibold text-primary">{cause.stats}</span>
                  <Link to="/campaigns">
                    <Button size="sm" variant="ghost" className="text-primary hover:text-primary gap-1 text-xs">
                      Support <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Causes;
