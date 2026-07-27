import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CalendarSync, CheckCircle2, HeartHandshake, Landmark, LoaderCircle, Repeat, ShieldCheck, Wallet } from "lucide-react";
import { useLocation } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  findRecentProjectByIdentifier,
  mapRecentProjectsFromApi,
  type RecentProjectsApiItem,
} from "@/data/recentProjects";
import { useToast } from "@/hooks/use-toast";
import { getJson, postJson, reportApiError } from "@/lib/api";

const presetAmounts = [500, 1000, 2500, 5000];
const maximumDonationAmount = 500_000;
const donationModes = ["one_time", "monthly"] as const;
const donationCategories = ["General Support", "Healthcare", "Education", "Food Support", "Environment", "Elderly Support", "Disability Assistance"] as const;

type DonationMode = (typeof donationModes)[number];

type CheckoutResponse = {
  checkout_type: DonationMode;
  donation_id: number;
  key: string;
  amount: number;
  currency: string;
  order_id?: string;
  subscription_id?: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadRazorpayScript = async () => {
  if (window.Razorpay) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const DonateNow = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [apiProjects, setApiProjects] = useState<RecentProjectsApiItem[] | null>(null);
  const [donationMode, setDonationMode] = useState<DonationMode>("one_time");
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [donationCategory, setDonationCategory] = useState<string>("General Support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [is80GRequested, setIs80GRequested] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalAmount = useMemo(() => {
    const parsed = Number(customAmount);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  useEffect(() => {
    getJson<RecentProjectsApiItem[]>("projects/", { cache: false })
      .then((response) => {
        setApiProjects(response);
      })
      .catch((error) => {
        reportApiError("Unable to fetch donation projects", error);
        setApiProjects([]);
      });
  }, []);

  const availableProjects = useMemo(
    () => mapRecentProjectsFromApi(apiProjects),
    [apiProjects],
  );

  const selectedProject = useMemo(() => {
    const projectParam = new URLSearchParams(location.search).get("project")?.trim();
    return findRecentProjectByIdentifier(availableProjects, projectParam);
  }, [availableProjects, location.search]);
  const donationMessage = useMemo(() => {
    if (!selectedProject) {
      return message;
    }

    const projectNote = `Supporting project: ${selectedProject.title}`;
    return message.trim() ? `${projectNote}\n\n${message}` : projectNote;
  }, [message, selectedProject]);
  const isCustomAmountActive = customAmount.trim() !== "";
  const normalizedPanPreview = panNumber.trim().toUpperCase();
  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPanPreview);

  const resetForm = () => {
    setCustomAmount("");
    setSelectedAmount(1000);
    setDonationCategory("General Support");
    setName("");
    setEmail("");
    setPhone("");
    setIs80GRequested(false);
    setPanNumber("");
    setMessage("");
    setDonationMode("one_time");
  };

  const handleDonate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (finalAmount < 100) {
      toast({
        title: "Invalid amount",
        description: "Minimum donation amount is Rs 100.",
        variant: "destructive",
      });
      return;
    }
    if (finalAmount > maximumDonationAmount) {
      toast({
        title: "Amount is too high for online checkout",
        description: "For donations above Rs 5,00,000, please contact the foundation.",
        variant: "destructive",
      });
      return;
    }

    const normalizedPan = panNumber.trim().toUpperCase();
    if (is80GRequested && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPan)) {
      toast({
        title: "PAN required",
        description: "Enter a valid PAN card number to continue with an 80G certificate request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error("Razorpay checkout script failed to load.");
      }

      const checkout = await postJson<CheckoutResponse>("donations/checkout/", {
        donation_type: donationMode,
        amount: finalAmount,
        currency: "INR",
        name,
        email,
        phone,
        project_slug: selectedProject?.slug ?? "",
        project_title: selectedProject?.title ?? "",
        donation_category: donationCategory,
        eighty_g_requested: is80GRequested,
        pan_number: is80GRequested ? normalizedPan : "",
        message: donationMessage,
      });

      const razorpay = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        name: checkout.name,
        description: checkout.description,
        order_id: checkout.order_id,
        subscription_id: checkout.subscription_id,
        prefill: checkout.prefill,
        notes: {
          donation_id: checkout.donation_id,
          donation_mode: donationMode,
          donation_category: donationCategory,
          project_slug: selectedProject?.slug ?? "",
          project_title: selectedProject?.title ?? "",
          eighty_g_requested: is80GRequested ? "yes" : "no",
        },
        recurring: donationMode === "monthly" ? 1 : undefined,
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verification = await postJson<{ detail: string; status: string }>("donations/verify/", {
              donation_id: checkout.donation_id,
              donation_type: donationMode,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || checkout.order_id || "",
              razorpay_subscription_id: response.razorpay_subscription_id || checkout.subscription_id || "",
              razorpay_signature: response.razorpay_signature,
            });

            toast({
              title: donationMode === "monthly" ? "Monthly donation started" : "Donation successful",
              description:
                donationMode === "monthly"
                  ? "Auto-debit mandate is authorized. Razorpay will charge monthly as per your selected amount."
                  : `Payment verified. Status: ${verification.status}`,
            });
            resetForm();
          } catch (verifyError) {
            toast({
              title: "Payment received but verification failed",
              description: verifyError instanceof Error ? verifyError.message : "Please contact the support team to verify this payment.",
              variant: "destructive",
            });
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
        theme: {
          color: "#f59e0b",
        },
      });

      razorpay.open();
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Unable to start payment",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative overflow-hidden donate-page">
      <section className="relative overflow-hidden border-b border-border/70 py-12 md:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,hsl(var(--primary)/0.18),transparent_35%),radial-gradient(circle_at_86%_80%,hsl(var(--accent)/0.18),transparent_37%),linear-gradient(165deg,hsl(var(--background))_0%,hsl(var(--muted))_52%,hsl(var(--background))_100%)]" />
        <motion.div
          aria-hidden
          animate={{ x: [0, 22, 0], y: [0, -14, 0], opacity: [0.16, 0.3, 0.16] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-16 right-6 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="container relative z-10 mx-auto px-4">
          <AnimatedSection>
            <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-[0_26px_70px_-52px_hsl(var(--foreground))] md:p-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <HeartHandshake className="h-3.5 w-3.5" />
                Donate Now
              </p>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-[4.25rem]">
                Your Support Fuels Direct Community Impact
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Choose an amount, share your details, and help us deliver food relief, education continuity, healthcare outreach, and environment programs.
              </p>
              {selectedProject ? (
                <div className="mt-5 inline-flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground">
                  <span className="font-semibold text-primary">Selected project:</span>
                  <span>{selectedProject.title}</span>
                  <span className="text-muted-foreground">| {selectedProject.focus}</span>
                  <span className="text-muted-foreground">| {selectedProject.location}</span>
                </div>
              ) : null}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 xl:grid-cols-12">
            <AnimatedSection className="xl:col-span-8" direction="left">
              <form
                onSubmit={handleDonate}
                className="rounded-3xl border border-border bg-card p-6 shadow-[0_24px_66px_-48px_hsl(var(--foreground))] md:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-3xl font-semibold text-foreground">Complete Your Donation</h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Secure flow
                  </span>
                </div>

                {selectedProject ? (
                  <div className="mt-6 rounded-[1.6rem] border border-primary/20 bg-[linear-gradient(145deg,hsl(var(--primary)/0.12),hsl(var(--background))_72%)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Donating for a specific project</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-semibold text-foreground">{selectedProject.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedProject.focus} | {selectedProject.timeline}
                        </p>
                      </div>
                      <span className="rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                        {selectedProject.status}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDonationMode("one_time")}
                    className={`relative overflow-hidden rounded-[1.6rem] border px-5 py-5 text-left transition-all ${
                      donationMode === "one_time"
                        ? "border-primary bg-[linear-gradient(145deg,hsl(var(--primary)/0.14),hsl(var(--background))_72%)] shadow-[0_18px_45px_-34px_hsl(var(--primary))]"
                        : "border-border bg-background/80 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Single Donation</p>
                        <p className="mt-1 font-display text-[2rem] font-bold leading-none text-foreground">One-Time</p>
                        <p className="mt-3 max-w-xs text-sm text-muted-foreground">Pay once and complete the donation in a single Razorpay checkout.</p>
                      </div>
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                        donationMode === "one_time" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                      }`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationMode("monthly")}
                    className={`relative overflow-hidden rounded-[1.6rem] border px-5 py-5 text-left transition-all ${
                      donationMode === "monthly"
                        ? "border-accent bg-[linear-gradient(145deg,hsl(var(--accent)/0.16),hsl(var(--background))_72%)] shadow-[0_18px_45px_-34px_hsl(var(--accent))]"
                        : "border-border bg-background/80 hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recurring Support</p>
                        <p className="mt-1 inline-flex items-center gap-2 font-display text-[2rem] font-bold leading-none text-foreground">
                          Monthly
                          <CalendarSync className="h-5 w-5 text-accent" />
                        </p>
                        <p className="mt-3 max-w-xs text-sm text-muted-foreground">Authorize one mandate now. Razorpay can auto-charge every month after approval.</p>
                      </div>
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                        donationMode === "monthly" ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground"
                      }`}>
                        <Repeat className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                </div>

                <div className="mt-7 rounded-[1.8rem] border border-border/80 bg-background/55 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Choose Amount</p>
                      <p className="mt-1 text-sm text-muted-foreground">Select a quick amount or enter a custom amount. The custom amount will be used when filled.</p>
                    </div>
                    <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                      Active: {isCustomAmountActive ? "Custom amount" : `Quick Rs ${selectedAmount.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {presetAmounts.map((amount) => (
                    <button
                      type="button"
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                      className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                        selectedAmount === amount && !isCustomAmountActive
                          ? "border-primary bg-primary/10 shadow-[0_14px_36px_-30px_hsl(var(--primary))]"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Quick Amount</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="font-display text-2xl font-bold text-foreground">Rs {amount.toLocaleString("en-IN")}</p>
                        {selectedAmount === amount && !isCustomAmountActive ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>

                <div className={`mt-4 rounded-2xl border p-3 transition-all ${
                  isCustomAmountActive
                    ? "border-accent bg-accent/5 shadow-[0_14px_36px_-30px_hsl(var(--accent))]"
                    : "border-border bg-card"
                }`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Custom Amount</p>
                    {isCustomAmountActive ? (
                      <button
                        type="button"
                        onClick={() => setCustomAmount("")}
                        className="text-xs font-medium text-primary transition-colors hover:text-accent"
                      >
                        Clear custom
                      </button>
                    ) : null}
                  </div>
                  <Input
                    type="number"
                    min={100}
                    max={maximumDonationAmount}
                    step={100}
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value)}
                    placeholder="Enter custom amount (minimum Rs 100)"
                    className="h-11 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
                  />
                </div>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-border/80 bg-background/55 p-4">
                  <label className="grid gap-2 text-sm font-semibold text-foreground">
                    Donation Category
                    <select
                      value={donationCategory}
                      onChange={(event) => setDonationCategory(event.target.value)}
                      className="h-11 rounded-md border border-input bg-background/70 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                    >
                      {donationCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Select the cause category you want to support.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full Name"
                    className="h-11 bg-background/70"
                  />
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email Address"
                    className="h-11 bg-background/70"
                  />
                  <Input
                    required
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone Number"
                    className="h-11 bg-background/70"
                  />
                  <div className="flex h-11 items-center rounded-md border border-input bg-background/70 px-3 text-sm text-muted-foreground">
                    Razorpay checkout will show available methods
                  </div>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-border/80 bg-background/55 p-4">
                  <button
                    type="button"
                    onClick={() => setIs80GRequested((current) => !current)}
                    className={`flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${
                      is80GRequested
                        ? "border-primary bg-primary/10 shadow-[0_14px_36px_-30px_hsl(var(--primary))]"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">80G Certificate</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Request an 80G donation certificate for income-tax deduction. A valid PAN number is required.
                      </p>
                    </div>
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${
                      is80GRequested ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  </button>

                  {is80GRequested ? (
                    <div className="mt-3">
                      <Input
                        required
                        value={panNumber}
                        onChange={(event) => setPanNumber(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
                        placeholder="PAN Card Number"
                        maxLength={10}
                        pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                        aria-invalid={!isPanValid}
                        className={`h-11 bg-background/70 uppercase ${
                          panNumber && isPanValid
                            ? "border-emerald-500 focus-visible:ring-emerald-500"
                            : panNumber
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                        }`}
                      />
                      <p className={`mt-2 text-xs font-medium ${isPanValid ? "text-emerald-600" : "text-destructive"}`}>
                        {panNumber
                          ? isPanValid
                            ? "PAN format is valid."
                            : "Invalid PAN format. Example: ABCDE1234F"
                          : "PAN is required for an 80G certificate."}
                      </p>
                    </div>
                  ) : null}
                </div>

                <Textarea
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={
                    selectedProject
                      ? "Add a note for this project donation (optional)"
                      : "Message (optional)"
                  }
                  className="mt-4 bg-background/70"
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {donationMode === "monthly" ? "Monthly donation" : "Total donation"}:{" "}
                    <span className="font-semibold text-foreground">Rs {finalAmount.toLocaleString("en-IN")}</span>
                  </p>
                  <Button type="submit" disabled={isSubmitting || (is80GRequested && !isPanValid)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Opening Checkout
                      </>
                    ) : donationMode === "monthly" ? (
                      "Start Monthly Donation"
                    ) : (
                      "Proceed to Donate"
                    )}
                  </Button>
                </div>
              </form>
            </AnimatedSection>

            <AnimatedSection className="xl:col-span-4" delay={0.08} direction="right">
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/85 bg-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Where It Goes</p>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary" /> Food relief and ration support</li>
                    <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary" /> Student scholarships and learning kits</li>
                    <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary" /> Rural health camps and medicine access</li>
                    <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-primary" /> Tree plantation and care cycles</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/85 bg-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Checkout Flow</p>
                  <div className="mt-4 space-y-2.5 text-sm text-foreground">
                    <p className="inline-flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Razorpay will show UPI, cards, net banking, and other supported methods</p>
                    <p className="inline-flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Monthly mode depends on subscription mandate support</p>
                    <p className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> No pre-selection is required on this form</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Monthly mode uses Razorpay subscriptions. Final recurring methods depend on your Razorpay account setup and the donor's bank/card mandate support.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonateNow;
