import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Handshake,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AnimatedSection from "@/components/AnimatedSection";
import { useToast } from "@/hooks/use-toast";
import { postJson } from "@/lib/api";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  topic: string;
  organization: string;
  message: string;
};

const defaultForm: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  topic: "Volunteer",
  organization: "",
  message: "",
};

const contactChannels = [
  {
    title: "Address",
    value: "F.F, 104-D, 100 Feet Rd, nr. Sachin Tower, Satellite, ANANDNAGAR, Jodhpur Village, Ahmedabad, Gujarat 380015.",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "Phone",
    value: "+91 98980 38241",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    title: "Email",
    value: "info@shivarpanfoundation.org",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    title: "Working Hours",
    value: "Mon - Sat, 9:30 AM - 6:30 PM",
    icon: <Clock3 className="h-5 w-5" />,
  },
];

const responsePromises = [
  "Average first response within 6 business hours",
  "Clear ownership on every query until resolution",
  "Dedicated support for volunteers and partners",
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactFormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const subject = form.subject.trim() || form.topic;

      await postJson("contact/", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.organization.trim(),
        subject: `${form.topic} — ${subject}`,
        message: form.message.trim(),
      });

      toast({
        title: "Message sent successfully",
        description: "Our team will contact you shortly with next steps.",
      });

      setForm(defaultForm);
    } catch (error) {
      toast({
        title: "Unable to send message",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden contact-page">
      <section className="relative overflow-hidden border-b border-border/70 pb-12 pt-10 md:pb-16 md:pt-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_86%_80%,hsl(var(--accent)/0.18),transparent_36%),linear-gradient(165deg,hsl(var(--background))_0%,hsl(var(--muted))_52%,hsl(var(--background))_100%)]" />
        <motion.div
          aria-hidden
          animate={{ x: [0, 20, 0], y: [0, -14, 0], opacity: [0.16, 0.3, 0.16] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-20 right-6 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -18, 0], y: [0, 16, 0], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-16 left-8 h-64 w-64 rounded-full bg-accent/22 blur-3xl"
        />

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <AnimatedSection className="lg:col-span-8">
              <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-[0_24px_66px_-48px_hsl(var(--foreground))] backdrop-blur-sm md:p-8">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <Handshake className="h-3.5 w-3.5" />
                  Contact Desk
                </p>
                <h1 className="mt-4 font-display text-4xl font-bold leading-[0.95] text-foreground md:text-6xl">
                  Start The Right Conversation
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Whether you want to volunteer, donate, partner, or discuss a
                  community initiative, our team is ready to connect with clear
                  guidance and timely follow-up.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection className="lg:col-span-4" delay={0.08} direction="right">
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-[0_22px_60px_-48px_hsl(var(--foreground))]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  Fast Contact
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
                  Need Immediate Help?
                </h2>
                <div className="mt-5 space-y-3">
                  <a
                    href="tel:+919898038241"
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/45"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    +91 98980 38241
                  </a>
                  <a
                    href="mailto:info@shivarpanfoundation.org"
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/45"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    info@shivarpanfoundation.org
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 xl:grid-cols-12">
            <AnimatedSection className="xl:col-span-4" direction="left">
              <div className="space-y-4">
                {contactChannels.map((channel, index) => (
                  <motion.div
                    key={channel.title}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 210, damping: 20 }}
                    className="rounded-2xl border border-border/85 bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                        {channel.icon}
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {channel.title}
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {channel.value}
                        </p>
                      </div>
                    </div>
                    {index < contactChannels.length - 1 ? (
                      <div className="mt-4 h-px bg-border/70" />
                    ) : null}
                  </motion.div>
                ))}

                <div className="rounded-2xl border border-border/85 bg-card p-5 shadow-sm">
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    Our Response Promise
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {responsePromises.map((promise) => (
                      <li key={promise} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {promise}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="xl:col-span-8" direction="right">
              <motion.form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-border bg-card p-6 shadow-[0_26px_72px_-50px_hsl(var(--foreground))] md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                      Message Form
                    </p>
                    <h2 className="mt-1 font-display text-3xl font-semibold text-foreground">
                      Send Us A Message
                    </h2>
                  </div>
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Your information stays private
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Input
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                    className="h-11 bg-background/70"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    required
                    className="h-11 bg-background/70"
                  />
                  <Input
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    className="h-11 bg-background/70"
                  />
                  <Input
                    placeholder="Organization (Optional)"
                    value={form.organization}
                    onChange={(event) =>
                      setForm({ ...form, organization: event.target.value })
                    }
                    className="h-11 bg-background/70"
                  />
                  <Input
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(event) => setForm({ ...form, subject: event.target.value })}
                    required
                    className="h-11 bg-background/70 sm:col-span-2"
                  />
                  <select
                    value={form.topic}
                    onChange={(event) => setForm({ ...form, topic: event.target.value })}
                    className="h-11 rounded-md border border-input bg-background/70 px-3 text-sm text-foreground outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:col-span-2"
                  >
                    <option>Volunteer</option>
                    <option>Partnership</option>
                    <option>Donation</option>
                    <option>Media / Press</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <Textarea
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  required
                  rows={6}
                  className="mt-4 bg-background/70"
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    We usually reply within 6 business hours
                  </p>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Submit Message"}
                  </Button>
                </div>
              </motion.form>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="pb-14 md:pb-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_26px_70px_-52px_hsl(var(--foreground))]">
              <div className="grid xl:grid-cols-12">
                <div className="xl:col-span-4 border-b border-border p-6 xl:border-b-0 xl:border-r md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Visit Us
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">
                    Foundation Office
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    F.F, 104-D, 100 Feet Rd, nr. Sachin Tower, Satellite, ANANDNAGAR, Jodhpur Village, Ahmedabad, Gujarat 380015.
                  </p>
                  <div className="mt-5 flex flex-col gap-2.5 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Clock3 className="h-4 w-4 text-primary" />
                      Mon - Sat, 9:30 AM - 6:30 PM
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      info@shivarpanfoundation.org
                    </p>
                    <a
                      href="https://maps.app.goo.gl/g4aeX4K7Bw7A7xtf6"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Open in Maps
                    </a>
                  </div>
                </div>
                <div className="xl:col-span-8">
                  <iframe
                    title="Shivarpan Foundation Location Map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=72.5128%2C23.0027%2C72.5328%2C23.0227&layer=mapnik&marker=23.0126699%2C72.5228407"
                    className="h-[340px] w-full md:h-[380px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Contact;
