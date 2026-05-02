import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MailOpen, Trash2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Message = { id: string; name: string; email: string; subject: string | null; message: string; read: boolean; created_at: string };

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<Message | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
  });

  const toggleRead = useMutation({
    mutationFn: async (m: Message) => {
      const { error } = await supabase.from("messages").update({ read: !m.read }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-messages"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Deleted");
      setOpen(null);
    },
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header>
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Inbox</div>
        <h1 className="mt-2 text-4xl font-display font-bold">Messages</h1>
        <p className="mt-2 text-muted-foreground">{messages.filter((m) => !m.read).length} unread · {messages.length} total</p>
      </header>

      {isLoading ? (
        <div className="grid place-items-center h-40"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : messages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">No messages yet.</div>
      ) : (
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {messages.map((m) => (
              <li
                key={m.id}
                onClick={() => {
                  setOpen(m);
                  if (!m.read) toggleRead.mutate(m);
                }}
                className={`flex items-start gap-4 p-5 cursor-pointer hover:bg-secondary/30 transition-colors ${!m.read ? "bg-secondary/20" : ""}`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${m.read ? "bg-transparent" : "bg-magenta"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!m.read ? "font-semibold" : "font-medium"} truncate`}>{m.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{m.email}</span>
                  </div>
                  <div className="text-sm mt-0.5 truncate">
                    <span className="font-medium">{m.subject ?? "(no subject)"}</span>
                    <span className="text-muted-foreground"> — {m.message}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-card border border-border rounded-3xl shadow-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-display font-bold text-xl truncate">{open.subject ?? "(no subject)"}</h2>
                <button onClick={() => setOpen(null)} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{open.name}</div>
                    <a href={`mailto:${open.email}`} className="text-sm text-primary hover:underline">{open.email}</a>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">{new Date(open.created_at).toLocaleString()}</div>
                </div>
                <div className="rounded-2xl bg-secondary/50 p-4 whitespace-pre-wrap text-sm leading-relaxed">{open.message}</div>
              </div>
              <div className="flex items-center justify-between gap-2 p-5 border-t border-border">
                <button
                  onClick={() => toggleRead.mutate(open)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
                >
                  {open.read ? <><Mail className="w-4 h-4" /> Mark unread</> : <><MailOpen className="w-4 h-4" /> Mark read</>}
                </button>
                <button
                  onClick={() => confirm("Delete this message?") && del.mutate(open.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-destructive/10 text-destructive px-4 py-2 text-sm hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
