import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { SkillsSection } from "@/components/sections/skills-section";
import { useBlogPosts, useTrackPageView } from "@/hooks/use-portfolio-data";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aditya Pratama — Full-Stack Developer" },
      { name: "description", content: "Portfolio: bold UI work, modern full-stack engineering, and design-led product thinking." },
      { property: "og:title", content: "Aditya Pratama — Portfolio" },
      { property: "og:description", content: "Bold, fast, joyful web experiences." },
    ],
  }),
  component: Index,
});

function Index() {
  useTrackPageView("/");
  const { data: posts = [] } = useBlogPosts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />

        <Section id="work" eyebrow="Selected work" title={<>Recent <span className="text-gradient-primary">projects</span></>} subtitle="A few things I'm proud of, shipped this year.">
          <ProjectsGrid featuredOnly limit={3} />
          <div className="mt-10 text-center">
            <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              See all projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Section>

        <Section id="skills" eyebrow="Toolbox" title={<>Things I <span className="text-gradient-primary">build with</span></>} subtitle="My current daily drivers — though I love picking up new tools.">
          <SkillsSection />
        </Section>

        <Section id="blog" eyebrow="Writing" title={<>From the <span className="text-gradient-primary">notebook</span></>} subtitle="Notes on craft, tools, and the messy middle of building products.">
          <div className="grid md:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link to="/blog/$slug" params={{ slug: p.slug }} className="block group rounded-3xl border border-border bg-card p-6 hover:shadow-glow hover:-translate-y-1 transition-all h-full">
                  <div className="font-mono text-xs text-muted-foreground">{new Date(p.published_at ?? p.created_at).toLocaleDateString()} · {p.reading_minutes} min read</div>
                  <h3 className="mt-3 font-display font-bold text-xl group-hover:text-gradient-primary transition-colors">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read article <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              All articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Section({ id, eyebrow, title, subtitle, children }: { id: string; eyebrow: string; title: React.ReactNode; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-3xl mb-12">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{eyebrow}</div>
        <h2 className="mt-3 text-4xl md:text-5xl font-display font-bold leading-tight">{title}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      </motion.div>
      {children}
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-primary p-12 md:p-20 text-white shadow-glow">
        <div className="absolute inset-0 noise opacity-30 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-acid/40 blur-3xl" />
        <div className="relative max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold leading-[0.95]">Got an idea? Let's make it real.</h2>
          <p className="mt-6 text-lg text-white/90">I'm taking on a few new projects this quarter. If you're building something bold, I'd love to hear about it.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-primary font-semibold hover:scale-[1.03] transition-transform">
            Start a project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
