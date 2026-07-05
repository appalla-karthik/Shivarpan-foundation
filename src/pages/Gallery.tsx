import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PageHero from "@/components/PageHero";
import AnimatedSection from "@/components/AnimatedSection";
import { useEffect, useState } from "react";
import { assetUrl, getJson } from "@/lib/api";
import campaignFood from "@/assets/campaign-food.jpg";

const tileClassByIndex = [
  "sm:col-span-2 lg:col-span-2 lg:row-span-2",
  "",
  "lg:row-span-2",
  "",
  "",
  "sm:col-span-2 lg:col-span-1",
  "",
  "",
];

const galleryTags = ["All", "Relief", "Education", "Healthcare", "Environment", "Community"];

const Gallery = ({ heroTitle, heroSubtitle, heroImage }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [activeTag, setActiveTag] = useState("All");

  useEffect(() => {
    getJson<any>("gallery/")
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.results || []);
        setGalleryItems(
          items.map((item: any) => ({
            ...item,
            image: assetUrl(item.image),
          })),
        );
      })
      .catch((err) => console.error("Failed to load gallery items:", err));
  }, []);

  const filteredItems =
    activeTag === "All"
      ? galleryItems
      : galleryItems.filter((item) =>
          (item.category || "")
            .toLowerCase()
            .includes(activeTag.toLowerCase())
        );

  return (
    <div className="relative overflow-hidden">
      <PageHero
        title={heroTitle ?? "Gallery"}
        subtitle={
          heroSubtitle ??
          "Moments of service, hope, and transformation from our field programs"
        }
        image={heroImage ?? undefined}
      />

      <section className="py-14">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              Visual Impact
            </span>

            <h2 className="mt-3 text-3xl font-bold">Photo Highlights</h2>

            {/* FILTER BUTTONS */}
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {galleryTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1 text-xs border rounded-full transition ${
                    activeTag === tag
                      ? "bg-primary text-white"
                      : "bg-transparent"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* GRID */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid auto-rows-[220px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {filteredItems.map((item, index) => (
              <motion.article
                key={item.id}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative h-full overflow-hidden rounded-2xl border bg-card ${tileClassByIndex[index] ?? ""}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  onError={(event) => {
                    event.currentTarget.src = campaignFood;
                  }}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute right-3 top-3 text-xs bg-white/20 text-white px-2 py-1 rounded backdrop-blur">
                  {item.category}
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white text-lg font-semibold">
                    {item.title}
                  </h3>
                </div>
              </motion.article>
            ))}
          </motion.div>

          
          
        </div>
      </section>
    </div>
  );
};

export default Gallery;
