import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Skill = { id: string; name: string; category: string; percentage: number; display_order: number };

export const Route = createFileRoute("/admin/skills")({
  component: AdminSkills,
});

function AdminSkills() {
  const qc = useQueryClient();
  const [newSkill, setNewSkill] = useState({ name: "", category: "Frontend", percentage: 80 });

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["admin-skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("display_order");
      if (error) throw error;
      return data as Skill[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("skills").insert({ ...newSkill, display_order: skills.length });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-skills"] });
      qc.invalidateQueries({ queryKey: ["skills"] });
      setNewSkill({ name: "", category: "Frontend", percentage: 80 });
      toast.success("Skill added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async (s: Skill) => {
      const { error } = await supabase.from("skills").update({
        name: s.name, category: s.category, percentage: s.percentage, display_order: s.display_order,
      }).eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-skills"] });
      qc.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-skills"] });
      qc.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header>
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Manage</div>
        <h1 className="mt-2 text-4xl font-display font-bold">Skills</h1>
      </header>

      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display font-semibold mb-3">Add a skill</h2>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_1fr_auto] gap-2">
          <input
            value={newSkill.name}
            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
            placeholder="Skill name (e.g. React)"
            className="rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <select
            value={newSkill.category}
            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            className="rounded-2xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            {["Frontend", "Backend", "Database", "DevOps", "Tools", "Design"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <input
              type="range" min={0} max={100}
              value={newSkill.percentage}
              onChange={(e) => setNewSkill({ ...newSkill, percentage: Number(e.target.value) })}
              className="flex-1 accent-primary"
            />
            <span className="font-mono text-sm w-10 text-right">{newSkill.percentage}%</span>
          </div>
          <button
            onClick={() => add.mutate()}
            disabled={!newSkill.name || add.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-white px-4 py-2.5 text-sm font-semibold shadow-glow disabled:opacity-60"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center h-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="rounded-3xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-secondary/50">
                <h3 className="font-display font-semibold">{cat}</h3>
              </div>
              <ul className="divide-y divide-border">
                {items.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <input
                      defaultValue={s.name}
                      onBlur={(e) => e.target.value !== s.name && update.mutate({ ...s, name: e.target.value })}
                      className="flex-1 bg-transparent outline-none text-sm font-medium focus:ring-2 focus:ring-primary/30 rounded px-2 py-1"
                    />
                    <div className="flex items-center gap-2 w-56">
                      <input
                        type="range" min={0} max={100} defaultValue={s.percentage}
                        onMouseUp={(e) => {
                          const v = Number((e.target as HTMLInputElement).value);
                          if (v !== s.percentage) update.mutate({ ...s, percentage: v });
                        }}
                        className="flex-1 accent-primary"
                      />
                      <span className="font-mono text-xs w-10 text-right">{s.percentage}%</span>
                    </div>
                    <button onClick={() => confirm(`Remove ${s.name}?`) && del.mutate(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">No skills yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
