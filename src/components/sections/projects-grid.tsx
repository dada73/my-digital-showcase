import { motion } from "framer-motion";
import { useProjects } from "@/hooks/use-portfolio-data";
import { ExternalLink, Github } from "lucide-react";

export function ProjectsGrid({ featuredOnly = false, limit }: { featuredOnly?: boolean; limit?: number }) {
  const { data: projects = [], isLoading } = useProjects(featuredOnly);
  const list = limit ? projects.slice(0, limit) : projects;

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />)}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((p, i) => (
        <motion.article
          key={p.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="group relative rounded-3xl border border-border bg-card p-6 hover:shadow-glow transition-all hover:-translate-y-1 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-3xl transition-opacity" />
          {p.featured && (
            <span className="absolute top-4 right-4 text-xs font-mono px-2 py-1 rounded-full bg-acid/20 text-foreground border border-acid/40">★ featured</span>
          )}
          <div className="aspect-[16/10] -mx-6 -mt-6 mb-6 bg-gradient-cool relative overflow-hidden">
            {p.image_url ? (
              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center">
                <div className="font-display font-bold text-5xl text-white/90 mix-blend-overlay">{p.title.split(" ").map(s => s[0]).slice(0, 2).join("")}</div>
              </div>
            )}
          </div>
          <h3 className="text-xl font-display font-bold">{p.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.tech_stack.slice(0, 4).map((t) => (
              <span key={t} className="text-xs font-mono px-2 py-1 rounded-md bg-secondary text-secondary-foreground">{t}</span>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            {p.github_url && (
              <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                <Github className="w-4 h-4" /> Code
              </a>
            )}
            {p.demo_url && (
              <a href={p.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
                <ExternalLink className="w-4 h-4" /> Live
              </a>
            )}
          </div>
        </motion.article>
      ))}
    </div>
  );
}
