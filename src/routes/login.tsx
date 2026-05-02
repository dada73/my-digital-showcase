import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock, Mail, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { adminBootstrapStatus, bootstrapFirstAdmin } from "@/server/admin-bootstrap.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: bootstrap } = useQuery({
    queryKey: ["admin-bootstrap-status"],
    queryFn: () => adminBootstrapStatus(),
  });
  const needsBootstrap = bootstrap?.needsBootstrap === true;

  useEffect(() => {
    if (!loading && user) navigate({ to: "/admin" });
  }, [user, loading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (needsBootstrap) {
        await bootstrapFirstAdmin({ data: { email, password } });
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Owner account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative grid place-items-center px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-60 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 font-display font-bold text-xl mb-8">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-primary text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </span>
          <span>folio<span className="text-gradient-primary">.</span></span>
        </Link>

        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-xl p-8 shadow-soft">
          <div className="mb-6">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Restricted</div>
            <h1 className="mt-2 text-3xl font-display font-bold">Admin sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Only the portfolio owner can access this area.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field icon={<Mail className="w-4 h-4" />} label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </Field>
            <Field icon={<Lock className="w-4 h-4" />} label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary text-white font-semibold py-3 shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Public sign-up is disabled. The owner account is provisioned manually.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      <div className="flex items-center gap-3 rounded-2xl border border-input bg-background/60 px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 transition">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}
