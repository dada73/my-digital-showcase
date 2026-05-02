import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Post = { id: string; title: string; slug: string; excerpt: string; published: boolean; views: number; reading_minutes: number; published_at: string | null; created_at: string; updated_at: string };

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlog,
});

function AdminBlog() {
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,title,slug,excerpt,published,views,reading_minutes,published_at,created_at,updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (p: Post) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({ published: !p.published, published_at: !p.published ? new Date().toISOString() : p.published_at })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      toast.success("Post deleted");
    },
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Writing</div>
          <h1 className="mt-2 text-4xl font-display font-bold">Blog posts</h1>
          <p className="mt-2 text-muted-foreground">{posts.length} post{posts.length !== 1 && "s"}</p>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-4 py-2.5 text-sm font-semibold shadow-glow hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-4 h-4" /> New post
        </Link>
      </header>

      {isLoading ? (
        <div className="grid place-items-center h-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">No posts yet. Click "New post" to write your first one.</div>
      ) : (
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold truncate">{p.title || "(untitled)"}</span>
                    {p.published ? (
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-acid/20 text-foreground">Published</span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Draft</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{p.excerpt || "—"}</p>
                  <div className="text-xs font-mono text-muted-foreground mt-1">
                    /{p.slug} · {p.reading_minutes} min · {p.views} views · updated {new Date(p.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublish.mutate(p)}
                    title={p.published ? "Unpublish" : "Publish"}
                    className="p-2 rounded-lg hover:bg-secondary"
                  >
                    {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link to="/admin/blog/$id" params={{ id: p.id }} className="p-2 rounded-lg hover:bg-secondary"><Edit3 className="w-4 h-4" /></Link>
                  <button
                    onClick={() => confirm(`Delete "${p.title}"?`) && del.mutate(p.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
