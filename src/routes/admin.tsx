import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Portfolio" }],
  }),
  component: AdminLanding,
});

function AdminLanding() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-display font-bold">Admin Panel</h1>
          <p className="mt-3 text-muted-foreground">
            The admin dashboard, login, and CRUD tools are coming in the next step. Tell me to continue and I'll build them.
          </p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            Back to home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
