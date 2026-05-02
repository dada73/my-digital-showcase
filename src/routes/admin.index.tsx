import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, FileText, FolderKanban, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [views7, viewsTotal, projects, posts, msgs, recentViews, recentMsgs] = await Promise.all([
        supabase.from("page_views").select("*", { count: "exact", head: true }).gte("viewed_at", new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from("page_views").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("read", false),
        supabase.from("page_views").select("path, viewed_at").order("viewed_at", { ascending: false }).limit(10),
        supabase.from("messages").select("id, name, email, subject, created_at, read").order("created_at", { ascending: false }).limit(5),
      ]);
      // top paths last 7d
      const { data: pathRows } = await supabase
        .from("page_views")
        .select("path")
        .gte("viewed_at", new Date(Date.now() - 7 * 86400000).toISOString())
        .limit(1000);
      const counts = new Map<string, number>();
      (pathRows ?? []).forEach((r) => counts.set(r.path, (counts.get(r.path) ?? 0) + 1));
      const topPaths = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

      return {
        views7: views7.count ?? 0,
        viewsTotal: viewsTotal.count ?? 0,
        projects: projects.count ?? 0,
        posts: posts.count ?? 0,
        unread: msgs.count ?? 0,
        recentViews: recentViews.data ?? [],
        recentMsgs: recentMsgs.data ?? [],
        topPaths,
      };
    },
  });

  const s = stats.data;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header>
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Overview</div>
        <h1 className="mt-2 text-4xl font-display font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Quick pulse of your portfolio.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Views (7d)" value={s?.views7 ?? 0} icon={<TrendingUp className="w-4 h-4" />} accent="from-electric to-primary" />
        <StatCard label="Total views" value={s?.viewsTotal ?? 0} icon={<Eye className="w-4 h-4" />} accent="from-primary to-magenta" />
        <StatCard label="Projects" value={s?.projects ?? 0} icon={<FolderKanban className="w-4 h-4" />} accent="from-magenta to-sunset" />
        <StatCard label="Unread msgs" value={s?.unread ?? 0} icon={<MessageSquare className="w-4 h-4" />} accent="from-sunset to-acid" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Top pages (7d)" cta={<Link to="/admin" className="text-xs text-muted-foreground">refresh</Link>}>
          {s && s.topPaths.length === 0 && <Empty>No traffic yet.</Empty>}
          <ul className="divide-y divide-border">
            {s?.topPaths.map(([path, count]) => (
              <li key={path} className="flex items-center justify-between py-3">
                <span className="font-mono text-sm truncate">{path}</span>
                <span className="text-sm font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent messages" cta={<Link to="/admin/messages" className="text-xs text-primary">View all →</Link>}>
          {s && s.recentMsgs.length === 0 && <Empty>No messages yet.</Empty>}
          <ul className="divide-y divide-border">
            {s?.recentMsgs.map((m) => (
              <li key={m.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{m.name} <span className="text-muted-foreground font-normal">· {m.email}</span></div>
                  <div className="text-xs text-muted-foreground truncate">{m.subject ?? "(no subject)"}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!m.read && <span className="w-2 h-2 rounded-full bg-magenta" />}
                  <span className="text-xs text-muted-foreground font-mono">{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Quick actions">
        <div className="grid sm:grid-cols-3 gap-3">
          <QuickLink to="/admin/projects" icon={<FolderKanban className="w-4 h-4" />} label="Manage projects" />
          <QuickLink to="/admin/blog" icon={<FileText className="w-4 h-4" />} label="Write a post" />
          <QuickLink to="/admin/profile" icon={<Eye className="w-4 h-4" />} label="Edit profile" />
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-border bg-card p-5">
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-secondary">{icon}</span>
      </div>
      <div className="relative mt-4 text-3xl font-display font-bold">{value.toLocaleString()}</div>
    </motion.div>
  );
}

function Card({ title, cta, children }: { title: string; cta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display font-semibold text-lg">{title}</h2>
        {cta}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{children}</div>;
}

function QuickLink({ to, icon, label }: { to: "/admin/projects" | "/admin/blog" | "/admin/profile"; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-2xl border border-border bg-background hover:border-primary hover:shadow-glow transition-all px-4 py-3 text-sm font-medium">
      <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-primary text-white">{icon}</span>
      {label}
    </Link>
  );
}
