import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Github, ExternalLink, Star, Loader2, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-portfolio-data";

type Project = {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  image_url: string | null;
  tech_stack: string[];
  github_url: string | null;
  demo_url: string | null;
  featured: boolean;
  display_order: number;
  source: string;
};

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjects,
});

const empty: Omit<Project, "id"> = {
  title: "",
  description: "",
  long_description: "",
  image_url: "",
  tech_stack: [],
  github_url: "",
  demo_url: "",
  featured: false,
  display_order: 0,
  source: "manual",
};

function AdminProjects() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Project | (Omit<Project, "id"> & { id?: string }) | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data: profile } = useProfile();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
  });

  const save = useMutation({
    mutationFn: async (p: typeof editing) => {
      if (!p) return;
      const payload = {
        title: p.title,
        description: p.description,
        long_description: p.long_description,
        image_url: p.image_url || null,
        tech_stack: p.tech_stack,
        github_url: p.github_url || null,
        demo_url: p.demo_url || null,
        featured: p.featured,
        display_order: p.display_order,
        source: p.source,
      };
      if ("id" in p && p.id) {
        const { error } = await supabase.from("projects").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Project saved");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["admin-projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Manage</div>
          <h1 className="mt-2 text-4xl font-display font-bold">Projects</h1>
          <p className="mt-2 text-muted-foreground">{projects.length} project{projects.length !== 1 && "s"}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:border-primary hover:shadow-glow transition-all"
          >
            <Download className="w-4 h-4" /> Import from GitHub
          </button>
          <button
            onClick={() => setEditing({ ...empty, display_order: projects.length })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-4 py-2.5 text-sm font-semibold shadow-glow hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" /> New project
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid place-items-center h-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">No projects yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="group rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="aspect-video object-cover w-full" />
              ) : (
                <div className="aspect-video bg-gradient-mesh grid place-items-center font-display text-2xl font-bold text-gradient-primary">{p.title.slice(0, 2)}</div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-lg">{p.title}</h3>
                  {p.featured && <Star className="w-4 h-4 fill-acid text-acid shrink-0" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tech_stack.slice(0, 4).map((t) => (
                    <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary">{t}</span>
                  ))}
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer"><Github className="w-4 h-4 hover:text-foreground" /></a>}
                    {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 hover:text-foreground" /></a>}
                    <span className="text-xs font-mono ml-2">#{p.display_order}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-secondary"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => confirm(`Delete "${p.title}"?`) && del.mutate(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <ProjectEditor
            value={editing}
            onChange={setEditing}
            onSave={() => save.mutate(editing)}
            onClose={() => setEditing(null)}
            saving={save.isPending}
          />
        )}
        {importOpen && (
          <GithubImporter
            defaultUsername={profile?.github_username ?? ""}
            existing={projects.map((p) => p.github_url ?? "")}
            onClose={() => setImportOpen(false)}
            onImported={() => { qc.invalidateQueries({ queryKey: ["admin-projects"] }); qc.invalidateQueries({ queryKey: ["projects"] }); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

type EditorValue = Omit<Project, "id"> & { id?: string };

function ProjectEditor({ value, onChange, onSave, onClose, saving }: {
  value: EditorValue;
  onChange: (v: EditorValue) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [techInput, setTechInput] = useState("");

  function set<K extends keyof typeof value>(key: K, v: (typeof value)[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-glow my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display font-bold text-xl">{value.id ? "Edit project" : "New project"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Title" value={value.title} onChange={(v) => set("title", v)} />
          <Input label="Short description" value={value.description} onChange={(v) => set("description", v)} />
          <TextArea label="Long description (optional)" value={value.long_description ?? ""} onChange={(v) => set("long_description", v)} />
          <Input label="Image URL" value={value.image_url ?? ""} onChange={(v) => set("image_url", v)} placeholder="https://…" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="GitHub URL" value={value.github_url ?? ""} onChange={(v) => set("github_url", v)} placeholder="https://github.com/…" />
            <Input label="Live demo URL" value={value.demo_url ?? ""} onChange={(v) => set("demo_url", v)} placeholder="https://…" />
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Tech stack</div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {value.tech_stack.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full bg-secondary">
                  {t}
                  <button onClick={() => set("tech_stack", value.tech_stack.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && techInput.trim()) {
                  e.preventDefault();
                  const t = techInput.trim();
                  if (!value.tech_stack.includes(t)) set("tech_stack", [...value.tech_stack, t]);
                  setTechInput("");
                }
              }}
              placeholder="Type a tech and press Enter"
              className="w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Display order" type="number" value={String(value.display_order)} onChange={(v) => set("display_order", Number(v) || 0)} />
            <label className="flex items-end gap-3 pb-2">
              <input type="checkbox" checked={value.featured} onChange={(e) => set("featured", e.target.checked)} className="w-5 h-5 rounded accent-primary" />
              <span className="text-sm">Featured on home</span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-border">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
          <button onClick={onSave} disabled={saving || !value.title} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-5 py-2 text-sm font-semibold shadow-glow disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none"
      />
    </label>
  );
}

type Repo = { id: number; name: string; description: string | null; html_url: string; homepage: string | null; language: string | null; stargazers_count: number; topics?: string[]; fork: boolean; archived: boolean; updated_at: string };

function GithubImporter({ defaultUsername, existing, onClose, onImported }: { defaultUsername: string; existing: string[]; onClose: () => void; onImported: () => void }) {
  const [username, setUsername] = useState(defaultUsername);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  async function fetchRepos() {
    if (!username.trim()) return;
    setLoading(true);
    setRepos([]);
    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username.trim())}/repos?per_page=100&sort=updated`, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error(`GitHub: ${res.status}`);
      const data: Repo[] = await res.json();
      const filtered = data.filter((r) => !r.fork && !r.archived);
      setRepos(filtered);
      // preselect ones not already imported
      setSelected(new Set(filtered.filter((r) => !existing.includes(r.html_url)).slice(0, 6).map((r) => r.id)));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function importSelected() {
    setImporting(true);
    try {
      const chosen = repos.filter((r) => selected.has(r.id));
      const rows = chosen.map((r, i) => ({
        title: r.name,
        description: r.description ?? "",
        long_description: null,
        image_url: null,
        tech_stack: [r.language, ...(r.topics ?? [])].filter(Boolean) as string[],
        github_url: r.html_url,
        demo_url: r.homepage || null,
        featured: false,
        display_order: 100 + i,
        source: "github",
      }));
      const { error } = await supabase.from("projects").insert(rows);
      if (error) throw error;
      toast.success(`Imported ${rows.length} project${rows.length !== 1 ? "s" : ""}`);
      onImported();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-glow my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl">Import from GitHub</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRepos()}
              placeholder="github username"
              className="flex-1 rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={fetchRepos} disabled={loading || !username.trim()} className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
            </button>
          </div>

          {repos.length > 0 && (
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-border rounded-2xl border border-border">
              {repos.map((r) => {
                const already = existing.includes(r.html_url);
                const checked = selected.has(r.id);
                return (
                  <label key={r.id} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-secondary/50 ${already ? "opacity-50" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={already}
                      onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(r.id); else next.delete(r.id);
                        setSelected(next);
                      }}
                      className="mt-1 w-4 h-4 accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{r.name}</span>
                        {r.language && <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary">{r.language}</span>}
                        {already && <span className="text-xs text-muted-foreground">already imported</span>}
                      </div>
                      {r.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{r.description}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono shrink-0">★ {r.stargazers_count}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 p-5 border-t border-border">
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-full px-4 py-2 text-sm hover:bg-secondary">Cancel</button>
            <button onClick={importSelected} disabled={importing || selected.size === 0} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-5 py-2 text-sm font-semibold shadow-glow disabled:opacity-60">
              {importing && <Loader2 className="w-4 h-4 animate-spin" />} Import {selected.size}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
