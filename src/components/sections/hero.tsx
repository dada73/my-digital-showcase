import { motion } from "framer-motion";
import { ArrowRight, Download, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useProfile } from "@/hooks/use-portfolio-data";

export function Hero() {
  const { data: profile } = useProfile();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-magenta/30 blur-3xl animate-blob" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-electric/30 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs font-mono"
        >
          <span className="w-2 h-2 rounded-full bg-acid animate-pulse" />
          Available for new projects
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight max-w-5xl"
        >
          {profile?.full_name?.split(" ")[0] ?? "Hello"}
          <span className="inline-block ml-3 -rotate-6 text-gradient-primary">builds</span>
          <br />
          interfaces that
          <span className="relative inline-block ml-3">
            <span className="text-gradient-primary">spark joy</span>
            <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-acid" />
          </span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          {profile?.bio ?? "Full-stack developer focused on bold, fast, and human web experiences."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-primary text-white font-medium shadow-glow hover:scale-[1.03] transition-transform"
          >
            See my work
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card hover:bg-secondary font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Get in touch
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
          className="mt-20 flex items-center gap-8 text-sm font-mono text-muted-foreground"
        >
          <Stat n="50+" l="projects shipped" />
          <Stat n="5y" l="building for the web" />
          <Stat n="∞" l="cups of coffee" />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-3xl font-display font-bold text-foreground">{n}</div>
      <div className="text-xs uppercase tracking-wider mt-1">{l}</div>
    </div>
  );
}
