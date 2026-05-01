import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useBlogPosts, useTrackPageView } from "@/hooks/use-portfolio-data";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Aditya Pratama" },
      { name: "description", content: "Articles on design, code, and shipping product." },
    ],
  }),
  component: BlogList,
});

function BlogList() {
  useTrackPageView("/blog");
  const { data: posts = [], isLoading } = useBlogPosts();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <header className="mx-auto max-w-4xl px-6 pt-20 pb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Writing</div>
          <h1 className="mt-3 text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            From the <span className="text-gradient-primary">notebook</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">Essays on craft, tools, and shipping.</p>
        </header>

        <section className="mx-auto max-w-4xl px-6 pb-20 space-y-4">
          {isLoading && [...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />)}
          {posts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
              <Link to="/blog/$slug" params={{ slug: p.slug }} className="block group rounded-3xl border border-border bg-card p-8 hover:shadow-glow hover:-translate-y-0.5 transition-all">
                <div className="font-mono text-xs text-muted-foreground">{new Date(p.published_at ?? p.created_at).toLocaleDateString()} · {p.reading_minutes} min</div>
                <h2 className="mt-3 text-2xl md:text-3xl font-display font-bold group-hover:text-gradient-primary transition-colors">{p.title}</h2>
                <p className="mt-3 text-muted-foreground">{p.excerpt}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Read <ArrowRight className="w-3.5 h-3.5" /></div>
              </Link>
            </motion.div>
          ))}
          {!isLoading && posts.length === 0 && (
            <p className="text-center text-muted-foreground py-20">No posts yet.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
