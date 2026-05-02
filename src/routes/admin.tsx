import { createFileRoute, Link, Outlet, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, FolderKanban, Sparkles, FileText, MessageSquare, User as UserIcon, LogOut, Loader2, ExternalLink } from "lucide-react";
import { useAuth, signOut } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Portfolio" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", icon: Sparkles },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/profile", label: "Profile", icon: UserIcon },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!isAdmin) {
      // Authenticated but not admin
      toast.error("Your account does not have admin access.");
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-display font-bold">Access denied</h1>
          <p className="mt-3 text-muted-foreground">
            You're signed in as <span className="font-mono">{user.email}</span> but this account is not an admin.
            Ask the owner to grant the <code className="font-mono text-primary">admin</code> role for your user.
          </p>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-xl sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg px-6 h-16 border-b border-border">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-primary text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </span>
          <span>folio<span className="text-gradient-primary">.</span></span>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-pill"
                    className="absolute inset-0 rounded-xl bg-secondary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View site
          </a>
          <button
            onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
          <div className="px-3 pt-2 text-xs text-muted-foreground font-mono truncate">{user.email}</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
        <Link to="/admin" className="font-display font-bold">admin<span className="text-gradient-primary">.</span></Link>
        <button onClick={async () => { await signOut(); navigate({ to: "/login" }); }} className="text-sm text-muted-foreground">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <main className="flex-1 min-w-0 md:pt-0 pt-14">
        <div className="md:hidden flex overflow-x-auto gap-1 px-2 py-2 border-b border-border bg-background/60">
          {navItems.map((item) => {
            const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${active ? "bg-secondary text-foreground" : "text-muted-foreground"}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
