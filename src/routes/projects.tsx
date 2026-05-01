import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { useTrackPageView } from "@/hooks/use-portfolio-data";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Aditya Pratama" },
      { name: "description", content: "Selected work: full-stack apps, design systems, and creative experiments." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  useTrackPageView("/projects");
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <header className="mx-auto max-w-7xl px-6 pt-20 pb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Portfolio</div>
          <h1 className="mt-3 text-5xl md:text-7xl font-display font-bold leading-[0.95]">
            Things I've <span className="text-gradient-primary">built</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">A mix of client work, side projects, and weekend experiments.</p>
        </header>
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <ProjectsGrid />
        </section>
      </main>
      <Footer />
    </div>
  );
}
