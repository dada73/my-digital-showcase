import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ContactForm } from "@/components/sections/contact-form";
import { useProfile, useTrackPageView } from "@/hooks/use-portfolio-data";
import { Mail, MapPin, Github, Twitter, Linkedin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Aditya Pratama" },
      { name: "description", content: "Let's work together. Send me a message." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  useTrackPageView("/contact");
  const { data: profile } = useProfile();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-20">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
          <h1 className="mt-3 text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            Let's <span className="text-gradient-primary">talk</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Have a project in mind, a role to fill, or just want to say hi? Drop a message — I read every one.
          </p>

          <div className="mt-12 grid md:grid-cols-[1fr_1.5fr] gap-8 items-start">
            <div className="space-y-4">
              {profile?.email && <InfoCard icon={<Mail className="w-5 h-5" />} label="Email" value={profile.email} href={`mailto:${profile.email}`} />}
              {profile?.location && <InfoCard icon={<MapPin className="w-5 h-5" />} label="Based in" value={profile.location} />}
              <div className="flex gap-3 pt-2">
                {profile?.github_url && <SocialPill href={profile.github_url}><Github className="w-4 h-4" /> GitHub</SocialPill>}
                {profile?.twitter_url && <SocialPill href={profile.twitter_url}><Twitter className="w-4 h-4" /> Twitter</SocialPill>}
                {profile?.linkedin_url && <SocialPill href={profile.linkedin_url}><Linkedin className="w-4 h-4" /> LinkedIn</SocialPill>}
              </div>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const Tag: any = href ? "a" : "div";
  return (
    <Tag href={href} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary transition-colors">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-primary text-white">{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="font-medium">{value}</div>
        </div>
      </div>
    </Tag>
  );
}

function SocialPill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition-colors">
      {children}
    </a>
  );
}
