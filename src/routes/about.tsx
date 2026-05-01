import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useProfile, useTrackPageView } from "@/hooks/use-portfolio-data";
import { motion } from "framer-motion";
import { MapPin, Mail } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Aditya Pratama" },
      { name: "description", content: "About the developer behind the work." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  useTrackPageView("/about");
  const { data: profile } = useProfile();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-20">
          <div className="grid md:grid-cols-[1fr_2fr] gap-10 items-start">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="aspect-square rounded-3xl bg-gradient-primary shadow-glow relative overflow-hidden">
                <div className="absolute inset-0 grid place-items-center text-7xl font-display font-bold text-white/90">
                  {profile?.full_name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="absolute inset-0 noise opacity-20" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">About</div>
              <h1 className="mt-3 text-4xl md:text-6xl font-display font-bold leading-[1.05]">
                Hey, I'm <span className="text-gradient-primary">{profile?.full_name?.split(" ")[0] ?? "there"}</span>.
              </h1>
              <p className="mt-2 text-xl text-muted-foreground">{profile?.title}</p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.location && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.location}</span>}
                {profile?.email && <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground"><Mail className="w-4 h-4" /> {profile.email}</a>}
              </div>
              <div className="mt-8 prose prose-lg dark:prose-invert max-w-none text-lg leading-relaxed">
                <p>{profile?.bio}</p>
                <p className="mt-4 text-muted-foreground">When I'm not coding, you'll find me sketching interfaces in cafés, exploring side streets in Jakarta, or geeking out over typography.</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
