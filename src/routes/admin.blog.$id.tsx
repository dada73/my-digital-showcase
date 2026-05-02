import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BlogEditor } from "@/components/blog-editor";

export const Route = createFileRoute("/admin/blog/$id")({
  component: BlogEditorRoute,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function BlogEditorRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [content, setContent] = useState<object | null>(null);
  const [contentText, setContentText] = useState("");
  const [published, setPublished] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-blog-post", id],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setCoverUrl(post.cover_url ?? "");
      setContent(post.content as object);
      setContentText(post.content_text);
      setPublished(post.published);
      setAutoSlug(false);
    }
  }, [post]);

  useEffect(() => {
    if (autoSlug) setSlug(slugify(title));
  }, [title, autoSlug]);

  const save = useMutation({
    mutationFn: async (publishNow?: boolean) => {
      const willPublish = publishNow ?? published;
      const payload = {
        title: title || "Untitled",
        slug: slug || slugify(title) || `post-${Date.now()}`,
        excerpt,
        cover_url: coverUrl || null,
        content: (content ?? {}) as never,
        content_text: contentText,
        published: willPublish,
        published_at: willPublish ? (post?.published_at ?? new Date().toISOString()) : null,
        reading_minutes: readingMinutes(contentText),
      };
      if (isNew) {
        const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
        if (error) throw error;
        return data.id as string;
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
        if (error) throw error;
        return id;
      }
    },
    onSuccess: (newId, publishNow) => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      qc.invalidateQueries({ queryKey: ["blog_posts"] });
      qc.invalidateQueries({ queryKey: ["admin-blog-post", id] });
      toast.success(publishNow === true ? "Published" : publishNow === false ? "Unpublished" : "Saved");
      if (publishNow !== undefined) setPublished(publishNow);
      if (isNew && newId) navigate({ to: "/admin/blog/$id", params: { id: newId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isNew && isLoading) {
    return <div className="grid place-items-center h-screen"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 md:top-0 z-30 flex items-center justify-between gap-3 px-6 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
        <Link to="/admin/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> All posts
        </Link>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-1 rounded-full ${published ? "bg-acid/20" : "bg-secondary text-muted-foreground"}`}>
            {published ? "Published" : "Draft"}
          </span>
          <button
            onClick={() => save.mutate(undefined)}
            disabled={save.isPending}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60"
          >
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>
          <button
            onClick={() => save.mutate(!published)}
            disabled={save.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-4 py-2 text-sm font-semibold shadow-glow disabled:opacity-60"
          >
            {published ? <><EyeOff className="w-4 h-4" /> Unpublish</> : <><Eye className="w-4 h-4" /> Publish</>}
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled story"
          className="w-full bg-transparent outline-none font-display font-bold text-4xl md:text-5xl placeholder:text-muted-foreground/50 mb-3"
        />
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A short summary that appears in lists and meta tags…"
          rows={2}
          className="w-full bg-transparent outline-none text-lg text-muted-foreground placeholder:text-muted-foreground/50 resize-none mb-6"
        />

        <div className="grid sm:grid-cols-[1fr_1fr] gap-3 mb-6">
          <label className="block">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Slug</div>
            <input
              value={slug}
              onChange={(e) => { setAutoSlug(false); setSlug(slugify(e.target.value)); }}
              className="w-full font-mono text-sm rounded-2xl border border-input bg-background/60 px-4 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Cover image URL (optional)</div>
            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://…"
              className="w-full text-sm rounded-2xl border border-input bg-background/60 px-4 py-2 outline-none focus:border-primary"
            />
          </label>
        </div>

        <BlogEditor
          content={content}
          onChange={(json, text) => {
            setContent(json);
            setContentText(text);
          }}
        />
      </div>
    </div>
  );
}
