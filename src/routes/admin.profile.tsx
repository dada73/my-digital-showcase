import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-portfolio-data";

type ProfileForm = {
  full_name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  avatar_url: string;
  resume_url: string;
  website_url: string;
  github_url: string;
  github_username: string;
  twitter_url: string;
  linkedin_url: string;
  instagram_url: string;
};

const empty: ProfileForm = {
  full_name: "", title: "", bio: "", email: "", location: "",
  avatar_url: "", resume_url: "", website_url: "",
  github_url: "", github_username: "", twitter_url: "", linkedin_url: "", instagram_url: "",
};

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfile,
});

function AdminProfile() {
  const qc = useQueryClient();
  const { data, isLoading } = useProfile();
  const [form, setForm] = useState<ProfileForm>(empty);

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.full_name ?? "",
        title: data.title ?? "",
        bio: data.bio ?? "",
        email: data.email ?? "",
        location: data.location ?? "",
        avatar_url: data.avatar_url ?? "",
        resume_url: data.resume_url ?? "",
        website_url: data.website_url ?? "",
        github_url: data.github_url ?? "",
        github_username: data.github_username ?? "",
        twitter_url: data.twitter_url ?? "",
        linkedin_url: data.linkedin_url ?? "",
        instagram_url: data.instagram_url ?? "",
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        full_name: form.full_name,
        title: form.title,
        bio: form.bio,
        email: form.email || null,
        location: form.location || null,
        avatar_url: form.avatar_url || null,
        resume_url: form.resume_url || null,
        website_url: form.website_url || null,
        github_url: form.github_url || null,
        github_username: form.github_username || null,
        twitter_url: form.twitter_url || null,
        linkedin_url: form.linkedin_url || null,
        instagram_url: form.instagram_url || null,
      };
      if (data?.id) {
        const { error } = await supabase.from("profile").update(payload).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profile").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function set<K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  if (isLoading) return <div className="grid place-items-center h-64"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-3xl">
      <header>
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Settings</div>
        <h1 className="mt-2 text-4xl font-display font-bold">Profile</h1>
      </header>

      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Identity</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name" value={form.full_name} onChange={(v) => set("full_name", v)} />
          <Field label="Title" value={form.title} onChange={(v) => set("title", v)} />
        </div>
        <Field label="Bio" textarea value={form.bio} onChange={(v) => set("bio", v)} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
          <Field label="Location" value={form.location} onChange={(v) => set("location", v)} />
        </div>
        <Field label="Avatar URL" value={form.avatar_url} onChange={(v) => set("avatar_url", v)} />
        <Field label="Resume URL" value={form.resume_url} onChange={(v) => set("resume_url", v)} />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Links & socials</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Website URL" value={form.website_url} onChange={(v) => set("website_url", v)} />
          <Field label="GitHub URL" value={form.github_url} onChange={(v) => set("github_url", v)} />
          <Field label="GitHub username (for import)" value={form.github_username} onChange={(v) => set("github_username", v)} />
          <Field label="Twitter URL" value={form.twitter_url} onChange={(v) => set("twitter_url", v)} />
          <Field label="LinkedIn URL" value={form.linkedin_url} onChange={(v) => set("linkedin_url", v)} />
          <Field label="Instagram URL" value={form.instagram_url} onChange={(v) => set("instagram_url", v)} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-6 py-3 text-sm font-semibold shadow-glow disabled:opacity-60"
        >
          {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save changes
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      {textarea ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none"
        />
      ) : (
        <input
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      )}
    </label>
  );
}
