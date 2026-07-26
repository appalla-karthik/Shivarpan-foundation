import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Send, Trophy } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiUrl, assetUrl, getJson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type AwardPayload = {
  id: number;
  title: string;
  category: string;
  image: { url: string } | null;
  is_upcoming: boolean;
};

const fieldClass =
  "rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary";
const labelClass = "grid gap-1.5 text-sm font-semibold text-foreground";

const AwardNomination = () => {
  const { awardId } = useParams();
  const { toast } = useToast();
  const [awards, setAwards] = useState<AwardPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getJson<AwardPayload[]>("awards/")
      .then((data) => {
        if (!isMounted) return;
        setAwards(Array.isArray(data) ? data.filter((award) => award.is_upcoming) : []);
      })
      .catch(() => {
        if (isMounted) {
          setAwards([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedAward = useMemo(
    () => awards.find((award) => String(award.id) === awardId) || awards[0],
    [awardId, awards],
  );
  const heroImage = assetUrl(selectedAward?.image?.url) || "";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_12%,hsl(var(--accent)/0.16),transparent_34%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.35)_100%)]">
      <section className="container mx-auto px-4 py-10 md:py-14">
        <Link
          to="/awards"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Awards
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <aside className="overflow-hidden rounded-[1.8rem] border border-border bg-card shadow-[0_28px_90px_-58px_hsl(var(--foreground))]">
            <div className="relative aspect-[4/3] bg-muted">
              {heroImage ? (
                <img src={heroImage} alt={selectedAward?.title || "Award"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Trophy className="h-12 w-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/72 via-foreground/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-primary-foreground">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {selectedAward?.category || "Award Nomination"}
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold leading-tight">
                  {selectedAward?.title || "Award Nomination"}
                </h1>
              </div>
            </div>
          </aside>

          <div className="rounded-[1.8rem] border border-border bg-card p-5 shadow-[0_28px_90px_-58px_hsl(var(--foreground))] sm:p-7">
            <div className="mb-6">
              <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Nominate Now
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-foreground">
                Submit Nomination
              </h2>
            </div>

            {isSubmitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-medium text-emerald-800">
                Nomination details received. Thank you.
              </div>
            ) : null}

            <form
              className="grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (isSubmitting) return;

                setIsSubmitting(true);
                try {
                  const formData = new FormData(event.currentTarget);
                  const response = await fetch(apiUrl("award-nominations/"), {
                    method: "POST",
                    body: formData,
                    mode: "cors",
                    credentials: "same-origin",
                  });
                  if (!response.ok) {
                    throw new Error("Unable to submit nomination.");
                  }
                  setIsSubmitted(true);
                  event.currentTarget.reset();
                  toast({
                    title: "Nomination submitted",
                    description: "Your nomination details have been received.",
                  });
                } catch (error) {
                  toast({
                    title: "Unable to submit nomination",
                    description: error instanceof Error ? error.message : "Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <label className={labelClass}>
                Nominee Full Name *
                <input required name="nominee_full_name" type="text" placeholder="Enter your full name" className={fieldClass} />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className={labelClass}>
                  Mobile Number *
                  <input required name="mobile_number" type="tel" inputMode="numeric" pattern="[0-9]{10}" placeholder="Enter your 10-digit mobile number" className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Email *
                  <input required name="email" type="email" placeholder="Enter your email address" className={fieldClass} />
                </label>
              </div>

              <label className={labelClass}>
                Company Name *
                <input required name="company_name" type="text" placeholder="Enter your company name" className={fieldClass} />
              </label>

              <label className={labelClass}>
                Select Award Show
                <select name="award_show" key={selectedAward?.id || "award"} defaultValue={selectedAward?.id || ""} className={fieldClass} disabled={isLoading}>
                  <option value="">--Please choose an option--</option>
                  {awards.map((award) => (
                    <option key={award.id} value={award.id}>
                      {award.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                Nominee Profile Photo (*optional)
                <input name="nominee_profile_photo" type="file" accept="image/*" className={fieldClass} />
              </label>

              <label className={labelClass}>
                Company Full Address *
                <textarea required name="company_full_address" rows={4} placeholder="Enter your full company address" className={`${fieldClass} resize-none`} />
              </label>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit Nomination"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AwardNomination;
