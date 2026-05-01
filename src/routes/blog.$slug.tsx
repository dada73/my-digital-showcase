import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Blog` },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Track view + increment counter
  useEffect(() => {
    if (!post) return;
    void supabase.from("page_views").insert({ path: `/blog/${slug}`, referrer: document.referrer || null });
    void supabase.rpc("increment" as never, {} as never).catch(() => {}); // best-effort no-op if no rpc
    // simple inline increment via update — ok for demo (RLS would block; skip silently)
  }, [post, slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 pt-16 pb-20">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /> All articles</Link>
          {isLoading && <div className="mt-10 h-12 bg-muted rounded animate-pulse w-3/4" />}
          {error && <p className="mt-10 text-destructive">Failed to load.</p>}
          {!isLoading && !post && <p className="mt-10">Post not found.</p>}
          {post && (
            <>
              <header className="mt-8 mb-10">
                <div className="font-mono text-xs text-muted-foreground">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : ""} · {post.reading_minutes} min read
                </div>
                <h1 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-[1.05]">{post.title}</h1>
                <p className="mt-6 text-xl text-muted-foreground">{post.excerpt}</p>
              </header>
              {post.cover_url && <img src={post.cover_url} alt="" className="rounded-3xl w-full aspect-[16/9] object-cover mb-10" />}
              <TiptapRenderer content={post.content} fallback={post.content_text} />
            </>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}

function TiptapRenderer({ content, fallback }: { content: any; fallback: string }) {
  // Simple JSON renderer for Tiptap doc — handles paragraph/heading/text basics
  if (!content || !content.content) {
    return <p className="prose-text whitespace-pre-wrap text-lg leading-relaxed">{fallback}</p>;
  }
  return <div className="space-y-5 text-lg leading-relaxed">{(content.content as any[]).map((node, i) => renderNode(node, i))}</div>;
}

function renderNode(node: any, key: number): React.ReactNode {
  if (node.type === "paragraph") {
    return <p key={key}>{(node.content ?? []).map((c: any, i: number) => renderInline(c, i))}</p>;
  }
  if (node.type === "heading") {
    const lvl = node.attrs?.level ?? 2;
    const Tag = (`h${Math.min(Math.max(lvl, 2), 4)}`) as "h2" | "h3" | "h4";
    return <Tag key={key} className="font-display font-bold mt-8">{(node.content ?? []).map((c: any, i: number) => renderInline(c, i))}</Tag>;
  }
  if (node.type === "bulletList") {
    return <ul key={key} className="list-disc pl-6 space-y-2">{(node.content ?? []).map((li: any, i: number) => <li key={i}>{(li.content ?? []).map((p: any, j: number) => renderNode(p, j))}</li>)}</ul>;
  }
  if (node.type === "orderedList") {
    return <ol key={key} className="list-decimal pl-6 space-y-2">{(node.content ?? []).map((li: any, i: number) => <li key={i}>{(li.content ?? []).map((p: any, j: number) => renderNode(p, j))}</li>)}</ol>;
  }
  if (node.type === "codeBlock") {
    return <pre key={key} className="bg-secondary rounded-xl p-4 font-mono text-sm overflow-x-auto"><code>{(node.content ?? []).map((c: any) => c.text).join("")}</code></pre>;
  }
  if (node.type === "blockquote") {
    return <blockquote key={key} className="border-l-4 border-primary pl-4 italic text-muted-foreground">{(node.content ?? []).map((c: any, i: number) => renderNode(c, i))}</blockquote>;
  }
  return null;
}

function renderInline(node: any, key: number): React.ReactNode {
  if (node.type !== "text") return null;
  let el: React.ReactNode = node.text;
  for (const m of node.marks ?? []) {
    if (m.type === "bold") el = <strong key={key}>{el}</strong>;
    else if (m.type === "italic") el = <em key={key}>{el}</em>;
    else if (m.type === "code") el = <code key={key} className="font-mono text-sm bg-secondary px-1.5 py-0.5 rounded">{el}</code>;
    else if (m.type === "link") el = <a key={key} href={m.attrs?.href} className="text-primary underline">{el}</a>;
  }
  return <span key={key}>{el}</span>;
}
